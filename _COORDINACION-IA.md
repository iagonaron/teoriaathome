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

## Registro (lo más reciente arriba · hora de Galicia)
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
