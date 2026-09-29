/* =====================================================================
   ESCENAS · Indica la armadura (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (indica-la-armadura/escenas_cuerpo.js). Todo es función pura de t.
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

  // ================================================================ E7 · INDICA LA ARMADURA (el camino de vuelta de «Indica la tonalidad»)
  const TITULO = { kicker: 'TEORÍA  ·  TONALIDADES', lineas: ['INDICA LA ARMADURA'], sub: 'Paso cero · Bemoles · Sostenidos' };

  // ---------------------------------------------------------------- utilidades de este vídeo
  const ORD_SOS = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'];
  const ORD_BEM = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'];
  const Y_ORD = 450, PASO_ORD = 150;                 // fila del orden de las alteraciones (centrada en CX)

  /** Línea de texto en la que ♭ y ♯ se dibujan con Bravura y «→» es una flecha dibujada.
   *  Pegada a una letra («Mi♭») la alteración va como en los nombres de nota; suelta («cuenta ♭», «¿♭», «3♭»)
   *  va de pie sobre la línea, del alto de una mayúscula. segs: 'texto' o [['trozo', color], …].
   *  Devuelve el grupo (con _w, _x y _alts = grupos de las alteraciones). */
  function frase(parent, segs, x, y, o) {
    o = o || {};
    const size = o.size || 36, peso = o.peso || 700, esp = size * 0.28;
    const G = N.group(parent, 'frase');
    if (typeof segs === 'string') segs = [[segs, o.fill || 'currentColor']];
    let cx = 0, prev = ''; const alts = [];
    for (const [str, col] of segs) {
      for (const tr of str.split(/([♭♯→])/)) {
        if (!tr) continue;
        if (tr === '♭' || tr === '♯') {
          const bem = tr === '♭', gl = bem ? 'accidentalFlat' : 'accidentalSharp';
          const pegada = /[A-Za-zÁÉÍÓÚáéíóúñÑ]$/.test(prev);
          const sa = pegada ? size * (o.kAlt || 0.36) : size * (bem ? 0.31 : 0.29);
          const yo = pegada ? -size * 0.33 : (bem ? -0.7 * sa : -size * 0.36);
          const x0 = cx + size * (pegada ? 0.03 : 0.02);
          const gg = N.group(G, 'alt'); if (col && col !== 'currentColor') color(gg, col);
          N.glyph(gg, gl, x0, yo, sa);
          gg._cx = x0 + N.M[gl].adv * sa / 2; gg._cy = yo - sa * (bem ? 0.5 : 0);
          alts.push(gg);
          cx = x0 + N.M[gl].adv * sa + size * (pegada ? 0.08 : 0.04);
        } else if (tr === '→') {
          const gg = N.group(G, 'flechita'); if (col && col !== 'currentColor') color(gg, col);
          flecha(gg, cx + size * 0.1, -size * 0.34, cx + size * 1.0, -size * 0.34, { w: size * 0.085, cab: size * 0.34 });
          cx += size * 1.1;
        } else {
          if (/^\s/.test(tr)) cx += esp;
          const core = tr.trim();
          if (core) { const t = texto(G, core, cx, 0, { size, peso, fill: col || 'currentColor', italic: o.italic, ls: o.ls }); cx += D.medir(t); }
          if (core && /\s$/.test(tr)) cx += esp;
        }
        prev = tr;
      }
    }
    const ax = o.anchor === 'middle' ? x - cx / 2 : (o.anchor === 'end' ? x - cx : x);
    G.setAttribute('transform', `translate(${ax.toFixed(1)},${y})`);
    G._w = cx; G._x = ax; G._alts = alts;
    return G;
  }
  /** Color por tramos: seq = [[t, '#hex'], …] (cada cambio dura d segundos). */
  function colorSeq(s, g, seq, d) {
    d = d || 0.3;
    s.on(t => {
      let c = seq[0][1];
      for (let i = 1; i < seq.length; i++) {
        if (t < seq[i][0]) break;
        c = mezcla(seq[i - 1][1], seq[i][1], ease(ramp(t, seq[i][0], seq[i][0] + d)));
      }
      color(g, c);
    });
  }
  /** Cortinilla horizontal que revela un grupo (dir 1: de izquierda a derecha; -1: de derecha a izquierda). */
  let nClip = 0;
  function barrido(s, g, x0, x1, y0, y1, ta, dur, dir) {
    const id = 'clipArm' + (nClip++);
    const defs = N.el('defs', null, g.parentNode);
    const cp = N.el('clipPath', { id, clipPathUnits: 'userSpaceOnUse' }, defs);
    const r = N.el('rect', { x: x0, y: y0, width: 0, height: y1 - y0 }, cp);
    g.setAttribute('clip-path', `url(#${id})`);
    s.on(t => {
      const w = (x1 - x0) * ease(ramp(t, ta, ta + dur));
      r.setAttribute('width', w.toFixed(1)); r.setAttribute('x', (dir < 0 ? x1 - w : x0).toFixed(1));
    });
  }
  /** Enlace discontinuo con punta: recta, o curva cúbica con puntos de control o.c1 y o.c2 ([x, y]). */
  function enlace(parent, x1, y1, x2, y2, o) {
    o = o || {};
    const G = N.group(parent, 'enlace');
    const c1 = o.c1 || [x1, y1], c2 = o.c2 || [x2, y2];
    N.el('path', { d: `M${x1},${y1} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${x2},${y2}`, fill: 'none', stroke: 'currentColor', 'stroke-width': o.w || 3.5, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash || '2 10' }, G);
    let dx = x2 - c2[0], dy = y2 - c2[1]; if (Math.hypot(dx, dy) < 1) { dx = x2 - x1; dy = y2 - y1; }
    const ang = Math.atan2(dy, dx), cab = o.cab || 14;
    const p = k => `${(x2 - Math.cos(ang + k) * cab).toFixed(1)},${(y2 - Math.sin(ang + k) * cab).toFixed(1)}`;
    N.el('polygon', { points: `${x2},${y2} ${p(0.45)} ${p(-0.45)}`, fill: 'currentColor' }, G);
    return G;
  }
  /** Flecha curva con el punto de control elegido (para llegar a una nota desde arriba sin tocar su alteración). */
  function arcoQ(parent, x1, y1, qx, qy, x2, y2, o) {
    o = o || {};
    const G = N.group(parent, 'arco');
    N.el('path', { d: `M${x1},${y1} Q${qx},${qy} ${x2},${y2}`, fill: 'none', stroke: 'currentColor', 'stroke-width': o.w || 4, 'stroke-linecap': 'round' }, G);
    const ang = Math.atan2(y2 - qy, x2 - qx), cab = o.cab || 14;
    const p = k => `${(x2 - Math.cos(ang + k) * cab).toFixed(1)},${(y2 - Math.sin(ang + k) * cab).toFixed(1)}`;
    N.el('polygon', { points: `${x2},${y2} ${p(0.45)} ${p(-0.45)}`, fill: 'currentColor' }, G);
    return G;
  }
  /** «3ªm ↑»: chip del intervalo con una flechita hacia arriba (sube una tercera menor). */
  function sube3m(parent, x, y, size) {
    const G = N.group(parent, 'sube3m');
    const c = chipInt(G, '3ªm', x - 16, y, { size: size || 28 });
    const f = N.group(G); color(f, C.rosa);
    const xf = x - 16 + c._w / 2 + 22;
    flecha(f, xf, y + 19, xf, y - 21, { w: 4, cab: 13 });
    return G;
  }
  /** Fila con el orden de los sostenidos o de los bemoles (en gris; se encienden al contarlos). */
  function ordenFila(parent, tipo, xc, y) {
    const L = tipo === 'b' ? ORD_BEM : ORD_SOS;
    return L.map((n, i) => {
      const w = N.group(parent), inn = N.group(w);
      const x = xc + (i - 3) * PASO_ORD;
      const nm = nombreNota(inn, n, x, y, { size: 36, anchor: 'middle', fill: 'currentColor' });
      color(inn, C.suave);
      return { w, inn, x, y, n, ancho: nm._w };
    });
  }
  /** Contar en la fila: ts[i] = instante de cada nombre contado. o: {obj (recuadro: «hasta llegar a…»),
   *  extra (el regalo, en rosa), tVuelta (el objetivo vuelve a blanco), tStop (barra «me paro» y se atenúa el resto)}. */
  function cuentaOrden(s, parent, items, ts, o) {
    o = o || {};
    const n = ts.length;
    items.forEach((it, i) => {
      if (i < n) {
        const t0 = ts[i] - 0.05, rosa = i === o.obj || i === o.extra;
        const seq = [[-1, C.suave], [t0, rosa ? C.rosa : C.blanco]];
        if (i === o.obj && o.tVuelta != null) seq.push([o.tVuelta, C.blanco]);
        colorSeq(s, it.inn, seq, 0.25);
        if (i === o.obj) {
          const bx = N.el('rect', { x: it.x - it.ancho / 2 - 14, y: it.y - 44, width: it.ancho + 28, height: 62, rx: 10, fill: 'none', stroke: 'currentColor', 'stroke-width': 3 }, it.inn);
          mostrarEn(s, bx, t0 + 0.1, 1e9, .25, .3);
        }
      } else if (o.tStop != null) s.on(t => opa(it.w, 1 - 0.75 * ease(ramp(t, o.tStop, o.tStop + 0.45))));
    });
    cuenta(s, parent, ts.map((_, i) => ({ x: items[i].x, y: items[i].y - 60 })), ts.map(t => t - 0.05), 1e9, { size: 28 });
    if (o.tStop != null && n < items.length) {
      const xb = (items[n - 1].x + items[n].x) / 2;
      const bar = N.line(parent, xb, items[0].y - 50, xb, items[0].y + 22, 5, { 'stroke-linecap': 'round', stroke: C.rosa });
      mostrarEn(s, bar, o.tStop, 1e9, .25, .3);
    }
  }
  /** Armadura resultante en grande («3♭», «4♯»…). */
  function resultado(s, parent, txt, x, y, ta, tb) {
    const w = N.group(parent);
    frase(w, [[txt, C.rosa]], x, y, { size: 76, peso: 800, anchor: 'middle' });
    pop(s, w, ta, tb, x, y - 26, { k0: .6 });
    return w;
  }
  /** frase() dentro de un grupo propio (para poder animarla con aparece/pop sin perder su posición). */
  function fraseG(parent, segs, x, y, o) { const w = N.group(parent); w._f = frase(w, segs, x, y, o); return w; }
  /** Pentagrama con armadura cuyas alteraciones aparecen en los instantes ts (una a una). */
  function armaduraEn(s, parent, x, yM, ancho, n, tipo, ts, tb) {
    const P = pentaClave(parent, x, yM, ancho);
    const A = N.armaduraGen(parent, P.x0 + 4, yM, SP, n, tipo);
    A.items.forEach((it, i) => pop(s, it.g, ts[i], tb, it.x + 12, yM - it.pos * SP, { fi: .25, k0: .5 }));
    return { P, A };
  }

  // ================================================================ I · ida (armadura → tonalidad) y vuelta (tonalidad → armadura)
  function escenaIdaVuelta() {
    const a = F0('I1') - 0.2, b = F0('P0') + 0.2;
    escena('idaVuelta', a, b, (s, g) => {
      const fin = b - 0.3;
      const tInd = Wd('I1', 'indica') - 0.2, tIda = Wd('I1', 'camino') - 0.1;
      const tArm = Wd('I2', 'armadura') - 0.2, tTon = Wd('I2', 'tonalidad') - 0.15;
      const tVue = Wd('I2', 'vuelta') - 0.2, tDoy = Wd('I2', 'tonalidad', 2) - 0.15, tSu = Wd('I2', 'armadura', 2) - 0.3;
      const tDic = Wd('I3', 'dictado') - 0.2, tSab = Wd('I4', 'sabes') - 0.15, tPon = Wd('I4', 'poner') - 0.15;
      // de qué vídeo venimos… y en cuál estamos
      const video = (G, c) => N.el('polygon', { points: `${c._x - 34},${230 - 12} ${c._x - 34},${230 + 12} ${c._x - 13},230`, fill: C.rosa }, G);   // ▶ = un vídeo
      // (29-sep, Iago) con la tarjeta de enlace de siempre: la del otro vídeo se pulsa (lo abre en una pestaña nueva);
      // la de este vídeo es igual pero sin ↗ ni clic
      const k1 = tarjetaEnlace(g, CX, 230, { tipo: 'video', titulo: 'Indica la tonalidad', slug: 'indica-la-tonalidad', centro: true });
      pop(s, k1, tInd, tVue + 0.15, CX, 230);
      const k2 = tarjetaEnlace(g, CX, 230, { tipo: 'video', rotulo: 'ESTE VÍDEO', titulo: 'Indica la armadura', enlace: false, centro: true, w: k1._w });
      pop(s, k2, tVue + 0.05, fin, CX, 230);
      // la armadura de Mi M (4♯) ⇄ la tonalidad
      const yM = 570, xP = 330, xA = xP + 3.9 * SP + 4;
      const PA = N.group(g);
      pentaClave(PA, xP, yM, 560);
      const A = N.armaduraGen(PA, xA, yM, SP, 4, '#');
      aparece(s, PA, tArm, fin, { dy: 0 });
      s.on(t => opa(A.g, 1 - ease(ramp(t, tSu, tSu + 0.4))));            // «tú me dices su armadura»: se vacía…
      const qG = N.group(g); texto(qG, '?', xA + 50, yM + 44, { anchor: 'middle', size: 124, peso: 800, fill: C.rosa });
      pop(s, qG, tSu + 0.25, fin, xA + 50, yM, { k0: .5 });                 // …y queda la pregunta
      const xC = 1440;
      const cN = chipTon(g, 'E', 'mayor', xC, yM, { size: 46, fondo: C.panel, borde: C.blanco });
      pop(s, cN, tTon, tDoy + 0.25, xC, yM);
      const cR = chipTon(g, 'E', 'mayor', xC, yM, { size: 46 });
      pop(s, cR, tDoy, fin, xC, yM, { k0: .7 });
      const xa = 950, xb = 1300;
      const IDA = N.group(g); color(IDA, C.blanco);
      const IDAf = N.group(IDA); flecha(IDAf, xa, yM - 50, xb, yM - 50, { w: 5, cab: 18 });
      texto(IDA, 'IDA', (xa + xb) / 2, yM - 78, { anchor: 'middle', size: 28, peso: 800, ls: '0.2em', fill: 'currentColor' });
      barrido(s, IDAf, xa - 10, xb + 10, yM - 80, yM - 20, tIda, 0.7, 1);
      s.on(t => opa(IDA, win(t, tIda, fin, .3, .4) * (1 - 0.65 * ease(ramp(t, tVue, tVue + 0.4))) * (1 - ease(ramp(t, tDic, tDic + 0.4)))));
      const VUE = N.group(g); color(VUE, C.rosa);
      const VUEf = N.group(VUE); flecha(VUEf, xb, yM + 60, xa, yM + 60, { w: 5, cab: 18 });
      texto(VUE, 'VUELTA', (xa + xb) / 2, yM + 114, { anchor: 'middle', size: 28, peso: 800, ls: '0.2em', fill: 'currentColor' });
      barrido(s, VUEf, xa - 10, xb + 10, yM + 30, yM + 90, tVue, 0.7, -1);
      mostrarEn(s, VUE, tVue, fin, .3, .4);
      // en un dictado: la tonalidad la deduces (oído) y escribes la armadura (lápiz)
      const dic = N.group(g); chip(dic, 'DICTADO', CX, 395, { size: 26, anchor: 'middle', relleno: false });
      pop(s, dic, tDic, fin, CX, 395);
      const oi = N.group(g); icoOido(oi, xC, 400, 1.35); color(oi, C.blanco);
      pop(s, oi, tSab, fin, xC, 400);
      const la = N.group(g); icoLapiz(la, xA + 56, 398, 1.3); color(la, C.rosa);
      pop(s, la, tPon, fin, xA + 56, 398);
    });
  }

  // ================================================================ P · paso cero: la tonalidad Mayor es la referencia
  function escenaPasoCero() {
    const a = F0('P0') - 0.1, b = F0('Q1') + 0.2;
    escena('pasoCero', a, b, (s, g) => {
      const fin = b - 0.3;
      const R = regla(g, 330, 140, 1260, 130, 'PASO CERO');
      aparece(s, R, F0('P0') - 0.1, fin, { dy: 10 });
      const r1 = frase(R, 'la tonalidad Mayor', 360, 244, { size: 40, peso: 800, fill: C.blanco });
      mostrarEn(s, r1, Wd('P1', 'tonalidad') - 0.2, 1e9);
      const r2 = frase(R, '= la referencia', 360 + r1._w + 26, 244, { size: 40, peso: 800, fill: C.rosa });
      mostrarEn(s, r2, Wd('P1', 'referencia') - 0.2, 1e9);
      // menor → (3ªm ↑) → relativo Mayor · ejemplo: Do m → Mi♭ M (en el pentagrama: Do → Mi♭)
      const yR = 660, xL = 700, xR = 1220;
      const tMen = Wd('P1', 'menor') - 0.15, tPasa = Wd('P1', 'pasa') - 0.1, tRel = Wd('P1', 'relativo') - 0.1, tTer = Wd('P1', 'tercera') - 0.15;
      const tEj = F0('P2') - 0.05, tDo = Wd('P2', 'do') - 0.1, tRel3 = Wd('P3', 'relativo') - 0.1, tMib = Wd('P3', 'mi') - 0.1;
      const tP4 = F0('P4') - 0.1, tMiM = Wd('P4', 'mi') - 0.1, tNada = Wd('P4', 'nada') - 0.4;
      const F1g = N.group(g);                                          // fila 1 + pentagrama (se atenúa en P4)
      s.on(t => opa(F1g, 1 - 0.7 * ease(ramp(t, tP4, tP4 + 0.45))));
      const gm = N.group(F1g); chip(gm, 'menor', xL, yR, { size: 30, anchor: 'middle', relleno: false, borde: C.suave, colorTexto: C.blanco, ls: '0.04em' });
      pop(s, gm, tMen, tDo + 0.2, xL, yR);
      const fl = N.group(F1g); color(fl, C.rosa);
      const flf = N.group(fl); flecha(flf, xL + 100, yR, xR - 150, yR, { w: 5, cab: 18 });
      barrido(s, flf, xL + 90, xR - 140, yR - 20, yR + 20, tPasa, 0.6, 1);
      mostrarEn(s, fl, tPasa, fin);
      const gM = N.group(F1g); chip(gM, 'relativo Mayor', xR, yR, { size: 30, anchor: 'middle', relleno: false, ls: '0.04em' });
      pop(s, gM, tRel, tMib + 0.2, xR, yR);
      const s3 = sube3m(F1g, (xL + xR) / 2 - 25, yR - 58, 28);
      pop(s, s3, tTer, fin, (xL + xR) / 2 - 25, yR - 58);
      const cDo = chipTon(F1g, 'C', 'menor', xL, yR, { size: 36, fondo: C.panel, borde: C.blanco });
      pop(s, cDo, tDo, fin, xL, yR);
      const cMib = chipTon(F1g, 'Eb', 'mayor', xR, yR, { size: 36 });
      pop(s, cMib, tMib, fin, xR, yR);
      const yM = 450;
      const PE = N.group(F1g); pentaClave(PE, 460, yM, 1000);
      aparece(s, PE, tEj, fin, { dy: 0 });
      const nDo = N.group(F1g); nota(nDo, 'C5', xL - 22, yM);
      pop(s, nDo, tDo, fin, xL, yNota('C5', yM), { k0: .6 });
      const nMib = N.group(F1g); nota(nMib, 'Eb5', xR - 22, yM); color(nMib, C.rosa);
      pop(s, nMib, tMib, fin, xR, yNota('Eb5', yM), { k0: .6 });
      const ar = N.group(F1g); color(ar, C.rosa);
      const arf = N.group(ar); arcoQ(arf, xL + 6, yNota('C5', yM) - 30, xR - 60, yNota('Eb5', yM) - 150, xR + 8, yNota('Eb5', yM) - 24, { w: 4 });
      barrido(s, arf, xL, xR + 40, yM - 160, yM, tRel3, 0.8, 1);
      mostrarEn(s, ar, tRel3, fin);
      // y si ya es Mayor: nada que hacer (Mi M → Mi M)
      const yR2 = 830;
      const cMi = chipTon(g, 'E', 'mayor', xL, yR2, { size: 36, fondo: C.panel, borde: C.blanco });
      pop(s, cMi, tMiM, fin, xL, yR2);
      const fl2 = N.group(g); color(fl2, C.suave); flecha(fl2, xL + 100, yR2, xR - 100, yR2, { w: 5, cab: 18 });
      mostrarEn(s, fl2, tNada, fin);
      const nada = texto(g, 'nada que hacer', (xL + xR) / 2, yR2 - 26, { anchor: 'middle', size: 30, peso: 600, italic: true, fill: C.blanco });
      aparece(s, nada, tNada, fin, { dy: 6 });
      const cMi2 = chipTon(g, 'E', 'mayor', xR, yR2, { size: 36 });
      pop(s, cMi2, tNada + 0.2, fin, xR, yR2);
    });
  }

  // ================================================================ Q · la gran pregunta: ¿♭ en el nombre? (se queda de cabecera: SÍ / NO)
  function escenaPregunta() {
    const a = F0('Q1') - 0.1, b = F0('X1') + 0.2;
    escena('pregunta', a, b, (s, g) => {
      const fin = b - 0.3;
      const tGran = Wd('Q1', 'gran') - 0.2, tQ = F0('Q2') - 0.1, tBem = Wd('Q2', 'bemol') - 0.1, tSpo = Wd('Q2', 'spoiler') - 0.15;
      const tSube = F0('B1') - 0.35;                                  // el cartel sube y queda como cabecera
      const kg = N.group(g); chip(kg, 'LA GRAN PREGUNTA', CX, 330, { size: 26, anchor: 'middle', relleno: false });
      pop(s, kg, tGran, tSube + 0.3, CX, 330);
      // cabecera (detrás de la pregunta): dos columnas, SÍ / NO
      const card = N.group(g);
      panel(card, 230, 140, 1460, 205, { rx: 22 });
      N.line(card, CX, 240, CX, 328, 2, { stroke: 'rgba(255,255,255,0.18)' });
      mostrarEn(s, card, tSube + 0.3, fin, .5, .4);
      const pg = N.group(g); panel(pg, CX - 470, 420, 940, 210, { rx: 26, stroke: C.rosa, sw: 2.5 });
      mostrarEn(s, pg, tQ, tSube + 0.45, .4, .45);
      // la pregunta
      const Qm = N.group(g);
      const fq = frase(Qm, [['¿', C.blanco], ['♭', C.rosa], [' en el nombre?', C.blanco]], 0, 0, { size: 84, peso: 800, anchor: 'middle' });
      const bq = fq._alts[0];
      pop(s, bq, tBem, 1e9, bq._cx, bq._cy, { k0: .3, fi: .3 });
      s.on(t => {
        const k = ease(ramp(t, tSube, tSube + 0.8));
        Qm.setAttribute('transform', `translate(${CX},${lerp(556, 210, k).toFixed(1)}) scale(${lerp(1, 0.5, k).toFixed(4)})`);
        opa(Qm, win(t, tQ, fin, .4, .4));
      });
      // «sería un gran spoiler»: sello
      const st = N.group(g), stIn = N.group(st);
      chip(stIn, '¡SPOILER!', 0, 0, { size: 30, anchor: 'middle', relleno: false });
      stIn.setAttribute('transform', 'translate(1360,428) rotate(-8)');
      pop(s, st, tSpo, tSube + 0.3, 1360, 428, { k0: 1.5, fi: .25 });
      // SÍ → bemoles · NO → sostenidos
      const tSi = Wd('B1', 'bemol') - 0.2, tTb = Wd('B1', 'tiene', 2) - 0.15, tCu = Wd('B2', 'contamos') - 0.15, tEx = Wd('B2', 'damos') - 0.1;
      const tNo = Wd('S1', 'no') - 0.1, tTs = Wd('S1', 'sostenidos') - 0.2, tCs = Wd('S2', 'contamos') - 0.15;
      const SI = N.group(g);
      s.on(t => opa(SI, 1 - 0.65 * ease(ramp(t, tNo, tNo + 0.4))));
      const cSi = N.group(SI); chip(cSi, 'SÍ', 300, 263, { size: 26, anchor: 'start' });
      pop(s, cSi, tSi, fin, 330, 263);
      const s1 = frase(SI, 'tiene bemoles', 395, 275, { size: 34, peso: 800, fill: C.blanco });
      mostrarEn(s, s1, tTb, fin);
      const s2 = frase(SI, 'cuenta hasta ella', 300, 325, { size: 32, peso: 700, fill: C.blanco });
      mostrarEn(s, s2, tCu, fin);
      const s3 = frase(SI, '+ 1 extra', 300 + s2._w + 14, 325, { size: 32, peso: 800, fill: C.rosa });
      mostrarEn(s, s3, tEx, fin);
      const NO = N.group(g);
      const cNo = N.group(NO); chip(cNo, 'NO', 1030, 263, { size: 26, anchor: 'start' });
      pop(s, cNo, tNo, fin, 1060, 263);
      const n1 = frase(NO, 'tiene sostenidos', 1128, 275, { size: 34, peso: 800, fill: C.blanco });
      mostrarEn(s, n1, tTs, fin);
      const n2 = frase(NO, [['cuenta hasta ', C.blanco], ['la sensible', C.rosa]], 1030, 325, { size: 32, peso: 700 });
      mostrarEn(s, n2, tCs, fin);
    });
  }

  // ================================================================ B · con ♭ en el nombre: contar bemoles hasta ella… y una extra
  function escenaBemoles() {
    const a = F0('B1') - 0.1, b = F0('S1') + 0.2;
    escena('bemoles', a, b, (s, g) => {
      const fin = b - 0.3;
      const O = N.group(g); aparece(s, O, Wd('B2', 'orden') - 0.15, fin, { dy: 8 });
      const items = ordenFila(O, 'b', CX, Y_ORD);
      const tN = [Wd('B4', 'si') - 0.1, Wd('B4', 'mi') - 0.1, Wd('B4', 'la') - 0.1];
      cuentaOrden(s, O, items, tN, { obj: 1, extra: 2, tVuelta: tN[2], tStop: tN[2] + 0.5 });
      const ex = texto(O, '+1 extra', items[2].x, Y_ORD + 62, { anchor: 'middle', size: 28, peso: 800, fill: C.rosa });
      aparece(s, ex, tN[2] + 0.1, 1e9, { dy: 6 });
      // Mi♭ M: su armadura se va escribiendo
      const yM = 700, tMib = Wd('B3', 'mi') - 0.1;
      const cMib = chipTon(g, 'Eb', 'mayor', 330, yM, { size: 40 });
      pop(s, cMib, tMib, fin, 330, yM, { k0: .6 });
      const en = N.group(g); color(en, C.rosa); enlace(en, 330, yM - 46, items[1].x, Y_ORD + 26, { c1: [330, 540], c2: [items[1].x, 560] });
      mostrarEn(s, en, tN[1] + 0.15, fin);
      const PE = N.group(g);
      aparece(s, PE, tMib + 0.15, fin, { dy: 0 });
      const { A } = armaduraEn(s, PE, 520, yM, 520, 3, 'b', tN, 1e9);
      color(A.items[2].g, C.rosa);
      resultado(s, g, '3♭', 1250, yM + 26, Wd('B5', 'tres') - 0.15, fin);
    });
  }

  // ================================================================ S · sin ♭ en el nombre: contar sostenidos hasta la sensible
  function escenaSostenidos() {
    const a = F0('S1') - 0.1, b = F0('X1') + 0.2;
    escena('sostenidos', a, b, (s, g) => {
      const fin = b - 0.3;
      const O = N.group(g); aparece(s, O, Wd('S2', 'orden') - 0.15, fin, { dy: 8 });
      const items = ordenFila(O, '#', CX, Y_ORD);
      // S3 · la sensible: séptimo grado, justo debajo de la tónica, a medio tono
      const tS3 = F0('S3') - 0.15, tSep = Wd('S3', 'septimo') - 0.15, tTon = Wd('S3', 'tonica') - 0.25, tMed = Wd('S3', 'medio') - 0.2;
      const tFuera = F0('S4') - 0.25;
      const ES = N.group(g); aparece(s, ES, tS3, tFuera, { dy: 10, fo: .45 });
      const OFF = [0, 2, 4, 5, 7, 9, 11, 12], ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'I'];
      const pt = OFF.map(o => ({ x: 560 + o * 70, y: 820 - o * 16 }));
      N.el('path', { d: 'M' + pt.map(p => `${p.x},${p.y}`).join(' L'), fill: 'none', stroke: C.tenue, 'stroke-width': 3 }, ES);
      pt.forEach((p, i) => {
        const G = N.group(ES);
        N.el('circle', { cx: p.x, cy: p.y, r: 15, fill: 'currentColor' }, G);
        texto(G, ROM[i], p.x, p.y + 54, { anchor: 'middle', size: 32, peso: 800, fill: 'currentColor' });
        if (i === 6) colorSeq(s, G, [[-1, C.suave], [tSep, C.rosa]], .3);
        else if (i === 7) colorSeq(s, G, [[-1, C.suave], [tTon, C.blanco]], .3);
        else color(G, C.suave);
      });
      const lS = texto(ES, 'sensible', pt[6].x, pt[6].y + 100, { anchor: 'middle', size: 34, peso: 800, fill: C.rosa });
      aparece(s, lS, tSep + 0.1, 1e9, { dy: 6 });
      const lT = texto(ES, 'tónica', pt[7].x + 30, pt[7].y + 12, { size: 34, peso: 800, fill: C.blanco });
      aparece(s, lT, tTon + 0.1, 1e9, { dy: 6 });
      const med = N.group(ES); color(med, C.rosa);
      N.el('path', { d: `M${pt[6].x},${pt[6].y - 24} Q${(pt[6].x + pt[7].x) / 2},${pt[7].y - 58} ${pt[7].x},${pt[7].y - 24}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, med);
      texto(med, '½', (pt[6].x + pt[7].x) / 2, pt[7].y - 64, { anchor: 'middle', size: 36, peso: 800, fill: 'currentColor' });
      mostrarEn(s, med, tMed, 1e9, .3);
      // S4 · en Mi M, la sensible es Re♯ (suena Re♯ → Mi)
      const yM = 700, tMi = Wd('S4', 'mi') - 0.1, tRe = Wd('S4', 're') - 0.1;
      const cMi = chipTon(g, 'E', 'mayor', 330, yM, { size: 40 });
      pop(s, cMi, tMi, fin, 330, yM, { k0: .6 });
      const PE = N.group(g);
      aparece(s, PE, tMi + 0.1, fin, { dy: 0 });
      const tF = [Wd('S6', 'fa') - 0.1, Wd('S6', 'do') - 0.1, Wd('S6', 'sol') - 0.1, Wd('S6', 're') - 0.1];
      const { A } = armaduraEn(s, PE, 520, yM, 760, 4, '#', tF, 1e9);
      color(A.items[3].g, C.rosa);
      const xRe = items[3].x, xMi = xRe + 230;
      const son = S.SON_SENS || [F0('SON_SENS') + 0.1, F0('SON_SENS') + 0.9];
      const nMi = N.group(PE), nMiC = N.group(nMi); nota(nMiC, 'E5', xMi - 22, yM);
      pop(s, nMi, tMi + 0.2, fin, xMi, yNota('E5', yM), { k0: .6 });
      destella(s, nMiC, [son[1]]);
      const nRe = N.group(PE), nReC = N.group(nRe); nota(nReC, 'D#5', xRe - 22, yM);
      pop(s, nRe, tRe, fin, xRe, yNota('D#5', yM), { k0: .6 });
      destella(s, nReC, [son[0]], { de: C.rosa, a: C.blanco });
      const lT2 = texto(PE, 'tónica', xMi, yM - 100, { anchor: 'middle', size: 28, peso: 800, fill: C.blanco });
      mostrarEn(s, lT2, tMi + 0.3, 1e9);
      const nmMi = N.group(PE); nombreNota(nmMi, 'E', xMi, yM + 118, { size: 30, anchor: 'middle', fill: C.blanco });
      mostrarEn(s, nmMi, tMi + 0.3, 1e9);
      const lS2 = texto(PE, 'sensible', xRe, yM - 100, { anchor: 'middle', size: 28, peso: 800, fill: C.rosa });
      mostrarEn(s, lS2, tRe + 0.1, 1e9);
      const nmRe = N.group(PE); nombreNota(nmRe, 'D#', xRe, yM + 118, { size: 30, anchor: 'middle', fill: C.rosa });
      mostrarEn(s, nmRe, tRe + 0.1, 1e9);
      const md = N.group(PE); color(md, C.rosa);
      arco(md, xRe + 24, yNota('D#5', yM) - 24, xMi - 26, yNota('E5', yM) - 22, 26, { w: 3.5, cab: 11 });
      texto(md, '½', (xRe + xMi) / 2, yM - 104, { anchor: 'middle', size: 30, peso: 800, fill: 'currentColor' });
      mostrarEn(s, md, tRe + 0.4, 1e9);
      // S5–S7 · contamos hasta la sensible: Fa, Do, Sol, Re → 4♯
      cuentaOrden(s, O, items, tF, { obj: 3, tStop: tF[3] + 0.5 });
      const en = N.group(g); color(en, C.rosa); enlace(en, xRe, yM - 138, xRe, Y_ORD + 26);
      mostrarEn(s, en, tF[3] + 0.15, fin);
      resultado(s, g, '4♯', 1450, yM + 26, Wd('S7', 'cuatro') - 0.15, fin);
    });
  }

  // ================================================================ X · dos excepciones de memoria: Do M y Fa M
  function escenaExcepciones() {
    const a = F0('X1') - 0.1, b = F0('R0') + 0.2;
    escena('excepciones', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'DOS EXCEPCIONES', CX, 195, { size: 28, anchor: 'middle', relleno: false });
      pop(s, k, Wd('X1', 'dos') - 0.15, fin, CX, 195);
      const m = N.group(g); chip(m, '¡DE MEMORIA!', CX, 280, { size: 30, anchor: 'middle' });
      pop(s, m, Wd('X1', 'memoria') - 0.2, fin, CX, 280, { k0: .6 });
      const tDo = Wd('X1', 'do', 2) - 0.15, tNoA = Wd('X1', 'armadura') - 0.3;
      const tFa = Wd('X2', 'fa') - 0.15, tSinB = Wd('X2', 'aunque') - 0.1, tUn = Wd('X2', 'tiene', 2) - 0.1;
      [{ x: 330, ton: 'C', t: tDo }, { x: 1010, ton: 'F', t: tFa }].forEach((K, i) => {
        const G = N.group(g), Gi = N.group(G);
        aparece(s, G, K.t, fin, { dy: 14 });
        if (i === 0) s.on(t => opa(Gi, 1 - 0.6 * ease(ramp(t, tFa, tFa + 0.4))));
        panel(Gi, K.x, 360, 580, 500, { rx: 24 });
        chipTon(Gi, K.ton, 'mayor', K.x + 290, 440, { size: 40 });
        const yM = 620;
        const P = pentaClave(Gi, K.x + 70, yM, 440);
        if (i === 0) {
          const t1 = texto(Gi, 'sin armadura', K.x + 290, 790, { anchor: 'middle', size: 32, peso: 600, italic: true, fill: C.suave });
          aparece(s, t1, tNoA, 1e9, { dy: 6 });
        } else {
          const A = N.armaduraGen(Gi, P.x0 + 4, yM, SP, 1, 'b'); color(A.g, C.rosa);
          pop(s, A.items[0].g, tUn, 1e9, A.items[0].x + 12, yM, { k0: .4 });
          const t1 = fraseG(Gi, 'sin ♭ en el nombre…', K.x + 290, 770, { size: 30, peso: 600, italic: true, fill: C.suave, anchor: 'middle' });
          aparece(s, t1, tSinB, 1e9, { dy: 6 });
          const t2 = fraseG(Gi, '¡pero tiene un ♭!', K.x + 290, 825, { size: 34, peso: 800, fill: C.rosa, anchor: 'middle' });
          aparece(s, t2, tUn, 1e9, { dy: 6 });
        }
      });
    });
  }

  // ================================================================ R · último ejemplo: Si m → Re M → sin ♭ → sensible Do♯ → Fa, Do → 2♯
  function escenaUltimo() {
    const a = F0('R0') - 0.1, b = F0('F1') + 0.2;
    escena('ultimo', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'ÚLTIMO EJEMPLO', CX, 145, { size: 26, anchor: 'middle', relleno: false });
      pop(s, k, Wd('R0', 'ultimo') - 0.15, fin, CX, 145);
      // paso cero: Si m → 3ªm ↑ → Re M
      const yA = 285, xSi = 330, xRe = 780;
      const tSi = Wd('R1', 'si') - 0.1, tSub = Wd('R1', 'subir') - 0.1, tSubo = Wd('R1', 'subo') - 0.1, tDa = Wd('R1', 'da') - 0.15, tReM = Wd('R2', 're') - 0.1;
      const cSi = chipTon(g, 'B', 'menor', xSi, yA, { size: 36, fondo: C.panel, borde: C.blanco });
      pop(s, cSi, tSi, fin, xSi, yA);
      const fl = N.group(g); color(fl, C.rosa);
      const flf = N.group(fl); flecha(flf, xSi + 88, yA, xRe - 90, yA, { w: 5, cab: 18 });
      barrido(s, flf, xSi + 80, xRe - 80, yA - 20, yA + 20, tSub, 0.6, 1);
      mostrarEn(s, fl, tSub, fin);
      const s3 = sube3m(g, (xSi + xRe) / 2 - 10, yA - 58, 26);
      pop(s, s3, tSubo, fin, (xSi + xRe) / 2 - 10, yA - 58);
      const cRe = chipTon(g, 'D', 'mayor', xRe, yA, { size: 36 });
      pop(s, cRe, tReM, fin, xRe, yA);
      // la pregunta: ¿♭ en el nombre? NO → sostenidos
      const tQ = Wd('R3', 'tiene') - 0.15, tNo = Wd('R3', 'no', 2) - 0.1, tSos = Wd('R3', 'sostenidos') - 0.2;
      const xQ = 990;
      const qW = fraseG(g, [['¿', C.blanco], ['♭', C.rosa], [' en el nombre?', C.blanco]], xQ, yA + 12, { size: 36, peso: 800 });
      aparece(s, qW, tQ, fin, { dy: 6 });
      const xNo = xQ + qW._f._w + 24;
      const cNo = N.group(g); chip(cNo, 'NO', xNo, yA, { size: 26, anchor: 'start' });
      pop(s, cNo, tNo, fin, xNo + 38, yA);
      const so = N.group(g);
      const fS = N.group(so); color(fS, C.rosa); flecha(fS, xNo + 96, yA, xNo + 150, yA, { w: 4, cab: 14 });
      frase(so, 'sostenidos', xNo + 164, yA + 12, { size: 34, peso: 800, fill: C.rosa });
      aparece(s, so, tSos, fin, { dy: 6 });
      // pentagrama: Si → Re (3ªm), luego la sensible Do♯ y la armadura
      const yM = 700;
      const PE = N.group(g);
      aparece(s, PE, tSi + 0.1, fin, { dy: 0 });
      const tF = [Wd('R5', 'fa') - 0.1, Wd('R5', 'do') - 0.1];
      const { A } = armaduraEn(s, PE, 480, yM, 900, 2, '#', tF, 1e9);
      color(A.items[1].g, C.rosa);
      const xB = 900, xC5 = 1080, xD = 1230;
      const tSens = Wd('R4', 'sensible') - 0.1, tDo = Wd('R4', 'do') - 0.1;
      const viejo = N.group(PE);                                     // el Si y su 3ªm se apagan al buscar la sensible
      s.on(t => opa(viejo, 1 - 0.75 * ease(ramp(t, tSens, tSens + 0.5))));
      const nB = N.group(viejo); nota(nB, 'B4', xB - 22, yM);
      pop(s, nB, tSi + 0.1, 1e9, xB, yNota('B4', yM), { k0: .6 });
      const nmB = N.group(viejo); nombreNota(nmB, 'B', xB, yM + 118, { size: 30, anchor: 'middle', fill: C.blanco });
      mostrarEn(s, nmB, tSi + 0.3, 1e9);
      const a3 = N.group(g); color(a3, C.rosa);                      // la 3ªm del paso cero (se va del todo al buscar la sensible)
      const a3f = N.group(a3); arco(a3f, xB + 30, yNota('B4', yM) - 26, xD - 40, yNota('D5', yM) - 26, 60, { w: 4 });
      barrido(s, a3f, xB, xD, yM - 160, yM, tSubo, 0.8, 1);
      mostrarEn(s, a3, tSubo, tSens + 0.4, .3, .4);
      const nD = N.group(PE); nota(nD, 'D5', xD - 22, yM);
      pop(s, nD, tDa, 1e9, xD, yNota('D5', yM), { k0: .6 });
      const nmD = N.group(PE); nombreNota(nmD, 'D', xD, yM + 118, { size: 30, anchor: 'middle', fill: C.blanco });
      mostrarEn(s, nmD, tDa + 0.2, 1e9);
      const lT = texto(PE, 'tónica', xD, yM - 100, { anchor: 'middle', size: 28, peso: 800, fill: C.blanco });
      mostrarEn(s, lT, tSens + 0.2, 1e9);
      const nC = N.group(PE); nota(nC, 'C#5', xC5 - 22, yM); color(nC, C.rosa);
      pop(s, nC, tDo, 1e9, xC5, yNota('C#5', yM), { k0: .6 });
      const nmC = N.group(PE); nombreNota(nmC, 'C#', xC5, yM + 118, { size: 30, anchor: 'middle', fill: C.rosa });
      mostrarEn(s, nmC, tDo + 0.1, 1e9);
      const lS = texto(PE, 'sensible', xC5, yM - 100, { anchor: 'middle', size: 28, peso: 800, fill: C.rosa });
      mostrarEn(s, lS, tDo + 0.1, 1e9);
      const md = N.group(PE); color(md, C.rosa);
      arco(md, xC5 + 24, yNota('C#5', yM) - 22, xD - 26, yNota('D5', yM) - 22, 24, { w: 3.5, cab: 11 });
      mostrarEn(s, md, tDo + 0.4, 1e9);
      // «y voy contando: Fa, Do. Ahí me paro»
      const O = N.group(g); aparece(s, O, Wd('R4', 'voy') - 0.2, fin, { dy: 8 });
      const items = ordenFila(O, '#', CX, Y_ORD);
      cuentaOrden(s, O, items, tF, { obj: 1, tStop: Wd('R5', 'ahi') - 0.1 });
      const en = N.group(g); color(en, C.rosa); enlace(en, xC5, yM - 138, items[1].x, Y_ORD + 26, { c1: [xC5, 520], c2: [items[1].x, 560] });
      mostrarEn(s, en, tF[1] + 0.2, fin);
      resultado(s, g, '2♯', 1500, yM + 26, Wd('R6', 'dos') - 0.15, fin);
    });
  }

  // ================================================================ F · chuleta (cada paso en rosa al decirlo) + su ejemplo
  function escenaChuleta() {
    const a = F0('F1') - 0.1, b = T.acorde + 0.15;
    escena('chuleta', a, b, (s, g) => {
      const fin = b - 0.3;
      const xC = 90, yC = 160, hC = 560;
      const CH = N.group(g);
      const rP = panel(CH, xC, yC, 900, hC, { rx: 24, stroke: 'rgba(248,250,252,0.35)', sw: 2 });
      texto(CH, 'CHULETA', xC + 44, yC + 62, { size: 26, peso: 800, ls: '0.24em', fill: C.rosa });
      aparece(s, CH, F0('F1') + 0.1, fin, { dy: 12 });
      let xMax = 0;
      const fila = (segs, x, y, ta, tb) => {
        const G = N.group(g);
        const f = frase(G, segs, x, y, { size: 40, peso: 700 });
        xMax = Math.max(xMax, x + f._w);
        color(G, C.blanco);
        aparece(s, G, ta, fin, { dy: 8 });
        if (tb) resalta(s, G, ta, tb, { d: .25 });
        return G;
      };
      const t0 = Wd('F1', 'paso') - 0.25, t1 = Wd('F1', 'pregunta') - 0.35, tSi = Wd('F2', 'si') - 0.15;
      const tNo = F0('F4') - 0.1, tMem = Wd('F4', 'nunca') - 0.25, tF5 = F0('F5') - 0.1;
      fila('0 · consigue la tonalidad Mayor', xC + 44, yC + 145, t0, Wd('F1', 'luego') - 0.1);
      fila('1 · ¿♭ en el nombre?', xC + 44, yC + 240, t1, tSi - 0.05);
      fila('SÍ → cuenta ♭ hasta ella + 1 de regalo', xC + 100, yC + 322, tSi, tNo - 0.05);
      fila('NO → cuenta ♯ hasta la sensible', xC + 100, yC + 404, tNo, Wd('F4', 'ah') - 0.1);
      fila('¡de memoria!  Do M · Fa M', xC + 44, yC + 508, tMem, tF5);
      const wP = xMax - xC + 50;
      rP.setAttribute('width', wP.toFixed(0));
      // a la derecha, el ejemplo de cada paso
      const xR = Math.round((xC + wP + 1840) / 2);
      const ej = texto(g, 'EJEMPLO', xR, yC + 62, { anchor: 'middle', size: 26, peso: 800, ls: '0.2em', fill: C.rosa });
      aparece(s, ej, t0, fin, { dy: 6 });
      const tramo = (ta, tb) => { const G = N.group(g); aparece(s, G, ta, tb, { dy: 0, fi: .35, fo: .35 }); return G; };
      // 0 · Do m → Mi♭ M
      const T0 = tramo(t0, tSi);
      chipTon(T0, 'C', 'menor', xR - 190, 470, { size: 36, fondo: C.panel, borde: C.blanco });
      const f0 = N.group(T0); color(f0, C.rosa); flecha(f0, xR - 105, 470, xR + 85, 470, { w: 5, cab: 18 });
      sube3m(T0, xR - 10, 412, 26);
      chipTon(T0, 'Eb', 'mayor', xR + 190, 470, { size: 36 });
      // SÍ · Mi♭ M: Si♭, Mi♭ + La♭ de regalo → 3♭
      const yE = 560, xE = xR - 270;
      const TS = tramo(tSi, tNo);
      chipTon(TS, 'Eb', 'mayor', xR, 350, { size: 36 });
      const tb1 = [Wd('F3', 'cuantos') - 0.1, Wd('F3', 'bemoles') - 0.05, Wd('F3', 'regalo') - 0.1];
      const B = armaduraEn(s, TS, xE, yE, 350, 3, 'b', tb1, 1e9);
      color(B.A.items[2].g, C.rosa);
      const rg = texto(TS, 'regalo', B.A.items[2].x + 12, yE + 108, { anchor: 'middle', size: 28, peso: 800, fill: C.rosa });
      mostrarEn(s, rg, tb1[2] + 0.1, 1e9);
      resultado(s, TS, '3♭', xR + 190, yE + 26, tb1[2] + 0.35, 1e9);
      // NO · Mi M: Fa♯, Do♯, Sol♯… hasta la sensible Re♯ → 4♯
      const TN = tramo(tNo, tMem);
      chipTon(TN, 'E', 'mayor', xR, 350, { size: 36 });
      const tCs = Wd('F4', 'cuantos') - 0.1, tSe = Wd('F4', 'sensible') - 0.15;
      const S4 = armaduraEn(s, TN, xE, yE, 350, 4, '#', [tCs, tCs + 0.22, tCs + 0.44, tSe], 1e9);
      color(S4.A.items[3].g, C.rosa);
      const ss = texto(TN, 'sensible', S4.A.items[3].x + 13, yE + 108, { anchor: 'middle', size: 28, peso: 800, fill: C.rosa });
      mostrarEn(s, ss, tSe + 0.1, 1e9);
      resultado(s, TN, '4♯', xR + 190, yE + 26, tSe + 0.35, 1e9);
      // de memoria: Do M (nada) y Fa M (1♭)
      const TM = tramo(tMem, fin);
      [['C', 0, xR - 165, Wd('F4', 'do') - 0.15], ['F', 1, xR + 165, Wd('F4', 'fa') - 0.15]].forEach(([ton, n, x, ta]) => {
        const G = N.group(TM);
        chipTon(G, ton, 'mayor', x, 350, { size: 34 });
        const P = pentaClave(G, x - 130, yE, 260);
        if (n) { const A1 = N.armaduraGen(G, P.x0 + 4, yE, SP, 1, 'b'); color(A1.g, C.rosa); }
        pop(s, G, ta, 1e9, x, 460, { k0: .85 });
      });
      const vam = N.group(g); chip(vam, '¡VAMOS A POR ELLOS!', CX, 815, { size: 30, anchor: 'middle' });
      pop(s, vam, tF5, fin, CX, 815, { k0: .6 });
    });
  }

  const ORDEN = [escenaIdaVuelta, escenaPasoCero, escenaPregunta, escenaBemoles, escenaSostenidos, escenaExcepciones, escenaUltimo, escenaChuleta];

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
