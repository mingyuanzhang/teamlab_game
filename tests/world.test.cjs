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

test('six copies per shape, with independent identities and no seventh placement',()=>{
  const w=create();for(let id=0;id<6;id++)for(let copy=0;copy<6;copy++)assert.ok(w.place(id,100+copy*100,100+id*50));
  assert.equal(w.tokens.length,36);assert.equal(new Set(w.tokens.map(o=>o.uid)).size,36);
  const before=JSON.stringify(w.tokens),history=w.history.length;
  for(let id=0;id<7;id++)assert.equal(w.place(id,20,100),undefined);
  assert.equal(JSON.stringify(w.tokens),before);assert.equal(w.history.length,history);
  advance(w,.6);const events=w.drainEvents();assert.equal(events.length,36);assert.equal(new Set(events.map(e=>e.tokenId)).size,36);
});

test('moving a copy changes only its origin and timer, even at capacity; undo restores it',()=>{
  const w=create();for(let i=0;i<6;i++)w.place(0,100+i*100,200);
  advance(w,1);w.drainEvents();const first=w.tokens[0],other=w.tokens[1],before=JSON.stringify(other);
  w.move(first.uid,450,150);assert.equal(w.tokens.length,6);assert.equal(JSON.stringify(other),before);
  advance(w,.6);const events=w.drainEvents();assert.equal(events.length,1);assert.equal(events[0].tokenId,first.uid);assert.equal(events[0].x,450);assert.equal(events[0].y,150);
  assert.ok(w.undo());assert.equal(w.tokens[0].x,100);assert.equal(w.tokens[0].y,200);
  assert.ok(w.undo());assert.equal(w.tokens.length,5);assert.ok(w.place(0,700,200));assert.equal(w.tokens.length,6);
});

test('emissions repeat on clocks, even without more placements',()=>{const w=create();w.place(0,200,200);advance(w,.6);assert.equal(w.drainEvents().length,1);advance(w,8);assert.equal(w.drainEvents().length,0);advance(w,1.1);assert.equal(w.drainEvents().length,1);});

test('cautious people turn at edges; adventurous people step off',()=>{const w=create();w.lines=[];w.addLine('line',100,300,400,300);const l=w.lines[0];const brave=w.people[2],shy=w.people[3];for(const p of [brave,shy])Object.assign(p,{x:399,y:300,direction:1,support:l.id,ladder:null,rest:0,decision:100,cooldown:100});advance(w,.2);assert.equal(brave.support,null);assert.ok(brave.y>300);assert.equal(shy.support,l.id);assert.equal(shy.direction,-1);});

for(const [width,height] of [[1440,900],[390,844]])test(`ten minutes of physics and discovery clocks at ${width}px`,()=>{const w=create(width,height);const states=new Set();assert.equal(w.people.length,48);assert.equal(new Set(w.people.map(p=>p.trait.name)).size,6);for(let i=0;i<36000;i++){
  if(i%900===0)w.place((i/900)%6,40+(i%7)*(w.width-80)/7,100+(i%5)*(w.ground-140)/5);
  if(i%1800===0)w.addLine(i%3600?'spring':'line',30,250,w.width-30,280);
  if(i===8000)w.undo();if(i===10000)w.resize(390,844);if(i===22000)w.reset();
  w.update(1/60);if(i%60===0)w.drainEvents();for(const p of w.people){states.add(p.state);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.vy));assert.ok(p.y<=w.ground+.01);assert.ok(p.x>=0&&p.x<=w.width);}
  assert.ok(w.tokens.length<=36);assert.ok(w.events.length<=72);
}assert.ok(states.has('climb'));assert.ok(states.has('jump'));assert.ok(states.has('fall'));});

test('shapes can share an origin before and during active discovery cycles',()=>{
  const w=create();const a=w.place(0,250,150),b=w.place(0,250,150);assert.ok(a&&b);
  advance(w,.6);assert.equal(w.drainEvents().length,2);
  const c=w.place(1,250,150);assert.ok(c);assert.equal(w.tokens.length,3);
  const d=w.place(2,350,150);assert.ok(w.move(d.uid,250,150));
  assert.ok(w.tokens.every(o=>o.x===250&&o.y===150));
});

for(const width of [1200,390])test(`only people block placement and moves at ${width}px`,()=>{
  const w=create(width,800);w.people.forEach(p=>{p.x=width-30;p.y=w.ground;});
  const token=w.place(0,100,130),person=w.people[0];person.x=180;person.y=240;
  const history=w.history.length;assert.ok(w.placementBlocked(180,230));
  assert.equal(w.place(1,180,230),undefined);assert.equal(w.tokens.length,1);
  assert.equal(w.move(token.uid,180,230),undefined);assert.equal(token.x,100);assert.equal(token.y,130);assert.equal(w.history.length,history);
  // Check the full shape footprint, not just whether its center hits a person.
  assert.ok(w.placementBlocked(200,230));assert.ok(!w.placementBlocked(215,230));
  person.x=width-30;assert.ok(w.place(1,180,230));assert.ok(w.move(token.uid,180,230));
});
