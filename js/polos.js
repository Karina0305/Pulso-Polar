(()=>{
 'use strict';
 const earth=document.getElementById('tierra-polos'),button=document.getElementById('cambiar-polo');if(!earth||!button)return;
 const label=document.getElementById('polo-actual'),img=document.getElementById('imagen-polos'),aurora=document.getElementById('aurora');
 let south=true,angle=220,timer;
 function finish(){clearTimeout(timer);button.disabled=false;earth.removeAttribute('aria-busy');}
 button.addEventListener('click',()=>{
  south=!south;angle+=180;button.disabled=true;earth.setAttribute('aria-busy','true');earth.style.transform=`rotate(${angle}deg)`;
   const pole=south?'sur':'norte',name=south?'austral':'boreal';
   label.textContent=`Polo ${pole} · aurora ${name}`;
   try{window.__polarSetPolo?.(pole);}catch{}
  button.textContent=`Ver polo ${south?'norte':'sur'} ↻`;
  img.alt=`Tierra orientada hacia el polo ${pole}`;
  aurora.dataset.polo=pole;aurora.setAttribute('aria-label',`Aurora ${name} animada que responde al Kp y al movimiento`);
  timer=setTimeout(finish,2900);
 });
 earth.addEventListener('transitionend',e=>{if(e.propertyName==='transform')finish();});
})();

