/* =====================================================================
   GUION · Escalas menores
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'H1', txt: "Si viste el vídeo de introducción a las tonalidades, habrás aprendido que, antiguamente, empezamos a cantar y a tocar instrumentos antes de comprender y escribir la música.", pausa: 0.3 },
  { id: 'H2', txt: "Y nos dimos cuenta de que teníamos la tendencia de agrupar los sonidos en combinaciones de tonos y semitonos, y que especialmente había dos combinaciones que hemos utilizado más hasta día de hoy. Estamos hablando de la escala Mayor y la escala menor que conoces.", pausa: 0.8 },
  { id: 'H3', txt: "Hoy nos vamos a centrar en las escalas menores, porque sí, tienen algunas variantes.", pausa: 0.4 },
  { id: 'H4', txt: "Vamos a verlas todas con el mismo ejemplo: Re menor.", pausa: 1.0 },
  { id: 'N1', txt: "La primera, la natural.", pausa: 0.1 },
  { id: 'N2', txt: "Tal cual. Solo la armadura.", pausa: 0.5 },
  { id: 'N3', txt: "Re menor tiene un bemol: Si bemol.", pausa: 0.3 },
  { id: 'N4', txt: "Re, Mi, Fa, Sol, La, Si bemol, Do, Re.", pausa: 0.2 },
  { bloque: 'SON_NAT', dur: 5.0 },
  { id: 'A1', txt: "La armónica: subimos el séptimo grado un semitono. El Do pasa a Do sostenido, y se genera este intervalo de segunda aumentada entre la sexta y la séptima nota.", pausa: 0.3 },
  { id: 'A2', txt: "Fíjate cómo suena.", pausa: 0.1 },
  { bloque: 'SON_ARM', dur: 5.0 },
  { id: 'A3', txt: "¿Notas ese sabor un poco árabe?", pausa: 0.4 },
  { id: 'A4', txt: "Por si te ayuda a recordarlo: armónica, árabe.", pausa: 0.8 },
  { id: 'M1', txt: "Vamos con la melódica.", pausa: 0.1 },
  { id: 'M2', txt: "Subimos el sexto y el séptimo.", pausa: 0.2 },
  { id: 'M3', txt: "El Si bemol pasa a Si natural, en este caso, y el Do, a Do sostenido.", pausa: 0.2 },
  { bloque: 'SON_MEL', dur: 5.0 },
  { id: 'M4', txt: "Es como que suena menos triste al final, ¿verdad?", pausa: 0.3 },
  { id: 'M5', txt: "Así que, por si te sirve también este truco:", pausa: 0.1 },
  { id: 'M6', txt: "melódica, menos triste al final.", pausa: 0.8 },
  { id: 'D1', txt: "Y, por último, la dórica.", pausa: 0.1 },
  { id: 'D2', txt: "Solo subimos el sexto.", pausa: 0.1 },
  { id: 'D3', txt: "En este caso, Si natural.", pausa: 0.2 },
  { bloque: 'SON_DOR', dur: 5.0 },
  { id: 'P0', txt: "Mi recomendación para hacer estos ejercicios es que sigas tres pasos.", pausa: 0.6 },
  { id: 'P1', txt: "Uno: coloca las cabezas de las notas.", pausa: 0.4 },
  { id: 'P2', txt: "Dos: pon la armadura.", pausa: 0.1 },
  { id: 'P3', txt: "Ya sabes, calcula el Mayor y hazle la pregunta: ¿tiene bemol en el nombre?", pausa: 0.3 },
  { id: 'P4', txt: "Si tienes dudas con esto, te recomiendo que eches un vistazo al vídeo de «Indica la armadura» o a los apuntes.", pausa: 0.4 },
  { id: 'P5', txt: "Y tercer paso: modifica las notas según la variante, subiendo un semitono, en este caso.", pausa: 0.8 },
  { id: 'O1', txt: "Y ojo: antes de poner la nueva alteración así, a prisas, mira por el retrovisor.", pausa: 0.1 },
  { id: 'O2', txt: "Echa un ojo a la armadura.", pausa: 0.1 },
  { id: 'O3', txt: "Porque subir un semitono no siempre es poner un sostenido.", pausa: 0.3 },
  { id: 'O4', txt: "En Sol menor, por ejemplo, la armadura tiene Mi bemol.", pausa: 0.2 },
  { id: 'O5', txt: "Si en la melódica subimos el sexto, ese Mi bemol pasa a Mi natural, con un becuadro.", pausa: 0.2 },
  { id: 'O6', txt: "Y el Fa, pues, en este caso, sí: Fa sostenido.", pausa: 0.9 },
  { id: 'F1', txt: "Así que, un repaso rápido.", pausa: 0.2 },
  { id: 'F2', txt: "Natural: tal cual.", pausa: 0.2 },
  { id: 'F3', txt: "Armónica: sube el séptimo. Árabe.", pausa: 0.2 },
  { id: 'F4', txt: "Melódica: sube el sexto y el séptimo. Menos triste.", pausa: 0.2 },
  { id: 'F5', txt: "Dórica: sube el sexto.", pausa: 0.3 },
  { id: 'F6', txt: "Y siempre, antes de alterar, respiramos y miramos por el retrovisor.", pausa: 0.0 },
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
