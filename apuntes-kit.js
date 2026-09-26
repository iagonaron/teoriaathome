/* (26-sep-2026, Iago) VER APUNTES · datos del Kit salvavidas 4GE (re-creados para la web). Generado a partir de kit/*.js */
/* ---- kit/tonalidades.js ---- */
/* Kit salvavidas 4GE · TONALIDADES (relativos, indica la tonalidad, indica la armadura, tonalidades vecinas) */
(window.APX_TEMAS=window.APX_TEMAS||{});
Object.assign(window.APX_TEMAS, {

  'relativos': {
    titulo:'Relativos', corto:'Relativos', fuente:'Kit salvavidas 4GE · Relativos (p. 7)',
    bloques:[
      {intro:'Dos tonalidades son relativas si comparten la misma armadura'},
      {penta:{ txt:'Ejemplo 1: Calcula el relativo de LabM', ks:'Ab', c:[
        {n:[{k:'ab/4', d:'w', id:'a1', ab:'La distancia siempre es 3m'}], w:1.2},
        {n:[{k:['f/4','ab/4'], d:'w', id:'a2', colK:[0], flecha:'der-abajo', ab:'Como la que tenemos es Mayor,\nqueremos su relativo menor.\nLa 3m la tenemos que bajar.\nNos da «fa»'}], w:1.5},
        {n:[{k:'b/4', d:'w', inv:true, ab:{t:'Respuesta: Fam', col:'acc', fw:800, fs:14}}], w:1}
      ] }},
      {penta:{ txt:'Ejemplo 2: Calcula el relativo de Mim', ks:'G', c:[
        {n:[{k:'e/4', d:'w', ab:'La distancia siempre es 3m'}], w:1.2},
        {n:[{k:['e/4','g/4'], d:'w', colK:[1], flecha:'der-arriba', ab:'Como la que tenemos es menor,\nqueremos su relativo Mayor.\nLa 3m la tenemos que subir.\nNos da «sol»'}], w:1.5},
        {n:[{k:'b/4', d:'w', inv:true, ab:{t:'Respuesta: SolM', col:'acc', fw:800, fs:14}}], w:1}
      ] }}
    ]
  },

  'tonalidad': {
    titulo:'Indica la tonalidad', corto:'Indica la tonalidad', fuente:'Kit salvavidas 4GE · Indica la tonalidad (p. 8)',
    bloques:[
      {h:'Ejemplos de ejercicio'},
      {penta:{ c:[
        {ks:'A', n:[{k:'b/4', d:'w', inv:true}], ab:'Respuesta:  LaM / Fa♯m', abCol:'acc', fin:'||'},
        {ks:'Bb', n:[{k:'b/4', d:'w', inv:true}], ab:'Respuesta:  SibM / Solm', abCol:'acc'}
      ]}},
      {h:'Procedimiento'},
      {h4:'Cuando hay sostenidos'},
      {penta:{ c:[
        {ks:'A', n:[{k:'b/4', d:'w', inv:true}], ksFlecha:{i:2, txt:''}, ksCol:[2], ab:'Nos fijamos en el último ♯: sol♯', w:1},
        {n:[{k:'g#/4', d:'w', col:'gris', id:'s1'},{k:'a/4', d:'w', col:'acc', id:'s2'}], ab:'Subimos un semitono para calcular el M: LaM', w:1.2},
        {n:[{k:'a/4', d:'w', id:'s3'},{k:'f#/4', d:'w', col:'acc', id:'s4'}], ab:'Bajamos una 3m para su relativo: Fa♯m', w:1.2}
      ], fin:'|.' }},
      {h4:'Cuando hay bemoles'},
      {penta:{ c:[
        {ks:'Bb', n:[{k:'b/4', d:'w', inv:true}], ksFlecha:{i:0, txt:''}, ksCol:[0], ab:'Nos fijamos en el penúltimo ♭: sib', w:1},
        {n:[{k:'bb/4', d:'w', col:'acc'}], ab:'Lo llamamos tal cual para el M: SibM', w:1.2},
        {n:[{k:'bb/4', d:'w'},{k:'g/4', d:'w', col:'acc'}], ab:'Bajamos una 3m para su relativo: Solm', w:1.2}
      ] }},
      {ojo:'Tenemos que saber de memoria…', dentro:{penta:{ c:[
        {n:[{k:'b/4', d:'w', inv:true}], ab:'DoM / Lam', fin:'||'},
        {ks:'F', n:[{k:'b/4', d:'w', inv:true}], ab:'FaM / Rem'}
      ]}}}
    ]
  },

  /* (26-sep-2026, Iago) TEXTO NUEVO para la web: sin «interrogatorio» ni «amigo o enemigo» */
  'armadura': {
    titulo:'Indica la armadura', corto:'Indica la armadura', fuente:'Kit salvavidas 4GE · Indica la armadura (p. 9) · versión web revisada por Iago',
    bloques:[
      {h:'Ejemplos de ejercicio'},
      {penta:{ c:[
        {n:[{k:'b/4', d:'w', inv:true}], ab:'Caso 1: Dom', fin:'||'},
        {n:[{k:'b/4', d:'w', inv:true}], ab:'Caso 2: MiM'}
      ]}},
      {h:'Procedimiento'},
      {pasos:[{n:'Paso 0', t:'Primero conseguimos la tonalidad <b>mayor</b>: si la tonalidad es <b>menor</b>, pasamos a su <b>relativo mayor</b>; si ya es mayor, seguimos.'}]},
      {penta:{ c:[
        {n:[{k:'c/4', d:'w', id:'r1'},{k:'eb/4', d:'w', col:'acc', id:'r2'}], ab:'Caso 1: Dom → necesitamos el mayor: MibM', abCol:'acc', fin:'||', w:1},
        {n:[{k:'e/4', d:'w'}], ab:'Caso 2: MiM → no hace falta hacer nada', w:1}
      ]}},
      {arbol:{ raiz:'Ya tenemos la tonalidad <b>mayor</b>. ¿Tiene un <b>♭ en el nombre</b>?', ramas:[
        { tit:'Sí: MibM, SibM, LabM…', pasos:[
            {n:'Paso 1', t:'Si la tonalidad tiene un bemol en el nombre… ¡tiene <b>bemoles</b>! (¡menudo spoiler!)'},
            {n:'Paso 2', t:'Contaremos en el <b>orden de bemoles</b> y le regalaremos <b>uno extra</b>.'}
          ],
          dentro:[
            {p:'<span class="apx-acc">Caso 1 · MibM</span>: contamos hasta mi♭ (si♭ · mi♭) y le regalamos uno extra: <b>la♭</b>.'},
            {penta:{ estrecho:true, c:[ {ks:'Eb', ksCol:[2], n:[{k:'b/4', d:'w', inv:true}], ab:'si♭ · mi♭ · la♭ (el extra)', abCol:'acc'} ] }}
          ]
        },
        { tit:'No: MiM, ReM, LaM…', pasos:[
            {n:'Paso 1', t:'Si la tonalidad mayor no tiene un bemol en el nombre… ¡tiene <b>sostenidos</b>! <span class="apx-acc">*</span>'},
            {n:'Paso 2', t:'Contaremos en el <b>orden de sostenidos</b> hasta llegar a la <b>sensible</b>. <span class="apx-acc">**</span>'}
          ],
          dentro:[
            {p:'<span class="apx-acc">Caso 2 · MiM</span>: su sensible es <b>re♯</b>, así que contamos: fa♯ · do♯ · sol♯ · re♯.'},
            {penta:{ estrecho:true, c:[ {ks:'E', ksCol:[3], n:[{k:'b/4', d:'w', inv:true}], ab:'fa♯ · do♯ · sol♯ · re♯ (la sensible)', abCol:'acc'} ] }}
          ]
        }
      ]}},
      {alerta:'<b>EXCEPCIONES</b><br><span>*</span> Hay dos excepciones que debes recordar: <b>DoM no tiene armadura</b> y <b>FaM</b> (pese a no tener ♭ en el nombre) <b>tiene un bemol</b>.', lab:'Alerta',
        dentro:{penta:{ c:[
          {n:[{k:'b/4', d:'w', inv:true}], ab:'DoM / Lam', fin:'||'},
          {ks:'F', n:[{k:'b/4', d:'w', inv:true}], ab:'FaM / Rem'}
        ]}}},
      {alerta:'<span>**</span> La <b>sensible</b> es el séptimo grado (st). Dicho de otra forma: es la nota que está justo debajo. A tan solo medio tono.', lab:'Alerta',
        dentro:{penta:{ c:[
          {n:[{k:'d#/4', d:'w', col:'acc', ab:{t:'re♯ (sensible)', col:'acc', fw:800}},{k:'e/4', d:'w', ab:'mi (tónica)'}], ab:'MiM', w:1}
        ]}}}
    ]
  },

  'vecinas': {
    titulo:'Tonalidades vecinas', corto:'Tonalidades vecinas', fuente:'Kit salvavidas 4GE · Tonalidades vecinas (p. 10)',
    bloques:[
      {intro:'Las tonalidades vecinas son las que tienen armaduras vecinas (+1 y −1 alteración) además del relativo, ¡claro!'},
      {p:'En total tienen que ser 6, incluyendo la que te da el enunciado.', i:true},
      {penta:{ txt:'Ejemplo 1: indica las tonalidades vecinas de MibM', c:[
        {ks:'Eb', n:[{k:'b/4', d:'w', inv:true}], ab:'↑ Calculamos la armadura: 3♭\ny anotamos el relativo: Dom', w:1.6, fin:'||'},
        {ks:'Ab', ar:'Armaduras vecinas', arIt:true, n:[{k:'b/4', d:'w', inv:true}], ab:'4♭', abCol:'acc', w:0.8},
        {ks:'Bb', n:[{k:'b/4', d:'w', inv:true}], ab:'2♭', abCol:'acc', w:0.8},
        {n:[{k:'b/4', d:'w', inv:true}], ab:'Respuesta:\n3♭ MibM / Dom\n4♭ LabM / Fam\n2♭ SibM / Solm', abCol:'acc', w:1.3}
      ], bot:92 }},
      {p:'Otra forma típica de ejercicio:'},
      {tabla:{ cab:['2♭','3♭','4♭'], filas:[['SibM','MibM','LabM'],['Solm','Dom','Fam']], resalta:[[0,1]] }},
      {ojo:'Si la tonalidad del enunciado no tiene alteraciones, sus armaduras vecinas serían 1♯ y 1♭.'}
    ]
  }
});

/* ---- kit/intervalos.js ---- */
/* Kit salvavidas 4GE · INTERVALOS (intervalos, inversión de intervalos simples, intervalos compuestos, inversión de intervalos compuestos)
   (26-sep-2026, Iago) Necesita el motor con: fin:';' (barra punteada), sinPlica, t:'v' (semitono ∨ / √), flecha ddx/ddy/bdy, junto, abFin, ab2, llave:false (ver a1/apuntes.js) */
