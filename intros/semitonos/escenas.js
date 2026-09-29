/* =====================================================================
   ESCENAS · Semitono cromático y diatónico (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (semitonos/escenas_cuerpo.js). Todo es función pura de t.
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


  // ================================================================ E13 · SEMITONO CROMÁTICO Y DIATÓNICO
  const TITULO = { kicker: 'TEORÍA  ·  INTERVALOS', lineas: ['SEMITONO CROMÁTICO', 'Y DIATÓNICO'], sub: 'Cromático = Copia · Diatónico = Distinto' };

  // ---------------------------------------------------------------- utilidades de este vídeo
  /** Línea de texto con ♭ ♯ ♮ de Bravura (pegadas a la letra, como en los nombres de nota).
   *  segs: 'texto' o [['trozo', color], …]. Devuelve el grupo con _w, _x y _segs ({x0, x1} absolutos de cada trozo). */
  function frase(parent, segs, x, y, o) {
    o = o || {};
    const size = o.size || 36, peso = o.peso || 700, esp = size * 0.28;
    const G = N.group(parent, 'frase');
    if (typeof segs === 'string') segs = [[segs, o.fill || 'currentColor']];
    let cx = 0, prev = ''; const alts = [], lim = [];
    for (const [str, col] of segs) {
      const x0 = cx;
      for (const tr of str.split(/([♭♯♮])/)) {
        if (!tr) continue;
        if (tr === '♭' || tr === '♯' || tr === '♮') {
          const gl = tr === '♭' ? 'accidentalFlat' : (tr === '♯' ? 'accidentalSharp' : 'accidentalNatural');
          const bem = tr === '♭', pegada = /[A-Za-zÁÉÍÓÚáéíóúñÑ0-9]$/.test(prev);
          const sa = pegada ? size * 0.36 : size * (bem ? 0.31 : 0.29);
          const yo = pegada ? -size * 0.33 : (bem ? -0.7 * sa : -size * 0.36);
          const xg = cx + size * (pegada ? 0.05 : 0.02);
          const gg = N.group(G, 'alt'); if (col && col !== 'currentColor') color(gg, col);
          N.glyph(gg, gl, xg, yo, sa);
          alts.push(gg);
          cx = xg + N.M[gl].adv * sa + size * 0.05;
        } else {
          if (/^\s/.test(tr)) cx += esp;
          const core = tr.trim();
          if (core) { const t = texto(G, core, cx, 0, { size, peso, fill: col || 'currentColor', italic: o.italic, ls: o.ls }); cx += D.medir(t); }
          if (core && /\s$/.test(tr)) cx += esp;
        }
        prev = tr;
      }
      lim.push([x0, cx]);
    }
    const ax = o.anchor === 'middle' ? x - cx / 2 : (o.anchor === 'end' ? x - cx : x);
    G.setAttribute('transform', `translate(${ax.toFixed(1)},${y})`);
    G._w = cx; G._x = ax; G._alts = alts; G._segs = lim.map(([p, q]) => ({ x0: ax + p, x1: ax + q }));
    return G;
  }
  /** frase() dentro de un grupo propio (para animarla con aparece/pop sin perder su posición). */
  function fraseG(parent, segs, x, y, o) { const w = N.group(parent); w._f = frase(w, segs, x, y, o); return w; }
  /** Dos frases seguidas y centradas en cx (para mostrarlas por separado): devuelve [A, B]. */
  function dosPartes(parent, segA, segB, cx, y, o) {
    const A = N.group(parent), B = N.group(parent);
    const fa = frase(A, segA, 0, y, o), fb = frase(B, segB, 0, y, o);
    const gap = (o.size || 36) * 0.3, w = fa._w + gap + fb._w, x0 = cx - w / 2;
    fa.setAttribute('transform', `translate(${x0.toFixed(1)},${y})`);
    fb.setAttribute('transform', `translate(${(x0 + fa._w + gap).toFixed(1)},${y})`);
    return [A, B];
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
  /** Pentagrama con parejas de redondas (una pareja = un semitono; barra entre parejas). pares: [[n1, n2], …]; xs: [[x1, x2], …]. */
  function parejas(parent, x, yM, ancho, pares, xs, xBarras) {
    const P = pentaClave(parent, x, yM, ancho);
    xBarras.forEach(xb => barra(parent, xb, yM));
    return pares.map((pr, i) => pr.map((n, j) => {
      const W = N.group(parent), Cg = N.group(W);
      const r = nota(Cg, n, xs[i][j], yM);
      return { W, Cg, r, cx: xs[i][j] + 15.3, y: yNota(n, yM) };
    }));
  }
  /** Teclado de piano: nb teclas blancas desde la blanca `desde` ('A3'…). Cada negra tiene sus dos nombres (C#4 = Db4). */
  function teclado(parent, x, y, desde, nb, wB, hB) {
    const G = N.group(parent, 'teclado');
    const L = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    let li = L.indexOf(desde[0]), oc = +desde.slice(-1);
    const blancas = [];
    for (let i = 0; i < nb; i++) { blancas.push(L[li] + oc); li++; if (li === 7) { li = 0; oc++; } }
    const tec = {};
    blancas.forEach((n, i) => {
      const r = N.el('rect', { x: x + i * wB, y, width: wB - 4, height: hB, rx: Math.min(8, wB * 0.12), fill: '#e2e8f0' }, G);
      tec[n] = { rect: r, cx: x + i * wB + (wB - 4) / 2, negra: false, base: '#e2e8f0' };
    });
    const wN = wB * 0.58, hN = hB * 0.6;
    blancas.forEach((n, i) => {
      if (i === nb - 1 || n[0] === 'E' || n[0] === 'B') return;
      const cx = x + (i + 1) * wB - 2;
      const r = N.el('rect', { x: cx - wN / 2, y: y - 1, width: wN, height: hN, rx: Math.min(6, wN * 0.14), fill: '#0f172a', stroke: '#64748b', 'stroke-width': 1.5 }, G);
      const k = { rect: r, cx, negra: true, base: '#0f172a' };
      const sig = blancas[i + 1];
      tec[n[0] + '#' + n.slice(-1)] = k; tec[sig[0] + 'b' + sig.slice(-1)] = k;
    });
    return { g: G, tec, x, y, w: nb * wB, h: hB };
  }
  /** Tecla que se enciende en rosa en los instantes ts (y se queda encendida en [t0, t1] si se da). */
  function enciende(s, key, ts, o) {
    o = o || {};
    s.on(t => {
      let k = 0;
      for (const t0 of ts) k = Math.max(k, win(t, t0 - 0.05, t0 + (o.d || 0.55), .06, .3));
      if (o.fijo) k = Math.max(k, win(t, o.fijo[0], o.fijo[1], .25, .3));
      key.rect.setAttribute('fill', mezcla(key.base, C.rosa, k));
    });
  }
  /** Violín (con su arco), dibujado en línea; origen = centro del cuerpo. */
  function icoViolin(parent, s) {
    s = s || 1;
    const G = N.group(parent, 'violin');
    const V = N.group(G); V.setAttribute('transform', `scale(${s}) rotate(-22)`);
    const st = { fill: 'none', stroke: 'currentColor', 'stroke-width': 4.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
    const half = 'M0,-46 C20,-46 38,-42 39,-25 C40,-13 29,-9 28,1 C27,11 46,15 47,38 C48,64 26,80 0,80';
    N.el('path', Object.assign({ d: half }, st), V);
    N.el('path', Object.assign({ d: half, transform: 'scale(-1,1)' }, st), V);
    N.el('path', Object.assign({ d: 'M-6,-46 L-5,-118 L5,-118 L6,-46' }, st), V);
    N.el('path', Object.assign({ d: 'M-5,-118 C-14,-122 -13,-138 -2,-140 C9,-141 13,-130 6,-124 C2,-120 -3,-124 -1,-129' }, st), V);
    N.line(V, -2, -114, -2, 52, 1.6); N.line(V, 2, -114, 2, 52, 1.6);
    N.line(V, -13, 28, 13, 28, 3.5, { 'stroke-linecap': 'round' });
    N.el('path', Object.assign({ d: 'M-7,52 L7,52 L3,72 L-3,72 Z' }, st, { 'stroke-width': 3 }), V);
    N.el('path', Object.assign({ d: 'M-21,8 C-27,18 -15,27 -21,38' }, st, { 'stroke-width': 3 }), V);
    N.el('path', Object.assign({ d: 'M21,8 C27,18 15,27 21,38' }, st, { 'stroke-width': 3 }), V);
    const A = N.group(G); A.setAttribute('transform', `scale(${s})`);
    N.line(A, -96, 44, 112, -28, 4, { 'stroke-linecap': 'round' });
    N.line(A, -90, 52, 110, -18, 1.6, { 'stroke-linecap': 'round', opacity: .8 });
    N.el('rect', { x: -104, y: 40, width: 18, height: 14, rx: 3, fill: 'currentColor', transform: 'rotate(-19 -95 47)' }, A);
    return G;
  }
  /** Trombón de varas (de lado, campana a la derecha); origen ≈ centro. */
  function icoTrombon(parent, s) {
    s = s || 1;
    const G = N.group(parent, 'trombon');
    const T = N.group(G); T.setAttribute('transform', `scale(${s})`);
    const st = { fill: 'none', stroke: 'currentColor', 'stroke-width': 6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
    N.el('path', Object.assign({ d: 'M-128,22 H124 A10,10 0 0 1 124,42 H-44' }, st), T);            // la vara (va y vuelve)
    N.el('path', Object.assign({ d: 'M-44,42 C-96,42 -96,-22 -44,-22 H44' }, st), T);               // curva de atrás y tubo de la campana
    N.el('path', Object.assign({ d: 'M44,-28 C76,-28 92,-54 124,-64 L124,20 C92,10 76,-16 44,-16' }, Object.assign({}, st, { 'stroke-width': 4.5, fill: 'currentColor', 'fill-opacity': 0.12 })), T);   // campana
    N.el('ellipse', Object.assign({ cx: 124, cy: -22, rx: 7, ry: 42 }, st, { 'stroke-width': 4.5 }), T);
    N.el('path', Object.assign({ d: 'M-128,22 L-140,15 L-140,29 Z' }, st, { 'stroke-width': 3.5, fill: 'currentColor' }), T);   // boquilla
    N.line(T, -8, -22, -8, 22, 3.5); N.line(T, 96, 22, 96, 42, 3.5);                                    // travesaños
    return G;
  }
  /** Curva real de la voz de Iago en el glissando (I8): 0 = Sol … 1 = Sol♯, cada 0,1 s desde t0 (pyin sobre voz_montada.wav, suavizada). */
  const GLISS = { t0: 29.35, dt: 0.1, k: [0, .001, .016, .024, .043, .029, .017, .013, .025, .022, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, .028, .073, .114, .157, .192, .223, .259, .292, .326, .374, .414, .441, .475, .502, .503, .52, .544, .571, .612, .68, .741, .79, .846, .901, .949, .982, 1, 1, .999] };

  // ================================================================ I · ¿la distancia más pequeña? · 2ªm = un semitono*  (*en nuestra música)
  function escenaPregunta() {
    const a = F0('I1') - 0.2, b = F0('I7') + 0.2;
    escena('pregunta', a, b, (s, g) => {
      const fin = b - 0.3;
      const Q = N.group(g);
      frase(Q, [['¿Cuál es la distancia ', C.blanco], ['más pequeña', C.rosa], [' entre dos sonidos?', C.blanco]], CX, 180, { size: 50, peso: 800, anchor: 'middle' });
      aparece(s, Q, Wd('I1', 'cual') - 0.2, fin, { dy: 10 });
      // Mi–Fa en el pentagrama
      const yM = 400;
      const PE = N.group(g);
      aparece(s, PE, Wd('I1', 'sonidos') - 0.4, fin, { dy: 0 });
      pentaClave(PE, 660, yM, 600);
      const xs = [820, 1040];
      const nMF = ['E4', 'F4'].map((n, i) => {
        const W = N.group(PE); const r = nota(W, n, xs[i], yM);
        pop(s, W, Wd('I1', 'sonidos') - 0.25 + i * 0.2, 1e9, xs[i] + 15, yNota(n, yM), { k0: .5 });
        const nm = fraseG(PE, n[0] === 'E' ? 'Mi' : 'Fa', r.cx, 552, { size: 34, peso: 700, anchor: 'middle', fill: C.blanco });
        mostrarEn(s, nm, Wd('I1', 'sonidos') - 0.1 + i * 0.2, 1e9, .3);
        return r;
      });
      // la distancia: un semitono = pico en V por debajo (norma de Iago); el rótulo, bajo el pico
      const cor = N.group(g); color(cor, C.rosa);
      const pv = distancia(cor, nMF[0], nMF[1], 'st', { w: 4 });
      mostrarEn(s, cor, Wd('I1', 'sonidos') + 0.2, fin, .3);
      const xv = (nMF[0].cx + nMF[1].cx) / 2;
      const q = texto(g, '?', xv, pv._yb + 60, { anchor: 'middle', size: 60, peso: 800, fill: C.rosa });
      s.on(t => opa(q, win(t, Wd('I2', 'responderias') - 0.2, Wd('I3', 'segunda') - 0.1, .3, .25)));
      // I3 · una segunda menor, un semitono
      const tSeg = Wd('I3', 'segunda') - 0.15, tSem = Wd('I3', 'semitono') - 0.2;
      const yC2 = pv._yb + 50;
      const c2 = N.group(g); chipInt(c2, '2ªm', xv, yC2, { size: 32 });
      pop(s, c2, tSeg, fin, xv, yC2);
      const st = texto(g, 'un semitono', xv, 664, { anchor: 'middle', size: 42, peso: 800, fill: C.blanco });
      aparece(s, st, tSem, fin, { dy: 8 });
      const wSt = D.medir(st);
      // I4 · «no te culpo» (✓) · I5 · «tengo que ser honesto» (*)
      const xT = xv + wSt / 2;
      const ok = N.group(g); marca(ok, true, xT + 78, 650, 15);
      pop(s, ok, Wd('I4', 'culpo') - 0.15, fin, xT + 78, 650, { k0: .3 });
      const ast = texto(g, '*', xT + 3, 670, { size: 60, peso: 800, fill: C.rosa });
      pop(s, ast, Wd('I5', 'honesto') - 0.2, fin, xT + 16, 636, { k0: .2 });
      // I6 · *en nuestra música: temperamento igual (el piano)
      const tMus = Wd('I6', 'nuestra') - 0.2, tTem = Wd('I6', 'temperamento') - 0.2;
      const [fA, fB] = dosPartes(g, [['* ', C.rosa], ['en nuestra música:', C.blanco]], [['temperamento igual', C.rosa]], CX, 810, { size: 36, peso: 700 });
      aparece(s, fA, tMus, fin, { dy: 8 });
      aparece(s, fB, tTem, fin, { dy: 8 });
      const K = teclado(g, CX - 214, 842, 'C4', 11, 39, 88);
      aparece(s, K.g, tTem + 0.1, fin, { dy: 10 });
      enciende(s, K.tec.E4, [], { fijo: [tTem + 0.6, fin + 1] });
      enciende(s, K.tec.F4, [], { fijo: [tTem + 0.6, fin + 1] });
    });
  }

  // ================================================================ G · si canto… paso por infinitas microafinaciones · el semitono es lo más pequeño que usamos
  function escenaGlissando() {
    const a = F0('I7') - 0.1, b = F0('C1') + 0.2;
    escena('glissando', a, b, (s, g) => {
      const fin = b - 0.3;
      const tMano = Wd('I10', 'damos') - 0.1, tHab = Wd('I10', 'hablemos') - 0.2;
      const tFuera = tMano + 0.8;                                          // «nos damos la mano»: se despeja todo y llega el título
      // quien canta
      const CAN = N.group(g); icoCantar(CAN, 0, 0); color(CAN, C.blanco);
      aparece(s, CAN, Wd('I7', 'yo') - 0.2, tFuera, { dy: 10, x: 220, y: 500, s: 1.35 });
      // dos alturas: Sol y Sol♯ (un semitono)
      const x0 = 520, x1 = 1480, ySol = 640, ySos = 400;
      const tLin = Wd('I7', 'esto') - 0.1;
      const tEnt = Wd('I9', 'entre') - 0.15, tI10 = F0('I10');
      const LIN = N.group(g);
      aparece(s, LIN, tLin, tFuera, { dy: 0 });
      const lSol = N.group(LIN), lSos = N.group(LIN);
      N.line(lSol, x0 - 20, ySol, x1 + 20, ySol, 3, { 'stroke-linecap': 'round' });
      N.line(lSos, x0 - 20, ySos, x1 + 20, ySos, 3, { 'stroke-linecap': 'round' });
      frase(lSol, 'Sol', x0 - 44, ySol + 13, { size: 38, peso: 800, anchor: 'end', fill: 'currentColor' });
      frase(lSos, 'Sol♯', x0 - 44, ySos + 13, { size: 38, peso: 800, anchor: 'end', fill: 'currentColor' });
      [lSol, lSos].forEach(l => colorSeq(s, l, [[-1, C.suave], [tEnt, C.blanco]]));
      // microafinaciones: muchas alturas entre las dos (detrás de la voz)
      const tCant = Wd('I9', 'cantidad') - 0.3, tEnt2 = Wd('I10', 'entendemos') - 0.2, tMas = Wd('I10', 'realmente') - 0.1;
      const MIC = N.group(g);
      const nMic = 23;
      for (let i = 1; i <= nMic; i++) {
        const y = ySol + (ySos - ySol) * i / (nMic + 1);
        const ln = N.line(MIC, x0 - 6, y, x1 + 6, y, 1.6, { stroke: C.rosaClaro, 'stroke-linecap': 'round' });
        mostrarEn(s, ln, tCant + (i - 1) * 0.055, 1e9, .25);
      }
      s.on(t => opa(MIC, 0.55 * (1 - 0.8 * ease(ramp(t, tEnt2, tEnt2 + 0.6)) + 0.8 * ease(ramp(t, tMas, tMas + 0.5))) * (1 - ease(ramp(t, tMano, tMano + 0.6)))));
      // la voz: se dibuja al ritmo del canto (curva real de la grabación)
      const tA = F0('I8') + 0.01, tB = tA + GLISS.dt * (GLISS.k.length - 1);   // la curva arranca con el canto (I8)
      const px = t => x0 + (x1 - x0) * clamp((t - tA) / (tB - tA)), py = k => ySol + (ySos - ySol) * k;
      const pts = GLISS.k.map((k, i) => [px(tA + i * GLISS.dt), py(k)]);
      let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {                              // Catmull-Rom → Bézier (curva suave)
        const p0 = pts[Math.max(0, i - 2)], p1 = pts[i - 1], p2 = pts[i], p3 = pts[Math.min(pts.length - 1, i + 1)];
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
      }
      const VOZ = N.group(g); color(VOZ, C.rosa);
      const cp = N.el('clipPath', { id: 'clipVoz', clipPathUnits: 'userSpaceOnUse' }, N.el('defs', null, VOZ));
      const rc = N.el('rect', { x: x0 - 20, y: ySos - 60, width: 0, height: ySol - ySos + 120 }, cp);
      const curva = N.el('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'clip-path': 'url(#clipVoz)' }, VOZ);
      const punto = N.el('circle', { r: 13, fill: 'currentColor' }, VOZ);
      const kAt = t => { const u = clamp((t - tA) / GLISS.dt, 0, GLISS.k.length - 1), i = Math.floor(u), f = u - i; return lerp(GLISS.k[i], GLISS.k[Math.min(i + 1, GLISS.k.length - 1)], f); };
      const tProg = Wd('I10', 'progresiva') - 0.2;
      s.on(t => {
        rc.setAttribute('width', (t < tA - 0.05 ? 0 : px(t) - x0 + 22).toFixed(1));
        punto.setAttribute('cx', px(t).toFixed(1)); punto.setAttribute('cy', py(kAt(t)).toFixed(1));
        opa(punto, win(t, tA - 0.15, tB + 0.6, .15, .4));
        opa(VOZ, 1 - ease(ramp(t, tMano, tMano + 0.6)));
        curva.setAttribute('stroke-width', (7 + 5 * win(t, tProg, tProg + 1.6, .3, .6)).toFixed(2));
      });
      // I9 · entre una nota y la siguiente: un semitono… ¡e infinitas microafinaciones!
      const cor = N.group(g); color(cor, C.rosa);
      corchete(cor, x1 + 64, ySos, ySol, { d: 16, w: 4 });
      mostrarEn(s, cor, tEnt, tMano, .3, .5);
      const lStG = N.group(g), lSt = texto(lStG, 'semitono', x1 + 84, (ySol + ySos) / 2 + 12, { size: 36, peso: 800, fill: C.rosa });
      aparece(s, lSt, Wd('I9', 'semitono') - 0.2, tMano, { dy: 6 });
      const mic = texto(g, 'microafinaciones', 0, ySol + 76, { size: 36, peso: 700, italic: true, fill: C.rosa });
      const wMic = D.medir(mic), xInf = (x0 + x1) / 2 - (wMic + 84) / 2 + 30;
      mic.setAttribute('x', (xInf + 54).toFixed(1));
      const inf = texto(g, '∞', xInf, ySol + 86, { anchor: 'middle', size: 76, peso: 700, fill: C.rosa });
      s.on(t => opa(inf, win(t, Wd('I9', 'infinita') - 0.2, tEnt2 + 0.3, .3, .4)));
      s.on(t => opa(mic, win(t, Wd('I9', 'microafinaciones') - 0.3, tEnt2 + 0.3, .3, .4)));
      // I10 · el semitono: la división más pequeña que usamos…
      const tDiv = Wd('I10', 'division') - 0.2, tSemi = Wd('I10', 'semitono') - 0.2;
      const cS = N.group(g); chip(cS, 'SEMITONO', x1 + 84, (ySol + ySos) / 2 - 2, { size: 28 });
      pop(s, cS, tSemi, tMano, x1 + 150, (ySol + ySos) / 2);
      s.on(t => opa(lStG, 1 - ease(ramp(t, tSemi - 0.1, tSemi + 0.2))));
      const div = texto(g, 'lo más pequeño', x1 + 84, (ySol + ySos) / 2 + 58, { size: 26, peso: 600, italic: true, fill: C.suave });
      const div2 = texto(g, 'que usamos', x1 + 84, (ySol + ySos) / 2 + 90, { size: 26, peso: 600, italic: true, fill: C.suave });
      aparece(s, div, tDiv, tMano, { dy: 6 }); aparece(s, div2, tDiv + 0.2, tMano, { dy: 6 });
      // …pero el violín o el trombón pueden deslizarse: ¡hay más!
      const VI = N.group(g); icoViolin(VI, 0.85); color(VI, C.blanco);
      aparece(s, VI, Wd('I10', 'violin') - 0.25, tMano, { dy: 10, x: 1010, y: 210 });
      const TR = N.group(g); icoTrombon(TR, 0.9); color(TR, C.blanco);
      aparece(s, TR, Wd('I10', 'trombon') - 0.25, tMano, { dy: 10, x: 1400, y: 220 });
      const mas = texto(g, '¡hay más!', 1210, 330, { anchor: 'middle', size: 40, peso: 800, fill: C.rosa });
      aparece(s, mas, tMas + 0.15, tMano, { dy: 6 });
      // «hablemos del semitono cromático y diatónico»
      const T1 = texto(g, 'SEMITONO', CX, 470, { anchor: 'middle', size: 72, peso: 800, ls: '0.06em', fill: C.blanco });
      aparece(s, T1, tHab, fin, { dy: 10 });
      const c1 = N.group(g); chip(c1, 'CROMÁTICO', CX - 190, 580, { size: 34, anchor: 'middle', relleno: false });
      pop(s, c1, Wd('I10', 'cromatico') - 0.2, fin, CX - 190, 580);
      const yy = texto(g, 'y', CX, 592, { anchor: 'middle', size: 34, peso: 600, italic: true, fill: C.suave });
      aparece(s, yy, Wd('I10', 'cromatico') + 0.3, fin, { dy: 4 });
      const c2 = N.group(g); chip(c2, 'DIATÓNICO', CX + 190, 580, { size: 34, anchor: 'middle', relleno: false });
      pop(s, c2, Wd('I10', 'diatonico') - 0.2, fin, CX + 190, 580);
    });
  }

  // ================================================================ C/D · cromático (mismo nombre) · diatónico (distinto nombre, seguidas)
  function escenaTipos() {
    const a = F0('C1') - 0.1, b = F0('P1') + 0.2;
    escena('tipos', a, b, (s, g) => {
      const fin = b - 0.3;
      const tD = F0('D1') - 0.1, tFinD2 = F0('D2') + 3.1;
      const yP = 110, hP = 760, yM = 420;
      const panelTipo = (x, titulo, ta) => {
        const G = N.group(g);
        aparece(s, G, ta, fin, { dy: 12 });
        const r = panel(G, x, yP, 790, hP, { rx: 26 });
        const ch = N.group(G); chip(ch, titulo, x + 395, yP + 64, { size: 28, anchor: 'middle' });
        return { G, r, x };
      };
      // ---------- cromático
      const L = panelTipo(150, 'SEMITONO CROMÁTICO', a + 0.1);
      s.on(t => opa(L.G, win(t, a + 0.1, fin, .5, .5) * (1 - 0.6 * win(t, tD, tFinD2, .4, .5))));
      const tMis = Wd('C1', 'mismo') - 0.2;
      const rl = fraseG(L.G, [['mismo', C.rosa], [' nombre', C.blanco]], L.x + 395, yP + 160, { size: 40, peso: 800, anchor: 'middle' });
      aparece(s, rl, tMis, 1e9, { dy: 6 });
      const px = L.x;
      // (29-sep, Iago) la barra, en el centro del espacio de las notas, y cada compás con su aire (antes: barra muy a la derecha y el 2.º compás apretado)
      const PL = parejas(L.G, px + 50, yM, 700, [['C4', 'C#4'], ['Eb4', 'E4']], [[px + 230, px + 365], [px + 530, px + 665]], [px + 450]);
      const tC = [Wd('C1', 'do', 2) - 0.1, Wd('C1', 'do', 3) - 0.1, Wd('C1', 'mi', 2) - 0.1, Wd('C1', 'mi', 3) - 0.1];
      [PL[0][0], PL[0][1], PL[1][0], PL[1][1]].forEach((n, i) => pop(s, n.W, tC[i], 1e9, n.cx, n.y, { k0: .5 }));
      // el becuadro del Mi (se nombra: «Mi becuadro»)
      const nat = N.group(L.G); N.glyph(nat, 'accidentalNatural', px + 665 - (N.M.accidentalNatural.adv + 0.22) * SP, yNota('E4', yM), SP); color(nat, C.rosa);
      pop(s, nat, Wd('C1', 'becuadro') - 0.15, 1e9, px + 665 - 16, yNota('E4', yM), { k0: .3 });
      colorSeq(s, PL[0][1].r.alt, [[-1, C.rosa], [tD, C.blanco]]);
      const nmL = [fraseG(L.G, 'Do–Do♯', px + 313, yM + 170, { size: 36, peso: 700, anchor: 'middle', fill: 'currentColor' }),
        fraseG(L.G, 'Mi♭–Mi♮', px + 613, yM + 170, { size: 36, peso: 700, anchor: 'middle', fill: 'currentColor' })];
      mostrarEn(s, nmL[0], Wd('C1', 'sostenido') - 0.1, 1e9, .3);
      mostrarEn(s, nmL[1], Wd('C1', 'becuadro') - 0.05, 1e9, .3);
      // cartel: Cromático = Copia
      const cartel = (P, txtA, txtB, tBox, tA, tB) => {
        const B = N.group(P.G);
        N.el('rect', { x: P.x + 60, y: yP + hP - 196, width: 670, height: 150, rx: 22, fill: 'rgba(236,72,153,0.10)', stroke: C.rosa, 'stroke-width': 3 }, B);
        texto(B, 'TRUCO', P.x + 90, yP + hP - 160, { size: 20, peso: 800, ls: '0.2em', fill: C.rosa });
        aparece(s, B, tBox, 1e9, { dy: 8 });
        const [A2, B2] = dosPartes(P.G, txtA, txtB, P.x + 395, yP + hP - 84, { size: 62, peso: 800 });
        aparece(s, A2, tA, 1e9, { dy: 6 }); aparece(s, B2, tB, 1e9, { dy: 6 });
      };
      cartel(L, [['C', C.rosa], ['romático', C.blanco]], [['= ', C.suave], ['C', C.rosa], ['opia', C.blanco]], Wd('C2', 'truco') - 0.15, Wd('C2', 'cromatico') - 0.2, Wd('C2', 'copia') - 0.2);
      nmL.forEach(n => colorSeq(s, n, [[-1, C.blanco], [Wd('C2', 'copia') - 0.1, C.rosa], [Wd('C2', 'copia') + 1.4, C.blanco]]));
      // cada semitono, marcado con el pico en V por debajo (norma de Iago)
      const picoPar = (P, par, ta) => { const G = N.group(P.G); color(G, C.rosa); distancia(G, par[0].r, par[1].r, 'st', { w: 3.6 }); P.G.insertBefore(G, par[0].W); mostrarEn(s, G, ta, 1e9, .3); return G; };   // por detrás de notas y alteraciones
      picoPar(L, PL[0], tC[1] + 0.2);
      picoPar(L, PL[1], Wd('C1', 'becuadro') - 0.05);
      // ---------- diatónico
      const R = panelTipo(980, 'SEMITONO DIATÓNICO', tD);
      const rx = R.x;
      const [rA, rB] = dosPartes(R.G, [['distinto', C.rosa], [' nombre,', C.blanco]], [['seguidas', C.blanco]], rx + 395, yP + 160, { size: 40, peso: 800 });
      aparece(s, rA, Wd('D1', 'distinto') - 0.2, 1e9, { dy: 6 });
      aparece(s, rB, Wd('D1', 'seguidas') - 0.2, 1e9, { dy: 6 });
      const PR = parejas(R.G, rx + 50, yM, 700, [['E4', 'F4'], ['C4', 'Db4']], [[rx + 230, rx + 365], [rx + 530, rx + 665]], [rx + 450]);
      const tMF = Wd('D1', 'mifa') - 0.15, tDR = Wd('D1', 'dore') - 0.15;
      const tR = [tMF, tMF + 0.25, tDR, tDR + 0.3];
      [PR[0][0], PR[0][1], PR[1][0], PR[1][1]].forEach((n, i) => pop(s, n.W, tR[i], 1e9, n.cx, n.y, { k0: .5 }));
      colorSeq(s, PR[1][1].r.alt, [[-1, C.blanco], [Wd('D1', 'bemol') - 0.15, C.rosa]]);
      const nmR = [fraseG(R.G, 'Mi–Fa', rx + 313, yM + 170, { size: 36, peso: 700, anchor: 'middle', fill: 'currentColor' }),
        fraseG(R.G, 'Do–Re♭', rx + 613, yM + 170, { size: 36, peso: 700, anchor: 'middle', fill: 'currentColor' })];
      mostrarEn(s, nmR[0], tMF + 0.2, 1e9, .3);
      mostrarEn(s, nmR[1], Wd('D1', 'bemol') - 0.1, 1e9, .3);
      cartel(R, [['D', C.rosa], ['iatónico', C.blanco]], [['= ', C.suave], ['D', C.rosa], ['istinto', C.blanco]], Wd('D2', 'truco') - 0.15, Wd('D2', 'diatonico') - 0.2, Wd('D2', 'distinto') - 0.2);
      nmR.forEach(n => colorSeq(s, n, [[-1, C.blanco], [Wd('D2', 'distinto') - 0.1, C.rosa], [Wd('D2', 'distinto') + 1.4, C.blanco]]));
      picoPar(R, PR[0], tMF + 0.4);
      picoPar(R, PR[1], Wd('D1', 'bemol') - 0.05);
    });
  }

  // ================================================================ P · en el piano suenan igual (=) pero el nombre manda (≠)
  function escenaPiano() {
    const a = F0('P1') - 0.1, b = F0('B1') + 0.2;
    escena('piano', a, b, (s, g) => {
      const fin = b - 0.3;
      const SI = S.SON_IGUAL || [F0('SON_IGUAL') + 0.1, F0('SON_IGUAL') + 0.7, F0('SON_IGUAL') + 1.7, F0('SON_IGUAL') + 2.3];
      const tPiano = Wd('P1', 'piano') - 0.3, tManda = Wd('P2', 'manda') - 0.25;
      // el teclado (se va cuando «lo que manda es el nombre»)
      const KB = N.group(g);
      aparece(s, KB, tPiano, tManda + 0.1, { dy: 10 });
      const K = teclado(KB, 618, 170, 'A3', 9, 76, 210);
      const kDo = K.tec.C4, kNe = K.tec['C#4'];
      const tDD = Wd('P1', 'dodo') - 0.1, tSos = Wd('P1', 'sostenido') - 0.1, tDRe = Wd('P1', 'dore') - 0.1, tBem = Wd('P1', 'bemol') - 0.1;
      enciende(s, kDo, [tDD, tDRe, SI[0], SI[2]]);
      enciende(s, kNe, [tSos, tBem, SI[1], SI[3]]);
      const lDo = fraseG(KB, 'Do', kDo.cx, 170 + 210 + 46, { size: 36, peso: 800, anchor: 'middle', fill: C.blanco });
      mostrarEn(s, lDo, tDD, 1e9, .25);
      const lSos = fraseG(KB, 'Do♯', kNe.cx - 24, 144, { size: 36, peso: 800, anchor: 'end', fill: C.blanco });
      mostrarEn(s, lSos, tSos, 1e9, .25);
      const lEq = texto(KB, '=', kNe.cx, 142, { anchor: 'middle', size: 36, peso: 800, fill: C.suave });
      mostrarEn(s, lEq, tBem, 1e9, .25);
      const lBem = fraseG(KB, 'Re♭', kNe.cx + 24, 144, { size: 36, peso: 800, anchor: 'start', fill: C.blanco });
      mostrarEn(s, lBem, tBem, 1e9, .25);
      // los dos semitonos en el pentagrama
      const yM = 590;
      const lado = (x, n2, nom, ta, t2, sons) => {
        const G = N.group(g);
        aparece(s, G, ta, fin, { dy: 10 });
        pentaClave(G, x, yM, 640);
        const n1 = N.group(G); const r1 = nota(n1, 'C4', x + 290, yM);
        const nb = N.group(G), nbIn = N.group(nb); const r2 = nota(nbIn, n2, x + 450, yM);
        pop(s, nb, t2, 1e9, x + 465, yNota(n2, yM), { k0: .5 });
        destella(s, n1, [sons[0]]); destella(s, nbIn, [sons[1]]);
        const pv = N.group(G); color(pv, C.rosa); distancia(pv, r1, r2, 'st', { w: 3.6 }); G.insertBefore(pv, n1);
        mostrarEn(s, pv, t2 + 0.25, 1e9, .3);
        const nm = fraseG(G, nom, x + 385, yM + 186, { size: 38, peso: 800, anchor: 'middle', fill: 'currentColor' });
        mostrarEn(s, nm, t2 + 0.1, 1e9, .3);
        return { G, nm, cx: x + 385 };
      };
      const Iz = lado(230, 'C#4', 'Do–Do♯', tDD - 0.1, tSos, [SI[0], SI[1]]);
      const De = lado(1050, 'Db4', 'Do–Re♭', tDRe - 0.1, tBem, [SI[2], SI[3]]);
      // = en el sonido
      const tIg = Wd('P1', 'igual') - 0.2;
      const EQ = N.group(g);
      texto(EQ, '=', CX, yM + 34, { anchor: 'middle', size: 110, peso: 800, fill: C.blanco });
      texto(EQ, 'suenan igual', CX, yM + 88, { anchor: 'middle', size: 26, peso: 700, italic: true, fill: C.suave });
      pop(s, EQ, tIg, fin, CX, yM, { k0: .5 });
      // ≠ en el nombre: cromático / diatónico
      const tCro = Wd('P2', 'cromatico') - 0.2, tDia = Wd('P2', 'diatonico') - 0.2;
      const cro = texto(g, 'cromático', Iz.cx, yM + 262, { anchor: 'middle', size: 40, peso: 800, fill: C.rosa });
      aparece(s, cro, tCro, fin, { dy: 6 });
      const dia = texto(g, 'diatónico', De.cx, yM + 262, { anchor: 'middle', size: 40, peso: 800, fill: C.rosa });
      aparece(s, dia, tDia, fin, { dy: 6 });
      const NE = N.group(g);
      texto(NE, '≠', CX, yM + 220, { anchor: 'middle', size: 96, peso: 800, fill: C.rosa });
      texto(NE, 'nombre', CX, yM + 268, { anchor: 'middle', size: 26, peso: 700, italic: true, fill: C.suave });
      pop(s, NE, tDia + 0.35, fin, CX, yM + 194, { k0: .5 });
      [Iz.nm, De.nm].forEach(n => colorSeq(s, n, [[-1, C.blanco], [tManda + 0.3, C.rosa]]));
      // lo que manda es el nombre (en el sitio del teclado)
      const M = N.group(g); chip(M, 'LO QUE MANDA ES EL NOMBRE', CX, 280, { size: 34, anchor: 'middle' });
      pop(s, M, tManda + 0.35, fin, CX, 280, { k0: .7 });
    });
  }

  // ================================================================ B · no te olvides de los becuadros (mal hechos ✗ · bien hechos ✓)
  function escenaBecuadros() {
    const a = F0('B1') - 0.1, b = T.acorde + 0.15;
    escena('becuadros', a, b, (s, g) => {
      const fin = b - 0.3;
      // B1 · el becuadro
      const tBec = Wd('B1', 'becuadros') - 0.25;
      const H = N.group(g);
      const hn = N.group(H); N.glyph(hn, 'accidentalNatural', CX - 186, 186, 30); color(hn, C.rosa);
      texto(H, 'becuadros', CX - 132, 212, { size: 62, peso: 800, fill: C.blanco });
      aparece(s, H, tBec, fin, { dy: 10 });
      const nec = texto(g, '¡son necesarios!', CX, 296, { anchor: 'middle', size: 36, peso: 700, italic: true, fill: C.rosa });
      aparece(s, nec, Wd('B1', 'necesarios') - 0.2, fin, { dy: 6 });
      const sin = fraseG(g, [['sin ', C.blanco], ['becuadro', C.rosa], [', no hay cromatismo', C.blanco]], CX, 350, { size: 34, peso: 700, anchor: 'middle' });
      aparece(s, sin, Wd('B1', 'cromatismo') - 0.3, fin, { dy: 6 });
      // B2 / B3 · ejemplos mal hechos y bien hechos (Mi♭→Mi, Fa♯→Fa)
      const yP = 420, hP = 460, yM = 660;
      const ejemplos = (x, ok, ta, tMarca, tNat) => {
        const G = N.group(g);
        aparece(s, G, ta, fin, { dy: 12 });
        panel(G, x, yP, 740, hP, { rx: 24 });
        const mk = N.group(G); marca(mk, ok, x + 60, yP + 62, 16);
        pop(s, mk, tMarca, 1e9, x + 60, yP + 62, { k0: .3 });
        const tt = texto(G, ok ? 'bien hechos' : 'mal hechos', x + 96, yP + 74, { size: 36, peso: 800, fill: C.blanco });
        mostrarEn(s, tt, tMarca, 1e9, .3);
        const px = x + 30;
        // (29-sep, Iago) margen a la derecha tras la última nota y barra en el centro (antes la última nota tocaba el final)
        const PR = parejas(G, px, yM, 680, [['Eb4', 'E4'], ['F#4', 'F4']], [[px + 183, px + 313], [px + 470, px + 600]], [px + 392]);
        const xN = [px + 313, px + 600], ns = ['E4', 'F4'];
        xN.forEach((xn, i) => {
          const xa = xn - (N.M.accidentalNatural.adv + 0.22) * SP, y = yNota(ns[i], yM);
          if (ok) {
            const nt = N.group(G); N.glyph(nt, 'accidentalNatural', xa, y, SP); color(nt, C.rosa);
            pop(s, nt, tNat + i * 0.15, 1e9, xa + 12, y, { k0: .3 });
            const pv = N.group(G); color(pv, C.rosa); distancia(pv, PR[i][0].r, PR[i][1].r, 'st', { w: 3.6 }); G.insertBefore(pv, PR[0][0].W);
            mostrarEn(s, pv, tNat + i * 0.15 + 0.3, 1e9, .3);
          } else {
            const hu = N.el('rect', { x: xa - 8, y: y - 44, width: 40, height: 88, rx: 8, fill: 'none', stroke: C.rosa, 'stroke-width': 2.5, 'stroke-dasharray': '6 7' }, G);
            mostrarEn(s, hu, tNat + i * 0.15, 1e9, .3);
            const qq = texto(G, '?', xa + 12, yM - 76, { anchor: 'middle', size: 36, peso: 800, fill: C.rosa });
            mostrarEn(s, qq, tNat + i * 0.15 + 0.1, 1e9, .3);
          }
        });
        return G;
      };
      const tMal = Wd('B2', 'mal') - 0.15, tBien = Wd('B3', 'bien') - 0.15;
      ejemplos(190, false, Wd('B2', 'fijate') - 0.1, tMal, Wd('B2', 'hechos') - 0.05);
      ejemplos(990, true, Wd('B3', 'estos') - 0.15, tBien, Wd('B3', 'estos') + 0.1);
      // B4 · ¡error típico! (sello sobre los mal hechos)
      const xs = 560, ys = yP + hP - 70;
      const st = N.group(g), stIn = N.group(st);
      chip(stIn, '¡ERROR TÍPICO!', 0, 0, { size: 30, anchor: 'middle' });
      stIn.setAttribute('transform', `translate(${xs},${ys}) rotate(-4)`);
      pop(s, st, Wd('B4', 'error') - 0.15, fin, xs, ys, { k0: 1.5, fi: .25 });
    });
  }

  const ORDEN = [escenaPregunta, escenaGlissando, escenaTipos, escenaPiano, escenaBecuadros];

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
