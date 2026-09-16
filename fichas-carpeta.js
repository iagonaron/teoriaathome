/* ============================================================
   FICHAS EN PAPEL · guardado automático en una carpeta (Iago · 16-sep-2026)
   ------------------------------------------------------------
   Cada vez que se genera el PDF de una ficha (GE y GP), la versión
   ALUMNO se guarda sola en la carpeta que el profesor eligió una vez
   (Dropbox/CMUS/FICHAS EN PAPEL), con el grado en el nombre:
       GE · Ficha 1 · 2026-09-16 (alumno).pdf
       GP · Examen 1T · 2026-11-20 (alumno).pdf
   La descarga normal (ZIP alumno + solución) sigue igual.

   Cómo: File System Access API (Chrome/Edge de ordenador). La carpeta se
   elige con el botón «📁 Carpeta de fichas en papel»; Chrome guarda el
   permiso («Permitir en cada visita») y el acceso queda en IndexedDB.
   En Safari/iPad no existe la API: el botón lo dice y no pasa nada más.

   Uso desde el generador:
     FichasCarpeta.preparar()            → al pulsar «Generar PDF» (pide permiso si hace falta)
     FichasCarpeta.guardar(blob, {grado:'GE', titulo:'Ficha 1'})  → tras construir el PDF alumno
   ============================================================ */
