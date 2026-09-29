/* =====================================================================
   GUION · Cadencias
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'I1', txt: "¿Te has fijado en que la música también respira?", pausa: 0.3 },
  { id: 'I2', txt: "Esos momentos en los que se detiene son las cadencias.", pausa: 0.4 },
  { id: 'I3', txt: "Funcionan como la puntuación cuando hablamos: unas cierran del todo, como un punto en una frase, y otras se quedan esperando, como una coma.", pausa: 0.5 },
  { id: 'I4', txt: "También puede haber frases que terminan de una forma inesperada.", pausa: 0.8 },
  { id: 'B1', txt: "Vamos a llevarlo a la música, fíjate. Con varias voces.", pausa: 0.3 },
  { id: 'B2', txt: "Para reconocer qué cadencia se produce, fíjate en el bajo, la voz más grave, y en el acorde con el que acaba, sobre todo los dos últimos.", pausa: 0.4 },
  { id: 'B3', txt: "Vamos a escucharlas en Sol Mayor.", pausa: 0.7 },
  { id: 'A1', txt: "La primera, la cadencia auténtica, va desde la dominante hasta la tónica: del quinto grado al primero.", pausa: 0.2 },
  { id: 'A2', txt: "Re… Sol.", pausa: 0.3 },
  { id: 'A3', txt: "Es la que suena más terminada: el punto final. Al escucharla, sabes que la música ha terminado.", pausa: 0.2 },
  { bloque: 'SON_AUT', dur: 4.9 },
  { id: 'P1', txt: "La cadencia plagal va de la subdominante a la tónica: del cuarto grado al primero.", pausa: 0.2 },
  { id: 'P2', txt: "Do… Sol.", pausa: 0.2 },
  { id: 'P3', txt: "También termina, pero como de una manera más tranquila, más suave. Escúchalo.", pausa: 0.1 },
  { bloque: 'SON_PLA', dur: 5.9 },
  { id: 'S1', txt: "La semicadencia, te vas a acordar siempre, porque es muy obvia: se detiene en la dominante. La música se queda a medias, como que hay que terminar. No apetece aplaudir todavía, fíjate.", pausa: 0.1 },
  { bloque: 'SON_SEM', dur: 4.9 },
  { id: 'R1', txt: "Y la cadencia rota: parece que la dominante va a ir a la tónica, como en la cadencia auténtica que vimos al principio, pero en el último momento se va al sexto grado.", pausa: 0.2 },
  { id: 'R2', txt: "Re… ¡Mi menor! Es una sorpresa, es un impacto muy chulo, que es como un universo paralelo, ¿sabes? Como que se va a otra dimensión. Ya verás qué bien suena.", pausa: 0.1 },
  { bloque: 'SON_ROT', dur: 5.0 },
  { id: 'G1', txt: "Claro, piensa que tú ahora lo estás viendo y escuchando con ejemplos muy sencillos de acordes, pero esto, llevado a la música, da mucho juego. Lo de las cadencias es todo un mundo y está bien que lo vayas conociendo.", pausa: 0.8 },
  { id: 'F1', txt: "Entonces, repaso final.", pausa: 0.2 },
  { id: 'F2', txt: "Auténtica: del quinto al primero, punto final, muy conclusivo. Plagal: del cuarto al primero, un final más suave.", pausa: 0.2 },
  { id: 'F3', txt: "Semicadencia: se queda en el quinto, que se queda ahí sin acabar, vaya.", pausa: 0.2 },
  { id: 'F4', txt: "Y la rota: del quinto al sexto, un final inesperado.", pausa: 0.8 },
  { id: 'Q1', txt: "Ahora… cierra los ojos y escucha este último ejemplo que te voy a poner. ¿Puedes decirme qué cadencia es?", pausa: 0.2 },
  { bloque: 'SON_QUIZ', dur: 8.5 },
  { id: 'Q2', txt: "Puedes abrir los ojos. La cadencia que acabas de escuchar es… la cadencia rota.", pausa: 0.4 },
  { id: 'Q3', txt: "Venga, ¡ve a hacer ejercicios!", pausa: 0.0 },
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
