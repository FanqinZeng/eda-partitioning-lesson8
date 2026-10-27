"""Package only the formal course, without author caches or the ZIP itself."""
from pathlib import Path
import shutil,zipfile,hashlib,json
ROOT=Path(__file__).resolve().parents[1];DEST=ROOT/'build/offline'
if DEST.exists():shutil.rmtree(DEST)
DEST.mkdir(parents=True,exist_ok=True)
shutil.copytree(ROOT/'docs',DEST/'site',ignore=shutil.ignore_patterns('lesson8-offline.zip'))
for directory in ['core','data','tests']:
    shutil.copytree(ROOT/directory,DEST/directory,dirs_exist_ok=True)
for name in ['package.json','README.md','SOURCES.md']:shutil.copy2(ROOT/name,DEST/name)
(DEST/'film').mkdir();shutil.copy2(ROOT/'film/voice-timing.json',DEST/'film/voice-timing.json')
source=(ROOT/'scripts/serve.py').read_text().replace("Path(__file__).resolve().parents[1]/'docs'","Path(__file__).resolve().parent/'site'")
(DEST/'start.py').write_text(source)
html=(DEST/'site/index.html').read_text();html=html.replace('<a href="assets/lesson8-offline.zip" download><span>离线学习包</span><small>网站、视频、教材、算法与测试</small><b>↓</b></a>','')
(DEST/'site/index.html').write_text(html)
(DEST/'README.txt').write_text('Lesson 8 离线学习包\n\n需要 Python 3。运行 python3 start.py --port 8008，然后打开 http://127.0.0.1:8008 。\n视频、字幕、实验台与教材均位于本机。算法测试需要 Node.js 20+，在本目录运行 npm test。\n网页里的课程出处与源码链接属于外部参考，离线学习不需要访问。\n')
records=[]
for path in sorted(DEST.rglob('*')):
    if path.is_file() and path.name!='SHA256SUMS.json':records.append({'path':str(path.relative_to(DEST)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
(DEST/'SHA256SUMS.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
target=ROOT/'docs/assets/lesson8-offline.zip'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for path in sorted(DEST.rglob('*')):
        if path.is_file():z.write(path,path.relative_to(DEST))
with zipfile.ZipFile(target) as z:assert z.testzip() is None
print(json.dumps({'files':len(records),'zipBytes':target.stat().st_size,'passed':True}))
