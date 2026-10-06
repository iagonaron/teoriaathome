# Coordinación entre conversaciones de Claude · teoriaathome (Teoría at home, GE)

Iago tiene varias conversaciones de Claude subiendo cambios a este repositorio a la vez
(desde el 27-sep-2026; lo mismo pasa en teoriapro, que tiene su propio fichero igual que este).
Este fichero es el punto de encuentro. Empieza por «_» para que la web no lo publique.

## Antes de subir nada (cualquier conversación)
1. Mira el último commit de `main` y lee este fichero.
2. Apunta en el REGISTRO (abajo) fecha y hora, quién eres, qué ficheros vas a tocar y
   «EN CURSO». Sube esa línea antes que tu cambio (un commit solo con este fichero).
3. Edita SIEMPRE sobre la versión del último commit, descargada justo antes. Nunca subas
   un index.html entero hecho a partir de una copia antigua (ni del espejo de Dropbox sin
   comprobar que es igual a GitHub): borrarías el trabajo de otra conversación.
4. Justo antes de confirmar («Commit changes»), comprueba otra vez que `main` no ha cambiado.
   Si ha cambiado, rehaz tu cambio sobre la versión nueva.
5. Toca solo tu parte. Cada bloque añadido va marcado con un comentario «(fecha, Iago) …» y
   un «Para quitarlo: …». No borres ni reescribas bloques de otros; si tu cambio los afecta,
   explícalo aquí.
6. Al terminar: tu línea pasa a «HECHO · commit xxxxxxx», y deja el espejo de Dropbox
   (APPs/LMATHOME GE (github LMEAVathome)/LMEAV AT HOME/TEORIA AT HOME/) igual que GitHub.

## Quién es quién
- «Intros didácticas»: vídeos de introducción (carpeta intros/ y botón ▶ en las tarjetas).
- «Fichas y rediseño»: guardado de las fichas de alumno (FIX fichas, 27-sep) y la estética nueva.
- «Apuntes en fichas»: botones «APUNTES» / «VER VÍDEO» en la ficha del alumno (27-sep).
- (otras conversaciones: añadid aquí vuestro nombre y de qué os ocupáis)

## Dependencias (léelo si cambias la estética o el HTML de las tarjetas)
- Botón ▶ de la tarjeta «Tonalidades» = bloque «VÍDEOS DE INTRODUCCIÓN» (clases `ivg-*`) al final de
  index.html, justo antes de </body>. Busca `#padGrid .pad[data-pad="tonalidades"]` y se vuelve a poner
  solo si la rejilla se repinta (renderPads). Si cambiáis el HTML de las tarjetas: conservad `data-pad`
  o actualizad `INTROS` en ese bloque. Los estilos `.ivg-*` se pueden adaptar a la estética nueva.
  Prueba: pulsar ▶ → la tarjeta gira, crece y deja elegir entre los dos vídeos; «Salir» del vídeo vuelve
  a la elección; «Ir a ejercicios» cierra y abre Tonalidades; ✕, Esc o «atrás» cierran.
- «Ir a ejercicios» llama a `openTonalidades()` y baja a `#cardTA`: si se renombran, actualizad
  `EJERCICIOS` en ese bloque.
- intros/la-tonalidad/ e intros/indica-la-tonalidad/ son autónomas (no cargan nada del portal).
- Bloque «APUNTES EN LAS FICHAS»: su `VIDEO` tiene ya «indica la tonalidad» (ton_arm_tono →
  intros/indica-la-tonalidad/index.html). Si añadís una intro a `INTROS`, añadidla también a `VIDEO`.
- (28-sep, Intros didácticas) VÍDEOS EN PRUEBA: en `INTROS` los vídeos con `prueba: true` solo los ve la cuenta
  Tester (APX.comprobar → validado y tester), con la etiqueta «EN PRUEBA»; por eso ahora hay ▶ también en las
  tarjetas «Intervalos», «Inversión de intervalos» y «Compases» (data-pad intervalos, inversiones, compases), solo
  para Tester. `EJERCICIOS` tiene una función por tarjeta y cada vídeo dice a qué tarjeta de ejercicios lleva
  (card: cardTA/cardTB/cardTC/cardA/cardCOM; en Inversión, inv: simples/compuestos).
  Los vídeos EN PRUEBA NO están en `VIDEO` de «APUNTES EN LAS FICHAS» (a propósito: si los apuntes se abren a todos,
  no deben verse). AL PUBLICARLOS (solo cuando Iago lo diga): quitar `prueba: true` y añadirlos a `VIDEO`:
  int_clasif → intros/intervalos/, inv_simples → intros/inversion-intervalos/, inv_compuestos →
  intros/inversion-compuestos/, com_clasif → intros/compases/, ton_tono_arm → intros/indica-la-armadura/,
  ton_vecinos → intros/tonalidades-vecinas/ (cada una con /index.html).
