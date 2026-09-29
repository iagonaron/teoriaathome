/* =====================================================================
   GUION · Acordes
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'I1', txt: "Un acorde, básicamente, son dos o más sonidos que suenan a la vez.", pausa: 0.1 },
  { bloque: 'SON_SUS', dur: 2.2 },
  { id: 'I2', txt: "Los hay que suenan muy bonitos, muy armónicos,", pausa: 0.1 },
  { bloque: 'SON_BON', dur: 2.2 },
  { id: 'I2b', txt: "y hay otros que, literalmente, suenan fatal.", pausa: 0.1 },
  { bloque: 'SON_MAL', dur: 2.4 },
  { id: 'I3', txt: "Vamos a ver los más importantes. En este caso, todos partiendo de la nota Do.", pausa: 0.7 },
  { id: 'T1', txt: "Empezamos por los tres sonidos: las tríadas.", pausa: 0.3 },
  { id: 'T2', txt: "Se miden desde la fundamental, que, con el acorde ordenado, es la nota de abajo.", pausa: 0.3 },
  { id: 'T3', txt: "Y solo cambian dos cosas: la tercera y la quinta.", pausa: 0.8 },
  { id: 'M1', txt: "El perfecto Mayor tiene tercera Mayor y quinta justa.", pausa: 0.2 },
  { bloque: 'SON_PM', dur: 2.4 },
  { id: 'M2', txt: "Tenemos que tener los intervalos frescos para enfrentarnos a los acordes, ¿vale?", pausa: 0.8 },
  { id: 'N1', txt: "El perfecto menor tiene tercera menor y quinta justa.", pausa: 0.2 },
  { id: 'N2', txt: "Do, Mi bemol, y Sol, la quinta.", pausa: 0.2 },
  { bloque: 'SON_PMEN', dur: 2.4 },
  { id: 'A1', txt: "El aumentado, que, por cierto, suena así.", pausa: 0.1 },
  { bloque: 'SON_AUM', dur: 2.4 },
  { id: 'A2', txt: "Tercera Mayor y quinta aumentada.", pausa: 0.2 },
  { id: 'A3', txt: "Do, Mi, Sol sostenido.", pausa: 0.3 },
  { id: 'A4', txt: "Como si algo fuese a suceder, ¿verdad? Es tenso.", pausa: 0.8 },
  { id: 'D1', txt: "Y el disminuido, que también tiene una sonoridad ahí ciertamente incómoda.", pausa: 0.3 },
  { id: 'D2', txt: "Tiene tercera menor y quinta disminuida.", pausa: 0.2 },
  { id: 'D3', txt: "Do, Mi bemol y Sol bemol.", pausa: 0.2 },
  { bloque: 'SON_DIS', dur: 2.4 },
  { id: 'S1', txt: "Ahora, uno de cuatro sonidos: una cuatríada.", pausa: 0.3 },
  { id: 'S2', txt: "El acorde de séptima de dominante. Se utiliza mucho, pues eso, como dominante, para resolver. Añade como un poquito más de tensión y es muy típico.", pausa: 0.6 },
  { id: 'S3', txt: "Es un acorde perfecto Mayor al que le añadimos una séptima menor.", pausa: 0.2 },
  { id: 'S4', txt: "Do, Mi, Sol, Si bemol.", pausa: 0.2 },
  { bloque: 'SON_7D', dur: 2.6 },
  { id: 'F1', txt: "Por ejemplo, este acorde se dice que es el acorde de séptima de dominante de Fa Mayor. ¿Por qué? Porque es un acorde de séptima", pausa: 0.1 },
  { id: 'F2', txt: "y se forma sobre la dominante de Fa. Suena así.", pausa: 0.1 },
  { bloque: 'SON_RES', dur: 3.8 },
  { id: 'F3', txt: "Y pide resolver para el reposo que te da, en este caso, Fa Mayor.", pausa: 1.0 },
  { id: 'R1', txt: "Bueno, vamos a hacer un repaso, entonces. Tercera Mayor y quinta justa: perfecto Mayor.", pausa: 0.2 },
  { id: 'R2', txt: "Tercera menor y quinta justa: perfecto menor.", pausa: 0.2 },
  { id: 'R3', txt: "Tercera Mayor y quinta aumentada: aumentado.", pausa: 0.2 },
  { id: 'R4', txt: "Tercera menor y quinta disminuida: disminuido.", pausa: 0.3 },
  { id: 'R5', txt: "Y si al perfecto Mayor le sumas una séptima menor, tienes el acorde de séptima de dominante.", pausa: 0.5 },
  { id: 'R6', txt: "Venga, ¡vamos a por ellos!", pausa: 0.0 },
  { bloque: 'COLA', dur: 2.6 },
  { bloque: 'FINAL', dur: 3.6 },
];

/* ------------------------------------------------------------------ línea de tiempo */
(function () {
  'use strict';
  const HUECO = 0.5;            // silencio base entre frases (s)
  const SIL_S = 5.7;            // sílabas por segundo (ritmo de Iago, sin pausas largas)

  function silabas(txt) {
    const s = txt.toLowerCase().normalize('NFC').replace(/[^a-záéíóúüñ\s]/g, ' ');
    let n = 0;
    for (const w of s.split(/\s+/)) if (w) n += Math.max(1, (w.match(/[aeiouáéíóúü]+/g) || []).length);
    return n;
  }
  function palabras(txt) { return txt.split(/\s+/).filter(Boolean); }

  /** Estimación de la duración de una frase y de la posición de cada palabra. */
  function estimar(f) {
    const ws = palabras(f.txt);
    let t = 0; const out = [];
    for (const w of ws) {
      const d = Math.max(0.16, silabas(w) / SIL_S);
      out.push([w, +t.toFixed(3)]);
      t += d + 0.03;
      if (/[,;:]$/.test(w)) t += 0.32;
      if (/[.?!]$/.test(w)) t += 0.55;
      if (/…$/.test(w)) t += 0.55;
    }
    return { dur: t, palabras: out };
  }

  /**
   * Construye la línea de tiempo: T.frase[id] = {t0,t1,palabras:[[w,t]]}, T.bloque[nombre]={t0,t1},
   * T.dur (fin), T.acorde (golpe del acorde final). Si existe window.TIEMPOS (grabación real), manda él.
   */
  function construir() {
    const R = window.TIEMPOS;
    const T = { frase: {}, bloque: {}, orden: [], real: !!R };
    if (R) {
      Object.assign(T.frase, R.frase); Object.assign(T.bloque, R.bloque);
      T.dur = R.dur; T.acorde = R.acorde; T.orden = R.orden || [];
      return T;
    }
    let t = 0;
    for (const item of window.GUION) {
      if (item.bloque) {
        T.bloque[item.bloque] = { t0: +t.toFixed(3), t1: +(t + item.dur).toFixed(3) };
        T.orden.push(item.bloque);
        t += item.dur;
        continue;
      }
      const e = estimar(item);
      T.frase[item.id] = { t0: +t.toFixed(3), t1: +(t + e.dur).toFixed(3), txt: item.txt,
        palabras: e.palabras.map(([w, dt]) => [w, +(t + dt).toFixed(3)]) };
      T.orden.push(item.id);
      t += e.dur + HUECO + (item.pausa || 0);
    }
    T.acorde = T.bloque.FINAL.t0;
    T.dur = T.bloque.FINAL.t1;
    return T;
  }

  window.construirTiempos = construir;
  window.silabasGuion = silabas;
})();
