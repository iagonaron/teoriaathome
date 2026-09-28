/* =====================================================================
   GUION · La tonalidad · intro (GE)
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'P1', txt: "¿Alguna vez te has preguntado para qué sirve saber en qué tonalidad está una canción?", pausa: 0.15 },
  { id: 'P2', txt: "¿Porque sí?", pausa: 0.35 },
  { id: 'P3', txt: "En el conservatorio nos hacen buscar tonalidades, escribir armaduras, hacer dictados…", pausa: 0.3 },
  { id: 'P4', txt: "¿Qué significa realmente todo esto?", pausa: 0.7 },
  { id: 'H1', txt: "Para entenderlo, tenemos que empezar bastante antes de que existiesen los conservatorios.", pausa: 0.3 },
  { id: 'H2', txt: "Primero hicimos música y después intentamos entenderla.", pausa: 0.5 },
  { id: 'H3', txt: "Durante miles de años hemos cantado, tocado, imitado y transmitido música. Y poco a poco empezamos a preguntarnos cosas.", pausa: 0.4 },
  { id: 'H4', txt: "¿Por qué algunos sonidos parecen encajar especialmente bien?", pausa: 0.1 },
  { bloque: 'MONOCORDIO', dur: 3.4 },
  { id: 'H5', txt: "¿Por qué algunas combinaciones aparecen una y otra vez?", pausa: 0.6 },
  { id: 'H6', txt: "Con el paso de los siglos fuimos organizando los sonidos de muchas maneras diferentes.", pausa: 1.0 },
  { id: 'E1', txt: "Existen variedad de escalas, pero en buena parte de la música que estudiamos en el conservatorio hay dos especialmente recurrentes:", pausa: 0.1 },
  { id: 'E2', txt: "la escala Mayor y la escala menor.", pausa: 0.4 },
  { id: 'E3', txt: "Mira. Por ejemplo, esta es la escala de Mi Mayor.", pausa: 0.1 },
  { bloque: 'ESCALA', dur: 4.6 },
  { id: 'E4', txt: "Estas notas pueden convertirse en una especie de familia de sonidos con la que construimos una obra.", pausa: 0.6 },
  { id: 'E5', txt: "Pero dentro de esa familia, no todas las notas producen la misma sensación.", pausa: 0.2 },
  { bloque: 'ACORDE', dur: 2.0 },
  { id: 'E6', txt: "Algunas parecen crear tensión,", pausa: 0.1 },
  { bloque: 'TENSION', dur: 2.3 },
  { id: 'E7', txt: "otras parece que quieren continuar…", pausa: 0.1 },
  { bloque: 'CONTINUAR', dur: 2.5 },
  { id: 'E8', txt: "y hay una que sentimos especialmente como un lugar de llegada, como volver a casa.", pausa: 0.1 },
  { bloque: 'LLEGADA', dur: 2.8 },
  { id: 'T1', txt: "Eso es una de las ideas fundamentales de la tonalidad: organizar la música alrededor de un centro.", pausa: 1.0 },
  { id: 'A1', txt: "Ahora fíjate en otra cosa.", pausa: 0.2 },
  { id: 'A2', txt: "Si vamos a utilizar Mi Mayor durante toda una obra, tendremos constantemente Fa sostenido, Do sostenido, Sol sostenido y Re sostenido.", pausa: 0.4 },
  { id: 'A3', txt: "Podríamos escribir cada sostenido una y otra vez…", pausa: 0.2 },
  { id: 'A4', txt: "o podemos avisar al principio:", pausa: 1.6 },
  { id: 'A5', txt: "«durante esta música, estas notas estarán alteradas».", pausa: 0.3 },
  { id: 'A6', txt: "Y para eso utilizamos la armadura.", pausa: 0.9 },
  { id: 'S1', txt: "Así que cuando buscas una tonalidad o escribes una armadura, no estás simplemente resolviendo un ejercicio de teoría: estás descubriendo qué grupo de sonidos organiza esa música y cuál es su centro.", pausa: 0.9 },
  { id: 'C1', txt: "Y ahora que sabemos para qué sirve todo esto, nos queda aprender a reconocerlo.", pausa: 0.3 },
  { id: 'C2', txt: "Sobre tonalidad vamos a trabajar tres tipos de ejercicios: indicar la tonalidad, indicar la armadura y encontrar los tonos vecinos.", pausa: 0.4 },
  { id: 'C3', txt: "Eso es lo que veremos en los siguientes vídeos.", pausa: 0.0 },
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