(window.APX_TEMAS=window.APX_TEMAS||{});
(function(){
  /* numeritos «8 9 10» debajo de las notas (todos en la misma fila) */
  function num(t){ return {t:t, it:true, fw:500, fs:11.5}; }
  /* respuestas en negrita cursiva */
  function resp(t, dy, caja){ return {t:t, it:true, fw:800, fs:14, col:'acc', dy:dy||0, caja:caja}; }
  var DER = function(t){ return '<span style="display:block;text-align:right">'+t+'</span>'; };

  Object.assign(window.APX_TEMAS, {

  'intervalos': {
    titulo:'Intervalos', corto:'Intervalos simples', fuente:'Kit salvavidas 4GE · Intervalos (p. 3)',
    bloques:[
      {penta:{ tit:'2ªs', bot:50, c:[
        {n:[{k:'c/4', d:'w', id:'s2a'},{k:'d/4', d:'w', id:'s2b'}], ab:'1T = M', abIt:true, abY:14},
        {n:[{k:'f#/4', d:'w', id:'s2c'},{k:'g/4', d:'w', id:'s2d'}], ab:'1st = m', abIt:true, abY:14, fin:'||'},
        {ar:'Ejemplos', n:[{k:'a/4', d:'w'},{k:'g/4', d:'w'}], ab:'2M', abIt:true},
        {n:[{k:'f/4', d:'w'},{k:'e/4', d:'w'}], ab:'2m', abIt:true},
        {n:[{k:'bb/4', d:'w'},{k:'c/5', d:'w'}], ab:'2M', abIt:true},
        {n:[{k:'eb/4', d:'w'},{k:'d/4', d:'w'}], ab:'2m', abIt:true}
      ], a:[
        {t:'arco', de:'s2a', a:'s2b', lado:'abajo', alto:8},
        {t:'v', de:'s2c', a:'s2d'}
      ], pie:DER('* &gt;1T = Aum<br>&lt;1st = Dism') }},

      {penta:{ tit:'3ªs', bot:50, c:[
        {n:[{k:'d/4', d:'w', id:'s3a'},{k:'e/4', d:'w', inv:true, id:'s3b'},{k:'f#/4', d:'w', id:'s3c'}], ab:'2T = M', abIt:true, abY:14},
        {n:[{k:'f/4', d:'w', id:'s3d'},{k:'g/4', d:'w', inv:true, id:'s3e'},{k:'ab/4', d:'w', id:'s3f'}], ab:'1T + 1st = m', abIt:true, abY:14, fin:'||'},
        {ar:'Ejemplos', n:[{k:'g/4', d:'w'},{k:'e/4', d:'w'}], ab:'3m', abIt:true},
        {n:[{k:'g/4', d:'w'},{k:'b/4', d:'w'}], ab:'3M', abIt:true},
        {n:[{k:'f/4', d:'w'},{k:'d/4', d:'w'}], ab:'3m', abIt:true},
        {n:[{k:'g#/4', d:'w'},{k:'e/4', d:'w'}], ab:'3M', abIt:true}
      ], a:[
        {t:'arco', de:'s3a', a:'s3b', lado:'abajo', alto:7},
        {t:'arco', de:'s3b', a:'s3c', lado:'abajo', alto:7},
        {t:'arco', de:'s3d', a:'s3e', lado:'abajo', alto:7},
        {t:'v', de:'s3e', a:'s3f', raiz:true}
      ], pie:DER('* &gt;2T = Aum<br>&lt;1T+1st = Dism') }},

      {penta:{ tit:'4ªs', txt:'Son J si se apellidan igual...', c:[
        {n:[{k:'c/4', d:'w'},{k:'f/4', d:'w'}], ab:'4J', abIt:true},
        {n:[{k:'g#/4', d:'w'},{k:'d#/4', d:'w'}], ab:'4J', abIt:true},
        {n:[{k:'eb/5', d:'w'},{k:'bb/4', d:'w'}], ab:'4J', abIt:true, fin:'||'},
        {ar:'...Excepto', arIt:true, n:[{k:'f/4', d:'w'},{k:'b/4', d:'w'}], ab:'4A', abIt:true}
      ] }},

      {penta:{ tit:'5ªs', txt:'Son J si se apellidan igual...', c:[
        {n:[{k:'d/4', d:'w'},{k:'a/4', d:'w'}], ab:'5J', abIt:true},
        {n:[{k:'bb/4', d:'w'},{k:'eb/4', d:'w'}], ab:'5J', abIt:true},
        {n:[{k:'c#/4', d:'w'},{k:'g#/4', d:'w'}], ab:'5J', abIt:true, fin:'||'},
        {ar:'...Excepto', arIt:true, n:[{k:'b/3', d:'w'},{k:'f/4', d:'w'}], ab:'5D', abIt:true}   /* en el papel pone «5A»: si–fa es 5ª disminuida */
      ] }},

      {penta:{ tit:'6ªs', txt:'Las invertimos para convertir en 3ªs', c:[
        {n:[{k:'c/4', d:'w', id:'s6a'},{k:'a/4', d:'w'}], fin:';'},
        {n:[{k:'a/4', d:'w'},{k:'c/5', d:'w', id:'s6b'}], ab:'3m', abIt:true, fin:'||'},
        {ar:'La especie es la contraria', arIt:true, arFs:11, arFw:600, n:[{k:'c/4', d:'w'},{k:'a/4', d:'w'}], ab:'6M', abIt:true}
      ], a:[
        {t:'arco', de:'s6a', a:'s6b', dash:true}
      ] }},

      {penta:{ tit:'7ªs', txt:'Las invertimos para convertir en 2ªs', c:[
        {n:[{k:'c/5', d:'w', id:'s7a'},{k:'d/4', d:'w'}]},
        {n:[{k:'d/4', d:'w'},{k:'c/4', d:'w', id:'s7b'}], ab:'2M', abIt:true},
        {ar:'La especie es la contraria', arIt:true, arFs:11, arFw:600, n:[{k:'c/5', d:'w'},{k:'d/4', d:'w'}], ab:'7m', abIt:true}
      ], a:[
        {t:'arco', de:'s7a', a:'s7b', dash:true}
      ] }},

      {penta:{ tit:'8ªs', txt:'Son J si se apellidan igual...', c:[
        {n:[{k:'d/4', d:'w'},{k:'d/5', d:'w'}], ab:'8J', abIt:true},
        {n:[{k:'c#/5', d:'w'},{k:'c#/4', d:'w'}], ab:'8J', abIt:true},
        {n:[{k:'eb/4', d:'w'},{k:'eb/5', d:'w'}], ab:'8J', abIt:true}
      ] }},

      {p:'*Las 4ª, 5ª y 8ª que no se apelliden igual serán Aumentadas o Disminuidas.', i:true},
      {truco:'Recomiendo truco de manos para comprobar si el intervalo es más grande o más pequeño.', lab:'Consejo'}
    ]
  },

  'inv-simples': {
    titulo:'Inversión de intervalos', corto:'Intervalos simples', fuente:'Kit salvavidas 4GE · Inversión de intervalos (p. 4)',
    bloques:[
      {intro:'Invertir consiste en cambiar una de las dos notas una octava.'},
      {penta:{ txt:'Ejemplo: Invierte el siguiente intervalo', c:[
        {n:[{k:'d/4', d:'w'},{k:'f/4', d:'w'}], ab:'Analizamos el intervalo:\n3m', abIt:true},
        {n:[{k:'d/4', d:'w', id:'e1'},{k:'f/4', d:'w'}], ab:'Cambiamos una nota de octava', abIt:true, abFin:true},
        {junto:true, n:[{k:'d/5', d:'w', id:'e2'},{k:'f/4', d:'w'}]},
        {n:[{k:'d/5', d:'w'},{k:'f/4', d:'w'}], ab:'Respuesta: 6M*', abIt:true, abCol:'acc'}
      ], a:[
        {t:'arco', de:'e1', a:'e2', dash:true}
      ] }},
      /* (pentagrama vacío del original, para escribir: omitido) */
      {h:'Cosas a tener en cuenta'},
      {penta:{ txt:'Si la nota que cambias de octava tiene alteración, tiene que seguir llevándola', c:[
        {n:[{k:'f#/4', d:'w', id:'f1', col:'acc'},{k:'c/5', d:'w'}]},
        {n:[{k:'f#/5', d:'w', id:'f2', col:'acc'},{k:'c/5', d:'w'}]}
      ], a:[
        {t:'arco', de:'f1', a:'f2', dash:true}
      ] }},
      {penta:{ txt:'*Los intervalos m se convierten en M y viceversa', c:[
        {n:[{k:'d/4', d:'w', id:'m1'},{k:'eb/4', d:'w'}], ab:'2m', abIt:true},
        {n:[{k:'d/5', d:'w', id:'m2'},{k:'eb/4', d:'w'}], ab:'7M', abIt:true}
      ], a:[
        {t:'arco', de:'m1', a:'m2', dash:true}
      ] }},
      {penta:{ txt:'Los intervalos D se convierten en A y viceversa', c:[
        {n:[{k:'bb/4', d:'w', id:'d1'},{k:'e/4', d:'w'}], ab:'5D', abIt:true},
        {n:[{k:'bb/3', d:'w', id:'d2'},{k:'e/4', d:'w'}], ab:'4A', abIt:true}
      ], a:[
        {t:'arco', de:'d1', a:'d2', dash:true}
      ] }},
      {penta:{ txt:'Los intervalos J siguen siendo J', c:[
        {n:[{k:'d/4', d:'w', id:'j1'},{k:'g/4', d:'w'}], ab:'4J', abIt:true},
        {n:[{k:'d/5', d:'w', id:'j2'},{k:'g/4', d:'w'}], ab:'5J', abIt:true}
      ], a:[
        {t:'arco', de:'j1', a:'j2', dash:true}
      ] }},
      {truco:'si te fijas, todos los intervalos con su inversión suman 9'}
    ]
  },

  'int-comp': {
    titulo:'Intervalos compuestos', corto:'Intervalos compuestos', fuente:'Kit salvavidas 4GE · Intervalos compuestos (p. 5)',
    bloques:[
      {intro:'Son los intervalos mayores de una octava.', introNota:'Se nombran con números a partir del 9.'},
      {h:'Cómo analizarlos', sub:'como cualquier intervalo... queremos número y especie, ¿no?'},
      {p:'1) El número: acerco la nota grave una octava (el do pequeñito) y cuento desde el 8: 9 y 10 → es una 10ª.', i:true},
      {p:'2) La especie: aprovechando que ya están cerca, analizo el intervalo que resulta (do–mi: 3ª M) → la especie.', i:true},
      {penta:{ bot:84, c:[
        {marco:'gris', ar:'el ejemplo', arC:true, arIt:true, n:[{k:'c/4', d:'w'},{k:'e/5', d:'w'}]},
        {ar:'1) acerco el do y cuento\ndesde el 8', arC:true, arIt:true, arY:36, n:[
          {k:'c/4', d:'w', id:'k1'},
          {k:'c/5', d:'q', sinPlica:true, peq:true, id:'k2', ab:num('8')},
          {k:'d/5', d:'w', inv:true, id:'k3', ab:num('9')},
          {k:'e/5', d:'w', id:'k4', ab:num('10')}
        ]},
        {junto:true, ar:'2) analizo el intervalo:\nla especie', arC:true, arIt:true, arY:36, n:[
          {k:'c/5', d:'q', sinPlica:true, peq:true},
          {k:'d/5', d:'w', inv:true, id:'k6'},
          {k:'e/5', d:'w'}
        ]}
      ], a:[
        {t:'arco', de:'k1', a:'k2', dash:true},
        {t:'arco', de:'k2', a:'k3', alto:6},
        {t:'arco', de:'k3', a:'k4', alto:6},
        {t:'txt', de:'k6', txt:'3ª M', lado:'arriba', dy:17, it:true, fs:11, fw:600},
        {t:'txt', de:'k6', txt:'Solución: 10ª M', dy:78, caja:true, it:true, fs:14, fw:800, col:'acc'},
        {t:'flecha', de:'k4', a:'k6', ddy:53, bdx:4, bdy:76},
        {t:'flecha', de:'k6', a:'k6', ddx:6, ddy:-7, bdx:38, bdy:76}
      ] }},

      {h:'Algunos ejemplos'},
      {penta:{ bot:70, c:[
        {n:[{k:'c/4', d:'w'},{k:'c/5', d:'q', sinPlica:true, peq:true, ab:num('8')},{k:'b/4', d:'q', sinPlica:true, inv:true, id:'x1', ab:resp('9ª M', 34)},{k:'d/5', d:'w', ab:num('9')}]},
        {n:[{k:'c/4', d:'w'},{k:'c/5', d:'q', sinPlica:true, peq:true, ab:num('8')},{k:'b/4', d:'q', sinPlica:true, inv:true, id:'x2', ab:resp('10ª m', 34)},{k:'eb/5', d:'w', ab:num('10')}]},
        {n:[{k:'c/4', d:'w'},{k:'c/5', d:'q', sinPlica:true, peq:true, ab:num('8')},{k:'b/4', d:'q', sinPlica:true, inv:true, id:'x3', ab:resp('11ª J', 34)},{k:'f/5', d:'w', ab:num('11')}]},
        {n:[{k:'c/4', d:'w'},{k:'c/5', d:'q', sinPlica:true, peq:true, ab:num('8')},{k:'b/4', d:'q', sinPlica:true, inv:true, id:'x4', ab:resp('12ª J', 34)},{k:'g/5', d:'w', ab:num('12')}]}
      ], a:[
        {t:'txt', de:'x1', txt:'2ª M', lado:'arriba', dy:6, it:true, fs:11, fw:600},
        {t:'txt', de:'x2', txt:'3ª m', lado:'arriba', dy:4, it:true, fs:11, fw:600},
        {t:'txt', de:'x3', txt:'4ª J', lado:'arriba', dy:1, it:true, fs:11, fw:600},
        {t:'txt', de:'x4', txt:'5ª J', lado:'arriba', dy:-1, it:true, fs:11, fw:600},
        {t:'flecha', de:'x1', a:'x1', ddy:-10, bdy:50},
        {t:'flecha', de:'x2', a:'x2', ddy:-12, bdy:50},
        {t:'flecha', de:'x3', a:'x3', ddy:-15, bdy:50},
        {t:'flecha', de:'x4', a:'x4', ddy:-17, bdy:50}
      ] }},
      {p:'Las 11ªs y 12ªs funcionan como las 4ªs y las 5ªs: justas si las notas se apellidan igual.', i:true}
    ]
  },

  'inv-comp': {
    titulo:'Inversión de intervalos compuestos', corto:'Intervalos compuestos', fuente:'Kit salvavidas 4GE · Inversión de intervalos compuestos (p. 5)',
    bloques:[
      {truco:'<b>aplica el truco AIA</b><br><i style="font-weight:400">Me <b>A</b>cerco (una octava)<br><b>I</b>nvierto<br>Me <b>A</b>lejo (una octava)</i>', lab:'Consejo'},
      {penta:{ top:56, bot:66, c:[
        {n:[{k:'c/4', d:'w'},{k:'e/5', d:'w', id:'p1'}], ab:'propuesta: 10ª M', abIt:true, abY:8},
        {n:[{k:'c/4', d:'w', id:'p2'},{k:'e/4', d:'w', id:'p3'}], ab:'me Acerco (una octava): 3ª M', abIt:true, abY:8},
        {n:[{k:'e/4', d:'w'},{k:'c/5', d:'w', id:'p4'}], ab:'Invierto: 6ª m', abIt:true, abY:8},
        {n:[{k:'e/4', d:'w'},{k:'c/6', d:'w', id:'p5'}], ab:'me Alejo (una octava)', abIt:true, abY:8, ab2:resp('13ª m', 0, true)}
      ], a:[
        {t:'arco', de:'p1', a:'p3', dash:true},
        {t:'arco', de:'p2', a:'p4', dash:true},
        {t:'arco', de:'p4', a:'p5', dash:true}
      ] }},
      {p:'A veces es útil usar dos pentagramas con dos claves: estamos manejando distancias muy grandes.', i:true},
      {penta:{ clef:'treble', clef2:'bass', llave:false, gap2:64, bot:66, c:[
        {n:[{k:'b/4', d:'w', inv:true},{k:'g/4', d:'w', id:'q1'}], n2:[{k:'c/3', d:'w'},{k:'d/3', d:'w', inv:true}], ab:'propuesta: 12ª J', abIt:true},
        {n:[], n2:[{k:'c/3', d:'w', id:'q2'},{k:'g/3', d:'w', id:'q3'}], ab:'me Acerco (una octava): 5ª J', abIt:true},
        {n:[], n2:[{k:'g/3', d:'w'},{k:'c/4', d:'w', id:'q4'}], ab:'Invierto: 4ª J', abIt:true},
        {n:[{k:'b/4', d:'w', inv:true},{k:'c/5', d:'w', id:'q5'}], n2:[{k:'g/3', d:'w'},{k:'d/3', d:'w', inv:true}], ab:'me Alejo (una octava)', abIt:true, ab2:resp('11ª J', 0, true)}
      ], a:[
        {t:'arco', de:'q1', a:'q3', dash:true},
        {t:'arco', de:'q2', a:'q4', dash:true},
        {t:'arco', de:'q4', a:'q5', dash:true}
      ] }},
      {truco:'el intervalo y su inversión tienen que sumar 23, y la especie es la opuesta:', dentro:[
        {html:'<div class="apx-tabla-wrap"><table class="apx-tabla"><tbody>'+
              '<tr><td><b><i>m → M</i></b></td><td><b><i>A → D</i></b></td></tr>'+
              '<tr><td><b><i>M → m</i></b></td><td><b><i>D → A</i></b></td></tr>'+
              '<tr><td colspan="2"><b><i>J → J</i></b></td></tr>'+
              '</tbody></table></div>'}
      ]}
    ]
  }

  });
})();

