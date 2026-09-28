/* =====================================================================
   GUION · Otras escalas
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'I1', txt: "Además de las escalas Mayores y menores, y sus tipos,", pausa: 0.05 },
  { id: 'I2', txt: "hay otras escalas, así más exóticas, que tienes que conocer:", pausa: 0.1 },
  { id: 'I3', txt: "las pentatónicas, la hexátona y la cromática.", pausa: 0.9 },
  { id: 'P1', txt: "Las pentatónicas, y es lo que dice el nombre, tienen cinco sonidos.", pausa: 0.2 },
  { id: 'P2', txt: "Son escalas a las que les faltan dos grados.", pausa: 0.5 },
  { id: 'P3', txt: "La pentatónica Mayor es como la escala Mayor, pero sin el cuarto y el séptimo grado. Así es fácil de aprenderlo.", pausa: 0.2 },
  { bloque: 'SON_PM', dur: 3.9 },
  { id: 'P4', txt: "La pentatónica menor es una escala menor natural sin el segundo y el sexto grado.", pausa: 0.2 },
  { bloque: 'SON_Pm', dur: 3.9 },
  { id: 'T1', txt: "Y cada pentatónica tiene cinco tipos, para que te suenen.", pausa: 0.2 },
  { id: 'T2', txt: "La nota más grave sube una octava y sale el siguiente tipo. Y así, hasta cinco. Puedes ver aquí el ejemplo: cómo va cambiando el tipo y cómo las notas se van cambiando de octava.", pausa: 1.4 },
  { id: 'Q1', txt: "Por lo tanto, en las escalas pentatónicas Mayores y menores, al final, el procedimiento es igual que las escalas que ya conoces: colocar las cabezas, poner la armadura.", pausa: 0.3 },
  { id: 'Q2', txt: "Eso sí, hay que quitar dos notas, y tienes que saber cuáles son:", pausa: 0.2 },
  { id: 'Q3', txt: "en las Mayores, la cuarta y la séptima,", pausa: 0.1 },
  { id: 'Q4', txt: "y en las menores, la segunda y la sexta.", pausa: 1.0 },
  { id: 'X1', txt: "La escala hexátona tiene seis sonidos, y todos están a un tono. Aquí no hay armaduras ni nada: tú vas subiendo hasta que hayas hecho seis sonidos.", pausa: 0.4 },
  { id: 'X2', txt: "Por ejemplo, desde Re:", pausa: 0.1 },
  { id: 'X3', txt: "Re, Mi, Fa sostenido, Sol sostenido, La sostenido, Do.", pausa: 0.3 },
  { id: 'X4', txt: "Y ya está, porque luego volvería a ser Re.", pausa: 0.1 },
  { id: 'X5', txt: "Así que ya hemos hecho seis.", pausa: 0.2 },
  { bloque: 'SON_HEX', dur: 4.2 },
  { id: 'X6', txt: "Y ojo: de La sostenido a Do también hay un tono, no te confundas.", pausa: 0.2 },
  { id: 'X7', txt: "Puede ser Si bemol también, ¿eh? O sea, una enarmonía.", pausa: 0.3 },
  { id: 'X8', txt: "Son solo tonos.", pausa: 0.1 },
  { id: 'X9', txt: "Y, como digo, no hay armadura, no te preocupes.", pausa: 1.0 },
  { id: 'C1', txt: "Y con respecto", pausa: 0.0 },
  { id: 'C2', txt: "a la escala cromática, tiene los doce sonidos, todos a medio tono, también sin armadura.", pausa: 0.2 },
  { id: 'C3', txt: "Ladrillitos pequeños.", pausa: 0.2 },
  { bloque: 'SON_CROM', dur: 5.1 },
  { id: 'S1', txt: "Y aquí viene lo interesante: en los apuntes, la escala cromática la podemos escribir de seis formas posibles, según utilicemos sostenidos o bemoles.", pausa: 0.6 },
  { id: 'S2', txt: "Por ejemplo, la tipo uno es utilizando únicamente sostenidos, los que necesitemos.", pausa: 1.3 },
  { id: 'S3', txt: "Y los tipos van combinando sostenidos y bemoles hasta llegar solo hasta los bemoles.", pausa: 1.3 },
  { id: 'S4', txt: "Pero no vale cualquier alteración: se sigue un orden.", pausa: 0.3 },
  { id: 'S5', txt: "El de los sostenidos…", pausa: 0.6 },
  { id: 'S6', txt: "y el de los bemoles.", pausa: 1.0 },
  { id: 'S7', txt: "Y lo mejor de todo es que los seis tipos suenan exactamente igual: solo cambia la forma de escribirlo.", pausa: 0.9 },
  { id: 'B1', txt: "Ah, y no te olvides, cuando estás haciendo bemol, de que la siguiente nota, si la quieres subir, tienes que ponerle un becuadro, que esto es el típico fallo que hay aquí y también en los ejercicios de semitono cromático, ¿verdad? ¿Te suena esto? Qué mítica.", pausa: 1.0 },
  { id: 'F1', txt: "Bueno, un repaso, entonces: pentatónica Mayor, sin el cuarto y el séptimo. Pentatónica menor, sin el segundo y el sexto.", pausa: 0.2 },
  { id: 'F2', txt: "Hexátona, con ladrillos de tono.", pausa: 0.2 },
  { id: 'F3', txt: "Y cromática: doce sonidos con ladrillos de medio tono. Venga, ¡vamos a por ellas!", pausa: 0.0 },
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
