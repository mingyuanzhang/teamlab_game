/* Integration checks against the real HTML, scripts, and Canvas drawing calls. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHash}=require('node:crypto');
const simulation=require('../simulation.js');
const {THEMES}=require('../vendor/wonder-audio/audio.js');
const {AudioContext}=require('./helpers/audio.cjs');
class Element{
  constructor(attrs=''){
    this.attrs=new Map([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(([,key,value])=>[key,value]));
    this.dataset=Object.fromEntries([...this.attrs].filter(([key])=>key.startsWith('data-')).map(([key,value])=>[key.slice(5),value]));
    this.listeners=new Map();this.style={};this.disabled=false;this.textContent='';this.dots=[];
    const classes=new Set((this.attrs.get('class')||'').split(' '));
    this.classList={contains:name=>classes.has(name),toggle:(name,on)=>on?classes.add(name):classes.delete(name)};
  }
  setAttribute(key,value){this.attrs.set(key,value);}
  getAttribute(key){return this.attrs.get(key);}
  querySelectorAll(selector){if(selector==='.slots i')return this.dots;throw Error(`Unsupported selector ${selector}`);}
  addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push(fn);}
  dispatch(type,extra={}){const e={target:this,currentTarget:this,isPrimary:true,button:0,pointerId:1,preventDefault(){},...extra};for(const fn of this.listeners.get(type)||[])fn(e);}
  matches(selector){return selector.split(',').includes(this.attrs.get('tag'));}
  closest(selector){return selector==='button'&&this.attrs.get('tag')==='button'?this:null;}
  contains(el){return el===this;}
  setPointerCapture(){}
}
function boot(width=1440,height=900,{audio=false,muted=false,theme='default',blocked=false}={}){
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),elements=[];
  for(const [,tag,attrs]of html.matchAll(/<(\w+)\b([^>]*)>/g)){
    const el=new Element(attrs);el.attrs.set('tag',tag);if(el.dataset.shape)el.dots=Array.from({length:6},()=>new Element());elements.push(el);
  }
  const document=new Element(),window=new Element();
  document.querySelector=selector=>{const el=elements.find(el=>el.attrs.get('id')===selector.slice(1));assert.ok(el,`Missing HTML element ${selector}`);return el;};
  document.querySelectorAll=selector=>elements.filter(el=>selector[0]==='.'?el.classList.contains(selector.slice(1)):selector==='[data-tool]'&&!!el.dataset.tool);
  const ctx={globalAlpha:1,calls:[],stack:[],save(){this.stack.push(this.globalAlpha);},restore(){this.globalAlpha=this.stack.pop();}};
  for(const name of ['setTransform','translate','scale','rotate','beginPath','closePath','moveTo','lineTo','bezierCurveTo','arc','ellipse','fillRect','fillText','clearRect','fill','stroke']){
    ctx[name]=function(...args){
      for(const value of args)if(typeof value==='number')assert.ok(Number.isFinite(value),`Non-finite ${name} coordinate`);
      assert.ok(this.globalAlpha>=0&&this.globalAlpha<=1,`Invalid opacity in ${name}`);
      if(name==='ellipse'&&this.globalAlpha>0)this.calls.push({color:this.fillStyle,args});
    };
  }
  ctx.createRadialGradient=(...args)=>{assert.ok(args.every(Number.isFinite));return {addColorStop(){}};};
  const canvas=document.querySelector('#world');Object.assign(canvas,{clientWidth:width,clientHeight:height,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0})});
  const storage=new Map([['little-wonders-muted',String(muted)],['little-wonders-music-theme',theme]]);
  const localStorage=blocked?{getItem(){throw Error('Blocked');},setItem(){throw Error('Blocked');}}:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)};
  let world,sound,scheduled,now=1000;
  class World extends simulation.World{constructor(w,h){super(w,h,()=>.4);world=this;}}
  const context=vm.createContext({document,window,console,AudioContext:audio?AudioContext:undefined,localStorage,LittleWorld:{...simulation,World},requestAnimationFrame:fn=>{scheduled=fn;}});
  const scripts=[...html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"><\/script>/g)].map(([,file])=>file);
  assert.deepEqual(scripts,['simulation.js','vendor/wonder-audio/audio.js','world.js']);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../',scripts[1]),'utf8'),context);
  const Base=context.WonderAudio.Soundtrack;
  context.WonderAudio.Soundtrack=class extends Base{constructor(options){super(options);sound=this;}};
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../',scripts[2]),'utf8'),context,{filename:'world.js'});
  function frame(ms=100){ctx.calls=[];now+=ms;const fn=scheduled;assert.ok(fn);scheduled=null;fn(now);assert.equal(ctx.stack.length,0,'Canvas state is balanced');}
  const click=selector=>document.querySelector(selector).dispatch('click');
  function populate(){world.people=[];for(let id=0;id<6;id++)assert.ok(world.place(id,40+id*(width-80)/6,180));}
  return {world,sound,document,window,canvas,ctx,storage,frame,click,populate};
}

test('local distribution and asset hashes match the files loaded by the game',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  for(const [,file,expected]of html.matchAll(/(?:src|href)="([^"?]+)\?v=([a-f0-9]+)"/g)){
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../',file))).digest('hex').slice(0,12),expected);
  }
  const vendor=path.join(__dirname,'../vendor/wonder-audio'),manifest=require('../vendor/wonder-audio/manifest.json');
  for(const [file,expected]of Object.entries(manifest.files))assert.equal(createHash('sha256').update(fs.readFileSync(path.join(vendor,file))).digest('hex'),expected);
});

for(const width of [1440,390])test(`the actual 2D app renders all six discoveries at ${width}px without Web Audio`,()=>{
  const a=boot(width,844);a.frame();assert.equal(a.world.people.length,48);a.populate();
  assert.equal(a.document.querySelector('#sound').disabled,true);assert.equal(a.document.querySelector('#music-theme').disabled,true);
  for(let i=0;i<150;i++)a.frame();assert.ok(a.world.tokens.every(t=>t.cycle>=1));assert.ok(a.ctx.calls.length>80);
  a.click('#pause');const time=a.world.time;a.frame();assert.equal(a.world.time,time);
  a.click('#pause');a.frame();assert.ok(a.world.time>time);
});

test('real reveal events play all tunes and repeats, with mute, pause, visibility, undo and reset',()=>{
  const a=boot(1440,900,{audio:true});a.frame();assert.equal(a.sound.context,null);
  a.document.dispatch('pointerdown',{target:a.canvas});assert.equal(a.sound.context.state,'running');a.populate();
  for(let i=0;i<7;i++)a.frame();assert.equal(a.sound.voices.size,6);assert.equal(a.sound.buffers.size,6);
  for(const t of a.world.tokens)t.timer=.01;a.frame();assert.equal(a.sound.voices.size,12);
  a.click('#sound');assert.equal(a.sound.muted,true);assert.equal(a.sound.voices.size,0);
  assert.equal(a.document.querySelector('#sound').getAttribute('aria-pressed'),'true');
  for(const t of a.world.tokens)t.timer=.01;a.frame();assert.equal(a.sound.voices.size,0);
  a.window.dispatch('keydown',{key:'m'});assert.equal(a.sound.muted,false);
  a.window.dispatch('keydown',{key:' ',code:'Space'});assert.equal(a.sound.context.state,'suspended');
  a.document.hidden=true;a.document.dispatch('visibilitychange');a.click('#pause');assert.equal(a.sound.context.state,'suspended');
  a.document.hidden=false;a.document.dispatch('visibilitychange');assert.equal(a.sound.context.state,'running');
  a.sound.playDiscovery({id:0});a.click('#undo');assert.equal(a.sound.voices.size,0);
  a.sound.playDiscovery({id:1});a.click('#clear');assert.equal(a.sound.voices.size,0);assert.equal(a.world.tokens.length,0);
});

for(const theme of Object.keys(THEMES).filter(id=>id!=='default'))test(`${theme} updates pending entrances, repeats, future placements, and paused or muted playback`,()=>{
  const a=boot(1440,900,{audio:true});a.frame();a.document.dispatch('pointerdown',{target:a.canvas});a.populate();
  for(let i=0;i<7;i++)a.frame();const music=a.sound.music,voices=[...a.sound.voices.keys()];
  const select=a.document.querySelector('#music-theme');select.value=theme;select.dispatch('change');
  assert.equal(a.sound.theme,theme);assert.equal(music.stopped,true);assert.ok(voices.every(source=>source.stopped));
  assert.equal(a.sound.voices.size,6);assert.equal(a.storage.get('little-wonders-music-theme'),theme);
  assert.ok([...a.sound.buffers.keys()].every(key=>key.startsWith(theme+':')));
  a.sound.context.currentTime=a.sound.startedAt+.15;a.frame();
  for(const t of a.world.tokens)t.timer=.01;a.frame();assert.ok(a.sound.voices.size>6);
  assert.ok(a.world.place(0,500,220));for(let i=0;i<7;i++)a.frame();assert.equal(a.world.tokens.length,7);
  a.click('#pause');select.value='default';select.dispatch('change');assert.equal(a.sound.context.state,'suspended');
  a.click('#sound');assert.equal(a.sound.muted,true);select.value=theme;select.dispatch('change');
  assert.equal(a.sound.muted,true);assert.equal(a.sound.context.state,'suspended');
  a.click('#pause');assert.equal(a.sound.muted,true);
});

test('visual entrances and ribbon gusts wait for their scheduled audio beat',()=>{
  const a=boot(1440,900,{audio:true});a.frame();a.document.dispatch('pointerdown',{target:a.canvas});
  a.world.people=[];assert.ok(a.world.place(0,200,200));assert.ok(a.world.place(4,400,200));
  for(let i=0;i<7;i++)a.frame();
  const rain=()=>a.ctx.calls.some(call=>call.color==='#9de5ed0c');
  assert.equal(rain(),false);
  const when=[...a.sound.voices.keys()][0].when;
  const person={...new simulation.World(1440,900).people[2],x:400,y:200,ladder:null};
  a.world.people=[person];a.world.update=()=>{};
  a.sound.context.currentTime=when-.005;a.frame();assert.equal(rain(),false);assert.notEqual(person.vy,-180);
  a.sound.context.currentTime=when+.1;a.frame();assert.equal(rain(),true);assert.equal(person.vy,-180);
});

test('saved preferences, select keyboard focus, and restricted storage preserve gameplay',()=>{
  const a=boot(390,844,{audio:true,muted:true,theme:'chopin'}),select=a.document.querySelector('#music-theme');
  assert.equal(select.value,'chopin');a.document.dispatch('pointerdown',{target:a.canvas});assert.equal(a.sound.context,null);
  a.window.dispatch('keydown',{target:select,key:'m'});assert.equal(a.sound.muted,true);
  a.window.dispatch('keydown',{target:select,key:'1'});assert.equal(a.document.querySelectorAll('.shape')[0].getAttribute('aria-pressed'),'false');
  a.click('#pause');a.click('#sound');assert.equal(a.sound.context,null);a.click('#pause');assert.equal(a.sound.context.state,'running');
  const b=boot(390,844,{audio:true,blocked:true});b.frame();b.document.dispatch('pointerdown',{target:b.canvas});b.click('#sound');b.click('#sound');b.populate();b.frame();
});
