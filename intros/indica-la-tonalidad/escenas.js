/* =====================================================================
   ESCENAS · Indica la tonalidad (GE)
   Cada escena se construye una vez (SVG) y luego se actualiza con el
   tiempo t del máster de audio: todo es función pura de t (se puede
   saltar a cualquier punto o exportar a vídeo fotograma a fotograma).
   Las marcas de tiempo salen de la narración (frases y palabras) y de
   los ejemplos sonoros (window.SONIDOS).
   Rosa = lo que se está explicando; el resto, blanco. Tonalidades como «Do M» y «La m».
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
  const limpia = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!.,;:…«»"()]/g, '');
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

  // ================================================================ 0 · TÍTULO INICIAL (norma 5)
  function tituloGrande(g) {
    texto(g, 'TEORÍA  ·  TONALIDADES', CX, 392, { anchor: 'middle', size: 26, peso: 800, ls: '0.3em', fill: C.rosa });
    texto(g, 'INDICA LA TONALIDAD', CX, 528, { anchor: 'middle', size: 104, peso: 800, ls: '0.04em', fill: C.blanco });
    N.el('rect', { x: CX - 60, y: 566, width: 120, height: 5, rx: 2.5, fill: C.rosa }, g);
    texto(g, 'Sostenidos · Bemoles · Relativo menor', CX, 640, { anchor: 'middle', size: 38, peso: 400, fill: '#cbd5e1' });
  }
  function escenaTitulo() {
    const b = F1('TITULO');
    escena('titulo', -1, b, (s, g) => { const gg = N.group(g); tituloGrande(gg); s.on(t => opa(gg, 1 - ease(ramp(t, b - 1.2, b)))); });
  }

  // ================================================================ I · mirando la armadura: tres casos
  function escenaCasos() {
    const a = F0('I1') - 0.2, b = F0('D3') + 0.2;
    escena('casos', a, b, (s, g) => {
      const tI2 = F0('I2');
      // I1: el ojo sobre una armadura
      const O = N.group(g);
      const yM = 560;
      const PA = pentaArm(O, 660, yM, 600, 3, '#');
      const oj = N.group(O); icoOjo(oj, 830, 380, 1.3); color(oj, C.rosa);
      aparece(s, O, F0('I1') + 0.2, tI2 + 0.1, { dy: 12 });
      resalta(s, PA.A.g, Wd('I1', 'armadura') - 0.15, tI2);
      const q = interrogacion(O, 1340, 600, 110);
      s.on(t => opa(q, win(t, Wd('I1', 'reconocerla') - 0.1, tI2, .3, .3)));
      // I2–I3: tres casos
      const casos = [['sostenidos', 'SOSTENIDOS', 3, '#'], ['bemoles', 'BEMOLES', 3, 'b'], ['nada', 'NADA', 0, '#']];
      const wC = 480, gap = 50, x0 = CX - (3 * wC + 2 * gap) / 2, y0 = 330, hC = 380;
      const tNada = Wd('D1', 'caso') - 0.2, tDo = Wd('D1', 'do') - 0.1;
      casos.forEach(([pal, tit, n, tipo], i) => {
        const G = N.group(g);
        const x = x0 + i * (wC + gap);
        const r = panel(G, x, y0, wC, hC, { rx: 22 });
        const cuerpo = N.group(G);
        pentaArm(cuerpo, x + 60, y0 + 160, wC - 120, n, tipo, 22);
        texto(G, tit, x + wC / 2, y0 + 310, { anchor: 'middle', size: 34, peso: 800, ls: '0.08em', fill: C.blanco });
        s.on(t => opa(cuerpo, ease(ramp(t, Wd('I3', pal) - 0.15, Wd('I3', pal) + 0.3))));
        aparece(s, G, tI2 + 0.1 + i * 0.15, b - 0.2, { dy: 16 });
        // D1: «este caso» → se apagan los otros dos; el de «nada» se ilumina
        s.on(t => { const k = ease(ramp(t, tNada, tNada + 0.5)); if (i < 2) G.setAttribute('opacity', (win(t, tI2 + 0.1 + i * 0.15, b - 0.2, .5, .5) * (1 - 0.8 * k)).toFixed(3)); else r.setAttribute('stroke', mezcla('#3a4556', C.rosa, k)); });
      });
      const ch = chipTon(g, 'C', 'mayor', x0 + 2 * (wC + gap) + wC / 2, y0 + hC + 70, { size: 36 });
      pop(s, ch, tDo, b - 0.2, x0 + 2 * (wC + gap) + wC / 2, y0 + hC + 70);
      const mem = chip(N.group(g), '¡DE MEMORIA!', x0 + 2 * (wC + gap) + wC / 2, y0 + hC + 160, { size: 24, anchor: 'middle', relleno: false });
      const memW = mem.parentNode; pop(s, memW, Wd('D2', 'memoria') - 0.1, b - 0.2, x0 + 2 * (wC + gap) + wC / 2, y0 + hC + 160);
      const hab = texto(g, 'muy habitual', x0 + wC / 2 + 250, y0 + hC + 120, { anchor: 'middle', size: 34, peso: 600, italic: true, fill: C.suave });
      aparece(s, hab, Wd('D2', 'habitual') - 0.1, b - 0.2, { dy: 8 });
    });
  }

  // ================================================================ D · la escala de Do mayor (sin alteraciones)
  function escenaDo() {
    const a = F0('D3') - 0.1, b = F0('S1') + 0.3;
    escena('do', a, b, (s, g) => {
      const yM = 470;
      const P = pentaClave(g, 300, yM, 1320);
      aparece(s, P.g, F0('D3'), b - 0.3, { dy: 0 });
      const tit = N.group(g); chipTon(tit, 'C', 'mayor', CX, 300, { size: 34 });
      aparece(s, tit, Wd('D3', 'escala') - 0.2, b - 0.3, { dy: 10 });
      const ESC = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
      const tn = S.ESC_DO || ESC.map((_, i) => F0('ESC_DO') + 0.25 + i * 0.43);
      const tEsc = Wd('D3', 'do') - 0.1;
      const xs = ESC.map((_, i) => P.x0 + 90 + i * 150);
      ESC.forEach((n, i) => {
        const G = N.group(g); const r = N.redonda(G, n, xs[i], yM, SP);
        aparece(s, G, tEsc + i * 0.12, b - 0.3, { dy: 8, fi: .3 });
        resalta(s, G, tn[i] - 0.03, tn[i] + 0.4, { d: .12 });
        const nm = N.group(g); nombreNota(nm, n[0], xs[i] + 22, 600, { size: 30, anchor: 'middle', fill: C.blanco });
        aparece(s, nm, tEsc + i * 0.12 + 0.1, b - 0.3, { dy: 6, fi: .3 });
      });
      const sin = texto(g, 'sin alteraciones', CX, 700, { anchor: 'middle', size: 32, peso: 600, italic: true, fill: C.suave });
      aparece(s, sin, Wd('D3', 'alteraciones') - 0.2, Wd('D3', 'tonos') - 0.1, { dy: 8 });
      const TS = ['T', 'T', 'S', 'T', 'T', 'T', 'S'];
      const tTS = Wd('D3', 'tonos') - 0.1;
      TS.forEach((v, i) => {
        const G = N.group(g);
        const xa = xs[i] + 22, xb = xs[i + 1] + 22, yb = 668;
        N.el('path', { d: `M${xa + 10},${yb - 14} Q${(xa + xb) / 2},${yb + 6} ${xb - 10},${yb - 14}`, fill: 'none', stroke: v === 'S' ? C.rosa : C.suave, 'stroke-width': 3 }, G);
        texto(G, v, (xa + xb) / 2, yb + 36, { anchor: 'middle', size: 28, peso: 800, fill: v === 'S' ? C.rosa : C.suave });
        mostrarEn(s, G, tTS + i * 0.14, b - 0.3, .25, .3);
      });
      // «uno de los más populares»: la tarjeta de la escala mayor del vídeo anterior
      const pop1 = N.group(g);
      panel(pop1, CX - 260, 790, 520, 120, { rx: 20, stroke: C.rosa });
      texto(pop1, 'Escala Mayor', CX, 838, { anchor: 'middle', size: 32, peso: 800, fill: C.blanco });
      const pp = patronPuntos(pop1, [0, 2, 4, 5, 7, 9, 11, 12], CX - 200, 878, 400); color(pp, C.rosa);
      aparece(s, pop1, Wd('D3', 'populares') - 0.2, b - 0.3, { dy: 10 });
    });
  }

  // ================================================================ S · con sostenidos: el último y la nota siguiente
  function escenaSostenidos() {
    const a = F0('S1') - 0.1, b = F0('B1') + 0.3;
    escena('sostenidos', a, b, (s, g) => {
      const R = regla(g, 380, 150, 1160, 130, 'CON SOSTENIDOS');
      aparece(s, R, F0('S1'), b - 0.3, { dy: 10 });
      const r1 = N.group(R);
      texto(r1, 'el ÚLTIMO', 420, 250, { size: 40, peso: 800, fill: C.blanco }); N.glyph(r1, 'accidentalSharp', 646, 238, 17);
      mostrarEn(s, r1, Wd('S1', 'ultimo') - 0.15);
      const r2 = N.group(R); color(r2, C.rosa);
      flecha(r2, 700, 236, 790, 236, { w: 5, cab: 16 });
      texto(r2, 'sube a la nota siguiente', 810, 250, { size: 40, peso: 800, fill: C.rosa });
      mostrarEn(s, r2, Wd('S1', 'siguiente') - 0.15);
      // ejemplo: fa, do, sol
      const yM = 600, xP = 460;
      const P = pentaClave(g, xP, yM, 1000);
      aparece(s, P.g, F0('S2'), b - 0.3, { dy: 0 });
      const A = N.armaduraGen(g, P.x0 + 4, yM, SP, 3, '#');
      const pals = ['fa', 'do', 'sol'];
      A.items.forEach((it, i) => {
        const ta = Wd('S2', pals[i]) - 0.1;
        pop(s, it.g, ta, b - 0.3, it.x + 13, yM - it.pos * SP, { fi: .25, k0: .5 });
      });
      const nmG = N.group(g);
      ['F#', 'C#', 'G#'].forEach((n, i) => { const w = N.group(nmG); nombreNota(w, n, xP + 110 + i * 120, yM + 130, { size: 30, anchor: 'middle', fill: 'currentColor' }); color(w, C.blanco); s.on(t => opa(w, ease(ramp(t, Wd('S2', pals[i]), Wd('S2', pals[i]) + 0.3)) * win(t, F0('S2'), b - 0.3, .3, .4))); if (i === 2) resalta(s, w, Wd('S3', 'ultimo') - 0.1, null); });
      // el último: sol♯
      const tU = Wd('S3', 'ultimo') - 0.1;
      resalta(s, A.items[2].g, tU, null);
      const lu = N.group(g);
      const xg = A.items[2].x + 13, yg = yM - 2.5 * SP;
      N.el('circle', { cx: xg, cy: yg, r: 30, fill: 'none', stroke: C.rosa, 'stroke-width': 3.5 }, lu);
      texto(lu, 'último', xg, yg - 48, { anchor: 'middle', size: 26, peso: 800, fill: C.rosa });
      aparece(s, lu, tU, b - 0.3, { dy: 6 });
      // la nota siguiente: la
      const tS = Wd('S4', 'siguiente') - 0.1;
      const xn = xg + 330;
      const nota = N.group(g); N.redonda(nota, 'A5', xn, yM, SP); color(nota, C.rosa);
      pop(s, nota, tS + 0.3, b - 0.3, xn + 22, yM - 3 * SP, { k0: .6 });
      const fl = N.group(g); color(fl, C.rosa); arco(fl, xg + 26, yg - 6, xn - 8, yM - 3 * SP - 4, 50);
      mostrarEn(s, fl, tS, b - 0.3);
      const nl = N.group(g); nombreNota(nl, 'A', xn + 22, yM + 130, { size: 30, anchor: 'middle', fill: C.rosa });
      aparece(s, nl, Wd('S4', 'la', 2) - 0.1, b - 0.3, { dy: 6 });
      // ¡La mayor!
      const tLa = Wd('S5', 'mayor') - 0.35;
      const ch = chipTon(g, 'A', 'mayor', xn + 260, yM - 150, { size: 40 });
      pop(s, ch, tLa, b - 0.3, xn + 260, yM - 150, { k0: .6 });
    });
  }

  // ================================================================ B · con bemoles: el penúltimo (¡y su apellido!)
  function escenaBemoles() {
    const a = F0('B1') - 0.1, b = F0('X1') + 0.3;
    escena('bemoles', a, b, (s, g) => {
      const tB6 = F0('B6');
      const R = regla(g, 380, 150, 1160, 130, 'CON BEMOLES');
      aparece(s, R, F0('B1'), tB6 - 0.1, { dy: 10 });
      const r1 = N.group(R);
      texto(r1, 'el PENÚLTIMO', 420, 250, { size: 40, peso: 800, fill: C.blanco }); N.glyph(r1, 'accidentalFlat', 716, 240, 17);
      mostrarEn(s, r1, Wd('B1', 'penultimo') - 0.15);
      const r2 = N.group(R); color(r2, C.rosa);
      texto(r2, '= la tonalidad', 780, 250, { size: 40, peso: 800, fill: C.rosa });
      mostrarEn(s, r2, Wd('B2', 'tonalidad') - 0.15);
      // ejemplo: si, mi, la
      const yM = 600, xP = 460;
      const EJ = N.group(g);
      const P = pentaClave(EJ, xP, yM, 1000);
      aparece(s, EJ, F0('B3'), tB6 - 0.1, { dy: 0 });
      const A = N.armaduraGen(EJ, P.x0 + 4, yM, SP, 3, 'b');
      const pals = ['si', 'mi', 'la'], nms = ['Bb', 'Eb', 'Ab'];
      A.items.forEach((it, i) => {
        const ta = Wd('B3', pals[i]) - 0.1;
        pop(s, it.g, ta, tB6 - 0.1, it.x + 12, yM - it.pos * SP, { fi: .25, k0: .5 });
        const w = N.group(EJ); nombreNota(w, nms[i], xP + 110 + i * 120, yM + 130, { size: 30, anchor: 'middle', fill: 'currentColor' }); color(w, C.blanco);
        if (i === 1) resalta(s, w, Wd('B4', 'penultima') - 0.1, null);
        s.on(t => opa(w, ease(ramp(t, ta + 0.1, ta + 0.4))));
      });
      const tP = Wd('B4', 'penultima') - 0.1;
      resalta(s, A.items[1].g, tP, null);
      // sin círculo (pisaba el si♭ y el la♭): el mi♭ en rosa, los otros dos atenuados y «penúltimo» encima
      // (misma opacidad que su «pop» de entrada, multiplicada por el atenuado)
      [0, 2].forEach(i => { const ta = Wd('B3', pals[i]) - 0.1; s.on(t => opa(A.items[i].g, win(t, ta, tB6 - 0.1, .25, .4) * (1 - 0.6 * win(t, tP, tB6 - 0.1, .35, .35)))); });
      const lu = N.group(EJ);
      texto(lu, 'penúltimo', A.items[1].x + 12, yM - 4.3 * SP, { anchor: 'middle', size: 26, peso: 800, fill: C.rosa });
      aparece(s, lu, tP, tB6 - 0.1, { dy: 6 });
      const ch = chipTon(EJ, 'Eb', 'mayor', 1200, yM - 150, { size: 40 });
      pop(s, ch, Wd('B5', 'mi') - 0.1, tB6 - 0.1, 1200, yM - 150, { k0: .6 });
      // B6–B8 · el apellido
      const AP = N.group(g);
      aparece(s, AP, tB6, b - 0.3, { dy: 12 });
      const cx0 = CX, cy0 = 470;
      panel(AP, cx0 - 380, cy0 - 170, 760, 340, { rx: 26, stroke: C.rosa, sw: 2.5 });
      texto(AP, 'NOMBRE COMPLETO', cx0 - 330, cy0 - 110, { size: 24, peso: 800, ls: '0.2em', fill: C.rosa });
      texto(AP, 'Nombre', cx0 - 330, cy0 - 30, { size: 30, peso: 600, fill: C.suave });
      nombreNota(AP, 'E', cx0 - 120, cy0 - 28, { size: 46, fill: C.blanco });
      const ape = N.group(AP);
      texto(ape, 'Apellido', cx0 - 330, cy0 + 60, { size: 30, peso: 600, fill: C.suave });
      texto(ape, 'bemol', cx0 - 120, cy0 + 62, { size: 46, peso: 800, fill: C.rosa });
      N.glyph(ape, 'accidentalFlat', cx0 + 40, cy0 + 58, 16);
      const tApe = Wd('B8', 'apellido') - 0.2;
      s.on(t => { const k = ease(ramp(t, Wd('B7', 'nombre') - 0.1, Wd('B7', 'nombre') + 0.4)); opa(ape, k); });
      // «No puedes decir mi mayor» ✗ · «mi bemol mayor» ✓
      const no = N.group(g);
      const cNo = chipTon(no, 'E', 'mayor', cx0 - 200, 790, { size: 36, fondo: 'rgba(255,107,107,0.18)', borde: C.rojo, color: C.rojo });
      marca(no, false, cx0 - 200 + cNo._w / 2 + 40, 790, 18);
      aparece(s, no, Wd('B7', 'puedes') - 0.1, b - 0.3, { dy: 10 });
      const si = N.group(g);
      const cSi = chipTon(si, 'Eb', 'mayor', cx0 + 230, 790, { size: 36 });
      marca(si, true, cx0 + 230 + cSi._w / 2 + 40, 790, 18);
      aparece(s, si, Wd('B8', 'mi', 2) - 0.1, b - 0.3, { dy: 10 });
      s.on(t => { const k = win(t, tApe, tApe + 1.6, .2, .4); ape.setAttribute('transform', `translate(${cx0 - 120},${cy0 + 50}) scale(${(1 + 0.08 * k).toFixed(3)}) translate(${-(cx0 - 120)},${-(cy0 + 50)})`); });
    });
  }

  // ================================================================ X · la excepción: un solo bemol → Fa mayor
  function escenaExcepcion() {
    const a = F0('X1') - 0.1, b = F0('P1') + 0.3;
    escena('excepcion', a, b, (s, g) => {
      const ex = N.group(g); chip(ex, 'EXCEPCIÓN', CX, 230, { size: 30, anchor: 'middle', relleno: false });
      pop(s, ex, F0('X1'), b - 0.3, CX, 230);
      const yM = 560;
      const PA = N.group(g);
      const P = pentaClave(PA, 560, yM, 800);
      const A = N.armaduraGen(PA, P.x0 + 4, yM, SP, 1, 'b');
      aparece(s, PA, Wd('X2', 'solo') - 0.2, b - 0.3, { dy: 0 });
      resalta(s, A.g, Wd('X2', 'solo') - 0.1, null);
      const un = texto(g, 'un solo bemol', 560 + 400, yM + 130, { anchor: 'middle', size: 30, peso: 600, fill: C.suave });
      aparece(s, un, Wd('X2', 'solo'), b - 0.3, { dy: 6 });
      // hueco del «penúltimo» (no existe): el si♭ se aparta un sitio a la derecha y queda el hueco vacío
      // delante de él (antes estaba encima de la clave); luego vuelve a su sitio
      const tH0 = Wd('X2', 'penultimo') - 0.2, tH1 = Wd('X3', 'tonalidad') - 0.2, dxH = 44;
      s.on(t => A.g.setAttribute('transform', `translate(${(dxH * win(t, tH0 - 0.35, tH1 + 0.45, .35, .45)).toFixed(1)},0)`));
      const hu = N.group(g);
      const xh = P.x0 + 4 + 12, yh = yM - 0.6 * SP;
      N.el('rect', { x: xh - 17, y: yh - 36, width: 34, height: 72, rx: 8, fill: 'none', stroke: 'rgba(248,250,252,0.75)', 'stroke-width': 3, 'stroke-dasharray': '7 6' }, hu);
      texto(hu, '¿penúltimo?', xh, yM - 4.3 * SP, { anchor: 'middle', size: 24, peso: 700, fill: C.blanco });
      aparece(s, hu, tH0, tH1, { dy: 6 });
      const ch = chipTon(g, 'F', 'mayor', 1180, yM - 170, { size: 42 });
      pop(s, ch, Wd('X3', 'fa') - 0.1, b - 0.3, 1180, yM - 170, { k0: .6 });
      const mem = N.group(g); chip(mem, '¡DE MEMORIA!', 1180, yM - 95, { size: 22, anchor: 'middle', relleno: false });
      pop(s, mem, Wd('X3', 'aprenderse') - 0.1, b - 0.3, 1180, yM - 95);
    });
  }

  // ================================================================ P · el patrón: mismo orden, mismo lugar
  function escenaPatron() {
    const a = F0('P1') - 0.1, b = F0('R1') + 0.3;
    escena('patron', a, b, (s, g) => {
      const t1 = F0('P1');
      // P1: las armaduras de los dos ejemplos (La mayor, Mi♭ mayor): mismo orden, mismo lugar
      const tAlt = Wd('P1', 'alteraciones') - 0.2, tFuera = Wd('P1', 'sostenidos') - 0.4;
      [['#', 'A', 470], ['b', 'Eb', 1060]].forEach(([tipo, ton, x], k) => {
        const G = N.group(g);
        const Pm = pentaClave(G, x, 560, 390, 22);
        const Am = N.armaduraGen(G, Pm.x0 + 4, 560, 22, 3, tipo);
        chipTon(G, ton, 'mayor', x + 195, 700, { size: 26, fondo: C.panel, borde: C.blanco });
        aparece(s, G, tAlt + k * 0.25, tFuera, { dy: 10 });
        Am.items.forEach((it, i) => {
          const num = texto(G, String(i + 1), it.x + 11, 560 - it.pos * 22 - 34, { anchor: 'middle', size: 22, peso: 800, fill: C.rosa });
          mostrarEn(s, num, Wd('P1', 'orden') - 0.1 + i * 0.12, tFuera);
          resalta(s, it.g, Wd('P1', 'lugar') - 0.1 + i * 0.1, Wd('P1', 'lugar') + 1.2);
        });
      });
      const orden = texto(g, 'mismo orden · mismo lugar', CX, 200, { anchor: 'middle', size: 36, peso: 700, fill: C.blanco });
      aparece(s, orden, Wd('P1', 'orden') - 0.2, b - 0.3, { dy: 8 });
      const pat = N.group(g); chip(pat, 'PATRÓN', CX, 262, { size: 26, anchor: 'middle' });
      pop(s, pat, Wd('P1', 'patron') - 0.1, b - 0.3, CX, 262);
      const filas = [
        { y: 450, tipo: '#', nombres: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'].map(n => n[0] + '#'), fr: 'P2', pals: ['fa', 'do', 'sol', 're', 'la', 'mi', 'si'] },
        { y: 760, tipo: 'b', nombres: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'], fr: 'P3', pals: ['si', 'mi', 'la', 're', 'sol', 'do', 'fa'] },
      ];
      filas.forEach((F, k) => {
        const G = N.group(g);
        const P = pentaClave(G, 420, F.y, 640, SP);
        aparece(s, G, k ? Wd('P3', 'bemoles') - 0.3 : Wd('P1', 'sostenidos') - 0.3, b - 0.3, { dy: 0, fi: .5 });
        const A = N.armaduraGen(G, P.x0 + 8, F.y, SP, 7, F.tipo);
        // cada alteración se enciende al nombrarla (en la frase P2 o P3, tras los dos puntos / «contrario»)
        let desde = F.fr === 'P3' ? Wd('P3', 'contrario') : F0('P2');
        A.items.forEach((it, i) => {
          // busca la palabra i-ésima de la lista a partir de «desde»
          const f = T.frase[F.fr]; let ta = desde + 0.3 * i;
          for (const [w, tw] of f.palabras) if (tw >= desde - 0.05 && limpiaW(w).startsWith(F.pals[i])) { ta = tw; break; }
          desde = ta + 0.05;
          pop(s, it.g, ta - 0.08, b - 0.3, it.x + 12, F.y - it.pos * SP, { fi: .2, k0: .4 });
          resalta(s, it.g, ta - 0.08, ta + 0.5, { d: .15 });
          const nm = N.group(G); nombreNota(nm, F.nombres[i], 1180 + i * 88, F.y + 12, { size: 30, anchor: 'middle', fill: 'currentColor' });
          s.on(t => { opa(nm, ease(ramp(t, ta - 0.05, ta + 0.25))); color(nm, mezcla(C.blanco, C.rosa, win(t, ta - 0.05, ta + 0.6, .1, .3))); });
        });
      });
      // «justo al contrario»: flecha que da la vuelta a la fila de arriba
      const vu = N.group(g); color(vu, C.blanco);
      N.el('path', { d: `M${1180 + 6 * 88 + 40},${480} C${1180 + 6 * 88 + 110},${560} ${1180 + 6 * 88 + 110},${660} ${1180 + 6 * 88 + 40},${730}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 4, 'stroke-linecap': 'round' }, vu);
      flecha(vu, 1180 + 6 * 88 + 60, 716, 1180 + 6 * 88 + 36, 736, { w: 4, cab: 14 });
      texto(vu, 'al revés', 1180 + 3 * 88, 618, { anchor: 'middle', size: 30, peso: 700, italic: true, fill: C.blanco });
      aparece(s, vu, Wd('P3', 'contrario') - 0.2, b - 0.3, { dy: 0 });
    });
  }
  const limpiaW = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!.,;:…«»"()]/g, '');

  // ================================================================ R · recordatorio: de la escala a la armadura
  function escenaRecordatorio() {
    const a = F0('R1') - 0.1, b = F0('M1') + 0.3;
    escena('recordatorio', a, b, (s, g) => {
      const tDos = Wd('R1', 'estructuras') - 0.3;
      const dos = [['Escala Mayor', [0, 2, 4, 5, 7, 9, 11, 12], C.rosa], ['Escala menor', [0, 2, 3, 5, 7, 8, 10, 12], C.blanco]];
      dos.forEach(([nom, offs, col], i) => {
        const G = N.group(g);
        const x = 200, y = 250 + i * 190;
        panel(G, x, y, 520, 150, { rx: 20 });
        texto(G, nom, x + 260, y + 58, { anchor: 'middle', size: 34, peso: 800, fill: C.blanco });
        const P = patronPuntos(G, offs, x + 50, y + 108, 420); color(P, col);
        aparece(s, G, tDos + i * 0.3, b - 0.3, { dy: 12 });
      });
      // escala de Mi mayor con sus sostenidos → la armadura
      const yM = 560, xP = 820;
      const E = N.group(g);
      const P = pentaClave(E, xP, yM, 920);
      aparece(s, E, Wd('R1', 'alteraciones') - 0.3, b - 0.3, { dy: 0 });
      const ESC = ['E4', 'F#4', 'G#4', 'A4', 'B4', 'C#5', 'D#5', 'E5'];
      const xArm = P.x0 + 4, xN0 = xArm + 150;
      const alts = [];
      ESC.forEach((n, i) => {
        const G = N.group(E); const r = N.redonda(G, n, xN0 + i * 90, yM, SP);
        if (r.alt) alts.push({ g: r.alt, n: n[0], x: xN0 + i * 90 - 0.8 * SP, y: r.y });
        aparece(s, G, Wd('R1', 'alteraciones') - 0.2 + i * 0.08, b - 0.3, { dy: 6, fi: .25 });
      });
      alts.forEach(o => resalta(s, o.g, Wd('R1', 'llevan') - 0.2, null));
      const tVan = Wd('R1', 'armaduras') - 0.3;
      alts.forEach(o => s.on(t => opa(o.g, 1 - ease(ramp(t, tVan, tVan + 0.4)))));
      const AR = N.armaduraGen(E, xArm, yM, SP, 4, '#'); color(AR.g, C.rosa);
      const orden = ['F', 'C', 'G', 'D'];
      AR.items.forEach((it, i) => {
        const src = alts.find(o => o.n === orden[i]);
        const t0 = tVan + i * 0.22, t1 = t0 + 0.8, yD = yM - it.pos * SP;
        s.on(t => { const k = ease(ramp(t, t0, t1)); opa(it.g, t < t0 ? 0 : 1); it.g.setAttribute('transform', `translate(${((src.x - it.x) * (1 - k)).toFixed(1)},${((src.y - yD) * (1 - k) - Math.sin(Math.PI * k) * 50).toFixed(1)})`); });
      });
      // recordatorio (pósit)
      const po = N.group(g);
      const px = 1360, py = 700;
      N.el('rect', { x: px - 150, y: py, width: 300, height: 120, rx: 6, fill: 'rgba(248,250,252,0.94)', transform: `rotate(-3 ${px} ${py + 60})` }, po);
      texto(po, 'RECORDATORIO', px, py + 50, { anchor: 'middle', size: 26, peso: 800, ls: '0.1em', fill: '#0b1320' });
      texto(po, '= armadura', px, py + 92, { anchor: 'middle', size: 28, peso: 700, fill: '#0b1320' });
      pop(s, po, Wd('R1', 'recordatorio') - 0.2, b - 0.3, px, py + 60, { k0: .5 });
      const simp = texto(g, 'para no escribirlas una y otra vez', 1280, 480, { anchor: 'middle', size: 28, peso: 600, italic: true, fill: C.suave });
      aparece(s, simp, Wd('R1', 'simplificarnos') - 0.2, b - 0.3, { dy: 6 });
    });
  }

  // ================================================================ M · de una armadura, dos tonalidades: el relativo menor
  function escenaRelativo() {
    const a = F0('M1') - 0.1, b = F0('E1') + 0.3;
    escena('relativo', a, b, (s, g) => {
      // M1: las mayores que hemos visto
      const may = N.group(g);
      texto(may, 'Tonalidades Mayores', CX, 230, { anchor: 'middle', size: 32, peso: 800, fill: C.rosa });
      [['C', 'mayor'], ['A', 'mayor'], ['Eb', 'mayor'], ['F', 'mayor']].forEach(([n, m], i) => { const c = chipTon(may, n, m, CX - 480 + i * 320, 300, { size: 28, fondo: C.panel, borde: C.rosa }); });
      aparece(s, may, F0('M1') + 0.2, Wd('M2', 'armadura') - 0.2, { dy: 10 });
      // M2–M3: una armadura → dos tonalidades
      const yM = 470, xA = 330;
      const AR = N.group(g);
      pentaArm(AR, xA, yM, 360, 0, '#');
      texto(AR, '(sin alteraciones)', xA + 180, yM + 110, { anchor: 'middle', size: 26, peso: 600, italic: true, fill: C.suave });
      const tArm = Wd('M2', 'armadura') - 0.2;
      aparece(s, AR, tArm, b - 0.3, { dy: 10 });
      const r1 = N.group(g); color(r1, C.suave); arco(r1, xA + 380, yM - 30, 900, 330, -10);
      const r2 = N.group(g); color(r2, C.suave); arco(r2, xA + 380, yM + 30, 900, 640, 10);
      mostrarEn(s, r1, Wd('M2', 'dos') - 0.1, b - 0.3); mostrarEn(s, r2, Wd('M2', 'dos') + 0.1, b - 0.3);
      const cM = chipTon(g, 'C', 'mayor', 1060, 330, { size: 34, fondo: C.panel, borde: C.blanco });
      pop(s, cM, Wd('M2', 'mayor') - 0.1, b - 0.3, 1060, 330);
      const cm = chipTon(g, 'A', 'menor', 1060, 640, { size: 34 });
      pop(s, cm, Wd('M3', 'relativo') - 0.1, b - 0.3, 1060, 640);
      const rl = texto(g, 'relativo menor', 1060, 716, { anchor: 'middle', size: 30, peso: 800, fill: C.rosa });
      aparece(s, rl, Wd('M3', 'relativo'), b - 0.3, { dy: 6 });
      // M4–M6: dos notas por debajo · tono y medio · tercera menor
      const EP = N.group(g);
      const yS = 520, xS = 1330;
      const P = pentaClave(EP, xS, yS, 520, 20);
      aparece(s, EP, Wd('M4', 'debajo') - 0.3, b - 0.3, { dy: 8 });
      const ns = ['C5', 'B4', 'A4'], xs = [P.x0 + 90, P.x0 + 220, P.x0 + 350];
      const nomb = ['C', 'B', 'A'];
      ns.forEach((n, i) => {
        const G = N.group(EP); N.redonda(G, n, xs[i], yS, 20);
        const ta = i === 0 ? Wd('M4', 'debajo') - 0.2 : Wd('M4', 'dos') + (i - 1) * 0.35;
        pop(s, G, ta, b - 0.3, xs[i] + 17, yS - N.posSol(n) * 20, { k0: .6 });
        if (i === 2) color(G, C.rosa);
        const nm = N.group(EP); nombreNota(nm, nomb[i], xs[i] + 17, yS + 84, { size: 24, anchor: 'middle', fill: i === 2 ? C.rosa : C.blanco });
        s.on(t => opa(nm, ease(ramp(t, ta, ta + 0.3))));
      });
      const pasos = N.group(EP);
      [['½', 0], ['1', 1]].forEach(([v, i]) => {
        const xa = xs[i] + 17, xb = xs[i + 1] + 17;
        N.el('path', { d: `M${xa + 8},${yS - 70} Q${(xa + xb) / 2},${yS - 96} ${xb - 8},${yS - 70}`, fill: 'none', stroke: C.blanco, 'stroke-width': 3 }, pasos);
        texto(pasos, v, (xa + xb) / 2, yS - 104, { anchor: 'middle', size: 26, peso: 800, fill: C.blanco });
      });
      mostrarEn(s, pasos, Wd('M5', 'tono') - 0.2, b - 0.3);
      const tot = texto(EP, '1½ tonos', xs[1] + 17, yS - 150, { anchor: 'middle', size: 30, peso: 800, fill: C.blanco });
      aparece(s, tot, Wd('M5', 'medio') - 0.1, b - 0.3, { dy: 6 });
      const ter = N.group(EP); chip(ter, '3ªm', (xs[0] + xs[2]) / 2 + 17, yS + 150, { size: 30, anchor: 'middle', ls: '0.02em' });
      pop(s, ter, Wd('M6', 'tercera') - 0.1, b - 0.3, (xs[0] + xs[2]) / 2 + 17, yS + 150);
      const deb = N.group(g); color(deb, C.rosa); flecha(deb, 1060, 395, 1060, 590, { w: 5, cab: 18 });
      texto(deb, 'debajo', 1090, 500, { size: 28, peso: 700, fill: C.rosa });
      mostrarEn(s, deb, Wd('M4', 'debajo') - 0.2, b - 0.3);
    });
  }

  // ================================================================ E · ejemplos: Mi♭ mayor → Do menor · La mayor → Fa♯ menor
  function ejemploRelativo(s, g, o) {
    // o: {frM, n, tipo, mayor:[nota], notas:[3 notas], nombres, palabras, frMen, menor:[nota], tFin, alterada}
    const yM = 560, xP = 360;
    const G = N.group(g);
    const P = pentaClave(G, xP, yM, 1100);
    const A = N.armaduraGen(G, P.x0 + 4, yM, SP, o.n, o.tipo);
    aparece(s, G, o.tIni, o.tFin, { dy: 0, fi: .5 });
    const cM = chipTon(g, o.mayor, 'mayor', 1460, 300, { size: 34, fondo: C.panel, borde: C.blanco });
    pop(s, cM, o.tMayor, o.tFin, 1460, 300);
    const xs = o.notas.map((_, i) => P.x0 + 300 + i * 180);
    o.notas.forEach((n, i) => {
      const N0 = N.group(g); N.redonda(N0, n, xs[i], yM, SP);
      const ta = o.tNotas[i];
      pop(s, N0, ta - 0.08, o.tFin, xs[i] + 22, yM - N.posSol(n) * SP, { k0: .6, fi: .25 });
      if (i === 2) resalta(s, N0, o.tMira, null);
      const nm = N.group(g); nombreNota(nm, o.nombres[i], xs[i] + 22, yM + 130, { size: 30, anchor: 'middle', fill: C.blanco });
      s.on(t => opa(nm, ease(ramp(t, ta, ta + 0.3)) * win(t, o.tIni, o.tFin, .3, .5)));
      if (i) { const f = N.group(g); color(f, C.suave); arco(f, xs[i - 1] + 50, yM - N.posSol(o.notas[i - 1]) * SP - 20, xs[i] - 6, yM - N.posSol(n) * SP - 20, 30, { w: 3, cab: 11 }); mostrarEn(s, f, ta - 0.1, o.tFin); }
    });
    // mirar la armadura: ¿la nota a la que hemos llegado está alterada?
    const oj = N.group(g); icoOjo(oj, P.x0 + 60, yM - 170, 0.9); color(oj, C.blanco);
    mostrarEn(s, oj, o.tMira - 0.2, o.tFin);
    if (o.alterada != null) {
      const it = A.items[o.alterada];
      resalta(s, it.g, o.tMira, null, { a: C.rosa });
      const cir = N.el('circle', { cx: it.x + 13, cy: yM - it.pos * SP, r: 28, fill: 'none', stroke: C.rosa, 'stroke-width': 3.5 }, g);
      mostrarEn(s, cir, o.tMira, o.tFin);
      const nm2 = N.group(g); nombreNota(nm2, o.menor, xs[2] + 22, yM + 180, { size: 34, anchor: 'middle', fill: C.rosa });
      aparece(s, nm2, o.tMira + 0.5, o.tFin, { dy: 6 });
    } else {
      const lim = texto(g, 'sin alteración', xs[2] + 22, yM + 180, { anchor: 'middle', size: 26, peso: 600, italic: true, fill: C.suave });
      aparece(s, lim, o.tMira + 0.2, o.tFin, { dy: 6 });
    }
    const cm = chipTon(g, o.menor, 'menor', 1460, 820, { size: 40 });
    pop(s, cm, o.tMenor, o.tFin, 1460, 820, { k0: .6 });
    return { G, P, A, xs };
  }
  function escenaEjemplos() {
    const a = F0('E1') - 0.1, b = F0('A1') + 0.3;
    escena('ejemplos', a, b, (s, g) => {
      const tE5 = F0('E5') - 0.1;
      ejemploRelativo(s, g, {
        n: 3, tipo: 'b', mayor: 'Eb', menor: 'C', notas: ['E5', 'D5', 'C5'], nombres: ['Eb', 'D', 'C'],
        tIni: F0('E1') - 0.05, tMayor: Wd('E1', 'mi') - 0.1, tNotas: [Wd('E2', 'mi'), Wd('E2', 're', 2), Wd('E2', 'do')],
        tMira: Wd('E3', 'do') - 0.3, tMenor: Wd('E3', 'do') - 0.1, tFin: tE5, alterada: null,
      });
      const ok = N.group(g); marca(ok, true, 1640, 820, 22);
      pop(s, ok, F0('E4') - 0.05, tE5, 1640, 820);
      const R = ejemploRelativo(s, g, {
        n: 3, tipo: '#', mayor: 'A', menor: 'F#', notas: ['A4', 'G4', 'F4'], nombres: ['A', 'G', 'F'],
        tIni: tE5 + 0.2, tMayor: Wd('E5', 'la') - 0.1, tNotas: [Wd('E6', 'la'), Wd('E6', 'sol'), Wd('E6', 'fa')],
        tMira: Wd('E7', 'armadura') - 0.2, tMenor: Wd('E8', 'fa') - 0.1, tFin: b - 0.3, alterada: 0,
      });
      // O1 se queda con este ejemplo: «un ojo puesto en la armadura»
    });
  }

  // ================================================================ O · un ojo puesto en la armadura
  function escenaOjo() {
    const a = F0('O1') - 0.1, b = F0('A1') + 0.3;
    escena('ojo', a, b, (s, g) => {
      const lab = N.group(g);
      chip(lab, 'UN OJO EN LA ARMADURA', 660, 300, { size: 26, anchor: 'start', relleno: false });
      pop(s, lab, Wd('O1', 'ojo') - 0.15, b - 0.3, 800, 300);
      const q = texto(g, '¿la nota a la que llegas está alterada o no?', CX, 960, { anchor: 'middle', size: 36, peso: 700, fill: C.blanco });
      aparece(s, q, Wd('O1', 'alterada') - 0.3, b - 0.3, { dy: 8 });
    });
  }

  // ================================================================ A · aclaración: tercera menor y el nombre correcto
  function escenaAclaracion() {
    const a = F0('A1') - 0.1, b = F0('F1') + 0.3;
    escena('aclaracion', a, b, (s, g) => {
      const tit = N.group(g);
      texto(tit, 'De', CX - 110, 252, { anchor: 'end', size: 38, peso: 700, fill: C.suave });
      chipTon(tit, 'A', 'mayor', CX, 240, { size: 34, fondo: C.panel, borde: C.blanco });
      texto(tit, 'a su relativo menor', CX + 110, 252, { size: 38, peso: 700, fill: C.suave });
      aparece(s, tit, F0('A1'), b - 0.3, { dy: 8 });
      const filas = [
        ['F#', true, '3ªm · 1½ tonos', Wd('A1', 'tercera') - 0.2],
        ['F', false, 'solo bajar dos notas: 3M (2 tonos)', Wd('A2', 'bajar') - 0.2],
        ['Gb', false, 'suena igual, pero no es su nombre', Wd('A2', 'nombre') - 0.2],
      ];
      filas.forEach(([n, ok, txt, ta], i) => {
        const G = N.group(g);
        const y = 420 + i * 160;
        panel(G, 360, y - 62, 1200, 124, { rx: 20, stroke: ok ? C.verde : 'rgba(255,107,107,0.6)' });
        nombreNota(G, 'A', 470, y + 14, { size: 40, anchor: 'middle', fill: C.blanco });
        const f = N.group(G); color(f, C.suave); flecha(f, 530, y, 640, y, { w: 4, cab: 14 });
        nombreNota(G, n, 720, y + 14, { size: 44, anchor: 'middle', fill: ok ? C.verde : C.rojo });
        texto(G, txt, 830, y + 12, { size: 32, peso: 600, fill: C.blanco });
        marca(G, ok, 1500, y, 20);
        aparece(s, G, ta, b - 0.3, { dy: 10 });
      });
    });
  }

  // ================================================================ F · resumen (chuleta) + ejemplos que siguen cada regla
  function escenaResumen() {
    const a = F0('F1') - 0.1, b = T.acorde + 0.15;
    escena('resumen', a, b, (s, g) => {
      // ---------- izquierda: la chuleta, regla a regla (la que se está diciendo, en rosa)
      const CH = N.group(g);
      const xC = 130, yC = 170, wC = 820, hC = 800;
      panel(CH, xC, yC, wC, hC, { rx: 24, stroke: 'rgba(248,250,252,0.35)', sw: 2 });
      texto(CH, 'CHULETA', xC + 40, yC + 60, { size: 26, peso: 800, ls: '0.24em', fill: C.rosa });
      aparece(s, CH, F0('F1') + 0.2, b - 0.3, { dy: 12 });
      const fila = (txt, y, ta, tb, o) => {
        o = o || {};
        const G = N.group(g);
        texto(G, txt, xC + 50, y, { size: o.size || 32, peso: o.peso || 600, fill: 'currentColor' });
        color(G, o.fijo || C.blanco);
        aparece(s, G, ta, b - 0.3, { dy: 8 });
        if (!o.fijo && tb) resalta(s, G, ta, tb, { d: .25 });      // en rosa mientras se explica
        return G;
      };
      const tF3 = Wd('F3', 'alteraciones') - 0.2, tF4 = Wd('F4', 'sostenidos') - 0.2, tF5 = Wd('F5', 'bemoles') - 0.2;
      const tF6 = Wd('F6', 'bemol') - 0.2, tF7 = F0('F7'), tF8 = Wd('F8', 'bajamos') - 0.2, tF9 = Wd('F9', 'armadura') - 0.2;
      const tF10 = Wd('F10', 'distancia') - 0.2;
      fila('Mayor', yC + 140, Wd('F2', 'mayor') - 0.2, null, { size: 34, peso: 800, fijo: C.rosa });
      fila('sin alteraciones → Do M', yC + 200, tF3, F0('F4') - 0.2);
      fila('♯ → el último + la nota siguiente', yC + 260, tF4, F0('F5') - 0.2);
      fila('♭ → el penúltimo', yC + 320, tF5, F0('F6') - 0.2);
      fila('un solo ♭ → Fa M', yC + 380, tF6, tF7 - 0.2);
      fila('menor', yC + 480, Wd('F7', 'menor') - 0.2, null, { size: 34, peso: 800, fijo: C.rosa });
      fila('1 · encuentra primero el Mayor', yC + 540, Wd('F7', 'menor') + 0.2, tF8);
      fila('2 · baja dos nombres de nota', yC + 600, tF8, tF9);
      fila('3 · mira la armadura', yC + 660, tF9, tF10);
      fila('distancia: 3ªm = 1½ tonos', yC + 740, tF10, b, { peso: 800 });

      // ---------- derecha: el ejemplo de la regla que se está diciendo
      const yM = 400, xP = 1040;
      const EJ = N.group(g);
      const P = pentaClave(EJ, xP, yM, 760);
      aparece(s, EJ, Wd('F1', 'ejemplo') - 0.2, b - 0.3, { dy: 0 });
      const cab = texto(g, 'EJEMPLO', xP + 380, 230, { anchor: 'middle', size: 26, peso: 800, ls: '0.2em', fill: C.rosa });
      aparece(s, cab, Wd('F1', 'ejemplo') - 0.2, b - 0.3, { dy: 6 });
      const xK = P.x0 + 4, xR = xP + 380, yChip = 740;
      const tramo = (t0, t1) => G => aparece(s, G, t0, t1, { dy: 0, fi: .35, fo: .35 });
      // 1) sin alteraciones → Do M (al principio no hay nada en la armadura)
      const nada = N.group(g);
      texto(nada, 'sin alteraciones', xK + 120, yM + 110, { size: 28, peso: 600, italic: true, fill: C.suave });
      tramo(tF3, F0('F4') - 0.1)(nada);
      const cDo = N.group(g); chipTon(cDo, 'C', 'mayor', xR, yChip, { size: 40 });
      pop(s, cDo, Wd('F3', 'do') - 0.1, F0('F4') - 0.1, xR, yChip, { k0: .6 });
      // 2) sostenidos → el último + la siguiente (4 ♯ → re♯ → mi → Mi M)
      const S2 = N.group(g);
      const A4 = N.armaduraGen(S2, xK, yM, SP, 4, '#');
      tramo(tF4, F0('F5') - 0.1)(S2);
      const tUlt = Wd('F4', 'ultimo') - 0.1;
      resalta(s, A4.items[3].g, tUlt, null);
      const ul = texto(S2, 'último', A4.items[3].x + 12, yM + 118, { anchor: 'middle', size: 26, peso: 800, fill: C.rosa });
      mostrarEn(s, ul, tUlt, 1e9);
      const xm = P.x0 + 230;
      const mi2 = N.group(S2); N.redonda(mi2, 'E5', xm, yM, SP); color(mi2, C.rosa);
      const tSig = Wd('F4', 'siguiente') - 0.2;
      pop(s, mi2, tSig + 0.2, 1e9, xm + 22, yM - 1.5 * SP, { k0: .6 });
      const f2 = N.group(S2); color(f2, C.rosa); arco(f2, A4.items[3].x + 26, yM - SP - 12, xm - 6, yM - 1.5 * SP - 8, 40);
      mostrarEn(s, f2, tSig, 1e9);
      const cMi = N.group(S2); chipTon(cMi, 'E', 'mayor', xR, yChip, { size: 40 });
      pop(s, cMi, tSig + 0.5, 1e9, xR, yChip, { k0: .6 });
      // 3) bemoles → el penúltimo (2 ♭: si♭, mi♭ → Si♭ M)
      const S3 = N.group(g);
      const B2 = N.armaduraGen(S3, xK, yM, SP, 2, 'b');
      tramo(tF5, F0('F6') - 0.1)(S3);
      const tPen = Wd('F5', 'penultimo') - 0.1;
      resalta(s, B2.items[0].g, tPen, null);
      s.on(t => opa(B2.items[1].g, 1 - 0.65 * win(t, tPen, 1e9, .35, .35)));
      const pe = texto(S3, 'penúltimo', B2.items[0].x + 12, yM + 118, { anchor: 'middle', size: 26, peso: 800, fill: C.rosa });
      mostrarEn(s, pe, tPen, 1e9);
      const cSib = N.group(S3); chipTon(cSib, 'Bb', 'mayor', xR, yChip, { size: 40 });
      pop(s, cSib, tPen + 0.5, 1e9, xR, yChip, { k0: .6 });
      // 4) un solo bemol → Fa M
      const S4 = N.group(g);
      const B1 = N.armaduraGen(S4, xK, yM, SP, 1, 'b'); color(B1.g, C.rosa);
      tramo(tF6, tF7 - 0.1)(S4);
      texto(S4, 'un solo bemol', xK + 120, yM + 110, { size: 28, peso: 600, italic: true, fill: C.suave });
      const cFa = N.group(S4); chipTon(cFa, 'F', 'mayor', xR, yChip, { size: 40 });
      pop(s, cFa, Wd('F6', 'fa') - 0.1, 1e9, xR, yChip, { k0: .6 });
      // 5) menor: primero el Mayor (4 ♯ → Mi M), bajar dos notas, mirar la armadura → Do♯ m
      const S5 = N.group(g);
      const A5 = N.armaduraGen(S5, xK, yM, SP, 4, '#');
      tramo(tF7 + 0.1, b - 0.3)(S5);
      const cMi5 = N.group(S5); chipTon(cMi5, 'E', 'mayor', xR - 170, yChip, { size: 34, fondo: C.panel, borde: C.blanco });
      pop(s, cMi5, Wd('F7', 'mayor') - 0.2, 1e9, xR - 170, yChip);
      const mi5 = N.group(S5); N.redonda(mi5, 'E5', xm, yM, SP);
      pop(s, mi5, Wd('F7', 'mayor') - 0.1, 1e9, xm + 22, yM - 1.5 * SP, { k0: .6 });
      const ns = ['D5', 'C5'], xs2 = [xm + 140, xm + 280];
      ns.forEach((n, i) => {
        const G = N.group(S5); N.redonda(G, n, xs2[i], yM, SP);
        pop(s, G, tF8 + 0.2 + i * 0.45, 1e9, xs2[i] + 22, yM - N.posSol(n) * SP, { k0: .6 });
        const f = N.group(S5); color(f, C.suave); arco(f, (i ? xs2[0] : xm) + 50, yM - N.posSol(i ? 'D5' : 'E5') * SP - 20, xs2[i] - 6, yM - N.posSol(n) * SP - 20, 26, { w: 3, cab: 10 });
        mostrarEn(s, f, tF8 + 0.1 + i * 0.45, 1e9);
      });
      const nombres = N.group(S5);
      [['E', xm], ['D', xs2[0]], ['C', xs2[1]]].forEach(([n, x]) => nombreNota(nombres, n, x + 22, yM + 130, { size: 28, anchor: 'middle', fill: C.blanco }));
      mostrarEn(s, nombres, tF8 + 0.2, 1e9);
      resalta(s, A5.items[1].g, tF9, null);
      const tMen9 = Wd('F9', 'menor');
      [0, 2, 3].forEach(i => s.on(t => opa(A5.items[i].g, 1 - 0.65 * win(t, tF9, tMen9 + 0.4, .35, .45))));
      const ds = N.group(S5); nombreNota(ds, 'C#', xs2[1] + 22, yM + 178, { size: 32, anchor: 'middle', fill: C.rosa });
      aparece(s, ds, tF9 + 0.4, 1e9, { dy: 6 });
      const fl5 = N.group(S5); color(fl5, C.suave); flecha(fl5, xR - 60, yChip, xR + 20, yChip, { w: 4, cab: 14 });
      mostrarEn(s, fl5, Wd('F9', 'menor') - 0.3, 1e9);
      const cDos = N.group(S5); chipTon(cDos, 'C#', 'menor', xR + 150, yChip, { size: 40 });
      pop(s, cDos, Wd('F9', 'menor') - 0.2, 1e9, xR + 150, yChip, { k0: .6 });
      const tr = N.group(S5);
      const xa = xm + 22, xb = xs2[1] + 22, ya = yM + 222;
      N.el('path', { d: `M${xa},${ya - 12} v12 h${xb - xa} v-12`, fill: 'none', stroke: C.blanco, 'stroke-width': 3 }, tr);
      texto(tr, '3ªm · 1½ tonos', (xa + xb) / 2, ya + 40, { anchor: 'middle', size: 28, peso: 800, fill: C.rosa });
      aparece(s, tr, Wd('F10', 'tercera') - 0.2, 1e9, { dy: 6 });
    });
  }

  // ================================================================ FINAL (norma 3): el título llega con el último acorde
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
    escenaTitulo(); escenaCasos(); escenaDo(); escenaSostenidos(); escenaBemoles(); escenaExcepcion(); escenaPatron();
    escenaRecordatorio(); escenaRelativo(); escenaEjemplos(); escenaOjo(); escenaAclaracion(); escenaResumen(); escenaFinal();
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
