import { createRoot } from 'react-dom/client';
import { createElement, Fragment } from 'react';
import SiteNavigation from '../components/SiteNavigation';
import PreviewDebugPanel from '../components/PreviewDebugPanel';

createRoot(document.getElementById('site-navigation')).render(createElement(Fragment, null, createElement(SiteNavigation), createElement(PreviewDebugPanel)));

const WIPE_VH=80,TITLE_Q=.25,ABOUT_IN=[.18,.27],ABOUT_OUT=[.333,.373],
  SEC2_RAMP=[.44,.56],FLY=[.565,.655],FLY_STEP=.20,FLY_DUR=.60,
  STAT_FROM=.74,STAT_IN=.34,STAT_HOLD=.40,SEC2_ENTER=[.44,.49],
  SEC2_SHOW=[.43,.77],S2_EMERGE=.84,PIN_FRAC=.66,
  BAND_HL=130,BAND_TOP=220,BAND_BOT=160,LERP_TAU=8,SNAP=.002,
  LRU_MAX=24,LEAD=24,WATCHDOG=60000,FADE_A=[.93,.98],WIPE_LEAD=1,A=1/3,B=2/3;
const $=s=>document.querySelector(s),clamp=v=>Math.max(0,Math.min(1,v));
const ramp=(v,a,b)=>clamp((v-a)/(b-a)),expoOut=t=>t>=1?1:1-2**(-10*clamp(t)),easeIn=t=>t*t;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const stage=$('#stage'),ra=$('#ra'),rb=$('#rb'),title=$('.title'),about=$('.about'),
  sec2=$('#sec2'),strip=$('#strip'),blocks=[...strip.querySelectorAll('[data-block]')],
  stats=[...document.querySelectorAll('[data-stat]')],cols=[...$('.w-list').children];
let W=innerWidth,H=innerHeight,span=1,wipe=.1,s2Start=0,s2Pin=0,geometry=[],visible=[true,false,false],last=performance.now();
const titleOut=A*TITLE_Q,titleIn=B+(1-B)*(1-TITLE_Q);
const writes=new WeakMap();
function css(el,key,value){let cache=writes.get(el);if(!cache){cache={};writes.set(el,cache)}if(cache[key]!==value){el.style.setProperty(key,value);cache[key]=value}}
function showPage(){requestAnimationFrame(()=>document.documentElement.classList.add('is-ready'))}
document.fonts.ready.then(()=>{showPage();measure()});setTimeout(showPage,2500);

function nearestIndex(bank,t){let lo=0,hi=bank.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(bank[mid].ts<t)lo=mid+1;else hi=mid}return lo>0&&Math.abs(bank[lo-1].ts-t)<Math.abs(bank[lo].ts-t)?lo-1:lo}
function createClip(video,canvas){
  const ctx=canvas.getContext('2d');
  const clip={video,canvas,bank:[],dur:0,ready:false,status:'video',time:0,painted:-1,request:0,cache:new Map(),pending:new Map()};
  video.addEventListener('loadedmetadata',()=>{clip.dur=video.duration;video.currentTime=.001;video.pause()});
  if(video.readyState>=1){clip.dur=video.duration;video.pause()}
  clip.revert=()=>{clip.ready=false;clip.status='video';canvas.classList.remove('is-live');clip.request++;for(const b of clip.cache.values())b.close();clip.cache.clear()};
  async function bitmap(index){
    if(clip.cache.has(index)){const b=clip.cache.get(index);clip.cache.delete(index);clip.cache.set(index,b);return b}
    if(clip.pending.has(index))return clip.pending.get(index);
    const token=clip.request;
    const task=createImageBitmap(clip.bank[index].blob).then(b=>{if(token!==clip.request){b.close();return null}clip.cache.set(index,b);while(clip.cache.size>LRU_MAX){const first=clip.cache.keys().next().value;clip.cache.get(first).close();clip.cache.delete(first)}return b}).finally(()=>clip.pending.delete(index));
    clip.pending.set(index,task);return task;
  }
  clip.render=t=>{
    if(!clip.ready||!clip.bank.length){if(Number.isFinite(video.duration)&&Math.abs(video.currentTime-t)>.01&&!video.seeking)video.currentTime=Math.min(t,Math.max(0,video.duration-.001));return}
    const index=nearestIndex(clip.bank,t);clip.target=index;
    if(clip.painted===index)return;
    bitmap(index).then(b=>{if(!b||!clip.ready||clip.target!==index||clip.painted===index)return;if(canvas.width!==b.width||canvas.height!==b.height){canvas.width=b.width;canvas.height=b.height}ctx.drawImage(b,0,0);clip.painted=index;canvas.classList.add('is-live');for(let d=-1;d<=2;d++){const i=index+d;if(i>=0&&i<clip.bank.length)bitmap(i).catch(()=>{})}}).catch(clip.revert);
  };
  clip.shareBank=source=>{clip.bank=source.bank;clip.dur=source.dur;clip.ready=source.ready;clip.status=source.status};
  return clip;
}
const clips=[1,2,3].map(i=>createClip($(`#v${i}`),$(`#c${i}`)));

