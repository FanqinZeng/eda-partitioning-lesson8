from pathlib import Path
import sys,subprocess,json,re,wave,os
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,os.environ.get('L8_MEDIA_PACKAGES',str(ROOT/'.tools/python')));import imageio_ffmpeg,numpy as np
ff=imageio_ffmpeg.get_ffmpeg_exe();film=ROOT/'film/lesson8-full.mp4';tl=json.loads((ROOT/'film/timeline.json').read_text())
p=subprocess.run([ff,'-v','error','-i',str(film),'-f','null','-'],capture_output=True,text=True);assert p.returncode==0,p.stderr
probe=subprocess.run([ff,'-hide_banner','-i',str(film)],capture_output=True,text=True).stderr
assert '1920x1080' in probe and '24 fps' in probe and 'aac' in probe
black=subprocess.run([ff,'-hide_banner','-i',str(film),'-vf','blackdetect=d=0.5:pix_th=0.05','-an','-f','null','-'],capture_output=True,text=True).stderr
assert 'black_start' not in black
previous=0
for c in tl['cues']:
 assert c['start']>=previous and c['end']>c['start'] and c['end']<=tl['duration']+1e-5
 assert c['en'] and c['zh'];previous=c['end']
with wave.open(str(ROOT/'film/work/narration.wav'),'rb') as w:a=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768;rate=w.getframerate()
levels=[]
for c in tl['cues']:
 x=a[round(c['start']*rate):round(c['end']*rate)];rms=float(np.sqrt(np.mean(x*x)));assert rms>.005;levels.append(round(rms,4))
report={'passed':True,'duration':tl['duration'],'resolution':'1920x1080','fps':24,'fullDecode':True,'blackSegmentsOver0_5s':0,'bilingualCues':len(tl['cues']),'subtitleTimesMonotonic':True,'everyNarrationCueNonSilent':True,'narrationRmsRange':[min(levels),max(levels)],'mediaInfo':probe.replace(str(ROOT),'<project>'),'audioSource':tl['audio_source']}
(ROOT/'film/media-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('PASS: full decode, 1080p24, '+str(tl['duration'])+'s, '+str(len(tl['cues']))+' bilingual cues, no black segments >0.5s')
