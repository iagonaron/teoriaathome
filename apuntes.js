/* =====================================================================
   VER APUNTES · LM at home (TEORÍA at home GE · TEORÍA PRO GP)
   (26-sep-2026, Iago) Apuntes re-creados a partir del Kit salvavidas 4GE
   y de los Apuntes de teoría 2GP, con la estética «at home».
   - Motor de pentagramas (VexFlow, el mismo que usan los ejercicios).
   - Visor a pantalla completa (atrás / Esc / ✕ lo cierran).
   - Botón «VER APUNTES» arriba a la izquierda de cada tarjeta, solo para
     alumnos con cuenta validada (de momento, solo cuentas tester:
     APX_SOLO_TESTER). Las tarjetas con varios temas se voltean y
     muestran las opciones.
   Datos: window.APX_TEMAS (apuntes-kit.js, apuntes-2gp.js).
   (26-sep-2026, Iago) Motor unificado: reúne en una sola versión las
   ampliaciones hechas en paralelo para intervalos, compases/escalas,
   grados/claves, términos/cadencias y los apuntes 2GP (una única
   implementación de cada cosa; copia del motor anterior: apuntes.base.js).
   ===================================================================== */
(function(){
  'use strict';
  if(window.APX) return;

  /* ---------------- configuración ---------------- */
  var CFG = window.APX_CFG || {};
  var TEMA = CFG.tema === 'gp' ? 'gp' : 'ge';
  var SOLO_TESTER = (CFG.soloTester !== false);   /* (26-sep) primero solo tester, para revisar */
  var PAL = TEMA === 'gp'
    ? { acc:'#d4af37', accP:'#a8791a', accInk:'#1a1407', accSoft:'rgba(212,175,55,.16)', ink:'#fbf7ec', muted:'#d8caa6', muted2:'#a8966a',
        bg:'radial-gradient(1100px 500px at 50% -5%, #4d3a0b 0%, transparent 60%),linear-gradient(180deg,#4d3a0b 0%,#2e2308 32%,#160f04 70%,#0a0702 100%)',
        panel:'#1d1406', line:'rgba(212,175,55,.35)', card:'#d4af37', cardInk:'#1a1407' }
    : { acc:'#e84393', accP:'#d6337f', accInk:'#fff', accSoft:'rgba(232,67,147,.14)', ink:'#e9edff', muted:'#8b97c4', muted2:'#5e6a98',
        bg:'linear-gradient(180deg,#0b1f4d 0%,#0a1430 32%,#060a18 70%,#02030a 100%)',
        panel:'#0d142e', line:'rgba(255,255,255,.12)', card:'#e84393', cardInk:'#fff' };
  var PAPER = '#f3f5ff', PINK_ON_PAPER = PAL.accP, INK_P = '#16203a', MUTED_P = '#56607e';
  var FONT = '"Helvetica Neue",Arial,system-ui,sans-serif';

  function vf(){ return (window.Vex && window.Vex.Flow) ? window.Vex.Flow : null; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function col(c){ if(!c) return null; if(c==='acc') return PINK_ON_PAPER; if(c==='gris') return '#9aa3c0'; if(c==='azul') return '#2f6df6'; return c; }

  /* =====================================================================
     1. MOTOR DE PENTAGRAMAS
     ===================================================================== */
  /* (26-sep-2026, Iago) n.guia:true → nota «de guía» (cabezas y alteraciones a 2/3, en su línea/espacio exacto; peq escala toda la figura) */
  var GUIA = 39*0.66;
  var KS_SOST=['F','C','G','D','A','E','B'], KS_BEM=['B','E','A','D','G','C','F'];
  var KS_FIFTHS={ 'C':0,'G':1,'D':2,'A':3,'E':4,'B':5,'F#':6,'C#':7,'F':-1,'Bb':-2,'Eb':-3,'Ab':-4,'Db':-5,'Gb':-6,'Cb':-7,
                  'Am':0,'Em':1,'Bm':2,'F#m':3,'C#m':4,'G#m':5,'D#m':6,'A#m':7,'Dm':-1,'Gm':-2,'Cm':-3,'Fm':-4,'Bbm':-5,'Ebm':-6,'Abm':-7 };
  function ksMap(ks){
    var f = (typeof ks==='number') ? ks : (KS_FIFTHS[ks]||0), m={};
    if(f>0) for(var i=0;i<f;i++) m[KS_SOST[i]]='#';
    if(f<0) for(var j=0;j<-f;j++) m[KS_BEM[j]]='b';
    return m;
  }
  function ksCount(ks){ var f=(typeof ks==='number')?ks:(KS_FIFTHS[ks]||0); return Math.abs(f); }
  function ksSpec(ks){ /* VexFlow quiere nombre de tonalidad; aceptamos número de quintas */
    if(typeof ks!=='number') return ks;
    var M={0:'C',1:'G',2:'D',3:'A',4:'E',5:'B',6:'F#',7:'C#','-1':'F','-2':'Bb','-3':'Eb','-4':'Ab','-5':'Db','-6':'Gb','-7':'Cb'};
    return M[String(ks)]||'C';
  }
  function accOfKey(k){ var m=k.split('/')[0]; var a=m.slice(1); return (a==='#'||a==='##'||a==='b'||a==='bb'||a==='n')?a:''; }
  function accVisible(key, map, force){
    if(force===false) return null;
    if(force) return force;
    var L=key[0].toUpperCase(), a=accOfKey(key), k=map[L]||'';
    if(a==='n') return k?'n':null;
    if(a===k) return null;
    if(a==='' && k) return 'n';
    return a||null;
  }
  function durBase(d){ var s=String(d||'w'); var r=/r$/.test(s); s=s.replace(/r$/,''); var dots=(s.match(/\./g)||[]).length; s=s.replace(/\./g,''); return {d:s,dots:dots,rest:r}; }
  function anchoMin(n){
    var b=durBase(n.d); var w = b.d==='w'?46 : b.d==='h'?38 : b.d==='q'?30 : 24;
    if(n.gr) w += 18*n.gr.length;
    if(n.par) w += 10;
    var keys = Array.isArray(n.k)?n.k:[n.k];
    keys.forEach(function(k){ if(accOfKey(k)) w+=9; });
    var lab = n.ab ? (n.ab.t!=null?n.ab.t:n.ab) : ''; if(lab) w = Math.max(w, maxLin(lab)*(n.ab.fs?n.ab.fs/2:6.2)+8);
    if(n.parG) w += 16;   /* (26-sep-2026, Iago) paréntesis grande alrededor del acorde */
    if(n.w) w = Math.max(w, n.w);
    return w;
  }
  function maxLin(t){ return String(t).replace(/<\/?[bi]>/g,'').split('\n')   /* (26-sep-2026, Iago) sin contar <b>/<i> */
    .reduce(function(a,l){ return Math.max(a,l.length); },0); }
  /* (26-sep-2026, Iago) COMPASES «RAROS» (mixtos, decimales, fraccionarios) que VexFlow no sabe escribir.
     c.tsL = lista de piezas: {n:'2', d:'4'} (fracción), {n:'2’5', d:'4'} (decimal), {n:'2', sup:'1/2', d:'4'}
     (fraccionario: la fracción pequeña arriba a la derecha), '+' (signo entre fracciones) y '=' (igual).
     Se dibujan con las cifras de compás de la fuente musical (las mismas que un 2/4 normal). */
  var TSL_PT=40, TSL_SUP=21;
  function tsLCar(ch){ if(/[0-9]/.test(ch)) return 'timeSig'+ch; if(ch==='+') return 'timeSigPlus'; if(ch==='-'||ch==='−') return 'timeSigMinus'; return null; }
  function tsLW(code, pt){ var VF=vf(); try{ return VF.Glyph.getWidth(code, pt); }catch(e){ return pt*0.45; } }
  function tsLCadW(str, pt){ var w=0; String(str).split('').forEach(function(ch){ var g=tsLCar(ch); w += g ? tsLW(g,pt) : (ch==='/' ? pt*0.28 : pt*0.25); }); return w; }
  function tsLPieza(p){ if(p==='=') return 12 + 20 + 12; if(typeof p==='string') return 8 + tsLW('timeSigPlus', 26) + 8;
    return Math.max(tsLCadW(p.n,TSL_PT), tsLCadW(p.d,TSL_PT)) + (p.sup ? tsLCadW(p.sup,TSL_SUP)+2 : 0); }
  function tsLAncho(parts){ var VF=vf(); if(!VF) return 40; return (parts||[]).reduce(function(a,p){ return a+tsLPieza(p); },0); }
  function compasMin(c, primero, clefW){
    var w = 26;
    (c.n||[]).forEach(function(n){ w += anchoMin(n); });
    if(c.n2){ var w2=26; c.n2.forEach(function(n){ w2+=anchoMin(n); }); w=Math.max(w,w2); }
    if(c.ks!=null) w += ksCount(c.ks)*10.5 + 10;
    if(c.ts) w += 26;
    if(c.tsL) w += tsLAncho(c.tsL) + 24;   /* (26-sep-2026, Iago) compás «raro» dibujado a mano */
    if(c.pad) w += c.pad;                  /* (26-sep-2026, Iago) aire antes de la primera nota */
    if(c.clef && !primero) w += 34;       /* (26-sep-2026, Iago) cambio de clave a mitad de línea */
    if(primero) w += clefW;
    if(c.minW) w = Math.max(w, c.minW);
    if(c.ab && maxLin(c.ab)*6.5+12 > w) w = maxLin(c.ab)*6.5+12;
    if(c.ar && maxLin(c.ar)*6.5 > w) w = maxLin(c.ar)*6.5;
    return w;
  }

  /* dibuja un bloque «penta» en host (div). Devuelve true si ha podido. */
  function dibujaPenta(host, S){
    var VF=vf(); host.innerHTML='';
    if(!VF){ host.innerHTML='<div class="apx-err">No se ha podido cargar el pentagrama.</div>'; return false; }
    var Wc = Math.max(260, host.clientWidth || host.getBoundingClientRect().width || 700);
    var s = Wc>=720 ? Wc/900 : Math.min(1, Math.max(0.74, Wc/520));
    var L = Math.round(Wc/s);
    var clef = S.clef||'treble', clef2 = S.clef2||null;
    /* (26-sep-2026, Iago) clef:'no' → sin clave (ritmo suelto, «pon la clave adecuada»); las notas se colocan con su n.clef o como en clave de sol */
    var sinClave = (clef==='no'); if(sinClave) clef='treble';
    var CLEFW = sinClave ? 4 : 40;
    var clefAct = clef;   /* (26-sep-2026, Iago) clave vigente: cambia con c.clef a mitad de línea */
    var comps = S.c||[];
    /* ---- reparte compases en sistemas ---- */
    /* (26-sep-2026, Iago) con sistema doble dejamos sitio a la llave (antes quedaba cortada a la izquierda); sin llave (llave:false) no hace falta */
    var X0 = (clef2 && S.llave!==false) ? 22 : 8, ANCHO = L - X0 - 8;
    var disp=ANCHO;
    function reparte(lim){
      var sis=[], cur=[], acc=0;
      var ksVig = (S.ks!=null)?S.ks:null, tsVig=S.ts||null;
      comps.forEach(function(c,i){
        var primero = cur.length===0;
        var cc = c; var extra=0;
        if(primero && c.ks==null && ksVig!=null) extra += ksCount(ksVig)*10.5+10;
        var mw = compasMin(cc, primero, CLEFW) + extra;
        var forzar = S.porLinea && cur.length>=S.porLinea;
        if(cur.length && (acc+mw>lim || c.salto || forzar)){
          /* (26-sep-2026, Iago) junto:true → este compás no se separa del anterior (una flecha o un arco los une).
             Si el anterior ya está solo en su línea, se quedan los dos en ella y la línea se comprime (ver «compr»). */
          if(c.junto && !c.salto && !forzar && cur.length===1){ /* se queda en esta línea */ }
          else if(c.junto && !c.salto && !forzar){ var prev=cur.pop(); sis.push(cur);
            var mwp = compasMin(prev.c,true,CLEFW) + ((prev.c.ks==null && prev.ksAntes!=null)?ksCount(prev.ksAntes)*10.5+10:0);
            cur=[{c:prev.c, i:prev.i, min:mwp, ksAntes:prev.ksAntes}]; acc=mwp; }
          else { sis.push(cur); cur=[]; acc=0; primero=true; mw = compasMin(cc,true,CLEFW) + ((c.ks==null && ksVig!=null)?ksCount(ksVig)*10.5+10:0); }
        }
        cur.push({c:c, i:i, min:mw, ksAntes:ksVig}); acc+=mw;
        if(c.ks!=null) ksVig=c.ks; if(c.ts) tsVig=c.ts;
      });
      if(cur.length) sis.push(cur);
      return sis;
    }
    var sistemas = reparte(disp);
    /* (26-sep-2026, Iago) equilibrar:true = si hay que partir en varias líneas, líneas de ancho parecido
       (evita un compás suelto estirado a todo lo ancho en el móvil) */
    if(S.equilibrar && sistemas.length>1){
      var nS=sistemas.length, tot=sistemas.reduce(function(a,sq){ return a+sq.reduce(function(b,it){ return b+it.min; },0); },0);
      for(var fz=1.0; fz<=1.5; fz+=0.05){ var alt=reparte(Math.min(disp, tot/nS*fz)); if(alt.length===nS){ sistemas=alt; break; } }
    }

    var hayAr = comps.some(function(c){ return c.ar || (c.n||[]).some(function(n){return n.ar;}); }) || S.arriba;
    var nLinAb = 1; comps.forEach(function(c){ (c.n||[]).concat(c.n2||[]).forEach(function(n){ var t=String(n.ab&&n.ab.t||n.ab||''); if(t) nLinAb=Math.max(nLinAb, t.split('\n').length); }); if(c.ab) nLinAb=Math.max(nLinAb, String(c.ab).split('\n').length+ (comps.some(function(x){return (x.n||[]).some(function(n){return n.ab;});})?1:0)); });
    var TOP = (S.top!=null?S.top:(hayAr?58:40)), STH=40, GAP2=(S.gap2||70);
    var BOT = (S.bot!=null?S.bot:(26 + 15*nLinAb));
    var sysH = TOP + STH + (clef2?GAP2+STH:0) + BOT;
    var H = sysH*sistemas.length + 4;

    var R = new VF.Renderer(host, VF.Renderer.Backends.SVG);
    R.resize(L, H);
    var ctx = R.getContext();
    var svg = host.querySelector('svg');
    svg.setAttribute('viewBox','0 0 '+L+' '+H); svg.setAttribute('width','100%'); svg.removeAttribute('height');
    svg.style.width='100%'; svg.style.height='auto'; svg.style.display='block';
    var NS='http://www.w3.org/2000/svg';
    var notasId={}, todas=[];
    var sisX=[];   /* (26-sep-2026, Iago) inicio de las notas y final de cada línea: para partir los arcos entre líneas */
    var ksAct = (S.ks!=null)?S.ks:null, tsAct=S.ts||null;

    /* (26-sep-2026, Iago) etiqueta con trozos en negrita/cursiva: «<b>E.F.</b>: en el bajo…» */
    function txtRico(e, li){ var bb=false, ii=false;
      li.split(/(<\/?[bi]>)/).forEach(function(p){
        if(p==='<b>') bb=true; else if(p==='</b>') bb=false; else if(p==='<i>') ii=true; else if(p==='</i>') ii=false;
        else if(p){ var ts=document.createElementNS(NS,'tspan'); if(bb) ts.setAttribute('font-weight','900'); if(ii) ts.setAttribute('font-style','italic'); ts.textContent=p; e.appendChild(ts); } });
    }
    function txt(x,y,t,o){
      o=o||{}; var lines=String(t).split('\n');
      /* (26-sep-2026, Iago) caja:'bloque' → un solo recuadro alrededor de todas las líneas (p. ej. «5J / 3M» del cifrado) */
      var bloque = (o.caja==='bloque'), els=[];
      lines.forEach(function(li,k){
        var e=document.createElementNS(NS,'text');
        e.setAttribute('x',x); e.setAttribute('y',y+k*(o.lh||14)); e.setAttribute('text-anchor',o.anchor||'middle');
        e.setAttribute('font-family',FONT); e.setAttribute('font-size',o.fs||12.5); e.setAttribute('font-weight',o.fw||600);
        if(o.it) e.setAttribute('font-style','italic');
        e.setAttribute('fill',o.color||MUTED_P);
        if(o.tach) e.setAttribute('text-decoration','line-through');
        if(/<\/?[bi]>/.test(li)) txtRico(e, li); else e.textContent=li;   /* (26-sep-2026, Iago) <b>/<i> dentro de una etiqueta */
        svg.appendChild(e); els.push(e);
        if(o.caja && !bloque){ try{ var bb=e.getBBox(); var r=document.createElementNS(NS,'rect'); r.setAttribute('x',bb.x-6); r.setAttribute('y',bb.y-3); r.setAttribute('width',bb.width+12); r.setAttribute('height',bb.height+6); r.setAttribute('rx',5); r.setAttribute('fill',o.cajaFill||'#fff'); r.setAttribute('stroke',o.color||INK_P); r.setAttribute('stroke-width','1.3'); svg.insertBefore(r,e); }catch(err){} }
      });
      if(bloque && els.length){ try{ var x0=1e9,y0b=1e9,x1=-1e9,y1=-1e9;
        els.forEach(function(e){ var bb=e.getBBox(); x0=Math.min(x0,bb.x); y0b=Math.min(y0b,bb.y); x1=Math.max(x1,bb.x+bb.width); y1=Math.max(y1,bb.y+bb.height); });
        var rb=document.createElementNS(NS,'rect'); rb.setAttribute('x',x0-6); rb.setAttribute('y',y0b-3); rb.setAttribute('width',x1-x0+12); rb.setAttribute('height',y1-y0b+6); rb.setAttribute('rx',4);
        rb.setAttribute('fill',o.cajaFill||'#fff'); rb.setAttribute('stroke',o.color||INK_P); rb.setAttribute('stroke-width','1.3'); svg.insertBefore(rb,els[0]); }catch(err){} }
    }

    /* (26-sep-2026, Iago) línea ondulada (trino, glissando) de (x1,y1) a (x2,y2) */
    function onda(x1,y1,x2,y2,o){
      o=o||{}; var dx=x2-x1, dy=y2-y1, Lw=Math.sqrt(dx*dx+dy*dy); if(Lw<2) return;
      var ux=dx/Lw, uy=dy/Lw, nx=-uy, ny=ux, amp=o.amp||2.2, lam=o.lam||6, d='', N=Math.max(4,Math.round(Lw/1.1));
      for(var i=0;i<=N;i++){ var t=i/N*Lw, s=Math.sin(t/lam*2*Math.PI)*amp; d+=(i?' L':'M')+(x1+ux*t+nx*s).toFixed(2)+' '+(y1+uy*t+ny*s).toFixed(2); }
      var p=document.createElementNS(NS,'path'); p.setAttribute('d',d); p.setAttribute('fill','none'); p.setAttribute('stroke',o.col||'#000');
      p.setAttribute('stroke-width',o.grosor||1.4); p.setAttribute('stroke-linejoin','round'); p.setAttribute('stroke-linecap','round'); svg.appendChild(p);
    }

    /* (26-sep-2026, Iago) dibuja un compás «raro» (c.tsL) a partir de x */
    function dibujaTsL(parts, x, stv){
      var yN=stv.getYForLine(2), yD=stv.getYForLine(4), yM=stv.getYForLine(2);
      function cad(str, xx, yb, pt){ String(str).split('').forEach(function(ch){ var g=tsLCar(ch);
          if(g){ VF.Glyph.renderGlyph(ctx, xx, (/Plus|Minus/.test(g) ? yb-pt*0.25 : yb), pt, g); xx += tsLW(g,pt); }
          else if(ch==='/'){ var ls=document.createElementNS(NS,'path'); var hh=pt*0.5; ls.setAttribute('d','M'+(xx+pt*0.05)+' '+(yb+1)+' L'+(xx+pt*0.24)+' '+(yb-hh)); ls.setAttribute('stroke',INK_P); ls.setAttribute('stroke-width',pt>30?'3':'1.6'); ls.setAttribute('stroke-linecap','round'); svg.appendChild(ls); xx += pt*0.28; }
          else { var tc=document.createElementNS(NS,'text'); tc.setAttribute('x',xx+pt*0.06); tc.setAttribute('y',yb+pt*0.02); tc.setAttribute('font-family','Georgia,"Times New Roman",serif'); tc.setAttribute('font-weight','900'); tc.setAttribute('font-size',pt*0.6); tc.setAttribute('fill',INK_P); tc.textContent=ch; svg.appendChild(tc); xx += pt*0.25; } });
      }
      (parts||[]).forEach(function(p){
        if(p==='='){ var pe=document.createElementNS(NS,'path'); pe.setAttribute('d','M'+(x+12)+' '+(yM-4)+' h20 M'+(x+12)+' '+(yM+4)+' h20'); pe.setAttribute('stroke',INK_P); pe.setAttribute('stroke-width','3.2'); svg.appendChild(pe); x += tsLPieza(p); return; }
        if(typeof p==='string'){ var gp=tsLCar(p)||'timeSigPlus'; VF.Glyph.renderGlyph(ctx, x+8, yM, 26, gp); x += tsLPieza(p); return; }
        var wn=tsLCadW(p.n,TSL_PT), wd=tsLCadW(p.d,TSL_PT), wm=Math.max(wn,wd);
        cad(p.n, x+(wm-wn)/2, yN, TSL_PT); cad(p.d, x+(wm-wd)/2, yD, TSL_PT);
        if(p.sup) cad(p.sup, x+(wm-wn)/2+wn+2, stv.getYForLine(0)+5, TSL_SUP);
        x += tsLPieza(p);
      });
    }

    sistemas.forEach(function(sis, si){
      var y0 = si*sysH + TOP;
      var y2 = y0 + STH + GAP2;
      var totMin = sis.reduce(function(a,b){return a+b.min;},0);
      var libre = Math.max(0, ANCHO - totMin);
      var totW = sis.reduce(function(a,b){return a+(b.c.w||1);},0);
      var compr = totMin > ANCHO ? ANCHO/totMin : 1;   /* (26-sep-2026, Iago) línea que no cabe (compases «junto»): se comprime en vez de salirse */
      var x = X0;
      /* llave del sistema doble */
      sis.forEach(function(it, k){
        var c=it.c, w = it.min*compr + libre*((c.w||1)/totW);
        if(S.justificar===false) w = it.min*ANCHO/Math.max(totMin, ANCHO) ;
        var st = new VF.Stave(x, y0-40, w), st2=null;   /* VexFlow deja 4 espacios encima: así la 1ª línea cae en y0 */
        if(clef2) st2 = new VF.Stave(x, y2-40, w);
        /* (26-sep-2026, Iago) cambio de clave (c.clef): la nueva clave se dibuja al empezar ese compás */
        var cambioClave = (c.clef && c.clef!==clefAct); if(c.clef) clefAct=c.clef;
        if(k===0){ if(!sinClave) st.addClef(clefAct); if(st2) st2.addClef(clef2); }
        else { if(cambioClave) st.addClef(clefAct); else st.clef=clefAct; if(st2) st2.clef=clef2; }   /* st.clef: la armadura a mitad de línea se coloca según la clave vigente */
        /* (26-sep-2026, Iago) pentagrama sin líneas (S.lineas:0) o de una sola línea (S.lineas:1) */
        if(S.lineas!=null){ try{ st.setConfigForLines([0,1,2,3,4].map(function(li){ return {visible: S.lineas===1 && li===2}; })); }catch(e){} }
        var ksHere = (c.ks!=null) ? c.ks : (k===0 ? ksAct : null);
        if(ksHere!=null && (ksCount(ksHere)>0 || c.ks!=null)){ if(ksCount(ksHere)>0){ st.addKeySignature(ksSpec(ksHere)); if(st2) st2.addKeySignature(ksSpec(ksHere)); } else if(c.ksCancel){ st.addKeySignature('C', ksSpec(c.ksCancel)); } }
        if(c.ks!=null) ksAct=c.ks;
        if(c.ts){ st.addTimeSignature(c.ts); if(st2) st2.addTimeSignature(c.ts); tsAct=c.ts; }
        var ultimo = (it.i===comps.length-1);
        var fin = c.fin || (ultimo ? (S.fin||'|.') : '|');
        var BT=VF.Barline.type;
        /* (26-sep-2026, Iago) barras especiales, dibujadas aparte: «¦» = discontinua · «;» = punteada (como el \bar ";" de LilyPond);
           «:|:» = repetición a ambos lados */
        var discont = (fin==='¦'), punteada = (fin===';'), sinBarra = (fin===' ' || discont || punteada);
        var bt = fin==='||'?BT.DOUBLE : fin==='|.'?BT.END : fin===':|'?BT.REPEAT_END : fin===':|:'?BT.REPEAT_BOTH : sinBarra?BT.NONE : BT.SINGLE;
        st.setEndBarType(bt); if(st2) st2.setEndBarType(bt);
        /* (26-sep-2026, Iago) sin barra al empezar: tras una barra invisible, discontinua o punteada (si no, se vería una barra normal encima),
           con ini:' ' (escala o serie partida en dos «compases») y en el pentagrama sin líneas (S.lineas:0) */
        var finPrev = k>0 ? (sis[k-1].c.fin||'|') : null;
        if((k===0 && S.lineas===0) || (k>0 && (c.ini===' ' || finPrev===' ' || finPrev==='¦' || finPrev===';'))){ st.setBegBarType(BT.NONE); if(st2) st2.setBegBarType(BT.NONE); }
        if(c.ini==='|:'){ st.setBegBarType(BT.REPEAT_BEGIN); if(st2) st2.setBegBarType(BT.REPEAT_BEGIN); }
        if(c.volta){ try{ st.setVoltaType(c.volta.fin?VF.Volta.type.BEGIN_END:VF.Volta.type.BEGIN, c.volta.t, -8); }catch(e){} }
        if(c.rep){ try{ st.setRepetitionTypeRight(VF.Repetition.type[c.rep], 6); }catch(e){} }
        /* (26-sep-2026, Iago) compás «raro» (c.tsL) y aire antes de la primera nota (c.pad) */
        var tsLx=null; if(c.tsL){ var xT=st.getNoteStartX(); tsLx = xT + (k===0 && sinClave ? 2 : 8); st.setNoteStartX(tsLx + tsLAncho(c.tsL) + 22); if(st2) st2.setNoteStartX(st.getNoteStartX()); }
        if(c.pad){ st.setNoteStartX(st.getNoteStartX()+c.pad); if(st2) st2.setNoteStartX(st.getNoteStartX()); }
        st.setContext(ctx).draw(); if(st2) st2.setContext(ctx).draw();
        if(c.tsL){ try{ dibujaTsL(c.tsL, tsLx, st); }catch(e){} }
        if(k===0) sisX[si] = {ini: st.getNoteStartX(), fin: L-8};
        /* (26-sep-2026, Iago) llave:false → sistema doble sin llave (solo la barra de la izquierda) */
        if(st2 && k===0){ try{ if(S.llave!==false) new VF.StaveConnector(st,st2).setType(VF.StaveConnector.type.BRACE).setContext(ctx).draw(); new VF.StaveConnector(st,st2).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw(); }catch(e){} }
        if(st2 && !sinBarra){ try{ new VF.StaveConnector(st,st2).setType(VF.StaveConnector.type.SINGLE_RIGHT).setContext(ctx).draw(); }catch(e){} }
        /* (26-sep-2026, Iago) la doble barra final atraviesa también el hueco entre los dos pentagramas */
        if(st2 && (fin==='|.' || fin==='||')){ try{ new VF.StaveConnector(st,st2).setType(fin==='|.'?VF.StaveConnector.type.BOLD_DOUBLE_RIGHT:VF.StaveConnector.type.THIN_DOUBLE).setContext(ctx).draw(); }catch(e){} }
        /* (26-sep-2026, Iago) barra discontinua «¦» (p. ej. separa la escritura de su abreviatura); en el sistema doble atraviesa los dos pentagramas */
        if(discont){ var pd=document.createElementNS(NS,'path'); var xd=x+w-0.5, yd0=st.getYForLine(0)+2, yd1=(st2||st).getYForLine(4)+6;
          pd.setAttribute('d','M'+xd+' '+yd0+' L'+xd+' '+yd1); pd.setAttribute('stroke',INK_P); pd.setAttribute('stroke-width','1.3'); pd.setAttribute('stroke-dasharray','5 4'); svg.appendChild(pd); }
        /* (26-sep-2026, Iago) barra punteada «;» (en cada pentagrama) */
        if(punteada){ [st].concat(st2?[st2]:[]).forEach(function(s9){ var ln=document.createElementNS(NS,'line'); var xl=x+w-1;
            ln.setAttribute('x1',xl); ln.setAttribute('x2',xl); ln.setAttribute('y1',s9.getYForLine(0)+1); ln.setAttribute('y2',s9.getYForLine(4));
            ln.setAttribute('stroke',INK_P); ln.setAttribute('stroke-width','1.6'); ln.setAttribute('stroke-linecap','round'); ln.setAttribute('stroke-dasharray','0.1 4'); svg.appendChild(ln); }); }
        /* (26-sep-2026, Iago) silencio de varios compases (multi:6) */
        if(c.multi){ try{ var mmr=new VF.MultiMeasureRest(c.multi,{number_of_measures:c.multi, padding_left:c.multiPad||12, padding_right:c.multiPad||12}); mmr.setStave(st); mmr.setContext(ctx).draw(); }catch(e){ console.warn('[apuntes] multi',e); } }
        /* marco (sombreado) del compás */
        if(c.marco){ var rr=document.createElementNS(NS,'rect'); var mx=st.getNoteStartX()+4, mw2=(x+w)-mx-10;
          rr.setAttribute('x',mx); rr.setAttribute('y',y0-4); rr.setAttribute('width',Math.max(10,mw2)); rr.setAttribute('height',STH+(st2?GAP2+STH:0)+8+18);
          rr.setAttribute('rx',8); rr.setAttribute('fill', c.marco==='gris'?'rgba(120,130,160,.16)':PAL.accSoft.replace('.14','.18').replace('.16','.2')); svg.insertBefore(rr, svg.firstChild); }

        var mapa = ksMap(ksAct!=null?ksAct:0);
        function hazNotas(arr, stave, clefN){
          var res=[];
          (arr||[]).forEach(function(n){
            var b=durBase(n.d);
            var keys = Array.isArray(n.k)?n.k.slice():[n.k||'b/4'];
            /* (26-sep-2026, Iago) signos de repetición como nota: rep:'1' (compás igual al anterior) · rep:'slash' (la parte se repite) */
            if(n.rep){ var rn=null; try{ rn=new VF.RepeatNote(n.rep,{duration:b.d}); }catch(e){}
              if(rn){ rn.__n=n; res.push(rn); return; } }
            var sn = new VF.StaveNote({keys:keys.map(function(kk){ return kk.replace(/n(?=\/)/,''); }), duration:b.d+(b.rest?'r':''), dots:b.dots, clef:n.clef||clefN, auto_stem:(n.plica==null), stem_direction:(n.plica==='arriba'?1:n.plica==='abajo'?-1:undefined), glyph_font_scale:(n.guia?GUIA:undefined)});
            if(!b.rest) keys.forEach(function(kk,j){ var f = Array.isArray(n.acc)?n.acc[j]:n.acc; var a=accVisible(kk,mapa,f); if(a){ var ac=new VF.Accidental(a); if(n.guia){ try{ ac.render_options.font_scale=GUIA; ac.reset(); }catch(e){} } sn.addModifier(ac, j); } });
            if(b.dots){ try{ VF.Dot.buildAndAttach([sn],{all:true}); }catch(e){} }
            if(n.art){ String(n.art).split(',').forEach(function(a){ var code = a==='>'?'a>':a==='.'?'a.':a==='-'?'a-':a==='^'?'a^':a==='fermata'?'a@a':a; try{ sn.addModifier(new VF.Articulation(code).setPosition(n.artAbajo?VF.Modifier.Position.BELOW:VF.Modifier.Position.ABOVE),0); }catch(e){} }); }
            /* (26-sep-2026, Iago) orn también admite objeto(s): {t:'mordent', arriba:'b', abajo:'#' (alteraciones del signo),
               pos:'abajo' (signo debajo de la nota), espejo:true (grupeto invertido), diferido:true (entre dos notas),
               onda:60 (línea ondulada del trino, en px), dx, dy} */
            if(n.orn){ [].concat(n.orn).forEach(function(o){ var O=(typeof o==='string')?{t:o}:o; try{ var orn=new VF.Ornament(O.t);
                if(O.arriba) orn.setUpperAccidental(O.arriba); if(O.abajo) orn.setLowerAccidental(O.abajo); if(O.diferido) orn.setDelayed(true);
                sn.addModifier(orn,0); (sn.__orns=sn.__orns||[]).push({o:orn, O:O}); }catch(e){ console.warn('[apuntes] orn',e); } }); }
            if(n.trem){ try{ sn.addModifier(new VF.Tremolo(n.trem),0); }catch(e){} }
            if(n.par){ try{ VF.Parenthesis.buildAndAttach([sn]); }catch(e){} }
            if(n.gr){ try{ var gns=n.gr.map(function(g){ var gg=new VF.GraceNote({keys:[g.k], duration:g.d||'8', slash:!!g.slash}); var ga=accVisible(g.k,mapa,g.acc); if(ga) gg.addModifier(new VF.Accidental(ga),0); return gg; });
                var grp=new VF.GraceNoteGroup(gns, !!n.grLiga); if(gns.length>1) grp.beamNotes(); sn.addModifier(grp,0); }catch(e){} }
            var cc=col(n.col); if(cc){ try{ sn.setStyle({fillStyle:cc,strokeStyle:cc}); }catch(e){} }
            if(n.colK){ n.colK.forEach(function(j){ try{ sn.setKeyStyle(j,{fillStyle:PINK_ON_PAPER,strokeStyle:PINK_ON_PAPER}); }catch(e){} }); }
            if(n.inv){ try{ sn.setStyle({fillStyle:'transparent',strokeStyle:'transparent'}); }catch(e){} }
            /* (26-sep-2026, Iago) sinCabeza: solo plica/corchete/barra (abreviatura «solo plicas») */
            if(n.sinCabeza){ keys.forEach(function(kk,j){ try{ sn.setKeyStyle(j,{fillStyle:'transparent',strokeStyle:'transparent'}); }catch(e){} }); try{ sn.setLedgerLineStyle({fillStyle:'transparent',strokeStyle:'transparent'}); }catch(e){} }
            /* (26-sep-2026, Iago) sinPlica:true (o plica:false) → solo la cabeza, sin plica ni corchete («do pequeñito», acordes «ordenados»).
               La plica sigue existiendo para VexFlow (misma colocación), solo que no se ve. */
            if(n.sinPlica || n.plica===false){ try{ sn.getStem().setVisibility(false); }catch(e){} try{ sn.setFlagStyle({fillStyle:'transparent',strokeStyle:'transparent'}); }catch(e){} }
            sn.__n=n; res.push(sn);
          });
          return res;
        }
        var N1 = hazNotas(c.n, st, clefAct), N2 = st2 ? hazNotas(c.n2, st2, clef2) : [];
        var voces=[]; var ts=tsAct?tsAct.split('/'):null;
        function voz(notes){ var v=new VF.Voice({num_beats:ts?+ts[0]:4, beat_value:ts?+ts[1]:4}); v.setMode(VF.Voice.Mode.SOFT); v.addTickables(notes); return v; }
        var v1 = N1.length?voz(N1):null, v2 = N2.length?voz(N2):null;
        if(v1) voces.push(v1); if(v2) voces.push(v2);
        /* (26-sep-2026, Iago) v2: segunda voz en el pentagrama de arriba (plicas abajo salvo que se diga otra cosa) */
        var N1b = c.v2 ? hazNotas(c.v2.map(function(q){ var o={}; for(var kq in q) o[kq]=q[kq]; if(o.plica==null) o.plica='abajo'; return o; }), st, clefAct) : [];
        var v1b = N1b.length?voz(N1b):null; if(v1b) voces.push(v1b);
        var beams=[];
        function vigas(notes, spec){
          if(!notes.length) return;
          if(spec===false) return;
          /* (26-sep-2026, Iago) grupos explícitos: plicas comunes calculadas por la viga, salvo que alguna nota fije su plica */
          if(Array.isArray(spec)){ spec.forEach(function(g){ var grp=notes.slice(g[0],g[1]+1); if(grp.length>1) beams.push(new VF.Beam(grp, !grp.some(function(q){ return q.__n && q.__n.plica; }))); }); return; }
          var hay = notes.some(function(n){ return /^(8|16|32)$/.test(durBase(n.__n.d).d); });
          if(!hay) return;
          var groups=null; if(ts){ var den=+ts[1], num=+ts[0]; if(den===8 && num%3===0) groups=[new VF.Fraction(3,8)]; else groups=[new VF.Fraction(1,den===8?8:4)]; if(den===8&&num%3!==0) groups=[new VF.Fraction(2,8)]; }
          /* (26-sep-2026, Iago) si alguna nota fija la plica, las vigas automáticas la respetan */
          var cfgB = groups?{groups:groups}:{}; if(notes.some(function(q){ return q.__n && q.__n.plica; })) cfgB.maintain_stem_directions=true;
          try{ beams = beams.concat(VF.Beam.generateBeams(notes, cfgB)); }catch(e){}
        }
        vigas(N1, c.bm); vigas(N2, c.bm2); vigas(N1b, c.bmV2);
        if(voces.length){
          var fmt=new VF.Formatter(); voces.forEach(function(v){ fmt.joinVoices([v]); });
          var ancho = (x+w) - st.getNoteStartX() - 16;
          try{ fmt.format(voces, Math.max(20, ancho)); }catch(e){ try{ new VF.Formatter().format(voces, Math.max(20,ancho)); }catch(e2){} }
          /* pocas notas (redondas de ejemplo): repartidas por el compás en vez de amontonadas a la izquierda */
          /* (26-sep-2026, Iago) centrar:true (en el compás o en todo el pentagrama) también reparte las redondas del sistema doble;
             las notas sinPlica cuentan como redondas */
          var cenW = (c.centrar!=null) ? c.centrar : S.centrar;
          if(cenW!==false && N1.length && N1.length<=4 && (!N2.length || (cenW===true && N2.length===N1.length)) && (cenW===true || N1.every(function(q){ return (durBase(q.__n.d).d==='w' || q.__n.sinPlica) && !q.__n.gr; }))){
            try{ var ini=st.getNoteStartX(), fin2=(x+w)-12, paso=(fin2-ini)/N1.length;
              N1.forEach(function(q,qi){ var tc=q.getTickContext(); var dx = (ini + paso*(qi+0.5) - 8) - ini; if(c.izq) dx = 14 + qi*Math.min(paso, 70); tc.setX(dx); }); }catch(e){}
          }
          /* (26-sep-2026, Iago) pegar:px = la nota se coloca a px de la anterior (p. ej. la notita entre paréntesis del tierce coulé) */
          N1.forEach(function(q,qi){ if(qi>0 && q.__n && q.__n.pegar!=null){ try{ q.getTickContext().setX(N1[qi-1].getTickContext().getX() + q.__n.pegar); }catch(e){} } });
          if(v1) v1.draw(ctx, st); if(v2) v2.draw(ctx, st2); if(v1b) v1b.draw(ctx, st);
          beams.forEach(function(bm){ try{ bm.setContext(ctx).draw(); }catch(e){} });
        }
        /* (26-sep-2026, Iago) barras entre dos notas (trémolo medido o no): tremEntre:[{de:0, a:1, n:2}] */
        (c.tremEntre||[]).forEach(function(te){ try{
          var A1=N1[te.de], B1=N1[te.a]; var xa=A1.getStemX(), xb=B1.getStemX(); var ea=A1.getStemExtents(), eb=B1.getStemExtents();
          var up=A1.getStemDirection()>0, g=te.hueco!=null?te.hueco:7, gros=te.grosor||4.6, sep=te.sep||7.6;
          var ya=ea.topY + (up?4:-4), yb=eb.topY + (up?4:-4);
          for(var q=0;q<(te.n||2);q++){ var o=(up?1:-1)*q*sep, x1=xa+g, x2=xb-g, y1=ya+o+(yb-ya)*(g/(xb-xa)), y2=yb+o-(yb-ya)*(g/(xb-xa));
            var pb=document.createElementNS(NS,'path'); pb.setAttribute('d','M'+x1+' '+y1+' L'+x2+' '+y2+' L'+x2+' '+(y2+(up?gros:-gros))+' L'+x1+' '+(y1+(up?gros:-gros))+' Z');
            pb.setAttribute('fill','#000'); svg.appendChild(pb); }
        }catch(e){ console.warn('[apuntes] tremEntre',e); } });
        /* grupos irregulares */
        (c.tup||[]).forEach(function(tp){ try{ var ns=N1.slice(tp.de, tp.a+1); new VF.Tuplet(ns,{num_notes:tp.num||ns.length, notes_occupied:tp.ocupa||2, ratioed:!!tp.ratio /* (26-sep-2026, Iago) «6», no «6:4» */, bracketed:tp.corchete!==false && !ns.every(function(q){return /^(8|16|32)$/.test(durBase(q.__n.d).d);}) }).setContext(ctx).draw(); }catch(e){} });
        /* notas pequeñas, etiquetas y ids */
        var yInf = st.getYForLine(4), ySup = st.getYForLine(0);
        var yInf2 = st2 ? st2.getYForLine(4) : null;
        function post(arr, esAbajo2){
          arr.forEach(function(sn){
            var n=sn.__n, xN=0; try{ xN = sn.getAbsoluteX() + (sn.getGlyphWidth?sn.getGlyphWidth()/2:5); }catch(e){}
            var ys=[]; try{ ys=sn.getYs(); }catch(e){}
            if(n.peq){ try{ var el=sn.getSVGElement(); var yy=ys[0]||yInf; if(el) el.setAttribute('transform','translate('+xN+' '+yy+') scale('+(n.peq===true?0.68:n.peq)+') translate('+(-xN)+' '+(-yy)+')'); }catch(e){} }
            /* (26-sep-2026, Iago) dx: desplaza la nota dibujada (p. ej. la notita entre paréntesis pegada al acorde) */
            if(n.dx){ try{ var elx=sn.getSVGElement(); if(elx) elx.setAttribute('transform','translate('+n.dx+' 0) '+(elx.getAttribute('transform')||'')); xN+=n.dx; }catch(e){} }
            var info={x:xN, ys:ys, yTop:Math.min.apply(null, ys.length?ys:[ySup]), yBot:Math.max.apply(null, ys.length?ys:[yInf]), st: esAbajo2?st2:st, sis:si};
            info.sn=sn; info.yInfSt=(esAbajo2?yInf2:yInf); info.ySupSt=(esAbajo2?st2.getYForLine(0):ySup);
            if(n.id) notasId[n.id]=info; todas.push(info);
            /* (26-sep-2026, Iago) ajustes de los adornos: debajo de la nota, en espejo, desplazados y línea ondulada del trino */
            (sn.__orns||[]).forEach(function(oo){ try{
              var O=oo.O, g=svg.querySelector('#vf-'+oo.o.getAttribute('id')); if(!g) return; var bb=g.getBBox(); var tr='';
              var dx=O.dx||0, dy=O.dy||0;
              if(O.pos==='abajo'){ dy += Math.max(info.yInfSt+9, info.yBot+12) - bb.y; dx += xN - (bb.x+bb.width/2); }
              if(dx||dy) tr+='translate('+dx+' '+dy+') ';
              if(O.espejo){ var cxm=bb.x+bb.width/2; tr+='matrix(-1 0 0 1 '+(2*cxm)+' 0)'; }
              if(tr) g.setAttribute('transform',tr);
              if(O.onda){ var xo=bb.x+bb.width+dx+3, yo=bb.y+dy+bb.height*0.55; onda(xo, yo, xo+O.onda, yo, {amp:2.3, lam:6.2, grosor:1.5}); }
            }catch(e){ console.warn('[apuntes] orn post',e); } });
            var base = esAbajo2 ? (yInf2+26) : ((st2 && !esAbajo2) ? (yInf + 24) : (yInf+26));
            if(n.ab){ var t=n.ab.t!=null?n.ab.t:n.ab; var yb = Math.max(base, info.yBot+22) + (n.ab.dy||0);
              txt(xN + (n.ab.dx||0), yb, t, {color: n.ab.col?col(n.ab.col):(n.col==='acc'?PINK_ON_PAPER:MUTED_P), fw:n.ab.fw||(n.col==='acc'?800:600), fs:n.ab.fs||12.5, tach:n.ab.tach, it:n.ab.it, caja:n.ab.caja}); }
            if(n.ar){ var ta=n.ar.t!=null?n.ar.t:n.ar; var ya = Math.min(ySup-10, info.yTop-16) + (n.ar.dy||0);
              txt(xN + (n.ar.dx||0), ya, ta, {color: n.ar.col?col(n.ar.col):(n.col==='acc'?PINK_ON_PAPER:MUTED_P), fw:n.ar.fw||700, fs:n.ar.fs||12, it:n.ar.it, caja:n.ar.caja}); }
            /* (26-sep-2026, Iago) notas de guía: VexFlow dibuja las líneas adicionales con el ancho de una cabeza normal; las acortamos a la cabeza pequeña */
            if(n.guia){ try{ var elg=sn.getSVGElement(), xh0=sn.getAbsoluteX(), gwh=sn.getGlyphWidth();
                [].forEach.call(elg?elg.querySelectorAll('path'):[], function(pl){ var m=/^M\s*([\d.\-]+)[\s,]+([\d.\-]+)\s*L\s*([\d.\-]+)[\s,]+([\d.\-]+)\s*$/.exec(pl.getAttribute('d')||'');
                  if(m && Math.abs(+m[2]-(+m[4]))<0.01 && Math.abs(+m[3]-(+m[1]))>4){ pl.setAttribute('d','M'+(xh0-3)+' '+m[2]+' L'+(xh0+gwh+3)+' '+m[4]); } }); }catch(e){} }
            /* (26-sep-2026, Iago) parG:true → un solo paréntesis grande alrededor de todo el acorde (con sus alteraciones) */
            if(n.parG){ try{ var mt=sn.getMetrics(), x0p=sn.getAbsoluteX(), gwp=sn.getGlyphWidth();
                var xl=x0p-(mt.modLeftPx||0)-(mt.leftDisplacedHeadPx||0)-5, xr=x0p+gwp+(mt.rightDisplacedHeadPx||0)+6;
                var ytp=info.yTop-(n.guia?6:8), ybp=info.yBot+(n.guia?6:8), ymp=(ytp+ybp)/2, bul=Math.max(3.5,(ybp-ytp)*0.13);
                [[xl,-1],[xr,1]].forEach(function(q){ var xx=q[0], sg=q[1], pp=document.createElementNS(NS,'path');
                  pp.setAttribute('d','M'+(xx-sg*bul*0.2)+' '+ytp+' Q'+(xx+sg*bul*1.1)+' '+ymp+' '+(xx-sg*bul*0.2)+' '+ybp+' Q'+(xx+sg*bul*0.45)+' '+ymp+' '+(xx-sg*bul*0.2)+' '+ytp+' Z');
                  var cp=col(n.col)||INK_P; pp.setAttribute('fill',cp); pp.setAttribute('stroke',cp); pp.setAttribute('stroke-width','0.6'); svg.appendChild(pp); }); }catch(e){} }
            if(n.flecha==='der-abajo' || n.flecha==='der-arriba'){ var xa=xN+13, ya1=(n.flecha==='der-abajo')?info.yBot-9:info.yTop+9, yb1=(n.flecha==='der-abajo')?info.yBot+5:info.yTop-5, sg=(yb1>ya1)?-1:1;
              var pf=document.createElementNS(NS,'path'); pf.setAttribute('d','M'+xa+' '+ya1+' L'+xa+' '+yb1+' M'+(xa-3.5)+' '+(yb1+sg*4.5)+' L'+xa+' '+yb1+' L'+(xa+3.5)+' '+(yb1+sg*4.5));
              pf.setAttribute('stroke', col(n.flechaCol||'acc')); pf.setAttribute('stroke-width','1.7'); pf.setAttribute('fill','none'); pf.setAttribute('stroke-linecap','round'); svg.appendChild(pf); }
            else if(n.flecha){ var dir=n.flecha; var fy = dir==='arriba' ? info.yBot+8 : info.yTop-8;
              var p=document.createElementNS(NS,'path'); var L2=16, sgn=(dir==='arriba')?1:-1;
              var yA=fy + sgn*L2, yB=fy;
              p.setAttribute('d','M'+xN+' '+yA+' L'+xN+' '+yB+' M'+(xN-4)+' '+(yB+sgn*5)+' L'+xN+' '+yB+' L'+(xN+4)+' '+(yB+sgn*5));
              p.setAttribute('stroke', col(n.flechaCol||'acc')); p.setAttribute('stroke-width','1.8'); p.setAttribute('fill','none'); p.setAttribute('stroke-linecap','round'); svg.appendChild(p); }
          });
        }
        post(N1,false); post(N2,true); post(N1b,false);
        /* (26-sep-2026, Iago) barraDer:'¦' → línea discontinua entre esta nota y la siguiente, dentro del mismo compás (enarmonías: la nota | sus dos enarmónicos) */
        N1.forEach(function(sn,qi){ var sig=N1[qi+1]; if(!sn.__n.barraDer || !sig) return;
          try{ var xa=sn.getAbsoluteX()+sn.getGlyphWidth(), xb=sig.getAbsoluteX()-((sig.getMetrics()||{}).modLeftPx||0), xm=(xa+xb)/2;
            var pb=document.createElementNS(NS,'path'); pb.setAttribute('d','M'+xm+' '+(st.getYForLine(0)+2)+' L'+xm+' '+(st.getYForLine(4)+6));
            pb.setAttribute('stroke',INK_P); pb.setAttribute('stroke-width','1.3'); pb.setAttribute('stroke-dasharray','5 4'); svg.appendChild(pb); }catch(e){} });
        /* textos del compás */
        var xs = st.getNoteStartX();
        if(c.ar){ txt(c.arC? x+w/2 : xs+2, y0 - (c.arY||22), c.ar, {anchor:c.arC?'middle':'start', color:c.arCol?col(c.arCol):INK_P, fw:c.arFw||700, fs:c.arFs||12.5, it:c.arIt}); }
        if(c.ab){ var yb2 = (st2? yInf2 : yInf) + 26 + ((c.n||[]).some(function(n){return n.ab;})?16:0) + (c.abY||0);
          /* (26-sep-2026, Iago) abFin:true → texto centrado sobre la barra final del compás (abarca este compás y el siguiente); si es el último de la línea, centrado normal */
          var xAb = (c.abFin && k<sis.length-1) ? (x+w) : (c.abC===false? xs+2 : (x + (st.getNoteStartX()-x) + ((x+w)-st.getNoteStartX())/2));
          var ancAb = (c.abC===false && !(c.abFin && k<sis.length-1))?'start':'middle';
          txt(xAb, yb2, c.ab, {anchor:ancAb, color:c.abCol?col(c.abCol):INK_P, fw:c.abFw||700, fs:c.abFs||12.5, it:c.abIt, caja:c.abCaja});
          /* (26-sep-2026, Iago) ab2: segunda etiqueta debajo de la del compás y alineada con ella (p. ej. la respuesta en caja) */
          if(c.ab2){ var o2=(typeof c.ab2==='string')?{t:c.ab2}:c.ab2;
            txt(xAb+(o2.dx||0), yb2 + String(c.ab).split('\n').length*14 + 12 + (o2.dy||0), o2.t, {anchor:ancAb, color:o2.col?col(o2.col):INK_P, fw:o2.fw||800, fs:o2.fs||14, it:o2.it, caja:o2.caja}); } }
        var ksGlifos=null;
        function glifosKs(){ if(ksGlifos) return ksGlifos; ksGlifos=[]; try{ ksGlifos=[].slice.call(svg.querySelectorAll('path')).map(function(p){ var bb=null; try{bb=p.getBBox();}catch(e){} return {p:p,bb:bb}; })
                .filter(function(o){ return o.bb && o.bb.width>0 && o.bb.width<16 && o.bb.height>6 && o.bb.height<34 && o.bb.x>x+(k===0?CLEFW-4:2) && o.bb.x<st.getNoteStartX() && o.bb.y>y0-30 && o.bb.y<y0+STH+20; });
                ksGlifos.sort(function(a,b){return a.bb.x-b.bb.x;}); }catch(e){} return ksGlifos; }
        if(c.ksCol){ /* colorear alteraciones de la armadura */
          try{ var idxs=c.ksCol; var cand=glifosKs(); cand.forEach(function(o,ii){ if(idxs==='todas' || idxs.indexOf(ii)>=0){ o.p.setAttribute('fill',PINK_ON_PAPER); } }); }catch(e){}
        }
        if(c.ksFlecha!=null){ /* flecha a una alteración de la armadura: {i, txt} */
          try{ var fl=c.ksFlecha; var gl=glifosKs()[fl.i]; var xk = gl ? gl.bb.x+gl.bb.width/2 : (x + (k===0?CLEFW:6) + 2 + fl.i*10.5 + 5); var yb3 = gl ? gl.bb.y+gl.bb.height+2 : yInf+4;
            var p2=document.createElementNS(NS,'path'); var ya2=yInf+16;
            var ang3=Math.atan2(yb3-ya2, xk-(xk+34)), s3=7;
            p2.setAttribute('d','M'+(xk+34)+' '+ya2+' L'+xk+' '+yb3+' M'+(xk-s3*Math.cos(ang3-0.45))+' '+(yb3-s3*Math.sin(ang3-0.45))+' L'+xk+' '+yb3+' L'+(xk-s3*Math.cos(ang3+0.45))+' '+(yb3-s3*Math.sin(ang3+0.45)));
            p2.setAttribute('stroke',PINK_ON_PAPER); p2.setAttribute('stroke-width','1.9'); p2.setAttribute('fill','none'); p2.setAttribute('stroke-linecap','round'); p2.setAttribute('stroke-linejoin','round'); svg.appendChild(p2);
            if(fl.txt) txt(xk+28, ya2+12, fl.txt, {anchor:'start', color:PINK_ON_PAPER, fw:800, fs:12.5}); }catch(e){}
        }
        x += w;
      });
      if(sisX[si]) sisX[si].fin = x;
    });

    /* ---- anotaciones entre notas ---- */
    (S.a||[]).forEach(function(A){
      var a=notasId[A.de], b=notasId[A.a];
      var c2 = col(A.col)||(A.dash?MUTED_P:INK_P);
      if(A.t==='arco' && a && b && a.sis!==b.sis && sisX[a.sis] && sisX[b.sis]){
        /* (26-sep-2026, Iago) arco entre notas que han caído en líneas distintas (pantallas estrechas):
           se parte en dos, como una ligadura entre sistemas (sale por la derecha y entra por la izquierda) */
        var arr9 = A.lado!=='abajo', sg9 = arr9 ? -1 : 1;
        var ya9 = arr9 ? a.yTop-10 : a.yBot+10, yb9 = arr9 ? b.yTop-10 : b.yBot+10;
        var xf9 = sisX[a.sis].fin - 3, xi9 = sisX[b.sis].ini - 6;
        var al1 = A.alto!=null?A.alto:Math.min(46, 14+Math.abs(xf9-a.x)*0.12), al2 = A.alto!=null?A.alto:Math.min(46, 14+Math.abs(b.x-xi9)*0.12);
        var tramos9 = (A.forma==='v')
          ? [['M'+(a.x+(A.dx1||0))+' '+ya9+' L'+xf9+' '+(ya9+sg9*al1)], ['M'+(xi9+6)+' '+(yb9+sg9*al2)+' L'+(b.x+(A.dx2||0))+' '+yb9]]   /* forma:'v' → media «V» a cada lado */
          : [['M'+(a.x+(A.dx1||0))+' '+ya9+' Q'+(a.x+(xf9-a.x)*0.6)+' '+(ya9+sg9*al1)+' '+xf9+' '+(ya9+sg9*al1*0.8)],
             ['M'+xi9+' '+(yb9+sg9*al2*0.8)+' Q'+(xi9+(b.x-xi9)*0.4)+' '+(yb9+sg9*al2)+' '+(b.x+(A.dx2||0))+' '+yb9]];
        tramos9.forEach(function(dd){
          var p9=document.createElementNS(NS,'path'); p9.setAttribute('d',dd[0]); p9.setAttribute('fill','none'); p9.setAttribute('stroke',c2); p9.setAttribute('stroke-width',A.dash?1.5:1.7);
          if(A.dash) p9.setAttribute('stroke-dasharray','5 4'); svg.appendChild(p9); });
        if(A.txt){ txt((a.x+xf9)/2, ya9+sg9*al1 + (arr9?-4:12), A.txt, {color:c2, fw:700, fs:11.5}); }
        return;
      }
      if(A.t==='v' && a && b){
        /* (26-sep-2026, Iago) marca de semitono «∨» entre dos notas (debajo del pentagrama); raiz:true → «√» cuyo trazo largo sube hasta la nota b (su alteración) */
        var arrV = (A.lado==='arriba');
        var yLin = arrV ? Math.min(a.st.getYForLine(0), b.st.getYForLine(0)) : Math.max(a.st.getYForLine(4), b.st.getYForLine(4));
        var pv=document.createElementNS(NS,'path'), dV;
        if(A.raiz){
          var dAB=b.x-a.x;
          dV = 'M'+(a.x+dAB*(A.ini!=null?A.ini:0.35))+' '+(yLin-6)+' L'+(a.x+dAB*(A.fin!=null?A.fin:0.5))+' '+(yLin+8)+' L'+(b.x-(A.rx!=null?A.rx:21))+' '+(b.yTop-(A.ry!=null?A.ry:18));
        } else {
          var xL=a.x+(b.x-a.x)*(A.ini!=null?A.ini:0.28), xR=a.x+(b.x-a.x)*(A.fin!=null?A.fin:0.72), sgV=arrV?-1:1;
          var yT=(arrV ? Math.min(yLin, a.yTop, b.yTop) : Math.max(yLin, a.yBot, b.yBot)) + sgV*(A.dy!=null?A.dy:5), hV=A.alto||16;
          dV = 'M'+xL+' '+yT+' L'+((xL+xR)/2)+' '+(yT+sgV*hV)+' L'+xR+' '+yT;
        }
        pv.setAttribute('d',dV); pv.setAttribute('fill','none'); pv.setAttribute('stroke',col(A.col)||INK_P); pv.setAttribute('stroke-width','1.5'); pv.setAttribute('stroke-linejoin','miter'); svg.appendChild(pv);
      }
      if(A.t==='arco' && a && b){
        var arriba = A.lado!=='abajo';
        var ya = arriba ? a.yTop-10 : a.yBot+10, yb = arriba ? b.yTop-10 : b.yBot+10;
        var mx=(a.x+b.x)/2, dx=Math.abs(b.x-a.x);
        var alt = A.alto!=null?A.alto: Math.min(46, 14+dx*0.12);
        var my = arriba ? Math.min(ya,yb)-alt : Math.max(ya,yb)+alt;
        var p=document.createElementNS(NS,'path');
        p.setAttribute('d','M'+(a.x+(A.dx1||0))+' '+ya+' Q'+mx+' '+my+' '+(b.x+(A.dx2||0))+' '+yb);
        /* (26-sep-2026, Iago) forma:'v' → en «V» (dos rectas), p. ej. los semitonos de la escala cromática */
        if(A.forma==='v') p.setAttribute('d','M'+(a.x+(A.dx1||0))+' '+ya+' L'+mx+' '+my+' L'+(b.x+(A.dx2||0))+' '+yb);
        p.setAttribute('fill','none'); p.setAttribute('stroke',c2); p.setAttribute('stroke-width',A.dash?1.5:1.7);
        if(A.dash) p.setAttribute('stroke-dasharray','5 4');
        svg.appendChild(p);
        if(A.flecha){ var ang=Math.atan2(yb-my, (b.x+(A.dx2||0))-mx); var hx=b.x+(A.dx2||0), hy=yb, s1=7;
          var h=document.createElementNS(NS,'path');
          h.setAttribute('d','M'+(hx-s1*Math.cos(ang-0.45))+' '+(hy-s1*Math.sin(ang-0.45))+' L'+hx+' '+hy+' L'+(hx-s1*Math.cos(ang+0.45))+' '+(hy-s1*Math.sin(ang+0.45)));
          h.setAttribute('fill','none'); h.setAttribute('stroke',c2); h.setAttribute('stroke-width','1.7'); svg.appendChild(h); }
        if(A.txt){ txt(mx + (A.tdx||0), (arriba? (my+ (Math.min(ya,yb)-my)/2 - 4) : (my + 12)) + (A.tdy||0), A.txt, {color:c2, fw:A.fw||700, fs:A.fs||11.5}); }   /* (26-sep-2026, Iago) tdx/tdy/fs/fw opcionales */
      }
      if(A.t==='flecha' && b){ /* flecha desde un texto (o desde otra nota) hasta la nota b */
        /* (26-sep-2026, Iago) ddx/ddy desplazan el origen (cuando sale de una nota) y bdy la punta (como bdx en horizontal): flechas que salen de una etiqueta y apuntan a una caja */
        var fx = a ? a.x + (A.ddx||0) : (b.x + (A.dx||0)), fy = a ? (A.lado==='arriba'?a.yTop-12:a.yBot+14) + (A.ddy||0) : (A.y!=null ? A.y : b.yBot + (A.dy||44));
        var tx = b.x + (A.bdx||0), ty = (A.lado==='arriba') ? b.yTop-8 : b.yBot+9;
        if(A.aSup) ty = b.yTop-9;
        ty += (A.bdy||0);
        var p3=document.createElementNS(NS,'path'); var ang2=Math.atan2(ty-fy, tx-fx), s2=7;
        p3.setAttribute('d','M'+fx+' '+fy+' L'+tx+' '+ty+' M'+(tx-s2*Math.cos(ang2-0.45))+' '+(ty-s2*Math.sin(ang2-0.45))+' L'+tx+' '+ty+' L'+(tx-s2*Math.cos(ang2+0.45))+' '+(ty-s2*Math.sin(ang2+0.45)));
        p3.setAttribute('fill','none'); p3.setAttribute('stroke',col(A.col)||PINK_ON_PAPER); p3.setAttribute('stroke-width','1.8'); p3.setAttribute('stroke-linecap','round'); svg.appendChild(p3);
        if(A.txt){ txt(fx + (A.tdx||0), fy + (A.tdy!=null?A.tdy:14), A.txt, {color:col(A.col)||PINK_ON_PAPER, fw:800, fs:A.fs||12.5, caja:A.caja, anchor:A.anchor}); }
      }
      /* (26-sep-2026, Iago) corchete de octava: {t:'8va', de, a, lado:'arriba'|'abajo', txt:'8', sup:'va'} */
      if(A.t==='8va' && a && b){ try{
        var arr8 = A.lado!=='abajo', yl;
        if(arr8) yl = Math.min(a.ySupSt-14, a.yTop-14, b.yTop-14) + (A.dy||0); else yl = Math.max(a.yInfSt+22, a.yBot+18, b.yBot+18) + (A.dy||0);
        var x8 = a.x - 12 + (A.dx||0), te = document.createElementNS(NS,'text');
        te.setAttribute('x',x8); te.setAttribute('y',yl+4); te.setAttribute('text-anchor','end'); te.setAttribute('font-family','Georgia,"Times New Roman",serif');
        te.setAttribute('font-style','italic'); te.setAttribute('font-weight','700'); te.setAttribute('font-size',A.fs||14); te.setAttribute('fill','#000');
        var t1=document.createElementNS(NS,'tspan'); t1.textContent=(A.txt!=null?A.txt:'8'); te.appendChild(t1);
        var t2=document.createElementNS(NS,'tspan'); t2.setAttribute('font-size',(A.fs||14)*0.72); t2.setAttribute('dy','-5'); t2.textContent=(A.sup!=null?A.sup:'va'); te.appendChild(t2);
        svg.appendChild(te);
        var xe = b.x + 10 + (A.dx2||0), hk = arr8 ? 8 : -8;
        var p8=document.createElementNS(NS,'path'); p8.setAttribute('d','M'+(x8+6)+' '+yl+' L'+xe+' '+yl+' L'+xe+' '+(yl+hk));
        p8.setAttribute('fill','none'); p8.setAttribute('stroke','#000'); p8.setAttribute('stroke-width','1.1'); p8.setAttribute('stroke-dasharray','5 4'); svg.appendChild(p8);
      }catch(e){} }
      /* (26-sep-2026, Iago) glissando / portamento: {t:'gliss', de, a, onda:true|false} (de cabeza a cabeza) */
      if(A.t==='gliss' && a && b){
        var gy1=a.ys[0]!=null?a.ys[0]:a.yBot, gy2=b.ys[0]!=null?b.ys[0]:b.yBot, gx1=a.x+7+(A.dx1||0), gx2=b.x-7+(A.dx2||0);
        if(A.onda!==false) onda(gx1, gy1, gx2, gy2, {amp:1.8, lam:4.2, grosor:1.5, col:col(A.col)||'#000'});
        else { var pg=document.createElementNS(NS,'path'); pg.setAttribute('d','M'+gx1+' '+gy1+' L'+gx2+' '+gy2); pg.setAttribute('stroke',col(A.col)||'#000'); pg.setAttribute('stroke-width','1.7'); pg.setAttribute('fill','none'); svg.appendChild(pg); }
      }
      /* (26-sep-2026, Iago) ligadura con forma de ligadura (más gruesa en el centro): {t:'liga', de, a, lado:'abajo'|'arriba', alto} */
      if(A.t==='liga' && a && b){
        var ab2 = A.lado==='arriba', yl1 = ab2 ? a.yTop-9 : a.yBot+9, yl2 = ab2 ? b.yTop-9 : b.yBot+9;
        var lx1=a.x+(A.dx1||0), lx2=b.x+(A.dx2||0), lmx=(lx1+lx2)/2, alt2=(A.alto!=null?A.alto:Math.min(16, 6+Math.abs(lx2-lx1)*0.08))*(ab2?-1:1), gr2=2.2*(ab2?-1:1);
        var lmy=(yl1+yl2)/2+alt2*1.33;
        var pl=document.createElementNS(NS,'path');
        pl.setAttribute('d','M'+lx1+' '+yl1+' Q'+lmx+' '+lmy+' '+lx2+' '+yl2+' Q'+lmx+' '+(lmy+gr2)+' '+lx1+' '+yl1+' Z');
        pl.setAttribute('fill',col(A.col)||'#000'); pl.setAttribute('stroke',col(A.col)||'#000'); pl.setAttribute('stroke-width','0.6'); svg.appendChild(pl);
      }
      if(A.t==='txt' && a){ txt(a.x+(A.dx||0), (A.lado==='arriba'? a.yTop-14 : a.yBot+22)+(A.dy||0), A.txt, {color:col(A.col)||MUTED_P, fw:A.fw||700, fs:A.fs||12, caja:A.caja, anchor:A.anchor, it:A.it}); }
    });
    return true;
  }

  /* =====================================================================
     2. BLOQUES DE CONTENIDO
     ===================================================================== */
  var pendientes=[];   /* pentagramas por dibujar (se dibujan cuando el visor ya tiene ancho) */
  function B(b){
    if(b==null) return '';
    if(typeof b==='string') return '<p class="apx-p">'+b+'</p>';
    var h='';
    if(b.intro!=null) h+='<p class="apx-intro"><span>'+b.intro+'</span>'+(b.introNota?' <em class="apx-nota">'+b.introNota+'</em>':'')+'</p>';
    if(b.h!=null) h+='<h3 class="apx-h">'+b.h+'</h3>'+(b.sub?'<p class="apx-sub">'+b.sub+'</p>':'');
    if(b.h4!=null) h+='<h4 class="apx-h4">'+b.h4+'</h4>'+(b.sub4?'<p class="apx-sub">'+b.sub4+'</p>':'');
    if(b.p!=null) h+='<p class="apx-p'+(b.i?' apx-it':'')+(b.peq?' apx-peq':'')+'">'+b.p+'</p>';
    if(b.nota!=null) h+='<p class="apx-nota">'+b.nota+'</p>';
    if(b.penta){ var id='apxS'+(pendientes.length); pendientes.push({id:id, S:b.penta});
      h+='<div class="apx-paper'+(b.penta.estrecho?' apx-estrecho':'')+'">'+
         ((b.penta.tit||b.penta.txt)?'<div class="apx-ptit">'+(b.penta.tit?'<b>'+b.penta.tit+'</b>':'')+(b.penta.txt?'<span>'+b.penta.txt+'</span>':'')+'</div>':'')+
         '<div class="apx-svg" id="'+id+'"'+(b.penta.maxW?' style="max-width:'+(+b.penta.maxW)+'px;margin:0 auto"':'')+'></div>'   /* (26-sep-2026, Iago) maxW: figura estrecha y centrada */+(b.penta.pie?'<div class="apx-ppie">'+b.penta.pie+'</div>':'')+'</div>'; }
    if(b.grid){ h+='<div class="apx-grid" style="--apx-cols:'+(b.cols||2)+'">'+b.grid.map(function(x){ return '<div>'+B(x)+'</div>'; }).join('')+'</div>'; }
    if(b.ojo!=null || b.truco!=null || b.alerta!=null){
      var tipo = b.truco!=null?'truco':(b.alerta!=null?'alerta':'ojo');
      var lab = b.lab || (tipo==='truco'?'Truco':tipo==='alerta'?'Alerta':'¡Ojo!');
      h+='<div class="apx-card apx-'+tipo+'"><div class="apx-card-lab">'+lab+'</div><div class="apx-card-t">'+(b.ojo!=null?b.ojo:b.truco!=null?b.truco:b.alerta)+'</div>'+
         (b.dentro? '<div class="apx-card-in">'+[].concat(b.dentro).map(B).join('')+'</div>' : '')+'</div>';
    }
    if(b.pasos){ h+='<ol class="apx-pasos">'+b.pasos.map(function(p){ return '<li><span class="apx-paso-n">'+(p.n||'')+'</span><div>'+(p.t||'')+(p.dentro?[].concat(p.dentro).map(B).join(''):'')+'</div></li>'; }).join('')+'</ol>'; }
    if(b.arbol){ var A=b.arbol;
      h+='<div class="apx-arbol">'+(A.raiz?'<div class="apx-raiz">'+A.raiz+'</div>':'')+'<div class="apx-ramas">'+
         A.ramas.map(function(r){ return '<div class="apx-rama">'+(r.tit?'<div class="apx-rama-tit">'+r.tit+'</div>':'')+
           (r.pasos||[]).map(function(p){ return '<div class="apx-rpaso"><span class="apx-paso-n">'+p.n+'</span><div>'+p.t+'</div></div>'; }).join('')+
           (r.dentro?[].concat(r.dentro).map(B).join(''):'')+'</div>'; }).join('')+'</div></div>'; }
    if(b.tabla){ var T=b.tabla;
      h+='<div class="apx-tabla-wrap"><table class="apx-tabla'+(T.clase?' '+T.clase:'')+'">'+
        /* (26-sep-2026, Iago) alin:['left','left','right'] = alineación de cada columna */
        (T.cab?'<thead><tr>'+T.cab.map(function(c,ci){return '<th'+(T.alin&&T.alin[ci]?' style="text-align:'+T.alin[ci]+'"':'')+'>'+c+'</th>';}).join('')+'</tr></thead>':'')+
        '<tbody>'+T.filas.map(function(f,ri){ return '<tr>'+f.map(function(c,ci){ var on=(T.resalta||[]).some(function(rc){return rc[0]===ri&&rc[1]===ci;}); return '<td'+(on?' class="on"':'')+(T.alin&&T.alin[ci]?' style="text-align:'+T.alin[ci]+'"':'')+'>'+c+'</td>'; }).join('')+'</tr>'; }).join('')+'</tbody></table></div>'; }
    if(b.glosario){ var G=b.glosario;
      /* (26-sep-2026, Iago) glosario sin términos = solo el título, que abarca las columnas que vienen detrás */
      var soloTit = !(G.items && G.items.length);
      h+='<div class="apx-glos'+(soloTit?' apx-glos-solo':'')+'">'+(G.tit?'<div class="apx-glos-tit">'+G.tit+'</div>':'')+(soloTit?'':'<dl>'+G.items.map(function(it){ return '<dt>'+it[0]+'</dt><dd>'+it[1]+'</dd>'; }).join('')+'</dl>')+'</div>'; }
    /* (26-sep-2026, Iago) arreglo: {grid:[…], cols:2} usa «cols» como número; solo es bloque de columnas si es una lista */
    if(Array.isArray(b.cols)){ h+='<div class="apx-cols">'+b.cols.map(function(cc){ return '<div>'+[].concat(cc).map(B).join('')+'</div>'; }).join('')+'</div>'; }
    /* (26-sep-2026, Iago) w: ancho máximo SIN perder el tope del 100 % (si no, en el móvil la imagen se sale de la pantalla) */
    if(b.img){ h+='<figure class="apx-img"><img src="'+esc(b.img.src||b.img)+'" alt="'+esc(b.img.alt||'')+'" loading="lazy"'+(b.img.w?' style="max-width:min(100%,'+b.img.w+'px)"':'')+'>'+(b.img.pie?'<figcaption>'+b.img.pie+'</figcaption>':'')+'</figure>'; }
    if(b.html!=null) h+=b.html;
    if(b.sep) h+='<div class="apx-sep"></div>';
    return h;
  }

  /* =====================================================================
     3. ESTILOS
     ===================================================================== */
  function css(){
    if(document.getElementById('apx-css')) return;
    var s=document.createElement('style'); s.id='apx-css';
    s.textContent=
    '#apx-ov{position:fixed;inset:0;z-index:2147482000;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:'+PAL.bg+';background-attachment:fixed;color:'+PAL.ink+';font-family:'+FONT+';line-height:1.5}'+
    '#apx-ov *{box-sizing:border-box}'+
    '.apx-top{position:sticky;top:0;z-index:3;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.35));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid '+PAL.line+'}'+
    '.apx-topin{max-width:1000px;margin:0 auto;padding:12px 16px 10px;display:flex;align-items:center;gap:12px}'+
    '.apx-volver{flex:none;display:inline-flex;align-items:center;gap:6px;border:1px solid '+PAL.line+';background:rgba(255,255,255,.06);color:'+PAL.ink+';border-radius:11px;padding:8px 13px;font:700 13px '+FONT+';cursor:pointer}'+
    '.apx-volver:hover{border-color:'+PAL.acc+'}'+
    '.apx-tits{flex:1;min-width:0;text-align:center}'+
    '.apx-kick{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:'+PAL.acc+';font-weight:800}'+
    '.apx-kick svg{width:14px;height:14px}'+
    '.apx-h2{margin:2px 0 0;font-size:20px;font-weight:900;letter-spacing:.04em;text-transform:uppercase;line-height:1.15;text-wrap:balance}'+
    '.apx-h2 .apx-home{font-family:Georgia,"Times New Roman",serif;font-style:italic;font-weight:500;text-transform:none;letter-spacing:0;font-size:.62em;color:'+PAL.muted+';margin-left:6px}'+
    '.apx-x{flex:none;width:40px;height:40px;border-radius:11px;border:1px solid '+PAL.line+';background:rgba(255,255,255,.06);color:'+PAL.ink+';font-size:18px;cursor:pointer}'+
    '.apx-x:hover{border-color:'+PAL.acc+'}'+
    '.apx-tabs{max-width:1000px;margin:0 auto;padding:0 16px 10px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center}'+
    '.apx-tab{border:1px solid '+PAL.line+';background:rgba(255,255,255,.05);color:'+PAL.muted+';border-radius:999px;padding:6px 13px;font:700 12.5px '+FONT+';cursor:pointer}'+
    '.apx-tab.on{background:'+PAL.card+';border-color:'+PAL.card+';color:'+PAL.cardInk+'}'+
    '.apx-body{max-width:1000px;margin:0 auto;padding:22px 16px 60px}'+
    '.apx-titulo{font-size:30px;font-weight:900;letter-spacing:.02em;margin:4px 0 14px;text-wrap:balance}'+
    '.apx-titulo:after{content:"";display:block;width:54px;height:4px;border-radius:4px;background:'+PAL.acc+';margin-top:10px}'+
    '.apx-intro{font-size:16.5px;margin:6px 0 14px;color:'+PAL.ink+'}'+
    '.apx-intro span{background:linear-gradient(transparent 62%,'+PAL.accSoft.replace(/[\d.]+\)$/,'.55)')+' 62%);padding:0 2px}'+
    '.apx-nota{color:'+PAL.muted+';font-style:italic;font-size:13.5px}'+
    '.apx-h{margin:26px 0 4px;font-size:15px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:'+PAL.acc+'}'+
    '.apx-h4{margin:16px 0 2px;font-size:15px;font-weight:800;color:'+PAL.ink+'}'+
    '.apx-sub{margin:0 0 8px;color:'+PAL.muted+';font-style:italic;font-size:14px}'+
    '.apx-p{margin:8px 0;font-size:15.5px;max-width:76ch}'+
    '.apx-it{font-style:italic}.apx-peq{font-size:13.5px;color:'+PAL.muted+'}'+
    '.apx-p b,.apx-intro b{color:#fff}'+
    '.apx-acc{color:'+PAL.acc+';font-weight:800}'+
    '.apx-paper{background:'+PAPER+';border-radius:16px;padding:10px 12px 6px;margin:10px 0 14px;box-shadow:0 10px 30px rgba(0,0,0,.28);color:'+INK_P+'}'+
    '.apx-ptit{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;padding:2px 4px 0;font-size:14px;color:'+INK_P+'}'+
    '.apx-ptit b{font-size:22px;font-weight:900;letter-spacing:.01em;color:'+INK_P+'}'+
    '.apx-ptit span{font-weight:700;color:'+MUTED_P+';font-style:italic}'+
    '.apx-ppie{padding:0 6px 6px;font-size:13px;color:'+MUTED_P+';font-style:italic}'+
    '.apx-svg{width:100%}.apx-svg svg{display:block;width:100%;height:auto}'+
    '.apx-svg svg text{stroke:none!important}'+
    '.apx-grid{display:grid;grid-template-columns:repeat(var(--apx-cols),minmax(0,1fr));gap:0 14px}'+
    '@media(max-width:700px){.apx-grid{grid-template-columns:1fr}}'+
    '.apx-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:4px 22px}'+
    '.apx-card{border-radius:16px;padding:14px 16px;margin:14px 0;background:'+PAL.card+';color:'+PAL.cardInk+';box-shadow:0 12px 30px rgba(0,0,0,.3)}'+
    '.apx-card-lab{font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:900;opacity:.85;margin-bottom:2px}'+
    '.apx-card-t{font-size:15.5px;font-weight:600}'+
    '.apx-card-t b{font-weight:900}'+
    '.apx-card-in .apx-paper{margin:10px 0 2px;box-shadow:none}'+
    '.apx-card-in .apx-p{color:inherit}'+
    '.apx-pasos{list-style:none;margin:10px 0;padding:0;display:flex;flex-direction:column;gap:10px}'+
    '.apx-pasos li{display:flex;gap:12px;align-items:flex-start;font-size:15.5px}'+
    '.apx-paso-n{flex:none;display:inline-block;min-width:66px;text-align:center;border-radius:9px;padding:3px 8px;background:'+PAL.accSoft+';border:1px solid '+PAL.acc+';color:'+PAL.ink+';font-weight:900;font-size:12.5px;letter-spacing:.06em;text-transform:uppercase}'+
    '.apx-arbol{margin:12px 0}'+
    '.apx-raiz{position:relative;margin:0 auto 22px;max-width:640px;text-align:center;border:1.5px solid '+PAL.acc+';border-radius:14px;padding:10px 14px;background:rgba(255,255,255,.04);font-size:15.5px}'+
    '.apx-raiz:after{content:"";position:absolute;left:50%;bottom:-23px;width:2px;height:22px;background:'+PAL.acc+'}'+
    '.apx-ramas{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:18px}'+
    '.apx-ramas:before{content:"";position:absolute;left:25%;right:25%;top:-1px;height:2px;background:'+PAL.acc+'}'+
    '.apx-rama{position:relative;border:1px solid '+PAL.line+';border-radius:16px;padding:14px;background:rgba(255,255,255,.04);display:flex;flex-direction:column;gap:10px}'+
    '.apx-rama:before{content:"";position:absolute;left:50%;top:-19px;width:2px;height:18px;background:'+PAL.acc+'}'+
    '.apx-rama-tit{font-weight:900;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:'+PAL.acc+';text-align:center}'+
    '.apx-rpaso{display:flex;gap:10px;align-items:flex-start;font-size:15px}'+
    '@media(max-width:700px){.apx-ramas{grid-template-columns:1fr}.apx-ramas:before,.apx-rama:before{display:none}}'+
    '.apx-tabla-wrap{overflow-x:auto;margin:10px 0}'+
    '.apx-tabla{border-collapse:separate;border-spacing:0;background:'+PAPER+';color:'+INK_P+';border-radius:14px;overflow:hidden;font-size:15px;min-width:280px}'+
    '.apx-tabla th{background:rgba(22,32,58,.08);font-weight:900;padding:8px 14px;text-align:center}'+
    '.apx-tabla td{padding:9px 16px;text-align:center;border-top:1px solid rgba(22,32,58,.1);border-left:1px solid rgba(22,32,58,.08)}'+
    '.apx-tabla td:first-child{border-left:none}'+
    '.apx-tabla td.on{background:'+PAL.card+';color:'+PAL.cardInk+';font-weight:900}'+
    '.apx-glos{margin:14px 0}'+
    '.apx-glos-solo{margin-bottom:-6px}.apx-glos-solo+.apx-cols>div>.apx-glos:first-child{margin-top:0}'+
    '.apx-glos-tit{font-size:14px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:'+PAL.acc+';border-bottom:1px solid '+PAL.line+';padding-bottom:4px;margin-bottom:6px}'+
    '.apx-glos dl{display:grid;grid-template-columns:minmax(120px,max-content) 1fr;gap:3px 14px;margin:0;font-size:14.5px}'+
    '.apx-glos dt{font-weight:800;color:#fff}.apx-glos dd{margin:0;color:'+PAL.muted+'}'+
    '.apx-img{margin:12px 0;text-align:center}.apx-img img{max-width:100%;border-radius:12px;background:#fff}.apx-img figcaption{font-size:13px;color:'+PAL.muted+';font-style:italic;margin-top:4px}'+
    '.apx-sep{height:10px}'+
    /* (26-sep-2026, Iago) subtítulo pequeño dentro del título: «Cadencias (introducción)» */
    '.apx-titulo small{font-size:.55em;font-weight:500;letter-spacing:0;color:'+PAL.muted+'}'+
    /* (26-sep-2026, Iago) iconos musicales en el texto */
    '.apx-ico{display:inline-block;margin:0 .3em;vertical-align:middle;line-height:0}.apx-ico svg{display:inline-block}'+
    '.apx-fuente{margin-top:34px;padding-top:12px;border-top:1px solid '+PAL.line+';font-size:12px;color:'+PAL.muted2+';letter-spacing:.04em;text-align:center}'+
    '.apx-err{padding:14px;color:#b00;font-size:13px}'+
    /* botón en las tarjetas */
    '.apx-btn{position:absolute;top:10px;left:12px;z-index:4;display:inline-flex;align-items:center;gap:6px;border:none;background:none;padding:4px 6px;margin:0;border-radius:8px;cursor:pointer;'+
      'font:700 9.5px/1 '+FONT+';letter-spacing:.2em;text-transform:uppercase;color:'+PAL.muted+';opacity:.9}'+
    '.apx-btn svg{width:14px;height:14px;flex:none}'+
    '.apx-btn:hover,.apx-btn:focus-visible{color:'+PAL.acc+';opacity:1;background:rgba(255,255,255,.06);outline:none}'+
    /* volteo */
    '.apx-back{position:absolute;inset:0;z-index:5;display:grid;grid-template-columns:1fr;align-content:center;gap:6px;padding:34px 14px 10px;border-radius:inherit;overflow:auto;'+
      'background:'+(TEMA==='gp'?'linear-gradient(180deg,#33240a,#1d1406)':'linear-gradient(180deg,#171a45,#0e1233)')+';opacity:0;pointer-events:none;transform:rotateY(90deg);transition:transform .22s ease,opacity .18s ease}'+
    '.apx-flip .apx-back{opacity:1;pointer-events:auto;transform:none}'+
    '.apx-back-tit{position:absolute;top:10px;left:14px;right:40px;font:800 9.5px/1 '+FONT+';letter-spacing:.2em;text-transform:uppercase;color:'+PAL.acc+';text-align:left;display:flex;gap:6px;align-items:center}'+
    '.apx-back-tit svg{width:14px;height:14px}'+
    '.apx-back-x{position:absolute;top:6px;right:8px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid '+PAL.line+';background:rgba(255,255,255,.05);color:'+PAL.ink+';cursor:pointer;font-size:13px}'+
    '.apx-back.apx-muchas{grid-template-columns:1fr 1fr}'+
    '.apx-opt{display:flex;align-items:center;min-height:34px;width:100%;box-sizing:border-box;text-align:left;border:1px solid '+PAL.line+';background:rgba(255,255,255,.05);color:'+PAL.ink+';border-radius:10px;padding:6px 10px;font:700 12.5px/1.2 '+FONT+';cursor:pointer}'+
    '.apx-opt:hover,.apx-opt:focus-visible{border-color:'+PAL.acc+';background:'+PAL.accSoft+';outline:none}';
    document.head.appendChild(s);
  }
  var ICO_LIBRO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5.5C5.5 4.3 8.5 4.3 12 6c3.5-1.7 6.5-1.7 9-.5v13c-2.5-1.2-5.5-1.2-9 .5-3.5-1.7-6.5-1.7-9-.5z"/><path d="M12 6v13.5"/></svg>';

  /* =====================================================================
     4. VISOR A PANTALLA COMPLETA
     ===================================================================== */
  var ov=null, tok=null, grupoAct=null, idxAct=0, rzT=null;
  function temaDe(id){ var T=window.APX_TEMAS||{}; return T[id]||null; }
  function pintaPentas(){
    var lst=pendientes.slice();
    lst.forEach(function(p){ var el=document.getElementById(p.id); if(el){ try{ dibujaPenta(el, p.S); }catch(e){ console.warn('[apuntes]',e); el.innerHTML='<div class="apx-err">No se ha podido dibujar este pentagrama.</div>'; } } });
  }
  /* (26-sep-2026, Iago) iconos musicales dentro del texto (títulos de los adornos):
     <span class="apx-ico" data-ico="tr~"></span> · se dibujan con los mismos glifos que los pentagramas */
  var ICONOS = {
    'tr':[{g:'ornamentTrill'}], 'tr~':[{g:'ornamentTrill'},{onda:34}], '~':[{onda:34}],
    'prall':[{g:'ornamentShortTrill'}], 'mordente':[{g:'ornamentMordent'}],
    'prall-b':[{g:'ornamentShortTrill', arr:'accidentalFlat'}], 'mordente-s':[{g:'ornamentMordent', ab:'accidentalSharp'}],
    'grupeto':[{g:'ornamentTurn'}], 'grupeto-inv':[{g:'ornamentTurn', espejo:true}],
    'upmordent':[{g:'ornamentPrecompSlideTrillBach'}], 'upprall':[{g:'ornamentPrecompSlideTrillDAnglebert'}],
    'downprall':[{g:'ornamentPrecompDoubleCadenceUpperPrefix'}], 'prallup':[{g:'ornamentPrecompTrillSuffixDandrieu'}],
    'pralldown':[{g:'ornamentPrecompTrillLowerSuffix'}],
    'acciaccatura':[{nota:'acciaccatura'}], 'semis':[{nota:'semis'}]
  };
  function pintaIconos(root){
    var VF=vf(); if(!VF || !root) return;
    [].forEach.call(root.querySelectorAll('.apx-ico'), function(el){
      var spec=ICONOS[el.getAttribute('data-ico')]; if(!spec || el.getAttribute('data-ok')) return;
      try{
        el.innerHTML=''; var R=new VF.Renderer(el, VF.Renderer.Backends.SVG); R.resize(240,160); var ctx=R.getContext(); var svg=el.querySelector('svg');
        var x=20, Y=90, ult=null, kpx=+(el.getAttribute('data-k')||0);
        spec.forEach(function(it){
          if(it.g){ var g=ctx.openGroup('ico'); VF.Glyph.renderGlyph(ctx, x, Y, 38, it.g); ctx.closeGroup(); var bb=g.getBBox();
            if(it.espejo) g.setAttribute('transform','matrix(-1 0 0 1 '+(2*(bb.x+bb.width/2))+' 0)');
            if(it.arr||it.ab){ var ga=ctx.openGroup('ico'); VF.Glyph.renderGlyph(ctx, 0, 0, 26, it.arr||it.ab); ctx.closeGroup(); var ba=ga.getBBox();
              var tx=(bb.x+bb.width/2)-(ba.x+ba.width/2), ty = it.arr ? (bb.y-3)-(ba.y+ba.height) : (bb.y+bb.height+3)-ba.y;
              ga.setAttribute('transform','translate('+tx+' '+ty+')'); }
            ult=bb; x=bb.x+bb.width+2; }
          if(it.onda){ var yo = ult ? ult.y+ult.height*0.55 : Y-5, d='', N=Math.round(it.onda/1.1);
            for(var i=0;i<=N;i++){ var t=i/N*it.onda; d+=(i?' L':'M')+(x+t).toFixed(2)+' '+(yo+Math.sin(t/6.2*2*Math.PI)*2.3).toFixed(2); }
            var p=document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d',d); p.setAttribute('fill','none'); p.setAttribute('stroke','#000'); p.setAttribute('stroke-width','2'); svg.appendChild(p);
            if(!ult) ult={x:x,y:yo-6,width:it.onda,height:12}; x+=it.onda+2; }
          if(it.nota){ var st=new VF.Stave(x-10, Y-70, 90); var ns=[];
            if(it.nota==='acciaccatura') ns=[new VF.GraceNote({keys:['a/4'], duration:'8', slash:true, stem_direction:1})];
            else ns=[new VF.StaveNote({keys:['g/4'], duration:'16', stem_direction:1}), new VF.StaveNote({keys:['a/4'], duration:'16', stem_direction:1})];
            var bm = ns.length>1 ? new VF.Beam(ns) : null;
            VF.Formatter.FormatAndDraw(ctx, st, ns); if(bm) bm.setContext(ctx).draw(); }
        });
        var B2=svg.getBBox(), pad=1.5; svg.setAttribute('viewBox',(B2.x-pad)+' '+(B2.y-pad)+' '+(B2.width+2*pad)+' '+(B2.height+2*pad));
        var k = kpx || (spec[0].nota ? 0.62 : 0.85);
        svg.removeAttribute('width'); svg.removeAttribute('height'); svg.style.width=((B2.width+2*pad)*k)+'px'; svg.style.height=((B2.height+2*pad)*k)+'px';
        svg.style.display='inline-block'; svg.style.verticalAlign='middle'; svg.style.overflow='visible';
        svg.setAttribute('fill','currentColor'); svg.setAttribute('stroke','currentColor');
        [].forEach.call(svg.querySelectorAll('*'), function(e){ var f=e.getAttribute('fill'); if(f && f!=='none' && f!=='transparent') e.setAttribute('fill','currentColor'); var s=e.getAttribute('stroke'); if(s && s!=='none' && s!=='transparent') e.setAttribute('stroke','currentColor'); });
        el.setAttribute('data-ok','1');
      }catch(e){ console.warn('[apuntes] icono',e); el.innerHTML=''; }
    });
  }
  function render(){
    var id = grupoAct.temas[idxAct], T = temaDe(id);
    pendientes=[];
    var body = ov.querySelector('.apx-body');
    if(!T){ body.innerHTML='<p class="apx-p">Estos apuntes todavía no están disponibles.</p>'; return; }
    body.innerHTML = '<h1 class="apx-titulo">'+T.titulo+'</h1>' + (T.bloques||[]).map(B).join('') +
      '<div class="apx-fuente">'+(T.fuente||'')+'</div>';
    ov.querySelectorAll('.apx-tab').forEach(function(t,i){ t.classList.toggle('on', i===idxAct); t.setAttribute('aria-selected', i===idxAct?'true':'false'); });
    requestAnimationFrame(function(){ pintaPentas(); pintaIconos(ov); });
    ov.scrollTop=0;
  }
  function cerrar(porAtras){
    if(!ov) return;
    window.removeEventListener('popstate', alAtras); window.removeEventListener('resize', alResize); document.removeEventListener('keydown', alTecla);
    ov.remove(); ov=null; document.documentElement.style.overflow='';
    if(!porAtras){ try{ if(history.state && history.state.apx===tok) history.back(); }catch(e){} }
    if(grupoAct && grupoAct.foco){ try{ grupoAct.foco.focus(); }catch(e){} }
  }
  function alAtras(ev){ if(ev && ev.state && ev.state.apx===tok) return; cerrar(true); }
  function alResize(){ clearTimeout(rzT); rzT=setTimeout(pintaPentas, 180); }
  function alTecla(ev){ if(ev.key==='Escape'){ ev.preventDefault(); cerrar(false); } }
  function abrir(grupo, idx, foco){
    css();
    if(ov) cerrar(true);
    grupoAct = { nombre:grupo.nombre, temas:grupo.temas, foco:foco||document.activeElement }; idxAct = idx||0;
    ov=document.createElement('div'); ov.id='apx-ov'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label','Apuntes de '+grupo.nombre);
    var tabs = grupo.temas.length>1 ? '<div class="apx-tabs" role="tablist">'+grupo.temas.map(function(t,i){ var T=temaDe(t); return '<button type="button" class="apx-tab" role="tab" data-i="'+i+'">'+esc(T?(T.corto||T.titulo):t)+'</button>'; }).join('')+'</div>' : '';
    ov.innerHTML='<div class="apx-top"><div class="apx-topin">'+
      '<button type="button" class="apx-volver" aria-label="Volver">‹ Volver</button>'+
      '<div class="apx-tits"><div class="apx-kick">'+ICO_LIBRO+'Apuntes</div><div class="apx-h2">'+esc(grupo.nombre)+'<span class="apx-home">at home</span></div></div>'+
      '<button type="button" class="apx-x" aria-label="Cerrar">✕</button></div>'+tabs+'</div><div class="apx-body"></div>';
    document.body.appendChild(ov); document.documentElement.style.overflow='hidden';
    ov.querySelector('.apx-volver').onclick=function(){ cerrar(false); };
    ov.querySelector('.apx-x').onclick=function(){ cerrar(false); };
    ov.querySelectorAll('.apx-tab').forEach(function(t){ t.onclick=function(){ idxAct=+t.dataset.i; render(); }; });
    tok='apx'+Date.now(); try{ history.pushState({apx:tok}, ''); }catch(e){}
    window.addEventListener('popstate', alAtras); window.addEventListener('resize', alResize); document.addEventListener('keydown', alTecla);
    render();
    try{ ov.querySelector('.apx-volver').focus({preventScroll:true}); }catch(e){}
  }

  /* =====================================================================
     5. ¿QUIÉN PUEDE VER LOS APUNTES?  (alumnos con cuenta validada)
     El portal pasa la cuenta en el enlace (#c=<id>); aquí se guarda y se
     comprueba con Supabase (suite_estado_cuenta). También vale ?cuenta=
     (fichas) y la sesión antigua en este mismo origen.
     ===================================================================== */
  var KEY_C = 'apx_cuenta_'+TEMA, KEY_OK='apx_ok_'+TEMA;
  var TESTERS = ['iago gonzalez tester','iago gonzalez protester','iago gonzalez pro tester'];
  function norm(s){ return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim(); }
  function cuentaGuardada(){
    var c=null;
    try{
      var m=/[#&]c=([0-9a-f-]{36}|-)/i.exec(location.hash||'');
      if(m){
        if(m[1]==='-'){ localStorage.removeItem(KEY_C); localStorage.removeItem(KEY_OK); }   /* el portal dice: nadie validado */
        else { c=m[1]; localStorage.setItem(KEY_C,c); }
        var h=(location.hash||'').replace(/[#&]c=([0-9a-f-]{36}|-)/i,'').replace(/^#&/,'#');
        history.replaceState(history.state, '', location.pathname+location.search+(h==='#'?'':h));
        if(m[1]==='-') return null;
      }
    }catch(e){}
    try{ var q=new URLSearchParams(location.search).get('cuenta'); if(!c && q && /^[0-9a-f-]{36}$/i.test(q)){ c=q; localStorage.setItem(KEY_C,c); } }catch(e){}
    if(!c){ try{ c=localStorage.getItem(KEY_C); }catch(e){} }
    if(!c){ try{ var s=JSON.parse(localStorage.getItem(TEMA==='gp'?'lmpro_session':'lmeav_session')||'null'); if(s && s.id && s.estado==='validado') c=s.id; }catch(e){} }
    return c;
  }
  /* cb({validado, tester}) */
  function comprobar(cb){
    var c=cuentaGuardada(); if(!c){ cb({validado:false, tester:false}); return; }
    /* caché de 12 h para no preguntar en cada carga */
    try{ var k=JSON.parse(localStorage.getItem(KEY_OK)||'null'); if(k && k.c===c && (Date.now()-k.t)<12*3600e3 && k.v!=null){ cb({validado:!!k.v, tester:!!k.te}); return; } }catch(e){}
    var URL_SB='https://woiptkyrxkbpnvioypit.supabase.co';
    var ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvaXB0a3lyeGticG52aW95cGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NzI2ODYsImV4cCI6MjA5MjA0ODY4Nn0.B2nKgj5rD0rkdLeMIrd9KgD8lUPWsBT4Y7aCtmnvbjA';
    fetch(URL_SB+'/rest/v1/rpc/suite_estado_cuenta',{method:'POST',headers:{'Content-Type':'application/json','apikey':ANON,'Authorization':'Bearer '+ANON},body:JSON.stringify({p_id:c})})
      .then(function(r){ return r.json(); })
      .then(function(d){
        var v = !!(d && d.ok && d.estado==='validado');
        var te = v && TESTERS.indexOf(norm(d.nombre))>=0;
        try{ localStorage.setItem(KEY_OK, JSON.stringify({c:c, v:v, te:te, t:Date.now()})); }catch(e){}
        cb({validado:v, tester:te});
      }).catch(function(){ cb({validado:false, tester:false}); });
  }

  /* =====================================================================
     6. BOTÓN «VER APUNTES» EN LAS TARJETAS
     cfg.tarjetas: [{sel: elemento o selector, nombre, temas:[ids]}]
     ===================================================================== */
  function montaEn(card, grupo){
    if(!card || card.querySelector(':scope > .apx-btn')) return;
    if(getComputedStyle(card).position==='static') card.style.position='relative';
    var temas = grupo.temas.filter(function(t){ return !!temaDe(t); });
    if(!temas.length) return;
    var g = {nombre:grupo.nombre, temas:temas};
    var b=document.createElement('span'); b.className='apx-btn'; b.setAttribute('role','button'); b.tabIndex=0;
    b.innerHTML=ICO_LIBRO+'<span>Ver apuntes</span>'; b.setAttribute('aria-label','Ver apuntes de '+grupo.nombre);
    if(grupo.claseBtn) b.classList.add(grupo.claseBtn);
    card.appendChild(b);
    var back=null;
    function para(ev){ ev.stopPropagation(); ev.preventDefault(); }
    function act(ev){
      para(ev);
      if(temas.length===1){ abrir(g,0,b); return; }
      if(!back){
        back=document.createElement('div'); back.className='apx-back'+(temas.length>2?' apx-muchas':'');
        back.innerHTML='<div class="apx-back-tit">'+ICO_LIBRO+'Apuntes · '+esc(grupo.nombre)+'</div><button type="button" class="apx-back-x" aria-label="Volver a la tarjeta">✕</button>'+
          temas.map(function(t,i){ var T=temaDe(t); return '<span role="button" tabindex="0" class="apx-opt" data-i="'+i+'">'+esc(T.corto||T.titulo)+'</span>'; }).join('');
        card.appendChild(back);
        back.addEventListener('click', function(e2){ para(e2); var o=e2.target.closest('.apx-opt'); if(o){ card.classList.remove('apx-flip'); abrir(g,+o.dataset.i,b); return; }
          if(e2.target.closest('.apx-back-x') || e2.target===back){ card.classList.remove('apx-flip'); } });
        back.addEventListener('keydown', function(e4){ if(e4.key==='Enter'||e4.key===' '){ var o2=e4.target.closest('.apx-opt'); if(o2){ para(e4); card.classList.remove('apx-flip'); abrir(g,+o2.dataset.i,b); } else if(e4.target.closest('.apx-back-x')){ para(e4); card.classList.remove('apx-flip'); } } if(e4.key==='Escape'){ para(e4); card.classList.remove('apx-flip'); try{ b.focus(); }catch(e){} } });
        ['pointerdown','mousedown','touchstart'].forEach(function(t){ back.addEventListener(t, function(e3){ e3.stopPropagation(); }, {passive:true}); });
      }
      document.querySelectorAll('.apx-flip').forEach(function(x){ if(x!==card) x.classList.remove('apx-flip'); });   /* una tarjeta volteada cada vez */
      card.classList.add('apx-flip');
      try{ back.querySelector('.apx-opt').focus({preventScroll:true}); }catch(e){}
    }
    b.addEventListener('click', act);
    b.addEventListener('keydown', function(ev){ if(ev.key==='Enter'||ev.key===' ') act(ev); });
    ['pointerdown','mousedown','touchstart'].forEach(function(t){ b.addEventListener(t, function(e){ e.stopPropagation(); }, {passive:true}); });
  }
  /* opts.obs: selector del contenedor que se repinta · opts.alValidar(info): cambios solo para alumnos validados */
  function montar(tarjetas, opts){
    opts=opts||{};
    comprobar(function(info){
      if(info.validado && opts.alValidar){ try{ opts.alValidar(info); }catch(e){} }
      var ok = info.validado && (info.tester || !SOLO_TESTER);
      if(!ok) return;
      css();
      function pasada(){ tarjetas.forEach(function(t){ var els = typeof t.sel==='string' ? document.querySelectorAll(t.sel) : [t.sel]; [].forEach.call(els, function(el){ if(el) montaEn(el, t); }); }); }
      pasada();
      /* por si la cuadrícula se vuelve a pintar */
      if(opts.obs){ try{ var cont=document.querySelector(opts.obs); if(cont) new MutationObserver(function(){ pasada(); }).observe(cont, {childList:true}); }catch(e){} }
    });
  }

  window.APX = { abrir:abrir, montar:montar, dibujaPenta:dibujaPenta, comprobar:comprobar, _B:B, _pinta:pintaPentas, PAL:PAL };
})();
