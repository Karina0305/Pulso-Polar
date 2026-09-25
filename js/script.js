/* Pantalla 2: reloj único para onda, corazón y latidos sintetizados. */
(()=>{'use strict';
const $=id=>document.getElementById(id),API='https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',HPI='https://services.swpc.noaa.gov/text/aurora-nowcast-hemi-power.txt';
const s=window.polarState={kp:null,kpPlanet:null,energyGW:null,energyDate:null,polo:'sur',motionLevel:0,touchLevel:0,interactionLevel:0,touchX:.5,touchY:.5,volume:.85,bpm:40,phase:0,pulse:0,color:'#46ed91',source:'pending',motionSource:'stopped',beats:0,paused:false};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let latest=null,request=null,busy=false,dead=false,stream=null,ticket=0,previous=null,last=0,raf,ac=null,sound=true,simTime=0;
const video=$('video'),canvas=$('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});canvas.width=96;canvas.height=72;
const voices=new Set();let master=null;function output(){if(!master){master=ac.createDynamicsCompressor();master.threshold.value=-12;master.knee.value=18;master.ratio.value=3;master.attack.value=.008;master.release.value=.18;master.connect(ac.destination);}return master;}
function apply(kp,source,date){s.kp=kp;s.source=source;s.updated=date;render();}
async function refresh(){if(busy||dead)return;busy=true;request=new AbortController();const timer=setTimeout(()=>request?.abort(),10000);
 try{const r=await fetch(API,{cache:'no-store',signal:request.signal});if(!r.ok)throw Error('HTTP '+r.status);const rows=await r.json();if(!Array.isArray(rows))throw Error('Formato NOAA');
 const valid=rows.filter(x=>x&&x.kp_index!=null&&String(x.kp_index).trim()!=='').map(x=>{let t=String(x.time_tag).replace(' ','T');if(!/(Z|[+-]\d\d:\d\d)$/i.test(t))t+='Z';return {kp:Number(x.kp_index),date:new Date(t)}}).filter(x=>Number.isFinite(x.kp)&&x.kp>=0&&x.kp<=9&&Number.isFinite(+x.date)).sort((a,b)=>b.date-a.date);
  if(!valid.length)throw Error('Sin Kp válido');if(dead)return;latest={...valid[0],source:'noaa'};if(s.source!=='manual')applyPlanet(latest.kp,latest.date,'noaa');
  }catch(e){if(dead)return;console.warn('NOAA no disponible. Se conserva el último registro real; reintento en 60 s.',e);if(s.source!=='manual'){if(latest)applyPlanet(latest.kp,latest.date,'offline');else apply(null,'offline',null);}}
  finally{clearTimeout(timer);busy=false;request=null;}
}
// Potencia hemisférica (GW) norte/sur en vivo (Ovation, cadencia 5 min).
// El Kp es planetario (global, un solo valor); lo hemisférico es el HPI.
let hpiBusy=false;
function hpiToAct(gw){if(!Number.isFinite(gw))return null;return clamp(9*(gw-10)/(120-10),0,9);}
function applyPlanet(kp,date,source){
 s.kpPlanet=kp;source=source||'noaa';
 if(s.source==='manual')return;
 const act=hpiToAct(s.energyGW);
 if(act==null||kp==null)apply(kp??act,source,date);
 else apply(act,source,date);
}
async function refreshHPI(){if(hpiBusy||dead)return;hpiBusy=true;
 try{const r=await fetch(HPI,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);
  const text=await r.text(),rows=text.split('\n').map(l=>l.trim().split(/\s+/)).filter(c=>c.length>=4&&/^\d{4}-\d{2}-\d{2}_\d{2}:\d{2}$/.test(c[0]));
  if(!rows.length)throw Error('Sin HPI válido');
  const lastRow=rows[rows.length-1],n=Number(lastRow[2]),st=Number(lastRow[3]);
  if(!Number.isFinite(n)||!Number.isFinite(st))throw Error('HPI no numérico');
  if(dead)return;
  s.energyGW=(n+st)/2;
  const t=lastRow[0].replace('_','T');s.energyDate=new Date(t.length===16?t+':00Z':t+'Z');
  if(s.source!=='manual')applyPlanet(s.kpPlanet,s.updated);
 }catch(e){if(!dead)console.warn('Energía del pulso no disponible; la onda conserva el Kp planetario.',e);}
 finally{hpiBusy=false;}
}
function setPolo(p){if(p!=='norte'&&p!=='sur')return;s.polo=p;if(s.source!=='manual')applyPlanet(s.kpPlanet,s.updated);else render();}
window.__polarSetPolo=setPolo;
function live(){if(latest)applyPlanet(latest.kp,latest.date,'noaa');else apply(null,'pending',null);refresh();refreshHPI();}
function simulate(value){apply(Number(value),'manual',new Date());$('test-value').textContent=value;$('kp-test').value=value;$('simular').value=value;$('valor-simulacion').textContent=value;}
function syncPanels(){const manual=s.source==='manual';$('apartado-manual').hidden=!manual;$('manual-toggle').setAttribute('aria-pressed',String(manual));$('manual-toggle').setAttribute('aria-expanded',String(manual));$('apartado-camara').hidden=s.motionSource!=='camera';$('apartado-volumen').hidden=true;$('start-camera').setAttribute('aria-pressed',String(s.motionSource==='camera'));}
function render(){syncPanels();const k=s.kp??0,b=k<3?['lento','verde','#46ed91']:k<5?['normal','azul','#448aff']:k<7?['rápido','cian','#35e9f1']:['muy rápido','rosa','#fa76c8'];s.interactionLevel=Math.max(s.motionLevel,s.touchLevel);s.color=s.interactionLevel>.12?`hsl(${145+s.interactionLevel*175} 95% 70%)`:b[2];s.bpm=s.kp==null?0:(40+k*15.5)*(1+.70*s.interactionLevel);
 const label=s.source==='noaa'?(Date.now()-s.updated>600000?'NOAA · REGISTRO RETRASADO':'NOAA · AUTOMÁTICO · CADA 60 S'):s.source==='manual'?'SIMULACIÓN MANUAL':s.source==='offline'?(s.kp==null?'NOAA NO DISPONIBLE · ESPERANDO DATOS':'SIN CONEXIÓN · ÚLTIMO KP REAL'):'CONSULTANDO NOAA';
  $('modo').textContent=label;const kpShown=s.source==='manual'?s.kp:s.kpPlanet;$('kp-value').textContent=$('kp').textContent=kpShown==null?'—':Number(kpShown.toFixed(2));$('kp-label').textContent=$('ritmo').textContent=b[0];$('color').textContent=b[1];$('bpm-value').textContent=s.bpm.toFixed(1);
  const eTxt=s.energyGW==null?(s.source==='pending'?'Energía del pulso: cargando…':'Energía del pulso: sin datos'):`Energía del pulso: ${Math.round(s.energyGW)} GW`;
  $('energy-value').textContent=eTxt;$('polo-value').textContent=s.polo;$('hpi').textContent=s.energyGW==null?(s.source==='pending'?'Cargando…':'Sin datos'):`${Math.round(s.energyGW)} GW`;
 $('motion-level').textContent=Math.round(s.motionLevel*100)+'%'+(s.motionSource==='simulated'?' (simulado)':'');
 const time=s.updated?new Intl.DateTimeFormat('es-MX',{dateStyle:'short',timeStyle:'medium'}).format(s.updated):'—';$('last-update').textContent=$('fecha').textContent=time;$('estado').textContent=label;$('lectura').textContent=s.bpm.toFixed(1)+' BPM';
 $('heart').style.color=s.color;$('latido').style.color=s.color;$('latido').style.animation='none';$('latido').querySelector('path').style.fill=s.color;
}
function stopVoices(){for(const v of voices){try{v.stop();}catch{}}voices.clear();}
// Latido natural: lub-dub senoidal grave con caída exponencial, sin pitch-shift por velocidad.
// El Kp solo controla ritmo (BPM) e intensidad, no el tono.
const heartBuffers=new Map();
function heartSample(second,kp){
 if(heartBuffers.has(second))return heartBuffers.get(second);
 const duration=second?.13:.18,buffer=ac.createBuffer(1,Math.ceil(ac.sampleRate*duration),ac.sampleRate),data=buffer.getChannelData(0);
 const baseFreq=second?62:52;
 let peak=0;
 for(let i=0;i<data.length;i++){
  const t=i/ac.sampleRate;
  const env=Math.pow(1-Math.exp(-t/.008),1.2)*Math.exp(-t/(second?.028:.042));
  const tail=Math.min(1,(duration-t)/.025);
  const lub=Math.sin(2*Math.PI*baseFreq*t)*.9+Math.sin(2*Math.PI*baseFreq*2.02*t)*.22+Math.sin(2*Math.PI*baseFreq*.5*t)*.12;
  data[i]=lub*env*tail;peak=Math.max(peak,Math.abs(data[i]));
 }
 for(let i=0;i<data.length;i++)data[i]=data[i]/Math.max(peak,.001)*.9;
 heartBuffers.set(second,buffer);return buffer;
}
function thump(at,gain,second){
 const source=ac.createBufferSource(),level=ac.createGain();source.buffer=heartSample(second,s.kp??0);
 source.playbackRate.value=1;level.gain.value=gain;
 source.connect(level);level.connect(output());voices.add(source);
 source.onended=()=>{voices.delete(source);source.disconnect();level.disconnect();};source.start(at);
}
function heartbeat(){
 if(!sound||!ac||ac.state!=='running'||s.bpm<=0)return;
 const kp=s.kp??0,period=60/s.bpm,at=ac.currentTime+.008;
 const intensity=kp/9;
 const gain=(.72+intensity*.22+s.interactionLevel*.08)*s.volume;
 thump(at,gain,false);thump(at+Math.max(.18,period*.28),gain*.65,true);
}
function soundUI(){
 $('sound-toggle').textContent=sound?'Silenciar latidos':'Activar latidos';
 $('sound-toggle').setAttribute('aria-pressed',String(!sound));
 $('sound-status').textContent=!sound?'Latidos silenciados.':ac?.state==='running'?'Latidos sincronizados con la onda.':'El sonido comenzará con tu primer toque o clic.';
}
function startSound(){
 if(!sound||dead)return;
 try{ac??=new (window.AudioContext||window.webkitAudioContext)();const result=ac.resume();soundUI();result?.then(()=>{if(!dead)soundUI();}).catch(()=>{if(!dead)soundUI();});}catch(e){$('sound-status').textContent='El navegador no pudo iniciar el sonido.';}
}
function unlockSound(event){if(event.target.closest?.('#sound-toggle'))return;if(sound&&(!ac||ac.state!=='running'))startSound();}
document.addEventListener('pointerdown',unlockSound);document.addEventListener('keydown',unlockSound);

function animate(now){const dt=Math.max(0,(now-last)/1000||0);last=now;if(s.kp!=null&&!s.paused&&!document.hidden){const old=Math.floor(s.phase/(Math.PI*2));s.phase+=dt*s.bpm/60*Math.PI*2;if(Math.floor(s.phase/(Math.PI*2))>old){s.beats++;heartbeat();}}
 const cycle=(s.phase/(Math.PI*2))%1;s.pulse=Math.exp(-(((cycle-.08)/.055)**2))+.55*Math.exp(-(((cycle-.32)/.07)**2));
 const scale=reduced.matches?1:1+(.035+(s.kp??0)/9*.16+s.interactionLevel*.22)*s.pulse;
 $('heart').style.scale=String(scale);$('heart').style.filter=`brightness(${1+s.pulse*.3+s.interactionLevel*.4})`;$('latido').style.scale=String(scale);
 if(!document.hidden)raf=requestAnimationFrame(animate);
}
function release(){ticket++;const old=stream;stream=null;old?.getTracks().forEach(t=>t.stop());video.pause();video.srcObject=null;video.hidden=true;previous=null;}
function stopCamera(){release();s.motionLevel=0;s.motionSource='stopped';$('camera-status').textContent='Cámara apagada. El Kp controla la onda.';render();}
function fallback(e){release();s.motionSource='stopped';s.motionLevel=0;const reason=e.name==='NotAllowedError'?'Permiso denegado: permite la cámara en el navegador y vuelve a activarla.':e.name==='NotFoundError'?'No se encontró una cámara.':e.name==='NotReadableError'?'La cámara está ocupada: cierra otras aplicaciones que la usen.':'Abre la página en HTTPS o localhost y revisa la cámara.';$('camera-status').textContent=reason+' También puedes tocar o arrastrar sobre la aurora.';console.warn('Cámara no disponible',e);render();}async function camera(){release();const current=ticket;s.motionSource='pending';s.motionLevel=0;$('camera-status').textContent='Esperando permiso de cámara…';render();try{if(!navigator.mediaDevices?.getUserMedia)throw Error('Usa HTTPS o localhost');const incoming=await navigator.mediaDevices.getUserMedia({video:true,audio:false});if(dead||current!==ticket){incoming.getTracks().forEach(t=>t.stop());return;}stream=incoming;video.srcObject=incoming;video.hidden=false;await video.play();if(dead||current!==ticket)return;s.motionSource='camera';$('camera-status').textContent='Cámara activa: mueve la mano frente a ella para alterar la aurora.';incoming.getVideoTracks()[0].onended=()=>{if(stream===incoming)fallback(Error('Cámara desconectada'));};}catch(e){if(!dead&&current===ticket)fallback(e);}}
function measure(){if(document.hidden)return;let target=0;if(s.motionSource==='camera'&&video.readyState>=2){try{ctx.drawImage(video,0,0,96,72);const data=ctx.getImageData(0,0,96,72).data,gray=new Float32Array(96*72);let sum=0,weight=0,mx=0,my=0;for(let i=0;i<gray.length;i++){gray[i]=.299*data[i*4]+.587*data[i*4+1]+.114*data[i*4+2];if(previous){const diff=Math.abs(gray[i]-previous[i]);sum+=diff;if(diff>12){weight+=diff;mx+=(i%96)*diff;my+=Math.floor(i/96)*diff;}}}target=previous?clamp((sum/gray.length-1.2)/10,0,1):0;previous=gray;if(weight>0&&!touching){s.touchX=1-mx/weight/96;s.touchY=my/weight/72;}}catch(e){fallback(e);}}else if(s.motionSource==='simulated'){const t=(performance.now()-simTime)/1000;target=.1+.5*(.5+.5*Math.sin(t*.7));}s.motionLevel+=(target-s.motionLevel)*.38;if(!touching)s.touchLevel*=.78;render();}
let touching=false;
const surface=$('aurora');
function touch(e){const r=surface.getBoundingClientRect();s.touchX=clamp((e.clientX-r.left)/r.width,0,1);s.touchY=clamp((e.clientY-r.top)/r.height,0,1);s.touchLevel=1;render();}
surface.addEventListener('pointerdown',e=>{touching=true;surface.setPointerCapture(e.pointerId);touch(e);});
surface.addEventListener('pointermove',e=>{if(touching)touch(e);});
for(const event of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(event,()=>{touching=false;});
$('volume').oninput=e=>{s.volume=Number(e.target.value);$('volume-value').textContent=Math.round(s.volume*100)+'%';};
$('manual-toggle').onclick=()=>{if(s.source==='manual')live();else simulate(Math.round(s.kp??3));};
$('start-camera').onclick=camera;$('stop-camera').onclick=stopCamera;
$('sound-toggle').onclick=()=>{sound=!sound;if(sound)startSound();else stopVoices();soundUI();syncPanels();};
$('kp-test').oninput=e=>simulate(e.target.value);$('simular').oninput=e=>simulate(e.target.value);$('live-main').onclick=live;$('en-vivo').onclick=live;$('actualizar').onclick=refresh;
$('pausar').onclick=()=>{s.paused=!s.paused;stopVoices();$('pausar').textContent=s.paused?'Reanudar animación':'Pausar animación';$('pausar').setAttribute('aria-pressed',String(s.paused));};
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);previous=null;if(document.hidden)stopVoices();else{last=performance.now();raf=requestAnimationFrame(animate);}});
 const fetchTimer=setInterval(()=>{refresh();refreshHPI();},60000),motionTimer=setInterval(measure,100);window.addEventListener('pagehide',()=>{dead=true;release();clearInterval(fetchTimer);clearInterval(motionTimer);request?.abort();cancelAnimationFrame(raf);stopVoices();ac?.close();});
 try{s.polo=document.getElementById('aurora')?.dataset.polo==='norte'?'norte':'sur';}catch{}
 render();refresh();refreshHPI();startSound();raf=requestAnimationFrame(animate);
})();








