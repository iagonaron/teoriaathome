/* =====================================================================
   ESCENAS · Claves (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (claves/escenas_cuerpo.js). Todo es función pura de t.
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

  // ================================================================ E17 · CLAVES (su historia, para qué sirven, las siete y cómo se leen)
  const TITULO = { kicker: 'TEORÍA  ·  LECTURA', lineas: ['CLAVES'], sub: 'Las siete claves · El Do central' };

  // ---------------------------------------------------------------- utilidades de este vídeo
  const ALT_GL = { '♭': 'accidentalFlat', '♯': 'accidentalSharp', '♮': 'accidentalNatural', '𝄫': 'accidentalDoubleFlat', '𝄪': 'accidentalDoubleSharp' };
  function frase(parent, segs, x, y, o) {
    o = o || {};
    const size = o.size || 36, peso = o.peso || 700, esp = size * 0.28;
    const G = N.group(parent, 'frase');
    if (typeof segs === 'string') segs = [[segs, o.fill || 'currentColor']];
    let cx = 0, prev = '';
    for (const [str, col] of segs) {
      for (const tr of str.split(/(♭|♯|♮|𝄫|𝄪)/u)) {
        if (!tr) continue;
        if (ALT_GL[tr]) {
          const gl = ALT_GL[tr], bem = tr === '♭' || tr === '𝄫', pegada = /[A-Za-zÁÉÍÓÚáéíóúñÑ0-9]$/.test(prev) || !!ALT_GL[prev];
          const sa = pegada ? size * 0.36 : size * (bem ? 0.31 : 0.29);
          const yo = tr === '𝄪' ? -size * 0.3 : (pegada ? -size * 0.33 : (bem ? -0.7 * sa : -size * 0.36));
          const xg = cx + size * (pegada ? 0.05 : 0.02);
          const gg = N.group(G, 'alt'); if (col && col !== 'currentColor') color(gg, col);
          N.glyph(gg, gl, xg, yo, sa);
          cx = xg + N.M[gl].adv * sa + size * 0.05;
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
    G._w = cx; G._x = ax;
    return G;
  }
  function fraseG(parent, segs, x, y, o) { const w = N.group(parent); w._f = frase(w, segs, x, y, o); return w; }
  /** Las siete claves: glifo, desplazamiento del origen (en sp, + hacia abajo) y dónde cae el Do central (en sp). */
  const CLAVES = {
    sol2: { gl: 'gClef', dy: 1, c4: 3, nom: 'Sol en 2ª' },
    fa4: { gl: 'fClef', dy: -1, c4: -3, nom: 'Fa en 4ª' },
    fa3: { gl: 'fClef', dy: 0, c4: -2, nom: 'Fa en 3ª' },
    do1: { gl: 'cClef', dy: 2, c4: 2, nom: 'Do en 1ª' },
    do2: { gl: 'cClef', dy: 1, c4: 1, nom: 'Do en 2ª' },
    do3: { gl: 'cClef', dy: 0, c4: 0, nom: 'Do en 3ª' },
    do4: { gl: 'cClef', dy: -1, c4: -1, nom: 'Do en 4ª' },
  };
  const ORDEN_CL = ['sol2', 'fa4', 'fa3', 'do1', 'do2', 'do3', 'do4'];
  /** Pentagrama con una clave cualquiera. Devuelve {g, pe, cl, x, yM, ancho}. */
  function pentaCon(parent, clave, x, yM, ancho) {
    const g = N.group(parent, 'penta');
    const pe = N.group(g); N.pentagrama(pe, x, yM, ancho, SP);
    const cl = N.group(g); const k = CLAVES[clave];
    N.glyph(cl, k.gl, x + 0.6 * SP, yM + k.dy * SP, SP);
    return { g, pe, cl, x, yM, ancho };
  }
  /** Redonda a una altura cualquiera (pos en sp desde la línea central, + arriba), con líneas adicionales. */
  function cabeza(parent, x, yM, pos) {
    const G = N.group(parent, 'nota');
    const w = N.M.noteheadWhole.adv * SP;
    for (let lp = -3; lp >= pos - 1e-6; lp -= 1) N.line(G, x - 0.4 * SP, yM - lp * SP, x + w + 0.4 * SP, yM - lp * SP, 0.16 * SP * 1.0);
    for (let lp = 3; lp <= pos + 1e-6; lp += 1) N.line(G, x - 0.4 * SP, yM - lp * SP, x + w + 0.4 * SP, yM - lp * SP, 0.16 * SP * 1.0);
    N.glyph(G, 'noteheadWhole', x, yM - pos * SP, SP);
    G._cx = x + w / 2; G._y = yM - pos * SP;
    return G;
  }
  /** Una línea del pentagrama encendida (1 = la de abajo … 5 = la de arriba). */
  function lineaRosa(parent, x, yM, ancho, n) {
    const G = N.group(parent); color(G, C.rosa);
    N.line(G, x, yM + (3 - n) * SP, x + ancho, yM + (3 - n) * SP, 5);
    return G;
  }

  // ================================================================ H · la historia: una línea y un símbolo
  function escenaHistoria() {
    const a = F0('H1') - 0.1, b = F0('P1') - 0.2;
    escena('historia', a, b, (s, g) => {
      const fin = b - 0.3;
      const q = fraseG(g, [['¿Para qué servían ', C.blanco], ['las claves', C.rosa], ['?', C.blanco]], CX, 190, { size: 52, peso: 800, anchor: 'middle' });
      aparece(s, q, Wd('H1', 'utilidad') - 0.3, F0('H6') - 0.3, { dy: 8 });
      const k = N.group(g); chip(k, 'UNA HISTORIA CURIOSA', CX, 280, { size: 28, anchor: 'middle', relleno: false });
      pop(s, k, Wd('H2', 'historia') - 0.2, F0('H6') - 0.3, CX, 280);
      // una sola línea (antes del pentagrama)
      const yL = 560, x0 = 420, x1 = 1500;
      const tLi = Wd('H3', 'linea') - 0.3;
      const L = N.group(g); color(L, C.blanco);
      const ln = N.el('path', { d: `M${x0},${yL} L${x1},${yL}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, L);
      const lon = x1 - x0; ln.setAttribute('stroke-dasharray', lon);
      s.on(t => { ln.setAttribute('stroke-dashoffset', (lon * (1 - ease(ramp(t, tLi, tLi + 0.9)))).toFixed(1)); opa(L, t < F0('H6') - 0.1 ? 1 : 1 - ease(ramp(t, F0('H6') - 0.1, F0('H6') + 0.4))); });
      const sinP = fraseG(g, [['sin pentagrama', C.suave]], CX, yL + 120, { size: 32, peso: 700, italic: true, anchor: 'middle' });
      aparece(s, sinP, tLi + 0.2, F0('H4') + 0.5, { dy: 6 });
      // el símbolo en la línea: «la nota que esté aquí se llama así»
      const tSi = Wd('H4', 'simbolo') - 0.2;
      const SI = N.group(g); color(SI, C.rosa); N.glyph(SI, 'cClef', x0 + 30, yL, SP * 1.3);
      pop(s, SI, tSi, F0('H6') - 0.1, x0 + 60, yL, { k0: .4 });
      const cl = fraseG(g, [['= una clave', C.rosa]], x0 + 110, yL - 70, { size: 34, peso: 800 });
      aparece(s, cl, Wd('H4', 'claves') - 0.2, F0('H6') - 0.1, { dy: 6 });
      const tAq = Wd('H5', 'aqui') - 0.2;
      const NA = N.group(g); color(NA, C.rosa); N.glyph(NA, 'noteheadWhole', 820, yL, SP);
      pop(s, NA, tAq, F0('H6') - 0.1, 836, yL, { k0: .4 });
      const lla = fraseG(g, [['«se llama así»', C.rosa]], 836, yL + 70, { size: 32, peso: 800, anchor: 'middle' });
      aparece(s, lla, Wd('H5', 'llama') - 0.2, F0('H6') - 0.1, { dy: 6 });
      // (29-sep, Iago) debajo, el nombre: Do (es una clave de Do)
      const dn = fraseG(g, [['Do', C.blanco]], 836, yL + 132, { size: 48, peso: 800, anchor: 'middle' });
      aparece(s, dn, Wd('H5', 'asi') - 0.05, F0('H6') - 0.1, { dy: 6 });
      [[1040, yL - 50], [1210, yL + 40], [1380, yL - 26]].forEach(([x, y], i) => {
        const G = N.group(g); N.glyph(G, 'noteheadWhole', x, y, SP); color(G, C.blanco);
        texto(G, '?', x + 18, y - 34, { anchor: 'middle', size: 34, peso: 800, fill: C.suave });
        pop(s, G, Wd('H5', 'arriba') - 0.2 + i * 0.25, F0('H6') - 0.1, x + 16, y, { k0: .4 });
      });
      const ap = fraseG(g, [['… y las demás, ', C.suave], ['te apañas', C.blanco]], 1210, yL + 150, { size: 32, peso: 700, italic: true, anchor: 'middle' });
      aparece(s, ap, Wd('H5', 'apanando') - 0.3, F0('H6') - 0.1, { dy: 6 });
      // H6 · con los años, varias… hoy: siete claves. ¿Para qué tantas?
      const tSie = Wd('H6', 'siete') - 0.2, tVa = Wd('H6', 'varias') - 0.3;
      ORDEN_CL.forEach((c, i) => {
        const x = 180 + i * 230, P = pentaCon(g, c, x, 540, 190);
        aparece(s, P.g, tVa + i * 0.22, fin, { dy: 10 });
      });
      const s7 = fraseG(g, [['hoy: ', C.suave], ['7 claves', C.rosa]], CX, 330, { size: 50, peso: 800, anchor: 'middle' });
      aparece(s, s7, tSie, fin, { dy: 8 });
      const pq = fraseG(g, [['¿para qué tantas?', C.blanco]], CX, 760, { size: 44, peso: 800, italic: true, anchor: 'middle' });
      aparece(s, pq, Wd('H6', 'tantas') - 0.4, fin, { dy: 8 });
    });
  }

  // ================================================================ P · aprovechar el pentagrama: el contrabajo y el flautín
  function escenaContrabajo() {
    const a = F0('P1') - 0.2, b = F0('U1') - 0.2;
    escena('contrabajo', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'APROVECHAR EL PENTAGRAMA', CX, 130, { size: 32, anchor: 'middle' });
      pop(s, k, Wd('P1', 'aprovechar') - 0.2, fin, CX, 130);
      // P2 · solo la clave de Sol: las demás se esfuman
      const tSo = Wd('P2', 'sol', 2) - 0.2, tEs = Wd('P2', 'esfumasen') - 0.2, tMo = F0('P4') - 0.2;
      const W0 = N.group(g);
      s.on(t => {
        const kk = ease(ramp(t, tEs + 0.5, tEs + 1.5)), cx0 = 275, sc = 1 + 0.7 * kk, cx = cx0 + (CX - cx0) * kk;
        W0.setAttribute('transform', `translate(${cx.toFixed(1)},420) scale(${sc.toFixed(3)}) translate(${-cx0},-420)`);
      });
      ORDEN_CL.forEach((c, i) => {
        const x = 180 + i * 230, P = pentaCon(i === 0 ? W0 : g, c, x, 420, 190);
        s.on(t => {
          const vis = win(t, a + 0.2, tMo, .3, .4);
          const k2 = i === 0 ? 1 : 1 - ease(ramp(t, tEs, tEs + 0.8));
          opa(P.g, vis * k2);
          if (i === 0) color(P.cl, mezcla(C.blanco, C.rosa, ease(ramp(t, tSo, tSo + 0.4))));
        });
      });
      const ma = fraseG(g, [['¡qué maravilla!', C.rosa]], CX, 660, { size: 46, peso: 800, italic: true, anchor: 'middle' });
      aparece(s, ma, Wd('P3', 'maravilla') - 0.3, tMo, { dy: 8 });
      // P4 · el contrabajo en clave de Sol: las notas, lejísimos, abajo
      const yM = 380, PC = N.group(g);
      aparece(s, PC, tMo, F0('P5') - 0.2, { dy: 0 });
      pentaCon(PC, 'sol2', 300, yM, 760);
      const tCb = Wd('P4', 'contrabajo') - 0.2, tLi = Wd('P4', 'lineas') - 0.3;
      [['E2', 560], ['G2', 700], ['A2', 840], ['C3', 980]].forEach(([n, x], i) => {
        const W = N.group(PC); const r = N.redonda(W, n, x, yM, SP); color(W, C.rosa);
        pop(s, W, tCb + 0.3 + i * 0.2, fin, x + 16, r.y, { k0: .5 });
      });
      const fP4 = F0('P5') - 0.2;
      const cb = fraseG(g, [['contrabajo', C.blanco]], 1340, yM + 20, { size: 44, peso: 800, anchor: 'middle' });
      aparece(s, cb, tCb, fP4, { dy: 6 });
      const mo1 = fraseG(g, [['un mogollón de', C.suave]], 1340, yM + 110, { size: 34, peso: 800, anchor: 'middle' });
      const mo2 = fraseG(g, [['líneas adicionales', C.rosa]], 1340, yM + 156, { size: 34, peso: 800, anchor: 'middle' });
      aparece(s, mo1, tLi, fP4, { dy: 6 }); aparece(s, mo2, tLi + 0.15, fP4, { dy: 6 });
      // la casa (el pentagrama: le ponemos tejado) y el felpudo (debajo, donde duermen las notas)
      const tCa = Wd('P4', 'casa') - 0.3, tFe = Wd('P4', 'felpudo') - 0.3, tAp = Wd('P4', 'aprovechando') - 0.3;
      const TE = N.group(g); color(TE, C.blanco);
      const yT = yM - 2 * SP - 16, dT = `M285,${yT} L680,${yT - 118} L1075,${yT}`;
      const te = N.el('path', { d: dT, fill: 'none', stroke: 'currentColor', 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, TE);
      const lT = 2 * Math.hypot(395, 118); te.setAttribute('stroke-dasharray', lT.toFixed(1));
      s.on(t => { te.setAttribute('stroke-dashoffset', (lT * (1 - ease(ramp(t, tCa, tCa + 0.8)))).toFixed(1)); opa(TE, win(t, tCa, fP4, .05, .3)); });
      const ca = fraseG(g, [['casa', C.blanco]], 680, yT - 30, { size: 30, peso: 800, anchor: 'middle' });
      aparece(s, ca, tCa + 0.4, fP4, { dy: 4 });
      const FE = N.group(g); color(FE, C.rosa);
      N.el('rect', { x: 520, y: yM + 256, width: 540, height: 26, rx: 9, fill: 'currentColor', 'fill-opacity': 0.28, stroke: 'currentColor', 'stroke-width': 2.5 }, FE);
      aparece(s, FE, tFe, fP4, { dy: 6 });
      const fe = fraseG(g, [['felpudo', C.rosa]], 790, yM + 330, { size: 32, peso: 800, italic: true, anchor: 'middle' });
      aparece(s, fe, tFe + 0.1, fP4, { dy: 6 });
      const na = fraseG(g, [['no aprovechas ', C.rosa], ['el pentagrama', C.blanco]], 1340, yM + 280, { size: 34, peso: 800, anchor: 'middle' });
      aparece(s, na, tAp, fP4, { dy: 6 });
      // P5 · y el flautín en clave de Fa: lejísimos, arriba
      const tFl = Wd('P5', 'flautin') - 0.3, yF = 700;
      const PF = N.group(g); aparece(s, PF, F0('P5') - 0.2, fin, { dy: 0 });
      pentaCon(PF, 'fa4', 300, yF, 760);
      [['C6', 600], ['E6', 760], ['G6', 920]].forEach(([n, x], i) => {
        const W = N.group(PF); const r = N.redonda(W, n, x, yF, SP, { clave: 'fa' }); color(W, C.rosa);
        pop(s, W, tFl + i * 0.2, fin, x + 16, r.y, { k0: .5 });
      });
      const fl = fraseG(g, [['flautín', C.blanco], [' en clave de Fa', C.suave]], 1350, yF + 20, { size: 40, peso: 800, anchor: 'middle' });
      aparece(s, fl, tFl, fin, { dy: 6 });
      // (29-sep, Iago) como el felpudo del contrabajo: el flautín vive en el tejado
      const tj = fraseG(g, [['¡vivir en el tejado!', C.rosa]], 782, 318, { size: 40, peso: 800, italic: true, anchor: 'middle' });
      aparece(s, tj, tFl + 0.55, fin, { dy: 8 });
    });
  }

  // ================================================================ U · cada instrumento, su clave
  function escenaUsos() {
    const a = F0('U1') - 0.2, b = F0('K1') - 0.2;
    escena('usos', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'CADA INSTRUMENTO, SU CLAVE', CX, 130, { size: 32, anchor: 'middle' });
      pop(s, k, Wd('U1', 'utilidad') - 0.2, fin, CX, 130);
      const TJ = [
        { tit: ['AGUDOS'], cl: ['sol2'], nom: 'clave de Sol', t0: Wd('U1', 'agudos') - 0.2, t1: F0('U2') - 0.1 },
        { tit: ['GRAVES'], cl: ['fa4'], nom: 'clave de Fa', t0: Wd('U2', 'graves') - 0.2, t1: F0('U3') - 0.1 },
        { tit: ['MUY AGUDOS', 'Y MUY GRAVES'], cl: ['sol2', 'fa4'], nom: 'doble pentagrama', t0: F0('U3') - 0.1, t1: F0('U4') - 0.1 },
        { tit: ['NI MUY AGUDOS', 'NI MUY GRAVES'], cl: ['do3', 'do4'], nom: 'Do en 3ª o en 4ª', t0: F0('U4') - 0.1, t1: fin + 1 },
      ];
      const wC = 410, gap = 26, x0 = CX - (4 * wC + 3 * gap) / 2, yC = 240, hC = 560;
      TJ.forEach((c, i) => {
        const x = x0 + i * (wC + gap), G = N.group(g);
        const r = panel(G, x, yC, wC, hC, { rx: 24 });
        const tt = N.group(G); c.tit.forEach((ln, j) => texto(tt, ln, x + wC / 2, yC + (c.tit.length > 1 ? 50 : 60) + j * 32, { anchor: 'middle', size: 26, peso: 800, ls: '0.05em', fill: 'currentColor' }));
        if (c.cl.length === 1) pentaCon(G, c.cl[0], x + 40, yC + 280, wC - 80);
        else if (i === 2) { pentaCon(G, 'sol2', x + 70, yC + 210, wC - 110); pentaCon(G, 'fa4', x + 70, yC + 360, wC - 110); N.llave(G, x + 64, yC + 210 - 2 * SP, yC + 360 + 2 * SP, SP); }
        else { pentaCon(G, 'do3', x + 40, yC + 210, wC - 80); pentaCon(G, 'do4', x + 40, yC + 360, wC - 80); }
        const nm = N.group(G); frase(nm, c.nom, x + wC / 2, yC + hC - 50, { size: 30, peso: 800, anchor: 'middle' });
        aparece(s, G, c.t0, fin, { dy: 12 });
        s.on(t => {
          const kk = win(t, c.t0, c.t1, .3, .3);
          r.setAttribute('stroke', mezcla('#3a4556', C.rosa, kk)); r.setAttribute('stroke-width', (1.5 + 1.5 * kk).toFixed(2));
          color(tt, mezcla(C.suave, C.rosa, kk)); color(nm, mezcla(C.blanco, C.rosa, kk));
        });
      });
      const co = fraseG(g, [['¿conoces a alguien que toque en ', C.suave], ['clave de Do', C.rosa], ['?', C.suave]], CX, 900, { size: 36, peso: 700, italic: true, anchor: 'middle' });
      aparece(s, co, Wd('U5', 'conocido') - 0.4, fin, { dy: 6 });
    });
  }

  // ================================================================ K · las siete claves
  function escenaSiete() {
    const a = F0('K1') - 0.2, b = F0('L1') - 0.2;
    escena('siete', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'LAS SIETE CLAVES', CX, 150, { size: 34, anchor: 'middle' });
      pop(s, k, Wd('K1', 'decir') - 0.2, fin, CX, 150);
      const tt = {
        sol2: Wd('K2', 'sol') - 0.2, fa4: Wd('K2', 'cuarta') - 0.3, fa3: Wd('K2', 'tercera') - 0.3,
        do1: Wd('K3', 'primera') - 0.2, do2: Wd('K3', 'segunda') - 0.2, do3: Wd('K3', 'tercera') - 0.2, do4: Wd('K3', 'cuarta') - 0.2,
      };
      const tDo = Wd('K3', 'simbolo') - 0.2;
      // K4 · la misma línea (la 3ª) en las siete claves: siete nombres distintos
      const tNo = Wd('K4', 'cualquier') - 0.2, tNm = Wd('K4', 'nombre') - 0.1;
      const NOMBRE_L3 = { sol2: 'Si', fa4: 'Re', fa3: 'Fa', do1: 'Sol', do2: 'Mi', do3: 'Do', do4: 'La' };
      ORDEN_CL.forEach((c, i) => {
        const fila = i < 3 ? 0 : 1, col = i < 3 ? i : i - 3;
        const n = fila ? 4 : 3, wS = 330, gap = 60;
        const x = CX - (n * wS + (n - 1) * gap) / 2 + col * (wS + gap), yM = fila ? 672 : 362;
        const G = N.group(g);
        const P = pentaCon(G, c, x, yM, wS);
        const nm = N.group(G); texto(nm, CLAVES[c].nom, x + wS / 2, yM + 150, { anchor: 'middle', size: 34, peso: 800, fill: 'currentColor' });
        aparece(s, G, Math.min(tt[c], i >= 3 ? tDo + 0.2 : 1e9), fin, { dy: 10 });
        s.on(t => { const kk = win(t, tt[c], tt[c] + 1.4, .25, .4); color(P.cl, mezcla(C.blanco, C.rosa, kk)); color(nm, mezcla(C.blanco, C.rosa, kk)); });
        const xn = x + wS * 0.62, NT = N.group(g); color(NT, C.rosa);
        N.glyph(NT, 'noteheadWhole', xn, yM, SP);
        pop(s, NT, tNo + i * 0.12, fin, xn + 22, yM, { k0: .4 });
        const nn = fraseG(g, [[NOMBRE_L3[c], C.rosa]], xn + 22, yM - 3 * SP - 22, { size: 36, peso: 800, anchor: 'middle' });
        aparece(s, nn, tNm + i * 0.12, fin, { dy: 6 });
      });
      const cu = fraseG(g, [['la misma línea: ', C.blanco], ['siete nombres distintos', C.rosa]], CX, 935, { size: 40, peso: 800, anchor: 'middle' });
      aparece(s, cu, Wd('K4', 'haber') - 0.3, fin, { dy: 8 });
    });
  }

  // ================================================================ L · cómo se leen: la clave nombra su línea (Fa en 4ª, Do en 3ª)
  function escenaLectura() {
    const a = F0('L1') - 0.2, b = F0('E1') - 0.2;
    escena('lectura', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, '¿CÓMO SE LEEN?', CX, 150, { size: 34, anchor: 'middle' });
      pop(s, k, Wd('L1', 'leen') - 0.3, fin, CX, 150);
      const re = fraseG(g, [['la clave ', C.blanco], ['nombra su línea', C.rosa]], CX, 250, { size: 46, peso: 800, anchor: 'middle' });
      aparece(s, re, Wd('L2', 'linea') - 0.4, fin, { dy: 8 });
      const yM = 540, yLab = yM + 215;
      // Fa en 4ª: la 4ª línea es Fa
      const tF = Wd('L3', 'fa') - 0.2, tL4 = Wd('L3', 'linea') - 0.2;
      const PF = N.group(g); aparece(s, PF, tF, fin, { dy: 10 });
      pentaCon(PF, 'fa4', 250, yM, 600);
      const l4 = lineaRosa(PF, 250, yM, 600, 4); mostrarEn(s, l4, tL4, fin, .3);
      const nf = N.group(PF); color(nf, C.rosa); N.glyph(nf, 'noteheadWhole', 600, yM - SP, SP);
      pop(s, nf, tL4 + 0.3, fin, 622, yM - SP, { k0: .4 });
      const lf = fraseG(g, [['4ª línea = ', C.blanco], ['Fa', C.rosa]], 550, yLab, { size: 40, peso: 800, anchor: 'middle' });
      aparece(s, lf, Wd('L3', 'llama') - 0.2, fin, { dy: 6 });
      // Do en 3ª: la 3ª línea es el Do central
      const tD = Wd('L4', 'do') - 0.2, tDc = Wd('L4', 'central') - 0.2;
      const x0 = 1070, PD = N.group(g); aparece(s, PD, tD, fin, { dy: 10 });
      pentaCon(PD, 'do3', x0, yM, 600);
      const l3 = lineaRosa(PD, x0, yM, 600, 3); mostrarEn(s, l3, tDc, fin, .3);
      const xDo = 1395;
      const nd = N.group(PD); color(nd, C.rosa); N.glyph(nd, 'noteheadWhole', xDo, yM, SP);
      pop(s, nd, tDc + 0.2, fin, xDo + 22, yM, { k0: .4 });
      const ld = fraseG(g, [['3ª línea = ', C.blanco], ['Do central', C.rosa]], 1370, yLab, { size: 40, peso: 800, anchor: 'middle' });
      aparece(s, ld, tDc, fin, { dy: 6 });
      // L5 · desde ahí, contamos hacia arriba (Re, Mi) o hacia abajo (Si, La)
      const yNom = yM + 3 * SP + 42;
      const dn = fraseG(g, [['Do', C.rosa]], xDo + 22, yNom, { size: 30, peso: 800, anchor: 'middle' });
      aparece(s, dn, Wd('L5', 'desde') - 0.2, fin, { dy: 4 });
      const PASOS = [
        { nm: 'Re', pos: 0.5, x: xDo + 85, t: Wd('L5', 'arriba') - 0.25 }, { nm: 'Mi', pos: 1, x: xDo + 170, t: Wd('L5', 'arriba') - 0.05 },
        { nm: 'Si', pos: -0.5, x: xDo - 85, t: Wd('L5', 'abajo') - 0.25 }, { nm: 'La', pos: -1, x: xDo - 170, t: Wd('L5', 'abajo') - 0.05 },
      ];
      PASOS.forEach(p => {
        const W = N.group(PD); color(W, C.blanco); N.glyph(W, 'noteheadWhole', p.x, yM - p.pos * SP, SP);
        pop(s, W, p.t, fin, p.x + 22, yM - p.pos * SP, { k0: .4 });
        const f = fraseG(g, [[p.nm, C.blanco]], p.x + 22, yNom, { size: 30, peso: 800, anchor: 'middle' });
        aparece(s, f, p.t + 0.05, fin, { dy: 4 });
      });
    });
  }

  // ================================================================ E · los dos ejercicios
  function escenaEjercicios() {
    const a = F0('E1') - 0.2, b = F0('D1') - 0.2;
    escena('ejercicios', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'EN LOS EJERCICIOS', CX, 150, { size: 32, anchor: 'middle', relleno: false });
      pop(s, k, Wd('E1', 'ejercicios') - 0.2, fin, CX, 150);
      const EJ = [
        { x: 190, tit: '1 · PON EL NOMBRE', t0: F0('E2') - 0.2 },
        { x: 990, tit: '2 · PON LA CLAVE', t0: Wd('E3', 'clave') - 0.3 },
      ];
      EJ.forEach((e, i) => {
        const G = N.group(g); aparece(s, G, e.t0, fin, { dy: 12 });
        panel(G, e.x, 250, 740, 560, { rx: 24 });
        texto(G, e.tit, e.x + 370, 310, { anchor: 'middle', size: 30, peso: 800, ls: '0.05em', fill: C.rosa });
        const yM = 520;
        if (i === 0) {
          pentaCon(G, 'do4', e.x + 60, yM, 620);
          [[0.5, 300], [-1, 420], [2, 540]].forEach(([pos, dx]) => { N.glyph(G, 'noteheadWhole', e.x + dx, yM - pos * SP, SP); texto(G, '?', e.x + dx + 22, yM + 150, { anchor: 'middle', size: 40, peso: 800, fill: C.rosa }); });
        } else {
          const P = N.group(G); N.pentagrama(P, e.x + 60, yM, 620, SP);
          const qq = N.group(G); texto(qq, '?', e.x + 100, yM + 24, { anchor: 'middle', size: 90, peso: 800, fill: C.rosa });
          [[0.5, 300], [-1, 420], [2, 540]].forEach(([pos, dx]) => N.glyph(G, 'noteheadWhole', e.x + dx, yM - pos * SP, SP));
          ['La', 'Mi', 'Re'].forEach((nm, j) => { const f = N.group(G); frase(f, nm, e.x + 322 + j * 120, yM + 150, { size: 34, peso: 800, anchor: 'middle' }); color(f, C.blanco); });   // (con la clave de Do en 1ª)
        }
      });
    });
  }

  // ================================================================ D · el Do central en las siete claves: tu referencia
  // (29-sep, Iago) ¿cuál es la más aguda? — una nota distinta en cada clave (la de Fa en 4ª PARECE la más alta y es
  // solo el Do central); 20 s para pensar; la solución: suenan las siete de grave a aguda y gana la de Do en 3ª.
  const QUIZ = { fa3: ['B3', 'Si'], fa4: ['C4', 'Do'], do4: ['D4', 'Re'], sol2: ['E4', 'Mi'], do1: ['F4', 'Fa'], do2: ['G4', 'Sol'], do3: ['A4', 'La'] };
  const ORDEN_ALTURA = ['fa3', 'fa4', 'do4', 'sol2', 'do1', 'do2', 'do3'];
  const PASOS_C4 = { B: -1, C: 0, D: 1, E: 2, F: 3, G: 4, A: 5 };
  function escenaDoCentral() {
    const a = F0('D1') - 0.2, b = T.acorde + 0.15;
    escena('docentral', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'EL DO CENTRAL: TU REFERENCIA', CX, 150, { size: 32, anchor: 'middle' });
      pop(s, k, Wd('D1', 'central') - 0.2, fin, CX, 150);
      const tDo = Wd('D1', 'coloca') - 0.2, tAg = Wd('D1', 'saber', 2) - 0.3;
      const tPi = T.bloque.PIENSA.t0, tSo = T.bloque.SOLUCION.t0, SON = S.SOLUCION || [];
      const NOTA = {}, DOC = {};
      ORDEN_CL.forEach((c, i) => {
        const x = 165 + i * 230, yM = 520, G = N.group(g);          // pentagramas algo más anchos: caben el Do y la nota
        const P = pentaCon(G, c, x, yM, 210);
        texto(G, CLAVES[c].nom, x + 105, yM + 160, { anchor: 'middle', size: 26, peso: 800, fill: C.blanco });
        aparece(s, G, a + 0.1 + i * 0.06, fin, { dy: 10 });
        // el Do central (rosa): se ve al decirlo, se esconde con la pregunta y vuelve con la solución (de referencia)
        const nd = cabeza(g, x + 96, yM, -CLAVES[c].c4); color(nd, C.rosa); DOC[c] = nd;
        pop(s, nd, tDo + i * 0.18, fin, nd._cx, nd._y, { k0: .4 });
        s.on(t => { if (t >= tDo) opa(nd, Math.max(1 - ease(ramp(t, tAg - 0.1, tAg + 0.4)), 0.45 * ease(ramp(t, tSo + 3.4, tSo + 3.9)))); });
        // la nota de la pregunta (blanca), un poco más a la derecha
        const [nt, nom] = QUIZ[c], pos = -CLAVES[c].c4 + PASOS_C4[nt[0]] / 2;
        const nq = cabeza(g, x + 152, yM, pos); color(nq, C.blanco); NOTA[c] = nq;
        pop(s, nq, tAg + 0.2 + i * 0.12, fin, nq._cx, nq._y, { k0: .4 });
        // nombre de la nota (con la solución)
        const nn = fraseG(g, [[nom, c === 'do3' ? C.rosa : C.blanco]], x + 105, yM + 214, { size: 34, peso: 800, anchor: 'middle' });
        aparece(s, nn, tSo + 3.5 + i * 0.05, fin, { dy: 6 });
      });
      // en la solución: cada nota se enciende al sonar (de grave a aguda) y se queda la más aguda
      ORDEN_ALTURA.forEach((c, j) => {
        const nq = NOTA[c], ts = SON[j] != null ? SON[j] : tSo + 0.5 + j * 0.36, gana = c === 'do3';
        s.on(t => {
          if (t < tSo) { color(nq, C.blanco); return; }          // antes de la solución manda el pop (aparece con la pregunta)
          const on = gana ? ease(ramp(t, ts - 0.05, ts + 0.15)) : win(t, ts - 0.05, ts + 0.45, .08, .25);
          color(nq, mezcla(C.blanco, C.rosa, on));
          opa(nq, gana ? 1 : 1 - 0.55 * ease(ramp(t, tSo, tSo + 0.3)) + 0.55 * on);
        });
      });
      const nA = NOTA.do3, anillo = N.group(g); color(anillo, C.rosa);
      N.el('circle', { cx: nA._cx, cy: nA._y, r: 30, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 }, anillo);
      const tGa = (SON[6] != null ? SON[6] : tSo + 2.66) + 0.2;
      pop(s, anillo, tGa, fin, nA._cx, nA._y, { k0: .3 });
      const mi = fraseG(g, [['el mismo Do central, ', C.blanco], ['en siete sitios', C.rosa]], CX, 800, { size: 44, peso: 800, anchor: 'middle' });
      aparece(s, mi, Wd('D1', 'todas') - 0.1, tAg, { dy: 8 });
      const ag = fraseG(g, [['¿cuál es ', C.blanco], ['la más aguda', C.rosa], ['?', C.blanco]], CX, 800, { size: 44, peso: 800, anchor: 'middle' });
      aparece(s, ag, tAg + 0.1, tGa, { dy: 8 });
      const im = fraseG(g, [['¡esto es realmente importante!', C.suave]], CX, 880, { size: 34, peso: 700, italic: true, anchor: 'middle' });
      aparece(s, im, Wd('D1', 'importante') - 0.4, tPi + 0.2, { dy: 6 });
      // 20 s para pensar: cuenta atrás
      const CU = N.group(g), R = 44, cyC = 900, per = 2 * Math.PI * R;
      N.el('circle', { cx: CX, cy: cyC, r: R, fill: 'none', stroke: 'rgba(248,250,252,0.18)', 'stroke-width': 8 }, CU);
      const arc = N.el('circle', { cx: CX, cy: cyC, r: R, fill: 'none', stroke: C.rosa, 'stroke-width': 8, 'stroke-linecap': 'round',
        transform: `rotate(-90 ${CX} ${cyC})`, 'stroke-dasharray': per.toFixed(1) }, CU);
      const num = texto(CU, '20', CX, cyC + 15, { anchor: 'middle', size: 42, peso: 800, fill: C.blanco });
      const pz = fraseG(CU, [['piénsalo…', C.suave]], CX - 76, cyC + 12, { size: 34, peso: 700, italic: true, anchor: 'end' });
      const dur = T.bloque.PIENSA.t1 - tPi;
      s.on(t => {
        const k2 = Math.min(1, Math.max(0, (t - tPi) / dur));
        arc.setAttribute('stroke-dashoffset', (per * k2).toFixed(1));
        num.textContent = String(Math.max(1, Math.ceil(dur * (1 - k2) - 1e-6)));
      });
      aparece(s, CU, tPi + 0.3, tSo + 0.2, { dy: 8 });
      // la solución
      const so = fraseG(g, [['la más aguda: ', C.blanco], ['la de Do en 3ª', C.rosa]], CX, 800, { size: 44, peso: 800, anchor: 'middle' });
      aparece(s, so, tGa + 0.1, fin, { dy: 8 });
      const ex = fraseG(g, [['compárala con ', C.suave], ['su Do central', C.rosa]], CX, 880, { size: 34, peso: 700, italic: true, anchor: 'middle' });
      aparece(s, ex, tSo + 3.6, fin, { dy: 6 });
    });
  }

  const ORDEN = [escenaHistoria, escenaContrabajo, escenaUsos, escenaSiete, escenaLectura, escenaEjercicios, escenaDoCentral];

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
