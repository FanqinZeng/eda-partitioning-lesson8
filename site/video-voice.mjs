/** Two synchronized MP4 sources keep language switching portable across browsers. */
export function createVoicePlayer(video, select, status, {sources, download, storage, onChange}={}) {
 const names={zh:'中文',en:'English'};
 let language='zh',pending=null,recovery=null,serial=0;
 const capture=()=>pending?{...pending.state}:recovery?{...recovery}:{time:video.currentTime||0,play:!video.paused&&!video.ended,rate:video.playbackRate,volume:video.volume,muted:video.muted};
 const describe=()=>{status.textContent=`当前配音：${names[language]} · 画面保留中英双语字幕`;};
 function remember(lang){try{storage?.setItem('lesson8-voice',lang);}catch{}}
 function switchVoice(lang){
  if(!sources[lang])return Promise.resolve(false);
  const state=capture(),id=++serial;
  if(pending){pending.cleanup();pending.resolve(false);pending=null;}
  video.pause();select.value=lang;status.textContent=`正在切换为${names[lang]}配音，保留播放进度…`;video.setAttribute('aria-busy','true');
  return new Promise(resolve=>{
   let positioned=false,settled=false,timeout;
   const cleanup=()=>{clearTimeout(timeout);video.removeEventListener('loadedmetadata',metadata);video.removeEventListener('canplay',ready);video.removeEventListener('seeked',ready);video.removeEventListener('error',failed);};
   const failed=()=>{
    if(id!==serial||settled)return;settled=true;cleanup();recovery={...pending.state};pending=null;video.removeAttribute('aria-busy');status.textContent=`${names[lang]}配音加载失败。可重新选择配音语言，原播放位置已保留。`;resolve(false);
   };
   const metadata=()=>{
    if(id!==serial||settled)return;
    const s=pending.state;video.playbackRate=s.rate;video.volume=s.volume;video.muted=s.muted;
    const end=Number.isFinite(video.duration)?Math.max(0,video.duration-.001):Infinity;
    video.currentTime=Math.max(0,Math.min(s.time,end));positioned=true;ready();
   };
   const ready=()=>{
    if(id!==serial||settled||!positioned||video.seeking||video.readyState<2)return;
    settled=true;cleanup();const s=pending.state;pending=null;recovery=null;language=lang;video.removeAttribute('aria-busy');remember(lang);describe();
    if(download){download.href=sources[lang].split('?')[0];download.textContent=`下载当前配音版（${names[lang]}）`;}
    onChange?.(lang);
    if(s.play)video.play().catch(()=>{status.textContent=`已切换为${names[lang]}配音，请点击播放继续。`;});
    resolve(true);
   };
   pending={state,resolve,cleanup};
   video.addEventListener('loadedmetadata',metadata);video.addEventListener('canplay',ready);video.addEventListener('seeked',ready);video.addEventListener('error',failed);
   timeout=setTimeout(failed,30000);video.src=sources[lang];video.load();
  });
 }
 function seekAndPlay(time){
  if(pending){pending.state.time=time;pending.state.play=true;if(video.readyState>=1)video.currentTime=time;return;}
  if(recovery){recovery.time=time;recovery.play=true;void switchVoice(select.value);return;}
  const seek=()=>{video.currentTime=time;video.play().catch(()=>{});};
  if(video.readyState>=1)seek();else{video.addEventListener('loadedmetadata',seek,{once:true});video.load();}
 }
 select.addEventListener('change',()=>{void switchVoice(select.value);});
 select.value='zh';describe();
 let saved;try{saved=storage?.getItem('lesson8-voice');}catch{}
 if(saved&&saved!=='zh'&&sources[saved])void switchVoice(saved);
 return {switchVoice,seekAndPlay,get language(){return language;}};
}
