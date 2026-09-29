/* =====================================================================
   ESCENAS · La tonalidad · intro (GE)
   Cada escena se construye una vez (SVG) y luego se actualiza con el
   tiempo t del máster de audio: todo es función pura de t (se puede
   saltar a cualquier punto o exportar a vídeo fotograma a fotograma).
   Las marcas de tiempo salen de la narración (frases y palabras) y de
   los ejemplos sonoros (window.SONIDOS).
   Rosa = lo que se está explicando; el resto, blanco. Tonalidades como «Mi M».
   ===================================================================== */
(function () {
  'use strict';
  const N = window.NOTA, D = window.DIB, C = D.C;
  const { ramp, ease, eo, lerp, win, clamp, mezcla, texto, panel, chip, flecha, aspa, tick, pos, opa, color } = D;
  const SP = N.SP = 26;                    // tamaño único de toda la grafía (norma 7)
  const CX = 960;
  const S = window.SONIDOS || {};
  const ORO = C.rosa, MADERA = '#e8eef5';

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
    const t = texto(g, NOMBRE[letra], 0, 0, { size, peso: o.peso || 700, fill: o.fill || 'currentColor' });
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

  // ================================================================ 0 · TÍTULO INICIAL (norma 5)
  function tituloGrande(g) {
    texto(g, 'TEORÍA  ·  TONALIDADES', CX, 392, { anchor: 'middle', size: 26, peso: 800, ls: '0.3em', fill: C.rosa });
    texto(g, 'LA TONALIDAD', CX, 528, { anchor: 'middle', size: 118, peso: 800, ls: '0.05em', fill: C.blanco });
    N.el('rect', { x: CX - 60, y: 566, width: 120, height: 5, rx: 2.5, fill: C.rosa }, g);
    texto(g, '¿Para qué sirve?', CX, 640, { anchor: 'middle', size: 40, peso: 400, fill: '#cbd5e1' });
  }
  function escenaTitulo() {
    const b = F1('TITULO');
    escena('titulo', -1, b, (s, g) => {
      const gg = N.group(g); tituloGrande(gg);
      s.on(t => opa(gg, 1 - ease(ramp(t, b - 1.2, b))));
    });
  }

  // ================================================================ P · ¿Para qué sirve saber la tonalidad?
  function escenaPregunta() {
    const a = F0('P1') - 0.2, b = F0('H1') + 0.2;
    escena('pregunta', a, b, (s, g) => {
      // --- la canción y su tonalidad
      const cancion = N.group(g);
      const tC = F0('P1') - 0.1, tSale = Wd('P3', 'conservatorio') - 0.2;
      const ic = N.group(cancion); icoCancion(ic, CX, 430, 92); color(ic, C.blanco);
      pop(s, ic, tC, tSale, CX, 430);
      const lb = texto(cancion, 'una canción', CX, 588, { anchor: 'middle', size: 34, peso: 600, fill: '#cbd5e1' });
      mostrarEn(s, lb, tC + 0.3, tSale);
      const tTon = Wd('P1', 'tonalidad') - 0.15;
      const chW = N.group(cancion); const ch = chip(chW, 'TONALIDAD', CX - 8, 668, { size: 26, anchor: 'middle' });
      const q = interrogacion(cancion, CX + ch._w / 2 + 34, 686, 64);
      pop(s, chW, tTon, tSale, CX, 668); pop(s, q, tTon + 0.25, tSale, CX + ch._w / 2 + 34, 668);
      const ps = texto(cancion, '¿para qué sirve saberla?', CX, 780, { anchor: 'middle', size: 40, peso: 700, fill: C.blanco });
      aparece(s, ps, Wd('P1', 'para') - 0.1, tSale, { dy: 10 });
      // --- «¿Porque sí?» (bocadillo y encogimiento de hombros)
      const bo = N.group(g);
      const bx = 1350, by = 300;
      N.el('path', { d: `M${bx - 170},${by - 60} h340 a26,26 0 0 1 26,26 v70 a26,26 0 0 1 -26,26 h-250 l-40,40 l6,-40 h-56 a26,26 0 0 1 -26,-26 v-70 a26,26 0 0 1 26,-26 z`, fill: C.panel, stroke: C.rosa, 'stroke-width': 3 }, bo);
      texto(bo, '¿Porque sí?', bx + 13, by + 12, { anchor: 'middle', size: 46, peso: 800, fill: C.blanco });
      const hombros = N.group(bo);                                // ¯\_(ツ)_/¯ dibujado
      N.el('path', { d: `M${bx - 110},${by + 150} l40,-26 l24,34 M${bx + 136},${by + 150} l-40,-26 l-24,34`, fill: 'none', stroke: C.suave, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, hombros);
      N.el('circle', { cx: bx + 13, cy: by + 140, r: 30, fill: 'none', stroke: C.suave, 'stroke-width': 5 }, hombros);
      N.el('path', { d: `M${bx + 1},${by + 150} q12,10 24,0`, fill: 'none', stroke: C.suave, 'stroke-width': 4, 'stroke-linecap': 'round' }, hombros);
      N.el('circle', { cx: bx + 2, cy: by + 132, r: 3.5, fill: C.suave }, hombros); N.el('circle', { cx: bx + 24, cy: by + 132, r: 3.5, fill: C.suave }, hombros);
      pop(s, bo, F0('P2') - 0.15, Wd('P3', 'conservatorio') - 0.1, bx, by + 20);
      s.on(t => { const k = win(t, F0('P2'), F1('P2') + 0.8, .2, .3); hombros.setAttribute('transform', `translate(0,${(-8 * Math.sin(Math.PI * clamp((t - F0('P2')) / 0.6))).toFixed(1)})`); });
      // --- lo que nos hacen hacer en el conservatorio
      const tareas = N.group(g);
      const tE = Wd('P3', 'conservatorio') - 0.1;
      const cab = N.group(tareas); icoEdificio(cab, CX, 250, 0.55); color(cab, C.rosa);
      const cabT = texto(tareas, 'EN EL CONSERVATORIO', CX, 336, { anchor: 'middle', size: 24, peso: 800, ls: '0.2em', fill: C.rosa });
      const tP4 = F0('P4');
      aparece(s, cab, tE, b - 0.3); aparece(s, cabT, tE, b - 0.3);
      const W3 = 440, gap = 50, x0 = CX - (3 * W3 + 2 * gap) / 2, yT = 400, hT = 330;
      const defs = [
        ['buscar', 'Buscar tonalidades', (G, cx, cy) => { const P = pentaClave(G, cx - 150, cy, 300, 16); N.armaduraGen(G, P.x0, cy, 16, 3, '#'); interrogacion(G, cx + 104, cy + 20, 58); }],
        ['escribir', 'Escribir armaduras', (G, cx, cy) => { const P = pentaClave(G, cx - 150, cy, 300, 16); N.armaduraGen(G, P.x0, cy, 16, 2, 'b'); const l = N.group(G); icoLapiz(l, cx + 90, cy - 6, 1.05); color(l, C.rosa); }],
        ['hacer', 'Hacer dictados', (G, cx, cy) => { const o = N.group(G); icoOido(o, cx - 70, cy, 1.1); const n = N.group(G); icoNotas(n, cx + 64, cy, 0.95); color(n, C.rosa); }],
      ];
      defs.forEach(([pal, tit, dib], i) => {
        const G = N.group(tareas);
        const x = x0 + i * (W3 + gap);
        panel(G, x, yT, W3, hT, { rx: 22 });
        dib(G, x + W3 / 2, yT + 132);
        texto(G, tit, x + W3 / 2, yT + 272, { anchor: 'middle', size: 34, peso: 700, fill: C.blanco });
        const ta = Wd('P3', pal) - 0.1;
        aparece(s, G, ta, b - 0.3, { dy: 22 });
        s.on(t => { const k = ease(ramp(t, tP4 - 0.1, tP4 + 0.4)); if (t >= ta) G.setAttribute('opacity', (win(t, ta, b - 0.3, .5, .5) * (1 - 0.72 * k)).toFixed(3)); });
      });
      // --- ¿qué significa realmente todo esto?
      const qq = N.group(g);
      texto(qq, '?', CX, 700, { anchor: 'middle', size: 360, peso: 800, fill: C.rosa });
      pop(s, qq, tP4, b - 0.3, CX, 580, { k0: .6, fi: .45 });
      const qt = texto(g, '¿Qué significa realmente todo esto?', CX, 900, { anchor: 'middle', size: 40, peso: 700, fill: C.blanco });
      aparece(s, qt, Wd('P4', 'significa') - 0.2, b - 0.3);
    });
  }

  // ================================================================ H · Primero hicimos música, después intentamos entenderla
  function escenaHistoria() {
    const a = F0('H1') - 0.2, b = F0('H4') + 0.25;
    escena('historia', a, b, (s, g) => {
      const yL = 560, xL0 = 170, xL1 = 1750;
      // línea del tiempo que retrocede
      const L = N.group(g); color(L, C.suave);
      const eje = N.line(L, xL0, yL, xL1, yL, 4, { 'stroke-linecap': 'round' });
      aparece(s, L, F0('H1') - 0.1, b - 0.3, { dy: 0 });
      const hoy = N.group(g);
      texto(hoy, 'HOY', xL1 - 10, yL + 64, { anchor: 'end', size: 26, peso: 800, ls: '0.2em', fill: C.suave });
      const ed = N.group(hoy); icoEdificio(ed, xL1 - 90, yL - 110, 0.6); color(ed, C.blanco);
      const tCons = Wd('H1', 'conservatorios') - 0.1;
      const tIcos = Wd('H3', 'cantado') - 0.5;
      s.on(t => { opa(hoy, win(t, F0('H1'), tIcos + 0.4, .5, .4) * (1 - 0.75 * ease(ramp(t, tCons, tCons + 0.6)))); });
      const lejos = texto(g, 'HACE MILES DE AÑOS', xL0 + 10, yL + 64, { anchor: 'start', size: 26, peso: 800, ls: '0.2em', fill: C.rosa });
      mostrarEn(s, lejos, Wd('H1', 'bastante') - 0.1, b - 0.3, .6, .5);
      // marcador que viaja hacia atrás (rebobinar)
      const mk = N.group(g);
      N.el('circle', { cx: 0, cy: 0, r: 13, fill: C.rosa }, mk);
      const tr0 = Wd('H1', 'empezar') - 0.2, tr1 = tCons + 0.4;
      s.on(t => {
        const v = win(t, tr0 - 0.2, b - 0.3, .3, .5); opa(mk, v);
        const k = ease(ramp(t, tr0, tr1));
        pos(mk, lerp(xL1 - 90, xL0 + 120, k), yL);
      });
      const rebob = N.group(g);
      for (let i = 0; i < 3; i++) N.el('path', { d: `M${-i * 26},0 l22,-16 v32 z`, fill: C.rosa }, rebob);
      s.on(t => { const v = win(t, tr0, tr1 + 0.2, .2, .3); opa(rebob, v * 0.9); pos(rebob, lerp(xL1 - 150, xL0 + 190, ease(ramp(t, tr0, tr1))), yL - 44); });
      // 1 · hacer música → 2 · entenderla
      const p1 = N.group(g), p2 = N.group(g);
      const n1 = N.group(p1); icoNotas(n1, 470, yL - 150, 1.1); color(n1, C.rosa);
      texto(p1, '1 · HACER MÚSICA', 470, yL - 60, { anchor: 'middle', size: 30, peso: 800, ls: '0.08em', fill: C.blanco });
      const l2 = N.group(p2); icoLupa(l2, 1180, yL - 160, 1.2); color(l2, C.blanco);
      texto(p2, '2 · ENTENDERLA', 1180, yL - 60, { anchor: 'middle', size: 30, peso: 800, ls: '0.08em', fill: C.blanco });
      const tM = Wd('H2', 'musica') - 0.2, tEnt = Wd('H2', 'entenderla') - 0.2, tH3 = F0('H3') - 0.1;
      aparece(s, p1, tM, tH3 + 0.2, { dy: 16 });
      aparece(s, p2, tEnt, tH3 + 0.2, { dy: 16 });
      const fl = N.group(g); color(fl, C.suave); flecha(fl, 640, yL - 130, 1040, yL - 130, { w: 4, cab: 16 });
      mostrarEn(s, fl, tEnt - 0.3, tH3 + 0.2);
      // miles de años: cantado, tocado, imitado, transmitido
      const acc = [['cantado', 'cantar', icoCantar], ['tocado', 'tocar', icoLira], ['imitado', 'imitar', icoPajaro], ['transmitido', 'transmitir', icoPersonas]];
      const tFin = b - 0.3;
      acc.forEach(([pal, nom, ico], i) => {
        const G = N.group(g);
        const x = 330 + i * 420, y = yL - 150;
        const I = N.group(G); ico(I, x, y); color(I, i % 2 ? C.blanco : C.rosa);
        texto(G, nom, x, yL - 52, { anchor: 'middle', size: 30, peso: 700, fill: C.blanco });
        const ta = Wd('H3', pal) - 0.15;
        aparece(s, G, ta, tFin, { dy: 18 });
      });
      // preguntas que surgen
      const pq = N.group(g);
      [[520, 790, 70], [760, 830, 52], [1010, 780, 84], [1260, 836, 56], [1440, 790, 64]].forEach(([x, y, sz], i) => {
        const q = interrogacion(pq, x, y, sz, i % 2 ? C.blanco : C.rosa);
        const ta = Wd('H3', 'preguntarnos') - 0.25 + i * 0.12;
        s.on(t => { const v = win(t, ta, tFin, .35, .4); opa(q, v); q.setAttribute('transform', `translate(0,${((1 - eo(ramp(t, ta, ta + 0.6))) * 30).toFixed(1)})`); });
      });
    });
  }

  // ================================================================ H4–H5 · Monocordio: sonidos que encajan
  function escenaMonocordio() {
    const a = F0('H4') - 0.1, b = F0('H6') + 0.35;
    escena('monocordio', a, b, (s, g) => {
      const x0 = 380, x1 = 1540, yC = 540, L = x1 - x0;
      const tIn = F0('H4'), tOut = F0('H5') + 0.6;
      const M = N.group(g);
      const cap = texto(M, 'MONOCORDIO  ·  ANTIGUA GRECIA', CX, 330, { anchor: 'middle', size: 26, peso: 800, ls: '0.2em', fill: C.rosa });
      // caja de madera
      const relleno = N.el('rect', { x: x0 - 40, y: yC + 18, width: L + 80, height: 78, rx: 6, fill: 'rgba(248,250,252,0.06)' }, M);
      const caja = trazo(M, `M${x0 - 40},${yC + 18} L${x1 + 40},${yC + 18} L${x1 + 40},${yC + 96} L${x0 - 40},${yC + 96} Z`, { stroke: MADERA, w: 5 });
      N.el('circle', { cx: x1 + 22, cy: yC - 4, r: 9, fill: 'none', stroke: MADERA, 'stroke-width': 4 }, M);
      N.el('circle', { cx: x0 - 22, cy: yC - 4, r: 5, fill: MADERA }, M);
      const boca = N.el('ellipse', { cx: CX, cy: yC + 57, rx: 70, ry: 20, fill: 'none', stroke: MADERA, 'stroke-width': 3.5, opacity: .8 }, M);
      // cejillas fijas y cuerda
      N.el('path', { d: `M${x0 - 8},${yC + 18} l8,-22 l8,22 z`, fill: MADERA }, M);
      N.el('path', { d: `M${x1 - 8},${yC + 18} l8,-22 l8,22 z`, fill: MADERA }, M);
      const cuerda = N.el('path', { d: '', fill: 'none', stroke: C.blanco, 'stroke-width': 3 }, M);
      const vib = N.el('path', { d: '', fill: 'none', stroke: C.rosa, 'stroke-width': 4 }, M);
      // puente móvil
      const puente = N.group(M); N.el('path', { d: 'M-12,22 L0,-6 L12,22 Z', fill: C.rosa }, puente);
      aparece(s, M, tIn, tOut, { dy: 0, fi: .6 });
      dibuja(s, [caja], tIn, 1.0);
      mostrarEn(s, boca, tIn + 0.5, tOut); mostrarEn(s, relleno, tIn + 0.6, tOut, .6, .5);
      const tm = S.MONOCORDIO || [F0('MONOCORDIO') + 0.15, F0('MONOCORDIO') + 0.95, F0('MONOCORDIO') + 1.75, F0('MONOCORDIO') + 2.55];
      // posición del puente (fracción de cuerda que vibra, desde la izquierda)
      const frac = t => t < tm[1] - 0.35 ? 1 : (t < tm[2] - 0.35 ? lerp(1, 0.5, ease(ramp(t, tm[1] - 0.35, tm[1] - 0.05))) : lerp(0.5, 2 / 3, ease(ramp(t, tm[2] - 0.35, tm[2] - 0.05))));
      const yS = yC - 4;
      s.on(t => {
        const f = t >= tm[3] - 0.3 ? 1 : frac(t);
        const xb = x0 + L * f;
        pos(puente, xb, yS - 18);
        opa(puente, win(t, tm[1] - 0.6, tm[3] - 0.2, .3, .3));
        cuerda.setAttribute('d', `M${x0 - 22},${yS} L${x1 + 22},${yS}`);
        // vibración de la parte pulsada (amplitud que decae)
        let amp = 0, xa = x0, xz = xb;
        for (let i = 0; i < 4; i++) {
          if (t >= tm[i]) {
            const e = Math.exp(-(t - tm[i]) / 0.55) * (1 - ramp(t, (tm[i + 1] || 1e9) - 0.06, (tm[i + 1] || 1e9)));
            if (e > amp) { amp = e; xa = x0; xz = i === 3 ? x1 : xb; }
          }
        }
        if (amp < 0.02) { vib.setAttribute('d', ''); return; }
        let d = ''; const n = 60;
        for (let k = 0; k <= n; k++) {
          const u = k / n, x = lerp(xa, xz, u);
          const y = yS + Math.sin(Math.PI * u) * 16 * amp * Math.sin(t * 90 + (xz - xa) * 0.01);
          d += (k ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
        }
        vib.setAttribute('d', d);
      });
      // etiquetas de proporción
      const et = [['CUERDA ENTERA', 'Do', null, tm[0]], ['½ DE CUERDA → OCTAVA', '2 : 1', null, tm[1]], ['⅔ DE CUERDA → QUINTA', '3 : 2', null, tm[2]], ['¡ENCAJAN!', '', null, tm[3]]];
      et.forEach(([t1, t2, _, ta], i) => {
        const G = N.group(M);
        const tb = i < 3 ? et[i + 1][3] - 0.2 : tOut;
        texto(G, t1, CX, 740, { anchor: 'middle', size: 34, peso: 800, ls: '0.06em', fill: i === 3 ? C.rosa : C.blanco });
        if (t2) texto(G, t2, CX, 800, { anchor: 'middle', size: 30, peso: 600, fill: C.rosa });
        aparece(s, G, ta - 0.05, tb, { dy: 10, fi: .3, fo: .25 });
      });
      // H5 · combinaciones que aparecen una y otra vez
      const rep = N.group(g);
      const tR = F0('H5') - 0.1, tRf = b - 0.25;
      for (let i = 0; i < 6; i++) {
        const G = N.group(rep);
        const x = 300 + i * 264, y = 560 + (i % 2 ? 40 : -40);
        N.el('rect', { x: x - 86, y: y - 70, width: 172, height: 140, rx: 18, fill: C.panel, stroke: C.borde, 'stroke-width': 1.5 }, G);
        texto(G, '8J', x - 34, y + 14, { anchor: 'middle', size: 38, peso: 800, fill: C.rosa });
        texto(G, '5J', x + 36, y + 14, { anchor: 'middle', size: 38, peso: 800, fill: C.blanco });
        const ta = Wd('H5', 'combinaciones') - 0.2 + i * 0.28;
        pop(s, G, ta, tRf, x, y, { fi: .3 });
      }
      const txR = texto(rep, 'una y otra vez…', CX, 800, { anchor: 'middle', size: 38, peso: 600, italic: true, fill: C.suave });
      aparece(s, txR, Wd('H5', 'otra') - 0.2, tRf);
    });
  }

  // ================================================================ H6–E2 · muchas escalas… y dos muy recurrentes
  function patronPuntos(parent, offs, x, y, ancho, colorP) {
    const G = N.group(parent, 'patron');
    const st = ancho / 12;
    N.line(G, x, y, x + ancho, y, 2, { stroke: C.tenue });
    offs.forEach(o => N.el('circle', { cx: x + o * st, cy: y, r: 9, fill: colorP || 'currentColor' }, G));
    return G;
  }
  function escenaEscalas() {
    const a = F0('H6') - 0.2, b = F0('E3') + 0.2;
    escena('escalas', a, b, (s, g) => {
      const cartas = [
        ['PENTATÓNICA', 'muchas culturas', [0, 2, 4, 7, 9, 12]],
        ['MODOS ECLESIÁSTICOS', 'dórico · frigio · lidio…', [0, 2, 3, 5, 7, 9, 10, 12]],
        ['RAGA', 'India', [0, 1, 4, 5, 7, 8, 11, 12]],
        ['MAQAM', 'música árabe · ¼ de tono', [0, 2, 3.5, 5, 7, 9, 10.5, 12]],
        ['TONOS ENTEROS', 'seis pasos iguales', [0, 2, 4, 6, 8, 10, 12]],
        ['BLUES', 'notas «blue»', [0, 3, 5, 6, 7, 10, 12]],
      ];
      const wC = 500, hC = 190, gx = 40, gy = 40, x0 = CX - (3 * wC + 2 * gx) / 2, y0 = 250;
      const tDos = Wd('E1', 'dos') - 0.2;
      const tMay = Wd('E2', 'mayor') - 0.1, tMen = Wd('E2', 'menor') - 0.1;
      cartas.forEach(([nom, sub, offs], i) => {
        const G = N.group(g);
        const x = x0 + (i % 3) * (wC + gx), y = y0 + Math.floor(i / 3) * (hC + gy);
        panel(G, x, y, wC, hC, { rx: 20 });
        texto(G, nom, x + 30, y + 54, { size: 30, peso: 800, ls: '0.04em', fill: C.blanco });
        texto(G, sub, x + 30, y + 92, { size: 24, peso: 400, fill: C.suave });
        const P = patronPuntos(G, offs, x + 36, y + 142, wC - 72); color(P, i % 2 ? C.blanco : C.rosa);
        const ta = F0('H6') + 0.25 + i * 0.42;
        s.on(t => {
          const v = win(t, ta, b - 0.2, .4, .4); const k = ease(ramp(t, tDos - 0.2, tDos + 0.5));
          opa(G, v * (1 - 0.8 * k));
          const sc = 1 - 0.18 * k;
          G.setAttribute('transform', `translate(${CX},${y0 - 40}) scale(${sc.toFixed(4)}) translate(${-CX},${-(y0 - 40)}) translate(0,${((1 - eo(ramp(t, ta, ta + .4))) * 16 - 150 * k).toFixed(1)})`);
        });
      });
      const tit = texto(g, 'MUCHAS MANERAS DE ORGANIZAR LOS SONIDOS', CX, 190, { anchor: 'middle', size: 26, peso: 800, ls: '0.16em', fill: C.rosa });
      mostrarEn(s, tit, F0('H6') + 0.2, tDos);
      // las dos recurrentes
      const dos = [['Escala Mayor', [0, 2, 4, 5, 7, 9, 11, 12], tMay, C.rosa], ['Escala menor', [0, 2, 3, 5, 7, 8, 10, 12], tMen, C.blanco]];
      dos.forEach(([nom, offs, tH, col], i) => {
        const G = N.group(g);
        const w = 640, h = 250, x = CX - w - 30 + i * (w + 60), y = 470;
        const r = panel(G, x, y, w, h, { rx: 24 });
        texto(G, nom, x + w / 2, y + 86, { anchor: 'middle', size: 48, peso: 800, fill: C.blanco });
        const P = patronPuntos(G, offs, x + 60, y + 170, w - 120); color(P, col);
        pop(s, G, tDos + 0.15 + i * 0.25, b - 0.2, x + w / 2, y + h / 2);
        s.on(t => { const k = win(t, tH, tH + 1.6, .25, .6); r.setAttribute('stroke', mezcla('#3a4556', col, k)); r.setAttribute('stroke-width', (1.5 + 3 * k).toFixed(2)); });
      });
    });
  }

  // ================================================================ E3–E4 · la escala de Mi mayor
  const ESC_MI = ['E4', 'F#4', 'G#4', 'A4', 'B4', 'C#5', 'D#5', 'E5'];
  const FAM = ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'];
  let XS_ESC = [];                          // x de cada nota de la escala (para la familia)
  const Y_NOMBRES = 600;
  function escenaEscalaMi() {
    const a = F0('E3') - 0.1, b = F1('E4') + 0.4;
    escena('escalaMi', a, b, (s, g) => {
      const yM = 470;
      const P = pentaClave(g, 300, yM, 1320);
      const tPen = F0('E3') + 0.1;
      aparece(s, P.g, tPen, b - 0.3, { dy: 0, fi: .5 });
      const tit = texto(g, 'Escala de Mi M', CX, 300, { anchor: 'middle', size: 40, peso: 800, fill: C.blanco });
      aparece(s, tit, Wd('E3', 'mi', 2) - 0.1, b - 0.3, { dy: 10 });
      const tn = S.ESCALA || ESC_MI.map((_, i) => F0('ESCALA') + 0.25 + i * 0.45);
      XS_ESC = ESC_MI.map((_, i) => P.x0 + 90 + i * 150);
      const tFam = Wd('E4', 'familia') - 0.2;
      ESC_MI.forEach((n, i) => {
        const x = XS_ESC[i];
        const G = N.group(g); const r = N.redonda(G, n, x, yM, SP);
        const cx = x + r.w / 2;
        pop(s, G, tn[i] - 0.03, b - 0.3, cx, r.y, { fi: .2, k0: .6 });
        resalta(s, G, tn[i] - 0.03, tn[i] + 0.42, { d: .12 });
        const nm = nombreNota(g, n.slice(0, -1), cx, Y_NOMBRES, { size: 32, anchor: 'middle', fill: C.blanco });
        s.on(t => opa(nm, win(t, tn[i], (i < 7 ? tFam + 0.1 : b - 0.3), .25, .3)));
      });
      // tonos y semitonos (T T S T T T S)
      const TS = ['T', 'T', 'S', 'T', 'T', 'T', 'S'];
      const tTS = tn[7] + 0.5;
      TS.forEach((v, i) => {
        const G = N.group(g);
        const xa = XS_ESC[i] + 22, xb = XS_ESC[i + 1] + 22, yb = 668;
        // (28-sep, norma de Iago) tono = arco redondo; semitono = pico en V; siempre por debajo
        const dS = v === 'S' ? `M${xa + 10},${yb - 14} L${(xa + xb) / 2},${yb + 4} L${xb - 10},${yb - 14}` : `M${xa + 10},${yb - 14} Q${(xa + xb) / 2},${yb + 6} ${xb - 10},${yb - 14}`;
        N.el('path', { d: dS, fill: 'none', stroke: v === 'S' ? C.rosa : C.suave, 'stroke-width': 3, 'stroke-linejoin': 'miter' }, G);
        texto(G, v === 'S' ? 'st' : v, (xa + xb) / 2, yb + 36, { anchor: 'middle', size: 28, peso: 800, fill: v === 'S' ? C.rosa : C.suave });
        mostrarEn(s, G, tTS + i * 0.12, tFam - 0.1, .25, .3);
      });
    });
  }

  // ================================================================ E4–T1 · la familia de sonidos (siempre arriba) y su centro
  function chipNota(parent, n, o) {
    o = o || {};
    const G = N.group(parent, 'chipNota');
    const w = o.w || 118, h = o.h || 64;
    const r = N.el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 16, fill: C.panel, stroke: C.borde, 'stroke-width': 2 }, G);
    const t = nombreNota(G, n, 0, 11, { size: o.size || 30, anchor: 'middle', fill: C.blanco });
    G._r = r; G._t = t;
    return G;
  }
  function escenaFamilia() {
    const a = Wd('E4', 'familia') - 0.3, b = F0('A1') + 0.3;
    escena('familia', a, b, (s, g) => {
      const tFam = Wd('E4', 'familia') - 0.2, tObra = Wd('E4', 'obra') - 0.2;
      const yF = 190, dx = 140, xF0 = CX - 3 * dx;
      const tE5 = F0('E5'), tT1 = F0('T1'), tCirc0 = Wd('T1', 'tonalidad') - 0.4, tCirc1 = tCirc0 + 1.3;
      const tCentro = Wd('T1', 'centro') - 0.2;
      const cx0 = CX, cy0 = 620, R = 232;
      const marco = N.group(g);
      N.el('rect', { x: xF0 - 90, y: yF - 58, width: 6 * dx + 180, height: 116, rx: 26, fill: 'none', stroke: 'rgba(248,250,252,0.55)', 'stroke-width': 2.5, 'stroke-dasharray': '10 8' }, marco);
      const lbl = texto(marco, 'FAMILIA DE SONIDOS', CX, yF - 76, { anchor: 'middle', size: 22, peso: 800, ls: '0.22em', fill: C.rosa });
      s.on(t => opa(marco, win(t, tFam + 0.5, tCirc0 + 0.3, .45, .4)));
      // la obra que se construye con ellos
      const obra = N.group(g);
      const ox = xF0 + 6 * dx + 170;
      obra.setAttribute('transform', `translate(${ox + 50},${yF}) scale(1.25) translate(${-(ox + 50)},${-yF})`);
      N.el('rect', { x: ox - 10, y: yF - 58, width: 120, height: 116, rx: 12, fill: C.panel, stroke: C.rosa, 'stroke-width': 2 }, obra);
      for (let k = 0; k < 4; k++) N.line(obra, ox + 8, yF - 34 + k * 17, ox + 92, yF - 34 + k * 17, 2, { stroke: C.suave });
      [[20, -26], [40, -9], [60, 8], [78, -17]].forEach(([u, v]) => N.el('ellipse', { cx: ox + u, cy: yF + v, rx: 7, ry: 5, fill: C.blanco }, obra));
      texto(obra, 'una obra', ox + 50, yF + 88, { anchor: 'middle', size: 22, peso: 700, fill: C.suave });
      s.on(t => opa(obra, win(t, tObra, tE5 + 0.6, .4, .5)));
      FAM.forEach((n, i) => {
        const G = chipNota(g, n);
        const esMi = i === 0;
        const ang = -Math.PI / 2 + (i - 1) * 2 * Math.PI / 6;
        s.on(t => {
          // 1) sale del nombre de la nota bajo el pentagrama y sube a la fila
          const k1 = ease(ramp(t, tFam + i * 0.06, tFam + 0.9 + i * 0.06));
          const xa = (XS_ESC[i] || (xF0 + i * dx)) + 22, ya = Y_NOMBRES - 11;
          let x = lerp(xa, xF0 + i * dx, k1), y = lerp(ya, yF, k1), sc = lerp(0.8, 1, k1);
          // 2) de la fila al círculo (Mi en el centro)
          const k2 = ease(ramp(t, tCirc0 + (esMi ? 0 : 0.45 + i * 0.12), tCirc1 + (esMi ? -0.3 : 0.45 + i * 0.12)));
          const rot = 0.12 * Math.max(0, t - tCirc1);                       // giro lento alrededor del centro
          if (esMi) { x = lerp(x, cx0, k2); y = lerp(y, cy0, k2); }
          else if (k2 > 0) {                                               // en espiral alrededor del centro (sin cruzarlo)
            const r0 = Math.hypot(x - cx0, y - cy0), a0 = Math.atan2(y - cy0, x - cx0);
            let da = (ang + rot) - a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
            const rr = lerp(r0, R, k2), aa = a0 + da * k2;
            x = cx0 + rr * Math.cos(aa); y = cy0 + rr * Math.sin(aa);
          }
          sc = lerp(sc, esMi ? 1.6 : 1.05, k2);
          G.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${sc.toFixed(3)})`);
          opa(G, win(t, tFam, b - 0.3, .3, .4));
        });
        // color de cada sensación
        s.on(t => {
          let col = null;
          if (n === 'D#') col = win(t, S.TENSION - 0.05, S.CONTINUAR[0] - 0.3, .2, .3) > 0.01 ? [C.rosa, win(t, S.TENSION - 0.05, S.CONTINUAR[0] - 0.3, .2, .3)] : null;
          if (n === 'F#') { const v = win(t, S.CONTINUAR[0] - 0.05, S.CONTINUAR[1] + 0.3, .2, .3); if (v > 0.01) col = [C.rosa, v]; }
          if (n === 'G#') { const v = win(t, S.CONTINUAR[1] - 0.05, F0('E8'), .2, .3); if (v > 0.01) col = [C.rosa, v]; }
          if (esMi) { const v = Math.max(win(t, S.LLEGADA[1] - 0.05, 1e9, .25, .3), ease(ramp(t, tCirc0, tCirc1))); if (v > 0.01) col = [ORO, v]; }
          G._r.setAttribute('stroke', col ? mezcla('#3a4556', col[0], col[1]) : C.borde);
          G._r.setAttribute('stroke-width', col ? (2 + 2.5 * col[1]).toFixed(2) : 2);
          G._r.setAttribute('fill', col && esMi ? `rgba(236,72,153,${(0.22 * col[1]).toFixed(3)})` : C.panel);
        });
      });
      // centro tonal
      const cen = N.group(g);
      const cc = N.group(cen); icoCasa(cc, cx0, cy0 - 112, 0.8); color(cc, ORO);
      texto(cen, 'CENTRO', cx0, cy0 + 100, { anchor: 'middle', size: 30, peso: 800, ls: '0.2em', fill: ORO });
      s.on(t => opa(cen, win(t, tCentro, b - 0.3, .4, .4)));
      const ton = texto(g, 'TONALIDAD', cx0, 300, { anchor: 'middle', size: 44, peso: 800, ls: '0.12em', fill: C.blanco });
      aparece(s, ton, Wd('T1', 'tonalidad') - 0.15, b - 0.3, { dy: 10 });
      const org = texto(g, 'organizar la música alrededor de un centro', cx0, 960, { anchor: 'middle', size: 34, peso: 600, fill: '#cbd5e1' });
      aparece(s, org, Wd('T1', 'organizar') - 0.1, b - 0.3, { dy: 10 });
    });
  }

  // ================================================================ E5–LLEGADA · tensión, continuar, llegar a casa
  function escenaSensaciones() {
    const a = F0('E5') - 0.1, b = Wd('T1', 'tonalidad') - 0.2;
    escena('sensaciones', a, b, (s, g) => {
      const yM = 600, xP = 560, anchoP = 800;
      const P = pentaClave(g, xP, yM, anchoP);
      const tA = S.ACORDE || F0('ACORDE') + 0.15;
      aparece(s, P.g, F0('E5') + 0.3, b - 0.2, { dy: 0, fi: .6 });
      const pre = texto(g, 'no todas producen la misma sensación', CX, 330, { anchor: 'middle', size: 34, peso: 600, italic: true, fill: C.suave });
      aparece(s, pre, Wd('E5', 'todas') - 0.1, tA - 0.1, { dy: 8 });
      // acorde de Mi (mi–sol♯–si)
      const xAc = xP + 260;
      const AC = N.group(g);
      ['E4', 'G#4', 'B4'].forEach(n => N.redonda(AC, n, xAc, yM, SP));
      pop(s, AC, tA - 0.05, b - 0.2, xAc + 20, yM + 20, { fi: .25, k0: .7 });
      const lbA = texto(g, 'Acorde de Mi M', xAc + 22, yM + 150, { anchor: 'middle', size: 32, peso: 800, fill: C.blanco });
      aparece(s, lbA, tA, b - 0.2, { dy: 8 });
      // nota de arriba que cambia: re♯ (tensión) · fa♯ → sol♯ (continuar) · re♯ → mi (llegada)
      const xN = xP + 520;
      const tz = S.TENSION, co = S.CONTINUAR, ll = S.LLEGADA;
      const notaSup = (n, t0, t1, col) => {
        const V = N.group(g), G = N.group(V); N.redonda(G, n, xN, yM, SP);
        pop(s, G, t0 - 0.03, t1, xN + 20, yM - N.posSol(n) * SP, { fi: .2, fo: .25, k0: .6 });
        color(G, col); return V;
      };
      const reT = notaSup('D#5', tz, co[0] - 0.25, C.rosa);
      notaSup('F#5', co[0], co[1] - 0.02, C.rosa);
      notaSup('G#5', co[1], F0('E8') + 0.2, C.rosa);
      notaSup('D#5', ll[0], ll[1] - 0.02, C.rosa);
      notaSup('E5', ll[1], b - 0.2, ORO);
      // vibración de la tensión
      // flecha fa♯ → sol♯ (sigue su camino)
      const fl = N.group(g); color(fl, C.rosa);
      flecha(fl, xN + 70, yM - 3.5 * SP + 6, xN + 70, yM - 4 * SP - 6, { w: 4, cab: 12 });
      mostrarEn(s, fl, co[1] - 0.15, F0('E8'));
      // rótulos de cada sensación (a la derecha)
      const xR = 1560;
      const rot = (txt, col, ico, t0, t1) => {
        const G = N.group(g);
        const I = N.group(G); ico(I, xR, yM - 90); color(I, col);
        texto(G, txt, xR, yM + 10, { anchor: 'middle', size: 34, peso: 800, ls: '0.08em', fill: col });
        aparece(s, G, t0, t1, { dy: 10, fi: .3 });
        return G;
      };
      rot('TENSIÓN', C.rosa, (I, x, y) => N.el('path', { d: `M${x - 60},${y} l20,-26 l20,52 l20,-52 l20,52 l20,-52 l20,26`, fill: 'none', stroke: 'currentColor', 'stroke-width': 6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, I), tz, co[0] - 0.25);
      rot('QUIERE SEGUIR', C.rosa, (I, x, y) => flecha(I, x - 60, y, x + 60, y, { w: 6, cab: 20 }), co[0], F0('E8') + 0.2);
      rot('LLEGADA', ORO, (I, x, y) => icoCasa(I, x, y - 6, 1.3), ll[1], b - 0.2);
      const casa = texto(g, 'como volver a casa', xR, yM + 60, { anchor: 'middle', size: 26, peso: 600, italic: true, fill: C.suave });
      aparece(s, casa, ll[1] + 0.3, b - 0.2, { dy: 6 });
      // la re♯ «vibra» un poco mientras suena la tensión
      s.on(t => {
        const k = win(t, tz + 0.1, co[0] - 0.3, .2, .2);
        reT.setAttribute('transform', k > 0 ? `translate(${(Math.sin(t * 70) * 2.2 * k).toFixed(2)},0)` : '');
      });
    });
  }

  // ================================================================ A · la armadura
  const MELO = [
    ['E4', 'F#4', 'G#4', 'A4'], ['B4', 'C#5', 'D#5', 'E5'], ['D#5', 'C#5', 'B4', 'G#4'], ['F#4', 'G#4', 'E4']];
  function escenaArmadura() {
    const a = F0('A1') - 0.1, b = F0('S1') + 0.4;
    escena('armadura', a, b, (s, g) => {
      const yM = 540, xP = 150, anchoP = 1620;
      const P = pentaClave(g, xP, yM, anchoP);
      aparece(s, P.g, F0('A1'), b - 0.3, { dy: 0, fi: .6 });
      const tit = texto(g, 'Una obra en Mi M', CX, 330, { anchor: 'middle', size: 38, peso: 800, fill: C.blanco });
      aparece(s, tit, Wd('A2', 'mi') - 0.1, b - 0.3, { dy: 8 });
      const xArm = P.x0 + 6;                           // aquí irá la armadura (4 sostenidos)
      const wArm = 4 * (N.anchoAlt('#') + 0.14) * SP + 0.6 * SP;
      let x = xArm + wArm + 30;
      const notas = [], alts = [];
      const barras = N.group(g, 'barras');
      const esp = 80;
      const tNotas = F0('A2') - 0.2;
      MELO.forEach((comp, ci) => {
        comp.forEach((n, ni) => {
          const blanca = ci === 3 && ni === 2;
          const G = N.group(g);
          const it = [{ p: n, n: blanca ? 'h' : 'q' }];
          const m = N.melodia(G, it.map(o => ({ p: o.p.replace('#', ''), n: o.n })), x, yM, { sp: SP });
          let alt = null;
          if (n.includes('#')) {
            alt = N.group(g, 'alt');
            N.glyph(alt, 'accidentalSharp', x - (N.anchoAlt('#') + 0.22) * SP, yM - N.posSol(n) * SP, SP);
            alts.push({ g: alt, n: n[0], x: x - 0.8 * SP, y: yM - N.posSol(n) * SP, ci });
          }
          notas.push({ g: G, n: n[0], x, ci, alt, cab: m.notas[0].cabeza, y: yM - N.posSol(n) * SP });
          x += esp * (blanca ? 1.6 : 1);
        });
        if (ci < 3) { barra(barras, x - 12, yM); x += 40; }
      });
      barra(barras, xP + anchoP - 14, yM); N.line(barras, xP + anchoP - 4, yM - 2 * SP, xP + anchoP - 4, yM + 2 * SP, 0.5 * SP);
      aparece(s, barras, tNotas, b - 0.3, { dy: 0, fi: .8 });
      notas.forEach((o, i) => aparece(s, o.g, tNotas + i * 0.12, b - 0.3, { dy: 8, fi: .3 }));
      // las alteraciones de la obra: aparecen con su nota, se nombran, se repiten… y se van a la armadura
      const tVan = Wd('A4', 'principio') - 0.1;
      const nombre = { F: 'fa', C: 'do', G: 'sol', D: 're' };
      const tNom = {}; for (const k in nombre) tNom[k] = Wd('A2', nombre[k], k === 'D' ? 1 : 1) - 0.1;
      // «re» aparece también en «durante»… se busca «re» tras «sol»
      tNom.D = Wd('A2', 're') > tNom.G ? Wd('A2', 're') - 0.1 : tNom.G + 0.9;
      const tRep = F0('A3');
      alts.forEach((o, i) => {
        const ta = tNotas + notas.findIndex(nn => nn.alt === o.g) * 0.12;
        s.on(t => {
          const v = win(t, ta, 1e9, .3, .3) * (1 - ease(ramp(t, tVan, tVan + 0.5)));
          opa(o.g, v);
          // «una y otra vez»: pulso de izquierda a derecha
          const pk = ramp(t, tRep + 0.2 + i * 0.16, tRep + 0.45 + i * 0.16) * (1 - ramp(t, tRep + 0.45 + i * 0.16, tRep + 0.7 + i * 0.16));
          const sc = 1 + 0.35 * Math.sin(Math.PI * clamp(pk));
          o.g.setAttribute('transform', `translate(${o.x},${o.y}) scale(${sc.toFixed(3)}) translate(${-o.x},${-o.y})`);
        });
        s.on(t => {
          const k = Math.max(win(t, tNom[o.n], tNom[o.n] + 1.1, .2, .4), win(t, tRep + 0.2 + i * 0.16, tRep + 0.9 + i * 0.16, .1, .3));
          color(o.g, mezcla(C.blanco, C.rosa, k));
        });
      });
      const cuenta = texto(g, '9 sostenidos… y la obra sigue', CX, 800, { anchor: 'middle', size: 32, peso: 600, italic: true, fill: C.suave });
      aparece(s, cuenta, tRep + 0.8, tVan, { dy: 8 });
      // la armadura: fa, do, sol, re en su sitio (salen de la primera de cada una)
      const AR = N.armaduraGen(g, xArm, yM, SP, 4, '#');
      const orden = ['F', 'C', 'G', 'D'];
      AR.items.forEach((it, i) => {
        const src = alts.find(o => o.n === orden[i]);
        const t0 = tVan + i * 0.28, t1 = t0 + 0.9;
        const yDest = yM - it.pos * SP;
        s.on(t => {
          const k = ease(ramp(t, t0, t1));
          opa(it.g, t < t0 ? 0 : win(t, t0, b - 0.3, .15, .4));
          const dx = (src.x - it.x) * (1 - k), dy = (src.y - yDest) * (1 - k) - Math.sin(Math.PI * k) * 60;
          it.g.setAttribute('transform', `translate(${dx.toFixed(1)},${dy.toFixed(1)})`);
        });
      });
      const tA5 = F0('A5');
      resalta(s, AR.g, tA5, F0('A6') + 1.5, { d: .3 });
      // «estas notas estarán alteradas»: todas las fa, do, sol y re se iluminan, de izquierda a derecha
      notas.filter(o => 'FCGD'.includes(o.n)).forEach((o, i) => {
        const ta = Wd('A5', 'notas') - 0.1 + i * 0.1;
        s.on(t => color(o.g, mezcla(C.blanco, C.rosa, win(t, ta, F1('A5') + 0.4, .2, .5))));
      });
      const todas = texto(g, 'todos los Fa, Do, Sol y Re suenan sostenidos', CX, 800, { anchor: 'middle', size: 32, peso: 600, fill: '#cbd5e1' });
      aparece(s, todas, Wd('A5', 'notas'), F0('A6') - 0.1, { dy: 8 });
      // ARMADURA
      const lbl = N.group(g);
      const xa0 = xArm - 10, xa1 = xArm + wArm - 0.4 * SP;
      N.el('path', { d: `M${xa0},${yM + 3.2 * SP} v14 h${xa1 - xa0} v-14`, fill: 'none', stroke: C.rosa, 'stroke-width': 3.5 }, lbl);
      chip(lbl, 'ARMADURA', (xa0 + xa1) / 2, yM + 3.2 * SP + 58, { size: 26, anchor: 'middle' });
      aparece(s, lbl, Wd('A6', 'armadura') - 0.15, b - 0.3, { dy: 10 });
      // al final de la escena, todo se recoge hacia arriba para dejar sitio (S1)
    });
  }

  // ================================================================ S1 · no es solo un ejercicio
  function escenaSentido() {
    const a = F0('S1') - 0.1, b = F0('C1') + 0.2;
    escena('sentido', a, b, (s, g) => {
      const tIn = F0('S1') + 0.1;
      // ficha de ejercicio
      const E = N.group(g);
      const ex = 170, ey = 300, ew = 620, eh = 440;
      panel(E, ex, ey, ew, eh, { rx: 18, fill: 'rgba(248,250,252,0.06)' });
      texto(E, 'EJERCICIO', ex + 40, ey + 62, { size: 24, peso: 800, ls: '0.2em', fill: C.rosa });
      texto(E, 'Indica la tonalidad', ex + 40, ey + 108, { size: 32, peso: 700, fill: C.blanco });
      const P = pentaClave(E, ex + 60, ey + 230, 500, 20);
      const ar = N.armaduraGen(E, P.x0 + 4, ey + 230, 20, 4, '#');
      texto(E, 'Tonalidad:', ex + 60, ey + 366, { size: 30, peso: 600, fill: C.suave });
      N.line(E, ex + 230, ey + 372, ex + 540, ey + 372, 2.5, { stroke: C.suave });
      const resp = texto(E, 'Mi M', ex + 385, ey + 360, { anchor: 'middle', size: 36, peso: 800, fill: C.rosa });
      aparece(s, E, tIn, b - 0.3, { dy: 16 });
      resalta(s, ar.g, Wd('S1', 'armadura') - 0.1, Wd('S1', 'armadura') + 1.4);
      const tNo = Wd('S1', 'simplemente') - 0.2, tDes = Wd('S1', 'descubriendo') - 0.2;
      s.on(t => { const k = ease(ramp(t, tNo, tNo + 0.6)) * (1 - ease(ramp(t, tDes, tDes + 0.5))); E.style.filter = k > 0.01 ? `grayscale(${k.toFixed(2)})` : ''; });
      const solo = texto(g, 'no es solo teoría…', ex + ew / 2, ey + eh + 70, { anchor: 'middle', size: 32, peso: 600, italic: true, fill: C.suave });
      aparece(s, solo, tNo + 0.3, b - 0.3, { dy: 8 });
      s.on(t => opa(resp, ease(ramp(t, tDes + 0.3, tDes + 0.8))));
      // flecha → lo que descubres
      const fl = N.group(g); color(fl, C.rosa); flecha(fl, ex + ew + 40, ey + eh / 2, ex + ew + 180, ey + eh / 2, { w: 5, cab: 18 });
      mostrarEn(s, fl, tDes, b - 0.3);
      const tGr = Wd('S1', 'grupo') - 0.2, tCe = Wd('S1', 'centro') - 0.2;
      const gr = N.group(g);
      texto(gr, 'GRUPO DE SONIDOS', 1390, ey + 20, { anchor: 'middle', size: 26, peso: 800, ls: '0.18em', fill: C.rosa });
      FAM.forEach((n, i) => {
        const c = chipNota(gr, n, { w: 108, h: 58, size: 28 });
        const x = 1390 + ((i % 4) - 1.5) * 124 + (i >= 4 ? 62 : 0), y = ey + 100 + Math.floor(i / 4) * 76;
        c.setAttribute('transform', `translate(${x},${y})`);
        if (i === 0) { c._r.setAttribute('stroke', ORO); }
      });
      aparece(s, gr, tGr, b - 0.3, { dy: 12 });
      const ce = N.group(g);
      const ci = N.group(ce); icoCasa(ci, 1300, ey + 330, 1.0); color(ci, ORO);
      const tCen = texto(ce, 'CENTRO:', 1360, ey + 344, { size: 30, peso: 800, ls: '0.1em', fill: ORO });
      nombreNota(ce, 'E', 1360 + D.medir(tCen) + 16, ey + 346, { size: 40, fill: ORO });
      aparece(s, ce, tCe, b - 0.3, { dy: 10 });
    });
  }

  // ================================================================ C · lo que viene: reconocerla (tres tipos de ejercicio)
  function escenaEjercicios() {
    const a = F0('C1') - 0.1, b = T.acorde + 0.15;
    escena('ejercicios', a, b, (s, g) => {
      const tRec = Wd('C1', 'reconocerlo') - 0.2, tC2 = F0('C2');
      const O = N.group(g); icoOjo(O, CX, 470, 1.6); color(O, C.rosa);
      const tInd = Wd('C2', 'indicar') - 0.1;
      pop(s, O, F0('C1'), tInd, CX, 470);
      const rc = texto(g, 'aprender a reconocerla', CX, 640, { anchor: 'middle', size: 44, peso: 700, fill: C.blanco });
      aparece(s, rc, tRec, tInd, { dy: 10 });
      const tipos = [
        ['indicar', 1, 'INDICAR LA TONALIDAD', (G, cx, cy) => { const P = pentaClave(G, cx - 140, cy, 280, 17); N.armaduraGen(G, P.x0, cy, 17, 3, 'b'); texto(G, '→ ?', cx + 88, cy + 16, { anchor: 'middle', size: 50, peso: 800, fill: C.rosa }); }],
        ['indicar', 2, 'INDICAR LA ARMADURA', (G, cx, cy) => { texto(G, 'Re M →', cx - 40, cy + 12, { anchor: 'middle', size: 38, peso: 700, fill: C.blanco }); texto(G, '?', cx + 110, cy + 20, { anchor: 'middle', size: 60, peso: 800, fill: C.rosa }); }],
        ['vecinos', 1, 'TONOS VECINOS', (G, cx, cy) => {
          const pts = [[0, 0], [-110, -34], [110, -34], [-110, 40], [110, 40], [0, 66]];
          pts.slice(1).forEach(([x, y]) => N.line(G, cx, cy, cx + x, cy + y, 2.5, { stroke: C.suave }));
          pts.forEach(([x, y], i) => N.el('circle', { cx: cx + x, cy: cy + y, r: i ? 15 : 22, fill: i ? C.panel : C.rosa, stroke: i ? C.rosa : 'none', 'stroke-width': 3 }, G));
        }],
      ];
      const wC = 520, gap = 40, x0 = CX - (3 * wC + 2 * gap) / 2, y0 = 330, hC = 400;
      const cab = texto(g, 'TRES TIPOS DE EJERCICIOS', CX, 250, { anchor: 'middle', size: 28, peso: 800, ls: '0.18em', fill: C.rosa });
      aparece(s, cab, tC2 + 0.3, b - 0.3, { dy: 8 });
      tipos.forEach(([pal, n, tit, dib], i) => {
        const G = N.group(g);
        const x = x0 + i * (wC + gap);
        const r = panel(G, x, y0, wC, hC, { rx: 22 });
        texto(G, String(i + 1), x + 42, y0 + 70, { size: 48, peso: 800, fill: C.rosa });
        dib(G, x + wC / 2, y0 + 190);
        texto(G, tit, x + wC / 2, y0 + 330, { anchor: 'middle', size: 30, peso: 800, ls: '0.04em', fill: C.blanco });
        const ta = Wd('C2', pal, n) - 0.15;
        aparece(s, G, ta, b - 0.3, { dy: 20 });
        // «los siguientes vídeos»: cada tarjeta se vuelve un vídeo (▶)
        const pl = N.group(G);
        N.el('circle', { cx: x + wC - 56, cy: y0 + 56, r: 30, fill: C.rosa }, pl);
        N.el('path', { d: `M${x + wC - 66},${y0 + 40} l26,16 l-26,16 z`, fill: '#fff' }, pl);
        const tv = Wd('C3', 'videos') - 0.4 + i * 0.2;
        pop(s, pl, tv, b - 0.3, x + wC - 56, y0 + 56, { k0: .4 });
        s.on(t => r.setAttribute('stroke', mezcla('#3a4556', C.rosa, win(t, tv, b, .3, .3) * 0.9)));
      });
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

  // ================================================================ fondo: velo según el momento (norma 4)
  function veloFondo(t) {
    const tit = 1 - ease(ramp(t, F1('TITULO') - 1.0, F1('TITULO') + 0.3));
    const fin = ease(ramp(t, T.acorde - 0.05, T.acorde + 0.4));
    return clamp(0.72 - 0.19 * Math.max(tit, fin), 0, 0.92);
  }

  // ================================================================ construir todo
  function construir(tiempos) {
    T = tiempos;
    esc.length = 0;
    const capa = document.getElementById('capaEscenas');
    while (capa.firstChild) capa.removeChild(capa.firstChild);
    escenaTitulo(); escenaPregunta(); escenaHistoria(); escenaMonocordio(); escenaEscalas();
    escenaEscalaMi(); escenaSensaciones(); escenaFamilia(); escenaArmadura(); escenaSentido(); escenaEjercicios(); escenaFinal();
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
