import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createVoicePlayer,mapVoiceTime} from '../site/video-voice.mjs';
import {readFileSync} from 'node:fs';
class Media extends EventTarget {
 constructor(){super();this._time=123.4;this.paused=true;this.ended=false;this.playbackRate=1.25;this.volume=.35;this.muted=true;this.readyState=4;this.duration=540;this.seeking=false;this.attributes={};}
 get currentTime(){return this._time;}
 set currentTime(t){this._time=t;this.seeking=true;queueMicrotask(()=>{this.seeking=false;this.readyState=4;this.dispatchEvent(new Event('seeked'));});}
 pause(){this.paused=true;}
 play(){this.paused=false;return Promise.resolve();}
 load(){this.readyState=0;}
 metadata(){this.readyState=1;this.dispatchEvent(new Event('loadedmetadata'));}
 setAttribute(k,v){this.attributes[k]=v;}
 removeAttribute(k){delete this.attributes[k];}
}
function setup(timing){const video=new Media(),select=new EventTarget(),status={},download={},saved=new Map();const storage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};const player=createVoicePlayer(video,select,status,{sources:{zh:'zh.mp4?v=3',en:'en.mp4?v=3'},download,storage,timing});return {video,select,status,download,saved,player};}
test('paused language switch keeps timestamp, speed, volume and mute',async()=>{const s=setup(),p=s.player.switchVoice('en');s.video.metadata();assert.equal(await p,true);assert.equal(s.video.currentTime,123.4);assert.equal(s.video.paused,true);assert.equal(s.video.playbackRate,1.25);assert.equal(s.video.volume,.35);assert.equal(s.video.muted,true);assert.equal(s.player.language,'en');assert.equal(s.download.href,'en.mp4');assert.equal(s.saved.get('lesson8-voice'),'en');});
test('playing video resumes after language switch',async()=>{const s=setup();s.video.paused=false;const p=s.player.switchVoice('en');s.video.metadata();await p;assert.equal(s.video.paused,false);assert.equal(s.video.currentTime,123.4);});
test('rapid changes preserve the original playback intent and cancel stale switch',async()=>{const s=setup();s.video.paused=false;const first=s.player.switchVoice('en'),second=s.player.switchVoice('zh');assert.equal(await first,false);s.video.metadata();assert.equal(await second,true);assert.equal(s.video.src,'zh.mp4?v=3');assert.equal(s.video.currentTime,123.4);assert.equal(s.video.paused,false);assert.equal(s.player.language,'zh');});
test('chapter navigation during a pending switch wins over the old timestamp',async()=>{const s=setup(),p=s.player.switchVoice('en');s.player.seekAndPlay(340.25);s.video.metadata();await p;assert.equal(s.video.currentTime,340.25);assert.equal(s.video.paused,false);});
test('a failed source can recover without losing position',async()=>{const s=setup(),first=s.player.switchVoice('en');s.video.dispatchEvent(new Event('error'));assert.equal(await first,false);assert.match(s.status.textContent,/加载失败/);const second=s.player.switchVoice('zh');s.video.metadata();assert.equal(await second,true);assert.equal(s.video.currentTime,123.4);assert.equal(s.video.paused,true);});
const timing=JSON.parse(readFileSync(new URL('../film/voice-timing.json',import.meta.url)));
test('different voice clocks preserve every sentence boundary and progress',()=>{
 assert.equal(timing.zh.length,timing.en.length);
 for(let i=0;i<timing.zh.length;i++){
  assert.equal(mapVoiceTime(timing.zh[i],'zh','en',timing),timing.en[i]);
  if(i===timing.zh.length-1)continue;
  assert.ok(timing.zh[i+1]>timing.zh[i]&&timing.en[i+1]>timing.en[i]);
  const midway=(timing.zh[i]+timing.zh[i+1])/2;
  assert.ok(Math.abs(mapVoiceTime(mapVoiceTime(midway,'zh','en',timing),'en','zh',timing)-midway)<1e-8);
 }
});
test('switching differently paced voices maps the current sentence and back',async()=>{
 const s=setup(timing),initial=s.video.currentTime,p=s.player.switchVoice('en');s.video.metadata();await p;
 assert.equal(s.video.currentTime,mapVoiceTime(initial,'zh','en',timing));
 const back=s.player.switchVoice('zh');s.video.metadata();await back;assert.ok(Math.abs(s.video.currentTime-initial)<1e-8);
});
test('rapid switching and chapter seeking use the correct voice clock',async()=>{
 const s=setup(timing),first=s.player.switchVoice('en'),second=s.player.switchVoice('zh');assert.equal(await first,false);s.video.metadata();await second;assert.equal(s.video.currentTime,123.4);
 const next=s.player.switchVoice('en');s.player.seekAndPlay(200);s.video.metadata();await next;assert.equal(s.video.currentTime,200);
 const failed=s.player.switchVoice('zh');s.video.dispatchEvent(new Event('error'));await failed;
 const recovery=s.player.switchVoice('en');s.video.metadata();await recovery;assert.equal(s.video.currentTime,200);
});
test('visible old-language chapters still seek to matching content while a switch loads',async()=>{
 const s=setup(timing),p=s.player.switchVoice('en');s.player.seekAndPlay(340,'zh');s.video.metadata();await p;
 assert.equal(s.video.currentTime,mapVoiceTime(340,'zh','en',timing));assert.equal(s.video.paused,false);
});