// Demux once. All layers reuse the same compressed frame bank.
async function buildBank(){
  const primary=clips[0];
  if(reduced.matches||!window.VideoDecoder||!window.MP4Box||!window.createImageBitmap)return;
  primary.status='building';
  const controller=new AbortController();
  let parser,decoder,run=0,deadline;
  const timedOut=new Promise((_,reject)=>{deadline=setTimeout(()=>{run++;controller.abort();if(decoder&&decoder.state!=='closed')decoder.close();reject(new Error('Frame bank timeout'))},WATCHDOG)});
  try{
    await Promise.race([(async()=>{
      const response=await fetch(primary.video.getAttribute('src'),{signal:controller.signal});
      if(!response.ok)throw new Error('Video fetch failed');
      const buffer=await response.arrayBuffer();
      const demux=await new Promise((resolve,reject)=>{
        parser=window.MP4Box.createFile();let samples=[],config,total=0;
        parser.onError=reject;
        parser.onReady=info=>{
          try{
            const track=info.videoTracks[0];if(!track)throw new Error('No video track');
            primary.dur=track.duration/track.timescale;total=track.nb_samples;
            const entry=parser.getTrackById(track.id).mdia.minf.stbl.stsd.entries[0];
            const box=entry.avcC||entry.hvcC||entry.vpcC||entry.av1C;
            let description;
            if(box){const stream=new window.DataStream(undefined,0,window.DataStream.BIG_ENDIAN);box.write(stream);description=new Uint8Array(stream.buffer,8)}
            config={codec:track.codec,codedWidth:track.video.width,codedHeight:track.video.height,description};
            // Validate the codec synchronously inside onReady; output decoding follows extraction.
            decoder=new VideoDecoder({output:f=>f.close(),error:()=>{}});decoder.configure(config);decoder.close();
            parser.setExtractionOptions(track.id,null,{nbSamples:1000});parser.start();
          }catch(error){reject(error)}
        };
        parser.onSamples=(_id,_user,chunk)=>{samples.push(...chunk);if(samples.length>=total)resolve({samples,config})};
        buffer.fileStart=0;parser.appendBuffer(buffer);parser.flush();
      });
      async function decode(hardwareAcceleration){
        const token=++run,bank=[],jobs=new Set();let error=null;
        decoder=new VideoDecoder({
          output(frame){
            if(token!==run){frame.close();return}
            const ts=frame.timestamp/1e6;
            const off=document.createElement('canvas');off.width=frame.displayWidth;off.height=frame.displayHeight;
            try{off.getContext('2d').drawImage(frame,0,0,off.width,off.height)}catch(e){error=e}finally{frame.close()}
            let job;
            job=new Promise((resolve,reject)=>off.toBlob(blob=>blob?resolve(blob):reject(new Error('Frame conversion failed')),'image/webp',.96))
              .then(blob=>{if(token===run)bank.push({ts,blob})}).catch(e=>{error=e}).finally(()=>jobs.delete(job));
            jobs.add(job);
          },error(e){error=e}
        });
        decoder.configure({...demux.config,hardwareAcceleration});
        try{
          for(const sample of demux.samples){
            while(decoder.decodeQueueSize+jobs.size>=LEAD){await new Promise(r=>setTimeout(r,4));if(error)throw error;if(token!==run)throw new Error('Decode cancelled')}
            if(error)throw error;if(token!==run)throw new Error('Decode cancelled');
            decoder.decode(new EncodedVideoChunk({type:sample.is_sync?'key':'delta',timestamp:Math.round(sample.cts/sample.timescale*1e6),duration:Math.round(sample.duration/sample.timescale*1e6),data:sample.data}));
          }
          await decoder.flush();await Promise.all(jobs);if(error)throw error;if(token!==run||!bank.length)throw new Error('No decoded frames');
          bank.sort((a,b)=>a.ts-b.ts);return bank;
        }finally{if(decoder.state!=='closed')decoder.close()}
      }
      let bank;
      try{bank=await decode('no-preference')}catch(error){if(controller.signal.aborted)throw error;bank=await decode('prefer-software')}
      if(controller.signal.aborted||reduced.matches)return;
      primary.bank=bank;primary.ready=true;primary.status='ready';clips.slice(1).forEach(c=>c.shareBank(primary));
    })(),timedOut]);
  }catch(error){run++;clips.forEach(c=>c.revert());console.info('PLATE: native video scrub fallback.',error.message||error)}
  finally{clearTimeout(deadline);if(parser)parser.stop()}
}

