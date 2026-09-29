/* =====================================================================
   GUION · Inversión de acordes
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'I1', txt: "Muy bien: antes de ver este vídeo, te recomiendo que te refresques el de acordes, ¿vale?", pausa: 0.4 },
  { id: 'I2', txt: "Porque un acorde, realmente, puede estar en estado fundamental, que es el que vemos ordenadito, por terceras,", pausa: 0.2 },
  { id: 'I3', txt: "y puede estar invertido.", pausa: 0.5 },
  { id: 'B1', txt: "Y para saberlo, solo hay que mirar una nota:", pausa: 0.1 },
  { id: 'B2', txt: "la del bajo. La más grave.", pausa: 0.6 },
  { id: 'E1', txt: "Si en el bajo está la fundamental, pues está en estado fundamental.", pausa: 0.3 },
  { id: 'E2', txt: "Si está la tercera, es decir, la siguiente nota de la cadena, se dice que está en primera inversión.", pausa: 0.3 },
  { id: 'E3', txt: "Y si está la quinta, en segunda inversión.", pausa: 0.2 },
  { bloque: 'SON_EST', dur: 4.6 },
  { id: 'E4', txt: "Y, claro, si hay acordes de cuatro sonidos, todavía hay una inversión más: la tercera inversión, con la séptima en el bajo.", pausa: 0.9 },
  { id: 'O1', txt: "Ya a simple vista se ve que están desordenados. Yo recomiendo, siempre, al lado de los ejercicios, como en un paréntesis o algo así,", pausa: 0.1 },
  { id: 'O2', txt: "que ordenemos los acordes, porque ordenados vamos a poder saber mejor qué acorde es… qué tipo de acorde es, me refiero.", pausa: 0.6 },
  { id: 'O3', txt: "Bueno, repito: lo importante es la nota del bajo. Las restantes notas pueden estar ordenadas de las formas que puedan, pero la que manda, la que decide en qué inversión está, es la del bajo.", pausa: 1.0 },
  { id: 'X1', txt: "Vamos con el primer tipo de ejercicio que pueda haber: identifica el acorde y su inversión.", pausa: 0.5 },
  { id: 'X2', txt: "Paso uno: lo ordeno, ahí en un lado, que me ayuda.", pausa: 0.6 },
  { id: 'X3', txt: "Paso dos. Una vez ordenado, pues lo identifico. Re, Fa sostenido, La…", pausa: 0.2 },
  { id: 'X4', txt: "tercera Mayor y quinta justa: esto es Re perfecto Mayor.", pausa: 0.6 },
  { id: 'X5', txt: "Paso tres: ¿qué nota está en el bajo? ¿La fundamental, la tercera o la quinta? En este caso, está la tercera. Por lo tanto, está en primera inversión.", pausa: 1.1 },
  { id: 'K1', txt: "Y el segundo tipo de ejercicio que puede haber es «construye el acorde».", pausa: 0.2 },
  { id: 'K2', txt: "Por ejemplo, Sol menor en segunda inversión.", pausa: 0.4 },
  { id: 'K3', txt: "Bueno, pues primero lo construyo ordenado: Sol, Si bemol y Re.", pausa: 0.5 },
  { id: 'K4', txt: "Y ahora, el paso dos: digo, si es segunda inversión, quiere decir que en el bajo no está ni la fundamental ni la tercera, sino la siguiente que haya.", pausa: 0.2 },
  { id: 'K5', txt: "En este caso, la quinta. Así que el bajo estará en Re.", pausa: 0.5 },
  { id: 'K6', txt: "Último paso: completo con las que faltan, Sol y Si bemol, por encima.", pausa: 0.2 },
  { bloque: 'SON_SOLM', dur: 2.6 },
  { id: 'R1', txt: "Recapitulamos.", pausa: 0.1 },
  { id: 'R2', txt: "El bajo manda.", pausa: 0.2 },
  { id: 'R3', txt: "Si está la fundamental, está en estado fundamental.", pausa: 0.2 },
  { id: 'R4', txt: "Si está la tercera, es la primera inversión; y si está la quinta, es la segunda inversión.", pausa: 0.3 },
  { id: 'R5', txt: "Con el acorde de séptima, podría haber una tercera inversión.", pausa: 0.4 },
  { id: 'R6', txt: "Y, de verdad, te lo recomiendo: si ves un acorde desordenado, primero ordénalo. Te va a ayudar muchísimo.", pausa: 0.4 },
  { id: 'R7', txt: "¡Vamos a por ellos!", pausa: 0.0 },
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
