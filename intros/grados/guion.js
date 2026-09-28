/* =====================================================================
   GUION · Grados
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'G0', txt: "Cada nota de la escala tiene un número, en números romanos, y un nombre.", pausa: 0.1 },
  { id: 'G1', txt: "Vamos a verlos.", pausa: 0.6 },
  { id: 'G2', txt: "El primero, la tónica: el centro, la casa, el que nos da sensación de reposo.", pausa: 0.3 },
  { id: 'G3', txt: "El segundo es la supertónica.", pausa: 0.2 },
  { id: 'G4', txt: "El tercero, la mediante o modal, el nombre que más te guste.", pausa: 0.2 },
  { id: 'G5', txt: "El cuarto, subdominante.", pausa: 0.2 },
  { id: 'G6', txt: "Quinto, dominante. El sexto, superdominante. Y el séptimo, dependiendo de la distancia a la que vuelva a estar de la tónica,", pausa: 0.1 },
  { id: 'G7', txt: "puede ser subtónica, cuando está a un tono,", pausa: 0.1 },
  { id: 'G8', txt: "o sensible, cuando está a medio tono.", pausa: 0.9 },
  { id: 'K1', txt: "Además, se agrupan como en dos familias. Los grados tonales, que son el primero, el cuarto y el quinto,", pausa: 0.1 },
  { id: 'K2', txt: "que, por cierto, son los que tocamos para saber la tonalidad en un dictado.", pausa: 0.3 },
  { id: 'K3', txt: "Y los grados modales, que son el tercero, el sexto y el séptimo.", pausa: 0.3 },
  { id: 'K4', txt: "Aquí el segundo grado quedó un poco olvidado, como puedes ver.", pausa: 1.0 },
  { id: 'E0', txt: "Venga, y ahora, los dos ejercicios típicos.", pausa: 0.4 },
  { id: 'E1', txt: "El primero, en el que te pregunto un grado. Por ejemplo: ¿cuál es la subdominante de Fa Mayor?", pausa: 0.5 },
  { id: 'E2', txt: "Pues… vamos a poner las cabecitas como una escala: paso uno.", pausa: 0.2 },
  { id: 'E3', txt: "El paso dos es poner la armadura, que tiene un bemol.", pausa: 0.2 },
  { id: 'E4', txt: "Y el paso tres: busco el grado que me piden.", pausa: 0.2 },
  { id: 'E5', txt: "La subdominante es el cuarto: uno, dos, tres, cuatro.", pausa: 0.2 },
  { id: 'E6', txt: "Es Si.", pausa: 0.2 },
  { id: 'E7', txt: "Espera un momento. No, no: compruebo la armadura… ¡es Si bemol!", pausa: 1.0 },
  { id: 'V1', txt: "El segundo tipo de ejercicio:", pausa: 0.1 },
  { id: 'V2', txt: "te pregunto el intervalo que hay entre dos grados. Por ejemplo: ¿qué intervalo hay entre la modal y la dominante de Si menor?", pausa: 0.5 },
  { id: 'V3', txt: "Pues, de nuevo, coloco las cabecitas.", pausa: 0.2 },
  { id: 'V4', txt: "Pon la armadura de Si menor, que su relativo es Re Mayor: tiene sostenidos.", pausa: 0.1 },
  { id: 'V5', txt: "Dos sostenidos: Fa y Do.", pausa: 0.2 },
  { id: 'V6', txt: "Y la modal es el tercer grado, Re, y la dominante, el quinto grado, Fa.", pausa: 0.2 },
  { id: 'V7', txt: "Miro por el retrovisor:", pausa: 0.1 },
  { id: 'V8', txt: "Fa sostenido. Re… Re–Fa sostenido:", pausa: 0.1 },
  { id: 'V9', txt: "dos tonos, tercera Mayor.", pausa: 0.2 },
  { bloque: 'SON_3M', dur: 2.6 },
  { id: 'R1', txt: "Recuerda, en este tipo de ejercicios, que si te pido sensible o subtónica, como ya por sí mismo te estoy diciendo a qué distancia está de la tónica, aquí ya no tienes que hacer ningún cálculo. Si yo te pido la sensible de Sol, ¿qué nota va a ser?", pausa: 0.3 },
  { id: 'R2', txt: "Fa sostenido, para que esté a medio tono.", pausa: 0.4 },
  { id: 'R3', txt: "Si yo te pido la subtónica de Fa Mayor,", pausa: 0.1 },
  { id: 'R4', txt: "tienes que poner el séptimo grado a un tono. Por lo tanto, no me vale Mi: tiene que ser Mi bemol.", pausa: 1.0 },
  { id: 'F1', txt: "Repaso final.", pausa: 0.2 },
  { id: 'F2', txt: "Esto es igual que las escalas, ¿vale? Cabecitas.", pausa: 0.1 },
  { id: 'F3', txt: "Armadura.", pausa: 0.1 },
  { id: 'F4', txt: "Busco el grado.", pausa: 0.2 },
  { id: 'F5', txt: "Y antes de contestar, compruebo la armadura, siempre. Venga, ¡vamos a por ello!", pausa: 0.0 },
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
