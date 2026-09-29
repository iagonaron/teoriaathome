/* =====================================================================
   ESCENAS · Términos (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (terminos/escenas_cuerpo.js). Todo es función pura de t.
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

  // ================================================================ E18 · TÉRMINOS (dinámica, articulación, carácter y otros)
  const TITULO = { kicker: 'TEORÍA  ·  TÉRMINOS', lineas: ['TÉRMINOS'], sub: 'Dinámica · Articulación · Carácter' };

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
  /** Matiz dinámico con los glifos de Bravura: 'pp', 'mf', 'sfz'… centrado en x; y = línea base. Devuelve el grupo (_w). */
  const DIN_GL = { p: 'dynamicPiano', m: 'dynamicMezzo', f: 'dynamicForte', s: 'dynamicSforzando', z: 'dynamicZ' };
  function dinamica(parent, str, x, y, sp, o) {
    o = o || {};
    const G = N.group(parent, 'dinamica');
    let w = 0; for (const ch of str) w += N.M[DIN_GL[ch]].adv * sp;
    let cx = o.anchor === 'start' ? x : x - w / 2;
    for (const ch of str) { N.glyph(G, DIN_GL[ch], cx, y, sp); cx += N.M[DIN_GL[ch]].adv * sp; }
    G._w = w;
    return G;
  }
  /** Regulador (crescendo '<' o diminuendo '>'), de x0 a x1, con abertura h. */
  function regulador(parent, x0, x1, y, h, tipo, o) {
    o = o || {};
    const G = N.group(parent, 'regulador'), w = o.w || 4;
    const d = tipo === 'cresc' ? `M${x1},${y - h / 2} L${x0},${y} L${x1},${y + h / 2}` : `M${x0},${y - h / 2} L${x1},${y} L${x0},${y + h / 2}`;
    N.el('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, G);
    return G;
  }
  /** Ligadura de expresión (media luna rellena) entre dos puntos; curv > 0 = hacia abajo. */
  function ligadura(parent, x1, y1, x2, y2, curv) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return N.el('path', { d: `M${x1},${y1} Q${mx},${my + curv * 2} ${x2},${y2} Q${mx},${my + curv * 1.55} ${x1},${y1} Z`, fill: 'currentColor' }, parent);
  }
  /** Bocadillo de cómic con cola hacia abajo a la izquierda. */
  function bocadillo(parent, x, y, w, h) {
    const G = N.group(parent, 'bocadillo');
    N.el('path', { d: `M${x + 18},${y} H${x + w - 18} Q${x + w},${y} ${x + w},${y + 18} V${y + h - 18} Q${x + w},${y + h} ${x + w - 18},${y + h} H${x + 110} L${x + 58},${y + h + 44} L${x + 70},${y + h} H${x + 18} Q${x},${y + h} ${x},${y + h - 18} V${y + 18} Q${x},${y} ${x + 18},${y} Z`,
      fill: C.panel, stroke: C.rosa, 'stroke-width': 3, 'stroke-linejoin': 'round' }, G);
    return G;
  }
  function icoCorazon(g, cx, cy, s) {
    const G = N.group(g, 'ico'); s = s || 1;
    N.el('path', { d: `M${cx},${cy + 30 * s} C${cx - 52 * s},${cy - 2 * s} ${cx - 40 * s},${cy - 46 * s} ${cx - 12 * s},${cy - 40 * s} C${cx - 4 * s},${cy - 38 * s} ${cx},${cy - 30 * s} ${cx},${cy - 24 * s} C${cx},${cy - 30 * s} ${cx + 4 * s},${cy - 38 * s} ${cx + 12 * s},${cy - 40 * s} C${cx + 40 * s},${cy - 46 * s} ${cx + 52 * s},${cy - 2 * s} ${cx},${cy + 30 * s} Z`,
      fill: 'none', stroke: 'currentColor', 'stroke-width': 5 * s, 'stroke-linejoin': 'round' }, G);
    return G;
  }
  function icoRayo(g, cx, cy, s) {
    const G = N.group(g, 'ico'); s = s || 1;
    N.el('path', { d: `M${cx + 10 * s},${cy - 44 * s} L${cx - 24 * s},${cy + 6 * s} L${cx - 2 * s},${cy + 6 * s} L${cx - 12 * s},${cy + 44 * s} L${cx + 24 * s},${cy - 8 * s} L${cx + 2 * s},${cy - 8 * s} Z`,
      fill: 'none', stroke: 'currentColor', 'stroke-width': 5 * s, 'stroke-linejoin': 'round' }, G);
    return G;
  }
  /** Pila que se va gastando: devuelve {g, barras}. */
  function icoPila(g, x, y, w, h) {
    const G = N.group(g, 'pila');
    N.el('rect', { x, y, width: w, height: h, rx: 10, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 }, G);
    N.el('rect', { x: x + w, y: y + h * 0.3, width: 12, height: h * 0.4, rx: 3, fill: 'currentColor' }, G);
    const barras = [];
    for (let i = 0; i < 4; i++) barras.push(N.el('rect', { x: x + 10 + i * (w - 20) / 4, y: y + 10, width: (w - 20) / 4 - 8, height: h - 20, rx: 4, fill: 'currentColor' }, G));
    return { g: G, barras };
  }

  // ================================================================ H · de los neumas a las instrucciones
  /** Neumas dibujados a pluma (trazos sueltos), cada uno con su dibujo en coordenadas locales. */
  const NEUMAS = [
    { d: 'M0,4 L14,-20', punto: [0, 6] },                      // virga
    { d: 'M-2,-2 Q6,12 12,2 L22,-22' },                         // pes
    { d: 'M0,8 L10,-14 L22,10' },                               // clivis
    { d: 'M0,0 L18,0', punto: [26, -2] },                       // tractulus + punctum
    { d: 'M0,6 L8,-10 L18,6 L28,-16' },                         // porrectus
    { d: 'M0,-4 Q10,-16 18,0 Q24,12 30,-2' },                   // oriscus / quilisma
  ];
  const SILABAS = ['Ky', 'ri', 'e', 'e', 'lei', 'son'];
  const ALTURA = [0, 2, 3, 2, 4, 1];                             // pasos por encima del grave (para la línea y el tetragrama)
  function escenaHistoria() {
    const a = F0('H1') - 0.1, b = F0('H5') - 0.2;
    escena('historia', a, b, (s, g) => {
      const fin = b - 0.3;
      const tPap = Wd('H1', 'papel') - 0.4, tPoq = Wd('H1', 'poquitos') - 0.2;
      const tLin = Wd('H2', 'grafias') - 0.2, tTetra = Wd('H2', 'poco', 1) - 0.2;
      const tMod = F0('H3') - 0.3, tFinPerg = F0('H3') + 0.2;
      // pergamino
      const x0 = 360, y0 = 250, w = 1200, h = 440;
      const PG = N.group(g, 'pergamino');
      panel(PG, x0, y0, w, h, { rx: 22 });          // (29-sep, Iago) sin pergamino amarillento: el panel y el blanco de siempre
      s.on(t => opa(PG, win(t, tPap, tFinPerg, .5, .5)));
      const TINTA = C.blanco, ROJO = C.rosa;
      const yTxt = y0 + h - 70, xs = SILABAS.map((_, i) => x0 + 190 + i * 168);
      const SL = N.group(PG); color(SL, TINTA);
      SILABAS.forEach((sl, i) => texto(SL, sl, xs[i] + 14, yTxt, { anchor: 'middle', size: 44, peso: 400, italic: true, familia: 'Georgia, "Times New Roman", serif' }));
      // 1) neumas sin líneas: todos a una altura parecida (adiastemática)
      const yA = yTxt - 120, yLinea = y0 + 205, paso = 22;
      const NE = NEUMAS.map((nm, i) => {
        const G = N.group(PG); color(G, TINTA);
        const GS = N.group(G); GS.setAttribute('transform', 'scale(1.9)');
        const p = trazo(GS, nm.d, { w: 3.4 });
        if (nm.punto) N.el('circle', { cx: nm.punto[0], cy: nm.punto[1], r: 3.2, fill: 'currentColor' }, GS);
        return { g: G, p, xa: xs[i] - 8, ya: yA + (i % 2 ? -10 : 8), yb: yLinea + 2 * paso - ALTURA[i] * paso };
      });
      NE.forEach((ne, i) => {
        const t0 = tPoq + i * 0.16;
        s.on(t => {
          trazoK(ne.p, ramp(t, t0, t0 + 0.45));
          const k = ease(ramp(t, tLin + 0.25, tLin + 1.05));
          const y = ne.ya + (ne.yb - ne.ya) * k;
          ne.g.setAttribute('transform', `translate(${ne.xa},${y.toFixed(1)})`);
          opa(ne.g, (t < t0 ? 0 : 1) * (1 - ease(ramp(t, tTetra + 0.3, tTetra + 0.8))));
        });
      });
      const la = fraseG(g, [['sin líneas: ', C.suave], ['notación adiastemática', C.rosa]], CX, y0 + h + 80, { size: 36, peso: 800, anchor: 'middle' });
      aparece(s, la, tPoq, tLin + 0.1, { dy: 6 });
      // 2) una línea (roja): las alturas ya se ven (diastemática)
      const LR = N.group(PG); color(LR, ROJO);
      const lr = trazo(LR, `M${x0 + 120},${yLinea} L${x0 + w - 100},${yLinea}`, { w: 4 });
      s.on(t => trazoK(lr, ramp(t, tLin, tLin + 0.6)));
      const lb = fraseG(g, [['con una línea: ', C.suave], ['notación diastemática', C.rosa]], CX, y0 + h + 80, { size: 36, peso: 800, anchor: 'middle' });
      aparece(s, lb, tLin + 0.2, tTetra + 0.4, { dy: 6 });
      // 3) cuatro líneas (tetragrama) y notas cuadradas
      const TT = N.group(PG); color(TT, TINTA);
      for (const k of [-1, 1, 2]) N.line(TT, x0 + 120, yLinea - k * paso * 2, x0 + w - 100, yLinea - k * paso * 2, 2.5);
      mostrarEn(s, TT, tTetra, 1e9, .4);
      const CL = N.group(PG); color(CL, TINTA);    // clave de Do gregoriana (dos cuadraditos)
      N.el('path', { d: `M${x0 + 140},${yLinea - 2 * paso - 18} h14 v14 h-14 z M${x0 + 140},${yLinea - 2 * paso + 4} h14 v14 h-14 z M${x0 + 140},${yLinea - 2 * paso - 18} v36`, fill: 'currentColor', stroke: 'currentColor', 'stroke-width': 3 }, CL);
      mostrarEn(s, CL, tTetra + 0.2, 1e9, .4);
      ALTURA.forEach((al, i) => {
        const Q = N.group(PG); color(Q, TINTA);
        const yq = yLinea + 2 * paso - al * paso;
        N.el('rect', { x: xs[i] + 1, y: yq - 12, width: 26, height: 24, rx: 2, fill: 'currentColor' }, Q);
        if (i === 1) N.line(Q, xs[i] + 26, yq, xs[i] + 26, yq + 44, 3.5);
        mostrarEn(s, Q, tTetra + 0.35 + i * 0.07, 1e9, .3);
      });
      const lc = fraseG(g, [['cuatro líneas: ', C.suave], ['tetragrama', C.rosa]], CX, y0 + h + 80, { size: 36, peso: 800, anchor: 'middle' });
      aparece(s, lc, tTetra + 0.4, tFinPerg, { dy: 6 });
      // 4) hoy: pentagrama, ritmo, altura y clave…
      const yM = 470, px = 490;
      const PM = N.group(g, 'moderno');
      aparece(s, PM, tMod + 0.3, fin, { dy: 0 });
      const P = { x0: px + 3.9 * SP };
      const MEL = N.group(PM);
      const m = N.melodia(MEL, [{ p: 'G4', n: 'q' }, { p: 'A4', n: '8', barra: 'b1' }, { p: 'B4', n: '8', barra: 'b1' }, { p: 'C5', n: 'q' }, { p: 'B4', n: 'q' },
        { p: 'A4', n: '8', barra: 'b2' }, { p: 'G4', n: '8', barra: 'b2' }, { p: 'A4', n: 'h' }], P.x0 + 60, yM, { espacio: { q: 4.6, '8': 3.2, h: 6 } });
      const xBarra = m.notas[m.notas.length - 1].x + 3.6 * SP;       // (29-sep) sitio para la blanca final
      const P5 = N.group(PM); PM.insertBefore(P5, MEL); N.pentagrama(P5, px, yM, xBarra - px, SP);
      barra(PM, xBarra, yM);
      // (29-sep, Iago) «ritmos»: solo plicas, barras y corchetes · «alturas»: solo las cabezas
      const tRi = Wd('H3', 'ritmos') - 0.15, tAl = Wd('H3', 'alturas') - 0.15, tCl = Wd('H3', 'claves') - 0.15;
      const barrasM = [...new Set(m.notas.map(e => e.barras).filter(Boolean))];
      s.on(t => {
        const cR = mezcla(C.blanco, C.rosa, win(t, tRi, tAl + 0.1, .2, .3)), cA = mezcla(C.blanco, C.rosa, win(t, tAl, tCl + 0.1, .2, .3));
        m.notas.forEach(e => { color(e.cabeza, cA); if (e.plica) color(e.plica, cR); if (e.corchete) color(e.corchete, cR); });
        barrasM.forEach(b => color(b, cR));
      });
      const CLV = N.group(PM); N.claveSol(CLV, px + 0.6 * SP, yM, SP);
      s.on(t => color(CLV, mezcla(C.blanco, C.rosa, win(t, tCl, tCl + 1.6, .2, .4))));
      [['ritmos', tRi, 700], ['alturas', tAl, 960], ['claves', tCl, 1220]].forEach(([tx, t0, x]) => {
        const k = N.group(g); chip(k, tx.toUpperCase(), x, 690, { size: 26, anchor: 'middle', relleno: false });
        pop(s, k, t0, F0('H4') + 0.4, x, 690);
      });
      const ya = fraseG(g, [['… ya lo conoces', C.suave]], CX, 770, { size: 32, peso: 700, italic: true, anchor: 'middle' });
      aparece(s, ya, Wd('H3', 'conoces') - 0.3, F0('H4') + 0.4, { dy: 6 });
      // 5) …y cada vez más instrucciones para el intérprete
      const tIn = Wd('H4', 'instrucciones') - 0.2;
      const kI = N.group(g); chip(kI, 'INSTRUCCIONES PARA EL INTÉRPRETE', CX, 200, { size: 30, anchor: 'middle' });
      pop(s, kI, tIn, fin, CX, 200);
      const nx = i => m.notas[i].x;
      const INS = [
        { t: Wd('H4', 'interprete') - 0.2, f: G => frase(G, [['Allegro', 'currentColor']], px + 30, yM - 118, { size: 40, peso: 800 }) },
        { t: Wd('H4', 'saber') - 0.2, f: G => dinamica(G, 'p', nx(0) + 14, yM + 2 * SP + 62, SP * 1.05) },
        { t: Wd('H4', 'como') - 0.2, f: G => regulador(G, nx(1) - 6, nx(3) + 26, yM + 2 * SP + 58, 30, 'cresc') },
        { t: Wd('H4', 'forma') - 0.2, f: G => dinamica(G, 'f', nx(4) + 16, yM + 2 * SP + 62, SP * 1.05) },
        { t: Wd('H4', 'adecuada') - 0.2, f: G => ligadura(G, nx(4) + 12, yM - 3.3 * SP, nx(7) + 22, yM - 3.3 * SP, -13) },
        { t: Wd('H4', 'interpretacion') - 0.2, f: G => frase(G, [['dolce', 'currentColor']], nx(6) - 10, yM + 2 * SP + 70, { size: 36, peso: 700, italic: true }) },
      ];
      INS.forEach(it => { const G = N.group(g); color(G, C.rosa); it.f(G); aparece(s, G, it.t, fin, { dy: 8 }); });
    });
  }

  // ================================================================ T · términos: casi todos en italiano… y organizados en familias
  const FAMILIAS = [
    { tit: 'DINÁMICA', pal: ['piano', 'forte', 'crescendo', 'smorzando'] },
    { tit: 'ARTICULACIÓN', pal: ['legato', 'staccato', 'tenuto', 'pizzicato'] },
    { tit: 'CARÁCTER', pal: ['dolce', 'cantabile', 'con brio', 'grazioso'] },
    { tit: 'REPETICIÓN Y OTROS', pal: ['da capo', 'dal segno', 'fine', 'ad libitum'] },
  ];
  function escenaTerminos() {
    const a = F0('H5') - 0.2, b = F0('D1') - 0.2;
    escena('terminos', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'TÉRMINOS', CX, 150, { size: 40, anchor: 'middle' });
      pop(s, k, Wd('H5', 'terminos') - 0.2, fin, CX, 150);
      const co = fraseG(g, [['completan la información de la ', C.suave], ['partitura', C.blanco]], CX, 240, { size: 36, peso: 700, anchor: 'middle' });
      aparece(s, co, Wd('H5', 'completar') - 0.3, F0('I2') - 0.2, { dy: 6 });
      // en italiano (bandera)
      const tIt = Wd('I1', 'italiano') - 0.3;
      const IT = N.group(g);
      const bx = CX - 190, by = 292;
      [['#1f9d55', 0], ['#f8fafc', 1], ['#e3342f', 2]].forEach(([c, i]) => N.el('rect', { x: bx + i * 24, y: by, width: 24, height: 48, fill: c }, IT));
      N.el('rect', { x: bx, y: by, width: 72, height: 48, rx: 6, fill: 'none', stroke: 'rgba(255,255,255,0.5)', 'stroke-width': 2 }, IT);
      frase(IT, [['casi todos, en ', C.blanco], ['italiano', C.rosa]], bx + 96, by + 37, { size: 38, peso: 800 });
      aparece(s, IT, tIt, fin, { dy: 8 });
      // la nube de términos… y sus cuatro familias
      const tNu = Wd('I2', 'muchisimos') - 0.4, tOr = Wd('I2', 'organizados') - 0.2, tFa = Wd('I2', 'familias') - 0.2;
      const wB = 400, gB = 30, xB = CX - (4 * wB + 3 * gB) / 2, yB = 385, hB = 440;
      FAMILIAS.forEach((f, i) => {
        const x = xB + i * (wB + gB), G = N.group(g);
        panel(G, x, yB, wB, hB, { rx: 22 });
        texto(G, f.tit, x + wB / 2, yB + 52, { anchor: 'middle', size: f.tit.length > 14 ? 22 : 26, peso: 800, ls: '0.12em', fill: C.rosa });
        aparece(s, G, tOr + i * 0.12, fin, { dy: 10 });
      });
      let semilla = 7; const azar = () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; };
      FAMILIAS.forEach((f, i) => f.pal.forEach((p, j) => {
        const W = N.group(g); color(W, C.blanco);
        const t = texto(W, p, 0, 0, { anchor: 'middle', size: 36, peso: 700, italic: true });
        const xa = 300 + azar() * 1320, ya = 430 + azar() * 360;
        const xb = xB + i * (wB + gB) + wB / 2, yb = yB + 135 + j * 80;
        const t0 = tNu + (i * 4 + j) * 0.07, t1 = tFa + (j * 4 + i) * 0.05;
        s.on(tt => {
          const v = win(tt, t0, fin, .3, .4); opa(W, v);
          if (v <= 0) return;
          const kk = ease(ramp(tt, t1, t1 + 0.9));
          W.setAttribute('transform', `translate(${(xa + (xb - xa) * kk).toFixed(1)},${(ya + (yb - ya) * kk).toFixed(1)})`);
          color(W, mezcla(C.suave, C.blanco, kk));
        });
      }));
      const cs = fraseG(g, [['+ ', C.rosa], ['un consejo para estudiarlos', C.blanco]], CX, 900, { size: 36, peso: 800, anchor: 'middle' });
      aparece(s, cs, Wd('I2', 'recomiendo') - 0.3, fin, { dy: 8 });
      const en = fraseG(g, [['¡Te lo digo enseguida!', C.rosa]], CX, 962, { size: 38, peso: 800, italic: true, anchor: 'middle' });   // (29-sep, Iago)
      aparece(s, en, Wd('I2', 'recomiendo') + 0.25, fin, { dy: 8 });
    });
  }

  // ================================================================ D · dinámica: de pp a ff (y suena)
  const DINS = [
    { d: 'pp', it: 'pianissimo', es: 'muy suave' }, { d: 'p', it: 'piano', es: 'suave' }, { d: 'mp', it: 'mezzo piano', es: 'medio suave' },
    { d: 'mf', it: 'mezzo forte', es: 'medio fuerte' }, { d: 'f', it: 'forte', es: 'fuerte' }, { d: 'ff', it: 'fortissimo', es: 'muy fuerte' },
  ];
  function escenaDinamica() {
    const a = F0('D1') - 0.2, b = F0('G1') - 0.2;
    escena('dinamica', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'DINÁMICA', CX, 150, { size: 40, anchor: 'middle' });
      pop(s, k, Wd('D1', 'dinamica') - 0.3, fin, CX, 150);
      const su = fraseG(g, [['lo ', C.suave], ['fuerte', C.blanco], [' y lo ', C.suave], ['suave', C.blanco], [' que tocamos', C.suave]], CX, 235, { size: 36, peso: 700, anchor: 'middle' });
      aparece(s, su, Wd('D1', 'fuerte') - 0.3, fin, { dy: 6 });
      // la cuña: de más suave a más fuerte
      const tCu = Wd('D1', 'suave', 2) - 0.3;
      const CU = N.group(g); color(CU, C.rosa);
      const cuna = N.el('path', { d: 'M300,640 Z', fill: 'currentColor', 'fill-opacity': 0.22, stroke: 'currentColor', 'stroke-width': 3, 'stroke-linejoin': 'round' }, CU);
      s.on(t => {
        const kk = ease(ramp(t, tCu, tCu + 1.2)), xr = 300 + 1340 * kk, hh = 36 * kk;
        cuna.setAttribute('d', `M300,640 L${xr.toFixed(1)},${(640 - hh).toFixed(1)} L${xr.toFixed(1)},${(640 + hh).toFixed(1)} Z`);
        opa(CU, win(t, tCu, fin, .1, .4));
      });
      const tt = [Wd('D1', 'pianissimo'), Wd('D1', 'piano'), Wd('D1', 'mezzo', 1), Wd('D1', 'mezzo', 2), Wd('D1', 'forte', 2), Wd('D1', 'fortissimo')];
      const TS = S.SON_DIN || [];
      DINS.forEach((dn, i) => {
        const x = 390 + i * 228, t0 = tt[i] - 0.2;
        const G = N.group(g), GL = N.group(G);
        dinamica(GL, dn.d, x, 500, SP * 2.0);
        const it = N.group(G); texto(it, dn.it, x, 575, { anchor: 'middle', size: 30, peso: 700, italic: true, fill: 'currentColor' });
        const es = N.group(G); texto(es, dn.es, x, 740, { anchor: 'middle', size: 26, peso: 600, fill: C.suave });
        pop(s, G, t0, fin, x, 520, { k0: .6 });
        s.on(t => {
          const kk = TS[i] != null ? win(t, TS[i] - 0.03, TS[i] + 0.55, .05, .3) : 0;
          color(GL, mezcla(C.blanco, C.rosa, Math.max(kk, win(t, t0, t0 + 0.9, .1, .4))));
          GL.setAttribute('transform', `translate(${x},480) scale(${(1 + 0.18 * kk).toFixed(3)}) translate(${-x},-480)`);
          color(it, mezcla(C.blanco, C.rosa, kk));
        });
      });
      oido(s, g, 1760, 470, ['SON_DIN']);
      // «¡Haz los matices!»
      const tBo = Wd('D2', 'favor') - 0.3;
      const BO = N.group(g); bocadillo(BO, CX - 300, 800, 600, 96);
      frase(BO, [['«Por favor, ', C.blanco], ['¡haz los matices!', C.rosa], ['»', C.blanco]], CX, 862, { size: 36, peso: 800, anchor: 'middle' });
      aparece(s, BO, tBo, F0('D3') + 0.2, { dy: 10 });
      const cu = fraseG(g, [['cuenta bastante', C.rosa], ['  ·  y es muy fácil: ', C.blanco], ['acuérdate', C.rosa]], CX, 862, { size: 38, peso: 800, anchor: 'middle' });
      aparece(s, cu, Wd('D3', 'cuenta') - 0.2, fin, { dy: 8 });
    });
  }

  // ================================================================ G · graduar la intensidad: poco a poco, de golpe… y apagándose
  function escenaGradua() {
    const a = F0('G1') - 0.2, b = F0('A1') - 0.2;
    escena('gradua', a, b, (s, g) => {
      const fin = b - 0.3;
      const wP = 560, gP = 30, xP = CX - (3 * wP + 2 * gP) / 2, yP = 220, hP = 620;
      const PAN = [
        { tit: 'POCO A POCO', t0: F0('G1') - 0.1 },
        { tit: 'DE GOLPE', t0: F0('G2') - 0.1 },
        { tit: 'SE APAGAN… Y FRENAN', t0: F0('G3') - 0.1 },
      ];
      const X = PAN.map((p, i) => xP + i * (wP + gP));
      PAN.forEach((p, i) => {
        const G = N.group(g); panel(G, X[i], yP, wP, hP, { rx: 24 });
        texto(G, p.tit, X[i] + wP / 2, yP + 56, { anchor: 'middle', size: 26, peso: 800, ls: '0.14em', fill: C.rosa });
        aparece(s, G, p.t0, fin, { dy: 12 });
      });
      const bloque = (x, y, it, es, t0, dib) => {
        const G = N.group(g);
        frase(G, [[it, C.rosa]], x + wP / 2, y, { size: 36, peso: 800, italic: true, anchor: 'middle' });
        const D_ = N.group(G); color(D_, C.blanco); dib(D_);
        frase(G, [[es, C.blanco]], x + wP / 2, y + 170, { size: 28, peso: 700, anchor: 'middle' });
        aparece(s, G, t0, fin, { dy: 10 });
      };
      // 1 · crescendo / diminuendo
      bloque(X[0], yP + 130, 'crescendo', 'aumentando', Wd('G1', 'crescendo') - 0.25, G => regulador(G, X[0] + 90, X[0] + wP - 90, yP + 215, 60, 'cresc', { w: 5 }));
      bloque(X[0], yP + 380, 'diminuendo · decrescendo', 'disminuyendo', Wd('G1', 'diminuendo') - 0.25, G => regulador(G, X[0] + 90, X[0] + wP - 90, yP + 465, 60, 'dim', { w: 5 }));
      // 2 · subito piano / subito forte
      const escalon = (G, x, y, baja) => N.el('path', { d: baja ? `M${x + 90},${y - 30} H${x + wP / 2} V${y + 30} H${x + wP - 90}` : `M${x + 90},${y + 30} H${x + wP / 2} V${y - 30} H${x + wP - 90}`,
        fill: 'none', stroke: 'currentColor', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, G);
      bloque(X[1], yP + 130, 'subito piano · sub. p', 'de repente suave', Wd('G2', 'subito', 1) - 0.25, G => escalon(G, X[1], yP + 215, true));
      bloque(X[1], yP + 380, 'subito forte · sub. f', 'de repente fuerte', Wd('G2', 'subito', 2) - 0.25, G => escalon(G, X[1], yP + 465, false));
      // 3 · smorzando, perdendosi, svanendo: se apagan (y se estiran: frenan)
      const tPal = [Wd('G3', 'smorzando'), Wd('G3', 'perdendosi'), Wd('G3', 'svanendo')];
      ['smorzando', 'perdendosi', 'svanendo'].forEach((p, i) => {
        const W = N.group(g); color(W, C.rosa);
        const t = texto(W, p, X[2] + wP / 2, yP + 150 + i * 90, { anchor: 'middle', size: 40, peso: 800, italic: true });
        const t0 = tPal[i] - 0.25;
        s.on(tt => {
          opa(W, win(tt, t0, fin, .3, .4) * (1 - 0.6 * ease(ramp(tt, t0 + 0.6, t0 + 2.6))));
          t.setAttribute('letter-spacing', (0.26 * ease(ramp(tt, t0 + 0.6, t0 + 2.6))).toFixed(3) + 'em');
        });
      });
      const fr = fraseG(g, [['bajan el volumen ', C.blanco], ['y frenan', C.rosa]], X[2] + wP / 2, yP + 440, { size: 32, peso: 800, anchor: 'middle' });
      aparece(s, fr, Wd('G4', 'frenan') - 0.3, fin, { dy: 6 });
      const tPi = Wd('G4', 'bateria') - 0.5;
      const PI = N.group(g); color(PI, C.blanco);
      const pila = icoPila(PI, X[2] + wP / 2 - 90, yP + 490, 170, 72);
      aparece(s, PI, tPi, fin, { dy: 8 });
      pila.barras.forEach((br, i) => s.on(tt => { br.setAttribute('opacity', (1 - ease(ramp(tt, tPi + 0.5 + (3 - i) * 0.35, tPi + 0.8 + (3 - i) * 0.35))).toFixed(3)); }));
    });
  }

  // ================================================================ A · articulación: legato, staccato, tenuto y pizzicato (y suenan)
  const ARTIC = [
    { it: 'legato', es: 'ligado', ex: '', pal: ['A3', 'ligado'], blq: 'SON_LEG' },
    { it: 'staccato', es: 'picado', ex: 'cortas y separadas', pal: ['A4', 'staccato'], blq: 'SON_STA' },
    { it: 'tenuto', es: 'mantenido', ex: 'todo su valor', pal: ['A5', 'tenuto'], blq: 'SON_TEN' },
    { it: 'pizzicato', es: 'pellizcando', ex: 'en la cuerda', pal: ['A6', 'pizzicato'], blq: 'SON_PIZ' },
  ];
  function escenaArticulacion() {
    const a = F0('A1') - 0.2, b = F0('C1') - 0.2;
    escena('articulacion', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'ARTICULACIÓN', CX, 150, { size: 40, anchor: 'middle' });
      pop(s, k, Wd('A1', 'articulacion') - 0.4, fin, CX, 150);
      const de = fraseG(g, [['depende de tu instrumento… pero ', C.suave], ['los más típicos', C.blanco]], CX, 225, { size: 32, peso: 700, italic: true, anchor: 'middle' });
      aparece(s, de, Wd('A2', 'depender') - 0.3, F0('A3') + 0.5, { dy: 6 });
      const wP = 830, hP = 300, gX = 30, gY = 30, x0 = CX - wP - gX / 2, y0 = 270;
      const tVe = Wd('A2', 'tipicos') - 0.3;
      ARTIC.forEach((ar, i) => {
        const x = x0 + (i % 2) * (wP + gX), y = y0 + Math.floor(i / 2) * (hP + gY);
        const G = N.group(g);
        const r = panel(G, x, y, wP, hP, { rx: 24 });
        const yM = y + 160;
        const PE = N.group(G); pentaClave(PE, x + 40, yM, 470);
        const MEL = N.group(G); color(MEL, C.blanco);
        const m = N.melodia(MEL, ['E4', 'F4', 'G4', 'A4'].map(p => ({ p, n: 'q' })), x + 40 + 3.9 * SP + 30, yM, { espacio: { q: 3.4 } });
        aparece(s, G, tVe + i * 0.12, fin, { dy: 10 });
        // el signo de articulación y los rótulos, con su palabra
        const t0 = Wd(ar.pal[0], ar.pal[1]) - 0.25;
        const MK = N.group(G); color(MK, C.rosa);
        const cx = n => n.x + 0.59 * SP;
        if (ar.it === 'legato') ligadura(MK, cx(m.notas[0]), m.notas[0].y + 26, cx(m.notas[3]), m.notas[3].y + 26, 14);
        else if (ar.it === 'staccato') m.notas.forEach(n => N.el('circle', { cx: cx(n), cy: n.y + 1.25 * SP, r: 5, fill: 'currentColor' }, MK));
        else if (ar.it === 'tenuto') m.notas.forEach(n => N.line(MK, cx(n) - 13, n.y + 1.25 * SP, cx(n) + 13, n.y + 1.25 * SP, 4.5));
        else frase(MK, [['pizz.', 'currentColor']], x + 40 + 3.9 * SP + 20, yM - 2 * SP - 30, { size: 34, peso: 800, italic: true });
        pop(s, MK, t0, fin, x + 280, yM, { k0: .7 });
        const TX = N.group(G);
        texto(TX, ar.it, x + 560, y + 120, { size: 46, peso: 800, italic: true, fill: C.rosa });
        texto(TX, ar.es, x + 560, y + 175, { size: 34, peso: 700, fill: C.blanco });
        if (ar.ex) texto(TX, ar.ex, x + 560, y + 222, { size: 24, peso: 600, fill: C.suave });
        aparece(s, TX, t0, fin, { dy: 8 });
        // mientras suena su ejemplo: panel en rosa y cada nota se enciende con su ataque
        const TS = S[ar.blq] || [];
        s.on(t => {
          const bq = T.bloque[ar.blq]; const kk = bq ? win(t, bq.t0 - 0.1, bq.t1, .2, .3) : 0;
          r.setAttribute('stroke', mezcla('#3a4556', C.rosa, kk)); r.setAttribute('stroke-width', (1.5 + 1.5 * kk).toFixed(2));
        });
        m.notas.forEach((n, j) => s.on(t => { const kk = TS[j] != null ? win(t, TS[j] - 0.03, TS[j] + 0.42, .04, .25) : 0; color(n.g, mezcla(C.blanco, C.rosa, kk)); }));
      });
      oido(s, g, CX + 250, 146, ARTIC.map(ar => ar.blq));
    });
  }

  // ================================================================ C · carácter: la emoción
  function escenaCaracter() {
    const a = F0('C1') - 0.2, b = F0('K1') - 0.2;
    escena('caracter', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'CARÁCTER', CX, 150, { size: 40, anchor: 'middle' });
      pop(s, k, Wd('C1', 'caracter') - 0.3, fin, CX, 150);
      const em = fraseG(g, [['la ', C.suave], ['emoción', C.rosa], [' que se quiere transmitir', C.suave]], CX, 240, { size: 38, peso: 700, anchor: 'middle' });
      aparece(s, em, Wd('C1', 'emocion') - 0.3, fin, { dy: 6 });
      const CAR = [
        { it: 'dolce', es: 'dulce', t0: Wd('C2', 'dolce') - 0.25, ico: (G, x, y) => icoCorazon(G, x, y, 1.2) },
        { it: 'cantabile', es: 'como cantando', t0: Wd('C2', 'cantabile') - 0.25, ico: (G, x, y) => icoCantar(G, x - 36, y) },
        { it: 'con brio', es: 'con energía', t0: Wd('C2', 'brio') - 0.45, ico: (G, x, y) => icoRayo(G, x, y, 1.25) },
      ];
      const wC = 480, gC = 40, xC = CX - (3 * wC + 2 * gC) / 2, yC = 320, hC = 440;
      CAR.forEach((c, i) => {
        const x = xC + i * (wC + gC), G = N.group(g);
        panel(G, x, yC, wC, hC, { rx: 24 });
        const IC = N.group(G); color(IC, C.rosa); c.ico(IC, x + wC / 2, yC + 140);
        texto(G, c.it, x + wC / 2, yC + 290, { anchor: 'middle', size: 54, peso: 800, italic: true, fill: C.rosa });
        texto(G, c.es, x + wC / 2, yC + 355, { anchor: 'middle', size: 34, peso: 700, fill: C.blanco });
        pop(s, G, c.t0, fin, x + wC / 2, yC + hC / 2, { k0: .85 });
      });
    });
  }

  // ================================================================ K · el consejo: la mayoría se parecen al español; márcate los raros
  const HOJA = [
    ['crescendo', 'crecer'], ['legato', 'ligado'], ['dolce', 'dulce'],
    ['smorzando', null], ['diminuendo', 'disminuir'], ['cantabile', 'cantable'],
    ['tranquillo', 'tranquilo'], ['tenuto', null], ['espressivo', 'expresivo'],
    ['animato', 'animado'], ['maestoso', 'majestuoso'], ['sotto voce', null],
    ['grazioso', 'gracioso'], ['stringendo', null], ['energico', 'enérgico'],   // (29-sep, Iago) pizzicato ya lo conoce todo el mundo
  ];
  function escenaConsejo() {
    const a = F0('K1') - 0.2, b = F0('R1') - 0.2;
    escena('consejo', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'UN CONSEJO PARA ESTUDIARLOS', CX, 150, { size: 34, anchor: 'middle' });
      pop(s, k, F0('K1') - 0.1, fin, CX, 150);
      const xH = 330, yH = 230, wH = 1260, hH = 560;
      const HO = N.group(g); panel(HO, xH, yH, wH, hH, { rx: 22 });
      aparece(s, HO, Wd('K1', 'terminos') - 0.3, fin, { dy: 10 });
      const tPa = Wd('K1', 'parecidas') - 0.2, tEs = Wd('K1', 'estudiar') - 0.2;
      const tMa = Wd('K2', 'marcaria') - 0.2, tAp = Wd('K2', 'aprender') - 0.4;
      HOJA.forEach(([it, es], i) => {
        const col = i % 3, fil = Math.floor(i / 3);
        const x = xH + 90 + col * 400, y = yH + 90 + fil * 100;
        const W = N.group(g);
        const raro = !es;
        let hl = null;
        if (raro) { hl = N.el('rect', { x: x - 10, y: y - 34, width: 0, height: 46, rx: 8, fill: C.rosa, 'fill-opacity': 0.35 }, W); }
        const tI = texto(W, it, x, y, { size: 36, peso: 700, italic: true, fill: C.blanco });
        let tS = null;
        if (es) tS = texto(W, '≈ ' + es, x, y + 34, { size: 22, peso: 600, fill: C.suave });
        aparece(s, W, Wd('K1', 'terminos') + 0.1 + i * 0.05, fin, { dy: 6 });
        s.on(t => {
          if (tS) tS.setAttribute('opacity', win(t, tPa + i * 0.04, 1e9, .3, .1).toFixed(3));
          if (!raro) tI.setAttribute('opacity', (1 - 0.62 * ease(ramp(t, tEs, tEs + 0.6))).toFixed(3));
          if (hl) { const wT = D.medir(tI) + 20; hl.setAttribute('width', (wT * ease(ramp(t, tMa + (i % 4) * 0.12, tMa + 0.5 + (i % 4) * 0.12))).toFixed(1)); }
          if (raro) tI.setAttribute('fill', mezcla(C.blanco, '#ffffff', 1));
        });
      });
      const no = fraseG(g, [['se parecen al español: ', C.blanco], ['no hace falta estudiarlos', C.suave]], CX, 870, { size: 34, peso: 800, anchor: 'middle' });
      aparece(s, no, tEs, tMa, { dy: 6 });
      const ma = fraseG(g, [['márcate ', C.blanco], ['los poco intuitivos', C.rosa], ['… son muy pocos', C.blanco]], CX, 870, { size: 34, peso: 800, anchor: 'middle' });
      aparece(s, ma, tMa + 0.2, tAp, { dy: 6 });
      const ap = fraseG(g, [['esos son los que ', C.blanco], ['tienes que aprender', C.rosa]], CX, 870, { size: 34, peso: 800, anchor: 'middle' });
      aparece(s, ap, tAp + 0.1, fin, { dy: 6 });
      // los APUNTES (se pueden pulsar)
      const kA = tarjetaEnlace(g, 0, 0, { tipo: 'apuntes', titulo: 'Términos', temas: ['terminos'], nombre: 'Términos' });
      kA.firstChild.setAttribute('transform', `translate(${(1880 - kA._w).toFixed(1)},36)`);
      pop(s, kA, Wd('K2', 'apuntes') - 0.3, fin, 1880 - kA._w / 2, 84);
    });
  }

  // ================================================================ R · repetición y otros: da capo, dal segno, fine, ad libitum
  function escenaRepeticion() {
    const a = F0('R1') - 0.2, b = F0('F1') - 0.2;
    escena('repeticion', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'REPETICIÓN Y OTROS', CX, 150, { size: 36, anchor: 'middle' });
      pop(s, k, Wd('R1', 'repeticion') - 0.3, fin, CX, 150);
      // una «partitura» de cuatro compases
      const xa = 260, xb = 1660, yM = 400, wc = (xb - xa - 4 * SP) / 4;
      const PT = N.group(g);
      pentaClave(PT, xa, yM, xb - xa);
      const xc = i => xa + 4 * SP + i * wc;
      for (let i = 1; i < 4; i++) barra(PT, xc(i), yM);
      N.line(PT, xb - 8, yM - 2 * SP, xb - 8, yM + 2 * SP, 0.5 * SP); N.line(PT, xb - 20, yM - 2 * SP, xb - 20, yM + 2 * SP, N.E.thinBar * SP);
      ['C5', 'A4', 'F4', 'G4', 'B4', 'D5', 'C5', 'E4'].forEach((n, i) => N.redonda(PT, n, xc(Math.floor(i / 2)) + wc * (i % 2 ? 0.62 : 0.22), yM, SP));
      aparece(s, PT, Wd('R1', 'utiles') - 0.2, fin, { dy: 10 });
      const yTop = yM - 2 * SP, yBot = yM + 2 * SP;
      // D.C. → al principio (arriba)
      const tDC = Wd('R1', 'capo') - 0.3, tPr = Wd('R1', 'principio') - 0.3;
      const DC = N.group(g); color(DC, C.rosa);
      frase(DC, [['D.C.', 'currentColor']], xb - 30, yTop - 26, { size: 34, peso: 800, italic: true, anchor: 'end' });
      pop(s, DC, tDC, fin, xb - 60, yTop - 40);
      const AR1 = N.group(g); color(AR1, C.rosa); arco(AR1, xb - 70, yTop - 84, xa + 40, yTop - 84, 90, { w: 4 });
      mostrarEn(s, AR1, tPr, fin, .4);
      // segno y D.S. → al signo (abajo)
      const tSe = Wd('R1', 'dal') - 0.3, tSi = Wd('R1', 'signo') - 0.3;
      const SG = N.group(g); color(SG, C.rosa); N.glyph(SG, 'segno', xc(1) + 18, yTop - 22, SP);
      pop(s, SG, tSe, fin, xc(1) + 40, yTop - 40);
      const DS = N.group(g); color(DS, C.rosa);
      frase(DS, [['D.S.', 'currentColor']], xb - 30, yBot + 58, { size: 34, peso: 800, italic: true, anchor: 'end' });
      pop(s, DS, tSe + 0.3, fin, xb - 60, yBot + 46);
      const AR2 = N.group(g); color(AR2, C.rosa); arco(AR2, xb - 70, yBot + 80, xc(1) + 40, yBot + 80, -80, { w: 4 });
      mostrarEn(s, AR2, tSi, fin, .4);
      // Fine
      const tFi = Wd('R2', 'fine') - 0.3;
      const FI = N.group(g); color(FI, C.rosa);
      frase(FI, [['Fine', 'currentColor']], xc(3), yTop - 26, { size: 34, peso: 800, italic: true, anchor: 'middle' });
      N.glyph(FI, 'fermataAbove', xc(3) - 0.9 * SP, yTop - 70, SP);
      pop(s, FI, tFi, fin, xc(3), yTop - 40);
      // ad lib.
      const tAd = Wd('R3', 'libitum') - 0.4;
      const AD = N.group(g); color(AD, C.rosa);
      frase(AD, [['ad lib.', 'currentColor']], xc(0) + 10, yBot + 58, { size: 34, peso: 800, italic: true });
      pop(s, AD, tAd, fin, xc(0) + 60, yBot + 46);
      // leyenda
      const LEY = [
        ['D.C.', 'da capo', 'desde el principio', tDC, tPr],
        ['D.S.', 'dal segno', 'desde el signo', tSe, tSi],
        ['Fine', 'fine', 'el final', tFi, tFi + 0.5],
        ['ad lib.', 'ad libitum', 'con libertad', tAd, Wd('R3', 'libertad') - 0.3],
      ];
      LEY.forEach(([sg, it, es, t0, t1], i) => {
        const y = 668 + i * 72, G = N.group(g);
        texto(G, sg, 620, y, { anchor: 'end', size: 34, peso: 800, italic: true, fill: C.rosa });
        texto(G, it, 660, y, { size: 34, peso: 700, italic: true, fill: C.blanco });
        aparece(s, G, t0, fin, { dy: 6 });
        const E = N.group(g); texto(E, '= ' + es, 960, y, { size: 32, peso: 700, fill: C.suave });
        aparece(s, E, t1, fin, { dy: 6 });
      });
    });
  }

  // ================================================================ F · cierre: no hace falta memorizarlos todos; los importantes, en el kit
  function escenaCierre() {
    const a = F0('F1') - 0.2, b = T.acorde + 0.15;
    escena('cierre', a, b, (s, g) => {
      const fin = b - 0.3;
      const l1 = fraseG(g, [['no hace falta saberlos ', C.blanco], ['todos de memoria', C.suave]], CX, 250, { size: 42, peso: 800, anchor: 'middle' });
      aparece(s, l1, Wd('F1', 'falta') - 0.3, fin, { dy: 8 });
      const l2 = fraseG(g, [['ve a por ', C.blanco], ['los más raros, los nuevos', C.rosa]], CX, 350, { size: 42, peso: 800, anchor: 'middle' });
      aparece(s, l2, Wd('F1', 'extranos') - 0.4, fin, { dy: 8 });
      const IN = N.group(g); color(IN, C.suave); icoLira(IN, CX - 330, 470);
      const l3 = N.group(IN); frase(l3, [['muchos los descubrirás ', C.blanco], ['con tu instrumento', C.rosa]], CX - 250, 484, { size: 36, peso: 800 });
      aparece(s, IN, Wd('F1', 'instrumento') - 0.4, fin, { dy: 8 });
      const kA = tarjetaEnlace(g, CX, 680, { tipo: 'apuntes', titulo: 'Términos', temas: ['terminos'], nombre: 'Términos', centro: true });
      pop(s, kA, Wd('F2', 'kit') - 0.4, fin, CX, 680);
      const pr = fraseG(g, [['¡A practicarlos!', C.rosa]], CX, 850, { size: 52, peso: 800, anchor: 'middle' });
      aparece(s, pr, Wd('F2', 'practicarlos') - 0.3, fin, { dy: 8 });
    });
  }

  const ORDEN = [escenaHistoria, escenaTerminos, escenaDinamica, escenaGradua, escenaArticulacion, escenaCaracter, escenaConsejo, escenaRepeticion, escenaCierre];

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