(function () {
  'use strict';
  var DB = 'fichas-carpeta', STORE = 'h', KEY = 'dir';
  var soportado = typeof window.showDirectoryPicker === 'function';
  var _h = null;           // FileSystemDirectoryHandle en memoria
  var _ok = false;         // permiso concedido en esta sesión

  function idb() {
    return new Promise(function (res, rej) {
      try {
        var r = indexedDB.open(DB, 1);
        r.onupgradeneeded = function () { r.result.createObjectStore(STORE); };
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { rej(r.error); };
      } catch (e) { rej(e); }
    });
  }
  function leer() {
    return idb().then(function (db) {
      return new Promise(function (res) {
        var t = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
        t.onsuccess = function () { res(t.result || null); };
        t.onerror = function () { res(null); };
      });
    }).catch(function () { return null; });
  }
  function escribir(h) {
    return idb().then(function (db) {
      return new Promise(function (res) {
        var t = db.transaction(STORE, 'readwrite');
        t.objectStore(STORE).put(h, KEY);
        t.oncomplete = res; t.onerror = res; t.onabort = res;
      });
    }).catch(function () {});
  }
  function borrar() {
    return idb().then(function (db) {
      return new Promise(function (res) {
        var t = db.transaction(STORE, 'readwrite');
        t.objectStore(STORE).delete(KEY);
        t.oncomplete = res; t.onerror = res; t.onabort = res;
      });
    }).catch(function () {});
  }
  async function handle() {
    if (_h) return _h;
    _h = await leer();
    return _h;
  }
  async function permiso(h, pedir) {
    try {
      var o = { mode: 'readwrite' };
      if ((await h.queryPermission(o)) === 'granted') return true;
      if (!pedir) return false;
      return (await h.requestPermission(o)) === 'granted';
    } catch (e) { return false; }
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function hoy() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function limpio(s) {
    return String(s == null ? '' : s)
      .replace(/_/g, ' ')
      .replace(/[\/\\:*?"<>|]+/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function nombreFichero(o) {
    o = o || {};
    var t = limpio(o.titulo || 'Ficha') || 'Ficha';
    return (o.grado ? limpio(o.grado) + ' · ' : '') + t + ' · ' + hoy() + ' (alumno).pdf';
  }

  /* ---- UI: botón discreto junto al de «Generar PDF» ---- */
  var _btn = null, _estado = null;
  function css() {
    if (document.getElementById('fc-css')) return;
    var s = document.createElement('style'); s.id = 'fc-css';
    s.textContent =
      '.fc-wrap{display:inline-flex;align-items:center;gap:8px;margin:6px 0 0;font-family:inherit}' +
      '.fc-btn{background:transparent;border:1px solid rgba(128,128,128,.45);color:inherit;border-radius:9px;padding:6px 10px;font-size:12.5px;cursor:pointer;font-family:inherit;opacity:.85}' +
      '.fc-btn:hover{opacity:1;border-color:rgba(128,128,128,.8)}' +
      '.fc-est{font-size:12px;opacity:.75}' +
      '.fc-est.ok{color:#16a34a;opacity:1}' +
      '.fc-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#0f172a;color:#e2e8f0;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:10px 14px;font-size:13px;z-index:99999;box-shadow:0 10px 30px rgba(0,0,0,.35);max-width:92vw}';
    document.head.appendChild(s);
  }
  function toast(msg, ms) {
    try {
      var t = document.createElement('div'); t.className = 'fc-toast'; t.textContent = msg;
      document.body.appendChild(t); setTimeout(function () { t.remove(); }, ms || 4500);
    } catch (e) {}
  }
  async function pintarEstado() {
    if (!_estado) return;
    if (!soportado) { _estado.textContent = 'solo en Chrome de ordenador'; _estado.className = 'fc-est'; return; }
    var h = await handle();
    if (!h) { _estado.textContent = 'sin carpeta elegida'; _estado.className = 'fc-est'; return; }
    var p = await permiso(h, false);
    _estado.textContent = '✓ ' + (h.name || 'carpeta') + (p ? '' : ' (pedirá permiso)');
    _estado.className = 'fc-est ok';
  }
  async function elegir() {
    if (!soportado) { toast('Elegir carpeta solo funciona en Chrome/Edge de ordenador.'); return null; }
    try {
      var h = await window.showDirectoryPicker({ id: 'fichas-papel', mode: 'readwrite', startIn: 'documents' });
      _h = h; _ok = true;
      await escribir(h);
      await pintarEstado();
      toast('📁 Las fichas (versión alumno) se guardarán en «' + h.name + '».');
      return h;
    } catch (e) { return null; }   // cancelado
  }
  async function quitar() { _h = null; _ok = false; await borrar(); await pintarEstado(); }
  function montar(anclaId) {
    var ancla = document.getElementById(anclaId);
    if (!ancla || document.getElementById('fc-wrap')) return !!document.getElementById('fc-wrap');
    css();
    var w = document.createElement('div'); w.className = 'fc-wrap'; w.id = 'fc-wrap';
    _btn = document.createElement('button'); _btn.type = 'button'; _btn.className = 'fc-btn'; _btn.textContent = '📁 Carpeta de fichas en papel';
    _btn.title = 'Elige una vez la carpeta (p. ej. Dropbox/CMUS/FICHAS EN PAPEL): cada PDF de alumno se guardará ahí solo. Clic con Alt para quitar la carpeta.';
    _btn.onclick = function (ev) { if (ev.altKey) quitar(); else elegir(); };
    _estado = document.createElement('span'); _estado.className = 'fc-est';
    w.appendChild(_btn); w.appendChild(_estado);
    ancla.insertAdjacentElement('afterend', w);
    pintarEstado();
    return true;
  }
  function vigilar(anclaId) {
    var n = 0;
    var iv = setInterval(function () { if (montar(anclaId) || ++n > 120) clearInterval(iv); }, 500);
    try {
      new MutationObserver(function () { if (!document.getElementById('fc-wrap')) montar(anclaId); })
        .observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  /* ---- API ---- */
  async function preparar() {
    // Llamar dentro del clic de «Generar PDF»: aquí sí hay gesto de usuario para pedir permiso.
    if (!soportado) return false;
    var h = await handle(); if (!h) return false;
    _ok = await permiso(h, true);
    return _ok;
  }
  async function guardar(blob, o) {
    if (!soportado) return { ok: false, motivo: 'no_soportado' };
    var h = await handle(); if (!h) return { ok: false, motivo: 'sin_carpeta' };
    if (!_ok && !(await permiso(h, false))) return { ok: false, motivo: 'sin_permiso' };
    var nombre = nombreFichero(o);
    try {
      var fh = await h.getFileHandle(nombre, { create: true });
      var w = await fh.createWritable();
      await w.write(blob); await w.close();
      toast('📁 Guardada en «' + (h.name || 'carpeta') + '»: ' + nombre, 6000);
      return { ok: true, nombre: nombre };
    } catch (e) {
      console.warn('[fichas-carpeta] no se pudo guardar', e);
      toast('⚠ No se pudo guardar la ficha en la carpeta (' + ((e && e.message) || e) + ').', 6000);
      return { ok: false, motivo: 'error', error: e };
    }
  }

  window.FichasCarpeta = { montar: vigilar, elegir: elegir, quitar: quitar, preparar: preparar, guardar: guardar, nombre: nombreFichero, soportado: soportado };
})();