/* ---- kit/compases.js ---- */
/* Kit salvavidas 4GE · COMPASES (p. 6) */
(window.APX_TEMAS=window.APX_TEMAS||{});
(function(){
  /* figuras de ejemplo: todas en sol4, como en la página */
  function F(d, n, extra){ var r=[]; for(var i=0;i<n;i++){ var o={k:'g/4', d:d}; if(extra && extra[i]) for(var k in extra[i]) o[k]=extra[i][k]; r.push(o); } return r; }
  var AC={art:'>', artAbajo:true};   /* acento debajo, como en la página */
  var INK='#16203a';

  Object.assign(window.APX_TEMAS, {
    'compases': {
      titulo:'Compases', corto:'Compases', fuente:'Kit salvavidas 4GE · Compases (p. 6)',
      bloques:[
        {intro:'Los compases se clasifican de varias formas'},

        {h:'Según su número de pulsos', sub:'Ejemplos:'},
        {penta:{ c:[
          {ts:'2/4',  n:F('q',2),  ab:'BINARIOS', abC:false, abIt:true, abCol:'acc'},
          {ts:'6/8',  n:F('q.',2)},
          {ts:'2/2',  n:F('h',2), fin:'||'},
          {ts:'3/4',  n:F('q',3),  ab:'TERNARIOS', abC:false, abIt:true, abCol:'acc'},
          {ts:'9/8',  n:F('q.',3)},
          {ts:'3/2',  n:F('h',3)}
        ] }},
        {penta:{ c:[
          {ts:'4/4',  n:F('q',4),  ab:'CUATERNARIOS', abC:false, abIt:true, abCol:'acc'},
          {ts:'12/8', n:F('q.',4)},
          {ts:'4/2',  n:F('h',4), fin:'||'},
          {ts:'5/4',  n:F('q',5),  ab:'QUINARIOS', abC:false, abIt:true, abCol:'acc'}
        ], pie:'<div style="text-align:right;padding-right:6px">etc.</div>' }},

        {h:'Según su subdivisión', sub:'Ejemplos:'},
        {penta:{ c:[
          {ts:'2/4', n:F('8',4,{0:Object.assign({id:'sb1'},AC),2:AC}), ab:'SUB. BINARIA O SIMPLES', abC:false, abIt:true, abCol:'acc', abY:12},
          {ts:'3/4', n:F('8',6,{0:AC,2:AC,4:AC})},
          {ts:'2/2', n:F('q',4,{0:AC,2:AC}), fin:'||'},
          {ts:'6/8', n:F('8',6,{0:Object.assign({id:'st1'},AC),3:AC}), ab:'SUB. TERNARIA O COMPUESTOS', abC:false, abIt:true, abCol:'acc', abY:12, salto:true},
          {ts:'9/8', n:F('8',9,{0:AC,3:AC,6:AC})}
        ], a:[
          {t:'txt', de:'sb1', txt:'si cada pulso se divide en 2 figuras', it:true, fw:600, anchor:'start', dx:-15, dy:42},
          {t:'txt', de:'st1', txt:'si cada pulso se divide en 3 figuras', it:true, fw:600, anchor:'start', dx:-15, dy:42}
        ], bot:76 }},

        {p:'Por último, hay que fijarse bien qué figura ocupa un pulso (F. Pulso), una subdivisión (F. Subdivisión) y la que ocupa el compás completo. (F. Compás)'},

        {penta:{ txt:'Ejemplo de ejercicio resuelto:', c:[
          {ts:'6/8', n:[{k:'b/4', d:'q.', inv:true, id:'e1', ab:{t:'Compás:', col:INK}},
                        {k:'b/4', d:'q.', inv:true, id:'e2', ab:{t:'Subdivisión:', col:INK}}], w:2.4},
          {n:[{k:'g/4', d:'q.', id:'e3', ab:{t:'F. Pulso:', col:INK}}], w:1},
          {n:[{k:'g/4', d:'8',  id:'e4', ab:{t:'F. Subdivisión:', col:INK}}], w:1},
          {n:[{k:'g/4', d:'h.', id:'e5', ab:{t:'F. Compás:', col:INK}}], w:1}
        ], a:[
          {t:'txt', de:'e1', txt:'Binario', it:true, col:'acc', fw:800, fs:13, dy:39},
          {t:'txt', de:'e2', txt:'Ternaria', it:true, col:'acc', fw:800, fs:13, dy:39},
          {t:'txt', de:'e3', txt:'negra con\npuntillo', it:true, col:'acc', fw:800, fs:13, dy:29},
          {t:'txt', de:'e4', txt:'corchea', it:true, col:'acc', fw:800, fs:13, dy:29},
          {t:'txt', de:'e5', txt:'blanca con\npuntillo', it:true, col:'acc', fw:800, fs:13, dy:29}
        ], bot:78 }}
      ]
    }
  });
})();

