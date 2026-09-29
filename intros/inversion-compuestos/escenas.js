/* =====================================================================
   ESCENAS · Inversión de intervalos compuestos (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (inversion-compuestos/escenas_cuerpo.js). Todo es función pura de t.
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

  // ================================================================ E4 · INVERSIÓN DE INTERVALOS COMPUESTOS
  const TITULO = { kicker: 'TEORÍA  ·  INTERVALOS', lineas: ['INVERSIÓN DE', 'INTERVALOS COMPUESTOS'], sub: 'Me acerco · Invierto · Me alejo' };
  const WN = N.M.noteheadWhole.adv * SP;                 // ancho de una redonda
  let nClip = 0;

  /** Redonda centrada en xc, en su propio grupo (para poder colorearla o fundirla sola). */
  function redondaEn(parent, n, xc, yMid, o) { const G = N.group(parent); G._r = nota(G, n, xc - WN / 2, yMid, o); return G; }

  /** Descubre un grupo de izquierda a derecha (máscara que crece) entre ta y ta + d. */
  function destapa(s, g, x, y, w, h, ta, d) {
    const id = 'clipInvComp' + (++nClip);
    const cp = N.el('clipPath', { id }, N.el('defs', null, g.parentNode));
    const r = N.el('rect', { x: x.toFixed(1), y: y.toFixed(1), width: 0, height: h }, cp);
    g.setAttribute('clip-path', `url(#${id})`);
    s.on(t => r.setAttribute('width', (w * eo(ramp(t, ta, ta + (d || .45)))).toFixed(1)));
  }

  // ================================================================ (28-sep, Iago) EL CAMBIO DE OCTAVA SE VE, COMO EN EL KIT
  // En TODAS las inversiones: la nota que cambia de octava no se reescribe de golpe. De su sitio SALE una cabeza rosa
  // (con su alteración, si la lleva) que VIAJA por un arco discontinuo con punta hasta su octava nueva; el arco se va
  // dibujando detrás de ella y se queda. La cabeza viajera va sin líneas adicionales: la nota de llegada, con las
  // suyas, aparece cuando llega. Grafía de arcoMovimiento (trazo 3,2 · discontinuo 9/8 · punta de 14), en curva
  // cúbica para poder salir del intervalo sin pisar la otra nota y llegar por el lado contrario a la que se queda.
  // (Mismo código que en «Inversión de intervalos».)
  const ALT_GL = { '#': 'accidentalSharp', b: 'accidentalFlat', n: 'accidentalNatural' };
  const altDe = n => { const m = /^([A-G])([#bn]?)(\d)$/.exec(n); return m && m[2] ? ALT_GL[m[2]] : null; };
  /** Cabeza de redonda suelta, centrada en (0, 0), con su alteración si la lleva: la que viaja. */
  function cabezaSuelta(parent, n) {
    const G = N.group(parent, 'cabezaViajera');
    N.glyph(G, 'noteheadWhole', -WN / 2, 0, SP);
    const gl = altDe(n);
    if (gl) N.glyph(G, gl, -WN / 2 - (N.M[gl].adv + 0.22) * SP, 0, SP);
    return G;
  }
  /** Zonas que el arco no pisa alrededor de una nota q = {n, x, y} (centro de la cabeza): cabeza y alteración. */
  function zonasNota(q, m) {
    m = m == null ? 5 : m;
    const Z = [{ e: 1, cx: q.x, cy: q.y, rx: WN / 2 + m, ry: SP / 2 + m }];
    const gl = altDe(q.n);
    if (gl) {
      const B = N.M[gl], x0 = q.x - WN / 2 - (B.adv + 0.22) * SP;
      Z.push({ x0: x0 + B.sw[0] * SP - m, x1: x0 + B.ne[0] * SP + m, y0: q.y - B.ne[1] * SP - m, y1: q.y - B.sw[1] * SP + m });
    }
    return Z;
  }
  const pisa = (p, Z) => Z.some(z => z.e ? Math.pow((p.x - z.cx) / z.rx, 2) + Math.pow((p.y - z.cy) / z.ry, 2) < 1
    : p.x > z.x0 && p.x < z.x1 && p.y > z.y0 && p.y < z.y1);
  /** Camino (Bézier cúbica) de centro de cabeza a centro de cabeza. dy1: cómo sale (− hacia arriba, + hacia abajo,
   *  0 en horizontal si hay otra nota pegada); dy2: por dónde llega (− desde arriba, + desde abajo). */
  function caminoOctava(p1, p2, o) {
    const L = p2.x - p1.x, a = o.a || 0.4, b = o.b || 0.3;
    const P = [p1.x, p1.y, p1.x + a * L, p1.y + (o.dy1 || 0), p2.x - b * L, p2.y + (o.dy2 || 0), p2.x, p2.y];
    const f = k => {
      const u = 1 - k, c0 = u * u * u, c1 = 3 * u * u * k, c2 = 3 * u * k * k, c3 = k * k * k;
      return { x: c0 * P[0] + c1 * P[2] + c2 * P[4] + c3 * P[6], y: c0 * P[1] + c1 * P[3] + c2 * P[5] + c3 * P[7] };
    };
    f.der = k => {
      const u = 1 - k, c0 = 3 * u * u, c1 = 6 * u * k, c2 = 3 * k * k;
      return { x: c0 * (P[2] - P[0]) + c1 * (P[4] - P[2]) + c2 * (P[6] - P[4]), y: c0 * (P[3] - P[1]) + c1 * (P[5] - P[3]) + c2 * (P[7] - P[5]) };
    };
    return f;
  }
  /** CAMBIO DE OCTAVA. o: {org, dest: {n, x, y} (centros de cabeza), otras: notas junto a la de salida, fijas: notas
   *  junto a la de llegada, ta, tb (viaje), dy1, dy2, a, b, capaArco, capaCabeza (encima de todo),
   *  rotulo ('octava', opcional), apaga (instante en que el arco pasa a gris suave, opcional)}. Devuelve {A, H, R, f}. */
  function cambioOctava(s, o) {
    const f = caminoOctava(o.org, o.dest, o);
    const Zo = [], Zd = [];
    [o.org].concat(o.otras || []).forEach(q => Zo.push(...zonasNota(q)));
    [o.dest].concat(o.fijas || []).forEach(q => Zd.push(...zonasNota(q)));
    const PASO = 1 / 800;
    let k0 = 0, k1 = 1;
    for (let k = 0; k <= 0.6; k += PASO) if (pisa(f(k), Zo)) k0 = k + PASO;          // empieza fuera del intervalo de salida
    for (let k = k0; k <= 1; k += PASO) if (pisa(f(k), Zd)) { k1 = k - PASO; break; }  // y la punta toca la nota que llega
    const A = N.group(o.capaArco, 'movimiento'); color(A, C.rosa);
    const NP = 160, pts = [];
    for (let i = 0; i <= NP; i++) { const q = f(k0 + (k1 - k0) * i / NP); pts.push(q.x.toFixed(1) + ',' + q.y.toFixed(1)); }
    const lin = N.el('polyline', { points: '', fill: 'none', stroke: 'currentColor', 'stroke-width': o.w || 3.2,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '9 8' }, A);
    const pt = f(k1), dv = f.der(k1), ang = Math.atan2(dv.y, dv.x), cab = 14;
    const ala = d => `${(pt.x - Math.cos(ang + d) * cab).toFixed(1)},${(pt.y - Math.sin(ang + d) * cab).toFixed(1)}`;
    const punta = N.el('polygon', { points: `${pt.x.toFixed(1)},${pt.y.toFixed(1)} ${ala(0.42)} ${ala(-0.42)}`, fill: 'currentColor' }, A);
    // rótulo («octava») por fuera del lomo del arco, sobre un fondo oscuro para que se lea encima de las líneas
    let R = null, kR = 1;
    if (o.rotulo) {
      const p0 = f(k0), p1 = f(k1), cl = Math.hypot(p1.x - p0.x, p1.y - p0.y), nx = -(p1.y - p0.y) / cl, ny = (p1.x - p0.x) / cl;
      let best = 0;
      for (let i = 0; i <= 100; i++) { const k = k0 + (k1 - k0) * i / 100, q = f(k), d = (q.x - p0.x) * nx + (q.y - p0.y) * ny; if (Math.abs(d) > Math.abs(best)) { best = d; kR = k; } }
      const sg = best >= 0 ? 1 : -1, q = f(kR), dd = o.rotuloDist || 34;
      const rx = q.x + nx * sg * dd, ry = q.y + ny * sg * dd;
      R = N.group(o.capaArco, 'rotulo');
      const tt = texto(R, o.rotulo, rx, ry + 9, { anchor: 'middle', size: 26, peso: 800, fill: C.rosa });
      const w = D.medir(tt) + 22;
      R.insertBefore(N.el('rect', { x: (rx - w / 2).toFixed(1), y: (ry - 19).toFixed(1), width: w.toFixed(1), height: 38, rx: 8, fill: '#0b1320', opacity: 0.88 }), tt);
    }
    // la cabeza que viaja (rosa, con su alteración)
    const H = cabezaSuelta(o.capaCabeza, o.org.n); color(H, C.rosa);
    viaja(s, H, f, o.ta, o.tb);
    s.on(t => {
      const k = ease(ramp(t, o.ta, o.tb));                 // el mismo avance que usa viaja
      const kv = Math.min(k, k1);
      if (kv <= k0) lin.setAttribute('points', '');
      else {
        const n = Math.min(NP, Math.floor((kv - k0) / (k1 - k0) * NP)), q = f(kv);
        lin.setAttribute('points', pts.slice(0, n + 1).join(' ') + ' ' + q.x.toFixed(1) + ',' + q.y.toFixed(1));
      }
      opa(punta, ramp(k, k1 - 0.02, k1));
      opa(H, win(t, o.ta - 0.06, o.tb + 0.22, .06, .16));
      const kA = o.apaga != null ? ease(ramp(t, o.apaga, o.apaga + 0.4)) : 0;
      if (o.apaga != null) { color(A, mezcla(C.rosa, C.suave, kA)); A.setAttribute('opacity', (1 - 0.55 * kA).toFixed(3)); }
      if (R) opa(R, Math.min(ease(ramp(k, kR, Math.min(1, kR + 0.15))), 1 - kA));
    });
    return { A, H, R, f };
  }
  /** Nota {n, x, y} de un pentagrama (centro de cabeza), para cambioOctava. */
  const pto = (n, x, yMid) => ({ n, x, y: yNota(n, yMid) });

  /** Letra en un círculo (los pasos A · I · A). */
  function letraCirc(parent, L, x, y, r, size) {
    const G = N.group(parent, 'letra');
    N.el('circle', { cx: x, cy: y, r, fill: C.panel, stroke: 'currentColor', 'stroke-width': 3 }, G);
    texto(G, L, x, y + size * 0.36, { anchor: 'middle', size, peso: 800, fill: 'currentColor' });
    return G;
  }

  /** Acróstico AIA: letras grandes en columna (rosa) que se completan al decirlas:
   *  me Acerco · Invierto · me Alejo. La columna aparece centrada y se corre a la izquierda al completarse.
   *  o: {y, paso, size, tL (letras), tMe:[t,t,t] («me»), tP:[t,t,t] (palabras), tb (salida), fo,
   *      ej: ['10M → 3M', …] (opcional: lo que le pasa al ejemplo en cada paso, a la derecha)} */
  function acrostico(s, parent, o) {
    const size = o.size || 140, paso = o.paso || 180;
    const FILAS = [['A', 'me', 'cerco'], ['I', '', 'nvierto'], ['A', 'me', 'lejo']];
    const out = N.group(parent), mov = N.group(out);
    mostrarEn(s, out, o.tL - 0.15, o.tb, .3, o.fo || .4);
    let izq = 0, der = 0;
    const filas = FILAS.map(([L, me, resto], i) => {
      const y = o.y + i * paso;
      const gl = N.group(mov);
      const tl = texto(gl, L, 0, y, { anchor: 'middle', size, peso: 800, fill: C.rosa });
      const wl = D.medir(tl);
      pop(s, gl, o.tL - 0.1 + i * 0.12, 1e9, 0, y - size * 0.36, { k0: .6 });
      const cont = N.group(mov), gr = N.group(cont);
      const tr = texto(gr, resto, wl / 2, y, { size, peso: 800, fill: C.blanco });
      const wr = D.medir(tr);
      destapa(s, gr, wl / 2 - 4, y - size, wr + 12, size * 1.35, o.tP[i] - 0.12, .5);
      let wm = 0;
      if (me) {
        const gm = N.group(mov);
        const tm = texto(gm, me, -wl / 2 - size * 0.14, y, { anchor: 'end', size: size * 0.42, peso: 700, fill: C.suave });
        wm = D.medir(tm) + size * 0.14;
        mostrarEn(s, gm, o.tMe[i] - 0.15, 1e9, .3);
      }
      izq = Math.min(izq, -wl / 2 - wm); der = Math.max(der, wl / 2 + wr);
      return { gl, y, wl, wr };
    });
    if (o.ej) {                                            // columna del ejemplo, alineada a la derecha de las palabras
      const xE = der + size * 0.55;
      let wE = 0;
      filas.forEach((f, i) => {
        const e = N.group(mov);
        const te = texto(e, o.ej[i], xE, f.y - size * 0.24, { size: size * 0.3, peso: 700, fill: C.suave });
        wE = Math.max(wE, D.medir(te));
        mostrarEn(s, e, o.tP[i] + 0.25, 1e9, .35);
      });
      der = xE + wE;
    }
    const dx = -(izq + der) / 2;                          // desplazamiento para centrar el bloque completo
    const t0 = Math.min(...o.tP, ...o.tMe.filter(Boolean)) - 0.45;
    s.on(t => { const k = ease(ramp(t, t0, t0 + 0.6)); mov.setAttribute('transform', `translate(${(CX + dx * k).toFixed(1)},0)`); });
    return { out, mov, filas, dx };
  }

  // ================================================================ A · ¿invertir un compuesto? El truco AIA
  function escenaAIA() {
    const a = F0('A1') - 0.1, b = F0('B1') + 0.2;
    escena('aia', a, b, (s, g) => {
      const tAqui = F0('A2');
      // A1 · invertir… un intervalo compuesto (Do4–Mi5)
      const ki = N.group(g); chip(ki, 'INVERTIR', CX, 250, { size: 28, anchor: 'middle' });
      pop(s, ki, Wd('A1', 'invertir') - 0.15, tAqui + 0.3, CX, 250);
      const Q = N.group(g);
      aparece(s, Q, F0('A1'), tAqui + 0.3, { dy: 10 });
      const yM = 560;
      pentaClave(Q, 670, yM, 440);
      const xn = CX;
      const iv = N.group(Q); redondaEn(iv, 'C4', xn, yM); redondaEn(iv, 'E5', xn, yM);
      mostrarEn(s, iv, Wd('A1', 'intervalo') - 0.2, 1e9, .3);
      const q = N.group(g);
      const cq = N.group(q); color(cq, C.rosa); corchete(cq, xn + 60, yNota('E5', yM), yNota('C4', yM), { d: 14, w: 4 });
      interrogacion(q, 1200, yM + 52, 150);
      texto(q, 'compuesto', xn, yM + 175, { anchor: 'middle', size: 34, peso: 700, italic: true, fill: C.suave });
      aparece(s, q, Wd('A1', 'compuesto') - 0.15, tAqui + 0.3, { dy: 6 });
      // A2 · uno de mis trucos favoritos: el AIA
      const tr = N.group(g); chip(tr, 'TRUCO', CX, 190, { size: 26, anchor: 'middle', relleno: false });
      pop(s, tr, Wd('A2', 'trucos') - 0.1, b - 0.2, CX, 190);
      acrostico(s, g, { y: 390, paso: 180, size: 140, tL: Wd('A2', 'aia'),
        tMe: [Wd('A3', 'me'), 0, Wd('A3', 'me', 2)], tP: [Wd('A3', 'acerco'), Wd('A3', 'invierto'), Wd('A3', 'alejo')], tb: b - 0.2 });
    });
  }

  // ================================================================ B · C · los dos ejemplos, paso a paso en un pentagrama de cuatro compases
  /** E: {titulo, tTit, t0, pasos:[{fija, nueva, vieja}], ints:[4], tm:[4] (entra cada compás), tc:[4] (etiquetas), tFin (último paso), palabras} */
  function ejemploAIA(s, g, E, b) {
    const yM = 480, xP = 170, anchoP = 1580, yCh = 690;
    const kick = N.group(g); chip(kick, E.titulo, CX, 250, { size: 26, anchor: 'middle', relleno: false });
    pop(s, kick, E.tTit - 0.1, b - 0.2, CX, 250);
    const G = N.group(g);
    aparece(s, G, E.t0 - 0.2, b - 0.2, { dy: 10 });
    const P = pentaClave(G, xP, yM, anchoP);
    const xI = P.x0 + 10, xF = xP + anchoP, wC = (xF - xI) / 4;
    for (let k = 1; k <= 4; k++) barra(G, xI + k * wC, yM);
    const xc = i => xI + (i + 0.5) * wC;
    // la cadena de etiquetas y los pasos A · I · A (se encienden en rosa)
    const LET = ['A', 'I', 'A'];
    for (let j = 1; j <= 3; j++) {
      const St = N.group(G);
      const x1 = xc(j - 1) + 66, x2 = xc(j) - 66, xm = (x1 + x2) / 2, r = 27;
      N.line(St, x1, yCh, xm - r - 6, yCh, 3.5, { 'stroke-linecap': 'round' });
      flecha(St, xm + r + 6, yCh, x2, yCh, { w: 3.5, cab: 13 });
      letraCirc(St, LET[j - 1], xm, yCh, r, 30);
      texto(St, E.palabras[j - 1], xm, yCh + 66, { anchor: 'middle', size: 26, peso: 700, fill: 'currentColor' });
      const ta = E.tm[j] - 0.15, tb = j < 3 ? E.tm[j + 1] - 0.15 : E.tFin;
      s.on(t => {
        const on = win(t, ta, tb, .3, .3), hecho = ramp(t, ta, ta + 0.3);
        color(St, mezcla(C.suave, C.rosa, on));
        opa(St, lerp(0.4, 1, hecho));
      });
    }
    // (28-sep, Iago) cada paso: la nota que cambia de octava SALE del compás anterior (cabeza rosa) y VIAJA por su
    // arco hasta el compás nuevo, donde ya espera la que se queda. Arcos y cabezas van encima de todo.
    const capaArc = N.group(G), capaCab = N.group(G);
    const notas = [];                                      // por compás: {nota: grupo}
    E.pasos.forEach((p, i) => {
      const M = N.group(G);
      const tm = E.tm[i], tNext = i < 3 ? E.tm[i + 1] - 0.15 : E.tFin;
      const fija = redondaEn(M, p.fija, xc(i), yM);
      notas[i] = { [p.fija]: fija };
      if (!p.vieja) {
        mostrarEn(s, fija, tm - 0.15, 1e9, .3);
        const otra = redondaEn(M, p.nueva, xc(i), yM); mostrarEn(s, otra, tm - 0.15, 1e9, .3);
        notas[i][p.nueva] = otra;
      } else {
        const ta = tm - 0.1, tb = ta + 0.85;
        mostrarEn(s, fija, ta - 0.3, 1e9, .3);             // la que se queda ya está en el compás nuevo
        const nv = redondaEn(M, p.nueva, xc(i), yM);       // la que llega, con sus líneas adicionales, al llegar la cabeza
        s.on(t => {
          opa(nv, ease(ramp(t, tb - 0.08, tb + 0.08)));
          color(nv, mezcla(C.rosa, C.blanco, ease(ramp(t, tNext, tNext + 0.4))));
        });
        notas[i][p.nueva] = nv;
        // de dónde sale: la misma nota en el compás anterior (siempre la que allí se quedaba) se enciende al salir
        const org = notas[i - 1][p.vieja];
        s.on(t => color(org, mezcla(C.blanco, C.rosa, win(t, ta - 0.3, tb + 0.35, .25, .4))));
        const prev = E.pasos[i - 1], otra = prev.fija === p.vieja ? prev.nueva : prev.fija;
        const yv = yNota(p.vieja, yM), yn = yNota(p.nueva, yM), yf = yNota(p.fija, yM), yo = yNota(otra, yM);
        // llega por el lado contrario a la que se queda; sale en horizontal si la otra nota está pegada (una 3ª)
        const sube = yn < yv, fijaArriba = yf < yn, pegada = Math.abs(yo - yv) <= SP + 1 && (sube ? yo < yv : yo > yv);
        const dy2 = fijaArriba ? 110 : -80;
        const dy1 = pegada ? 0 : (dy2 > 0 ? (sube ? 40 : 90) : -60);
        cambioOctava(s, { capaArco: capaArc, capaCabeza: capaCab, ta, tb, dy1, dy2, rotulo: 'octava', apaga: tNext,
          org: pto(p.vieja, xc(i - 1), yM), otras: [pto(otra, xc(i - 1), yM)], dest: pto(p.nueva, xc(i), yM), fijas: [pto(p.fija, xc(i), yM)] });
      }
      const ch = N.group(G); chipInt(ch, E.ints[i], xc(i), yCh, { size: 34 });
      pop(s, ch, E.tc[i] - 0.12, 1e9, xc(i), yCh);
    });
    G.appendChild(capaArc); G.appendChild(capaCab);
  }
  function escenaEjemplo1() {
    const a = F0('B1') - 0.1, b = F0('C1') + 0.2;
    escena('ejemplo1', a, b, (s, g) => ejemploAIA(s, g, {
      titulo: 'EJEMPLO', tTit: F0('B1'), t0: F0('B1'),
      pasos: [{ fija: 'C4', nueva: 'E5' }, { fija: 'E5', nueva: 'C5', vieja: 'C4' }, { fija: 'C5', nueva: 'E4', vieja: 'E5' }, { fija: 'E4', nueva: 'C6', vieja: 'C5' }],
      ints: ['10M', '3M', '6ªm', '13ªm'],
      tm: [F0('B1'), Wd('B2', 'acerco'), Wd('B3', 'invierto'), Wd('B4', 'alejo')],
      tc: [Wd('B1', 'decima'), Wd('B2', 'tercera'), Wd('B3', 'sexta'), Wd('B4', 'decimotercera')],
      tFin: F1('B4') + 0.4, palabras: ['me acerco', 'invierto', 'me alejo'],
    }, b));
  }
  function escenaEjemplo2() {
    const a = F0('C1') - 0.1, b = F0('D1') + 0.2;
    escena('ejemplo2', a, b, (s, g) => ejemploAIA(s, g, {
      titulo: 'OTRO EJEMPLO', tTit: F0('C1'), t0: F0('C1') + 0.1,
      pasos: [{ fija: 'C4', nueva: 'G5' }, { fija: 'G5', nueva: 'C5', vieja: 'C4' }, { fija: 'C5', nueva: 'G4', vieja: 'G5' }, { fija: 'G4', nueva: 'C6', vieja: 'C5' }],
      ints: ['12J', '5J', '4J', '11J'],
      tm: [Wd('C1', 'duodecima') - 0.3, Wd('C2', 'acerco'), Wd('C3', 'invierto'), Wd('C4', 'alejo')],
      tc: [Wd('C1', 'duodecima'), Wd('C2', 'quinta'), Wd('C3', 'cuarta'), Wd('C4', 'undecima')],
      tFin: F1('C4') + 0.4, palabras: ['me acerco', 'invierto', 'me alejo'],
    }, b));
  }

  // ================================================================ D · dos pentagramas: clave de Fa abajo y de Sol arriba (piano)
  function icoTeclado(parent, x, y, w, h) {
    const G = N.group(parent, 'ico');
    const n = 7, kw = w / n;
    N.el('rect', { x, y, width: w, height: h, rx: 8, fill: 'none', stroke: 'currentColor', 'stroke-width': 4 }, G);
    for (let i = 1; i < n; i++) N.line(G, x + i * kw, y, x + i * kw, y + h, 3);
    for (const i of [0, 1, 3, 4, 5]) N.el('rect', { x: x + (i + 1) * kw - kw * 0.32, y, width: kw * 0.64, height: h * 0.6, rx: 3, fill: 'currentColor' }, G);
    return G;
  }
  function escenaPiano() {
    const a = F0('D1') - 0.1, b = Wd('S1', 'liando') + 0.1;
    escena('piano', a, b, (s, g) => {
      const tD2 = F0('D2');
      // D1 · en un solo pentagrama, la distancia es muy grande (Mi3–Do5: tres líneas adicionales)
      const U = N.group(g);
      aparece(s, U, F0('D1'), tD2 + 0.4, { dy: 10 });
      const yU = 500, xu = 390;
      pentaClave(U, 110, yU, 500);
      redondaEn(U, 'C5', xu, yU);
      const mi = redondaEn(U, 'E3', xu, yU);
      destella(s, mi, [Wd('D1', 'grandes') - 0.1], { d: 1.2 });
      const cu = N.group(U); color(cu, C.rosa); corchete(cu, xu + 60, yNota('C5', yU), yNota('E3', yU), { d: 14, w: 4 });
      mostrarEn(s, cu, Wd('D1', 'distancias') - 0.15, 1e9);
      const c1 = N.group(U); chipInt(c1, '13ªm', xu, 730, { size: 32 });
      pop(s, c1, Wd('D1', 'distancias') + 0.1, 1e9, xu, 730);
      const fU = N.group(g); color(fU, C.suave); flecha(fU, 650, 520, 780, 520, { w: 5, cab: 18 });
      mostrarEn(s, fU, Wd('D1', 'escribirlo') - 0.1, tD2 + 0.4);
      // el sistema de piano, a la derecha
      const yS = 390, xS = 860, ancho = 640;
      const Sg = N.group(g);
      aparece(s, Sg, Wd('D1', 'dos') - 0.25, b - 0.3, { dy: 10 });
      const SIS = sistema(Sg, xS, yS, ancho);
      const yF = SIS.yF;
      const clSol = SIS.sol.g.querySelector('text'), clFa = SIS.fa.g.querySelector('text'), llave = SIS.g.lastChild;
      // clave de Fa abajo (se enciende) → Mi3 · clave de Sol arriba → Do5
      const tFa = Wd('D1', 'fa') - 0.15, tSol = Wd('D1', 'sol') - 0.15, tCl = Wd('D2', 'claves') - 0.15;
      s.on(t => {
        const kFa = Math.max(win(t, tFa, tSol + 0.3, .3, .3), win(t, tCl, Wd('D2', 'grandes') + 0.4, .3, .4));
        const kSol = Math.max(win(t, tSol, F1('D1') + 0.5, .3, .4), win(t, tCl, Wd('D2', 'grandes') + 0.4, .3, .4));
        color(clFa, mezcla(C.blanco, C.rosa, kFa)); color(clSol, mezcla(C.blanco, C.rosa, kSol));
      });
      destella(s, llave, [Wd('D2', 'doble') - 0.1], { d: 1.3 });
      const x1 = xS + 250;
      const nMi = redondaEn(Sg, 'E3', x1, yF, { clave: 'fa' });
      mostrarEn(s, nMi, Wd('D1', 'abajo') - 0.2, 1e9, .3);
      const nDo = redondaEn(Sg, 'C5', x1, yS);
      mostrarEn(s, nDo, Wd('D1', 'arriba') - 0.2, 1e9, .3);
      const cs = N.group(Sg); color(cs, C.rosa); corchete(cs, x1 + 60, yNota('C5', yS), yNota('E3', yF, 'fa'), { d: 14, w: 4 });
      mostrarEn(s, cs, F1('D1') - 0.1, 1e9, .35);
      const c2 = N.group(Sg); chipInt(c2, '13ªm', x1 + 140, (yS + yF) / 2, { size: 32 });
      pop(s, c2, F1('D1'), 1e9, x1 + 140, (yS + yF) / 2);
      // D2 · registros más grandes: notas muy agudas y muy graves
      const x2 = xS + 500;
      const xr = xS + ancho + 70;
      const rg = N.group(g); color(rg, C.rosa);
      const yA = yNota('C6', yS), yB = yNota('C2', yF, 'fa');
      flecha(rg, xr, (yA + yB) / 2, xr, yA - 6, { w: 4, cab: 16 }); flecha(rg, xr, (yA + yB) / 2, xr, yB + 6, { w: 4, cab: 16 });
      mostrarEn(s, rg, Wd('D2', 'registros') - 0.15, b - 0.3);
      const ag = N.group(g);
      const nAg = redondaEn(ag, 'C6', x2, yS); color(nAg, C.rosa);
      texto(ag, 'muy agudas', xr + 34, yA + 12, { size: 34, peso: 800, fill: C.blanco });
      aparece(s, ag, Wd('D2', 'agudas') - 0.2, b - 0.3, { dy: 6 });
      const gr = N.group(g);
      const nGr = redondaEn(gr, 'C2', x2, yF, { clave: 'fa' }); color(nGr, C.rosa);
      texto(gr, 'muy graves', xr + 34, yB + 12, { size: 34, peso: 800, fill: C.blanco });
      aparece(s, gr, Wd('D2', 'graves') - 0.2, b - 0.3, { dy: 6 });
      // los pianistas: un teclado, donde estaba el pentagrama solo
      const tk = N.group(g), tkIn = N.group(tk); color(tkIn, C.suave);
      icoTeclado(tkIn, 190, 430, 350, 170);
      aparece(s, tk, Wd('D2', 'pianistas') - 0.2, b - 0.3, { dy: 10 });
      resalta(s, tkIn, Wd('D2', 'pianistas') - 0.2, Wd('D2', 'pentagrama'), { de: C.suave, a: C.rosa });
    });
  }

  // ================================================================ S · el truco para comprobar: suman 23
  function escenaSuma() {
    const a = F0('S1') - 0.1, b = F0('E1') + 0.2;
    escena('suma', a, b, (s, g) => {
      // tarjeta «para comprobar» con la regla dentro: intervalo + inversión = 23 (cada trozo al decirlo)
      const Tj = N.group(g);
      regla(Tj, 440, 170, 1040, 190, 'PARA COMPROBAR');
      aparece(s, Tj, Wd('S1', 'comprobarlo') - 0.25, b - 0.2, { dy: 10 });
      const yR = 318;
      const R = N.group(g);
      const piezas = [['intervalo', C.blanco, Wd('S1', 'intervalo')], ['+', C.suave, Wd('S1', 'y')], ['inversión', C.blanco, Wd('S1', 'inversion')],
        ['=', C.suave, Wd('S1', 'sumar')], ['23', C.rosa, Wd('S1', 'veintitres')]];
      const els = piezas.map(([txt, col]) => texto(R, txt, 0, yR, { size: 54, peso: 800, fill: col }));
      const ws = els.map(e => D.medir(e)), gap = 22;
      let x = CX - (ws.reduce((p, q) => p + q, 0) + gap * (els.length - 1)) / 2;
      els.forEach((e, i) => { e.setAttribute('x', x.toFixed(1)); x += ws[i] + gap; mostrarEn(s, e, piezas[i][2] - 0.15, b - 0.2, .3, .4); });
      const tr = N.group(g);
      texto(tr, 'truco', 1400, 216, { anchor: 'end', size: 28, peso: 700, italic: true, fill: C.suave });
      marca(tr, true, 1436, 206, 14);
      aparece(s, tr, Wd('S1', 'truco') - 0.2, b - 0.2, { dy: 6 });
      // recordatorio: en los simples sumaban 9 · los compuestos, 23
      const yK = 490;
      const k1 = N.group(g);
      // (28-sep, Iago) remite al vídeo de los simples («¿te acuerdas?»): se puede pulsar (↗ = se abre en otra pestaña)
      const tS = texto(k1, [['simples: ', C.suave], ['9', C.suave]], CX - 96, yK, { anchor: 'end', size: 36, peso: 700 });
      const wS = D.medir(tS);
      const ia = N.group(k1); icoAbrir(ia, CX - 84, yK - 27, 26); color(ia, C.rosa);
      k1.insertBefore(N.el('rect', { x: (CX - 110 - wS).toFixed(1), y: yK - 44, width: (wS + 66).toFixed(1), height: 62, rx: 10, fill: 'rgba(0,0,0,0)' }), k1.firstChild);   // zona que se puede pulsar
      enlaceVideo(k1, 'inversion-intervalos');
      aparece(s, k1, Wd('S2', 'simples') - 0.2, b - 0.2, { dy: 6 });
      const sep = N.group(g); N.line(sep, CX, yK - 36, CX, yK + 8, 2, { stroke: C.tenue }); mostrarEn(s, sep, Wd('S2', 'compuestos') - 0.2, b - 0.2);
      const k2 = N.group(g);
      texto(k2, [['compuestos: ', C.blanco], ['23', C.rosa]], CX + 60, yK, { size: 40, peso: 800 });
      aparece(s, k2, Wd('S2', 'compuestos') - 0.2, b - 0.2, { dy: 6 });
      // los ejemplos de antes: 10M → 13ªm · 12J → 11J
      const filas = [
        { y: 660, a: '10M', b: '13ªm', n: ['10', '13'], t: [Wd('S4', 'diez'), Wd('S4', 'trece'), Wd('S4', 'veintitres')] },
        { y: 800, a: '12J', b: '11J', n: ['12', '11'], t: [Wd('S4', 'doce'), Wd('S4', 'once'), Wd('S4', 'veintitres', 2)] },
      ];
      filas.forEach((f, i) => {
        const E = N.group(g);
        const ca = N.group(E); chipInt(ca, f.a, 540, f.y - 24, { size: 30 });
        const fl = N.group(E); color(fl, C.suave); flecha(fl, 600, f.y - 24, 676, f.y - 24, { w: 3.5, cab: 13 });
        const cb = N.group(E); chipInt(cb, f.b, 740, f.y - 24, { size: 30 });
        aparece(s, E, Wd('S3', 'ejemplos') - 0.2 + i * 0.25, b - 0.2, { dy: 8 });
        const xs = [960, 1065, 1170, 1275, 1390];
        const P = [[f.n[0], C.blanco, 76, f.t[0]], ['+', C.suave, 64, f.t[1] - 0.2], [f.n[1], C.blanco, 76, f.t[1]], ['=', C.suave, 64, f.t[2] - 0.2], ['23', C.rosa, 76, f.t[2]]];
        P.forEach(([txt, col, sz, tt], k) => { const e = texto(g, txt, xs[k], f.y, { anchor: 'middle', size: sz, peso: 800, fill: col }); mostrarEn(s, e, tt - 0.12, b - 0.2, .25, .4); });
      });
    });
  }

  // ================================================================ E · la especie, al revés (como en los simples)
  function escenaEspecie() {
    const a = F0('E1') - 0.1, b = F0('F1') + 0.2;
    escena('especie', a, b, (s, g) => {
      const ki = N.group(g); chip(ki, 'LA ESPECIE, AL REVÉS', CX, 270, { size: 26, anchor: 'middle', relleno: false });
      pop(s, ki, Wd('E1', 'especie') - 0.15, b - 0.2, CX, 270);
      const tInv = Wd('E3', 'inversion'), tCam = Wd('E3', 'cambian');
      const filas = [
        { y: 450, a: 'm', b: 'M', pa: 'menor', pb: 'Mayor', ej: '13ªm ⇄ 10M', t: Wd('E2', 'menor') - 0.15, tb: Wd('E2', 'mayor') - 0.15, doble: true },
        { y: 630, a: 'D', b: 'A', pa: 'disminuida', pb: 'aumentada', ej: '12D ⇄ 11A', t: Wd('E2', 'disminuida') - 0.15, tb: Wd('E2', 'aumentada') - 0.15, doble: true },
        { y: 810, a: 'J', b: 'J', pa: 'justa', pb: 'justa', ej: '12J ⇄ 11J', t: Wd('E2', 'justa') - 0.15, tb: Wd('E2', 'justa', 2) - 0.15, doble: false },
      ];
      filas.forEach((f, i) => {
        const G = N.group(g);
        aparece(s, G, f.t, b - 0.2, { dy: 10 });
        const rect = panel(G, 330, f.y - 80, 1260, 150, { rx: 22 });
        texto(G, f.a, 520, f.y + 26, { anchor: 'middle', size: 84, peso: 800, fill: C.blanco });
        texto(G, f.pa, 520, f.y + 58, { anchor: 'middle', size: 22, peso: 600, fill: C.suave });
        const fl = N.group(G); color(fl, C.rosa);
        if (f.doble) { flecha(fl, 610, f.y - 12, 760, f.y - 12, { w: 5, cab: 16 }); flecha(fl, 760, f.y + 16, 610, f.y + 16, { w: 5, cab: 16 }); }
        else flecha(fl, 610, f.y, 760, f.y, { w: 5, cab: 16 });
        const B = N.group(G);
        texto(B, f.b, 850, f.y + 26, { anchor: 'middle', size: 84, peso: 800, fill: 'currentColor' });
        texto(B, f.pb, 850, f.y + 58, { anchor: 'middle', size: 22, peso: 600, fill: C.suave });
        color(B, C.rosa);
        mostrarEn(s, fl, f.tb - 0.2, 1e9, .3); mostrarEn(s, B, f.tb, 1e9, .3);
        const ej = texto(G, f.ej, 1290, f.y + 14, { anchor: 'middle', size: 44, peso: 700, fill: C.suave });
        mostrarEn(s, ej, tInv - 0.3 + i * 0.3, 1e9, .4);
        const tSig = (filas[i + 1] ? filas[i + 1].t : F0('E3')) - 0.1;
        s.on(t => {
          const k = Math.max(win(t, f.t, tSig, .25, .3), f.doble ? win(t, tCam - 0.2, tCam + 1.4, .25, .5) : 0);
          rect.setAttribute('stroke', mezcla('#3a4556', C.rosa, k));
          rect.setAttribute('stroke-width', (1.5 + 1.5 * k).toFixed(2));
        });
      });
    });
  }

  // ================================================================ F · recuérdalo: AIA
  function escenaResumen() {
    const a = F0('F1') - 0.1, b = T.acorde + 0.15;
    escena('resumen', a, b, (s, g) => {
      const ki = N.group(g); chip(ki, 'RECUÉRDALO', CX, 190, { size: 26, anchor: 'middle' });
      pop(s, ki, F0('F1') - 0.05, b, CX, 190, { fo: .4 });
      acrostico(s, g, { y: 380, paso: 175, size: 130, tL: Wd('F1', 'aia'), ej: ['10M → 3M', '3M → 6ªm', '6ªm → 13ªm'],
        tMe: [Wd('F1', 'me'), 0, Wd('F1', 'me', 2)], tP: [Wd('F1', 'acerco'), Wd('F1', 'invierto'), Wd('F1', 'alejo')], tb: b, fo: .4 });
      const prac = N.group(g); chip(prac, '¡VAMOS A POR ELLOS!', CX, 880, { size: 30, anchor: 'middle' });
      pop(s, prac, F0('F2') - 0.1, b, CX, 880, { fo: .4 });
    });
  }

  const ORDEN = [escenaAIA, escenaEjemplo1, escenaEjemplo2, escenaPiano, escenaSuma, escenaEspecie, escenaResumen];

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
