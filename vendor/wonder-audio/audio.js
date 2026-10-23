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
      voices:['vibes','piano','clarinet','guitar','keys','vibes']},
    rock:{name:'Rock',bpm:120,swing:.5,chords:ROCK_CHORDS,octave:0,cueGain:.7,loopBeats:64,variations:3,
      voices:['electricLead','electric','organ','palmMute','electricHarmonic','electricLead']},
    classical:{name:'Classical',bpm:92,swing:.5,chords:CLASSICAL_CHORDS,octave:12,cueGain:.85,loopBeats:64,variations:3,
      voices:['celesta','piano','oboe','pizzicato','harp','strings']},
    bach:{name:'Bach',bpm:88,swing:.5,chords:BACH_CHORDS,cueGain:.48,subdivision:4,register:64,variations:3,loopBeats:32,
      harmony:{beats:16,changes:[0,4,8,12]},voices:Array(6).fill('grand'),motifs:PIANO_PHRASES.bach},
    chopin:{name:'Chopin',bpm:44,swing:.5,chords:CHOPIN_CHORDS,cueGain:.48,entranceBeats:1,subdivision:6,register:63,variations:3,loopBeats:32,
      harmony:{beats:8,changes:[0,4/3,2,4,6,7]},voices:Array(6).fill('grand'),motifs:PIANO_PHRASES.chopin}
  };
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
    guitar:[[1,1],[2,.18],[3,.12],[4,.025]],
    electric:[[1,.8],[2,.42],[3,.3],[4,.16],[5,.11],[7,.055]],
    electricLead:[[1,1],[2,.32],[3,.24],[4,.1],[5,.065]],
    electricBass:[[1,1],[2,.32],[3,.16],[4,.055]],
    palmMute:[[1,1],[2,.55],[3,.26],[4,.11],[6,.04]],
    electricHarmonic:[[1,1],[2,.13],[3,.075],[4,.02]],
    organ:[[1,1],[2,.25],[3,.2],[4,.1]],
    strings:[[.997,.5],[1.003,.5],[2,.24],[3,.11],[4,.045]],
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

  function note(buffer,midi,start,duration,volume,voice='glass',pan=0,wrap=false,velocity=.7){
    velocity=clamp(velocity,0,1);
    if(voice==='grand'||voice==='feltPiano')return pianoNote(buffer,midi,start,duration,volume,voice,pan,wrap,velocity);
    const rate=buffer.sampleRate,offset=Math.round(start*rate),count=Math.ceil(duration*rate);
    const hz=440*2**((midi-69)/12),partials=instruments[voice].filter(([ratio])=>ratio*hz<rate*.45);
    const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
    const l=Math.sqrt((1-pan)/2)*volume,r=Math.sqrt((1+pan)/2)*volume;
    const sustained=voice==='pad'||voice==='flute'||voice==='bass'||voice==='clarinet'||
      voice==='electric'||voice==='electricLead'||voice==='organ'||voice==='strings'||voice==='cello'||voice==='oboe';
    const attack=voice==='pad'?.35:voice==='flute'?.065:voice==='clarinet'?.04:
      voice==='strings'?.12:voice==='cello'?.09:voice==='oboe'?.065:voice==='organ'||voice==='electricLead'?.02:.008;
    // Advance sine phases and decay by recurrence, keeping buffer generation
    // light enough for the first tap on a phone.
    const tones=partials.map(([ratio,weight])=>{
      const step=TAU*hz*ratio/rate;
      weight*=Math.pow(.45+.75*velocity,Math.log2(ratio));
      return {sin:0,cos:1,stepSin:Math.sin(step),stepCos:Math.cos(step),weight,decay:Math.exp(-(ratio-1)*.6/(duration*rate))};
    });
    const decayStep=Math.exp(-(sustained?.8:4.8)/(duration*rate));let decay=1;
    for(let i=0;i<count;i++){
      const t=i/rate,index=wrap?(offset+i)%buffer.length:offset+i;
      if(index>=buffer.length)break;
      const envelope=Math.min(1,t/attack)*Math.min(1,(duration-t)/(sustained?.25:.12))*decay;
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

  function harmonyAt(theme,beat){
    const profile=themeFor(theme);
    if(profile.harmony)return pianoHarmony(beat,profile);
    const bar=Math.floor((beat+1e-8)/4),chords=profile.chords;
    return {chord:chords[((bar%chords.length)+chords.length)%chords.length],end:(bar+1)*4};
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
      if(n.kind==='drum')rockDrum(buffer,start,duration,n.volume,n.voice);
      else if(n.kind==='brush')percussion(buffer,start,duration,n.volume,n.voice==='ride');
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
        score.push({...n,midi,beat,duration:harmonicGate(midi,startBeat+beat,n.duration,theme),volume:n.volume*.13,pan:-n.pan,kind:'echo'});
      });
      // A soft approach on a weak subdivision resolves to an existing strong note.
      if(variant===1){
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
      const first=score[0];return [{...first,beat:0,duration:Math.min(.32,first.duration),volume:first.volume*.27,velocity:.38,timeOffset:0,kind:'accent'}];
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

  class Soundtrack {
    constructor({onChange=()=>{},AudioContext:Context=root.AudioContext||root.webkitAudioContext,maxPhrases=3,room=.1,
      storage,storageKey='little-wonders-muted',themeKey='little-wonders-music-theme'}={}){
      this.Context=Context;this.storageKey=storageKey;this.themeKey=themeKey;
      this.supported=!!this.Context;this.onChange=onChange;
      this.context=null;this.muted=false;this.paused=false;this.hidden=false;this.theme='default';
      this.voices=new Map();this.buffers=new Map();this.musicBuffers=new Map();
      this.voiceInfo=new Map();this.phraseHistory=new Map();
      this.maxPhrases=Number.isFinite(maxPhrases)?clamp(Math.trunc(maxPhrases),1,8):3;
      this.roomAmount=Number.isFinite(room)?clamp(room,0,.3):.1;
      try{
        this.storage=storage===undefined?root.localStorage:storage;
        this.muted=this.storage?.getItem(this.storageKey)==='true';
        const saved=this.storage?.getItem(this.themeKey);if(Object.hasOwn(THEMES,saved))this.theme=saved;
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
      if(!Object.hasOwn(THEMES,theme)||theme===this.theme)return false;
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
      const active=[...this.voiceInfo.values()].filter(info=>info.endsAt>cue.when);
      const busy=active.filter(info=>info.role==='phrase').length;
      const recent=[...this.phraseHistory.values()].filter(info=>cue.beat-info.beat<32);
      const last=this.phraseHistory.get(identity);
      const oldest=recent.length?Math.min(...recent.map(info=>info.lastPhrase)):-Infinity;
      const yieldTurn=last&&cue.beat-last.beat<32&&last.lastPhrase>oldest;
      const duplicate=active.some(info=>info.id===event.id&&info.when===cue.when&&info.role==='phrase');
      return {identity,role:busy>=this.maxPhrases||yieldTurn||duplicate?'accent':'phrase'};
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
      let cue=this.nextEntrance(),buffer,prepared=false,choice;
      for(let attempt=0;attempt<4;attempt++){
        const began=context.currentTime;choice=this.discoveryRole(event,cue);
        const existing=choice.role==='accent'?[...this.voiceInfo.values()].find(info=>info.role==='accent'&&info.id===event.id&&info.when===cue.when):null;
        if(existing){
          this.rememberPhrase(choice.identity,'accent',cue.beat);
          return {...cue,variation,role:'accent',coalesced:true};
        }
        const phase=Math.round(cue.beat*2)%((profile.harmony?.beats??profile.chords.length*4)*2);
        const key=`${this.theme}:${event.id}:${phase}:v${variation}:${choice.role}`;
        if(!this.buffers.has(key)){
          if(this.buffers.size>=24)this.buffers.delete(this.buffers.keys().next().value);
          this.buffers.set(key,makeTune(context,event.id,cue.beat,this.beatLength,this.theme,variation,choice.role));
        }
        buffer=this.buffers.get(key);
        if(cue.when>=context.currentTime+.008){prepared=true;break;}
        cue=this.nextEntrance(Math.max(.04,(context.currentTime-began)*1.5));
      }
      if(!prepared)return;
      // Accents stay short and bounded; simultaneous copies share their accent.
      const accents=[...this.voiceInfo].filter(([,info])=>info.role==='accent'&&info.endsAt>cue.when);
      if(choice.role==='accent'&&accents.length>=8)this.stopVoice(accents[0][0]);
      if(this.voices.size>=48)this.stopVoice(this.voices.keys().next().value);
      const source=context.createBufferSource(),gain=context.createGain();
      source.buffer=buffer;gain.gain.value=choice.role==='phrase'?.62:.5;
      source.connect(gain);gain.connect(this.mix);this.voices.set(source,gain);
      const result={...cue,variation,role:choice.role};
      this.voiceInfo.set(source,{...choice,id:event.id,when:cue.when,endsAt:cue.when+buffer.duration,cue:result});
      this.rememberPhrase(choice.identity,choice.role,cue.beat);
      source.onended=()=>{source.disconnect();gain.disconnect();this.voices.delete(source);this.voiceInfo.delete(source);};
      source.start(cue.when);return result;
    }
    stopVoice(source){
      const gain=this.voices.get(source);if(!gain)return;
      const now=this.context.currentTime;gain.gain.setTargetAtTime(0,now,.008);
      source.stop(now+.04);this.voices.delete(source);this.voiceInfo.delete(source);
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
  return {Soundtrack,makeMusic,makeTune,discoveryScore,composerScore,arrangementScore,makeRoom,grooveBeat,straightBeat,BEAT,CHORDS,THEMES};
});