function measure(){
  W=innerWidth;H=innerHeight;span=Math.max(1,$('.runway').offsetHeight-H);wipe=Math.min(.28,(WIPE_VH/100*H)/span);
  // Keep the reference coordinates unless live font metrics would overlap the last row.
  blocks[3].style.top='';
  const minDescTop=blocks[2].offsetTop+blocks[2].offsetHeight+Math.max(24,W*.02);
  if(blocks[3].offsetTop<minDescTop)blocks[3].style.top=`${minDescTop}px`;
  geometry=blocks.map(el=>({top:el.offsetTop,height:el.offsetHeight}));
  s2Start=S2_EMERGE*H-geometry[0].top;
  const list=geometry[2],desc=geometry[3],bottom=Math.max(list.top+list.height,desc.top+desc.height);
  s2Pin=PIN_FRAC*H-(list.top+bottom)/2;
}
function exit(el,e){css(el,'--exit',e.toFixed(3));el.classList.toggle('is-exiting',e>0&&e<1);el.classList.toggle('is-gone',e>=1);el.setAttribute('aria-hidden',String(e>=1))}
function updateTitle(p){exit(title,p<titleOut?ramp(p,0,titleOut):p>titleIn?1-ramp(p,titleIn,1):1)}
function updateStats(p){const slot=(titleIn-STAT_FROM)/stats.length;stats.forEach((el,i)=>{const q=(p-STAT_FROM-i*slot)/slot;let e=1;if(q>=0&&q<1)e=q<STAT_IN?1-q/STAT_IN:q<STAT_IN+STAT_HOLD?0:(q-STAT_IN-STAT_HOLD)/(1-STAT_IN-STAT_HOLD);exit(el,clamp(e))})}
function updateAbout(p){const e=expoOut(ramp(p,...ABOUT_IN))*(1-expoOut(ramp(p,...ABOUT_OUT)));css(about,'--in',e.toFixed(3));about.classList.toggle('is-anim',e>0&&e<1);about.classList.toggle('is-hidden',e<=0);about.setAttribute('aria-hidden',String(e<=0))}
function updateReveals(p){const a=ramp(p,A,A+wipe),b=ramp(p,B,B+wipe);css(ra,'--reveal',a.toFixed(4));css(rb,'--reveal',b.toFixed(4));css(stage,'--stage-out',ramp(a,...FADE_A).toFixed(4));stage.classList.toggle('is-covered',a>=1);ra.classList.toggle('is-covered',b>=1);visible=[a<1,a>0&&b<1,b>0]}
function updateSec2(p){
  const show=p>=SEC2_SHOW[0]&&p<=SEC2_SHOW[1];sec2.classList.toggle('is-hidden',!show);sec2.setAttribute('aria-hidden',String(!show));if(!show)return;
  const y=reduced.matches?s2Pin:s2Start+(s2Pin-s2Start)*ramp(p,...SEC2_RAMP);css(strip,'--s2y',`${y.toFixed(2)}px`);
  blocks.forEach((el,i)=>{const top=geometry[i].top+y,bottom=top+geometry[i].height;let o=Math.min(expoOut((top-BAND_HL)/BAND_TOP),expoOut((H-bottom)/BAND_BOT));if(i===0){o*=expoOut(ramp(p,...SEC2_ENTER));css(el,'--wb',`${((1-o)**2*6).toFixed(2)}px`);el.classList.toggle('is-entering',o>0&&o<1)}css(el,'--o',o.toFixed(3))});
  const f=ramp(p,...FLY);cols.forEach(col=>[...col.children].forEach((row,i)=>{const fly=reduced.matches?0:easeIn(ramp(f,i*FLY_STEP,i*FLY_STEP+FLY_DUR));css(row,'--fly',fly.toFixed(3));row.classList.toggle('is-flying',fly>0&&fly<1)}));
}
function updateScrub(p,dt){clips.forEach((clip,i)=>{if(!visible[i])return;const dur=clip.dur||clips[0].dur;if(!Number.isFinite(dur)||dur<=0)return;const lead=Math.min(WIPE_LEAD,dur/3),target=reduced.matches?0:p*Math.max(0,dur-2*lead)+i*lead;clip.time+= (target-clip.time)*(1-Math.exp(-dt*LERP_TAU));if(Math.abs(target-clip.time)<SNAP)clip.time=target;clip.render(clip.time)})}
function drive(p,dt=1){p=clamp(p);updateTitle(p);updateStats(p);updateAbout(p);updateReveals(p);updateSec2(p);updateScrub(p,dt)}
function progress(){return clamp(scrollY/span)}
function frame(now){if(W!==innerWidth||H!==innerHeight)measure();drive(progress(),Math.min(.1,(now-last)/1000));last=now;requestAnimationFrame(frame)}
let resizeTimer;function resize(){clearTimeout(resizeTimer);resizeTimer=setTimeout(measure,120)}
addEventListener('resize',resize);addEventListener('orientationchange',resize);addEventListener('load',()=>{measure();buildBank()});
reduced.addEventListener('change',()=>{if(reduced.matches)clips.forEach(c=>c.revert());else buildBank();measure()});
const dialog=$('#contact-dialog');dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
document.querySelectorAll('[data-back-top]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'})}));
$('[data-footer-contact]').addEventListener('click',()=>dialog.showModal());
const footerDialog=$('#footer-dialog');
const aboutTopics=new Set(['About','Creations','AI Agents','Creative Process','Studio in Action']);
document.querySelectorAll('[data-footer-info]').forEach(button=>button.addEventListener('click',()=>{
  const topic=button.dataset.footerInfo;
  $('#footer-dialog-title').textContent=topic;
  $('#footer-dialog-copy').textContent=aboutTopics.has(topic)?'Coming soon in About Cimora. Explore our creations, meet the AI agents, and see the studio in action.':topic==='Studio'?'The studio entry is not available in this preview yet.':topic==='Privacy Policy'||topic==='Terms of Use'?'This page is not available yet.':`Our ${topic} channel is coming soon.`;
  footerDialog.showModal();
}));
footerDialog.querySelector('button').addEventListener('click',()=>footerDialog.close());
Object.defineProperty(window,'__plate',{value:Object.freeze({get clips(){return clips.map(c=>Object.freeze({dur:c.dur,ready:c.ready,status:c.status,frames:c.bank.length,time:c.time,cached:c.cache.size}))},get map(){return Object.freeze({A,B,wipe,titleOut,titleIn,span})},get aboutIn(){return [...ABOUT_IN]},get stats(){return stats.map(el=>({exit:el.style.getPropertyValue('--exit'),hidden:el.classList.contains('is-gone')}))},get sec2(){return {s2Start,s2Pin,geometry:geometry.map(g=>({...g})),hidden:sec2.classList.contains('is-hidden')}},p:progress,drive:p=>drive(p),seek(i,t){if(clips[i]){clips[i].time=t;clips[i].render(t)}}}),writable:false});
measure();drive(progress());requestAnimationFrame(frame);
