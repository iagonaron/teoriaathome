/* =====================================================================
   GUION · Inversión de intervalos
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'I1', txt: "Invertir un intervalo es muy sencillo: cogemos una de las dos notas y la cambiamos de octava.", pausa: 0.3 },
  { id: 'I2', txt: "La de abajo pasa arriba… o la de arriba pasa para abajo.", pausa: 0.5 },
  { id: 'E1', txt: "Mira este ejemplo:", pausa: 0.1 },
  { id: 'E2', txt: "Re–Fa es una tercera menor.", pausa: 0.2 },
  { bloque: 'SON_REFA', dur: 1.3 },
  { id: 'E3', txt: "Subo el Re una octava y ahora tengo Fa–Re: una sexta Mayor.", pausa: 0.2 },
  { bloque: 'SON_FARE', dur: 1.4 },
  { id: 'P1', txt: "¿Y hay que volver a analizarlo todo?", pausa: 0.2 },
  { id: 'P2', txt: "Pues no. Hay tres reglas.", pausa: 0.4 },
  { id: 'R1', txt: "La primera: los números suman nueve. Fíjate, es como un pequeño truco para comprobar que lo has hecho bien.", pausa: 0.3 },
  { id: 'R1b', txt: "Tercera y sexta, suman nueve.", pausa: 0.1 },
  { id: 'R1c', txt: "Segunda y séptima, nueve. Cuarta y quinta, nueve. ¿Lo pillas?", pausa: 0.6 },
  { id: 'R2', txt: "La segunda: la especie se da la vuelta.", pausa: 0.2 },
  { id: 'R2b', txt: "Las menores se vuelven Mayores, y las Mayores, menores.", pausa: 0.2 },
  { id: 'R2c', txt: "Las disminuidas se vuelven aumentadas, y las aumentadas, disminuidas.", pausa: 0.2 },
  { id: 'R2d', txt: "Las justas, como son neutras, siguen siendo justas.", pausa: 0.6 },
  { id: 'R3', txt: "Y la tercera regla, muy importante: si la nota que cambias de octava lleva alteración, tiene que seguir llevándola.", pausa: 0.2 },
  { id: 'R3b', txt: "El Fa sostenido sigue siendo Fa sostenido, arriba o abajo. No se le cae el apellido por el camino.", pausa: 0.8 },
  { id: 'F1', txt: "Así que ya lo sabes: cambio una nota de octava, los dos intervalos suman nueve y la especie se da la vuelta.", pausa: 0.3 },
  { id: 'F2', txt: "¡A practicar!", pausa: 0.0 },
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
