/* =====================================================================
   ESCENAS · Enarmonías (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (enarmonias/escenas_cuerpo.js). Todo es función pura de t.
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

  // ================================================================ E16 · ENARMONÍAS (notas, intervalos y tonalidades)
  const TITULO = { kicker: 'TEORÍA  ·  ALTERACIONES', lineas: ['ENARMONÍAS'], sub: 'Mismo sonido · Distinto nombre' };

  // ---------------------------------------------------------------- utilidades de este vídeo
  /** Texto con ♭ ♯ ♮ 𝄫 𝄪 de Bravura pegados a la letra. */
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
  /** Teclado de piano (nb teclas blancas desde `desde`); cada negra con sus dos nombres. */
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
  function enciende(s, key, ts, o) {
    o = o || {};
    s.on(t => {
      let k = 0;
      for (const t0 of ts) k = Math.max(k, win(t, t0 - 0.05, t0 + (o.d || 0.55), .06, .3));
      if (o.fijo) k = Math.max(k, win(t, o.fijo[0], o.fijo[1], .25, .3));
      key.rect.setAttribute('fill', mezcla(key.base, C.rosa, k));
    });
  }
  /** Tarjeta con título arriba. Devuelve {G, r}. */
  function tarjeta(parent, x, y, w, h, tit, o) {
    o = o || {};
    const G = N.group(parent);
    const r = panel(G, x, y, w, h, { rx: 24 });
    if (tit) texto(G, tit, x + w / 2, y + 54, { anchor: 'middle', size: o.size || 28, peso: 800, ls: '0.06em', fill: o.col || C.rosa });
    return { G, r };
  }

  // ================================================================ I · dos notas enarmónicas: la misma tecla, dos nombres
  function escenaIntro() {
    const a = F0('I1') - 0.1, b = F0('G1') - 0.2;
    escena('intro', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'NOTAS ENARMÓNICAS', CX, 150, { size: 32, anchor: 'middle' });
      pop(s, k, Wd('I1', 'enarmonicas') - 0.2, fin, CX, 150);
      const d = fraseG(g, [['suenan ', C.blanco], ['igual', C.rosa], ['  ·  se llaman ', C.blanco], ['distinto', C.rosa]], CX, 250, { size: 44, peso: 800, anchor: 'middle' });
      aparece(s, d, Wd('I1', 'igual') - 0.3, fin, { dy: 8 });
      // teclado: la tecla negra entre Do y Re
      const K = teclado(g, CX - 342, 470, 'A3', 9, 76, 230);
      aparece(s, K.g, Wd('I2', 'piano') - 0.3, fin, { dy: 10 });
      const key = K.tec['C#4'];
      enciende(s, key, S.SON_NOTA || [], { fijo: [Wd('I2', 'tecla') - 0.2, fin + 1], d: 0.9 });
      // dos nombres para la misma tecla
      const tDo = Wd('I2', 'do') - 0.2, tRe = Wd('I2', 're') - 0.2;
      const L1 = N.group(g); color(L1, C.blanco);
      frase(L1, 'Do♯', key.cx - 150, 400, { size: 54, peso: 800, anchor: 'middle' });
      N.el('path', { d: `M${key.cx - 130},${412} Q${key.cx - 60},${430} ${key.cx - 12},${470}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round' }, L1);
      aparece(s, L1, tDo, fin, { dy: 6 });
      const L2 = N.group(g); color(L2, C.blanco);
      frase(L2, 'Re♭', key.cx + 150, 400, { size: 54, peso: 800, anchor: 'middle' });
      N.el('path', { d: `M${key.cx + 130},${412} Q${key.cx + 60},${430} ${key.cx + 12},${470}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round' }, L2);
      aparece(s, L2, tRe, fin, { dy: 6 });
      const eq = fraseG(g, [['=', C.rosa]], key.cx, 410, { size: 56, peso: 800, anchor: 'middle' });
      aparece(s, eq, tRe + 0.3, fin, { dy: 4 });
      // debajo: las dos escrituras en el pentagrama
      const yM = 860, PE = N.group(g); aparece(s, PE, tRe + 0.2, fin, { dy: 0 });
      pentaClave(PE, CX - 260, yM, 520);
      const n1 = nota(PE, 'C#4', CX - 30, yM), n2 = nota(PE, 'Db4', CX + 140, yM);
      [n1, n2].forEach(n => color(n.g, C.rosa));
      const O = N.group(g), Oi = N.group(O); icoOido(Oi, 0, 0, 0.9); color(Oi, C.rosa); O.setAttribute('transform', `translate(${CX + 460},${600})`);
      s.on(t => opa(O, T.bloque.SON_NOTA ? win(t, T.bloque.SON_NOTA.t0 - 0.1, T.bloque.SON_NOTA.t1, .2, .3) : 0));
    });
  }

  // ================================================================ G · casi todas tienen dos enarmónicos (tres casos del Kit)
  function escenaGrupos() {
    const a = F0('G1') - 0.2, b = F0('X1') - 0.2;
    escena('grupos', a, b, (s, g) => {
      const fin = b - 0.3;
      const t2 = fraseG(g, [['casi todas tienen ', C.blanco], ['dos', C.rosa], [' enarmónicos', C.blanco]], CX, 150, { size: 46, peso: 800, anchor: 'middle' });
      aparece(s, t2, Wd('G1', 'dos') - 0.3, fin, { dy: 8 });
      const CASOS = [
        { tit: 'UNO ABAJO, UNO ARRIBA', notas: ['E#4', 'F4', 'Gd4'], nom: ['Mi♯', 'Fa', 'Sol𝄫'], cen: 1, t0: Wd('G1', 'veces') - 0.3, tN: Wd('G2', 'fa') - 0.2, t1: F0('G3') - 0.2 },
        { tit: 'LOS DOS ARRIBA', notas: ['D#4', 'Eb4', 'Fd4'], nom: ['Re♯', 'Mi♭', 'Fa𝄫'], cen: 0, t0: F0('G3') - 0.2, tN: Wd('G4', 're') - 0.2, t1: F0('G5') - 0.2 },
        { tit: 'LOS DOS ABAJO', notas: ['Bx3', 'C#4', 'Db4'], nom: ['Si𝄪', 'Do♯', 'Re♭'], cen: 2, t0: F0('G5') - 0.2, tN: Wd('G6', 're') - 0.2, t1: fin + 1 },
      ];
      const wC = 540, gap = 36, x0 = CX - (3 * wC + 2 * gap) / 2, yC = 290, hC = 520;
      CASOS.forEach((c, i) => {
        const x = x0 + i * (wC + gap);
        const TJ = tarjeta(g, x, yC, wC, hC, c.tit, { size: 26 });
        aparece(s, TJ.G, c.t0, fin, { dy: 12 });
        s.on(t => { const k = win(t, c.t0, c.t1, .3, .3); TJ.r.setAttribute('stroke', mezcla('#3a4556', C.rosa, k)); TJ.r.setAttribute('stroke-width', (1.5 + 1.5 * k).toFixed(2)); });
        // pentagrama con las tres escrituras (suenan igual)
        const yM = yC + 250, PE = N.group(TJ.G);
        N.pentagrama(PE, x + 30, yM, wC - 60); N.claveSol(PE, x + 30 + 0.6 * SP, yM, SP);
        c.notas.forEach((n, j) => {
          const xN = x + 190 + j * 120;
          const W = N.group(PE); const r = nota(W, n, xN, yM);
          color(W, j === c.cen ? C.blanco : C.rosa);
          pop(s, W, c.tN + j * 0.35, fin, r.cx, r.y, { k0: .5 });
          const L = N.group(TJ.G); frase(L, c.nom[j], r.cx, yC + 470, { size: 40, peso: 800, anchor: 'middle' }); color(L, j === c.cen ? C.blanco : C.rosa);
          aparece(s, L, c.tN + j * 0.35, fin, { dy: 6 });
          if (j < 2) { const e = N.group(TJ.G); frase(e, '=', xN + 76, yC + 470, { size: 40, peso: 800, anchor: 'middle' }); color(e, C.suave); aparece(s, e, c.tN + j * 0.35 + 0.2, fin, { dy: 4 }); }
        });
      });
    });
  }

  // ================================================================ X · la excepción: Sol♯ solo tiene a La♭
  function escenaExcepcion() {
    const a = F0('X1') - 0.2, b = F0('V1') - 0.2;
    escena('excepcion', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, '¡EXCEPCIÓN!', CX, 220, { size: 36, anchor: 'middle' });
      pop(s, k, Wd('X1', 'excepcion') - 0.2, fin, CX, 220);
      const tS = Wd('X1', 'sol') - 0.2, tL = Wd('X1', 'la') - 0.2;
      const s1 = fraseG(g, [['Sol♯', C.blanco]], CX - 170, 420, { size: 90, peso: 800, anchor: 'middle' }); aparece(s, s1, tS, fin, { dy: 8 });
      const eq = fraseG(g, [['=', C.rosa]], CX, 420, { size: 90, peso: 800, anchor: 'middle' }); aparece(s, eq, tL - 0.1, fin, { dy: 6 });
      const s2 = fraseG(g, [['La♭', C.blanco]], CX + 170, 420, { size: 90, peso: 800, anchor: 'middle' }); aparece(s, s2, tL, fin, { dy: 8 });
      const so = fraseG(g, [['solo uno', C.rosa]], CX, 520, { size: 40, peso: 800, italic: true, anchor: 'middle' }); aparece(s, so, Wd('X1', 'solo') - 0.2, fin, { dy: 6 });
      const yM = 740, PE = N.group(g); aparece(s, PE, tL, fin, { dy: 0 });
      pentaClave(PE, CX - 220, yM, 440);
      nota(PE, 'G#4', CX - 20, yM); nota(PE, 'Ab4', CX + 110, yM);
      const rv = fraseG(g, [['y al revés', C.suave]], CX, 920, { size: 36, peso: 700, italic: true, anchor: 'middle' });
      aparece(s, rv, Wd('X2', 'reves') - 0.3, fin, { dy: 6 });
    });
  }

  // ================================================================ V · intervalos enarmónicos: parcial (cambia una) y total (cambian las dos)
  function escenaIntervalos() {
    const a = F0('V1') - 0.2, b = F0('T1') - 0.2;
    escena('intervalos', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'INTERVALOS ENARMÓNICOS', CX, 140, { size: 32, anchor: 'middle' });
      pop(s, k, Wd('V1', 'intervalos') - 0.2, fin, CX, 140);
      const PAR = [
        { tit: 'PARCIAL', sub: 'cambia una', x: 150, de: ['C4', 'E#4'], a: ['C4', 'F4'], cam: [false, true], nd: 'Do–Mi♯', na: 'Do–Fa', t0: Wd('V2', 'cambiamos') - 0.3, tA: Wd('V3', 'pasa') - 0.1, t1: F0('V5') - 0.2 },
        { tit: 'TOTAL', sub: 'cambian las dos', x: 990, de: ['C#4', 'E#4'], a: ['Db4', 'F4'], cam: [true, true], nd: 'Do♯–Mi♯', na: 'Re♭–Fa', t0: F0('V5') - 0.2, tA: Wd('V6', 'pasa') - 0.1, t1: fin + 1 },
      ];
      PAR.forEach(p => {
        const TJ = tarjeta(g, p.x, 230, 780, 640, p.tit, { size: 34 });
        aparece(s, TJ.G, p.t0, fin, { dy: 12 });
        s.on(t => { const kk = win(t, p.t0, p.t1, .3, .3); TJ.r.setAttribute('stroke', mezcla('#3a4556', C.rosa, kk)); TJ.r.setAttribute('stroke-width', (1.5 + 1.5 * kk).toFixed(2)); });
        const su = N.group(TJ.G); texto(su, p.sub, p.x + 390, 330, { anchor: 'middle', size: 34, peso: 700, italic: true, fill: C.suave });
        const yM = 560, PE = N.group(TJ.G);
        N.pentagrama(PE, p.x + 50, yM, 680); N.claveSol(PE, p.x + 50 + 0.6 * SP, yM, SP);
        const xD = p.x + 290, xA = p.x + 540;
        // antes → después (las que cambian, en rosa)
        const DE = N.group(TJ.G), AA = N.group(TJ.G);
        const AD = acorde(DE, p.de, xD, yM), AB = acorde(AA, p.a, xA, yM);   // (alteraciones escalonadas)
        AD.notas.forEach((n, j) => color(n.g, p.cam[j] ? C.rosa : C.blanco));
        AB.notas.forEach((n, j) => color(n.g, p.cam[j] ? C.rosa : C.blanco));
        aparece(s, AA, p.tA, fin, { dy: 0 });
        const fl = N.group(TJ.G); color(fl, C.suave); flecha(fl, xD + 80, yM - 2.5 * SP, xA - 40, yM - 2.5 * SP, { w: 4, cab: 14 });
        mostrarEn(s, fl, p.tA, fin, .3);
        const l1 = N.group(TJ.G); frase(l1, p.nd, xD + 16, yM + 170, { size: 38, peso: 800, anchor: 'middle' }); color(l1, C.blanco);
        const l2 = N.group(TJ.G); frase(l2, p.na, xA + 16, yM + 170, { size: 38, peso: 800, anchor: 'middle' }); color(l2, C.rosa);
        aparece(s, l2, p.tA, fin, { dy: 6 });
      });
      const si = fraseG(g, [['suena ', C.blanco], ['igual', C.rosa], ['  ·  se escribe ', C.blanco], ['distinto', C.rosa]], CX, 960, { size: 40, peso: 800, anchor: 'middle' });
      aparece(s, si, Wd('V4', 'suena') - 0.2, fin, { dy: 8 });
    });
  }

  // ================================================================ T · tonalidades enarmónicas: Fa♯ M (6♯) = Sol♭ M (6♭)
  function escenaTonalidades() {
    const a = F0('T1') - 0.2, b = F0('U1') - 0.2;
    escena('tonalidades', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'TONALIDADES ENARMÓNICAS', CX, 140, { size: 32, anchor: 'middle' });
      pop(s, k, Wd('T1', 'tonalidades') - 0.2, fin, CX, 140);
      const t1 = fraseG(g, [['suenan ', C.blanco], ['igual', C.rosa], ['  ·  distinto ', C.blanco], ['nombre', C.rosa], [' y ', C.blanco], ['armadura', C.rosa]], CX, 230, { size: 40, peso: 800, anchor: 'middle' });
      aparece(s, t1, Wd('T2', 'suenan') - 0.2, fin, { dy: 8 });
      const to = fraseG(g, [['todas las notas de la escala', C.suave]], CX, 290, { size: 32, peso: 700, italic: true, anchor: 'middle' });
      aparece(s, to, Wd('T2', 'todas') - 0.2, fin, { dy: 6 });
      const yM = 580;
      const LADOS = [
        { x: 330, n: 6, tipo: '#', nom: 'Fa♯ Mayor', sub: '6 sostenidos', t: Wd('T3', 'fa') - 0.2 },
        { x: 1030, n: 6, tipo: 'b', nom: 'Sol♭ Mayor', sub: '6 bemoles', t: Wd('T3', 'sol') - 0.2 },
      ];
      LADOS.forEach(l => {
        const G = N.group(g); aparece(s, G, l.t, fin, { dy: 10 });
        const PE = N.group(G); N.pentagrama(PE, l.x, yM, 560); N.claveSol(PE, l.x + 0.6 * SP, yM, SP);
        const AR = N.group(G); color(AR, C.rosa); N.armaduraGen(AR, l.x + 3.9 * SP, yM, SP, l.n, l.tipo);
        const nm = N.group(G); frase(nm, l.nom, l.x + 280, yM + 170, { size: 46, peso: 800, anchor: 'middle' }); color(nm, C.blanco);
        const sb = N.group(G); texto(sb, l.sub, l.x + 280, yM + 224, { anchor: 'middle', size: 30, peso: 700, italic: true, fill: C.suave });
      });
      const eq = fraseG(g, [['=', C.rosa]], CX, yM + 20, { size: 90, peso: 800, anchor: 'middle' });
      aparece(s, eq, Wd('T3', 'igual') - 0.2, fin, { dy: 6 });
      const O = N.group(g), Oi = N.group(O); icoOido(Oi, 0, 0, 0.9); color(Oi, C.rosa); O.setAttribute('transform', `translate(${CX},${yM + 250})`);
      s.on(t => opa(O, T.bloque.SON_ESC ? win(t, T.bloque.SON_ESC.t0 - 0.1, T.bloque.SON_ESC.t1, .2, .3) : 0));
    });
  }

  // ================================================================ U · ¿para qué sirve? Do♯ M (7♯) → Re♭ M (5♭)
  function escenaUtilidad() {
    const a = F0('U1') - 0.2, b = F0('R1') - 0.2;
    escena('utilidad', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, '¿PARA QUÉ SIRVE?', CX, 140, { size: 32, anchor: 'middle' });
      pop(s, k, Wd('U1', 'utilidad') - 0.2, fin, CX, 140);
      const yM = 520;
      const LADOS = [
        { x: 290, n: 7, tipo: '#', nom: 'Do♯ Mayor', sub: '7 sostenidos', t: Wd('U1', 'do') - 0.2, col: C.blanco },
        { x: 1070, n: 5, tipo: 'b', nom: 'Re♭ Mayor', sub: '5 bemoles', t: Wd('U2', 're') - 0.2, col: C.rosa },
      ];
      LADOS.forEach(l => {
        const G = N.group(g); aparece(s, G, l.t, fin, { dy: 10 });
        const PE = N.group(G); N.pentagrama(PE, l.x, yM, 560); N.claveSol(PE, l.x + 0.6 * SP, yM, SP);
        const AR = N.group(G); color(AR, l.col); N.armaduraGen(AR, l.x + 3.9 * SP, yM, SP, l.n, l.tipo);
        const nm = N.group(G); frase(nm, l.nom, l.x + 280, yM + 170, { size: 46, peso: 800, anchor: 'middle' }); color(nm, l.col);
        const sb = N.group(G); texto(sb, l.sub, l.x + 280, yM + 224, { anchor: 'middle', size: 30, peso: 700, italic: true, fill: C.suave });
      });
      const fl = N.group(g); color(fl, C.rosa); flecha(fl, 900, yM, 1030, yM, { w: 5, cab: 18 });
      aparece(s, fl, Wd('U2', 'pensar') - 0.2, fin, { dy: 0 });
      const me = N.group(g); chip(me, '¡2 alteraciones menos!', CX, 860, { size: 36, anchor: 'middle' });
      pop(s, me, Wd('U3', 'alteraciones') - 0.2, fin, CX, 860);
      const fr = fraseG(g, [['todos los sostenidos', C.suave]], 570, yM - 140, { size: 30, peso: 700, italic: true, anchor: 'middle' });
      aparece(s, fr, Wd('U2', 'todos') - 0.2, fin, { dy: 6 });
    });
  }

  // ================================================================ R · repaso final
  function escenaRepaso() {
    const a = F0('R1') - 0.1, b = T.acorde + 0.15;
    escena('repaso', a, b, (s, g) => {
      const fin = b - 0.3;
      const k = N.group(g); chip(k, 'REPASO', CX, 150, { size: 30, anchor: 'middle', relleno: false });
      pop(s, k, Wd('R1', 'repasamos') - 0.1, fin, CX, 150);
      const P = N.group(g); aparece(s, P, a + 0.1, fin, { dy: 12 });
      panel(P, 250, 220, 1420, 600, { rx: 26, stroke: 'rgba(248,250,252,0.3)', sw: 2 });
      const FIL = [
        { i: 'Enarmónico', d: 'mismo sonido, distinto nombre', t0: Wd('R1', 'enarmonico') - 0.2, t1: F0('R2') - 0.1 },
        { i: 'Intervalo parcial', d: 'cambia una nota', t0: F0('R2') - 0.2, t1: Wd('R2', 'total') - 0.3 },
        { i: 'Intervalo total', d: 'cambian las dos', t0: Wd('R2', 'total') - 0.3, t1: F0('R3') - 0.1 },
        { i: 'Tonalidades enarmónicas', d: 'la misma música, distinta armadura', t0: F0('R3') - 0.2, t1: F0('R4') - 0.1 },
      ];
      FIL.forEach((f, i) => {
        const y = 350 + i * 130, G = N.group(g);
        const iz = N.group(G); texto(iz, f.i, 330, y, { size: 42, peso: 800, fill: 'currentColor' }); color(iz, C.rosa);
        const fl = N.group(G); color(fl, C.suave); flecha(fl, 870, y - 14, 940, y - 14, { w: 4, cab: 13 });
        const de = N.group(G); texto(de, f.d, 970, y, { size: 38, peso: 700, fill: 'currentColor' }); color(de, C.blanco);
        aparece(s, G, f.t0, fin, { dy: 8 });
        s.on(t => color(de, mezcla(C.blanco, C.rosa, win(t, f.t0 + 0.5, f.t1, .3, .3))));
      });
    });
  }

  const ORDEN = [escenaIntro, escenaGrupos, escenaExcepcion, escenaIntervalos, escenaTonalidades, escenaUtilidad, escenaRepaso];

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
