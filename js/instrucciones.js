(()=>{'use strict';
 const panel=document.getElementById('instrucciones-interaccion'),hide=document.getElementById('ocultar-interaccion'),show=document.getElementById('mostrar-interaccion');
 hide.addEventListener('click',()=>{panel.hidden=true;show.hidden=false;hide.setAttribute('aria-expanded','false');show.focus();});
 show.addEventListener('click',()=>{panel.hidden=false;show.hidden=true;hide.setAttribute('aria-expanded','true');hide.focus();});
})();
