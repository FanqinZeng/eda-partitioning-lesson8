"""Synthesize the published English transcript locally and fit the existing scene clock.
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
parser=argparse.ArgumentParser();parser.add_argument('--speaker',default='p226');parser.add_argument('--sample',action='store_true');args=parser.parse_args()
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
 total=round(tl['duration']*RATE);voice=np.zeros(total,dtype=np.float32);records=[]
 scene_ends={s['id']:s['end'] for s in tl['scenes']}
 for i,c in enumerate(cues):
  original_end=c['end'];next_start=cues[i+1]['start'] if i+1<len(cues) else tl['duration']
  deadline=min(next_start-.20,scene_ends[c['scene']]-.15)
  available=deadline-c['start'];raw=decode(source(c));raw_seconds=len(raw)/RATE
  tempo=max(1.08,raw_seconds/max(.1,available-.08));a=decode(source(c),tempo)
  if tempo>1.35:raise RuntimeError(f'English cue needs a shorter spoken wording: {c["id"]}, tempo={tempo:.3f}')
  if len(a)/RATE>available-.01:raise RuntimeError('Cue overruns clock: '+c['id'])
  start=round(c['start']*RATE);voice[start:start+len(a)]=a;c['end']=(start+len(a))/RATE
  records.append(dict(id=c['id'],start=c['start'],end=c['end'],chineseEnd=original_end,deadline=deadline,rawSeconds=round(raw_seconds,4),tempo=round(tempo,5),spokenText=spoken(c)))
 voice*=.66/max(.1,float(np.max(np.abs(voice))))
 # Reuse the original procedural score and effects without the Chinese narration.
 chinese=readwav(OUT/'work/narration.wav')[:,0];mix=readwav(OUT/'film-mix.wav');assert len(mix)==len(chinese)==total
 bed=mix-chinese[:,None];english_mix=bed+voice[:,None]
 writewav(OUT/'film-mix-en.wav',english_mix);writewav(WORK/'narration-en.wav',voice)
 block=480;env=np.sqrt(np.mean(np.pad(voice,(0,(-len(voice))%block)).reshape(-1,block)**2,axis=1))
 by_id={c['id']:c for c in cues}
 for s in tl['scenes']:s['cues']=[by_id[c['id']] for c in s['cues']]
 tl.update(audio_source=f'Coqui TTS 0.22.0 / {MODEL} / {args.speaker}',voice=MODEL,voice_rate='base 1.08x, per-cue timing adjustment',voice_playback_tempo=None,envelope=np.minimum(env/.14,1).round(3).tolist())
 (OUT/'timeline-en.json').write_text(json.dumps(tl,ensure_ascii=False,indent=2))
 for web in [False,True]:
  lines=['WEBVTT',''] if web else []
  for i,c in enumerate(cues):lines+=([] if web else [str(i+1)])+[f'{stamp(c["start"],web)} --> {stamp(c["end"],web)}',c['zh'],c['en'],'']
  (OUT/f'lesson8-english.{"vtt" if web else "srt"}').write_text('\n'.join(lines))
 report=dict(engine='Coqui TTS 0.22.0',model=MODEL,speaker=args.speaker,modelLicense='Apache-2.0 (upstream model registry)',duration=tl['duration'],cues=len(records),maximumTempo=max(r['tempo'] for r in records),allCuesWithinSceneClock=True,records=records)
 (OUT/'english-alignment.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
 print(json.dumps({k:v for k,v in report.items() if k!='records'},ensure_ascii=False,indent=2),flush=True)
if __name__=='__main__':main()
