/* =====================================================================
   GUION · Compases
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'P0', txt: "Cuando miras un compás, en realidad estás contestando dos preguntas:", pausa: 0.2 },
  { id: 'P1', txt: "¿cuántos pulsos tiene y en cuántas se divide cada pulso?", pausa: 0.7 },
  { id: 'N1', txt: "La primera pregunta: el número de pulsos.", pausa: 0.3 },
  { id: 'N2', txt: "Si tiene dos pulsos, es binario.", pausa: 0.1 },
  { id: 'N3', txt: "Tres, ternario.", pausa: 0.1 },
  { id: 'N4', txt: "Cuatro, cuaternario.", pausa: 0.1 },
  { id: 'N5', txt: "Cinco… quinario. ¡Qué palabra!", pausa: 0.1 },
  { id: 'N6', txt: "Y así.", pausa: 0.6 },
  { id: 'C1', txt: "Fíjate en algo curioso:", pausa: 0.1 },
  { id: 'C2', txt: "el seis por ocho es binario.", pausa: 0.2 },
  { id: 'C3', txt: "Tiene seis corcheas, sí,", pausa: 0.1 },
  { id: 'C4', txt: "pero se sienten en dos pulsos de negra con puntillo.", pausa: 0.2 },
  { bloque: 'SON_68', dur: 3.4 },
  { id: 'S1', txt: "La segunda pregunta es la subdivisión.", pausa: 0.3 },
  { id: 'S2', txt: "Si cada pulso se divide en dos, la subdivisión es binaria: son los compases simples,", pausa: 0.1 },
  { id: 'S3', txt: "como el dos por cuatro o el tres por cuatro.", pausa: 0.3 },
  { id: 'S4', txt: "También el dos por dos, por ejemplo, ya que la blanca se divide en dos negras.", pausa: 0.4 },
  { id: 'S5', txt: "Si, en cambio, cada pulso se divide en tres, la subdivisión es ternaria, y se les llama compases compuestos, como el seis por ocho o el nueve por ocho.", pausa: 0.6 },
  { id: 'G1', txt: "Y, por último, hay que fijarse en qué figura ocupa cada cosa. Quiero decir: la que ocupa un pulso, la que ocupa una subdivisión y la que ocupa el compás completo.", pausa: 0.6 },
  { id: 'X1', txt: "Vamos con un ejemplo resuelto: el seis por ocho. ¡Venga!", pausa: 0.3 },
  { id: 'X2', txt: "Compás binario —lo dijimos antes—, porque tiene dos pulsos de negra con puntillo, ¿vale?", pausa: 0.2 },
  { id: 'X3', txt: "Subdivisión: ternaria,", pausa: 0.1 },
  { id: 'X4', txt: "porque cada pulso se divide en tres corcheas.", pausa: 0.3 },
  { id: 'X5', txt: "Y la figura de pulso, pues ya lo hemos dicho: negra con puntillo.", pausa: 0.2 },
  { id: 'X6', txt: "Figura de subdivisión: me queda la corchea.", pausa: 0.2 },
  { id: 'X7', txt: "Y la que ocupa todo el compás: blanca con puntillo.", pausa: 0.6 },
  { id: 'R1', txt: "Venga, vamos a repasarlo.", pausa: 0.2 },
  { id: 'R2', txt: "Cuando veas un compás: primero, ¿cuántos pulsos?", pausa: 0.1 },
  { id: 'R3', txt: "Segundo: ¿se divide en dos o en tres?", pausa: 0.1 },
  { id: 'R4', txt: "Y tercero: ¿qué figura ocupa el pulso, la subdivisión y cuál el compás entero?", pausa: 0.5 },
  { id: 'U1', txt: "Esto es útil no solo como ejercicio de teoría sin más, sino también, pues, cuando estemos haciendo dictados, para saber cuántas cosas podemos meter en cada pulso, en cada compás. Recuérdalo.", pausa: 0.0 },
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
