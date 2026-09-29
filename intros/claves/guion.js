/* =====================================================================
   GUION · Claves
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'H1', txt: "¿Sabes cuál fue la utilidad de las claves cuando empezaron?", pausa: 0.4 },
  { id: 'H2', txt: "La de las claves es una historia curiosa, la verdad.", pausa: 0.3 },
  { id: 'H3', txt: "Cuando empezábamos a anotar música, hace muchísimos años, antes de que hubiese pentagrama y todo esto, empezamos escribiendo una línea.", pausa: 0.3 },
  { id: 'H4', txt: "Y, para saber qué nota era, poníamos un símbolo en esa línea: lo que serían las claves.", pausa: 0.3 },
  { id: 'H5', txt: "O sea, era una forma de decir: la nota que esté aquí se llama así, y las de arriba y las de abajo, pues ya te vas apañando tú.", pausa: 0.7 },
  { id: 'H6', txt: "La cuestión es que, con el paso de los años, hubo varias, y a día de hoy tenemos siete distintas. Y podemos pensar: pero ¿para qué queremos tantas?", pausa: 0.6 },
  { id: 'P1', txt: "Bueno, la finalidad, a día de hoy, de las claves es aprovechar el pentagrama.", pausa: 0.5 },
  { id: 'P2', txt: "Tú imagínate que solo existiese la clave de Sol y el resto se esfumasen.", pausa: 0.2 },
  { id: 'P3', txt: "Uf, ¡qué maravilla! Lenguaje Musical siempre es fácil, la vida es mucho mejor sin las claves. Bueno, lo que quieras.", pausa: 0.3 },
  { id: 'P4', txt: "Todo va bien, hasta que, de repente, tocas el contrabajo y todas las notas que tocas están completamente apartadas abajo, con un mogollón de líneas adicionales. Esto es algo así como comprarse una casa pero estar durmiendo en el felpudo: no estás aprovechando el pentagrama.", pausa: 0.4 },
  { id: 'P5', txt: "Lo mismo si solo fuese la clave de Fa y tocases el flautín.", pausa: 0.7 },
  { id: 'U1', txt: "Las claves, al final, la utilidad que tienen es aprovechar el pentagrama en base al instrumento que vas a tocar. Por eso, los instrumentos agudos tocan en la clave de Sol, ya que es la clave en la que encajan mejor las notas agudas.", pausa: 0.3 },
  { id: 'U2', txt: "Los instrumentos graves tocan en la clave de Fa, que es la más grave que hay.", pausa: 0.3 },
  { id: 'U3', txt: "Los instrumentos que tocan notas muy agudas y notas muy graves, pues aprovechan y ponen el doble pentagrama.", pausa: 0.3 },
  { id: 'U4', txt: "Y algunos instrumentos, a día de hoy, que están ahí, que no son del todo agudos o no son del todo graves, para no estar ahí con muchas líneas adicionales, pues utilizan la clave de Do en tercera o la clave de Do en cuarta.", pausa: 0.2 },
  { id: 'U5', txt: "Pues aprovecha mejor el pentagrama. Seguro que tienes algún conocido que toca en esta clave.", pausa: 0.8 },
  { id: 'K1', txt: "Bueno, no me enrollo más: te voy a decir cuáles son las siete claves que hay, ¿vale?", pausa: 0.3 },
  { id: 'K2', txt: "Son: la de Sol, que conoces; la clave de Fa en cuarta, que también conoces; pero hay otra que está en Fa en tercera.", pausa: 0.3 },
  { id: 'K3', txt: "Y la clave de Do, que es la que tiene este símbolo, que tiene hasta cuatro posiciones: clave de Do en primera, en segunda, en tercera y en cuarta.", pausa: 0.5 },
  { id: 'K4', txt: "Con estas siete claves podemos poner cualquier nombre de nota en el pentagrama: va a haber una que haga que se llame así.", pausa: 0.8 },
  { id: 'L1', txt: "Vale, ¿y cómo se leen?", pausa: 0.2 },
  { id: 'L2', txt: "Pues la clave te dice qué nota está en su línea.", pausa: 0.3 },
  { id: 'L3', txt: "Por ejemplo, la clave de Fa en cuarta te está diciendo que en la cuarta línea la nota se llama Fa.", pausa: 0.4 },
  { id: 'L4', txt: "La clave de Do en tercera, pues, que el Do… Por cierto, el Do central está en la tercera línea.", pausa: 0.3 },
  { id: 'L5', txt: "Y desde ahí contamos hacia arriba o hacia abajo.", pausa: 0.8 },
  { id: 'E1', txt: "En los ejercicios te voy a pedir dos cosas:", pausa: 0.2 },
  { id: 'E2', txt: "poner el nombre a las notas en una clave,", pausa: 0.2 },
  { id: 'E3', txt: "o al revés: poner la clave adecuada para que las notas se llamen como te digo.", pausa: 0.9 },
  { id: 'D1', txt: "Y te digo más: si eres capaz de saber dónde se coloca el Do central en todas y cada una de las claves, podrás, además, saber cuál de las notas es más aguda. Esto es realmente importante.", pausa: 0.8 },
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
