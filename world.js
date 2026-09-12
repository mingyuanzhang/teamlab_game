(() => {
  'use strict';
  const canvas=document.querySelector('#world'),ctx=canvas.getContext('2d');
  const shapeButtons=[...document.querySelectorAll('.shape')],toolButtons=[...document.querySelectorAll('[data-tool]')];
  let W=canvas.clientWidth,H=canvas.clientHeight,dpr=1;
  const world=new LittleWorld.World(W,H);
  let paused=false,last=0,accumulator=0,selected=null,tool='move',gesture=null,pointer=null,effects=[];
  const palettes=[['#9de5ed','#638fc7','#c4b6df'],['#efae83','#edcf8f','#dc8fa4'],['#e5aeb9','#d1badc','#f3cfad'],['#b4c9a7','#e7b5c3','#c7accd'],['#adbbec','#dac6e4','#b0d9cb'],['#aad2ca','#e6cfa2','#bdc9ec']];
  const coats=['#e4cab0','#bec9bf','#d5b3ba','#b7c5df','#d1c39b','#aaa8bd'];
  const random=(a,b)=>a+Math.random()*(b-a);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  const status=text=>document.querySelector('#status').textContent=text;
  function resize(){W=canvas.clientWidth;H=canvas.clientHeight;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);world.resize(W,H);effects=[];gesture=null;}
  window.addEventListener('resize',resize);resize();
  document.addEventListener('visibilitychange',()=>{last=0;accumulator=0;});
  function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);ctx.fill();}
  function stroke(points,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  function curve(points,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(points[0],points[1]);ctx.bezierCurveTo(...points.slice(2));ctx.stroke();}
  function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
  function ring(x,y,rx,ry,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);ctx.stroke();}
  function syncTray(){shapeButtons.forEach(b=>{const id=Number(b.dataset.shape),active=selected===id,count=world.tokens.filter(o=>o.id===id).length;
    b.classList.toggle('selected',active);b.classList.toggle('full',count===6);b.setAttribute('aria-pressed',String(active));
    b.setAttribute('aria-label',`${['Circle','Triangle','Diamond','Square','Hexagon','Crescent'][id]}, ${count} of 6 placed`);
    b.querySelectorAll('.slots i').forEach((dot,i)=>dot.classList.toggle('used',i<count));
    });toolButtons.forEach(b=>{b.classList.toggle('active',b.dataset.tool===tool);b.setAttribute('aria-pressed',String(b.dataset.tool===tool));});canvas.style.cursor=tool==='move'?'grab':'crosshair';}
  function chooseShape(id){selected=id;tool='place';syncTray();status(world.tokens.filter(o=>o.id===id).length===6?'All six copies are placed. Select Move to move an existing copy.':'Place another copy anywhere in the world.');}
  function chooseTool(next){tool=next;selected=null;syncTray();status(({move:'Drag a shape to move its next discovery.',line:'Draw a line. A new path through their world.',ladder:'Draw between two heights. A way to climb.',spring:'Draw a line. See how high they fly.'})[next]);}
  function commitShape(id,x,y){const placed=world.place(id,x,y);syncTray();status(placed?'Something is stirring. Give it a moment.':world.placementBlocked(x,y)?'A little person is here. Try another spot.':'All six copies are placed. Select Move to move an existing copy.');}
  function shapePath(id,r){ctx.beginPath();if(id===0)ctx.arc(0,0,r,0,Math.PI*2);else if(id===5){ctx.arc(0,0,r,Math.PI*.32,Math.PI*1.68);ctx.bezierCurveTo(-r*.6,-r*.7,-r*.6,r*.7,Math.cos(Math.PI*.32)*r,Math.sin(Math.PI*.32)*r);}else{const n=({1:3,2:4,3:4,4:6})[id],offset=id===3?Math.PI/4:-Math.PI/2;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+offset,x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();}}
  function drawToken(o){const held=gesture?.type==='token'&&gesture.uid===o.uid;const x=held?gesture.x:o.x,y=held?gesture.y:o.y;ctx.save();ctx.translate(x,y);
    const pulse=1+Math.sin(world.time*1.8+o.id)*.05;ctx.scale(pulse,pulse);glow(0,0,42,'#d8c6a51a');
    if(selected===o.id)ring(0,0,28,28,'#e7d7b93d');
    ctx.strokeStyle=held&&world.placementBlocked(x,y)?'#ed9c97':'#e4d9c6';ctx.lineWidth=1.25;ctx.fillStyle='#181d26d9';shapePath(o.id,17);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#d6b98e65';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,23,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-o.timer/o.period));ctx.stroke();
    ellipse(0,0,1.3,1.3,'#f5dfbc');ctx.restore();
  }
  function drawLine(l,preview=false){const spring=l.kind==='spring',ladder=l.kind==='ladder';const color=preview?'#e8d1a5aa':spring?'#dbaeb383':ladder?'#b3c5cb66':'#c5c9cc77';
    if(ladder){const dx=l.x2-l.x1,dy=l.y2-l.y1,length=Math.hypot(dx,dy),nx=-dy/(length||1)*4,ny=dx/(length||1)*4;
      stroke([[l.x1+nx,l.y1+ny],[l.x2+nx,l.y2+ny]],color,.8);stroke([[l.x1-nx,l.y1-ny],[l.x2-nx,l.y2-ny]],color,.8);
      for(let d=6;d<length;d+=9){const x=l.x1+dx*d/length,y=l.y1+dy*d/length;stroke([[x+nx,y+ny],[x-nx,y-ny]],color,.7);}
    }else{const points=[];for(let i=0;i<=35;i++){const t=i/35;points.push([l.x1+(l.x2-l.x1)*t,l.y1+(l.y2-l.y1)*t+(spring?Math.sin(t*Math.PI*8+world.time*14)*Math.sin(t*Math.PI)*(l.pulse||0)*8:0)]);}stroke(points,color,spring?1.5:1);
      ellipse(l.x1,l.y1,2,2,color);ellipse(l.x2,l.y2,2,2,color);
      if(spring){stroke([[l.x1,l.y1+4],[l.x2,l.y2+4]],'#dbaeb320',.6);}
    }
  }
  function drawPerson(p){ctx.save();ctx.translate(p.x,p.y);const s=p.size*(W<700?.75:.92);ctx.scale(s,s);const moving=p.state==='walk',climbing=p.state==='climb',air=p.state==='jump'||p.state==='fall';const beat=world.time*p.trait.speed*.22+p.phase;
    const dance=p.trait.name==='dancer'&&p.expression>0&&p.support;
    ctx.translate(0,dance?-Math.abs(Math.sin(beat))*3:0);
    if(p.state==='rest'&&p.trait.name==='dreamer'){ctx.translate(0,4);ctx.rotate(-.12);}
    const stride=moving?Math.sin(beat)*3:climbing?Math.sin(beat)*2:air?3:1;
    stroke([[-1,-6],[-3-stride,air?-1:0]],'#b8b3ab',1.3);stroke([[1,-6],[3+stride,air?-3:0]],'#b8b3ab',1.3);
    stroke([[0,-14],[0,-6]],coats[p.color],4);
    stroke([[-2,-12],[-6,climbing?-16+Math.sin(beat)*3:air||dance?-18:-8]],coats[p.color],1.3);
    stroke([[2,-12],[6,climbing?-16-Math.sin(beat)*3:air||dance?-17:-8]],coats[p.color],1.3);
    ellipse(0,-18,2.7,3.2,['#e4cbb0','#be957c','#947366'][p.skin]);
    ellipse(-.5,-20,2.8,1.2,'#535965');
    if(p.hat===0)stroke([[-4,-21],[4,-21]],coats[p.color],1.2);
    if(p.hat===1){ctx.fillStyle=coats[p.color];ctx.fillRect(-2,-24,4,3);}
    if(p.trait.name==='curious')stroke([[-3,-12],[-5,-8]],'#b8a077',2.5);
    if(p.expression>0&&p.trait.name!=='shy'){ctx.globalAlpha=Math.min(1,p.expression);ctx.fillStyle='#e1ceaa';ctx.font='9px Georgia';ctx.fillText(p.trait.name==='dancer'?'♪':'·',5,-27);}
    ctx.restore();
  }
  function emit(event){if(gesture?.type==='token'&&gesture.uid===event.tokenId)event={...event,x:gesture.x,y:gesture.y};effects.push({...event,age:0,seed:random(0,1000),life:event.id===2?(event.y+100)/(24*effectScale())+4:[7.5,7,12,10,9,10][event.id]});if(effects.length>96)effects.shift();
    // The released gust gently lifts adventurous people close to its origin.
    if(event.id===4)for(const p of world.people){if(Math.hypot(p.x-event.x,p.y-event.y)<90&&p.trait.bravery>.5&&!p.ladder){p.support=null;p.vy=-180;p.vx=p.direction*40;p.state='jump';}}
  }
  function drawRain(e){const baseAlpha=ctx.globalAlpha,t=e.age,c=palettes[0],grow=clamp(t*1.4,0,1);glow(0,10,125,'#91bacb0b');
    // Layered translucent contours build a cloud of ink above its source.
    for(let j=0;j<7;j++){const x=(j-3)*18,yy=-14-Math.sin(j*1.8)*9;ellipse(x,yy,(24+j%3*4)*grow,10*grow,c[j%3]+'0c');curve([x-24,yy,x-8,yy-24,x+19,yy-15,x+29,yy+2],c[j%3]+'59',.65);}
    for(let i=0;i<85;i++){const start=noise(i+e.seed)*2.4,age=t-start;if(age<0||age>4.7)continue;const x=(noise(i*3+e.seed)-.5)*150+Math.sin(t+i)*3,y=age*(74+noise(i)*45);const ground=(world.ground-e.y)/effectScale();const yy=Math.min(y,ground);
      ctx.globalAlpha=baseAlpha*clamp((4.7-age)*.8,0,.65);if(y<ground){stroke([[x,yy-9-noise(i)*12],[x-2,yy]],c[i%3],.65);ellipse(x-2,yy,1,1.5,c[i%3]);}else{ring(x,ground,4+(age%1)*15,1+(age%1)*3,c[i%3]+'88',.6);}}
    ctx.globalAlpha=baseAlpha;
  }
  function drawFireworks(e){const baseAlpha=ctx.globalAlpha,t=e.age,c=palettes[1];for(let j=0;j<4;j++){const age=t-j*.75;if(age<0)continue;const cx=Math.sin(j*5+e.seed)*65,cy=-65-j%2*53;
      if(age<.65){const f=age/.65;curve([0,0,cx*.3,-25,cx*.7,cy*.6,cx*f,cy*f],'#efce9677',.9);glow(cx*f,cy*f,12,'#efd3a755');continue;}
      const a=age-.65;if(a>4)continue;const expansion=1-Math.exp(-a*1.8);ctx.globalAlpha=baseAlpha*Math.max(0,1-a/4);
      for(let i=0;i<55;i++){const angle=i/55*Math.PI*2,r=(42+noise(i+j*8)*37)*expansion,fall=a*a*8;const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r+fall;const tail=.8+Math.min(a,.8)*.14;stroke([[cx+(x-cx)*tail,cy+(y-cy)*tail],[x,y]],c[i%3]+'9c',.7);ellipse(x,y,i%5===0?1.5:.8,i%5===0?1.5:.8,c[i%3]);}
      ring(cx,cy+a*a*8,75*expansion,75*expansion,'#e9bca91a',.5);glow(cx,cy,70,'#e3aa8b0b');}
    ctx.globalAlpha=baseAlpha;
  }
  function drawBalloons(e){const c=palettes[2];for(let i=0;i<5;i++){const age=e.age-i*.55;if(age<0)continue;const x=Math.sin(age*.5+i*2)*25+(i-2)*13,y=-age*(24+i*3),r=12+i%3*4,inflate=clamp(age*2,0,1);ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(age+i)*.08);
      ellipse(0,-r,r*inflate,r*1.25*inflate,c[i%3]+'13');ring(0,-r,r*inflate,r*1.25*inflate,c[i%3]+'b0',.8);curve([-r*.3,-r*2,-r,-r*1.5,-r*.6,-r*.5,0,0],c[i%3]+'45',.6);curve([r*.3,-r*2,r,-r*1.5,r*.6,-r*.5,0,0],c[i%3]+'45',.6);
      curve([0,r*.25,Math.sin(age)*15,23,-Math.sin(age)*13,39,Math.sin(age*.6)*8,55],c[i%3]+'75',.6);ellipse(0,r*.25,1.5,1,c[i%3]);ctx.restore();}}
  function drawGarden(e){const t=e.age,c=palettes[3],grow=clamp(t/3,0,1);for(let k=0;k<9;k++){const a=(k/8-.5)*2.5,reach=(70+noise(k+e.seed)*75)*grow,x=Math.sin(a)*reach,y=-Math.cos(a)*reach;
      curve([0,0,x*.15,-reach*.45,x*.85,-reach*.3,x,y],c[k%3]+'75',.8);
      for(let j=1;j<6;j++){const q=j/6,xx=x*q,yy=y*q;ctx.save();ctx.translate(xx,yy);ctx.rotate(a+(j%2?1:-1)*.8);ellipse(0,-3,2.5*grow,9*grow,c[(k+1)%3]+'24');curve([0,5,-7,-2,-4,-12,0,-14],c[k%3]+'66',.5);ctx.restore();}
      const bloom=clamp((t-1.2-k*.1)*1.4,0,1);ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.6+k)*.15);for(let j=0;j<7;j++){ctx.rotate(Math.PI*2/7);ellipse(0,-7*bloom,3*bloom,9*bloom,c[(k+1)%3]+'2b');ring(0,-7*bloom,3*bloom,9*bloom,c[(k+1)%3]+'77',.5);}ellipse(0,0,2,2,'#eedbb2');ctx.restore();}}
  function drawRibbons(e){const c=palettes[4],t=e.age;for(let j=0;j<13;j++){const points=[];for(let i=0;i<65;i++){const u=i/64,spread=clamp(t*.65,0,1);const x=(u*220+Math.sin(u*7-t)*19)*spread,y=(-u*90+Math.sin(u*9-t*1.3+j*.12)*26)*spread+(j-6)*u*3;points.push([x,y]);}stroke(points,c[j%3]+(j%4?'35':'88'),j%4?.55:1);}
    for(let i=0;i<16;i++){const f=(t*.18+i*.063)%1,x=f*220,y=-f*90+Math.sin(f*9-t*1.3)*26;ctx.save();ctx.translate(x,y);ctx.rotate(t+i);ellipse(0,0,4,1.5,c[i%3]+'a0');ctx.restore();}}
  function drawOrbits(e){const t=e.age,c=palettes[5];for(let i=0;i<12;i++){const age=t-i*.18;if(age<0)continue;const r=age*15,cy=-age*15;ctx.save();ctx.translate(Math.sin(age*.6)*age*12,cy);ctx.rotate(age*.2+i*.12);ring(0,0,r,r*.42,c[i%3]+'48',.7);const a=age*.8+i*2;ellipse(Math.cos(a)*r,Math.sin(a)*r*.42,2,2,c[i%3]);ctx.restore();}glow(0,-t*12,80,'#b0dace0a');}
  function effectScale(){return Math.min(1,W/700+.3);}
  function drawEffect(e){ctx.save();ctx.translate(e.x,e.y);ctx.scale(effectScale(),effectScale());const alpha=clamp(e.age*2,0,1)*clamp((e.life-e.age)/1.5,0,1);
    // Fade each drawing while preserving translucent individual strokes.
    ctx.globalAlpha=alpha;
    [drawRain,drawFireworks,drawBalloons,drawGarden,drawRibbons,drawOrbits][e.id](e);
    ctx.restore();
  }
  function render(){ctx.clearRect(0,0,W,H);const t=world.time;
    for(let i=0;i<70;i++){const x=noise(i)*W,y=70+noise(i+80)*(world.ground-70);ctx.globalAlpha=.15+Math.sin(t*.3+i)*.08;ellipse(x,y,.5,.5,'#e1dccf');}ctx.globalAlpha=1;
    for(let i=0;i<4;i++)curve([0,world.ground+12+i*5,W*.32,world.ground-12+i*7,W*.73,world.ground+28+i*6,W,world.ground+4+i*6],'#d0c3a40a',.8);
    stroke([[14,world.ground],[W-14,world.ground]],'#cec6b456',.8);
    for(let i=0;i<80;i++){const x=noise(i+19)*W;stroke([[x,world.ground+3],[x+noise(i)*6,world.ground+5]],'#bbb3a322',.6);}
    world.lines.forEach(l=>drawLine(l));effects.forEach(drawEffect);world.people.forEach(drawPerson);world.tokens.forEach(drawToken);
    if(gesture?.type==='draw')drawLine({kind:tool,x1:gesture.startX,y1:gesture.startY,x2:gesture.x,y2:gesture.y},true);
    if(gesture?.type==='new'){ctx.save();ctx.translate(gesture.x,gesture.y);ctx.strokeStyle=world.placementBlocked(gesture.x,gesture.y)?'#ed9c97':'#eddbc0';ctx.lineWidth=1;shapePath(gesture.id,17);ctx.stroke();ctx.restore();}
    else if(pointer&&tool==='place'&&selected!==null&&!gesture&&pointer.y>85&&pointer.y<world.ground){ctx.globalAlpha=.25;ctx.save();ctx.translate(pointer.x,pointer.y);ctx.strokeStyle=world.placementBlocked(pointer.x,pointer.y)?'#ed9c97':'#eddbc0';shapePath(selected,17);ctx.stroke();ctx.restore();ctx.globalAlpha=1;}
  }
  function frame(now){const elapsed=last?Math.min((now-last)/1000,.1):0;last=now;
    if(!paused){accumulator+=elapsed;while(accumulator>=1/60){world.update(1/60);world.drainEvents().forEach(emit);for(const e of effects)e.age+=1/60;effects=effects.filter(e=>e.age<e.life);accumulator-=1/60;}}
    render();requestAnimationFrame(frame);
  }
  function point(e){const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  function inWorld(p){return p.x>=12&&p.x<=W-12&&p.y>=85&&p.y<=world.ground;}
  canvas.addEventListener('pointerdown',e=>{if(gesture||e.isPrimary===false)return;const p=point(e);if(!inWorld(p))return;canvas.setPointerCapture(e.pointerId);
    if(tool==='place'){commitShape(selected,p.x,p.y);return;}
    if(tool!=='move'){gesture={type:'draw',startX:p.x,startY:p.y,...p,pointerId:e.pointerId};return;}
    const token=[...world.tokens].reverse().find(o=>Math.hypot(o.x-p.x,o.y-p.y)<28);
    if(token){selected=token.id;syncTray();gesture={type:'token',id:token.id,uid:token.uid,x:token.x,y:token.y,dx:token.x-p.x,dy:token.y-p.y,pointerId:e.pointerId};}
    else status('Choose one of the six shapes below, or draw a way up.');
  });
  canvas.addEventListener('pointermove',e=>{pointer=point(e);if(gesture&&gesture.pointerId===e.pointerId){gesture.x=clamp(pointer.x+(gesture.dx||0),20,W-20);gesture.y=clamp(pointer.y+(gesture.dy||0),88,world.ground-5);}});
  canvas.addEventListener('pointerup',e=>{if(!gesture||gesture.pointerId!==e.pointerId)return;
    if(gesture.type==='token'){const moved=world.move(gesture.uid,gesture.x,gesture.y);syncTray();status(moved?'The shape has moved.':'A little person is here. The shape stayed in its original spot.');}
    if(gesture.type==='draw'){const g=gesture;if(world.addLine(tool,g.startX,g.startY,g.x,g.y))status('A new possibility for their little lives.');else status(world.lines.length>=30?'A full world. Undo a line to make room.':'Drag a little farther to draw a line.');}
    gesture=null;
  });
  canvas.addEventListener('pointercancel',()=>gesture=null);canvas.addEventListener('lostpointercapture',()=>gesture=null);canvas.addEventListener('pointerleave',()=>pointer=null);
  shapeButtons.forEach(b=>{
    b.addEventListener('click',()=>chooseShape(Number(b.dataset.shape)));
    b.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const id=Number(b.dataset.shape);chooseShape(id);commitShape(id,W*(.25+id*.1),world.ground*(.5+(id%2)*.17));}});
    b.addEventListener('pointerdown',e=>{if(gesture||e.isPrimary===false)return;const id=Number(b.dataset.shape);chooseShape(id);b.setPointerCapture(e.pointerId);const p=point(e);gesture={type:'new',id,startX:p.x,startY:p.y,...p,pointerId:e.pointerId};});
    b.addEventListener('pointermove',e=>{if(gesture?.type==='new'&&gesture.pointerId===e.pointerId)Object.assign(gesture,point(e));});
    b.addEventListener('pointerup',e=>{if(gesture?.type==='new'&&gesture.pointerId===e.pointerId){const p=point(e);if(inWorld(p)&&Math.hypot(p.x-gesture.startX,p.y-gesture.startY)>10)commitShape(gesture.id,p.x,p.y);gesture=null;}});
    b.addEventListener('pointercancel',()=>gesture=null);b.addEventListener('lostpointercapture',()=>gesture=null);
  });
  toolButtons.forEach(b=>b.addEventListener('click',()=>chooseTool(b.dataset.tool)));
  function undo(){if(world.undo()){effects=[];gesture=null;syncTray();status('One small step back.');}}
  document.querySelector('#undo').addEventListener('click',undo);
  document.querySelector('#clear').addEventListener('click',()=>{world.reset();effects=[];gesture=null;selected=null;tool='move';syncTray();status('Six copies of each shape are available.');});
  document.querySelector('#pause').addEventListener('click',e=>{paused=!paused;accumulator=0;e.currentTarget.setAttribute('aria-pressed',String(paused));e.currentTarget.innerHTML=paused?'<span aria-hidden="true">▷</span>':'<span aria-hidden="true">Ⅱ</span>';e.currentTarget.setAttribute('aria-label',paused?'Resume animation':'Pause animation');});
  window.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo();return;}if(e.key==='Escape'){gesture=null;selected=null;tool='move';syncTray();return;}if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(/^[1-6]$/.test(e.key))chooseShape(Number(e.key)-1);const shortcut={v:'move',l:'line',h:'ladder',b:'spring'}[e.key.toLowerCase()];if(shortcut)chooseTool(shortcut);
  });
  syncTray();requestAnimationFrame(frame);
})();
