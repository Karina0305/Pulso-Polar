/* Nube de brillo: cada partícula usa un fragmento del PNG original. */
(() => {
  'use strict';
  const source = new URL('../assets/particulas-original.png', document.currentScript.src).href;
  const texture = new Image();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(any-pointer: fine)');
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-particulas';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let ready = false, visible = false, frame = 0, previous = 0, ratio = 1;
  let x = 0, y = 0, lastX = 0, lastY = 0, particles = [];
  // Destellos aislados: verde, azul y violeta, sin incorporar la nube blanca.
  const sprites = [[320, 819, 95, 95], [513, 318, 62, 64], [450, 785, 64, 64]];
  const colors = ['#39dfa0', '#408fff', '#b754ef', '#43dce8'];
  function resize() {
    ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * ratio);
    canvas.height = Math.round(innerHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function layer() {
    const dialogs = [...document.querySelectorAll('dialog[open]')];
    const parent = dialogs.at(-1) || document.body;
    if (canvas.parentNode !== parent) parent.appendChild(canvas);
  }
  function emit(px, py, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 58;
      particles.push({x:px + Math.cos(angle)*radius, y:py + Math.sin(angle)*radius,
        vx:(Math.random()-.5)*19, vy:-7-Math.random()*17,
        age:0, life:.75+Math.random()*1.25, size:20+Math.random()*28,
        sprite:Math.floor(Math.random()*3), color:Math.floor(Math.random()*4), phase:Math.random()*6.28});
    }
    if (particles.length > 100) particles.splice(0, particles.length - 100);
  }
  function draw(now) {
    frame = 0;
    const dt = Math.min((now - previous) / 1000 || .016, .045);
    previous = now;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (visible && particles.length < 52 && Math.random() < .5) emit(x, y, 1);
    particles = particles.filter(p => p.age < p.life);
    for (const p of particles) {
      p.age += dt; p.x += p.vx*dt; p.y += p.vy*dt;
      const fade = Math.sin(Math.PI * Math.min(p.age/p.life, 1));
      // Destello pequeño, textura original y halo suave sin discos sólidos.
      const color = colors[p.color];
      const radius = p.size * .5;
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      halo.addColorStop(0, color + 'cf');
      halo.addColorStop(.10, color + 'a0');
      halo.addColorStop(.32, color + '4f');
      halo.addColorStop(.66, color + '16');
      halo.addColorStop(1, color + '00');
      ctx.globalAlpha = fade;
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI*2); ctx.fill();
      const s = sprites[p.sprite];
      ctx.globalAlpha = fade * .7;
      ctx.drawImage(texture, ...s, p.x-p.size/2, p.y-p.size/2, p.size, p.size);
      ctx.globalAlpha = fade * (.7 + .15*Math.sin(now*.003+p.phase));
      // Centro diminuto luminoso; algunos destellos tienen cuatro puntas.
      const core = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 2.2);
      core.addColorStop(0, '#e5ffff');
      core.addColorStop(.35, color);
      core.addColorStop(1, color + '00');
      ctx.fillStyle = core;
      ctx.fillRect(p.x-2.2, p.y-2.2, 4.4, 4.4);
      if (p.phase > 4.5) {
        const ray = p.size*.15;
        ctx.globalAlpha = fade*.5;
        ctx.fillStyle = '#d9fff7';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y-ray); ctx.lineTo(p.x+.6,p.y-.6);
        ctx.lineTo(p.x+ray*.7,p.y); ctx.lineTo(p.x+.6,p.y+.6);
        ctx.lineTo(p.x,p.y+ray); ctx.lineTo(p.x-.6,p.y+.6);
        ctx.lineTo(p.x-ray*.7,p.y); ctx.lineTo(p.x-.6,p.y-.6);
        ctx.closePath(); ctx.fill();
      }
    }
    // Punto preciso para conservar la facilidad de pulsar enlaces y botones.
    if (visible) {
      ctx.globalAlpha = .95;
      ctx.fillStyle = '#d6ffff'; ctx.shadowColor = '#69eaff'; ctx.shadowBlur = 9;
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    if (visible || particles.length) frame = requestAnimationFrame(draw);
  }
  function start() { if (!frame) { previous = performance.now(); frame = requestAnimationFrame(draw); } }
  function clear() {
    visible = false; particles = [];
    document.documentElement.classList.remove('cursor-cosmico-activo');
    cancelAnimationFrame(frame); frame = 0;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
  document.addEventListener('pointermove', event => {
    if (!ready || motion.matches || !fine.matches || event.pointerType !== 'mouse') { clear(); return; }
    const first = !visible;
    x = event.clientX; y = event.clientY;
    visible = true; layer();
    document.documentElement.classList.add('cursor-cosmico-activo');
    if (first) emit(x,y,28);
    else if (Math.hypot(x-lastX,y-lastY)>4) emit(x,y,3);
    lastX=x; lastY=y; start();
  }, {passive:true});
  document.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') clear(); }, {passive:true});
  document.documentElement.addEventListener('pointerleave', clear);
  window.addEventListener('blur', clear);
  document.addEventListener('visibilitychange', () => {if (document.hidden) clear();});
  motion.addEventListener('change', clear); fine.addEventListener('change', clear);
  document.addEventListener('keydown', event => {if (event.key === 'Tab') clear();});
  window.addEventListener('resize', resize);
  new MutationObserver(layer).observe(document.body, {subtree:true, attributes:true, attributeFilter:['open']});
  texture.onload = () => { ready = true; layer(); resize(); };
  texture.onerror = clear;
  texture.src = source;
})();




