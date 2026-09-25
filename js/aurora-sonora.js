/* Una cinta difusa: recta sin señal, amplitud y curvas guiadas por audio real. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),canvas=$('aurora'),ctx=canvas.getContext('2d');
 if(!ctx)return;
 const audio=$('audio');let ac,analyser,mediaNode,micNode,stream,url;
 let mode='idle',ticket=0,amplitude=0,phase=0,last=0,raf=0,low=0,high=0,velocity=0,flow=0;
 let timeData,frequency,width=0,height=0;
 const say=text=>($('estado-sonoro')||$('estado')).textContent=text;
 const auroraTexture=new Image(),cloudTexture=document.createElement('canvas'),mistTexture=document.createElement('canvas'),pinkTexture=document.createElement('canvas');let textureReady=false;
  auroraTexture.onload=()=>{
  cloudTexture.width=auroraTexture.naturalWidth;cloudTexture.height=384;
  const cloud=cloudTexture.getContext('2d');
  cloud.filter='saturate(1.65) brightness(1.18)';
  cloud.drawImage(auroraTexture,0,auroraTexture.naturalHeight*.24,auroraTexture.naturalWidth,auroraTexture.naturalHeight*.52,0,0,cloudTexture.width,384);
  cloud.filter='none';
  // Veladuras de color: el halo conserva pigmento en vez de quedar blanco.
  cloud.globalCompositeOperation='multiply';
  const tint=cloud.createLinearGradient(0,0,cloudTexture.width,384);
  tint.addColorStop(0,'#cf91ee');tint.addColorStop(.18,'#69eabb');
  tint.addColorStop(.35,'#ef8ada');tint.addColorStop(.50,'#94a7f1');
  tint.addColorStop(.68,'#80eec7');tint.addColorStop(.84,'#b69aef');tint.addColorStop(1,'#f49bdc');
  cloud.globalAlpha=.48;cloud.fillStyle=tint;cloud.fillRect(0,0,cloudTexture.width,384);
  cloud.globalAlpha=1;
  cloud.globalCompositeOperation='destination-in';
  const feather=cloud.createLinearGradient(0,0,0,384);
  feather.addColorStop(0,'transparent');feather.addColorStop(.20,'#000');feather.addColorStop(.75,'#000');feather.addColorStop(1,'transparent');
    cloud.fillStyle=feather;cloud.fillRect(0,0,cloudTexture.width,384);
  mistTexture.width=cloudTexture.width;mistTexture.height=384;
  const mist=mistTexture.getContext('2d');mist.filter='blur(14px)';mist.globalAlpha=.75; mist.drawImage(cloudTexture,0,0);
 mist.filter='none';mist.globalAlpha=1;mist.globalCompositeOperation='destination-in';
 const edge=mist.createLinearGradient(0,0,0,384);edge.addColorStop(0,'transparent');edge.addColorStop(.14,'#000');edge.addColorStop(.86,'#000');edge.addColorStop(1,'transparent');mist.fillStyle=edge; mist.fillRect(0,0,mistTexture.width,384);
 pinkTexture.width=mistTexture.width;pinkTexture.height=384;
 const pink=pinkTexture.getContext('2d');pink.drawImage(mistTexture,0,0);
 pink.globalCompositeOperation='source-in';pink.fillStyle='#f477de';pink.fillRect(0,0,pinkTexture.width,384);
 textureReady=true;
 };
 auroraTexture.src=new URL('../assets/aurora-textura.png',document.currentScript.src).href;
 function init(){
  if(!ac){const Constructor=window.AudioContext||window.webkitAudioContext;if(!Constructor)throw Error('Audio no compatible');ac=new Constructor();analyser=ac.createAnalyser();analyser.fftSize=2048;analyser.smoothingTimeConstant=.75;timeData=new Float32Array(analyser.fftSize);frequency=new Uint8Array(analyser.frequencyBinCount);}
  return ac.resume();
 }
 function stop(){
  ticket++;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}if(micNode){micNode.disconnect();micNode=null;}
  audio.pause();mode='idle';$('modo').textContent='EN SILENCIO';$('microfono').setAttribute('aria-pressed','false');
 }
 function rms(){analyser.getFloatTimeDomainData(timeData);let total=0;for(const v of timeData)total+=v*v;return Math.sqrt(total/timeData.length);}
 function curve(x,offset){
  const u=x/width;
  const wave=.70*Math.sin(u*Math.PI*7-phase)+.22*Math.sin(u*Math.PI*3-phase*.44)+.08*Math.sin(u*Math.PI*11+phase*.6);
  return height*.5+amplitude*height*.24*wave+offset;
 }
 // Textura original generada una sola vez: pigmento difuso y grano fino.
 // Se dibuja sobre un canvas transparente; no usa el cuadriculado de la referencia.
 const pigment=document.createElement('canvas');pigment.width=2048;pigment.height=384;
 const pc=pigment.getContext('2d');const ink=pc.createImageData(pigment.width,pigment.height);
 let seed=73471;
 function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
 const gaussian=(v,c,s)=>Math.exp(-.5*((v-c)/s)**2);
 for(let y=0;y<pigment.height;y++)for(let x=0;x<pigment.width;x++){
  const u=x/pigment.width,v=y/pigment.height*2-1;
  const drift=.10*Math.sin(u*19)+.055*Math.sin(u*37);
  // El verde cruza el azul y el violeta en vez de formar tubos paralelos.
  const green=gaussian(v,.22+.16*Math.sin(u*13)+drift,.22)*(1+.18*Math.sin(u*24));
  const blue=gaussian(v,-.15+drift,.28)*1.15;
  const purple=gaussian(v,-.48+.12*Math.sin(u*17),.22)*.72+gaussian(v,.59,.17)*.36;
  const mist=gaussian(v,.05,.44)*.12;
  const sum=green+blue+purple+mist;
  const density=Math.min(.96,(green*.83+blue*.74+purple*.63+mist)*.87);
  const grain=random();const dust=(grain-.5)*24;
  const i=(y*pigment.width+x)*4;
  ink.data[i]=(green*115+blue*39+purple*177+mist*169)/sum+dust;
  ink.data[i+1]=(green*233+blue*134+purple*126+mist*222)/sum+dust;
  ink.data[i+2]=(green*174+blue*191+purple*227+mist*221)/sum+dust;
  // La densidad variable crea un borde de polvo suave, sin contorno luminoso duro.
  const edge=Math.min(1,Math.max(0,(1-Math.abs(v))/.20));
  ink.data[i+3]=255*density*edge*(.70+.30*random());
 }
 pc.putImageData(ink,0,0);
 function paintAurora(){
  const thickness=24+amplitude*Math.min(240,height*.52);
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  ctx.imageSmoothingEnabled=true;
  // Columnas estrechas solapadas: una cinta continua siguiendo la curva del audio.
  const texture=textureReady?cloudTexture:pigment;
  const textureWidth=texture.width,textureHeight=texture.height;
  const density=canvas.width/width;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);
  // Los pigmentos fluyen dentro de la cinta; la niebla se mueve por separado.
  for(let px=0;px<canvas.width;px++){
   const x=(px+.5)/density,u=(px+.5)/canvas.width;
   const center=curve(x,0);
   const crest=Math.min(1,Math.abs(center-height*.5)/(height*.24*Math.max(amplitude,.001)));
   const side=Math.pow(Math.abs(u-.5)*2,4);
   const spread=1+amplitude*(.40*Math.pow(crest,1.4)+.15*side+.06*Math.sin(u*12-flow*.3));
   const h=Math.min(thickness*spread,Math.max(28,2*(Math.min(center,height-center)-12)));
   const travel=.075*Math.sin(u*9-flow)*Math.sin(Math.PI*u);
   const sourceU=Math.max(0,Math.min(.999,u+travel));
   const sw=textureWidth/canvas.width;
   const sx=Math.min(textureWidth-sw,sourceU*textureWidth);
   if(textureReady){
    const mistTravel=.09*Math.sin(u*7+flow*.8)*Math.sin(Math.PI*u);
    const msx=Math.max(0,Math.min(textureWidth-sw,(u+mistTravel)*textureWidth));
    const breathe=1.55+.18*Math.sin(u*10-flow*.6);
    let mh=Math.min(h*breathe,height*.72);
    const drift=Math.sin(u*14+flow*.7)*h*.14*amplitude;mh=Math.min(mh,Math.max(24,2*(Math.min(center+drift,height-center-drift)-3)));
    ctx.globalAlpha=.56+.20*amplitude;
    ctx.drawImage(mistTexture,msx,0,sw,textureHeight,px,(center+drift-mh/2)*density,1,mh*density);
   }
   ctx.globalAlpha=.88;
   ctx.drawImage(texture,sx,0,sw,textureHeight,px,(center-h/2)*density,1,h*density);
   if(textureReady){
    // Rosa integrado en el cuerpo, siguiendo una corriente que cruza los otros pigmentos.
    const rosePhase=u*10.5-flow*.8;
    const roseCenter=center+Math.sin(rosePhase)*h*.24;
    const roseHeight=Math.min(h*.90,Math.max(24,2*(Math.min(roseCenter,height-roseCenter)-3)));
    const roseAmount=.42+.58*Math.pow(Math.sin(u*6+flow*.37),2);
    ctx.globalAlpha=(.40+.28*amplitude)*roseAmount;
    ctx.drawImage(pinkTexture,sx,0,sw,textureHeight,px,(roseCenter-roseHeight/2)*density,1,roseHeight*density);
    // Luz adicional del propio color: brillo sin convertir la cinta en una franja blanca.
    ctx.globalCompositeOperation='screen';ctx.globalAlpha=.22+.14*amplitude;
    ctx.drawImage(texture,sx,0,sw,textureHeight,px,(center-h/2)*density,1,h*density);
    // Dos corrientes de pigmento cruzan posiciones y alturas distintas.
    // Cada muestra conserva los verdes, azules y violetas de la textura original.
    ctx.globalCompositeOperation='screen';
    for(let layer=0;layer<2;layer++){
     const driftPhase=flow*(layer===0?.63:-.47)+layer*2.4;
     const sampleU=.5+.44*Math.sin(u*5.4+driftPhase);
     const mixX=Math.max(0,Math.min(textureWidth-sw,sampleU*textureWidth));
     const vertical=Math.sin(u*12-driftPhase)*h*.24*amplitude;
     const mixCenter=center+vertical;
     const mixHeight=Math.min(h*(1.18+.18*Math.sin(u*8+driftPhase)),Math.max(24,2*(Math.min(mixCenter,height-mixCenter)-3)));
     ctx.globalAlpha=(.20+.11*(.5+.5*Math.sin(u*15+driftPhase)))*(.25+.75*amplitude);
     ctx.drawImage(mistTexture,mixX,0,sw,textureHeight,px,(mixCenter-mixHeight/2)*density,1,mixHeight*density);
    }
    ctx.globalCompositeOperation='source-over';
   }
  }
  ctx.globalAlpha=1;
  ctx.restore();
 }
 // Polvo luminoso: coordenadas ligadas a la onda, sin cubrir los controles.
 const sparks=Array.from({length:1100},(_,i)=>({u:random(),v:(random()+random()+random()-1.5)/1.5,size:.35+random()*1.05,phase:random()*Math.PI*2,speed:.012+random()*.026,color:i%4}));
 const sparkColors=['#93ffd8','#82ceff','#f1a4ed','#d7c0ff'];
 // Filamentos cortos e irregulares, inspirados en la textura luminosa de la referencia.
 const threads=Array.from({length:4200},()=>({u:random(),v:(random()+random()-1),length:1.5+random()*4.5,angle:random()*Math.PI*2,phase:random()*6.28,color:Math.floor(random()*4)}));
 function paintFilaments(){
  ctx.save();ctx.globalCompositeOperation='screen';ctx.lineCap='round';
  const band=24+amplitude*Math.min(240,height*.52);
  for(const s of threads){
   const u=(s.u+flow*.006)%1,x=u*width,center=curve(x,0);
   const envelope=Math.max(0,1-Math.abs(s.v));
   const y=center+s.v*band*.56+Math.sin(flow*.35+s.phase)*band*.035*amplitude;
   const length=s.length*(.45+.7*amplitude);
   const angle=s.angle+Math.sin(flow*.4+s.phase)*.3;
   const dx=Math.cos(angle)*length,dy=Math.sin(angle)*length;
   ctx.globalAlpha=envelope*(.20+.43*amplitude)*(.7+.3*Math.sin(flow+s.phase)**2);
   ctx.strokeStyle=['#baffcc','#a4efff','#ffc2f5','#d6caff'][s.color];
   ctx.lineWidth=.6+.4*amplitude;
   ctx.beginPath();ctx.moveTo(x-dx*.5,y-dy*.5);ctx.quadraticCurveTo(x-dy*.4,y+dx*.4,x+dx*.5,y+dy*.5);ctx.stroke();
  }
  ctx.restore();
 }
 function paintParticles(){
  ctx.save();ctx.globalCompositeOperation='screen';
  const band=24+amplitude*Math.min(240,height*.52);
  for(const s of sparks){
   const u=(s.u+flow*s.speed)%1,x=u*width;
   const center=curve(x,0);
   const wave=Math.min(1,Math.abs(center-height*.5)/(height*.24*Math.max(amplitude,.001)));
   const spread=band*(.52+.21*amplitude*wave);
   const offset=s.v*spread+Math.sin(flow*.8+s.phase)*spread*.06*amplitude;
   const y=center+offset;
   if(y<8||y>height-8)continue;
   const fade=Math.pow(Math.max(0,1-Math.abs(s.v)),1.4);
   const shimmer=.55+.45*Math.sin(flow*1.7+s.phase)**2;
   const radius=s.size*(.7+.6*amplitude);
   ctx.globalAlpha=fade*shimmer*(.32+.50*amplitude);
   ctx.fillStyle=sparkColors[s.color];
   ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
   if(s.size>1.24){
    const glow=ctx.createRadialGradient(x,y,0,x,y,7+amplitude*5);
    glow.addColorStop(0,sparkColors[s.color]);glow.addColorStop(1,sparkColors[s.color]+'00');
    ctx.globalAlpha=fade*shimmer*.28;ctx.fillStyle=glow;
    ctx.fillRect(x-12,y-12,24,24);
   }
  }
  ctx.restore();
 }
 function draw(now){
  raf=0;const dt=Math.min((now-last)/1000||.016,.08);last=now;
  let target=0;
  if(mode==='demo'){target=.48+.32*Math.sin(now*.0018)**2;low=.55;high=.25;}
  else if(mode==='mic'||(mode==='file'&&!audio.paused&&!audio.ended)){
   const level=rms();target=Math.min(1,Math.max(0,level-.006)*Number($('sensibilidad').value)*5);
   analyser.getByteFrequencyData(frequency);low=0;high=0;for(let i=1;i<24;i++)low+=frequency[i]/(255*23);for(let i=80;i<240;i++)high+=frequency[i]/(255*160);
  }
  amplitude+=(target-amplitude)*(1-Math.exp(-dt*(target>amplitude?7:4.5)));
  if(amplitude<.001)amplitude=0;
    const desiredVelocity=(.65+low*1.3+high*.6)*amplitude;
  velocity+=(desiredVelocity-velocity)*(1-Math.exp(-dt*3));
  phase+=dt*velocity;
  flow+=dt*(.22+amplitude*.7);
  ctx.clearRect(0,0,width,height);
  paintAurora();
  paintFilaments();
  paintParticles();
  canvas.dataset.amplitude=amplitude.toFixed(3);canvas.dataset.mode=mode;
  if(!document.hidden)raf=requestAnimationFrame(draw);
 }
 function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);}
 $('microfono').addEventListener('click',async()=>{
  stop();const request=ticket;say('Esperando permiso para el micrófono…');
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw Error('unavailable');
   await init();const incoming=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:false},video:false});
   if(request!==ticket){incoming.getTracks().forEach(t=>t.stop());return;}
   stream=incoming;micNode=ac.createMediaStreamSource(stream);micNode.connect(analyser);mode='mic';$('modo').textContent='MICRÓFONO ACTIVO';$('microfono').setAttribute('aria-pressed','true');say('Habla, canta o da una palmada. La altura de las curvas responde al volumen.');
   stream.getAudioTracks()[0].addEventListener('ended',()=>{if(mode==='mic'){stop();say('El micrófono se desconectó.');}});
  }catch(e){if(request!==ticket)return;stop();say(e.name==='NotAllowedError'?'No se autorizó el micrófono. Puedes elegir un archivo de audio o probar la demostración.':'No se pudo abrir el micrófono. Prueba en HTTPS o localhost, o elige un archivo de audio.');}
 });
 $('archivo').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;stop();const request=ticket;
  try{await init();if(request!==ticket)return;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(file);audio.src=url;audio.hidden=false;
   if(!mediaNode){mediaNode=ac.createMediaElementSource(audio);mediaNode.connect(analyser);mediaNode.connect(ac.destination);}
   mode='file';$('modo').textContent='ARCHIVO DE AUDIO';say('Archivo: '+file.name+'. Pulsa reproducir para mover la aurora.');
  }catch{say('No se pudo preparar el audio. Prueba otro archivo.');}
 });
 audio.addEventListener('play',async()=>{if(mode!=='file'){stop();mode='file';await audio.play();}await init();$('modo').textContent='REACCIONANDO AL AUDIO';say('Las curvas siguen el volumen del archivo.');});
 audio.addEventListener('pause',()=>{if(mode==='file'){$('modo').textContent='AUDIO EN PAUSA';}});
 audio.addEventListener('ended',()=>{if(mode==='file'){$('modo').textContent='EN SILENCIO';say('El audio terminó. La aurora vuelve a una línea recta.');}});
 audio.addEventListener('error',()=>{stop();say('No se pudo reproducir ese archivo. Prueba con MP3 o WAV.');});
 $('demo').addEventListener('click',()=>{stop();mode='demo';$('modo').textContent='DEMOSTRACIÓN · SIN AUDIO';say('Movimiento simulado para revisar la forma. No está escuchando el micrófono.');});
 $('detener').addEventListener('click',()=>{stop();say('Detenido. La aurora vuelve a una línea recta.');});
 $('sensibilidad').addEventListener('input',e=>$('ganancia').textContent=Number(e.target.value).toFixed(1)+'×');
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=performance.now();if(!raf)raf=requestAnimationFrame(draw);}});
 window.addEventListener('pagehide',()=>{stop();if(url)URL.revokeObjectURL(url);if(ac)ac.close();});
 window.addEventListener('resize',resize);resize();raf=requestAnimationFrame(draw);
})();

