- (28-sep, Intros didácticas) PULGAR 👍: Iago marca en el menú de vídeos (solo Tester/Protester) los vídeos EN PRUEBA
  que ya revisó y están bien. Se guarda en Supabase (suite_intro_marcar; se lee con suite_intro_revisiones; la tabla
  suite_intros_revision solo se toca desde esas dos funciones, que comprueban que la cuenta es Tester o Protester).
  «Haz públicos los vídeos revisados» = cambiar «prueba: true» por «alumnos: true» SOLO en los que tienen 👍: los vídeos
  didácticos nunca se abren a invitados, solo a alumnos logueados (cuenta validada).
- (28-sep, Intros didácticas · aprobado por Iago) SUPABASE, copias de seguridad cerradas a la web: RLS activado en
  _copia_reactivar_ficha_protester_20260922 y _bak_rit_notas_20260925, y quitadas las 2 políticas «todo permitido» de
  _copia_reactivar_fichas_protester_20260927 (migraciones rls_en_copias_de_seguridad_20260928 y
  cerrar_copia_fichas_protester_20260927; el deshacer va en el propio SQL). Se siguen leyendo por SQL (dueño postgres).
  OJO: el disparador auto_rls_grants_trg da políticas «todo permitido» (anon y authenticated) a TODA tabla nueva de
  public; si creáis una copia de seguridad, quitadle esas dos políticas al crearla.
- (28-sep tarde, Intros didácticas) NUEVAS TARJETAS CON ▶ (solo Tester): data-pad escalas (3 vídeos), grados (cardGR) y semitonos
  (cardSEM). AL PUBLICARLOS, en `VIDEO` de «APUNTES EN LAS FICHAS»: esc_menor → intros/escalas-menores/, esc_mayor →
  intros/escalas-mayores/, esc_otras → intros/otras-escalas/, gra_senalar → intros/grados/, semitonos → intros/semitonos/.
- (28-sep tarde, NORMAS DE IAGO para TODOS los vídeos) tono = arco redondo y semitono = pico en V, SIEMPRE por debajo de las
  notas (como en su Kit salvavidas); al invertir, la nota viaja a su octava por un arco discontinuo con punta (nunca se
  reescribe el intervalo); los carteles que remiten a otro vídeo se pueden pulsar y lo abren en una pestaña nueva.
  Si el vídeo va dentro de un iframe con sandbox sin «allow-popups» (el de «APUNTES EN LAS FICHAS»), el cartel no puede abrir
  pestaña y manda al padre postMessage({intro: 'abrir', slug, src}); si queréis que funcione ahí, añadid «allow-popups
  allow-popups-to-escape-sandbox» a ese iframe o atended ese mensaje.

- (28-sep, Intros didácticas) COPIAS EN TEORÍA PRO: intros/intervalos/, intervalos-compuestos/, inversion-intervalos/,
  inversion-compuestos/, indica-la-tonalidad/, indica-la-armadura/, tonalidades-vecinas/, escalas-menores/, escalas-mayores/,
  otras-escalas/ y la-tonalidad/ están copiadas TAL CUAL en teoriapro/intros/ (tarjetas de repaso de Grado Profesional;
  allí solo cambia `INTRO_CFG` del index.html). Si cambiáis uno de esos vídeos aquí, copiadlo también allí (y apuntadlo en
  el _COORDINACION-IA.md de teoriapro). El 👍 de revisión es el mismo en los dos portales (misma clave de Supabase).

