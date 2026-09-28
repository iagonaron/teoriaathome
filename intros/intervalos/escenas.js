/* =====================================================================
   ESCENAS · Intervalos (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (intervalos/escenas_cuerpo.js). Todo es función pura de t.
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


  // ================================================================ E1 · INTERVALOS (el vídeo largo: número, especie y el truco de las manos)
  const TITULO = { kicker: 'TEORÍA  ·  INTERVALOS', lineas: ['INTERVALOS'], sub: 'Número · Especie · El truco de las manos' };
  const OCT = 3.5 * SP;

  /** Arco pequeño por encima de dos notas (tono «T» / semitono «st»). */
  function arcoT(parent, x1, x2, y, txt, o) {
    o = o || {};
    const G = N.group(parent, 'arcoT');
    const h = o.h || 24;
    N.el('path', { d: `M${x1},${y} Q${(x1 + x2) / 2},${y - h * 2} ${x2},${y}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round' }, G);
    texto(G, txt, (x1 + x2) / 2, y - h - 16, { anchor: 'middle', size: o.size || 26, peso: 800, fill: 'currentColor' });
    return G;
  }
  /** Mano plana con la palma hacia abajo, vista desde arriba, dedos hacia la izquierda.
   *  Origen (0,0) = punta del dedo corazón («la altura» de la mano). Mide ~250 × 100. */
  function mano(parent) {
    const G = N.group(parent, 'mano');
    const st = { fill: '#0b1628', stroke: 'currentColor', 'stroke-width': 3.2, 'stroke-linejoin': 'round' };
    N.el('path', Object.assign({ d: 'M150,26 C132,48 104,62 78,64 C64,65 60,54 70,48 C90,38 106,28 116,14 Z' }, st), G);   // pulgar (delante)
    const dedo = (x0, y0, x1, h) => N.el('rect', Object.assign({ x: x0, y: y0, width: x1 - x0, height: h, rx: h / 2 }, st), G);
    dedo(34, 17, 134, 14);    // meñique
    dedo(22, -34, 134, 16);   // índice
    dedo(10, 1, 134, 16);     // anular
    dedo(0, -17, 134, 17);    // corazón
    N.el('path', Object.assign({ d: 'M116,-38 C150,-45 196,-37 216,-29 L216,31 C192,41 150,43 116,37 C104,20 104,-22 116,-38 Z' }, st), G);   // dorso
    for (const yy of [-24, -8, 8, 22]) N.line(G, 124, yy, 138, yy, 2.4, { 'stroke-linecap': 'round', opacity: .55 });                  // nudillos
    N.el('rect', Object.assign({ x: 214, y: -31, width: 40, height: 64, rx: 7 }, st), G);                                             // puño de la manga
    return G;
  }

  // ================================================================ D · qué es un intervalo: número + especie
  function escenaDefinicion() {
    const a = F0('D1') - 0.2, b = F0('N1') + 0.2;
    escena('definicion', a, b, (s, g) => {
      const yM = 400, xP = 580;
      const P = N.group(g);
      aparece(s, P, F0('D1'), b - 0.2, { dy: 10 });
      pentaClave(P, xP, yM, 520);
      const x1 = 800, x2 = 960;
      nota(P, 'C4', x1, yM); nota(P, 'E4', x2, yM);
      const nm = N.group(P); nombreNota(nm, 'C', x1 + 22, yM + 150, { size: 32, anchor: 'middle' }); nombreNota(nm, 'E', x2 + 22, yM + 150, { size: 32, anchor: 'middle' });
      mostrarEn(s, nm, Wd('D1', 'dos') - 0.1, 1e9, .3);
      // la distancia
      const di = N.group(P); color(di, C.rosa);
      const yA = yNota('E4', yM), yB = yNota('C4', yM), xc = 1150;
      N.line(di, x2 + 56, yA, xc - 16, yA, 2, { 'stroke-dasharray': '4 7' });
      N.line(di, x1 + 56, yB, xc - 16, yB, 2, { 'stroke-dasharray': '4 7' });
      corchete(di, xc, yA, yB, { d: 14, w: 4 });
      texto(di, 'distancia', xc + 22, (yA + yB) / 2 + 10, { size: 32, peso: 800, fill: C.rosa });
      mostrarEn(s, di, Wd('D1', 'distancia') - 0.15, 1e9, .35);
      // nombre = número + especie
      const tNom = Wd('D2', 'nombre') - 0.15;
      const cab = texto(g, 'su nombre necesita dos datos', CX, 640, { anchor: 'middle', size: 30, peso: 700, fill: C.suave });
      aparece(s, cab, tNom, b - 0.2, { dy: 8 });
      const NU = N.group(g);
      panel(NU, 380, 680, 380, 230, { rx: 22 });
      texto(NU, 'NÚMERO', 570, 732, { anchor: 'middle', size: 30, peso: 800, ls: '0.14em', fill: C.rosa });
      texto(NU, '2ª · 3ª · 4ª · 5ª…', 570, 830, { anchor: 'middle', size: 36, peso: 700, fill: C.blanco });
      aparece(s, NU, Wd('D2', 'numero') - 0.2, b - 0.2, { dy: 12 });
      const ES = N.group(g);
      panel(ES, 820, 680, 720, 230, { rx: 22 });
      texto(ES, 'ESPECIE', 1180, 732, { anchor: 'middle', size: 30, peso: 800, ls: '0.14em', fill: C.rosa });
      aparece(s, ES, Wd('D3', 'especie') - 0.2, b - 0.2, { dy: 12 });
      const esp = [['M', 'Mayor', 'mayor'], ['m', 'menor', 'menor'], ['J', 'justo', 'justo'], ['A', 'aumentado', 'aumentado'], ['D', 'disminuido', 'disminuido']];
      esp.forEach(([l, w, pal], i) => {
        const G = N.group(ES);
        const x = 900 + i * 140;
        texto(G, l, x, 832, { anchor: 'middle', size: 58, peso: 800, fill: C.blanco });
        texto(G, w, x, 876, { anchor: 'middle', size: 22, peso: 600, fill: C.suave });
        const ta = Wd('D4', pal) - 0.12;
        aparece(s, G, ta, 1e9, { dy: 8, fi: .3 });
        resalta(s, G, ta, ta + 0.7, { d: .15 });
      });
    });
  }

  // ================================================================ N · el número: contar las notas (incluidas la primera y la última)
  function escenaNumero() {
    const a = F0('N1') - 0.1, b = F0('K1') + 0.2;
    escena('numero', a, b, (s, g) => {
      const ti = N.group(g); chip(ti, 'NÚMERO', CX, 260, { size: 28, anchor: 'middle' });
      pop(s, ti, F0('N1'), b - 0.2, CX, 260);
      const yM = 500, xP = 500;
      const P = N.group(g);
      aparece(s, P, F0('N1'), b - 0.2, { dy: 10 });
      pentaClave(P, xP, yM, 720);
      const xs = [760, 920, 1080], ns = ['C4', 'D4', 'E4'];
      const nDo = N.group(P); nota(nDo, 'C4', xs[0], yM);
      const nRe = N.group(P); nota(nRe, 'D4', xs[1], yM); color(nRe, C.suave);
      const nMi = N.group(P); nota(nMi, 'E4', xs[2], yM);
      const tCuenta = [Wd('N3', 'do'), Wd('N3', 're'), Wd('N3', 'mi')];
      mostrarEn(s, nRe, tCuenta[1] - 0.15, 1e9, .25);
      // primera y última
      [[nDo, 'C4', xs[0], 'primera'], [nMi, 'E4', xs[2], 'ultima']].forEach(([n, nn, x, pal]) => {
        const c = N.group(P); color(c, C.rosa);
        N.el('circle', { cx: x + 22, cy: yNota(nn, yM), r: 34, fill: 'none', stroke: 'currentColor', 'stroke-width': 3.5 }, c);
        texto(c, pal === 'primera' ? 'la primera' : 'la última', x + 22, yNota(nn, yM) + 72, { anchor: 'middle', size: 24, peso: 700, fill: C.rosa });
        const ta = Wd('N2', pal) - 0.15;
        s.on(t => opa(c, win(t, ta, tCuenta[0] - 0.2, .25, .3)));
        resalta(s, n, ta, null);
      });
      // 1 · 2 · 3 y los nombres
      xs.forEach((x, i) => {
        const nb = texto(P, String(i + 1), x + 22, yM - 110, { anchor: 'middle', size: 52, peso: 800, fill: C.rosa });
        mostrarEn(s, nb, tCuenta[i] - 0.1, 1e9, .2);
        const nm = N.group(P); nombreNota(nm, ns[i][0], x + 22, yM + 170, { size: 32, anchor: 'middle', fill: i === 1 ? C.suave : C.blanco });
        mostrarEn(s, nm, tCuenta[i] - 0.1, 1e9, .2);
      });
      const tres = texto(g, '3 notas', 1290, yM + 14, { size: 40, peso: 800, fill: C.blanco });
      aparece(s, tres, Wd('N4', 'tres') - 0.1, b - 0.2, { dy: 8 });
      const ter = N.group(g); chipInt(ter, '3ª', 1360, yM + 110, { size: 44 });
      pop(s, ter, Wd('N5', 'tercera') - 0.1, b - 0.2, 1360, yM + 110);
    });
  }

  // ================================================================ índice fijo arriba: los tres grupos de intervalos (se enciende el que toca)
  const GRUPOS = [
    { tit: '2ª · 3ª', sub: 'tonos y semitonos' },
    { tit: '4ª · 5ª · 8ª', sub: 'el apellido' },
    { tit: '6ª · 7ª', sub: 'la vuelta' },
  ];
  function escenaIndice() {
    const a = F0('K1') - 0.1, b = F0('Z1') + 0.3;
    escena('indice', a, b, (s, g) => {
      const tArriba = F0('G1') - 0.3;
      const tramos = [[F0('G1') - 0.2, F0('J1') - 0.2], [F0('J1') - 0.2, F0('X1') - 0.2], [F0('X1') - 0.2, F0('Z1')]];
      const tSub = [F0('G1'), Wd('J3', 'apellido') - 0.1, Wd('X2', 'vuelta') - 0.1];
      const wC = 500, gap = 40, x0 = CX - (3 * wC + 2 * gap) / 2, yC = 120, hC = 104;
      const TODO = N.group(g);
      // en K1 las tarjetas salen grandes en el centro; al empezar las segundas suben y se quedan de índice
      s.on(t => {
        const k = ease(ramp(t, tArriba, tArriba + 0.8));
        const sc = lerp(1.12, 1, k), dy = lerp(330, 0, k);
        TODO.setAttribute('transform', `translate(${CX},${(yC + dy).toFixed(1)}) scale(${sc.toFixed(4)}) translate(${-CX},${-yC})`);
      });
      GRUPOS.forEach((G0, i) => {
        const G = N.group(TODO);
        const x = x0 + i * (wC + gap);
        const r = panel(G, x, yC, wC, hC, { rx: 20 });
        const tt = texto(G, G0.tit, x + 34, yC + 60, { size: 40, peso: 800, fill: 'currentColor' });
        const sb = texto(G, G0.sub, x + wC - 30, yC + 60, { anchor: 'end', size: 26, peso: 700, italic: true, fill: C.suave });
        mostrarEn(s, sb, tSub[i], 1e9, .4);
        color(G, C.blanco);
        aparece(s, G, Wd('K1', 'tipo') - 0.2 + i * 0.3, b - 0.3, { dy: 12 });
        const [t0, t1] = tramos[i];
        s.on(t => {
          const on = win(t, t0, t1, .4, .4);
          const antes = t < tArriba ? 1 : 0;
          r.setAttribute('stroke', mezcla('#3a4556', C.rosa, on));
          r.setAttribute('stroke-width', (1.5 + 1.5 * on).toFixed(2));
          color(G, mezcla(C.suave, C.blanco, Math.max(on, antes)));
          tt.setAttribute('fill', mezcla(C.blanco, C.rosa, on));
        });
      });
      // A2: 2ª y 3ª de memoria… el resto, sin memorizar tonos
      const mem = N.group(g); chip(mem, '¡DE MEMORIA!', x0 + wC / 2, yC + hC + 42, { size: 22, anchor: 'middle', relleno: false });
      pop(s, mem, Wd('A2', 'memoria') - 0.15, F0('J1') - 0.2, x0 + wC / 2, yC + hC + 42);
      const sin = N.group(g); chip(sin, 'SIN CONTAR TONOS', x0 + wC + gap + wC + gap / 2, yC + hC + 42, { size: 22, anchor: 'middle', relleno: false, borde: C.blanco, colorTexto: C.blanco });
      pop(s, sin, Wd('A2', 'resto') - 0.1, F0('J1') - 0.2, x0 + wC + gap + wC + gap / 2, yC + hC + 42);
      // en K1: «la especie depende del tipo de intervalo»
      const k1 = texto(g, 'la especie depende del tipo de intervalo', CX, 720, { anchor: 'middle', size: 38, peso: 700, fill: C.blanco });
      aparece(s, k1, Wd('K1', 'depende') - 0.2, tArriba, { dy: 8 });
      const pp = texto(g, 'vamos por partes', CX, 790, { anchor: 'middle', size: 32, peso: 700, italic: true, fill: C.rosa });
      aparece(s, pp, Wd('K1', 'partes') - 0.2, tArriba, { dy: 6 });
    });
  }

  /** Dos paneles (izquierda / derecha) para comparar dos ejemplos. */
  function dosPaneles(s, g, tA, tB, tFin, tits) {
    const out = [];
    [[240, tA], [1000, tB]].forEach(([x, ta], i) => {
      const G = N.group(g);
      aparece(s, G, ta, tFin, { dy: 12 });
      panel(G, x, 300, 680, 590, { rx: 24 });
      out.push({ g: G, x, cx: x + 340 });
    });
    return out;
  }

  // ================================================================ G · segundas: 1 tono → M · 1 semitono → m
  function escenaSegundas() {
    const a = F0('G1') - 0.1, b = F0('T1') + 0.2;
    escena('segundas', a, b, (s, g) => {
      const [L, R] = dosPaneles(s, g, Wd('G2', 'tono') - 0.3, Wd('G3', 'semitono') - 0.3, b - 0.2);
      const reglaFila = (Pn, izq, dcha, tI, tD) => {
        const a1 = texto(Pn.g, izq, Pn.cx - 30, 372, { anchor: 'end', size: 38, peso: 800, fill: C.blanco });
        const fl = N.group(Pn.g); color(fl, C.suave); flecha(fl, Pn.cx - 10, 360, Pn.cx + 60, 360, { w: 4, cab: 14 });
        const a2 = texto(Pn.g, dcha, Pn.cx + 80, 374, { size: 44, peso: 800, fill: C.rosa });
        mostrarEn(s, a1, tI - 0.15, 1e9, .25); mostrarEn(s, fl, tD - 0.3, 1e9, .25); mostrarEn(s, a2, tD - 0.1, 1e9, .25);
        return { a1, a2 };
      };
      reglaFila(L, '1 tono', 'Mayor', Wd('G2', 'tono'), Wd('G2', 'mayor'));
      const rR = reglaFila(R, '1 semitono', 'menor', Wd('G3', 'semitono'), Wd('G3', 'menor'));
      const yM = 590;
      // Do–Re
      pentaClave(L.g, L.x + 50, yM, 580);
      const dx1 = L.x + 290, dx2 = L.x + 450;
      const pL = N.group(L.g); nota(pL, 'C4', dx1, yM); nota(pL, 'D4', dx2, yM);
      aparece(s, pL, Wd('G4', 'do') - 0.15, 1e9, { dy: 6 });
      destella(s, pL, S.SON_2 ? S.SON_2[0] : F0('SON_2') + 0.1);
      const aL = N.group(L.g); color(aL, C.rosa); arcoT(aL, dx1 + 22, dx2 + 22, yNota('D4', yM) - 38, 'T');
      mostrarEn(s, aL, Wd('G4', 'tono') - 0.15, 1e9, .25);
      parNotas(L.g, 'C', 'D', L.cx, yM + 170, { size: 34 });
      const c2M = N.group(L.g); chipInt(c2M, '2M', L.cx, 830, { size: 34 });
      pop(s, c2M, Wd('G4', 'segunda') - 0.1, 1e9, L.cx, 830);
      // Mi–Fa (y luego Mi–Fa♯: las alteraciones también influyen)
      pentaClave(R.g, R.x + 50, yM, 580);
      const ex1 = R.x + 290, ex2 = R.x + 450;
      const pR = N.group(R.g); nota(pR, 'E4', ex1, yM); nota(pR, 'F4', ex2, yM);
      aparece(s, pR, Wd('G5', 'mi') - 0.15, 1e9, { dy: 6 });
      destella(s, pR, S.SON_2 ? S.SON_2[1] : F0('SON_2') + 1.4);
      const tAlt = Wd('G7', 'alteraciones') - 0.2;
      const sos = N.group(R.g); N.glyph(sos, 'accidentalSharp', ex2 - (N.M.accidentalSharp.adv + 0.22) * SP, yNota('F4', yM), SP); color(sos, C.rosa);
      pop(s, sos, tAlt, 1e9, ex2 - 14, yNota('F4', yM), { k0: .4 });
      const aR = N.group(R.g); color(aR, C.rosa); arcoT(aR, ex1 + 22, ex2 + 22, yNota('F4', yM) - 38, 'st');
      s.on(t => opa(aR, win(t, Wd('G5', 'semitono') - 0.15, tAlt + 0.2, .25, .3)));
      const aR2 = N.group(R.g); color(aR2, C.rosa); arcoT(aR2, ex1 + 22, ex2 + 22, yNota('F4', yM) - 38, 'T');
      mostrarEn(s, aR2, tAlt + 0.3, 1e9, .3);
      const mem = texto(R.g, '¡sábetelo!', (ex1 + ex2) / 2 + 22, yNota('F4', yM) - 118, { anchor: 'middle', size: 26, peso: 700, italic: true, fill: C.suave });
      s.on(t => opa(mem, win(t, Wd('G5', 'saberse') - 0.1, tAlt, .3, .3)));
      const nR1 = parNotas(R.g, 'E', 'F', R.cx, yM + 170, { size: 34 });
      const nR2 = parNotas(R.g, 'E', 'F#', R.cx, yM + 170, { size: 34, fill: C.rosa });
      s.on(t => { const k = ease(ramp(t, tAlt + 0.2, tAlt + 0.5)); opa(nR1, 1 - k); opa(nR2, k); });
      const c2m = N.group(R.g); chipInt(c2m, '2ªm', R.cx, 830, { size: 34 });
      s.on(t => { const v = win(t, Wd('G6', 'segunda') - 0.1, tAlt + 0.4, .3, .3); opa(c2m, v); });
      const c2M2 = N.group(R.g); chipInt(c2M2, '2M', R.cx, 830, { size: 34 });
      pop(s, c2M2, tAlt + 0.5, 1e9, R.cx, 830);
      const inf = texto(g, '¡las alteraciones también cuentan!', CX, 268, { anchor: 'middle', size: 32, peso: 800, fill: C.rosa });
      aparece(s, inf, tAlt, b - 0.2, { dy: 6 });
    });
  }

  // ================================================================ T · terceras: 2 tonos → M · 1 tono + 1 semitono → m
  function escenaTerceras() {
    const a = F0('T1') - 0.1, b = F0('A1') + 0.2;
    escena('terceras', a, b, (s, g) => {
      const mas = texto(g, [['3ª', C.blanco], [' = 2ª + ', C.suave], ['1 tono', C.rosa]], CX, 268, { anchor: 'middle', size: 32, peso: 800 });
      aparece(s, mas, Wd('T2', 'mas') - 0.2, b - 0.2, { dy: 6 });
      const [L, R] = dosPaneles(s, g, Wd('T3', 'dos') - 0.3, Wd('T4', 'tono') - 0.3, b - 0.2);
      const reglaFila = (Pn, izq, dcha, tI, tD) => {
        const a1 = texto(Pn.g, izq, Pn.cx - 30, 372, { anchor: 'end', size: 36, peso: 800, fill: C.blanco });
        const fl = N.group(Pn.g); color(fl, C.suave); flecha(fl, Pn.cx - 10, 360, Pn.cx + 60, 360, { w: 4, cab: 14 });
        const a2 = texto(Pn.g, dcha, Pn.cx + 80, 374, { size: 44, peso: 800, fill: C.rosa });
        mostrarEn(s, a1, tI - 0.15, 1e9, .25); mostrarEn(s, fl, tD - 0.3, 1e9, .25); mostrarEn(s, a2, tD - 0.1, 1e9, .25);
      };
      reglaFila(L, '2 tonos', 'Mayor', Wd('T3', 'dos'), Wd('T3', 'mayor'));
      reglaFila(R, '1 tono + 1 st', 'menor', Wd('T4', 'tono'), Wd('T4', 'menor'));
      const yM = 600;
      const ejemplo = (Pn, n1, n2, n3, tNotas, tArcos, labs, par, chipTxt, tChip, tSon) => {
        pentaClave(Pn.g, Pn.x + 50, yM, 580);
        const xs = [Pn.x + 250, Pn.x + 380, Pn.x + 510];
        const ext = N.group(Pn.g); nota(ext, n1, xs[0], yM); nota(ext, n3, xs[2], yM);
        aparece(s, ext, tNotas - 0.15, 1e9, { dy: 6 });
        destella(s, ext, tSon);
        const med = N.group(Pn.g); nota(med, n2, xs[1], yM); color(med, C.suave);
        mostrarEn(s, med, tArcos[0] - 0.2, 1e9, .25);
        [0, 1].forEach(i => {
          const ar = N.group(Pn.g); color(ar, labs[i] === 'st' ? C.rosa : C.blanco);
          arcoT(ar, xs[i] + 22, xs[i + 1] + 22, Math.min(yNota(i ? n2 : n1, yM), yNota(i ? n3 : n2, yM)) - 36, labs[i], { h: 20 });
          mostrarEn(s, ar, tArcos[i] - 0.1, 1e9, .25);
        });
        parNotas(Pn.g, par[0], par[1], Pn.cx, yM + 170, { size: 34 });
        const c = N.group(Pn.g); chipInt(c, chipTxt, Pn.cx, 830, { size: 34 });
        pop(s, c, tChip - 0.1, 1e9, Pn.cx, 830);
      };
      ejemplo(L, 'C4', 'D4', 'E4', Wd('T5', 'do'), [Wd('T5', 're'), Wd('T5', 'mi', 2)], ['T', 'T'], ['C', 'E'], '3M', Wd('T6', 'tercera'), S.SON_3 ? S.SON_3[0] : F0('SON_3') + 0.1);
      ejemplo(R, 'D4', 'E4', 'F4', Wd('T7', 're'), [Wd('T8', 'tono'), Wd('T8', 'semitono')], ['T', 'st'], ['D', 'F'], '3ªm', Wd('T8', 'tercera'), S.SON_3 ? S.SON_3[1] : F0('SON_3') + 1.4);
    });
  }

  // ================================================================ A · más grande que Mayor → aumentado · más pequeño que menor → disminuido
  function escenaAumDis() {
    const a = F0('A1') - 0.1, b = F0('J1') + 0.2;
    escena('aumdis', a, b, (s, g) => {
      const tit = texto(g, 'segundas y terceras', CX, 330, { anchor: 'middle', size: 34, peso: 700, fill: C.suave });
      aparece(s, tit, Wd('A1', 'segunda') - 0.2, b - 0.2, { dy: 6 });
      const xs = [520, 820, 1100, 1400], y = 560;
      const L = [['D', 'disminuido', 44], ['m', 'menor', 74], ['M', 'Mayor', 104], ['A', 'aumentado', 134]];
      const tA = Wd('A1', 'aumentado') - 0.15, tD = Wd('A1', 'disminuido') - 0.15;
      const tIn = [tD, Wd('A1', 'segunda') - 0.1, Wd('A1', 'segunda') - 0.1, tA];
      L.forEach(([l, w, alto], i) => {
        const G = N.group(g);
        const barra = N.el('rect', { x: xs[i] - 55, y: y + 100 - alto, width: 110, height: alto, rx: 10, fill: 'currentColor', opacity: .85 }, G);
        texto(G, l, xs[i], y - 20, { anchor: 'middle', size: 90, peso: 800, fill: 'currentColor' });
        texto(G, w, xs[i], y + 148, { anchor: 'middle', size: 26, peso: 600, fill: C.suave });
        color(G, (i === 0 || i === 3) ? C.rosa : C.blanco);
        aparece(s, G, tIn[i], b - 0.2, { dy: 10 });
      });
      const fA = N.group(g); color(fA, C.rosa); arco(fA, xs[2] + 50, y - 110, xs[3] - 40, y - 110, 50, { w: 4 });
      texto(fA, 'más grande', (xs[2] + xs[3]) / 2, y - 190, { anchor: 'middle', size: 28, peso: 700, italic: true, fill: C.rosa });
      mostrarEn(s, fA, Wd('A1', 'grande') - 0.15, b - 0.2, .3);
      const fD = N.group(g); color(fD, C.rosa); arco(fD, xs[1] - 50, y - 110, xs[0] + 40, y - 110, 50, { w: 4 });
      texto(fD, 'más pequeño', (xs[0] + xs[1]) / 2, y - 190, { anchor: 'middle', size: 28, peso: 700, italic: true, fill: C.rosa });
      mostrarEn(s, fD, Wd('A1', 'debajo') - 0.15, b - 0.2, .3);
      // A2: con 2ª y 3ª de memoria, el resto sin memorizar
      const m1 = texto(g, [['2ª y 3ª', C.rosa], [' de memoria…', C.blanco]], CX, 820, { anchor: 'middle', size: 38, peso: 800 });
      aparece(s, m1, Wd('A2', 'memoria') - 0.2, b - 0.2, { dy: 8 });
      const m2 = texto(g, '…y el resto, sin contar tonos', CX, 880, { anchor: 'middle', size: 34, peso: 700, italic: true, fill: C.suave });
      aparece(s, m2, Wd('A2', 'resto') - 0.2, b - 0.2, { dy: 8 });
    });
  }

  // ================================================================ J · cuartas, quintas y octavas: el apellido
  function escenaApellido() {
    const a = F0('J1') - 0.1, b = F0('R1') + 0.2;
    escena('apellido', a, b, (s, g) => {
      const tJ4 = F0('J4') - 0.2;
      const tr = N.group(g); chip(tr, 'TRUCO', CX, 290, { size: 26, anchor: 'middle' });
      pop(s, tr, Wd('J2', 'truco') - 0.1, tJ4, CX, 290);
      // Fa♯: nombre y apellido
      const AP = N.group(g);
      aparece(s, AP, Wd('J3', 'apellido') - 0.3, tJ4, { dy: 10 });
      const size = 150, sa = size * 0.36;
      const nn = texto(AP, 'Fa', 0, 0, { size, peso: 800, fill: C.blanco });
      const wt = D.medir(nn), wa = N.M.accidentalSharp.adv * sa;
      const x0 = CX - (wt + size * 0.08 + wa) / 2, yN = 600;
      nn.setAttribute('x', x0.toFixed(1)); nn.setAttribute('y', yN);
      const sh = N.group(AP); N.glyph(sh, 'accidentalSharp', x0 + wt + size * 0.08, yN - size * 0.33, sa); color(sh, C.rosa);
      const xSh = x0 + wt + size * 0.08;
      texto(AP, 'nombre', xSh - 40, yN + 80, { anchor: 'end', size: 32, peso: 700, fill: C.suave });
      const lA = texto(AP, 'apellido', xSh - 4, yN + 80, { size: 32, peso: 800, fill: C.rosa });
      const lA2 = texto(AP, '= su alteración', xSh - 4, yN + 124, { size: 26, peso: 600, italic: true, fill: C.suave });
      mostrarEn(s, lA2, Wd('J3', 'alteraciones') - 0.15, 1e9, .3);
      s.on(t => { const k = win(t, Wd('J3', 'apellido') - 0.1, Wd('J3', 'apellido') + 1.2, .2, .4); lA.setAttribute('font-size', (32 + 8 * k).toFixed(1)); });
      // J4–J6: las dos se apellidan igual → justas
      const yM = 560;
      const E = N.group(g);
      aparece(s, E, tJ4 + 0.1, b - 0.2, { dy: 0 });
      pentaClave(E, 250, yM, 1420);
      const pares = [
        { n: ['D4', 'A4'], x: 560, lab: 'naturales', pal: 'naturales', c: '5J' },
        { n: ['F#4', 'C#5'], x: 960, lab: 'con ♯', pal: 'sostenido', c: '5J' },
        { n: ['Eb4', 'Ab4'], x: 1360, lab: 'con ♭', pal: 'bemol', c: '4J' },
      ];
      const tJus = Wd('J6', 'justas') - 0.1;
      pares.forEach(p => {
        const G = N.group(E);
        const r1 = nota(G, p.n[0], p.x, yM), r2 = nota(G, p.n[1], p.x + 160, yM);
        [r1, r2].forEach(r => { if (r.alt) color(r.alt, C.rosa); });
        const ta = Wd('J5', p.pal) - 0.25;
        aparece(s, G, ta, 1e9, { dy: 8 });
        const nm = N.group(E);
        parNotas(nm, p.n[0].slice(0, -1), p.n[1].slice(0, -1), p.x + 102, yM + 150, { size: 32 });
        mostrarEn(s, nm, ta + 0.1, 1e9, .3);
        const lb = N.group(E);
        const lt = p.lab === 'naturales' ? 'las dos naturales' : ('las dos ' + p.lab);
        if (p.lab === 'naturales') texto(lb, lt, p.x + 102, yM - 130, { anchor: 'middle', size: 26, peso: 700, italic: true, fill: C.suave });
        else {
          const t1 = texto(lb, 'las dos ', 0, yM - 130, { size: 26, peso: 700, italic: true, fill: C.suave });
          const w1 = D.medir(t1), gl = p.lab === 'con ♯' ? 'accidentalSharp' : 'accidentalFlat';
          const t0 = texto(lb, 'con', 0, yM - 130, { size: 26, peso: 700, italic: true, fill: C.suave }); const w0 = D.medir(t0);
          const wg = N.M[gl].adv * 10;
          const xx = p.x + 102 - (w1 + 9 + w0 + 8 + wg) / 2;
          t1.setAttribute('x', xx.toFixed(1)); t0.setAttribute('x', (xx + w1 + 9).toFixed(1));
          const gg = N.group(lb); N.glyph(gg, gl, xx + w1 + 9 + w0 + 8, yM - 138, 10); color(gg, C.rosa);
        }
        mostrarEn(s, lb, ta + 0.1, 1e9, .3);
        const c = N.group(E); chipInt(c, p.c, p.x + 102, yM + 240, { size: 34 });
        pop(s, c, tJus, 1e9, p.x + 102, yM + 240);
      });
      const igual = texto(g, 'se apellidan igual', CX, 300, { anchor: 'middle', size: 36, peso: 800, fill: C.blanco });
      aparece(s, igual, Wd('J4', 'apellidan') - 0.2, Wd('J7', 'aqui') - 0.3, { dy: 6 });
      const jus = texto(g, '→ justas', CX + 180, 300, { size: 36, peso: 800, fill: C.rosa });
      s.on(t => { opa(jus, win(t, tJus, Wd('J7', 'aqui') - 0.3, .3, .3)); igual.setAttribute('x', (CX - 90 * ease(ramp(t, tJus - 0.3, tJus + 0.1))).toFixed(1)); });
      // J7: ni Mayor ni menor
      const ni = N.group(g);
      aparece(s, ni, Wd('J7', 'aqui') - 0.2, b - 0.2, { dy: 6 });
      texto(ni, 'ni', CX - 150, 312, { anchor: 'middle', size: 34, peso: 700, fill: C.suave });
      const cM = N.group(ni); chipInt(cM, 'M', CX - 70, 300, { size: 30, relleno: false, borde: C.blanco, colorTexto: C.blanco });
      texto(ni, 'ni', CX + 20, 312, { anchor: 'middle', size: 34, peso: 700, fill: C.suave });
      const cm = N.group(ni); chipInt(cm, 'm', CX + 100, 300, { size: 30, relleno: false, borde: C.blanco, colorTexto: C.blanco });
      const x1 = N.group(ni); N.line(x1, CX - 96, 322, CX - 44, 278, 5, { 'stroke-linecap': 'round' }); color(x1, C.rojo); mostrarEn(s, x1, Wd('J7', 'mayor') - 0.05, 1e9, .2);
      const x2 = N.group(ni); N.line(x2, CX + 74, 322, CX + 126, 278, 5, { 'stroke-linecap': 'round' }); color(x2, C.rojo); mostrarEn(s, x2, Wd('J7', 'menor') - 0.05, 1e9, .2);
    });
  }

  // ================================================================ R · la pareja rebelde: Fa–Si (4A) y Si–Fa (5D)
  function escenaRebelde() {
    const a = F0('R1') - 0.1, b = F0('M1') + 0.2;
    escena('rebelde', a, b, (s, g) => {
      const pr = N.group(g); chip(pr, 'PAREJA REBELDE', CX - 150, 272, { size: 26, anchor: 'middle', relleno: false });
      pop(s, pr, Wd('R1', 'pareja') - 0.1, b - 0.2, CX - 150, 272);
      const yM = 560;
      const E = N.group(g);
      aparece(s, E, Wd('R1', 'fasi') - 0.3, b - 0.2, { dy: 0 });
      pentaClave(E, 380, yM, 1160);
      const pares = [
        { n: ['F4', 'B4'], x: 640, t: Wd('R1', 'fasi') - 0.1, c: '4A', tc: Wd('R2', 'aumentada') - 0.1, cmp: '4A > 4J', tcmp: Wd('R6', 'grande') - 0.1, txt: 'demasiado grande' },
        { n: ['B4', 'F5'], x: 1060, t: Wd('R3', 'sifa') - 0.1, c: '5D', tc: Wd('R3', 'disminuida') - 0.1, cmp: '5D < 5J', tcmp: Wd('R7', 'pequena') - 0.1, txt: 'demasiado pequeña' },
      ];
      pares.forEach(p => {
        const G = N.group(E); nota(G, p.n[0], p.x, yM); nota(G, p.n[1], p.x + 170, yM); color(G, C.rosa);
        pop(s, G, p.t, 1e9, p.x + 100, yM, { k0: .6 });
        const nm = N.group(E); parNotas(nm, p.n[0][0], p.n[1][0], p.x + 107, yM + 150, { size: 34 });
        mostrarEn(s, nm, p.t, 1e9, .3);
        const c = N.group(E); chipInt(c, p.c, p.x + 107, yM + 235, { size: 36 });
        pop(s, c, p.tc, 1e9, p.x + 107, yM + 235);
        const cm = texto(E, p.cmp, p.x + 107, yM + 320, { anchor: 'middle', size: 34, peso: 800, fill: C.blanco });
        mostrarEn(s, cm, p.tcmp, 1e9, .3);
        const cm2 = texto(E, p.txt, p.x + 107, yM + 360, { anchor: 'middle', size: 24, peso: 600, italic: true, fill: C.suave });
        mostrarEn(s, cm2, p.tcmp + 0.2, 1e9, .3);
        // «tres tonos»
        const tt = N.group(E); color(tt, C.rosa);
        const ya = yM - 150;
        N.el('path', { d: `M${p.x + 10},${ya + 20} Q${p.x + 10},${ya} ${p.x + 50},${ya} H${p.x + 164} Q${p.x + 204},${ya} ${p.x + 204},${ya + 20}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, tt);
        texto(tt, '3 tonos', p.x + 107, ya - 18, { anchor: 'middle', size: 30, peso: 800, fill: C.rosa });
        mostrarEn(s, tt, Wd('R5', 'tres') - 0.1, 1e9, .3);
      });
      const mem = N.group(g); chip(mem, '¡DE MEMORIA!', CX + 150, 272, { size: 24, anchor: 'middle' });
      pop(s, mem, Wd('R4', 'memoria') - 0.1, b - 0.2, CX + 150, 272);
      const dif = texto(g, 'diferentes a todas las demás', CX, 450, { anchor: 'middle', size: 30, peso: 700, italic: true, fill: C.suave });
      s.on(t => opa(dif, win(t, Wd('R5', 'diferentes') - 0.15, Wd('R5', 'tres') - 0.3, .3, .3)));
    });
  }

  // ================================================================ M · si no se apellidan igual: el truco de las manos
  function escenaManos() {
    const a = F0('M1') - 0.1, b = F0('P1') + 0.2;
    escena('manos', a, b, (s, g) => {
      const tM4 = Wd('M4', 'truco') - 0.3;
      // pentagrama a la izquierda: Do–Sol (5J)
      const yM = 560, xDo = 420, xSol = 590;
      const E = N.group(g);
      aparece(s, E, F0('M1'), b - 0.2, { dy: 8 });
      pentaClave(E, 200, yM, 600);
      nota(E, 'C4', xDo, yM); nota(E, 'G4', xSol, yM);
      const nmE = N.group(E); parNotas(nmE, 'C', 'G', 507, yM + 150, { size: 32 });
      // M1: el Sol cambia de apellido (♯) → ?
      const tDist = Wd('M1', 'no') - 0.1;
      const sM1 = N.group(E); N.glyph(sM1, 'accidentalSharp', xSol - (N.M.accidentalSharp.adv + 0.22) * SP, yNota('G4', yM), SP); color(sM1, C.rosa);
      s.on(t => opa(sM1, win(t, tDist, tM4, .25, .3)));
      const q = N.group(E); interrogacion(q, 880, yM + 36, 120);
      s.on(t => opa(q, win(t, Wd('M1', 'distinta') - 0.2, tM4, .3, .3)));
      // M2–M3: la justa se estira (A) o se encoge (D)
      const EL = N.group(g);
      aparece(s, EL, Wd('M2', 'justa') - 0.3, tM4, { dy: 8 });
      const xE = 1260, yC0 = 560, h0 = 150;
      const brazo = N.el('path', { d: '', fill: 'none', stroke: 'currentColor', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, EL);
      const et = texto(EL, '5J', xE + 60, yC0 + 16, { size: 48, peso: 800, fill: C.blanco });
      const tEst = Wd('M2', 'estirado') - 0.1, tEnc = Wd('M2', 'encogido') - 0.1;
      const cA = N.group(EL); chipInt(cA, 'A · aumentada', xE + 420, yC0 - 80, { size: 28 });
      const cD = N.group(EL); chipInt(cD, 'D · disminuida', xE + 420, yC0 + 80, { size: 28 });
      mostrarEn(s, cA, Wd('M3', 'aumentada') - 0.1, 1e9, .25); mostrarEn(s, cD, Wd('M3', 'disminuida') - 0.1, 1e9, .25);
      s.on(t => {
        const kE = win(t, tEst, tEnc, .35, .3), kC = win(t, tEnc, Wd('M3', 'aumentada') - 0.1, .3, .3);
        const h = h0 + 70 * kE - 60 * kC;
        brazo.setAttribute('d', `M${xE - 18},${yC0 - h} H${xE} V${yC0 + h} H${xE - 18}`);
        color(EL, mezcla(C.blanco, C.rosa, Math.max(kE, kC)));
        et.textContent = kE > 0.5 ? 'estirada' : (kC > 0.5 ? 'encogida' : '5J');
      });
      // M4–M7: las manos
      const H = N.group(g);
      aparece(s, H, tM4, b - 0.2, { dy: 10 });
      const xM = 1150, yUp = 420, yLo = 700, DY = 46;
      const nomUp = N.group(H), nomLo = N.group(H);
      nombreNota(nomUp, 'G', xM - 30, yUp + 12, { size: 38, anchor: 'end', fill: C.blanco });
      nombreNota(nomLo, 'C', xM - 30, yLo + 12, { size: 38, anchor: 'end', fill: C.blanco });
      const mUp = N.group(H), mLo = N.group(H);
      mano(mUp); mano(mLo);
      const xB = xM + 300;
      const br = N.el('path', { d: '', fill: 'none', stroke: 'currentColor', 'stroke-width': 4, 'stroke-linecap': 'round' }, H);
      const lab5J = texto(H, '5J', xB + 30, 570, { size: 50, peso: 800, fill: C.blanco });
      // los cuatro casos: [inicio, fin, mano ('up'/'lo'), alteración, desplazamiento, resultado, texto]
      const t5 = Wd('M5', 'moviendo') - 0.1, t6 = F0('M6') - 0.15, tb = F0('MANOS'), tq = F0('M7') - 0.1;
      const CASOS = [
        { t0: t5, t1: t6, m: 'up', alt: '#', dy: -DY, res: '5A', txt: '♯ arriba · sube · MÁS GRANDE' },
        { t0: t6, t1: 0, m: 'lo', alt: '#', dy: -DY, res: '5D', txt: '♯ abajo · sube · MÁS PEQUEÑO' },
        { t0: 0, t1: 0, m: 'up', alt: 'b', dy: DY, res: '5D', txt: '♭ arriba · baja · MÁS PEQUEÑO' },
        { t0: 0, t1: tq, m: 'lo', alt: 'b', dy: DY, res: '5A', txt: '♭ abajo · baja · MÁS GRANDE' },
      ];
      { const paso = (tq - t6) / 3; CASOS[1].t1 = CASOS[2].t0 = t6 + paso; CASOS[2].t1 = CASOS[3].t0 = t6 + 2 * paso; }
      const kCaso = (t, c) => Math.min(ease(ramp(t, c.t0 + 0.25, c.t0 + 0.75)), 1 - ease(ramp(t, c.t1 - 0.35, c.t1)));
      CASOS.forEach(c => {
        // alteración en el pentagrama y junto al nombre
        const nn = c.m === 'up' ? 'G4' : 'C4', xn = c.m === 'up' ? xSol : xDo, gl = c.alt === '#' ? 'accidentalSharp' : 'accidentalFlat';
        const aP = N.group(E); N.glyph(aP, gl, xn - (N.M[gl].adv + 0.22) * SP, yNota(nn, yM), SP); color(aP, C.rosa);
        const aN = N.group(H); color(aN, C.rosa);
        c.aN = aN; c.aP = aP;
        N.glyph(aN, gl, xM - 22, (c.m === 'up' ? yUp : yLo) + 2, 14);
        const lr = texto(H, c.res, xB + 30, 570, { size: 50, peso: 800, fill: C.rosa });
        const cap = texto(H, c.txt, xM + 130, 880, { anchor: 'middle', size: 30, peso: 800, fill: C.rosa });
        c.lr = lr; c.cap = cap;
      });
      s.on(t => {
        let dUp = 0, dLo = 0, kMax = 0;
        CASOS.forEach(c => {
          const k = kCaso(t, c);
          const vAlt = Math.min(ease(ramp(t, c.t0, c.t0 + 0.25)), 1 - ease(ramp(t, c.t1 - 0.35, c.t1)));
          opa(c.aP, vAlt); opa(c.aN, vAlt);
          opa(c.lr, ease(ramp(k, 0.6, 1))); opa(c.cap, ease(ramp(k, 0.3, 1)));
          if (c.m === 'up') dUp += c.dy * k; else dLo += c.dy * k;
          kMax = Math.max(kMax, k);
          // la mano que se mueve, en rosa
          if (k > 0.02) color(c.m === 'up' ? mUp : mLo, mezcla(C.blanco, C.rosa, k));
        });
        if (kMax <= 0.02) { color(mUp, C.blanco); color(mLo, C.blanco); }
        const yu = yUp + dUp, yl = yLo + dLo;
        mUp.setAttribute('transform', `translate(${xM},${yu.toFixed(1)})`);
        mLo.setAttribute('transform', `translate(${xM},${yl.toFixed(1)})`);
        nomUp.setAttribute('transform', `translate(0,${dUp.toFixed(1)})`);
        nomLo.setAttribute('transform', `translate(0,${dLo.toFixed(1)})`);
        CASOS.forEach(c => { c.aN.setAttribute('transform', `translate(0,${(c.m === 'up' ? dUp : dLo).toFixed(1)})`); });
        br.setAttribute('d', `M${xB - 16},${yu.toFixed(1)} H${xB} V${yl.toFixed(1)} H${xB - 16}`);
        opa(lab5J, 1 - ease(ramp(kMax, 0.4, 0.8)));
      });
      // M7: la pregunta
      const tG = Wd('M7', 'grande') - 0.15, tP = Wd('M7', 'pequeno') - 0.15;
      const preg = texto(g, '¿la alteración hace el intervalo…', CX, 300, { anchor: 'middle', size: 36, peso: 800, fill: C.blanco });
      aparece(s, preg, Wd('M7', 'alteracion') - 0.3, b - 0.2, { dy: 6 });
      const g1 = N.group(g); chip(g1, 'MÁS GRANDE → A', 700, 960 - 40, { size: 28, anchor: 'middle' });
      pop(s, g1, tG, b - 0.2, 700, 920);
      const g2 = N.group(g); chip(g2, 'MÁS PEQUEÑO → D', 1220, 960 - 40, { size: 28, anchor: 'middle' });
      pop(s, g2, tP, b - 0.2, 1220, 920);
    });
  }

  // ================================================================ P · el matiz fino de la pareja rebelde (se equilibra)
  function escenaMatiz() {
    const a = F0('P1') - 0.1, b = F0('O1') + 0.2;
    escena('matiz', a, b, (s, g) => {
      const pr = N.group(g); chip(pr, 'PAREJA REBELDE · MATIZ FINO', CX, 262, { size: 24, anchor: 'middle', relleno: false });
      pop(s, pr, Wd('P1', 'matiz') - 0.1, b - 0.2, CX, 262);
      const [L, R] = dosPaneles(s, g, F0('P2') - 0.2, F0('P4') - 0.2, b - 0.2);
      const yM = 560;
      const caso = (Pn, n1, n2, alt, tAlt, verbo, tVerbo, c0, c1, tC1, dir) => {
        pentaClave(Pn.g, Pn.x + 40, yM, 470);
        const x1 = Pn.x + 260, x2 = Pn.x + 400;
        const G = N.group(Pn.g); nota(G, n1, x1, yM); nota(G, n2, x2, yM);
        const gl = alt === '#' ? 'accidentalSharp' : 'accidentalFlat';
        const aG = N.group(Pn.g); N.glyph(aG, gl, x2 - (N.M[gl].adv + 0.22) * SP, yNota(n2, yM), SP); color(aG, C.rosa);
        pop(s, aG, tAlt, 1e9, x2 - 14, yNota(n2, yM), { k0: .4 });
        const fv = N.group(Pn.g); color(fv, C.rosa);
        const yv = yNota(n2, yM);
        const sube = alt === '#';
        const xf = Pn.x + 580;
        flecha(fv, xf, yv + (sube ? 30 : -40), xf, yv + (sube ? -40 : 30), { w: 4, cab: 14 });
        texto(fv, verbo, xf, yv + (sube ? 72 : -60), { anchor: 'middle', size: 28, peso: 800, fill: C.rosa });
        mostrarEn(s, fv, tVerbo, 1e9, .3);
        const n1s = parNotas(Pn.g, n1[0], n2[0], x1 + 92, yM + 160, { size: 32 });
        const n2s = parNotas(Pn.g, n1[0], n2[0] + (alt === '#' ? '#' : 'b'), x1 + 92, yM + 160, { size: 32, fill: C.rosa });
        s.on(t => { const k = ease(ramp(t, tAlt, tAlt + 0.3)); opa(n1s, 1 - k); opa(n2s, k); });
        const ca = N.group(Pn.g); chipInt(ca, c0, Pn.cx, 820, { size: 34, relleno: false, borde: C.blanco, colorTexto: C.blanco });
        s.on(t => opa(ca, 1 - ease(ramp(t, tC1 - 0.2, tC1 + 0.1))));
        const cb = N.group(Pn.g); chipInt(cb, c1, Pn.cx, 820, { size: 34 });
        pop(s, cb, tC1, 1e9, Pn.cx, 820);
      };
      caso(L, 'F4', 'B4', 'b', Wd('P2', 'bemol') - 0.2, 'encoger', Wd('P2', 'encoges') - 0.1, '4A', '4J', Wd('P3', 'justa') - 0.1, 1);
      caso(R, 'B4', 'F5', '#', Wd('P5', 'sostenido') - 0.2, 'estirar', Wd('P5', 'estiras') - 0.1, '5D', '5J', Wd('P6', 'quinta') - 0.1, -1);
      const eq = texto(g, 'se equilibra', 580, 950 - 30, { anchor: 'middle', size: 30, peso: 700, italic: true, fill: C.suave });
      aparece(s, eq, Wd('P3', 'equilibra') - 0.2, b - 0.2, { dy: 6 });
    });
  }

  // ================================================================ O · octavas: sin excepciones
  function escenaOctavas() {
    const a = F0('O1') - 0.1, b = F0('X1') + 0.2;
    escena('octavas', a, b, (s, g) => {
      const yM = 560;
      const E = N.group(g);
      aparece(s, E, F0('O1'), b - 0.2, { dy: 10 });
      pentaClave(E, 300, yM, 1320);
      const pares = [['C4', 'C5', 560], ['F#4', 'F#5', 960], ['Eb4', 'Eb5', 1360]];
      pares.forEach(([n1, n2, x], i) => {
        const G = N.group(E); const r1 = nota(G, n1, x, yM), r2 = nota(G, n2, x + 150, yM);
        [r1, r2].forEach(r => { if (r.alt) color(r.alt, C.rosa); });
        aparece(s, G, Wd('O1', 'octavas') - 0.1 + i * 0.25, 1e9, { dy: 8 });
        const c = N.group(E); chipInt(c, '8J', x + 97, yM + 200, { size: 34 });
        pop(s, c, Wd('O1', 'apellidan') - 0.1 + i * 0.12, 1e9, x + 97, yM + 200);
      });
      const sx = N.group(g); chip(sx, 'SIN EXCEPCIONES', CX, 300, { size: 26, anchor: 'middle', relleno: false });
      pop(s, sx, Wd('O1', 'excepciones') - 0.1, b - 0.2, CX, 300);
      const ig = texto(g, 'se apellidan igual → justa', CX, 380, { anchor: 'middle', size: 34, peso: 800, fill: C.blanco });
      aparece(s, ig, Wd('O1', 'apellidan') - 0.2, b - 0.2, { dy: 6 });
    });
  }

  // ================================================================ X · sextas y séptimas: les damos la vuelta
  function escenaVuelta() {
    const a = F0('X1') - 0.1, b = F0('X5') + 0.2;
    escena('vuelta', a, b, (s, g) => {
      const tX3 = F0('X3') - 0.1;
      const big = N.group(g);
      s.on(t => opa(big, win(t, Wd('X1', 'sextas') - 0.2, tX3, .35, .35)));
      const s6 = texto(big, '6ª', CX - 170, 560, { anchor: 'middle', size: 150, peso: 800, fill: C.blanco });
      const s7 = texto(big, '7ª', CX + 170, 560, { anchor: 'middle', size: 150, peso: 800, fill: C.blanco });
      mostrarEn(s, s7, Wd('X1', 'septimas') - 0.15, 1e9, .3);
      // «contar tantos tonos sería un lío»
      const lio = N.group(g);
      s.on(t => opa(lio, win(t, Wd('X2', 'contar') - 0.1, tX3, .3, .3)));
      texto(lio, 'T · T · st · T · T · …', CX, 700, { anchor: 'middle', size: 40, peso: 700, fill: C.suave });
      const xl = N.group(lio); aspa(xl, CX + 250, 690, 26, 7); color(xl, C.rojo);
      mostrarEn(s, xl, Wd('X2', 'lio') - 0.1, 1e9, .2);
      const vu = N.group(g); color(vu, C.rosa);
      arco(vu, CX - 90, 330, CX + 90, 330, 60, { w: 5 }); arco(vu, CX + 90, 372, CX - 90, 372, -60, { w: 5 });
      s.on(t => opa(vu, win(t, Wd('X2', 'vuelta') - 0.2, tX3, .3, .3)));
      // X3: 6ª → 3ª · 7ª → 2ª
      const filas = [['6ª', '3ª', Wd('X3', 'sextas') - 0.15, Wd('X3', 'terceras') - 0.15, 470], ['7ª', '2ª', Wd('X3', 'septimas') - 0.15, Wd('X3', 'segundas') - 0.15, 650]];
      filas.forEach(([de, a1, ta, tb, y]) => {
        const G = N.group(g);
        aparece(s, G, ta, b - 0.2, { dy: 10 });
        panel(G, CX - 360, y - 90, 720, 150, { rx: 22 });
        texto(G, de, CX - 200, y + 30, { anchor: 'middle', size: 96, peso: 800, fill: C.blanco });
        const fl = N.group(G); color(fl, C.rosa);
        arco(fl, CX - 90, y - 20, CX + 90, y - 20, 36, { w: 5 }); arco(fl, CX + 90, y + 20, CX - 90, y + 20, -36, { w: 5 });
        const r = texto(G, a1, CX + 200, y + 30, { anchor: 'middle', size: 96, peso: 800, fill: C.rosa });
        mostrarEn(s, fl, tb - 0.3, 1e9, .3); mostrarEn(s, r, tb, 1e9, .3);
      });
      // X4: el vídeo de inversión de intervalos
      const V = N.group(g);
      aparece(s, V, Wd('X4', 'video') - 0.2, b - 0.2, { dy: 8 });
      panel(V, 1330, 830, 460, 96, { rx: 18, stroke: C.rosa, sw: 2 });
      N.el('rect', { x: 1352, y: 852, width: 52, height: 52, rx: 12, fill: C.rosa }, V);
      N.el('path', { d: 'M1370,866 v24 l20,-12 z', fill: '#fff' }, V);
      texto(V, 'VÍDEO', 1424, 870, { size: 18, peso: 800, ls: '0.18em', fill: C.rosa });
      texto(V, 'Inversión de intervalos', 1424, 902, { size: 28, peso: 800, fill: C.blanco });
    });
  }

  /** Ejemplo de «darle la vuelta»: intervalo → se invierte → se analiza → especie contraria. */
  function ejemploVuelta(s, g, o) {
    const G = N.group(g);
    aparece(s, G, o.tIni, o.tFin, { dy: 10 });
    panel(G, o.x, 300, 780, 610, { rx: 24 });
    const yM = 540;
    pentaClave(G, o.x + 40, yM, 700);
    const xa = o.x + 230, xb = o.x + 360, xc = o.x + 520, xd = o.x + 650;
    const ori = N.group(G); nota(ori, o.n[0], xa, yM); nota(ori, o.n[1], xb, yM);
    const tOri = o.tNotas;
    resalta(s, ori, o.tFinal - 0.1, null);
    // la vuelta: la nota de abajo sube una octava → par nuevo a la derecha
    const inv = N.group(G); nota(inv, o.n[1], xc, yM); nota(inv, o.inv, xd, yM); color(inv, C.rosa);
    mostrarEn(s, inv, o.tVuelta, 1e9, .35);
    const fl = N.group(G); color(fl, C.suave); flecha(fl, xb + 70, yM + 70, xc - 20, yM + 70, { w: 4, cab: 14 });
    mostrarEn(s, fl, o.tVuelta - 0.2, 1e9, .3);
    const vt = texto(G, 'vuelta', (xb + xc) / 2 + 25, yM + 110, { anchor: 'middle', size: 24, peso: 700, italic: true, fill: C.suave });
    mostrarEn(s, vt, o.tVuelta - 0.2, 1e9, .3);
    const nO = N.group(G); parNotas(nO, o.n[0][0], o.n[1][0], (xa + xb) / 2 + 22, yM + 170, { size: 30 });
    const nI = N.group(G); parNotas(nI, o.n[1][0], o.inv[0], (xc + xd) / 2 + 22, yM + 170, { size: 30, fill: C.rosa });
    mostrarEn(s, nI, o.tNomInv, 1e9, .3);
    const cI = N.group(G); chipInt(cI, o.cInv, (xc + xd) / 2 + 22, yM + 250, { size: 32 });
    pop(s, cI, o.tCInv, 1e9, (xc + xd) / 2 + 22, yM + 250);
    const cO = N.group(G); chipInt(cO, o.cOri, (xa + xb) / 2 + 22, yM + 250, { size: 32 });
    pop(s, cO, o.tCOri, 1e9, (xa + xb) / 2 + 22, yM + 250);
    const ec = N.group(G); color(ec, C.rosa); arco(ec, (xc + xd) / 2 + 22, yM + 300, (xa + xb) / 2 + 22, yM + 300, -40, { w: 3.5 });
    texto(ec, 'especie contraria', o.x + 390, yM + 350, { anchor: 'middle', size: 24, peso: 700, italic: true, fill: C.rosa });
    mostrarEn(s, ec, o.tCOri - 0.4, 1e9, .3);
    return G;
  }

  // ================================================================ X5–Y6 · los dos ejemplos (Do–La, Re–Do) y la especie contraria
  function escenaEjemplosVuelta() {
    const a = F0('X5') - 0.1, b = F0('Z1') + 0.2;
    escena('ejemplosVuelta', a, b, (s, g) => {
      const tY1 = F0('Y1') - 0.2;
      ejemploVuelta(s, g, {
        x: 150, n: ['C4', 'A4'], inv: 'C5', tIni: F0('X5'), tFin: b - 0.2, tNotas: Wd('X6', 'do'),
        tVuelta: Wd('X6', 'vuelta') - 0.2, tNomInv: Wd('X6', 'lado') - 0.2, cInv: '3ªm', tCInv: Wd('X7', 'tercera') - 0.1,
        cOri: '6M', tCOri: Wd('X8', 'sexta') - 0.1, tFinal: Wd('X8', 'dola') - 0.1,
      });
      // X9–X11: la especie cambia (m ⇄ M · A ⇄ D · J → J), a la derecha hasta el segundo ejemplo
      const ES = N.group(g);
      aparece(s, ES, F0('X9') - 0.1, tY1, { dy: 10 });
      const filas = [
        ['M', 'm', Wd('X10', 'mayor') - 0.15, true, 420],
        ['A', 'D', Wd('X11', 'aumentado') - 0.15, true, 590],
        ['J', 'J', Wd('X11', 'justas') - 0.15, false, 760],
      ];
      texto(ES, 'la especie cambia', 1390, 340, { anchor: 'middle', size: 30, peso: 800, fill: C.rosa });
      filas.forEach(([x1, x2, ta, doble, y]) => {
        const G = N.group(ES);
        aparece(s, G, ta, 1e9, { dy: 8 });
        panel(G, 1030, y - 70, 720, 130, { rx: 20 });
        texto(G, x1, 1200, y + 26, { anchor: 'middle', size: 76, peso: 800, fill: C.blanco });
        const fl = N.group(G); color(fl, C.rosa);
        if (doble) { flecha(fl, 1290, y - 12, 1450, y - 12, { w: 5, cab: 16 }); flecha(fl, 1450, y + 16, 1290, y + 16, { w: 5, cab: 16 }); }
        else flecha(fl, 1290, y, 1450, y, { w: 5, cab: 16 });
        texto(G, x2, 1570, y + 26, { anchor: 'middle', size: 76, peso: 800, fill: C.rosa });
      });
      // Y: Re–Do → Do–Re (2M) → 7ªm
      ejemploVuelta(s, g, {
        x: 990, n: ['D4', 'C5'], inv: 'D5', tIni: F0('Y1') + 0.1, tFin: b - 0.2, tNotas: Wd('Y2', 'redo'),
        tVuelta: Wd('Y3', 'vuelta') - 0.2, tNomInv: Wd('Y3', 'dore') - 0.2, cInv: '2M', tCInv: Wd('Y4', 'segunda') - 0.1,
        cOri: '7ªm', tCOri: Wd('Y5', 'septima') - 0.1, tFinal: Wd('Y5', 'redo') - 0.1,
      });
      const pi = N.group(g); marca(pi, true, 1380, 960 - 50, 20);
      pop(s, pi, Wd('Y6', 'pillas') - 0.1, b - 0.2, 1380, 910);
    });
  }

  // ================================================================ Z · repaso final
  function escenaRepaso() {
    const a = F0('Z1') - 0.1, b = T.acorde + 0.15;
    escena('repaso', a, b, (s, g) => {
      const rp = N.group(g); chip(rp, 'REPASO FINAL', CX, 150, { size: 26, anchor: 'middle' });
      pop(s, rp, Wd('Z1', 'repaso') - 0.2, b - 0.3, CX, 150);
      const filas = [
        { tit: '2ª · 3ª', t: Wd('Z3', 'segundas') - 0.2, fin: F0('Z4') - 0.2, items: [['tonos y semitonos', Wd('Z3', 'tonos') - 0.2], ['¡de memoria!', Wd('Z3', 'aprenderse') - 0.1]] },
        { tit: '4ª · 5ª · 8ª', t: Wd('Z4', 'cuartas') - 0.2, fin: F0('Z5') - 0.2, items: [['mira el apellido', Wd('Z4', 'apellido') - 0.2], ['igual → J (¡ojo, Fa–Si!)', Wd('Z4', 'igual') - 0.2], ['distinto → las manos', Wd('Z4', 'manos') - 0.3]] },
        { tit: '6ª · 7ª', t: Wd('Z5', 'sextas') - 0.2, fin: T.acorde, items: [['dales la vuelta → 3ª y 2ª', Wd('Z5', 'vuelta') - 0.2], ['especie contraria', Wd('Z5', 'especie') - 0.2]] },
      ];
      filas.forEach((F, i) => {
        const G = N.group(g);
        const y = 250 + i * 215;
        const r = panel(G, 230, y, 1460, 190, { rx: 24 });
        const tt = texto(G, F.tit, 290, y + 118, { size: 60, peso: 800, fill: 'currentColor' });
        color(G, C.blanco);
        aparece(s, G, F.t, b - 0.3, { dy: 12 });
        s.on(t => { const k = win(t, F.t, F.fin, .3, .3); r.setAttribute('stroke', mezcla('#3a4556', C.rosa, k)); r.setAttribute('stroke-width', (1.5 + 1.5 * k).toFixed(2)); tt.setAttribute('fill', mezcla(C.blanco, C.rosa, k)); });
        F.items.forEach(([txt, ta], j) => {
          const it = texto(G, txt, 760, y + 72 + j * 50, { size: 34, peso: 700, fill: j === 0 ? C.blanco : C.suave });
          mostrarEn(s, it, ta, 1e9, .3);
        });
      });
      const mm = N.group(g); color(mm, C.rosa);
      const man = N.group(mm); mano(man); man.setAttribute('transform', 'translate(1150,626) scale(0.45)');
      mostrarEn(s, mm, Wd('Z4', 'manos') - 0.2, 1e9, .3);
      const tt = N.group(g); chip(tt, '¡TE TOCA!', CX, 930, { size: 30, anchor: 'middle' });
      pop(s, tt, Wd('Z6', 'toca') - 0.1, b - 0.3, CX, 930);
    });
  }

  const ORDEN = [escenaDefinicion, escenaNumero, escenaIndice, escenaSegundas, escenaTerceras, escenaAumDis, escenaApellido,
    escenaRebelde, escenaManos, escenaMatiz, escenaOctavas, escenaVuelta, escenaEjemplosVuelta, escenaRepaso];

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