/* ---- kit/escalas.js ---- */
/* Kit salvavidas 4GE · ESCALAS (menores p. 11 · mayores p. 12 · otras escalas pp. 13-14) */
(window.APX_TEMAS=window.APX_TEMAS||{});
(function(){
  /* sílaba que da la pista (en la página va en letra más grande): Na-da, Ár-abe, Me-nos triste, Do-mada */
  var ACC = function(t){ return '<span style="font-size:1.3em;font-style:normal;font-weight:900;color:#16203a">'+t+'</span>'; };

  /* escala de 8 redondas en dos «compases» de 4 separados por una barra invisible:
     en ordenador se ve en una sola línea; en el móvil se parte en dos sin salirse */
  function escala8(tit, txt, ks, notas){
    return {penta:{ tit:tit, txt:txt, ks:ks, c:[
      {n:notas.slice(0,4), fin:' '},
      {n:notas.slice(4), ini:' '}
    ]}};
  }
  /* nota alterada de las menores: color + flecha hacia arriba debajo (subimos semitono) */
  function sube(k){ return {k:k, d:'w', col:'acc', flecha:'arriba'}; }
  /* nota alterada de las mayores: color + «6↓» / «7↓» debajo (bajamos semitono) */
  function baja(k, g){ return {k:k, d:'w', col:'acc', ab:{t:g+'↓', col:'acc', fw:800, fs:14}}; }
  function W(k){ return {k:k, d:'w'}; }

  var PASOS = function(p2, p3){ return {pasos:[
    {n:'Paso 1', t:'<i>colocar cabecitas.</i>'},
    {n:'Paso 2', t:'<i>'+p2+'</i>'},
    {n:'Paso 3', t:'<i>'+p3+'</i>'}
  ]}; };
  var OJO = {ojo:'No olvidarse de comprobar la armadura (<i>mirar por el retrovisor</i>) antes de poner la nueva alteración.'};

  /* pentatónicas · tipo 1: 7 casillas con los grados debajo; las que faltan, vacías y con el número tachado */
  function grado(g){ return {t:String(g), fw:600, fs:14, col:'#16203a'}; }
  function falta(g, k){ return {k:k, d:'w', inv:true, ab:{t:String(g), tach:true, it:true, fw:800, fs:14, col:'acc'}}; }
  function penta1(tit, txt, ks, casillas){
    return {penta:{ tit:tit, txt:txt, ks:ks, c:[ {n:casillas} ] }};
  }
  /* tipos 2-5: la nota grave (entre paréntesis) se traslada una octava arriba → arco discontinuo con flecha */
  function tipoP(n, ks, keys, id){
    var ns = keys.map(function(k,i){ var o={k:k, d:'w'}; if(i===0){ o.par=true; o.id=id+'a'; } if(i===keys.length-1){ o.col='acc'; o.id=id+'b'; } return o; });
    return {penta:{ tit:'Tipo '+n, ks:ks, c:[ {n:ns} ],
      a:[ {t:'arco', de:id+'a', a:id+'b', dash:true, flecha:true, lado:'arriba', alto:30, col:'acc'} ] }};
  }

  /* cromática: 12 redondas (6 + 6, barra invisible en medio) con las «V» de semitono debajo */
  function cromatica(tit, txt, notas, id){
    var ns = notas.map(function(x,i){ var o = (typeof x==='string') ? {k:x, d:'w'} : Object.assign({d:'w'}, x); o.id=id+i; return o; });
    var a=[]; for(var i=0;i<ns.length-1;i++) a.push({t:'arco', forma:'v', de:id+i, a:id+(i+1), lado:'abajo', alto:7, dx1:5, dx2:-5});
    return {penta:{ tit:tit, txt:txt, c:[ {n:ns.slice(0,6), fin:' '}, {n:ns.slice(6), ini:' '} ], a:a, bot:44 }};
  }
  var N = function(k){ return {k:k, acc:'n'}; };   /* becuadro escrito (como en la página) */

  Object.assign(window.APX_TEMAS, {

    'esc-menores': {
      titulo:'Escalas menores', corto:'Escalas menores', fuente:'Kit salvavidas 4GE · Escalas menores (p. 11)',
      bloques:[
        {intro:'Hay 4 variantes de escalas menores.', introNota:'Ejemplo con Re m'},
        escala8('Natural', '('+ACC('Na')+'da)', 'F',
          [W('d/4'),W('e/4'),W('f/4'),W('g/4'),W('a/4'),W('bb/4'),W('c/5'),W('d/5')]),
        escala8('Armónica 7↑', '('+ACC('Ár')+'abe)', 'F',
          [W('d/4'),W('e/4'),W('f/4'),W('g/4'),W('a/4'),W('bb/4'),sube('c#/5'),W('d/5')]),
        escala8('Melódica 6↑ 7↑', '('+ACC('Me')+'nos triste)', 'F',
          [W('d/4'),W('e/4'),W('f/4'),W('g/4'),W('a/4'),sube('bn/4'),sube('c#/5'),W('d/5')]),
        escala8('Dórica 6↑', '('+ACC('Do')+'mada)', 'F',
          [W('d/4'),W('e/4'),W('f/4'),W('g/4'),W('a/4'),sube('bn/4'),W('c/5'),W('d/5')]),
        {h:'Mi recomendación para estos ejercicios'},
        PASOS('poner la armadura adecuada. Recuerda calcular el mayor y hacerle la pregunta...',
              'modificar las notas según la variante de escala (subiendo semitono).'),
        OJO
      ]
    },

    'esc-mayores': {
      titulo:'Escalas mayores', corto:'Escalas mayores', fuente:'Kit salvavidas 4GE · Escalas mayores (p. 12)',
      bloques:[
        {intro:'Hay 4 variantes de escalas mayores.', introNota:'Ejemplo con Re M'},
        escala8('Tipo 1', '(Natural)', 'D',
          [W('d/4'),W('e/4'),W('f#/4'),W('g/4'),W('a/4'),W('b/4'),W('c#/5'),W('d/5')]),
        escala8('Tipo 2 &nbsp;6↓', '(Armónica)', 'D',
          [W('d/4'),W('e/4'),W('f#/4'),W('g/4'),W('a/4'),baja('bb/4',6),W('c#/5'),W('d/5')]),
        escala8('Tipo 3 &nbsp;6↓ 7↓', '(Melódica)', 'D',
          [W('d/4'),W('e/4'),W('f#/4'),W('g/4'),W('a/4'),baja('bb/4',6),baja('cn/5',7),W('d/5')]),
        escala8('Tipo 4 &nbsp;7↓', '(Mixolidia)', 'D',
          [W('d/4'),W('e/4'),W('f#/4'),W('g/4'),W('a/4'),W('b/4'),baja('cn/5',7),W('d/5')]),
        {h:'Mi recomendación para estos ejercicios'},
        PASOS('poner la armadura adecuada. Recuerda el interrogatorio (¿amigo o enemigo?)...',
              'modificar las notas según la variante de escala (bajando semitono).'),
        OJO
      ]
    },

    'esc-otras': {
      titulo:'Otras escalas', corto:'Otras escalas', fuente:'Kit salvavidas 4GE · Otras escalas (pp. 13-14)',
      bloques:[
        /* ---- página 13: pentatónicas ---- */
        {intro:'Las pentatónicas tienen 5 sonidos: son escalas a las que les faltan dos grados.', introNota:'Ejemplos desde Re.'},
        penta1('Pentatónica Mayor <span style="font-weight:500;font-style:normal;color:#16203a">· Tipo 1</span>', '(Re M sin los grados 4 y 7)', 'D', [
          {k:'d/4', d:'w', ab:grado(1)}, {k:'e/4', d:'w', ab:grado(2)}, {k:'f#/4', d:'w', ab:grado(3)}, falta(4,'g/4'),
          {k:'a/4', d:'w', ab:grado(5)}, {k:'b/4', d:'w', ab:grado(6)}, falta(7,'c#/5')
        ]),
        {h:'Los tipos de la pentatónica (para que te suenen)'},
        {p:'La nota más grave se traslada una octava arriba y sale el siguiente tipo; así hasta 5.', i:true},
        {grid:[
          tipoP(2,'D',['d/4','e/4','f#/4','a/4','b/4','d/5'],'M2'),
          tipoP(3,'D',['e/4','f#/4','a/4','b/4','d/5','e/5'],'M3'),
          tipoP(4,'D',['f#/4','a/4','b/4','d/5','e/5','f#/5'],'M4'),
          tipoP(5,'D',['a/4','b/4','d/5','e/5','f#/5','a/5'],'M5')
        ]},
        {sep:true},
        penta1('Pentatónica menor <span style="font-weight:500;font-style:normal;color:#16203a">· Tipo 1</span>', '(Re m sin los grados 2 y 6)', 'F', [
          {k:'d/4', d:'w', ab:grado(1)}, falta(2,'e/4'), {k:'f/4', d:'w', ab:grado(3)}, {k:'g/4', d:'w', ab:grado(4)},
          {k:'a/4', d:'w', ab:grado(5)}, falta(6,'bb/4'), {k:'c/5', d:'w', ab:grado(7)}
        ]),
        {p:'Y sus tipos:', i:true},
        {grid:[
          tipoP(2,'F',['d/4','f/4','g/4','a/4','c/5','d/5'],'m2'),
          tipoP(3,'F',['f/4','g/4','a/4','c/5','d/5','f/5'],'m3'),
          tipoP(4,'F',['g/4','a/4','c/5','d/5','f/5','g/5'],'m4'),
          tipoP(5,'F',['a/4','c/5','d/5','f/5','g/5','a/5'],'m5')
        ]},

        /* ---- página 14: hexátona y cromática ---- */
        {sep:true},
        {intro:'En estas dos escalas todas las notas están a la misma distancia.', introNota:'Ejemplos desde Re.'},
        {penta:{ tit:'Hexátona', txt:'(6 sonidos: solo tonos, sin armadura)', c:[
          {n:[{k:'d/4',d:'w',id:'h0'},{k:'e/4',d:'w',id:'h1'},{k:'f#/4',d:'w',id:'h2'},{k:'g#/4',d:'w',id:'h3'},{k:'a#/4',d:'w',id:'h4'},{k:'c/5',d:'w',id:'h5'}]}
        ], a:[
          {t:'arco', de:'h0', a:'h1', lado:'abajo', alto:12, dx1:4, dx2:-4},
          {t:'arco', de:'h1', a:'h2', lado:'abajo', alto:12, dx1:4, dx2:-4},
          {t:'arco', de:'h2', a:'h3', lado:'abajo', alto:12, dx1:4, dx2:-4},
          {t:'arco', de:'h3', a:'h4', lado:'abajo', alto:12, dx1:4, dx2:-4},
          {t:'arco', de:'h4', a:'h5', lado:'abajo', alto:12, dx1:4, dx2:-4}
        ], bot:44 }},
        {h4:'Cromática', sub4:'<b><i>(12 sonidos: solo semitonos, sin armadura)</i></b>'},
        {p:'Además tiene 6 tipos dependiendo de si usamos sostenidos o bemoles.', i:true},
        cromatica('Tipo 1 · 5♯ 0♭', '(solo usando sostenidos)',
          ['d/4','d#/4','e/4','f/4','f#/4','g/4','g#/4','a/4','a#/4','b/4','c/5','c#/5'], 'c1'),
        cromatica('Tipo 2 · 4♯ 1♭', '',
          ['d/4','d#/4','e/4','f/4','f#/4','g/4','g#/4','a/4','bb/4',N('b/4'),'c/5','c#/5'], 'c2'),
        cromatica('Tipo 3 · 3♯ 2♭', '',
          ['d/4','eb/4',N('e/4'),'f/4','f#/4','g/4','g#/4','a/4','bb/4',N('b/4'),'c/5','c#/5'], 'c3'),
        cromatica('Tipo 4 · 2♯ 3♭', '',
          ['d/4','eb/4',N('e/4'),'f/4','f#/4','g/4','ab/4',N('a/4'),'bb/4',N('b/4'),'c/5','c#/5'], 'c4'),
        cromatica('Tipo 5 · 1♯ 4♭', '',
          ['d/4','eb/4',N('e/4'),'f/4','f#/4','g/4','ab/4',N('a/4'),'bb/4',N('b/4'),'c/5','db/5'], 'c5'),
        cromatica('Tipo 6 · 0♯ 5♭', '(solo usando bemoles)',
          ['d/4','eb/4',N('e/4'),'f/4','gb/4',N('g/4'),'ab/4',N('a/4'),'bb/4',N('b/4'),'c/5','db/5'], 'c6'),
        {p:'Fíjate que no se usa cualquier ♯ o ♭: siguen el orden (fa♯ do♯ sol♯... o si♭ mi♭ la♭...)', i:true},
        {p:'Los seis tipos suenan exactamente igual: solo cambia la forma de escribirlos.', i:true}
      ]
    }
  });
})();

/* ---- kit/grados-claves.js ---- */
/* Kit salvavidas 4GE · GRADOS, SEMITONOS, ACORDES, INVERSIÓN DE ACORDES, ENARMONÍAS y CLAVES (pp. 15–20)
   (26-sep-2026, Iago) Usa del motor: c.clef (cambio de clave), clef:'no', fin:'¦', <b> en etiquetas,
   y en las notas guia (tamaño de guía), plica:false y parG (paréntesis grande del acorde «ordenado»). */