## Registro (lo más reciente arriba · hora de Galicia)
- 6-oct 17:45 · Intros didácticas · HECHO · commit d698ff6 (EN CURSO en 9324c67, parto de c1c0b34) ·
  intros/indica-la-tonalidad/escenas.js e indica_tonalidad_60.mp4 · CON BEMOLES, SOLO EL PENÚLTIMO CAMBIA (Iago: «sería
  mucho más claro y preciso que el bemol que se ilumine sea el penúltimo»; en los sostenidos ya cambiaba solo el
  último). Antes, al decir «penúltimo», el penúltimo pasaba a rosa y los demás bemoles se atenuaban al 40 %: quedaban
  con el mismo brillo que el rosa (medido en el vídeo: 0,22 y 0,18 frente a 0,26; un segundo antes, 0,9), cambiaban
  los tres a la vez y solo se distinguían por el tono. Ahora los demás se quedan en blanco, como en los sostenidos, y
  al penúltimo lo señala una flecha bajo «penúltimo» (un círculo pisaría a los dos vecinos). Lo mismo en el resumen
  (3:52) y, por coherencia, en «mira la armadura» (4:07: el do♯ en rosa y los otros tres sostenidos en blanco). Vídeo
  regrabado con la receta de siempre (1080p60, crf 21) y el mismo audio: 14.442 de sus 15.842 fotogramas son idénticos
  a los de antes; solo cambian 1:16–1:27, 3:53–3:57 y 4:07–4:14. Mismos tiempos; no toca index.html, tiempos ni
  guion. La copia de teoriapro, igual (commit 53531f7). Para volver: git revert d698ff6, o subir los dos ficheros de
  APPs/_PARA BORRAR/6-oct-2026-indica-la-tonalidad-antes-de-solo-el-penultimo/. Espejo de Dropbox igual que GitHub.
- 6-oct 10:50 · Fichas y rediseño · HECHO · commit 0d4e8c8 (EN CURSO en 7236661) · index.html, tres cosas que pidió
  Iago. (1) APUNTES PARA TODOS: APX_CFG soloTester:false. «Ver apuntes» sale a toda cuenta VALIDADA (invitados y
  pendientes, no) en las tarjetas, en la fila de ayuda de la ficha, en las tarjetas «APUNTES» de dentro de los vídeos
  y en el consejo de la ficha corregida. Para volver: soloTester:true. (2) GENERADOR DEL PROFESOR: empieza siempre
  vacío. La cesta ya no se guarda en localStorage (CFG_KEY ni se borra ni se escribe; solo se lee una vez para heredar
  «Acordes con 7ª», que pasa a OPC_KEY); ahora vive en sessionStorage (SES_KEY) atada al enlace de envío: aguanta una
  recarga de la misma pestaña y se olvida al enviar (olvidaSesion). loadCfg/saveCfg son los nuevos. «Vaciar ficha» se
  llama «Limpiar ficha», como en profesional. OJO quien pruebe el generador sembrando teoria_prof_ficha_cfg_v2: ya no
  rellena la cesta; hay que sembrar sessionStorage teoria_prof_ficha_sesion_v1 = {ctx:<envio>, items:[…]} o pulsar los
  tipos. (3) FICHA DEL ALUMNO, fila «No lo sé hacer / tengo dudas»: Términos suma «Vídeo» (sus dos vídeos, en VIDEOS /
  TEMA_VIDEO / VERIFICADOS del bloque «APUNTES EN LAS FICHAS») y «Practicar ejercicios sueltos» (PRACTICA_SOLO +
  tienePractica(), que sustituye a AREA_DE[key] en modalPracticar, la fila, la lista final y el consejo; y
  PRACTICE_MAP.terminos → view-terminos). AREA_DE no cambia, así que lo que se guarda en la ficha (area, practica_url)
  sigue igual. Con esto, 22 de los 24 tipos enseñan Apuntes · Vídeo · Practicar; Notas de adorno y Abreviaciones no
  tienen vídeo. Entrega de una ficha entera (24 tipos) idéntica a la de antes, byte a byte. Espejo de Dropbox igual
  que GitHub. Nota: APPs/LMATHOME GE (github
  LMEAVathome)/LEEME-6-oct-2026-entregada-apuntes-para-todos-y-limpiar-ficha.txt.
