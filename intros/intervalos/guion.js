/* =====================================================================
   GUION · Intervalos
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'D1', txt: "Un intervalo es la distancia entre dos notas.", pausa: 0.3 },
  { id: 'D2', txt: "Y para ponerle nombre necesitamos dos datos: el número…", pausa: 0.1 },
  { id: 'D3', txt: "y la especie:", pausa: 0.1 },
  { id: 'D4', txt: "si es Mayor, menor, justo, aumentado o disminuido, quiero decir.", pausa: 0.7 },
  { id: 'N1', txt: "El número es lo fácil:", pausa: 0.1 },
  { id: 'N2', txt: "contamos las notas, incluyendo la primera y la última, ojo.", pausa: 0.2 },
  { id: 'N3', txt: "Do, Re, Mi…", pausa: 0.1 },
  { id: 'N4', txt: "tres notas.", pausa: 0.1 },
  { id: 'N5', txt: "Es una tercera.", pausa: 0.8 },
  { id: 'K1', txt: "La especie depende del tipo de intervalo, así que vamos por partes.", pausa: 0.6 },
  { id: 'G1', txt: "Empezamos por las segundas.", pausa: 0.2 },
  { id: 'G2', txt: "Si hay un tono, es Mayor.", pausa: 0.1 },
  { id: 'G3', txt: "Si hay un semitono, es menor.", pausa: 0.3 },
  { id: 'G4', txt: "De Do a Re hay un tono: por lo tanto, segunda Mayor.", pausa: 0.1 },
  { id: 'G5', txt: "De Mi a Fa —que hay que saberse esto— hay un semitono.", pausa: 0.1 },
  { id: 'G6', txt: "Por lo tanto, segunda menor.", pausa: 0.2 },
  { bloque: 'SON_2', dur: 2.7 },
  { id: 'G7', txt: "Por supuesto, aquí las alteraciones también influyen.", pausa: 0.8 },
  { id: 'T1', txt: "Las terceras:", pausa: 0.1 },
  { id: 'T2', txt: "un tono más que las segundas, por si te ayuda.", pausa: 0.1 },
  { id: 'T3', txt: "En este caso, dos tonos: es Mayor.", pausa: 0.1 },
  { id: 'T4', txt: "Un tono y un semitono: es menor.", pausa: 0.3 },
  { id: 'T5', txt: "De Do a Mi: Do, Re, Mi,", pausa: 0.1 },
  { id: 'T6', txt: "dos tonos: tercera Mayor.", pausa: 0.2 },
  { id: 'T7', txt: "De Re a Fa:", pausa: 0.1 },
  { id: 'T8', txt: "un tono y un semitono, pues tercera menor.", pausa: 0.2 },
  { bloque: 'SON_3', dur: 2.7 },
  { id: 'A1', txt: "Y si una segunda o una tercera es todavía más grande que Mayor, será aumentado. Si se queda por debajo de menor, pues será disminuido.", pausa: 0.3 },
  { id: 'A2', txt: "Con estos intervalos de memoria, las segundas y las terceras, el resto de intervalos los vamos a poder hacer sin memorizar tonos y semitonos. Ya verás, confía en mí.", pausa: 0.8 },
  { id: 'J1', txt: "Ahora vamos con las cuartas, las quintas y las octavas.", pausa: 0.2 },
  { id: 'J2', txt: "Aquí tengo un truco que te va a encantar:", pausa: 0.2 },
  { id: 'J3', txt: "fíjate en el apellido de las notas, es decir, en sus alteraciones.", pausa: 0.3 },
  { id: 'J4', txt: "Si las dos notas se apellidan igual…", pausa: 0.1 },
  { id: 'J5', txt: "las dos naturales, las dos con sostenido, o las dos con bemol…", pausa: 0.1 },
  { id: 'J6', txt: "son justas.", pausa: 0.3 },
  { id: 'J7', txt: "Aquí no hay ni Mayor ni menor, ¿ok?", pausa: 0.8 },
  { id: 'R1', txt: "Pero ojo con esta norma: hay una pareja rebelde. Fa–Si", pausa: 0.05 },
  { id: 'R2', txt: "es una cuarta aumentada.", pausa: 0.2 },
  { id: 'R3', txt: "Y Si–Fa es una quinta disminuida.", pausa: 0.3 },
  { id: 'R4', txt: "Estas dos te las tienes que saber de memoria,", pausa: 0.1 },
  { id: 'R5', txt: "porque, por la distancia que hay de tonos y semitonos, son diferentes a todas las demás. En estos casos hay tres tonos.", pausa: 0.3 },
  { id: 'R6', txt: "Por eso la cuarta es demasiado grande comparado con una justa…", pausa: 0.1 },
  { id: 'R7', txt: "y la quinta es demasiado pequeña comparado con una justa.", pausa: 0.8 },
  { id: 'M1', txt: "Vale, ¿y qué sucede si no se apellidan igual? Es decir, si la alteración es distinta.", pausa: 0.2 },
  { id: 'M2', txt: "Entonces la justa se ha estirado o se ha encogido:", pausa: 0.1 },
  { id: 'M3', txt: "será aumentada o disminuida.", pausa: 0.6 },
  { id: 'M4', txt: "Para saber cómo queda el intervalo, haz el truco de las manos…", pausa: 0.1 },
  { id: 'M5', txt: "y vas moviendo según la alteración y en la nota en la que esté.", pausa: 0.2 },
  { id: 'M6', txt: "Te fijas cómo va cambiando.", pausa: 0.2 },
  { bloque: 'MANOS', dur: 4.2 },
  { id: 'M7', txt: "La pregunta que te tienes que hacer es: ¿la alteración hace el intervalo más grande o más pequeño?", pausa: 0.9 },
  { id: 'P1', txt: "Y el matiz fino para la pareja rebelde:", pausa: 0.2 },
  { id: 'P2', txt: "Fa–Si es aumentada; si la encoges, por ejemplo, con Fa–Si bemol,", pausa: 0.1 },
  { id: 'P3', txt: "vuelve a ser justa. Es como que se equilibra.", pausa: 0.3 },
  { id: 'P4', txt: "Y Si–Fa es disminuida;", pausa: 0.1 },
  { id: 'P5', txt: "si la estiras, con Si–Fa sostenido,", pausa: 0.1 },
  { id: 'P6', txt: "vuelve a ser quinta justa.", pausa: 0.9 },
  { id: 'O1', txt: "En las octavas no hay excepciones, así que simplemente te tienes que acordar de lo de que se apellidan igual.", pausa: 0.9 },
  { id: 'X1', txt: "Para terminar, nos quedan las sextas y las séptimas.", pausa: 0.2 },
  { id: 'X2', txt: "Contar tantos tonos y semitonos sería un lío, así que les vamos a dar la vuelta:", pausa: 0.1 },
  { id: 'X3', txt: "las sextas las invertimos para convertirlas en terceras, y las séptimas, en segundas.", pausa: 0.3 },
  { id: 'X4', txt: "Puedes ver el vídeo sobre inversión de intervalos para verlo con más detalle.", pausa: 0.6 },
  { id: 'X5', txt: "Vamos a analizar un ejemplo.", pausa: 0.2 },
  { id: 'X6', txt: "De Do a La: le doy la vuelta, La–Do.", pausa: 0.1 },
  { id: 'X7', txt: "Me queda una tercera menor.", pausa: 0.2 },
  { id: 'X8', txt: "Por lo tanto, el intervalo inicial, Do–La, es una sexta Mayor.", pausa: 0.3 },
  { id: 'X9', txt: "Fíjate cómo cambia la especie, ¿verdad?", pausa: 0.2 },
  { id: 'X10', txt: "Sería siempre así: Mayor, menor; menor, Mayor.", pausa: 0.1 },
  { id: 'X11', txt: "Aumentado, disminuido; disminuido, aumentado. Y las justas… seguirán siendo justas.", pausa: 0.8 },
  { id: 'Y1', txt: "Venga, otro ejemplo, que entiendo que esto es más complicado.", pausa: 0.3 },
  { id: 'Y2', txt: "Re–Do.", pausa: 0.2 },
  { id: 'Y3', txt: "Le doy la vuelta: Do–Re,", pausa: 0.1 },
  { id: 'Y4', txt: "segunda Mayor.", pausa: 0.2 },
  { id: 'Y5', txt: "Así que Re–Do es una séptima menor.", pausa: 0.2 },
  { id: 'Y6', txt: "¿Lo pillas?", pausa: 0.8 },
  { id: 'Z1', txt: "Bueno, muchas cosas. Vamos a hacer un repaso final.", pausa: 0.2 },
  { id: 'Z2', txt: "Resumiendo:", pausa: 0.1 },
  { id: 'Z3', txt: "segundas y terceras: hay que aprenderse los tonos y los semitonos.", pausa: 0.3 },
  { id: 'Z4', txt: "Las cuartas, las quintas y las octavas: mira el apellido. Si es igual, justa, excepto la pareja. Y si hay alteraciones, usa el truco de las manos.", pausa: 0.3 },
  { id: 'Z5', txt: "Y las sextas y las séptimas: les damos la vuelta con inversión para convertirlas en segundas y terceras, es decir, nuestra zona de confort. Y luego la especie cambia.", pausa: 0.6 },
  { id: 'Z6', txt: "Venga, ahora te toca a ti. ¡Vamos a por ellos!", pausa: 0.0 },
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
