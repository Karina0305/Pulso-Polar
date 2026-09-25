/* Ajusta la composición completa: no oculta contenido para eliminar el scroll. */
(()=>{
  const main=document.querySelector('body > main');
  const footer=document.querySelector('.navegacion-pantallas');
  if(!main||!footer)return;
  function fit(){
    const width=document.documentElement.clientWidth;
    const available=Math.max(1,window.innerHeight-footer.getBoundingClientRect().height);
    // La tercera escena llena todo el espacio disponible, sin franjas laterales.
    if(main.querySelector('.vista-polar')){
      main.style.setProperty('--ancho-pantalla',width+'px');
      main.style.setProperty('--alto-pantalla',available+'px');
      main.style.setProperty('--escala-pantalla',1);
      main.style.top='0px';
      return;
    }
    let designWidth=Math.max(1200,width);
    const designHeight=main.querySelector('.vista-polar')?designWidth*9/16:820;
    const scale=Math.min(width/designWidth,available/designHeight);
    if(!main.querySelector('.vista-polar'))designWidth=width/scale;
    main.style.setProperty('--ancho-pantalla',designWidth+'px');
    main.style.setProperty('--alto-pantalla',designHeight+'px');
    main.style.setProperty('--escala-pantalla',scale);
    main.style.top=Math.max(0,(available-designHeight*scale)/2)+'px';
  }
  new ResizeObserver(fit).observe(footer);
  window.addEventListener('resize',fit);
  window.visualViewport?.addEventListener('resize',fit);
  fit();
})();