- 3-oct 14:30 · Fichas y rediseño · HECHO · commit 093c454 (EN CURSO en bdf25ef, parto de 1dacaf8) · index.html. FICHA
  CORREGIDA EN TARJETAS: la pantalla final de la ficha (al terminarla, en ?revision=…&alu=1 —digital y &papel=1— y en
  la revisión del profesor ?revision=…&s=…) pinta una tarjeta por ejercicio con el % y su icono arriba a la derecha (✓
  verde 100 · triángulo amarillo 50–99 · triángulo rojo <50), la leyenda arriba y, en los suspensos, abajo a la
  derecha: «Hey, soy Iago. Aquí tienes apuntes, vídeo y ejercicios para practicar» (sustituye a «practica esto,
  anda»). Bloque nuevo «FICHA CORREGIDA EN TARJETAS» (<style id=lmf-corr-css> + window.LmfCorr), antes de «FILA DE
  AYUDA DE LA FICHA»; si se borra, la pantalla vuelve sola a las filas de antes. (1) «Apuntes en fichas», OJO: vuestro
  bloque ApxFicha corre ahora también con ?revision=… (antes solo con ?fichaId) y gana ApxFicha.recursos(tipo, cb),
  que da a la ficha corregida lo que ESA cuenta puede abrir (apuntes, Libro y portal con vuestra misma puerta
  soloTester; vídeos, con la suya); desde ahí se abren «libres» (3.er dato de abrirApuntes / abrirApuntesYa /
  abrirLibro / abrirLibroYa / elegirVideo): sin la ventanita ni el minuto. En ?revision=…&alu=1 la cuenta del enlace
  se guarda en apx_cuenta_<tema>, igual que ?cuenta= en una ficha. La fila de ayuda de la ficha del alumno NO cambia
  (mismas pruebas, misma salida). (2) En la revisión de una ficha DIGITAL el % de cada tarjeta es el GUARDADO con la
  entrega (payload.ejercicios[k].pct), no uno recalculado; si la entrega es antigua y no lo trae, el de siempre. (3)
  El rótulo «Tu ficha N corregida · nota X» del alumno ya solo sale si dice algo que no esté en «Puntuación» (sin
  nota, anulados o reclamación). (4) Ficha EN PAPEL corregida: negro lo impreso y rojo lo que se escribe; cada
  solución va sobre una hoja blanca (.lmf-hoja) y los pintores de compás, términos y cifra no usan allí los colores de
  fondo oscuro (enSim); las casillas verdes de test y cadencias pasan a rojo (LmfCorr.rojo). (5) El profesor puede
  abrir la ficha en papel de un alumno: ?revision=papel:<alumno>&s=…&papel=1&curso=…&n=…&pct=…&nota=… (lee la ficha
  con suite_ficha_ver; sin funciones nuevas en la base). (6) ?practice=esc_mayor / esc_menor / esc_otras abre Escalas
  con SOLO esa familia marcada (antes, la que estuviera: las menores). Para volver atrás: git revert 093c454. Espejo
  de Dropbox igual que GitHub (la versión anterior, en APPs/_PARA
  BORRAR/3-oct-2026-teoria-antes-de-ficha-en-tarjetas/GE-index.html).
- 3-oct 11:45 · Fichas y rediseño · HECHO · commit 1dacaf8 (EN CURSO en 16da67b) · index.html (window.PapelFichas): el
  PDF de papel con nombres lleva UNA sola ficha sin nombre (antes dos). Iago: «solo quiero una copia a mayores vacía,
  sin nombre»; si alguien se pasa a papel después de generar la ficha, esa hoja es para él (el Diario móvil lo avisará
  con «+1» en el icono de papel). Para volver a dos: SIN_NOMBRE = 2 en window.PapelFichas, o git revert 1dacaf8.
  Espejo de Dropbox igual que GitHub.
- 3-oct 11:05 · Fichas y rediseño · HECHO · commit 71ec2c2 (EN CURSO en 3d47eb3, parto de 58c75c8) · index.html. (1)
  GENERADOR, ficha en papel (bloque «FICHAS EN PAPEL», window.PapelFichas, construirPDF y window.__PAPEL_CFG): el
  botón «Guardar el PDF» hace UN PDF con una ficha por cada alumno que va en papel, con su nombre y su grupo escritos,
  sus ejercicios de refuerzo al final (pestaña «REFUERZO ★» arriba a la derecha de la tarjeta) y 2 fichas más sin
  nombre; cada ficha empieza en hoja nueva (pensado para imprimir a doble cara). En la lista de refuerzo, los alumnos
  de papel salen con 📄. El contexto se pide a suite_ficha_profe_contexto_v2 (trae quién va en papel y cuenta también
  las fichas corregidas en papel); si no existiera, usa el de siempre y el PDF sale como antes (un ejemplar). (2)
  ALUMNO: ruta nueva ?revision=<ficha>:<cuenta>&alu=1&papel=1 = su ficha «en formato solución» (respuesta correcta de
  cada ejercicio, la nota y el % que puso Iago en cada uno; solo los ejercicios de refuerzo que traía su hoja); la
  pide a suite_ficha_solucion_papel. El enlace lo manda la app Fichas en papel al poner la nota. La revisión digital
  de siempre (?revision=…&alu=1) no cambia (comprobado: sale idéntica). Base de datos: solo funciones NUEVAS (no se ha
  tocado ninguna de las de antes). Para volver atrás: git revert 71ec2c2. Espejo de Dropbox igual que GitHub (la
  versión anterior, en APPs/_PARA BORRAR/3-oct-2026-teoria-antes-de-papel-con-nombre/GE-index.html).
