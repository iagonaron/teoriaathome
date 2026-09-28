/* =====================================================================
   GUION · Tonalidades vecinas
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'D1', txt: "Las tonalidades vecinas son las que tienen armaduras vecinas: una alteración más y una alteración menos.", pausa: 0.2 },
  { id: 'D2', txt: "Y además, el relativo, claro.", pausa: 0.2 },
  { id: 'D3', txt: "En total, seis tonalidades, contando la que te dan.", pausa: 0.6 },
  { id: 'E1', txt: "Vamos con un ejemplo:", pausa: 0.1 },
  { id: 'E2', txt: "las vecinas de Mi bemol Mayor.", pausa: 0.3 },
  { id: 'E3', txt: "Bueno, primero tenemos que calcular su armadura.", pausa: 0.2 },
  { id: 'E4', txt: "Mmm, tres bemoles, ¿no? Sí: Mi, y uno más, La. Tres bemoles.", pausa: 0.3 },
  { id: 'E5', txt: "Y anotamos su relativo menor: Do menor.", pausa: 0.5 },
  { id: 'A1', txt: "Ahora, las armaduras.", pausa: 0.2 },
  { id: 'A2', txt: "La que tiene una más, es decir, cuatro bemoles, que es La bemol Mayor y Fa menor.", pausa: 0.3 },
  { id: 'A3', txt: "Y una menos, dos bemoles: Si bemol Mayor y su relativo, pues Sol menor.", pausa: 0.7 },
  { id: 'V1', txt: "Si tienes dudas de esto, o te parece que voy muy rápido, te recomiendo que repases el vídeo de «Indica la tonalidad».", pausa: 0.8 },
  { id: 'X1', txt: "Ojo con un caso especial: si la tonalidad no tiene alteraciones, como Do Mayor,", pausa: 0.1 },
  { id: 'X2', txt: "sus armaduras vecinas son, por un lado, la que tiene un sostenido y, por el otro, la que tiene un bemol.", pausa: 0.2 },
  { id: 'X3', txt: "Es decir: Sol Mayor y Mi menor.", pausa: 0.2 },
  { id: 'X4', txt: "Y, por el otro lado, Fa Mayor y Re menor.", pausa: 0.8 },
  { id: 'F1', txt: "Así que, conclusión: saber la armadura y su relativo,", pausa: 0.1 },
  { id: 'F2', txt: "y los vecinos tienen una alteración más y una menos.", pausa: 0.2 },
  { id: 'F3', txt: "Seis, y listo.", pausa: 0.0 },
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
