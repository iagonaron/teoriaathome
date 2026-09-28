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

## Registro (lo más reciente arriba · hora de Galicia)
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