(window.APX_TEMAS=window.APX_TEMAS||{});
Object.assign(window.APX_TEMAS, {

  'grados': {
    titulo:'Grados', corto:'Grados', fuente:'Kit salvavidas 4GE · Grados (p. 15)',
    bloques:[
      {intro:'Información previa necesaria'},
      {cols:[
        [{glosario:{ items:[['I','Tónica'],['II','Supertónica'],['III','Mediante o Modal'],['IV','Subdominante'],['V','Dominante'],['VI','Superdominante'],['VII','Subtónica (1t) o Sensible (1st)']] }}],
        [{glosario:{ items:[['Grados tonales:','<span class="apx-acc">I &nbsp; IV &nbsp; V</span>'],['Grados modales:','<span class="apx-acc">III &nbsp; VI &nbsp; VII</span>']] }}]
      ]},
      {h4:'Ejercicio resuelto 1. Te pregunto un grado de una escala.', sub4:'minipregunta favorita'},
      {penta:{ txt:'Subdominante de Fa M', ks:'F', c:[
        {n:[{k:'f/4', d:'w'},{k:'g/4', d:'w'},{k:'a/4', d:'w'},{k:'bb/4', d:'w', col:'acc', flecha:'arriba'}], fin:' '},
        {n:[{k:'c/5', d:'w'},{k:'d/5', d:'w'},{k:'e/5', d:'w'},{k:'f/5', d:'w'}], fin:'||', w:0.9},
        {n:[{k:'bb/4', d:'w', acc:'b', col:'acc'}], ab:'Respuesta: si♭', abCol:'acc', abIt:true, w:0.75}
      ] }},
      {pasos:[
        {n:'Paso 1', t:'<i>Cabecitas</i>'},
        {n:'Paso 2', t:'<i>Armadura</i>'},
        {n:'Paso 3', t:'<i>Indico la nota que me pide el ejercicio</i>'},
        {n:'Paso 4', t:'<i>Compruebo armadura y resuelvo</i>'}
      ]},
      {h4:'Ejercicio resuelto 2. Te pregunto el intervalo que hay entre dos grados.', sub4:'QIHE!'},
      {penta:{ txt:'¿Qué intervalo hay entre la modal y la dominante de Sim?', ks:'D', c:[
        {n:[{k:'b/3', d:'w'},{k:'c#/4', d:'w'},{k:'d/4', d:'w', col:'acc', flecha:'arriba'},{k:'e/4', d:'w'}], fin:' '},
        {n:[{k:'f#/4', d:'w', col:'acc', flecha:'arriba'},{k:'g/4', d:'w'},{k:'a/4', d:'w'},{k:'b/4', d:'w'}], fin:'||', w:0.9},
        {n:[{k:'d/4', d:'w', col:'acc'},{k:'f#/4', d:'w', acc:'#', col:'acc'}], ab:'Respuesta: 3M', abCol:'acc', abIt:true, w:0.75}
      ] }},
      {pasos:[
        {n:'Paso 1', t:'<i>Cabecitas</i>'},
        {n:'Paso 2', t:'<i>Armadura</i>'},
        {n:'Paso 3', t:'<i>Indico las notas que me pide el ejercicio</i>'},
        {n:'Paso 4', t:'<i>Compruebo armadura y escribo el intervalo</i>'},
        {n:'Paso 5', t:'<i>Resuelvo el intervalo</i>'}
      ]}
    ]
  },

  'semitonos': {
    titulo:'Semitono Cromático/Diatónico', corto:'Semitono cromático/diatónico', fuente:'Kit salvavidas 4GE · Semitono Cromático/Diatónico (p. 16)',
    bloques:[
      {intro:'<i>El semitono cromático se produce entre dos notas de igual nombre</i>'},
      {truco:'<i>Recuerda el truco <b style="font-size:1.3em">C</b>romático <b style="font-size:1.3em">C</b>opia</i>'},
      {penta:{ txt:'Ejemplos de semitonos cromáticos', c:[
        {n:[{k:'f/4', d:'w'},{k:'f#/4', d:'w'}], minW:150},
        {n:[{k:'a/4', d:'w'},{k:'ab/4', d:'w'}], minW:150},
        {n:[{k:'c/5', d:'w'},{k:'c#/5', d:'w'}], minW:150},
        {n:[{k:'db/5', d:'w'},{k:'d/5', d:'w', acc:'n'}], minW:150}
      ] }},
      {intro:'<i>El semitono diatónico se produce entre dos notas de distinto nombre</i>'},
      {truco:'<i>Recuerda el truco <b style="font-size:1.3em">D</b>iatónico <b style="font-size:1.3em">D</b>istinto</i>'},
      {penta:{ txt:'Ejemplos de semitonos diatónicos', c:[
        {n:[{k:'f/4', d:'w'},{k:'e/4', d:'w'}], minW:150},
        {n:[{k:'g/4', d:'w'},{k:'ab/4', d:'w'}], minW:150},
        {n:[{k:'eb/4', d:'w'},{k:'d/4', d:'w'}], minW:150},
        {n:[{k:'f#/4', d:'w'},{k:'g/4', d:'w'}], minW:150}
      ] }}
    ]
  },

  'acordes': {
    titulo:'Acordes', corto:'Acordes', fuente:'Kit salvavidas 4GE · Acordes (p. 17)',
    bloques:[
      {intro:'Los acordes son 2 o más sonidos que se producen al mismo tiempo.', introNota:'Ejemplos partiendo de la nota do.'},
      {nota:'Estos son los más relevantes; hay más, pero los veremos en cursos posteriores.'},
      {h:'Acordes de 3 sonidos (tríadas)'},
      {penta:{ c:[
        {ar:'PM (Perfecto Mayor)', arC:true, arFw:600, minW:190, n:[{k:['c/4','e/4','g/4'], d:'w', ab:{t:'5J\n3M\ntónica', it:true}}]},
        {ar:'Pm (Perfecto menor)', arC:true, arFw:600, minW:190, n:[{k:['c/4','eb/4','g/4'], d:'w', colK:[1], ab:{t:'5J\n3m\ntónica', it:true}}]},
        {ar:'Aumentado', arC:true, arFw:600, minW:190, n:[{k:['c/4','e/4','g#/4'], d:'w', colK:[2], ab:{t:'5A\n3M\ntónica', it:true}}]},
        {ar:'Disminuido', arC:true, arFw:600, minW:190, n:[{k:['c/4','eb/4','gb/4'], d:'w', colK:[1,2], ab:{t:'5D\n3m\ntónica', it:true}}]}
      ] }},
      {h:'Acordes de 4 sonidos (cuatríadas)'},
      {grid:[
        {penta:{ c:[
          {ar:'Séptima de dominante', arC:true, arFw:600, n:[{k:['c/4','e/4','g/4','bb/4'], d:'w', colK:[3], ab:{t:'7m\n5J\n3M\ntónica', it:true}}]}
        ] }},
        {html:''}
      ]}  /* 2 columnas (valor por defecto de grid) */
    ]
  },

  'inv-acordes': {
    titulo:'Inversión de acordes', corto:'Inversión de acordes', fuente:'Kit salvavidas 4GE · Inversión de acordes (p. 18)',
    bloques:[
      {penta:{ bot:84, c:[
        {n:[{k:['c/4','e/4','g/4'], d:'w', plica:'arriba'}], ab:'Estado Fundamental <b>(E.F.)</b>\nla nota del bajo es la fundamental del acorde', abIt:true, abFw:500, abY:24},
        {n:[{k:['e/4','g/4','c/5'], d:'w', plica:'arriba'},
            {k:['c/4','e/4','g/4'], d:'q', guia:true, plica:false, parG:true, ab:{t:'ordenado', it:true, fs:11, fw:500}}],
         ab:'1ª Inversión <b>(1ª inv.)</b>\nla nota del bajo es la tercera del acorde', abIt:true, abFw:500, abY:8},
        {n:[{k:['g/4','c/5','e/5'], d:'w', plica:'arriba'},
            {k:['c/4','e/4','g/4'], d:'q', guia:true, plica:false, parG:true}],
         ab:'2ª Inversión <b>(2ª inv.)</b>\nla nota del bajo es la quinta del acorde', abIt:true, abFw:500, abY:24}
      ] }},
      {ojo:'lo importante es la nota que aparece en el bajo; las otras dos pueden estar muy desordenadas.', lab:'Ojo', dentro:{penta:{ c:[
        {n:[{k:['c/4','g/4','e/5'], d:'w', plica:'arriba', colK:[0]}], ab:'<b>E.F.</b>: en el bajo está la fundamental', abIt:true, abFw:500, abY:10},
        {n:[{k:['e/4','c/5','g/5'], d:'w', plica:'arriba', colK:[0]}], ab:'<b>1ª inv.</b>: en el bajo está la tercera', abIt:true, abFw:500, abY:10}
      ] }}},
      {p:'En los acordes de cuatro sonidos hay una inversión más.', i:true},
      {penta:{ bot:84, c:[
        {n:[{k:['c/4','e/4','g/4','bb/4'], d:'w', plica:'arriba'}], ab:'<b>E.F.</b>\nen el bajo está la fundamental', abIt:true, abFw:500, abY:24},
        {n:[{k:['e/4','g/4','bb/4','c/5'], d:'w', plica:'arriba'},
            {k:['c/4','e/4','g/4','bb/4'], d:'q', guia:true, plica:false, parG:true, ab:{t:'ordenado', it:true, fs:11, fw:500}}],
         ab:'<b>1ª inv.</b>\nen el bajo está la tercera', abIt:true, abFw:500, abY:8},
        {n:[{k:['g/4','bb/4','c/5','e/5'], d:'w', plica:'arriba'},
            {k:['c/4','e/4','g/4','bb/4'], d:'q', guia:true, plica:false, parG:true}],
         ab:'<b>2ª inv.</b>\nen el bajo está la quinta', abIt:true, abFw:500, abY:24},
        {n:[{k:['bb/4','c/5','e/5','g/5'], d:'w', plica:'arriba'},
            {k:['c/4','e/4','g/4','bb/4'], d:'q', guia:true, plica:false, parG:true}],
         ab:'<b>3ª inv.</b>\nen el bajo está la séptima', abIt:true, abFw:500, abY:24}
      ] }},
      {truco:'Cuando veas un acorde desordenado, te recomiendo que lo ordenes primero (lo que te muestro entre paréntesis) para saber qué acorde es, y después sabrás con claridad qué nota está en el bajo.', lab:'Consejo'},
      {h:'Ejercicio tipo 1 · Identifica el acorde y su inversión'},
      {penta:{ top:70, bot:92, c:[
        {ar:'ejemplo', arC:true, arIt:true, arFw:500,
         n:[{k:['f#/4','a/4','d/5'], d:'w', plica:'arriba'}]},
        {ar:'Paso 1\nordena el acorde', arC:true, arIt:true, arFw:500, arY:36,
         n:[{k:['f#/4','a/4','d/5'], d:'w', plica:'arriba'},
            {k:['d/4','f#/4','a/4'], d:'q', guia:true, plica:false, parG:true, flecha:'abajo', ab:{t:'ordenado', it:true, fs:11, fw:500}}]},
        {ar:'Paso 2\nidentifica el ordenado', arC:true, arIt:true, arFw:500, arY:36,
         n:[{k:['f#/4','a/4','d/5'], d:'w', plica:'arriba'},
            {k:['d/4','f#/4','a/4'], d:'q', guia:true, plica:false, parG:true, ab:{t:'5J\n3M\ntónica\n<b>Re PM</b>', it:true, fw:500}}]},
        {ar:'Paso 3\n¿qué nota está en el bajo?', arC:true, arIt:true, arFw:500, arY:36,
         n:[{k:['f#/4','a/4','d/5'], d:'w', plica:'arriba', colK:[0], flecha:'arriba', ab:{t:'el fa♯: la tercera', it:true, fw:500, dy:12}},
            {k:['d/4','f#/4','a/4'], d:'q', guia:true, plica:false, parG:true}]},
        {ar:'Paso 4\nindica la inversión', arC:true, arIt:true, arFw:500, arY:36,
         n:[{k:['f#/4','a/4','d/5'], d:'w', plica:'arriba'},
            {k:['d/4','f#/4','a/4'], d:'q', guia:true, plica:false, parG:true}],
         ab:'Re PM · 1ª inv.', abCaja:true, abCol:'acc', abFw:800}
      ] }},
      {h:'Ejercicio tipo 2 · Construye el siguiente acorde', sub:'ejemplo: sol menor en 2ª inv.'},
      {penta:{ top:70, bot:78, c:[
        {ar:'Paso 1\nconstruyo sol m ordenado', arC:true, arIt:true, arFw:500, arY:36,
         n:[{k:'b/4', d:'w', inv:true},
            {k:['g/4','bb/4','d/5'], d:'q', guia:true, plica:false, parG:true, ab:{t:'5J\n3m\nsol', it:true, fw:500}}]},
        {ar:'Paso 2\nla 2ª inv. empieza en la 5ª: re', arC:true, arIt:true, arFw:500, arY:36,
         n:[{k:'d/4', d:'w', flecha:'arriba', ab:{t:'el bajo será el re (da igual octava)', it:true, fw:500, dy:14}}]},
        {ar:'Paso 3\ncompleto las notas que faltan', arC:true, arIt:true, arFw:500, arY:36, marco:true,
         n:[{k:['d/4','g/4','bb/4'], d:'w', plica:'arriba', colK:[1,2]}], ab:'añado el sol y el si♭', abIt:true, abFw:500, abY:12}
      ] }}
    ]
  },

  'enarmonias': {
    titulo:'Enarmonías', corto:'Enarmonías', fuente:'Kit salvavidas 4GE · Enarmonías (p. 19)',
    bloques:[
      {intro:'Las notas enarmónicas suenan igual y se llaman distinto.', introNota:'Cambia la grafía, no el sonido.'},
      {h:'Enarmonías de la nota', sub:'todas las notas tienen dos enarmónicos...*'},
      {penta:{ c:[
        /* cada grupo en un compás: la nota ¦ sus dos enarmónicos (así el grupo no se parte en el móvil) */
        {n:[{k:'f/5', d:'w', barraDer:'¦'},{k:'e#/5', d:'w'},{k:'gbb/5', d:'w'}], ab:'uno por abajo y otro por arriba', abIt:true, abFw:500},
        {n:[{k:'d#/5', d:'w', barraDer:'¦'},{k:'eb/5', d:'w'},{k:'fbb/5', d:'w'}], ab:'los dos por arriba', abIt:true, abFw:500},
        {n:[{k:'db/5', d:'w', barraDer:'¦'},{k:'c#/5', d:'w'},{k:'b##/4', d:'w'}], ab:'los dos por abajo', abIt:true, abFw:500}
      ] }},
      {p:'* ... excepto sol♯, que solo tiene a la♭ (y al revés):', i:true},
      {grid:[
        {penta:{ c:[
          {n:[{k:'g#/4', d:'w'},{k:'b/4', d:'w', inv:true, ar:{t:'=', fs:22, fw:800, dy:42, col:'#16203a'}},{k:'ab/4', d:'w'}]}
        ] }},
        {html:''}
      ]},  /* 2 columnas (valor por defecto de grid) */
      {h:'Enarmonía parcial', sub:'se cambia solo una nota por su enarmónico: suena igual, se escribe distinto'},
      {penta:{ c:[
        {n:[{k:['c/5','e#/5'], d:'w', colK:[1]}]},
        {n:[{k:['c/5','f/5'], d:'w', colK:[1]}], ab:'una nota se mantiene, la otra se enarmoniza', abIt:true, abFw:500}
      ] }},
      {h:'Enarmonía total', sub:'se enarmonizan las dos notas a la vez'},
      {penta:{ c:[
        {n:[{k:['c#/5','e#/5'], d:'w'}], ab:'con sostenidos: do♯–mi♯', abIt:true, abFw:500},
        {n:[{k:['db/5','f/5'], d:'w', colK:[0,1]}], ab:'total: con bemoles, re♭–fa', abIt:true, abFw:500}
      ] }},
      {h:'Tonalidades enarmónicas', sub:'dos tonalidades son enarmónicas cuando sus escalas suenan igual con distinto nombre y armadura'},
      {penta:{ c:[
        {ks:'F#', n:[{k:'b/4', d:'w', inv:true}], ab:'Fa♯ Mayor · 6 sostenidos', abIt:true, abFw:500, fin:' '},
        {n:[{k:'b/4', d:'w', inv:true, ar:{t:'=', fs:22, fw:800, dy:42, col:'#16203a'}}], fin:' ', w:0.35},
        {ks:'Gb', n:[{k:'b/4', d:'w', inv:true}], ab:'Sol♭ Mayor · 6 bemoles (suena exactamente igual)', abIt:true, abFw:500}
      ] }}
    ]
  },

  'claves': {
    titulo:'Claves', corto:'Claves', fuente:'Kit salvavidas 4GE · Claves (p. 20)',
    bloques:[
      {intro:'Existen 7 claves'},
      {penta:{ fin:'|', c:[
        {n:[{k:'c/4', d:'w', col:'acc'}]},
        {clef:'bass', n:[{k:'c/4', d:'w', col:'acc'}]},
        {clef:'baritone-f', n:[{k:'c/4', d:'w', col:'acc'}]},
        {clef:'tenor', n:[{k:'c/4', d:'w', col:'acc'}]},
        {clef:'alto', n:[{k:'c/4', d:'w', col:'acc'}]},
        {clef:'mezzo-soprano', n:[{k:'c/4', d:'w', col:'acc'}]},
        {clef:'soprano', n:[{k:'c/4', d:'w', col:'acc'}]}
      ] }},
      {p:'En todas he puesto exactamente el mismo sonido. Do central', i:true},
      {h4:'Ejercicio tipo 1. Pon el nombre a las siguientes notas:'},
      {penta:{ clef:'soprano', c:[
        {n:[{k:'e/4', d:'w'}]},
        {clef:'bass', n:[{k:'f#/3', d:'w'}]},
        {clef:'mezzo-soprano', n:[{k:'f/4', d:'w'}]},
        {clef:'treble', n:[{k:'bb/4', d:'w'}]},
        {clef:'alto', n:[{k:'c/4', d:'w'}]},
        {clef:'baritone-f', n:[{k:'g#/3', d:'w'}]},
        {clef:'tenor', n:[{k:'g/3', d:'w'}]}
      ] }},
      {h4:'Ejercicio tipo 2. Pon la clave adecuada para que las siguientes notas se llamen así:'},
      /* sin clave (la pone el alumno); cada nota se coloca con la clave que la resuelve (n.clef) */
      {penta:{ clef:'no', c:[
        {n:[{k:'a#/2', d:'w', clef:'bass', ab:{t:'La♯', it:true}}]},
        {n:[{k:'b/3', d:'w', clef:'soprano', ab:{t:'Si', it:true}}]},
        {n:[{k:'e/4', d:'w', clef:'alto', ab:{t:'Mi', it:true}}]},
        {n:[{k:'d#/3', d:'w', clef:'baritone-f', ab:{t:'Re♯', it:true}}]},
        {n:[{k:'a/4', d:'w', clef:'treble', ab:{t:'La', it:true}}]},
        {n:[{k:'a/3', d:'w', clef:'tenor', ab:{t:'La', it:true}}]},
        {n:[{k:'bb/3', d:'w', clef:'mezzo-soprano', ab:{t:'Si♭', it:true}}]}
      ] }},
      {p:'También te puedo preguntar que indiques cuál es la nota más aguda ↑ y la más grave ↓ de cada ejercicio.', i:true}
    ]
  }
});

