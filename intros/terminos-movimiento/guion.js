/* =====================================================================
   GUION · Términos de movimiento
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'I1', txt: "Los términos de movimiento nos dicen la velocidad: el tempo.", pausa: 0.3 },
  { id: 'I2', txt: "Y hay dos tipos:", pausa: 0.1 },
  { id: 'I3', txt: "los que se fijan al principio de la partitura y los que lo van cambiando por el camino. Algo así como alteraciones en la armadura y alteraciones accidentales. Venga, para que te orientes.", pausa: 0.9 },
  { id: 'L1', txt: "Los del principio van del más rápido al más lento. Me interesa mucho que te fijes en el término Moderato, porque es como el que está en el medio y nos sirve como de brújula, como de ancla.", pausa: 0.5 },
  { id: 'L2', txt: "Venga, los más lentos son: Grave, Larghissimo.", pausa: 0.2 },
  { id: 'L3', txt: "Y voy subiendo: Largo, Larghetto, Lento, Adagio, Adagietto, Andante, Andantino.", pausa: 0.2 },
  { id: 'L4', txt: "Moderato.", pausa: 0.4 },
  { id: 'L5', txt: "Ahora ya vamos con los que son rápidos: Allegretto, Allegro, Vivace, Vivacissimo, Presto, Prestissimo.", pausa: 0.9 },
  { id: 'N1', txt: "Son muchos términos, la verdad. De hecho, a día de hoy tenemos una forma objetiva de ponerlo, como matemática, que es, lo habrás visto, poner una figura igual a… el número que hay que poner en el metrónomo. Y así va a ser igual aquí y en la China.", pausa: 0.5 },
  { id: 'N2', txt: "Pero bueno, los términos hay que saberlos, porque mucha de la música que vamos a tocar estaba escrita de esta forma. Entonces, lo que decía: Moderato es el centro.", pausa: 0.7 },
  { id: 'E1', txt: "Y los diminutivos, eso de -etto, -ino, acercan la palabra que lleve a Moderato.", pausa: 0.3 },
  { id: 'E2', txt: "Cuidado con esto.", pausa: 0.1 },
  { id: 'E3', txt: "Quiere decir que Allegretto es algo menos rápido que Allegro.", pausa: 0.3 },
  { id: 'E4', txt: "Y Larghetto, en este caso, algo menos lento que Largo.", pausa: 0.5 },
  { id: 'E5', txt: "Y los superlativos, esos que ponen -issimo, hacen lo contrario: se alejan de Moderato, se vuelven más extremos. Prestissimo es más rápido que Presto. Larghissimo es más lento que Largo.", pausa: 0.9 },
  { id: 'C1', txt: "Bueno, y luego están los términos que cambian el tempo en medio de la partitura, ¿no? Los conoces: accelerando, acelerando poco a poco; ritardando o rallentando, que es frenando poco a poco;", pausa: 0.2 },
  { id: 'C2', txt: "ritenuto, que es más lento de repente;", pausa: 0.2 },
  { id: 'C3', txt: "y rubato, que es como mover la música con libertad, acelerando y frenando, como si fuese un poquito más libre.", pausa: 0.3 },
  { id: 'C4', txt: "Y para volver al tempo de antes: a tempo.", pausa: 0.3 },
  { bloque: 'SON_PULSO', dur: 9.0 },
  { id: 'M1', txt: "Y a veces hay modificadores que acompañan al otro término, para darle como un poquito más de precisión:", pausa: 0.2 },
  { id: 'M2', txt: "molto, mucho; poco, poco; più, más; meno, menos; non troppo, no demasiado.", pausa: 0.3 },
  { id: 'M3', txt: "Por ejemplo, Allegro ma non troppo quiere decir rápido, pero sin pasarse.", pausa: 0.9 },
  { id: 'R1', txt: "Lo que te decía en el vídeo de términos en general: hay muchas palabras. Yo te recomiendo que les eches un ojo; las que sean igual que en el español o muy parecidas, pues esas no hace falta que te las aprendas, porque siempre te vas a enterar, y simplemente subráyate aquellas que te hayan llamado la atención porque no las conocías, y esas quizás sí son las que hay que mirar un poquito más.", pausa: 0.0 },
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
