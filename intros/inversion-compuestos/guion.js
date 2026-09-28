/* =====================================================================
   GUION · Inversión de intervalos compuestos
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'A1', txt: "¿Qué pasaría si te piden invertir un intervalo compuesto?", pausa: 0.3 },
  { id: 'A2', txt: "Aquí viene uno de mis trucos favoritos: el AIA.", pausa: 0.4 },
  { id: 'A3', txt: "Me acerco, invierto y me alejo.", pausa: 0.7 },
  { id: 'B1', txt: "Tenemos una décima Mayor; ya la hemos analizado, ¿ok?", pausa: 0.3 },
  { id: 'B2', txt: "Me acerco a una octava: tercera Mayor.", pausa: 0.2 },
  { id: 'B3', txt: "La invierto y me da una sexta menor. Esto lo sabes hacer.", pausa: 0.3 },
  { id: 'B4', txt: "Y ahora me alejo una octava: decimotercera menor.", pausa: 0.7 },
  { id: 'C1', txt: "Otro ejemplo: duodécima justa.", pausa: 0.2 },
  { id: 'C2', txt: "Me acerco: quinta justa.", pausa: 0.2 },
  { id: 'C3', txt: "Invierto: cuarta justa.", pausa: 0.2 },
  { id: 'C4', txt: "Me alejo: undécima justa.", pausa: 0.7 },
  { id: 'D1', txt: "A veces, como las distancias son tan grandes, ayuda escribirlo en dos pentagramas: clave de Fa abajo y clave de Sol arriba.", pausa: 0.2 },
  { id: 'D2', txt: "Ya sabes, las claves nos ayudan a manejar registros más grandes. Por eso los pianistas tocan con el doble pentagrama: porque hay notas muy agudas y muy graves.", pausa: 0.5 },
  { id: 'S1', txt: "Pero volviendo, que me estoy liando: para comprobarlo, el intervalo y su inversión tienen que sumar veintitrés. Tómatelo como un truco.", pausa: 0.3 },
  { id: 'S2', txt: "En los simples, al invertir, sumaban nueve, ¿te acuerdas? Pues los compuestos suman veintitrés.", pausa: 0.3 },
  { id: 'S3', txt: "Mira los ejemplos de antes:", pausa: 0.1 },
  { id: 'S4', txt: "diez y trece, veintitrés. Doce y once, veintitrés.", pausa: 0.6 },
  { id: 'E1', txt: "Y la especie, como siempre, al revés:", pausa: 0.1 },
  { id: 'E2', txt: "menor por Mayor, disminuida por aumentada, y justa por justa.", pausa: 0.2 },
  { id: 'E3', txt: "Siempre que estamos haciendo una inversión, las especies se cambian.", pausa: 0.6 },
  { id: 'F1', txt: "Recuérdalo: AIA. Me acerco, invierto y me alejo.", pausa: 0.2 },
  { id: 'F2', txt: "¡Vamos a por ellos!", pausa: 0.0 },
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
