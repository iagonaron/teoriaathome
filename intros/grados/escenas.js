/* =====================================================================
   ESCENAS · Grados (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (grados/escenas_cuerpo.js). Todo es función pura de t.
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


  // ================================================================ E12 · GRADOS (nombres, familias y los dos ejercicios típicos)
  const TITULO = { kicker: 'TEORÍA  ·  ESCALAS', lineas: ['GRADOS'], sub: 'Nombres · Tonales y modales · Dos ejercicios' };
  const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

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
  /** Cortinilla horizontal que revela un grupo (dir 1: de izquierda a derecha; -1: al revés). */
  let nClip = 0;
  function barrido(s, g, x0, x1, y0, y1, ta, dur, dir) {
    const id = 'clipGr' + (nClip++);
    const defs = N.el('defs', null, g.parentNode);
    const cp = N.el('clipPath', { id, clipPathUnits: 'userSpaceOnUse' }, defs);
    const r = N.el('rect', { x: x0, y: y0, width: 0, height: y1 - y0 }, cp);
    g.setAttribute('clip-path', `url(#${id})`);
    s.on(t => {
      const w = (x1 - x0) * ease(ramp(t, ta, ta + dur));
      r.setAttribute('width', w.toFixed(1)); r.setAttribute('x', (dir < 0 ? x1 - w : x0).toFixed(1));
    });
  }
  /** Enlace discontinuo con punta (curva cúbica con puntos de control o.c1 y o.c2). */
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
  /** Retrovisor de coche (el interior, con su soporte arriba). Centro del espejo (cx, cy); ancho ≈ 190·s. */
  function retrovisor(parent, cx, cy, s) {
    s = s || 1;
    const G = N.group(parent, 'retrovisor');
    const w = 190 * s, h = 66 * s;
    N.el('rect', { x: cx - 17 * s, y: cy - h / 2 - 38 * s, width: 34 * s, height: 18 * s, rx: 8 * s, fill: 'currentColor' }, G);
    N.el('path', { d: `M${cx - 6 * s},${cy - h / 2 - 22 * s} L${cx - 9 * s},${cy - h / 2 + 2 * s} L${cx + 9 * s},${cy - h / 2 + 2 * s} L${cx + 6 * s},${cy - h / 2 - 22 * s} Z`, fill: 'currentColor' }, G);
    N.el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 24 * s, fill: '#0b1628', stroke: 'currentColor', 'stroke-width': 5 * s }, G);
    N.el('rect', { x: cx - w / 2 + 11 * s, y: cy - h / 2 + 10 * s, width: w - 22 * s, height: h - 20 * s, rx: 15 * s, fill: 'rgba(148,163,184,0.16)', stroke: 'currentColor', 'stroke-width': 1.6 * s, opacity: .55 }, G);
    N.line(G, cx + w * 0.22, cy - h * 0.2, cx + w * 0.3, cy + h * 0.16, 3 * s, { 'stroke-linecap': 'round', opacity: .4 });
    N.line(G, cx + w * 0.3, cy - h * 0.2, cx + w * 0.34, cy - h * 0.02, 3 * s, { 'stroke-linecap': 'round', opacity: .4 });
    return G;
  }
  /** Reflejo dentro del retrovisor: una alteración pequeña (♭ o ♯) en el cristal. */
  function reflejo(parent, cx, cy, gl, sp) {
    const G = N.group(parent, 'reflejo');
    sp = sp || 15;
    const m = N.M[gl], w = m.adv * sp;
    const yo = gl === 'accidentalFlat' ? cy + 0.5 * sp : cy;
    N.glyph(G, gl, cx - w / 2, yo, sp);
    return G;
  }
  /** Fila de pasos (cajas numeradas) centrada en CX. pasos: [{n, txt, ico?(g, x, y)}]. */
  function filaPasos(parent, pasos, y, o) {
    o = o || {};
    const size = o.size || 26, h = o.h || 62, gap = o.gap || 22;
    const tmp = N.group(parent);
    const ws = pasos.map(p => { const t = texto(tmp, p.txt, 0, 0, { size, peso: 700 }); return D.medir(t) + 94 + (p.ico ? 76 : 0); });
    tmp.remove();
    const total = ws.reduce((p, q) => p + q, 0) + gap * (pasos.length - 1);
    let x = CX - total / 2;
    return pasos.map((p, i) => {
      const G = N.group(parent, 'paso');
      const rect = panel(G, x, y - h / 2, ws[i], h, { rx: 14 });
      const num = N.group(G);
      N.el('circle', { cx: x + 36, cy: y, r: 18, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5 }, num);
      texto(num, p.n, x + 36, y + 8.5, { anchor: 'middle', size: 23, peso: 800, fill: 'currentColor' });
      const tx = N.group(G); texto(tx, p.txt, x + 68, y + 9, { size, peso: 700, fill: 'currentColor' });
      let ic = null; if (p.ico) { ic = N.group(G); p.ico(ic, x + ws[i] - 58, y + 4); }
      const out = { g: G, rect, num, tx, ic, x, w: ws[i] };
      x += ws[i] + gap;
      return out;
    });
  }
  /** Anima un paso: aparece en ta; rosa mientras [t0, t1]; luego queda en gris (hecho). */
  function animaPaso(s, P, ta, t0, t1, fin) {
    aparece(s, P.g, ta, fin, { dy: 8 });
    s.on(t => {
      const k = win(t, t0, t1, .3, .3);
      P.rect.setAttribute('stroke', mezcla('#3a4556', C.rosa, k));
      P.rect.setAttribute('stroke-width', (1.5 + 1.5 * k).toFixed(2));
      color(P.num, mezcla(C.suave, C.rosa, k));
      color(P.tx, mezcla(C.suave, C.blanco, k));
      if (P.ic) color(P.ic, mezcla(C.suave, C.rosa, k));
    });
  }
  const icoRetro = (G, x, y) => { retrovisor(G, x, y + 4, 0.34); };
  /** Pentagrama de los ejercicios: clave + armadura (alteraciones animables) + cabecitas con su nombre debajo. */
  const EJ = { x: 250, yM: 560, ancho: 1140, x1: 480, paso: 140, yNom: 712, yRom: 780 };
  function cabecitas(s, parent, notas, noms, ta, o) {
    o = o || {};
    return notas.map((n, i) => {
      const x = EJ.x1 + i * EJ.paso, cx = x + 15.3, y = yNota(n, EJ.yM);
      const W = N.group(parent), Cg = N.group(W);
      nota(Cg, n, x, EJ.yM);
      const t = ta + i * (o.d || 0.16);
      pop(s, W, t, 1e9, cx, y, { k0: .5, fi: .25 });
      const NM = N.group(parent), nmIn = N.group(NM);
      frase(nmIn, noms[i], cx, EJ.yNom, { size: 32, peso: 700, anchor: 'middle', fill: 'currentColor' });
      color(nmIn, C.blanco);
      return { W, Cg, NM, nmIn, x, cx, y, t };
    });
  }
  /** Panel de la respuesta (a la derecha del pentagrama). */
  const RESP = { cx: 1590, y: 470, w: 280, h: 180 };
  function panelRespuesta(s, parent, ta, fin) {
    const G = N.group(parent);
    panel(G, RESP.cx - RESP.w / 2, RESP.y, RESP.w, RESP.h, { rx: 22 });
    texto(G, 'RESPUESTA', RESP.cx, RESP.y + 40, { anchor: 'middle', size: 20, peso: 800, ls: '0.2em', fill: C.suave });
    aparece(s, G, ta, fin, { dy: 8 });
    return G;
  }

  // ================================================================ G · número romano y nombre de cada grado · K · dos familias
  function escenaGrados() {
    const a = F0('G0') - 0.2, b = F0('E0') + 0.2;
    escena('grados', a, b, (s, g) => {
      const fin = b - 0.3;
      const yM = 370, COL = i => 300 + i * 205, yRom = 522, yN1 = 612, yN2 = 656;
      const NOTAS = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
      const tAgr = Wd('K1', 'agrupan') - 0.2;
      // cada grado, en rosa mientras se explica
      const act = [
        [Wd('G2', 'primero') - 0.2, F0('G3') - 0.15],
        [F0('G3') - 0.15, F0('G4') - 0.15],
        [F0('G4') - 0.15, F0('G5') - 0.15],
        [F0('G5') - 0.15, Wd('G6', 'quinto') - 0.15],
        [Wd('G6', 'quinto') - 0.15, Wd('G6', 'sexto') - 0.15],
        [Wd('G6', 'sexto') - 0.15, Wd('G6', 'septimo') - 0.15],
        [Wd('G6', 'septimo') - 0.15, tAgr],
      ];
      // ---------- la escala de Do M (se va al agrupar las familias)
      const PE = N.group(g);
      aparece(s, PE, Wd('G0', 'escala') - 0.3, tAgr + 0.5, { dy: 0 });
      pentaClave(PE, 125, yM, 1675);
      const tNotas = Wd('G0', 'escala') - 0.1;
      NOTAS.forEach((n, i) => {
        const W = N.group(PE), Cg = N.group(W);
        nota(Cg, n, COL(i) - 15.3, yM);
        pop(s, W, tNotas + i * 0.12, 1e9, COL(i), yNota(n, yM), { k0: .5, fi: .25 });
        resalta(s, Cg, act[i][0], act[i][1]);
      });
      // la tónica: el centro, la casa, el reposo
      const tG3 = F0('G3') - 0.15;
      const cen = N.group(g); color(cen, C.rosa);
      N.el('circle', { cx: COL(0), cy: yNota('C4', yM), r: 34, fill: 'none', stroke: 'currentColor', 'stroke-width': 3.5 }, cen);
      mostrarEn(s, cen, Wd('G2', 'centro') - 0.15, tG3, .3, .35);
      const casa = N.group(g); icoCasa(casa, COL(0), 236, 1.3); color(casa, C.rosa);
      pop(s, casa, Wd('G2', 'casa') - 0.2, tG3, COL(0), 236);
      const rep = texto(g, 'reposo', COL(0), yN2, { anchor: 'middle', size: 26, peso: 600, italic: true, fill: C.suave });
      aparece(s, rep, Wd('G2', 'reposo') - 0.2, tG3, { dy: 6 });

      // ---------- huecos para los nombres (G0: «y un nombre») y los nombres, uno a uno
      const tNom = Wd('G0', 'nombre') - 0.2;
      const nombres = [
        [['Tónica', Wd('G2', 'tonica') - 0.2]],
        [['Supertónica', Wd('G3', 'supertonica') - 0.2]],
        [['Mediante', Wd('G4', 'mediante') - 0.2], ['o modal', Wd('G4', 'modal') - 0.2]],
        [['Subdominante', Wd('G5', 'subdominante') - 0.2]],
        [['Dominante', Wd('G6', 'dominante') - 0.2]],
        [['Superdominante', Wd('G6', 'superdominante') - 0.2]],
        [],
      ];
      const tHueco = i => i === 6 ? Wd('G7', 'subtonica') - 0.2 : nombres[i][0][1];
      for (let i = 0; i < 7; i++) {
        const ln = N.line(g, COL(i) - 58, yN1 + 12, COL(i) + 58, yN1 + 12, 3, { 'stroke-dasharray': '7 9', 'stroke-linecap': 'round', stroke: C.tenue });
        mostrarEn(s, ln, tNom + i * 0.08, tHueco(i) + 0.15, .3, .25);
      }
      nombres.forEach((L, i) => L.forEach(([txt, ta], j) => {
        const G = N.group(g);
        texto(G, txt, COL(i), j ? yN2 : yN1, { anchor: 'middle', size: 27, peso: 700, fill: 'currentColor' });
        color(G, C.blanco);
        aparece(s, G, ta, tAgr + 0.4, { dy: 6 });
        resalta(s, G, ta, act[i][1]);
      }));
      // ---------- el séptimo: depende de la distancia a la tónica (la de arriba)
      const tSep = act[6][0], tDist = Wd('G6', 'distancia') - 0.2, tTon = Wd('G6', 'tonica') - 0.2;
      const tSub = Wd('G7', 'subtonica') - 0.2, tUno = Wd('G7', 'tono') - 0.2;
      const tSen = Wd('G8', 'sensible') - 0.2, tMed = Wd('G8', 'medio') - 0.2;
      const oct = N.group(PE), octC = N.group(oct); nota(octC, 'C5', COL(7) - 15.3, yM);
      pop(s, oct, tDist, 1e9, COL(7), yNota('C5', yM), { k0: .5 });
      colorSeq(s, octC, [[-1, C.blanco], [tTon, C.rosa]]);
      const rI = N.group(g); texto(rI, 'I', COL(7), yRom + 18, { anchor: 'middle', size: 50, peso: 800, fill: 'currentColor' });
      aparece(s, rI, tDist + 0.1, tAgr + 0.4, { dy: 8 });
      colorSeq(s, rI, [[-1, C.suave], [tTon, C.rosa]]);
      const ton = texto(g, 'tónica', COL(7), yN1, { anchor: 'middle', size: 27, peso: 700, italic: true, fill: C.suave });
      aparece(s, ton, tTon + 0.1, tAgr + 0.4, { dy: 6 });
      // Si–Do (el VII y la tónica de arriba). Norma de Iago: tono = arco redondo, semitono = pico en V, siempre por debajo
      const nSi = { cx: COL(6), y: yNota('B4', yM), w: 30.7 }, nDo8 = { cx: COL(7), y: yNota('C5', yM), w: 30.7 };
      const vG = N.group(g); color(vG, C.rosa);
      const vIn = N.group(vG); const pv = distancia(vIn, nSi, nDo8, 'st', { w: 4, prof: 50 });
      barrido(s, vIn, COL(6) - 20, COL(7) + 20, yM - 20, pv._yb + 20, tMed, 0.5, 1);
      mostrarEn(s, vG, tMed, tAgr + 0.4, .2);
      const yLab = pv._yb + 36;
      const q = texto(g, '?', (COL(6) + COL(7)) / 2, yLab, { anchor: 'middle', size: 36, peso: 800, fill: C.rosa });
      mostrarEn(s, q, tDist + 0.5, tMed + 0.1, .3, .25);
      const med = texto(g, '½', (COL(6) + COL(7)) / 2, yLab, { anchor: 'middle', size: 36, peso: 800, fill: C.rosa });
      mostrarEn(s, med, tMed + 0.1, tAgr + 0.4, .3);
      // debajo del VII: subtónica (a 1 tono) · sensible (a ½ tono); en Do M, Si es la sensible
      const x7 = COL(6);
      const sub = N.group(g); texto(sub, 'Subtónica', x7, yN1, { anchor: 'middle', size: 27, peso: 700, fill: 'currentColor' });
      aparece(s, sub, tSub, tAgr + 0.4, { dy: 6 });
      colorSeq(s, sub, [[-1, C.rosa], [tSen, C.suave]]);
      const sub2 = texto(g, 'a 1 tono', x7, yN1 + 32, { anchor: 'middle', size: 23, peso: 600, italic: true, fill: C.suave });
      aparece(s, sub2, tUno, tAgr + 0.4, { dy: 6 });
      const sen = N.group(g); texto(sen, 'Sensible', x7, yN1 + 82, { anchor: 'middle', size: 27, peso: 700, fill: 'currentColor' });
      aparece(s, sen, tSen, tAgr + 0.4, { dy: 6 });
      color(sen, C.rosa);
      const sen2 = N.group(g); const sen2t = texto(sen2, 'a ½ tono', x7, yN1 + 114, { anchor: 'middle', size: 23, peso: 600, italic: true, fill: 'currentColor' });
      aparece(s, sen2, tMed, tAgr + 0.4, { dy: 6 });
      color(sen2, C.rosa);
      // el mismo código en pequeño junto a cada distancia: arco = tono · pico = semitono
      const miniDist = (tipo, txtEl, yBase, ta, col) => {
        const G = N.group(g); color(G, col);
        const x0 = x7 + D.medir(txtEl) / 2 + 12;
        (tipo === 'st' ? picoSemitono : arcoTono)(G, x0, yBase - 15, x0 + 34, yBase - 15, { prof: 11, w: 2.8 });
        aparece(s, G, ta, tAgr + 0.4, { dy: 6 });
      };
      miniDist('T', sub2, yN1 + 32, tUno, C.suave);
      miniDist('st', sen2t, yN1 + 114, tMed, C.rosa);

      // ---------- K · dos familias: los números se mudan a su caja al nombrarlos; el II se queda solo
      const Lc = { x: 170, w: 600, cx: 470 }, Rc = { x: 1150, w: 600, cx: 1450 };
      const yCaja = 430, hCaja = 262, yNC = 536, yArriba = 330;
      const tFam = Wd('K1', 'familias') - 0.2, tTonales = Wd('K1', 'tonales') - 0.2, tModales = Wd('K3', 'modales') - 0.2;
      const tK4 = F0('K4') - 0.1, tSeg = Wd('K4', 'segundo') - 0.2, tOlv = Wd('K4', 'olvidado') - 0.15;
      const caja = (B, titulo, tT, t1) => {
        const G = N.group(g);
        const r = panel(G, B.x, yCaja, B.w, hCaja, { rx: 24 });
        aparece(s, G, tFam, fin, { dy: 12 });
        const tt = N.group(G); texto(tt, titulo, B.cx, yCaja + hCaja - 40, { anchor: 'middle', size: 30, peso: 800, ls: '0.2em', fill: 'currentColor' });
        mostrarEn(s, tt, tT, 1e9, .3);
        s.on(t => { const k = win(t, tT, t1, .35, .35); r.setAttribute('stroke', mezcla('#3a4556', C.rosa, k)); r.setAttribute('stroke-width', (1.5 + 1.5 * k).toFixed(2)); color(tt, mezcla(C.blanco, C.rosa, k)); });
      };
      caja(Lc, 'TONALES', tTonales, tModales);
      caja(Rc, 'MODALES', tModales, tK4);
      const destino = [
        { x: Lc.cx - 170, t: Wd('K1', 'primero') - 0.25, fam: [tTonales, tModales] },
        { x: CX, t: tSeg, fam: null },
        { x: Rc.cx - 170, t: Wd('K3', 'tercero') - 0.25, fam: [tModales, tK4] },
        { x: Lc.cx, t: Wd('K1', 'cuarto') - 0.25, fam: [tTonales, tModales] },
        { x: Lc.cx + 170, t: Wd('K1', 'quinto') - 0.25, fam: [tTonales, tModales] },
        { x: Rc.cx, t: Wd('K3', 'sexto') - 0.25, fam: [tModales, tK4] },
        { x: Rc.cx + 170, t: Wd('K3', 'septimo') - 0.25, fam: [tModales, tK4] },
      ];
      const tRom = Wd('G0', 'numero') - 0.15;
      ROM.forEach((r, i) => {
        const O = N.group(g), M = N.group(O), Cg = N.group(M);
        texto(Cg, r, 0, 18, { anchor: 'middle', size: 50, peso: 800, fill: 'currentColor' });
        mostrarEn(s, O, tRom + i * 0.1, fin, .3, .4);
        const De = destino[i];
        s.on(t => {
          const k0 = eo(ramp(t, tRom + i * 0.1, tRom + i * 0.1 + 0.4));
          const k1 = ease(ramp(t, tAgr, tAgr + 0.8)), k2 = ease(ramp(t, De.t, De.t + 0.8));
          const x = lerp(COL(i), De.x, k2), y = lerp(lerp(yRom, yArriba, k1), yNC, k2) + (1 - k0) * 10;
          let rot = 0;
          if (i === 1 && t > tOlv) { const u = t - tOlv; rot = -11 * Math.sin(u * 2 * Math.PI * 1.4) * Math.exp(-u / 1.1) - 6 * ease(ramp(t, tOlv, tOlv + 0.4)); }
          M.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${lerp(1, 1.25, k2).toFixed(3)}) rotate(${rot.toFixed(2)})`);
          let k = win(t, act[i][0], act[i][1], .3, .3);
          if (De.fam) k = Math.max(k, win(t, De.t, De.fam[1], .3, .35));
          const base = i === 1 ? mezcla(C.blanco, C.suave, ease(ramp(t, tSeg, tSeg + 0.5))) : C.blanco;
          color(Cg, k > 0 ? mezcla(i === 1 && t > tSeg ? C.suave : C.blanco, C.rosa, k) : base);
        });
      });
      // K2 · los tonales se tocan en el dictado para saber la tonalidad
      const dic = N.group(g);
      const oi = N.group(dic); icoOido(oi, Lc.x + 38, yCaja + hCaja + 70, 0.8); color(oi, C.rosa);
      texto(dic, 'se tocan en el dictado', Lc.x + 90, yCaja + hCaja + 62, { size: 30, peso: 700, fill: C.blanco });
      texto(dic, 'para saber la tonalidad', Lc.x + 90, yCaja + hCaja + 100, { size: 26, peso: 600, italic: true, fill: C.suave });
      aparece(s, dic, Wd('K2', 'tocamos') - 0.2, fin, { dy: 8 });
      // K4 · el II, olvidado
      const olv = texto(g, 'olvidado…', CX, yNC + 88, { anchor: 'middle', size: 30, peso: 700, italic: true, fill: C.rosa });
      aparece(s, olv, tOlv + 0.1, fin, { dy: 6 });
    });
  }

  // ================================================================ E · ejercicio 1: ¿cuál es la subdominante de Fa M?
  function escenaEjercicio1() {
    const a = F0('E0') - 0.1, b = F0('V1') + 0.2;
    escena('ejercicio1', a, b, (s, g) => {
      const fin = b - 0.3;
      // E0 · los dos ejercicios típicos
      const tDos = Wd('E0', 'dos') - 0.15, tFuera0 = F0('E1') + 0.1;
      const k0 = N.group(g); chip(k0, 'DOS EJERCICIOS TÍPICOS', CX, 400, { size: 34, anchor: 'middle', relleno: false });
      pop(s, k0, tDos, tFuera0, CX, 400);
      [1, 2].forEach((n, i) => {
        const G = N.group(g), x = CX + (i ? 110 : -110);
        N.el('rect', { x: x - 70, y: 470, width: 140, height: 140, rx: 20, fill: C.panel, stroke: C.rosa, 'stroke-width': 2.5 }, G);
        texto(G, String(n), x, 572, { anchor: 'middle', size: 84, peso: 800, fill: C.blanco });
        pop(s, G, Wd('E0', 'ejercicios') - 0.15 + i * 0.2, tFuera0, x, 540);
      });
      // E1 · cabecera y pregunta
      const k1 = N.group(g); chip(k1, 'EJERCICIO 1', CX, 104, { size: 26, anchor: 'middle' });
      pop(s, k1, Wd('E1', 'primero') - 0.15, fin, CX, 104);
      const tQ = Wd('E1', 'cual') - 0.2;
      const sub = texto(g, 'te pregunto un grado', CX, 196, { anchor: 'middle', size: 36, peso: 600, italic: true, fill: C.suave });
      aparece(s, sub, Wd('E1', 'pregunto') - 0.15, tQ + 0.15, { dy: 6 });
      const Q = N.group(g);
      const fq = frase(Q, [['¿Cuál es la ', C.blanco], ['subdominante', C.rosa], [' de Fa M?', C.blanco]], CX, 200, { size: 48, peso: 800, anchor: 'middle' });
      aparece(s, Q, tQ + 0.15, fin, { dy: 8 });
      const xSub = (fq._segs[1].x0 + fq._segs[1].x1) / 2;
      const iv = texto(g, '= IV', xSub, 248, { anchor: 'middle', size: 30, peso: 800, fill: C.rosa });
      aparece(s, iv, Wd('E5', 'cuarto') - 0.15, fin, { dy: 6 });
      // pasos
      const tCab = Wd('E2', 'cabecitas') - 0.1, tP2 = Wd('E3', 'paso') - 0.2, tP3 = Wd('E4', 'paso') - 0.2, tComp = Wd('E7', 'compruebo') - 0.25;
      const P = filaPasos(g, [{ n: '1', txt: 'Cabecitas' }, { n: '2', txt: 'Armadura' }, { n: '3', txt: 'Busco el grado' }, { n: '4', txt: 'Compruebo la armadura', ico: icoRetro }], 318);
      animaPaso(s, P[0], tCab - 0.1, tCab - 0.1, F0('E3') - 0.1, fin);
      animaPaso(s, P[1], tP2, tP2, F0('E4') - 0.1, fin);
      animaPaso(s, P[2], tP3, tP3, tComp, fin);
      animaPaso(s, P[3], tComp, tComp, fin + 1, fin);
      // pentagrama: cabecitas (paso 1) y armadura (paso 2)
      const yM = EJ.yM;
      const PE = N.group(g);
      aparece(s, PE, Wd('E2', 'poner') - 0.2, fin, { dy: 0 });
      const Pz = pentaClave(PE, EJ.x, yM, EJ.ancho);
      const A = N.armaduraGen(PE, Pz.x0 + 4, yM, SP, 1, 'b');
      const bem = A.items[0], xBem = bem.x + 12;
      const tBem = Wd('E3', 'bemol') - 0.15, tArmE = Wd('E3', 'armadura') - 0.2;
      const hueco = N.el('rect', { x: bem.x - 8, y: yM - 62, width: 44, height: 90, rx: 8, fill: 'none', stroke: C.rosa, 'stroke-width': 2.5, 'stroke-dasharray': '6 7' }, g);
      mostrarEn(s, hueco, tArmE, tBem + 0.2, .3, .3);
      pop(s, bem.g, tBem, 1e9, xBem, yM - 14, { k0: .4 });
      const tMira = Wd('E7', 'armadura') - 0.15;
      colorSeq(s, bem.g, [[-1, C.rosa], [F0('E4') - 0.1, C.blanco], [tMira, C.rosa]]);
      const NOT = ['F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'], NOM = ['Fa', 'Sol', 'La', 'Si', 'Do', 'Re', 'Mi'];
      const cab = cabecitas(s, PE, NOT, NOM, tCab);
      const tSib = Wd('E7', 'si') - 0.1;
      cab.forEach((c, i) => mostrarEn(s, c.NM, c.t + 0.1, i === 3 ? tSib + 0.05 : 1e9, .25, .3));
      // paso 3 · la subdominante es el IV: 1, 2, 3, 4 → Si
      const tc = ['uno', 'dos', 'tres', 'cuatro'].map(w => Wd('E5', w) - 0.08);
      const tEsp = Wd('E7', 'espera') - 0.15;
      cuenta(s, PE, cab.slice(0, 4).map(c => ({ x: c.cx, y: 470 })), tc, tEsp, { size: 34 });
      cab.slice(0, 3).forEach((c, i) => destella(s, c.Cg, [tc[i]], { d: 0.6 }));
      colorSeq(s, cab[3].Cg, [[-1, C.blanco], [tc[3], C.rosa]], .2);
      colorSeq(s, cab[3].nmIn, [[-1, C.blanco], [tc[3], C.rosa]], .2);
      const iv2 = texto(PE, 'IV', cab[3].cx, EJ.yRom, { anchor: 'middle', size: 32, peso: 800, fill: C.rosa });
      mostrarEn(s, iv2, tc[3] + 0.1, 1e9, .3);
      // E6 · «Es Si.»  E7 · ¡espera! compruebo la armadura (retrovisor) → ¡Si♭!
      const tSi = Wd('E6', 'si') - 0.15, tNo = Wd('E7', 'no') - 0.1, tOk = Wd('E7', 'bemol') - 0.1;
      panelRespuesta(s, g, tSi - 0.2, fin);
      const r1 = N.group(g); frase(r1, 'Si', RESP.cx, RESP.y + 128, { size: 66, peso: 800, anchor: 'middle', fill: 'currentColor' });
      colorSeq(s, r1, [[-1, C.blanco], [tEsp, C.suave]]);
      mostrarEn(s, r1, tSi, tSib + 0.05, .25, .3);
      const r2 = N.group(g); frase(r2, 'Si♭', RESP.cx, RESP.y + 128, { size: 66, peso: 800, anchor: 'middle', fill: C.rosa });
      pop(s, r2, tSib, fin, RESP.cx, RESP.y + 105, { k0: .6 });
      const xm = RESP.cx + 98, ym = RESP.y + 106;
      const mx = N.group(g); marca(mx, false, xm, ym, 13);
      pop(s, mx, tNo, tSib + 0.1, xm, ym, { k0: .3 });
      const mv = N.group(g); marca(mv, true, xm, ym, 14);
      pop(s, mv, tOk, fin, xm, ym, { k0: .3 });
      const sib = N.group(PE), sibIn = N.group(sib); frase(sibIn, 'Si♭', cab[3].cx, EJ.yNom, { size: 32, peso: 700, anchor: 'middle', fill: C.rosa });
      pop(s, sib, tSib, 1e9, cab[3].cx, EJ.yNom - 12, { k0: .6 });
      // el retrovisor mira a la armadura
      const xR = cab[3].cx, yR = 430;
      const RV = N.group(g); retrovisor(RV, xR, yR, 1); color(RV, C.blanco);
      pop(s, RV, tComp, fin, xR, yR);
      const rf = N.group(g); reflejo(rf, xR - 8, yR, 'accidentalFlat', 15); color(rf, C.rosa);
      pop(s, rf, tMira, fin, xR - 8, yR, { k0: .3 });
      const en = N.group(g); color(en, C.rosa);
      const enF = N.group(en); enlace(enF, xR - 100, yR, xBem, yM - 56, { c1: [xR - 330, yR - 6], c2: [xBem, yR - 10], w: 3.5 });
      barrido(s, enF, xBem - 30, xR - 90, yR - 40, yM, tComp + 0.35, 0.7, -1);
      mostrarEn(s, en, tComp + 0.35, fin, .2);
    });
  }

  // ================================================================ V · ejercicio 2: ¿qué intervalo hay entre la modal y la dominante de Si m?
  function escenaEjercicio2() {
    const a = F0('V1') - 0.1, b = F0('R1') + 0.2;
    escena('ejercicio2', a, b, (s, g) => {
      const fin = b - 0.3;
      const k1 = N.group(g); chip(k1, 'EJERCICIO 2', CX, 104, { size: 26, anchor: 'middle' });
      pop(s, k1, Wd('V1', 'segundo') - 0.15, fin, CX, 104);
      const tQ = Wd('V2', 'que', 2) - 0.2;
      const sub = texto(g, 'te pregunto el intervalo entre dos grados', CX, 196, { anchor: 'middle', size: 36, peso: 600, italic: true, fill: C.suave });
      aparece(s, sub, Wd('V2', 'pregunto') - 0.15, tQ + 0.15, { dy: 6 });
      const Q = N.group(g);
      const fq = frase(Q, [['¿Qué intervalo hay entre la ', C.blanco], ['modal', C.rosa], [' y la ', C.blanco], ['dominante', C.rosa], [' de Si m?', C.blanco]], CX, 200, { size: 44, peso: 800, anchor: 'middle' });
      aparece(s, Q, tQ + 0.15, fin, { dy: 8 });
      const tTer = Wd('V6', 'tercer') - 0.15, tQui = Wd('V6', 'quinto') - 0.15;
      const iii = texto(g, '= III', (fq._segs[1].x0 + fq._segs[1].x1) / 2, 246, { anchor: 'middle', size: 28, peso: 800, fill: C.rosa });
      aparece(s, iii, tTer, fin, { dy: 6 });
      const vv = texto(g, '= V', (fq._segs[3].x0 + fq._segs[3].x1) / 2, 246, { anchor: 'middle', size: 28, peso: 800, fill: C.rosa });
      aparece(s, vv, tQui, fin, { dy: 6 });
      // pasos (ya los conocemos: aparecen todos y se va encendiendo el que toca)
      const tV3 = F0('V3') - 0.3, tCab = Wd('V3', 'cabecitas') - 0.1, tArm = Wd('V4', 'armadura') - 0.2;
      const tMod = Wd('V6', 'modal') - 0.2, tMiro = Wd('V7', 'miro') - 0.15, tV8 = Wd('V8', 'refa') - 0.2;
      const P = filaPasos(g, [{ n: '1', txt: 'Cabecitas' }, { n: '2', txt: 'Armadura' }, { n: '3', txt: 'Busco el grado' }, { n: '4', txt: 'Compruebo la armadura', ico: icoRetro }], 318);
      animaPaso(s, P[0], tV3, Wd('V3', 'coloco') - 0.2, tArm, fin);
      animaPaso(s, P[1], tV3 + 0.1, tArm, tMod, fin);
      animaPaso(s, P[2], tV3 + 0.2, tMod, tMiro, fin);
      animaPaso(s, P[3], tV3 + 0.3, tMiro, tV8, fin);
      // pentagrama: cabecitas de Si a La
      const yM = EJ.yM;
      const PE = N.group(g);
      aparece(s, PE, Wd('V3', 'coloco') - 0.2, fin, { dy: 0 });
      const Pz = pentaClave(PE, EJ.x, yM, EJ.ancho);
      const NOT = ['B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'], NOM = ['Si', 'Do', 'Re', 'Mi', 'Fa', 'Sol', 'La'];
      const cab = cabecitas(s, PE, NOT, NOM, tCab, { d: 0.15 });
      const tFas = Wd('V8', 'fa') - 0.1;
      cab.forEach((c, i) => mostrarEn(s, c.NM, c.t + 0.1, i === 4 ? tFas + 0.05 : 1e9, .25, .3));
      // paso 2 · la armadura de Si m: su relativo es Re M → 2♯ (Fa, Do)
      const tSim = Wd('V4', 'si') - 0.15, tRel = Wd('V4', 'relativo') - 0.15, tReM = Wd('V4', 're', 2) - 0.15, tSos = Wd('V4', 'sostenidos') - 0.2;
      const tDos = Wd('V5', 'dos') - 0.15, tFa = Wd('V5', 'fa') - 0.1, tDo = Wd('V5', 'do', 2) - 0.1, tFuera = F0('V6') - 0.2;
      const A = N.armaduraGen(PE, Pz.x0 + 4, yM, SP, 2, '#');
      A.items.forEach((it, i) => pop(s, it.g, [tFa, tDo][i], 1e9, it.x + 13, yM - it.pos * SP, { k0: .4, fi: .25 }));
      colorSeq(s, A.items[0].g, [[-1, C.rosa], [tFuera, C.blanco], [Wd('V7', 'retrovisor') - 0.1, C.rosa]]);
      colorSeq(s, A.items[1].g, [[-1, C.rosa], [tFuera, C.blanco]]);
      const REL = N.group(g);
      s.on(t => opa(REL, 1 - ease(ramp(t, tFuera - 0.4, tFuera))));
      const cSi = chipTon(REL, 'B', 'menor', RESP.cx, 450, { size: 34, fondo: C.panel, borde: C.blanco });
      pop(s, cSi, tSim, 1e9, RESP.cx, 450);
      const fl = N.group(REL); color(fl, C.suave); flecha(fl, RESP.cx, 492, RESP.cx, 540, { w: 4, cab: 14 });
      mostrarEn(s, fl, tRel, 1e9, .3);
      const rl = texto(REL, 'relativo', RESP.cx + 22, 524, { size: 24, peso: 600, italic: true, fill: C.suave });
      mostrarEn(s, rl, tRel, 1e9, .3);
      const cRe = chipTon(REL, 'D', 'mayor', RESP.cx, 588, { size: 34 });
      pop(s, cRe, tReM, 1e9, RESP.cx, 588);
      const s1 = fraseG(REL, [['♯', C.rosa]], RESP.cx, 700, { size: 64, peso: 800, anchor: 'middle' });
      s.on(t => opa(s1, win(t, tSos, tDos + 0.1, .3, .25)));
      const s2 = fraseG(REL, [['2♯', C.rosa]], RESP.cx, 700, { size: 64, peso: 800, anchor: 'middle' });
      mostrarEn(s, s2, tDos + 0.05, 1e9, .25);
      // paso 3 · modal = III (Re) · dominante = V (Fa)
      const roms = cab.map((c, i) => {
        const G = N.group(PE); texto(G, ROM[i], c.cx, EJ.yRom, { anchor: 'middle', size: 30, peso: 800, fill: 'currentColor' });
        color(G, C.suave); mostrarEn(s, G, tMod + i * 0.07, 1e9, .25); return G;
      });
      const tRe = Wd('V6', 're') - 0.1, tFaV = Wd('V6', 'fa') - 0.1;
      colorSeq(s, roms[2], [[-1, C.suave], [tTer, C.rosa]]);
      colorSeq(s, roms[4], [[-1, C.suave], [tQui, C.rosa]]);
      const lMod = texto(PE, 'modal', cab[2].cx, EJ.yRom + 44, { anchor: 'middle', size: 26, peso: 700, italic: true, fill: C.rosa });
      mostrarEn(s, lMod, tTer + 0.1, 1e9, .3);
      const lDom = texto(PE, 'dominante', cab[4].cx, EJ.yRom + 44, { anchor: 'middle', size: 26, peso: 700, italic: true, fill: C.rosa });
      mostrarEn(s, lDom, tQui + 0.1, 1e9, .3);
      const S3 = S.SON_3M || [F0('SON_3M') + 0.1, F0('SON_3M') + 0.75, F0('SON_3M') + 1.45];
      const brillo = (c, t0, ts) => s.on(t => { let k = 0; for (const x of ts) k = Math.max(k, win(t, x - 0.05, x + 0.9, .08, .5)); color(c, t < t0 ? C.blanco : mezcla(C.rosa, C.blanco, 0.7 * k)); });
      brillo(cab[2].Cg, tRe, [S3[0], S3[2]]);
      brillo(cab[4].Cg, tFaV, [S3[1], S3[2]]);
      colorSeq(s, cab[2].nmIn, [[-1, C.blanco], [tRe, C.rosa]], .2);
      colorSeq(s, cab[4].nmIn, [[-1, C.blanco], [tFaV, C.rosa]], .2);
      // paso 4 · miro por el retrovisor: ¡Fa♯!
      const tRet = Wd('V7', 'retrovisor') - 0.2;
      const xR = cab[4].cx, yR = 430;
      const RV = N.group(g); retrovisor(RV, xR, yR, 1); color(RV, C.blanco);
      pop(s, RV, tMiro, F0('V9') - 0.1, xR, yR);
      const rf = N.group(g); reflejo(rf, xR - 8, yR, 'accidentalSharp', 15); color(rf, C.rosa);
      pop(s, rf, tRet + 0.1, F0('V9') - 0.1, xR - 8, yR, { k0: .3 });
      const xF = A.items[0].x + 13, yF = yM - A.items[0].pos * SP;
      const en = N.group(g); color(en, C.rosa);
      const enF = N.group(en); enlace(enF, xR - 100, yR, xF, yF - 40, { c1: [xR - 420, yR - 6], c2: [xF, yR - 10], w: 3.5 });
      barrido(s, enF, xF - 30, xR - 90, yR - 40, yM, tRet, 0.8, -1);
      mostrarEn(s, en, tRet, F0('V9') - 0.1, .2);
      const fas = N.group(PE), fasIn = N.group(fas); frase(fasIn, 'Fa♯', cab[4].cx, EJ.yNom, { size: 32, peso: 700, anchor: 'middle', fill: C.rosa });
      pop(s, fas, tFas, 1e9, cab[4].cx, EJ.yNom - 12, { k0: .6 });
      // Re–Fa♯: dos tonos → 3M
      const tDosT = Wd('V9', 'dos') - 0.15, tTonos = Wd('V9', 'tonos') - 0.1, tTerM = Wd('V9', 'tercera') - 0.15;
      [[2, 3], [3, 4]].forEach(([i, j], k) => {
        const ar = N.group(PE); color(ar, C.rosa);
        distancia(ar, { cx: cab[i].cx, y: cab[i].y, w: 30.7 }, { cx: cab[j].cx, y: cab[j].y, w: 30.7 }, 'T', { w: 3.6 });
        texto(ar, 'T', (cab[i].cx + cab[j].cx) / 2, EJ.yM + 92, { anchor: 'middle', size: 26, peso: 800, fill: 'currentColor' });
        mostrarEn(s, ar, tDosT + k * 0.25, 1e9, .25);
      });
      panelRespuesta(s, g, tV8 - 0.1, fin);
      const par = fraseG(g, 'Re–Fa♯', RESP.cx, RESP.y + 102, { size: 44, peso: 800, anchor: 'middle', fill: C.blanco });
      aparece(s, par, tV8, fin, { dy: 6 });
      const dt = texto(g, '2 tonos', RESP.cx, RESP.y + 150, { anchor: 'middle', size: 28, peso: 700, italic: true, fill: C.suave });
      aparece(s, dt, tTonos, fin, { dy: 6 });
      const c3 = N.group(g); chipInt(c3, '3M', RESP.cx, RESP.y + RESP.h + 64, { size: 40 });
      pop(s, c3, tTerM, fin, RESP.cx, RESP.y + RESP.h + 64);
      destella(s, par, [S3[0], S3[1], S3[2]], { a: C.rosa });
    });
  }

  // ================================================================ R · sensible y subtónica: el nombre ya dice la distancia
  function escenaRecuerda() {
    const a = F0('R1') - 0.1, b = F0('F1') + 0.2;
    escena('recuerda', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'RECUERDA', CX, 104, { size: 26, anchor: 'middle', relleno: false });
      pop(s, k, Wd('R1', 'recuerda') - 0.1, fin, CX, 104);
      // el nombre → la distancia a la tónica
      const tSens = Wd('R1', 'sensible') - 0.2, tSubt = Wd('R1', 'subtonica') - 0.2, tDist = Wd('R1', 'distancia') - 0.2, tCalc = Wd('R1', 'calculo') - 0.25;
      const regla2 = (x, nom, dist, ta) => {
        const G = N.group(g);
        panel(G, x, 170, 700, 96, { rx: 20 });
        texto(G, nom, x + 40, 231, { size: 38, peso: 800, fill: C.blanco });
        aparece(s, G, ta, fin, { dy: 10 });
        const D2 = N.group(g);
        const fl = N.group(D2); color(fl, C.suave); flecha(fl, x + 246, 218, x + 306, 218, { w: 4, cab: 14 });
        const td = texto(D2, dist, x + 330, 231, { size: 38, peso: 800, fill: C.rosa });
        const tt2 = texto(D2, 'de la tónica', x + 330 + D.medir(td) + 16, 231, { size: 28, peso: 600, italic: true, fill: C.suave });
        const mi = N.group(D2); color(mi, C.rosa);
        const xm = x + 330 + D.medir(td) + 16 + D.medir(tt2) + 20;
        (dist[0] === '½' ? picoSemitono : arcoTono)(mi, xm, 208, xm + 40, 208, { prof: 13, w: 3.2 });
        aparece(s, D2, tDist, fin, { dy: 6 });
      };
      regla2(230, 'sensible', '½ tono', tSens);
      regla2(990, 'subtónica', '1 tono', tSubt);
      const sc = N.group(g); chip(sc, '¡SIN CÁLCULOS!', CX, 330, { size: 26, anchor: 'middle' });
      pop(s, sc, tCalc, fin, CX, 330);
      // dos ejemplos
      const yP = 410, hP = 490, yM = 650;
      const ejemplo = (x, cab, ta, tonica, nomT, tT) => {
        const G = N.group(g);
        aparece(s, G, ta, fin, { dy: 12 });
        panel(G, x, yP, 700, hP, { rx: 24 });
        frase(G, cab, x + 350, yP + 70, { size: 38, peso: 800, anchor: 'middle' });
        pentaClave(G, x + 80, yM, 540);
        const xT = x + 440, xS = x + 280;
        const TT = N.group(G);
        nota(TT, tonica, xT, yM);
        frase(TT, nomT, xT + 15, yM + 180, { size: 32, peso: 700, anchor: 'middle', fill: C.blanco });
        texto(TT, 'tónica', xT + 15, yM + 216, { anchor: 'middle', size: 24, peso: 600, italic: true, fill: C.suave });
        mostrarEn(s, TT, tT, 1e9, .3);
        return { G, xT: xT + 15, xS: xS + 15, xSn: xS };
      };
      // sensible de Sol → Fa♯ (a ½ tono)
      const tSS = Wd('R1', 'sensible', 2) - 0.2, tNota = Wd('R1', 'nota') - 0.35;
      const tFa = Wd('R2', 'fa') - 0.1, tMed = Wd('R2', 'medio') - 0.15;
      const E1 = ejemplo(230, [['sensible', C.rosa], [' de Sol', C.blanco]], tSS, 'G4', 'Sol', Wd('R1', 'sol') - 0.15);
      const q1 = texto(g, '?', E1.xS, yM + 44, { anchor: 'middle', size: 76, peso: 800, fill: C.rosa });
      s.on(t => opa(q1, win(t, tNota, tFa + 0.15, .3, .25)));
      const nFa = N.group(g), nFaIn = N.group(nFa); nota(nFaIn, 'F#4', E1.xSn, yM); color(nFaIn, C.rosa);
      pop(s, nFa, tFa, fin, E1.xS, yNota('F#4', yM), { k0: .5 });
      const nmFa = fraseG(g, 'Fa♯', E1.xS, yM + 180, { size: 32, peso: 700, anchor: 'middle', fill: C.rosa });
      aparece(s, nmFa, tFa + 0.05, fin, { dy: 6 });
      const a1 = N.group(g); color(a1, C.rosa);
      distancia(a1, { cx: E1.xS, y: yNota('F#4', yM), w: 30.7 }, { cx: E1.xT, y: yNota('G4', yM), w: 30.7 }, 'st', { txt: '½ tono', size: 24, w: 3.6 });
      g.insertBefore(a1, nFa);                                        // el trazo, por detrás de la nota y su ♯
      mostrarEn(s, a1, tMed, fin, .3);
      // subtónica de Fa M → Mi no (½) · Mi♭ sí (1 tono)
      const tSt = Wd('R3', 'subtonica') - 0.2, tFaM = Wd('R3', 'fa') - 0.1;
      const tTono = Wd('R4', 'tono') - 0.15, tMi = Wd('R4', 'mi') - 0.1, tMib = Wd('R4', 'mi', 2) - 0.1, tBem = Wd('R4', 'bemol') - 0.1;
      const E2 = ejemplo(990, [['subtónica', C.rosa], [' de Fa M', C.blanco]], tSt, 'F4', 'Fa', tFaM);
      const q2 = texto(g, '?', E2.xS, yM + 44, { anchor: 'middle', size: 76, peso: 800, fill: C.rosa });
      s.on(t => opa(q2, win(t, tFaM, tMi + 0.15, .3, .25)));
      const nMi = N.group(g), nMiIn = N.group(nMi); const rMi = nota(nMiIn, 'Eb4', E2.xSn, yM);
      colorSeq(s, nMiIn, [[-1, C.blanco], [tBem, C.rosa]]);
      pop(s, nMi, tMi, fin, E2.xS, yNota('E4', yM), { k0: .5 });
      pop(s, rMi.alt, tBem, 1e9, E2.xSn - 16, yNota('E4', yM), { k0: .3 });
      const nm1 = fraseG(g, 'Mi', E2.xS, yM + 180, { size: 32, peso: 700, anchor: 'middle', fill: C.blanco });
      s.on(t => opa(nm1, win(t, tMi + 0.05, tBem + 0.1, .25, .25)));
      const nm2 = fraseG(g, 'Mi♭', E2.xS, yM + 180, { size: 32, peso: 700, anchor: 'middle', fill: C.rosa });
      mostrarEn(s, nm2, tBem + 0.05, fin, .25);
      const mx = N.group(g); marca(mx, false, E2.xS - 70, yM + 170, 13);
      pop(s, mx, tMi + 0.25, tBem + 0.1, E2.xS - 70, yM + 170, { k0: .3 });
      const mv = N.group(g); marca(mv, true, E2.xS - 70, yM + 170, 14);
      pop(s, mv, tBem + 0.2, fin, E2.xS - 70, yM + 170, { k0: .3 });
      // «a un tono»: el arco que buscamos (discontinuo) · «no me vale Mi»: Mi–Fa es un pico (½ tono) · «Mi bemol»: arco (1 tono)
      const nMiD = { cx: E2.xS, y: yNota('E4', yM), w: 30.7 }, nFaD = { cx: E2.xT, y: yNota('F4', yM), w: 30.7 };
      const a2 = N.group(g); color(a2, C.rosa);
      distancia(a2, nMiD, nFaD, 'T', { txt: '1 tono', size: 24, w: 3.6 }).querySelector('path').setAttribute('stroke-dasharray', '3 9');
      s.on(t => opa(a2, win(t, tTono, tMi + 0.15, .3, .25)));
      const aV = N.group(g); color(aV, C.suave);
      distancia(aV, nMiD, nFaD, 'st', { txt: '½ tono', size: 24, w: 3.6 });
      s.on(t => opa(aV, win(t, tMi + 0.1, tBem + 0.1, .3, .25)));
      const a3 = N.group(g); color(a3, C.rosa);
      distancia(a3, nMiD, nFaD, 'T', { txt: '1 tono', size: 24, w: 3.6 });
      mostrarEn(s, a3, tBem + 0.1, fin, .25);
      [a2, aV, a3].forEach(x => g.insertBefore(x, nMi));             // por detrás de la nota y su ♭
    });
  }

  // ================================================================ F · repaso: los pasos en fila
  function escenaRepaso() {
    const a = F0('F1') - 0.1, b = T.acorde + 0.15;
    escena('repaso', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'REPASO FINAL', CX, 150, { size: 28, anchor: 'middle', relleno: false });
      pop(s, k, Wd('F1', 'repaso') - 0.1, fin, CX, 150);
      const ig = texto(g, 'igual que las escalas', CX, 238, { anchor: 'middle', size: 34, peso: 600, italic: true, fill: C.suave });
      aparece(s, ig, Wd('F2', 'igual') - 0.2, fin, { dy: 6 });
      const wC = 380, gap = 26, x0 = CX - (4 * wC + 3 * gap) / 2, yC = 320, hC = 330;
      const tt = [Wd('F2', 'cabecitas') - 0.25, Wd('F3', 'armadura') - 0.2, Wd('F4', 'busco') - 0.2, Wd('F5', 'compruebo') - 0.25];
      const fins = [tt[1], tt[2], tt[3], Wd('F5', 'venga') - 0.1];
      const tits = [['Cabecitas'], ['Armadura'], ['Busco el grado'], ['Compruebo', 'la armadura']];
      tits.forEach((tl, i) => {
        const x = x0 + i * (wC + gap), cx = x + wC / 2, cy = yC + 138;
        const G = N.group(g);
        const r = panel(G, x, yC, wC, hC, { rx: 24 });
        const num = N.group(G);
        N.el('circle', { cx: x + 44, cy: yC + 44, r: 22, fill: 'none', stroke: 'currentColor', 'stroke-width': 3 }, num);
        texto(num, String(i + 1), x + 44, yC + 54, { anchor: 'middle', size: 28, peso: 800, fill: 'currentColor' });
        const ic = N.group(G);
        if (i === 0) {
          N.pentagrama(ic, cx - 130, cy + 10, 260, 16);
          ['F4', 'G4', 'A4', 'B4', 'C5'].forEach((n, j) => N.redonda(ic, n, cx - 104 + j * 46, cy + 10, 16));
        } else if (i === 1) {
          N.glyph(ic, 'accidentalFlat', cx - 62, cy + 26, 30);
          N.glyph(ic, 'accidentalSharp', cx + 16, cy + 8, 30);
        } else if (i === 2) {
          icoLupa(ic, cx + 4, cy + 4, 1.25);
          texto(ic, 'IV', cx - 8, cy + 6, { anchor: 'middle', size: 34, peso: 800, fill: 'currentColor' });
        } else {
          retrovisor(ic, cx, cy + 14, 0.95);
          reflejo(ic, cx - 8, cy + 14, 'accidentalFlat', 14);
        }
        tl.forEach((l, j) => texto(G, l, cx, yC + (tl.length > 1 ? 262 : 280) + j * 40, { anchor: 'middle', size: 32, peso: 800, fill: 'currentColor' }));
        aparece(s, G, tt[i], fin, { dy: 12 });
        s.on(t => {
          const kk = win(t, tt[i], fins[i], .3, .35);
          r.setAttribute('stroke', mezcla('#3a4556', C.rosa, kk)); r.setAttribute('stroke-width', (1.5 + 1.5 * kk).toFixed(2));
          color(num, mezcla(C.blanco, C.rosa, kk)); color(ic, mezcla(C.blanco, C.rosa, kk));
          color(G, C.blanco);
        });
      });
      // «siempre», sobre el paso 4
      const xs = x0 + 3 * (wC + gap) + wC - 40, ys = yC - 6;
      const st = N.group(g), stIn = N.group(st);
      chip(stIn, '¡SIEMPRE!', 0, 0, { size: 24, anchor: 'middle' });
      stIn.setAttribute('transform', `translate(${xs},${ys}) rotate(-7)`);
      pop(s, st, Wd('F5', 'siempre') - 0.15, fin, xs, ys, { k0: 1.5, fi: .25 });
      const ant = texto(g, 'antes de contestar', x0 + 3 * (wC + gap) + wC / 2, yC + hC + 44, { anchor: 'middle', size: 28, peso: 600, italic: true, fill: C.suave });
      aparece(s, ant, Wd('F5', 'antes') - 0.2, fin, { dy: 6 });
      const v = N.group(g); chip(v, '¡VAMOS A POR ELLO!', CX, 830, { size: 30, anchor: 'middle' });
      pop(s, v, Wd('F5', 'vamos') - 0.15, fin, CX, 830);
    });
  }

  const ORDEN = [escenaGrados, escenaEjercicio1, escenaEjercicio2, escenaRecuerda, escenaRepaso];

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
