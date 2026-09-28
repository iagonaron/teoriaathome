/* =====================================================================
   GUION · Indica la tonalidad (GE)
   Frases (id) y bloques sin voz en el orden del vídeo. Los tiempos reales
   (frases y palabras) los escribe el montaje en tiempos.js.
   ===================================================================== */
window.GUION = [
  { bloque: 'TITULO', dur: 5.0 },
  { id: 'I1', txt: "Ahora que ya sabes por qué la tonalidad es importante, vamos a aprender a reconocerla simplemente mirando la armadura.", pausa: 0.4 },
  { id: 'I2', txt: "Podemos encontrar unos tres casos:", pausa: 0.1 },
  { id: 'I3', txt: "que haya sostenidos, que haya bemoles o que no haya nada.", pausa: 0.6 },
  { id: 'D1', txt: "Este caso creo que ya te lo sabes: es el de Do Mayor.", pausa: 0.3 },
  { id: 'D2', txt: "Así que lo tenemos que aprender de memoria, y es una tonalidad muy habitual, ¿verdad?", pausa: 0.4 },
  { id: 'D3', txt: "Y es que resulta que la escala de Do Mayor, ya sin alteraciones, tiene la estructura de tonos y semitonos que vimos que era uno de los más populares a lo largo de la historia.", pausa: 0.2 },
  { bloque: 'ESC_DO', dur: 4.2 },
  { id: 'S1', txt: "Cuando nos encontramos sostenidos, la regla es muy sencilla: nos fijamos en el último sostenido y subimos a la siguiente nota.", pausa: 0.5 },
  { id: 'S2', txt: "Mira este ejemplo: Fa, Do, Sol.", pausa: 0.2 },
  { id: 'S3', txt: "El último es Sol sostenido.", pausa: 0.2 },
  { id: 'S4', txt: "La siguiente nota es La,", pausa: 0.2 },
  { id: 'S5', txt: "y por lo tanto, la respuesta es… ¡La Mayor!", pausa: 0.1 },
  { bloque: 'AC_LA', dur: 1.6 },
  { id: 'B1', txt: "Con bemoles nos tenemos que fijar en el penúltimo.", pausa: 0.2 },
  { id: 'B2', txt: "El penúltimo bemol es directamente la tonalidad.", pausa: 0.5 },
  { id: 'B3', txt: "Por ejemplo: Si, Mi, La.", pausa: 0.2 },
  { id: 'B4', txt: "La penúltima nota es Mi bemol.", pausa: 0.2 },
  { id: 'B5', txt: "Por lo tanto, la tonalidad es Mi bemol Mayor.", pausa: 0.1 },
  { bloque: 'AC_MIB', dur: 1.6 },
  { id: 'B6', txt: "Es muy importante que te acuerdes:", pausa: 0.0 },
  { id: 'B7', txt: "a los bemoles hay que llamarlos por su nombre. No puedes decir «Mi Mayor»:", pausa: 0.2 },
  { id: 'B8', txt: "estás mirando un bemol; por lo tanto, Mi bemol Mayor. ¡Acuérdate del apellido!", pausa: 0.6 },
  { id: 'X1', txt: "Tenemos una excepción:", pausa: 0.2 },
  { id: 'X2', txt: "cuando hay un solo bemol, no hay penúltimo bemol.", pausa: 0.3 },
  { id: 'X3', txt: "Esta es otra tonalidad que hay que aprenderse: Fa Mayor.", pausa: 0.1 },
  { bloque: 'AC_FA', dur: 1.6 },
  { id: 'P1', txt: "Si te fijas, cuando aparecen las alteraciones, siempre aparecen en el mismo orden y colocados en el mismo lugar. Hay un patrón. El de los sostenidos te lo conoces:", pausa: 0.2 },
  { id: 'P2', txt: "Fa, Do, Sol, Re, La, Mi, Si.", pausa: 0.5 },
  { id: 'P3', txt: "Y el de los bemoles es justo al contrario: Si, Mi, La, Re, Sol, Do, Fa.", pausa: 1.0 },
  { id: 'R1', txt: "Si recuerdas, en el vídeo anterior vimos que las dos estructuras más empleadas son la escala Mayor y la escala menor, y que de las escalas y las alteraciones que ellas llevan pues es de donde salen las armaduras, ¿no?, para simplificarnos y ponérnoslo como un recordatorio.", pausa: 0.8 },
  { id: 'M1', txt: "Pues bien: hasta ahora hemos estado hablando de tonalidades Mayores.", pausa: 0.2 },
  { id: 'M2', txt: "Tenemos que hablar de las tonalidades menores. Y es que de una misma armadura salen dos tonalidades: la tonalidad Mayor, como la acabamos de ver,", pausa: 0.1 },
  { id: 'M3', txt: "y su relativo menor.", pausa: 0.6 },
  { id: 'M4', txt: "El relativo menor siempre está debajo, y está dos notas por debajo.", pausa: 0.2 },
  { id: 'M5', txt: "Concretamente, a un tono y medio.", pausa: 0.2 },
  { id: 'M6', txt: "Si hablamos de intervalos, estamos diciendo que es una tercera menor.", pausa: 0.8 },
  { id: 'E1', txt: "Si tengo Mi bemol Mayor,", pausa: 0.2 },
  { id: 'E2', txt: "su relativo menor será: Mi, Re, Do.", pausa: 0.1 },
  { id: 'E3', txt: "Do menor.", pausa: 0.1 },
  { bloque: 'AC_DOm', dur: 1.5 },
  { id: 'E4', txt: "¡Perfecto!", pausa: 0.5 },
  { id: 'E5', txt: "Si yo tuviese La Mayor,", pausa: 0.1 },
  { id: 'E6', txt: "bajo dos notas: La, Sol, Fa.", pausa: 0.3 },
  { id: 'E7', txt: "Me fijo que en la armadura el Fa es sostenido", pausa: 0.1 },
  { id: 'E8', txt: "y, por lo tanto, Fa sostenido menor.", pausa: 0.1 },
  { bloque: 'AC_FASm', dur: 1.5 },
  { id: 'O1', txt: "Por lo tanto, hay que tener un ojo puesto en la armadura para saber si la nota a la que hemos llegado está alterada o no.", pausa: 0.8 },
  { id: 'A1', txt: "Quiero aclarar que los relativos están a distancia de tercera menor.", pausa: 0.3 },
  { id: 'A2', txt: "Por eso no basta simplemente con bajar dos notas: hay que respetar siempre el nombre correcto de la nota.", pausa: 1.0 },
  { id: 'F1', txt: "Vamos a terminar este vídeo con un ejemplo completo siguiendo todos los pasos, y así lo dejamos resumido.", pausa: 0.5 },
  { id: 'F2', txt: "Vamos con una tonalidad Mayor.", pausa: 0.2 },
  { id: 'F3', txt: "Si no hay alteraciones, sería Do Mayor.", pausa: 0.4 },
  { id: 'F4', txt: "Si hay sostenidos, nos fijamos en el último y subimos a la siguiente nota.", pausa: 0.5 },
  { id: 'F5', txt: "Si hay bemoles, nos fijamos en el penúltimo.", pausa: 0.4 },
  { id: 'F6', txt: "Y si solo hubiese un bemol, nos tenemos que acordar que es Fa Mayor.", pausa: 0.6 },
  { id: 'F7', txt: "Y ahora que ya tenemos la tonalidad Mayor, para conseguir el menor tenemos que hacer siempre lo mismo:", pausa: 0.2 },
  { id: 'F8', txt: "bajamos dos notas,", pausa: 0.3 },
  { id: 'F9', txt: "miramos a la armadura a ver si hay alguna de ellas que esté alterada, y esa es la tonalidad menor.", pausa: 0.5 },
  { id: 'F10', txt: "Recuerda: la distancia siempre es una tercera menor. Un tono y medio.", pausa: 0.0 },
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
