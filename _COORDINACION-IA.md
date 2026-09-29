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
- 29-sep 12:04 · Intros didácticas · EN CURSO · todos los vídeos de intros/: motor más ligero (la foto y el velo salen del SVG a capas
  propias: index.html y la línea del velo de escenas.js) y carteles que no se salen en ningún ordenador (dibujo.js). Nada
  más. Parto de 8fe55dd.
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
