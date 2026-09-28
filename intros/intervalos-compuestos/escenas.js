/* =====================================================================
   ESCENAS · Intervalos compuestos (GE)
   Montado por pipe/escenas_build.py: utilidades comunes (_comun/) + escenas
   propias (intervalos-compuestos/escenas_cuerpo.js). Todo es función pura de t.
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


  // ================================================================ E3 · INTERVALOS COMPUESTOS
  const TITULO = { kicker: 'TEORÍA  ·  INTERVALOS', lineas: ['INTERVALOS COMPUESTOS'], sub: 'Acercar · Analizar · Listo' };
  const OCT = 3.5 * SP;                               // una octava en el pentagrama (91 px)
  // el pentagrama del ejemplo (de H1 hasta que suena el 10M): siempre en el mismo sitio
  const PX = 402, PY = 560, PW = 700;                 // alineado con la tarjeta ① (x = 402)
  const XN = 832;                                     // presentación: Do y Mi en la misma vertical
  const X1 = 652, X2 = 832, X3 = 1012;                // análisis (en melódico): Do · (Re) · Mi
  const XR = 1370;                                    // columna derecha: la solución
  const YC = 472;                                     // fila de la cuenta, encima del pentagrama
  const cxN = x => x + 22;                            // centro de la cabeza de una redonda
  const pulso = (t, t0, d) => win(t, t0 - 0.05, t0 + (d || 0.9), .08, .5);

  /** Nota por capas: vis (opacidad), h (desliz horizontal), v (desliz vertical), col (color). */
  function capas(parent, n, x, yM, o) {
    const vis = N.group(parent), h = N.group(vis), v = N.group(h), col = N.group(v);
    const r = nota(col, n, x, yM, o);
    return { vis, h, v, col, r };
  }
  /** Latido: el grupo crece un poco y vuelve (alrededor de cx, cy) en los instantes ts. */
  function latido(s, g, ts, cx, cy, amp) {
    s.on(t => {
      let k = 0; for (const t0 of [].concat(ts)) k = Math.max(k, pulso(t, t0, 0.7));
      const e = 1 + (amp || 0.1) * k;
      g.setAttribute('transform', `translate(${cx},${cy}) scale(${e.toFixed(4)}) translate(${-cx},${-cy})`);
    });
  }
  /** Fila «antes → después» con flecha dibujada; izq/der = trozos [texto, color]. */
  function filaFlecha(parent, izq, der, cx, y, size, o) {
    o = o || {};
    const G = N.group(parent);
    const gap = o.gap || size * 0.95;
    texto(G, izq, cx - gap, y, { anchor: 'end', size, peso: o.peso || 800 });
    texto(G, der, cx + gap, y, { anchor: 'start', size, peso: o.peso || 800 });
    const f = N.group(G); color(f, C.suave);
    flecha(f, cx - gap * 0.55, y - size * 0.35, cx + gap * 0.55, y - size * 0.35, { w: Math.max(3, size / 14), cab: size * 0.3 });
    return G;
  }
  /** Tarjeta de paso (como las reglas del vídeo de inversión): número en círculo + título. */
  function tarjetaPaso(parent, x, y, w, h, n, tit) {
    const G = N.group(parent);
    const rect = panel(G, x, y, w, h, { rx: 20 });
    const num = N.group(G);
    N.el('circle', { cx: x + 58, cy: y + h / 2, r: 30, fill: 'none', stroke: 'currentColor', 'stroke-width': 3 }, num);
    texto(num, n, x + 58, y + h / 2 + 12, { anchor: 'middle', size: 34, peso: 800, fill: 'currentColor' });
    texto(G, tit, x + 108, y + h / 2 + 11, { size: 30, peso: 800, ls: '0.08em', fill: 'currentColor' });
    return { G, rect, num };
  }
  function tarjetaEstado(s, K, fn) {
    s.on(t => {
      const k = fn(t);
      color(K.G, mezcla(C.suave, C.blanco, k));
      color(K.num, mezcla(C.suave, C.rosa, k));
      K.rect.setAttribute('stroke', mezcla('#3a4556', C.rosa, k));
      K.rect.setAttribute('stroke-width', (1.5 + 1.5 * k).toFixed(2));
    });
  }

  // ================================================================ H · A · N · E · el ejemplo: Do grave – Mi agudo (10M)
  function escenaEjemplo() {
    const a = F0('H1') - 0.2, b = F0('E5') + 0.2;
    escena('ejemplo', a, b, (s, g) => {
      const fin = b - 0.3;
      // ---- instantes
      const tOct = Wd('H1', 'octava') - 0.2;
      const tLejos = Wd('H2', 'mas') - 0.1;
      const tH3 = F0('H3');
      const tComp = Wd('H3', 'compuesto') - 0.2, tMasGr = Wd('H3', 'mas') - 0.15;
      const tAbre = F0('A1') + 0.05;
      const tNum = Wd('A1', 'numero') - 0.2, tEspA = Wd('A1', 'especie') - 0.2;
      const tTruco = Wd('A2', 'truco') - 0.15, tLocos = Wd('A2', 'volvernos') - 0.05;
      const tN1 = F0('N1') - 0.1;
      const tGrave = Wd('N2', 'grave') - 0.15, tOctN = Wd('N2', 'octava') - 0.15, tOcho0 = Wd('N2', 'ocho') - 0.15, tMira = Wd('N2', 'mira');
      const tDo = Wd('N3', 'do') - 0.1, tMi = Wd('N3', 'mi') - 0.1;
      const tAc = Wd('N4', 'acerco') - 0.05;
      const tDesde = Wd('N5', 'desde') - 0.05;
      const t8 = Wd('N5', 'ocho', 2) - 0.12, t9 = Wd('N5', 'nueve') - 0.12, t10 = Wd('N5', 'diez') - 0.12;
      const tDec = Wd('N6', 'decima') - 0.2;
      const tE1 = F0('E1') - 0.1;
      const tCerca = Wd('E2', 'cerca') - 0.15;
      const tDoMi = Wd('E3', 'domi') - 0.15, tTer = Wd('E3', 'tercera') - 0.12;
      const tSol = Wd('E4', 'solucion') - 0.15, tDec2 = Wd('E4', 'decima') - 0.1, tMay = Wd('E4', 'mayor') - 0.12;
      const SON = S.SON_10M || [F0('SON_10M') + 0.1, F0('SON_10M') + 1.4];
      const yDo4 = yNota('C4', PY), yDo5 = yNota('C5', PY), yMi5 = yNota('E5', PY);

      // ---- pentagrama (debajo de todo)
      const Pg = N.group(g); pentaClave(Pg, PX, PY, PW);
      aparece(s, Pg, F0('H1') - 0.1, fin, { dy: 10 });

      // ---- H · anotaciones de la presentación (se van cuando se abre el acorde)
      const H = N.group(g);
      s.on(t => opa(H, 1 - ease(ramp(t, tAbre - 0.4, tAbre))));
      // H1 · «dentro de una octava»: corchete Do4 → Do5 (suave) a la izquierda
      const O = N.group(H); color(O, C.suave);
      corchete(O, XN - 34, yDo4, yDo5, { d: -12, w: 3.5 });
      texto(O, 'octava', XN - 40, yDo4 + 34, { anchor: 'end', size: 30, peso: 800, fill: 'currentColor' });
      mostrarEn(s, O, tOct, 1e9, .35, .4);
      // H3 · «más grande que una octava»: corchete Do4 → Mi5 (rosa) a la derecha
      const R = N.group(H); color(R, C.rosa);
      corchete(R, XN + 78, yDo4, yMi5, { d: 12, w: 3.5 });
      texto(R, 'más de una octava', XN + 84, yDo4 + 34, { size: 30, peso: 800, fill: 'currentColor' });
      mostrarEn(s, R, tMasGr, 1e9, .35, .4);
      const hc = N.group(H); chip(hc, 'INTERVALO COMPUESTO', CX, 250, { size: 30, anchor: 'middle' });
      pop(s, hc, tComp, 1e9, CX, 250);
      // H4 · novena, décima, undécima…
      [['9ª', 'novena'], ['10ª', 'decima'], ['11ª', 'undecima']].forEach(([txt, pal], i) => {
        const w = N.group(H), x = cxN(XN) + (i - 1) * 190, y = 810;
        texto(w, txt, x, y, { anchor: 'middle', size: 64, peso: 800, fill: C.rosa });
        pop(s, w, Wd('H4', pal) - 0.15, 1e9, x, y - 22);
      });
      const pts = N.group(H); texto(pts, '…', cxN(XN) + 2 * 190 - 40, 810, { anchor: 'middle', size: 64, peso: 800, fill: C.rosa });
      mostrarEn(s, pts, Wd('H4', 'undecima') + 0.45, 1e9, .3, .3);

      // ---- A2 · «volvernos locos contando»: las diez notas, una a una (rápido)
      const LOC = N.group(g); color(LOC, C.suave);
      const ESC = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];
      const c1 = cxN(X1), c3 = cxN(X3);
      ESC.forEach((n, i) => {
        const cx = c1 + i * (c3 - c1) / 9, ti = tLocos + i * 0.13;
        const G = N.group(LOC);
        if (i > 0 && i < 9) N.glyph(G, 'noteheadBlack', cx - 8.4, yNota(n, PY), SP, 0.55);
        texto(G, String(i + 1), cx, YC, { anchor: 'middle', size: 30, peso: 800, fill: 'currentColor' });
        mostrarEn(s, G, ti, tN1 + 0.1, .1, .35);
      });

      // ---- N2 · el plan: la grave sube una octava (fantasma + flecha discontinua)…
      const fan = N.group(g); nota(fan, 'C5', X1, PY); color(fan, C.suave);
      s.on(t => opa(fan, 0.5 * win(t, tOctN + 0.2, tAc + 0.5, .35, .3)));
      const arcD = N.group(g); color(arcD, C.suave);
      arcoLado(arcD, X1 - 16, yDo4, yDo5 + 2, -80, { dash: '2 10', w: 4 });
      s.on(t => opa(arcD, win(t, tOctN, tAc + 0.4, .35, .3)));
      const arcS = N.group(g); color(arcS, C.rosa);
      arcoLado(arcS, X1 - 16, yDo4, yDo5 + 2, -80, { w: 4 });
      mostrarEn(s, arcS, tAc + 0.1, tE1, .4, .4);
      const r8a = N.group(g); texto(r8a, '8ª', X1 - 62, yDo4 + 36, { anchor: 'middle', size: 32, peso: 800, fill: C.rosa });
      mostrarEn(s, r8a, tOctN + 0.1, tE1, .3, .4);

      // ---- las notas (encima de todo)
      const NT = N.group(g);
      aparece(s, NT, F0('H1') - 0.1, fin, { dy: 10 });
      const DO = capas(NT, 'C4', XN, PY), MI = capas(NT, 'E4', XN, PY);
      desliza(s, MI.v, tLejos, tLejos + 0.9, 0, -OCT, { curva: 46 });        // H2 · el Mi se aleja una octava
      desliza(s, DO.h, tAbre, tAbre + 0.8, X1 - XN, 0);                        // A1 · se abre: Do a la izquierda…
      desliza(s, MI.h, tAbre, tAbre + 0.8, X3 - XN, 0);                        // …y Mi a la derecha
      const DO5 = capas(NT, 'C5', X1, PY);                                     // N4 · el Do acercado
      s.on(t => {
        // lo que suena destella en blanco: primero Do4 + Mi5 (10M), luego Do5 + Mi5 (3M)
        const k1 = pulso(t, SON[0], 1.0), k2 = pulso(t, SON[1], 1.0);
        // Do4: rosa cuando se nombra; al acercarlo se queda como sombra (se enciende cuando suena)
        let k = win(t, tGrave, tMira, .3, .4);
        k = Math.max(k, pulso(t, tDo + 0.1), ease(ramp(t, tAc - 0.1, tAc + 0.2)));
        const sombra = ease(ramp(t, tAc + 0.3, tAc + 0.9));
        color(DO.col, k1 > 0 ? mezcla(C.suave, '#ffffff', k1) : (sombra > 0 ? mezcla(C.rosa, C.suave, sombra) : mezcla(C.blanco, C.rosa, k)));
        opa(DO.vis, 1 - 0.68 * sombra * (1 - k1));
        // Mi: rosa mientras se aleja, destellos al nombrarlo y, desde «cerca», en rosa (el par cercano)
        let m = win(t, tLejos - 0.1, tH3 - 0.3, .3, .5);
        m = Math.max(m, pulso(t, tMi + 0.1), pulso(t, t10 + 0.1), ease(ramp(t, tCerca, tCerca + 0.35)));
        const sm = Math.max(k1, k2);
        color(MI.col, sm > 0 ? mezcla(C.rosa, '#ffffff', 0.85 * sm) : mezcla(C.blanco, C.rosa, m));
        // Do5 (acercado): aparece en rosa; mientras suena el compuesto se apaga un poco
        opa(DO5.vis, ease(ramp(t, tAc + 0.15, tAc + 0.6)) * (1 - 0.6 * k1));
        const s5 = Math.max(0.85 * k2, 0.6 * pulso(t, t8 + 0.1, 0.8));
        color(DO5.col, mezcla(C.rosa, '#ffffff', s5));
      });

      // ---- N5 · 8 · 9 · 10 (desde la nota acercada)
      const n8w = N.group(g), n8p = N.group(n8w);
      texto(n8p, '8', cxN(X1), YC, { anchor: 'middle', size: 44, peso: 800, fill: 'currentColor' });
      pop(s, n8w, tOcho0, tE1, cxN(X1), YC - 16);
      s.on(t => color(n8p, mezcla(C.suave, C.rosa, ease(ramp(t, t8, t8 + 0.25)))));
      latido(s, n8p, [tDesde + 0.2, t8 + 0.05], cxN(X1), YC - 16, 0.18);
      const re = N.group(g); nota(re, 'D5', X2, PY); color(re, C.suave);
      s.on(t => opa(re, 0.55 * win(t, t9 - 0.05, tE1, .25, .4)));
      const n9w = N.group(g); texto(n9w, '9', cxN(X2), YC, { anchor: 'middle', size: 44, peso: 800, fill: C.rosa });
      pop(s, n9w, t9, tE1, cxN(X2), YC - 16);
      const n10w = N.group(g); texto(n10w, '10', cxN(X3), YC, { anchor: 'middle', size: 44, peso: 800, fill: C.rosa });
      pop(s, n10w, t10, tE1, cxN(X3), YC - 16);

      // ---- N3 · «Do grave, Mi agudo» → E3 «Do–Mi»
      const nDo = N.group(g); texto(nDo, 'Do', cxN(X1), 722, { anchor: 'middle', size: 38, peso: 700, fill: C.blanco });
      aparece(s, nDo, tDo, tDoMi + 0.3, { dy: 8 });
      const nMi = N.group(g); texto(nMi, 'Mi', cxN(X3), 722, { anchor: 'middle', size: 38, peso: 700, fill: C.blanco });
      aparece(s, nMi, tMi, tDoMi + 0.3, { dy: 8 });
      const dm = N.group(g); parNotas(dm, 'C', 'E', cxN(X2), 722, { size: 40 });
      aparece(s, dm, tDoMi, fin, { dy: 8 });
      const c3m = N.group(g), c3p = N.group(c3m); chipInt(c3p, '3M', cxN(X2), 806, { size: 34 });
      pop(s, c3m, tTer, fin, cxN(X2), 806);
      latido(s, c3p, [SON[1]], cxN(X2), 806, 0.12);

      // ---- A1 · ¿cómo lo analizamos? · A2 · truco
      const q = N.group(g); interrogacion(q, XR, 640, 150);
      pop(s, q, tAbre, tNum, XR, 590);
      const tr = N.group(g); chip(tr, 'TRUCO', XR, 590, { size: 36, anchor: 'middle' });
      pop(s, tr, tTruco, tN1 + 0.1, XR, 590);

      // ---- N6 · «es una décima» → E4 «la solución: décima Mayor»
      const sol = N.group(g); texto(sol, 'SOLUCIÓN', XR, 492, { anchor: 'middle', size: 24, peso: 800, ls: '0.24em', fill: C.rosa });
      aparece(s, sol, tSol, fin, { dy: 8 });
      const r10a = N.group(g), r10ap = N.group(r10a); chip(r10ap, '10ª', XR, 590, { size: 56, anchor: 'middle', relleno: false, ls: '0.02em' });
      pop(s, r10a, tDec, tMay + 0.35, XR, 590);
      latido(s, r10ap, [tDec2 + 0.1], XR, 590, 0.08);
      const r10M = N.group(g), r10Mp = N.group(r10M); chip(r10Mp, '10M', XR, 590, { size: 56, anchor: 'middle', ls: '0.02em' });
      pop(s, r10M, tMay, fin, XR, 590);
      latido(s, r10Mp, [SON[0]], XR, 590, 0.1);

      // ---- tarjetas: queremos el NÚMERO y la ESPECIE (paso 1 · paso 2)
      const wC = 540, gapC = 36, xC0 = CX - (2 * wC + gapC) / 2, yCd = 150, hCd = 108;
      const K1 = tarjetaPaso(g, xC0, yCd, wC, hCd, '1', 'NÚMERO');
      const K2 = tarjetaPaso(g, xC0 + wC + gapC, yCd, wC, hCd, '2', 'ESPECIE');
      aparece(s, K1.G, tNum, fin, { dy: 12 });
      aparece(s, K2.G, tEspA, fin, { dy: 12 });
      tarjetaEstado(s, K1, t => Math.max(win(t, tNum + 0.2, tNum + 1.3, .2, .5), win(t, tN1, tE1, .35, .35)));
      tarjetaEstado(s, K2, t => Math.max(win(t, tEspA + 0.2, tEspA + 1.3, .2, .5), win(t, tE1, 1e9, .35, .35)));
    });
  }

  // ================================================================ E5 · acercar no es invertir: no hay trueque
  function escenaTrueque() {
    const a = F0('E5') - 0.1, b = F0('U1') + 0.2;
    escena('trueque', a, b, (s, g) => {
      const fin = b - 0.25;
      const tAqui = Wd('E5', 'aqui') - 0.1, tEsp = Wd('E5', 'especie') - 0.25;
      const tInv0 = Wd('E5', 'cuando') - 0.1, tInv = Wd('E5', 'inversion') - 0.05;
      const tAbajo = Wd('E5', 'abajo') - 0.2, tSupera = Wd('E5', 'supera') - 0.1;
      const tSimple = Wd('E5', 'simplemente') - 0.1, tTrueque = Wd('E5', 'trueque') - 0.25;
      const wP = 700, hP = 590, gapP = 60, x0 = CX - (2 * wP + gapP) / 2, y0 = 226;
      const K = [
        { x: x0, tit: 'ACERCAR', alta: 'E5', ta: F0('E5') - 0.05, tMov: tAqui, tEsp,
          esp: [[['10', C.blanco], ['M', C.rosa]], [['3', C.blanco], ['M', C.rosa]]],
          nom: [[['Do', C.rosa], ['–Mi', C.blanco]], [['Do', C.rosa], ['–Mi', C.blanco]]],
          chip: 'SIN TRUEQUE', lleno: true, tChip: tTrueque, act: [[F0('E5') - 0.05, tInv0], [tSimple, 1e9]] },
        { x: x0 + wP + gapP, tit: 'INVERSIÓN', alta: 'E4', ta: tInv0, tMov: tInv, tEsp: tInv + 0.7,
          esp: [[['3', C.blanco], ['M', C.rosa]], [['6ª', C.blanco], ['m', C.rosa]]],
          nom: [[['Do', C.rosa], ['–Mi', C.blanco]], [['Mi–', C.blanco], ['Do', C.rosa]]],
          chip: 'TRUEQUE', lleno: false, tChip: tSupera, act: [[tInv0, tSimple]] },
      ];
      K.forEach(k => {
        const G = N.group(g);
        aparece(s, G, k.ta, fin, { dy: 14 });
        const rect = panel(G, k.x, y0, wP, hP, { rx: 24 });
        s.on(t => {
          let v = 0; for (const [p, q] of k.act) v = Math.max(v, win(t, p, q, .35, .35));
          rect.setAttribute('stroke', mezcla('#3a4556', C.rosa, v)); rect.setAttribute('stroke-width', (1.5 + 1.5 * v).toFixed(2));
        });
        texto(G, k.tit, k.x + wP / 2, y0 + 62, { anchor: 'middle', size: 30, peso: 800, ls: '0.14em', fill: C.rosa });
        const yM = y0 + 215;
        pentaClave(G, k.x + 70, yM, wP - 140);
        const xc = k.x + 380;
        const alta = N.group(G); nota(alta, k.alta, xc, yM);
        const baja = N.group(G), bajaC = N.group(baja); nota(bajaC, 'C4', xc, yM);
        const nueva = N.group(G), nuevaC = N.group(nueva); nota(nuevaC, 'C5', xc, yM);
        const ar = N.group(G); color(ar, C.rosa);
        arcoLado(ar, xc - 16, yNota('C4', yM), yNota('C5', yM) + 2, -80, { w: 4 });
        s.on(t => {
          const m = ease(ramp(t, k.tMov + 0.25, k.tMov + 0.85));
          opa(baja, 1 - 0.68 * m);
          color(bajaC, mezcla(C.blanco, C.suave, m));
          opa(nueva, ease(ramp(t, k.tMov + 0.1, k.tMov + 0.55)));
          opa(ar, ease(ramp(t, k.tMov, k.tMov + 0.4)));
          const p = Math.max(pulso(t, tAbajo + 0.2, 0.9), pulso(t, tSupera + 0.1, 0.9));
          color(nuevaC, mezcla(C.rosa, '#ffffff', 0.6 * p));
        });
        const e1 = N.group(G); filaFlecha(e1, k.esp[0], k.esp[1], k.x + wP / 2, y0 + 402, 56);
        aparece(s, e1, k.tEsp, 1e9, { dy: 8 });
        const n1 = N.group(G); filaFlecha(n1, k.nom[0], k.nom[1], k.x + wP / 2, y0 + 480, 40, { peso: 700, gap: 53 });
        aparece(s, n1, tAbajo, 1e9, { dy: 8 });
        const ch = N.group(G);
        chip(ch, k.chip, k.x + wP / 2, y0 + 546, k.lleno ? { size: 26, anchor: 'middle' } : { size: 26, anchor: 'middle', relleno: false });
        pop(s, ch, k.tChip, 1e9, k.x + wP / 2, y0 + 546);
      });
    });
  }

  // ================================================================ U · undécimas y duodécimas: como cuartas y quintas
  function escenaUndecimas() {
    const a = F0('U1') - 0.1, b = F0('F1') + 0.2;
    escena('undecimas', a, b, (s, g) => {
      const fin = b - 0.25;
      const t11 = Wd('U1', 'undecimas') - 0.15, t12 = Wd('U1', 'duodecimas') - 0.15;
      const t4 = Wd('U1', 'cuartas') - 0.15, t5 = Wd('U1', 'quintas') - 0.15;
      const tAc = Wd('U1', 'acercas') - 0.1;
      const tCuarta = Wd('U2', 'cuarta') - 0.15;
      const tJ4 = Wd('U3', 'justa') - 0.12, tUnd = Wd('U3', 'undecima') - 0.15, tJ11 = Wd('U3', 'justa', 2) - 0.12;
      // pentagrama (izquierda): Do4–Fa5, una undécima
      const yM = 540, xP = 250, wPe = 700, xc = 640;
      const E = N.group(g);
      aparece(s, E, F0('U1'), fin, { dy: 10 });
      pentaClave(E, xP, yM, wPe);
      const yDo4 = yNota('C4', yM), yDo5 = yNota('C5', yM);
      const ar = N.group(g); color(ar, C.rosa);
      arcoLado(ar, xc - 16, yDo4, yDo5 + 2, -80, { w: 4 });
      texto(ar, '8ª', xc - 62, yDo4 + 36, { anchor: 'middle', size: 32, peso: 800, fill: C.rosa });
      mostrarEn(s, ar, tAc + 0.1, fin, .4, .4);
      const NT = N.group(g);
      aparece(s, NT, F0('U1'), fin, { dy: 10 });
      const fa = N.group(NT), faC = N.group(fa); nota(faC, 'F5', xc, yM);
      const baja = N.group(NT), bajaC = N.group(baja); nota(bajaC, 'C4', xc, yM);
      const nueva = N.group(NT); nota(nueva, 'C5', xc, yM); color(nueva, C.rosa);
      s.on(t => {
        const f11 = pulso(t, t11 + 0.1, 1.0);                                 // «undécimas»: destella el acorde Do4–Fa5
        const m = ease(ramp(t, tAc + 0.3, tAc + 0.9));                        // «acercas»: el Do4 se queda como sombra
        color(bajaC, m > 0 ? mezcla(C.rosa, C.suave, m) : mezcla(C.blanco, C.rosa, Math.max(f11, ease(ramp(t, tAc - 0.2, tAc + 0.1)))));
        opa(baja, 1 - 0.68 * m);
        opa(nueva, ease(ramp(t, tAc + 0.15, tAc + 0.6)));
        color(faC, mezcla(C.blanco, C.rosa, Math.max(f11, ease(ramp(t, tCuarta, tCuarta + 0.35)))));
      });
      // tabla (derecha): 11ª → 4ª · 12ª → 5ª
      const xA = 1190, xB = 1500, yR1 = 480, yR2 = 640;
      const filas = [
        { y: yR1, a: '11ª', b: '4ª', ta: t11, tb: t4, aJ: '11J', bJ: '4J' },
        { y: yR2, a: '12ª', b: '5ª', ta: t12, tb: t5 },
      ];
      filas.forEach((f, i) => {
        const F = N.group(g);
        if (i === 1) s.on(t => opa(F, 1 - 0.65 * ease(ramp(t, tAc, tAc + 0.5))));
        const A = N.group(F); const Ap = N.group(A);
        texto(Ap, f.a, xA, f.y, { anchor: 'middle', size: 80, peso: 800, fill: C.blanco });
        pop(s, A, f.ta, f.aJ ? tJ11 + 0.3 : fin, xA, f.y - 28);
        const fle = N.group(F); color(fle, C.suave); flecha(fle, xA + 90, f.y - 28, xB - 90, f.y - 28, { w: 5, cab: 18 });
        mostrarEn(s, fle, f.tb - 0.1, fin, .3, .4);
        const B = N.group(F); const Bp = N.group(B);
        texto(Bp, f.b, xB, f.y, { anchor: 'middle', size: 80, peso: 800, fill: C.rosa });
        pop(s, B, f.tb, f.bJ ? tJ4 + 0.3 : fin, xB, f.y - 28);
        if (f.aJ) {
          latido(s, Bp, [tCuarta + 0.1], xB, f.y - 28, 0.12);
          latido(s, Ap, [tUnd + 0.1], xA, f.y - 28, 0.12);
          const BJ = N.group(F); texto(BJ, f.bJ, xB, f.y, { anchor: 'middle', size: 80, peso: 800, fill: C.rosa });
          pop(s, BJ, tJ4, fin, xB, f.y - 28);
          const AJ = N.group(F); texto(AJ, f.aJ, xA, f.y, { anchor: 'middle', size: 80, peso: 800, fill: C.rosa });
          pop(s, AJ, tJ11, fin, xA, f.y - 28);
          s.on(t => color(fle, mezcla(C.suave, C.rosa, win(t, tAc, tJ11 + 0.6, .3, .4))));
        }
      });
    });
  }

  // ================================================================ F · resumen: acercar · analizar · ¡listo!
  function escenaResumen() {
    const a = F0('F1') - 0.1, b = T.acorde + 0.15;
    escena('resumen', a, b, (s, g) => {
      const fin = b - 0.3;
      const tAc = Wd('F1', 'acercar') - 0.2, tAn = Wd('F1', 'analizar') - 0.2, tSimple = Wd('F1', 'simple') - 0.3, tListo = Wd('F1', 'listo') - 0.2;
      const wP = 440, hP = 400, gapP = 70, x0 = CX - (3 * wP + 2 * gapP) / 2, y0 = 262;
      const P = [
        { tit: '1 · ACERCAR', ta: tAc - 0.3, act: [tAc, tAn] },
        { tit: '2 · ANALIZAR', ta: tAn, act: [tAn, tListo] },
        { tit: '3 · ¡LISTO!', ta: tListo, act: [tListo, 1e9] },
      ];
      P.forEach((p, i) => {
        const x = x0 + i * (wP + gapP);
        const G = N.group(g);
        aparece(s, G, p.ta, fin, { dy: 14 });
        const rect = panel(G, x, y0, wP, hP, { rx: 24 });
        s.on(t => { const v = win(t, p.act[0], p.act[1], .3, .3); rect.setAttribute('stroke', mezcla('#3a4556', C.rosa, v)); rect.setAttribute('stroke-width', (1.5 + 1.5 * v).toFixed(2)); });
        texto(G, p.tit, x + wP / 2, y0 + 64, { anchor: 'middle', size: 32, peso: 800, ls: '0.1em', fill: C.rosa });
        if (i < 2) { const f = N.group(g); color(f, C.suave); flecha(f, x + wP + 14, y0 + hP / 2, x + wP + gapP - 14, y0 + hP / 2, { w: 4, cab: 14 }); mostrarEn(s, f, P[i + 1].ta - 0.1, fin, .3, .3); }
        if (i === 0) {
          const yM = y0 + 232, xc = x + 250;
          pentaClave(G, x + 40, yM, wP - 80);
          const ar = N.group(G); color(ar, C.rosa);
          arcoLado(ar, xc - 16, yNota('C4', yM), yNota('C5', yM) + 2, -70, { w: 4 });
          nota(G, 'E5', xc, yM);
          const baja = N.group(G), bajaC = N.group(baja); nota(bajaC, 'C4', xc, yM);
          const nueva = N.group(G); nota(nueva, 'C5', xc, yM); color(nueva, C.rosa);
          s.on(t => {
            const m = ease(ramp(t, tAc + 0.45, tAc + 1.0));
            opa(baja, 1 - 0.68 * m); color(bajaC, mezcla(C.blanco, C.suave, m));
            opa(nueva, ease(ramp(t, tAc + 0.3, tAc + 0.75))); opa(ar, ease(ramp(t, tAc + 0.2, tAc + 0.6)));
          });
        } else if (i === 1) {
          parNotas(G, 'C', 'E', x + wP / 2, y0 + 200, { size: 46 });
          const c = N.group(G); chipInt(c, '3M', x + wP / 2, y0 + 296, { size: 40 });
          pop(s, c, tSimple, fin, x + wP / 2, y0 + 296);
        } else {
          const c = N.group(G); chipInt(c, '10M', x + wP / 2, y0 + 230, { size: 64 });
        }
      });
      const prac = N.group(g); chip(prac, '¡A PRACTICAR!', CX, 800, { size: 30, anchor: 'middle' });
      pop(s, prac, F0('F2') - 0.1, fin, CX, 800);
    });
  }

  const ORDEN = [escenaEjemplo, escenaTrueque, escenaUndecimas, escenaResumen];

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
