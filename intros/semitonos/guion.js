/* =====================================================================
   GUION · Semitono cromático y diatónico
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'I1', txt: "Si te pregunto cuál es la distancia más pequeña entre dos sonidos,", pausa: 0.1 },
  { id: 'I2', txt: "¿qué me responderías?", pausa: 0.6 },
  { id: 'I3', txt: "Probablemente, una segunda menor, ¿no? Un semitono.", pausa: 0.3 },
  { id: 'I4', txt: "Y no te culpo: os lo hemos enseñado así.", pausa: 0.1 },
  { id: 'I5', txt: "Lo que pasa es que tengo que ser honesto en este momento.", pausa: 0.2 },
  { id: 'I6', txt: "La realidad es que esto es así en nuestra música, en lo que llamamos temperamento igual.", pausa: 0.4 },
  { id: 'I7', txt: "Pero si yo, por ejemplo, me pongo a cantar esto…", pausa: 0.2 },
  { id: 'I8', txt: "♪", pausa: 0.3 },
  { id: 'I9', txt: "digamos que yo ahí, entre un tono y el siguiente semitono, he podido pasar por una cantidad, pues, a lo mejor, infinita o incalculable de pequeñas microafinaciones, ¿verdad?", pausa: 0.3 },
  { id: 'I10', txt: "Pero bueno, ya nos entendemos. Estamos hablando de que la división máxima que hacemos en la música que utilizamos a día de hoy es el semitono. Pero si tú tocas el violín, o si tocas el trombón, o tocas instrumentos que, digamos, pueden pasar de una nota progresiva a otra, pues realmente hay más. Pero venga, nos damos la mano y tiramos para adelante. Hablemos del semitono cromático y diatónico.", pausa: 1.0 },
  { id: 'C1', txt: "El semitono cromático se da entre dos notas del mismo nombre: Do y Do sostenido, Mi bemol, Mi becuadro.", pausa: 0.3 },
  { id: 'C2', txt: "Truco: cromático, copia.", pausa: 0.9 },
  { id: 'D1', txt: "El semitono diatónico se da entre dos notas de distinto nombre, seguidas: Mi–Fa, Do–Re bemol.", pausa: 0.3 },
  { id: 'D2', txt: "Truco: diatónico, distinto.", pausa: 0.9 },
  { id: 'P1', txt: "Y fíjate en el piano: Do–Do sostenido y Do–Re bemol suenan exactamente igual.", pausa: 0.2 },
  { bloque: 'SON_IGUAL', dur: 3.3 },
  { id: 'P2', txt: "Pero el primero es cromático y el segundo es diatónico. Lo que manda es el nombre.", pausa: 1.0 },
  { id: 'B1', txt: "Y no te olvides de utilizar los becuadros, que en muchos casos son necesarios, y, si no los pones, no estás haciendo el cromatismo.", pausa: 0.4 },
  { id: 'B2', txt: "Fíjate en estos ejemplos mal hechos…", pausa: 0.9 },
  { id: 'B3', txt: "y en estos ejemplos bien hechos.", pausa: 0.9 },
  { id: 'B4', txt: "Me gusta recordarlo porque es un error bastante típico que me encuentro en los ejercicios.", pausa: 0.0 },
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
