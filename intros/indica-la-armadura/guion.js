/* =====================================================================
   GUION · Indica la armadura
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'I1', txt: "En el vídeo de Indica la tonalidad hicimos el camino de ida:", pausa: 0.1 },
  { id: 'I2', txt: "de la armadura a la tonalidad. Ahora toca la vuelta: te doy la tonalidad y tú me dices su armadura.", pausa: 0.5 },
  { id: 'I3', txt: "Esto, por ejemplo, lo vas a hacer cada vez que haces un dictado:", pausa: 0.1 },
  { id: 'I4', txt: "tú sabes qué tonalidad es, porque lo has deducido, y hay que poner ahora la armadura. Venga, vamos con ello.", pausa: 0.7 },
  { id: 'P0', txt: "Paso cero.", pausa: 0.2 },
  { id: 'P1', txt: "Necesitamos la tonalidad Mayor: siempre es la referencia. Si te dan una menor, pasa primero al relativo Mayor. Ya sabes: una tercera menor para arriba, en este caso.", pausa: 0.3 },
  { id: 'P2', txt: "Por ejemplo, Do menor.", pausa: 0.1 },
  { id: 'P3', txt: "Su relativo Mayor es Mi bemol Mayor.", pausa: 0.3 },
  { id: 'P4', txt: "Y si ya es Mayor, como Mi Mayor, pues no hay que hacer nada. Vamos al siguiente paso.", pausa: 0.8 },
  { id: 'Q1', txt: "Ahora, la gran pregunta:", pausa: 0.1 },
  { id: 'Q2', txt: "¿acaso tiene un bemol en el nombre? Porque eso sería un gran spoiler.", pausa: 0.7 },
  { id: 'B1', txt: "Si la tonalidad tiene un bemol en el nombre… ¡tiene bemoles! Vamos a tiro fijo.", pausa: 0.2 },
  { id: 'B2', txt: "Contamos en el orden de los bemoles hasta llegar a ella… y le damos una extra.", pausa: 0.2 },
  { id: 'B3', txt: "Mi bemol Mayor:", pausa: 0.1 },
  { id: 'B4', txt: "Si bemol, Mi bemol… y La bemol.", pausa: 0.1 },
  { id: 'B5', txt: "Tres bemoles.", pausa: 0.8 },
  { id: 'S1', txt: "Si no tiene bemol en el nombre, va a tener sostenidos.", pausa: 0.2 },
  { id: 'S2', txt: "Y aquí contamos en el orden de los sostenidos hasta llegar a la sensible.", pausa: 0.2 },
  { id: 'S3', txt: "La sensible es el séptimo grado: la nota que está justo debajo de la tónica, a medio tono.", pausa: 0.2 },
  { id: 'S4', txt: "En Mi Mayor, la sensible es Re sostenido.", pausa: 0.1 },
  { bloque: 'SON_SENS', dur: 1.8 },
  { id: 'S5', txt: "Así que contamos:", pausa: 0.1 },
  { id: 'S6', txt: "Fa, Do, Sol, Re.", pausa: 0.1 },
  { id: 'S7', txt: "Cuatro sostenidos.", pausa: 0.8 },
  { id: 'X1', txt: "Y sí, hay dos excepciones que te tienes que saber de memoria, pero son fáciles: Do Mayor, que no tiene armadura…", pausa: 0.1 },
  { id: 'X2', txt: "y Fa Mayor, que, aunque no tiene bemol en el nombre, pues tiene un bemol.", pausa: 0.9 },
  { id: 'R0', txt: "Venga, un último ejemplo para repasarlo del todo.", pausa: 0.2 },
  { id: 'R1', txt: "Tengo Si menor, así que lo primero, en este caso, necesito subir al Mayor: subo una tercera menor y me da…", pausa: 0.1 },
  { id: 'R2', txt: "Re Mayor.", pausa: 0.3 },
  { id: 'R3', txt: "¿Tiene bemol en el nombre? No, pues tendrá sostenidos.", pausa: 0.2 },
  { id: 'R4', txt: "Tengo que buscar la sensible de Re, así que es Do sostenido, y voy contando:", pausa: 0.1 },
  { id: 'R5', txt: "Fa, Do. Ahí me paro.", pausa: 0.1 },
  { id: 'R6', txt: "Dos sostenidos.", pausa: 0.9 },
  { id: 'F1', txt: "Así que, recapitulando: paso cero, consigue la tonalidad Mayor. Luego, hazte la pregunta:", pausa: 0.1 },
  { id: 'F2', txt: "¿bemol en el nombre? Si sí:", pausa: 0.05 },
  { id: 'F3', txt: "cuántos bemoles, y regalo uno.", pausa: 0.2 },
  { id: 'F4', txt: "Si no: cuántos sostenidos hasta la sensible. Ah, y nunca te olvides de Do Mayor y de Fa Mayor.", pausa: 0.4 },
  { id: 'F5', txt: "¡Vamos a por ellos!", pausa: 0.0 },
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
