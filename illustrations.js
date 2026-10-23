/* Procedural ink, paper, and silk. Geometry stays local to each released discovery. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.LittleArt=factory();
})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  'use strict';
  const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const noise=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  const palettes=[['#9de5ed','#638fc7','#c4b6df'],['#efae83','#edcf8f','#dc8fa4'],['#e5aeb9','#d1badc','#f3cfad'],['#b4c9a7','#e7b5c3','#c7accd'],['#adbbec','#dac6e4','#b0d9cb'],['#aad2ca','#e6cfa2','#bdc9ec']];
  // An underdamped spring: a quick overshoot, a smaller recoil, then stillness.
  // Its envelope depends on entrance age only, so dissolves keep their full size.
  function entrance(age){
    if(age<=0)return {x:0,y:0,rotation:0};
    const decay=Math.exp(-6.5*age),grow=1-decay*(Math.cos(age*16)+.2*Math.sin(age*16));
    const wobble=Math.sin(age*21)*Math.exp(-6*age)*.13;
    return {x:grow*(1+wobble),y:grow*(1-wobble*.7),rotation:Math.sin(age*14)*Math.exp(-5.5*age)*.075};
  }
  function createPainter(ctx){
    function oval(x,y,rx,ry,color){
      ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);ctx.fill();
    }
    function line(points,color,width=.7,closed=false,fill){
      ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
      if(closed)ctx.closePath();
      if(fill){ctx.fillStyle=fill;ctx.fill();}
      ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
    }
    function curve(p,color,width=.7){
      ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.bezierCurveTo(...p.slice(2));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();
    }
    function ring(x,y,rx,ry,color,width=.7){
      ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
    }
    function glow(x,y,r,color){
      const wash=ctx.createRadialGradient(x,y,0,x,y,r);wash.addColorStop(0,color);wash.addColorStop(1,'transparent');
      ctx.fillStyle=wash;ctx.fillRect(x-r,y-r,r*2,r*2);
    }
    function petal(length,width,color){
      ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-width,-length*.3,-width*.7,-length*.9,0,-length);
      ctx.bezierCurveTo(width*.85,-length*.82,width,-length*.23,0,0);ctx.fillStyle=color+'22';ctx.fill();
      ctx.strokeStyle=color+'8a';ctx.lineWidth=.65;ctx.stroke();
      curve([0,0,-width*.14,-length*.35,width*.15,-length*.7,0,-length],color+'45',.45);
    }
    function star(x,y,size,color,rotation=0){
      ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
      line([[0,-size],[size*.26,-size*.23],[size,0],[size*.26,size*.23],[0,size],[-size*.26,size*.23],[-size,0],[-size*.26,-size*.23]],color,.5,true,color+'35');ctx.restore();
    }
    function rain(e,v){
      const {age:t,seed}=e,c=palettes[0],sway=Math.sin(v.motion*.25+seed)*7;
      glow(0,-18,100,'#9de5ed12');
      for(let j=0;j<7;j++){
        const x=(j-3)*17+sway,yy=-24-Math.sin(j*1.7+seed)*11;
        oval(x,yy,24+noise(j+seed)*12,12+noise(j+seed+3)*7,c[j%3]+'0c');
        curve([x-24,yy+3,x-28,yy-26,x+23,yy-26,x+28,yy+2],c[j%3]+'65',.65);
        curve([x-21,yy+6,x-5,yy+13,x+15,yy+7,x+25,yy+3],c[(j+1)%3]+'24',.5);
      }
      const alpha=ctx.globalAlpha;
      for(let i=0;i<52;i++){
        const age=t-noise(i+seed)*2.1;if(age<0||age>5.3)continue;
        const x=(noise(i*3+seed)-.5)*153+Math.sin(v.motion+i)*3,y=age*(69+noise(i)*49),ground=v.ground;
        ctx.globalAlpha=alpha*clamp((5.3-age)*.7,0,.8);
        if(y<ground){
          curve([x-2,y-15,x+3,y-11,x+1,y-5,x,y],c[i%3]+'9c',.65);
          oval(x,y,1,2.1,c[i%3]+'c0');
        }else{
          const phase=(y-ground)/80;
          if(phase<1)ring(x,ground,4+phase*18,1+phase*3,c[i%3]+'65',.55);
        }
      }
      ctx.globalAlpha=alpha;
    }
    function fireworks(e,v){
      const c=palettes[1],alpha=ctx.globalAlpha;
      for(let j=0;j<3;j++){
        const age=e.age-j*.7;if(age<0)continue;
        const cx=Math.sin(e.seed+j*5)*64,cy=-65-j%2*58;
        if(age<.48){const f=age/.48;curve([0,0,cx*.2,-20,cx*.75,cy*.8,cx*f,cy*f],'#edcf8f8a',.9);glow(cx*f,cy*f,10,'#edcf8f35');continue;}
        const t=age-.48;if(t>4.6)continue;
        const spread=entrance(t).x,fall=t*t*4.5;
        ctx.globalAlpha=alpha*(1-smooth((t-2.3)/2.3));
        ctx.save();ctx.translate(cx,cy+fall);ctx.rotate(j*.7+Math.sin(v.motion*.3)*.04);
        glow(0,0,100,'#edcf8f12');
        for(let i=0;i<42;i++){
          const angle=i/42*TAU,r=(54+noise(i+e.seed+j)*35)*spread;
          const bend=.18+noise(i+j)*.22,x=Math.cos(angle)*r,y=Math.sin(angle)*r;
          curve([0,0,Math.cos(angle-bend)*r*.45,Math.sin(angle-bend)*r*.45,Math.cos(angle+bend)*r*.84,Math.sin(angle+bend)*r*.84,x,y],c[i%3]+'a6',i%3?.65:1);
          const inner=r*.66;
          curve([Math.cos(angle)*inner*.3,Math.sin(angle)*inner*.3,Math.cos(angle-.15)*inner*.6,Math.sin(angle-.15)*inner*.6,x*.68,y*.68,x*.72,y*.72],c[(i+1)%3]+'45',.45);
          oval(x,y,i%6===0?1.7:.85,i%6===0?1.7:.85,c[i%3]+'df');
        }
        star(0,0,4,'#fff0c7',v.motion*.15);ctx.restore();
      }
      ctx.globalAlpha=alpha;
    }
    function balloons(e,v){
      const c=palettes[2];
      for(let i=0;i<5;i++){
        const age=e.age-i*.32;if(age<0)continue;
        const inflate=entrance(age),r=13+noise(e.seed+i)*6;
        const x=(i-2)*25+Math.sin(v.motion*.42+i*2+e.seed)*16,y=-age*(23+i*2);
        ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(v.motion*.5+i)*.11+inflate.rotation);
        ctx.save();ctx.scale(inflate.x,inflate.y);
        glow(0,-r,36,c[i%3]+'12');oval(0,-r,r,r*1.28,c[i%3]+'16');ring(0,-r,r,r*1.28,c[i%3]+'b5',.8);
        for(const side of[-1,1])curve([0,-r*2.28,side*r*.8,-r*1.9,side*r*.8,-r*.25,0,r*.28],c[(i+1)%3]+'78',.65);
        curve([-r*.67,-r*1.76,-r*.8,-r*1.3,-r*.8,-r*.8,-r*.63,-r*.6],'#fff0df6a',1.1);
        ctx.restore();
        curve([0,r*.28,Math.sin(v.motion+i)*15,30,-Math.sin(v.motion*.7+i)*18,48,Math.sin(v.motion*.5+i)*9,65],c[i%3]+'8a',.65);
        ctx.save();ctx.translate(0,r*.3);ctx.rotate(.7);petal(7,3,c[i%3]);ctx.restore();ctx.restore();
      }
    }
    function garden(e,v){
      const c=palettes[3];
      for(let k=0;k<7;k++){
        const age=e.age-k*.035;if(age<0)continue;
        const grow=smooth(age/.16),angle=(k/6-.5)*2.1+(noise(e.seed+k)-.5)*.18;
        const reach=(88+noise(e.seed+k*4)*65)*grow;
        const x=Math.sin(angle)*reach+Math.sin(v.motion*.35+k)*4,y=-Math.cos(angle)*reach;
        curve([0,0,x*.05,-reach*.4,x*.72,-reach*.5,x,y],c[k%3]+'9c',.85);
        for(let j=1;j<4;j++){
          const q=j/4;ctx.save();ctx.translate(x*q*q,y*q);ctx.rotate(angle+(j%2?1:-1)*.95);
          petal((17+j*2)*grow,5*grow,c[(k+j)%3]);ctx.restore();
        }
        const bloom=entrance(Math.max(0,age-.04));
        ctx.save();ctx.translate(x,y);ctx.rotate(angle*.3+Math.sin(v.motion*.4+k)*.06+bloom.rotation);ctx.scale(bloom.x,bloom.y);
        glow(0,0,29,c[(k+1)%3]+'18');
        for(let layer=0;layer<2;layer++)for(let j=0;j<7;j++){
          ctx.save();ctx.rotate(j/7*TAU+layer*.4);petal((layer?13:22)+noise(e.seed+k+j)*4,layer?5:7,c[(k+layer+1)%3]);ctx.restore();
        }
        oval(0,0,3,3,'#edcf8fc0');
        for(let j=0;j<5;j++)oval(Math.cos(j*2.4)*4,Math.sin(j*2.4)*4,.6,.6,'#fff0dfb0');
        ctx.restore();
      }
    }
    function ribbons(e,v){
      const c=palettes[4],grow=smooth(e.age/.22),direction=noise(e.seed)>.5?1:-1,turn=noise(e.seed+3)*TAU;
      ctx.save();ctx.scale(direction,1);
      for(let j=0;j<6;j++){
        const upper=[],lower=[],spine=[];
        for(let i=0;i<=44;i++){
          const u=i/44,w=Math.sin(u*Math.PI)*(4+j*.65),phase=u*8-v.motion*.7+j*.48+turn;
          const x=u*230*grow,y=(-u*88+Math.sin(phase)*(18+u*15)+(j-2.5)*u*8)*grow;
          upper.push([x,y-w]);lower.push([x,y+w]);spine.push([x,y]);
        }
        line([...upper,...lower.reverse()],c[j%3]+'45',.5,true,c[j%3]+'10');
        line(spine,c[(j+1)%3]+'8a',.7);
      }
      for(let j=0;j<12;j++){
        const points=[];
        for(let i=0;i<=38;i++){
          const u=i/38;points.push([u*230*grow,(-u*88+Math.sin(u*8-v.motion*.7+j*.12+turn)*(20+u*15)+(j-5.5)*u*4)*grow]);
        }
        line(points,c[j%3]+'38',.45);
      }
      for(let i=0;i<12;i++){
        const u=(v.motion*.09+i/12)%1,x=u*230*grow,y=(-u*88+Math.sin(u*8-v.motion*.7+turn)*(18+u*15))*grow;
        ctx.save();ctx.translate(x,y);ctx.rotate(v.motion*.4+i);oval(0,0,3.2,1,c[i%3]+'b0');ctx.restore();
      }
      ctx.restore();
    }
    function orbits(e,v){
      const c=palettes[5],grow=smooth(e.age/.22),centerY=-65*grow;
      glow(0,centerY,105,'#aad2ca12');
      for(let i=0;i<5;i++){
        const rx=(39+i*14)*grow,ry=rx*(.3+noise(i+e.seed)*.2);
        ctx.save();ctx.translate(Math.sin(i+e.seed)*12,centerY-i*7);ctx.rotate((i-2)*.48+v.motion*.025);
        ring(0,0,rx,ry,c[i%3]+'78',.65);ring(0,0,rx+2,ry+1,c[(i+1)%3]+'18',.45);
        const angle=v.motion*(.24+i*.035)+i*2.4,x=Math.cos(angle)*rx,y=Math.sin(angle)*ry;
        glow(x,y,12,c[i%3]+'28');oval(x,y,2.8+i%2,2.8+i%2,c[i%3]+'d0');
        ring(x,y,5.5,2,c[(i+1)%3]+'65',.55);ctx.restore();
      }
      const constellation=[];
      for(let i=0;i<9;i++){
        const angle=noise(e.seed+i*3)*TAU,r=38+noise(e.seed+i*7)*66;
        const p=[Math.cos(angle)*r*grow,centerY+Math.sin(angle)*r*.78*grow];constellation.push(p);
        star(...p,2+noise(e.seed+i)*2.6,c[i%3],i*.6+v.motion*.04);
      }
      line(constellation.slice(0,5),c[1]+'28',.5);star(0,centerY,6,'#f0dfba',v.motion*.06);
    }
    const painters=[rain,fireworks,balloons,garden,ribbons,orbits];
    function draw(e,{scale=1,ground=400,beat=0,motion=e.age}={}){
      if(e.age<0||e.age>=e.life)return;
      const pose=entrance(e.age),fade=1-smooth((e.age-(e.life-1.6))/1.6),pulse=.5+.5*Math.cos(beat*TAU);
      ctx.save();ctx.translate(e.x,e.y);ctx.scale(scale,scale);ctx.rotate(pose.rotation);ctx.scale(pose.x,pose.y);
      ctx.globalAlpha=smooth(e.age/.09)*fade;
      const opening=1-smooth(e.age/.85);
      if(opening>0){
        const alpha=ctx.globalAlpha;ctx.globalAlpha*=opening;
        ring(0,0,10+e.age*65,4+e.age*15,palettes[e.id][1]+'78',.7);
        for(let i=0;i<9;i++){
          const angle=i/9*TAU+e.seed,r=12+e.age*(30+noise(i+e.seed)*30);
          oval(Math.cos(angle)*r,Math.sin(angle)*r*.7,1.4,.7,palettes[e.id][i%3]+'a0');
        }
        ctx.globalAlpha=alpha;
      }
      ring(0,0,14+pulse*2,3+pulse*.4,palettes[e.id][0]+'28',.5);
      painters[e.id](e,{ground,motion,pulse});
      // A drifting pigment edge leaves the drawing at full scale as it dissolves.
      if(fade<1){
        const alpha=ctx.globalAlpha;ctx.globalAlpha=(1-fade)*fade*.6;
        for(let i=0;i<15;i++){
          const drift=e.age-(e.life-1.6),x=(noise(e.seed+i*2)-.5)*160+Math.sin(i)*drift*13;
          const y=-noise(e.seed+i*3)*105-drift*(9+noise(i)*19);
          ctx.save();ctx.translate(x,y);ctx.rotate(i+drift*.3);oval(0,0,1.8,.7,palettes[e.id][i%3]);ctx.restore();
        }
        ctx.globalAlpha=alpha;
      }
      ctx.restore();
    }
    return {draw};
  }
  return {createPainter,entrance};
});
