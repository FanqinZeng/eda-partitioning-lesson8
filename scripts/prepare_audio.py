from pathlib import Path
import sys,json,asyncio,hashlib,subprocess,wave,os,argparse
parser=argparse.ArgumentParser();choice=parser.add_mutually_exclusive_group(required=True);choice.add_argument('--edge',action='store_true',help='Send the Chinese teaching script to Microsoft Edge TTS (requires authorization).');choice.add_argument('--offline',action='store_true',help='Use installed macOS speech without external TTS.');args=parser.parse_args()
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,os.environ.get('L8_MEDIA_PACKAGES',str(ROOT/'.tools/python')))
import edge_tts,imageio_ffmpeg,numpy as np
OUT=ROOT/'film';WORK=OUT/'work';WORK.mkdir(exist_ok=True)
script=json.loads((OUT/'script.json').read_text());scenes=script['scenes'];cues=[c for s in scenes for c in s['cues']]
FF=imageio_ffmpeg.get_ffmpeg_exe();RATE=48000
def file(c):
    key=hashlib.sha256((('edge' if args.edge else 'offline')+script['voice']+script['voice_rate']+c['zh']).encode()).hexdigest()[:12]
    return WORK/f'{c["id"]}-{key}{".mp3" if args.edge else ".aiff"}'
async def generate():
    sem=asyncio.Semaphore(3);done=0
    async def one(c):
        nonlocal done
        p=file(c)
        if not p.exists() or p.stat().st_size<1000:
            async with sem:
                for attempt in range(3):
                    try:
                        if args.edge:await edge_tts.Communicate(c['zh'],script['voice'],rate=script['voice_rate']).save(str(p))
                        else:
                            source=p.with_suffix('.txt');source.write_text(c['zh']);await asyncio.to_thread(subprocess.run,['/usr/bin/say','-v','Reed (中文（中国大陆）)','-r','205','-f',str(source),'-o',str(p)],check=True)
                        break
                    except Exception:
                        if attempt==2:raise
                        await asyncio.sleep(1+attempt)
        done+=1
        if done%5==0 or done==len(cues):print(f'Voice cues {done}/{len(cues)}',flush=True)
    await asyncio.gather(*(one(c) for c in cues))
def decode(p,tempo=1):
    cmd=[FF,'-v','error','-i',str(p)]
    if tempo!=1:cmd+=['-af',f'atempo={tempo}']
    a=np.frombuffer(subprocess.check_output(cmd+['-f','f32le','-ac','1','-ar',str(RATE),'-']),dtype='<f4').copy()
    active=np.flatnonzero(np.abs(a)>.008)
    return a[max(0,active[0]-3360):min(len(a),active[-1]+4800)] if len(active) else a
def stamp(t,web=False):
    ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
    return f'{h:02}:{m:02}:{s:02}{"." if web else ","}{ms:03}'
def wav(path,a):
    with wave.open(str(path),'wb') as w:
        w.setnchannels(1 if a.ndim==1 else 2);w.setsampwidth(2);w.setframerate(RATE);w.writeframes((np.clip(a,-.97,.97)*32767).astype('<i2').tobytes())
