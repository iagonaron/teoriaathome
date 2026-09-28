/* =====================================================================
   ESCENAS · Inversión de intervalos (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (inversion-intervalos/escenas_cuerpo.js). Todo es función pura de t.
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


  // ================================================================ E2 · INVERSIÓN DE INTERVALOS
  const TITULO = { kicker: 'TEORÍA  ·  INTERVALOS', lineas: ['INVERSIÓN DE INTERVALOS'], sub: 'Suman nueve · La especie se da la vuelta' };
  const OCT = 3.5 * SP;                                  // una octava en el pentagrama

  /** Nota que cambia de octava: grupo exterior (entra/sale) + interior (se desliza). */
  function notaMovil(s, parent, n, x, yMid, o) {
    o = o || {};
    const out = N.group(parent), inn = N.group(out);
    const r = nota(inn, n, x, yMid);
    if (o.rosa) color(inn, C.rosa);
    return { out, inn, r };
  }

  // ================================================================ I · invertir = cambiar una nota de octava
  function escenaIdea() {
    const a = F0('I1') - 0.2, b = F0('E1') + 0.2;
    escena('idea', a, b, (s, g) => {
      const tI2 = F0('I2');
      // I1 · Re–Fa: el Re sube una octava
      const A = N.group(g);
      aparece(s, A, F0('I1'), tI2 - 0.1, { dy: 10 });
      const ki = N.group(A); chip(ki, 'INVERTIR', CX, 250, { size: 28, anchor: 'middle' });
      const yM = 560, xP = 660;
      pentaClave(A, xP, yM, 600);
      const xN = 990;
      const fa = N.group(A); nota(fa, 'F4', xN, yM);
      const re = N.group(A), reIn = N.group(re); nota(reIn, 'D4', xN, yM);
      const tUna = Wd('I1', 'una') - 0.1, tCam = Wd('I1', 'cambiamos') - 0.05;
      resalta(s, reIn, tUna, null);
      desliza(s, reIn, tCam, tCam + 0.9, 0, -OCT, { curva: -80 });
      const fl = N.group(A); color(fl, C.rosa);
      arcoLado(fl, xN + 70, yNota('D4', yM), yNota('D5', yM), 120, { dash: '2 10', w: 4 });
      texto(fl, 'octava', xN + 200, (yNota('D4', yM) + yNota('D5', yM)) / 2 + 10, { size: 30, peso: 800, fill: C.rosa });
      mostrarEn(s, fl, tCam + 0.3, tI2 - 0.1);
      const l1 = parNotas(A, 'D', 'F', xN + 22, 730, { size: 38 });
      const l2 = parNotas(A, 'F', 'D', xN + 22, 730, { size: 38 });
      s.on(t => { const k = ease(ramp(t, tCam + 0.7, tCam + 1.1)); opa(l1, 1 - k); opa(l2, k); });
      // I2 · dos maneras: la de abajo pasa arriba… o la de arriba pasa abajo (las dos acaban en Fa–Re)
      const casos = [
        { x: 290, tit: 'LA DE ABAJO → ARRIBA', notas: ['D4', 'F4'], mueve: 0, dy: -OCT, t: Wd('I2', 'arriba'), ta: tI2 - 0.05 },
        { x: 1010, tit: 'LA DE ARRIBA → ABAJO', notas: ['D5', 'F5'], mueve: 1, dy: OCT, t: Wd('I2', 'abajo'), ta: Wd('I2', 'o') - 0.15 },
      ];
      casos.forEach(K => {
        const G = N.group(g);
        aparece(s, G, K.ta, b - 0.2, { dy: 14 });
        panel(G, K.x, 300, 620, 520, { rx: 24 });
        texto(G, K.tit, K.x + 310, 368, { anchor: 'middle', size: 28, peso: 800, ls: '0.1em', fill: C.rosa });
        const y2 = 600;
        pentaClave(G, K.x + 60, y2, 500);
        const xn = K.x + 360;
        K.notas.forEach((n, i) => {
          const o = N.group(G), inn = N.group(o); nota(inn, n, xn, y2);
          if (i === K.mueve) { resalta(s, inn, K.ta + 0.3, null); desliza(s, inn, K.t - 0.1, K.t + 0.7, 0, K.dy, { curva: -70 }); }
        });
        const res = parNotas(G, 'F', 'D', K.x + 310, 770, { size: 34 });
        mostrarEn(s, res, K.t + 0.6, 1e9, .3);
      });
    });
  }

  // ================================================================ E · el ejemplo: Re–Fa (3ªm) → Fa–Re (6M)
  function escenaEjemplo() {
    const a = F0('E1') - 0.1, b = F0('P1') + 0.2;
    escena('ejemplo', a, b, (s, g) => {
      const ej = N.group(g); chip(ej, 'EJEMPLO', CX, 230, { size: 26, anchor: 'middle', relleno: false });
      pop(s, ej, F0('E1'), b - 0.2, CX, 230);
      const yM = 540;
      // izquierda: Re–Fa
      const L = N.group(g);
      aparece(s, L, Wd('E2', 're') - 0.3, b - 0.2, { dy: 10 });
      pentaClave(L, 330, yM, 560);
      const xl = 640;
      const intL = N.group(L); intervaloArm(intL, 'D4', 'F4', xl, yM);
      destella(s, intL, S.SON_REFA || F0('SON_REFA') + 0.1);
      parNotas(L, 'D', 'F', xl + 22, 710, { size: 38 });
      const c3 = N.group(g); chipInt(c3, '3ªm', xl + 22, 800, { size: 34 });
      pop(s, c3, Wd('E2', 'tercera') - 0.1, b - 0.2, xl + 22, 800);
      // flecha
      const fl = N.group(g); color(fl, C.suave); flecha(fl, 910, yM, 1010, yM, { w: 5, cab: 18 });
      mostrarEn(s, fl, Wd('E3', 'subo') - 0.1, b - 0.2);
      // derecha: Fa–Re (el Re sube una octava)
      const R = N.group(g);
      aparece(s, R, Wd('E3', 'subo') - 0.2, b - 0.2, { dy: 10 });
      pentaClave(R, 1030, yM, 560);
      const xr = 1340;
      const faR = N.group(R); nota(faR, 'F4', xr, yM);
      const reR = N.group(R); nota(reR, 'D4', xr, yM); color(reR, C.rosa);
      const tOct = Wd('E3', 'octava') - 0.3;
      desliza(s, reR, tOct, tOct + 0.8, 0, -OCT, { curva: -70 });
      destella(s, faR, S.SON_FARE || F0('SON_FARE') + 0.1);
      s.on(t => { const k = win(t, (S.SON_FARE || F0('SON_FARE')) - 0.05, (S.SON_FARE || F0('SON_FARE')) + 0.9, .08, .5); color(reR, mezcla(C.rosa, '#ffffff', 0.35 * k)); });
      const lr = parNotas(R, 'F', 'D', xr + 22, 710, { size: 38 });
      mostrarEn(s, lr, Wd('E3', 'fare') - 0.2, 1e9, .3);
      const c6 = N.group(g); chipInt(c6, '6M', xr + 22, 800, { size: 34 });
      pop(s, c6, Wd('E3', 'sexta') - 0.1, b - 0.2, xr + 22, 800);
    });
  }

  // ================================================================ R · ¿volver a analizarlo todo? No: tres reglas
  function escenaReglas() {
    const a = F0('P1') - 0.1, b = F0('F1') + 0.2;
    escena('reglas', a, b, (s, g) => {
      const tP2 = F0('P2'), tNo = Wd('P2', 'no'), tTres = Wd('P2', 'tres') - 0.2;
      // P1–P2 · la pregunta
      const Q = N.group(g);
      aparece(s, Q, F0('P1'), tTres + 0.3, { dy: 10 });
      const lu = N.group(Q); icoLupa(lu, CX - 300, 520, 1.6); color(lu, C.suave);
      texto(Q, '¿volver a analizarlo todo?', CX - 180, 540, { size: 52, peso: 800, fill: C.blanco });
      const no = N.group(Q); aspa(no, CX - 300, 520, 70, 12); color(no, C.rojo);
      mostrarEn(s, no, tNo - 0.1, 1e9, .2);
      // las tres reglas (tarjetas arriba)
      const R = [
        { n: '1', tit: 'SUMAN 9', f: 'R1', fin: F0('R2') - 0.1 },
        { n: '2', tit: 'LA ESPECIE SE DA LA VUELTA', f: 'R2', fin: F0('R3') - 0.1 },
        { n: '3', tit: 'LA ALTERACIÓN NO SE PIERDE', f: 'R3', fin: b },
      ];
      const wC = 540, gap = 36, x0 = CX - (3 * wC + 2 * gap) / 2, yC = 150, hC = 108;
      R.forEach((r, i) => {
        const G = N.group(g);
        const x = x0 + i * (wC + gap);
        const rect = panel(G, x, yC, wC, hC, { rx: 20 });
        const num = N.group(G);
        N.el('circle', { cx: x + 58, cy: yC + hC / 2, r: 30, fill: 'none', stroke: 'currentColor', 'stroke-width': 3 }, num);
        texto(num, r.n, x + 58, yC + hC / 2 + 12, { anchor: 'middle', size: 34, peso: 800, fill: 'currentColor' });
        const tt = texto(G, r.tit, x + 108, yC + hC / 2 + 11, { size: 27, peso: 800, ls: '0.04em', fill: 'currentColor' });
        const w = D.medir(tt); if (w > wC - 130) tt.setAttribute('font-size', (27 * (wC - 130) / w).toFixed(1));
        color(G, C.suave);
        aparece(s, G, tTres + i * 0.25, b - 0.2, { dy: 12 });
        const t0 = F0(r.f) - 0.1;
        s.on(t => {
          const k = win(t, t0, r.fin, .35, .35);
          color(G, mezcla(C.suave, C.blanco, k));
          color(num, mezcla(C.suave, C.rosa, k));
          rect.setAttribute('stroke', mezcla('#3a4556', C.rosa, k));
          rect.setAttribute('stroke-width', (1.5 + 1.5 * k).toFixed(2));
        });
      });

      // ---------- R1 · los números suman 9
      const tR2 = F0('R2') - 0.1;
      const S1 = N.group(g);
      aparece(s, S1, Wd('R1', 'numeros') - 0.2, tR2, { dy: 10 });
      const regla1 = N.group(S1);
      texto(regla1, [['número ', C.blanco], ['+', C.suave], [' número nuevo ', C.blanco], ['= 9', C.rosa]], CX, 380, { anchor: 'middle', size: 44, peso: 800 });
      const tr = N.group(S1);
      marca(tr, true, CX - 250, 460, 16);
      texto(tr, 'truco para comprobar', CX - 215, 472, { size: 32, peso: 600, italic: true, fill: C.suave });
      aparece(s, tr, Wd('R1', 'truco') - 0.2, tR2, { dy: 6 });
      const sumas = [
        { y: 610, a: '3', b: '6', tA: Wd('R1b', 'tercera'), tB: Wd('R1b', 'sexta'), tC: Wd('R1b', 'nueve') },
        { y: 730, a: '2', b: '7', tA: Wd('R1c', 'segunda'), tB: Wd('R1c', 'septima'), tC: Wd('R1c', 'nueve') },
        { y: 850, a: '4', b: '5', tA: Wd('R1c', 'cuarta'), tB: Wd('R1c', 'quinta'), tC: Wd('R1c', 'nueve', 2) },
      ];
      sumas.forEach(z => {
        const G = N.group(S1);
        const pA = texto(G, z.a, CX - 170, z.y, { anchor: 'middle', size: 76, peso: 800, fill: C.blanco });
        const pM = texto(G, '+', CX - 85, z.y, { anchor: 'middle', size: 64, peso: 700, fill: C.suave });
        const pB = texto(G, z.b, CX, z.y, { anchor: 'middle', size: 76, peso: 800, fill: C.blanco });
        const pI = texto(G, '=', CX + 85, z.y, { anchor: 'middle', size: 64, peso: 700, fill: C.suave });
        const pC = texto(G, '9', CX + 170, z.y, { anchor: 'middle', size: 76, peso: 800, fill: C.rosa });
        mostrarEn(s, pA, z.tA - 0.1, 1e9, .25); mostrarEn(s, pM, z.tB - 0.25, 1e9, .25); mostrarEn(s, pB, z.tB - 0.1, 1e9, .25);
        mostrarEn(s, pI, z.tC - 0.25, 1e9, .25); mostrarEn(s, pC, z.tC - 0.1, 1e9, .25);
      });
      const ej1 = texto(S1, '3ªm → 6M', CX + 420, 610, { anchor: 'middle', size: 36, peso: 700, fill: C.suave });
      mostrarEn(s, ej1, Wd('R1b', 'sexta'), 1e9, .3);

      // ---------- R2 · la especie se da la vuelta
      const tR3 = F0('R3') - 0.1;
      const S2 = N.group(g);
      aparece(s, S2, F0('R2'), tR3, { dy: 10 });
      const filas = [
        { y: 450, a: 'm', b: 'M', pa: 'menor', pb: 'Mayor', ej: '2ªm ⇄ 7M', t: Wd('R2b', 'menores') - 0.15, tb: Wd('R2b', 'mayores') - 0.15, doble: true },
        { y: 630, a: 'D', b: 'A', pa: 'disminuida', pb: 'aumentada', ej: '5D ⇄ 4A', t: Wd('R2c', 'disminuidas') - 0.15, tb: Wd('R2c', 'aumentadas') - 0.15, doble: true },
        { y: 810, a: 'J', b: 'J', pa: 'justa', pb: 'justa', ej: '5J ⇄ 4J', t: Wd('R2d', 'justas') - 0.15, tb: Wd('R2d', 'justas', 2) - 0.3, doble: false },
      ];
      const tFinR2 = F0('R3') - 0.2;
      filas.forEach((f, i) => {
        const G = N.group(S2);
        aparece(s, G, f.t, 1e9, { dy: 10 });
        panel(G, 330, f.y - 80, 1260, 150, { rx: 22 });
        texto(G, f.a, 520, f.y + 26, { anchor: 'middle', size: 84, peso: 800, fill: C.blanco });
        texto(G, f.pa, 520, f.y + 58, { anchor: 'middle', size: 22, peso: 600, fill: C.suave });
        const fl = N.group(G); color(fl, C.rosa);
        if (f.doble) { flecha(fl, 610, f.y - 12, 760, f.y - 12, { w: 5, cab: 16 }); flecha(fl, 760, f.y + 16, 610, f.y + 16, { w: 5, cab: 16 }); }
        else flecha(fl, 610, f.y, 760, f.y, { w: 5, cab: 16 });
        const B = N.group(G);
        texto(B, f.b, 850, f.y + 26, { anchor: 'middle', size: 84, peso: 800, fill: C.rosa });
        texto(B, f.pb, 850, f.y + 58, { anchor: 'middle', size: 22, peso: 600, fill: C.suave });
        mostrarEn(s, fl, f.tb - 0.2, 1e9, .3); mostrarEn(s, B, f.tb, 1e9, .3);
        const ej = texto(G, f.ej, 1290, f.y + 14, { anchor: 'middle', size: 44, peso: 700, fill: C.suave });
        mostrarEn(s, ej, f.tb + 0.4, 1e9, .4);
        if (!f.doble) {
          const neu = texto(G, 'neutras', 1010, f.y + 14, { anchor: 'middle', size: 30, peso: 700, italic: true, fill: C.suave });
          mostrarEn(s, neu, Wd('R2d', 'neutras') - 0.1, 1e9, .3);
        }
        resalta(s, G, f.t, (filas[i + 1] ? filas[i + 1].t : tFinR2) - 0.1, { d: .3 });
      });

      // ---------- R3 · la nota que cambia de octava se lleva su alteración
      const S3 = N.group(g);
      aparece(s, S3, F0('R3') + 0.2, b - 0.2, { dy: 10 });
      const yM = 540, xP = 470;
      pentaClave(S3, xP, yM, 620);
      const xn = 800;
      const re = N.group(S3); nota(re, 'D5', xn, yM);
      // «arriba o abajo»: el Fa♯ de arriba se queda como sombra, con su sostenido
      const som = N.group(S3); const nSom = nota(som, 'F#5', xn, yM); color(som, C.suave);
      s.on(t => opa(som, 0.5 * win(t, Wd('R3b', 'arriba') - 0.15, b - 0.2, .35, .3)));
      const fs = N.group(S3), fsIn = N.group(fs); const nFs = nota(fsIn, 'F#5', xn, yM);
      const tNota = Wd('R3', 'nota') - 0.1, tOct = Wd('R3', 'octava') - 0.1;
      resalta(s, fsIn, tNota, null);
      desliza(s, fsIn, tOct, tOct + 0.9, 0, OCT, { curva: 90 });
      // los sostenidos (el que baja y su sombra) destellan cuando se nombran
      const tFs = [Wd('R3b', 'fa'), Wd('R3b', 'fa', 2), Wd('R3b', 'apellido')];
      s.on(t => { let k = 0; for (const t0 of tFs) k = Math.max(k, win(t, t0 - 0.05, t0 + 0.8, .1, .4)); color(nFs.alt, mezcla(C.rosa, '#ffffff', 0.6 * k)); color(nSom.alt, C.rosa); });
      // el apellido: debajo del pentagrama, señalando el sostenido
      const ap = N.group(S3);
      const xs = xn - 22, ys = yNota('F4', yM);
      const fap = N.group(ap); color(fap, C.rosa); flecha(fap, xs, yM + 128, xs, ys + 42, { w: 3.5, cab: 13 });
      texto(ap, 'apellido', xs, yM + 170, { anchor: 'middle', size: 34, peso: 800, fill: C.rosa });
      aparece(s, ap, Wd('R3b', 'apellido') - 0.2, b - 0.2, { dy: 6 });
      // antes / después, a la derecha
      const xT = 1330;
      const antes = N.group(S3);
      parNotas(antes, 'D', 'F#', xT, 430, { size: 38 });
      const c3M = N.group(antes); chipInt(c3M, '3M', xT, 500, { size: 30 });
      aparece(s, antes, F0('R3') + 0.4, b - 0.2, { dy: 6 });
      const fl = N.group(S3); color(fl, C.suave); flecha(fl, xT, 548, xT, 598, { w: 4, cab: 14 });
      mostrarEn(s, fl, tOct + 0.8, 1e9, .3);
      const despues = N.group(S3);
      parNotas(despues, 'F#', 'D', xT, 660, { size: 38 });
      const c6m = N.group(despues); chipInt(c6m, '6ªm', xT, 730, { size: 30 });
      aparece(s, despues, tOct + 0.9, b - 0.2, { dy: 6 });
    });
  }

  // ================================================================ F · resumen
  function escenaResumen() {
    const a = F0('F1') - 0.1, b = T.acorde + 0.15;
    escena('resumen', a, b, (s, g) => {
      const P = N.group(g);
      aparece(s, P, F0('F1'), b - 0.3, { dy: 12 });
      panel(P, 250, 220, 820, 560, { rx: 24, stroke: 'rgba(248,250,252,0.35)', sw: 2 });
      texto(P, 'ASÍ QUE…', 300, 290, { size: 26, peso: 800, ls: '0.24em', fill: C.rosa });
      const filas = [
        ['1 · cambio una nota de octava', Wd('F1', 'cambio') - 0.2, Wd('F1', 'los') - 0.1],
        ['2 · los números suman 9', Wd('F1', 'suman') - 0.4, Wd('F1', 'y', 2) - 0.1],
        ['3 · la especie se da la vuelta', Wd('F1', 'especie') - 0.3, F0('F2')],
      ];
      filas.forEach(([txt, ta, tb], i) => filaChuleta(s, g, txt, 300, 400 + i * 120, ta, tb, b - 0.3, { size: 40 }));
      // a la derecha, el ejemplo: Re–Fa (3ªm) → Fa–Re (6M)
      const E = N.group(g);
      aparece(s, E, Wd('F1', 'cambio') - 0.2, b - 0.3, { dy: 10 });
      const yM = 470;
      pentaClave(E, 1150, yM, 560);
      const x1 = 1360, x2 = 1560;
      intervaloArm(E, 'D4', 'F4', x1, yM);
      const f2 = N.group(E); nota(f2, 'F4', x2, yM);
      const r2 = N.group(E); nota(r2, 'D5', x2, yM); color(r2, C.rosa);
      const fl = N.group(E); color(fl, C.suave); flecha(fl, x1 + 70, yM + 30, x2 - 30, yM + 30, { w: 3.5, cab: 12 });
      etiquetaInt(E, '3ªm', x1 + 22, 640, { size: 40 });
      etiquetaInt(E, '6M', x2 + 22, 640, { size: 40 });
      const suma = texto(E, '3 + 6 = 9', (x1 + x2) / 2 + 22, 730, { anchor: 'middle', size: 38, peso: 800, fill: C.blanco });
      mostrarEn(s, suma, Wd('F1', 'suman') - 0.3, 1e9, .3);
      const prac = N.group(g); chip(prac, '¡A PRACTICAR!', CX, 900, { size: 30, anchor: 'middle' });
      pop(s, prac, F0('F2') - 0.1, b - 0.3, CX, 900);
    });
  }

  const ORDEN = [escenaIdea, escenaEjemplo, escenaReglas, escenaResumen];

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
    if (velo) velo.setAttribute('opacity', veloFondo(t).toFixed(3));
  }
  window.ESCENAS = { construir, pintar, get T() { return T; } };
})();
