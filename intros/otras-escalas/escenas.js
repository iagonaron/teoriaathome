/* =====================================================================
   ESCENAS · Otras escalas (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (otras-escalas/escenas_cuerpo.js). Todo es función pura de t.
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


  // ================================================================ E11 · OTRAS ESCALAS: pentatónicas, hexátona y cromática
  const TITULO = { kicker: 'TEORÍA  ·  ESCALAS', lineas: ['OTRAS ESCALAS'], sub: 'Pentatónicas · Hexátona · Cromática' };
  const CAB = N.M.noteheadWhole.adv * SP;                 // ancho de una redonda (≈ 44 px)
  // pentagrama de la hexátona y de la cromática (el mismo sitio en las dos escenas): 200 px por tono y 100 por
  // semitono, así el arco de tono (hexátona) es el doble de ancho que el pico de semitono (cromática)
  const YP = 480, XP = 205, XHUECO = XP + 3.9 * SP + 8, WHUECO = 76, XN0 = 430, ANCHO_P = 1513;
  const ANCHO_C = XN0 + 11 * 100 + 44 + 60 - XP;          // la cromática: 12 notas (sin repetir el Re)
  const DY_PICO = 0.85 * SP, PROF_PICO = 34;               // picos de semitono: salida bajo la cabeza y hondura

  // ---------------------------------------------------------------- utilidades de este vídeo
  /** Rótulo de escena: contorno rosa y el texto tal cual («pentatónica Mayor», «escala hexátona»…). */
  function etiqueta(parent, txt, x, y, o) {
    return chip(parent, txt, x, y, Object.assign({ size: 34, anchor: 'middle', relleno: false, ls: '0.04em' }, o || {}));
  }
  /** Color por tramos: seq = [[t, '#hex'], …] (cada cambio dura d s). */
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
  /** Mezcla dos colores #hex y devuelve #hex (se puede volver a mezclar). */
  function mixHex(c1, c2, k) {
    const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
    const A = p(c1), B = p(c2);
    return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join('');
  }
  /** Destello rosa en los instantes ts; fuera del destello no toca el color (lo hereda del grupo padre). */
  function brilla(s, g, ts, o) {
    o = o || {};
    const d = o.d || 0.8, de = o.de || C.blanco;
    ts = [].concat(ts);
    s.on(t => {
      let k = 0;
      for (const t0 of ts) k = Math.max(k, win(t, t0 - 0.05, t0 + d, .08, .45));
      g.style.color = k > 0.002 ? mezcla(de, C.rosa, k) : '';
    });
  }
  /** Texto en el que ♭, ♯ y ♮ se dibujan con Bravura. Pegada a una letra («Si♭») la alteración va como en los
   *  nombres de nota; suelta («5♯») va de pie sobre la línea. segs: 'texto' o [['trozo', color], …]. Devuelve el grupo (_w). */
  function frase(parent, segs, x, y, o) {
    o = o || {};
    const size = o.size || 36, peso = o.peso || 700, esp = size * 0.28;
    const GL = { '♭': 'accidentalFlat', '♯': 'accidentalSharp', '♮': 'accidentalNatural' };
    const G = N.group(parent, 'frase');
    if (typeof segs === 'string') segs = [[segs, o.fill || 'currentColor']];
    let cx = 0, prev = '';
    for (const [str, col] of segs) {
      for (const tr of str.split(/([♭♯♮])/)) {
        if (!tr) continue;
        if (GL[tr]) {
          const gl = GL[tr], bem = tr === '♭';
          const pegada = /[A-Za-zÁÉÍÓÚáéíóúñÑ]$/.test(prev);
          const sa = pegada ? size * 0.36 : size * (bem ? 0.31 : 0.29);
          const yo = pegada ? -size * 0.33 : (bem ? -0.7 * sa : -size * 0.36);
          const x0 = cx + size * (pegada ? 0.03 : 0.02);
          const gg = N.group(G, 'alt'); if (col && col !== 'currentColor') color(gg, col);
          N.glyph(gg, gl, x0, yo, sa);
          cx = x0 + N.M[gl].adv * sa + size * (pegada ? 0.08 : 0.04);
        } else {
          if (/^\s/.test(tr)) cx += esp;
          const core = tr.trim();
          if (core) { const t = texto(G, core, cx, 0, { size, peso, fill: col || 'currentColor', italic: o.italic }); cx += D.medir(t); }
          if (core && /\s$/.test(tr)) cx += esp;
        }
        prev = tr;
      }
    }
    const ax = o.anchor === 'middle' ? x - cx / 2 : (o.anchor === 'end' ? x - cx : x);
    G.setAttribute('transform', `translate(${ax.toFixed(1)},${y})`);
    G._w = cx; G._x = ax;
    return G;
  }
  /** Línea centrada en CX hecha de trozos que aparecen cada uno a su hora: partes = [[texto|segs, t0, color], …]. */
  function subtitulo(s, parent, partes, y, fin, o) {
    o = o || {};
    const size = o.size || 38, gap = size * 0.45;
    const els = [];
    partes.forEach(([txt, t0, col], i) => {
      if (i > 0) els.push({ el: texto(parent, '·', 0, y, { size, peso: 700, fill: C.suave }), t0 });
      els.push({ el: texto(parent, txt, 0, y, { size, peso: 700, fill: col || C.blanco }), t0 });
    });
    const ws = els.map(e => D.medir(e.el));
    let x = CX - (ws.reduce((a, w) => a + w, 0) + gap * (els.length - 1)) / 2;
    els.forEach((e, i) => { e.el.setAttribute('x', x.toFixed(1)); x += ws[i] + gap; aparece(s, e.el, e.t0, fin, { dy: 6 }); });
  }
  /** Teclado de una octava y pico (Do…Re, 9 blancas); marcadas = semitonos desde Do que se pintan de rosa. */
  function teclado(parent, x, y, marcadas, o) {
    o = o || {};
    const kw = o.kw || 44, kh = o.kh || 150;
    const G = N.group(parent, 'teclado');
    const BL = [0, 2, 4, 5, 7, 9, 11, 12, 14];
    const NE = [[1, 1], [3, 2], [6, 4], [8, 5], [10, 6], [13, 8]];     // [semitono, frontera entre blancas]
    const on = new Set(marcadas);
    BL.forEach((st, i) => N.el('rect', { x: x + i * kw, y, width: kw, height: kh, rx: 6, fill: on.has(st) ? C.rosa : '#e8eef5', stroke: '#0b1320', 'stroke-width': 2.5 }, G));
    const bw = kw * 0.6, bh = kh * 0.6;
    NE.forEach(([st, i]) => N.el('rect', { x: x + i * kw - bw / 2, y: y - 1, width: bw, height: bh, rx: 4, fill: on.has(st) ? C.rosa : '#111827', stroke: '#0b1320', 'stroke-width': 2.5 }, G));
    return G;
  }
  /** Tira de grados 1–7 (cajitas numeradas). Devuelve {g, cajas:[{g, r, tx, x, y, lado, cx}], w}. */
  function tiraGrados(parent, x, y, o) {
    o = o || {};
    const lado = o.lado || 64, gap = o.gap || 14, size = o.size || 32;
    const G = N.group(parent, 'tira');
    const cajas = [];
    for (let i = 0; i < 7; i++) {
      const c = N.group(G);
      const xi = x + i * (lado + gap);
      const r = N.el('rect', { x: xi, y, width: lado, height: lado, rx: 10, fill: C.panel, stroke: 'currentColor', 'stroke-width': 2.5 }, c);
      const tx = texto(c, String(i + 1), xi + lado / 2, y + lado / 2 + size * 0.36, { anchor: 'middle', size, peso: 800, fill: 'currentColor' });
      color(c, C.blanco);
      cajas.push({ g: c, r, tx, x: xi, y, lado, cx: xi + lado / 2 });
    }
    return { g: G, cajas, w: 7 * lado + 6 * gap };
  }
  /** Una caja de la tira se va: rosa, queda vacía (discontinua) y tachada. */
  function quitaCaja(s, c, t0) {
    colorSeq(s, c.g, [[-1, C.blanco], [t0, C.rosa]], .25);
    s.on(t => {
      const k = ease(ramp(t, t0 + 0.3, t0 + 0.6));
      if (k > 0.5) { c.r.setAttribute('stroke-dasharray', '7 7'); c.r.setAttribute('fill', 'none'); }
      else { c.r.removeAttribute('stroke-dasharray'); c.r.setAttribute('fill', C.panel); }
      opa(c.tx, 1 - 0.55 * k);
    });
    const ln = N.line(c.g, c.x + 10, c.y + c.lado - 10, c.x + c.lado - 10, c.y + 10, 4, { 'stroke-linecap': 'round' });
    mostrarEn(s, ln, t0 + 0.35, 1e9, .25);
  }
  /** Hueco vacío (discontinuo) donde iría la armadura, con el rótulo «sin armadura» encima. */
  function huecoArm(parent, x, yM, w) {
    const G = N.group(parent, 'hueco');
    N.el('rect', { x, y: yM - 2 * SP - 14, width: w, height: 4 * SP + 28, rx: 10, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5, 'stroke-dasharray': '7 8' }, G);
    texto(G, 'sin armadura', x + w / 2, yM - 2 * SP - 62, { anchor: 'middle', size: 26, peso: 700, fill: 'currentColor' });
    return G;
  }
  /** Casilla de una escala: redonda centrada en xc + número de grado + nombre. out = entrada; inn = color/fundido. */
  function slotNota(parent, n, xc, yM, nombre, num, o) {
    o = o || {};
    const out = N.group(parent), inn = N.group(out);
    const gN = N.group(inn); nota(gN, n, xc - CAB / 2, yM, { alteracion: o.alt });
    const gNum = N.group(inn), gNom = N.group(inn);
    const yNum = yM + (o.dyNum || 118);
    if (num != null) texto(gNum, String(num), xc, yNum, { anchor: 'middle', size: o.sizeNum || 30, peso: 800, fill: o.numSuave ? C.suave : 'currentColor' });
    if (nombre) nombreNota(gNom, nombre, xc, yM + (o.dyNom || 172), { size: o.sizeNom || 30, anchor: 'middle', fill: 'currentColor' });
    return { out, inn, gN, gNum, gNom, xc, yNum };
  }
  /** Atributo d del arco de tono y del pico de semitono, con la misma geometría que arcoTono / picoSemitono
   *  (_comun): así se pueden redibujar cuando una cabeza cambia de sitio (La♯ → Si♭, ♯ → ♭ en la cromática). */
  function dArco(x1, y1, x2, y2, prof) {
    prof = prof || Math.min(44, Math.max(16, Math.abs(x2 - x1) * 0.26));
    const mx = (x1 + x2) / 2, yb = Math.max(y1, y2) + prof, cy = 2 * yb - (y1 + y2) / 2;
    return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
  }
  function dPico(x1, y1, x2, y2, prof) {
    prof = prof || Math.min(38, Math.max(14, Math.abs(x2 - x1) * 0.22));
    const mx = (x1 + x2) / 2, yb = Math.max(y1, y2) + prof;
    return `M${x1.toFixed(1)},${y1.toFixed(1)} L${mx.toFixed(1)},${yb.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}`;
  }
  /** Lápiz (el mismo de «Compases extraños»): la punta en (0,0). */
  function dibujoLapiz(g) {
    const P = N.group(g); P.setAttribute('transform', 'rotate(-52)');
    N.el('path', { d: 'M0,0 L17,-6.5 L17,6.5 Z', fill: '#e9d3ad', stroke: C.blanco, 'stroke-width': 2, 'stroke-linejoin': 'round' }, P);
    N.el('path', { d: 'M0,0 L6.5,-2.5 L6.5,2.5 Z', fill: C.rosa }, P);
    N.el('rect', { x: 17, y: -6.5, width: 60, height: 13, fill: '#0b1320', stroke: C.blanco, 'stroke-width': 2 }, P);
    N.el('rect', { x: 77, y: -6.5, width: 10, height: 13, fill: '#94a3b8', stroke: C.blanco, 'stroke-width': 2 }, P);
    N.el('rect', { x: 87, y: -6.5, width: 9, height: 13, rx: 3, fill: C.rosa, stroke: C.blanco, 'stroke-width': 2 }, P);
  }
  /** Lo que se añade se escribe a lápiz: los trazos ds (px) se dibujan en rosa con el lápiz siguiéndolos;
   *  al acabar aparece el signo de verdad (real) y los trazos se van. */
  function aLapiz(s, parent, ds, t0, dur, real) {
    const G = N.group(parent); G.style.color = C.rosa;
    const ps = ds.map(d => N.el('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, G));
    const Ls = ps.map(p => p.getTotalLength()), LT = Ls.reduce((acc, v) => acc + v, 0);
    ps.forEach((p, i) => p.setAttribute('stroke-dasharray', `${Ls[i].toFixed(2)} ${Ls[i].toFixed(2)}`));
    const lap = N.group(parent); dibujoLapiz(lap);
    s.on(t => {
      const k = ramp(t, t0, t0 + dur) * LT;
      let acc = 0, px = null, py = null;
      ps.forEach((p, i) => {
        const kk = clamp((k - acc) / Ls[i]);
        p.setAttribute('stroke-dashoffset', (Ls[i] * (1 - kk)).toFixed(2));
        if (k >= acc && (k <= acc + Ls[i] || i === ps.length - 1)) { const q = p.getPointAtLength(Math.min(Ls[i], k - acc)); px = q.x; py = q.y; }
        acc += Ls[i];
      });
      opa(G, t < t0 - 0.02 ? 0 : 1 - ramp(t, t0 + dur + 0.25, t0 + dur + 0.55));
      opa(lap, win(t, t0 - 0.2, t0 + dur + 0.3, .2, .25));
      if (px != null) lap.setAttribute('transform', `translate(${px.toFixed(1)},${py.toFixed(1)})`);
      opa(real, ease(ramp(t, t0 + dur - 0.05, t0 + dur + 0.3)));
    });
  }
  /** Se quita una nota de la escala: se pone rosa, se desvanece (queda de sombra) y su número se tacha. */
  function quitaNota(s, sl, t0) {
    colorSeq(s, sl.inn, [[-1, C.blanco], [t0, C.rosa]], .25);
    s.on(t => opa(sl.inn, 1 - 0.8 * ease(ramp(t, t0 + 0.45, t0 + 0.95))));
    const ta = N.line(sl.out, sl.xc - 17, sl.yNum + 6, sl.xc + 17, sl.yNum - 30, 4.5, { 'stroke-linecap': 'round', stroke: C.rosa });
    mostrarEn(s, ta, t0 + 0.5, 1e9, .25);
  }

  // ================================================================ I · además de las Mayores y menores… tres escalas más
  function escenaIntro() {
    const a = F0('I1') - 0.2, b = F0('P1') + 0.2;
    escena('intro', a, b, (s, g) => {
      const fin = b - 0.3;
      const tOtras = Wd('I2', 'otras') - 0.15;
      // I1 · las que ya conoces (se atenúan cuando llegan las «otras»)
      const Y = N.group(g);
      s.on(t => opa(Y, 1 - 0.6 * ease(ramp(t, tOtras, tOtras + 0.5))));
      const oK = { size: 34, anchor: 'middle', relleno: false, borde: C.suave, colorTexto: C.blanco, ls: '0.04em' };
      const kM = N.group(Y); chip(kM, 'escalas Mayores', CX - 230, 230, oK);
      pop(s, kM, Wd('I1', 'mayores') - 0.15, fin, CX - 230, 230);
      const km = N.group(Y); chip(km, 'escalas menores', CX + 230, 230, oK);
      pop(s, km, Wd('I1', 'menores') - 0.15, fin, CX + 230, 230);
      const ti = texto(Y, 'y sus tipos', CX, 318, { anchor: 'middle', size: 30, peso: 600, italic: true, fill: C.suave });
      aparece(s, ti, Wd('I1', 'sus') - 0.25, fin, { dy: 6 });
      // I2–I3 · tres tarjetas: primero «?»; al nombrarlas, su nombre y su teclado
      const NOM = ['PENTATÓNICAS', 'HEXÁTONA', 'CROMÁTICA'];
      const TEC = [[2, 4, 6, 9, 11], [2, 4, 6, 8, 10, 12], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]];
      const tN = [Wd('I3', 'pentatonicas'), Wd('I3', 'hexatona'), Wd('I3', 'cromatica')].map(t => t - 0.15);
      const wC = 480, gC = 40, yC = 410, hC = 330, x0 = CX - (3 * wC + 2 * gC) / 2;
      NOM.forEach((nom, k) => {
        const x = x0 + k * (wC + gC);
        const G = N.group(g);
        aparece(s, G, tOtras + 0.1 + k * 0.15, fin, { dy: 14 });
        const r = panel(G, x, yC, wC, hC, { rx: 22 });
        const q = texto(G, '?', x + wC / 2, yC + hC / 2 + 52, { anchor: 'middle', size: 150, peso: 800, fill: C.suave });
        s.on(t => opa(q, 0.8 * (1 - ease(ramp(t, tN[k] - 0.1, tN[k] + 0.2)))));
        const Cn = N.group(G);
        texto(Cn, nom, x + wC / 2, yC + 80, { anchor: 'middle', size: 40, peso: 800, ls: '0.08em', fill: C.blanco });
        teclado(Cn, x + (wC - 9 * 44) / 2, yC + 128, TEC[k]);
        aparece(s, Cn, tN[k], 1e9, { dy: 10 });
        const tb = k < 2 ? tN[k + 1] : fin;
        s.on(t => { const kk = win(t, tN[k], tb, .3, .4); r.setAttribute('stroke', mezcla('#3a4556', C.rosa, kk)); r.setAttribute('stroke-width', (1.5 + 1.5 * kk).toFixed(2)); });
      });
    });
  }

  // ================================================================ P1–P2 · penta = 5 sonidos: les faltan dos grados
  function escenaPenta() {
    const a = F0('P1') - 0.1, b = F0('P3') + 0.2;
    escena('penta', a, b, (s, g) => {
      const fin = b - 0.3;
      const yW = 390, size = 116;
      const W = N.group(g);
      aparece(s, W, F0('P1') - 0.1, fin, { dy: 12 });
      const PG = N.group(W);
      const tP = texto(PG, 'PENTA', 0, yW, { size, peso: 800, ls: '0.04em', fill: 'currentColor' });
      const tT = texto(W, 'TÓNICAS', 0, yW, { size, peso: 800, ls: '0.04em', fill: C.blanco });
      const wP = D.medir(tP), wT = D.medir(tT), x0 = CX - (wP + wT) / 2;
      tP.setAttribute('x', x0.toFixed(1)); tT.setAttribute('x', (x0 + wP).toFixed(1));
      color(PG, C.blanco);
      const tNom = Wd('P1', 'nombre') - 0.2;
      resalta(s, PG, tNom, null);
      const cP = x0 + (wP - 0.04 * size) / 2;                     // centro de «PENTA»
      const br = N.group(W); color(br, C.rosa);
      N.el('path', { d: `M${x0 + 8},${yW + 22} V${yW + 38} H${x0 + wP - 14} V${yW + 22}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, br);
      mostrarEn(s, br, tNom + 0.15, 1e9, .3);
      // «5 sonidos»
      const n5 = texto(W, '5', 0, yW + 170, { size: 110, peso: 800, fill: C.rosa });
      const nS = texto(W, 'sonidos', 0, yW + 170, { size: 50, peso: 700, fill: C.blanco });
      const w5 = D.medir(n5), wS = D.medir(nS), xs = cP - (w5 + 20 + wS) / 2;
      n5.setAttribute('x', xs.toFixed(1)); nS.setAttribute('x', (xs + w5 + 20).toFixed(1));
      pop(s, n5, Wd('P1', 'cinco') - 0.15, 1e9, xs + w5 / 2, yW + 130, { k0: .6 });
      aparece(s, nS, Wd('P1', 'sonidos') - 0.2, 1e9, { dy: 6 });
      // P2 · 1 2 3 4 5 6 7  − 2  = 5
      const yT = 660, lado = 70, gap = 16;
      const TG = N.group(g);
      aparece(s, TG, F0('P2') - 0.1, fin, { dy: 0 });
      const menos = texto(TG, '− 2', 0, yT + lado / 2 + 22, { size: 64, peso: 800, fill: C.rosa });
      const igual = texto(TG, '= 5', 0, yT + lado / 2 + 22, { size: 64, peso: 800, fill: C.blanco });
      const wm = D.medir(menos), wi = D.medir(igual), wt = 7 * lado + 6 * gap;
      const xT = CX - (wt + 44 + wm + 40 + wi) / 2;
      const tira = tiraGrados(TG, xT, yT, { lado, gap, size: 34 });
      menos.setAttribute('x', (xT + wt + 44).toFixed(1)); igual.setAttribute('x', (xT + wt + 44 + wm + 40).toFixed(1));
      const tE = Wd('P2', 'escalas') - 0.25;
      tira.cajas.forEach((c, i) => pop(s, c.g, tE + i * 0.06, 1e9, c.cx, yT + lado / 2, { k0: .6 }));
      const gr = texto(TG, 'grados', xT + wt / 2, yT + lado + 46, { anchor: 'middle', size: 28, peso: 700, fill: C.suave });
      aparece(s, gr, tE + 0.4, 1e9, { dy: 6 });
      pop(s, menos, Wd('P2', 'dos') - 0.2, 1e9, xT + wt + 44 + wm / 2, yT + lado / 2, { k0: .5 });
      pop(s, igual, Wd('P2', 'grados') - 0.1, 1e9, xT + wt + 44 + wm + 40 + wi / 2, yT + lado / 2, { k0: .6 });
    });
  }

  // ================================================================ P3 / P4 · pentatónica Mayor y menor desde Re
  /** Escala de Re (Mayor o menor natural) con sus grados; se quitan dos y suena la pentatónica. */
  function pentaEjemplo(s, g, cfg, fin) {
    const yM = 520, xP = 440, xN0 = 660, paso = 135;
    const tEsc = Wd(cfg.id, 'escala') - 0.15;
    const k1 = N.group(g); etiqueta(k1, cfg.nombre, CX, 180);
    pop(s, k1, Wd(cfg.id, 'pentatonica') - 0.1, fin, CX, 180);
    const rg = frase(N.group(g), [[cfg.regla, C.rosa]], CX, 266, { size: 38, peso: 800, anchor: 'middle' });
    aparece(s, rg.parentNode, Wd(cfg.id, 'sin') - 0.1, fin, { dy: 8 });
    // la escala de Re: tonalidad + pentagrama con su armadura
    const cT = chipTon(g, 'D', cfg.modo, 300, yM, { size: 36 });
    pop(s, cT, tEsc, fin, 300, yM);
    if (cfg.natural) {
      const nt = texto(g, 'natural', 300, yM + 70, { anchor: 'middle', size: 28, peso: 700, italic: true, fill: C.suave });
      aparece(s, nt, cfg.natural, fin, { dy: 6 });
    }
    const PE = N.group(g);
    aparece(s, PE, tEsc, fin, { dy: 0 });
    pentaArm(PE, xP, yM, 1250, cfg.arm[0], cfg.arm[1]);
    const slots = cfg.notas.map((n, i) => slotNota(PE, n, xN0 + i * paso + CAB / 2, yM, cfg.nombres[i], i < 7 ? i + 1 : 1, { alt: false, numSuave: i === 7 }));
    cfg.quita.forEach((i, k) => quitaNota(s, slots[i], Wd(cfg.id, cfg.palQ[k]) - 0.1));
    // suena: cada nota que queda se ilumina en su ataque
    const quedan = slots.filter((_, i) => cfg.quita.indexOf(i) < 0);
    const son = S[cfg.son] || quedan.map((_, j) => F0(cfg.son) + 0.1 + 0.45 * j);
    quedan.forEach((sl, j) => destella(s, sl.inn, son[j]));
  }
  function escenaPentaMayor() {
    const a = F0('P3') - 0.1, b = F0('P4') + 0.2;
    escena('pentaMayor', a, b, (s, g) => pentaEjemplo(s, g, {
      id: 'P3', nombre: 'pentatónica Mayor', regla: 'sin 4.º y 7.º', modo: 'mayor', arm: [2, '#'],
      notas: ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'], nombres: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#', 'D'],
      quita: [3, 6], palQ: ['cuarto', 'septimo'], son: 'SON_PM' }, b - 0.3));
  }
  function escenaPentaMenor() {
    const a = F0('P4') - 0.1, b = F0('T1') + 0.2;
    escena('pentaMenor', a, b, (s, g) => pentaEjemplo(s, g, {
      id: 'P4', nombre: 'pentatónica menor', regla: 'sin 2.º y 6.º', modo: 'menor', arm: [1, 'b'], natural: Wd('P4', 'natural') - 0.1,
      notas: ['D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5'], nombres: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C', 'D'],
      quita: [1, 5], palQ: ['segundo', 'sexto'], son: 'SON_Pm' }, b - 0.3));
  }

  // ================================================================ T · cinco tipos: la nota más grave sube una octava
  function escenaTipos() {
    const a = F0('T1') - 0.1, b = Wd('Q1', 'escalas') + 0.2;           // se queda hasta «Por lo tanto, en las escalas…»
    escena('tipos', a, b, (s, g) => {
      const fin = b - 0.3;
      const k1 = N.group(g); etiqueta(k1, 'cinco tipos', CX, 170);
      pop(s, k1, Wd('T1', 'cinco') - 0.15, fin, CX, 170);
      const sub = texto(g, 'pentatónica Mayor desde Re', CX, 236, { anchor: 'middle', size: 30, peso: 600, fill: C.suave });
      aparece(s, sub, F0('T1'), fin, { dy: 6 });
      // cuándo sube la nota más grave (4 cambios: tipo 1 → 2 → 3 → 4 → 5)
      const TR = [Wd('T2', 'sube') - 0.1, Wd('T2', 'asi') - 0.1, Wd('T2', 'cambiando') - 0.15, Wd('T2', 'cambiando', 2) - 0.15];
      const DUR = 0.8;
      const tipoK = t => 1 + TR.reduce((acc, t0) => acc + ease(ramp(t, t0, t0 + DUR)), 0);
      // chips «Tipo 1…5»: el actual, relleno
      const yCh = 318, tCh = Wd('T1', 'tipos') - 0.25;
      const ini = [0].concat(TR.map(t0 => t0 + 1.45)), hasta = TR.map(t0 => t0 + 1.45).concat([1e9]);
      for (let k = 0; k < 5; k++) {
        const x = CX + (k - 2) * 200, t0 = tCh + k * 0.1;
        const G = N.group(g);
        pop(s, G, t0, fin, x, yCh);
        chip(G, 'Tipo ' + (k + 1), x, yCh, { size: 26, anchor: 'middle', relleno: false, borde: C.suave, colorTexto: C.blanco, ls: '0.04em' });
        const L = N.group(G); chip(L, 'Tipo ' + (k + 1), x, yCh, { size: 26, anchor: 'middle', ls: '0.04em' });
        s.on(t => opa(L, win(t, Math.max(ini[k], t0), hasta[k], .25, .25)));
      }
      // pentagrama de Re M (como en el Kit): la nota más grave se queda de sombra, entre paréntesis, al principio;
      // un arco de movimiento (discontinuo, con punta) la lleva una octava arriba, al final; las demás se corren un sitio
      const yM = 560, xP = 425, xS0 = 655, paso = 150;                  // casillas 0…5 (la 0, para la sombra)
      const PE = N.group(g);
      aparece(s, PE, F0('T1') - 0.05, fin, { dy: 0 });
      pentaArm(PE, xP, yM, 1070, 2, '#');
      const P = ['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5', 'A5'];
      const NM = ['D', 'E', 'F#', 'A', 'B', 'D', 'E', 'F#', 'A'];
      const T_ATERRIZA = 1.55;                                          // la cabeza viajera llega a su sitio
      P.forEach((n, i) => {
        const out = N.group(PE), mv = N.group(out), inn = N.group(mv);
        nota(inn, n, 0, yM, { alteracion: false });
        const nomG = N.group(inn); nombreNota(nomG, NM[i], CAB / 2, yM + 122, { size: 32, anchor: 'middle', fill: 'currentColor' });
        const yN = yNota(n, yM);
        const par = N.group(inn);                                       // paréntesis de la sombra
        N.el('path', { d: `M-7,${yN - 17} Q-17,${yN} -7,${yN + 17}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round' }, par);
        N.el('path', { d: `M${CAB + 7},${yN - 17} Q${CAB + 17},${yN} ${CAB + 7},${yN + 17}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round' }, par);
        const tIn = i >= 5 ? TR[i - 5] + T_ATERRIZA : null;             // las nuevas aparecen al llegar la cabeza
        const tFuera = i <= 2 ? TR[i + 1] : null;                       // la sombra anterior se va en el cambio siguiente
        s.on(t => {
          let v = 1;
          if (tIn != null) v = Math.min(v, ease(ramp(t, tIn - 0.1, tIn + 0.2)));
          if (tFuera != null) v = Math.min(v, 1 - ease(ramp(t, tFuera, tFuera + 0.35)));
          const kS = i <= 3 ? ease(ramp(t, TR[i] + 0.35, TR[i] + 0.8)) : 0;   // 0 → 1: pasa a ser sombra
          opa(out, v * (1 - 0.28 * kS));
          opa(par, kS); opa(nomG, 1 - kS);
          const sl = (tFuera != null && t >= tFuera) ? 0 : i + 1 - (tipoK(t) - 1);
          mv.setAttribute('transform', `translate(${(xS0 + sl * paso).toFixed(2)},0)`);
        });
        // rosa: la más grave antes de subir (luego, sombra en gris) y la recién llegada hasta el siguiente cambio
        let seq;
        if (i <= 3) seq = [[-1, C.blanco], [TR[i] - 0.45, C.rosa], [TR[i] + 0.5, C.suave]];
        else if (i === 4) seq = [[-1, C.blanco]];
        else seq = i - 4 <= 3 ? [[-1, C.rosa], [TR[i - 4] - 0.5, C.blanco]] : [[-1, C.rosa]];
        colorSeq(s, inn, seq, .25);
      });
      // el arco de movimiento de cada cambio (se queda mientras dura ese tipo) y la cabeza rosa que viaja por él
      TR.forEach((t0, k) => {
        const yO = yNota(P[k], yM), yNw = yNota(P[k + 5], yM);
        const x0c = xS0 + CAB / 2, x5c = xS0 + 5 * paso + CAB / 2;
        const A = N.group(g); color(A, C.rosa);
        const yFin = Math.min(yNw - 24, yM - 2 * SP - 12);             // la punta, por encima del pentagrama
        arcoMovimiento(A, x0c + 30, yO - 14, x5c - 14, yFin, { curv: 92, w: 3.2 });
        if (k === 0) texto(A, 'octava', (x0c + x5c) / 2 + 8, Math.min(yO, yFin) - 92, { anchor: 'middle', size: 30, peso: 800, fill: C.rosa });
        mostrarEn(s, A, t0 + 0.6, k < 3 ? TR[k + 1] + 0.3 : 1e9, .3, .35);
        const H = N.group(g); color(H, C.rosa); N.glyph(H, 'noteheadWhole', -CAB / 2, 0, SP);
        const mx = (x0c + x5c) / 2, my = Math.min(yO, yNw) - 112;
        viaja(s, H, u => { const w = 1 - u; return { x: w * w * x0c + 2 * w * u * mx + u * u * x5c, y: w * w * yO + 2 * w * u * my + u * u * yNw }; }, t0 + 0.8, t0 + T_ATERRIZA);
        s.on(t => opa(H, win(t, t0 + 0.75, t0 + T_ATERRIZA + 0.25, .12, .25)));
      });
    });
  }

  // ================================================================ Q · el procedimiento: cabezas, armadura… y quitar dos notas
  function escenaProcedimiento() {
    const a = F0('Q1') - 0.1, b = F0('X1') + 0.2;
    escena('procedimiento', a, b, (s, g) => {
      const fin = b - 0.3;
      const PASOS = [
        { n: '1', tit: 'CABEZAS', t0: Wd('Q1', 'colocar') - 0.15, t1: Wd('Q1', 'poner') - 0.15 },
        { n: '2', tit: 'ARMADURA', t0: Wd('Q1', 'poner') - 0.15, t1: F0('Q2') },
        { n: '3', tit: 'QUITAR DOS NOTAS', t0: Wd('Q2', 'quitar') - 0.15, t1: b },
      ];
      const wC = 520, gap = 36, x0 = CX - (3 * wC + 2 * gap) / 2, yC = 130, hC = 96;
      const tProc = Wd('Q1', 'procedimiento') - 0.2;
      PASOS.forEach((p, i) => {
        const G = N.group(g);
        const x = x0 + i * (wC + gap);
        const rect = panel(G, x, yC, wC, hC, { rx: 20 });
        const num = N.group(G);
        N.el('circle', { cx: x + 54, cy: yC + hC / 2, r: 28, fill: 'none', stroke: 'currentColor', 'stroke-width': 3 }, num);
        texto(num, p.n, x + 54, yC + hC / 2 + 11, { anchor: 'middle', size: 32, peso: 800, fill: 'currentColor' });
        texto(G, p.tit, x + 100, yC + hC / 2 + 10, { size: 28, peso: 800, ls: '0.06em', fill: 'currentColor' });
        color(G, C.suave);
        aparece(s, G, tProc + i * 0.2, fin, { dy: 10 });
        s.on(t => {
          const k = win(t, p.t0, p.t1, .3, .35);
          color(G, mezcla(C.suave, C.blanco, k)); color(num, mezcla(C.suave, C.rosa, k));
          rect.setAttribute('stroke', mezcla('#3a4556', C.rosa, k)); rect.setAttribute('stroke-width', (1.5 + 1.5 * k).toFixed(2));
        });
      });
      // dos pentagramas: Re M arriba y Re m abajo
      const EJ = [
        { modo: 'mayor', yM: 450, arm: [2, '#'], notas: ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'], quita: [3, 6], tq: [Wd('Q3', 'cuarta'), Wd('Q3', 'septima')], tE: Wd('Q1', 'mayores') - 0.15 },
        { modo: 'menor', yM: 730, arm: [1, 'b'], notas: ['D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5'], quita: [1, 5], tq: [Wd('Q4', 'segunda'), Wd('Q4', 'sexta')], tE: Wd('Q1', 'menores') - 0.15 },
      ];
      const tCab = Wd('Q1', 'colocar') - 0.05, tArm = Wd('Q1', 'poner') - 0.05, tNum = Wd('Q2', 'cuales') - 0.35;
      const tQ3 = Wd('Q3', 'mayores') - 0.15, tQ4 = Wd('Q4', 'menores') - 0.2;
      EJ.forEach((E, e) => {
        const Go = N.group(g), Gd = N.group(Go);
        aparece(s, Go, E.tE, fin, { dy: 10 });
        if (e === 1) s.on(t => opa(Gd, 1 - 0.55 * win(t, tQ3, tQ4 + 0.1, .35, .35)));      // mientras se habla de las Mayores
        else s.on(t => opa(Gd, 1 - 0.5 * win(t, tQ4, F1('Q4') + 0.5, .35, .45)));         // mientras se habla de las menores
        chipTon(Gd, 'D', E.modo, 262, E.yM, { size: 34 });
        const P = pentaClave(Gd, 380, E.yM, 1300);
        const A = N.armaduraGen(Gd, P.x0 + 4, E.yM, SP, E.arm[0], E.arm[1]);
        A.items.forEach((it, j) => pop(s, it.g, tArm + j * 0.15 + e * 0.1, 1e9, it.x + 12, E.yM - it.pos * SP, { fi: .25, k0: .5 }));
        E.notas.forEach((n, i) => {
          const sl = slotNota(Gd, n, 600 + i * 140 + CAB / 2, E.yM, null, i < 7 ? i + 1 : 1, { alt: false, dyNum: 108, sizeNum: 28, numSuave: i === 7 });
          pop(s, sl.out, tCab + i * 0.07 + e * 0.035, 1e9, sl.xc, yNota(n, E.yM), { k0: .5, fi: .25 });
          mostrarEn(s, sl.gNum, tNum + i * 0.03, 1e9, .3);
          const q = E.quita.indexOf(i);
          if (q >= 0) quitaNota(s, sl, E.tq[q] - 0.1);
        });
      });
    });
  }

  // ================================================================ X · hexátona: seis sonidos, todos a un tono, sin armadura
  function escenaHexatona() {
    const a = F0('X1') - 0.1, b = F0('C1') + 0.2;
    escena('hexatona', a, b, (s, g) => {
      const fin = b - 0.3;
      const k1 = N.group(g); etiqueta(k1, 'escala hexátona', CX, 170);
      pop(s, k1, Wd('X1', 'hexatona') - 0.2, fin, CX, 170);
      subtitulo(s, g, [[[['6', C.rosa], [' sonidos', C.blanco]], Wd('X1', 'seis') - 0.1], ['todos a un tono', Wd('X1', 'todos') - 0.1]], 246, fin);
      // pentagrama sin armadura
      const PE = N.group(g);
      aparece(s, PE, Wd('X1', 'aqui') - 0.15, b - 0.05, { dy: 0, fo: .45 });
      pentaClave(PE, XP, YP, ANCHO_P);
      const tH1 = Wd('X1', 'armaduras') - 0.15, tH2 = Wd('X9', 'armadura') - 0.25;
      const hu = N.group(PE); huecoArm(hu, XHUECO, YP, WHUECO);
      pop(s, hu, tH1, 1e9, XHUECO + WHUECO / 2, YP, { k0: .8 });
      s.on(t => color(hu, mezcla(C.suave, C.rosa, Math.max(win(t, tH1, tH1 + 1.8, .3, .5), win(t, tH2, tH2 + 1.9, .3, .5)))));
      // Re, Mi, Fa♯, Sol♯, La♯, Do (… y volvería a ser Re): cada nota al nombrarla, con su arco de tono por debajo
      const HEX = ['D4', 'E4', 'F#4', 'G#4', 'A#4', 'C5', 'D5'], NH = ['D', 'E', 'F#', 'G#', 'A#', 'C', 'D'];
      const tNota = [Wd('X2', 're'), Wd('X3', 'mi'), Wd('X3', 'fa'), Wd('X3', 'sol'), Wd('X3', 'la'), Wd('X3', 'do'), Wd('X4', 'volveria')].map(t => t - 0.15);
      const xc = i => XN0 + i * 200 + CAB / 2;
      const son = S.SON_HEX || HEX.map((_, i) => F0('SON_HEX') + 0.1 + 0.45 * i);
      const tLa6 = Wd('X6', 'la') - 0.15, tDo6 = Wd('X6', 'do') - 0.15, tTono6 = Wd('X6', 'tono') - 0.25;
      const tSib = Wd('X7', 'si') - 0.15, tEnar = Wd('X7', 'enarmonia') - 0.15, tX8 = F0('X8') - 0.1;
      const yNom = YP + 190;
      // X1 · «tú vas subiendo hasta que hayas hecho seis sonidos»: una flecha que sube y cuenta 1…6 (se va con el ejemplo)
      const tSub = Wd('X1', 'subiendo') - 0.2, tSeis = Wd('X1', 'sonidos', 2) - 0.1, tFuera = F0('X2') - 0.3;
      const SUB = N.group(PE); color(SUB, C.rosa);
      s.on(t => opa(SUB, 1 - ease(ramp(t, tFuera, tFuera + 0.4))));
      const yA = x => 416 - 14 * (x - xc(0)) / 200;
      const xa0 = xc(0) - 30, xa1 = xc(6) + 16;
      const tra = trazo(SUB, `M${xa0},${yA(xa0).toFixed(1)} L${xa1},${yA(xa1).toFixed(1)}`, { w: 3.5 });
      s.on(t => trazoK(tra, ramp(t, tSub, tSeis)));
      const ang = Math.atan2(yA(xa1) - yA(xa0), xa1 - xa0), pc = k => `${(xa1 - Math.cos(ang + k) * 16).toFixed(1)},${(yA(xa1) - Math.sin(ang + k) * 16).toFixed(1)}`;
      const punta = N.el('polygon', { points: `${xa1},${yA(xa1).toFixed(1)} ${pc(0.45)} ${pc(-0.45)}`, fill: 'currentColor' }, SUB);
      mostrarEn(s, punta, tSeis - 0.05, 1e9, .15);
      for (let i = 0; i < 6; i++) {
        const n = texto(SUB, String(i + 1), xc(i), yA(xc(i)) - 16, { anchor: 'middle', size: 28, peso: 800, fill: 'currentColor' });
        mostrarEn(s, n, tSub + (tSeis - tSub) * i / 5.5, 1e9, .2);
      }
      // X6–X7 · mientras se habla de La♯–Do, lo demás se queda medio transparente
      const tOjo = Wd('X6', 'ojo') - 0.1;
      const atenua = G => s.on(t => opa(G, 1 - 0.6 * win(t, tOjo, tX8, .35, .35)));
      HEX.forEach((n, i) => {
        const out = N.group(PE), dm = N.group(out), inn = N.group(dm), fl = N.group(inn);
        if (i !== 4 && i !== 5) atenua(dm);
        const x = XN0 + i * 200;
        if (i === 4) {                                           // La♯ ⇄ Si♭ (enarmonía)
          const vA = N.group(fl); nota(vA, 'A#4', x, YP);
          const vB = N.group(fl); nota(vB, 'Bb4', x, YP);
          const nA = N.group(fl); nombreNota(nA, 'A#', xc(i), yNom, { size: 32, anchor: 'middle', fill: 'currentColor' });
          const nB = N.group(fl); nombreNota(nB, 'Bb', xc(i), yNom, { size: 32, anchor: 'middle', fill: 'currentColor' });
          s.on(t => { const k = ease(ramp(t, tSib, tSib + 0.45)) * (1 - ease(ramp(t, tX8, tX8 + 0.45))); opa(vA, 1 - k); opa(nA, 1 - k); opa(vB, k); opa(nB, k); });
        } else {
          nota(fl, n, x, YP);
          nombreNota(fl, NH[i], xc(i), yNom, { size: 32, anchor: 'middle', fill: 'currentColor' });
        }
        pop(s, out, tNota[i], 1e9, xc(i), yNota(n, YP), { k0: .5, fi: .3 });
        let seq;
        if (i < 6) {
          seq = [[-1, C.rosa], [tNota[i + 1], C.blanco]];
          if (i === 4) seq.push([tLa6, C.rosa], [tX8 + 0.5, C.blanco]);
          if (i === 5) seq.push([tDo6, C.rosa], [tX8 + 0.5, C.blanco]);
        } else {                                                 // el Re de arriba: de sombra hasta que suena
          seq = [[-1, C.suave], [son[6] - 0.05, C.blanco]];
          s.on(t => opa(inn, lerp(0.5, 1, ease(ramp(t, son[6] - 0.05, son[6] + 0.25)))));
        }
        colorSeq(s, inn, seq, .25);
        brilla(s, fl, son[i]);
      });
      // tonos: arco redondo por DEBAJO de nota a nota (norma de Iago, como en el Kit); el último, hacia el Re de sombra.
      // Los dos arcos que tocan al La♯ siguen a la cabeza cuando se escribe Si♭ (X7).
      const kSib = t => ease(ramp(t, tSib, tSib + 0.45)) * (1 - ease(ramp(t, tX8, tX8 + 0.45)));
      const yH = (i, t) => i === 4 ? lerp(yNota('A#4', YP), yNota('Bb4', YP), kSib(t)) : yNota(HEX[i], YP);
      for (let i = 0; i < 6; i++) {
        const out = N.group(PE), dm = N.group(out), inn = N.group(dm), fl = N.group(inn);
        if (i !== 4) atenua(dm);
        const xa = xc(i), xb = xc(i + 1);                              // cadena continua, como en el Kit
        const arc = arcoTono(fl, xa, yH(i, 0) + 0.72 * SP, xb, yH(i + 1, 0) + 0.72 * SP);
        if (i === 3 || i === 4) {
          const pa = arc.querySelector('path');
          s.on(t => pa.setAttribute('d', dArco(xa, yH(i, t) + 0.72 * SP, xb, yH(i + 1, t) + 0.72 * SP)));
        }
        pop(s, out, tNota[i + 1], 1e9, (xa + xb) / 2, YP + 90, { k0: .6, fi: .3 });
        let seq;
        if (i < 5) {
          seq = [[-1, C.rosa], [tNota[i + 2], C.blanco]];
          if (i === 4) seq.push([tTono6, C.rosa], [tX8 + 0.5, C.blanco]);
        } else {
          seq = [[-1, C.suave], [son[6] - 0.05, C.blanco]];
          s.on(t => opa(inn, lerp(0.5, 1, ease(ramp(t, son[6] - 0.05, son[6] + 0.25)))));
        }
        colorSeq(s, inn, seq, .25);
        brilla(s, fl, Wd('X8', 'solo') - 0.15 + i * 0.1);
      }
      // X5 · «ya hemos hecho seis»: 1…6 sobre las notas
      const tC = Wd('X5', 'asi') - 0.1;
      cuenta(s, PE, [0, 1, 2, 3, 4, 5].map(i => ({ x: xc(i), y: YP - 72 })), [0, 1, 2, 3, 4, 5].map(i => tC + i * 0.13), F1('SON_HEX') + 0.1, { size: 30 });
      // X6 · de La♯ a Do también hay un tono: su arco (debajo) se pone rosa y lo demás se atenúa (arriba)
      // X7 · puede ser Si♭: enarmonía
      const eq = N.group(PE);
      frase(eq, [['La♯ = Si♭', C.blanco]], xc(4), YP + 250, { size: 32, peso: 800, anchor: 'middle' });
      aparece(s, eq, tSib + 0.35, tX8 + 0.5, { dy: 6 });
      const en = texto(PE, 'enarmonía', xc(4), YP + 296, { anchor: 'middle', size: 30, peso: 800, italic: true, fill: C.rosa });
      aparece(s, en, tEnar, tX8 + 0.5, { dy: 6 });
    });
  }

  // ================================================================ C + S · cromática: doce sonidos a medio tono… y sus seis tipos
  function escenaCromatica() {
    const a = F0('C1') - 0.1, b = F0('B1') + 0.2;
    escena('cromatica', a, b, (s, g) => {
      const fin = b - 0.3;
      const tS1 = F0('S1');
      const k1 = N.group(g); etiqueta(k1, 'escala cromática', CX, 170);
      pop(s, k1, Wd('C2', 'cromatica') - 0.2, fin, CX, 170);
      subtitulo(s, g, [[[['12', C.rosa], [' sonidos', C.blanco]], Wd('C2', 'doce') - 0.1], ['todos a medio tono', Wd('C2', 'todos') - 0.1]], 246, tS1 + 0.4);
      // --- tiempos de los seis tipos
      const TT = [F1('S2') + 0.2, Wd('S3', 'tipos') + 0.1, Wd('S3', 'bemoles') - 0.35, Wd('S3', 'solo') + 0.05, F1('S3') + 0.4];   // tipo 2…6
      const tTipo1 = Wd('S2', 'tipo') - 0.15;
      const tIni = [tTipo1].concat(TT);                                   // empieza cada tipo
      const tOrd = Wd('S4', 'orden') - 0.2;                               // «se sigue un orden»
      const tO = [Wd('S5', 'sostenidos') - 0.1, Wd('S6', 'bemoles') - 0.1];
      const tAll = Wd('S7', 'seis') - 0.15;
      // --- pentagrama sin armadura
      const PE = N.group(g), PEd = N.group(PE);
      aparece(s, PE, a, fin, { dy: 0, fi: .45 });
      pentaClave(PEd, XP, YP, ANCHO_C);
      const tH = Wd('C2', 'sin') - 0.1;
      const hu = N.group(PEd); huecoArm(hu, XHUECO, YP, WHUECO);
      pop(s, hu, tH, tS1 + 0.5, XHUECO + WHUECO / 2, YP, { k0: .8 });
      s.on(t => color(hu, mezcla(C.suave, C.rosa, win(t, tH, tH + 1.6, .3, .5))));
      // --- la cromática del Kit: desde Re, 12 sonidos (sin repetir el Re). Tipo 1 = solo sostenidos; en cada tipo
      //     un ♯ pasa a ♭ (La♯→Si♭, Re♯→Mi♭, Sol♯→La♭, Do♯→Re♭, Fa♯→Sol♭) y la nota siguiente lleva ♮
      const CROM = ['D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5'];
      const CAMB = [{ j: 8, a: 'Bb4' }, { j: 1, a: 'Eb4' }, { j: 6, a: 'Ab4' }, { j: 11, a: 'Db5' }, { j: 4, a: 'Gb4' }];
      const xcC = j => XN0 + j * 100 + CAB / 2;
      const son = S.SON_CROM || CROM.map((_, j) => F0('SON_CROM') + 0.1 + 0.33 * j);
      const tNot = Wd('C2', 'doce') - 0.1, tSos = Wd('S2', 'sostenidos') - 0.25;
      // altura de cada cabeza en el instante t (la que pasa de ♯ a ♭ sube un escalón)
      const yC = (j, t) => {
        const m = CAMB.findIndex(c => c.j === j);
        if (m < 0) return yNota(CROM[j], YP);
        return lerp(yNota(CROM[j], YP), yNota(CAMB[m].a, YP), ease(ramp(t, TT[m] + 0.05, TT[m] + 0.5)));
      };
      let nSos = 0;
      CROM.forEach((n, j) => {
        const out = N.group(PEd), inn = N.group(out);
        const x = XN0 + j * 100;
        const mS = CAMB.findIndex(c => c.j === j), mN = CAMB.findIndex(c => c.j + 1 === j);
        if (mS >= 0) {
          const vA = N.group(inn); nota(vA, n, x, YP);
          const vB = N.group(inn); nota(vB, CAMB[mS].a, x, YP);
          const t0 = TT[mS];
          s.on(t => { opa(vA, 1 - ease(ramp(t, t0, t0 + 0.45))); opa(vB, ease(ramp(t, t0 + 0.1, t0 + 0.55))); });
        } else {
          nota(inn, n, x, YP);
          if (mN >= 0) {
            const nat = N.group(inn);
            N.glyph(nat, 'accidentalNatural', x - (N.M.accidentalNatural.adv + 0.22) * SP, yNota(n, YP), SP);
            const t0 = TT[mN];
            s.on(t => opa(nat, ease(ramp(t, t0 + 0.15, t0 + 0.55))));
          }
        }
        pop(s, out, tNot + j * 0.07, 1e9, xcC(j), yNota(n, YP), { k0: .5, fi: .25 });
        const fl = [son[j]];
        if (n.indexOf('#') >= 0) fl.push(tSos + 0.08 * (nSos++));
        const m = mS >= 0 ? mS : mN;
        const rosa = m >= 0 ? [TT[m] - (mS >= 0 ? 0.35 : 0), m < 4 ? TT[m + 1] - 0.1 : TT[4] + 1.8] : null;
        s.on(t => {
          let k = 0;
          for (const t0 of fl) k = Math.max(k, win(t, t0 - 0.05, t0 + 0.8, .08, .45));
          if (rosa) k = Math.max(k, win(t, rosa[0], rosa[1], .25, .35));
          color(inn, mezcla(C.blanco, C.rosa, k));
        });
      });
      // --- semitonos: pico en V por DEBAJO de nota a nota (norma de Iago, como en el Kit), en cadena continua bajo el
      //     centro de cada cabeza: así la pata pasa por debajo de los ♯ y ♮ de la nota siguiente. Se quedan en los tipos.
      const PIC = N.group(PEd); color(PIC, C.blanco);
      const tMed = Wd('C2', 'medio') - 0.15, tLad = Wd('C3', 'ladrillitos') - 0.1;
      for (let j = 0; j < 11; j++) {
        const xa = xcC(j), xb = xcC(j + 1);                            // cadena continua, como en el Kit
        const w = N.group(PIC), fl = N.group(w);
        const pc = picoSemitono(fl, xa, yC(j, 0) + DY_PICO, xb, yC(j + 1, 0) + DY_PICO, { prof: PROF_PICO });
        if (CAMB.some(c => c.j === j || c.j === j + 1)) {
          const pa = pc.querySelector('path');
          s.on(t => pa.setAttribute('d', dPico(xa, yC(j, t) + DY_PICO, xb, yC(j + 1, t) + DY_PICO, PROF_PICO)));
        }
        pop(s, w, tMed + j * 0.05, 1e9, (xa + xb) / 2, YP + 90, { k0: .6, fi: .25 });
        brilla(s, fl, tLad + j * 0.07);                                  // «ladrillitos pequeños»: destacan los picos
      }
      // --- chips «Tipo 1…6» con su cuenta de ♯ y ♭ (se va llenando: 5♯ 0♭, 4♯ 1♭…)
      const yCh = 250, yCu = 316, tChips = Wd('S1', 'seis') - 0.15;
      const CU = ['5♯ 0♭', '4♯ 1♭', '3♯ 2♭', '2♯ 3♭', '1♯ 4♭', '0♯ 5♭'];
      for (let k = 0; k < 6; k++) {
        const x = CX + (k - 2.5) * 220, t0 = tChips + k * 0.1;
        const G = N.group(g);
        pop(s, G, t0, fin, x, yCh);
        chip(G, 'Tipo ' + (k + 1), x, yCh, { size: 26, anchor: 'middle', relleno: false, borde: C.suave, colorTexto: C.blanco, ls: '0.04em' });
        const L = N.group(G); chip(L, 'Tipo ' + (k + 1), x, yCh, { size: 26, anchor: 'middle', ls: '0.04em' });
        const iv = [[tIni[k], k < 5 ? tIni[k + 1] : tAll + 0.2], [tAll, 1e9]];
        const lit = t => iv.reduce((acc, [p, q]) => Math.max(acc, win(t, p, q, .18, .18)), 0);
        s.on(t => opa(L, lit(t)));
        const cu = N.group(g), cuIn = N.group(cu);
        frase(cuIn, CU[k], x, yCu, { size: 30, peso: 800, anchor: 'middle' });
        aparece(s, cu, tIni[k], fin, { dy: 6 });
        s.on(t => color(cuIn, mezcla(C.suave, C.rosa, lit(t))));
      }
      // --- el orden de los sostenidos y el de los bemoles (se encienden los que usa cada tipo)
      const tLit = Wd('S2', 'sostenidos') - 0.25;
      const ORD = [
        { lab: 'sostenidos', notas: ['F#', 'C#', 'G#', 'D#', 'A#'], y: 690, tA: Wd('S1', 'sostenidos') - 0.15 },
        { lab: 'bemoles', notas: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'], y: 810, tA: Wd('S1', 'bemoles') - 0.15 },
      ];
      ORD.forEach((R, r) => {
        const G0 = N.group(g), G = N.group(G0);
        aparece(s, G0, R.tA, tAll - 0.1, { dy: 8 });
        const tOtra = tO[1 - r];                                        // mientras se lee la otra fila, esta se atenúa
        s.on(t => opa(G, 1 - 0.6 * win(t, tOtra - 0.25, tOtra + 1.6, .3, .4)));
        const lb = texto(G, R.lab, 660, R.y + 12, { anchor: 'end', size: 32, peso: 700, fill: 'currentColor' });
        s.on(t => color(lb, mezcla(C.suave, C.rosa, Math.max(win(t, tOrd, tOrd + 1.2, .3, .4), win(t, tO[r] - 0.2, tO[r] + 1.3, .3, .4)))));
        R.notas.forEach((nm, j) => {
          const it = N.group(G), itC = N.group(it);
          nombreNota(itC, nm, 780 + j * 150, R.y + 12, { size: 34, anchor: 'middle', fill: 'currentColor' });
          // u = «la usa el tipo actual» (0/1), por tramos
          const useq = r === 0
            ? [[-1, 0], [tLit + j * 0.08, 1], [TT[4 - j], 0], [tOrd, 1]]
            : [[-1, 0], [TT[j], 1], [tOrd, 1]];
          const flash = r === 0 ? [tLit + j * 0.08, TT[4 - j], tO[0] + j * 0.16] : [TT[j], tO[1] + j * 0.16];
          s.on(t => {
            let u = useq[0][1];
            for (let i = 1; i < useq.length; i++) { if (t < useq[i][0]) break; u = lerp(useq[i - 1][1], useq[i][1], ease(ramp(t, useq[i][0], useq[i][0] + 0.3))); }
            let k = 0;
            for (const t0 of flash) k = Math.max(k, win(t, t0 - 0.05, t0 + 0.7, .08, .4));
            opa(it, lerp(0.35, 1, Math.max(u, k)));
            color(itC, mixHex(mixHex(C.suave, C.blanco, u), C.rosa, k));
          });
        });
        cuenta(s, G, R.notas.map((_, j) => ({ x: 780 + j * 150, y: R.y - 40 })), R.notas.map((_, j) => tO[r] + j * 0.16), 1e9, { size: 24 });
      });
      // --- (29-sep, Iago) S1 «en los apuntes…» → tarjeta APUNTES arriba a la derecha (se pulsa y abre los apuntes de
      //     «Otras escalas»); se queda hasta el final de la escena
      const tApu = Wd('S1', 'apuntes') - 0.2;
      const kA = tarjetaEnlace(g, 0, 0, { tipo: 'apuntes', titulo: 'Otras escalas', temas: ['esc-otras'], nombre: 'Escalas' });
      kA.firstChild.setAttribute('transform', `translate(${(1880 - kA._w).toFixed(1)},36)`);
      pop(s, kA, tApu, fin, 1880 - kA._w / 2, 84);
      // --- S7 · los seis tipos suenan igual: solo cambia la escritura
      const tSu = Wd('S7', 'suenan') - 0.15, tCa = Wd('S7', 'cambia') - 0.2;
      const yI = 745;
      const tx1 = texto(g, 'suenan igual', 0, yI + 14, { size: 40, peso: 800, fill: C.blanco });
      const tx2 = texto(g, 'solo cambia la escritura', 0, yI + 14, { size: 40, peso: 800, fill: C.blanco });
      const w1 = D.medir(tx1), w2 = D.medir(tx2);
      let xI = CX - (96 + w1 + 110 + 96 + w2) / 2;
      const ear = N.group(g), earIn = N.group(ear); icoOido(earIn, xI + 36, yI, 1.1); color(earIn, C.rosa);
      pop(s, ear, tSu, fin, xI + 36, yI);
      tx1.setAttribute('x', (xI + 96).toFixed(1)); aparece(s, tx1, tSu + 0.1, fin, { dy: 8 });
      xI += 96 + w1 + 110;
      const lap = N.group(g), lapIn = N.group(lap); icoLapiz(lapIn, xI + 36, yI, 1.1); color(lapIn, C.rosa);
      pop(s, lap, tCa, fin, xI + 36, yI);
      tx2.setAttribute('x', (xI + 96).toFixed(1)); aparece(s, tx2, tCa + 0.1, fin, { dy: 8 });
    });
  }

  // ================================================================ B · no te olvides del becuadro: Si♭ → Si♮
  function escenaBecuadro() {
    const a = F0('B1') - 0.1, b = F0('F1') + 0.2;
    escena('becuadro', a, b, (s, g) => {
      const fin = b - 0.3;
      const k1 = N.group(g); etiqueta(k1, '¡NO TE OLVIDES!', CX, 180, { size: 28, ls: '0.12em' });
      pop(s, k1, Wd('B1', 'olvides') - 0.2, fin, CX, 180);
      const yM = 540;
      const tBem = Wd('B1', 'bemol') - 0.1, tSig = Wd('B1', 'siguiente') - 0.1, tSub = Wd('B1', 'subir') - 0.15;
      const tBec = Wd('B1', 'becuadro') - 0.15, tFal = Wd('B1', 'fallo') - 0.05, tSue = Wd('B1', 'suena') - 0.15;
      const tTip = Wd('B1', 'tipico') - 0.2;
      [{ x: 250, bien: true, t: Wd('B1', 'haciendo') - 0.25 }, { x: 1010, bien: false, t: tTip }].forEach(p => {
        const G0 = N.group(g), G = N.group(G0);
        aparece(s, G0, p.t, fin, { dy: 12 });
        if (p.bien) s.on(t => opa(G, 1 - 0.55 * win(t, tTip, F1('B1') + 0.3, .4, .5)));   // mientras habla del típico fallo
        panel(G, p.x, 300, 660, 470, { rx: 24 });
        pentaClave(G, p.x + 70, yM, 520);
        const x1 = p.x + 300, x2 = p.x + 450;
        const n1 = N.group(G); const r1 = nota(n1, 'Bb4', x1, yM);
        const n2 = N.group(G); nota(n2, 'B4', x2, yM);
        const nom = N.group(G);
        const mk = N.group(G), mkIn = N.group(mk); marca(mkIn, p.bien, p.x + 596, 356, 22);
        if (p.bien) {
          brilla(s, r1.alt, tBem);
          pop(s, n2, tSig, 1e9, x2 + CAB / 2, yM, { k0: .5 });
          const ar = N.group(G); color(ar, C.rosa);                       // semitono: pico en V por debajo
          picoSemitono(ar, x1 + CAB / 2, yM + DY_PICO, x2 + CAB / 2, yM + DY_PICO, { prof: 50 });
          mostrarEn(s, ar, tSub, 1e9, .3);
          // el becuadro se escribe a lápiz (dos trazos en «L») y luego queda el de verdad, en rosa
          const nat = N.group(G); color(nat, C.rosa);
          const xn = x2 - (N.M.accidentalNatural.adv + 0.22) * SP;
          N.glyph(nat, 'accidentalNatural', xn, yM, SP);
          const Pn = (sx, sy) => `${(xn + sx * SP).toFixed(1)},${(yM - sy * SP).toFixed(1)}`;
          aLapiz(s, G, [`M${Pn(0.1, 1.3)} L${Pn(0.1, -0.42)} L${Pn(0.58, -0.22)}`, `M${Pn(0.1, 0.22)} L${Pn(0.58, 0.42)} L${Pn(0.58, -1.3)}`], tBec - 0.05, 0.75, nat);
          frase(nom, [['Si♭', C.blanco], ['  →  ', C.suave], ['Si♮', C.rosa]], x1 + (x2 - x1) / 2 + CAB / 2, yM + 130, { size: 34, peso: 800, anchor: 'middle' });
          mostrarEn(s, nom, tBec + 0.55, 1e9, .3);
          pop(s, mk, tBec + 0.6, 1e9, p.x + 596, 356, { k0: .4 });
        } else {
          const hu = N.group(G); color(hu, C.rosa);
          N.el('circle', { cx: x2 - 14, cy: yM, r: 25, fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-dasharray': '5 6' }, hu);
          mostrarEn(s, hu, tFal + 0.25, 1e9, .3);
          frase(nom, [['Si♭', C.blanco], ['  →  ', C.suave], ['¿Si♭?', C.rosa]], x1 + (x2 - x1) / 2 + CAB / 2, yM + 130, { size: 34, peso: 800, anchor: 'middle' });
          mostrarEn(s, nom, tFal + 0.35, 1e9, .3);
          pop(s, mk, tFal, 1e9, p.x + 596, 356, { k0: .4 });
          s.on(t => { const k = Math.sin(Math.PI * ramp(t, tSue, tSue + 0.6)); mkIn.setAttribute('transform', `translate(${p.x + 596},356) scale(${(1 + 0.35 * k).toFixed(3)}) translate(${-(p.x + 596)},-356)`); });
        }
      });
      // también en los ejercicios de semitono cromático
      const tSe = Wd('B1', 'semitono') - 0.2;
      const SE = N.group(g);
      const tam = texto(SE, 'también en', 0, 872, { size: 30, peso: 600, italic: true, fill: C.suave });
      const wt = D.medir(tam);
      const cw = N.group(SE), cc = chip(cw, 'semitono cromático', 0, 862, { size: 28, anchor: 'start', relleno: false, borde: C.suave, colorTexto: C.blanco, ls: '0.04em' });
      const x0 = CX - (wt + 18 + cc._w) / 2;
      tam.setAttribute('x', x0.toFixed(1)); cc.setAttribute('transform', `translate(${(x0 + wt + 18).toFixed(1)},862)`);
      aparece(s, SE, tSe, fin, { dy: 8 });
    });
  }

  // ================================================================ F · repaso
  function escenaRepaso() {
    const a = F0('F1') - 0.1, b = T.acorde + 0.15;
    escena('repaso', a, b, (s, g) => {
      const fin = b - 0.3;
      const P = N.group(g);
      aparece(s, P, F0('F1'), fin, { dy: 12 });
      panel(P, 230, 130, 1460, 720, { rx: 24, stroke: 'rgba(248,250,252,0.35)', sw: 2 });
      texto(P, 'REPASO', 280, 194, { size: 26, peso: 800, ls: '0.24em', fill: C.rosa });
      const tV = Wd('F3', 'venga') - 0.1;
      const FILAS = [
        { lab: 'pentatónica Mayor', sub: 'sin 4.º y 7.º', ta: Wd('F1', 'pentatonica') - 0.2, tb: Wd('F1', 'pentatonica', 2) - 0.2, quita: [[3, Wd('F1', 'cuarto')], [6, Wd('F1', 'septimo')]] },
        { lab: 'pentatónica menor', sub: 'sin 2.º y 6.º', ta: Wd('F1', 'pentatonica', 2) - 0.2, tb: F0('F2') - 0.2, quita: [[1, Wd('F1', 'segundo')], [5, Wd('F1', 'sexto')]] },
        { lab: 'hexátona', sub: '6 sonidos · solo tonos', ta: Wd('F2', 'hexatona') - 0.2, tb: F0('F3') - 0.1, lad: 'T', tl: Wd('F2', 'ladrillos') - 0.15 },
        { lab: 'cromática', sub: '12 sonidos · solo semitonos', ta: Wd('F3', 'cromatica') - 0.2, tb: tV, lad: 'st', tl: Wd('F3', 'ladrillos') - 0.15 },
      ];
      const xV = 1090, wV = 492;
      FILAS.forEach((f, i) => {
        const y = 290 + i * 140;
        const G = N.group(g);
        aparece(s, G, f.ta, fin, { dy: 8 });
        const Lb = N.group(G);
        texto(Lb, f.lab, 300, y + 4, { size: 44, peso: 800, fill: 'currentColor' });
        color(Lb, C.blanco);
        resalta(s, Lb, f.ta, f.tb, { d: .25 });
        texto(G, f.sub, 300, y + 48, { size: 28, peso: 600, fill: C.suave });
        const V = N.group(G); color(V, C.blanco);
        if (!f.lad) {
          const T7 = tiraGrados(V, xV, y - 34, { lado: 60, gap: 12, size: 30 });
          f.quita.forEach(([k, tq]) => quitaCaja(s, T7.cajas[k], tq - 0.1));
        } else {
          // un punto por sonido (suben), unidos por DEBAJO: arco redondo = tono · pico en V = semitono
          const hex = f.lad === 'T', n = hex ? 6 : 12, u = wV / 11;          // u = un semitono
          const pts = [...Array(n)].map((_, j) => { const st = hex ? 2 * j : j; return { x: xV + st * u + 6, y: y - 2 - st * 3 }; });
          pts.forEach((p, j) => {
            const d = N.group(V); N.el('circle', { cx: p.x, cy: p.y, r: 8, fill: 'currentColor' }, d);
            pop(s, d, f.ta + 0.25 + j * (hex ? 0.06 : 0.035), 1e9, p.x, p.y, { k0: .5, fi: .2 });
            if (j > 0) {
              const q = pts[j - 1], w = N.group(V);
              (hex ? arcoTono : picoSemitono)(w, q.x, q.y + 12, p.x, p.y + 12, { prof: hex ? 20 : 13, w: 3 });
              mostrarEn(s, w, f.tl + j * (hex ? 0.08 : 0.045), 1e9, .25);
            }
          });
        }
      });
      const va = N.group(g); chip(va, '¡VAMOS A POR ELLAS!', CX, 905, { size: 30, anchor: 'middle' });
      pop(s, va, Wd('F3', 'vamos') - 0.15, fin, CX, 905);
    });
  }

  // (29-sep, Iago: «los contenidos están poco centrados en el eje Y… queda demasiado hueco abajo») cada escena baja
  // un poco entera (px del lienzo de 1080), medido con tests/medir_y2.py; las escenas seguidas que comparten
  // rótulo o pentagrama bajan lo mismo, para que nada salte al cambiar de escena.
  const DY_ESCENA = { intro: 30, penta: 30, pentaMayor: 90, pentaMenor: 90, tipos: 90, procedimiento: 25, hexatona: 45, cromatica: 45 };
  const ORDEN = [escenaIntro, escenaPenta, escenaPentaMayor, escenaPentaMenor, escenaTipos, escenaProcedimiento, escenaHexatona, escenaCromatica, escenaBecuadro, escenaRepaso]
    .map(f => () => {
      const n0 = esc.length; f();
      for (let i = n0; i < esc.length; i++) { const d = DY_ESCENA[esc[i].nombre]; if (d) esc[i].g.setAttribute('transform', `translate(0,${d})`); }
    });

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