- 1-oct 09:42 · Fichas y rediseño · HECHO · commit 85e52d7 (EN CURSO antes, parto de ccc151c) · index.html (bloque «FICHAS EN
  PAPEL», window.PapelFichas): el PDF de la ficha en papel lleva UN solo ejemplar; el nombre sigue diciendo cuántas copias
  hacer («Ficha N · 4 GE · X copias.pdf»). Iago: «si un alumno se pasa a papel a mitad de semana, en la copistería pido
  una más». Para volver a la ficha repetida X veces: git revert 85e52d7. Espejo de Dropbox igual que GitHub.
- 30-sep 20:30 · Intros didácticas · HECHO · commit 2f2a7e2 (EN CURSO en 73ccf5d) · intros/*/*.mp3 (21 audios) e
  intros/*/*_60.mp4 y *_1440.mp4 (13 vídeos): MÁS MARGEN EN EL AUDIO (Iago: «noto un pelín distorsionada mi voz… algo
  más de margen»). Misma mezcla, 2 dB más baja (−18 LUFS), picos a −3,5 dB, filtro suave por debajo de 60 Hz y MP3 a
  192 kbps; en los MP4 solo cambia la pista de audio (AAC hecho desde la mezcla): el vídeo es idéntico (comprobado paquete a
  paquete). Mismos tiempos; no toca index.html, escenas ni tiempos. Para volver al audio de antes: git revert 2f2a7e2.
  Espejo de Dropbox igual que GitHub (lo de antes, en APPs/_PARA BORRAR/30-sep-2026-noche-audio-antes-de-mas-margen).
- 30-sep 12:06 · Intros didácticas · HECHO · commit 97d1666 (EN CURSO en c2496cf) · index.html: «La tonalidad» e «Indica la
  tonalidad» (INTROS del bloque de vídeos) pasan a `alumnos: true` (Iago: «Quiero que los vídeos solo estén disponibles para
  alumnos»; como invitado se veían). Ya no queda ningún vídeo sin marca: invitados, ninguno. Para volver a abrirlos a todos:
  quitar «, alumnos: true» de esas dos líneas. Espejo de Dropbox igual que GitHub.
- 30-sep 09:40 · Intros didácticas · HECHO · commit cbe9a9e (EN CURSO en ffd4e42) · intros/acordes/escenas.js e intros/inversion-acordes/escenas.js
  (correcciones de Iago) · index.html: PUBLICACIÓN de todos los vídeos para alumnos (Iago: «puedes hacer públicos todos
  los vídeos»): `prueba: true` → `alumnos: true` en INTROS del bloque de vídeos (nunca invitados), VERIFICADOS del bloque
  de las fichas, y «Ir a ejercicios» de Escalas abre el tipo de escala de su vídeo. Parto de bb67547.
  Para volver a «solo Tester»: en el bloque de vídeos, `alumnos: true` → `prueba: true` (y VERIFICADOS como estaba).
  Espejo de Dropbox igual que GitHub.
- 29-sep 20:51 · Intros didácticas · HECHO · commit 098aa13 (EN CURSO en 0d0f1c2) · tanda 1440-A: intros/intervalos,
  intervalos-compuestos, inversion-intervalos, inversion-compuestos, compases, escalas-menores y otras-escalas pasan a MP4
  1440p60 con audio 256k (<slug>_1440.mp4 + window.VIDEO_MP4 en su index.html). Para volver al modo de siempre en un vídeo:
  borrar esa línea de su index.html (o abrirlo con ?svg).
- 29-sep 20:48 · Intros didácticas · EN CURSO · vídeos en MP4 1440p a 60 fps (audio 256k), tanda 1440-A: intros/intervalos,
  intervalos-compuestos, inversion-intervalos, inversion-compuestos, compases, escalas-menores y otras-escalas: cada una, su
  <slug>_1440.mp4 + una línea en su index.html (window.VIDEO_MP4). Nada más. Parto de 7f35cbd.
