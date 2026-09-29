/* =====================================================================
   ESCENAS · Términos de movimiento (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (terminos-movimiento/escenas_cuerpo.js). Todo es función pura de t.
   Rosa = lo que se está explicando; el resto, blanco. «Mayor» con mayúscula,
   «menor» con minúscula; intervalos «3M», «3ªm», «5J», «4A», «5D».
   ===================================================================== */
(function () {
  'use strict';
  const N = window.NOTA, D = window.DIB, C = D.C;
  const { ramp, ease, eo, lerp, win, clamp, mezcla, texto, panel, chip, flecha, aspa, tick, pos, opa, color } = D;
  const SP = N.SP = 26;                    // tamaño único de toda la grafía (norma 7)
  const CX = 960;
  const S = window.SONIDOS || {};
  const ORO = C.rosa;

  let T = null;
  const esc = [];

  // ---------------------------------------------------------------- marcas de tiempo
  const F0 = id => T.frase[id] ? T.frase[id].t0 : (T.bloque[id] ? T.bloque[id].t0 : 0);
  const F1 = id => T.frase[id] ? T.frase[id].t1 : (T.bloque[id] ? T.bloque[id].t1 : 0);
  const limpia = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[¿?¡!.,;:…«»"()—–\-]/g, '');
  function Wd(id, pal, n) {
    const f = T.frase[id]; if (!f) { console.warn('frase no encontrada', id); return 0; }
    const p = limpia(pal); let k = 0;
    for (const [w, t] of f.palabras) if (limpia(w).startsWith(p)) { k++; if (k === (n || 1)) return t; }
    console.warn('palabra no encontrada', id, pal); return f.t0;
  }

  // ---------------------------------------------------------------- utilidades de escena
  function escena(nombre, a, b, build) {
    const g = N.group(document.getElementById('capaEscenas'), 'escena ' + nombre);
    const s = { nombre, a, b, g, tracks: [] };
    s.on = fn => s.tracks.push(fn);
    build(s, g);
    esc.push(s);
    return s;
  }
  function aparece(s, g, ta, tb, o) {
    o = o || {};
    const dy = o.dy != null ? o.dy : 14, fi = o.fi || .5, fo = o.fo || .5;
    const x0 = o.x || 0, y0 = o.y || 0, sc = o.s;
    s.on(t => {
      const v = win(t, ta, tb == null ? 1e9 : tb, fi, fo);
      opa(g, v);
      if (v > 0) pos(g, x0, y0 + (1 - eo(ramp(t, ta, ta + fi))) * dy, sc);
    });
  }
  function resalta(s, g, ta, tb, o) {
    o = o || {};
    const de = o.de || C.blanco, a = o.a || C.rosa, d = o.d || .35;
    s.on(t => {
      let k = ease(ramp(t, ta, ta + d));
      if (tb != null) k = Math.min(k, 1 - ease(ramp(t, tb, tb + d)));
      color(g, mezcla(de, a, k));
    });
  }
  function mostrarEn(s, g, ta, tb, fi, fo) { s.on(t => opa(g, win(t, ta, tb == null ? 1e9 : tb, fi || .35, fo || .35))); }
  /** «Pop»: aparece creciendo un poco desde su centro (cx, cy). */
  function pop(s, g, ta, tb, cx, cy, o) {
    o = o || {};
    const fi = o.fi || .35, fo = o.fo || .4, k0 = o.k0 != null ? o.k0 : .82;
    s.on(t => {
      const v = win(t, ta, tb == null ? 1e9 : tb, fi, fo); opa(g, v);
      if (v > 0) { const k = lerp(k0, 1, eo(ramp(t, ta, ta + fi))); g.setAttribute('transform', `translate(${cx},${cy}) scale(${k.toFixed(4)}) translate(${-cx},${-cy})`); }
    });
  }
  /** Trazo que se dibuja (pathLength = 1). Devuelve el path; progreso con trazoK(p, k). */
  function trazo(parent, d, o) {
    o = o || {};
    return N.el('path', { d, fill: o.fill || 'none', stroke: o.stroke || 'currentColor', 'stroke-width': o.w || 4,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 0 }, parent);
  }
  const trazoK = (p, k) => p.setAttribute('stroke-dashoffset', (1 - clamp(k)).toFixed(4));
  function dibuja(s, paths, t0, dur) { s.on(t => { const k = ramp(t, t0, t0 + dur); paths.forEach((p, i) => trazoK(p, clamp(k * paths.length - i))); }); }

  // ---------------------------------------------------------------- música: nombres y pentagramas
  const NOMBRE = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };
  /** Nombre de nota en español con su alteración en Bravura: 'F#' → «Fa♯». */
  function nombreNota(parent, nota, x, y, o) {
    o = o || {};
    const size = o.size || 30;
    const g = N.group(parent, 'nombre');
    if (o.fill && o.fill !== 'currentColor') color(g, o.fill);   // la alteración (♯/♭) del mismo color que el nombre
    const letra = nota[0], alt = nota[1] === '#' ? 'accidentalSharp' : (nota[1] === 'b' ? 'accidentalFlat' : null);
    const t = texto(g, o.mayus ? NOMBRE[letra].toUpperCase() : NOMBRE[letra], 0, 0, { size, peso: o.peso || 700, fill: o.fill || 'currentColor' });
    const wt = D.medir(t);
    const sa = size * 0.36;                            // sp de la alteración para que case con la letra
    const wa = alt ? (N.M[alt].adv * sa + size * 0.06) : 0;
    if (alt) N.glyph(g, alt, wt + size * 0.06, -size * 0.33, sa);
    const w = wt + wa;
    const ax = o.anchor === 'middle' ? x - w / 2 : (o.anchor === 'end' ? x - w : x);
    g.setAttribute('transform', `translate(${ax.toFixed(1)},${y})`);
    g._w = w; g._x = ax;
    return g;
  }
  /** Pentagrama con clave de sol. Devuelve {g, x0 (primera x libre tras la clave), yMid}. */
  function pentaClave(parent, x, yMid, ancho, sp) {
    sp = sp || SP;
    const g = N.group(parent, 'penta');
    N.pentagrama(g, x, yMid, ancho, sp);
    N.claveSol(g, x + 0.6 * sp, yMid, sp);
    return { g, x0: x + 3.9 * sp, yMid, x, ancho };
  }
  function barra(parent, x, yMid, sp) { return N.line(parent, x, yMid - 2 * (sp || SP), x, yMid + 2 * (sp || SP), N.E.thinBar * (sp || SP)); }

  // ---------------------------------------------------------------- iconos vectoriales (línea fina, estética del Diario)
  function icoCancion(g, cx, cy, r) {           // disco con nota y ondas
    const G = N.group(g, 'ico');
    N.el('circle', { cx, cy, r, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 }, G);
    N.el('circle', { cx, cy, r: r * 0.16, fill: 'currentColor' }, G);
    for (const k of [0.55, 0.78]) N.el('path', { d: `M${cx - r * k * 0.7},${cy - r * k * 0.7} A${r * k},${r * k} 0 0 1 ${cx + r * k * 0.7},${cy - r * k * 0.7}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 3, opacity: .55 }, G);
    return G;
  }
  function icoEdificio(g, cx, cy, s) {          // conservatorio: frontón y columnas
    const G = N.group(g, 'ico');
    const w = 150 * s, h = 110 * s;
    N.el('path', { d: `M${cx - w / 2 - 10 * s},${cy - h / 2} L${cx},${cy - h / 2 - 48 * s} L${cx + w / 2 + 10 * s},${cy - h / 2} Z`, fill: 'none', stroke: 'currentColor', 'stroke-width': 4, 'stroke-linejoin': 'round' }, G);
    for (let i = 0; i < 5; i++) { const x = cx - w / 2 + 8 * s + i * (w - 16 * s) / 4; N.line(G, x, cy - h / 2 + 12 * s, x, cy + h / 2 - 12 * s, 6 * s, { 'stroke-linecap': 'round' }); }
    N.line(G, cx - w / 2 - 14 * s, cy + h / 2, cx + w / 2 + 14 * s, cy + h / 2, 5, { 'stroke-linecap': 'round' });
    N.line(G, cx - w / 2 - 4 * s, cy - h / 2 + 4 * s, cx + w / 2 + 4 * s, cy - h / 2 + 4 * s, 4, { 'stroke-linecap': 'round' });
    return G;
  }
  function icoNotas(g, cx, cy, s) {             // dos corcheas unidas
    const G = N.group(g, 'ico');
    s = s || 1;
    N.el('ellipse', { cx: cx - 22 * s, cy: cy + 22 * s, rx: 13 * s, ry: 9.5 * s, transform: `rotate(-20 ${cx - 22 * s} ${cy + 22 * s})`, fill: 'currentColor' }, G);
    N.el('ellipse', { cx: cx + 26 * s, cy: cy + 14 * s, rx: 13 * s, ry: 9.5 * s, transform: `rotate(-20 ${cx + 26 * s} ${cy + 14 * s})`, fill: 'currentColor' }, G);
    N.line(G, cx - 10 * s, cy + 20 * s, cx - 10 * s, cy - 30 * s, 4 * s); N.line(G, cx + 38 * s, cy + 12 * s, cx + 38 * s, cy - 38 * s, 4 * s);
    N.el('polygon', { points: `${cx - 12 * s},${cy - 30 * s} ${cx + 40 * s},${cy - 38 * s} ${cx + 40 * s},${cy - 26 * s} ${cx - 12 * s},${cy - 18 * s}`, fill: 'currentColor' }, G);
    return G;
  }
  function icoLupa(g, cx, cy, s) {
    const G = N.group(g, 'ico'); s = s || 1;
    N.el('circle', { cx: cx - 10 * s, cy: cy - 10 * s, r: 30 * s, fill: 'none', stroke: 'currentColor', 'stroke-width': 6 * s }, G);
    N.line(G, cx + 12 * s, cy + 12 * s, cx + 40 * s, cy + 40 * s, 9 * s, { 'stroke-linecap': 'round' });
    return G;
  }
  function icoCantar(g, cx, cy) {               // cara de perfil cantando
    const G = N.group(g, 'ico');
    N.el('circle', { cx, cy, r: 44, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 }, G);
    N.el('ellipse', { cx: cx + 16, cy: cy + 14, rx: 9, ry: 12, fill: 'currentColor' }, G);
    N.el('circle', { cx: cx + 12, cy: cy - 12, r: 4.5, fill: 'currentColor' }, G);
    const n = N.group(G); icoNotas(n, cx + 86, cy - 20, 0.55);
    return G;
  }
  function icoLira(g, cx, cy) {                 // lira (tocar)
    const G = N.group(g, 'ico');
    N.el('path', { d: `M${cx - 40},${cy - 40} C${cx - 58},${cy + 10} ${cx - 30},${cy + 46} ${cx},${cy + 48} C${cx + 30},${cy + 46} ${cx + 58},${cy + 10} ${cx + 40},${cy - 40}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 5, 'stroke-linecap': 'round' }, G);
    N.line(G, cx - 46, cy - 36, cx + 46, cy - 36, 5, { 'stroke-linecap': 'round' });
    for (let i = -2; i <= 2; i++) N.line(G, cx + i * 11, cy - 36, cx + i * 7, cy + 40, 2.2);
    return G;
  }
  function icoPajaro(g, cx, cy) {               // imitar: pájaro con notas
    const G = N.group(g, 'ico');
    N.el('path', { d: `M${cx - 50},${cy + 6} C${cx - 20},${cy - 30} ${cx + 10},${cy - 26} ${cx + 30},${cy - 4} L${cx + 52},${cy - 10} L${cx + 34},${cy + 6} C${cx + 16},${cy + 32} ${cx - 24},${cy + 34} ${cx - 50},${cy + 6} Z`, fill: 'none', stroke: 'currentColor', 'stroke-width': 5, 'stroke-linejoin': 'round' }, G);
    N.el('path', { d: `M${cx - 12},${cy - 4} C${cx},${cy - 40} ${cx + 16},${cy - 50} ${cx + 22},${cy - 58}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 4, 'stroke-linecap': 'round' }, G);
    N.el('circle', { cx: cx + 22, cy: cy - 8, r: 3.5, fill: 'currentColor' }, G);
    return G;
  }
  function icoPersonas(g, cx, cy) {             // transmitir: dos personas y una nota que pasa
    const G = N.group(g, 'ico');
    for (const dx of [-46, 46]) {
      N.el('circle', { cx: cx + dx, cy: cy - 24, r: 15, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 }, G);
      N.el('path', { d: `M${cx + dx - 26},${cy + 34} C${cx + dx - 24},${cy + 2} ${cx + dx + 24},${cy + 2} ${cx + dx + 26},${cy + 34}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 5, 'stroke-linecap': 'round' }, G);
    }
    const f = flecha(G, cx - 18, cy - 24, cx + 18, cy - 24, { w: 3.5, cab: 10 });
    return G;
  }
  function icoCasa(g, cx, cy, s) {
    const G = N.group(g, 'ico'); s = s || 1;
    N.el('path', { d: `M${cx - 34 * s},${cy - 2 * s} L${cx},${cy - 34 * s} L${cx + 34 * s},${cy - 2 * s} M${cx - 24 * s},${cy - 10 * s} L${cx - 24 * s},${cy + 30 * s} L${cx + 24 * s},${cy + 30 * s} L${cx + 24 * s},${cy - 10 * s}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 * s, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, G);
    N.el('rect', { x: cx - 7 * s, y: cy + 8 * s, width: 14 * s, height: 22 * s, rx: 2 * s, fill: 'currentColor' }, G);
    return G;
  }
  function icoOido(g, cx, cy, s) {
    const G = N.group(g, 'ico'); s = s || 1;
    N.el('path', { d: `M${cx - 14 * s},${cy + 30 * s} C${cx - 4 * s},${cy + 44 * s} ${cx + 22 * s},${cy + 36 * s} ${cx + 22 * s},${cy + 14 * s} C${cx + 22 * s},${cy - 2 * s} ${cx + 34 * s},${cy - 8 * s} ${cx + 34 * s},${cy - 24 * s} C${cx + 34 * s},${cy - 50 * s} ${cx - 26 * s},${cy - 52 * s} ${cx - 26 * s},${cy - 20 * s}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 * s, 'stroke-linecap': 'round' }, G);
    N.el('path', { d: `M${cx - 8 * s},${cy - 18 * s} C${cx - 6 * s},${cy - 32 * s} ${cx + 18 * s},${cy - 32 * s} ${cx + 16 * s},${cy - 14 * s}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 4 * s, 'stroke-linecap': 'round' }, G);
    return G;
  }
  function icoLapiz(g, cx, cy, s) {
    const G = N.group(g, 'ico'); s = s || 1;
    N.el('path', { d: `M${cx - 30 * s},${cy + 30 * s} L${cx - 22 * s},${cy + 8 * s} L${cx + 20 * s},${cy - 34 * s} L${cx + 34 * s},${cy - 20 * s} L${cx - 8 * s},${cy + 22 * s} Z M${cx - 22 * s},${cy + 8 * s} L${cx - 8 * s},${cy + 22 * s}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 4.5 * s, 'stroke-linejoin': 'round' }, G);
    return G;
  }
  function icoOjo(g, cx, cy, s) {
    const G = N.group(g, 'ico'); s = s || 1;
    N.el('path', { d: `M${cx - 60 * s},${cy} C${cx - 30 * s},${cy - 40 * s} ${cx + 30 * s},${cy - 40 * s} ${cx + 60 * s},${cy} C${cx + 30 * s},${cy + 40 * s} ${cx - 30 * s},${cy + 40 * s} ${cx - 60 * s},${cy} Z`, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 * s, 'stroke-linejoin': 'round' }, G);
    N.el('circle', { cx, cy, r: 17 * s, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 * s }, G);
    N.el('circle', { cx, cy, r: 6 * s, fill: 'currentColor' }, G);
    return G;
  }
  function interrogacion(g, cx, cy, size, fill) { return texto(g, '?', cx, cy, { anchor: 'middle', size, peso: 800, fill: fill || C.rosa }); }

  function chipNota(parent, n, o) {
    o = o || {};
    const G = N.group(parent, 'chipNota');
    const w = o.w || 118, h = o.h || 64;
    const r = N.el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 16, fill: C.panel, stroke: C.borde, 'stroke-width': 2 }, G);
    const t = nombreNota(G, n, 0, 11, { size: o.size || 30, anchor: 'middle', fill: C.blanco });
    G._r = r; G._t = t;
    return G;
  }
  function patronPuntos(parent, offs, x, y, ancho, colorP) {
    const G = N.group(parent, 'patron');
    const st = ancho / 12;
    N.line(G, x, y, x + ancho, y, 2, { stroke: C.tenue });
    offs.forEach(o => N.el('circle', { cx: x + o * st, cy: y, r: 9, fill: colorP || 'currentColor' }, G));
    return G;
  }

  // ---------------------------------------------------------------- utilidades propias de este vídeo
  /** Pentagrama grande con clave y armadura (n alteraciones de tipo '#'/'b'); cada alteración animable. */
  function pentaArm(parent, x, yM, ancho, n, tipo, sp) {
    sp = sp || SP;
    const P = pentaClave(parent, x, yM, ancho, sp);
    const A = N.armaduraGen(parent, P.x0 + 4, yM, sp, n, tipo);
    return { P, A, xLibre: P.x0 + 4 + A.w + 1.2 * sp };
  }
  /** Chip de tonalidad: «La M», «Mi♭ M», «Fa♯ m» (nota con su alteración en Bravura + M/m). */
  function chipTon(parent, nota, modo, x, y, o) {
    o = o || {};
    const W = N.group(parent, 'chipTon');
    const size = o.size || 34;
    const tmp = N.group(W);
    const MM = modo === 'menor' ? 'm' : 'M';
    const nn = nombreNota(tmp, nota, 0, 0, { size, peso: 800, fill: '#fff' });
    const tm = texto(tmp, MM, 0, 0, { size, peso: 800, fill: '#fff' });
    const wN = nn._w, wM = D.medir(tm), gap = size * 0.28, pad = size * 0.62;
    const w = wN + gap + wM + 2 * pad, h = size * 1.75;
    tmp.remove();
    const x0 = o.anchor === 'start' ? x : x - w / 2;
    N.el('rect', { x: x0, y: y - h / 2, width: w, height: h, rx: 14, fill: o.fondo || C.rosa, stroke: o.borde || 'none', 'stroke-width': 3 }, W);
    nombreNota(W, nota, x0 + pad, y + size * 0.36, { size, peso: 800, fill: o.color || '#fff' });
    texto(W, MM, x0 + pad + wN + gap, y + size * 0.36, { size, peso: 800, fill: o.color || '#fff' });
    W._w = w; W._h = h; W._x = x0;
    return W;
  }
  /** Tarjeta con título y cuerpo, para las reglas. */
  function regla(parent, x, y, w, h, titulo, colT) {
    const G = N.group(parent, 'regla');
    panel(G, x, y, w, h, { rx: 20 });
    if (titulo) texto(G, titulo, x + 30, y + 46, { size: 24, peso: 800, ls: '0.18em', fill: colT || C.rosa });
    return G;
  }
  function marca(parent, ok, x, y, r) { const G = N.group(parent); (ok ? tick : aspa)(G, x, y, r || 16, 6); color(G, ok ? C.verde : C.rojo); return G; }
  /** Flecha curva entre dos puntos (arco). */
  function arco(parent, x1, y1, x2, y2, curv, o) {
    o = o || {};
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - (curv || 40);
    const G = N.group(parent, 'arco');
    N.el('path', { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, fill: 'none', stroke: 'currentColor', 'stroke-width': o.w || 4, 'stroke-linecap': 'round' }, G);
    const ang = Math.atan2(y2 - my, x2 - mx), cab = o.cab || 13;
    const p = a => `${(x2 - Math.cos(ang + a) * cab).toFixed(1)},${(y2 - Math.sin(ang + a) * cab).toFixed(1)}`;
    N.el('polygon', { points: `${x2},${y2} ${p(0.45)} ${p(-0.45)}`, fill: 'currentColor' }, G);
    return G;
  }


  // ================================================================ (28-sep) utilidades comunes de las intros GE (intervalos, compases…)
  /** Pentagrama con clave de Fa. Devuelve {g, x0, yMid, x, ancho, clave}. */
  function pentaFa(parent, x, yMid, ancho, sp) {
    sp = sp || SP;
    const g = N.group(parent, 'penta');
    N.pentagrama(g, x, yMid, ancho, sp);
    N.claveFa(g, x + 0.6 * sp, yMid, sp);
    return { g, x0: x + 3.9 * sp, yMid, x, ancho, clave: 'fa' };
  }
  /** Sistema de piano: clave de Sol arriba (yS) y de Fa abajo (yS + sep), con llave y barra inicial. */
  function sistema(parent, x, yS, ancho, o) {
    o = o || {};
    const sp = o.sp || SP, sep = o.sep || 10 * sp;
    const g = N.group(parent, 'sistema');
    const sol = pentaClave(g, x, yS, ancho, sp);
    const fa = pentaFa(g, x, yS + sep, ancho, sp);
    N.line(g, x, yS - 2 * sp, x, yS + sep + 2 * sp, N.E.thinBar * sp);
    N.llave(g, x - 0.3 * sp, yS - 2 * sp, yS + sep + 2 * sp, sp);
    return { g, x0: sol.x0, yS, yF: yS + sep, sol, fa };
  }
  /** Altura (y) de una nota en un pentagrama (clave 'sol' por defecto o 'fa'). */
  const yNota = (n, yMid, clave, sp) => yMid - (clave === 'fa' ? N.posFa(n) : N.posSol(n)) * (sp || SP);
  /** Redonda en clave de sol o de fa. Devuelve {g, x, y, pos, cab, alt, w, cx} (cx = centro de la cabeza). */
  function nota(parent, n, x, yMid, o) {
    o = o || {};
    const r = N.redonda(parent, n, x, yMid, o.sp || SP, { clave: o.clave, cabeza: o.cabeza, alteracion: o.alteracion });
    r.cx = x + r.w / 2;
    return r;
  }
  /** Intervalo armónico (dos redondas en la misma vertical; la segunda se aparta si es una 2ª). */
  function intervaloArm(parent, n1, n2, x, yMid, o) {
    o = o || {};
    const G = N.group(parent, 'intervalo');
    const p1 = o.clave === 'fa' ? N.posFa(n1) : N.posSol(n1), p2 = o.clave === 'fa' ? N.posFa(n2) : N.posSol(n2);
    const a = nota(G, n1, x, yMid, o);
    const dx = Math.abs(p2 - p1) === 0.5 ? a.w * 0.98 : 0;
    const b = nota(G, n2, x + dx, yMid, o);
    return { g: G, a, b, x, cx: x + a.w / 2 + dx / 2 };
  }
  /** Etiqueta de intervalo en texto: «3M», «3ªm», «5J», «4A», «5D», «10M»… (norma: ª solo en los menores). */
  function etiquetaInt(parent, txt, x, y, o) {
    o = o || {};
    return texto(parent, txt, x, y, { anchor: o.anchor || 'middle', size: o.size || 44, peso: 800, fill: o.fill || C.rosa });
  }
  /** Chip de intervalo (rosa lleno por defecto; relleno:false = contorno). */
  function chipInt(parent, txt, x, y, o) {
    o = o || {};
    return chip(parent, txt, x, y, Object.assign({ size: 30, anchor: 'middle', ls: '0.04em' }, o));
  }
  /** Corchete vertical entre dos alturas (abierto hacia la izquierda). */
  function corchete(parent, x, y1, y2, o) {
    o = o || {};
    const G = N.group(parent, 'corchete');
    const d = o.d || 14;
    N.el('path', { d: `M${x - d},${y1} H${x} V${y2} H${x - d}`, fill: 'none', stroke: 'currentColor', 'stroke-width': o.w || 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, G);
    return G;
  }
  /** «Do–Mi», «Fa♯–Re»… (nombres con alteración en Bravura). Devuelve el grupo con _w. */
  function parNotas(parent, n1, n2, x, y, o) {
    o = o || {};
    const size = o.size || 34, fill = o.fill || C.blanco, peso = o.peso || 700;
    const G = N.group(parent, 'par');
    const a = nombreNota(G, n1, 0, y, { size, fill, peso });
    const gT = texto(G, '–', 0, y, { size, peso: 600, fill });
    const wg = D.medir(gT);
    const b = nombreNota(G, n2, 0, y, { size, fill, peso });
    const gap = size * 0.1;
    const w = a._w + gap + wg + gap + b._w;
    const x0 = o.anchor === 'start' ? x : (o.anchor === 'end' ? x - w : x - w / 2);
    a.setAttribute('transform', `translate(${x0.toFixed(1)},${y})`);
    gT.setAttribute('x', (x0 + a._w + gap).toFixed(1));
    b.setAttribute('transform', `translate(${(x0 + a._w + gap + wg + gap).toFixed(1)},${y})`);
    G._w = w; G._x = x0;
    return G;
  }
  /** Mueve un grupo de (0,0) a (dx,dy) entre ta y tb, con un arco lateral (curva) opcional. */
  function desliza(s, g, ta, tb, dx, dy, o) {
    o = o || {};
    const curva = o.curva || 0, hasta = o.hasta;
    s.on(t => {
      let k = ease(ramp(t, ta, tb));
      if (hasta != null) k = Math.min(k, 1 - ease(ramp(t, hasta, hasta + (o.vuelta || 0.5))));
      const x = dx * k + curva * Math.sin(Math.PI * k), y = dy * k;
      g.setAttribute('transform', `translate(${x.toFixed(2)},${y.toFixed(2)})`);
    });
  }
  /** Brillo breve (en rosa) de un grupo en los instantes ts (p. ej., cuando suena). */
  function destella(s, g, ts, o) {
    o = o || {};
    const d = o.d || 0.9, de = o.de || C.blanco, a = o.a || C.rosa;
    s.on(t => {
      let k = 0;
      for (const t0 of [].concat(ts)) k = Math.max(k, win(t, t0 - 0.05, t0 + d, .08, .5));
      color(g, mezcla(de, a, k));
    });
  }
  /** Cuenta 1·2·3… (números pequeños) sobre posiciones [{x,y}] a partir de los instantes ts. */
  function cuenta(s, parent, pts, ts, tb, o) {
    o = o || {};
    const G = N.group(parent, 'cuenta');
    pts.forEach((p, i) => {
      const n = texto(G, String((o.desde || 1) + i), p.x, p.y, { anchor: 'middle', size: o.size || 28, peso: 800, fill: o.fill || C.rosa });
      mostrarEn(s, n, ts[i], tb, .2, .3);
    });
    return G;
  }
  /** Fila de texto con viñeta para chuletas (se enciende en rosa mientras se explica). */
  function filaChuleta(s, parent, txt, x, y, ta, tb, tFin, o) {
    o = o || {};
    const G = N.group(parent);
    texto(G, txt, x, y, { size: o.size || 34, peso: o.peso || 700, fill: 'currentColor' });
    color(G, C.blanco);
    aparece(s, G, ta, tFin, { dy: 8 });
    if (tb) resalta(s, G, ta, tb, { d: .25 });
    return G;
  }
  /** Flecha curva «de lado» entre dos alturas (x fijo), abombada hacia la izquierda (dx < 0) o la derecha. */
  function arcoLado(parent, x, y1, y2, dx, o) {
    o = o || {};
    const G = N.group(parent, 'arcoLado');
    N.el('path', { d: `M${x},${y1} C${x + dx},${y1} ${x + dx},${y2} ${x},${y2}`, fill: 'none', stroke: 'currentColor', 'stroke-width': o.w || 3.5, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash || null }, G);
    const cab = o.cab || 13, dir = dx < 0 ? 1 : -1;
    N.el('polygon', { points: `${x},${y2} ${x - dir * cab},${(y2 - cab * 0.45).toFixed(1)} ${x - dir * cab},${(y2 + cab * 0.45).toFixed(1)}`, fill: 'currentColor' }, G);
    return G;
  }

  // ================================================================ (28-sep, tarde) NORMAS DE IAGO · código estándar de todos los vídeos
  // TONO = arco redondo · SEMITONO = pico en V · SIEMPRE por DEBAJO de las notas (como en el Kit salvavidas).
  /** Punto de partida bajo la cabeza de una redonda creada con nota(): {x, y}. lado −1 = mitad izquierda, +1 = derecha. */
  function bajoCabeza(n, lado) {
    const w = n.w || 30;
    return { x: n.cx + (lado || 0) * w * 0.22, y: n.y + SP * 0.72 };
  }
  /** Tono entre dos puntos (bajo las cabezas): arco redondo por debajo. o.txt = rótulo bajo el arco («T», «1T»…). */
  function arcoTono(parent, x1, y1, x2, y2, o) {
    o = o || {};
    const G = N.group(parent, 'tono');
    const prof = o.prof || Math.min(44, Math.max(16, Math.abs(x2 - x1) * 0.26));
    const mx = (x1 + x2) / 2, yb = Math.max(y1, y2) + prof;
    // cuadrática cuyo punto más bajo queda en yb
    const cy = 2 * yb - (y1 + y2) / 2;
    N.el('path', { d: `M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`, fill: 'none', stroke: 'currentColor', 'stroke-width': o.w || 3.2, 'stroke-linecap': 'round' }, G);
    if (o.txt) texto(G, o.txt, mx, yb + (o.dyTxt || 30), { anchor: 'middle', size: o.size || 24, peso: 800, fill: 'currentColor' });
    G._yb = yb;
    return G;
  }
  /** Semitono entre dos puntos (bajo las cabezas): pico en V por debajo. */
  function picoSemitono(parent, x1, y1, x2, y2, o) {
    o = o || {};
    const G = N.group(parent, 'semitono');
    const prof = o.prof || Math.min(38, Math.max(14, Math.abs(x2 - x1) * 0.22));
    const mx = (x1 + x2) / 2, yb = Math.max(y1, y2) + prof;
    N.el('path', { d: `M${x1.toFixed(1)},${y1.toFixed(1)} L${mx.toFixed(1)},${yb.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}`, fill: 'none', stroke: 'currentColor', 'stroke-width': o.w || 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'miter' }, G);
    if (o.txt) texto(G, o.txt, mx, yb + (o.dyTxt || 28), { anchor: 'middle', size: o.size || 24, peso: 800, fill: 'currentColor' });
    G._yb = yb;
    return G;
  }
  /** Tono ('T') o semitono ('st') entre dos redondas de nota(): siempre por debajo. o.txt opcional. */
  function distancia(parent, n1, n2, tipo, o) {
    const a = bajoCabeza(n1, +1), b = bajoCabeza(n2, -1);
    return (tipo === 'st' ? picoSemitono : arcoTono)(parent, a.x, a.y, b.x, b.y, o);
  }
  /** Movimiento de una nota (p. ej., cambio de octava al invertir): arco discontinuo con punta, como en el Kit.
   *  curv > 0 abomba hacia ARRIBA (por defecto). o.dash, o.w, o.cab. */
  function arcoMovimiento(parent, x1, y1, x2, y2, o) {
    o = o || {};
    const G = N.group(parent, 'movimiento');
    const curv = o.curv != null ? o.curv : 70;
    const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - curv;
    N.el('path', { d: `M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`, fill: 'none', stroke: 'currentColor', 'stroke-width': o.w || 3, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash || '9 8' }, G);
    const ang = Math.atan2(y2 - my, x2 - mx), cab = o.cab || 14;
    const p = a => `${(x2 - Math.cos(ang + a) * cab).toFixed(1)},${(y2 - Math.sin(ang + a) * cab).toFixed(1)}`;
    N.el('polygon', { points: `${x2.toFixed(1)},${y2.toFixed(1)} ${p(0.42)} ${p(-0.42)}`, fill: 'currentColor' }, G);
    G._curva = t => {   // punto de la curva en t∈[0,1] (para mover una cabeza por el arco)
      const u = 1 - t;
      return { x: u * u * x1 + 2 * u * t * mx + t * t * x2, y: u * u * y1 + 2 * u * t * my + t * t * y2 };
    };
    return G;
  }
  /** Cabeza rosa que VIAJA por un arco de movimiento entre ta y tb (y se queda en el destino).
   *  Úsala con arcoMovimiento(...)._curva. dib(G) dibuja la cabeza centrada en (0,0). */
  function viaja(s, G, curva, ta, tb) {
    s.on(t => {
      const k = ease(ramp(t, ta, tb));
      const p = curva(k);
      G.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`);
    });
  }
  /** (28-sep, Iago) Los carteles que remiten a OTRO vídeo se pueden pulsar: abren ese vídeo en una pestaña nueva
   *  (y paran este). slug = carpeta del otro vídeo dentro de intros/ (p. ej. 'inversion-intervalos'). */
  function enlaceVideo(g, slug) {
    g.style.cursor = 'pointer';
    g.setAttribute('role', 'link'); g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', 'Abrir el vídeo en una pestaña nueva');
    const abre = ev => {
      ev.stopPropagation(); ev.preventDefault();
      const url = new URL('../' + slug + '/index.html', location.href).href;
      let w = null;
      try { w = window.open(url, '_blank'); } catch (e) { }
      if (w) { try { w.opener = null; } catch (e) { } }
      else { try { parent.postMessage({ intro: 'abrir', slug: slug, src: 'intros/' + slug + '/index.html' }, '*'); } catch (e) { } }
      try { if (document.body.classList.contains('sonando')) document.getElementById('botonPausa').click(); } catch (e) { }
    };
    g.addEventListener('click', abre);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') abre(e); });
    g.addEventListener('mouseenter', () => { g.style.filter = 'brightness(1.25)'; });
    g.addEventListener('mouseleave', () => { g.style.filter = ''; });
    return g;
  }
  /** Pequeño icono «abrir en pestaña nueva» (↗ en un cuadrado) para ponerlo en la esquina de esas tarjetas. */
  function icoAbrir(parent, x, y, sz) {
    sz = sz || 26;
    const G = N.group(parent, 'icoAbrir');
    N.el('rect', { x: x, y: y, width: sz, height: sz, rx: sz * 0.22, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.4 }, G);
    N.el('path', { d: `M${x + sz * 0.35},${y + sz * 0.65} L${x + sz * 0.72},${y + sz * 0.28} M${x + sz * 0.42},${y + sz * 0.28} H${x + sz * 0.72} V${y + sz * 0.58}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, G);
    return G;
  }
  /** (29-sep, Iago) Cuando el vídeo nombra los APUNTES, el cartel se puede pulsar y los abre (el apartado exacto).
   *  Dentro del portal (el vídeo va en un marco): se lo pide al portal con postMessage y el portal abre sus apuntes
   *  (los mismos de «VER APUNTES»). Suelto (pestaña propia): abre el portal de esta misma web con ?apuntes=…
   *  temas = ids de los apuntes (p. ej. ['armadura']); nombre = título de la ventana de apuntes. */
  function enlaceApuntes(g, temas, nombre) {
    g.style.cursor = 'pointer';
    g.setAttribute('role', 'link'); g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', 'Abrir los apuntes: ' + (nombre || temas.join(', ')));
    const abre = ev => {
      ev.stopPropagation(); ev.preventDefault();
      try { if (document.body.classList.contains('sonando')) document.getElementById('botonPausa').click(); } catch (e) { }
      let dentro = false;
      try { dentro = window.parent && window.parent !== window; } catch (e) { dentro = true; }
      if (dentro) { try { parent.postMessage({ intro: 'apuntes', temas: temas, nombre: nombre || '' }, '*'); return; } catch (e) { } }
      const url = new URL('../../?apuntes=' + encodeURIComponent(temas.join(',')) + (nombre ? '&nombre=' + encodeURIComponent(nombre) : ''), location.href).href;
      let w = null;
      try { w = window.open(url, '_blank'); } catch (e) { }
      if (w) { try { w.opener = null; } catch (e) { } }
    };
    g.addEventListener('click', abre);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') abre(e); });
    g.addEventListener('mouseenter', () => { g.style.filter = 'brightness(1.25)'; });
    g.addEventListener('mouseleave', () => { g.style.filter = ''; });
    return g;
  }
  /** (29-sep, Iago) TARJETA DE ENLACE: la misma en todos los vídeos (la de «Inversión de intervalos» en «Intervalos»).
   *  Panel oscuro con contorno rosa · cuadrado rosa con su icono (▶ = vídeo; hoja = apuntes) · rótulo pequeño en rosa
   *  («VÍDEO» / «APUNTES») · título en blanco · ↗ en la esquina. Se pulsa entera.
   *  o = { tipo: 'video'|'apuntes', titulo, slug (vídeo) | temas + nombre (apuntes), rotulo?, centro?: true, w?, enlace?: false }
   *  (x, y) = esquina superior izquierda, o el centro si o.centro. Devuelve el grupo (con _w, _h, _cx, _cy). */
  function tarjetaEnlace(parent, x, y, o) {
    o = o || {};
    const V = N.group(parent, 'tarjetaEnlace');
    const h = 96, esApu = o.tipo === 'apuntes';
    const P = panel(V, 0, 0, 460, h, { rx: 18, stroke: C.rosa, sw: 2 });
    N.el('rect', { x: 22, y: 22, width: 52, height: 52, rx: 12, fill: C.rosa }, V);
    if (esApu) {
      N.el('path', { d: 'M37,33 h15 l9,9 v21 h-24 z M52,33 v9 h9', fill: 'none', stroke: '#fff', 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, V);
      for (let i = 0; i < 3; i++) N.line(V, 42, 48 + i * 5, 56, 48 + i * 5, 2, { stroke: '#fff', 'stroke-linecap': 'round' });
    } else {
      N.el('path', { d: 'M40,36 v24 l20,-12 z', fill: '#fff' }, V);
    }
    const r = texto(V, o.rotulo || (esApu ? 'APUNTES' : 'VÍDEO'), 94, 40, { size: 18, peso: 800, ls: '0.18em', fill: C.rosa });
    const tt = texto(V, o.titulo || '', 94, 72, { size: 28, peso: 800, fill: C.blanco });
    const w = Math.max(o.w || 0, 94 + Math.max(D.medir(r) + 50, D.medir(tt)) + 64);
    P.setAttribute('width', w.toFixed(0));
    if (o.enlace !== false) { const ia = icoAbrir(V, w - 40, 14, 26); color(ia, C.rosa); }   // enlace:false → misma tarjeta, sin ↗ ni clic
    const x0 = o.centro ? x - w / 2 : x, y0 = o.centro ? y - h / 2 : y;
    V.setAttribute('transform', `translate(${x0.toFixed(1)},${y0.toFixed(1)})`);
    if (o.enlace !== false) { if (esApu) enlaceApuntes(V, o.temas || [], o.nombre || o.titulo); else if (o.slug) enlaceVideo(V, o.slug); }
    V._w = w; V._h = h; V._cx = x0 + w / 2; V._cy = y0 + h / 2;
    const E = N.group(parent, 'tarjetaEnlaceCaja'); E.appendChild(V);    // envoltorio: para pop/aparece sin pisar el translate
    E._w = w; E._h = h; E._cx = V._cx; E._cy = V._cy;
    return E;
  }

  // ================================================================ (29-sep) ACORDES: redondas apiladas, etiquetas con línea guía y ejemplo sonoro
  /** Acorde de redondas apiladas (clave de sol), de abajo arriba: ['C4','Eb4','Gb4']. Las alteraciones se escalonan
   *  (columna nueva si la de encima está a menos de una sexta). Devuelve {g, x, notas:[{n, y, cx, w, g, alt}]}. */
  function acorde(parent, notas, x, yM) {
    const G = N.group(parent, 'acorde'), out = [];
    for (const n of notas) {
      const W = N.group(G, 'nota');
      const r = N.redonda(W, n, x, yM, SP, { alteracion: false });
      out.push({ n, y: r.y, pos: r.pos, cx: x + r.w / 2, w: r.w, g: W, alt: null });
    }
    const cols = [];
    for (let i = out.length - 1; i >= 0; i--) {
      const m = /^([A-G])([#bnxd]?)(\d)$/.exec(out[i].n); if (!m[2]) continue;
      const gl = { '#': 'accidentalSharp', b: 'accidentalFlat', n: 'accidentalNatural', x: 'accidentalDoubleSharp', d: 'accidentalDoubleFlat' }[m[2]];
      let c = 0; while (c < cols.length && cols[c] - out[i].pos < 3) c++;
      cols[c] = out[i].pos;
      const A = N.group(out[i].g, 'alteracion');
      N.glyph(A, gl, x - (N.M[gl].adv + 0.22) * SP - c * 1.2 * SP, out[i].y, SP);
      out[i].alt = A;
    }
    return { g: G, x, notas: out };
  }
  /** Etiqueta a la derecha del acorde, con una línea fina hasta su nota (para que no se pisen: cada una a su altura).
   *  Devuelve el grupo (texto + línea) en currentColor. */
  function etiquetaNota(parent, n, txt, xL, yL, o) {
    o = o || {};
    const G = N.group(parent, 'etiqueta');
    const x0 = n.cx + n.w / 2 + 8;
    N.el('path', { d: `M${x0},${n.y} L${xL - 44},${n.y} L${xL - 14},${yL - 13}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.8 }, G);
    if (typeof frase === 'function') frase(G, txt, xL, yL, { size: o.size || 42, peso: 800 }); else texto(G, txt, xL, yL, { size: o.size || 42, peso: 800, fill: 'currentColor' });
    return G;
  }
  /** Mientras suena un bloque (S[blq] = [nota1, nota2, …, plaqué]), cada nota se enciende en rosa con su ataque. */
  function suenaAcorde(s, ac, blq) {
    const ts = S[blq] || []; if (!ts.length) return;
    const tp = ts[ts.length - 1];
    ac.notas.forEach((n, i) => s.on(t => {
      const k = Math.max(win(t, (ts[i] || tp) - 0.03, (ts[i] || tp) + 0.35, .05, .25), win(t, tp - 0.03, tp + 1.1, .05, .4));
      color(n.g, mezcla(C.blanco, C.rosa, k));
    }));
  }
  /** Oído pequeño que late mientras suena el ejemplo. */
  function oido(s, g, x, y, blqs) {
    const O = N.group(g), Oi = N.group(O); icoOido(Oi, 0, 0, 0.9); color(Oi, C.rosa);
    O.setAttribute('transform', `translate(${x},${y})`);
    s.on(t => {
      let k = 0;
      for (const b of blqs) if (T.bloque[b]) k = Math.max(k, win(t, T.bloque[b].t0 - 0.1, T.bloque[b].t1, .2, .3));
      opa(O, k); Oi.setAttribute('transform', `scale(${(1 + 0.06 * Math.sin(t * 9) * k).toFixed(3)})`);
    });
  }

  // ================================================================ E19 · TÉRMINOS DE MOVIMIENTO (el tempo, sus cambios y los modificadores)
  const TITULO = { kicker: 'TEORÍA  ·  TÉRMINOS', lineas: ['TÉRMINOS', 'DE MOVIMIENTO'], sub: 'El tempo · Cambios · Modificadores' };

  // ---------------------------------------------------------------- utilidades de este vídeo
  function frase(parent, segs, x, y, o) {
    o = o || {};
    const size = o.size || 36, peso = o.peso || 700, esp = size * 0.28;
    const G = N.group(parent, 'frase');
    if (typeof segs === 'string') segs = [[segs, o.fill || 'currentColor']];
    let cx = 0;
    for (const [str, col] of segs) {
      if (/^\s/.test(str)) cx += esp;
      const core = str.trim();
      if (core) { const t = texto(G, core, cx, 0, { size, peso, fill: col || 'currentColor', italic: o.italic, ls: o.ls }); cx += D.medir(t); }
      if (core && /\s$/.test(str)) cx += esp;
    }
    const ax = o.anchor === 'middle' ? x - cx / 2 : (o.anchor === 'end' ? x - cx : x);
    G.setAttribute('transform', `translate(${ax.toFixed(1)},${y})`);
    G._w = cx; G._x = ax;
    return G;
  }
  function fraseG(parent, segs, x, y, o) { const w = N.group(parent); w._f = frase(w, segs, x, y, o); return w; }
  function icoAncla(g, cx, cy, s) {
    const G = N.group(g, 'ico'); s = s || 1;
    N.el('circle', { cx, cy: cy - 40 * s, r: 9 * s, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 * s }, G);
    N.line(G, cx, cy - 31 * s, cx, cy + 34 * s, 6 * s, { 'stroke-linecap': 'round' });
    N.line(G, cx - 20 * s, cy - 16 * s, cx + 20 * s, cy - 16 * s, 5 * s, { 'stroke-linecap': 'round' });
    N.el('path', { d: `M${cx - 34 * s},${cy + 6 * s} Q${cx - 30 * s},${cy + 36 * s} ${cx},${cy + 38 * s} Q${cx + 30 * s},${cy + 36 * s} ${cx + 34 * s},${cy + 6 * s}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 * s, 'stroke-linecap': 'round' }, G);
    N.el('path', { d: `M${cx - 42 * s},${cy + 12 * s} L${cx - 34 * s},${cy + 2 * s} L${cx - 26 * s},${cy + 12 * s} M${cx + 26 * s},${cy + 12 * s} L${cx + 34 * s},${cy + 2 * s} L${cx + 42 * s},${cy + 12 * s}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 * s, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, G);
    return G;
  }
  function icoMundo(g, cx, cy, r) {
    const G = N.group(g, 'ico');
    N.el('circle', { cx, cy, r, fill: 'none', stroke: 'currentColor', 'stroke-width': 4.5 }, G);
    N.el('ellipse', { cx, cy, rx: r * 0.45, ry: r, fill: 'none', stroke: 'currentColor', 'stroke-width': 3 }, G);
    N.line(G, cx - r, cy, cx + r, cy, 3); N.line(G, cx - r * 0.86, cy - r * 0.5, cx + r * 0.86, cy - r * 0.5, 2.5); N.line(G, cx - r * 0.86, cy + r * 0.5, cx + r * 0.86, cy + r * 0.5, 2.5);
    return G;
  }
  /** Metrónomo: cuerpo trapecial y péndulo (devuelve el grupo del péndulo para girarlo). */
  function metronomo(g, cx, yBase, h) {
    const G = N.group(g, 'metronomo'), w = h * 0.62;
    N.el('path', { d: `M${cx - w / 2},${yBase} L${cx - w * 0.22},${yBase - h} L${cx + w * 0.22},${yBase - h} L${cx + w / 2},${yBase} Z`, fill: C.panel, stroke: 'currentColor', 'stroke-width': 5, 'stroke-linejoin': 'round' }, G);
    N.line(G, cx - w * 0.36, yBase - h * 0.2, cx + w * 0.36, yBase - h * 0.2, 4);
    const P = N.group(G);
    N.line(P, cx, yBase - h * 0.2, cx, yBase - h * 1.02, 5, { 'stroke-linecap': 'round' });
    N.el('rect', { x: cx - 14, y: yBase - h * 0.78, width: 28, height: 22, rx: 4, fill: C.rosa }, P);
    G._pend = P; G._pivot = [cx, yBase - h * 0.2];
    return G;
  }

  // ================================================================ I · dos tipos: los del principio (como la armadura) y los del camino (como las accidentales)
  function escenaDosTipos() {
    const a = F0('I1') - 0.1, b = F0('L1') - 0.2;
    escena('dostipos', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'TÉRMINOS DE MOVIMIENTO', CX, 150, { size: 34, anchor: 'middle' });
      pop(s, k, F0('I1') + 0.2, fin, CX, 150);
      const ve = fraseG(g, [['la velocidad', C.blanco], [' = ', C.suave], ['el tempo', C.rosa]], CX, 245, { size: 44, peso: 800, anchor: 'middle' });
      aparece(s, ve, Wd('I1', 'velocidad') - 0.3, fin, { dy: 8 });
      const wP = 800, gP = 40, xP = CX - wP - gP / 2, yP = 320, hP = 520;
      const tA = Wd('I3', 'principio') - 0.3, tB = Wd('I3', 'camino') - 0.3, tAr = Wd('I3', 'armadura') - 0.3, tAc = Wd('I3', 'accidentales') - 0.4;
      // AL PRINCIPIO: el término arriba, al empezar… como la armadura
      const L = N.group(g); panel(L, xP, yP, wP, hP, { rx: 24 });
      texto(L, 'AL PRINCIPIO', xP + wP / 2, yP + 58, { anchor: 'middle', size: 28, peso: 800, ls: '0.14em', fill: C.rosa });
      const yM1 = yP + 250;
      const P1 = pentaClave(L, xP + 60, yM1, wP - 120);
      const AR = N.group(L); const arm = N.armaduraGen(AR, P1.x0 + 4, yM1, SP, 2, '#');
      N.melodia(L, [{ p: 'D5', n: 'q' }, { p: 'A4', n: 'q' }, { p: 'F#4', n: 'q' }, { p: 'D4', n: 'q' }].map(x => ({ p: x.p.replace('#', ''), n: x.n })), P1.x0 + 4 + arm.w + 50, yM1, { espacio: { q: 4.4 } });
      const TA = N.group(L); color(TA, C.rosa); frase(TA, [['Allegro', 'currentColor']], xP + 70, yM1 - 2 * SP - 44, { size: 40, peso: 800 });
      aparece(s, L, tA, fin, { dy: 12 });
      s.on(t => color(AR, mezcla(C.blanco, C.rosa, win(t, tAr, 1e9, .3, .1))));
      const la = fraseG(g, [['≈ como la ', C.suave], ['armadura', C.rosa]], xP + wP / 2, yP + hP - 60, { size: 34, peso: 800, anchor: 'middle' });
      aparece(s, la, tAr, fin, { dy: 6 });
      // POR EL CAMINO: aparece en medio… como una alteración accidental
      const xR = xP + wP + gP;
      const R = N.group(g); panel(R, xR, yP, wP, hP, { rx: 24 });
      texto(R, 'POR EL CAMINO', xR + wP / 2, yP + 58, { anchor: 'middle', size: 28, peso: 800, ls: '0.14em', fill: C.rosa });
      const P2 = pentaClave(R, xR + 60, yM1, wP - 120);
      const m2 = N.melodia(R, ['E5', 'D5', 'C5', 'B4', 'A4', 'G4'].map(p => ({ p, n: 'q' })), P2.x0 + 30, yM1, { espacio: { q: 3.9 } });
      barra(R, m2.notas[3].x - 30, yM1);
      const AC = N.group(R); N.glyph(AC, 'accidentalSharp', m2.notas[4].x - (N.M.accidentalSharp.adv + 0.22) * SP, m2.notas[4].y, SP);
      const TR = N.group(R); color(TR, C.rosa); frase(TR, [['rit.', 'currentColor']], m2.notas[3].x - 10, yM1 - 2 * SP - 44, { size: 40, peso: 800, italic: true });
      aparece(s, R, tB, fin, { dy: 12 });
      s.on(t => color(AC, mezcla(C.blanco, C.rosa, win(t, tAc, 1e9, .3, .1))));
      const lr = fraseG(g, [['≈ como las ', C.suave], ['alteraciones accidentales', C.rosa]], xR + wP / 2, yP + hP - 60, { size: 34, peso: 800, anchor: 'middle' });
      aparece(s, lr, tAc, fin, { dy: 6 });
    });
  }

  // ================================================================ L · los del principio, del más lento al más rápido (Moderato, el ancla)
  const LENTOS = ['Grave', 'Larghissimo', 'Largo', 'Larghetto', 'Lento', 'Adagio', 'Adagietto', 'Andante', 'Andantino'];
  const RAPIDOS = ['Allegretto', 'Allegro', 'Vivace', 'Vivacissimo', 'Presto', 'Prestissimo'];
  function escenaEscalera() {
    const a = F0('L1') - 0.2, b = F0('N1') - 0.2;
    escena('escalera', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'LOS DEL PRINCIPIO', CX, 150, { size: 34, anchor: 'middle' });
      pop(s, k, F0('L1') + 0.1, fin, CX, 150);
      const yE = 600;
      const tEj = Wd('L1', 'rapido') - 0.3;
      const EJ = N.group(g); color(EJ, C.blanco);
      N.line(EJ, 110, yE, 1790, yE, 4, { 'stroke-linecap': 'round' });
      N.el('polygon', { points: `1810,${yE} 1788,${yE - 11} 1788,${yE + 11}`, fill: 'currentColor' }, EJ);
      aparece(s, EJ, tEj, fin, { dy: 0 });
      const le = fraseG(g, [['más lento', C.suave]], 110, yE + 170, { size: 32, peso: 700, italic: true });
      const ra = fraseG(g, [['más rápido', C.suave]], 1810, yE + 170, { size: 32, peso: 700, italic: true, anchor: 'end' });
      aparece(s, le, Wd('L1', 'lento') - 0.3, fin, { dy: 6 }); aparece(s, ra, tEj, fin, { dy: 6 });
      // Moderato: en medio, el ancla
      const tMo = Wd('L1', 'moderato') - 0.3;
      const MO = N.group(g); color(MO, C.rosa);
      N.line(MO, CX, yE - 92, CX, yE + 26, 5);
      texto(MO, 'Moderato', CX, yE - 112, { anchor: 'middle', size: 54, peso: 800, italic: true, fill: 'currentColor' });
      pop(s, MO, tMo, fin, CX, yE - 120, { k0: .7 });
      const AN = N.group(g); color(AN, C.rosa); icoAncla(AN, CX, yE - 250, 1.1);
      pop(s, AN, Wd('L1', 'brujula') - 0.3, fin, CX, yE - 250, { k0: .5 });
      const ce = fraseG(g, [['el centro', C.rosa]], CX, yE + 112, { size: 32, peso: 800, anchor: 'middle' });
      aparece(s, ce, Wd('L1', 'medio') - 0.3, fin, { dy: 4 });
      s.on(t => { const kk = win(t, F0('L4') - 0.15, F0('L4') + 1.0, .1, .4); MO.setAttribute('transform', `translate(${CX},${yE - 120}) scale(${(1 + 0.12 * kk).toFixed(3)}) translate(${-CX},${-(yE - 120)})`); });
      // los términos, cada uno cuando lo nombra (alternando arriba y abajo del eje)
      const TER = [];
      LENTOS.forEach((nm, i) => TER.push({ nm, x: 150 + i * 86, t: Wd(i < 2 ? 'L2' : 'L3', nm) }));
      RAPIDOS.forEach((nm, j) => TER.push({ nm, x: 1080 + j * 136, t: Wd('L5', nm) }));
      TER.forEach((te, i) => {
        const arriba = i % 2 === 0;
        const G = N.group(g);
        N.line(G, te.x, yE - 12, te.x, yE + 12, 3);
        texto(G, te.nm, te.x, arriba ? yE - 30 : yE + 54, { anchor: 'middle', size: 29, peso: 700, italic: true, fill: 'currentColor' });
        pop(s, G, te.t - 0.25, fin, te.x, yE, { k0: .6 });
        s.on(t => color(G, mezcla(C.blanco, C.rosa, win(t, te.t - 0.25, te.t + 0.9, .1, .4))));
      });
      // el punto que recorre la escalera
      const PT = N.group(g); N.el('circle', { cx: 0, cy: 0, r: 11, fill: C.rosa }, PT);
      const ORD = TER.slice(0, 9).concat([{ x: CX, t: F0('L4') }]).concat(TER.slice(9));
      s.on(t => {
        let x = ORD[0].x;
        for (let i = 0; i < ORD.length; i++) { if (t >= ORD[i].t - 0.3) { const x0 = i ? ORD[i - 1].x : ORD[0].x; x = x0 + (ORD[i].x - x0) * ease(ramp(t, ORD[i].t - 0.3, ORD[i].t)); } }
        opa(PT, win(t, ORD[0].t - 0.3, fin, .2, .4));
        PT.setAttribute('transform', `translate(${x.toFixed(1)},${yE})`);
      });
    });
  }

  // ================================================================ N · hoy: la figura = número del metrónomo (igual aquí que en la China)
  function escenaMetronomo() {
    const a = F0('N1') - 0.2, b = F0('E1') - 0.2;
    escena('metronomo', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'HOY: UNA FORMA OBJETIVA', CX, 150, { size: 34, anchor: 'middle' });
      pop(s, k, Wd('N1', 'objetiva') - 0.3, fin, CX, 150);
      // ♩ = 120
      const tFi = Wd('N1', 'figura') - 0.3, tNu = Wd('N1', 'numero') - 0.3, tMe = Wd('N1', 'metronomo') - 0.3;
      const FG = N.group(g); color(FG, C.blanco);
      N.figura(FG, 'q', 470, 520, SP * 2.4);
      texto(FG, '=', 610, 505, { size: 110, peso: 700, fill: 'currentColor' });
      pop(s, FG, tFi, fin, 560, 460, { k0: .7 });
      const NU = N.group(g); color(NU, C.rosa); texto(NU, '120', 700, 520, { size: 130, peso: 800, fill: 'currentColor' });
      pop(s, NU, tNu, fin, 800, 470, { k0: .6 });
      const MT = N.group(g); color(MT, C.blanco);
      const mt = metronomo(MT, 1360, 640, 360);
      aparece(s, MT, tMe - 0.1, fin, { dy: 10 });
      s.on(t => { const ang = t < tMe ? 0 : 24 * Math.sin((t - tMe) * Math.PI * 2 / 1.0); mt._pend.setAttribute('transform', `rotate(${ang.toFixed(2)} ${mt._pivot[0]} ${mt._pivot[1]})`); });
      const tx = fraseG(g, [['el número del ', C.suave], ['metrónomo', C.blanco]], 800, 620, { size: 34, peso: 800, anchor: 'middle' });
      aparece(s, tx, tMe, F0('N2') - 0.1, { dy: 6 });
      const CH = N.group(g); color(CH, C.suave); icoMundo(CH, 470, 760, 40);
      frase(CH, [['igual aquí… ', C.blanco], ['que en la China', C.rosa]], 540, 772, { size: 38, peso: 800 });
      aparece(s, CH, Wd('N1', 'china') - 0.5, F0('N2') - 0.1, { dy: 8 });
      // …pero mucha música está escrita con términos: hay que saberlos
      const tSa = Wd('N2', 'saberlos') - 0.3;
      const SA = fraseG(g, [['mucha música está escrita así: ', C.blanco], ['hay que saberlos', C.rosa]], 800, 620, { size: 34, peso: 800, anchor: 'middle' });
      aparece(s, SA, tSa, fin, { dy: 6 });
      const CE = fraseG(g, [['Moderato', C.rosa], [' = el centro', C.blanco]], 800, 780, { size: 40, peso: 800, italic: true, anchor: 'middle' });
      aparece(s, CE, Wd('N2', 'moderato') - 0.3, fin, { dy: 8 });
    });
  }

  // ================================================================ E · diminutivos (-etto, -ino) se acercan a Moderato; superlativos (-issimo) se alejan
  function escenaDiminutivos() {
    const a = F0('E1') - 0.2, b = F0('C1') - 0.2;
    escena('diminutivos', a, b, (s, g) => {
      const fin = b - 0.3;
      const yE = 640;
      const EJ = N.group(g); color(EJ, C.blanco);
      N.line(EJ, 110, yE, 1790, yE, 4, { 'stroke-linecap': 'round' });
      N.el('polygon', { points: `1810,${yE} 1788,${yE - 11} 1788,${yE + 11}`, fill: 'currentColor' }, EJ);
      aparece(s, EJ, a + 0.1, fin, { dy: 0 });
      const MO = N.group(g); color(MO, C.rosa);
      N.line(MO, CX, yE - 30, CX, yE + 30, 5);
      texto(MO, 'Moderato', CX, yE + 78, { anchor: 'middle', size: 44, peso: 800, italic: true, fill: 'currentColor' });
      aparece(s, MO, a + 0.2, fin, { dy: 0 });
      const X = { Larghissimo: 190, Largo: 420, Larghetto: 650, Allegretto: 1230, Allegro: 1430, Presto: 1590, Prestissimo: 1760 };
      const termino = (nm, t0, col) => {
        const G = N.group(g); color(G, col || C.blanco);
        N.line(G, X[nm], yE - 12, X[nm], yE + 12, 3);
        texto(G, nm, X[nm], yE + 58, { anchor: 'middle', size: 30, peso: 700, italic: true, fill: 'currentColor' });
        pop(s, G, t0, fin, X[nm], yE, { k0: .6 });
        return G;
      };
      const flechaArco = (x1, x2, t0, alto, col) => {
        const G = N.group(g); color(G, col);
        arco(G, x1, yE - 22, x2, yE - 22, alto, { w: 5, cab: 16 });
        mostrarEn(s, G, t0, fin, .4);
        return G;
      };
      // -etto, -ino: se acercan
      const tDi = Wd('E1', 'diminutivos') - 0.3;
      const d1 = fraseG(g, [['-etto, -ino', C.rosa], [': se acercan a ', C.blanco], ['Moderato', C.rosa]], CX, 250, { size: 42, peso: 800, anchor: 'middle' });
      aparece(s, d1, tDi, fin, { dy: 8 });
      const tAl = Wd('E3', 'allegretto') - 0.4;
      termino('Allegro', tAl - 0.4); termino('Allegretto', tAl + 0.6, C.rosa);
      flechaArco(X.Allegro, X.Allegretto + 12, tAl + 0.2, 110, C.rosa);
      const e3 = fraseG(g, [['Allegretto', C.rosa], [': algo menos rápido que Allegro', C.blanco]], CX, 850, { size: 32, peso: 700, anchor: 'middle' });
      aparece(s, e3, Wd('E3', 'menos') - 0.3, F0('E4') - 0.1, { dy: 6 });
      const tLa = Wd('E4', 'larghetto') - 0.5;
      termino('Largo', tLa - 0.3); termino('Larghetto', tLa + 0.6, C.rosa);
      flechaArco(X.Largo, X.Larghetto - 12, tLa + 0.2, 110, C.rosa);
      const e4 = fraseG(g, [['Larghetto', C.rosa], [': algo menos lento que Largo', C.blanco]], CX, 850, { size: 32, peso: 700, anchor: 'middle' });
      aparece(s, e4, Wd('E4', 'menos') - 0.3, F0('E5') - 0.1, { dy: 6 });
      // -issimo: se alejan (más extremos)
      const tSu = Wd('E5', 'superlativos') - 0.3;
      const d2 = fraseG(g, [['-issimo', C.rosa], [': se alejan, ', C.blanco], ['más extremos', C.rosa]], CX, 330, { size: 42, peso: 800, anchor: 'middle' });
      aparece(s, d2, tSu, fin, { dy: 8 });
      const tPr = Wd('E5', 'prestissimo') - 0.4, tLg = Wd('E5', 'larghissimo') - 0.4;
      termino('Presto', tPr - 0.3); termino('Prestissimo', tPr + 0.5, C.rosa);
      flechaArco(X.Presto, X.Prestissimo - 8, tPr + 0.2, 90, C.blanco);
      termino('Larghissimo', tLg + 0.5, C.rosa);
      flechaArco(X.Largo, X.Larghissimo + 10, tLg + 0.2, 110, C.blanco);
      const e5 = fraseG(g, [['Prestissimo', C.rosa], [' > Presto  ·  ', C.blanco], ['Larghissimo', C.rosa], [' < Largo', C.blanco]], CX, 850, { size: 32, peso: 700, anchor: 'middle' });
      aparece(s, e5, tPr + 0.4, fin, { dy: 6 });
    });
  }

  // ================================================================ C · por el camino: accelerando, ritardando, ritenuto, rubato… a tempo (y suena)
  const CAMBIOS = [
    { it: 'accel.', es: ['accelerando:', 'acelerando poco a poco'], pal: ['C1', 'accelerando'], d: 'M0,120 C60,118 120,90 200,20', fase: 'accel' },
    { it: 'rit. · rall.', es: ['ritardando, rallentando:', 'frenando poco a poco'], pal: ['C1', 'ritardando'], d: 'M0,20 C80,22 140,50 200,120', fase: 'rit' },
    { it: 'riten.', es: ['ritenuto:', 'más lento de repente'], pal: ['C2', 'ritenuto'], d: 'M0,30 H100 V110 H200' },
    { it: 'rubato', es: ['con libertad:', 'acelera y frena'], pal: ['C3', 'rubato'], d: 'M0,70 C30,20 60,20 90,70 S150,120 200,60' },
    { it: 'a tempo', es: ['vuelve al', 'tempo de antes'], pal: ['C4', 'tempo', 2], d: 'M0,70 H60 M60,70 C80,70 90,110 110,110 C130,110 140,70 150,70 H200', fase: 'atempo' },
  ];
  function escenaCambios() {
    const a = F0('C1') - 0.2, b = F0('M1') - 0.2;
    escena('cambios', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'POR EL CAMINO: CAMBIOS DE TEMPO', CX, 150, { size: 32, anchor: 'middle' });
      pop(s, k, F0('C1') + 0.1, fin, CX, 150);
      const wC = 330, gC = 18, xC = CX - (5 * wC + 4 * gC) / 2, yC = 230, hC = 390;
      const PAN = [];
      CAMBIOS.forEach((c, i) => {
        const x = xC + i * (wC + gC), G = N.group(g);
        const r = panel(G, x, yC, wC, hC, { rx: 22 });
        const GR = N.group(G); color(GR, C.rosa);
        const gr = N.el('path', { d: c.d, fill: 'none', stroke: 'currentColor', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, GR);
        GR.setAttribute('transform', `translate(${x + 65},${yC + 40})`);
        N.line(G, x + 50, yC + 180, x + wC - 50, yC + 180, 2, { stroke: C.tenue });
        texto(G, c.it, x + wC / 2, yC + 250, { anchor: 'middle', size: 44, peso: 800, italic: true, fill: C.rosa });
        texto(G, c.es[0], x + wC / 2, yC + 305, { anchor: 'middle', size: 25, peso: 700, fill: C.blanco });
        texto(G, c.es[1], x + wC / 2, yC + 340, { anchor: 'middle', size: 25, peso: 700, fill: C.blanco });
        const t0 = Wd(c.pal[0], c.pal[1], c.pal[2]) - 0.3;
        pop(s, G, t0, fin, x + wC / 2, yC + hC / 2, { k0: .85 });
        PAN.push({ r, c });
      });
      // el ejemplo: el pulso acelera, frena y vuelve (cada clic deja su marca: juntas = rápido; separadas = lento)
      const TS = S.SON_PULSO || [], BQ = T.bloque.SON_PULSO;
      if (!TS.length || !BQ) return;
      const t0 = TS[0], dur = TS[TS.length - 1] - t0;
      const xa = 200, xb = 1720, yL = 820, xt = t => xa + (t - t0) / dur * (xb - xa);
      const LN = N.group(g); color(LN, C.suave); N.line(LN, xa - 20, yL, xb + 20, yL, 3);
      mostrarEn(s, LN, BQ.t0 - 0.3, fin, .3);
      const FASES = [['a tempo', 0, 3], ['accel.', 3, 9], ['rit.', 9, 14], ['a tempo', 14, 18]];
      FASES.forEach(([nm, i0, i1], f) => {
        const x0 = xt(TS[i0]), x1 = xt(TS[Math.min(i1, TS.length) - 1]);
        const G = N.group(g); color(G, C.blanco);
        texto(G, nm, (x0 + x1) / 2, yL - 90, { anchor: 'middle', size: 32, peso: 800, italic: true, fill: 'currentColor' });
        N.line(G, x0, yL - 70, x1, yL - 70, 2.5, { 'stroke-linecap': 'round' });
        s.on(t => { opa(G, win(t, TS[i0] - 0.15, fin, .2, .4)); color(G, mezcla(C.blanco, C.rosa, win(t, TS[i0] - 0.15, TS[Math.min(i1, TS.length) - 1] + 0.3, .15, .25))); });
      });
      TS.forEach((tc, i) => {
        const G = N.group(g); color(G, C.blanco);
        N.line(G, xt(tc), yL - 26, xt(tc), yL + 26, 5, { 'stroke-linecap': 'round' });
        s.on(t => { opa(G, win(t, tc - 0.02, fin, .05, .4)); color(G, mezcla(C.rosa, C.blanco, ramp(t, tc, tc + 0.4))); });
      });
      const BO = N.group(g); N.el('circle', { cx: 0, cy: 0, r: 13, fill: C.rosa }, BO);
      s.on(t => {
        opa(BO, win(t, t0 - 0.2, TS[TS.length - 1] + 0.6, .15, .3));
        let i = 0; while (i < TS.length - 1 && t >= TS[i + 1]) i++;
        const ta = TS[i], tb = i < TS.length - 1 ? TS[i + 1] : TS[i] + 0.5, u = clamp((t - ta) / (tb - ta));
        const x = xt(ta) + (xt(i < TS.length - 1 ? tb : ta) - xt(ta)) * u, y = yL - 40 - 60 * 4 * u * (1 - u);
        BO.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`);
      });
      // mientras suena cada fase, su tarjeta se enciende
      PAN.forEach(({ r, c }) => {
        if (!c.fase) return;
        const f = FASES.findIndex(F => (c.fase === 'accel' && F[0] === 'accel.') || (c.fase === 'rit' && F[0] === 'rit.') || (c.fase === 'atempo' && F[1] === 14));
        if (f < 0) return;
        const [, i0, i1] = FASES[f];
        s.on(t => { const kk = win(t, TS[i0] - 0.15, TS[Math.min(i1, TS.length) - 1] + 0.3, .15, .25); r.setAttribute('stroke', mezcla('#3a4556', C.rosa, kk)); r.setAttribute('stroke-width', (1.5 + 1.5 * kk).toFixed(2)); });
      });
      oido(s, g, CX + 420, 146, ['SON_PULSO']);
    });
  }

  // ================================================================ M · modificadores: molto, poco, più, meno, non troppo
  function escenaModificadores() {
    const a = F0('M1') - 0.2, b = F0('R1') - 0.2;
    escena('modificadores', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'MODIFICADORES', CX, 150, { size: 36, anchor: 'middle' });
      pop(s, k, Wd('M1', 'modificadores') - 0.3, fin, CX, 150);
      const su = fraseG(g, [['acompañan a otro término: ', C.suave], ['más precisión', C.blanco]], CX, 235, { size: 34, peso: 700, anchor: 'middle' });
      aparece(s, su, Wd('M1', 'acompanan') - 0.3, fin, { dy: 6 });
      const MOD = [['molto', 'mucho', Wd('M2', 'molto')], ['poco', 'poco', Wd('M2', 'poco', 1)], ['più', 'más', Wd('M2', 'piu')], ['meno', 'menos', Wd('M2', 'meno')], ['non troppo', 'no demasiado', Wd('M2', 'non')]];
      MOD.forEach(([it, es, t0], i) => {
        const y = 340 + i * 78, G = N.group(g);
        texto(G, it, CX - 40, y, { anchor: 'end', size: 44, peso: 800, italic: true, fill: C.rosa });
        texto(G, '=', CX, y, { anchor: 'middle', size: 40, peso: 700, fill: C.suave });
        texto(G, es, CX + 40, y, { size: 40, peso: 700, fill: C.blanco });
        aparece(s, G, t0 - 0.3, fin, { dy: 6 });
      });
      const tEj = Wd('M3', 'allegro') - 0.3;
      const EJ = N.group(g); panel(EJ, CX - 560, 760, 1120, 190, { rx: 24, stroke: C.rosa, sw: 2 });
      aparece(s, EJ, tEj, fin, { dy: 10 });
      const it = fraseG(g, [['Allegro ', C.blanco], ['ma non troppo', C.rosa]], CX, 835, { size: 52, peso: 800, anchor: 'middle' });
      aparece(s, it, tEj, fin, { dy: 8 });
      const es = fraseG(g, [['= rápido… ', C.blanco], ['pero sin pasarse', C.rosa]], CX, 905, { size: 36, peso: 700, anchor: 'middle' });
      aparece(s, es, Wd('M3', 'rapido') - 0.3, fin, { dy: 6 });
    });
  }

  // ================================================================ R · lo del vídeo de términos: échales un ojo; subráyate los que no conocías
  function escenaRecomendacion() {
    const a = F0('R1') - 0.2, b = T.acorde + 0.15;
    escena('recomendacion', a, b, (s, g) => {
      const fin = b - 0.3;
      const kV = tarjetaEnlace(g, CX - 250, 190, { tipo: 'video', titulo: 'Términos', slug: 'terminos', centro: true });
      pop(s, kV, Wd('R1', 'video') - 0.3, fin, CX - 250, 190);
      const kA = tarjetaEnlace(g, CX + 250, 190, { tipo: 'apuntes', titulo: 'Términos', temas: ['terminos'], nombre: 'Términos', centro: true });
      pop(s, kA, Wd('R1', 'general') - 0.2, fin, CX + 250, 190);
      const OJ = N.group(g); color(OJ, C.rosa); icoOjo(OJ, 520, 400, 0.8);
      const l1 = N.group(OJ); frase(l1, [['échales un ojo', C.blanco]], 600, 414, { size: 44, peso: 800 });
      aparece(s, OJ, Wd('R1', 'ojo') - 0.4, fin, { dy: 8 });
      const l2 = fraseG(g, [['iguales o parecidas al español: ', C.blanco], ['no hace falta aprenderlas', C.suave]], 470, 530, { size: 36, peso: 800 });
      aparece(s, l2, Wd('R1', 'parecidas') - 0.3, fin, { dy: 6 });
      const tSu = Wd('R1', 'subrayate') - 0.3;
      const HL = N.group(g);
      const hl = N.el('rect', { x: 462, y: 600, width: 0, height: 52, rx: 8, fill: C.rosa, 'fill-opacity': 0.35 }, HL);
      const l3 = N.group(g); const f3 = frase(l3, [['subráyate ', C.rosa], ['las que no conocías', C.blanco]], 470, 640, { size: 36, peso: 800 });
      aparece(s, l3, tSu, fin, { dy: 6 });
      s.on(t => { hl.setAttribute('width', ((f3._w + 20) * ease(ramp(t, tSu + 0.4, tSu + 1.1))).toFixed(1)); opa(HL, win(t, tSu, fin, .1, .4)); });
      const l4 = fraseG(g, [['esas son las que ', C.blanco], ['hay que mirar un poquito más', C.rosa]], 470, 750, { size: 36, peso: 800 });
      aparece(s, l4, Wd('R1', 'mirar') - 0.6, fin, { dy: 6 });
    });
  }

  const ORDEN = [escenaDosTipos, escenaEscalera, escenaMetronomo, escenaDiminutivos, escenaCambios, escenaModificadores, escenaRecomendacion];

  // ================================================================ 0 · TÍTULO INICIAL (norma 5) y FINAL (norma 3): el título llega con el último acorde
  function tituloGrande(g) {
    const L = TITULO.lineas, n = L.length;
    const size = TITULO.size || (n > 1 ? 88 : 104);
    const y1 = n > 1 ? 452 : 528, paso = size * 1.08;
    texto(g, TITULO.kicker, CX, y1 - size - 32, { anchor: 'middle', size: 26, peso: 800, ls: '0.3em', fill: C.rosa });
    L.forEach((l, i) => {
      const t = texto(g, l, CX, y1 + i * paso, { anchor: 'middle', size, peso: 800, ls: '0.04em', fill: C.blanco });
      const w = D.medir(t); if (w > 1720) t.setAttribute('font-size', (size * 1720 / w).toFixed(1));
    });
    const yR = y1 + (n - 1) * paso + 38;
    N.el('rect', { x: CX - 60, y: yR, width: 120, height: 5, rx: 2.5, fill: C.rosa }, g);
    if (TITULO.sub) texto(g, TITULO.sub, CX, yR + 74, { anchor: 'middle', size: 38, peso: 400, fill: '#cbd5e1' });
  }
  function escenaTitulo() {
    const b = F1('TITULO');
    escena('titulo', -1, b, (s, g) => { const gg = N.group(g); tituloGrande(gg); s.on(t => opa(gg, 1 - ease(ramp(t, b - 1.2, b)))); });
  }
  function escenaFinal() {
    const ta = T.acorde;
    escena('final', ta - 0.5, T.dur + 9999, (s, g) => {
      const gg = N.group(g); tituloGrande(gg);
      s.on(t => { const k = t >= ta ? eo(ramp(t, ta, ta + 0.35)) : 0; opa(gg, k); gg.setAttribute('transform', `translate(${CX},540) scale(${(0.97 + 0.03 * k).toFixed(4)}) translate(${-CX},-540)`); });
    });
  }
  function veloFondo(t) {
    const tit = 1 - ease(ramp(t, F1('TITULO') - 1.0, F1('TITULO') + 0.3));
    const fin = ease(ramp(t, T.acorde - 0.05, T.acorde + 0.4));
    return clamp(0.72 - 0.19 * Math.max(tit, fin), 0, 0.92);
  }
  function construir(tiempos) {
    T = tiempos;
    esc.length = 0;
    const capa = document.getElementById('capaEscenas');
    while (capa.firstChild) capa.removeChild(capa.firstChild);
    escenaTitulo();
    for (const f of ORDEN) f();
    escenaFinal();
  }
  function pintar(t) {
    for (const s of esc) {
      const activa = t >= s.a - 0.05 && t <= s.b + 0.05;
      if (!activa) { if (s.g.style.display !== 'none') s.g.style.display = 'none'; continue; }
      s.g.style.display = '';
      for (const f of s.tracks) f(t);
    }
    const velo = document.getElementById('velo');
    if (velo) { const v = veloFondo(t).toFixed(3); if (velo._v !== v) { velo._v = v;   // (29-sep-2026) velo en su propia capa
      if (velo.tagName.toLowerCase() === 'rect') velo.setAttribute('opacity', v); else velo.style.opacity = v; } }
  }
  window.ESCENAS = { construir, pintar, get T() { return T; } };
})();
