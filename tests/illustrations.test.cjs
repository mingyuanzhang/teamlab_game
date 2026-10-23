const {test}=require('node:test');
const assert=require('node:assert/strict');
const {entrance,createPainter}=require('../illustrations.js');
const {TOKEN_RADIUS}=require('../simulation.js');

test('discoveries overshoot, recoil, and settle at full size instead of shrinking on exit',()=>{
  assert.deepEqual(entrance(-1),{x:0,y:0,rotation:0});assert.equal(entrance(0).x,0);
  const samples=Array.from({length:180},(_,i)=>entrance(i/120));
  assert.ok(Math.max(...samples.map(p=>p.x))>1.2,'The entrance visibly pops beyond full size');
  assert.ok(samples.slice(25,70).some(p=>p.x<.99),'The spring recoils after its first overshoot');
  assert.ok(samples.some(p=>Math.abs(p.x-p.y)>.05),'Squash and stretch give the pop a soft wobble');
  for(const {x,y,rotation}of samples){assert.ok(x>=0&&y>=0&&x<1.5&&y<1.5);assert.ok(Math.abs(rotation)<.1);}
  for(const age of[1.5,5,12]){const p=entrance(age);assert.ok(Math.abs(p.x-1)<.001);assert.ok(Math.abs(p.y-1)<.001);}
  assert.ok(TOKEN_RADIUS<=7,'The placed shapes stay smaller than the people');
});

test('all six drawings vary between reveals, stay balanced, and dissolve at full size',()=>{
  const ctx={globalAlpha:1,stack:[],calls:[],fillStyle:'',strokeStyle:'',lineWidth:1,
    save(){this.stack.push(this.globalAlpha);},restore(){this.globalAlpha=this.stack.pop();},
    createRadialGradient(){return {addColorStop(){}};}};
  for(const method of['translate','rotate','scale','beginPath','moveTo','lineTo','closePath','bezierCurveTo','ellipse','fill','stroke','fillRect']){
    ctx[method]=function(...args){for(const v of args)if(typeof v==='number')assert.ok(Number.isFinite(v));assert.ok(this.globalAlpha>=0&&this.globalAlpha<=1);this.calls.push([method,args,this.globalAlpha]);};
  }
  const painter=createPainter(ctx);
  for(let id=0;id<6;id++){
    const draw=(age,seed=25)=>{ctx.calls=[];painter.draw({id,x:100,y:200,age,life:9,seed},{beat:age*1.4,motion:age,ground:300});assert.equal(ctx.stack.length,0);return JSON.stringify(ctx.calls);};
    assert.equal(draw(-.1),'[]');assert.equal(draw(9),'[]');
    draw(.2);assert.ok(Math.max(...ctx.calls.filter(([kind])=>kind==='scale')[1][1])>1.2,'The painter applies the entrance overshoot');
    assert.notEqual(draw(2,25),draw(2,62),'Repeating illustrations have different compositions');
    draw(8.5);const scale=ctx.calls.filter(([kind])=>kind==='scale')[1][1];
    assert.ok(scale.every(n=>Math.abs(n-1)<.001),'The exit fades full-sized artwork');
    const firstAlpha=ctx.calls.find(([kind])=>kind==='stroke')[2];assert.ok(firstAlpha>0&&firstAlpha<1);
    for(const age of[0,.03,.2,.6,1.5,4,8.9])draw(age);
  }
});
