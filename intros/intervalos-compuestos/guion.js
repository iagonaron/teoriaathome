/* =====================================================================
   GUION · Intervalos compuestos
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'H1', txt: "Hasta ahora hemos trabajado con intervalos dentro de una octava.", pausa: 0.3 },
  { id: 'H2', txt: "Pero ¿qué pasa si las notas están más lejos?", pausa: 0.3 },
  { id: 'H3', txt: "Pues que tenemos un intervalo compuesto: uno más grande que una octava.", pausa: 0.3 },
  { id: 'H4', txt: "Y se nombran con números a partir de nueve: novena, décima, undécima…", pausa: 0.7 },
  { id: 'A1', txt: "¿Cómo lo analizamos? Pues como cualquier intervalo: queremos el número y la especie.", pausa: 0.2 },
  { id: 'A2', txt: "Pero con un truco para no volvernos locos contando.", pausa: 0.7 },
  { id: 'N1', txt: "Primer paso, el número.", pausa: 0.3 },
  { id: 'N2', txt: "Acerco la nota grave una octava y cuento desde el ocho. Mira:", pausa: 0.3 },
  { id: 'N3', txt: "Do grave, Mi agudo.", pausa: 0.3 },
  { id: 'N4', txt: "Acerco el Do…", pausa: 0.2 },
  { id: 'N5', txt: "y cuento desde ocho, fíjate: ocho, nueve, diez.", pausa: 0.2 },
  { id: 'N6', txt: "Es una décima.", pausa: 0.8 },
  { id: 'E1', txt: "Paso número dos: la especie.", pausa: 0.3 },
  { id: 'E2', txt: "Ya que las tengo cerca, analizo ese intervalo simple.", pausa: 0.2 },
  { id: 'E3', txt: "Do–Mi: tercera Mayor.", pausa: 0.3 },
  { id: 'E4', txt: "Así que la solución sería décima Mayor.", pausa: 0.2 },
  { bloque: 'SON_10M', dur: 2.6 },
  { id: 'E5', txt: "Fíjate que aquí no cambiamos la especie como cuando había una inversión, porque en ningún momento la nota que está abajo supera a la de arriba: simplemente se acerca, pero no hay un trueque.", pausa: 0.9 },
  { id: 'U1', txt: "Fíjate: los intervalos que son undécimas o duodécimas funcionan como las cuartas y las quintas, por lo que te acabo de decir: acercas una octava…", pausa: 0.1 },
  { id: 'U2', txt: "y lo que te queda es una cuarta.", pausa: 0.3 },
  { id: 'U3', txt: "Pues si la cuarta es justa, la undécima va a ser justa.", pausa: 0.8 },
  { id: 'F1', txt: "Básicamente: acercar, analizar como un intervalo simple… y listo.", pausa: 0.4 },
  { id: 'F2', txt: "¡Vamos a practicarlo!", pausa: 0.0 },
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
