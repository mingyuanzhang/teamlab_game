(() => {
  'use strict';
  const canvas=document.querySelector('#world'),ctx=canvas.getContext('2d');
  const shapeButtons=[...document.querySelectorAll('.shape')],toolButtons=[...document.querySelectorAll('[data-tool]')];
  let W=canvas.clientWidth,H=canvas.clientHeight,dpr=1;
  const world=new LittleWorld.World(W,H);
  let paused=false,last=0,accumulator=0,selected=null,tool='move',gesture=null,pointer=null,effects=[];
  const art=LittleArt.createPainter(ctx),tokenRadius=LittleWorld.TOKEN_RADIUS;
  const coats=['#e4cab0','#bec9bf','#d5b3ba','#b7c5df','#d1c39b','#aaa8bd'];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  const status=text=>document.querySelector('#status').textContent=text;
  const soundButton=document.querySelector('#sound'),themeSelect=document.querySelector('#music-theme');
  const sound=new WonderAudio.Soundtrack({onChange:syncSound});
  function syncSound(){
    soundButton.disabled=!sound.supported;soundButton.setAttribute('aria-pressed',String(sound.muted));
    const label=!sound.supported?'Audio unavailable in this browser':sound.muted?'Unmute sound':'Mute sound';
    soundButton.setAttribute('aria-label',label);soundButton.title=`${label} · M`;
    themeSelect.disabled=!sound.supported;themeSelect.value=sound.theme;
  }
  function toggleSound(){if(!sound.supported)return;sound.setMuted(!sound.muted);status(sound.muted?'Music and discovery tunes muted.':'Music and discovery tunes on.');}
  function chooseMusicTheme(){
    if(!sound.setTheme(themeSelect.value)){syncSound();return;}
    for(const effect of effects){
      if(effect.age<0){
        const cue=sound.queueDiscovery(effect)||sound.nextEntrance();
        effect.startsAt=cue?.when;effect.musicBeat=cue?.beat;
        effect.age=cue?Math.min(0,sound.context.currentTime-cue.when):0;
      }else{
        const beat=sound.currentBeat();
        effect.musicBeat=beat===null?undefined:beat-(effect.motionTime??effect.age)/WonderAudio.BEAT;
      }
    }
    status(`${WonderAudio.THEMES[sound.theme].name} music. Every discovery follows its chords and groove.`);
  }
  document.addEventListener('pointerdown',e=>{if(e.isPrimary!==false&&e.button===0&&!soundButton.contains(e.target)&&!themeSelect.contains(e.target))sound.unlock();},{capture:true});
  document.addEventListener('click',e=>{if(!soundButton.contains(e.target)&&!themeSelect.contains(e.target))sound.unlock();},{capture:true});
  function resize(){W=canvas.clientWidth;H=canvas.clientHeight;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);world.resize(W,H);effects=[];sound.clearEffects();gesture=null;}
  window.addEventListener('resize',resize);resize();
  document.addEventListener('visibilitychange',()=>{last=0;accumulator=0;sound.setHidden(document.hidden);});
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
    const pulse=1+Math.sin(world.time*1.8+o.id)*.05;ctx.scale(pulse,pulse);glow(0,0,18,'#d8c6a50c');
    if(selected===o.id)ring(0,0,14,14,'#e7d7b956');
    ctx.strokeStyle=held&&world.placementBlocked(x,y)?'#ed9c97':'#e4d9c6';ctx.lineWidth=.85;ctx.fillStyle='#181d26b0';shapePath(o.id,tokenRadius);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#d6b98e45';ctx.lineWidth=.65;ctx.beginPath();ctx.arc(0,0,11,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-o.timer/o.period));ctx.stroke();
    ellipse(0,0,.8,.8,'#f5dfbc');ctx.restore();
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
  function emit(event){if(gesture?.type==='token'&&gesture.uid===event.tokenId)event={...event,x:gesture.x,y:gesture.y};
    const cue=sound.playDiscovery(event);
    effects.push({...event,age:cue?Math.min(0,sound.context.currentTime-cue.when):0,startsAt:cue?.when,musicBeat:cue?.beat,seed:event.tokenId*17.31+event.cycle*113.7,life:event.id===2?(event.y+100)/(24*effectScale())+4:[7.5,7,12,10,9,10][event.id]});if(effects.length>96)effects.shift();
  }
  function startEffect(event){
    // The released gust gently lifts adventurous people close to its origin.
    if(event.id===4)for(const p of world.people){if(Math.hypot(p.x-event.x,p.y-event.y)<90&&p.trait.bravery>.5&&!p.ladder){p.support=null;p.vy=-180;p.vx=p.direction*40;p.state='jump';}}
  }
  function effectScale(){return Math.min(1,W/700+.3);}
  function drawEffect(e){if(e.age<0)return;
    const transport=sound.currentBeat();
    const beat=e.musicBeat!==undefined&&transport!==null?Math.max(0,transport-e.musicBeat):WonderAudio.straightBeat(e.age/sound.beatLength,sound.theme);
    e.motionTime=beat*WonderAudio.BEAT;
    art.draw(e,{scale:effectScale(),ground:(world.ground-e.y)/effectScale(),beat,motion:e.motionTime});
  }
  function render(){ctx.clearRect(0,0,W,H);const t=world.time;
    for(let i=0;i<70;i++){const x=noise(i)*W,y=70+noise(i+80)*(world.ground-70);ctx.globalAlpha=.15+Math.sin(t*.3+i)*.08;ellipse(x,y,.5,.5,'#e1dccf');}ctx.globalAlpha=1;
    for(let i=0;i<4;i++)curve([0,world.ground+12+i*5,W*.32,world.ground-12+i*7,W*.73,world.ground+28+i*6,W,world.ground+4+i*6],'#d0c3a40a',.8);
    stroke([[14,world.ground],[W-14,world.ground]],'#cec6b456',.8);
    for(let i=0;i<80;i++){const x=noise(i+19)*W;stroke([[x,world.ground+3],[x+noise(i)*6,world.ground+5]],'#bbb3a322',.6);}
    world.lines.forEach(l=>drawLine(l));effects.forEach(drawEffect);world.people.forEach(drawPerson);world.tokens.forEach(drawToken);
    if(gesture?.type==='draw')drawLine({kind:tool,x1:gesture.startX,y1:gesture.startY,x2:gesture.x,y2:gesture.y},true);
    if(gesture?.type==='new'){ctx.save();ctx.translate(gesture.x,gesture.y);ctx.strokeStyle=world.placementBlocked(gesture.x,gesture.y)?'#ed9c97':'#eddbc0';ctx.lineWidth=1;shapePath(gesture.id,tokenRadius);ctx.stroke();ctx.restore();}
    else if(pointer&&tool==='place'&&selected!==null&&!gesture&&pointer.y>85&&pointer.y<world.ground){ctx.globalAlpha=.25;ctx.save();ctx.translate(pointer.x,pointer.y);ctx.strokeStyle=world.placementBlocked(pointer.x,pointer.y)?'#ed9c97':'#eddbc0';shapePath(selected,tokenRadius);ctx.stroke();ctx.restore();ctx.globalAlpha=1;}
  }
  function frame(now){const elapsed=last?Math.min((now-last)/1000,.1):0;last=now;
    if(!paused){accumulator+=elapsed;while(accumulator>=1/60){world.update(1/60);world.drainEvents().forEach(emit);for(const e of effects){
      const waiting=e.age<0;
      if(waiting&&e.startsAt!==undefined)e.age=sound.context.currentTime-e.startsAt;else e.age+=1/60;
      if(!e.started&&e.age>=0){e.started=true;startEffect(e);}
    }effects=effects.filter(e=>e.age<e.life);accumulator-=1/60;}}
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
  function undo(){if(world.undo()){effects=[];sound.clearEffects();gesture=null;syncTray();status('One small step back.');}}
  document.querySelector('#undo').addEventListener('click',undo);
  document.querySelector('#clear').addEventListener('click',()=>{world.reset();effects=[];sound.clearEffects();gesture=null;selected=null;tool='move';syncTray();status('Six copies of each shape are available.');});
  function pause(){paused=!paused;accumulator=0;sound.setPaused(paused);if(!paused)sound.unlock();const button=document.querySelector('#pause');button.setAttribute('aria-pressed',String(paused));button.innerHTML=paused?'<span aria-hidden="true">▷</span>':'<span aria-hidden="true">Ⅱ</span>';button.setAttribute('aria-label',paused?'Resume animation':'Pause animation');button.title=paused?'Resume · Space':'Pause · Space';}
  document.querySelector('#pause').addEventListener('click',pause);
  soundButton.addEventListener('click',toggleSound);themeSelect.addEventListener('change',chooseMusicTheme);
  window.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select')||e.repeat)return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo();return;}if(e.key==='Escape'){gesture=null;selected=null;tool='move';syncTray();return;}if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key.toLowerCase()==='m'){e.preventDefault();toggleSound();return;}sound.unlock();
    if(e.code==='Space'&&!e.target.closest('button')){e.preventDefault();pause();return;}
    if(/^[1-6]$/.test(e.key))chooseShape(Number(e.key)-1);const shortcut={v:'move',l:'line',h:'ladder',b:'spring'}[e.key.toLowerCase()];if(shortcut)chooseTool(shortcut);
  });
  syncTray();syncSound();sound.setHidden(document.hidden);requestAnimationFrame(frame);
})();
