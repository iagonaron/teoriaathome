/* =====================================================================
   ESCENAS · Escalas menores (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (escalas-menores/escenas_cuerpo.js). Todo es función pura de t.
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


  // ================================================================ E9 · ESCALAS MENORES (natural, armónica, melódica y dórica, con Re m)
  const TITULO = { kicker: 'TEORÍA  ·  ESCALAS', lineas: ['Escalas menores'], sub: 'Natural · Armónica · Melódica · Dórica' };

  // ---------------------------------------------------------------- utilidades comunes a «Escalas menores» y «Escalas Mayores»
  const RGB = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const CSS = c => `rgb(${c.map(v => Math.round(v)).join(',')})`;
  const mixRGB = (p, q, k) => p.map((v, i) => v + (q[i] - v) * k);
  const K_BL = RGB(C.blanco), K_RO = RGB(C.rosa), K_RC = RGB(C.rosaClaro), K_BO = RGB('#3a4556');
  /** Máximo de win() sobre varios tramos [[a, b], …]. */
  function ventanas(t, vs, fi, fo) { let k = 0; for (const [p, q] of vs) k = Math.max(k, win(t, p, q, fi != null ? fi : .3, fo != null ? fo : .3)); return k; }
  /** Rosa mientras t está en alguno de los tramos (blanco, o `de`, fuera de ellos). */
  function rosaEn(s, g, vs, o) {
    o = o || {};
    const de = RGB(o.de || C.blanco), en = RGB(o.a || C.rosa), d = o.d || .3;
    s.on(t => color(g, CSS(mixRGB(de, en, ventanas(t, vs, d, d)))));
  }
  /** Línea de texto en la que ♭ ♯ ♮ se dibujan con Bravura y → ↑ ↓ son flechas dibujadas.
   *  Pegada a una letra («Si♭») la alteración va como en los nombres de nota; suelta, del alto de una mayúscula.
   *  segs: 'texto' o [['trozo', color], …]. Devuelve el grupo (con _w y _x). */
  function frase(parent, segs, x, y, o) {
    o = o || {};
    const size = o.size || 36, peso = o.peso || 700, esp = size * 0.28;
    const G = N.group(parent, 'frase');
    const GL = { '♭': 'accidentalFlat', '♯': 'accidentalSharp', '♮': 'accidentalNatural' };
    if (typeof segs === 'string') segs = [[segs, o.fill || 'currentColor']];
    let cx = 0, prev = '';
    for (const [str, col] of segs) {
      const sub = () => { const q = N.group(G); if (col && col !== 'currentColor') color(q, col); return q; };
      for (const tr of str.split(/([♭♯♮→↑↓])/)) {
        if (!tr) continue;
        if (GL[tr]) {
          const gl = GL[tr], bem = tr === '♭';
          const pegada = /[A-Za-zÁÉÍÓÚáéíóúñÑ]$/.test(prev);
          const sa = pegada ? size * 0.36 : size * (bem ? 0.31 : 0.29);
          const yo = pegada ? -size * 0.33 : (bem ? -0.7 * sa : -size * 0.36);
          const x0 = cx + size * (pegada ? 0.03 : 0.02);
          N.glyph(sub(), gl, x0, yo, sa);
          cx = x0 + N.M[gl].adv * sa + size * (pegada ? 0.08 : 0.04);
        } else if (tr === '→') {
          flecha(sub(), cx + size * 0.1, -size * 0.34, cx + size * 1.0, -size * 0.34, { w: size * 0.085, cab: size * 0.34 });
          cx += size * 1.1;
        } else if (tr === '↑' || tr === '↓') {
          const xa = cx + size * 0.3, yb = size * 0.02, ya = -size * 0.76;
          if (tr === '↑') flecha(sub(), xa, yb, xa, ya, { w: size * 0.09, cab: size * 0.34 });
          else flecha(sub(), xa, ya, xa, yb, { w: size * 0.09, cab: size * 0.34 });
          cx += size * 0.62;
        } else {
          if (/^\s/.test(tr)) cx += esp;
          const core = tr.trim();
          if (core) { const tt = texto(G, core, cx, 0, { size, peso, fill: col || 'currentColor', italic: o.italic, ls: o.ls }); cx += D.medir(tt); }
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
  /** frase() dentro de un grupo propio (para animarla con aparece/pop sin perder su posición). */
  function fraseG(parent, segs, x, y, o) { const w = N.group(parent); w._f = frase(w, segs, x, y, o); return w; }
  /** Chip de tonalidad («Re m») que entra en rosa cuando se nombra y se queda oscuro con borde blanco.
   *  dRosa: segundos en rosa (0 = oscuro desde el principio). */
  function chipTonEn(s, parent, nota, modo, x, y, o) {
    o = o || {};
    const W = N.group(parent), A = N.group(W), B = N.group(W);
    chipTon(A, nota, modo, x, y, { size: o.size || 38, fondo: C.panel, borde: C.blanco });
    chipTon(B, nota, modo, x, y, { size: o.size || 38, borde: C.rosa });      // borde rosa: tapa el filo blanco del de debajo
    pop(s, W, o.ta, o.tb, x, y);
    const d = o.dRosa != null ? o.dRosa : 2;
    s.on(t => opa(B, d > 0 ? 1 - ease(ramp(t, o.ta + d, o.ta + d + 0.5)) : 0));
    return W;
  }
  /** Varias frases en una misma línea centrada en cx; cada una en su grupo (se animan por separado). */
  function lineaCentrada(parent, partes, cx, y, o) {
    const gs = partes.map(segs => { const w = N.group(parent); return { w, f: frase(w, segs, 0, y, o) }; });
    const gap = o.gap != null ? o.gap : (o.size || 36) * 0.3;
    const tot = gs.reduce((acc, p) => acc + p.f._w, 0) + gap * (gs.length - 1);
    let x = cx - tot / 2;
    for (const p of gs) { p.f.setAttribute('transform', `translate(${x.toFixed(1)},${y})`); p.f._x = x; p.w._f = p.f; x += p.f._w + gap; }
    return gs.map(p => p.w);
  }

  // ---------- la escala en el pentagrama: 8 redondas Re → Re (las alteraciones las ponen la armadura o la variante)
  const ESC_RE = ['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5'];
  /** Pentagrama con clave, armadura (cada alteración animable) y las redondas de la escala.
   *  o: {x, yM, ancho, nArm, tipoArm, x1 (borde izquierdo de la 1.ª nota), paso, notas}.
   *  Cada nota: {out (entrada), c (color y latido), x, cx, y}. */
  function escala(parent, o) {
    const P = pentaClave(parent, o.x, o.yM, o.ancho);
    const A = N.armaduraGen(parent, P.x0 + 4, o.yM, SP, o.nArm, o.tipoArm);
    const notas = (o.notas || ESC_RE).map((n, i) => {
      const x = o.x1 + i * o.paso;
      const out = N.group(parent, 'nota'), c = N.group(out);
      const r = nota(c, n, x, o.yM);
      return { out, c, x, cx: r.cx, y: r.y, n };
    });
    return { P, A, notas, yM: o.yM };
  }
  /** Centro de la alteración i de una armadura (para «pop» y para apuntarla). */
  function centroArm(A, i, yM, tipo) {
    const it = A.items[i], gl = tipo === 'b' ? 'accidentalFlat' : 'accidentalSharp';
    return [it.x + N.M[gl].adv * SP / 2, yM - it.pos * SP - (tipo === 'b' ? 0.5 * SP : 0)];
  }
  /** Alteración escrita por la variante delante de la nota e ('#', 'b' o 'n'), dentro de su grupo de color. */
  function altDe(e, tipo) {
    const gl = { '#': 'accidentalSharp', b: 'accidentalFlat', n: 'accidentalNatural' }[tipo];
    const G = N.group(e.c, 'alt');
    const x = e.x - (N.M[gl].adv + 0.22) * SP;
    N.glyph(G, gl, x, e.y, SP);
    G._cx = x + N.M[gl].adv * SP / 2; G._cy = e.y - (tipo === 'b' ? 0.5 * SP : 0);
    return G;
  }
  /** La alteración de la variante aparece («pop») y se va en los tramos vs. */
  function altEn(s, G, vs) {
    s.on(t => {
      const v = ventanas(t, vs, .3, .35); opa(G, v);
      let k = 1; for (const [p] of vs) if (t >= p - 0.01 && t < p + 0.35) k = lerp(.4, 1, eo(ramp(t, p, p + .35)));
      if (v > 0) G.setAttribute('transform', `translate(${G._cx.toFixed(1)},${G._cy.toFixed(1)}) scale(${k.toFixed(4)}) translate(${(-G._cx).toFixed(1)},${(-G._cy).toFixed(1)})`);
    });
  }
  /** Color de una nota: blanca; rosa mientras se explica o está alterada (vs); destello y latido cuando suena (ts). */
  function colorNota(s, e, vs, ts) {
    s.on(t => {
      const kA = ventanas(t, vs, .3, .3);
      let kS = 0; for (const t0 of ts) kS = Math.max(kS, win(t, t0 - 0.04, t0 + 0.5, .06, .36));
      const base = mixRGB(K_BL, K_RO, kA), luz = mixRGB(K_RO, K_RC, kA);
      color(e.c, CSS(mixRGB(base, luz, kS)));
      const k = 1 + 0.16 * kS;
      e.c.setAttribute('transform', `translate(${e.cx.toFixed(1)},${e.y.toFixed(1)}) scale(${k.toFixed(4)}) translate(${(-e.cx).toFixed(1)},${(-e.y).toFixed(1)})`);
    });
  }
  /** Rótulo con dos estados: `base` y, en los tramos vs, `alt` (en rosa). Visible entre tIn y tOut. */
  function rotulo2(s, parent, base, alt, x, y, vs, tIn, tOut, o) {
    o = o || {};
    const G = N.group(parent);
    const fb = frase(G, base, x, y, { size: o.size || 32, peso: o.peso || 700, anchor: 'middle', fill: o.fill || C.blanco });
    const fa = alt ? frase(G, alt, x, y, { size: o.sizeAlt || o.size || 32, peso: o.peso || 700, anchor: 'middle', fill: C.rosa }) : null;
    s.on(t => {
      const v = win(t, tIn, tOut, .3, .4);
      const k = fa ? ventanas(t, vs, .25, .25) : 0;
      opa(fb, v * (1 - k)); if (fa) opa(fa, v * k);
    });
    return G;
  }
  /** Icono del oído mientras suena el ejemplo (bloques SON_…). */
  function oidoEn(s, parent, x, y, bloques) {
    const G = N.group(parent); icoOido(G, x, y, 0.9); color(G, C.suave);
    s.on(t => opa(G, ventanas(t, bloques.map(id => [F0(id) - 0.25, F1(id) + 0.1]), .3, .4)));
    return G;
  }
  /** Pestaña de una variante: nombre (+ fórmula «7↑» en rosa) y segunda línea en cursiva.
   *  d: {nom, formula, tFormula, sub, tSub, q (texto provisional), tNom}. Devuelve {out, marco, nomW}. */
  function pestana(s, parent, d) {
    const out = N.group(parent, 'pestana');
    const marco = N.el('rect', { x: -165, y: -46, width: 330, height: 92, rx: 16, fill: C.panel, stroke: '#3a4556', 'stroke-width': 2 }, out);
    const L1 = N.group(out);
    const nomW = N.group(L1), forW = N.group(L1), subW = N.group(out);
    const nomIn = N.group(nomW);
    const fN = frase(nomIn, d.nom, 0, 0, { size: 32, peso: 800, fill: 'currentColor' });
    const fF = d.formula ? frase(forW, [[d.formula, C.rosa]], 0, 0, { size: 32, peso: 800 }) : null;
    const fS = d.sub ? frase(subW, d.sub, 0, 31, { size: 23, peso: 600, italic: true, fill: C.suave, anchor: 'middle' }) : null;
    let fQ = null;
    if (d.q) { fQ = frase(nomW, [[d.q, C.rosa]], fN._w / 2, 0, { size: 36, peso: 800, anchor: 'middle' }); }
    const wN = fN._w, wF = fF ? fF._w : 0, gap = 12;
    s.on(t => {
      const kF = fF ? ease(ramp(t, d.tFormula, d.tFormula + 0.4)) : 0;
      const kS = fS ? ease(ramp(t, d.tSub, d.tSub + 0.4)) : 0;
      const xN = -(wN + kF * (gap + wF)) / 2, yL = lerp(11, -4, kS);
      nomW.setAttribute('transform', `translate(${xN.toFixed(1)},${yL.toFixed(1)})`);
      if (fF) { forW.setAttribute('transform', `translate(${(xN + wN + gap).toFixed(1)},${yL.toFixed(1)})`); opa(forW, kF); }
      if (fS) opa(subW, kS);
      if (fQ) { const kq = ease(ramp(t, d.tNom - 0.1, d.tNom + 0.25)); opa(fQ, 1 - kq); opa(nomIn, kq); }
    });
    return { out, marco, nomW };
  }
  /** La pestaña se enciende (borde y nombre en rosa) en los tramos vs. */
  function pestanaActiva(s, P, vs) {
    s.on(t => {
      const k = ventanas(t, vs, .35, .35);
      P.marco.setAttribute('stroke', CSS(mixRGB(K_BO, K_RO, k)));
      P.marco.setAttribute('stroke-width', (2 + 1.5 * k).toFixed(2));
      color(P.nomW, CSS(mixRGB(K_BL, K_RO, k)));
    });
  }
  /** Tarjeta «TRUCO» (u otra etiqueta), abajo y centrada en (CX, y): panel con la etiqueta en el borde de arriba. */
  function tarjetaTruco(parent, y, w, etiqueta) {
    const G = N.group(parent, 'truco');
    panel(G, CX - w / 2, y - 56, w, 112, { rx: 22, stroke: 'rgba(236,72,153,0.7)', sw: 2 });
    chip(G, etiqueta || 'TRUCO', CX, y - 56, { size: 20, anchor: 'middle' });
    return G;
  }
  /** Retrovisor de coche (interior): soporte arriba y espejo apaisado. Centro (cx, cy), escala k.
   *  Devuelve {G, vid: {x, y, w, h} (el cristal), izq: [x, y] (borde izquierdo)}. */
  function icoRetrovisor(parent, cx, cy, k) {
    k = k || 1;
    const G = N.group(parent, 'retrovisor');
    const w = 300 * k, h = 96 * k;
    N.el('rect', { x: cx - 30 * k, y: cy - h / 2 - 60 * k, width: 60 * k, height: 18 * k, rx: 7 * k, fill: 'currentColor' }, G);
    N.line(G, cx, cy - h / 2 - 44 * k, cx, cy - h / 2 + 2, 10 * k, { 'stroke-linecap': 'round' });
    N.el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: h * 0.42, fill: '#0b1320', stroke: 'currentColor', 'stroke-width': 6 * k }, G);
    const vid = { x: cx - w / 2 + 15 * k, y: cy - h / 2 + 13 * k, w: w - 30 * k, h: h - 26 * k };
    N.el('rect', { x: vid.x, y: vid.y, width: vid.w, height: vid.h, rx: vid.h * 0.42, fill: 'rgba(148,163,184,0.18)' }, G);
    N.el('path', { d: `M${vid.x + vid.w * 0.78},${vid.y + 9 * k} l${-18 * k},${vid.h - 18 * k} M${vid.x + vid.w * 0.86},${vid.y + 9 * k} l${-10 * k},${vid.h * 0.45}`, fill: 'none', stroke: 'rgba(255,255,255,0.38)', 'stroke-width': 4 * k, 'stroke-linecap': 'round' }, G);
    return { G, vid, izq: [cx - w / 2, cy] };
  }
  /** Mirada del retrovisor: línea discontinua curva (x1,y1) → (x2,y2) con punta, control (qx, qy). */
  function mirada(parent, x1, y1, qx, qy, x2, y2) {
    const G = N.group(parent, 'mirada');
    N.el('path', { d: `M${x1},${y1} Q${qx},${qy} ${x2},${y2}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '2 11' }, G);
    const ang = Math.atan2(y2 - qy, x2 - qx), cab = 16;
    const p = k => `${(x2 - Math.cos(ang + k) * cab).toFixed(1)},${(y2 - Math.sin(ang + k) * cab).toFixed(1)}`;
    N.el('polygon', { points: `${x2},${y2} ${p(0.45)} ${p(-0.45)}`, fill: 'currentColor' }, G);
    return G;
  }
  /** Tarjetas numeradas de los tres pasos (arriba); cada una se enciende en su tramo. */
  function tarjetasPasos(s, g, R, tIn, fin) {
    const wC = 540, gap = 36, x0 = CX - (3 * wC + 2 * gap) / 2, yC = 104, hC = 100;
    R.forEach((r, i) => {
      const G = N.group(g);
      const x = x0 + i * (wC + gap);
      const rect = panel(G, x, yC, wC, hC, { rx: 20 });
      const num = N.group(G);
      N.el('circle', { cx: x + 56, cy: yC + hC / 2, r: 29, fill: 'none', stroke: 'currentColor', 'stroke-width': 3 }, num);
      texto(num, r.n, x + 56, yC + hC / 2 + 12, { anchor: 'middle', size: 33, peso: 800, fill: 'currentColor' });
      const tt = texto(G, r.tit, x + 104, yC + hC / 2 + 10, { size: 27, peso: 800, ls: '0.04em', fill: 'currentColor' });
      const w = D.medir(tt); if (w > wC - 128) tt.setAttribute('font-size', (27 * (wC - 128) / w).toFixed(1));
      color(G, C.suave);
      aparece(s, G, tIn + i * 0.22, fin, { dy: 12 });
      s.on(t => {
        const k = win(t, r.t0, r.t1, .35, .35);
        color(G, CSS(mixRGB(RGB(C.suave), K_BL, k)));
        color(num, CSS(mixRGB(RGB(C.suave), K_RO, k)));
        rect.setAttribute('stroke', CSS(mixRGB(K_BO, K_RO, k)));
        rect.setAttribute('stroke-width', (1.5 + 1.5 * k).toFixed(2));
      });
    });
  }
  /** Tarjeta pequeña que remite a otro vídeo (miniatura con su título y ▶). Con slug se puede pulsar
   *  (norma de Iago: abre ese vídeo en una pestaña nueva) y lleva el icono ↗ en la esquina. Devuelve el grupo (con _w). */
  function tarjetaVideo(parent, x, y, l1, l2, slug) {
    const G = N.group(parent, 'tarjeta');
    const h = 136;
    const PR = panel(G, x, y, 440, h, { rx: 18, stroke: 'rgba(236,72,153,0.85)', sw: 2 });
    const mx = x + 16, my = y + 16, mw = 186, mh = 104;
    D.foto(G, 'fondo.jpg', mx, my, mw, mh, { rx: 10, borde: 'rgba(255,255,255,0.35)' });
    N.el('rect', { x: mx, y: my, width: mw, height: mh, rx: 10, fill: '#081628', opacity: 0.6 }, G);
    texto(G, (l1 + ' ' + l2).toUpperCase(), mx + mw / 2, my + 38, { anchor: 'middle', size: 14, peso: 800, ls: '0.03em', fill: C.blanco });
    N.el('rect', { x: mx + mw / 2 - 18, y: my + 52, width: 36, height: 36, rx: 8, fill: C.rosa }, G);
    N.el('path', { d: `M${mx + mw / 2 - 6},${my + 61} v18 l15,-9 z`, fill: '#fff' }, G);
    const xt = mx + mw + 22;
    const t0 = texto(G, 'REPASA EL VÍDEO', xt, y + 46, { size: 16, peso: 800, ls: '0.12em', fill: C.rosa });
    const t1 = texto(G, l1, xt, y + 86, { size: 32, peso: 800, fill: C.blanco });
    const t2 = texto(G, l2, xt, y + 120, { size: 32, peso: 800, fill: C.blanco });
    const w = Math.max(440, (xt - x) + 26 + Math.max(D.medir(t0) + (slug ? 54 : 0), D.medir(t1), D.medir(t2)));
    PR.setAttribute('width', w.toFixed(0));
    if (slug) { const ia = N.group(G); icoAbrir(ia, x + w - 40, y + 14, 26); color(ia, C.rosa); enlaceVideo(G, slug); }
    G._w = w;
    return G;
  }
  /** Tarjeta pequeña «apuntes» (hoja con renglones). */
  function tarjetaApuntes(parent, x, y) {
    const G = N.group(parent, 'apuntes');
    const w = 300, h = 136;
    panel(G, x, y, w, h, { rx: 18, stroke: 'rgba(248,250,252,0.35)', sw: 2 });
    const hx = x + 28, hy = y + 22;
    N.el('path', { d: `M${hx},${hy} h52 l20,20 v70 h-72 z M${hx + 52},${hy} v20 h20`, fill: 'none', stroke: C.blanco, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, G);
    for (let i = 0; i < 4; i++) N.line(G, hx + 12, hy + 38 + i * 13, hx + 60, hy + 38 + i * 13, 3, { stroke: C.suave, 'stroke-linecap': 'round' });
    texto(G, 'o los', x + 124, y + 58, { size: 26, peso: 600, italic: true, fill: C.suave });
    texto(G, 'APUNTES', x + 124, y + 98, { size: 29, peso: 800, ls: '0.03em', fill: C.blanco });
    return G;
  }
  /** Píldora (cápsula mitad rosa, mitad blanca) centrada en (0, 0), inclinada. */
  function pildora(parent, ang) {
    const G = N.group(parent, 'pildora');
    const I = N.group(G, null, { transform: `rotate(${ang || -30})` });
    N.el('path', { d: 'M0,-15 H-22 A15,15 0 0 0 -22,15 H0 Z', fill: C.rosa }, I);
    N.el('path', { d: 'M0,-15 H22 A15,15 0 0 1 22,15 H0 Z', fill: C.blanco }, I);
    return G;
  }

  // ================================================================ H · INTRO COMÚN (idéntica en «Escalas menores» y «Escalas Mayores»)
  /** Fila de sonidos separados por tonos (T) y semitonos (st), con la norma de Iago:
   *  tono = arco redondo, semitono = pico en V, siempre por debajo de los puntos; rótulo debajo. */
  function patronTS(parent, offs, x, y, ancho) {
    const G = N.group(parent, 'patronTS');
    const st = ancho / 12;
    const linea = N.line(G, x - 20, y, x + ancho + 20, y, 2.5, { stroke: C.tenue, 'stroke-linecap': 'round' });
    const etq = [];
    for (let i = 0; i < offs.length - 1; i++) {
      const semi = offs[i + 1] - offs[i] === 1, xa = x + offs[i] * st, xb = x + offs[i + 1] * st, xm = (xa + xb) / 2;
      const e = N.group(G), ya = y + 19;
      (semi ? picoSemitono : arcoTono)(e, xa + 7, ya, xb - 7, ya, { prof: semi ? 27 : 31, w: 3.5 });
      texto(e, semi ? 'st' : 'T', xm, y + 90, { anchor: 'middle', size: 34, peso: 800, fill: 'currentColor' });
      color(e, semi ? C.rosa : C.suave);
      etq.push({ g: e, semi });
    }
    const puntos = offs.map(o => { const p = N.group(G), q = N.group(p); N.el('circle', { cx: x + o * st, cy: y, r: 15, fill: 'currentColor' }, q); color(q, C.blanco); return { p, q, x: x + o * st, y }; });
    return { G, linea, etq, puntos };
  }
  function escenaIntro() {
    const a = F0('H1') - 0.2, b = F0('H3') + 0.2;
    escena('intro', a, b, (s, g) => {
      const fin = b - 0.3;
      // ---------- H1 · «Si viste el vídeo de introducción a las tonalidades…»
      const tVid = Wd('H1', 'video') - 0.15, tFuera = Wd('H2', 'tendencia') - 0.3;
      // (29-sep, Iago) el cartel del vídeo «La tonalidad», con la tarjeta de enlace de siempre (se pulsa y lo abre)
      const kv = tarjetaEnlace(g, CX, 200, { tipo: 'video', titulo: 'La tonalidad', slug: 'la-tonalidad', centro: true });
      pop(s, kv, tVid, tFuera, CX, 200);
      // antiguamente: primero cantar y tocar… antes de comprender y escribir la música
      const yI = 520, yT = 672, kI = 1.4;
      const ant = texto(g, 'ANTIGUAMENTE', CX, 340, { anchor: 'middle', size: 28, peso: 800, ls: '0.3em', fill: C.rosa });
      aparece(s, ant, Wd('H1', 'antiguamente') - 0.2, tFuera, { dy: 8 });
      const icos = [
        ['cantar', 'cantar', (G, x) => icoCantar(G, x - 40, yI), 380],
        ['tocar', 'tocar', (G, x) => icoLira(G, x, yI), 680],
        ['comprender', 'comprender', (G, x) => icoLupa(G, x + 10, yI + 10, 1.25), 1250],
        ['escribir', 'escribir', (G, x) => {
          const P = N.group(G);
          for (let k = -2; k <= 2; k++) N.line(P, x - 70, yI + k * 13, x + 50, yI + k * 13, 2.2, { stroke: 'currentColor' });
          [[-46, 13], [-14, 0], [18, -13]].forEach(([dx, dy]) => N.el('ellipse', { cx: x + dx, cy: yI + dy, rx: 9, ry: 6.5, transform: `rotate(-20 ${x + dx} ${yI + dy})`, fill: 'currentColor' }, P));
          icoLapiz(G, x + 58, yI - 34, 0.9);
        }, 1560],
      ];
      icos.forEach(([pal, nom, dib, x]) => {
        const G = N.group(g), I = N.group(G), Is = N.group(I, null, { transform: `translate(${x},${yI}) scale(${kI}) translate(${-x},${-yI})` });
        dib(Is, x);
        texto(G, nom, x, yT, { anchor: 'middle', size: 38, peso: 700, fill: C.blanco });
        const ta = Wd('H1', pal) - 0.15;
        aparece(s, G, ta, tFuera, { dy: 16 });
        rosaEn(s, I, [[ta - 0.3, ta + 1.3]]);
      });
      const tAnt = Wd('H1', 'antes') - 0.15;
      const fl = N.group(g); color(fl, C.rosa);
      flecha(fl, 860, yI, 1090, yI, { w: 6, cab: 22 });
      texto(fl, 'antes de', 975, yI - 34, { anchor: 'middle', size: 36, peso: 800, italic: true, fill: C.rosa });
      aparece(s, fl, tAnt, tFuera, { dy: 0 });
      // ---------- H2 · agrupamos los sonidos en tonos y semitonos… y dos combinaciones: escala Mayor y escala menor
      const MAY = [0, 2, 4, 5, 7, 9, 11, 12], MEN = [0, 2, 3, 5, 7, 8, 10, 12];
      const xR = 420, wR = 1080, y1a = 560, y1b = 400, y2 = 710;
      const tSueltos = Wd('H2', 'tendencia') - 0.1, tAgr = Wd('H2', 'agrupar') - 0.05;
      const tTon = Wd('H2', 'tonos') - 0.15, tSemi = Wd('H2', 'semitonos') - 0.15;
      const tDos = Wd('H2', 'dos') - 0.15, tComb = Wd('H2', 'combinaciones', 2) - 0.1;
      const tMay = Wd('H2', 'escala') - 0.15, tMen = Wd('H2', 'escala', 2) - 0.15;
      // paneles de las dos combinaciones (detrás de las filas)
      [[y1b, tDos + 0.5], [y2, tComb]].forEach(([y, ta]) => { const P = N.group(g); panel(P, 330, y - 132, 1260, 250, { rx: 24 }); aparece(s, P, ta, fin, { dy: 0 }); });
      const R1 = N.group(g), R1i = N.group(R1);
      s.on(t => { const k = ease(ramp(t, tDos, tDos + 0.8)); R1i.setAttribute('transform', `translate(0,${(lerp(y1a, y1b, k) - y1a).toFixed(1)})`); opa(R1, win(t, tSueltos, fin, .4, .4)); });
      const F1p = patronTS(R1i, MAY, xR, y1a, wR);
      mostrarEn(s, F1p.linea, tAgr + 0.8, 1e9, .4);
      // sonidos sueltos que se agrupan en la fila
      const SUELTOS = [[640, 420], [790, 700], [1100, 450], [900, 620], [1270, 690], [700, 540], [1350, 440], [1020, 760]];
      F1p.puntos.forEach((P, i) => {
        const [xs, ys] = SUELTOS[i], ta = tSueltos + i * 0.06;
        s.on(t => {
          opa(P.p, ease(ramp(t, ta, ta + 0.3)));
          const k = ease(ramp(t, tAgr + i * 0.04, tAgr + 0.9 + i * 0.04));
          P.p.setAttribute('transform', `translate(${((xs - P.x) * (1 - k)).toFixed(1)},${((ys - P.y) * (1 - k)).toFixed(1)})`);
        });
        destella(s, P.q, [tMay + 0.4 + i * 0.06], { d: 0.9 });
      });
      F1p.etq.forEach((e, i) => mostrarEn(s, e.g, (e.semi ? tSemi : tTon) + i * 0.07, 1e9, .3));
      const tit1 = texto(R1i, 'Escala Mayor', CX, y1a - 66, { anchor: 'middle', size: 48, peso: 800, fill: C.blanco });
      aparece(s, tit1, tMay, 1e9, { dy: 8 });
      // la segunda combinación
      const R2 = N.group(g);
      aparece(s, R2, tComb, fin, { dy: 12 });
      const F2p = patronTS(R2, MEN, xR, y2, wR);
      F2p.puntos.forEach((P, i) => { pop(s, P.p, tComb + i * 0.06, 1e9, P.x, P.y, { k0: .3, fi: .25 }); destella(s, P.q, [tMen + 0.4 + i * 0.06], { d: 0.9 }); });
      F2p.etq.forEach((e, i) => mostrarEn(s, e.g, tComb + 0.5 + i * 0.07, 1e9, .3));
      const tit2 = texto(R2, 'Escala menor', CX, y2 - 66, { anchor: 'middle', size: 48, peso: 800, fill: C.blanco });
      aparece(s, tit2, tMen, 1e9, { dy: 8 });
    });
  }

  // ================================================================ V · las cuatro variantes con Re m (natural · armónica · melódica · dórica)
  const Y_ESC = 530, X_ESC = 300, W_ESC = 1320, X1_ESC = 560, PASO_ESC = 140, Y_NOM = 672, Y_GRA = 437;
  function escenaVariantes() {
    const a = F0('H3') - 0.1, b = F0('P0') + 0.2;
    escena('variantes', a, b, (s, g) => {
      const fin = b - 0.3;
      const tN = F0('N1') - 0.2, tA = F0('A1') - 0.2, tM = F0('M1') - 0.2, tD = F0('D1') - 0.2;
      // ---------- H3 · «escalas menores… tienen algunas variantes» → H4 · pestañas arriba
      const tEsc = Wd('H3', 'escalas') - 0.2, tVar = Wd('H3', 'variantes') - 0.35, tSube = Wd('H4', 'todas') - 0.25;
      const tit = texto(g, 'Escalas menores', CX, 360, { anchor: 'middle', size: 62, peso: 800, fill: C.blanco });
      aparece(s, tit, tEsc, tSube + 0.25, { dy: 10 });
      const defs = [
        { nom: 'Natural', sub: 'tal cual', tSub: Wd('N2', 'tal') - 0.1, act: [[tN, tA]] },
        { nom: 'Armónica', formula: '7↑', tFormula: Wd('A1', 'septimo') - 0.1, sub: 'árabe', tSub: Wd('A4', 'arabe') - 0.1, act: [[tA, tM]] },
        { nom: 'Melódica', formula: '6↑ 7↑', tFormula: Wd('M2', 'sexto') - 0.1, sub: 'menos triste', tSub: Wd('M6', 'menos') - 0.1, act: [[tM, tD]] },
        { nom: 'Dórica', formula: '6↑', tFormula: Wd('D2', 'sexto') - 0.1, act: [[tD, fin + 1]] },
      ];
      defs.forEach((d, i) => {
        const P = pestana(s, g, d);
        const ta = tVar + i * 0.15;
        s.on(t => {
          const k = ease(ramp(t, tSube, tSube + 0.8));
          const x = lerp(CX + (i - 1.5) * 410, CX + (i - 1.5) * 350, k), y = lerp(560, 150, k);
          const sc = lerp(1.15, 1, k) * lerp(0.85, 1, eo(ramp(t, ta, ta + .35)));
          P.out.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${sc.toFixed(4)})`);
          opa(P.out, win(t, ta, fin, .35, .4));
        });
        pestanaActiva(s, P, d.act);
      });
      // ---------- H4 · el ejemplo: Re m
      const tRe = Wd('H4', 're') - 0.15;
      chipTonEn(s, g, 'D', 'menor', CX, 290, { size: 40, ta: tRe, tb: fin });
      const E = N.group(g);
      aparece(s, E, tRe + 0.1, fin, { dy: 0 });
      const ES = escala(E, { x: X_ESC, yM: Y_ESC, ancho: W_ESC, nArm: 1, tipoArm: 'b', x1: X1_ESC, paso: PASO_ESC });
      const notas = ES.notas, arm = ES.A.items[0];
      // ---------- N2–N3 · solo la armadura: un bemol, Si♭
      const tArmN = Wd('N2', 'armadura') - 0.15, tBem = Wd('N3', 'bemol') - 0.1, tSib = Wd('N3', 'si') - 0.1;
      const hu = N.group(g); color(hu, C.rosa);
      N.el('rect', { x: arm.x - 9, y: Y_ESC - 54, width: N.M.accidentalFlat.adv * SP + 18, height: 80, rx: 8, fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-dasharray': '7 6' }, hu);
      mostrarEn(s, hu, tArmN, tBem + 0.3, .3, .3);
      const [cxA, cyA] = centroArm(ES.A, 0, Y_ESC, 'b');
      pop(s, arm.g, tBem, fin, cxA, cyA, { k0: .4, fi: .3 });
      const tSib4 = Wd('N4', 'si') - 0.1, tBem2 = Wd('M3', 'si') - 0.1;
      rosaEn(s, arm.g, [[tBem - 0.3, F0('N4') - 0.1], [tSib4, tSib4 + 0.9], [tBem2, Wd('M3', 'pasa') + 0.2]]);
      const lSib = fraseG(g, 'Si♭', cxA, Y_ESC - 86, { size: 32, peso: 800, anchor: 'middle', fill: C.rosa });
      aparece(s, lSib, tSib, F0('N4') - 0.1, { dy: 6 });
      // ---------- N4 · Re, Mi, Fa, Sol, La, Si♭, Do, Re
      const PAL = [['re', 1], ['mi', 1], ['fa', 1], ['sol', 1], ['la', 1], ['si', 1], ['do', 1], ['re', 2]];
      const tNot = PAL.map(([p, n]) => Wd('N4', p, n) - 0.1);
      // tramos en que cada nota va en rosa (se explica o está alterada) y alteraciones de cada variante
      const w7A = [Wd('A1', 'septimo') - 0.1, tM + 0.3], w6M = [Wd('M2', 'sexto') - 0.1, tD + 0.3], w7M = [Wd('M2', 'septimo') - 0.1, tD + 0.3];
      const w6D = [Wd('D2', 'sexto') - 0.1, fin + 1];
      const sosA = [Wd('A1', 'sostenido') - 0.3, tM + 0.3], natM = [Wd('M3', 'si', 2) - 0.15, tD + 0.3], sosM = [Wd('M3', 'do', 2) - 0.15, tD + 0.3];
      const natD = [Wd('D3', 'si') - 0.15, fin + 1];
      const ROSA = { 5: [w6M, w6D], 6: [w7A, w7M] }, ALT = { 5: ['n', [natM, natD]], 6: ['#', [sosA, sosM]] };
      const SON = [S.SON_NAT, S.SON_ARM, S.SON_MEL, S.SON_DOR];
      const tSexta = Wd('A1', 'sexta') - 0.05, tSeptima = Wd('A1', 'septima') - 0.05, tFinal = Wd('M4', 'final') - 0.1;
      const EXTRA = { 5: [tSexta, tFinal], 6: [tSeptima, tFinal + 0.15], 7: [tFinal + 0.3] };
      const NOM = [['Re'], ['Mi'], ['Fa'], ['Sol'], ['La'], ['Si♭', 'Si♮'], ['Do', 'Do♯'], ['Re']];
      notas.forEach((e, i) => {
        pop(s, e.out, tNot[i], fin, e.cx, e.y, { k0: .5, fi: .25 });
        const ts = SON.map(L => L[i]).concat(EXTRA[i] || []);
        colorNota(s, e, ROSA[i] || [], ts);
        if (ALT[i]) altEn(s, altDe(e, ALT[i][0]), ALT[i][1]);
        rotulo2(s, g, NOM[i][0], NOM[i][1], e.cx, Y_NOM, ALT[i] ? ALT[i][1] : [], tNot[i] + 0.05, fin);
      });
      // ---------- A1 · grados (arriba): el que sube, en rosa con su flecha
      const tGra = Wd('A1', 'subimos') - 0.1;
      notas.forEach((e, i) => {
        const vs = (ROSA[i] || []);
        rotulo2(s, g, String(i + 1), vs.length ? (i + 1) + '↑' : null, e.cx, Y_GRA, vs, tGra + i * 0.05, fin, { size: 28, peso: 800, fill: C.suave });
      });
      // la segunda aumentada (Si♭–Do♯) entre la sexta y la séptima nota
      const tSeg = Wd('A1', 'segunda') - 0.2, tAum = Wd('A1', 'aumentada') - 0.2;
      const x6 = notas[5].cx, x7 = notas[6].cx, yB = Y_NOM + 24;
      const br = N.group(g); color(br, C.rosa);
      N.el('path', { d: `M${x6 - 18},${yB} v14 h${x7 - x6 + 36} v-14`, fill: 'none', stroke: 'currentColor', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, br);
      mostrarEn(s, br, tSeg, tM + 0.3, .3, .35);
      const c2A = N.group(g); chipInt(c2A, '2A', (x6 + x7) / 2, yB + 58, { size: 30 });
      pop(s, c2A, tAum, tM + 0.3, (x6 + x7) / 2, yB + 58);
      // ---------- sonidos: el oído mientras suena cada ejemplo
      oidoEn(s, g, 1740, Y_ESC - 6, ['SON_NAT', 'SON_ARM', 'SON_MEL', 'SON_DOR']);
      // ---------- A3–A4 · ¿sabor árabe? · truco: ARmónica = ÁRabe
      const yT = 868;
      const q1 = fraseG(g, [['¿sabor ', C.blanco], ['árabe', C.rosa], ['?', C.blanco]], CX, yT + 14, { size: 46, peso: 800, anchor: 'middle' });
      aparece(s, q1, Wd('A3', 'sabor') - 0.2, Wd('A4', 'recordarlo') - 0.2, { dy: 8 });
      const TR1 = tarjetaTruco(g, yT, 700);
      aparece(s, TR1, Wd('A4', 'recordarlo') - 0.1, tM + 0.2, { dy: 10 });
      const [a1, a2, a3] = lineaCentrada(TR1, [[['Ar', C.rosa], ['mónica', C.blanco]], [['=', C.suave]], [['Ár', C.rosa], ['abe', C.blanco]]], CX, yT + 20, { size: 52, peso: 800, gap: 22 });
      aparece(s, a1, Wd('A4', 'armonica') - 0.15, 1e9, { dy: 6 });
      [a2, a3].forEach(w => aparece(s, w, Wd('A4', 'arabe') - 0.15, 1e9, { dy: 6 }));
      // ---------- M4–M6 · suena menos triste al final · truco: MElódica = MEnos triste
      const q2 = fraseG(g, [['menos triste ', C.blanco], ['al final', C.rosa]], CX, yT + 14, { size: 46, peso: 800, anchor: 'middle' });
      aparece(s, q2, Wd('M4', 'menos') - 0.2, Wd('M5', 'truco') - 0.2, { dy: 8 });
      const TR2 = tarjetaTruco(g, yT, 980);
      aparece(s, TR2, Wd('M5', 'truco') - 0.1, tD + 0.2, { dy: 10 });
      const [m1, m2, m3, m4] = lineaCentrada(TR2, [[['Me', C.rosa], ['lódica', C.blanco]], [['=', C.suave]], [['Me', C.rosa], ['nos triste', C.blanco]], [['al final', C.suave]]], CX, yT + 20, { size: 52, peso: 800, gap: 22 });
      aparece(s, m1, Wd('M6', 'melodica') - 0.15, 1e9, { dy: 6 });
      [m2, m3].forEach(w => aparece(s, w, Wd('M6', 'menos') - 0.15, 1e9, { dy: 6 }));
      aparece(s, m4, Wd('M6', 'final') - 0.15, 1e9, { dy: 6 });
    });
  }

  // ================================================================ P · mi recomendación: tres pasos
  function escenaPasos() {
    const a = F0('P0') - 0.1, b = F0('O1') + 0.2;
    escena('pasos', a, b, (s, g) => {
      const fin = b - 0.3;
      const t1 = F0('P1') - 0.15, t2 = F0('P2') - 0.15, t3 = F0('P5') - 0.15;
      tarjetasPasos(s, g, [
        { n: '1', tit: 'COLOCA LAS CABEZAS', t0: t1, t1: t2 },
        { n: '2', tit: 'PON LA ARMADURA', t0: t2, t1: t3 },
        { n: '3', tit: 'MODIFICA LAS NOTAS', t0: t3, t1: fin + 1 },
      ], Wd('P0', 'tres') - 0.25, fin);
      // a la izquierda, el ejemplo de siempre (Re m) paso a paso
      const yM = 560, xP = 110;
      chipTonEn(s, g, 'D', 'menor', 560, 370, { size: 38, ta: Wd('P1', 'coloca') - 0.15, tb: fin, dRosa: 0 });
      const PE = N.group(g);
      aparece(s, PE, Wd('P1', 'coloca') - 0.1, fin, { dy: 0 });
      const ES = escala(PE, { x: xP, yM, ancho: 900, nArm: 1, tipoArm: 'b', x1: 300, paso: 94 });
      const tCab = Wd('P1', 'cabezas') - 0.15;
      ES.notas.forEach((e, i) => pop(s, e.out, tCab + i * 0.09, fin, e.cx, e.y, { k0: .4, fi: .22 }));
      const tArm = Wd('P2', 'armadura') - 0.15;
      const [cxA, cyA] = centroArm(ES.A, 0, yM, 'b');
      pop(s, ES.A.items[0].g, tArm, fin, cxA, cyA, { k0: .4, fi: .3 });
      rosaEn(s, ES.A.items[0].g, [[tArm - 0.3, tArm + 1.6]]);
      // (29-sep, Iago) fuera «Ya sabes, calcula el Mayor…»: del paso 2 se pasa directo a «Si tienes dudas…»
      // P4 · si tienes dudas: el vídeo «Indica la armadura» o los apuntes → dos tarjetas de enlace (se pulsan)
      const xR = 1460, tVid = Wd('P4', 'video') - 0.15, tApu = Wd('P4', 'apuntes') - 0.2;
      const tVari = Wd('P5', 'variante') - 0.2, tSub = Wd('P5', 'subiendo') - 0.15;
      const D3 = N.group(g);   // las tarjetas siguen a la vista hasta que salen las variantes (en el mismo sitio)
      s.on(t => opa(D3, win(t, tVid, tVari - 0.45, .35, .4)));
      const tv = tarjetaEnlace(D3, xR, 440, { tipo: 'video', titulo: 'Indica la armadura', slug: 'indica-la-armadura', centro: true });
      const ta = tarjetaEnlace(D3, xR, 560, { tipo: 'apuntes', titulo: 'Indica la armadura', temas: ['armadura'], centro: true, w: tv._w });
      pop(s, tv, tVid, 1e9, xR, 440);
      pop(s, ta, tApu, 1e9, xR, 560);
      // P5 · modifica las notas según la variante, subiendo un semitono
      const VR = [['Armónica', '7↑'], ['Melódica', '6↑ 7↑'], ['Dórica', '6↑']];
      VR.forEach(([nom, f], i) => {
        const G = N.group(g);
        frase(G, [[nom + ' ', C.blanco], [f, C.rosa]], 1170, 340 + i * 92, { size: 48, peso: 800 });
        aparece(s, G, tVari + i * 0.2, fin, { dy: 8 });
      });
      const su = fraseG(g, [['subiendo ', C.blanco], ['un semitono ↑', C.rosa]], 1170, 660, { size: 48, peso: 800 });
      aparece(s, su, tSub, fin, { dy: 8 });
      [5, 6].forEach(i => {
        const e = ES.notas[i], G = N.group(g); color(G, C.rosa);
        flecha(G, e.cx, yM - 82, e.cx, yM - 140, { w: 5, cab: 17 });
        aparece(s, G, tSub + (i - 5) * 0.15, fin, { dy: 10 });
        rosaEn(s, e.c, [[tSub + (i - 5) * 0.15, fin + 1]]);
      });
    });
  }

  // ================================================================ O · ojo: mira por el retrovisor (Sol m, melódica: Mi♭ → Mi♮ y Fa → Fa♯)
  function escenaRetrovisor() {
    const a = F0('O1') - 0.1, b = F0('F1') + 0.2;
    escena('retrovisor', a, b, (s, g) => {
      const fin = b - 0.3;
      const ojo = N.group(g); chip(ojo, '¡OJO!', CX, 140, { size: 30, anchor: 'middle' });
      pop(s, ojo, Wd('O1', 'ojo') - 0.1, fin, CX, 140);
      // el retrovisor
      const xR = 1250, yR = 300;
      const RV = N.group(g);
      const R = icoRetrovisor(RV, xR, yR, 1.1); color(R.G, C.blanco);
      pop(s, RV, Wd('O1', 'mira') - 0.15, fin, xR, yR, { k0: .5, fi: .35 });
      // el pentagrama de Sol m (armadura: Si♭, Mi♭) y la mirada del retrovisor hacia ella
      const yM = 650, tArm = Wd('O2', 'armadura') - 0.25;
      const E = N.group(g);
      aparece(s, E, Wd('O2', 'echa') - 0.1, fin, { dy: 0 });
      const ESC_SOL = ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'];
      const ES = escala(E, { x: X_ESC, yM, ancho: W_ESC, nArm: 2, tipoArm: 'b', x1: X1_ESC + 30, paso: 132, notas: ESC_SOL });
      const [cx0, cy0] = centroArm(ES.A, 0, yM, 'b'), [cx1, cy1] = centroArm(ES.A, 1, yM, 'b');
      const mi = N.group(g); color(mi, C.rosa);
      mirada(mi, R.izq[0] - 14, yR + 10, 560, 220, cx1 - 6, yM - 3 * SP);
      mostrarEn(s, mi, tArm, fin, .4, .4);
      // en el cristal, el reflejo de la armadura
      const refl = N.group(g); color(refl, C.rosa);
      [0, 1].forEach(i => N.glyph(refl, 'accidentalFlat', R.vid.x + R.vid.w * 0.32 + i * 44, yR + 16 + (i ? -11 : 0), 18));
      mostrarEn(s, refl, tArm + 0.2, fin, .4, .4);
      const tMi = Wd('O4', 'mi') - 0.1, tMi5 = Wd('O5', 'mi') - 0.1;
      rosaEn(s, ES.A.g, [[tArm, F0('O3') + 0.3]]);
      rosaEn(s, ES.A.items[1].g, [[tMi, tMi + 1.6], [tMi5, Wd('O5', 'pasa') + 0.3]]);
      // O3 · subir un semitono no siempre es poner ♯
      const tO3 = Wd('O3', 'subir') - 0.2, tNo = Wd('O3', 'no') - 0.15;
      const O3a = fraseG(g, [['subir un semitono', C.blanco]], CX - 200, 478, { size: 44, peso: 800, anchor: 'middle' });
      aparece(s, O3a, tO3, F0('O4') - 0.1, { dy: 8 });
      const O3b = fraseG(g, [['≠ ', C.suave], ['siempre ♯', C.rosa]], CX + 50, 478, { size: 44, peso: 800 });
      aparece(s, O3b, tNo, F0('O4') - 0.1, { dy: 8 });
      // O4 · Sol m: su armadura tiene Mi♭
      const tSol = Wd('O4', 'sol') - 0.15;
      chipTonEn(s, g, 'G', 'menor', CX - 110, 478, { size: 38, ta: tSol, tb: fin });
      const lMi = fraseG(g, 'Mi♭', cx1, yM + 2 * SP + 70, { size: 30, peso: 800, anchor: 'middle', fill: C.rosa });
      aparece(s, lMi, tMi, Wd('O5', 'melodica') - 0.1, { dy: 6 });
      // O5–O6 · melódica: sube el 6.º (Mi♭ → Mi♮) y el 7.º (Fa → Fa♯)
      const tMel = Wd('O5', 'melodica') - 0.15;
      const lMel = fraseG(g, [['melódica ', C.blanco], ['6↑ 7↑', C.rosa]], CX - 10, 492, { size: 42, peso: 800 });
      aparece(s, lMel, tMel, fin, { dy: 8 });
      const t6 = Wd('O5', 'sexto') - 0.15, tNat = Wd('O5', 'mi', 2) - 0.15, tBec = Wd('O5', 'becuadro') - 0.15;
      const t7 = Wd('O6', 'fa') - 0.15, tSos = Wd('O6', 'fa', 2) - 0.15;
      const NOM = [['Sol'], ['La'], ['Si♭'], ['Do'], ['Re'], ['Mi♭', 'Mi♮'], ['Fa', 'Fa♯'], ['Sol']];
      const ALT = { 5: ['n', [[tNat, fin + 1]]], 6: ['#', [[tSos, fin + 1]]] }, ROSA = { 5: [[t6, fin + 1]], 6: [[t7, fin + 1]] };
      ES.notas.forEach((e, i) => {
        const ta = tMel + 0.1 + i * 0.1;
        pop(s, e.out, ta, fin, e.cx, e.y, { k0: .5, fi: .25 });
        colorNota(s, e, ROSA[i] || [], []);
        if (ALT[i]) altEn(s, altDe(e, ALT[i][0]), ALT[i][1]);
        rotulo2(s, g, NOM[i][0], NOM[i][1], e.cx, yM + 146, ALT[i] ? ALT[i][1] : [], ta + 0.05, fin, { size: 30 });
        if (ROSA[i]) rotulo2(s, g, (i + 1) + '↑', null, e.cx, yM - 98, [], ROSA[i][0][0], fin, { size: 30, peso: 800, fill: C.rosa });
      });
      const bec = texto(g, 'becuadro', ES.notas[5].cx, yM + 190, { anchor: 'middle', size: 26, peso: 700, italic: true, fill: C.rosa });
      aparece(s, bec, tBec, F0('O6') - 0.1, { dy: 6 });
      const sos = texto(g, 'sostenido', ES.notas[6].cx, yM + 190, { anchor: 'middle', size: 26, peso: 700, italic: true, fill: C.rosa });
      aparece(s, sos, Wd('O6', 'sostenido') - 0.15, fin, { dy: 6 });
    });
  }

  // ================================================================ F · repaso rápido (en columna) + la escala de Re m a la derecha
  function escenaRepaso() {
    const a = F0('F1') - 0.1, b = T.acorde + 0.15;
    escena('repaso', a, b, (s, g) => {
      const fin = b - 0.3;
      const xC = 90, yC = 140, wC = 800, hC = 780;
      const CH = N.group(g);
      panel(CH, xC, yC, wC, hC, { rx: 24, stroke: 'rgba(248,250,252,0.35)', sw: 2 });
      texto(CH, 'REPASO', xC + 44, yC + 62, { size: 26, peso: 800, ls: '0.24em', fill: C.rosa });
      aparece(s, CH, Wd('F1', 'repaso') - 0.3, fin, { dy: 12 });
      const filas = [
        { f: 'F2', nom: 'Natural', form: '', mn: 'tal cual', tMn: Wd('F2', 'tal') - 0.15 },
        { f: 'F3', nom: 'Armónica', form: '7↑', tForm: Wd('F3', 'sube') - 0.15, mn: 'árabe', tMn: Wd('F3', 'arabe') - 0.15 },
        { f: 'F4', nom: 'Melódica', form: '6↑ 7↑', tForm: Wd('F4', 'sube') - 0.15, mn: 'menos triste', tMn: Wd('F4', 'menos') - 0.15 },
        { f: 'F5', nom: 'Dórica', form: '6↑', tForm: Wd('F5', 'sube') - 0.15 },
      ];
      filas.forEach((r, i) => {
        const y = yC + 180 + i * 125, ta = F0(r.f) - 0.15, tb = (filas[i + 1] ? F0(filas[i + 1].f) : F0('F6')) - 0.15;
        const G = N.group(g);
        const fN = frase(G, r.nom, xC + 50, y, { size: 46, peso: 800, fill: 'currentColor' });
        color(G, C.blanco);
        aparece(s, G, ta, fin, { dy: 8 });
        resalta(s, G, ta, tb, { d: .25 });
        if (r.form) { const fF = fraseG(g, [[r.form, C.rosa]], xC + 64 + fN._w, y, { size: 46, peso: 800 }); aparece(s, fF, r.tForm, fin, { dy: 6 }); }
        if (r.mn) { const fM = fraseG(g, r.mn, xC + 520, y, { size: 34, peso: 600, italic: true, fill: C.suave }); aparece(s, fM, r.tMn, fin, { dy: 6 }); }
      });
      // F6 · y siempre, antes de alterar: el retrovisor
      const tF6 = Wd('F6', 'alterar') - 0.3, yF6 = yC + 690;
      const RF = N.group(g);
      const rv = icoRetrovisor(RF, xC + 130, yF6 - 8, 0.42); color(rv.G, C.rosa);
      frase(RF, [['antes de alterar: ', C.blanco], ['retrovisor', C.rosa]], xC + 240, yF6 + 4, { size: 38, peso: 800 });
      aparece(s, RF, tF6, fin, { dy: 8 });
      // a la derecha: Re m con los cambios de la fila que se está diciendo
      const yM = 500;
      const E = N.group(g);
      aparece(s, E, Wd('F1', 'repaso') - 0.1, fin, { dy: 0 });
      const cRe = chipTon(E, 'D', 'menor', 1385, 250, { size: 32, fondo: C.panel, borde: C.blanco });
      const ES = escala(E, { x: 930, yM, ancho: 910, nArm: 1, tipoArm: 'b', x1: 1150, paso: 92 });
      const f3 = [Wd('F3', 'septimo') - 0.15, F0('F4') - 0.2];
      const f4s = [Wd('F4', 'sexto') - 0.15, F0('F5') - 0.2], f4t = [Wd('F4', 'septimo') - 0.15, F0('F5') - 0.2];
      const f5 = [Wd('F5', 'sexto') - 0.15, fin + 1];
      const ALT = { 5: ['n', [f4s, f5]], 6: ['#', [f3, f4t]] };
      const NOM = [['Re'], ['Mi'], ['Fa'], ['Sol'], ['La'], ['Si♭', 'Si♮'], ['Do', 'Do♯'], ['Re']];
      ES.notas.forEach((e, i) => {
        colorNota(s, e, ALT[i] ? ALT[i][1] : [], []);
        if (ALT[i]) altEn(s, altDe(e, ALT[i][0]), ALT[i][1]);
        rotulo2(s, g, NOM[i][0], NOM[i][1], e.cx, yM + 136, ALT[i] ? ALT[i][1] : [], Wd('F1', 'repaso') + i * 0.05, fin, { size: 28 });
      });
      [5, 6].forEach(i => {
        const e = ES.notas[i], G = fraseG(g, (i + 1) + '↑', e.cx, yM - 94, { size: 28, peso: 800, anchor: 'middle', fill: C.rosa });
        s.on(t => opa(G, ventanas(t, ALT[i][1], .3, .3)));
      });
      // F6: el retrovisor mira la armadura (Si♭)
      const [cxA] = centroArm(ES.A, 0, yM, 'b');
      const RV = N.group(g);
      const R = icoRetrovisor(RV, 1560, 300, 0.62); color(R.G, C.blanco);
      const rf = N.group(RV); color(rf, C.rosa); N.glyph(rf, 'accidentalFlat', R.vid.x + R.vid.w * 0.36, 309, 12);
      pop(s, RV, tF6 + 0.2, fin, 1560, 300, { k0: .5 });
      const mi = N.group(g); color(mi, C.rosa);
      mirada(mi, R.izq[0] - 10, 306, 1180, 300, cxA, yM - 2.6 * SP);
      mostrarEn(s, mi, Wd('F6', 'retrovisor') - 0.4, fin, .4, .4);
      rosaEn(s, ES.A.items[0].g, [[Wd('F6', 'retrovisor') - 0.3, fin + 1]]);
      s.on(t => opa(cRe, 1 - ease(ramp(t, tF6, tF6 + 0.4))));
    });
  }

  const ORDEN = [escenaIntro, escenaVariantes, escenaPasos, escenaRetrovisor, escenaRepaso];

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