def main():
    asyncio.run(generate());clips={c['id']:decode(file(c)) for c in cues};gap=.27
    minimum=[sum(len(clips[c['id']])/RATE for c in s['cues'])+gap*(len(s['cues'])-1)+.9 for s in scenes]
    minTotal=sum(minimum)
    # Keep the explicitly requested voice rate. Extend the film rather than
    # silently time-compressing mathematical explanations to a fixed runtime.
    target=max(script['target_seconds'],minTotal)
    extras=[max(0,s['target_seconds']-m) for s,m in zip(scenes,minimum)]
    rest=max(0,target-sum(minimum));weight=sum(extras) or len(scenes)
    durations=[m+rest*(e if sum(extras) else 1)/weight for m,e in zip(minimum,extras)]
    total=round(sum(durations)*RATE);voice=np.zeros(total,dtype=np.float32);position=0
    for s,duration in zip(scenes,durations):
        n=round(duration*RATE);s['start']=position/RATE;s['end']=(position+n)/RATE
        base=sum(len(clips[c['id']]) for c in s['cues'])+round(gap*RATE)*(len(s['cues'])-1)
        slack=n-base;lead=min(round(.55*RATE),slack//3);cursor=position+lead
        # Distribute thinking time after spoken cues, with more time after the final cue.
        extra=max(0,slack-lead);holds=[round(extra/(len(s['cues'])+1))]*(len(s['cues'])-1)
        for i,c in enumerate(s['cues']):
            a=clips[c['id']];c.update(start=cursor/RATE,end=(cursor+len(a))/RATE,scene=s['id'])
            voice[cursor:cursor+len(a)]=a;cursor+=len(a)
            if i<len(s['cues'])-1:cursor+=round(gap*RATE)+holds[i]
        position+=n
    voice*=.66/max(.1,float(np.max(np.abs(voice))));music=np.zeros(total,dtype=np.float32);sfx=np.zeros(total,dtype=np.float32)
    chords=[[146.832,220,293.665,369.994],[123.471,184.997,246.942,369.994],[97.999,146.832,195.998,293.665],[110,164.814,220,329.628]]
    for j,at in enumerate(np.arange(0,total/RATE,7.5)):
        i=round(at*RATE);n=min(round(8.8*RATE),total-i);u=np.arange(n)/RATE;env=np.minimum(u/1.1,1)*np.minimum((8.8-u)/2,1)
        for f in chords[j%4]:music[i:i+n]+=.0036*np.sin(2*np.pi*f*u)*env
        for k,f in enumerate(chords[j%4][1:3]):
            a=i+round((.4+k*.9)*RATE);nn=min(round(1.7*RATE),total-a);v=np.arange(nn)/RATE
            music[a:a+nn]+=.009*np.sin(2*np.pi*f*2*v)*np.exp(-3.4*v)*(1-np.exp(-70*v))
    points=[s['start']+.7 for s in scenes if s['id'] in ['objective','roundrobin','firstsplit','secondsplit','compare','refinement','exact']]
    for j,at in enumerate(points):
        i=round(at*RATE);n=min(round(.22*RATE),total-i);u=np.arange(n)/RATE;sfx[i:i+n]+=.027*np.sin(2*np.pi*(660+(j%3)*165)*u)*np.exp(-16*u)*(1-np.exp(-140*u))
    block=480;padded=np.pad(voice,(0,(-len(voice))%block));env=np.sqrt(np.mean(padded.reshape(-1,block)**2,axis=1));duck=np.repeat(np.minimum(env/.14,1),block)[:total]
    music*=1-.45*duck;fade=np.minimum(np.arange(total)/(RATE*.8),1)*np.minimum((total-np.arange(total))/(RATE*1.5),1);music*=fade
    mix=np.column_stack([voice+music+sfx,voice+.97*music+sfx]);wav(OUT/'film-mix.wav',mix);wav(WORK/'narration.wav',voice)
    script.update(duration=total/RATE,cues=cues,envelope_fps=100,envelope=np.minimum(env/.14,1).round(3).tolist(),audio_source='Microsoft Edge TTS / zh-CN-YunxiNeural' if args.edge else 'macOS local speech / Reed Chinese',voice_playback_tempo=1,music='Original synthesized score, scripts/prepare_audio.py')
    (OUT/'timeline.json').write_text(json.dumps(script,ensure_ascii=False,indent=2))
    for web in [False,True]:
        lines=['WEBVTT',''] if web else []
        for i,c in enumerate(cues):lines+=([] if web else [str(i+1)])+[f'{stamp(c["start"],web)} --> {stamp(c["end"],web)}',c['zh'],c['en'],'']
        (OUT/f'lesson8-bilingual.{"vtt" if web else "srt"}').write_text('\n'.join(lines))
    (OUT/'chapters.json').write_text(json.dumps([dict(id=s['id'],title=s['title'],start=s['start'],end=s['end']) for s in scenes],ensure_ascii=False,indent=2))
    lines=['# 整片文字稿与分镜','',f'实际时长 {total/RATE:.2f} 秒。生活例子为虚构教学情境，算法数据取自课程图。','']
    for s in scenes:
        lines += [f'## {s["start"]:.2f}–{s["end"]:.2f} 秒：{s["title"]}',f'画面类型：{s["mode"]}。','']
        for c in s['cues']:lines += [f'{c["start"]:.2f}–{c["end"]:.2f}：{c["zh"]}',c['en'],'']
    (OUT/'STORYBOARD.md').write_text('\n'.join(lines))
    print(json.dumps({'duration':total/RATE,'cues':len(cues),'voice_seconds':sum(len(a)/RATE for a in clips.values()),'scene_seconds':[round(d,1) for d in durations]},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
