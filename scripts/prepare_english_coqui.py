"""Synthesize English locally with a slower voice and short, explicit pauses.
Requires Coqui TTS 0.22, the VCTK/VITS model and an espeak backend. No voice sample.
"""
from pathlib import Path
import argparse,hashlib,json,os,subprocess,wave
import numpy as np
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'film';WORK=OUT/'work/english';WORK.mkdir(parents=True,exist_ok=True)
os.environ.setdefault('TTS_HOME',str(ROOT/'.tools/tts-cache'))
os.environ.setdefault('NUMBA_CACHE_DIR',str(ROOT/'.tools/numba-cache'))
os.environ.setdefault('HF_HOME',str(ROOT/'.tools/hf-cache'))
os.environ.setdefault('MPLCONFIGDIR',str(ROOT/'.tools/matplotlib'))
MODEL='tts_models/en/vctk/vits';RATE=48000
parser=argparse.ArgumentParser();parser.add_argument('--speaker',default='p226');parser.add_argument('--sample',action='store_true');parser.add_argument('--tempo',type=float,default=.88);args=parser.parse_args()
FF=os.environ.get('L8_FFMPEG',str(ROOT.parent/'.tools/python/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1'))
tl=json.loads((OUT/'timeline.json').read_text());cues=tl['cues']
def spoken(c):
 return c['en'].replace('–',' ').replace('−',' minus ').replace('cutsize','cut size')
def source(c):
 key=hashlib.sha256((MODEL+args.speaker+spoken(c)).encode()).hexdigest()[:12]
 return WORK/f'{c["id"]}-{key}.wav'
def decode(p,tempo=1):
 cmd=[FF,'-v','error','-i',str(p)]
 if tempo!=1:cmd+=['-af',f'atempo={tempo:.8f}']
 a=np.frombuffer(subprocess.check_output(cmd+['-f','f32le','-ac','1','-ar',str(RATE),'-']),dtype='<f4').copy()
 active=np.flatnonzero(np.abs(a)>.008)
 if not len(active):raise RuntimeError('Silent cue: '+str(p))
 return a[max(0,active[0]-2400):min(len(a),active[-1]+3840)]
def readwav(p):
 with wave.open(str(p),'rb') as w:
  assert w.getframerate()==RATE and w.getsampwidth()==2
  return np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,w.getnchannels()).astype(np.float32)/32767

def writewav(p,a):
 with wave.open(str(p),'wb') as w:
  w.setnchannels(1 if a.ndim==1 else a.shape[1]);w.setsampwidth(2);w.setframerate(RATE);w.writeframes((np.clip(a,-.97,.97)*32767).astype('<i2').tobytes())
def stamp(t,web=False):
 ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
 return f'{h:02}:{m:02}:{s:02}{"." if web else ","}{ms:03}'
