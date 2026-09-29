/* =====================================================================
   GUION · Enarmonías
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'I1', txt: "Dos notas son enarmónicas cuando suenan igual.", pausa: 0.3 },
  { id: 'I2', txt: "Por ejemplo, en el piano son la misma tecla, pero se llaman distinto. Por ejemplo, Do sostenido es enarmónico de Re bemol.", pausa: 0.2 },
  { bloque: 'SON_NOTA', dur: 2.6 },
  { id: 'G1', txt: "Y casi todas las notas tienen dos enarmónicos. A veces, uno por abajo y uno por arriba:", pausa: 0.2 },
  { id: 'G2', txt: "Fa es lo mismo que Mi sostenido y que Sol doble bemol.", pausa: 0.6 },
  { id: 'G3', txt: "A veces, los dos están por arriba:", pausa: 0.2 },
  { id: 'G4', txt: "Re sostenido es lo mismo que Mi bemol y Fa doble bemol.", pausa: 0.6 },
  { id: 'G5', txt: "Y, a veces, los dos por abajo:", pausa: 0.2 },
  { id: 'G6', txt: "Re bemol es lo mismo que Do sostenido y que Si doble sostenido.", pausa: 0.8 },
  { id: 'X1', txt: "Hay una excepción. Siempre hay una excepción. Vale: Sol sostenido solo tiene a La bemol.", pausa: 0.2 },
  { id: 'X2', txt: "Y al revés.", pausa: 1.0 },
  { id: 'V1', txt: "Pero también hay intervalos enarmónicos.", pausa: 0.4 },
  { id: 'V2', txt: "Vale: si cambiamos solo una de las dos, se considera un intervalo enarmónico parcial.", pausa: 0.3 },
  { id: 'V3', txt: "Do–Mi sostenido pasa a Do–Fa.", pausa: 0.3 },
  { id: 'V4', txt: "Suena igual, se escribe distinto.", pausa: 0.8 },
  { id: 'V5', txt: "Si cambiamos las dos notas, se dice que es un intervalo enarmónico total.", pausa: 0.3 },
  { id: 'V6', txt: "Do sostenido–Mi sostenido pasa a Re bemol–Fa.", pausa: 1.0 },
  { id: 'T1', txt: "Y exactamente igual sucede con las tonalidades.", pausa: 0.2 },
  { id: 'T2', txt: "Dos tonalidades pueden ser enarmónicas cuando sus escalas suenan igual, pero con distinto nombre y distinta armadura. Es decir, ya no solo una nota, ni dos, sino todas las de la escala. Y, por lo tanto, la armadura.", pausa: 0.5 },
  { id: 'T3', txt: "Fa sostenido Mayor, con seis sostenidos, suena exactamente igual que Sol bemol Mayor, con seis bemoles.", pausa: 0.2 },
  { bloque: 'SON_ESC', dur: 3.4 },
  { id: 'U1', txt: "Y esto, que parece así un poco friki, tiene alguna utilidad. Imagínate que te encuentras con una tonalidad que está en Do sostenido Mayor,", pausa: 0.2 },
  { id: 'U2', txt: "que tiene todos los sostenidos. Bueno, pues a lo mejor te hace la vida más fácil pensar en Re bemol Mayor,", pausa: 0.1 },
  { id: 'U3', txt: "que tiene cinco bemoles. Y, oye, dos alteraciones que te has quitado con este truco.", pausa: 1.0 },
  { id: 'R1', txt: "Bueno, repasamos. Enarmónico quiere decir mismo sonido, distinto nombre.", pausa: 0.2 },
  { id: 'R2', txt: "En el intervalo parcial cambia una nota. En el total, cambian las dos.", pausa: 0.3 },
  { id: 'R3', txt: "Y tonalidades enarmónicas: la misma música, con distinta armadura.", pausa: 0.6 },
  { id: 'R4', txt: "¿Lo pillas? Venga, ¡dale!", pausa: 0.0 },
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
