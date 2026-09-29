/* =====================================================================
   ESCENAS · Tonalidades vecinas (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (tonalidades-vecinas/escenas_cuerpo.js). Todo es función pura de t.
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


  // ================================================================ E8 · TONALIDADES VECINAS
  const TITULO = { kicker: 'TEORÍA  ·  TONALIDADES', lineas: ['TONALIDADES VECINAS'], sub: 'Armadura · Relativo · Una más y una menos' };

  // ---------------------------------------------------------------- el tablero: tres filas de armaduras
  // arriba, la que tiene una alteración más (+1); en medio, la del enunciado; abajo, la que tiene una menos (−1).
  // Cada fila lleva sus dos tonalidades: la Mayor y su relativo menor → 3 × 2 = 6. Mismo sitio en todas las escenas.
  const L0 = { xp: 480, wp: 300, sp: SP, yf: [340, 560, 780], xc: 815, xmay: 1060, xmen: 1300, size: 34, sizeC: 44, xll: 1418, arco: 84, sizeMM: 42 };
  const L1 = { xp: 1010, wp: 250, sp: 22, yf: [330, 530, 730], xc: 1290, xmay: 1480, xmen: 1690, size: 28, sizeC: 36, arco: 64, sizeMM: 34 };   // mini (conclusión)
  const DYF = L0.yf[1] - L0.yf[0];
  const GL = { b: 'accidentalFlat', '#': 'accidentalSharp' };

  /** Pentagrama de la fila i (clave + armadura de n alteraciones, cada una en su grupo). */
  function filaPenta(parent, L, i, n, tipo) {
    const G = N.group(parent, 'fila');
    const y = L.yf[i];
    const P = pentaClave(G, L.xp, y, L.wp, L.sp);
    const A = N.armaduraGen(G, P.x0 + 4, y, L.sp, n, tipo);
    return { G, P, A, y, L, tipo };
  }
  /** Centro aproximado de la alteración j de una fila (para los «pop»). */
  function centroAlt(F, j) {
    const it = F.A.items[j], m = N.M[GL[F.tipo]], sp = F.L.sp;
    return [it.x + m.adv * sp / 2, F.y - it.pos * sp - (F.tipo === 'b' ? 0.5 * sp : 0)];
  }
  /** La alteración j aparece («pop») en rosa y se queda en blanco a partir de tBlanco. */
  function altRosa(s, F, j, ta, tb, tBlanco) {
    const g = F.A.items[j].g, [cx, cy] = centroAlt(F, j);
    pop(s, g, ta, tb, cx, cy, { fi: .25, k0: .4 });
    resalta(s, g, ta - 0.3, tBlanco != null ? tBlanco : ta + 1.3, { d: .3 });
  }
  /** Alteraciones que llegan deslizándose desde la fila de al lado (dy px); fuera = {j: t} las que se van. */
  function llegan(s, F, js, dy, t0, fuera) {
    fuera = fuera || {};
    js.forEach((j, n) => {
      const g = F.A.items[j].g, ta = t0 + n * 0.07, tf = fuera[j];
      s.on(t => {
        const k = ease(ramp(t, ta, ta + 0.7));
        // semitransparente mientras viaja (se lee como copia), opaca al llegar
        opa(g, ramp(t, ta, ta + 0.2) * (0.45 + 0.55 * k * k) * (tf != null ? 1 - ease(ramp(t, tf, tf + 0.45)) : 1));
        g.setAttribute('transform', `translate(0,${(dy * (1 - k)).toFixed(1)})`);
      });
    });
  }
  /** Hueco (contorno discontinuo, rosa) donde estaba la alteración j. */
  function hueco(parent, F, j) {
    const it = F.A.items[j], m = N.M[GL[F.tipo]], sp = F.L.sp, cy = F.y - it.pos * sp;
    const G = N.group(parent, 'hueco'); color(G, C.rosa);
    N.el('rect', { x: it.x - 5, y: cy - m.ne[1] * sp - 5, width: m.adv * sp + 10, height: (m.ne[1] - m.sw[1]) * sp + 10, rx: 7,
      fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-dasharray': '7 6' }, G);
    return G;
  }
  /** Lo ya explicado pasa de rosa a suave a partir de t1. */
  function aSuave(s, g, t1) { s.on(t => color(g, mezcla(C.rosa, C.suave, ease(ramp(t, t1, t1 + 0.5))))); }
  /** «3♭», «¿3♭?», «0»: número y alteración en Bravura (currentColor). Devuelve el grupo con _w. */
  function cuentaAlt(parent, n, tipo, x, y, o) {
    o = o || {};
    const size = o.size || 44, G = N.group(parent, 'cuentaAlt');
    const t = texto(G, (o.pre || '') + n, x, y + size * 0.36, { size, peso: 800, italic: o.italic, fill: 'currentColor' });
    let w = D.medir(t);
    if (n > 0 && tipo) {
      const gl = GL[tipo], sa = size * 0.36;
      N.glyph(G, gl, x + w + size * 0.05, y + size * 0.36 - size * 0.33, sa);
      w += size * 0.05 + N.M[gl].adv * sa;
    }
    if (o.post) { const p = texto(G, o.post, x + w + size * 0.06, y + size * 0.36, { size, peso: 800, italic: o.italic, fill: 'currentColor' }); w += size * 0.06 + D.medir(p); }
    color(G, o.color || C.blanco);
    G._w = w;
    return G;
  }
  /** Chip de texto con el aspecto de chipTon («Mayor», «menor»). */
  function chipTxt(parent, txt, x, y, o) {
    o = o || {};
    const W = N.group(parent, 'chipTxt'), size = o.size || 34;
    const t = texto(W, txt, x, y + size * 0.36, { anchor: 'middle', size, peso: 800, fill: o.color || '#fff' });
    const w = D.medir(t) + 2 * size * 0.62, h = size * 1.75;
    const r = N.el('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 14, fill: o.fondo || C.rosa, stroke: o.borde || 'none', 'stroke-width': 3 }, W);
    W.insertBefore(r, t);
    W._w = w; W._h = h; W._x = x - w / 2;
    return W;
  }
  /** Casilla de tonalidad: entra en rosa (se está explicando) y se queda con fondo de panel y borde blanco.
   *  o: {nota, modo} (chipTon) o {txt}; rosa: ventanas [[t0, t1]…] en rosa (por defecto, al entrar); suave: secundaria. */
  function casilla(s, parent, x, y, ta, tb, o) {
    o = o || {};
    const out = N.group(parent, 'casilla'), A = N.group(out), B = N.group(out), size = o.size || 34;
    const mk = (g, st) => o.nota ? chipTon(g, o.nota, o.modo, x, y, Object.assign({ size }, st)) : chipTxt(g, o.txt, x, y, Object.assign({ size }, st));
    const cA = mk(A, o.suave ? { fondo: C.panel, borde: C.suave, color: C.suave } : { fondo: C.panel, borde: C.blanco });
    mk(B, { borde: C.rosa });                      // borde rosa: tapa el filo blanco de la capa de debajo
    const ven = o.rosa || (ta != null ? [[ta - 0.3, ta + 1.5]] : []);
    s.on(t => { let k = 0; for (const [p, q] of ven) k = Math.max(k, win(t, p, q, .3, .5)); opa(B, k); });
    if (ta != null) pop(s, out, ta, tb, x, y, { k0: .6 });
    return { out, x0: cA._x, w: cA._w, h: cA._h, x, y };
  }
  /** Flecha «relativo» de la Mayor a su menor (misma fila). */
  function flechaRel(parent, cM, cm) {
    const G = N.group(parent, 'rel'); color(G, C.suave);
    flecha(G, cM.x0 + cM.w + 12, cM.y, cm.x0 - 12, cM.y, { w: 3.5, cab: 13 });
    return G;
  }
  /** Número (1…6) en la esquina de una casilla. */
  function insignia(s, parent, n, c, ta, tb) {
    const r = c.h > 55 ? 17 : 15;
    const G = N.group(parent, 'insignia'), x = c.x0 - 3, y = c.y - c.h / 2 - 3;
    N.el('circle', { cx: x, cy: y, r, fill: C.rosa, stroke: '#0b1320', 'stroke-width': 3 }, G);
    texto(G, String(n), x, y + r * 0.44, { anchor: 'middle', size: r * 1.24, peso: 800, fill: '#fff' });
    pop(s, G, ta, tb, x, y, { k0: .3, fi: .25 });
    return G;
  }
  /** Llave que abarca el tablero y el total: 6. */
  function llaveSeis(s, parent, x, y1, y2, ta, tb, o) {
    o = o || {};
    const G = N.group(parent, 'seis'), ym = (y1 + y2) / 2, r = o.r || 18;
    const ll = N.group(G); color(ll, C.rosa);
    N.el('path', { d: `M${x},${y1} q${r},0 ${r},${r} V${ym - r} q0,${r} ${r},${r} q${-r},0 ${-r},${r} V${y2 - r} q0,${r} ${-r},${r}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ll);
    mostrarEn(s, ll, ta - 0.2, tb, .3, .5);
    const n6 = N.group(G);
    texto(n6, '6', x + 2 * r + 46, ym + 36, { anchor: 'middle', size: o.size || 104, peso: 800, fill: C.rosa });
    pop(s, n6, ta, tb, x + 2 * r + 46, ym, { k0: .4 });
    return G;
  }
  /** Flecha curva «+1» / «−1» a la izquierda de las filas (de la fila iDe a la iA). */
  function masMenos(parent, L, iDe, iA, txt) {
    const G = N.group(parent, 'masMenos'); color(G, C.rosa);
    const x = L.xp - 14, y1 = L.yf[iDe], y2 = L.yf[iA], sg = Math.sign(y2 - y1), dx = -L.arco;
    arcoLado(G, x, y1 + sg * 28, y2, dx, { w: 4, cab: 14 });
    texto(G, txt, x + 0.75 * dx - 16, (y1 + y2) / 2 + 14, { anchor: 'end', size: L.sizeMM, peso: 800, fill: 'currentColor' });
    return G;
  }
  /** Varias piezas en una línea centrada en cx (cada una se dibuja en x = 0 y devuelve su ancho). */
  function enLinea(parent, cx, gap, piezas) {
    const ps = piezas.map(f => { const out = N.group(parent), inn = N.group(out); return { out, inn, w: f(inn) }; });
    const total = ps.reduce((a, p) => a + p.w, 0) + gap * (ps.length - 1);
    let x = cx - total / 2;
    for (const p of ps) { p.x = x; p.cx = x + p.w / 2; p.inn.setAttribute('transform', `translate(${x.toFixed(1)},0)`); x += p.w + gap; }
    return ps;
  }
  /** Latido breve (escala) de un grupo sin otra transformación. */
  function latido(s, g, t0, cx, cy, o) {
    o = o || {};
    const d = o.d || .6, a = o.a || .1;
    s.on(t => { const e = 1 + a * Math.sin(Math.PI * ramp(t, t0, t0 + d)); g.setAttribute('transform', `translate(${cx},${cy}) scale(${e.toFixed(4)}) translate(${-cx},${-cy})`); });
  }
  /** Tarjeta pequeña (esquina) que remite al vídeo «Indica la tonalidad», con la miniatura de su portada. */
  function tarjetaVideo(s, parent, x, y, ta, tb, tTit) {
    const G = N.group(parent, 'tarjeta');
    const w = 440, h = 136;
    panel(G, x, y, w, h, { rx: 18, stroke: 'rgba(236,72,153,0.85)', sw: 2 });
    const mx = x + 16, my = y + 16, mw = 186, mh = 104;
    D.foto(G, 'fondo.jpg', mx, my, mw, mh, { rx: 10, borde: 'rgba(255,255,255,0.35)' });
    N.el('rect', { x: mx, y: my, width: mw, height: mh, rx: 10, fill: '#081628', opacity: 0.6 }, G);
    texto(G, 'INDICA LA TONALIDAD', mx + mw / 2, my + 40, { anchor: 'middle', size: 14, peso: 800, ls: '0.03em', fill: C.blanco });
    N.el('rect', { x: mx + mw / 2 - 18, y: my + 54, width: 36, height: 36, rx: 8, fill: C.rosa }, G);
    N.el('path', { d: `M${mx + mw / 2 - 6},${my + 63} v18 l15,-9 z`, fill: '#fff' }, G);
    const xt = mx + mw + 22;
    texto(G, 'REPASA EL VÍDEO', xt, y + 46, { size: 16, peso: 800, ls: '0.12em', fill: C.rosa });
    const tt = N.group(G); color(tt, C.blanco);
    texto(tt, 'Indica', xt, y + 86, { size: 32, peso: 800, fill: 'currentColor' });
    texto(tt, 'la tonalidad', xt, y + 120, { size: 32, peso: 800, fill: 'currentColor' });
    resalta(s, tt, tTit, null);
    // (28-sep, Iago) la tarjeta se puede pulsar: abre «Indica la tonalidad» en una pestaña nueva
    const ic = N.group(G); color(ic, C.rosa); icoAbrir(ic, x + w - 36, y + 12, 24);
    enlaceVideo(G, 'indica-la-tonalidad');
    aparece(s, G, ta, tb, { dy: -10 });
    return G;
  }

  // ================================================================ D · la idea: armaduras vecinas (+1 / −1) y sus relativos → 6
  function escenaIdea() {
    const a = F0('D1') - 0.2, b = F0('E1') + 0.2, fin = b - 0.3;
    escena('idea', a, b, (s, g) => {
      const L = L0, [yA, yM, yB] = L.yf;
      const t0 = F0('D1') - 0.05;
      const tArm = Wd('D1', 'armaduras') - 0.1, tVec = Wd('D1', 'vecinas', 2) - 0.15;
      const tUna = Wd('D1', 'una') - 0.1, tMas = Wd('D1', 'mas') - 0.1;
      const tUna2 = Wd('D1', 'una', 2) - 0.1, tMenos = Wd('D1', 'menos') - 0.1;
      const tRel = Wd('D2', 'relativo') - 0.15;
      const tTot = F0('D3') - 0.1, tSeis = Wd('D3', 'seis') - 0.1, tDan = Wd('D3', 'contando') - 0.1;
      // en medio: la tonalidad que te dan, con su armadura (aquí, un dibujo con dos sostenidos)
      const M = filaPenta(g, L, 1, 2, '#');
      aparece(s, M.G, t0, fin, { dy: 10 });
      resalta(s, M.A.g, tArm, tArm + 1.1);
      // arriba y abajo: la misma armadura (llega desde la de en medio)…
      const Ar = filaPenta(g, L, 0, 3, '#'), Ab = filaPenta(g, L, 2, 2, '#');
      mostrarEn(s, Ar.G, tVec, fin); mostrarEn(s, Ab.G, tVec, fin);
      llegan(s, Ar, [0, 1], DYF, tVec);
      llegan(s, Ab, [0, 1], -DYF, tVec, { 1: tMenos });
      // …con una alteración más (arriba) y una menos (abajo)
      const mA = masMenos(g, L, 1, 0, '+1'); aparece(s, mA, tUna, fin, { dy: 0 });
      altRosa(s, Ar, 2, tMas, fin, tRel);
      const mB = masMenos(g, L, 1, 2, '−1'); aparece(s, mB, tUna2, fin, { dy: 0 });
      const hu = hueco(g, Ab, 1); mostrarEn(s, hu, tMenos + 0.2, fin);
      [mA, mB, hu].forEach(x => aSuave(s, x, tRel));
      // las tonalidades: la Mayor de cada armadura… y (D2) su relativo menor
      const cM = [
        casilla(s, g, L.xmay, yA, tMas + 0.25, fin, { txt: 'Mayor' }),
        casilla(s, g, L.xmay, yM, t0 + 0.3, fin, { txt: 'Mayor', rosa: [[tDan, 1e9]] }),
        casilla(s, g, L.xmay, yB, tMenos + 0.25, fin, { txt: 'Mayor' }),
      ];
      const cm = L.yf.map((y, i) => casilla(s, g, L.xmen, y, tRel + i * 0.12, fin, { txt: 'menor' }));
      cM.forEach((c, i) => { const f = flechaRel(g, c, cm[i]); mostrarEn(s, f, tRel + i * 0.12 - 0.1, fin); });
      // D3 · en total, seis (contando la que te dan)
      [cM[1], cm[1], cM[0], cm[0], cM[2], cm[2]].forEach((c, i) => insignia(s, g, i + 1, c, tTot + i * 0.09, fin));
      llaveSeis(s, g, L.xll, yA - 50, yB + 50, tSeis, fin);
      const dan = texto(g, 'la que te dan', L.xmay, yM + 72, { anchor: 'middle', size: 26, peso: 800, fill: C.rosa });
      aparece(s, dan, tDan, fin, { dy: 6 });
    });
  }

  // ================================================================ E · A · V · el ejemplo: las vecinas de Mi♭ Mayor
  function escenaEjemplo() {
    const a = F0('E1') - 0.1, b = F0('X1') + 0.2, fin = b - 0.3;
    escena('ejemplo', a, b, (s, g) => {
      const L = L0, [yA, yM, yB] = L.yf, yH = 172;
      // ---------- E1–E2 · el enunciado: [EJEMPLO] vecinas de [Mi♭ M]
      const tEj = F0('E1') - 0.05, tVe = Wd('E2', 'vecinas') - 0.15, tMib = Wd('E2', 'mi') - 0.15;
      const H = enLinea(g, CX, 24, [
        w => chip(w, 'EJEMPLO', 0, yH, { size: 26, anchor: 'start', relleno: false })._w,
        w => D.medir(texto(w, 'vecinas de', 0, yH + 13, { size: 38, peso: 600, fill: C.blanco })),
        w => chipTon(w, 'Eb', 'mayor', 0, yH, { size: L.size, anchor: 'start' })._w,
      ]);
      pop(s, H[0].out, tEj, fin, H[0].cx, yH);
      aparece(s, H[1].out, tVe, fin, { dy: 8 });
      pop(s, H[2].out, tMib, fin, H[2].cx, yH, { k0: .6 });
      // ---------- E3 · la ponemos en medio del tablero… y primero, su armadura
      const tG = Wd('E3', 'primero') - 0.15, tSt = Wd('E3', 'calcular') - 0.15, tQ = Wd('E3', 'armadura') - 0.1;
      const mov = N.group(g);
      const cMib = casilla(s, mov, L.xmay, yM, null, fin, { nota: 'Eb', modo: 'mayor', rosa: [[-1, 1e9]] });
      s.on(t => {
        const k = ease(ramp(t, tG, tG + 0.8));
        opa(mov, ramp(t, tG, tG + 0.12) * (1 - ease(ramp(t, fin - 0.5, fin))));
        mov.setAttribute('transform', `translate(${((H[2].cx - L.xmay) * (1 - k)).toFixed(1)},${((yH - yM) * (1 - k)).toFixed(1)})`);
      });
      const M = filaPenta(g, L, 1, 3, 'b');
      mostrarEn(s, M.P.g, tSt, fin);
      const tSi = Wd('E4', 'si') - 0.08;
      const qa = N.group(g);
      const xa0 = M.P.x0 - 4, wa = 3 * (N.M.accidentalFlat.adv + 0.14) * L.sp + 16;
      N.el('rect', { x: xa0, y: yM - 2.6 * L.sp, width: wa, height: 5.2 * L.sp, rx: 10, fill: 'none', stroke: C.rosa, 'stroke-width': 3, 'stroke-dasharray': '8 7' }, qa);
      interrogacion(qa, xa0 + wa / 2, yM + 21, 62);
      mostrarEn(s, qa, tQ, tSi + 0.1, .3, .3);
      // ---------- E4 · «Mmm, tres bemoles, ¿no? Sí: Mi, y uno más, La. Tres bemoles.»
      const tTres = Wd('E4', 'tres') - 0.1, tMi = Wd('E4', 'mi') - 0.08, tUno = Wd('E4', 'uno') - 0.1;
      const tLa = Wd('E4', 'la') - 0.08, tTres2 = Wd('E4', 'tres', 2) - 0.1, tA1 = F0('A1') - 0.2;
      const duda = cuentaAlt(g, 3, 'b', L.xc, yM, { pre: '¿', post: '?', italic: true, color: C.suave, size: 40 });
      mostrarEn(s, duda, tTres, tTres2, .3, .3);
      [tSi, tMi, tLa].forEach((ta, j) => altRosa(s, M, j, ta, fin, tTres2 + 0.2));
      // los nombres, debajo: Si♭ · Mi♭ (en rosa: es la tonalidad) · +1 → La♭
      const xsN = [585, 690, 795], yN = 710;
      ['Bb', 'Eb', 'Ab'].forEach((n, j) => {
        const w = N.group(g); nombreNota(w, n, xsN[j], yN, { size: 34, anchor: 'middle', fill: 'currentColor' });
        color(w, j === 1 ? C.rosa : C.blanco);
        aparece(s, w, [tSi, tMi, tLa][j], tA1, { dy: 6 });
      });
      latido(s, cMib.out, tMi, L.xmay, yM);
      const uno = N.group(g); color(uno, C.rosa);
      arco(uno, xsN[1] + 12, yN + 22, xsN[2] - 12, yN + 22, -44, { w: 4, cab: 13 });
      texto(uno, '+1', (xsN[1] + xsN[2]) / 2, yN + 86, { anchor: 'middle', size: 34, peso: 800, fill: C.rosa });
      aparece(s, uno, tUno, tA1, { dy: 0 });
      const c3 = cuentaAlt(g, 3, 'b', L.xc, yM, { size: L.sizeC });
      pop(s, c3, tTres2, fin, L.xc + 30, yM, { k0: .6 });
      resalta(s, c3, tTres2 - 0.3, tTres2 + 1.4);
      // ---------- E5 · su relativo menor: Do m
      const tRel = Wd('E5', 'relativo') - 0.15, tDo = Wd('E5', 'do') - 0.15;
      const cDo = casilla(s, g, L.xmen, yM, tDo, fin, { nota: 'C', modo: 'menor' });
      const fR = flechaRel(g, cMib, cDo); mostrarEn(s, fR, tRel, fin);
      const rl = texto(g, 'relativo menor', L.xmen, yM + 74, { anchor: 'middle', size: 26, peso: 700, italic: true, fill: C.suave });
      aparece(s, rl, tRel, tA1, { dy: 6 });
      // ---------- A1 · las armaduras vecinas: arriba y abajo
      const tAr = Wd('A1', 'armaduras') - 0.2;
      const Ar = filaPenta(g, L, 0, 4, 'b'), Ab = filaPenta(g, L, 2, 3, 'b');
      mostrarEn(s, Ar.G, tAr, fin); mostrarEn(s, Ab.G, tAr + 0.15, fin);
      // ---------- A2 · una más: cuatro bemoles → La♭ M · Fa m
      const tU1 = Wd('A2', 'una') - 0.1, tMas = Wd('A2', 'mas') - 0.1, tCua = Wd('A2', 'cuatro') - 0.05, tB4 = Wd('A2', 'bemoles') - 0.1;
      const tLab = Wd('A2', 'la', 2) - 0.1, tFa = Wd('A2', 'fa') - 0.1;
      const mA = masMenos(g, L, 1, 0, '+1'); aparece(s, mA, tU1, fin, { dy: 0 });
      llegan(s, Ar, [0, 1, 2], DYF, tMas);
      altRosa(s, Ar, 3, tCua, fin, tLab - 0.3);
      const c4 = cuentaAlt(g, 4, 'b', L.xc, yA, { size: L.sizeC });
      pop(s, c4, tB4, fin, L.xc + 30, yA, { k0: .6 }); resalta(s, c4, tB4 - 0.3, tB4 + 1.4);
      resalta(s, Ar.A.items[2].g, tLab - 0.1, tLab + 1.5);          // el penúltimo bemol (La♭) es la tonalidad
      const cLab = casilla(s, g, L.xmay, yA, tLab, fin, { nota: 'Ab', modo: 'mayor' });
      const cFa = casilla(s, g, L.xmen, yA, tFa, fin, { nota: 'F', modo: 'menor' });
      const fA = flechaRel(g, cLab, cFa); mostrarEn(s, fA, tFa - 0.15, fin);
      // ---------- A3 · una menos: dos bemoles → Si♭ M · Sol m
      const tU2 = Wd('A3', 'una') - 0.1, tMen = Wd('A3', 'menos') - 0.1, tDos = Wd('A3', 'dos') - 0.05, tB2 = Wd('A3', 'bemoles') - 0.1;
      const tSib = Wd('A3', 'si') - 0.1, tSol = Wd('A3', 'sol') - 0.1;
      const mB = masMenos(g, L, 1, 2, '−1'); aparece(s, mB, tU2, fin, { dy: 0 });
      llegan(s, Ab, [0, 1, 2], -DYF, tMen, { 2: tDos });
      const hu = hueco(g, Ab, 2); mostrarEn(s, hu, tDos + 0.25, fin);
      const c2 = cuentaAlt(g, 2, 'b', L.xc, yB, { size: L.sizeC });
      pop(s, c2, tB2, fin, L.xc + 30, yB, { k0: .6 }); resalta(s, c2, tB2 - 0.3, tB2 + 1.4);
      resalta(s, Ab.A.items[0].g, tSib - 0.1, tSib + 1.5);          // el penúltimo bemol (Si♭) es la tonalidad
      const cSib = casilla(s, g, L.xmay, yB, tSib, fin, { nota: 'Bb', modo: 'mayor' });
      const cSol = casilla(s, g, L.xmen, yB, tSol, fin, { nota: 'G', modo: 'menor' });
      const fB = flechaRel(g, cSib, cSol); mostrarEn(s, fB, tSol - 0.15, fin);
      // ---------- las seis (en la pausa tras A3) · V1: si tienes dudas, repasa «Indica la tonalidad»
      const tCnt = F1('A3') + 0.2;
      aSuave(s, mA, tU2 - 0.1); aSuave(s, mB, tCnt); aSuave(s, hu, tCnt);
      [cMib, cDo, cLab, cFa, cSib, cSol].forEach((c, i) => insignia(s, g, i + 1, c, tCnt + i * 0.14, fin));
      llaveSeis(s, g, L.xll, yA - 50, yB + 50, tCnt + 0.95, fin);
      tarjetaVideo(s, g, 1430, 112, Wd('V1', 'recomiendo') - 0.2, fin, Wd('V1', 'indica') - 0.1);
    });
  }

  // ================================================================ X · caso especial: sin alteraciones (Do M) → un sostenido y un bemol
  function escenaEspecial() {
    const a = F0('X1') - 0.1, b = F0('F1') + 0.2, fin = b - 0.3;
    escena('especial', a, b, (s, g) => {
      const L = L0, [yA, yM, yB] = L.yf, yH = 172;
      const tCaso = Wd('X1', 'caso') - 0.15, tTon = Wd('X1', 'tonalidad') - 0.15, tSin = Wd('X1', 'alteraciones') - 0.1;
      const tDo = Wd('X1', 'do') - 0.1, tArm = Wd('X2', 'armaduras') - 0.15;
      const tSos = Wd('X2', 'sostenido') - 0.1, tBem = Wd('X2', 'bemol') - 0.1;
      const H = enLinea(g, CX, 26, [
        w => chip(w, 'CASO ESPECIAL', 0, yH, { size: 26, anchor: 'start', relleno: false })._w,
        w => D.medir(texto(w, 'sin alteraciones', 0, yH + 13, { size: 38, peso: 600, fill: C.blanco })),
      ]);
      pop(s, H[0].out, tCaso, fin, H[0].cx, yH);
      aparece(s, H[1].out, tSin, fin, { dy: 8 });
      // en medio: Do M, sin alteraciones (y su relativo, La m, en segundo plano)
      const M = filaPenta(g, L, 1, 0, '#');
      mostrarEn(s, M.G, tTon, fin);
      const c0 = cuentaAlt(g, 0, null, L.xc, yM, { size: L.sizeC });
      pop(s, c0, tSin, fin, L.xc + 14, yM, { k0: .6 }); resalta(s, c0, tSin - 0.3, tSin + 1.4);
      const cDo = casilla(s, g, L.xmay, yM, tDo, fin, { nota: 'C', modo: 'mayor', rosa: [[tDo - 0.3, 1e9]] });
      const tLa = Wd('X1', 'mayor') + 0.3;
      const cLa = casilla(s, g, L.xmen, yM, tLa, fin, { nota: 'A', modo: 'menor', suave: true, rosa: [] });
      const fM = flechaRel(g, cDo, cLa); mostrarEn(s, fM, tLa - 0.1, fin);
      // X2 · sus armaduras vecinas: por un lado, un sostenido; por el otro, un bemol
      const Ar = filaPenta(g, L, 0, 1, '#'), Ab = filaPenta(g, L, 2, 1, 'b');
      mostrarEn(s, Ar.G, tArm, fin); mostrarEn(s, Ab.G, tArm + 0.15, fin);
      altRosa(s, Ar, 0, tSos, fin, tSos + 1.6);
      altRosa(s, Ab, 0, tBem, fin, tBem + 1.6);
      const c1s = cuentaAlt(g, 1, '#', L.xc, yA, { size: L.sizeC });
      pop(s, c1s, tSos + 0.1, fin, L.xc + 30, yA, { k0: .6 }); resalta(s, c1s, tSos - 0.2, tSos + 1.6);
      const c1b = cuentaAlt(g, 1, 'b', L.xc, yB, { size: L.sizeC });
      pop(s, c1b, tBem + 0.1, fin, L.xc + 30, yB, { k0: .6 }); resalta(s, c1b, tBem - 0.2, tBem + 1.6);
      // X3–X4 · Sol M y Mi m · Fa M y Re m
      const cSol = casilla(s, g, L.xmay, yA, Wd('X3', 'sol') - 0.1, fin, { nota: 'G', modo: 'mayor' });
      const cMi = casilla(s, g, L.xmen, yA, Wd('X3', 'mi') - 0.1, fin, { nota: 'E', modo: 'menor' });
      const cFa = casilla(s, g, L.xmay, yB, Wd('X4', 'fa') - 0.1, fin, { nota: 'F', modo: 'mayor' });
      const cRe = casilla(s, g, L.xmen, yB, Wd('X4', 're') - 0.1, fin, { nota: 'D', modo: 'menor' });
      const f1 = flechaRel(g, cSol, cMi); mostrarEn(s, f1, Wd('X3', 'mi') - 0.25, fin);
      const f2 = flechaRel(g, cFa, cRe); mostrarEn(s, f2, Wd('X4', 're') - 0.25, fin);
    });
  }

  // ================================================================ F · conclusión: armadura, relativo, +1 y −1 → ¡6!
  function escenaResumen() {
    const a = F0('F1') - 0.1, b = T.acorde + 0.15, fin = b - 0.3;
    escena('resumen', a, b, (s, g) => {
      const tCon = Wd('F1', 'conclusion') - 0.2, tArm = Wd('F1', 'armadura') - 0.2, tRel = Wd('F1', 'relativo') - 0.25;
      const tVec = Wd('F2', 'vecinos') - 0.2, tMas = Wd('F2', 'mas') - 0.15, tMen = Wd('F2', 'menos') - 0.15;
      const tSeis = Wd('F3', 'seis') - 0.15, tListo = Wd('F3', 'listo') - 0.1;
      // ---------- izquierda: la conclusión, paso a paso (el que se dice, en rosa)
      const xC = 110, yC = 200, wC = 740, hC = 620;
      const CH = N.group(g);
      panel(CH, xC, yC, wC, hC, { rx: 24, stroke: 'rgba(248,250,252,0.35)', sw: 2 });
      texto(CH, 'CONCLUSIÓN', xC + 50, yC + 66, { size: 26, peso: 800, ls: '0.24em', fill: C.rosa });
      aparece(s, CH, tCon, fin, { dy: 12 });
      filaChuleta(s, g, '1 · la armadura', xC + 50, yC + 170, tArm, tRel - 0.05, fin, { size: 42 });
      filaChuleta(s, g, '2 · su relativo', xC + 50, yC + 260, tRel, tVec - 0.1, fin, { size: 42 });
      const f3 = filaChuleta(s, g, '3 · vecinas:', xC + 50, yC + 350, tVec, tSeis - 0.2, fin, { size: 42 });
      let xv = xC + 50 + D.medir(f3.firstChild) + 22;
      [['+1', tMas, C.rosa], ['y', tMen - 0.15, C.blanco], ['−1', tMen, C.rosa]].forEach(([txt, ta, col]) => {
        const p = texto(g, txt, xv, yC + 350, { size: 42, peso: 800, fill: col });
        xv += D.medir(p) + 16;
        aparece(s, p, ta, fin, { dy: 8 });
      });
      const yS = yC + 530;
      const seis = N.group(g);
      texto(seis, '¡6!', xC + 50, yS, { size: 120, peso: 800, fill: C.rosa });
      pop(s, seis, tSeis, fin, xC + 130, yS - 42, { k0: .4 });
      const lis = N.group(g);
      texto(lis, 'y listo', xC + 270, yS - 20, { size: 44, peso: 700, fill: C.blanco });
      marca(lis, true, xC + 470, yS - 36, 22);
      aparece(s, lis, tListo, fin, { dy: 8 });
      // ---------- derecha: el ejemplo (Mi♭ M) se vuelve a montar al ritmo de la conclusión
      const L = L1, [yA, yM, yB] = L.yf;
      const cMib = casilla(s, g, L.xmay, yM, tCon + 0.1, fin, { nota: 'Eb', modo: 'mayor', size: L.size, rosa: [[-1, 1e9]] });
      const M = filaPenta(g, L, 1, 3, 'b');
      mostrarEn(s, M.P.g, tArm - 0.1, fin);
      [0, 1, 2].forEach(j => altRosa(s, M, j, tArm + 0.05 + j * 0.12, fin, tRel));
      const c3 = cuentaAlt(g, 3, 'b', L.xc, yM, { size: L.sizeC });
      aparece(s, c3, tArm + 0.35, fin, { dy: 6 }); resalta(s, c3, tArm, tRel);
      const vSeis = [tSeis - 0.1, tSeis + 1.1];
      const cDo = casilla(s, g, L.xmen, yM, tRel, fin, { nota: 'C', modo: 'menor', size: L.size, rosa: [[tRel - 0.3, tVec], vSeis] });
      mostrarEn(s, flechaRel(g, cMib, cDo), tRel - 0.1, fin);
      const Ar = filaPenta(g, L, 0, 4, 'b'), Ab = filaPenta(g, L, 2, 3, 'b');
      mostrarEn(s, Ar.P.g, tVec, fin); mostrarEn(s, Ab.P.g, tVec + 0.1, fin);
      // +1 (una más): cuatro bemoles → La♭ M · Fa m
      const mA = masMenos(g, L, 1, 0, '+1'); aparece(s, mA, tMas - 0.1, fin, { dy: 0 });
      [0, 1, 2].forEach(j => mostrarEn(s, Ar.A.items[j].g, tMas, fin));
      altRosa(s, Ar, 3, tMas + 0.1, fin, tMen);
      const c4 = cuentaAlt(g, 4, 'b', L.xc, yA, { size: L.sizeC }); aparece(s, c4, tMas + 0.2, fin, { dy: 6 });
      const cLab = casilla(s, g, L.xmay, yA, tMas + 0.25, fin, { nota: 'Ab', modo: 'mayor', size: L.size, rosa: [[tMas - 0.05, tMen], vSeis] });
      const cFa = casilla(s, g, L.xmen, yA, tMas + 0.4, fin, { nota: 'F', modo: 'menor', size: L.size, rosa: [[tMas + 0.1, tMen], vSeis] });
      mostrarEn(s, flechaRel(g, cLab, cFa), tMas + 0.35, fin);
      // −1 (una menos): dos bemoles → Si♭ M · Sol m
      const mB = masMenos(g, L, 1, 2, '−1'); aparece(s, mB, tMen - 0.1, fin, { dy: 0 });
      [0, 1].forEach(j => mostrarEn(s, Ab.A.items[j].g, tMen, fin));
      s.on(t => opa(Ab.A.items[2].g, 0));
      const hu = hueco(g, Ab, 2); mostrarEn(s, hu, tMen + 0.1, fin);
      aSuave(s, mA, tMen - 0.1); aSuave(s, mB, tSeis - 0.2); aSuave(s, hu, tSeis - 0.2);
      const c2 = cuentaAlt(g, 2, 'b', L.xc, yB, { size: L.sizeC }); aparece(s, c2, tMen + 0.2, fin, { dy: 6 });
      const cSib = casilla(s, g, L.xmay, yB, tMen + 0.25, fin, { nota: 'Bb', modo: 'mayor', size: L.size, rosa: [[tMen - 0.05, tSeis - 0.3], vSeis] });
      const cSol = casilla(s, g, L.xmen, yB, tMen + 0.4, fin, { nota: 'G', modo: 'menor', size: L.size, rosa: [[tMen + 0.1, tSeis - 0.3], vSeis] });
      mostrarEn(s, flechaRel(g, cSib, cSol), tMen + 0.35, fin);
      // F3 · ¡seis!
      [cMib, cDo, cLab, cFa, cSib, cSol].forEach((c, i) => insignia(s, g, i + 1, c, tSeis - 0.1 + i * 0.06, fin));
    });
  }

  const ORDEN = [escenaIdea, escenaEjemplo, escenaEspecial, escenaResumen];

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