/* ---- kit/terminos-cadencias.js ---- */
/* Kit salvavidas 4GE · TÉRMINOS, NOTAS DE ADORNO, ABREVIACIONES y CADENCIAS (pp. 21–29)
   (26-sep-2026, Iago) Re-creados para «VER APUNTES». Necesitan las ampliaciones del motor de a4/apuntes.js
   (adornos con alteraciones/debajo/en espejo, línea del trino, barra discontinua, trémolo entre dos notas,
   segunda voz, silencio de varios compases, signos de repetición, corchete de 8ª, glissando, ligaduras e iconos). */
(window.APX_TEMAS=window.APX_TEMAS||{});
(function(){
  /* ---------- utilidades para escribir menos ---------- */
  function ico(n){ return '<span class="apx-ico" data-ico="'+n+'"></span>'; }   /* signo musical dentro del texto */
  function M(o, ab){ if(ab!=null){ o.ab=ab; o.abIt=true; o.abFw=600; } return o; }   /* compás con etiqueta en cursiva debajo */
  function ALT(k1, k2, veces, d){ var r=[]; for(var i=0;i<veces;i++){ r.push({k:k1,d:d}); r.push({k:k2,d:d}); } return r; }   /* notas que se alternan */
  function GR(t){ return {t:t, fw:800, fs:17, col:'#16203a'}; }                    /* grado en números romanos */
  var PTS = {t:'txt', txt:'…', dx:17, dy:-19, fs:15, col:'#16203a'};                /* «…» detrás de la última nota */
  function pts(id){ var o={}; for(var k in PTS) o[k]=PTS[k]; o.de=id; return o; }

  Object.assign(window.APX_TEMAS, {

  /* =====================================================================
     TÉRMINOS (pp. 21–22)
     ===================================================================== */
  'terminos': {
    titulo:'Términos', corto:'Términos', fuente:'Kit salvavidas 4GE · Términos y Términos de movimiento (pp. 21–22)',
    bloques:[
      {intro:'Casi todos los términos musicales están escritos en italiano.', introNota:'Los de movimiento, en la página siguiente.'},
      {cols:[
        [ {glosario:{tit:'Dinámica', items:[
            ['Pianissimo (pp)','muy suave'],
            ['Piano (p)','suave'],
            ['Mezzopiano (mp)','medio suave'],
            ['Mezzoforte (mf)','medio fuerte'],
            ['Forte (f)','fuerte'],
            ['Fortissimo (ff)','muy fuerte'],
            ['Crescendo (cresc.)','aumentando poco a poco'],
            ['Diminuendo (dim.)','disminuyendo poco a poco'],
            ['Decrescendo (decresc.)','disminuyendo'],
            ['Subito piano (sub. p)','de repente suave'],
            ['Subito forte (sub. f)','de repente fuerte'],
            ['Calando','apagándose (sonido y tempo)'],
            ['Smorzando (smorz.)','apagándose poco a poco'],
            ['Morendo','disminución progresiva de volumen y velocidad'],
            ['Perdendosi','perdiéndose, apagándose'],
            ['Svanendo','desvaneciéndose']
          ]}} ],
        [ {glosario:{tit:'Acentuación', items:[
            ['Sforzando (sfz)','acento súbito muy marcado'],
            ['Sforzato (sf)','ataque fuerte y repentino seguido de una disminución rápida de la intensidad'],
            ['Rinforzando (rinf.)','reforzando un pasaje breve'],
            ['Fortepiano (fp)','fuerte y enseguida suave'],
            ['Marcato','marcado, destacando cada nota'],
            ['Accentato','con énfasis'],
            ['Legato marcato','ligado pero marcado']
          ]}},
          {glosario:{tit:'Articulación', items:[
            ['Legato','ligado, sin separación'],
            ['Staccato','picado: notas cortas y separadas'],
            ['Staccatissimo','picado extremo, muy corto'],
            ['Portato','entre ligado y picado'],
            ['Tenuto (ten.)','manteniendo la nota durante todo su valor'],
            ['Pizzicato (pizz.)','pellizcando la cuerda']
          ]}} ]
      ]},
      {glosario:{tit:'Carácter', items:[]}},
      {cols:[
        [ {glosario:{items:[
            ['Affettuoso','afectuoso'], ['Agitato','agitado'], ['Amabile','amable'], ['Amoroso','amoroso'], ['Animato','animado'],
            ['Appassionato','apasionado'], ['Brillante','brillante'], ['Cantabile','como cantando'], ['Capriccioso','caprichoso'],
            ['Con anima','con alma'], ['Con brio','con energía'], ['Con dolore','con dolor'], ['Con espressione','con expresión'],
            ['Con fuoco','con fuego'], ['Con grazia','con gracia'], ['Con malinconia','con melancolía'], ['Con tenerezza','con ternura']
          ]}} ],
        [ {glosario:{items:[
            ['Deciso','decidido'], ['Delicato','delicado'], ['Disperato','desesperado'], ['Dolce','dulce'], ['Dolente','doloroso'],
            ['Doloroso','doloroso'], ['Energico','enérgico'], ['Espressivo','expresivo'], ['Flebile','lloroso, débil'],
            ['Funebre','fúnebre'], ['Furioso','con furia'], ['Giocoso','juguetón'], ['Grandioso','grandioso'],
            ['Grazioso','gracioso'], ['Lamentoso','lastimero'], ['Leggiero','ligero'], ['Lusingando','acariciador']
          ]}} ],
        [ {glosario:{items:[
            ['Maestoso','majestuoso'], ['Marziale','marcial'], ['Mesto','triste'], ['Misterioso','misterioso'], ['Nobile','noble'],
            ['Pastorale','pastoril'], ['Patetico','patético'], ['Piacevole','placentero'], ['Pomposo','pomposo'],
            ['Risoluto','resuelto'], ['Scherzando','jugueteando'], ['Semplice','sencillo'], ['Spiritoso','con espíritu'],
            ['Teneramente','tiernamente'], ['Tranquillo','tranquilo'], ['Vigoroso','vigoroso']
          ]}} ]
      ]},
      {glosario:{tit:'Otros términos', items:[]}},
      {cols:[
        [ {glosario:{items:[
            ['Da capo (D.C.)','se repite desde el principio'],
            ['Dal segno (D.S.)','se repite desde el signo'],
            ['Fine','final'],
            ['Attacca','sigue sin pausa'],
            ['Come prima','como al principio']
          ]}} ],
        [ {glosario:{items:[
            ['Come sopra','como arriba'],
            ['Simile','se sigue igual'],
            ['Ad libitum (ad lib.)','a voluntad'],
            ['Con sordina','con la sordina puesta']
          ]}} ]
      ]},

      /* ---- p. 22: Términos de movimiento ---- */
      {h:'Términos de movimiento'},
      {intro:'Unos cambian el tempo en medio de la partitura; otros lo fijan al principio.', introNota:'La tabla va del más rápido al más lento.'},
      {glosario:{tit:'Cambios de tempo · aparecen en medio de la partitura', items:[
        ['Accelerando (accel.)','acelerando poco a poco'],
        ['Stringendo (string.)','acelerando con tensión'],
        ['Doppio movimento','el doble de rápido'],
        ['Ritardando (rit.)','retrasando poco a poco'],
        ['Rallentando (rall.)','frenando poco a poco'],
        ['Ritenuto (riten.)','retenido: más lento de inmediato'],
        ['Allargando (allarg.)','ensanchando: más lento y amplio'],
        ['Rubato','con libertad en el tempo'],
        ['A tempo','se recupera el tempo anterior']
      ]}},
      {glosario:{tit:'Modificadores · acompañan a otro término', items:[]}},
      {cols:[
        [ {glosario:{items:[
            ['Molto','mucho'], ['Assai','bastante, muy'], ['Più','más'], ['Ancor più','aún más'], ['Sempre più','cada vez más'],
            ['Meno','menos'], ['Poco','poco'], ['Poco a poco','gradualmente'], ['Non troppo','no demasiado']
          ]}} ],
        [ {glosario:{items:[
            ['Non tanto','no tanto'], ['Quasi','casi, como'], ['Subito','de repente'], ['Sempre','siempre'], ['Senza','sin'],
            ['Giusto','justo, preciso'], ['Con moto','con movimiento'], ['Mosso','movido'], ['Sostenuto','contenido']
          ]}} ]
      ]},
      {nota:'Ej.: Allegro ma non troppo = rápido, pero sin pasarse.'},
      {glosario:{tit:'Tabla de tempos · se indican al principio de la partitura', items:[]}},
      {tabla:{ alin:['left','left','right'], cab:['<i>más rápido ↑</i>','','<i>pulsos por minuto</i>'], filas:[
        ['Prestissimo','máxima velocidad','&gt;208'],
        ['<b>Presto</b>','muy rápido, apresurado',''],
        ['Vivacissimo','más veloz que Vivace',''],
        ['<b>Vivace</b>','muy animado','<b>168–208</b>'],
        ['<b>Allegro</b>','rápido y animado','<b>120–168</b>'],
        ['Allegretto','menos animado que Allegro',''],
        ['<b>Moderato*</b>','con moderación','<b>108–120</b>'],
        ['Andantino','un poco menos lento que Andante',''],
        ['<b>Andante</b>','a paso tranquilo','<b>76–108</b>'],
        ['Adagietto','menos despacio que Adagio',''],
        ['<b>Adagio</b>','lento y tranquilo','<b>66–76</b>'],
        ['<b>Lento</b>','lento','<b>60–66</b>'],
        ['Larghetto','un poco menos lento que Largo',''],
        ['<b>Largo</b>','despacio, amplio','<b>40–60</b>'],
        ['Larghissimo','muy despacio','&lt;40'],
        ['Grave','muy lento y solemne','&lt;40'],
        ['<i>más lento ↓</i>','','']
      ], resalta:[[6,0],[6,1],[6,2]] }},
      {p:'* Moderato es la referencia neutra. Los diminutivos (-etto, -ino) acercan el tempo a Moderato: Allegretto es algo menos rápido que Allegro y Larghetto algo menos lento que Largo. Los superlativos (-issimo) hacen lo contrario: Prestissimo es más rápido que Presto y Larghissimo más lento que Largo.', i:true, peq:true}
    ]
  },

  /* =====================================================================
     NOTAS DE ADORNO (pp. 23–26)
     ===================================================================== */
  'adorno': {
    titulo:'Notas de adorno', corto:'Notas de adorno', fuente:'Kit salvavidas 4GE · Notas de adorno (pp. 23–26)',
    bloques:[
      /* p. 23 (arriba, antes del título): repaso */
      {truco:'el floreo y la nota de paso también adornan, pero se escriben con figuras con valor propio: es lo que las diferencia de las demás', lab:'Antes de nada, repasa',
        dentro:{penta:{ c:[
          M({n:[{k:'g/4',d:'8'},{k:'f#/4',d:'8',col:'acc',flecha:'arriba'},{k:'g/4',d:'8'}], bm:[[0,2]], abY:14}, 'floreo: nota vecina que va y vuelve'),
          M({n:[{k:'e/4',d:'8'},{k:'f/4',d:'8',col:'acc',flecha:'arriba'},{k:'g/4',d:'8'}], bm:[[0,2]], abY:14}, 'nota de paso: une dos notas por grados conjuntos')
        ], bot:60 }}},

      {intro:'Son notas sin valor propio que se intercalan para embellecer y enriquecer la melodía.', introNota:'Apoyatura, trino, mordente y grupeto.'},
      {ojo:'La forma de tocarlas ha ido cambiando a lo largo de la historia y según el estilo de cada compositor. Investiga la época de tu obra, mira las anotaciones del autor al principio de la partitura y consulta con tu profe de instrumento la ejecución más adecuada.'},

      /* ---------- Apoyatura ---------- */
      {h:'Apoyatura', sub:'notita que se apoya en la nota real y le roba parte de su valor; puede venir de arriba (superior) o de abajo (inferior)'},
      {h4:'Interpretación barroca (clásica)'},
      {penta:{ c:[
        M({n:[{k:'e/4',d:'q',gr:[{k:'f/4',d:'8'}]}], centrar:true, abY:14}, 'escritura'),
        M({n:[{k:'f/4',d:'8',art:'>',id:'ab1'},{k:'e/4',d:'8',id:'ab2'}], bm:[[0,1]], w:1.2, abY:14}, 'ejecución real\n(valor binario: toma la mitad)'),
        M({n:[{k:'e/4',d:'q.',gr:[{k:'f/4',d:'8'}]}], centrar:true, abY:14}, 'escritura'),
        M({n:[{k:'f/4',d:'q',art:'>',id:'ab3'},{k:'e/4',d:'8',id:'ab4'}], w:1.2, abY:14}, 'ejecución real\n(valor ternario: toma dos tercios)')
      ], a:[{t:'liga',de:'ab1',a:'ab2'},{t:'liga',de:'ab3',a:'ab4'}] }},
      {h4:'Interpretación moderna (desde el final del Barroco)'},
      {penta:{ c:[
        M({n:[{k:'e/4',d:'q',gr:[{k:'f/4',d:'16'}]}], centrar:true, abY:14}, 'escritura'),
        M({n:[{k:'f/4',d:'16',art:'>',id:'am1'},{k:'e/4',d:'8.',id:'am2'}], bm:[[0,1]], w:1.2, abY:14}, 'ejecución real\n(vale su figura)'),
        M({n:[{k:'e/4',d:'h',gr:[{k:'f/4',d:'8'}]}], centrar:true, abY:14}, 'escritura'),
        M({n:[{k:'f/4',d:'8',art:'>',id:'am3'},{k:'e/4',d:'q.',id:'am4'}], w:1.2, abY:14}, 'ejecución real\n(suma = valor original)')
      ], a:[{t:'liga',de:'am1',a:'am2'},{t:'liga',de:'am3',a:'am4'}] }},

      /* ---------- Trino (p. 24) ---------- */
      {h:'Trino '+ico('tr')+ico('tr~')+ico('~'), sub:'repetición rápida y alternada de la nota real con su auxiliar superior'},
      {penta:{ c:[
        {n:[{k:'g/4',d:'w',orn:{t:'tr',onda:44}}]},
        M({n:ALT('g/4','a/4',3,'32').map(function(q,i){ if(i===5) q.id='tr1'; return q; }), bm:[[0,5]]}, 'ejecución real')
      ], a:[pts('tr1')] }},
      {penta:{ txt:'si lleva un mordente delante, se comienza por la nota auxiliar', c:[
        {n:[{k:'g/4',d:'w',orn:'tr',gr:[{k:'a/4',d:'8',slash:true}]}], centrar:true},
        M({n:ALT('a/4','g/4',3,'32').map(function(q,i){ if(i===5) q.id='tr2'; return q; }), bm:[[0,5]]}, 'ejecución real')
      ], a:[pts('tr2')] }},
      {penta:{ txt:'la alteración se aplica a la nota auxiliar (puede ir encima, debajo o junto al signo)', c:[
        {n:[{k:'g/4',d:'w',orn:{t:'tr',arriba:'b'}}]},
        M({n:ALT('g/4','ab/4',3,'32').map(function(q,i){ if(i>1 && q.k==='ab/4') q.acc=false; if(i===1) q.col='acc'; if(i===5) q.id='tr3'; return q; }), bm:[[0,5]]}, 'ejecución real')
      ], a:[pts('tr3')] }},
      {p:'En el Barroco el trino empezaba por la auxiliar superior; desde el Romanticismo, por la nota real, y el caso contrario se indica con un mordente delante (el ejemplo de arriba).', i:true},

      {h4:'Preparación y resolución '+ico('upmordent')+ico('downprall')+ico('prallup'), sub4:'si la nota dura lo suficiente, el trino puede arrancar con un giro y terminar con otro'},
      {penta:{ txt:'con preparación (giro de entrada)', c:[
        {n:[{k:'g/4',d:'h',orn:'upmordent'}], centrar:true},
        M({n:[{k:'f/4',d:'32',col:'acc'},{k:'g/4',d:'32'},{k:'a/4',d:'32'},{k:'g/4',d:'32'},{k:'a/4',d:'32'},{k:'g/4',d:'32',id:'tp1'}], bm:[[0,5]]}, 'ejecución real')
      ], a:[pts('tp1')] }},
      {penta:{ txt:'con resolución (giro de salida)', c:[
        {n:[{k:'g/4',d:'h',orn:'prallup'}], centrar:true},
        M({n:[{k:'g/4',d:'32'},{k:'a/4',d:'32'},{k:'g/4',d:'32'},{k:'a/4',d:'32'},{k:'g/4',d:'32'},{k:'f/4',d:'32',col:'acc'},{k:'g/4',d:'32',col:'acc'}], bm:[[0,6]]}, 'ejecución real')
      ] }},

      /* ---------- Mordente (p. 25) ---------- */
      {h:'Mordente '+ico('acciaccatura')},
      {h4:'Mordente de una nota', sub4:'una sola notita con una rayita que la cruza; se ejecuta lo más rápido posible'},
      {penta:{ c:[
        M({n:[{k:'f/4',d:'q',gr:[{k:'g/4',d:'8',slash:true}]}], centrar:true, abY:14}, 'superior'),
        M({n:[{k:'g/4',d:'32',art:'>'},{k:'f/4',d:'32',id:'mo1'},{k:'f/4',d:'8.',id:'mo2'}], bm:[[0,2]], w:1.3, abY:14}, 'ejecución real\n(Barroco: sobre el tiempo)'),
        M({n:[{k:'g/4',d:'32'}], w:1.1, abY:14}, 'ejecución real\n(hoy: por anticipación)'),
        {n:[{k:'f/4',d:'q',art:'>'}], w:0.6}
      ], a:[{t:'liga',de:'mo1',a:'mo2'}] }},
      {p:'Por anticipación, la notita suena antes del compás; hoy es la ejecución más utilizada.', i:true},

      {h4:'Mordente de dos notas '+ico('semis')+ico('mordente'), sub4:'dos notitas que se deslizan hacia la nota real: por terceras, por grados conjuntos o con la real entre ambas'},
      {penta:{ txt:'superior (ascendente)', c:[
        {n:[{k:'g/4',d:'q',gr:[{k:'g/4',d:'16'},{k:'a/4',d:'16'}]}], fin:'¦', ar:'escritura (y abreviatura)', arY:40},
        {n:[{k:'g/4',d:'q',orn:{t:'mordent',pos:'abajo'}}], w:0.7},
        {n:[{k:'g/4',d:'32',art:'>'},{k:'a/4',d:'32'},{k:'g/4',d:'8.'}], bm:[[0,2]], w:1.3, ar:'ejecución real clásica', arY:40},
        {n:[{k:'g/4',d:'32'},{k:'a/4',d:'32'}], bm:[[0,1]], w:0.8, ar:'ejecución real por anticipación', arY:40},
        {n:[{k:'g/4',d:'q',art:'>'}], w:0.6}
      ], top:74, bot:52 }},
      {penta:{ txt:'inferior (descendente)', c:[
        {n:[{k:'g/4',d:'q',gr:[{k:'g/4',d:'16'},{k:'f/4',d:'16'}]}], fin:'¦'},
        {n:[{k:'g/4',d:'q',orn:{t:'mordent_inverted',pos:'abajo'}}], w:0.7},
        {n:[{k:'g/4',d:'32',art:'>'},{k:'f/4',d:'32'},{k:'g/4',d:'8.'}], bm:[[0,2]], w:1.3},
        {n:[{k:'g/4',d:'32'},{k:'f/4',d:'32'}], bm:[[0,1]], w:0.8},
        {n:[{k:'g/4',d:'q',art:'>'}], w:0.6}
      ], bot:52 }},
      {penta:{ txt:'recto (ascendente)', c:[
        {n:[{k:'g/4',d:'q',gr:[{k:'e/4',d:'16'},{k:'f/4',d:'16'}]}], w:1.7},
        {n:[{k:'e/4',d:'32',art:'>'},{k:'f/4',d:'32'},{k:'g/4',d:'8.'}], bm:[[0,2]], w:1.3},
        {n:[{k:'e/4',d:'32'},{k:'f/4',d:'32'}], bm:[[0,1]], w:0.8},
        {n:[{k:'g/4',d:'q',art:'>'}], w:0.6}
      ], bot:40 }},
      {penta:{ txt:'recto (descendente)', c:[
        {n:[{k:'g/4',d:'q',gr:[{k:'b/4',d:'16'},{k:'a/4',d:'16'}]}], w:1.7},
        {n:[{k:'b/4',d:'32',art:'>'},{k:'a/4',d:'32'},{k:'g/4',d:'8.'}], bm:[[0,2]], w:1.3},
        {n:[{k:'b/4',d:'32'},{k:'a/4',d:'32'}], bm:[[0,1]], w:0.8},
        {n:[{k:'g/4',d:'q',art:'>'}], w:0.6}
      ], bot:40 }},
      {penta:{ txt:'mixto (ascendente)', c:[
        {n:[{k:'b/4',d:'q',gr:[{k:'a/4',d:'16'},{k:'c/5',d:'16'}]}], w:1.7},
        {n:[{k:'a/4',d:'32',art:'>'},{k:'c/5',d:'32'},{k:'b/4',d:'8.'}], bm:[[0,2]], w:1.3},
        {n:[{k:'a/4',d:'32'},{k:'c/5',d:'32'}], bm:[[0,1]], w:0.8},
        {n:[{k:'b/4',d:'q',art:'>'}], w:0.6}
      ], bot:52 }},
      {penta:{ txt:'mixto (descendente)', c:[
        {n:[{k:'b/4',d:'q',gr:[{k:'c/5',d:'16'},{k:'a/4',d:'16'}]}], w:1.7},
        {n:[{k:'c/5',d:'32',art:'>'},{k:'a/4',d:'32'},{k:'b/4',d:'8.'}], bm:[[0,2]], w:1.3},
        {n:[{k:'c/5',d:'32'},{k:'a/4',d:'32'}], bm:[[0,1]], w:0.8},
        {n:[{k:'b/4',d:'q',art:'>'}], w:0.6}
      ], bot:52 }},
      {p:'Por anticipación, las notitas suenan antes del compás; hoy es la ejecución más utilizada.', i:true},

      {h4:'Mordente con alteraciones '+ico('prall-b')+ico('mordente-s'), sub4:'la alteración afecta a la nota auxiliar: encima del signo para la superior, debajo para la inferior'},
      {penta:{ c:[
        M({n:[{k:'g/4',d:'q',orn:{t:'mordent',arriba:'b'}}], centrar:true}, 'escritura'),
        M({n:[{k:'g/4',d:'32',art:'>'},{k:'ab/4',d:'32',col:'acc'},{k:'g/4',d:'8.'}], bm:[[0,2]]}, 'ejecución real'),
        M({n:[{k:'g/4',d:'q',orn:{t:'mordent_inverted',abajo:'#'}}], centrar:true}, 'escritura'),
        M({n:[{k:'g/4',d:'32',art:'>'},{k:'f#/4',d:'32',col:'acc'},{k:'g/4',d:'8.'}], bm:[[0,2]]}, 'ejecución real')
      ], top:70 }},

      /* ---------- Grupeto (p. 26) ---------- */
      {h:'Grupeto '+ico('grupeto')+ico('grupeto-inv'), sub:'rodea la nota real con sus auxiliares; puede ser descendente o ascendente, de tres o de cuatro notas'},
      {penta:{ txt:'descendente', c:[
        {n:[{k:'g/4',d:'q',orn:'turn'}], centrar:true},
        M({n:[{k:'a/4',d:'16'},{k:'g/4',d:'16'},{k:'f/4',d:'16'},{k:'g/4',d:'16'}], bm:[[0,3]]}, 'ejecución real')
      ] }},
      {penta:{ txt:'ascendente', c:[
        {n:[{k:'g/4',d:'q',orn:{t:'turn',espejo:true}}], centrar:true},
        M({n:[{k:'f/4',d:'16'},{k:'g/4',d:'16'},{k:'a/4',d:'16'},{k:'g/4',d:'16'}], bm:[[0,3]]}, 'ejecución real')
      ] }},
      {penta:{ txt:'entre dos notas (de cuatro notas)', c:[
        {n:[{k:'g/4',d:'q',orn:{t:'turn',diferido:true}},{k:'e/4',d:'q'}], centrar:true},
        M({n:[{k:'g/4',d:'8'},{k:'a/4',d:'16'},{k:'g/4',d:'16'},{k:'f/4',d:'16'},{k:'e/4',d:'q'}], bm:[[0,3]], tup:[{de:1,a:3,num:3,ocupa:2}]}, 'ejecución real: se ejecuta entre las dos')
      ] }},
      {p:'Alteraciones del grupeto: encima del signo afectan a la auxiliar superior; debajo, a la inferior.', i:true},
      {p:'Hacia el Romanticismo se escribe con notitas y su ejecución se anticipa.', i:true},

      /* ---------- Otros adornos ---------- */
      {h:'Otros adornos', sub:'sobre todo en la música francesa del Barroco; cada país y cada época tenían los suyos'},
      {penta:{ txt:'tierce coulé: la 3ª se toca arpegiada', c:[
        {n:[{k:['e/4','g/4'],d:'q'},{k:'f/4',d:'q',peq:0.8,par:true,sinPlica:true,pegar:24}], centrar:true},
        M({n:[{k:'e/4',d:'32',art:'>'},{k:'f/4',d:'32',col:'acc'},{k:'g/4',d:'8.'}], v2:[{k:'e/4',d:'q'}], bm:[[0,2]]}, 'ejecución real\n(mi y sol se mantienen; el fa pasa)')
      ], bot:66 }},
      {penta:{ txt:'port de voix: apoyatura desde abajo', c:[
        {n:[{k:'f/4',d:'q',gr:[{k:'e/4',d:'8'}]}], centrar:true},
        M({n:[{k:'e/4',d:'8',art:'>',id:'pv1'},{k:'f/4',d:'8',id:'pv2'}], bm:[[0,1]], abY:14}, 'ejecución real')
      ], a:[{t:'liga',de:'pv1',a:'pv2'}] }}
    ]
  },

  /* =====================================================================
     ABREVIACIONES (pp. 27–28)
     ===================================================================== */
  'abrev': {
    titulo:'Abreviaciones', corto:'Abreviaciones', fuente:'Kit salvavidas 4GE · Abreviaciones (pp. 27–28)',
    bloques:[
      {intro:'Son signos que se emplean para simplificar la escritura musical.', introNota:'Repeticiones, silencios largos, octavas y glissando.'},

      {h:'Puntos sobre la nota', sub:'la nota se divide en tantas figuras iguales como puntos'},
      {penta:{ c:[
        M({n:[{k:'g/4',d:'w',id:'pu1'}]}, 'abreviatura'),
        M({n:[{k:'g/4',d:'h'},{k:'g/4',d:'h'}], centrar:true}, 'equivale a'),
        M({n:[{k:'g/4',d:'h',id:'pu2'}], centrar:true}, 'abreviatura'),
        M({n:[{k:'g/4',d:'q'},{k:'g/4',d:'q'}], centrar:true}, 'equivale a')
      ], a:[{t:'txt', de:'pu1', lado:'arriba', txt:'• •', fs:12, fw:900, col:'#000', dy:1},
            {t:'txt', de:'pu2', lado:'arriba', txt:'• •', fs:12, fw:900, col:'#000', dx:5, dy:-26}] }},

      {h:'Barras en la plica', sub:'1 barra = corcheas, 2 = semicorcheas, 3 = fusas; si la figura tiene corchete, este se suma a las barras'},
      {penta:{ c:[
        M({n:[{k:'g/4',d:'h',trem:2}], centrar:true}, 'abreviatura'),
        M({n:[{k:'g/4',d:'16'},{k:'g/4',d:'16'},{k:'g/4',d:'16'},{k:'g/4',d:'16'}], bm:[[0,3]]}, 'equivale a'),
        M({n:[{k:'g/4',d:'8',trem:1}], centrar:true}, 'abreviatura (corchete + barra)'),
        M({n:[{k:'g/4',d:'16'},{k:'g/4',d:'16'}], bm:[[0,1]], centrar:true}, 'equivale a')
      ] }},

      {h:'La cifra: grupos especiales', sub:'la cifra sobre la figura indica el grupo irregular en que se divide'},
      {penta:{ c:[
        M({n:[{k:'g/4',d:'q',trem:1}], centrar:true, tup:[{de:0,a:0,num:3,ocupa:2,corchete:false}]}, 'abreviatura'),
        M({n:[{k:'g/4',d:'8'},{k:'g/4',d:'8'},{k:'g/4',d:'8'}], bm:[[0,2]], tup:[{de:0,a:2,num:3,ocupa:2}]}, 'equivale a'),
        M({n:[{k:'g/4',d:'q',trem:2}], centrar:true, tup:[{de:0,a:0,num:6,ocupa:4,corchete:false}]}, 'abreviatura'),
        M({n:[{k:'g/4',d:'16'},{k:'g/4',d:'16'},{k:'g/4',d:'16'},{k:'g/4',d:'16'},{k:'g/4',d:'16'},{k:'g/4',d:'16'}], bm:[[0,5]], tup:[{de:0,a:5,num:6,ocupa:4}]}, 'equivale a')
      ], top:54 }},

      {h:'Barras entre dos notas', sub:'las dos notas se alternan; cada una se escribe con el valor total del grupo'},
      {penta:{ c:[
        M({n:[{k:'e/4',d:'h'},{k:'g/4',d:'h'}], centrar:true, tremEntre:[{de:0,a:1,n:2}]}, 'abreviatura'),
        M({n:ALT('e/4','g/4',4,'16'), bm:[[0,7]], w:1.3}, 'equivale a')
      ] }},

      {h:'Trémolo', sub:'con tres barras: repetición rapidísima donde importa el efecto, no el número exacto de notas'},
      {penta:{ c:[
        M({n:[{k:'g/4',d:'w',trem:3}]}, 'una nota'),
        M({n:[{k:'g/4',d:'32'},{k:'g/4',d:'32'},{k:'g/4',d:'32'},{k:'g/4',d:'32',id:'tm1'}], bm:[[0,3]]}, 'lo más rápido posible'),
        M({n:[{k:'e/4',d:'h'},{k:'g/4',d:'h'}], centrar:true, tremEntre:[{de:0,a:1,n:3}]}, 'entre dos notas (mi–sol)'),
        M({n:[{k:'e/4',d:'32'},{k:'g/4',d:'32'},{k:'e/4',d:'32'},{k:'g/4',d:'32',id:'tm2'}], bm:[[0,3]]}, 'lo más rápido posible')
      ], a:[pts('tm1'), pts('tm2')] }},

      /* ---- p. 28 ---- */
      {h:'Compás o parte iguales al anterior', sub:'signos de repetición de fragmentos'},
      {penta:{ c:[
        M({n:[{k:'g/4',d:'8'},{k:'a/4',d:'8'},{k:'b/4',d:'q'}], bm:[[0,1]]}, 'un compás'),
        M({n:[{k:'b/4',d:'w',rep:'1'}], centrar:false}, '% : compás igual al anterior'),
        M({n:[{k:'g/4',d:'8'},{k:'a/4',d:'8'},{k:'b/4',d:'q',rep:'slash'}], bm:[[0,1]]}, '/ : la parte se repite'),
        M({n:[{k:'g/4',d:'8'},{k:'a/4',d:'8'},{k:'g/4',d:'8'},{k:'a/4',d:'8'}], bm:[[0,1],[2,3]]}, 'equivale a')
      ] }},
      {p:'Con un 2 encima de la barra de compás, se repiten los dos compases anteriores.', i:true},

      {h:'Solo plicas: se repite lo último', sub:'las plicas y corchetes solos repiten la última nota o acorde con ese ritmo'},
      {penta:{ c:[
        M({n:[{k:['g/4','b/4'],d:'q'},{k:'b/4',d:'8',sinCabeza:true,plica:'arriba'},{k:'b/4',d:'8',sinCabeza:true,plica:'arriba'}], bm:[[1,2]]}, 'abreviatura'),
        M({n:[{k:['g/4','b/4'],d:'q'},{k:['g/4','b/4'],d:'8'},{k:['g/4','b/4'],d:'8'}], bm:[[1,2]]}, 'equivale a')
      ], top:52 }},

      {h:'Compases en silencio', sub:'un compás entero calla con un silencio de redonda, valga lo que valga el compás'},
      {penta:{ c:[
        M({n:[{k:'g/4',d:'8'},{k:'a/4',d:'8'},{k:'b/4',d:'q'}], bm:[[0,1]]}, 'un compás'),
        M({n:[{k:'d/5',d:'wr'}]}, 'un compás en silencio'),
        M({n:[], multi:6, minW:220, w:2}, '6 compases seguidos en silencio')
      ], top:56 }},
      {p:'Si por el camino cambia el compás, la armadura o el tempo, la cifra se parte y se indica.', i:true},

      {h:'Octava alta y octava baja', sub:'la música suena una octava más aguda (8ª alta) o más grave (8ª bassa) hasta «loco»'},
      {penta:{ c:[
        M({n:[{k:'c/5',d:'q',id:'oa1'},{k:'d/5',d:'q',id:'oa2'}], centrar:true, abY:30}, 'con 8ª alta'),
        M({n:[{k:'c/6',d:'q'},{k:'d/6',d:'q'}], centrar:true, abY:30}, 'ejecución real'),
        M({n:[{k:'e/4',d:'q',id:'ob1'},{k:'f/4',d:'q',id:'ob2'}], centrar:true, abY:30}, 'con 8ª bassa'),
        M({n:[{k:'e/3',d:'q'},{k:'f/3',d:'q'}], centrar:true, abY:30}, 'ejecución real')
      ], a:[{t:'8va', de:'oa1', a:'oa2', lado:'arriba'},{t:'8va', de:'ob1', a:'ob2', lado:'abajo'}], top:62, bot:78 }},
      {p:'«Loco» significa «en su lugar»: se vuelve a tocar lo escrito. «Simile»: se sigue igual.', i:true},

      {h:'Glissando y portamento', sub:'pasar de un sonido a otro recorriendo los sonidos intermedios'},
      {penta:{ c:[
        M({n:[{k:'e/4',d:'q',id:'gl1'},{k:'e/5',d:'q',id:'gl2'}], centrar:true}, 'glissando: se tocan todas las notas intermedias'),
        M({n:[{k:'e/4',d:'q',id:'po1'},{k:'e/5',d:'q',id:'po2'}], centrar:true}, 'portamento: continuo, como una sirena de ambulancia')
      ], a:[{t:'gliss', de:'gl1', a:'gl2'},{t:'gliss', de:'po1', a:'po2', onda:false}] }},
      {p:'Por poner algunos ejemplos: el glissando es típico del teclado y del arpa; el portamento, de la voz y de la cuerda.', i:true},
      {p:'En la práctica, los dos términos se usan casi indistintamente.', i:true}
    ]
  },

  /* =====================================================================
     CADENCIAS (introducción) (p. 29) — en Sol mayor, a 4 voces
     ===================================================================== */
  'cadencias': {
    titulo:'Cadencias <small>(introducción)</small>', corto:'Cadencias', fuente:'Kit salvavidas 4GE · Cadencias (introducción) (p. 29)',
    bloques:[
      {intro:'La cadencia es el momento en que la música se detiene a respirar. Funciona como la puntuación cuando escribimos: unas frases se cierran del todo, como con un punto, y otras se quedan esperando, como con una coma.', introNota:'Auténtica, plagal, semicadencia y rota.'},
      {p:'<u>Fíjate siempre en el bajo</u> —la voz más grave— y en el acorde con el que acaba la música: son ellos los que mandan. Aquí las tienes en <b>Sol mayor</b>.', i:true},

      {grid:[
        {h:'Cadencia auténtica (V – I)', sub:'Va de la dominante (V) a la tónica (I). Es la que suena más terminada de todas: como el punto final de una frase. Al escucharla, notas que la música ya ha acabado.', penta:{ clef:'treble', clef2:'bass', ks:'G', centrar:true, c:[
          {n:[{k:['d/4','f#/4'], d:'w'}], n2:[{k:['d/3','a/3'], d:'w', ab:GR('V')}]},
          {n:[{k:['d/4','g/4'], d:'w'}], n2:[{k:['g/3','b/3'], d:'w', ab:GR('I')}]}
        ]}},
        {h:'Cadencia plagal (IV – I)', sub:'Va de la subdominante (IV) a la tónica (I). También termina la música, pero de una manera más tranquila y relajada: es un cierre conclusivo suave.', penta:{ clef:'treble', clef2:'bass', ks:'G', centrar:true, c:[
          {n:[{k:['e/4','g/4'], d:'w'}], n2:[{k:['c/3','c/4'], d:'w', ab:GR('IV')}]},
          {n:[{k:['d/4','g/4'], d:'w'}], n2:[{k:['g/3','b/3'], d:'w', ab:GR('I')}]}
        ]}},
        {h:'Semicadencia (… – V)', sub:'La música se detiene en la dominante (V), pero no llega a la tónica: se queda a medias, como una coma que deja la frase en el aire. No apetece aplaudir todavía.', penta:{ clef:'treble', clef2:'bass', ks:'G', centrar:true, c:[
          {n:[{k:['g/4','e/5'], d:'w'}], n2:[{k:['c/3','c/4'], d:'w', ab:GR('IV')}]},
          {n:[{k:['f#/4','d/5'], d:'w'}], n2:[{k:['d/3','a/3'], d:'w', ab:GR('V')}]}
        ]}},
        {h:'Cadencia rota (V – VI)', sub:'Parece que la dominante (V) va a terminar en la tónica… pero en el último momento se va al sexto grado (VI). Tiene una sonoridad inesperada, pero es un impacto muy chulo.', penta:{ clef:'treble', clef2:'bass', ks:'G', centrar:true, c:[
          {n:[{k:['d/4','f#/4'], d:'w'}], n2:[{k:['d/3','a/3'], d:'w', ab:GR('V')}]},
          {n:[{k:['b/3','g/4'], d:'w'}], n2:[{k:['e/3','g/3'], d:'w', ab:GR('VI')}]}
        ]}}
      ]}   /* grid: 2 columnas por defecto (1 en móvil) */
    ]
  }

  });

  /* En estos temas, si un pentagrama no cabe en una línea (móvil), las líneas se reparten equilibradas */
  ['terminos','adorno','abrev','cadencias'].forEach(function(id){
    (function rec(bs){ [].concat(bs||[]).forEach(function(b){
      if(!b || typeof b!=='object') return;
      if(b.penta && b.penta.equilibrar==null) b.penta.equilibrar=true;
      rec(b.dentro); rec(b.grid); if(Array.isArray(b.cols)) b.cols.forEach(rec);
    }); })(window.APX_TEMAS[id].bloques);
  });
})();

