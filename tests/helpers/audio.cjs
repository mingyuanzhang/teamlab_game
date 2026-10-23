class AudioParam {
  constructor(){this.value=0;}
  setTargetAtTime(value){this.value=value;}
}
class AudioNode {
  constructor(){this.connections=[];}
  connect(node){this.connections.push(node);return node;}
  disconnect(){this.connections=[];}
}
class AudioContext {
  constructor(){this.state='suspended';this.currentTime=0;this.sampleRate=48000;this.destination=new AudioNode();this.sources=[];}
  createBuffer(channels,length,sampleRate){
    const data=Array.from({length:channels},()=>new Float32Array(length));
    return {length,sampleRate,duration:length/sampleRate,numberOfChannels:channels,getChannelData:i=>data[i]};
  }
  createGain(){return Object.assign(new AudioNode(),{gain:new AudioParam()});}
  createConvolver(){return Object.assign(new AudioNode(),{buffer:null,normalize:true});}
  createDynamicsCompressor(){
    return Object.assign(new AudioNode(),Object.fromEntries(['threshold','knee','ratio','attack','release'].map(key=>[key,new AudioParam()])));
  }
  createBufferSource(){
    const source=Object.assign(new AudioNode(),{
      loop:false,started:false,stopped:false,
      start(when=0){this.started=true;this.when=when;},
      stop(){this.stopped=true;this.onended?.();}
    });
    this.sources.push(source);return source;
  }
  async resume(){this.state='running';}
  async suspend(){this.state='suspended';}
  async close(){this.state='closed';}
}
module.exports={AudioContext};
