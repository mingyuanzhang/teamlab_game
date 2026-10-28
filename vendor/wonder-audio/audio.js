/* Wonder Audio · local instruments and score-based arrangements. See NOTICE.md for score attribution. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(root);
  else root.WonderAudio=factory(root);
})(typeof globalThis!=='undefined'?globalThis:this,root=>{
  'use strict';
  const TAU=Math.PI*2,BEAT=60/84;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const feel=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
  const CHORDS=[[48,55,60,64,71],[45,52,57,60,67],[41,48,53,57,64],[43,50,55,59,64]];
  const JAZZ_CHORDS=[
    [38,45,50,53,60,64],[31,38,43,47,53,57,64],[36,43,48,52,59,62],[33,40,45,48,55,59],
    [38,45,50,53,60,64],[31,38,43,47,53,57,64],[40,47,52,55,62],[33,40,45,49,55,58]
  ];
  // An original 16-bar quartet chorus: D minor, a brighter bridge, then home.
  // Five quarter-note beats per bar, felt as a group of three and a group of two.
  const BRUBECK_CHORDS=[
    [38,45,48,53,64],[43,50,53,59,64],[36,43,47,52,62],[33,40,43,49,58],
    [38,45,47,53,64],[43,50,53,57,59],[40,46,50,55,62],[33,40,43,49,58],
    [41,48,52,57,67],[34,41,45,50,60],[39,46,50,57,65],[33,40,43,49,59],
    [38,45,48,53,64],[43,50,53,59,64],[40,46,50,55,62],[33,40,43,49,58]
  ];
  const BRUBECK_PHRASES=[
    {steps:[5,4,3,2,0],beats:[0,.5,1.5,3,4],length:.6},
    {steps:[0,2,3,4,5,3],beats:[0,.5,1,2,3,4],length:.5},
    {steps:[1,2,3,4,2],beats:[0,1,1.5,3,4],length:.9},
    {steps:[0,1,3,2,1,0],beats:[0,.5,1.5,2,3,4],length:.55},
    {steps:[0,2,1,3,2,4,2],beats:[0,.5,1,1.5,2,3,4],length:.5},
    {steps:[2,3,1,2,0],beats:[0,1,2,3,4],length:.85}
  ];
  // Original E-minor riff cycle; no borrowed song riffs or recordings.
  const METAL_CHORDS=[40,40,43,41,40,40,36,38,33,36,43,38,40,43,41,40]
    .map(root=>[root,root+7,root+12,root+15,root+19]);
  const METAL_PHRASES=[
    {steps:[4,2,1,0],beats:[0,.5,1,1.5],length:.42},
    {steps:[0,0,2,4,2],beats:[0,.25,.5,1,1.5],length:.3},
    {steps:[0,1,2,4],beats:[0,.5,1,2],length:.8},
    {steps:[0,2,0,1,2,0],beats:[0,.25,.75,1,1.5,2],length:.32},
    {steps:[2,4,2,1,0],beats:[0,.25,.5,1,1.5],length:.4},
    {steps:[4,2,4,1],beats:[0,.75,1.5,2.5],length:.7}
  ];
  // Original airborne waltz: a wistful minor opening opens into E-flat major.
  const SKY_CHORDS=[
    [36,43,48,51,58],[32,39,44,48,55],[39,46,51,55,62],[34,41,46,50,55],
    [36,43,48,51,58],[41,48,53,56,60],[32,39,44,48,55],[31,38,43,47,53],
    [39,46,51,55,62],[34,41,46,50,57],[32,39,44,48,55],[34,41,46,50,55],
    [36,43,48,51,58],[32,39,44,48,55],[31,38,43,47,53],[36,43,48,51,58]
  ];
  const SKY_PHRASES=[
    {steps:[4,3,2,0],beats:[0,.5,1.5,2],length:1},
    {steps:[0,2,4,3,2],beats:[0,.5,1,1.5,2.5],length:.7},
    {steps:[0,1,2,4],beats:[0,1,2,3],length:1.3},
    {steps:[0,2,1,3,2],beats:[0,.5,1.5,2,3],length:.85},
    {steps:[2,4,3,2,1,0],beats:[0,.5,1,1.5,2,2.5],length:.75},
    {steps:[2,4,3,1],beats:[0,1,2,3],length:1.4}
  ];
  const PLATFORM_CHORDS=[
    [36,43,48,52,57],[33,40,45,48,55],[41,48,53,57,60],[43,50,55,59,65],
    [36,43,48,52,57],[40,47,52,55,62],[41,48,53,57,60],[43,50,55,59,65],
    [33,40,45,48,55],[38,45,50,53,60],[41,48,53,57,60],[43,50,55,59,65],
    [36,43,48,52,57],[41,48,53,57,60],[43,50,55,59,65],[36,43,48,52,57]
  ];
  const PLATFORM_PHRASES=[
    {steps:[4,2,3,0],beats:[0,.25,.75,1.25],length:.24},
    {steps:[0,2,4,5,4],beats:[0,.25,.5,1,1.5],length:.26},
    {steps:[0,1,2,4],beats:[0,.5,1,1.5],length:.4},
    {steps:[0,2,1,3,0],beats:[0,.25,.75,1,1.5],length:.28},
    {steps:[4,3,2,1,2,0],beats:[0,.25,.5,.75,1.25,1.5],length:.25},
    {steps:[2,4,1,3],beats:[0,.5,1,1.75],length:.45}
  ];
  const TCHAIKOVSKY_CHORDS=[
    [38,45,50,53,57],[33,40,45,49,55],[38,45,50,53,57],[43,50,55,58,62],
    [34,41,46,50,57],[40,47,52,55,58],[33,40,45,49,55],[38,45,50,53,57],
    [41,48,53,57,60],[36,43,48,52,58],[34,41,46,50,57],[33,40,45,49,55],
    [38,45,50,53,57],[43,50,55,58,62],[33,40,45,49,55],[38,45,50,53,57]
  ];
  const TCHAIKOVSKY_PHRASES=[
    {steps:[4,3,2,1,0],beats:[0,.5,1,2,3],length:1},
    {steps:[0,2,4,3,2],beats:[0,.5,1.5,2,3],length:.8},
    {steps:[0,1,2,4],beats:[0,1,2,3],length:1.4},
    {steps:[0,2,1,3,2],beats:[0,.5,1.5,2,3],length:1},
    {steps:[4,3,2,1,2,0],beats:[0,.5,1,1.5,2.5,3],length:.7},
    {steps:[2,4,3,1],beats:[0,1,2,3],length:1.5}
  ];
  const MOONLIGHT_CHORDS=[
    [38,45,50,54,61],[37,44,49,52,57],[35,42,47,50,57],[33,40,45,49,55],
    [31,38,43,47,54],[38,45,50,54,59],[40,47,52,55,59],[33,40,45,49,55],
    [31,38,43,47,54],[33,40,45,49,55],[30,37,42,45,52],[35,42,47,50,57],
    [31,38,43,47,54],[33,40,45,49,55],[38,45,50,54,61],[38,45,50,54,57]
  ];
  const MOONLIGHT_PHRASES=[
    {steps:[3,2,1,0],beats:[0,.5,1.5,2.5],length:1},
    {steps:[0,2,3,2,1],beats:[0,.5,1.5,2,3],length:.8},
    {steps:[0,1,2,3],beats:[0,1,2,3],length:1.3},
    {steps:[0,2,1,3,2],beats:[0,.5,1.5,2.5,3],length:.85},
    {steps:[3,2,1,2,0],beats:[0,.5,1,2,3],length:.9},
    {steps:[2,3,1,0],beats:[0,1,2,3],length:1.25}
  ];
  // A short, repeating minor-key vamp rather than a developing song progression.
  const BOUNCE_CHORDS=Array.from({length:16},(_,bar)=>[
    [36,43,48,51,55],[39,46,51,55,58],[41,48,53,56,60],[31,38,43,47,50]
  ][bar%4]);
  const BOUNCE_PHRASES=[
    {steps:[0,0,1,0],beats:[0,.5,1.25,1.75],length:.4},
    {steps:[0,0,1,0,2],beats:[0,.25,.75,1.5,2],length:.32},
    {steps:[1,1,0,1],beats:[0,.75,1.5,2.5],length:.55},
    {steps:[0,2,0,0,1],beats:[0,.5,.75,1.5,2.25],length:.35},
    {steps:[1,0,0,1,0],beats:[0,.25,.75,1.25,2],length:.35},
    {steps:[2,0,2,0],beats:[0,.75,1.75,2.5],length:.6}
  ];
  // One D-pentatonic pitch collection, voiced around different resting tones.
  const GAOSHAN_CHORDS=[[38,45,52,54,59],[35,42,50,52,57],[40,47,50,54,57],[45,52,54,59,62]];
  const GAOSHAN_PHRASES=[
    {steps:[4,3,2,1,0],beats:[0,.25,.5,1.5,3],length:1.6},
    {steps:[0,1,2,3,4,2],beats:[0,.25,.5,.75,1.5,2.5],length:1.3},
    {steps:[0,1,2,4],beats:[0,1.5,2.5,4],length:2},
    {steps:[0,2,1,3,2],beats:[0,.5,1.5,2.5,3.5],length:1.6},
    {steps:[4,3,2,1,0,2,1],beats:[0,.25,.5,.75,1,2,3],length:1.2},
    {steps:[2,4,3,1],beats:[0,1.5,3,4.5],length:2.2}
  ];
  const ROCK_CHORDS=[
    [40,47,52,55,64],[36,43,48,52,60],[31,38,43,47,55],[38,45,50,54,62],
    [40,47,52,55,64],[36,43,48,52,60],[33,40,45,48,57],[35,42,47,51,57]
  ];
  const CLASSICAL_CHORDS=[
    [36,43,48,52,60],[41,48,53,57,65],[38,45,50,53,62],[31,38,43,47,55],
    [33,40,45,48,57],[38,45,50,53,62],[31,38,43,47,53],[36,43,48,52,60]
  ];
  const BACH_CHORDS=[
    [48,55,60,64,72],[48,57,62,65,69],[47,55,62,65,71],[48,55,60,64,72]
  ];
  // The Nocturne changes harmony inside its 12/8 bars, including two
  // diminished colours. Its discoveries follow these changes, not just E-flat.
  const CHOPIN_CHORDS=[
    [51,55,58],[47,50,53,56],[51,55,58],[48,52,55,58],[41,46,49,52],[41,48,56]
  ];
  // Original, single-line piano phrases: falling drops, a flare, a gentle
  // ascent, a bloom, a weave, and an orbit. Steps move through the active
  // chord's piano voicing; rests leave room for the unchanged accompaniment.
  const PIANO_PHRASES={
    bach:[
      {steps:[3,2,1,0,-1],beats:[0,.25,.75,1.25,2],gates:[.18,.22,.25,.4,.65]},
      {steps:[-1,0,2,3,1,0],beats:[0,.25,.5,.75,1.5,2],gates:[.2,.2,.2,.4,.3,.65]},
      {steps:[0,1,2,3],beats:[0,.75,1.5,2.5],gates:[.5,.5,.65,.75]},
      {steps:[-1,1,0,2,0],beats:[0,.5,.75,1.5,2.25],gates:[.35,.2,.45,.55,.65]},
      {steps:[0,2,1,3,2,0,1],beats:[0,.25,.5,.75,1.25,1.5,2.25],gates:[.2,.2,.2,.35,.2,.3,.65]},
      {steps:[1,2,0,1,-1],beats:[0,.75,1.25,2,2.75],gates:[.5,.3,.5,.5,.75]}
    ],
    chopin:[
      {steps:[3,2,1,0,-1],beats:[0,1/3,2/3,4/3,2],gates:[.24,.24,.38,.45,.6]},
      {steps:[-1,0,1,3,2,0],beats:[0,1/6,1/3,2/3,1,5/3],gates:[.12,.12,.23,.28,.4,.6]},
      {steps:[0,1,2,3],beats:[0,2/3,4/3,2],gates:[.45,.45,.5,.6]},
      {steps:[0,2,1,0,-1],beats:[0,1/3,2/3,4/3,2],gates:[.22,.22,.4,.45,.6]},
      {steps:[-1,1,0,2,1,3,1,0],beats:[0,1/6,1/3,2/3,5/6,1,5/3,2],gates:[.12,.12,.25,.12,.12,.4,.23,.55]},
      {steps:[1,2,0,1,-1],beats:[0,.5,1,1.5,2],gates:[1/3,1/3,1/3,1/3,2/3]}
    ]
  };
  const THEMES={
    default:{name:'Default',bpm:84,swing:.5,chords:CHORDS,octave:0,cueGain:1,loopBeats:64,variations:3},
    jazz:{name:'Jazz',bpm:104,swing:.62,chords:JAZZ_CHORDS,octave:12,cueGain:.85,loopBeats:64,variations:3,
      hidden:true,voices:['vibes','piano','clarinet','guitar','keys','vibes']},
    rock:{name:'Rock',bpm:120,swing:.5,chords:ROCK_CHORDS,octave:0,cueGain:.7,loopBeats:64,variations:3,
      hidden:true,voices:['electricLead','electric','organ','palmMute','electricHarmonic','electricLead']},
    classical:{name:'Classical',bpm:92,swing:.5,chords:CLASSICAL_CHORDS,octave:12,cueGain:.85,loopBeats:64,variations:3,
      hidden:true,voices:['celesta','piano','oboe','pizzicato','harp','strings']},
    bach:{name:'Bach',bpm:88,swing:.5,chords:BACH_CHORDS,cueGain:.48,subdivision:4,register:64,variations:3,loopBeats:32,
      harmony:{beats:16,changes:[0,4,8,12]},voices:Array(6).fill('grand'),motifs:PIANO_PHRASES.bach},
    chopin:{name:'Chopin',bpm:44,swing:.5,chords:CHOPIN_CHORDS,cueGain:.48,entranceBeats:1,subdivision:6,register:63,variations:3,loopBeats:32,
      harmony:{beats:8,changes:[0,4/3,2,4,6,7]},voices:Array(6).fill('grand'),motifs:PIANO_PHRASES.chopin},
    brubeck:{name:'Brubeck',bpm:132,swing:.5,beatsPerBar:5,chords:BRUBECK_CHORDS,octave:12,cueGain:.62,echoGain:.035,
      loopBeats:80,variations:3,voices:['grand','grand','alto','grand','grand','alto'],motifs:BRUBECK_PHRASES},
    metal:{name:'Metal',bpm:152,swing:.5,chords:METAL_CHORDS,octave:0,cueGain:.85,echoGain:.025,
      loopBeats:64,variations:3,voices:Array(6).fill('metalLead'),motifs:METAL_PHRASES},
    sky:{name:'Sky Castle',bpm:96,swing:.5,beatsPerBar:3,chords:SKY_CHORDS,octave:12,cueGain:.75,echoGain:.07,
      loopBeats:48,variations:3,voices:['celesta','harp','flute','grand','harp','flute'],motifs:SKY_PHRASES},
    platformer:{name:'Platformer',bpm:144,swing:.5,chords:PLATFORM_CHORDS,octave:12,cueGain:.78,echoGain:.025,
      loopBeats:64,variations:3,voices:['chipPulse','chipBright','chipPulse','chipBright','chipPulse','chipBright'],motifs:PLATFORM_PHRASES},
    tchaikovsky:{name:'Tchaikovsky',bpm:126,swing:.5,beatsPerBar:3,chords:TCHAIKOVSKY_CHORDS,octave:12,cueGain:.8,echoGain:.04,
      loopBeats:48,variations:3,voices:['celesta','grand','oboe','strings','harp','flute'],motifs:TCHAIKOVSKY_PHRASES},
    moonlight:{name:'Moonlight Ballad',bpm:78,swing:.5,chords:MOONLIGHT_CHORDS,octave:12,cueGain:.8,echoGain:.04,
      loopBeats:64,variations:3,voices:['grand','guitar','flute','grand','guitar','clarinet'],motifs:MOONLIGHT_PHRASES},
    bounce:{name:'Bounce',bpm:102,swing:.54,chords:BOUNCE_CHORDS,octave:12,cueGain:.9,echoGain:.02,
      loopBeats:64,variations:3,voices:['clav','keys','clav','wood','keys','clav'],motifs:BOUNCE_PHRASES},
    gaoshan:{name:'高山流水',bpm:84,swing:.5,chords:GAOSHAN_CHORDS,octave:12,cueGain:1,echoGain:.025,chromaticApproaches:false,
      loopBeats:64,variations:3,voices:Array(6).fill('zheng'),motifs:GAOSHAN_PHRASES}
  };
  const PLAYABLE_THEMES=Object.freeze(["default","brubeck","metal","sky","platformer","tchaikovsky","moonlight","bounce","gaoshan","bach","chopin"]);
  const themeFor=id=>Object.hasOwn(THEMES,id)?THEMES[id]:THEMES.default;
  function grooveBeat(beat,theme='default'){
    const whole=Math.floor(beat),part=beat-whole,swing=themeFor(theme).swing;
    return whole+(part<.5?part*2*swing:swing+(part-.5)*2*(1-swing));
  }
  function straightBeat(beat,theme='default'){
    const whole=Math.floor(beat),part=beat-whole,swing=themeFor(theme).swing;
    return whole+(part<swing?part/(2*swing):.5+(part-swing)/(2*(1-swing)));
  }
  const instruments={
    metalMute:[[1,1]],metalOpen:[[1,1]],metalLead:[[1,1]],
    chipPulse:[[1,1],[3,1/3],[5,1/5],[7,1/7],[9,1/9]],
    chipBright:[[1,1],[2,.7],[3,1/3],[5,-1/5],[6,-.23],[7,-1/7]],
    chipBass:[[1,1],[3,-1/9],[5,1/25],[7,-1/49]],
    clav:[[1,1],[2,.52],[3,.27],[4,.18],[5,.09],[7,.035]],
    zheng:[[1,1]],
    pad:[[1,1],[2,.16],[3,.05]],
    bass:[[1,1],[2,.18]],
    glass:[[1,1],[2.01,.28],[3.98,.08]],
    sparkle:[[1,1],[2,.32],[4,.12]],
    flute:[[1,1],[2,.10],[3,.04]],
    wood:[[1,1],[3,.22],[7,.035]],
    harp:[[1,1],[2,.26],[3,.12]],
    bell:[[1,1],[2.003,.35],[3.01,.08]],
    piano:[[1,1],[2,.28],[3,.15],[4,.07],[6,.025]],
    keys:[[1,1],[2,.34],[3,.07],[4.01,.035]],
    upright:[[1,1],[2,.38],[3,.13],[4,.04]],
    vibes:[[1,1],[2.002,.22],[4.01,.045]],
    clarinet:[[1,1],[3,.16],[5,.045]],
    alto:[[1,1],[2,.38],[3,.23],[4,.12],[5,.075],[6,.035],[7,.018]],
    guitar:[[1,1],[2,.18],[3,.12],[4,.025]],
    electric:[[1,.8],[2,.42],[3,.3],[4,.16],[5,.11],[7,.055]],
    electricLead:[[1,1],[2,.32],[3,.24],[4,.1],[5,.065]],
    electricBass:[[1,1],[2,.32],[3,.16],[4,.055]],
    palmMute:[[1,1],[2,.55],[3,.26],[4,.11],[6,.04]],
    electricHarmonic:[[1,1],[2,.13],[3,.075],[4,.02]],
    organ:[[1,1],[2,.25],[3,.2],[4,.1]],
    strings:[[.997,.5],[1.003,.5],[2,.24],[3,.11],[4,.045]],
    horn:[[1,1],[2,.44],[3,.23],[4,.09],[5,.035]],
    cello:[[1,1],[2,.3],[3,.15],[4,.06]],
    oboe:[[1,1],[2,.12],[3,.18],[5,.055]],
    pizzicato:[[1,1],[2,.22],[3,.14],[4,.06]],
    celesta:[[1,1],[2.004,.18],[3.99,.045]],
    grand:[[1,1],[2.001,.36],[3.002,.18],[4.004,.085],[5.006,.04],[7.01,.015]],
    feltPiano:[[1,1],[2.001,.2],[3.002,.08],[4.004,.035]]
  };
  // Melodies use chord degrees and beat subdivisions, rather than fixed
  // pitches or seconds. They follow the accompaniment even across bar lines.
  const tunes=[
    {voice:'glass',steps:[7,6,5,4,3,2],beats:[0,.5,1,1.5,2,2.5],length:1},
    {voice:'sparkle',steps:[0,2,4,5,6,7,4,6],beats:[0,.25,.5,.75,1,1.5,1.5,1.5],length:1.25},
    {voice:'flute',steps:[2,3,4,5,6],beats:[0,.5,1,1.75,2.5],length:1},
    {voice:'wood',steps:[0,1,2,4,2,5,4],beats:[0,.5,1,1.75,2.25,2.75,3.25],length:.75},
    {voice:'harp',steps:[4,5,6,7,6,5,4,3,2],beats:[0,.25,.5,.75,1,1.25,1.5,1.75,2],length:1},
    {voice:'bell',steps:[4,6,5,7,6,3],beats:[0,.75,1.5,2.25,3,3.75],length:1.5}
  ];
  const tuneFor=(id,theme)=>themeFor(theme).motifs?.[id]||tunes[id];

  const PIANO_RELEASE=.42;
  function pianoNote(buffer,midi,start,duration,volume,voice,pan,wrap,velocity){
    const rate=buffer.sampleRate,hz=440*2**((midi-69)/12),offset=Math.round(start*rate);
    const end=duration+PIANO_RELEASE,count=Math.ceil(end*rate),soft=voice==='feltPiano';
    const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
    const l=Math.sqrt((1-pan)/2)*volume,r=Math.sqrt((1+pan)/2)*volume;
    // A hammer attack, independently decaying partials, a second unison
    // string, and damped release give short notes a natural piano tail.
    const partials=[...instruments[voice],[1.0009,.16]].filter(([ratio])=>ratio*hz<rate*.45);
    const tones=partials.map(([ratio,weight])=>{
      const step=TAU*hz*ratio/rate,falloff=.75+hz/1600+(ratio-1)*(soft?1.7:1.3);
      weight*=Math.pow(.45+.75*velocity,Math.log2(ratio));
      return {sin:0,cos:1,stepSin:Math.sin(step),stepCos:Math.cos(step),weight,decay:Math.exp(-falloff*(1.2-.3*velocity)/rate)};
    });
    for(let i=0;i<count;i++){
      const t=i/rate,index=wrap?((offset+i)%buffer.length+buffer.length)%buffer.length:offset+i;
      if(index>=buffer.length)break;
      const envelope=Math.min(1,t/(soft?.009-velocity*.004:.005-velocity*.0025))*Math.exp(-Math.max(0,t-duration)/.065)*Math.min(1,(end-t)/.025);
      let value=0;
      for(const tone of tones){
        value+=tone.sin*tone.weight;
        const next=tone.sin*tone.stepCos+tone.cos*tone.stepSin;
        tone.cos=tone.cos*tone.stepCos-tone.sin*tone.stepSin;tone.sin=next;tone.weight*=tone.decay;
      }
      value*=envelope;left[index]+=value*l;right[index]+=value*r;
    }
  }

  // Driven string partials through a simple cabinet low-pass. Separate voices
  // keep the approved quartet and piano rendering byte-for-byte unchanged.
  function metalNote(buffer,midi,start,duration,volume,voice,pan,wrap,velocity){
    const rate=buffer.sampleRate,hz=440*2**((midi-69)/12),offset=Math.round(start*rate);
    const muted=voice==='metalMute',lead=voice==='metalLead',count=Math.ceil(duration*rate);
    const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
    const l=Math.sqrt((1-pan)/2)*volume,r=Math.sqrt((1+pan)/2)*volume;
    let filtered=0;
    for(let i=0;i<count;i++){
      const t=i/rate,at=wrap?(offset+i)%buffer.length:offset+i;if(at>=buffer.length)break;
      const vibrato=lead?.0018*Math.max(0,t-.12)*Math.sin(TAU*5.5*t):0;
      const phase=TAU*hz*(t+vibrato),pick=Math.exp(-t/.018);
      let string=0;
      for(let h=1;h<=8&&h*hz<rate*.38;h++)string+=Math.sin(phase*h)*Math.exp(-t*h*(muted?8:1.3))/h;
      const driven=Math.tanh(string*(3.2+velocity)+pick*.12*Math.sin(TAU*1900*t));
      filtered+=.42*(driven-filtered);
      const envelope=Math.min(1,t/.0025)*Math.min(1,(duration-t)/.025)*Math.exp(-t*(muted?14:lead?1.2:2.4));
      left[at]+=filtered*envelope*l;right[at]+=filtered*envelope*r;
    }
  }

  // A fractional-delay plucked string, with a damped bridge reflection and
  // small left-hand pressure bend. The delay loop supplies the ringing decay.
  function zhengNote(buffer,midi,start,duration,volume,pan,wrap,velocity){
    const rate=buffer.sampleRate,hz=440*2**((midi-69)/12),period=rate/hz;
    const size=Math.ceil(period*1.1)+3,string=new Float64Array(size);
    let seed=(midi*7919+17)>>>0,mean=0;
    for(let i=0;i<size;i++){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      string[i]=(seed/2147483648-1)*.65+Math.sin(TAU*i/period)*.55;
      mean+=string[i];
    }
    for(let i=0;i<size;i++)string[i]-=mean/size;
    const left=buffer.getChannelData(0),right=buffer.getChannelData(1),offset=Math.round(start*rate);
    const count=Math.ceil(duration*rate),l=Math.sqrt((1-pan)/2)*volume,r=Math.sqrt((1+pan)/2)*volume;
    const feedback=Math.exp(-1/(hz*(midi<60?2.2:1.35)));
    let cursor=0,previous=0,body=0,delay=period-.35;
    for(let i=0;i<count;i++){
      const t=i/rate,at=wrap?(offset+i)%buffer.length:offset+i;if(at>=buffer.length)break;
      if(i%64===0){
        const pressure=Math.max(0,t-.18),bend=.009*(1-Math.exp(-pressure*6))*Math.exp(-pressure*1.7)+.0015*Math.sin(TAU*4.8*t)*Math.min(1,pressure*2);
        delay=period/(1+bend)-.35;
      }
      const read=(cursor-delay+size)%size,lo=Math.floor(read),fraction=read-lo;
      const sample=string[lo]*(1-fraction)+string[(lo+1)%size]*fraction;
      string[cursor]=(.65*sample+.35*previous)*feedback;previous=sample;cursor=(cursor+1)%size;
      body+=.055*(sample-body);
      const envelope=Math.min(1,t/.002)*Math.min(1,(duration-t)/.08);
      const value=(sample*.95+body*.2)*envelope*(.7+.45*velocity);
      left[at]+=value*l;right[at]+=value*r;
    }
  }

  function note(buffer,midi,start,duration,volume,voice='glass',pan=0,wrap=false,velocity=.7){
    velocity=clamp(velocity,0,1);
    if(voice==='zheng')return zhengNote(buffer,midi,start,duration,volume,pan,wrap,velocity);
    if(voice.startsWith('metal'))return metalNote(buffer,midi,start,duration,volume,voice,pan,wrap,velocity);
    if(voice==='grand'||voice==='feltPiano')return pianoNote(buffer,midi,start,duration,volume,voice,pan,wrap,velocity);
    const rate=buffer.sampleRate,offset=Math.round(start*rate),count=Math.ceil(duration*rate);
    const hz=440*2**((midi-69)/12),partials=instruments[voice].filter(([ratio])=>ratio*hz<rate*.45);
    const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
    const l=Math.sqrt((1-pan)/2)*volume,r=Math.sqrt((1+pan)/2)*volume;
    const sustained=voice==='pad'||voice==='flute'||voice==='bass'||voice==='clarinet'||
      voice==='electric'||voice==='electricLead'||voice==='organ'||voice==='strings'||voice==='cello'||voice==='oboe'||voice==='alto'||voice==='horn'||voice.startsWith('chip');
    const attack=voice.startsWith('chip')?.003:voice==='pad'?.35:voice==='flute'?.065:voice==='clarinet'?.04:
      voice==='horn'?.1:voice==='strings'?.12:voice==='cello'?.09:voice==='oboe'?.065:voice==='alto'?.045:voice==='organ'||voice==='electricLead'?.02:.008;
    // Advance sine phases and decay by recurrence, keeping buffer generation
    // light enough for the first tap on a phone.
    const tones=partials.map(([ratio,weight])=>{
      const step=TAU*hz*ratio/rate;
      weight*=Math.pow(.45+.75*velocity,Math.log2(ratio));
      return {sin:0,cos:1,step,stepSin:Math.sin(step),stepCos:Math.cos(step),weight,decay:Math.exp(-(ratio-1)*.6/(duration*rate))};
    });
    const decayStep=Math.exp(-(sustained?.8:4.8)/(duration*rate));let decay=1;
    for(let i=0;i<count;i++){
      const t=i/rate,index=wrap?(offset+i)%buffer.length:offset+i;
      if(index>=buffer.length)break;
      if(voice==='alto'&&i%64===0){
        const bend=-.006*Math.exp(-t/.04)+.0022*Math.min(1,Math.max(0,(t-.14)/.25))*Math.sin(TAU*5.2*t);
        for(const tone of tones){tone.stepSin=Math.sin(tone.step*(1+bend));tone.stepCos=Math.cos(tone.step*(1+bend));}
      }
      const envelope=Math.min(1,t/attack)*Math.min(1,(duration-t)/(voice.startsWith('chip')?.018:sustained?.25:.12))*decay;
      let value=0;
      for(const tone of tones){
        value+=tone.sin*tone.weight;
        const next=tone.sin*tone.stepCos+tone.cos*tone.stepSin;
        tone.cos=tone.cos*tone.stepCos-tone.sin*tone.stepSin;tone.sin=next;tone.weight*=tone.decay;
      }
      decay*=decayStep;
      value*=envelope;left[index]+=value*l;right[index]+=value*r;
    }
  }

  function percussion(buffer,start,duration,volume,ride=false){
    const rate=buffer.sampleRate,offset=Math.round(start*rate),count=Math.ceil(duration*rate);
    const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
    let seed=(offset+7919)>>>0,previous=0,decay=1;
    const falloff=Math.exp(-(ride?5:7)/count);
    for(let i=0;i<count;i++){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const white=seed/2147483648-1,high=white-previous*.8,t=i/rate;previous=white;
      const metal=ride?(Math.sin(TAU*2180*t)+Math.sin(TAU*3077*t)*.4+Math.sin(TAU*4811*t)*.22)*.45:0;
      const value=(high*(ride?.15:.6)+metal)*volume*decay*Math.min(1,t/.003);
      const index=(offset+i)%buffer.length;left[index]+=value*.58;right[index]+=value*.82;decay*=falloff;
    }
  }

  function rockDrum(buffer,start,duration,volume,kind){
    const rate=buffer.sampleRate,offset=Math.round(start*rate),count=Math.ceil(duration*rate);
    const left=buffer.getChannelData(0),right=buffer.getChannelData(1),pan=kind==='hat'?.4:kind==='snare'?-.08:0;
    const l=Math.sqrt((1-pan)/2)*volume,r=Math.sqrt((1+pan)/2)*volume;
    let seed=(offset+3571)>>>0,previous=0;
    for(let i=0;i<count;i++){
      const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const white=seed/2147483648-1,high=white-previous*.85;previous=white;
      let value;
      if(kind==='kick')value=Math.sin(TAU*(48*t+3*(1-Math.exp(-30*t))))*Math.exp(-18*t)+high*.045*Math.exp(-90*t);
      else if(kind==='snare')value=high*.65*Math.exp(-24*t)+Math.sin(TAU*180*t)*.3*Math.exp(-35*t);
      else value=high*.48*Math.exp(-70*t);
      value*=Math.min(1,t/.002)*Math.min(1,(duration-t)/.015);
      const index=(offset+i)%buffer.length;left[index]+=value*l;right[index]+=value*r;
    }
  }

  function quartetDrum(buffer,start,duration,volume,voice){
    const rate=buffer.sampleRate,offset=Math.round(start*rate),count=Math.ceil(duration*rate);
    const left=buffer.getChannelData(0),right=buffer.getChannelData(1),pan=voice==='ride'?.35:voice==='snare'?-.18:0;
    const l=Math.sqrt((1-pan)/2)*volume,r=Math.sqrt((1+pan)/2)*volume;
    let seed=(offset+5407)>>>0,previous=0;
    for(let i=0;i<count;i++){
      const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const noise=seed/2147483648-1,high=noise-previous*.7;previous=noise;
      let value;
      if(voice==='ride')value=(Math.sin(TAU*3660*t)+.43*Math.sin(TAU*5271*t)+.19*Math.sin(TAU*8537*t))*.32*Math.exp(-15*t)+high*.14*Math.exp(-30*t);
      else if(voice==='snare')value=high*.5*Math.exp(-22*t)+Math.sin(TAU*176*t)*.16*Math.exp(-32*t);
      else if(voice==='kick')value=Math.sin(TAU*(47*t+1.8*(1-Math.exp(-35*t))))*Math.exp(-23*t);
      else value=high*.3*Math.exp(-42*t);
      value*=Math.min(1,t/.003)*Math.min(1,(duration-t)/.02);
      const at=(offset+i)%buffer.length;left[at]+=value*l;right[at]+=value*r;
    }
  }

  function gaoshanScore(){
    const score=[],scale=[50,52,54,57,59,62,64,66,69,71,74,76,78,81];
    const play=(midi,beat,duration,volume,pan=0,role='melody')=>score.push({midi,beat,duration,volume,voice:'zheng',pan,role,velocity:.72});
    const mountain=[[[62,0,2.8],[69,3,.9]],[[66,.5,2],[64,3,1]],[[59,0,2.5],[62,3,1]],[[57,0,3.5]]];
    for(let bar=0;bar<16;bar++){
      const start=bar*4,water=bar>=4&&bar<12,rush=bar>=8&&bar<12;
      play([38,35,40,45][bar%4],start,3.8,water?.09:.13,-.3,'lowString');
      if(!water){
        for(const [m,at,gate]of mountain[bar%4])play(m,start+at,gate,bar>=12?.09:.13,.14);
        if(bar%4===2)play(74,start+1.5,1.8,.055,.3,'harmonic');
      }else{
        const contour=bar%2?[7,6,4,5,3,4,2,1]:[2,4,3,5,4,6,7,5];
        contour.forEach((degree,i)=>play(scale[degree+(rush?2:0)],start+i*.5,1.2,rush?.095:.085,(i/7-.5)*.45,'flow'));
        if(rush)for(let i=0;i<6;i++)play(scale[9-i],start+2.5+i*.25,.9,.045,-.3+i*.12,'sweep');
      }
      if(bar===3||bar===11)for(let i=0;i<8;i++)play(scale[bar===3?i:10-i],start+2+i*.25,1.1,.052,-.4+i*.1,'sweep');
    }
    return score.sort((a,b)=>a.beat-b.beat);
  }

  function bounceScore(){
    const score=[];
    const play=(midi,beat,duration,volume,voice,pan=0,role='hook')=>{
      const pitch=nearestPitch(midi,harmonyAt('bounce',beat).chord);
      score.push({midi:pitch,beat,duration:harmonicGate(pitch,beat,duration,'bounce'),volume,voice,pan,role,velocity:.82});
    };
    const drum=(voice,beat,duration,volume)=>score.push({kind:'drum',voice,beat,duration,volume});
    for(let bar=0;bar<16;bar++){
      const start=bar*4,chord=BOUNCE_CHORDS[bar],breakdown=bar>=8&&bar<12;
      const tones=[chord[2]+12,chord[3]+12,chord[1]+12];
      // Repeated root punches and a clipped third/fifth answer, with the same rhythm.
      const degrees=bar%2?[0,0,2,0,1]:[0,0,1,0,2,0];
      const beats=bar%2?[.25,1,1.75,2.5,3.25]:[0,.75,1.25,2,2.75,3.5];
      degrees.forEach((degree,i)=>{
        if(breakdown&&i>1)return;
        play(tones[degree]-(breakdown?12:0),start+beats[i],i===degrees.length-1?.38:.28,i%2?.069:.084,'clav',.18);
      });
      const lowHits=breakdown?[0,2.5]:bar%2?[0,.75,2,2.75,3.5]:[0,1.5,2,3.25];
      lowHits.forEach((at,i)=>{
        play(i===lowHits.length-1?chord[1]:chord[0],start+at,.45,.14,'electricBass',0,'bass');
        drum('kick',start+at,.55,.2);
      });
      for(const at of[1,3]){
        drum('snare',start+at,.4,.14);
        if(bar>=12)drum('snare',start+at+.025,.18,.045);
      }
      for(let i=0;i<(breakdown?4:8);i++)drum('hat',start+i*(breakdown?1:.5),.18,i%2?.018:.029);
      if(bar%4===3)for(const at of[3.25,3.75])drum('hat',start+at,.12,.018);
      if(!breakdown)for(const at of[1.5,3])for(const m of[chord[3],chord[4]])
        play(m,start+at,.32,.023,'keys',-.3,'stab');
    }
    return score.sort((a,b)=>a.beat-b.beat);
  }

  function moonlightScore(){
    const score=[];
    const play=(midi,beat,duration,volume,voice,pan=0,role='harmony')=>{
      const pitch=nearestPitch(midi,harmonyAt('moonlight',beat).chord);
      score.push({midi:pitch,beat,duration:harmonicGate(pitch,beat,duration,'moonlight'),volume,voice,pan,role,velocity:.62});
    };
    // Original long-breathed phrases, with a gentle lift and a quiet final answer.
    const lines=[
      [[73,0,1.8],[69,2,.8],[66,3,.8]],[[68,0,1.3],[69,1.5,1.8]],
      [[74,0,1.3],[71,1.5,.8],[69,2.5,1.2]],[[67,0,1.8],[64,2,1.6]],
      [[66,0,.8],[71,1,1.3],[74,2.5,1.2]],[[73,0,1.8],[71,2,.8],[69,3,.8]],
      [[67,0,1.3],[71,1.5,1.8]],[[69,0,1.8],[64,2,1.6]],
      [[74,0,1.3],[78,1.5,1.8]],[[76,0,1.8],[73,2,.8],[69,3,.8]],
      [[73,0,1.3],[76,1.5,.8],[78,2.5,1.2]],[[74,0,1.8],[71,2,1.6]],
      [[74,0,1.3],[71,1.5,.8],[66,2.5,1.2]],[[69,0,1.8],[67,2,.8],[64,3,.8]],
      [[66,0,1.3],[73,1.5,1.8]],[[69,0,1.3],[66,1.5,.8],[62,2.5,1.2]]
    ];
    for(let bar=0;bar<16;bar++){
      const start=bar*4,chord=MOONLIGHT_CHORDS[bar],lift=bar>=8&&bar<12;
      play(chord[0],start,1.8,.095,'upright',-.12,'bass');
      play(chord[1],start+2,1.6,.065,'upright',-.12,'bass');
      const pattern=[chord[2],chord[1]+12,chord[3],chord[4],chord[3],chord[1]+12];
      pattern.forEach((m,i)=>play(m,start+[0,.5,1.5,2,2.5,3.5][i],1,.04,'guitar',i%2?.25:-.25,'arpeggio'));
      for(const at of[0,2])for(const [i,m]of chord.slice(2).entries())
        play(m,start+at,1.6,lift?.021:.014,'feltPiano',(i-1)*.25,'comp');
      lines[bar].forEach(([m,at,gate])=>play(m,start+at,gate,lift?.08:.07,bar>=12?'grand':'flute',.12,'melody'));
      if(lift)for(const [i,m]of chord.slice(2,4).entries())play(m,start,3.8,.019,'strings',i?.45:-.45,'strings');
      for(const at of[1,3])score.push({kind:'quartet',voice:'snare',beat:start+at,duration:.4,volume:.012});
    }
    return score.sort((a,b)=>a.beat-b.beat);
  }

  function tchaikovskyScore(){
    const score=[];
    const play=(midi,beat,duration,volume,voice,pan=0,role='harmony')=>{
      const pitch=nearestPitch(midi,harmonyAt('tchaikovsky',beat).chord);
      score.push({midi:pitch,beat,duration:harmonicGate(pitch,beat,duration,'tchaikovsky'),volume,voice,pan,role,velocity:.78});
    };
    // Original ballet-like waltz: a minor-key question, woodwind answers,
    // a brighter rising sequence, and a full-string return.
    const lines=[
      [[77,0,1.4],[81,1.5,.45],[74,2,.9]],[[73,0,.9],[76,1,.9],[79,2,.9]],
      [[81,0,1.4],[77,1.5,.45],[74,2,.9]],[[79,0,1.9],[82,2,.9]],
      [[81,0,.9],[77,1,.9],[74,2,.9]],[[79,0,1.4],[76,1.5,1.4]],
      [[73,0,.9],[76,1,.9],[79,2,.9]],[[77,0,1.9],[74,2,.9]],
      [[81,0,.9],[84,1,.9],[89,2,.9]],[[88,0,1.4],[86,1.5,.45],[84,2,.9]],
      [[86,0,.9],[89,1,.9],[93,2,.9]],[[91,0,1.4],[85,1.5,.45],[88,2,.9]],
      [[89,0,1.4],[86,1.5,.45],[81,2,.9]],[[86,0,.9],[82,1,.9],[79,2,.9]],
      [[85,0,1.4],[79,1.5,.45],[76,2,.9]],[[77,0,1.9],[74,2,.9]]
    ];
    for(let bar=0;bar<16;bar++){
      const start=bar*3,chord=TCHAIKOVSKY_CHORDS[bar],answer=bar>=4&&bar<8;
      const lift=bar>=8&&bar<15?1.15+(bar-8)*.035:bar===15?.8:1;
      play(chord[0],start,1.7,.12*lift,'cello',-.22,'bass');
      for(const at of[1,2])for(const [i,midi]of chord.slice(1,4).entries())
        play(midi,start+at,.65,.035*lift,'strings',(i-1)*.4,'waltz');
      lines[bar].forEach(([midi,at,gate])=>{
        play(midi,start+at,gate,.087*lift,answer?'oboe':'strings',.14,'melody');
        if(bar>=8&&bar<15)play(midi-12,start+at,gate,.033*lift,'horn',-.3,'doubling');
      });
      if(answer)play(chord[4]+12,start+2,.8,.035,'flute',.35,'answer');
      if(bar>=8&&bar<15){
        for(let i=0;i<6;i++)play(chord[1+i%4]+12,start+i*.5,.6,.029*lift,'harp',i%2?.4:-.4,'arpeggio');
      }else for(const at of[.5,2.5])play(chord[2]+12,start+at,.65,.028,'harp',-.3,'arpeggio');
    }
    return score.sort((a,b)=>a.beat-b.beat);
  }

  function chipDrum(buffer,start,duration,volume,voice){
    const rate=buffer.sampleRate,offset=Math.round(start*rate),count=Math.ceil(duration*rate);
    const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
    let seed=0x5a37,noise=0;
    for(let i=0;i<count;i++){
      if(i%(voice==='snare'?9:3)===0){seed=(seed>>>1)|(((seed^(seed>>>1))&1)<<14);noise=(seed&1)?1:-1;}
      const t=i/rate,envelope=Math.min(1,t/.002)*Math.exp(-t*(voice==='snare'?35:75))*Math.min(1,(duration-t)/.008);
      const value=noise*envelope*volume,at=(offset+i)%buffer.length;
      left[at]+=value*.68;right[at]+=value*.72;
    }
  }

  function platformerScore(){
    const score=[];
    const play=(midi,beat,duration,volume,voice,pan=0,role='harmony')=>{
      const pitch=nearestPitch(midi,harmonyAt('platformer',beat).chord);
      score.push({midi:pitch,beat,duration:harmonicGate(pitch,beat,duration,'platformer'),volume,voice,pan,role,velocity:.75});
    };
    // An original hook with rests, offbeat answers, and a minor-key middle eight.
    const lines=[
      [[79,0],[81,.5],[76,1.25],[72,2],[79,3]],[[76,0],[72,.75],[79,1.5],[76,2.5]],
      [[77,0],[81,.5],[84,1.5],[81,2.25],[77,3]],[[79,0],[77,.75],[74,1.5],[71,2.5]],
      [[72,0],[76,.5],[81,1.25],[79,2],[76,3.25]],[[79,0],[83,.75],[78,1.5],[76,3]],
      [[81,0],[77,.5],[72,1.25],[77,2.5],[81,3]],[[74,0],[79,.75],[77,1.5],[71,3]],
      [[72,0],[76,1],[79,2.5]],[[77,0],[72,1],[74,2.5]],
      [[72,0],[77,1],[81,2.5]],[[79,0],[74,1],[71,2.5]],
      [[84,0],[81,.5],[79,1.25],[76,2],[79,3]],[[81,0],[77,.75],[72,1.5],[77,2.5]],
      [[79,0],[77,.5],[74,1.25],[71,2],[74,3]],[[76,0],[79,.75],[84,1.5]]
    ];
    for(let bar=0;bar<16;bar++){
      const start=bar*4,chord=PLATFORM_CHORDS[bar],bridge=bar>=8&&bar<12;
      for(let beat=0;beat<4;beat++){
        play(beat%2?chord[1]:chord[0],start+beat,.48,.105,'chipBass',0,'bass');
        // Two quick chord tones act as a second pulse-channel answer.
        for(const [at,index]of[[.5,3],[.75,1]])
          play(chord[index]+12,start+beat+at,.15,bridge?.025:.033,'chipBright',-.3,'comp');
        score.push({kind:'chip',voice:beat%2?'snare':'hat',beat:start+beat,duration:.3,volume:beat%2?.055:.023});
      }
      for(const [i,[midi,at]]of lines[bar].entries())
        play(midi,start+at,bridge?.65:i===lines[bar].length-1?.4:.26,bridge?.067:.074,'chipPulse',.2,'melody');
    }
    return score.sort((a,b)=>a.beat-b.beat);
  }

  function skyScore(){
    const score=[];
    const play=(midi,beat,duration,volume,voice,pan=0,role='harmony')=>{
      const pitch=nearestPitch(midi,harmonyAt('sky',beat).chord);
      score.push({midi:pitch,beat,duration:harmonicGate(pitch,beat,duration,'sky'),volume,voice,pan,role,
        velocity:role==='melody'?.75:.6,timeOffset:0});
    };
    const lines=[
      [[67,0,1.4],[70,1.5,.45],[63,2,.9]],[[72,0,1.8],[67,2,.9]],
      [[70,0,.9],[74,1,.9],[67,2,.9]],[[65,0,1.4],[62,1.5,1.4]],
      [[63,0,.9],[70,1,.9],[72,2,.9]],[[68,0,1.9],[65,2,.9]],
      [[67,0,.9],[72,1,1.9]],[[71,0,1.4],[65,1.5,.45],[67,2,.9]],
      [[79,0,1.4],[74,1.5,.45],[75,2,.9]],[[77,0,1.9],[74,2,.9]],
      [[75,0,.9],[79,1,.9],[72,2,.9]],[[77,0,1.4],[74,1.5,1.4]],
      [[75,0,1.4],[70,1.5,.45],[67,2,.9]],[[72,0,1.9],[67,2,.9]],
      [[65,0,.9],[71,1,.9],[67,2,.9]],[[63,0,2.7]]
    ];
    for(let bar=0;bar<16;bar++){
      const chord=SKY_CHORDS[bar],start=bar*3,soaring=bar>=8&&bar<12;
      const lift=soaring?1.3:bar>=12?.85:1;
      play(chord[0],start,2.85,.085*lift,'cello',-.22,'bass');
      for(const [i,midi]of chord.slice(1,4).entries())
        play(midi+12,start,2.85,.024*lift,'strings',(i-1)*.5,'strings');
      const arp=[chord[0]+12,chord[1]+12,chord[3]+12,chord[4]+12,chord[3]+12,chord[1]+12];
      arp.forEach((midi,i)=>play(midi,start+i*.5,.85,(i===0?.05:.035)*lift,'harp',i%2?.35:-.35,'arpeggio'));
      for(const [midi,at,gate]of lines[bar]){
        play(midi,start+at,gate,soaring?.071:.07,soaring?'strings':'flute',.12,'melody');
        if(soaring)play(midi-12,start+at,gate,.035,'horn',-.2,'counterline');
      }
      if(bar%4===0)play(chord[2]+24,start,1.3,.028,'celesta',.4,'sparkle');
      if(soaring)for(const at of[0,1,2])play(chord[1],start+at,.45,.035,'pizzicato',-.3,'pulse');
    }
    return score.sort((a,b)=>a.beat-b.beat);
  }

  function metalScore(){
    const score=[];
    const play=(midi,beat,duration,volume,voice,pan=0,role='riff')=>score.push({midi,beat,
      duration:harmonicGate(midi,beat,duration,'metal'),volume,voice,pan,role,velocity:.85});
    const drum=(voice,beat,duration,volume)=>score.push({kind:'drum',voice,beat,duration,volume});
    for(let bar=0;bar<16;bar++){
      const start=bar*4,root=METAL_CHORDS[bar][0],bridge=bar>=8&&bar<12;
      // A clipped pedal riff, a half-time open-chord bridge, then a denser return.
      const hits=bridge?[0,1.5,3]:bar%2?[0,.5,.75,1.5,2,2.5,3.25,3.5]:[0,.5,.75,1.25,2,2.5,2.75,3.5];
      for(const at of hits){
        const open=bridge||at===0||at===2,gate=bridge?1.25:open?.4:.19;
        for(const pan of[-.65,.65])for(const [interval,weight]of[[0,1],[7,.65],[12,.4]])
          play(root+interval,start+at,gate,.085*weight,open?'metalOpen':'metalMute',pan);
        play(root-12,start+at,bridge?.9:.24,.12,'electricBass',0,'bass');
        drum('kick',start+at,.55,open?.22:.15);
      }
      for(const at of bridge?[2]:[1,3])drum('snare',start+at,.65,.18);
      for(let i=0;i<8;i++)drum('hat',start+i*.5,.24,i%2?.03:.045);
      if(bar%4===3)for(const at of[3.25,3.5,3.75])drum('snare',start+at,.3,.08+(at-3)*.08);
      // Sparse high answers leave the foreground discoveries space to speak.
      if(bridge)for(const [at,interval]of[[.5,19],[2,15],[3.5,12]])
        play(root+interval,start+at,.85,.047,'metalLead',.12,'melody');
      else if(bar%2)for(const [at,interval]of[[1,12],[3,15]])
        play(root+interval,start+at,.38,.036,'metalLead',.12,'melody');
    }
    return score.sort((a,b)=>a.beat-b.beat);
  }

  function brubeckScore(){
    const score=[],theme='brubeck';
    function play(midi,beat,duration,volume,voice,pan,role,velocity=.64){
      const {chord}=harmonyAt(theme,beat),pitch=nearestPitch(midi,chord);
      const touch=.96+feel(beat*13+pitch)*.08;
      score.push({midi:pitch,beat,duration:harmonicGate(pitch,beat,duration,theme),volume:volume*touch,voice,pan,role,velocity,
        timeOffset:beat%1&&role!=='bass'?feel(beat+pitch)*.006:0});
    }
    const lines=[
      [[69,.5,.8],[65,1.5,.55],[64,2.5,.35],[62,3.5,1.15]],
      [[67,0,.8],[71,1,.45],[74,2,.65],[76,3.5,.85]],
      [[74,.5,.65],[71,1.5,.65],[67,3,1.35]],
      [[70,0,.5],[73,1,.65],[76,2.5,.4],[67,3.5,1.1]],
      [[69,.5,1.25],[65,2,.6],[64,3.5,1]],
      [[67,0,.7],[69,1.5,.5],[71,3,.7],[65,4,.55]],
      [[67,.5,.75],[70,1.5,.55],[74,3,1.35]],
      [[73,0,.65],[70,1.5,.55],[67,3,1.55]],
      [[69,0,.65],[72,1,.45],[76,2.5,.55],[79,3.5,1]],
      [[77,.5,.55],[74,1.5,.65],[72,3,.6],[69,4,.65]],
      [[74,0,.55],[77,1.5,.5],[81,3,.55],[77,4,.7]],
      [[76,.5,.75],[73,2,.65],[71,3.5,.95]],
      [[69,.5,.8],[65,1.5,.55],[64,2.5,.35],[62,3.5,1.15]],
      [[67,0,1.25],[71,1.5,.55],[76,3,1.35]],
      [[74,.5,.7],[70,1.5,.55],[67,3,1.35]],
      [[73,.5,.65],[70,1.5,.55],[67,3,1.65]]
    ];
    for(let bar=0;bar<16;bar++){
      const start=bar*5,chord=BRUBECK_CHORDS[bar],bridge=bar>=8&&bar<12,returning=bar>=12;
      const voicing=chord.slice(2).map(m=>m<53?m+12:m);
      // A clear 3+2 foundation, with syncopated block chords around it.
      for(const at of bridge?[0,1.5,3,4]:[0,.75,2,3,4.5]){
        if(!bridge&&bar%2&&at===2)continue;
        const strong=at===0||at===3;
        for(const midi of voicing)play(midi,start+at,strong?.65:.33,strong?.038:.026,'grand',-.26,'comp',strong?.78:.59);
      }
      for(const [at,midi,length]of[[0,chord[0],.85],[1.5,chord[1],.6],[3,chord[0]+12,.8],[4,chord[1],.55]]){
        play(midi,start+at,length,at===0?.14:.105,'upright',-.14,'bass',.68);
      }
      for(const [midi,at,length]of lines[bar]){
        play(midi,start+at,length,bridge?.067:returning?.073:.065,bridge?'grand':'alto',bridge?-.04:.24,'melody',bridge?.76:.66);
        if(bridge&&(at===0||at===3))play(midi-5,start+at,length,.021,'grand',.08,'counter',.64);
      }
      const drum=(voice,at,length,volume)=>score.push({kind:'quartet',voice,beat:start+at,duration:length,volume});
      for(let at=0;at<5;at++)drum('ride',at,.48,at===0||at===3?.022:.014);
      for(const at of[.5,3.5])drum('ride',at,.27,.007);
      for(const at of[0,3])drum('kick',at,.28,at===0?.062:.048);
      for(const at of[2,4.5])drum('snare',at,.2,bridge?.033:.025);
      for(const at of[1,4])drum('hat',at,.12,.018);
    }
    return score.sort((a,b)=>a.beat-b.beat);
  }

  function harmonyAt(theme,beat){
    const profile=themeFor(theme);
    if(profile.harmony)return pianoHarmony(beat,profile);
    const beats=profile.beatsPerBar??4,bar=Math.floor((beat+1e-8)/beats),chords=profile.chords;
    return {chord:chords[((bar%chords.length)+chords.length)%chords.length],end:(bar+1)*beats};
  }
  function nearestPitch(target,chord,previous=target){
    const candidates=chord.map(n=>n+12*Math.round((target-n)/12));
    return candidates.sort((a,b)=>(Math.abs(a-target)+.3*Math.abs(a-previous))-(Math.abs(b-target)+.3*Math.abs(b-previous)))[0];
  }
  // Keep common tones singing; release other notes before the harmony changes.
  function harmonicGate(midi,start,duration,theme){
    const end=start+duration;let cursor=start;
    while(cursor<end-1e-8){
      const h=harmonyAt(theme,cursor);
      if(!h.chord.some(n=>n%12===midi%12))return Math.max(.02,cursor-start-.045/(60/themeFor(theme).bpm));
      cursor=Math.min(end,h.end);
    }
    return duration;
  }
  function arrangementScore(theme='default'){
    const profile=themeFor(theme);
    if(theme==='brubeck')return brubeckScore();
    if(theme==='metal')return metalScore();
    if(theme==='sky')return skyScore();
    if(theme==='platformer')return platformerScore();
    if(theme==='tchaikovsky')return tchaikovskyScore();
    if(theme==='moonlight')return moonlightScore();
    if(theme==='bounce')return bounceScore();
    if(theme==='gaoshan')return gaoshanScore();
    if(profile.harmony)return composerScore(theme).map((n,i)=>{
      const phrase=.9+.1*Math.sin(Math.PI*(n.beat%8)/8);
      return {...n,volume:n.volume*phrase,velocity:.5+phrase*.18+(n.midi<52?.04:0),timeOffset:n.beat%1?feel(i+37)*.007:0,role:'score'};
    });
    const score=[],previous=new Map();
    function play(midi,beat,duration,volume,voice,pan=0,role='harmony'){
      const h=harmonyAt(theme,beat),key=`${role}:${voice}:${pan}`;
      const pitch=nearestPitch(midi,h.chord,role==='melody'?(previous.get(key)??midi):midi);
      previous.set(key,pitch);
      const arc=.86+.14*Math.sin(Math.PI*(beat%32)/32),touch=.94+feel(beat*7+midi)*.1;
      score.push({midi:pitch,beat,duration:harmonicGate(pitch,beat,duration,theme),volume:volume*arc*touch,voice,pan,role,
        velocity:clamp(.55+volume*1.6+(role==='melody'?.08:0),.35,.85),timeOffset:beat%1&&role!=='bass'?feel(beat+midi)*.009:0});
    }
    const drum=(voice,beat,duration,volume,kind='drum')=>score.push({kind,voice,beat,duration,volume:volume*(.94+feel(beat+17)*.08)});
    const defaultMelody=[[76,79,81,79],[72,76,79,76],[69,72,76,74],[71,74,79,74],[79,84,81,79],[76,79,72,76],[72,76,79,76],[74,79,76,72]];
    const jazzVoicings=[[53,60,64,69],[53,59,64,69],[52,59,62,67],[48,55,59,64],[53,60,64,69],[53,59,64,69],[55,62,67,71],[55,58,61,64]];
    const jazzBass=[[38,41,45,36],[31,35,38,41],[36,40,43,35],[33,36,40,43],[38,45,41,36],[31,38,35,41],[40,43,47,38],[33,37,40,43]];
    const jazzMelody=[[69,72,76,77,72],[71,69,67,64,65],[67,71,74,76,71],[72,71,69,67,64],[65,69,72,76,74],[69,67,65,64,62],[67,71,74,76,71],[73,70,69,67,61]];
    const rockMelody=[[76,79,83,79],[76,79,84,79],[74,79,83,79],[74,78,81,78],[79,83,88,83],[79,84,88,84],[76,81,84,81],[75,78,81,83]];
    const chamberMelody=[[76,72,67,72],[72,69,65,69],[69,77,74,69],[71,74,79,74],[76,72,69,72],[74,77,81,77],[79,77,74,71],[76,79,72,72]];
    for(let bar=0;bar<16;bar++){
      const b=bar%8,start=bar*4,B=bar>=8,chord=profile.chords[bar%profile.chords.length];
      if(theme==='default'||!Object.hasOwn(THEMES,theme)){
        chord.slice(1).forEach((midi,i)=>play(midi,start+i*.025,4.5,B?.021:.026,'pad',(i-1.5)*.3));
        play(chord[0],start,1.8,.105,'bass',-.12,'bass');play(chord[0]+12,start+2.5,1.3,.055,'bass',.12,'bass');
        const indices=B?(b%2?[0,2]:[0,2,3]):[0,1,2,3],positions=B?[.5,2,3.25]:[0,1.5,2.5,3.25];
        indices.forEach((index,i)=>{
          const midi=defaultMelody[b][index]-(B&&i===indices.length-1?12:0),at=start+positions[i];
          play(midi,at,B?1.1:1.35,i===0?.067:.048,B?'harp':'glass',i%2?.3:-.3,'melody');
          if(!B||i===0)play(midi,at+.5,.8,.012,B?'harp':'glass',i%2?-.42:.42,'echo');
        });
      }else if(theme==='jazz'){
        jazzBass[b].forEach((midi,i)=>{if(!B||i!==3||b%2)play(midi,start+i,.85,.12,'upright',-.18,'bass');});
        for(const [at,length,volume]of B?[[.5,1.4,.021],[2.5,.9,.018]]:[[0,1.2,.025],[1.5,.7,.019],[3,1.1,.023]]){
          jazzVoicings[b].forEach((midi,i)=>play(midi,start+at,length,volume,'keys',(i-1.5)*.12));
        }
        const indices=B?[0,2,4]:[0,1,2,3,4],positions=B?[.5,2,3.5]:[.5,1.5,2,2.5,3.5];
        indices.forEach((index,i)=>{
          const midi=jazzMelody[b][index]-(B?12:0),at=start+positions[i];
          play(midi,at,B?1:.85,i===0?.065:.049,B?'vibes':'piano',.24,'melody');
          if(i===0)play(midi,at+1,.65,.008,'piano',-.3,'echo');
        });
        for(const at of B?[0,1.5,2,3.5]:[0,1,1.5,2,3,3.5])drum('ride',start+at,.7,at%1?.006:.009,'brush');
        for(const at of[1,3])drum('brush',start+at,.65,B?.018:.024,'brush');
      }else if(theme==='rock'){
        for(const at of B?[0,2]:[0,.75,1.5,2,2.75,3.5]){
          const open=at===0||at===2;
          for(const midi of[chord[0]+12,chord[1]+12,chord[0]+24])play(midi,start+at,B?1.3:open?.65:.32,open?.032:.026,open?'electric':'palmMute',-.42);
        }
        for(const at of[.5,2.5])for(const midi of[chord[3]+12,chord[1]+12])play(midi,start+at,.65,.021,'electric',.42);
        (B?[0,1.5,2,3.5]:[0,.5,1.5,2,2.5,3.5]).forEach((at,i)=>play(i%3===2?chord[1]:chord[0],start+at,.42,.12,'electricBass',-.08,'bass'));
        const indices=B?[0,2]:[0,1,2,3],positions=B?[.5,2.5]:[.5,1.5,2.5,3.25];
        indices.forEach((index,i)=>play(rockMelody[b][index],start+positions[i],B?1.3:.75,B?.049:.045,B?'electricHarmonic':'electricLead',.15,'melody'));
        for(const at of B?[0,2.75]:[0,1.5,2,2.75])drum('kick',start+at,.65,.16);
        for(const at of B?[2]:[1,3])drum('snare',start+at,.6,.09);
        for(let i=0;i<8;i++)drum('hat',start+i*.5,.2,i%2?.023:.032);
      }else if(theme==='classical'){
        [chord[2],chord[3],chord[1]+12].forEach((midi,i)=>play(midi,start,4,B?.019:.024,'strings',(i-1)*.4));
        play(chord[0],start,B?3.8:1.9,.095,'cello',-.2,'bass');if(!B)play(chord[1],start+2,1.9,.072,'cello',-.2,'bass');
        const arp=[chord[0]+12,chord[3],chord[1]+12,chord[0]+24];
        (B?[0,2,3,1]:[0,1,2,3,2,1,2,1]).forEach((degree,i)=>play(arp[degree],start+i*(B?1:.5),B?1.1:.85,.038,B?'harp':b%2?'harp':'piano',i%2?.3:-.3));
        const indices=B?[0,2]:[0,1,2,3],positions=B?[.5,2.5]:[0,1.5,2,3];
        indices.forEach((index,i)=>play(chamberMelody[b][index]-(B?12:0),start+positions[i],B?1.4:[1.4,.45,.9,.95][i],i===0?.064:.05,B?'oboe':b<4?'oboe':'strings',.18,'melody'));
        if(!B)for(const at of[1,3])play(chord[3],start+at,.5,.024,'pizzicato',-.38);
        if(b===3||b===7)play(chord[2]+12,start+3.5,.85,.022,'harp',.4,'echo');
      }
    }
    return score.sort((a,b)=>a.beat-b.beat);
  }

  // Piano reduction of the opening two bars of Nocturne Op. 9 No. 2.
  // Each tuple is [MIDI pitch, original quarter-note beat, length, hand].
  const NOCTURNE_OPENING=[[39,0.0,0.5,2],[79,0.0,2.0,1],[55,0.5,0.5,2],[63,0.5,0.5,2],[58,1.0,0.5,2],[63,1.0,0.5,2],[67,1.0,0.5,2],[51,1.5,0.5,2],[56,2.0,0.5,2],[62,2.0,0.5,2],[77,2.0,0.5,1],[59,2.5,0.5,2],[62,2.5,0.5,2],[68,2.5,0.5,2],[79,2.5,0.5,1],[39,3.0,0.5,2],[77,3.0,1.5,1],[55,3.5,0.5,2],[63,3.5,0.5,2],[58,4.0,0.5,2],[63,4.0,0.5,2],[67,4.0,0.5,2],[38,4.5,0.5,2],[75,4.5,1.0,1],[55,5.0,0.5,2],[63,5.0,0.5,2],[58,5.5,0.5,2],[63,5.5,0.5,2],[67,5.5,0.5,2],[70,5.5,0.5,1],[36,6.0,0.5,2],[79,6.0,1.0,1],[55,6.5,0.5,2],[64,6.5,0.5,2],[58,7.0,0.5,2],[64,7.0,0.5,2],[67,7.0,0.5,2],[72,7.0,0.5,1],[48,7.5,0.5,2],[84,7.5,1.0,1],[55,8.0,0.5,2],[64,8.0,0.5,2],[60,8.5,0.5,2],[64,8.5,0.5,2],[70,8.5,0.5,2],[79,8.5,0.5,1],[41,9.0,0.5,2],[82,9.0,1.5,1],[53,9.5,0.5,2],[61,9.5,0.5,2],[58,10.0,0.5,2],[61,10.0,0.5,2],[64,10.0,0.5,2],[41,10.5,0.5,2],[80,10.5,1.0,1],[53,11.0,0.5,2],[60,11.0,0.5,2],[56,11.5,0.5,2],[60,11.5,0.5,2],[65,11.5,0.5,2],[79,11.5,0.5,1]];

  function composerScore(theme){
    const score=[],add=(midi,beat,duration,volume,pan)=>score.push({midi,beat,duration,volume,pan,voice:'feltPiano'});
    if(theme==='bach'){
      // BWV 846, opening four bars, repeated twice. The original held lower
      // notes and flowing sixteenths are retained, one octave below the cues.
      const voicings=[[60,64,67,72,76],[60,62,69,74,77],[59,62,67,74,77],[60,64,67,72,76]];
      for(let b=0;b<8;b++)for(const half of[0,2]){
        const v=voicings[b%4],start=b*4+half;
        add(v[0]-12,start,2,.069,-.24);add(v[1]-12,start+.25,1.75,.045,-.12);
        [v[2],v[3],v[4],v[2],v[3],v[4]].forEach((midi,i)=>add(midi-12,start+.5+i*.25,.25,i%3===0?.065:.052,.18));
      }
    }else if(theme==='chopin'){
      // Four dotted-quarter beats per 12/8 bar: both hands of the actual
      // Nocturne opening stay on the same clock as its original discoveries.
      for(let repeat=0;repeat<4;repeat++)for(const [midi,beat,length,hand]of NOCTURNE_OPENING){
        add(midi,repeat*8+beat*2/3,length*2/3,hand===1?.032:midi<52?.087:.033,hand===1?.22:-.22);
      }
    }
    return score;
  }

  function makeMusic(context,theme='default'){
    const profile=themeFor(theme),rate=24000,beat=60/profile.bpm;
    const buffer=context.createBuffer(2,Math.round(profile.loopBeats*beat*rate),rate);
    for(const n of arrangementScore(theme)){
      const start=grooveBeat(n.beat,theme)*beat+(n.timeOffset||0);
      const duration=Math.max(.01,(grooveBeat(n.beat+n.duration,theme)-grooveBeat(n.beat,theme))*beat);
      if(n.kind==='chip')chipDrum(buffer,start,duration,n.volume,n.voice);
      else if(n.kind==='drum')rockDrum(buffer,start,duration,n.volume,n.voice);
      else if(n.kind==='brush')percussion(buffer,start,duration,n.volume,n.voice==='ride');
      else if(n.kind==='quartet')quartetDrum(buffer,start,duration,n.volume,n.voice);
      else note(buffer,n.midi,start,duration,n.volume,n.voice,n.pan,true,n.velocity);
    }
    return buffer;
  }

  function pianoHarmony(beat,profile){
    const {beats,changes}=profile.harmony,cycle=Math.floor((beat+1e-8)/beats),phase=beat-cycle*beats;
    let index=changes.length-1;
    while(index>0&&phase<changes[index]-1e-8)index--;
    return {chord:profile.chords[index],end:cycle*beats+(changes[index+1]??beats)};
  }

  function pianoDiscovery(id,startBeat,profile,variation){
    const tune=profile.motifs[id],last=tune.steps.length-1;
    const variant=((Math.trunc(variation)||0)%profile.variations+profile.variations)%profile.variations;
    const unit=1/profile.subdivision,beatLength=60/profile.bpm;
    return tune.steps.map((degree,i)=>{
      let beat=tune.beats[i],gate=tune.gates[i];
      // Keep the opening cell; give successive reveals an answering cadence
      // or a lower, earlier response, with a small change in touch.
      if(i===last-1)degree+=[0,-1,1][variant];
      if(i===last){degree+=[0,1,-1][variant];beat+=[0,unit,-unit][variant];}
      if(variant===2&&i>1&&i<last-1)degree--;
      const absolute=startBeat+beat,{chord}=pianoHarmony(absolute,profile),tones=[];
      for(let midi=48;midi<=88;midi++)if(chord.some(n=>n%12===midi%12))tones.push(midi);
      const anchor=tones.reduce((best,midi,index)=>Math.abs(midi-profile.register)<Math.abs(tones[best]-profile.register)?index:best,0);
      const midi=tones[Math.max(0,Math.min(tones.length-1,anchor+degree))];
      // Common tones can sing through a change. Other notes release just
      // ahead of it, instead of carrying an unrelated harmony into the next.
      let cursor=absolute;
      while(cursor<absolute+gate-1e-8){
        const harmony=pianoHarmony(cursor,profile);
        if(!harmony.chord.some(n=>n%12===midi%12)){
          gate=Math.max(.04, cursor-absolute-.08/beatLength);break;
        }
        cursor=Math.min(absolute+gate,harmony.end);
      }
      const accent=i===0?.9:i===last?.68:i%2?.74:1;
      return {midi,beat,duration:gate,volume:.2*profile.cueGain*accent*[1,.94,.88][variant],
        pan:(i/last-.5)*.24,voice:'grand'};
    });
  }

  function discoveryScore(id,startBeat=0,theme='default',variation=0,role='phrase'){
    if(!Number.isInteger(id)||!tunes[id])return [];
    const profile=themeFor(theme),variant=((Math.trunc(variation)||0)%3+3)%3;
    let score;
    if(profile.harmony)score=pianoDiscovery(id,startBeat,profile,variant);
    else{
      const tune=tuneFor(id,theme),melody=[];let previous;
      tune.steps.forEach((step,i)=>{
        if(variant===2&&i===tune.steps.length-2)return; // A rest in the answering cell.
        if(i>=2&&i===tune.steps.length-1)step+=[0,-1,1][variant];
        const beat=tune.beats[i]+(variant===1&&i===tune.steps.length-1?.25:0),absolute=startBeat+beat,{chord}=harmonyAt(theme,absolute);
        const tones=[chord[0]+12,chord[3],chord[1]+12,chord[4]];
        let midi=tones[((step%4)+4)%4]+12*Math.floor(step/4)+profile.octave;
        if(i>=2&&previous!==undefined){
          const candidates=Array.from({length:5},(_,octave)=>midi%12+(octave+3)*12).filter(n=>n>=43&&n<=91);
          midi=candidates.sort((a,b)=>(Math.abs(a-previous)+.25*Math.abs(a-midi))-(Math.abs(b-previous)+.25*Math.abs(b-midi)))[0]??midi;
          if(Math.abs(midi-previous)>7){
            const nearby=[];
            for(let pitch=Math.max(43,previous-7);pitch<=Math.min(91,previous+7);pitch++)if(chord.some(n=>n%12===pitch%12))nearby.push(pitch);
            midi=nearby.sort((a,b)=>(Math.abs(a-midi)+.3*Math.abs(a-previous))-(Math.abs(b-midi)+.3*Math.abs(b-previous)))[0]??midi;
          }
        }
        previous=midi;
        melody.push({midi,beat,duration:harmonicGate(midi,absolute,tune.length*(variant===1?.88:1),theme),
          volume:.19*profile.cueGain,pan:(i/(tune.steps.length-1)-.5)*.4,voice:profile.voices?.[id]||tune.voice,kind:'melody'});
      });
      score=[...melody];
      melody.forEach((n,i)=>{
        if(variant===2&&i%2)return;
        const beat=n.beat+.5,{chord}=harmonyAt(theme,startBeat+beat),midi=nearestPitch(n.midi,chord);
        score.push({...n,midi,beat,duration:harmonicGate(midi,startBeat+beat,n.duration,theme),volume:n.volume*(profile.echoGain??.13),pan:-n.pan,kind:'echo'});
      });
      // A soft approach on a weak subdivision resolves to an existing strong note.
      if(variant===1&&profile.chromaticApproaches!==false){
        for(let i=2;i<melody.length;i++){
          const target=melody[i],previous=melody[i-1],beat=target.beat-.25,distance=target.midi-previous.midi;
          if(Math.abs((startBeat+target.beat)-Math.round(startBeat+target.beat))>1e-8||beat<=previous.beat+.08||Math.abs(distance)<2||Math.abs(distance)>5)continue;
          previous.duration=Math.min(previous.duration,beat-previous.beat-.025);
          score.push({...target,midi:target.midi-Math.sign(distance),beat,duration:.13,volume:target.volume*.4,
            kind:'passing',resolvesTo:target.midi,resolutionBeat:target.beat});break;
        }
      }
    }
    const melody=score.filter(n=>n.kind!=='echo'&&n.kind!=='passing');
    // Preserve the opening gesture and bring later chord changes into a nearby register.
    for(let i=2;i<melody.length;i++){
      const n=melody[i],last=melody[i-1];
      if(profile.harmony&&Math.abs(n.midi-last.midi)>7){
        const options=[n.midi-12,n.midi,n.midi+12].filter(m=>m>=55&&m<=81);
        n.midi=options.sort((a,b)=>Math.abs(a-last.midi)-Math.abs(b-last.midi))[0];
      }
    }
    score=score.map(n=>{
      const index=melody.indexOf(n),fraction=index<0?.5:index/Math.max(1,melody.length-1);
      const arc=.8+.2*Math.sin(Math.PI*fraction),touch=[1,.96,.91][variant];
      return {...n,kind:n.kind||'melody',volume:n.volume*arc*touch,velocity:clamp(.46+arc*.24+(index===0?.08:0)-variant*.025,.35,.85),
        timeOffset:n.beat===0?0:feel(n.beat*17+id*7+variant)*.008};
    }).sort((a,b)=>a.beat-b.beat);
    if(role==='accent'){
      const first=score[0];return [{...first,beat:0,duration:Math.min(.32*profile.bpm/60,first.duration),volume:first.volume*.65,velocity:.6,timeOffset:0,kind:'accent'}];
    }
    return score;
  }

  function makeTune(context,id,startBeat=0,beatLength,theme='default',variation=0,role='phrase'){
    beatLength??=60/themeFor(theme).bpm;
    const rate=24000,score=discoveryScore(id,startBeat,theme,variation,role);
    if(!score.length)return context.createBuffer(2,1,rate);
    const start=grooveBeat(startBeat,theme),endBeat=Math.max(...score.map(n=>n.beat+n.duration));
    const release=score.some(n=>n.voice==='grand'||n.voice==='feltPiano')?PIANO_RELEASE:0;
    const duration=(grooveBeat(startBeat+endBeat,theme)-start)*beatLength+release+.05;
    const buffer=context.createBuffer(2,Math.ceil(duration*rate),rate);
    for(const n of score){
      const onset=grooveBeat(startBeat+n.beat,theme),end=grooveBeat(startBeat+n.beat+n.duration,theme);
      note(buffer,n.midi,(onset-start)*beatLength+n.timeOffset,(end-onset)*beatLength,n.volume,n.voice,n.pan,false,n.velocity);
    }
    return buffer;
  }

  function makeRoom(context){
    const rate=context.sampleRate||44100,length=Math.ceil(rate*.55),buffer=context.createBuffer(2,length,rate);
    for(let c=0;c<2;c++){
      const data=buffer.getChannelData(c);let seed=7919+c*3571,low=0;
      for(let i=0;i<length;i++){
        seed=(Math.imul(seed,1664525)+1013904223)>>>0;low=low*.7+(seed/2147483648-1)*.3;
        data[i]=low*Math.exp(-i/length*8)*.025*Math.min(1,i/(rate*.008));
      }
      for(const [delay,level]of[[.019,.22],[.037,.14],[.061,.08]])data[Math.round((delay+c*.002)*rate)]+=level;
    }
    return buffer;
  }

  // Render a reusable note for samplers and offline embedded asset exporters.
  function makeInstrument(context,voice,midi=72,duration=1.4,velocity=.7){
    if(!Object.hasOwn(instruments,voice)||!Number.isFinite(midi)||!Number.isFinite(duration)||duration<=0)throw new RangeError('Invalid instrument note');
    const rate=24000,release=voice==='grand'||voice==='feltPiano'?PIANO_RELEASE:0;
    const buffer=context.createBuffer(2,Math.ceil((duration+release+.04)*rate),rate);
    note(buffer,midi,0,duration,.25,voice,0,false,velocity);return buffer;
  }

  class Soundtrack {
    constructor({onChange=()=>{},AudioContext:Context=root.AudioContext||root.webkitAudioContext,maxPhrases=3,room=.1,
      storage,storageKey='little-wonders-muted',themeKey='little-wonders-music-theme',themeIds}={}){
      this.Context=Context;this.storageKey=storageKey;this.themeKey=themeKey;
      this.supported=!!this.Context;this.onChange=onChange;
      this.context=null;this.muted=false;this.paused=false;this.hidden=false;this.theme='default';
      this.themeIds=Array.isArray(themeIds)?[...new Set(themeIds.filter(id=>Object.hasOwn(THEMES,id)))]:Object.keys(THEMES);
      if(!this.themeIds.length)this.themeIds=['default'];
      if(!this.themeIds.includes(this.theme))this.theme=this.themeIds[0];
      this.voices=new Map();this.buffers=new Map();this.musicBuffers=new Map();
      this.voiceInfo=new Map();this.phraseHistory=new Map();
      this.maxPhrases=Number.isFinite(maxPhrases)?clamp(Math.trunc(maxPhrases),1,8):3;
      this.roomAmount=Number.isFinite(room)?clamp(room,0,.3):.1;
      try{
        this.storage=storage===undefined?root.localStorage:storage;
        this.muted=this.storage?.getItem(this.storageKey)==='true';
        const saved=this.storage?.getItem(this.themeKey);if(this.themeIds.includes(saved))this.theme=saved;
      }catch{}
      this.beatLength=60/themeFor(this.theme).bpm;
    }
    // Called from user input, never from autoplay or the animation loop.
    unlock(){
      if(!this.supported||this.muted||this.paused||this.hidden)return;
      if(!this.context){
        try{
          const context=new this.Context();this.context=context;
          this.master=context.createGain();this.master.gain.value=0;
          this.mix=context.createGain();this.mix.connect(this.master);
          const limiter=context.createDynamicsCompressor();this.limiter=limiter;
          limiter.threshold.value=-18;limiter.knee.value=16;limiter.ratio.value=8;
          limiter.attack.value=.003;limiter.release.value=.25;
          this.master.connect(limiter);limiter.connect(context.destination);
          if(this.roomAmount&&context.createConvolver){
            this.room=context.createConvolver();this.room.normalize=false;this.room.buffer=makeRoom(context);
            this.wet=context.createGain();this.wet.gain.value=this.roomAmount;
            this.mix.connect(this.room);this.room.connect(this.wet);this.wet.connect(this.master);
          }
          this.startMusic();
        }catch{
          if(this.context)this.context.close().catch(()=>{});
          this.context=null;this.supported=false;this.onChange();return;
        }
      }
      this.sync();
    }
    startMusic(transition=false){
      const context=this.context;
      if(!this.musicBuffers.has(this.theme))this.musicBuffers.set(this.theme,makeMusic(context,this.theme));
      if(this.music){this.musicVolume.gain.setTargetAtTime(0,context.currentTime,.018);this.music.stop(context.currentTime+.09);}
      const music=context.createBufferSource(),volume=context.createGain();
      music.buffer=this.musicBuffers.get(this.theme);music.loop=true;volume.gain.value=.58;
      music.connect(volume);volume.connect(this.mix);
      this.beatLength=music.buffer.duration/themeFor(this.theme).loopBeats;this.startedAt=context.currentTime+(transition ? .12 : .05);
      music.onended=()=>{music.disconnect();volume.disconnect();};
      music.start(this.startedAt);this.music=music;this.musicVolume=volume;
    }
    setTheme(theme){
      if(!this.themeIds.includes(theme)||theme===this.theme)return false;
      // Prepare first, so a failed buffer allocation leaves the current theme playing.
      if(this.context&&!this.musicBuffers.has(theme)){
        try{this.musicBuffers.set(theme,makeMusic(this.context,theme));}catch{return false;}
      }
      this.clearEffects();this.buffers.clear();this.theme=theme;this.beatLength=60/themeFor(theme).bpm;
      try{this.storage?.setItem(this.themeKey,theme);}catch{}
      if(this.context)this.startMusic(true);
      this.unlock();this.sync();this.onChange();return true;
    }
    currentBeat(){
      return this.context&&this.music?straightBeat((this.context.currentTime-this.startedAt)/this.beatLength,this.theme):null;
    }
    nextEntrance(lead=.04){
      if(!this.context||!this.music)return;
      const position=straightBeat((this.context.currentTime+lead-this.startedAt)/this.beatLength,this.theme);
      const step=themeFor(this.theme).entranceBeats??.5;
      const beat=Math.max(0,Math.ceil(position/step)*step);
      return {beat,when:this.startedAt+grooveBeat(beat,this.theme)*this.beatLength,theme:this.theme};
    }
    sync(){
      const context=this.context;if(!context)return;
      this.master.gain.setTargetAtTime(this.muted?0:.72,context.currentTime,.025);
      const blocked=this.paused||this.hidden,target=blocked?'suspended':'running';
      if(context.state===target||context.state==='closed')return;
      // Recheck after completion so rapid pause / resume cannot leave stale audio.
      context[blocked?'suspend':'resume']().then(()=>{
        if((this.paused||this.hidden)!==(context.state==='suspended'))this.sync();
      }).catch(()=>{}); // Another gesture can retry a browser-blocked resume.
    }
    setMuted(muted){
      this.muted=!!muted;
      try{this.storage?.setItem(this.storageKey,String(this.muted));}catch{}
      if(this.muted)this.clearEffects();else this.unlock();
      this.sync();this.onChange();
    }
    setPaused(paused){this.paused=!!paused;this.sync();}
    setHidden(hidden){this.hidden=!!hidden;this.sync();}
    playDiscovery(event){
      const context=this.context;
      if(!context||this.paused||this.hidden||context.state!=='running')return;
      return this.queueDiscovery(event);
    }
    discoveryRole(event,cue){
      const identity=Number.isInteger(event.tokenId)?`${event.id}:${event.tokenId}`:String(event.id);
      const last=this.phraseHistory.get(identity);
      const lastPhrase=last&&cue.beat-last.beat<32?last.lastPhrase:-Infinity;
      const active=[...this.voiceInfo].filter(([,info])=>info.role==='phrase'&&info.endsAt>cue.when);
      const duplicate=active.find(([,info])=>info.id===event.id&&info.when===cue.when);
      let replace;
      if(duplicate||active.length>=this.maxPhrases){
        // Arbitrate actual contenders before their shared entrance, never
        // reserve an empty slot or interrupt a phrase that is already audible.
        for(const [source,info]of duplicate?[duplicate]:active){
          if(info.when===cue.when&&info.when>this.context.currentTime+.008&&info.lastPhrase>lastPhrase&&
            (!replace||info.lastPhrase>this.voiceInfo.get(replace).lastPhrase))replace=source;
        }
      }
      return {identity,lastPhrase,replace,role:replace||!duplicate&&active.length<this.maxPhrases?'phrase':'accent'};
    }
    rememberPhrase(identity,role,beat){
      const lastPhrase=role==='phrase'?beat:(this.phraseHistory.get(identity)?.lastPhrase??-Infinity);
      this.phraseHistory.set(identity,{role,beat,lastPhrase});
      for(const [id,info]of this.phraseHistory)if(beat-info.beat>=32)this.phraseHistory.delete(id);
      if(this.phraseHistory.size>72)this.phraseHistory.delete(this.phraseHistory.keys().next().value);
    }
    queueDiscovery(event){
      const context=this.context;
      if(!context||this.muted||context.state==='closed'||!Number.isInteger(event.id)||!tunes[event.id])return;
      const profile=themeFor(this.theme),cycle=Number.isInteger(event.cycle)?Math.max(0,event.cycle-1):0;
      const token=Number.isInteger(event.tokenId)?Math.max(0,event.tokenId):0;
      const variation=(cycle+token)%profile.variations;
      let cue=this.nextEntrance(),buffer,accentBuffer,prepared=false,choice;
      for(let attempt=0;attempt<4;attempt++){
        const began=context.currentTime;choice=this.discoveryRole(event,cue);
        const existing=choice.role==='accent'?[...this.voiceInfo.values()].find(info=>info.role==='accent'&&info.id===event.id&&info.when===cue.when):null;
        if(existing){
          this.rememberPhrase(choice.identity,'accent',cue.beat);
          return {...cue,variation,role:'accent',coalesced:true};
        }
        buffer=this.discoveryBuffer(event.id,cue,variation,choice.role);
        if(choice.replace){
          const info=this.voiceInfo.get(choice.replace);
          accentBuffer=this.discoveryBuffer(info.id,info.cue,info.cue.variation,'accent');
        }
        if(cue.when>=context.currentTime+.008){prepared=true;break;}
        cue=this.nextEntrance(Math.max(.04,(context.currentTime-began)*1.5));
      }
      if(!prepared)return;
      if(choice.replace){
        const info=this.voiceInfo.get(choice.replace);
        this.stopVoice(choice.replace,true);
        // A provisional reservation did not earn a foreground turn.
        this.phraseHistory.set(info.identity,{role:'accent',beat:info.cue.beat,lastPhrase:info.lastPhrase});
        info.cue.role='accent';
        const shared=[...this.voiceInfo.values()].some(other=>other.role==='accent'&&other.id===info.id&&other.when===info.when);
        if(shared)info.cue.coalesced=true;
        else this.startDiscovery(info.id,info.cue,{identity:info.identity,lastPhrase:info.lastPhrase,role:'accent'},accentBuffer);
      }
      const result={...cue,variation,role:choice.role};
      this.startDiscovery(event.id,result,choice,buffer);
      this.rememberPhrase(choice.identity,choice.role,cue.beat);
      return result;
    }
    discoveryBuffer(id,cue,variation,role){
      const profile=themeFor(this.theme),phase=Math.round(cue.beat*2)%((profile.harmony?.beats??profile.chords.length*(profile.beatsPerBar??4))*2);
      const key=`${this.theme}:${id}:${phase}:v${variation}:${role}`;
      if(!this.buffers.has(key)){
        if(this.buffers.size>=24)this.buffers.delete(this.buffers.keys().next().value);
        this.buffers.set(key,makeTune(this.context,id,cue.beat,this.beatLength,this.theme,variation,role));
      }
      return this.buffers.get(key);
    }
    startDiscovery(id,cue,choice,buffer){
      const context=this.context;
      // Accents stay short and bounded; simultaneous copies share their accent.
      const accents=[...this.voiceInfo].filter(([,info])=>info.role==='accent'&&info.endsAt>cue.when);
      if(choice.role==='accent'&&accents.length>=8)this.stopVoice(accents[0][0]);
      if(this.voices.size>=48)this.stopVoice(this.voices.keys().next().value);
      const source=context.createBufferSource(),gain=context.createGain();
      source.buffer=buffer;gain.gain.value=choice.role==='phrase'?.62:.5;
      source.connect(gain);gain.connect(this.mix);this.voices.set(source,gain);
      this.voiceInfo.set(source,{identity:choice.identity,lastPhrase:choice.lastPhrase,role:choice.role,id,when:cue.when,endsAt:cue.when+buffer.duration,cue});
      source.onended=()=>{source.disconnect();gain.disconnect();this.voices.delete(source);this.voiceInfo.delete(source);};
      source.start(cue.when);
    }
    stopVoice(source,immediate=false){
      const gain=this.voices.get(source);if(!gain)return;
      const now=this.context.currentTime;
      if(immediate)gain.gain.value=0;else gain.gain.setTargetAtTime(0,now,.008);
      source.stop(immediate?now:now+.04);this.voices.delete(source);this.voiceInfo.delete(source);
    }
    clearEffects(){for(const source of this.voices.keys())this.stopVoice(source);this.phraseHistory.clear();}
    async dispose(){
      this.supported=false;this.paused=true;this.clearEffects();
      if(this.music)this.music.stop();
      const context=this.context;this.context=null;this.music=null;
      this.buffers.clear();this.musicBuffers.clear();
      if(this.room)this.room.buffer=null;
      for(const node of[this.mix,this.room,this.wet,this.master,this.limiter])node?.disconnect();
      if(context&&context.state!=='closed')await context.close();
    }
  }
  return {Soundtrack,makeMusic,makeTune,makeInstrument,discoveryScore,composerScore,arrangementScore,makeRoom,grooveBeat,straightBeat,BEAT,CHORDS,THEMES,PLAYABLE_THEMES};
});
