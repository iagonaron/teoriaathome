/* =====================================================================
   ESCENAS · Cadencias (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (cadencias/escenas_cuerpo.js). Todo es función pura de t.
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

  // ================================================================ E22 · CADENCIAS (auténtica, plagal, semicadencia y rota, en Sol M a cuatro voces)
  const TITULO = { kicker: 'TEORÍA  ·  ARMONÍA', lineas: ['CADENCIAS'], sub: 'Auténtica · Plagal · Semicadencia · Rota' };

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

  // acordes a cuatro voces en Sol M (soprano, contralto | tenor, bajo) — los mismos que suenan (pipe/p_cadencias.py)
  const AC = {
    I: ['G4', 'D4', 'B3', 'G2'], IV: ['G4', 'E4', 'C4', 'C3'], V: ['F#4', 'D4', 'A3', 'D3'],
    VI: ['G4', 'E4', 'B3', 'E3'], VIr: ['G4', 'B3', 'G3', 'E3'],
  };
  const ROMANO = g => g.replace('r', '');
  const BAJO = { I: 'Sol', IV: 'Do', V: 'Re', VI: 'Mi', VIr: 'Mi' };
  /** Sistema de piano en Sol M (clave de Sol y de Fa, llave y el Fa♯ de la armadura en los dos). */
  function sistemaSolM(parent, x, yS, ancho) {
    const S_ = sistema(parent, x, yS, ancho, { sep: 9 * SP });
    const xa = S_.x0 + 4;
    const AR = N.group(S_.g, 'armadura');
    N.glyph(AR, 'accidentalSharp', xa, yS - 2 * SP, SP);
    N.glyph(AR, 'accidentalSharp', xa, S_.yF - 1 * SP, SP);
    S_.ar = AR;
    S_.xL = xa + N.M.accidentalSharp.adv * SP + 1.6 * SP;
    return S_;
  }
  /** Un acorde a cuatro voces: soprano y contralto en clave de Sol; tenor y bajo en clave de Fa. */
  function acordeSATB(parent, grado, x, sis) {
    const G = N.group(parent, 'acordeSATB');
    const v = AC[grado].map((n, i) => {
      const W = N.group(G, 'voz'); const fa = i >= 2;
      const r = N.redonda(W, n, x, fa ? sis.yF : sis.yS, SP, { clave: fa ? 'fa' : undefined, alteracion: false });
      return { n, g: W, y: r.y, cx: x + r.w / 2, w: r.w };
    });
    return { g: G, v, x, cx: x + v[0].w / 2, grado };
  }
  /** Secuencia de acordes con sus grados debajo; los dos últimos, dentro de un recuadro (la cadencia).
   *  Devuelve {ac:[…], caja, romanos:[…], bajos:[…]} para animarlo. */
  function secuencia(s, g, sis, grados, o) {
    o = o || {};
    const paso = o.paso || 200, x0 = sis.xL + (o.dx || 30);
    const ac = grados.map((gr, j) => acordeSATB(g, gr, x0 + j * paso, sis));
    const n = ac.length, xa = ac[n - 2].x - 44, xb = ac[n - 1].x + ac[n - 1].v[0].w + 44;
    const caja = N.group(g, 'caja'); color(caja, C.rosa);
    N.el('rect', { x: xa, y: sis.yS - 2 * SP - 44, width: xb - xa, height: sis.yF - sis.yS + 4 * SP + 88, rx: 22, fill: 'currentColor', 'fill-opacity': 0.12, stroke: 'currentColor', 'stroke-width': 3 }, caja);
    g.insertBefore(caja, g.firstChild);
    const romanos = ac.map(a => { const R = N.group(g); texto(R, ROMANO(a.grado), a.cx, sis.yF + 2 * SP + 78, { anchor: 'middle', size: 38, peso: 800, fill: 'currentColor' }); color(R, C.blanco); return R; });
    const bajos = ac.map(a => { const B = N.group(g); texto(B, BAJO[a.grado], a.cx, sis.yF + 2 * SP + 124, { anchor: 'middle', size: 28, peso: 700, fill: 'currentColor' }); color(B, C.suave); return B; });
    return { ac, caja, romanos, bajos, xa, xb };
  }
  /** Mientras suena el bloque, cada acorde se enciende con su ataque (y se queda un poco). */
  function suenaSecuencia(s, sq, blq) {
    const ts = S[blq] || [];
    sq.ac.forEach((a, j) => s.on(t => {
      const t0 = ts[j]; const ult = j === sq.ac.length - 1;
      const k = t0 == null ? 0 : win(t, t0 - 0.03, t0 + (ult ? 2.0 : 0.95), .05, .3);
      color(a.g, mezcla(C.blanco, C.rosa, k));
    }));
  }
  /** Signo de puntuación grande: '.' y ',' dibujados (en la fuente salen diminutos); el resto, texto. (x, y) = base. */
  function puntoGrande(parent, ch, x, y, size) {
    size = size || 140; const r = size * 0.13;
    if (ch === '.') return N.el('circle', { cx: x, cy: y - r, r, fill: 'currentColor' }, parent);
    if (ch === ',') {
      const G = N.group(parent);
      N.el('circle', { cx: x, cy: y - r, r, fill: 'currentColor' }, G);
      N.el('path', { d: `M${x + r * 0.95},${y - r * 0.9} C${x + r * 1.1},${y + r * 1.2} ${x - r * 0.2},${y + r * 2.1} ${x - r * 1.0},${y + r * 2.4} C${x - r * 0.1},${y + r * 1.5} ${x + r * 0.2},${y + r * 0.6} ${x - r * 0.1},${y - r * 0.2} Z`, fill: 'currentColor' }, G);
      return G;
    }
    return texto(parent, ch, x, y, { anchor: 'middle', size, peso: 800, fill: 'currentColor' });
  }
  /** «V → I» grande (con flecha dibujada), centrado en x. */
  function formula(parent, izq, der, x, y, size) {
    size = size || 58;
    const G = N.group(parent, 'formula');
    const a = texto(G, izq, 0, 0, { size, peso: 800, fill: C.rosa }), wa = D.medir(a);
    const b = texto(G, der, 0, 0, { size, peso: 800, fill: C.rosa }), wb = D.medir(b);
    const fl = 90, gap = 22, w = wa + gap + fl + gap + wb, x0 = x - w / 2;
    a.setAttribute('x', x0.toFixed(1)); a.setAttribute('y', y);
    b.setAttribute('x', (x0 + wa + 2 * gap + fl).toFixed(1)); b.setAttribute('y', y);
    const F = N.group(G); color(F, C.blanco); flecha(F, x0 + wa + gap, y - size * 0.34, x0 + wa + gap + fl, y - size * 0.34, { w: 5, cab: 18 });
    return G;
  }
  function icoPlaneta(g, cx, cy, s) {
    const G = N.group(g, 'ico'); s = s || 1;
    N.el('circle', { cx, cy, r: 34 * s, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 * s }, G);
    N.el('ellipse', { cx, cy, rx: 62 * s, ry: 16 * s, fill: 'none', stroke: 'currentColor', 'stroke-width': 4 * s, transform: `rotate(-18 ${cx} ${cy})` }, G);
    return G;
  }
  function icoOjoCerrado(g, cx, cy, s) {
    const G = N.group(g, 'ico'); s = s || 1;
    N.el('path', { d: `M${cx - 60 * s},${cy - 6 * s} C${cx - 30 * s},${cy + 30 * s} ${cx + 30 * s},${cy + 30 * s} ${cx + 60 * s},${cy - 6 * s}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 6 * s, 'stroke-linecap': 'round' }, G);
    for (const [dx, dy] of [[-40, 18], [-14, 26], [14, 26], [40, 18]]) N.line(G, cx + dx * s, cy + dy * s, cx + dx * 1.15 * s, cy + (dy + 18) * s, 4.5 * s, { 'stroke-linecap': 'round' });
    return G;
  }

  // ================================================================ I · la música respira: las cadencias son su puntuación
  function escenaIntro() {
    const a = F0('I1') - 0.1, b = F0('B1') - 0.2;
    escena('intro', a, b, (s, g) => {
      const fin = b - 0.3;
      // una melodía en tres frases, con respiraciones entre ellas
      const tRe = Wd('I1', 'respira') - 0.5, tCa = Wd('I2', 'cadencias') - 0.3;
      const yO = 330;
      const FR3 = [
        'M150,360 C230,280 300,300 360,330 S470,400 560,350',
        'M660,350 C730,260 820,270 880,320 S1000,380 1090,330',
        'M1190,330 C1270,250 1350,300 1420,320 S1560,370 1700,380',
      ];
      const fins = [[560, 350], [1090, 330], [1700, 380]];
      const ON = N.group(g); color(ON, C.blanco);
      const ps = FR3.map(d => trazo(ON, d, { w: 7 }));
      s.on(t => { ps.forEach((p, i) => trazoK(p, ramp(t, tRe + i * 0.5, tRe + 0.6 + i * 0.5))); opa(ON, win(t, tRe, fin, .2, .4)); });
      const re = fraseG(g, [['la música ', C.blanco], ['respira', C.rosa]], CX, 200, { size: 46, peso: 800, anchor: 'middle' });
      aparece(s, re, tRe, tCa, { dy: 8 });
      fins.forEach(([x, y], i) => {
        const P = N.group(g); color(P, C.rosa); N.el('circle', { cx: x, cy: y, r: 14, fill: 'currentColor' }, P);
        pop(s, P, tCa + i * 0.15, fin, x, y, { k0: .3 });
      });
      const ca = fraseG(g, [['se detiene: ', C.blanco], ['cadencias', C.rosa]], CX, 200, { size: 46, peso: 800, anchor: 'middle' });
      aparece(s, ca, tCa + 0.1, fin, { dy: 8 });
      // …como la puntuación: punto, coma… y la sorpresa
      const PU = [
        { ch: '.', tx: 'cierra del todo', t0: Wd('I3', 'punto') - 0.3 },
        { ch: ',', tx: 'se queda esperando', t0: Wd('I3', 'coma') - 0.3 },
        { ch: '¡!', tx: 'final inesperado', t0: Wd('I4', 'inesperada') - 0.4 },
      ];
      const pu = fraseG(g, [['como la ', C.suave], ['puntuación', C.blanco]], CX, 520, { size: 38, peso: 800, anchor: 'middle' });
      aparece(s, pu, Wd('I3', 'puntuacion') - 0.3, fin, { dy: 6 });
      const wC = 440, gC = 40, xC = CX - (3 * wC + 2 * gC) / 2, yC = 570, hC = 300;
      PU.forEach((p, i) => {
        const x = xC + i * (wC + gC), G = N.group(g);
        panel(G, x, yC, wC, hC, { rx: 24 });
        const M_ = N.group(G); color(M_, C.rosa); puntoGrande(M_, p.ch, x + wC / 2, yC + 170, 150);
        texto(G, p.tx, x + wC / 2, yC + 250, { anchor: 'middle', size: 32, peso: 800, fill: C.blanco });
        pop(s, G, p.t0, fin, x + wC / 2, yC + hC / 2, { k0: .85 });
      });
    });
  }

  // ================================================================ B · a cuatro voces: fíjate en el bajo y en los dos últimos acordes
  function escenaBajo() {
    const a = F0('B1') - 0.2, b = F0('A1') - 0.2;
    escena('bajo', a, b, (s, g) => {
      const fin = b - 0.3;
      const tMu = Wd('B1', 'musica') - 0.3, tVo = Wd('B1', 'voces') - 0.3;
      const SI = N.group(g); const sis = sistemaSolM(SI, 470, 400, 980);
      aparece(s, SI, tMu, fin, { dy: 10 });
      const SQ = N.group(g); const sq = secuencia(s, SQ, sis, ['I', 'IV', 'V', 'I']);
      aparece(s, SQ, tVo, fin, { dy: 8 });
      const vo = fraseG(g, [['cuatro voces', C.rosa]], CX, 190, { size: 44, peso: 800, anchor: 'middle' });
      aparece(s, vo, tVo, F0('B2') - 0.1, { dy: 8 });
      // el bajo
      const tBa = Wd('B2', 'bajo') - 0.3, tAc = Wd('B2', 'acorde') - 0.3, tUl = Wd('B2', 'ultimos') - 0.4;
      s.on(t => { const k = win(t, tBa, 1e9, .3, .1); sq.ac.forEach(ac => color(ac.v[3].g, mezcla(C.blanco, C.rosa, k))); });
      sq.bajos.forEach((B, j) => { color(B, C.rosa); mostrarEn(s, B, tBa + 0.2 + j * 0.1, fin, .3); });
      const ba = fraseG(g, [['el bajo', C.rosa], [': la voz más grave', C.blanco]], CX, 190, { size: 44, peso: 800, anchor: 'middle' });
      aparece(s, ba, tBa, tUl, { dy: 8 });
      s.on(t => opa(sq.caja, win(t, tUl, fin, .4, .4)));
      const ul = fraseG(g, [['y ', C.blanco], ['los dos últimos acordes', C.rosa]], CX, 190, { size: 44, peso: 800, anchor: 'middle' });
      aparece(s, ul, tUl, F0('B3') - 0.1, { dy: 8 });
      sq.romanos.forEach(R => mostrarEn(s, R, tAc, fin, .3));
      // en Sol Mayor
      const tSo = Wd('B3', 'sol') - 0.3;
      const kS = N.group(g); chip(kS, 'EN SOL MAYOR', CX, 190, { size: 34, anchor: 'middle' });
      pop(s, kS, tSo, fin, CX, 190);
      s.on(t => color(sis.ar, mezcla(C.blanco, C.rosa, win(t, tSo, fin, .3, .3))));
    });
  }

  // ================================================================ las cuatro cadencias (misma plantilla)
  function escenaCadencia(o) {
    const a = F0(o.f0) - 0.2, b = F0(o.f1) - 0.2;
    escena(o.nombre, a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, o.chip, CX, 150, { size: 36, anchor: 'middle' });
      pop(s, k, o.tChip, fin, CX, 150);
      const fo = N.group(g); formula(fo, o.formula[0], o.formula[1], CX, 250);
      aparece(s, fo, o.tFormula, fin, { dy: 8 });
      const fs = fraseG(g, [[o.sub, C.suave]], CX, 305, { size: 32, peso: 700, anchor: 'middle' });
      aparece(s, fs, o.tSub != null ? o.tSub : o.tFormula + 0.3, fin, { dy: 6 });
      const SI = N.group(g); const sis = sistemaSolM(SI, 470, 440, 980);
      aparece(s, SI, a + 0.2, fin, { dy: 10 });
      const SQ = N.group(g); const sq = secuencia(s, SQ, sis, o.grados, { paso: o.grados.length > 4 ? 160 : 200 });
      aparece(s, SQ, a + 0.35, fin, { dy: 8 });
      s.on(t => opa(sq.caja, win(t, o.tCaja, fin, .4, .4)));
      const n = sq.ac.length;
      sq.romanos.forEach((R, j) => s.on(t => color(R, j >= n - 2 ? mezcla(C.blanco, C.rosa, win(t, o.tCaja, fin, .3, .3)) : C.blanco)));
      sq.bajos.forEach((B, j) => { opa(B, 0); if (j >= n - 2) s.on(t => { opa(B, win(t, o.tBajos[j - (n - 2)], fin, .3, .4)); color(B, mezcla(C.suave, C.rosa, win(t, o.tBajos[j - (n - 2)], o.tBajos[j - (n - 2)] + 1.2, .1, .4))); }); });
      suenaSecuencia(s, sq, o.blq);
      oido(s, g, 1640, 560, [o.blq]);
      if (o.extra) o.extra(s, g, sis, sq, fin);
    });
  }
  function escenasCadencias() {
    escenaCadencia({
      nombre: 'autentica', f0: 'A1', f1: 'P1', chip: 'CADENCIA AUTÉNTICA', tChip: Wd('A1', 'autentica') - 0.3,
      formula: ['V', 'I'], sub: 'de la dominante a la tónica', tFormula: Wd('A1', 'dominante') - 0.3, tSub: Wd('A1', 'tonica') - 0.3,
      grados: ['I', 'IV', 'V', 'I'], tCaja: Wd('A1', 'quinto') - 0.3, tBajos: [Wd('A2', 're') - 0.2, Wd('A2', 'sol') - 0.2], blq: 'SON_AUT',
      extra: (s, g, sis, sq, fin) => {
        const PF = N.group(g); color(PF, C.rosa); puntoGrande(PF, '.', 1640, 390, 160);
        pop(s, PF, Wd('A3', 'punto') - 0.3, fin, 1640, 350, { k0: .4 });
        const tx = fraseG(g, [['el punto final', C.rosa]], 1640, 450, { size: 30, peso: 800, anchor: 'middle' });
        aparece(s, tx, Wd('A3', 'punto') - 0.1, fin, { dy: 6 });
      },
    });
    escenaCadencia({
      nombre: 'plagal', f0: 'P1', f1: 'S1', chip: 'CADENCIA PLAGAL', tChip: F0('P1') + 0.1,
      formula: ['IV', 'I'], sub: 'de la subdominante a la tónica', tFormula: Wd('P1', 'subdominante') - 0.3, tSub: Wd('P1', 'tonica') - 0.3,
      grados: ['I', 'V', 'I', 'IV', 'I'], tCaja: Wd('P1', 'cuarto') - 0.3, tBajos: [Wd('P2', 'do') - 0.2, Wd('P2', 'sol') - 0.2], blq: 'SON_PLA',
      extra: (s, g, sis, sq, fin) => {
        const tx = fraseG(g, [['también termina: ', C.blanco], ['más tranquila, más suave', C.rosa]], CX, 945, { size: 34, peso: 800, anchor: 'middle' });
        aparece(s, tx, Wd('P3', 'tranquila') - 0.3, fin, { dy: 6 });
      },
    });
    escenaCadencia({
      nombre: 'semicadencia', f0: 'S1', f1: 'R1', chip: 'SEMICADENCIA', tChip: Wd('S1', 'semicadencia') - 0.3,
      formula: ['…', 'V'], sub: 'se detiene en la dominante', tFormula: Wd('S1', 'detiene') - 0.3,
      grados: ['I', 'VI', 'IV', 'V'], tCaja: Wd('S1', 'dominante') - 0.2, tBajos: [Wd('S1', 'dominante') + 0.2, Wd('S1', 'dominante') + 0.4], blq: 'SON_SEM',
      extra: (s, g, sis, sq, fin) => {
        const CO = N.group(g); color(CO, C.rosa); puntoGrande(CO, ',', 1640, 380, 160);
        pop(s, CO, Wd('S1', 'medias') - 0.3, fin, 1640, 340, { k0: .4 });
        const tx = fraseG(g, [['se queda a medias', C.rosa]], 1640, 460, { size: 28, peso: 800, anchor: 'middle' });
        aparece(s, tx, Wd('S1', 'medias') - 0.1, fin, { dy: 6 });
        const ap = fraseG(g, [['¡todavía no apetece aplaudir!', C.blanco]], CX, 945, { size: 34, peso: 800, italic: true, anchor: 'middle' });
        aparece(s, ap, Wd('S1', 'aplaudir') - 0.3, fin, { dy: 6 });
      },
    });
    escenaCadencia({
      nombre: 'rota', f0: 'R1', f1: 'G1', chip: 'CADENCIA ROTA', tChip: Wd('R1', 'rota') - 0.3,
      formula: ['V', 'VI'], sub: '¡en vez de ir al I, va al VI!', tFormula: Wd('R1', 'sexto') - 0.3,
      grados: ['I', 'IV', 'V', 'VIr'], tCaja: Wd('R1', 'ultimo') - 0.3, tBajos: [Wd('R2', 're') - 0.2, Wd('R2', 'mi') - 0.2], blq: 'SON_ROT',
      extra: (s, g, sis, sq, fin) => {
        const PL = N.group(g); color(PL, C.rosa); icoPlaneta(PL, 1640, 360, 1.1);
        pop(s, PL, Wd('R2', 'universo') - 0.3, fin, 1640, 360, { k0: .4 });
        const tx = fraseG(g, [['¡sorpresa!', C.rosa]], 1640, 450, { size: 32, peso: 800, anchor: 'middle' });
        aparece(s, tx, Wd('R2', 'sorpresa') - 0.3, fin, { dy: 6 });
        // «parece que va a ir a la tónica…»: un I fantasma que no llega
        const tTo = Wd('R1', 'tonica') - 0.3, tSe = Wd('R1', 'sexto') - 0.3;
        const FA = N.group(g); color(FA, C.suave);
        const ul = sq.ac[sq.ac.length - 1];
        texto(FA, 'I ?', ul.cx, sis.yS - 2 * SP - 70, { anchor: 'middle', size: 40, peso: 800, fill: 'currentColor' });
        s.on(t => opa(FA, win(t, tTo, tSe + 0.3, .3, .3)));
      },
    });
  }

  // ================================================================ G · ejemplos sencillos… pero en la música real dan mucho juego
  function escenaMundo() {
    const a = F0('G1') - 0.2, b = F0('F1') - 0.2;
    escena('mundo', a, b, (s, g) => {
      const fin = b - 0.3;
      const l1 = fraseG(g, [['ahora: ', C.suave], ['ejemplos muy sencillos', C.blanco]], CX, 360, { size: 44, peso: 800, anchor: 'middle' });
      aparece(s, l1, Wd('G1', 'ejemplos') - 0.4, fin, { dy: 8 });
      const IN = N.group(g); color(IN, C.rosa); icoNotas(IN, CX, 520, 1.6);
      aparece(s, IN, Wd('G1', 'musica') - 0.4, fin, { dy: 8 });
      const l2 = fraseG(g, [['en la música: ', C.suave], ['dan mucho juego', C.rosa]], CX, 680, { size: 44, peso: 800, anchor: 'middle' });
      aparece(s, l2, Wd('G1', 'juego') - 0.4, fin, { dy: 8 });
      const l3 = fraseG(g, [['¡todo un mundo!', C.blanco]], CX, 780, { size: 40, peso: 800, italic: true, anchor: 'middle' });
      aparece(s, l3, Wd('G1', 'mundo') - 0.4, fin, { dy: 8 });
    });
  }

  // ================================================================ F · repaso final
  function escenaRepaso() {
    const a = F0('F1') - 0.2, b = F0('Q1') - 0.2;
    escena('repaso', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'REPASO FINAL', CX, 150, { size: 36, anchor: 'middle' });
      pop(s, k, Wd('F1', 'repaso') - 0.3, fin, CX, 150);
      const FIL = [
        { nm: 'Auténtica', fo: ['V', 'I'], pu: '.', tx: 'punto final, muy conclusivo', t0: Wd('F2', 'autentica') - 0.3 },
        { nm: 'Plagal', fo: ['IV', 'I'], pu: '.', tx: 'un final más suave', t0: Wd('F2', 'plagal') - 0.3 },
        { nm: 'Semicadencia', fo: ['…', 'V'], pu: ',', tx: 'se queda sin acabar', t0: Wd('F3', 'semicadencia') - 0.3 },
        { nm: 'Rota', fo: ['V', 'VI'], pu: '¡!', tx: 'un final inesperado', t0: Wd('F4', 'rota') - 0.3 },
      ];
      FIL.forEach((f, i) => {
        const y = 290 + i * 150, G = N.group(g);
        panel(G, 250, y - 62, 1420, 120, { rx: 20 });
        texto(G, f.nm, 300, y + 14, { size: 42, peso: 800, fill: C.blanco });
        formula(G, f.fo[0], f.fo[1], 830, y + 16, 44);
        const PU = N.group(G); color(PU, C.rosa); puntoGrande(PU, f.pu, 1040, y + 26, f.pu === '¡!' ? 70 : 110);
        texto(G, f.tx, 1110, y + 12, { size: 32, peso: 700, fill: C.suave });
        aparece(s, G, f.t0, fin, { dy: 8 });
      });
    });
  }

  // ================================================================ Q · cierra los ojos: ¿qué cadencia es?
  function escenaQuiz() {
    const a = F0('Q1') - 0.2, b = T.acorde + 0.15;
    escena('quiz', a, b, (s, g) => {
      const fin = b - 0.3;
      const OJ = N.group(g); color(OJ, C.rosa); icoOjoCerrado(OJ, CX, 250, 1.2);
      pop(s, OJ, Wd('Q1', 'ojos') - 0.4, F0('Q2') + 0.6, CX, 260, { k0: .5 });
      const OA = N.group(g); color(OA, C.rosa); icoOjo(OA, CX, 262, 1.0);
      pop(s, OA, Wd('Q2', 'abrir') - 0.2, fin, CX, 262, { k0: .5 });
      const pr = fraseG(g, [['¿Qué cadencia es?', C.blanco]], CX, 420, { size: 56, peso: 800, anchor: 'middle' });
      aparece(s, pr, Wd('Q1', 'puedes') - 0.3, fin, { dy: 8 });
      const OP = ['Auténtica', 'Plagal', 'Semicadencia', 'Rota'];
      const wO = 360, gO = 30, xO = CX - (4 * wO + 3 * gO) / 2, yO = 560;
      const tRes = Wd('Q2', 'rota') - 0.3;
      OP.forEach((op, i) => {
        const x = xO + i * (wO + gO), G = N.group(g);
        const r = panel(G, x, yO, wO, 120, { rx: 22 });
        const tt = texto(G, op, x + wO / 2, yO + 76, { anchor: 'middle', size: 40, peso: 800, fill: C.blanco });
        aparece(s, G, Wd('Q1', 'cadencia') - 0.2 + i * 0.12, fin, { dy: 8 });
        const ok = op === 'Rota';
        s.on(t => {
          const k = win(t, tRes, fin, .3, .3);
          if (ok) { r.setAttribute('stroke', mezcla('#3a4556', C.rosa, k)); r.setAttribute('stroke-width', (1.5 + 2.5 * k).toFixed(2)); tt.setAttribute('fill', mezcla(C.blanco, C.rosa, k)); }
          else G.setAttribute('opacity', (1 - 0.6 * k).toFixed(3));
        });
      });
      oido(s, g, CX, 800, ['SON_QUIZ']);
      // el tiempo para pensar (tras el último acorde)
      const TS = S.SON_QUIZ || [], BQ = T.bloque.SON_QUIZ;
      if (TS.length && BQ) {
        const tP = TS[TS.length - 1] + 1.6;
        const pi = fraseG(g, [['piensa…', C.suave]], CX, 900, { size: 38, peso: 700, italic: true, anchor: 'middle' });
        aparece(s, pi, tP, BQ.t1 + 0.2, { dy: 6 });
      }
      const re = N.group(g); formula(re, 'V', 'VI', CX - 250, 830, 46);
      frase(re, [['¡la cadencia rota!', C.rosa]], CX - 110, 830, { size: 46, peso: 800 });
      aparece(s, re, tRes + 0.2, fin, { dy: 8 });
      const ej = fraseG(g, [['¡Ve a hacer ejercicios!', C.rosa]], CX, 930, { size: 48, peso: 800, anchor: 'middle' });
      aparece(s, ej, Wd('Q3', 'ejercicios') - 0.5, fin, { dy: 8 });
    });
  }

  const ORDEN = [escenaIntro, escenaBajo, escenasCadencias, escenaMundo, escenaRepaso, escenaQuiz];

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