- 29-sep 17:47 · Fichas y rediseño · HECHO · commit c79c916 · index.html · ESCALAS MAYORES con bemoles: las tónicas eran solo teclas
  blancas (de las mayores, solo Fa lleva bemoles). Para las mayores se añaden Si♭, Mi♭, La♭ y Re♭ (práctica escItem7 y
  ejemplos escGenEjemplo); sin dobles alteraciones. Menores y otras, igual.
- 29-sep 16:49 · Intros didácticas · HECHO · commits f50781f y e04f4ed (EN CURSO en 327fe2a) · (1) MP4 a 60 fps:
  intros/indica-la-armadura (indica_la_armadura_60.mp4, 9 MB) e intros/tonalidades-vecinas (tonalidades_vecinas_60.mp4,
  5,6 MB); intros/escalas-mayores, más nítida: escalas_mayores_1440.mp4 (1440p60, audio AAC 256k, 16 MB); cada una con su
  línea en index.html; (2) intros/*/motor.js (las 21, el mismo fichero): mientras suena, el cursor se esconde si no se
  mueve; (3) index.html, bloque ivg: pulsar fuera del vídeo abierto ya no lo cierra (solo la ✕) y el cursor se esconde a
  los 2,5 s. Para deshacer: motor.js e index.html del commit ec62d4d.
- 29-sep 16:02 · Intros didácticas · EN CURSO · (1) MP4 a 60 fps, tanda 2: intros/indica-la-armadura e
  intros/tonalidades-vecinas; y Escalas Mayores otra vez, más nítida (escalas_mayores_1440.mp4, 1440p60, audio 256k); cada
  una, su .mp4 + una línea en su index.html; (2) intros/*/motor.js: el cursor se esconde mientras suena si no se mueve;
  (3) index.html, bloque ivg: pulsar fuera del vídeo ya no lo cierra y el cursor se esconde a los 2,5 s. Parto de ec62d4d.
- 29-sep 15:33 · Intros didácticas · HECHO · commit 21cf855 (EN CURSO en 31b1220) · intros/*/motor.js (las 21, el mismo
  fichero): en modo MP4 el vídeo se DESCARGA ENTERO (fetch → Blob) antes de empezar; mientras, se ve el título dibujado y
  una barra rosa con el % descargado bajo él; luego ya no se para a mitad. Sin descarga posible, como antes. Para volver al
  motor anterior: el motor.js del commit 48f7fd9.
- 29-sep 15:28 · Intros didácticas · EN CURSO · intros/*/motor.js (todas, el mismo fichero): en modo MP4 el vídeo se
  DESCARGA ENTERO antes de empezar (barra rosa con el % bajo el título; luego ya no se para a mitad) y el título se ve
  dibujado mientras. Nada más. Parto de 48f7fd9.
- 29-sep 15:06 · Intros didácticas · HECHO · commit 7c50639 (EN CURSO en ecddbae) · intros/la-tonalidad e
  intros/indica-la-tonalidad: su vídeo grabado en MP4 a 60 fps (intro_tonalidad_60.mp4, 11 MB; indica_tonalidad_60.mp4,
  14 MB) + una línea en su index.html (window.VIDEO_MP4). Sigo grabando el resto a MP4, con su EN CURSO.
- 29-sep 14:24 · Intros didácticas · EN CURSO · vídeos en MP4 a 60 fps, tanda 1: intros/la-tonalidad e
  intros/indica-la-tonalidad (su .mp4 + una línea en su index.html; nada más). Parto de 93325e0.
