/* Aurora original del usuario, animada como una capa completa. */
(() => {
 'use strict';
 const assets=new URL('../assets/',document.currentScript.src);
 const scene=document.createElement('div');scene.className='cielo-fiel';scene.setAttribute('aria-hidden','true');
 scene.innerHTML=`<svg class="filtros-aurora" xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>
 <filter id="ondulacion-original" x="-10%" y="-12%" width="120%" height="124%" color-interpolation-filters="sRGB">
 <feTurbulence type="fractalNoise" baseFrequency="0.0015 0.004" numOctaves="1" seed="7" result="curvas"><animate attributeName="baseFrequency" values="0.0015 0.004;0.0023 0.003;0.0015 0.004" dur="12s" repeatCount="indefinite"/></feTurbulence>
 <feDisplacementMap in="SourceGraphic" in2="curvas" scale="45" xChannelSelector="R" yChannelSelector="G"><animate attributeName="scale" values="30;65;30" dur="8s" repeatCount="indefinite"/></feDisplacementMap>
 </filter></defs></svg>
 <div class="marco-original"><img class="base-original" alt=""><div class="cielo-estrellas"><div class="cinta-estrellas"><img alt=""><img alt=""></div></div><div class="aurora-original"><div class="luz-original"><img alt=""></div></div><img class="suelo-original" alt=""></div>`;
 const base=new URL('cielo-montanas.jpg',assets).href;
 scene.querySelectorAll('.base-original,.cinta-estrellas img,.suelo-original').forEach(img=>img.src=base);
 scene.querySelector('.aurora-original img').src=new URL('aurora-separada.jpg',assets).href;
 const points=[[0,730],[100,758],[220,785],[330,815],[420,831],[480,809],[525,795],[557,795],[600,812],[640,830],[682,849],[723,835],[752,836],[813,849],[860,867],[905,879],[950,896],[1000,914],[1055,925],[1120,925],[1180,921],[1240,907],[1275,908],[1310,919],[1340,918],[1387,900],[1400,879],[1426,859],[1465,850],[1510,862],[1600,866],[1710,874],[1800,881],[1920,900]];
 scene.querySelector('.suelo-original').style.clipPath=`polygon(${points.map(([x,y])=>x/19.2+'% '+y/11.34+'%').join(',')},100% 100%,0 100%)`;
 document.body.prepend(scene);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let userPaused=null;

 function paused(){return userPaused===null?reduced.matches:userPaused;}
 function sync(){const stop=paused()||document.hidden;scene.classList.toggle('cielo-pausado',stop);const svg=scene.querySelector('svg');if(stop)svg.pauseAnimations();else svg.unpauseAnimations();}

 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);sync();
})();
