/* =====================================================================
   MOTOR · reproductor de las intros (audio máster + escenas + controles)
   ===================================================================== */
(function () {
  'use strict';
  // ---- enlaces de los dos botones del final (norma 3): cada intro los pone en window.INTRO_CFG
  const CFG = window.INTRO_CFG || {};
  const ENLACE_SALIR = CFG.salir || 'https://gp.lmathome.es/';
  const ENLACE_EJERCICIOS = CFG.ejercicios || 'https://teoria.gp.lmathome.es/compases.html';

  const Q = new URLSearchParams(location.search);
  const OFFLINE = Q.has('offline');           // exportación a vídeo fotograma a fotograma
  const AUTO = Q.has('auto');                 // empieza sola (si el navegador lo permite)
  const EMBED = Q.has('embed');               // dentro de una web (tarjeta de Teoría): «Salir» cierra el visor
  if (AUTO) document.documentElement.classList.add('auto');   // sin portada mientras intenta empezar sola
  // (29-sep-2026, Iago) MODO MP4: si el vídeo ya está grabado (window.VIDEO_MP4), se reproduce ese MP4 (fluido en cualquier
  // pantalla) en vez de dibujar las escenas en directo; los carteles que se pulsan van en una capa transparente encima
  // (window.ENLACES_MP4) y los subtítulos y los botones del final siguen siendo HTML. ?svg fuerza el modo de siempre.
  const MP4 = !!window.VIDEO_MP4 && !OFFLINE && !Q.has('svg');
  const VER_FPS = Q.has('fps');                // ?fps → contador discreto de imágenes por segundo (diagnóstico)
  let ZONAS = [];
  const W = 1920, H = 1080;
  const $ = id => document.getElementById(id);

  let T = null, audio = null, reloj = { t: 0, perf: 0, audioT: -1 }, jugando = false, empezado = false;
  let subtitulos = false;

  function ajustar() {
    const r = $('marco').getBoundingClientRect();
    const s = Math.min(r.width / W, r.height / H);
    $('escenario').style.transform = `translate(-50%,-50%) scale(${s})`;
  }

  function tiempo() {
    if (!audio) return reloj.t;
    const at = audio.currentTime;
    const ahora = performance.now();
    if (at !== reloj.audioT) { reloj.audioT = at; reloj.perf = ahora; reloj.t = at; return at; }
    if (!audio.paused) return reloj.t + (ahora - reloj.perf) / 1000;
    return at;
  }

  function subtitulo(t) {
    const el = $('subtitulo');
    if (!subtitulos) { el.classList.remove('on'); return; }
    let txt = '';
    for (const id of T.orden) {
      const f = T.frase[id]; if (!f) continue;
      if (t >= f.t0 - 0.15 && t <= f.t1 + 0.35) { txt = f.txt || ''; break; }
    }
    if (el._txt !== txt) { el._txt = txt; el.querySelector('span').textContent = txt; }
    el.classList.toggle('on', !!txt);
  }

  function pintar(t) {
    if (MP4) enlacesMp4(t); else window.ESCENAS.pintar(t);
    subtitulo(t);
    $('barraTiempo').style.width = (100 * Math.min(1, t / T.dur)).toFixed(2) + '%';
    const fin = t >= T.acorde;
    $('finalUI').classList.toggle('on', fin);
    if (!fin) $('finalUI').style.opacity = '';
    else $('finalUI').style.opacity = Math.min(1, (t - T.acorde) / 0.35).toFixed(2);
  }

  let fpsEl = null, fpsN = 0, fpsT0 = 0, fpsPeor = 0, fpsUlt = 0;
  function medirFps() {
    const ahora = performance.now();
    if (!fpsEl) {
      fpsEl = document.createElement('div');
      fpsEl.style.cssText = 'position:fixed;left:8px;top:8px;z-index:99;font:600 13px/1.3 system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.6);padding:4px 8px;border-radius:6px;pointer-events:none';
      document.body.appendChild(fpsEl); fpsT0 = ahora;
    }
    if (fpsUlt) fpsPeor = Math.max(fpsPeor, ahora - fpsUlt);
    fpsUlt = ahora; fpsN++;
    if (ahora - fpsT0 >= 1000) {
      fpsEl.textContent = `${Math.round(fpsN * 1000 / (ahora - fpsT0))} fps · peor ${Math.round(fpsPeor)} ms · ${MP4 ? 'MP4' : 'directo'} · ${innerWidth}×${innerHeight} ×${devicePixelRatio}`;
      fpsN = 0; fpsT0 = ahora; fpsPeor = 0;
    }
  }
  function montarMp4() {
    const esc = $('escenario');
    const v = document.createElement('video');
    v.id = 'vid'; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto'; v.src = window.VIDEO_MP4;
    v.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;display:block;background:#081628;object-fit:cover';
    esc.insertBefore(v, esc.firstChild);
    ['lienzo', 'fondoCapa', 'velo'].forEach(id => { const e = $(id); if (e) e.style.visibility = 'hidden'; });
    const st = document.createElement('style');
    st.textContent = '#enlacesMp4 div:hover{background:rgba(255,255,255,.08)}';
    document.head.appendChild(st);
    const capa = document.createElement('div');
    capa.id = 'enlacesMp4';
    capa.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;pointer-events:none;z-index:2';
    esc.insertBefore(capa, $('portada'));
    const grupos = document.querySelectorAll('g.tarjetaEnlace');
    ZONAS = (window.ENLACES_MP4 || []).map(([i, t0, t1, x, y, w, h]) => {
      const d = document.createElement('div');
      d.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:18px;cursor:pointer;pointer-events:auto;display:none`;
      d.addEventListener('click', e => {      // el mismo cartel (oculto) hace lo de siempre: abrir el vídeo o los apuntes
        e.preventDefault(); e.stopPropagation();
        const g = grupos[i]; if (g) g.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
      capa.appendChild(d);
      return { d, t0, t1, on: false };
    });
    return v;
  }
  function enlacesMp4(t) {
    for (const z of ZONAS) { const on = t >= z.t0 && t <= z.t1; if (z.on !== on) { z.on = on; z.d.style.display = on ? 'block' : 'none'; } }
  }

  let vivo = false;                            // un solo bucle de dibujo a la vez
  function bucle() {
    const t = tiempo();
    if (VER_FPS) medirFps();
    pintar(t);
    if (jugando) requestAnimationFrame(bucle); else vivo = false;
  }
  function lanza() { if (!vivo) { vivo = true; requestAnimationFrame(bucle); } }

  function play() {
    const primera = !empezado;
    if (primera) audio.currentTime = 0;
    return audio.play().then(() => {
      if (primera) { empezado = true; $('portada').classList.add('fuera'); }
      jugando = true; document.body.classList.add('sonando'); lanza();
    }).catch(e => { console.warn(e); document.documentElement.classList.remove('auto'); });   // si no deja empezar sola: portada con su botón
  }
  function pausa() { audio.pause(); jugando = false; document.body.classList.remove('sonando'); pintar(tiempo()); }
  function alternar() { if (!empezado || audio.paused) play(); else pausa(); }
  function ir(t) { t = Math.max(0, Math.min(T.dur, t)); audio.currentTime = t; reloj.audioT = -1; pintar(t); }

  async function cargarFuentes() {
    const ff = new FontFace('BravuraIntro', `url(${window.BRAVURA_WOFF2})`);
    await ff.load(); document.fonts.add(ff);
    try { await document.fonts.load('32px "Helvetica Neue"'); } catch (e) { }
    await document.fonts.ready;
  }
  function cargarImagenes() {
    const IM = window.IMAGENES || {};
    return Promise.all(Object.values(IM).map(src => new Promise(res => { const i = new Image(); i.onload = i.onerror = res; i.src = src; })));
  }

  async function arrancar() {
    await cargarFuentes();
    await cargarImagenes();
    T = window.construirTiempos();
    window.ESCENAS.construir(T);
    subtitulos = Q.has('subs') ? true : (Q.has('nosubs') ? false : !T.real);
    $('botonSubs').classList.toggle('activo', subtitulos);
    ajustar(); window.addEventListener('resize', ajustar);
    window.renderAt = t => pintar(t);
    window.DUR = T.dur; window.ACORDE = T.acorde;
    pintar(0);
    document.title = document.title.replace(' · cargando', '');
    window.__listo = true;
    if (OFFLINE) { document.documentElement.classList.add('offline'); return; }

    if (MP4) audio = montarMp4();
    else { audio = $('audio'); audio.src = window.AUDIO_MASTER; }
    audio.addEventListener('ended', () => { jugando = false; document.body.classList.remove('sonando'); pintar(T.dur); });
    if (MP4) {   // teclas multimedia / controles del sistema: el vídeo manda y los carteles, subtítulos y final le siguen
      audio.addEventListener('play', () => { if (empezado && !jugando) { jugando = true; document.body.classList.add('sonando'); lanza(); } });
      audio.addEventListener('pause', () => { if (jugando && !audio.ended) { jugando = false; document.body.classList.remove('sonando'); pintar(tiempo()); } });
    }
    const bp = $('botonPlay');
    let yaListo = false;
    const listo = () => {
      if (yaListo) return; yaListo = true; bp.disabled = false; bp.classList.add('listo');
      if (AUTO) { play(); setTimeout(() => { if (!empezado) document.documentElement.classList.remove('auto'); }, 2500); }
    };
    if (audio.readyState >= 3) listo(); else audio.addEventListener('canplaythrough', listo, { once: true });
    setTimeout(listo, 4000);
    bp.addEventListener('click', play);
    $('botonPausa').addEventListener('click', alternar);
    $('botonReinicio').addEventListener('click', () => { ir(0); if (!jugando) play(); });
    $('botonSubs').addEventListener('click', () => { subtitulos = !subtitulos; $('botonSubs').classList.toggle('activo', subtitulos); pintar(tiempo()); });
    $('barra').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(); ir((e.clientX - r.left) / r.width * T.dur); });
    $('irEjercicios').href = ENLACE_EJERCICIOS;
    $('salir').href = ENLACE_SALIR;
    if (EMBED) {
      $('irEjercicios').target = '_top';
      $('salir').addEventListener('click', e => { e.preventDefault(); if (jugando) pausa(); try { parent.postMessage({ intro: 'salir' }, '*'); } catch (x) { } });
    }
    document.addEventListener('keydown', e => {
      if (e.code === 'Space') { e.preventDefault(); alternar(); }
      else if (e.code === 'ArrowRight') ir(tiempo() + 5);
      else if (e.code === 'ArrowLeft') ir(tiempo() - 5);
      else if (EMBED && e.key === 'Escape') { if (jugando) pausa(); try { parent.postMessage({ intro: 'salir' }, '*'); } catch (x) { } }
    });
    // mostrar controles al mover el ratón
    let tm = null;
    document.addEventListener('mousemove', () => { document.body.classList.add('raton'); clearTimeout(tm); tm = setTimeout(() => document.body.classList.remove('raton'), 2200); });
  }
  window.addEventListener('DOMContentLoaded', () => arrancar().catch(e => { console.error(e); document.title = 'ERROR ' + e.message; }));
})();
