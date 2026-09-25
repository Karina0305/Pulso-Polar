(()=>{'use strict';
 const button=document.getElementById('oscurecer'),scene=document.querySelector('.vista-polar'),image=scene.querySelector('.imagen-oscura'),panel=document.getElementById('reflexion-polar');let dark=false;
 function reveal(){if(dark)panel.hidden=false;}
 image.addEventListener('transitionend',event=>{if(event.propertyName==='opacity'&&getComputedStyle(image).opacity==='1')reveal();});
 button.addEventListener('click',async()=>{
  try{if(!image.complete||!image.naturalWidth)await image.decode();}catch{button.textContent='No se pudo cargar el fondo';return;}
  dark=!dark;panel.hidden=true;panel2.hidden=true;dos?.setAttribute('aria-pressed','false');
  scene.classList.toggle('oscura',dark);button.setAttribute('aria-pressed',String(dark));button.textContent=dark?'Aclarar pantalla':'Oscurecer pantalla';
  if(dark&&matchMedia('(prefers-reduced-motion: reduce)').matches)reveal();
 });
 const dos=document.getElementById('recuadro-dos'),panel2=document.getElementById('reflexion-dos');
 dos?.addEventListener('click',()=>{const show=panel2.hidden;panel.hidden=true;panel2.hidden=!show;dos.setAttribute('aria-pressed',String(show));});
})();
