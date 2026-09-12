const {test}=require('node:test');
const assert=require('node:assert/strict');
const {World}=require('../simulation.js');
function create(w=1200,h=800){let seed=31;return new World(w,h,()=>((seed=seed*16807%2147483647)/2147483647));}
function advance(w,seconds){for(let i=0;i<seconds*60;i++)w.update(1/60);}
function fallingPerson(w,x,y){const p=w.people[0];Object.assign(p,{x,y,vx:0,vy:0,support:null,ladder:null,state:'fall',rest:0,cooldown:5});return p;}

test('people fall under gravity and land on the ground',()=>{const w=create();w.lines=[];const p=fallingPerson(w,200,120);advance(w,.5);assert.ok(p.y>140);assert.ok(p.vy>100);advance(w,3);assert.equal(p.y,w.ground);assert.equal(p.support,'ground');});

test('falling people land on a sloped path, then fall when it is removed',()=>{const w=create();w.lines=[];w.addLine('line',100,300,400,340);const p=fallingPerson(w,250,200);advance(w,1);assert.equal(p.support,w.lines[0].id);assert.ok(Math.abs(p.y-w.surfaceY(w.lines[0],p.x))<.1);assert.ok(w.undo());advance(w,2);assert.equal(p.support,'ground');});

test('spring lines launch people upward rather than hold them',()=>{const w=create();w.lines=[];w.addLine('spring',100,350,500,350);const p=fallingPerson(w,250,330);advance(w,.5);assert.equal(p.support,null);assert.ok(p.vy<0);assert.ok(p.y<330);assert.ok(w.lines[0].pulse>0);});

test('ladders take people from ground to a higher platform',()=>{const w=create();w.random=()=>0;w.lines=[];w.addLine('line',100,300,400,300);w.addLine('ladder',200,w.ground,200,300);const p=w.people[0];Object.assign(p,{x:200,y:w.ground,support:'ground',ladder:null,rest:0,cooldown:0,decision:100});w.update(1/60);assert.equal(p.state,'climb');advance(w,2);assert.ok(p.y<w.ground-20);let arrived=false;for(let i=0;i<30*60;i++){w.update(1/60);if(p.support===w.lines[0].id){arrived=true;break;}}assert.ok(arrived,'climber should land on the higher platform');});

test('removing a ladder during a climb releases the climber safely',()=>{const w=create();w.lines=[];w.addLine('ladder',200,w.ground,200,200);const p=w.people[0];Object.assign(p,{x:200,y:350,ladder:w.lines[0].id,climbUp:true,support:null,state:'climb'});w.undo();assert.equal(p.ladder,null);advance(w,3);assert.equal(p.support,'ground');});

test('only six mystery objects exist, moving one resets its timer and origin',()=>{const w=create();assert.equal(w.tokens.length,0);for(let id=0;id<6;id++)w.place(id,100+id*100,200);w.place(6,20,100);assert.equal(w.tokens.length,6);advance(w,.4);assert.equal(w.drainEvents().length,0);advance(w,.2);assert.equal(w.drainEvents().length,6);w.place(0,450,150);assert.equal(w.tokens.length,6);advance(w,.6);const event=w.drainEvents().find(e=>e.id===0);assert.equal(event.x,450);assert.equal(event.y,150);assert.ok(w.undo());assert.equal(w.tokens.find(o=>o.id===0).x,100);});

test('emissions repeat on clocks, even without more placements',()=>{const w=create();w.place(0,200,200);advance(w,.6);assert.equal(w.drainEvents().length,1);advance(w,8);assert.equal(w.drainEvents().length,0);advance(w,1.1);assert.equal(w.drainEvents().length,1);});

test('cautious people turn at edges; adventurous people step off',()=>{const w=create();w.lines=[];w.addLine('line',100,300,400,300);const l=w.lines[0];const brave=w.people[2],shy=w.people[3];for(const p of [brave,shy])Object.assign(p,{x:399,y:300,direction:1,support:l.id,ladder:null,rest:0,decision:100,cooldown:100});advance(w,.2);assert.equal(brave.support,null);assert.ok(brave.y>300);assert.equal(shy.support,l.id);assert.equal(shy.direction,-1);});

for(const [width,height] of [[1440,900],[390,844]])test(`ten minutes of physics and discovery clocks at ${width}px`,()=>{const w=create(width,height);const states=new Set();assert.equal(w.people.length,48);assert.equal(new Set(w.people.map(p=>p.trait.name)).size,6);for(let i=0;i<36000;i++){
  if(i%900===0)w.place((i/900)%6,40+(i%7)*(w.width-80)/7,100+(i%5)*(w.ground-140)/5);
  if(i%1800===0)w.addLine(i%3600?'spring':'line',30,250,w.width-30,280);
  if(i===8000)w.undo();if(i===10000)w.resize(390,844);if(i===22000)w.reset();
  w.update(1/60);if(i%60===0)w.drainEvents();for(const p of w.people){states.add(p.state);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.vy));assert.ok(p.y<=w.ground+.01);assert.ok(p.x>=0&&p.x<=w.width);}
  assert.ok(w.tokens.length<=6);assert.ok(w.events.length<=24);
}assert.ok(states.has('climb'));assert.ok(states.has('jump'));assert.ok(states.has('fall'));});