def main():
 pending=[c for c in (cues[:1] if args.sample else cues) if not source(c).exists()]
 if pending:
  import torch
  from TTS.api import TTS
  torch.manual_seed(8);torch.set_num_threads(4)
  api=TTS(MODEL,progress_bar=False).to('cpu')
  if args.speaker not in api.speakers:raise ValueError('Unknown preset speaker '+args.speaker)
  for i,c in enumerate(pending):
   api.tts_to_file(text=spoken(c),speaker=args.speaker,file_path=str(source(c)))
   print(f'Coqui English {i+1}/{len(pending)}: {c["id"]}',flush=True)
 if args.sample:print('Sample ready:',source(cues[0]),flush=True);return
 if not .7<=args.tempo<=1:raise ValueError('Use a natural slower tempo between 0.7 and 1.0')
 chinese_tl=json.loads(json.dumps(tl));records=[];clips={};position=0
 lead=round(.35*RATE);gap=round(.55*RATE);tail=round(.60*RATE)
 by_id={c['id']:c for c in cues}
 for s in tl['scenes']:
  s['start']=position/RATE;cursor=position+lead
  for i,old in enumerate(s['cues']):
   c=by_id[old['id']];original_start=c['start'];original_end=c['end'];raw=decode(source(c));a=decode(source(c),args.tempo);clips[c['id']]=a
   c.update(start=cursor/RATE,end=(cursor+len(a))/RATE);cursor+=len(a)
   records.append(dict(id=c['id'],start=c['start'],end=c['end'],chineseStart=original_start,chineseEnd=original_end,rawSeconds=round(len(raw)/RATE,4),tempo=args.tempo,spokenText=spoken(c)))
   if i<len(s['cues'])-1:cursor+=gap
  position=cursor+tail;s['end']=position/RATE;s['target_seconds']=(position-round(s['start']*RATE))/RATE;s['cues']=[by_id[c['id']] for c in s['cues']]
 total=position;tl['duration']=total/RATE;voice=np.zeros(total,dtype=np.float32)
 for c in cues:
  a=clips[c['id']];start=round(c['start']*RATE);voice[start:start+len(a)]=a
 voice*=.66/max(.1,float(np.max(np.abs(voice))))
 # Regenerate the same procedural score against the new English scene clock.
 music=np.zeros(total,dtype=np.float32);sfx=np.zeros(total,dtype=np.float32)
 chords=[[146.832,220,293.665,369.994],[123.471,184.997,246.942,369.994],[97.999,146.832,195.998,293.665],[110,164.814,220,329.628]]
 for j,at in enumerate(np.arange(0,total/RATE,7.5)):
  i=round(at*RATE);n=min(round(8.8*RATE),total-i);u=np.arange(n)/RATE;en=np.minimum(u/1.1,1)*np.minimum((8.8-u)/2,1)
  for f in chords[j%4]:music[i:i+n]+=.0036*np.sin(2*np.pi*f*u)*en
  for k,f in enumerate(chords[j%4][1:3]):
   a=i+round((.4+k*.9)*RATE);nn=min(round(1.7*RATE),total-a)
   if nn<=0:continue
   v=np.arange(nn)/RATE;music[a:a+nn]+=.009*np.sin(2*np.pi*f*2*v)*np.exp(-3.4*v)*(1-np.exp(-70*v))
 points=[s['start']+.7 for s in tl['scenes'] if s['id'] in ['objective','roundrobin','firstsplit','secondsplit','compare','refinement','exact']]
 for j,at in enumerate(points):
  i=round(at*RATE);n=min(round(.22*RATE),total-i);u=np.arange(n)/RATE;sfx[i:i+n]+=.027*np.sin(2*np.pi*(660+(j%3)*165)*u)*np.exp(-16*u)*(1-np.exp(-140*u))
 block=480;env=np.sqrt(np.mean(np.pad(voice,(0,(-len(voice))%block)).reshape(-1,block)**2,axis=1))
 music*=1-.45*np.repeat(np.minimum(env/.14,1),block)[:total];music*=np.minimum(np.arange(total)/(RATE*.8),1)*np.minimum((total-np.arange(total))/(RATE*1.5),1)
 writewav(OUT/'film-mix-en.wav',np.column_stack([voice+music+sfx,voice+.97*music+sfx]));writewav(WORK/'narration-en.wav',voice)
 tl.update(audio_source=f'Coqui TTS 0.22.0 / {MODEL} / {args.speaker}',voice=MODEL,voice_rate=f'constant {args.tempo}x, 0.55s sentence pause / 0.95s scene pause',voice_playback_tempo=args.tempo,envelope=np.minimum(env/.14,1).round(3).tolist())
 (OUT/'timeline-en.json').write_text(json.dumps(tl,ensure_ascii=False,indent=2))
 for web in [False,True]:
  lines=['WEBVTT',''] if web else []
  for i,c in enumerate(cues):lines+=([] if web else [str(i+1)])+[f'{stamp(c["start"],web)} --> {stamp(c["end"],web)}',c['zh'],c['en'],'']
  (OUT/f'lesson8-english.{"vtt" if web else "srt"}').write_text('\n'.join(lines))
 chapters=[dict(id=s['id'],title=s['title'],start=s['start'],end=s['end']) for s in tl['scenes']]
 (OUT/'chapters-en.json').write_text(json.dumps(chapters,ensure_ascii=False,indent=2))
 def anchors(t):return [v for s in t['scenes'] for v in [s['start']]+[p for c in s['cues'] for p in [c['start'],c['end']]]]+[t['duration']]
 (OUT/'voice-timing.json').write_text(json.dumps(dict(zh=anchors(chinese_tl),en=anchors(tl)),indent=2))
 pauses=[cues[i+1]['start']-c['end'] for i,c in enumerate(cues[:-1])]
 report=dict(engine='Coqui TTS 0.22.0',model=MODEL,speaker=args.speaker,modelLicense='Apache-2.0 (upstream model registry)',duration=tl['duration'],cues=len(records),maximumTempo=args.tempo,sentencePauseSeconds=.55,scenePauseSeconds=.95,averageCueGap=round(float(np.mean(pauses)),4),maximumCueGap=round(max(pauses),4),allCuesWithinSceneClock=True,records=records)
 (OUT/'english-alignment.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 print(json.dumps({k:v for k,v in report.items() if k!='records'},ensure_ascii=False,indent=2),flush=True)
if __name__=='__main__':main()
