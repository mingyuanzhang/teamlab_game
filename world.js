(() => {
  'use strict';
  const canvas = document.querySelector('#world'), ctx = canvas.getContext('2d');
  const buttons = [...document.querySelectorAll('.object')];
  const kinds = buttons.map(b => b.dataset.kind);
  const colors = ['#e3b18a', '#b8ceac', '#dca49c', '#d4c894', '#9abdbd'];
  let W = 0, H = 0, meadowLimit = .65, time = 0, last = 0, paused = false, selected = 'flower', pointer = null, drag = null;
  let objects = [], particles = [];
  const random = (a, b) => a + Math.random() * (b - a);
  const personalities = [
    {name:'Explorer', favorites:['windmill','lantern'], speed:32, stay:4, action:'explore'},
    {name:'Dancer', favorites:['music','flower'], speed:25, stay:9, action:'dance'},
    {name:'Daydreamer', favorites:['tree','lantern'], speed:15, stay:12, action:'rest'},
    {name:'Gardener', favorites:['flower','mushroom'], speed:20, stay:8, action:'garden'},
    {name:'Daredevil', favorites:['mushroom','water'], speed:38, stay:6, action:'hop'},
    {name:'Social butterfly', favorites:['house','campfire','music'], speed:27, stay:10, action:'wave'},
  ];
  const people = Array.from({length:48}, (_, i) => ({
    x:random(.08,.92), y:random(.46,.67), target:null, previous:null,
    phase:random(0,Math.PI*2), color:colors[i%colors.length], personality:personalities[i%6],
    speed:random(.8,1.25), size:random(.8,1.2), hat:i%4, skin:['#ead5b0','#bf9275','#8e6957'][i%3],
    state:'roam', remaining:random(1,7), destination:{x:random(.08,.92),y:random(.46,.67)}, wait:0,
  }));
  function meadowBottom() {return meadowLimit;}
  function wander(p) {
    p.previous=p.target || p.previous; p.target=null; p.state='roam'; p.wait=0;
    p.remaining=random(2,6); p.destination={x:random(.07,.93), y:random(.44,meadowBottom())};
  }
  function chooseActivity(p) {
    const candidates=objects.filter(o=>o!==p.previous);
    if(!candidates.length || Math.random()<.18) {wander(p);return;}
    const weights=candidates.map(o=> (p.personality.favorites.includes(o.kind)?6:1)/(1+people.filter(other=>other.target===o).length*.6));
    let choice=random(0,weights.reduce((a,b)=>a+b,0));
    p.target=candidates.find((o,i)=>(choice-=weights[i])<=0)||candidates.at(-1);
    p.state='approach'; p.wait=0;
  }
  let seed = 197;
  const rng = () => {seed = (seed * 16807) % 2147483647; return seed / 2147483647;};
  const grass = Array.from({length:260}, () => ({x:rng(), y:.42+rng()*.37, size:3+rng()*9, r:rng()}));
  const stars = Array.from({length:65}, () => ({x:rng(), y:rng()*.73, phase:rng()*7, size:rng()*1.4+.4}));
  function resize() {W = canvas.clientWidth; H = canvas.clientHeight; const d = Math.min(window.devicePixelRatio || 1, 2); canvas.width = W*d; canvas.height = H*d; ctx.setTransform(d,0,0,d,0,0); meadowLimit=Math.max(.49,(document.querySelector('.controls').getBoundingClientRect().top-48)/H);}
  window.addEventListener('resize',()=>{resize();objects.forEach(o=>o.y=Math.min(o.y,meadowBottom()));people.forEach(p=>{p.y=Math.min(p.y,meadowBottom());wander(p);});}); resize();
  function ellipse(x,y,rx,ry,color) {ctx.fillStyle=color; ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);ctx.fill();}
  function line(points,color,width=1) {ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  function glow(x,y,r,color) {const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
  function select(kind) {selected=kind;buttons.forEach(b=>{const active=b.dataset.kind===kind;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});}
  const messages = {flower:'A flower garden blooms. Someone has come to dance.',tree:'A tree unfurls. A lovely place for a little rest.',water:'A raindrop becomes a pond. Time for a splash!',house:'A new little home. The neighbors are coming to visit.',lantern:'A lantern rises. Daydreamers watch the lights.',mushroom:'A mushroom patch! Daredevils have a new place to jump.',music:'A music box opens. Dancers find their own rhythm.',windmill:'A pinwheel garden spins. Explorers weave around it.',campfire:'A cozy campfire. Friends gather to wave and chat.'};
  function place(x,y,kind=selected,initial=false) {
    // Keep illustrations in the meadow and clear of the toolbar.
    x=Math.max(.07,Math.min(.93,x)); y=Math.max(.44,Math.min(meadowBottom(),y));
    if(objects.length>=35) objects.shift();
    const obj={x,y,kind,born:initial?-10:time,seed:random(0,100),size:random(.85,1.15)};objects.push(obj);
    if(!initial) {document.querySelector('#status').textContent=messages[kind];for(let i=0;i<18;i++)particles.push({x:x*W,y:y*H,vx:random(-35,35),vy:random(-65,-12),life:random(.7,1.8),color:colors[i%5]});people.forEach(p=>{if(p.state!=='activity' && Math.hypot((p.x-x)*W,(p.y-y)*H)<300 && Math.random()<(p.personality.favorites.includes(kind)?.8:.12)){p.target=obj;p.state='approach';p.wait=0;}});}
  }
  function reset(){objects=[];particles=[];people.forEach(p=>{p.previous=null;wander(p);});place(.61,.57,'tree',true);place(.32,.64,'flower',true);place(.78,.65,'house',true);place(.48,.7,'water',true);place(.84,.46,'lantern',true);place(.17,.56,'mushroom',true);place(.57,.65,'music',true);document.querySelector('#status').textContent='Your little people are exploring';}
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
    } else if(o.kind==='mushroom') {
      for(let i=0;i<3;i++) {const x=(i-1)*25,h=25+i%2*15;
        line([[x,0],[x,-h]],'#d7c4a0',7);ellipse(x,-h,20,10,['#cb8f81','#d7ae84','#b19dc1'][i]);
        for(let j=0;j<4;j++)ellipse(x-12+j*8,-h-2+Math.sin(j*3)*3,2,2,'#f1dfba');}
    } else if(o.kind==='music') {
      ellipse(0,1,33,9,'#947c9266');ctx.fillStyle='#9d899d';ctx.fillRect(-24,-23,48,24);
      line([[-25,-24],[0,-34],[25,-24]],'#dabaa3',3);ellipse(0,-22,15,5,'#e5c395');
      line([[0,-24],[0,-52]],'#d8c49c',2);ellipse(0,-54,6,6,'#e8baab');
      for(let i=0;i<4;i++){ctx.globalAlpha=1-((time*.25+i*.25)%1);ctx.fillStyle='#eed9b3';ctx.font='18px Georgia';ctx.fillText(i%2?'♪':'♫',Math.sin(time+i*4)*30,-36-((time*16+i*15)%60));}ctx.globalAlpha=1;
    } else if(o.kind==='windmill') {
      for(let j=0;j<3;j++){const x=(j-1)*29,h=50+j%2*25;line([[x,0],[x,-h]],'#b7b58d',2);
        ctx.save();ctx.translate(x,-h);ctx.rotate(time*(.8+j*.2)+o.seed);
        for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.fillStyle=['#b8c995','#d8ae9e','#98bfc0','#e4ce9a'][i];ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(19,-6);ctx.lineTo(14,-20);ctx.closePath();ctx.fill();}ellipse(0,0,3,3,'#efe0b2');ctx.restore();}
    } else if(o.kind==='campfire') {
      glow(0,-12,65,'#eeb06425');for(let i=0;i<7;i++)ellipse(Math.cos(i)*22,Math.sin(i)*7,6,4,'#8e9886');
      line([[-15,3],[13,-5]],'#b08c6e',5);line([[15,3],[-13,-5]],'#b08c6e',5);
      for(let i=0;i<3;i++){const h=16+Math.sin(time*5+i)*5;ellipse((i-1)*7,-h/2-3,7,h/2,['#d6946e','#efc180','#edab6e'][i]);}
      for(let i=0;i<5;i++)ellipse(Math.sin(i*7+time)*12,-10-((time*16+i*9)%48),1,1,'#efd596');
    } else if(o.kind==='lantern') {
      const float=Math.sin(time*.8+o.seed)*6;line([[0,0],[5,-28],[sway*5,-57+float]],'#cbbb8a66');glow(sway*5,-72+float,75,'#eac56828');
      ellipse(sway*5,-73+float,14,19,'#e9c588');ellipse(sway*5,-74+float,9,16,'#f2d99f');line([[-7+sway*5,-89+float],[7+sway*5,-89+float]],'#ba9270',2);line([[-6+sway*5,-56+float],[6+sway*5,-56+float]],'#ba9270',2);
      for(let i=0;i<5;i++){const a=time*.25+i*4;glow(Math.cos(a)*42,-45+Math.sin(a*1.2)*40,6,'#efd78d65');}
    }
    ctx.restore();
  }
  function updatePerson(p,dt) {
    if(!dt) return;
    if(p.target && !objects.includes(p.target)) wander(p);
    if(p.state==='activity') {
      p.wait+=dt;p.remaining-=dt;p.moving=false;
      if(p.remaining<=0) wander(p);
      return;
    }
    if(p.state==='roam') {p.remaining-=dt;if(p.remaining<=0)chooseActivity(p);}
    const o=p.target;
    const tx=o?o.x+Math.sin(p.phase)*activityRadius(p)/W:p.destination.x;
    const ty=o?Math.min(meadowBottom(),o.y+(12+Math.cos(p.phase)*12)/H):Math.min(meadowBottom(),p.destination.y);
    const dx=(tx-p.x)*W,dy=(ty-p.y)*H,d=Math.hypot(dx,dy);
    p.moving=d>2;
    if(p.moving) {const step=Math.min(d,dt*p.personality.speed*p.speed);p.x+=dx/d*step/W;p.y+=dy/d*step/H;p.dir=dx<0?-1:1;}
    else if(o) {p.state='activity';p.wait=0;p.remaining=p.personality.stay*random(.7,1.3);}
    else {p.destination={x:random(.07,.93),y:random(.44,meadowBottom())};}
  }
  function activityRadius(p) {return p.personality.action==='rest'?48:24+p.phase*4;}
  function drawPerson(p) {
    const o=p.target, active=p.state==='activity' && o;
    const action=active?p.personality.action:'walk';
    const beat=time*p.speed*(action==='hop'?6:4)+p.phase;
    const dancing=active&&(action==='dance'||action==='hop');
    const bounce=dancing?Math.abs(Math.sin(beat))*(action==='hop'?10:4):p.moving?Math.sin(time*8*p.speed+p.phase):0;
    ctx.save();ctx.translate(p.x*W,p.y*H);
    const scale=Math.min(1,W/800+.4)*p.size;ctx.scale(scale,scale);
    ellipse(0,2,7,2,'#07191f44');ctx.translate(active&&action==='explore'?Math.sin(beat*.6)*9:0,-bounce);
    if(active&&action==='rest')ctx.translate(0,5);
    if(active&&action==='garden')ctx.rotate(Math.sin(beat)*.16+.2);
    const stride=p.moving?Math.sin(time*8*p.speed+p.phase)*3:1;
    line([[-2,-6],[-3-stride,0]],'#c3bea3',1.7);line([[2,-6],[3+stride,0]],'#c3bea3',1.7);
    line([[0,-14],[0,-6]],p.color,6);
    line([[-3,-12],[-7,dancing?-17:-7]],p.color,1.8);
    line([[3,-12],[7,dancing?-18:active&&action==='wave'?-16+Math.sin(beat)*4:-8]],p.color,1.8);
    ellipse(0,-19,3.5,4,p.skin);ellipse(-.5,-22,3.7,1.8,'#666e57');
    if(p.hat===0)line([[-5,-23],[5,-23]],p.color,2);
    if(p.hat===1){ctx.fillStyle=p.color;ctx.fillRect(-3,-26,6,4);}
    if(p.hat===2)line([[-3,-12],[-9,-9]],'#d8bd8d',2);
    if(active) {
      const symbol=({dance:'♪',hop:'!',rest:'z',garden:'♡',wave:'hello',explore:'✦'})[action];
      if(p.wait%5<2) {ctx.globalAlpha=Math.sin((p.wait%5)/2*Math.PI);ctx.fillStyle='#e9d6a6';ctx.font=action==='wave'?'8px sans-serif':'12px Georgia';ctx.fillText(symbol,5,-32-(p.wait%5)*3);}
      if(o.kind==='water'&&action==='hop'){ctx.globalAlpha=.5;ellipse(0,3,10+Math.sin(beat)*3,2,'#afd4c1');}
      if(action==='garden'){line([[6,-8],[11,-5]],'#aabfa2',2);ellipse(11,-4,3,2,'#abc7b4');}
    }
    ctx.restore();
  }
  function frame(now){const dt=paused?0:Math.min((now-last)/1000||0,.04);last=now;time+=dt;ctx.clearRect(0,0,W,H);
    const horizon=H*.66;glow(W*.57,horizon,W*.49,'#809a4830');
    stars.forEach(s=>{const a=.2+.35*(Math.sin(time*.7+s.phase)*.5+.5);ctx.globalAlpha=a;ellipse(s.x*W,s.y*H,s.size,s.size,'#c7d5a1');});ctx.globalAlpha=1;
    for(let i=0;i<4;i++){ctx.strokeStyle='#90a7790c';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(W*.55,H*.67,W*(.25+i*.09),H*(.035+i*.017),-.04,0,Math.PI*2);ctx.stroke();}
    grass.forEach(g=>{const x=g.x*W,y=g.y*H;if(y>meadowBottom()*H+20)return;const sway=Math.sin(time+g.r*10)*2;line([[x-2,y],[x-4+sway,y-g.size],[x,y-2],[x+3+sway,y-g.size*.7]],g.r>.7?'#9bad6d48':'#7e9e702b',.8);if(g.r>.94)ellipse(x-4+sway,y-g.size,1.5,1.5,'#c5bd8855');});
    people.forEach(p=>updatePerson(p,dt));
    const layers=[...objects.map(o=>({y:o.y,draw:()=>drawObject(o)})),...people.map(p=>({y:p.y,draw:()=>drawPerson(p)}))];layers.sort((a,b)=>a.y-b.y).forEach(l=>l.draw());
    particles=particles.filter(p=>p.life>0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=35*dt;p.life-=dt;ctx.globalAlpha=Math.min(1,p.life);ellipse(p.x,p.y,2,2,p.color);});ctx.globalAlpha=1;
    if(pointer&&pointer.y>H*.4&&pointer.y<meadowBottom()*H+20){ctx.strokeStyle='#d0d9aa77';ctx.setLineDash([3,5]);ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(pointer.x,pointer.y,24,8,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
    requestAnimationFrame(frame);
  }
  function position(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  canvas.addEventListener('pointermove',e=>pointer=position(e));canvas.addEventListener('pointerleave',()=>pointer=null);
  canvas.addEventListener('pointerdown',e=>{const p=position(e);if(p.y>H*.38&&p.y<meadowBottom()*H+20)place(p.x/W,p.y/H);});
  buttons.forEach(b=>{b.addEventListener('click',()=>select(b.dataset.kind));b.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();select(b.dataset.kind);place(random(.2,.8),random(.5,.65));}});b.addEventListener('pointerdown',e=>{select(b.dataset.kind);drag={kind:b.dataset.kind,x:e.clientX,y:e.clientY};b.setPointerCapture(e.pointerId);});b.addEventListener('pointermove',e=>{if(drag)pointer=position(e);});b.addEventListener('pointerup',e=>{if(drag){const p=position(e);if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>10&&p.y>H*.38&&p.y<meadowBottom()*H+20)place(p.x/W,p.y/H,drag.kind);drag=null;pointer=null;}});b.addEventListener('pointercancel',()=>{drag=null;pointer=null;});});
  function undo(){if(objects.length){objects.pop();document.querySelector('#status').textContent='A little room for another idea';}}
  document.querySelector('#undo').addEventListener('click',undo);document.querySelector('#clear').addEventListener('click',reset);
  document.querySelector('#pause').addEventListener('click',e=>{paused=!paused;e.currentTarget.setAttribute('aria-pressed',String(paused));e.currentTarget.innerHTML=paused?'▷ <span>Resume</span>':'Ⅱ <span>Pause</span>';});
  window.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;if(kinds[Number(e.key)-1])select(kinds[Number(e.key)-1]);if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();undo();}});
  reset();requestAnimationFrame(frame);
})();
