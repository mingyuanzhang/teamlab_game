const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(process.env.WORLD_SOURCE || `${__dirname}/../world.js`, 'utf8');
const kinds = ['flower','tree','water','house','lantern','mushroom','music','windmill','campfire'];

// Run the real animation and event handlers with a deterministic clock/random
// source. Canvas is a no-op: these tests check lifecycle, not visual appearance.
function world(width=1440,height=900) {
  const noop=()=>{};
  const ctx=new Proxy({createRadialGradient:()=>({addColorStop:noop})}, {get:(o,k)=>o[k] || noop,set:(o,k,v)=>(o[k]=v,true)});
  function element(kind) {return {dataset:{kind},classList:{toggle:noop},setAttribute(k,v){this[k]=v;},addEventListener(k,v){this[k]=v;},setPointerCapture:noop};}
  const buttons=kinds.map(element), elements={};
  for(const id of ['#status','#pause','#undo','#clear'])elements[id]=element();
  elements['.controls']={getBoundingClientRect:()=>({top:height-(width<=850?245:205)})};
  const canvas=Object.assign(element(),{clientWidth:width,clientHeight:height,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0})});elements['#world']=canvas;
  let next, now=0, seed=31;const listeners={};
  const math=Object.create(Math);math.random=()=>((seed=seed*16807%2147483647)/2147483647);
  const sandbox={Math:math,document:{querySelector:s=>elements[s],querySelectorAll:()=>buttons},window:{devicePixelRatio:1,addEventListener:(k,v)=>listeners[k]=v},requestAnimationFrame:f=>next=f};
  const instrumented=source.replace('  reset();requestAnimationFrame(frame);', '  globalThis.inspect={people,place,get objects(){return objects;},get time(){return time;}}; reset();requestAnimationFrame(frame);');
  vm.runInNewContext(instrumented,sandbox);
  return {api:sandbox.inspect,buttons,elements,canvas,listeners,step(n=1){for(let i=0;i<n;i++){const callback=next;next=null;assert.ok(callback,'animation must keep scheduling');callback(now+=1000/60);}}};
}

test('a person finishing a visit does not crash the next animation frame',()=>{
  const w=world(),p=w.api.people[0],o=w.api.objects[0];
  p.target=o;p.x=o.x+Math.sin(p.phase)*35/1440;p.y=o.y+(12+Math.cos(p.phase)*9)/900;
  p.wait=30;p.state='activity';p.remaining=.001;
  w.step(3);
  assert.equal(p.target,null);
  w.step(120);
});

test('48 people have varied personalities, pace, appearance, and choices',()=>{
  const w=world();assert.equal(w.api.people.length,48);
  assert.equal(new Set(w.api.people.map(p=>p.personality.name)).size,6);
  assert.ok(new Set(w.api.people.map(p=>p.speed)).size>20);
  assert.ok(new Set(w.api.people.map(p=>p.size)).size>20);
  w.step(1200);
  assert.ok(new Set(w.api.people.map(p=>p.state)).size>1);
  assert.ok(new Set(w.api.people.map(p=>p.target?.kind)).size>3);
  // Interests must measurably influence decisions over several visits.
  let favorite=0,other=0;
  for(let i=0;i<30;i++){w.step(120);for(const p of w.api.people){if(p.target){if(p.personality.favorites.includes(p.target.kind))favorite++;else other++;}}}
  assert.ok(favorite>other,`favorite choices ${favorite}, others ${other}`);
});

for(const [width,height] of [[1440,900],[390,844]]) {
  test(`ten simulated minutes with all objects, undo, reset, pause, resize at ${width}px`,()=>{
    const w=world(width,height);
    for(const b of w.buttons){b.click();w.canvas.pointerdown({clientX:width*.5,clientY:height*.5});assert.equal(w.api.objects.at(-1).kind,b.dataset.kind);b.keydown({key:'Enter',preventDefault(){}});assert.equal(w.api.objects.at(-1).kind,b.dataset.kind);b.pointerdown({clientX:20,clientY:height-100,pointerId:1});b.pointerup({clientX:width*.4,clientY:height*.48});assert.equal(w.api.objects.at(-1).kind,b.dataset.kind);}
    w.step(600);
    const pause=w.elements['#pause'];pause.click({currentTarget:pause});const before=w.api.time,positions=JSON.stringify(w.api.people.map(p=>[p.x,p.y,p.state,p.remaining]));w.step(120);assert.equal(w.api.time,before);assert.equal(JSON.stringify(w.api.people.map(p=>[p.x,p.y,p.state,p.remaining])),positions);pause.click({currentTarget:pause});w.step();assert.ok(w.api.time>before);
    for(let i=0;i<600;i++) {
      if(i%17===0)w.api.place(.2+(i%6)*.1,.5,kinds[i%9]);
      if(i%31===0)w.elements['#undo'].click();
      if(i===100) {while(w.api.objects.length)w.elements['#undo'].click();}
      if(i===150)w.elements['#clear'].click();
      if(i===200){w.canvas.clientWidth=390;w.canvas.clientHeight=844;w.listeners.resize();}
      w.step(60);
      assert.ok(w.api.objects.length<=35);
      for(const p of w.api.people){assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1);}
    }
    assert.ok(w.api.time>600);
  });
}
