(() => {
  'use strict';
  const canvas = document.querySelector('#world'), ctx = canvas.getContext('2d');
  const buttons = [...document.querySelectorAll('.object')];
  const kinds = buttons.map(b => b.dataset.kind);
  const colors = ['#e3b18a', '#b8ceac', '#dca49c', '#d4c894', '#9abdbd'];
  let W = 0, H = 0, time = 0, last = 0, paused = false, selected = 'flower', pointer = null, drag = null;
  let objects = [], particles = [];
  const random = (a, b) => a + Math.random() * (b - a);
  const people = Array.from({length: 12}, (_, i) => ({x: random(.13,.87), y: random(.48,.69), target: null, phase: i * 2.4, color: colors[i % colors.length], wait: 0}));
  let seed = 197;
  const rng = () => {seed = (seed * 16807) % 2147483647; return seed / 2147483647;};
  const grass = Array.from({length:260}, () => ({x:rng(), y:.42+rng()*.37, size:3+rng()*9, r:rng()}));
  const stars = Array.from({length:65}, () => ({x:rng(), y:rng()*.73, phase:rng()*7, size:rng()*1.4+.4}));
  function resize() {W = canvas.clientWidth; H = canvas.clientHeight; const d = Math.min(window.devicePixelRatio || 1, 2); canvas.width = W*d; canvas.height = H*d; ctx.setTransform(d,0,0,d,0,0);}
  window.addEventListener('resize',resize); resize();
  function ellipse(x,y,rx,ry,color) {ctx.fillStyle=color; ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);ctx.fill();}
  function line(points,color,width=1) {ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  function glow(x,y,r,color) {const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
  function select(kind) {selected=kind;buttons.forEach(b=>{const active=b.dataset.kind===kind;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});}
  const messages = {flower:'A flower garden blooms. Someone has come to dance.',tree:'A tree unfurls. A lovely place for a little rest.',water:'A raindrop becomes a pond. Time for a splash!',house:'A new little home. The neighbors are coming to visit.',lantern:'A lantern rises. Follow its warm little light.'};
  function place(x,y,kind=selected,initial=false) {
    // Keep illustrations in the meadow and clear of the toolbar.
    x=Math.max(.07,Math.min(.93,x)); y=Math.max(.44,Math.min((H-250)/H,y));
    if(objects.length>=35) objects.shift();
    const obj={x,y,kind,born:initial?-10:time,seed:random(0,100),size:random(.85,1.15)};objects.push(obj);
    if(!initial) {document.querySelector('#status').textContent=messages[kind];for(let i=0;i<18;i++)particles.push({x:x*W,y:y*H,vx:random(-35,35),vy:random(-65,-12),life:random(.7,1.8),color:colors[i%5]});people.forEach(p=>{if(Math.hypot((p.x-x)*W,(p.y-y)*H)<350){p.target=obj;p.wait=0;}});}
  }
  function reset(){objects=[];particles=[];people.forEach(p=>{p.target=null;p.wait=0;});place(.61,.57,'tree',true);place(.32,.64,'flower',true);place(.78,.65,'house',true);place(.48,.7,'water',true);place(.84,.43,'lantern',true);document.querySelector('#status').textContent='Your little people are exploring';}
  function drawObject(o) {
    const age=time-o.born, grow=Math.min(1,Math.max(0,age/1.25)), ease=1-Math.pow(1-grow,3);
    const s=o.size*Math.min(1,W/850+.35), sway=Math.sin(time+o.seed);
    ctx.save();ctx.translate(o.x*W,o.y*H);ctx.scale(s*ease,s*ease);
    ellipse(0,4,42,10,'#081c2433');
    if(o.kind==='flower') {
      for(let i=0;i<7;i++){const x=(i-3)*12,y=Math.sin(i*7+o.seed)*7,h=25+(Math.sin(i*3)*.5+.5)*40,lean=Math.sin(time*1.2+i)*3;
        line([[x,y],[x+lean*.5,-h*.5],[x+lean,-h]],'#739278',1.5);
        ellipse(x+5,-h*.4,7,3,'#8fab80');
        for(let j=0;j<5;j++){const a=j*Math.PI*2/5;ellipse(x+lean+Math.cos(a)*6,-h+Math.sin(a)*6,5,5,i%2?'#e5c29c':'#d79e98');}
        ellipse(x+lean,-h,3,3,'#f1dea5');}
    } else if(o.kind==='tree') {
      glow(0,-55,90,'#a2bd6320');line([[0,0],[-3,-45],[4,-88]],'#bca382',6);line([[-2,-35],[-26,-69]],'#bca382',3);line([[0,-51],[29,-80]],'#bca382',3);
      for(let i=0;i<38;i++){const a=i*2.4,r=12+Math.sqrt(i/38)*44,x=Math.cos(a)*r+sway*2,y=-89+Math.sin(a)*r*.7;ellipse(x,y,10+i%5,6+i%4,['#8ea97e','#abc18b','#6e927b','#c3cb95'][i%4]);}
      for(let i=0;i<4;i++)ellipse(Math.sin(i*5+time*.25)*38,-60+((time*8+i*24)%63),2.5,1.4,'#b7be8b');
    } else if(o.kind==='water') {
      ellipse(0,0,59,19,'#629b9a35');ellipse(0,-2,49,13,'#75aaa84a');
      for(let i=0;i<3;i++){ctx.strokeStyle='#afd4c154';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(Math.sin(i*9)*20,-2,10+((time*7+i*13)%36),3+((time*2+i*4)%9),0,0,Math.PI*2);ctx.stroke();}
      ellipse(25,-4,9,3,'#a2b782');ellipse(24,-8,3,4,'#e4b5af');line([[-44,-2],[-47,-23]],'#94a97a');ellipse(-47,-24,2,5,'#d6bd8e');
    } else if(o.kind==='house') {
      glow(0,-20,72,'#efbc5520');ctx.fillStyle='#b9aa83';ctx.fillRect(-24,-46,48,45);ctx.fillStyle='#d8c799';ctx.fillRect(-20,-43,39,41);
      ctx.fillStyle='#a57e6c';ctx.beginPath();ctx.moveTo(-34,-43);ctx.lineTo(0,-77);ctx.lineTo(34,-43);ctx.closePath();ctx.fill();line([[-34,-43],[0,-77],[34,-43]],'#dab398',2);
      ctx.fillStyle='#625f4c';ctx.fillRect(-5,-24,12,24);ctx.fillStyle='#f5db91';ctx.fillRect(-16,-34,9,10);ctx.fillRect(9,-34,9,10);
      for(let i=0;i<3;i++)ellipse(13+Math.sin(time+i)*4,-85-((time*9+i*12)%33),4+i,3+i,'#c8d7ba16');
      line([[-26,5],[-47,17],[-33,24]],'#c3bb8440',4);
    } else {
      const float=Math.sin(time*.8+o.seed)*6;line([[0,0],[5,-28],[sway*5,-57+float]],'#cbbb8a66');glow(sway*5,-72+float,75,'#eac56828');
      ellipse(sway*5,-73+float,14,19,'#e9c588');ellipse(sway*5,-74+float,9,16,'#f2d99f');line([[-7+sway*5,-89+float],[7+sway*5,-89+float]],'#ba9270',2);line([[-6+sway*5,-56+float],[6+sway*5,-56+float]],'#ba9270',2);
      for(let i=0;i<5;i++){const a=time*.25+i*4;glow(Math.cos(a)*42,-45+Math.sin(a*1.2)*40,6,'#efd78d65');}
    }
    ctx.restore();
  }
  function drawPerson(p,dt) {
    if(p.target&&!objects.includes(p.target))p.target=null;
    if(!p.target&&objects.length)p.target=objects[Math.floor(random(0,objects.length))];
    let moving=false,near=false;
    if(p.target){const o=p.target;const tx=o.x*W+Math.sin(p.phase)*35,ty=o.y*H+12+Math.cos(p.phase)*9;const dx=tx-p.x*W,dy=ty-p.y*H,d=Math.hypot(dx,dy);near=d<8;
      if(d>5){const step=Math.min(d,dt*22);p.x+=dx/d*step/W;p.y+=dy/d*step/H;moving=true;p.dir=dx<0?-1:1;p.wait=0;}else{p.wait+=dt;if(p.wait>9+p.phase%5){p.target=null;p.wait=0;}}
    }
    const dancing=near&&p.target&&['flower','water','lantern'].includes(p.target.kind), bounce=dancing?Math.abs(Math.sin(time*4+p.phase))*4: moving?Math.sin(time*7+p.phase):0;
    ctx.save();ctx.translate(p.x*W,p.y*H);const scale=Math.min(1,W/800+.4);ctx.scale(scale,scale);ellipse(0,2,7,2,'#07191f44');ctx.translate(0,-bounce);
    const stride=moving?Math.sin(time*8+p.phase)*3:1;
    line([[-2,-6],[-3-stride,0]],'#c3bea3',1.7);line([[2,-6],[3+stride,0]],'#c3bea3',1.7);
    line([[0,-14],[0,-6]],p.color,6);line([[-3,-12],[-7,dancing?-17:-7]],p.color,1.8);line([[3,-12],[7,dancing?-18:-8]],p.color,1.8);
    ellipse(0,-19,3.5,4,'#ead5b0');ellipse(-.5,-22,3.7,1.8,'#666e57');
    if(near&&p.wait<2){ctx.globalAlpha=Math.min(1,p.wait);ctx.fillStyle='#e9d6a6';ctx.font='12px Georgia';ctx.fillText(p.target.kind==='house'?'♪':'♡',5,-32-p.wait*3);}
    ctx.restore();
  }
  function frame(now){const dt=paused?0:Math.min((now-last)/1000||0,.04);last=now;time+=dt;ctx.clearRect(0,0,W,H);
    const horizon=H*.66;glow(W*.57,horizon,W*.49,'#809a4830');
    stars.forEach(s=>{const a=.2+.35*(Math.sin(time*.7+s.phase)*.5+.5);ctx.globalAlpha=a;ellipse(s.x*W,s.y*H,s.size,s.size,'#c7d5a1');});ctx.globalAlpha=1;
    for(let i=0;i<4;i++){ctx.strokeStyle='#90a7790c';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(W*.55,H*.67,W*(.25+i*.09),H*(.035+i*.017),-.04,0,Math.PI*2);ctx.stroke();}
    grass.forEach(g=>{const x=g.x*W,y=g.y*H;if(y>H-215)return;const sway=Math.sin(time+g.r*10)*2;line([[x-2,y],[x-4+sway,y-g.size],[x,y-2],[x+3+sway,y-g.size*.7]],g.r>.7?'#9bad6d48':'#7e9e702b',.8);if(g.r>.94)ellipse(x-4+sway,y-g.size,1.5,1.5,'#c5bd8855');});
    const layers=[...objects.map(o=>({y:o.y,draw:()=>drawObject(o)})),...people.map(p=>({y:p.y,draw:()=>drawPerson(p,dt)}))];layers.sort((a,b)=>a.y-b.y).forEach(l=>l.draw());
    particles=particles.filter(p=>p.life>0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=35*dt;p.life-=dt;ctx.globalAlpha=Math.min(1,p.life);ellipse(p.x,p.y,2,2,p.color);});ctx.globalAlpha=1;
    if(pointer&&pointer.y>H*.4&&pointer.y<H-235){ctx.strokeStyle='#d0d9aa77';ctx.setLineDash([3,5]);ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(pointer.x,pointer.y,24,8,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
    requestAnimationFrame(frame);
  }
  function position(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  canvas.addEventListener('pointermove',e=>pointer=position(e));canvas.addEventListener('pointerleave',()=>pointer=null);
  canvas.addEventListener('pointerdown',e=>{const p=position(e);if(p.y>H*.38&&p.y<H-210)place(p.x/W,p.y/H);});
  buttons.forEach(b=>{b.addEventListener('click',()=>select(b.dataset.kind));b.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();select(b.dataset.kind);place(random(.2,.8),random(.5,.65));}});b.addEventListener('pointerdown',e=>{select(b.dataset.kind);drag={kind:b.dataset.kind,x:e.clientX,y:e.clientY};b.setPointerCapture(e.pointerId);});b.addEventListener('pointermove',e=>{if(drag)pointer=position(e);});b.addEventListener('pointerup',e=>{if(drag){const p=position(e);if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>10&&p.y>H*.38&&p.y<H-210)place(p.x/W,p.y/H,drag.kind);drag=null;pointer=null;}});b.addEventListener('pointercancel',()=>{drag=null;pointer=null;});});
  function undo(){if(objects.length){objects.pop();document.querySelector('#status').textContent='A little room for another idea';}}
  document.querySelector('#undo').addEventListener('click',undo);document.querySelector('#clear').addEventListener('click',reset);
  document.querySelector('#pause').addEventListener('click',e=>{paused=!paused;e.currentTarget.setAttribute('aria-pressed',String(paused));e.currentTarget.innerHTML=paused?'▷ <span>Resume</span>':'Ⅱ <span>Pause</span>';});
  window.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;if(kinds[Number(e.key)-1])select(kinds[Number(e.key)-1]);if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();undo();}});
  reset();requestAnimationFrame(frame);
})();
