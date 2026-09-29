/* =====================================================================
   GUION · Términos
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'H1', txt: "Cuando empezamos a transcribir la música en papel, al principio utilizábamos muy poquitos símbolos.", pausa: 0.3 },
  { id: 'H2', txt: "Y las grafías fueron aumentando poco a poco:", pausa: 0.1 },
  { id: 'H3', txt: "ritmos, alturas, claves… bueno, ya lo conoces.", pausa: 0.4 },
  { id: 'H4', txt: "La cuestión es que poco a poco fuimos refinando la cantidad de instrucciones que dábamos al intérprete para saber cómo era la forma adecuada de hacer esa interpretación.", pausa: 0.5 },
  { id: 'H5', txt: "En este vídeo vamos a ver algunos términos que ayudan a completar información.", pausa: 0.8 },
  { id: 'I1', txt: "Casi todos los términos musicales están en italiano.", pausa: 0.2 },
  { id: 'I2', txt: "Y, aunque parecen muchísimos, en realidad están organizados en familias, y hay una forma de estudiar que te recomiendo, la verdad.", pausa: 0.8 },
  { id: 'D1', txt: "Vale, por un lado está la dinámica: lo fuerte y lo suave que tocamos. Estos yo creo que ya te los sabes. De más suave a más fuerte sería: pianissimo, piano, mezzo piano, mezzo forte, forte y fortissimo.", pausa: 0.2 },
  { bloque: 'SON_DIN', dur: 4.0 },
  { id: 'D2', txt: "Estás muy habituado a que en lecciones de entonación te recuerde: «Por favor, haz la dinámica, haz los matices».", pausa: 0.2 },
  { id: 'D3', txt: "Ya que esto cuenta bastante, y es muy fácil: simplemente hay que acordarse.", pausa: 0.8 },
  { id: 'G1', txt: "También tenemos términos que gradúan la intensidad, como poco a poco: en este caso, crescendo, aumentando; diminuendo o decrescendo.", pausa: 0.4 },
  { id: 'G2', txt: "También pueden ser de golpe: subito piano, que es de repente suave; o subito forte, de repente fuerte.", pausa: 0.5 },
  { id: 'G3', txt: "Y hay algunos que combinan no solo intensidad, sino también velocidad. Por ejemplo: smorzando, perdendosi, svanendo.", pausa: 0.2 },
  { id: 'G4', txt: "Además de bajar el volumen, frenan. Es como que se les acaba la batería.", pausa: 0.8 },
  { id: 'A1', txt: "Términos de articulación.", pausa: 0.2 },
  { id: 'A2', txt: "También va a depender mucho del instrumento que toques, que conozcas más o menos. Pero bueno, los más típicos son:", pausa: 0.2 },
  { id: 'A3', txt: "ligado, legato;", pausa: 0.1 },
  { bloque: 'SON_LEG', dur: 2.4 },
  { id: 'A4', txt: "staccato, más picado, ¿sabes?, notas cortas y separadas.", pausa: 0.1 },
  { bloque: 'SON_STA', dur: 2.2 },
  { id: 'A5', txt: "Tenuto es manteniendo la nota todo su valor, con una intensidad plana.", pausa: 0.1 },
  { bloque: 'SON_TEN', dur: 2.3 },
  { id: 'A6', txt: "Y en cuerda, el más típico es pizzicato: pellizcando, ¿no?", pausa: 0.1 },
  { bloque: 'SON_PIZ', dur: 2.4 },
  { id: 'C1', txt: "Y el carácter, pues es un poco más la emoción, ¿no?,", pausa: 0.0 },
  { id: 'C1b', txt: "que se quiere transmitir con la música:", pausa: 0.2 },
  { id: 'C2', txt: "dolce, dulce; cantabile, eso, como cantando; con brio, con energía.", pausa: 0.8 },
  { id: 'K1', txt: "Aquí hay muchos términos, es verdad, pero la mayoría de ellos son palabras muy parecidas al español. Sinceramente, esas no te las tienes que estudiar.", pausa: 0.3 },
  { id: 'K2', txt: "Yo revisaría en los apuntes todos los términos que hay y me marcaría, subrayado o como consideres, aquellos que realmente son, pues, poco intuitivos, que al final es un porcentaje muy pequeño. Esas te las marcas, y son las que te tendrás que aprender.", pausa: 0.8 },
  { id: 'R1', txt: "Otros símbolos muy útiles, de repetición y demás, como da capo, que quiere decir repetir desde el principio; dal segno, desde el signo;", pausa: 0.2 },
  { id: 'R2', txt: "fine, el final;", pausa: 0.2 },
  { id: 'R3', txt: "y ad libitum, que quiere decir… con libertad.", pausa: 0.8 },
  { id: 'F1', txt: "Como digo, no hace falta que te los sepas todos de memoria. Ve a los que sean más extraños, más nuevos, los que no conozcas, y muchos los vas a ir descubriendo con tu instrumento de forma natural.", pausa: 0.3 },
  { id: 'F2', txt: "Venga, todos los importantes están en el kit. ¡A practicarlos!", pausa: 0.0 },
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