- 29-sep 13:08 · Intros didácticas · HECHO · commits 4b07d19 y 078caaa (EN CURSO en bd832a5) · (1) intros/*/motor.js: modo
  MP4 (si el index.html de un vídeo declara window.VIDEO_MP4 = '<fichero>.mp4' y window.ENLACES_MP4 = zonas pulsables de sus
  carteles, se reproduce ese vídeo grabado a 60 fps en vez de dibujarlo en directo; ?svg = modo de siempre; ?fps = contador) y
  el primero grabado: escalas-mayores (escalas_mayores_60.mp4, 10 MB, + una línea en su index.html). (2) index.html: bloque
  ivg con SIN_GIRO = true (la caja del vídeo sale ya grande y plana, sin volteo, fundidos ni desenfoque) + bloque CSS «VÍDEOS
  SIN VOLTEO» antes de </body>; para volver al giro, SIN_GIRO = false. Seguiré grabando el resto de vídeos a MP4 (un .mp4 por
  carpeta + esa línea en su index.html), con su EN CURSO.
- 29-sep 12:46 · Intros didácticas · EN CURSO · (1) vídeos en MP4 a 60 fps, fluidos en cualquier pantalla: motor.js nuevo en
  todas las intros (modo MP4 solo si su index.html declara window.VIDEO_MP4; si no, igual que siempre) y el primero grabado,
  escalas-mayores (escalas_mayores_60.mp4 + una línea en su index.html); (2) después, index.html: las tarjetas de vídeo
  (bloque ivg) se abren y cierran sin volteo ni desenfoque de fondo. Nada más. Parto de 55bb331.
- 29-sep 12:08 · Intros didácticas · HECHO · commit 923f7dc (EN CURSO en 19ed168) · todos los vídeos de intros/: la foto del
  conservatorio y el velo salen del SVG a dos capas propias (index.html: #fondoCapa y #velo; escenas.js: solo la línea del
  velo, que ahora cambia style.opacity) y dibujo.js mide bien los textos con espaciado entre letras (había un Chrome, el de la
  pantalla del aula de Iago, que no lo contaba y los carteles se quedaban cortos) y ajusta el texto a su cartel. Mismo aspecto;
  el pintado por fotograma baja de ~31 a ~2 ms en los fundidos del título y de ~2 a ~0,5 ms en el resto (medido a 4K).
  Si hacéis un vídeo nuevo, usad este index.html y este dibujo.js (script: _herramientas/motor34.py en el Escritorio de Iago).
- 29-sep 11:41 · Intros didácticas · HECHO · commit 8358889 (EN CURSO en a281df1) · intros/: 7 vídeos GE nuevos EN PRUEBA
  (acordes, inversion-acordes, enarmonias, claves, terminos, terminos-movimiento, cadencias; ▶ en 6 tarjetas más: data-pad
  acordes, inv-acordes, enarmonias, claves, terminos (2 vídeos) y cadencias) · retoques de Iago en escalas-menores,
  escalas-mayores, otras-escalas, semitonos e indica-la-armadura · en los demás ya subidos solo cambia el mp3 (música
  re-empalmada mientras habla Iago; los 👍 siguen valiendo) · index.html: bloque «VÍDEOS DE INTRODUCCIÓN» (INTROS y
  EJERCICIOS de esas tarjetas, y APUNTES desde los vídeos: las tarjetas «APUNTES» de dentro de un vídeo abren VER APUNTES)
  y, en «APUNTES EN LAS FICHAS», solo VIDEOS/TEMA_VIDEO de los vídeos nuevos (vuestro aviso; sin 👍 no los ven los alumnos).
  Subido con GitHub Desktop desde un clon en el Escritorio de Iago (_github-claude/): los mp3 que pasan por el Mac llevan
  metadatos C2PA en la cabecera ID3 (el audio es idéntico). Espejo de Dropbox igual que GitHub.
- 29-sep 08:39 · Fichas y rediseño · HECHO · commit 5fcc2cd · index.html · ficha del alumno: «No lo sé hacer / tengo dudas» como
  texto + hasta 3 botones con contorno rosa (Apuntes · Vídeo · Practicar ejercicios sueltos) en previsualizarAlumno y
  en el bloque «APUNTES EN LAS FICHAS» (ApxFicha); ventana «Vamos a practicar esto» con la estética nueva
  (modalPracticar); en la ficha, los vídeos con 👍 para los alumnos (lista propia dentro de ApxFicha: NO toca INTROS,
  ivg-* ni intros/); revisión del profesor: &ej=N abre la ficha centrada en ese ejercicio y el rótulo con la estética
  nueva. Parto de 1f52f80.
  AVISO para «Intros didácticas»: en la ficha, «Vídeo» enseña a los alumnos los vídeos del tema ya publicados o con 👍.
  El 👍 no lo pueden leer las cuentas de alumno, así que va copiado en VERIFICADOS (bloque «APUNTES EN LAS FICHAS»):
  al dar un 👍 nuevo o publicar un vídeo, añadidlo también ahí (y a VIDEOS si es un vídeo nuevo).
- 28-sep 20:33 · Intros didácticas · HECHO · solo este fichero: aviso de que 11 carpetas de intros/ tienen copia en
  teoriapro (vídeos GE en las tarjetas de repaso de Teoría PRO, EN PRUEBA; commits de teoriapro 9b5a04c … d915f15).
- 28-sep 19:55 · Intros didácticas · HECHO · commits f5b5598 (escalas-menores), dca78a2 (escalas-mayores), 0f7e26c (otras-escalas),
  b550a5e (grados), fead664 (semitonos), c9f077e (intervalos), 79d74cc (inversion-intervalos), 19a83eb (inversion-compuestos),
  e43606b (indica-la-armadura), 2b689c9 (tonalidades-vecinas), aa85a72 (la-tonalidad), 2ad0b7d (indica-la-tonalidad), f7a0f14 (index.html)
  · 5 vídeos GE nuevos EN PRUEBA (solo Tester y Protester) · en los ya subidos, solo su escenas.js (cambios que pidió Iago)
  · index.html: solo el bloque «VÍDEOS DE INTRODUCCIÓN» (ivg-*): INTROS escalas / grados / semitonos, EJERCICIOS de esas
  tres tarjetas y, en móvil con 3–4 vídeos, «EN PRUEBA» como un punto rosa (verde si está revisado). Partí de 1580b6a.
- 28-sep 16:40 · Intros didácticas · HECHO · commits 1795e0d (intervalos), fd9e6a2 (inversion-intervalos), e56106f (intervalos-compuestos), 56b2695 (inversion-compuestos), 4ea29f8 (compases), aa859be (indica-la-armadura), 6f3c478 (tonalidades-vecinas), c8d5d46 (index.html) · 7 vídeos GE nuevos EN PRUEBA (solo Tester y
  Protester) en intros/<carpeta>/ · index.html: solo el bloque «VÍDEOS DE INTRODUCCIÓN» (ivg-*): INTROS con «prueba: true»,
  niveles de acceso (sin marca = todos · «alumnos: true» = solo cuentas validadas · «prueba: true» = Tester/Protester),
  ▶ en Intervalos / Inversión / Compases, EJERCICIOS por tarjeta, CSS para 3–4 vídeos y el pulgar 👍 de revisión
  (Supabase: tabla suite_intros_revision + funciones suite_intro_revisiones / suite_intro_marcar). Partí de c832ac2.
- 28-sep 10:48 · Fichas y rediseño · HECHO · commit 7d97570 · index.html · vídeos de introducción (bloque ivg de «Intros
  didácticas»): con un vídeo puesto se oculta la ✕ y queda solo «‹ Vídeos»; en la lista de vídeos, solo la ✕ (Iago:
  nunca «volver» y ✕ a la vez). Dos líneas marcadas «(28-sep-2026, Iago)»; Esc, «Salir» del vídeo y «atrás» siguen
  igual.
- 28-sep 09:19 · Fichas y rediseño · HECHO · commit a3bc4d1 · index.html: (1) ficha del alumno, APUNTES: antes una ventana
  «¿Necesitas mirar los apuntes?» y, abiertos, «‹ Volver» bloqueado 1 minuto, sin ✕ (bloque «APUNTES EN LAS FICHAS»;
  solo Tester); (2) VER APUNTES sin la ✕ de la derecha (un <style> al final); (3) tarjeta Tonalidades que gira con ▶:
  un <style> APARTE al final (no toca el bloque ivg-*) que quita el desenfoque y el ▶/«VER APUNTES» de la copia que
  gira, desvanece la cara de delante al girar y hace que la ✕ responda al primer clic con la estética nueva.
- 28-sep 08:46 · Fichas y rediseño · HECHO · commit 909b816 · index.html: generador (alumnos con ejercicios específicos legibles;
  «Preparar envío» ya no pide el ZIP), autoguardado también al girar una rueda con la rueda del ratón, sin el texto
  «Simulación…» de relleno, apuntes nuevos con las respuestas de Iago (?v=2: apuntes.js, apuntes-kit.js; solo Tester)
  y la línea «LM piel» tras `<meta charset>` (no hace nada sin la cuenta de prueba). No toca las tarjetas, `ivg-*`
  ni intros/.
- 28-sep 08:20 · Intros didácticas · HECHO · commits a6f1c39 (la-tonalidad), 5135e51 (indica-la-tonalidad), 2211aa3 (index.html) · crea este fichero · intros/la-tonalidad/ e
  intros/indica-la-tonalidad/ (dos vídeos) · index.html: aviso tras `<meta charset>`, bloque
  «VÍDEOS DE INTRODUCCIÓN» antes de </body> y `VIDEO` de «APUNTES EN LAS FICHAS» (una línea).
  No toca nada más.
- 27-sep 21:57 · Apuntes en fichas · commit 99163e1 · botón APUNTES en la ficha del alumno (solo Tester).
- 27-sep 14:23 · Fichas y rediseño · commit d6d66cd · FIX guardado de fichas.
