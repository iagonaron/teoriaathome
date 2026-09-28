/* =====================================================================
   GUION · Escalas Mayores
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'H1', txt: "Si viste el vídeo de introducción a las tonalidades, habrás aprendido que, antiguamente, empezamos a cantar y a tocar instrumentos antes de comprender y escribir la música.", pausa: 0.3 },
  { id: 'H2', txt: "Y nos dimos cuenta de que teníamos la tendencia de agrupar los sonidos en combinaciones de tonos y semitonos, y que especialmente había dos combinaciones que hemos utilizado más hasta día de hoy. Estamos hablando de la escala Mayor y la escala menor que conoces.", pausa: 0.9 },
  { id: 'H3', txt: "Hoy vamos a ver las escalas Mayores, porque, al igual que las menores, hay cuatro variantes.", pausa: 0.2 },
  { id: 'H4', txt: "Lo que pasa es que aquí, en vez de subir con alteraciones, vamos a bajar.", pausa: 0.7 },
  { id: 'H5', txt: "Y la verdad es que lo de los nombres no se lo han trabajado demasiado: aquí los vamos a llamar Tipo I, Tipo II, Tipo III y Tipo IV.", pausa: 0.5 },
  { id: 'H6', txt: "Vamos a coger de ejemplo Re Mayor, que tiene la armadura: dos sostenidos.", pausa: 0.8 },
  { id: 'N1', txt: "Tipo uno.", pausa: 0.2 },
  { id: 'N2', txt: "La natural. Es decir, sin hacerle nada más: pones la armadura y terminas el ejercicio.", pausa: 0.2 },
  { bloque: 'SON_NAT', dur: 5.0 },
  { id: 'A1', txt: "Tipo dos.", pausa: 0.2 },
  { id: 'A2', txt: "Aquí hay que contar el sexto grado y bajarlo. En este caso, el Si pasa a Si bemol.", pausa: 0.2 },
  { bloque: 'SON_ARM', dur: 5.0 },
  { id: 'A3', txt: "Y, al igual que la escala armónica de las menores, la que sonaba árabe,", pausa: 0.1 },
  { id: 'A4', txt: "también genera un intervalo de segunda aumentada entre el sexto y el séptimo. Por eso la ponemos de segunda.", pausa: 0.8 },
  { id: 'M1', txt: "Tipo tres.", pausa: 0.1 },
  { id: 'M2', txt: "La melódica.", pausa: 0.1 },
  { id: 'M3', txt: "Bajamos el sexto y el séptimo.", pausa: 0.2 },
  { id: 'M4', txt: "Si bemol…", pausa: 0.1 },
  { id: 'M5', txt: "y el Do sostenido pasa a Do natural.", pausa: 0.2 },
  { bloque: 'SON_MEL', dur: 5.0 },
  { id: 'X1', txt: "Y la tipo cuatro,", pausa: 0.05 },
  { id: 'X2', txt: "que también le podemos ir llamando mixolidia, para que te vaya sonando.", pausa: 0.3 },
  { id: 'X3', txt: "Solo bajamos el séptimo.", pausa: 0.1 },
  { id: 'X4', txt: "Do natural.", pausa: 0.2 },
  { bloque: 'SON_MIX', dur: 5.0 },
  { id: 'P1', txt: "Los pasos son los mismos que en las escalas menores. Primero, colocamos las cabecitas.", pausa: 0.2 },
  { id: 'P2', txt: "La armadura.", pausa: 0.2 },
  { id: 'P3', txt: "Y modificar las notas, esta vez bajando un semitono.", pausa: 0.8 },
  { id: 'O1', txt: "Y lo que te recuerdo siempre: no te olvides de mirar por el retrovisor. Fíjate en la armadura antes de tomar la decisión de poner una alteración u otra, ¿vale? Que aquí suele haber bastantes fallos.", pausa: 0.9 },
  { id: 'F1', txt: "Venga, vamos a hacer un repaso. La tipo uno, tal cual.", pausa: 0.2 },
  { id: 'F2', txt: "La armónica, bajamos el sexto. La melódica, bajamos el sexto y el séptimo. Y la mixolidia, solo el séptimo es el que se baja.", pausa: 0.4 },
  { id: 'F3', txt: "No te olvides: en las escalas menores, las alteraciones suben. Es como que compensamos la tristeza con pequeñas píldoras que suben. Y en el caso de las Mayores…", pausa: 0.1 },
  { id: 'F4', txt: "bájate un poquito, ¿vale? No lo olvides, porque es un error muy típico.", pausa: 0.0 },
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
