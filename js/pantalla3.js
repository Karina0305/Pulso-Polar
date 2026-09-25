/* Auroras ancladas a las regiones de la imagen: la Tierra permanece fija. */
(()=>{'use strict';
const canvas=document.getElementById('auroras-polares'),ctx=canvas.getContext('2d');if(!ctx)return;
const glow=document.createElement('canvas'),g=glow.getContext('2d');glow.width=1920;glow.height=1080;
// La misma textura de pigmentos de la pantalla dos, doblada sobre cada recorrido.
const texture=new Image(),ribbon=document.createElement('canvas');let textureReady=false;
ribbon.width=1800;ribbon.height=384;
texture.onload=()=>{const r=ribbon.getContext('2d');r.filter='saturate(1.65) brightness(1.18)';r.drawImage(texture,0,texture.naturalHeight*.24,texture.naturalWidth,texture.naturalHeight*.52,0,0,1800,384);r.filter='none';r.globalCompositeOperation='destination-in';const fade=r.createLinearGradient(0,0,0,384);fade.addColorStop(0,'transparent');fade.addColorStop(.22,'#000');fade.addColorStop(.76,'#000');fade.addColorStop(1,'transparent');r.fillStyle=fade;r.fillRect(0,0,1800,384);textureReady=true;paint();};
texture.src=new URL('../assets/aurora-textura.png',document.currentScript.src).href;
function paintRibbon(){if(!textureReady)return;g.clearRect(0,0,1920,1080);g.filter='none';g.globalCompositeOperation='source-over';
 for(let id=0;id<paths.length;id++)for(let i=0;i<340;i++){
  const u=i/340,p=at(id,u),q=at(id,(i+1)/340);
  const length=Math.hypot(q[0]-p[0],q[1]-p[1]),angle=Math.atan2(q[1]-p[1],q[0]-p[0]);
  const h=(153+34*Math.sin(u*6-phase*.75+id)+14*Math.sin(u*11+phase*.48))*(.5+.5*Math.sin(Math.PI*u)**.35);
  const source=.5+.47*Math.sin(u*4.5+phase*.37+id*1.7);
  g.save();g.translate(...p);g.rotate(angle);g.globalAlpha=.094*Math.min(1,length/3.8);
  g.drawImage(ribbon,source*(1800-6),0,6,384,-14,-h/2,28,h);g.restore();
 }
 ctx.save();ctx.filter='blur(7px)';ctx.drawImage(glow,0,0);ctx.restore();
}
const paths=[
 [[250,-45],[375,65],[435,178],[368,245],[320,346],[298,449],[213,515],[132,570],[43,488],[-35,389]],
 [[-60,656],[65,708],[185,700],[286,624],[381,534],[475,512],[547,552]],
 [[1270,697],[1360,568],[1490,452],[1625,402],[1760,483],[1865,609],[1980,748]],
 [[1400,762],[1500,808],[1602,773],[1690,699],[1800,752],[1930,886]]
];
let phase=0,last=0,frame=0,userPaused=null;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let seed=3671;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const dust=Array.from({length:7600},()=>({path:Math.floor(rand()*4),u:rand(),offset:(rand()+rand()-1)*168,size:.5+rand()*1.1,phase:rand()*6.28}));
function point(points,u){const t=Math.min(.999999,Math.max(0,u))*(points.length-1),i=Math.floor(t),f=t-i,a=points[Math.max(0,i-1)],b=points[i],c=points[Math.min(points.length-1,i+1)],d=points[Math.min(points.length-1,i+2)];return [0,1].map(k=>.5*((2*b[k])+(-a[k]+c[k])*f+(2*a[k]-5*b[k]+4*c[k]-d[k])*f*f+(-a[k]+3*b[k]-3*c[k]+d[k])*f*f*f));}
function at(id,u,offset=0){
 // Ondas largas que viajan, con pliegues secundarios y respiración lenta.
 const p=point(paths[id],u),a=point(paths[id],Math.max(0,u-.003)),b=point(paths[id],Math.min(1,u+.003));
 const angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
 const envelope=.50+.50*Math.sin(Math.PI*u);
 const wave=envelope*(29*Math.sin(u*8-phase*1.12+id*.8)+12*Math.sin(u*14+phase*.67+id*1.3)+7*Math.sin(u*4-phase*.39));
 const drift=8*Math.sin(phase*.54+u*5+id);
 return [p[0]-Math.sin(angle)*(wave+offset)+Math.cos(angle)*drift,p[1]+Math.cos(angle)*(wave+offset)+Math.sin(angle)*drift];
}
function line(id,offset){g.beginPath();for(let i=0;i<=180;i++){const p=at(id,i/180,offset);if(!i)g.moveTo(...p);else g.lineTo(...p);}}
function paint(){g.clearRect(0,0,1920,1080);g.lineCap='round';g.lineJoin='round';
 for(let id=0;id<paths.length;id++){
  const pink=id===1||id===3;
  for(const [width,blur,alpha] of [[230,53,.12],[130,32,.22],[42,12,.36]]){
   g.filter=`blur(${blur}px)`;g.lineWidth=width;
   g.globalAlpha=alpha*(.84+.16*Math.sin(phase*.7+id));
   const c=g.createLinearGradient(0,0,1920,1080);c.addColorStop(0,pink?'#cb8aee':'#6dffc8');c.addColorStop(.35,pink?'#f19cdd':'#58e6d7');c.addColorStop(.7,pink?'#c49aff':'#98ffa8');c.addColorStop(1,pink?'#e591e8':'#57e1d7');g.strokeStyle=c;line(id,0);g.stroke();
  }
  g.filter='blur(34px)';g.lineWidth=66;g.globalAlpha=.23;g.strokeStyle=pink?'#62eadb':'#bc92f6';line(id,43*Math.sin(phase*.45+id));g.stroke();
 }
 g.filter='none';g.globalAlpha=1;
 ctx.clearRect(0,0,1920,1080);ctx.globalCompositeOperation='source-over';ctx.drawImage(glow,0,0);paintRibbon();
 ctx.globalCompositeOperation='screen';
 for(const s of dust){const u=(s.u+phase*.009)%1,p=at(s.path,u,s.offset+10*Math.sin(phase*.6+s.phase));ctx.globalAlpha=.31*Math.pow(Math.max(0,1-Math.abs(s.offset)/180),.7)*(.6+.4*Math.sin(phase+s.phase)**2);ctx.strokeStyle=s.path%2?'#f2c1ff':'#b3ffe0';ctx.lineWidth=s.size;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.quadraticCurveTo(p[0]+2,p[1]-3,p[0]+4,p[1]+1);ctx.stroke();}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';canvas.dataset.phase=phase.toFixed(3);
}

function paused(){return userPaused===null?reduced.matches:userPaused;}
function tick(now){frame=0;const dt=Math.min((now-last)/1000||0,.05);last=now;phase+=dt;paint();if(!paused()&&!document.hidden)frame=requestAnimationFrame(tick);}
function sync(){cancelAnimationFrame(frame);frame=0;last=performance.now();paint();if(!paused()&&!document.hidden)frame=requestAnimationFrame(tick);}
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);ctx.setTransform(canvas.width/1920,0,0,canvas.height/1080,0,0);paint();}
reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);window.addEventListener('resize',resize);resize();sync();
})();






