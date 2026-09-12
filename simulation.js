/* Physics and discovery clocks, independent of Canvas or the browser. */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LittleWorld = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const traits = [
    {name:'wanderer',speed:29,climb:.75,bravery:.8,pause:.08},
    {name:'dreamer',speed:15,climb:.35,bravery:.25,pause:.35},
    {name:'acrobat',speed:37,climb:.9,bravery:1,pause:.03},
    {name:'shy',speed:22,climb:.45,bravery:.12,pause:.2},
    {name:'curious',speed:26,climb:.95,bravery:.65,pause:.1},
    {name:'dancer',speed:24,climb:.6,bravery:.5,pause:.2},
  ];
  class World {
    constructor(width,height,random=Math.random) {
      this.random=random;this.width=width;this.height=height;this.time=0;this.nextId=0;
      this.events=[];this.history=[];this.reset();
    }
    get ground(){return this.height-182;}
    range(a,b){return a+this.random()*(b-a);}
    reset() {
      this.time=0;this.events=[];this.history=[];this.tokens=[];this.lines=[];
      const w=this.width,g=this.ground, rise=Math.min(135,(g-110)/3);
      const line=(kind,x1,y1,x2,y2)=>this.lines.push({id:++this.nextId,kind,x1,y1,x2,y2,pulse:0});
      line('line',w*.08,g-rise,w*.4,g-rise-12);
      line('line',w*.51,g-rise*1.85,w*.85,g-rise*1.85+15);
      line('spring',w*.58,g-48,w*.84,g-48);
      line('ladder',w*.23,g,w*.23,g-rise-6);
      line('ladder',w*.65,g-48,w*.65,g-rise*1.85+6);
      this.people=Array.from({length:48},(_,i)=>{
        const surface=i<14?this.lines[0]:i<24?this.lines[1]:null;
        const x=surface?this.range(surface.x1+8,surface.x2-8):this.range(18,w-18);
        return {id:i,trait:traits[i%traits.length],x,y:surface?this.surfaceY(surface,x):g,vx:0,vy:0,
          direction:this.random()<.5?-1:1,speed:this.range(.8,1.25),size:this.range(.78,1.13),
          phase:this.range(0,6.28),hat:i%4,color:i%6,skin:i%3,support:surface?surface.id:'ground',
          state:'walk',ladder:null,cooldown:this.range(0,3),decision:this.range(1,5),rest:0,expression:0};
      });
    }
    surfaceY(l,x){return l.y1+(l.y2-l.y1)*clamp((x-l.x1)/(l.x2-l.x1||1),0,1);}
    snapshot(){this.history.push({tokens:this.tokens.map(o=>({...o})),lines:this.lines.map(l=>({...l}))});if(this.history.length>50)this.history.shift();}
    place(id,x,y) {
      if(!Number.isInteger(id)||id<0||id>5)return;
      if(this.tokens.filter(o=>o.id===id).length>=6||this.placementBlocked(x,y))return;
      this.snapshot();const o={id,uid:++this.nextId,period:9+id*1.7,cycle:0};this.tokens.push(o);
      this.positionToken(o,x,y);return o;
    }
    placementBlocked(x,y) {
      // Only people's bodies block a shape, never other shapes or their art.
      x=clamp(x,24,this.width-24);y=clamp(y,88,this.ground-25);
      return this.people.some(p=>{
        const s=p.size*(this.width<700?.75:.92);
        const nearestX=clamp(x,p.x-7*s,p.x+7*s);
        const nearestY=clamp(y,p.y-27*s,p.y+2*s);
        return Math.hypot(x-nearestX,y-nearestY)<19;
      });
    }
    positionToken(o,x,y) {
      o.x=clamp(x,24,this.width-24);o.y=clamp(y,88,this.ground-25);o.timer=.55;
    }
    move(uid,x,y) {
      const o=this.tokens.find(o=>o.uid===uid);if(!o||this.placementBlocked(x,y))return;
      this.snapshot();this.positionToken(o,x,y);return o;
    }
    addLine(kind,x1,y1,x2,y2) {
      if(!['line','ladder','spring'].includes(kind)||Math.hypot(x2-x1,y2-y1)<24||this.lines.length>=30)return false;
      x1=clamp(x1,12,this.width-12);x2=clamp(x2,12,this.width-12);y1=clamp(y1,90,this.ground);y2=clamp(y2,90,this.ground);
      if(kind!=='ladder'&&Math.abs(y2-y1)>Math.abs(x2-x1)*1.5)kind='ladder';
      if(kind==='ladder'){if(y1<y2)[x1,y1,x2,y2]=[x2,y2,x1,y1];}
      else if(x1>x2)[x1,y1,x2,y2]=[x2,y2,x1,y1];
      this.snapshot();this.lines.push({id:++this.nextId,kind,x1,y1,x2,y2,pulse:0});return true;
    }
    undo() {
      const prior=this.history.pop();if(!prior)return false;
      this.tokens=prior.tokens;this.lines=prior.lines;
      for(const p of this.people){if(p.ladder&&!this.lines.some(l=>l.id===p.ladder)){p.ladder=null;p.state='fall';p.support=null;}}
      return true;
    }
    resize(w,h) {
      const sx=w/this.width,oldGround=this.ground;this.width=w;this.height=h;
      const sy=(this.ground-90)/Math.max(1,oldGround-90), y=v=>clamp(90+(v-90)*sy,90,this.ground);
      for(const l of this.lines){l.x1*=sx;l.x2*=sx;l.y1=y(l.y1);l.y2=y(l.y2);}
      for(const o of this.tokens){o.x=clamp(o.x*sx,24,w-24);o.y=Math.min(this.ground-25,y(o.y));}
      for(const p of this.people){p.x=clamp(p.x*sx,9,w-9);p.y=y(p.y);p.support=null;p.ladder=null;p.state='fall';p.cooldown=1;}
      this.history=[];this.events=[];
    }
    drainEvents(){return this.events.splice(0);}
    update(dt) {
      if(!Number.isFinite(dt)||dt<=0)return;
      // Bound both integration and emitter work after a background-tab delay.
      dt=Math.min(dt,.05);this.time+=dt;
      for(const o of this.tokens){o.timer-=dt;if(o.timer<=0){o.timer=o.period;o.cycle++;this.events.push({id:o.id,tokenId:o.uid,x:o.x,y:o.y,cycle:o.cycle});
        for(const p of this.people){if(Math.hypot(p.x-o.x,p.y-o.y)<170){p.expression=3;if(p.trait.name==='shy'){p.direction=p.x<o.x?-1:1;}else if(this.random()<.6){p.direction=p.x<o.x?1:-1;p.rest=this.range(.5,2);}}}
      }}
      // A consumer that is absent or paused cannot accumulate unbounded events.
      if(this.events.length>72)this.events.splice(0,this.events.length-72);
      for(const l of this.lines)l.pulse=Math.max(0,l.pulse-dt);
      for(const p of this.people)this.updatePerson(p,dt);
    }
    updatePerson(p,dt) {
      p.cooldown=Math.max(0,p.cooldown-dt);p.expression=Math.max(0,p.expression-dt);
      if(p.ladder) {
        const l=this.lines.find(l=>l.id===p.ladder);
        if(!l){p.ladder=null;p.support=null;p.state='fall';return;}
        const destination=p.climbUp?l.y2:l.y1;
        p.y+=Math.sign(destination-p.y)*Math.min(Math.abs(destination-p.y),dt*p.trait.speed*p.speed*.8);
        p.x=l.x1+(l.x2-l.x1)*clamp((p.y-l.y1)/(l.y2-l.y1||1),0,1);
        p.vx=0;p.vy=0;p.state='climb';
        if(Math.abs(p.y-destination)<.5){p.ladder=null;p.cooldown=2;p.support=null;p.state='fall';p.y-=2;p.vy=-18;}
        return;
      }
      let support=p.support==='ground'?{kind:'ground',x1:0,x2:this.width}:this.lines.find(l=>l.id===p.support&&l.kind!=='ladder');
      if(support && (p.x<support.x1-1||p.x>support.x2+1)){support=null;p.support=null;}
      if(!support)p.support=null;
      if(support) {
        p.y=support.kind==='ground'?this.ground:this.surfaceY(support,p.x);p.vy=0;
        p.decision-=dt;p.rest=Math.max(0,p.rest-dt);
        if(p.decision<=0){p.decision=this.range(2,7);if(this.random()<p.trait.pause)p.rest=this.range(1,3.5);if(this.random()<.2)p.direction*=-1;}
        p.state=p.rest>0?'rest':'walk';p.vx=p.rest>0?0:p.direction*p.trait.speed*p.speed;
        if(p.cooldown===0) {
          const ladder=this.lines.find(l=>l.kind==='ladder'&&((Math.abs(p.x-l.x1)<10&&Math.abs(p.y-l.y1)<14)||(Math.abs(p.x-l.x2)<10&&Math.abs(p.y-l.y2)<14)));
          if(ladder){p.cooldown=2;if(this.random()<p.trait.climb){p.ladder=ladder.id;p.climbUp=Math.abs(p.y-ladder.y1)<Math.abs(p.y-ladder.y2);p.support=null;p.state='climb';return;}}
        }
        const nx=p.x+p.vx*dt;
        if(support.kind!=='ground'&&((p.vx<0&&nx<support.x1+2)||(p.vx>0&&nx>support.x2-2))&&p.trait.bravery<.4){p.direction*=-1;p.vx*=-1;}
        p.x+=p.vx*dt;
        if(support.kind!=='ground'&&(p.x<support.x1||p.x>support.x2)){p.support=null;support=null;p.state='fall';}
        else p.y=support.kind==='ground'?this.ground:this.surfaceY(support,p.x);
      } else {
        const oldX=p.x,oldY=p.y;p.vy+=320*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.state=p.vy<0?'jump':'fall';
        if(p.vy>=0){
          const crossed=this.lines.filter(l=>l.kind!=='ladder'&&p.x>=l.x1&&p.x<=l.x2&&oldY<=this.surfaceY(l,oldX)+2&&p.y>=this.surfaceY(l,p.x));
          crossed.sort((a,b)=>this.surfaceY(a,p.x)-this.surfaceY(b,p.x));const hit=crossed[0];
          if(hit){p.y=this.surfaceY(hit,p.x);if(hit.kind==='spring'){p.vy=-this.range(180,255);p.vx=p.direction*p.trait.speed*p.speed*1.3;p.state='jump';p.expression=2;hit.pulse=.65;}else{p.support=hit.id;p.vy=0;p.state='walk';}}
          else if(p.y>=this.ground){p.y=this.ground;p.vy=0;p.support='ground';p.state='walk';}
        }
      }
      if(p.x<9||p.x>this.width-9){p.x=clamp(p.x,9,this.width-9);p.direction=p.x<10?1:-1;p.vx=p.direction*Math.abs(p.vx);}
      // Walkers entering a spring from an adjoining path also bounce.
      if(p.support && support?.kind==='spring'){p.support=null;p.vy=-220;p.state='jump';support.pulse=.65;}
    }
  }
  return {World,traits};
});
