from pathlib import Path
import sys,subprocess,json,re,wave,os,argparse
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,os.environ.get('L8_MEDIA_PACKAGES',str(ROOT/'.tools/python')));import imageio_ffmpeg,numpy as np
parser=argparse.ArgumentParser();parser.add_argument('--english',action='store_true');args=parser.parse_args()
ff=imageio_ffmpeg.get_ffmpeg_exe();film=ROOT/('film/lesson8-english.mp4' if args.english else 'film/lesson8-full.mp4');tl=json.loads((ROOT/('film/timeline-en.json' if args.english else 'film/timeline.json')).read_text())
p=subprocess.run([ff,'-v','error','-i',str(film),'-f','null','-'],capture_output=True,text=True);assert p.returncode==0,p.stderr
probe=subprocess.run([ff,'-hide_banner','-i',str(film)],capture_output=True,text=True).stderr
assert '1920x1080' in probe and '24 fps' in probe and 'aac' in probe
duration=re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)',probe);assert duration
seconds=int(duration[1])*3600+int(duration[2])*60+float(duration[3]);assert abs(seconds-tl['duration'])<.1
if not args.english:assert tl.get('voice_playback_tempo')==1,'Unexpected audio time compression'
else:
 alignment=json.loads((ROOT/'film/english-alignment.json').read_text());assert alignment['allCuesWithinSceneClock']
 assert alignment['maximumTempo']<=1.35
 chinese=json.loads((ROOT/'film/timeline.json').read_text());assert [(s['start'],s['end']) for s in tl['scenes']]==[(s['start'],s['end']) for s in chinese['scenes']]
black=subprocess.run([ff,'-hide_banner','-i',str(film),'-vf','blackdetect=d=0.5:pix_th=0.05','-an','-f','null','-'],capture_output=True,text=True).stderr
assert 'black_start' not in black
previous=0
for c in tl['cues']:
 assert c['start']>=previous and c['end']>c['start'] and c['end']<=tl['duration']+1e-5
 assert c['en'] and c['zh'];previous=c['end']
with wave.open(str(ROOT/('film/work/english/narration-en.wav' if args.english else 'film/work/narration.wav')),'rb') as w:a=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768;rate=w.getframerate()
levels=[]
for c in tl['cues']:
 x=a[round(c['start']*rate):round(c['end']*rate)];rms=float(np.sqrt(np.mean(x*x)));assert rms>.005;levels.append(round(rms,4))
report={'passed':True,'duration':tl['duration'],'resolution':'1920x1080','fps':24,'fullDecode':True,'blackSegmentsOver0_5s':0,'bilingualCues':len(tl['cues']),'subtitleTimesMonotonic':True,'everyNarrationCueNonSilent':True,'narrationRmsRange':[min(levels),max(levels)],'mediaInfo':probe.replace(str(ROOT),'<project>'),'audioSource':tl['audio_source'],'voiceRate':tl['voice_rate'],'voicePlaybackTempo':tl['voice_playback_tempo']}
(ROOT/('film/media-check-en.json' if args.english else 'film/media-check.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2));print('PASS: '+('English' if args.english else 'Chinese')+' full decode, 1080p24, '+str(tl['duration'])+'s, '+str(len(tl['cues']))+' bilingual cues, no black segments >0.5s')
