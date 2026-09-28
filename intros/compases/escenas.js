/* =====================================================================
   ESCENAS · Compases (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (compases/escenas_cuerpo.js). Todo es función pura de t.
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


  // ================================================================ E5 · COMPASES
  const TITULO = { kicker: 'TEORÍA  ·  COMPASES', lineas: ['COMPASES'], sub: 'Pulsos · Subdivisión · Figuras' };

  // ---------------------------------------------------------------- utilidades propias de este vídeo
  const hx = c => { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  /** Mezcla de dos colores hex que devuelve otro hex (así se puede encadenar). */
  const mix = (c1, c2, k) => { const p = hx(c1), q = hx(c2); return '#' + p.map((v, i) => Math.round(lerp(v, q[i], clamp(k))).toString(16).padStart(2, '0')).join(''); };
  const LINEA = '#3a4556';                 // contorno apagado de las tarjetas
  const APAGADO = '#475569';               // bloques que no se están explicando
  const HB = 36;                           // alto de los bloques (duraciones)

  /** Bloque de duración (rectángulo de esquinas suaves): un pulso, una subdivisión o el compás entero. y = centro. */
  function bloque(parent, x, y, w, h, o) {
    o = o || {};
    h = h || HB;
    return N.el('rect', { x: +x.toFixed(2), y: +(y - h / 2).toFixed(2), width: +Math.max(0, w).toFixed(2), height: h, rx: o.rx != null ? o.rx : 8,
      fill: 'currentColor' }, parent);
  }
  /** Bloque centrado en cx con un número blanco dentro. Devuelve el grupo (se colorea con color()). */
  function bloqueNum(parent, cx, y, w, num, o) {
    o = o || {};
    const G = N.group(parent, 'bloque');
    bloque(G, cx - w / 2, y, w, o.h);
    if (num != null) texto(G, String(num), cx, y + (o.size || 26) * 0.36, { anchor: 'middle', size: o.size || 26, peso: 800, fill: '#ffffff' });
    return G;
  }
  /** Figura suelta (♩ 𝅗𝅥 ♪) con puntillo opcional, con la cabeza centrada en cx (y = centro de la cabeza). */
  function figuraC(parent, n, cx, y, o) {
    o = o || {};
    const sp = o.sp || SP;
    const G = N.group(parent, 'figura');
    const x = cx - 0.59 * sp - (o.punto ? 0.22 * sp : 0);
    N.figura(G, n, x, y, sp);
    if (o.punto) N.glyph(G, 'augmentationDot', x + 1.55 * sp, y, sp);
    return G;
  }
  /** Tarjeta de pregunta: número en círculo + pregunta. Origen = borde izquierdo y centro vertical. */
  function tarjeta(parent, n, txt, o) {
    o = o || {};
    const G = N.group(parent, 'tarjeta');
    const h = o.h || 124, size = o.size || 44, ty = o.ty || 0;
    const rect = N.el('rect', { x: 0, y: -h / 2, width: 100, height: h, rx: 22, fill: C.panel, stroke: LINEA, 'stroke-width': 1.5, 'vector-effect': 'non-scaling-stroke' }, G);
    const cir = N.group(G);
    N.el('circle', { cx: 66, cy: ty, r: 34, fill: 'none', stroke: 'currentColor', 'stroke-width': 3.5 }, cir);
    texto(cir, String(n), 66, ty + 14, { anchor: 'middle', size: 38, peso: 800, fill: 'currentColor' });
    const tx = N.group(G);
    const tt = texto(tx, txt, 124, ty + size * 0.36, { size, peso: 800, fill: 'currentColor' });
    const wT = D.medir(tt);
    const wBase = Math.round(124 + wT + 48);
    rect.setAttribute('width', o.w || wBase);
    return { g: G, rect, cir, tx, wBase, wT, h };
  }
  /** Colores de una tarjeta: kA = activa (rosa); kD = apagada (gris). */
  function colorTarjeta(T, kA, kD) {
    const base = mix(C.blanco, C.suave, kD * (1 - kA));
    color(T.tx, base);
    color(T.cir, mix(base, C.rosa, kA));
    T.rect.setAttribute('stroke', mix(LINEA, C.rosa, kA));
    T.rect.setAttribute('stroke-width', (1.5 + 1.5 * kA).toFixed(2));
  }
  /** Icono «¿cuántos pulsos?»: tres bloques de pulso y una interrogación. (x, y) = inicio y centro vertical. */
  function icoPulsos(parent, x, y) {
    const G = N.group(parent, 'icoPulsos');
    const B = N.group(G); color(B, C.rosa);
    for (let i = 0; i < 3; i++) bloque(B, x + i * 72, y, 60, 34);
    texto(G, '?', x + 3 * 72 + 14, y + 20, { size: 58, peso: 800, fill: C.rosa });
    return G;
  }
  /** Icono «¿en cuántas se divide?»: un bloque de pulso, «÷» y una interrogación. */
  function icoDivide(parent, x, y) {
    const G = N.group(parent, 'icoDivide');
    const B = N.group(G); color(B, C.rosa);
    bloque(B, x, y, 150, 34);
    texto(G, '÷ ?', x + 172, y + 20, { size: 58, peso: 800, fill: C.rosa });
    return G;
  }
  /** Icono «¿en dos o en tres?»: un bloque partido en dos «o» partido en tres. */
  function icoDosTres(parent, x, y) {
    const G = N.group(parent, 'icoDosTres');
    const B = N.group(G); color(B, C.rosa);
    const W = 116, gp = 8;
    [2, 3].forEach((k, j) => {
      const x0 = x + j * (W + 70), w = (W - (k - 1) * gp) / k;
      for (let i = 0; i < k; i++) bloque(B, x0 + i * (w + gp), y, w, 34, { rx: 6 });
    });
    texto(G, 'o', x + W + 35, y + 12, { anchor: 'middle', size: 36, peso: 700, fill: C.suave });
    return G;
  }

  /** Icono «¿qué figura?»: blanca, negra y corchea, y una interrogación. */
  function icoFiguras(parent, x, y) {
    const G = N.group(parent, 'icoFiguras');
    const F = N.group(G); color(F, C.rosa);
    figuraC(F, 'h', x + 20, y + 38); figuraC(F, 'q', x + 92, y + 38); figuraC(F, '8', x + 164, y + 38);
    texto(G, '?', x + 3 * 72 + 14, y + 20, { size: 58, peso: 800, fill: C.rosa });
    return G;
  }

  /** Un pulso que «se abre» (árbol pequeño): arriba, la figura del pulso sobre su bloque; al dividirse, una copia
   *  del bloque baja y se parte en k trozos, y encima aparecen las k figuras de la subdivisión.
   *  o: {cx, y (cabeza de la figura del pulso), dy (distancia entre niveles), pulso:{n, punto}, sub:'8'|'q', barra, partes, W} */
  function apertura(s, parent, o, tIn, tDiv, tOut) {
    const G = N.group(parent, 'apertura');
    const k = o.partes, W = o.W || 210, gap = 12, w = (W - (k - 1) * gap) / k;
    const dy = o.dy || 200;
    const yb0 = o.y + 60, y1 = o.y + dy, yb1 = y1 + 60;          // bloque del pulso · cabezas y bloques de la subdivisión
    const xs = Array.from({ length: k }, (_, i) => o.cx - W / 2 + w / 2 + i * (w + gap));
    // arriba: el pulso (figura + bloque)
    const fA = N.group(G); figuraC(fA, o.pulso.n, o.cx, o.y, { punto: o.pulso.punto }); color(fA, C.blanco);
    const BP = N.group(G); bloque(BP, o.cx - W / 2, yb0, W);
    // abajo: k figuras (unidas por barra si son corcheas) sobre k bloques
    const Bf = N.group(G), BfIn = N.group(Bf);
    const esp = (w + gap) / SP;
    const items = Array.from({ length: k }, () => o.barra ? { n: o.sub, barra: 'x' } : { n: o.sub });
    N.ritmo(BfIn, items, xs[0] - 0.59 * SP, y1 - SP, { sp: SP, grupoEsp: esp, espacio: { [o.sub]: esp } });
    color(Bf, C.blanco);
    const BL = N.group(G); color(BL, C.rosa);
    const trozos = xs.map(() => bloque(BL, 0, 0, w));
    const nums = N.group(G);
    xs.forEach((x, i) => texto(nums, String(i + 1), x, yb1 + 9, { anchor: 'middle', size: 24, peso: 800, fill: '#ffffff' }));
    s.on(t => {
      const v = win(t, tIn, tOut, .4, .4); opa(G, v); if (v <= 0) return;
      const kb = ease(ramp(t, tDiv, tDiv + 0.55));                 // la copia baja…
      const kd = ease(ramp(t, tDiv + 0.3, tDiv + 0.8));            // …y se parte
      color(BP, mix(C.rosa, APAGADO, kb));                         // el pulso cede el protagonismo a la subdivisión
      opa(BL, ramp(t, tDiv, tDiv + 0.1));
      const yy = lerp(yb0, yb1, kb), g2 = gap * kd, w2 = (W - (k - 1) * g2) / k;
      trozos.forEach((r, i) => { r.setAttribute('y', (yy - HB / 2).toFixed(2)); r.setAttribute('x', (o.cx - W / 2 + i * (w2 + g2)).toFixed(2)); r.setAttribute('width', w2.toFixed(2)); });
      opa(Bf, ease(ramp(t, tDiv + 0.45, tDiv + 0.85)));
      const sx = lerp(0.4, 1, eo(ramp(t, tDiv + 0.4, tDiv + 0.9)));
      BfIn.setAttribute('transform', `translate(${o.cx},0) scale(${sx.toFixed(4)},1) translate(${-o.cx},0)`);
      opa(nums, ease(ramp(t, tDiv + 0.7, tDiv + 1.0)));
    });
    return { g: G, xs, yb1, W };
  }

  // ================================================================ P · dos preguntas → se quedan arriba como índice (1 · 2 · 3)
  function escenaPreguntas() {
    const a = F0('P0') - 0.1, b = F0('X1') + 0.35;
    escena('preguntas', a, b, (s, g) => {
      const tDos = Wd('P0', 'dos') - 0.15, tMorf = F0('N1') - 0.05, tS = F0('S1') - 0.1, tG = F0('G1') - 0.1, tX = F0('X1');
      // «Cuando miras un compás…»
      const O = N.group(g);
      const oj = N.group(O); icoOjo(oj, CX, 205, 1.0); color(oj, C.rosa);
      const cc = N.group(O); const c34 = N.compas(cc, { tipo: 'simple', num: '3', den: '4' }, 0, 330, SP); color(cc, C.blanco);
      cc.setAttribute('transform', `translate(${(CX - c34.w / 2).toFixed(1)},0)`);
      aparece(s, O, F0('P0') - 0.05, tMorf + 0.45, { dy: 10 });
      // las tarjetas
      const WBIG = 1240, XBIG = CX - WBIG / 2, SI = 0.6, YI = 92, GAP = 24;
      const defs = [
        { n: 1, txt: '¿cuántos pulsos?', y: 510, tIn: tDos, tQ: Wd('P1', 'cuantos') - 0.15, ico: icoPulsos },
        { n: 2, txt: '¿en cuántas se divide cada pulso?', y: 680, tIn: tDos + 0.25, tQ: Wd('P1', 'cuantas') - 0.15, ico: icoDivide },
        { n: 3, txt: '¿qué figura ocupa cada cosa?', y: null, tIn: tG, tQ: tG - 0.2 },
      ];
      const cards = defs.map(d => {
        const out = N.group(g), inn = N.group(out);
        const T = tarjeta(inn, d.n, d.txt, { w: d.y != null ? WBIG : null });
        let icoG = null;
        if (d.ico) { icoG = N.group(inn); d.ico(icoG, WBIG - 330, 0); }
        return Object.assign({ out, inn, T, icoG }, d);
      });
      const W = cards.map(c => c.T.wBase * SI);
      const x2 = [CX - (W[0] + W[1] + GAP) / 2]; x2[1] = x2[0] + W[0] + GAP; x2[2] = x2[1] + W[1] + GAP;
      const tot3 = W[0] + W[1] + W[2] + 2 * GAP;
      const x3 = [CX - tot3 / 2]; x3[1] = x3[0] + W[0] + GAP; x3[2] = x3[1] + W[1] + GAP;
      cards.forEach((c, i) => {
        s.on(t => {
          const v = win(t, c.tIn, b, .45, .45); opa(c.out, v); if (v <= 0) return;
          // posición: grande → índice (arriba; la 2.ª sale un poco después) → se recoloca cuando llega la 3.ª
          const kM = c.y != null ? ease(ramp(t, tMorf + i * 0.3, tMorf + i * 0.3 + 0.9)) : 1;
          const k3 = ease(ramp(t, tG, tG + 0.7));
          const xI = lerp(x2[i], x3[i], k3);
          const x = c.y != null ? lerp(XBIG, xI, kM) : xI, y = c.y != null ? lerp(c.y, YI, kM) : YI;
          const sc = c.y != null ? lerp(1, SI, kM) : SI * lerp(0.9, 1, eo(ramp(t, c.tIn, c.tIn + 0.4)));
          c.inn.setAttribute('transform', `translate(${x.toFixed(2)},${y.toFixed(2)}) scale(${sc.toFixed(4)})`);
          if (c.y != null) c.T.rect.setAttribute('width', lerp(WBIG, c.T.wBase, kM).toFixed(1));
          // la pregunta (y su icono) aparece al decirla
          const kQ = ease(ramp(t, c.tQ, c.tQ + 0.4));
          opa(c.T.tx, kQ);
          if (c.icoG) opa(c.icoG, kQ * (1 - ease(ramp(t, tMorf, tMorf + 0.35))));
          // la que se está preguntando, en rosa; en el índice, las demás en gris
          let kA;
          if (i === 0) kA = Math.max(win(t, c.tQ, cards[1].tQ, .3, .3), win(t, tMorf, tS, .3, .3));
          else if (i === 1) kA = Math.max(win(t, c.tQ, tMorf + 0.3, .3, .3), win(t, tS, tG, .3, .3));
          else kA = win(t, tG, tX + 1, .3, .3);
          colorTarjeta(c.T, kA, ramp(t, tMorf, tMorf + 0.6));
        });
      });
    });
  }

  // ================================================================ N · el número de pulsos: binario, ternario, cuaternario, quinario…
  function escenaPulsos() {
    const a = F0('N2') - 0.3, b = F0('C1') + 0.5;
    escena('pulsos', a, b, (s, g) => {
      const tFin = b - 0.35;
      const filas = [
        { n: 2, nom: 'BINARIO', f: 'N2', tN: Wd('N2', 'dos'), tNom: Wd('N2', 'binario') },
        { n: 3, nom: 'TERNARIO', f: 'N3', tN: Wd('N3', 'tres'), tNom: Wd('N3', 'ternario') },
        { n: 4, nom: 'CUATERNARIO', f: 'N4', tN: Wd('N4', 'cuatro'), tNom: Wd('N4', 'cuaternario') },
        { n: 5, nom: 'QUINARIO', f: 'N5', tN: Wd('N5', 'cinco'), tNom: Wd('N5', 'quinario') },
      ];
      const xC = 380, xNom = 1150, y0 = 250, paso = 170;
      filas.forEach((F, i) => {
        const y = y0 + i * paso;
        const tIn = (i === 0 ? F0(F.f) : F.tN) - 0.25;
        const sig = filas[i + 1] ? filas[i + 1].tN - 0.2 : F1('N5');
        // el compás y sus negras
        const R = N.group(g);
        const cG = N.group(R); const c = N.compas(cG, { tipo: 'simple', num: String(F.n), den: '4' }, xC, y, SP);
        const r = N.ritmo(R, Array.from({ length: F.n }, () => ({ n: 'q' })), xC + c.w + 2.4 * SP, y, { sp: SP, espacio: { q: 4.6 } });
        color(R, C.blanco);
        aparece(s, R, tIn, tFin, { dy: 8 });
        // un bloque (rosa) por pulso, con su número
        r.notas.forEach((e, k) => {
          const cx = e.x + 0.59 * SP, yb = y + SP + 44;
          const B = bloqueNum(g, cx, yb, 92, k + 1, { h: 32 });
          color(B, C.rosa);
          pop(s, B, F.tN - 0.12 + k * 0.13, tFin, cx, yb, { fi: .25, k0: .5 });
        });
        // el nombre (en rosa mientras se dice)
        const nw = N.group(g), nIn = N.group(nw);
        const tt = texto(nIn, F.nom, xNom, y + 30, { size: 54, peso: 800, ls: '0.04em', fill: 'currentColor' });
        color(nIn, C.blanco);
        aparece(s, nw, F.tNom - 0.2, tFin, { dy: 8 });
        resalta(s, nIn, F.tNom - 0.2, sig, { de: C.blanco, a: C.rosa });
        if (F.n === 5) {           // «¡Qué palabra!»: un pequeño meneo
          const tQ = Wd('N5', 'que') - 0.05, cxN = xNom + D.medir(tt) / 2, cyN = y + 10;
          s.on(t => {
            const k = ramp(t, tQ, tQ + 0.7);
            const sc = 1 + 0.1 * Math.sin(Math.PI * k), rot = 4 * Math.sin(3 * Math.PI * k) * (1 - k);
            nIn.setAttribute('transform', `translate(${cxN},${cyN}) rotate(${rot.toFixed(2)}) scale(${sc.toFixed(4)}) translate(${-cxN},${-cyN})`);
          });
        }
      });
      // «Y así.»: tres puntos debajo de los nombres (la lista sigue)
      const mas = N.group(g);
      for (let k = 0; k < 3; k++) N.el('circle', { cx: xNom + 10 + k * 26, cy: y0 + 3 * paso + 106, r: 6.5, fill: C.suave }, mas);
      aparece(s, mas, Wd('N6', 'asi') - 0.25, tFin, { dy: 6 });
    });
  }

  // ================================================================ C · lo curioso: el 6/8 es binario (seis corcheas, dos pulsos)
  function escena68() {
    const a = F0('C1') - 0.1, b = F0('S1') + 0.4;
    escena('seisocho', a, b, (s, g) => {
      const tFin = b - 0.35;
      const tLupa = F0('C1'), t68 = Wd('C2', 'seis') - 0.2, tBin = Wd('C2', 'binario') - 0.15;
      const tCor = Wd('C3', 'seis') - 0.2, tDos = Wd('C4', 'dos') - 0.15, tNeg = Wd('C4', 'negra') - 0.15;
      const SON = (S.SON_68 && S.SON_68.length === 12) ? S.SON_68 : Array.from({ length: 12 }, (_, i) => F0('SON_68') + 0.1 + i * 0.24);
      const t2 = SON[0] - 0.6;                            // entra el 2.º compás (y todo se corre a la izquierda)
      const yM = 560;
      // «Fíjate en algo curioso»: la lupa
      const lu = N.group(g); icoLupa(lu, CX + 10, 520, 1.9); color(lu, C.rosa);
      s.on(t => opa(lu, win(t, tLupa, t68 + 0.15, .35, .3)));
      // BINARIO
      const bw = N.group(g); chip(bw, 'BINARIO', CX, 240, { size: 30, anchor: 'middle' });
      pop(s, bw, tBin, tFin, CX, 240);
      // el ritmo: 6/8 | ♪♪♪ ♪♪♪ | ♪♪♪ ♪♪♪ ||
      const it = [];
      ['a', 'b', 'c', 'd'].forEach((k, j) => { for (let i = 0; i < 3; i++) it.push({ n: '8', barra: k }); if (j === 1) it.push({ div: 'simple', pre: 1.7, post: 2.0 }); });
      it.push({ div: 'doble', pre: 1.7, post: 0 });
      const M = N.group(g);
      const cG = N.group(M); const c = N.compas(cG, { tipo: 'simple', num: '6', den: '8' }, 0, yM, SP);
      const xR = c.w + 2.4 * SP;
      const rG = N.group(M); const r = N.ritmo(rG, it, xR, yM, { sp: SP, espacio: { '8': 4.2 }, grupoEsp: 2.5 });
      color(M, C.blanco);
      const divs = r.els.filter(e => e.tipo === 'div');
      const wUno = divs[0].x + 0.3 * SP, wDos = divs[1].x + 0.9 * SP;          // ancho con uno / con dos compases
      const X0 = CX - c.w / 2, X1 = CX - wUno / 2, X2 = CX - wDos / 2;
      s.on(t => {
        const k1 = ease(ramp(t, tCor - 0.1, tCor + 0.6)), k2 = ease(ramp(t, t2 - 0.1, t2 + 0.5));
        M.setAttribute('transform', `translate(${lerp(lerp(X0, X1, k1), X2, k2).toFixed(2)},0)`);
      });
      mostrarEn(s, cG, t68, tFin, .3, .35);
      // compás 1 (al decir «seis corcheas») y compás 2 (cuando empieza a sonar)
      const gruposB = {};
      r.notas.forEach(e => (gruposB[e.it.barra] = gruposB[e.it.barra] || []).push(e));
      r.notas.forEach((e, i) => mostrarEn(s, e.g, i < 6 ? tCor + i * 0.1 : t2, tFin, .25, .35));
      Object.keys(gruposB).forEach((k, j) => mostrarEn(s, gruposB[k][0].barras, j < 2 ? tCor + (j * 3 + 2) * 0.1 : t2, tFin, .25, .35));
      mostrarEn(s, divs[0].g, tCor + 0.6, tFin, .3, .35);
      mostrarEn(s, divs[1].g, t2, tFin, .3, .35);
      // 1…6 debajo de cada corchea (la subdivisión, en gris)
      r.notas.forEach((e, i) => {
        const n = texto(M, String(i % 6 + 1), e.x + 0.59 * SP, yM + SP + 50, { anchor: 'middle', size: 26, peso: 700, fill: C.suave });
        s.on(t => { const ta = i < 6 ? tCor + i * 0.1 : t2; opa(n, win(t, ta, tFin, .25, .35) * lerp(1, 0.55, ease(ramp(t, tDos, tDos + 0.4)))); });
      });
      // dos pulsos por compás: bloque rosa con su número + negra con puntillo encima
      Object.keys(gruposB).forEach((k, j) => {
        const gr = gruposB[k];
        const xa = gr[0].x - 10, xb = gr[2].x + 1.18 * SP + 10, cx = (xa + xb) / 2, yb = yM + SP + 90;
        const Bo = N.group(M), Bi = N.group(Bo);
        bloqueNum(Bi, cx, yb, xb - xa, (j % 2) + 1, { size: 28 });
        color(Bi, C.rosa);
        pop(s, Bo, j < 2 ? tDos + j * 0.25 : t2 + 0.1, tFin, cx, yb, { fi: .3, k0: .6 });
        const Fq = N.group(M); figuraC(Fq, 'q', cx, yM - 2.5 * SP - 50, { punto: true }); color(Fq, C.rosa);
        aparece(s, Fq, j < 2 ? tNeg + j * 0.2 : t2 + 0.1, tFin, { dy: 8 });
        // al sonar: el pulso (1.ª y 4.ª corchea) se enciende más fuerte
        const tp = SON[j * 3];
        s.on(t => {
          const kf = win(t, tp - 0.03, tp + 0.4, .04, .3);
          Bi.setAttribute('transform', `translate(${cx},${yb}) scale(${(1 + 0.12 * kf).toFixed(4)}) translate(${-cx},${-yb})`);
          color(Bi, mix(C.rosa, '#ffd0e8', 0.55 * kf));
        });
      });
      // cada corchea se enciende al sonar; la que lleva el pulso (1.ª y 4.ª), además, crece
      r.notas.forEach((e, i) => {
        const hx0 = e.x + 0.59 * SP, hy0 = e.y;
        s.on(t => {
          const kf = win(t, SON[i] - 0.03, SON[i] + 0.24, .04, .16);
          color(e.g, mix(C.blanco, C.rosa, kf));
          if (i % 3 === 0) e.cabeza.setAttribute('transform', `translate(${hx0},${hy0}) scale(${(1 + 0.3 * win(t, SON[i] - 0.03, SON[i] + 0.4, .04, .3)).toFixed(4)}) translate(${-hx0},${-hy0})`);
        });
      });
    });
  }

  // ================================================================ S · la subdivisión: en dos (simples) o en tres (compuestos)
  function escenaTituloSub() {
    const a = Wd('S1', 'subdivision') - 0.3, b = F0('S2') + 0.1;
    escena('titSub', a, b, (s, g) => {
      const G = N.group(g);
      texto(G, 'SUBDIVISIÓN', CX, 560, { anchor: 'middle', size: 104, peso: 800, ls: '0.08em', fill: C.blanco });
      N.el('rect', { x: CX - 60, y: 598, width: 120, height: 5, rx: 2.5, fill: C.rosa }, G);
      s.on(t => opa(G, win(t, a, b, .4, .4)));
    });
  }
  function escenaSubdivision() {
    const a = F0('S2') - 0.25, b = F0('G1') + 0.3;
    escena('subdivision', a, b, (s, g) => {
      const tFin = b - 0.3, tS5 = F0('S5') - 0.15;
      const yF = 380, dyN = 195, yTxt = 732, yEj = 814;       // pulso · (subdivisión = yF + dyN) · rótulo · ejemplos
      // ---------- izquierda: en dos → subdivisión binaria → compases simples
      const L = N.group(g);
      panel(L, 100, 190, 930, 700, { rx: 24 });
      aparece(s, L, F0('S2') - 0.2, tFin, { dy: 10 });
      const LC = N.group(L);                             // contenido (se apaga cuando se explica el de la derecha)
      s.on(t => opa(LC, lerp(1, 0.4, ease(ramp(t, tS5, tS5 + 0.5)))));
      const tBin = Wd('S2', 'binaria') - 0.2;
      const tl = texto(LC, 'SUBDIVISIÓN BINARIA', 565, 256, { anchor: 'middle', size: 30, peso: 800, ls: '0.12em', fill: C.rosa });
      mostrarEn(s, tl, tBin, 1e9, .35);
      apertura(s, LC, { cx: 330, y: yF, dy: dyN, pulso: { n: 'q' }, sub: '8', barra: true, partes: 2 }, F0('S2'), Wd('S2', 'dos') - 0.3, 1e9);
      apertura(s, LC, { cx: 800, y: yF, dy: dyN, pulso: { n: 'h' }, sub: 'q', barra: false, partes: 2 }, Wd('S4', 'blanca') - 0.3, Wd('S4', 'dos', 2) - 0.3, 1e9);
      const ts = texto(LC, 'COMPASES SIMPLES', 565, yTxt, { anchor: 'middle', size: 44, peso: 800, ls: '0.03em', fill: C.blanco });
      aparece(s, ts, Wd('S2', 'compases') - 0.15, 1e9, { dy: 8 });
      const ej = (parent, num, den, cx, ta) => {
        const w = N.anchoCompas({ tipo: 'simple', num, den }, SP);
        const G = N.group(parent); N.compas(G, { tipo: 'simple', num, den }, cx - w / 2, yEj, SP); color(G, C.blanco);
        pop(s, G, ta, 1e9, cx, yEj, { k0: .6 });
        return G;
      };
      ej(LC, '2', '4', 260, Wd('S3', 'dos') - 0.15);
      ej(LC, '3', '4', 400, Wd('S3', 'tres') - 0.15);
      ej(LC, '2', '2', 800, Wd('S4', 'dos') - 0.15);
      // ---------- derecha: en tres → subdivisión ternaria → compases compuestos
      const R = N.group(g);
      panel(R, 1090, 190, 730, 700, { rx: 24 });
      aparece(s, R, F0('S5') - 0.2, tFin, { dy: 10 });
      const tr = texto(R, 'SUBDIVISIÓN TERNARIA', 1455, 256, { anchor: 'middle', size: 30, peso: 800, ls: '0.12em', fill: C.rosa });
      mostrarEn(s, tr, Wd('S5', 'ternaria') - 0.2, 1e9, .35);
      apertura(s, R, { cx: 1455, y: yF, dy: dyN, pulso: { n: 'q', punto: true }, sub: '8', barra: true, partes: 3 }, F0('S5'), Wd('S5', 'tres') - 0.3, 1e9);
      const tc = texto(R, 'COMPASES COMPUESTOS', 1455, yTxt, { anchor: 'middle', size: 44, peso: 800, ls: '0.03em', fill: C.blanco });
      aparece(s, tc, Wd('S5', 'compases') - 0.15, 1e9, { dy: 8 });
      ej(R, '6', '8', 1385, Wd('S5', 'seis') - 0.15);
      ej(R, '9', '8', 1525, Wd('S5', 'nueve') - 0.15);
    });
  }

  // ================================================================ G/X · qué figura ocupa cada cosa + ejemplo resuelto (6/8)
  function escenaFiguras() {
    const a = F0('G1') - 0.1, b = F0('R1') + 0.3;
    escena('figuras', a, b, (s, g) => {
      const tFin = b - 0.3;
      const tArbol = Wd('G1', 'figura') - 0.2;
      const tX = F0('X1') - 0.3;                         // el árbol se va a la izquierda; después entra la tabla
      // ---------- el árbol: compás (1 bloque) · pulsos (2) · subdivisiones (6)
      const ws = 82, gs = 10, gp = 28, wp = 3 * ws + 2 * gs, wc = 2 * wp + gp;
      const Y = { c: 350, p: 540, s: 730 };
      const xP = [0, wp + gp], xS = [];
      xP.forEach(x0 => { for (let i = 0; i < 3; i++) xS.push(x0 + i * (ws + gs)); });
      const A = N.group(g);                            // el árbol (centrado en G, a la izquierda en X)
      const XG = CX - wc / 2 + 110, XX = 330;
      s.on(t => { const k = ease(ramp(t, tX, tX + 0.9)); A.setAttribute('transform', `translate(${lerp(XG, XX, k).toFixed(2)},0)`); });
      const niveles = {
        c: { nom: 'COMPÁS', xs: [0], w: wc, figSize: 72 },
        p: { nom: 'PULSO', xs: xP, w: wp, figSize: 62 },
        s: { nom: 'SUBDIVISIÓN', xs: xS, w: ws, figSize: 46 },
      };
      // cuándo se ilumina cada nivel (lo que se está nombrando)
      const act = {
        p: [[Wd('G1', 'pulso') - 0.4, Wd('G1', 'subdivision') - 0.3], [Wd('X2', 'dos') - 0.2, F0('X3') - 0.1], [F0('X5') - 0.1, F0('X6') - 0.1]],
        s: [[Wd('G1', 'subdivision') - 0.3, Wd('G1', 'y', 2) - 0.2], [Wd('X4', 'cada') - 0.2, F0('X5') - 0.2], [F0('X6') - 0.1, F0('X7') - 0.1]],
        c: [[Wd('G1', 'compas') - 0.3, F1('G1') + 0.3], [F0('X7') - 0.1, tFin]],
      };
      const tQ = { p: Wd('G1', 'pulso') - 0.3, s: Wd('G1', 'subdivision') - 0.2, c: Wd('G1', 'compas') - 0.2 };
      const tFig = { p: Wd('X2', 'negra') - 0.15, s: Wd('X4', 'corcheas') - 0.2, c: Wd('X7', 'blanca') - 0.15 };
      ['c', 'p', 's'].forEach((key, li) => {
        const L = niveles[key], y = Y[key];
        const NV = N.group(A);
        aparece(s, NV, tArbol + li * 0.2, tFin, { dy: 10 });
        const kAct = t => act[key].reduce((m, [p, q]) => Math.max(m, win(t, p, q, .3, .3)), 0);
        const lab = texto(NV, L.nom, -40, y + 10, { anchor: 'end', size: 28, peso: 800, ls: '0.08em', fill: 'currentColor' });
        const BL = N.group(NV);
        L.xs.forEach(x => bloque(BL, x, y, L.w));
        s.on(t => { const k = kAct(t); color(BL, mix(APAGADO, C.rosa, k)); lab.style.color = mix(C.suave, C.rosa, k); });
        // en el ejemplo: «dos pulsos» → 1 · 2 ; «tres corcheas» → 1 · 2 · 3 (en cada pulso)
        if (key !== 'c') {
          const nb = N.group(NV);
          L.xs.forEach((x, i) => texto(nb, String(key === 'p' ? i + 1 : i % 3 + 1), x + L.w / 2, y + 9, { anchor: 'middle', size: 24, peso: 800, fill: '#ffffff' }));
          const tn = key === 'p' ? Wd('X2', 'dos') - 0.1 : Wd('X4', 'tres') - 0.1;
          mostrarEn(s, nb, tn, 1e9, .3);
        }
        // «?» encima de cada bloque (al nombrar el nivel) → la figura (en el ejemplo)
        const yF = y - 64;
        const Qs = N.group(NV);
        L.xs.forEach(x => texto(Qs, '?', x + L.w / 2, yF + L.figSize * 0.36, { anchor: 'middle', size: L.figSize, peso: 800, fill: C.rosa }));
        const Fg = N.group(NV);
        if (key === 'c') figuraC(Fg, 'h', wc / 2, yF + 8, { punto: true });
        if (key === 'p') xP.forEach(x => figuraC(Fg, 'q', x + wp / 2, yF + 8, { punto: true }));
        if (key === 's') N.ritmo(Fg, xS.map((x, i) => ({ n: '8', barra: i < 3 ? 'a' : 'b' })), xS[0] + ws / 2 - 0.59 * SP, yF + 8 - SP, { sp: SP, grupoEsp: (ws + gs) / SP, espacio: { '8': (ws + gp) / SP } });
        s.on(t => {
          const kf = ease(ramp(t, tFig[key], tFig[key] + 0.4));
          opa(Qs, ease(ramp(t, tQ[key], tQ[key] + 0.3)) * (1 - kf));
          opa(Fg, kf);
          color(Fg, mix(C.blanco, C.rosa, kAct(t)));
        });
      });
      // ---------- la tabla del ejemplo (6/8), que se rellena fila a fila
      const TB = N.group(g);
      const xT = 1000, wT = 820, yT = 172, hH = 128;          // hH = alto de la cabecera (6/8)
      const filas = [
        { lab: 'COMPÁS', val: 'binario', h: 84, tL: F0('X2') - 0.1, tV: Wd('X2', 'binario') - 0.15, fin: F0('X3') - 0.15 },
        { lab: 'SUBDIVISIÓN', val: 'ternaria', h: 84, tL: F0('X3') - 0.1, tV: Wd('X3', 'ternaria') - 0.15, fin: F0('X5') - 0.15 },
        { lab: 'F. PULSO', fig: ['q', true], h: 120, tL: F0('X5') - 0.1, tV: Wd('X5', 'negra') - 0.15, fin: F0('X6') - 0.15 },
        { lab: 'F. SUBDIVISIÓN', fig: ['8', false], h: 120, tL: F0('X6') - 0.1, tV: Wd('X6', 'corchea') - 0.15, fin: F0('X7') - 0.15 },
        { lab: 'F. COMPÁS', fig: ['h', true], h: 120, tL: F0('X7') - 0.1, tV: Wd('X7', 'blanca') - 0.15, fin: tFin },
      ];
      const hT = hH + filas.reduce((m, f) => m + f.h, 0) + 16;
      panel(TB, xT, yT, wT, hT, { rx: 24 });
      aparece(s, TB, tX + 0.8, tFin, { dy: 12 });
      texto(TB, 'EJEMPLO RESUELTO', xT + 50, yT + hH / 2 + 10, { size: 26, peso: 800, ls: '0.2em', fill: C.rosa });
      const c68 = N.group(TB); const w68 = N.anchoCompas({ tipo: 'simple', num: '6', den: '8' }, SP);
      const y68 = yT + hH / 2 + 2;
      N.compas(c68, { tipo: 'simple', num: '6', den: '8' }, xT + 600 - w68 / 2, y68, SP); color(c68, C.blanco);
      pop(s, c68, Wd('X1', 'seis') - 0.15, tFin, xT + 600, y68, { k0: .6 });
      const xLab = xT + 50, xVal = xT + 600;
      let yAcc = yT + hH;
      filas.forEach((f, i) => {
        const yc = yAcc + f.h / 2;
        N.line(TB, xT + 30, yAcc, xT + wT - 30, yAcc, 1.5, { stroke: 'rgba(255,255,255,0.12)' });
        yAcc += f.h;
        const G = N.group(TB);
        const lab = texto(G, f.lab, xLab, yc + 10, { size: 28, peso: 800, ls: '0.08em', fill: 'currentColor' });
        s.on(t => { const k = win(t, f.tL, f.fin, .3, .3); lab.style.color = mix(C.suave, C.rosa, k); });
        const V = N.group(G);
        if (f.val) texto(V, f.val, xVal, yc + 14, { anchor: 'middle', size: 42, peso: 800, fill: 'currentColor' });
        else figuraC(V, f.fig[0], xVal, yc + 38, { punto: f.fig[1] });
        pop(s, V, f.tV, tFin, xVal, yc, { k0: .6 });
        s.on(t => color(V, mix(C.rosa, C.blanco, ease(ramp(t, f.fin, f.fin + 0.4)))));     // rosa mientras se explica; luego, blanco
      });
    });
  }

  // ================================================================ R · repaso (los tres pasos) + U · también para los dictados
  function escenaRepaso() {
    const a = F0('R1') - 0.1, b = T.acorde + 0.15;
    escena('repaso', a, b, (s, g) => {
      const tFin = b - 0.3, tU = F0('U1');
      const rep = N.group(g); chip(rep, 'REPASO', CX, 130, { size: 26, anchor: 'middle', relleno: false });
      pop(s, rep, F0('R1') + 0.1, tU + 0.4, CX, 130);
      // «Cuando veas un compás…» (como al principio: el ojo y un compás)
      const O = N.group(g);
      const oj = N.group(O); icoOjo(oj, CX - 60, 250, 0.9); color(oj, C.rosa);
      const cc = N.group(O); N.compas(cc, { tipo: 'simple', num: '3', den: '4' }, CX + 30, 250, SP); color(cc, C.blanco);
      aparece(s, O, Wd('R2', 'compas') - 0.25, tU + 0.4, { dy: 8 });
      const WBIG = 1240, XBIG = CX - WBIG / 2;
      const defs = [
        { n: 1, txt: '¿cuántos pulsos?', y: 405, tIn: Wd('R2', 'primero') - 0.2, fin: F0('R3') - 0.1, ico: icoPulsos },
        { n: 2, txt: '¿se divide en dos o en tres?', y: 560, tIn: Wd('R3', 'segundo') - 0.2, fin: F0('R4') - 0.1, ico: icoDosTres },
        { n: 3, txt: '¿qué figura ocupa…', y: 750, h: 196, ty: -34, tIn: Wd('R4', 'tercero') - 0.2, fin: F1('R4') + 0.2, ico: icoFiguras },
      ];
      // en U: las tarjetas se encogen a la izquierda
      const SU = 0.7, XU = 80, YU = [330, 445, 590];
      defs.forEach((d, i) => {
        const out = N.group(g), inn = N.group(out);
        const T = tarjeta(inn, d.n, d.txt, { w: WBIG, h: d.h, ty: d.ty });
        if (d.ico) { const ic = N.group(inn); d.ico(ic, WBIG - 330, 0); }
        if (d.n === 3) {                               // el pulso · la subdivisión · el compás
          const pals = [['el pulso', Wd('R4', 'pulso')], ['la subdivisión', Wd('R4', 'subdivision')], ['el compás', Wd('R4', 'compas')]];
          let x = 124;
          pals.forEach(([p, tp], j) => {
            const w = N.group(inn);
            const ch = chip(w, p, x, 44, { size: 28, relleno: false, ls: '0.02em' });
            const r = ch._rect, tx = ch._txt;
            x += ch._w + 22;
            s.on(t => { const k = win(t, tp - 0.3, (pals[j + 1] ? pals[j + 1][1] : F1('R4') + 0.4) - 0.3, .25, .3); r.setAttribute('fill', k > .5 ? C.rosa : 'none'); r.setAttribute('stroke', k > .5 ? C.rosa : C.suave); tx.setAttribute('fill', k > .5 ? '#fff' : C.texto); });
            mostrarEn(s, w, tp - 0.3, 1e9, .25);
          });
        }
        s.on(t => {
          const v = win(t, d.tIn, tFin, .4, .45); opa(out, v); if (v <= 0) return;
          const ku = ease(ramp(t, tU, tU + 0.9));
          const y = lerp(d.y, YU[i], ku), x = lerp(XBIG, XU, ku), sc = lerp(1, SU, ku);
          const yIn = (1 - eo(ramp(t, d.tIn, d.tIn + 0.45))) * 14;
          inn.setAttribute('transform', `translate(${x.toFixed(2)},${(y + yIn).toFixed(2)}) scale(${sc.toFixed(4)})`);
          colorTarjeta(T, win(t, d.tIn, d.fin, .3, .3), 0);
        });
      });
      // ---------- U · útil en teoría… y en los dictados
      const teo = N.group(g); chip(teo, 'TEORÍA', XU + WBIG * SU / 2, 215, { size: 24, anchor: 'middle', relleno: false, borde: C.suave, colorTexto: C.texto });
      pop(s, teo, Wd('U1', 'teoria') - 0.2, tFin, XU + WBIG * SU / 2, 215);
      const xD = 1060, wD = 780, yD = 250, hD = 470;
      const DP = N.group(g);
      panel(DP, xD, yD, wD, hD, { rx: 24, stroke: C.rosa, sw: 2 });
      const ic1 = N.group(DP); icoOido(ic1, xD + 110, yD + 88, 1.1); color(ic1, C.rosa);
      const ic2 = N.group(DP); icoLapiz(ic2, xD + 210, yD + 88, 1.1); color(ic2, C.rosa);
      texto(DP, 'DICTADO', xD + 290, yD + 102, { size: 40, peso: 800, ls: '0.1em', fill: C.blanco });
      aparece(s, DP, Wd('U1', 'dictados') - 0.3, tFin, { dy: 12 });
      // 6/8: ♩ ♪ | ♪♪♪ — cuánto cabe en cada pulso y en cada compás
      const DR = N.group(g);
      const yM = yD + 245;
      const xCD = xD + 100;
      const c = N.compas(DR, { tipo: 'simple', num: '6', den: '8' }, xCD, yM, SP);
      const r = N.ritmo(DR, [{ n: 'q' }, { n: '8' }, { n: '8', barra: 'e' }, { n: '8', barra: 'e' }, { n: '8', barra: 'e' }, { div: 'doble', pre: 0.3, post: 0 }], xCD + c.w + 2.6 * SP, yM, { sp: SP, espacio: { q: 3.2, '8': 3.8 }, grupoEsp: 2.5 });
      color(DR, C.blanco);
      aparece(s, DR, Wd('U1', 'cuantas') - 0.2, tFin, { dy: 8 });
      const nts = r.notas;
      const pul = [[nts[0], nts[1]], [nts[2], nts[4]]].map(([p, q]) => [p.x - 10, q.x + 1.18 * SP + 10]);
      const yb1 = yM + SP + 56, yb2 = yb1 + 52;
      const tPul = Wd('U1', 'pulso') - 0.2, tCom = Wd('U1', 'compas') - 0.2;
      pul.forEach(([xa, xb], j) => {
        const Bo = N.group(g), Bi = N.group(Bo);
        bloqueNum(Bi, (xa + xb) / 2, yb1, xb - xa, j + 1, { size: 26 });
        aparece(s, Bo, Wd('U1', 'cuantas') + 0.1 + j * 0.15, tFin, { dy: 6 });
        s.on(t => { const k = win(t, tPul + j * 0.25, tCom + 0.1, .2, .3); color(Bi, mix(APAGADO, C.rosa, k)); const cx = (xa + xb) / 2, z = 1 + 0.1 * Math.sin(Math.PI * ramp(t, tPul + j * 0.25, tPul + j * 0.25 + 0.4)); Bi.setAttribute('transform', `translate(${cx},${yb1}) scale(${z.toFixed(4)}) translate(${-cx},${-yb1})`); });
      });
      const Co = N.group(g), Ci = N.group(Co);
      bloque(Ci, pul[0][0], yb2, pul[1][1] - pul[0][0]);
      aparece(s, Co, Wd('U1', 'cuantas') + 0.4, tFin, { dy: 6 });
      s.on(t => { const k = win(t, tCom, tFin, .25, .3); color(Ci, mix(APAGADO, C.rosa, k)); });
      const lb1 = texto(g, 'pulso', pul[1][1] + 20, yb1 + 9, { size: 26, peso: 700, fill: C.suave });
      const lb2 = texto(g, 'compás', pul[1][1] + 20, yb2 + 9, { size: 26, peso: 700, fill: C.suave });
      aparece(s, lb1, Wd('U1', 'cuantas') + 0.1, tFin, { dy: 6 }); aparece(s, lb2, Wd('U1', 'cuantas') + 0.4, tFin, { dy: 6 });
      // «Recuérdalo»
      const rec = N.group(g); chip(rec, '¡RECUÉRDALO!', CX, 880, { size: 30, anchor: 'middle' });
      pop(s, rec, Wd('U1', 'recuerdalo') - 0.15, tFin, CX, 880);
    });
  }

  const ORDEN = [escenaPreguntas, escenaPulsos, escena68, escenaTituloSub, escenaSubdivision, escenaFiguras, escenaRepaso];

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
