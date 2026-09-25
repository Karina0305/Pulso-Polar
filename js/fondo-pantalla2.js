/* Mismo desplazamiento lateral de estrellas que en la pantalla uno (160 s). */
(()=>{
 'use strict';
 const fondo=document.querySelector('.fondo-sonoro');if(!fondo)return;
 const src=new URL('../assets/fondo-pantalla2.jpg',document.currentScript.src).href;
 const stars=document.createElement('div');stars.className='estrellas-pantalla2';
 const strip=document.createElement('div');strip.className='cinta-pantalla2';
 for(let i=0;i<2;i++){const img=new Image();img.src=src;img.alt='';strip.appendChild(img);}
 stars.appendChild(strip);fondo.appendChild(stars);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let userPaused=null;

 function sync(){const paused=userPaused===null?reduced.matches:userPaused;strip.style.animationPlayState=paused||document.hidden?'paused':'running';}

 reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
})();

