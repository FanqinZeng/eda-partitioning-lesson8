"""Validate local published links and source synchronization without browser packages."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,hashlib
ROOT=Path(__file__).resolve().parents[1];DOCS=ROOT/'docs'
class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=[]
    def handle_starttag(self,tag,attrs):
        for k,v in attrs:
            if k in ('href','src') and v and not v.startswith(('http:','https:','#','data:','mailto:')):self.links.append(v.split('#')[0].split('?')[0])
p=Links();p.feed((DOCS/'index.html').read_text());missing=[v for v in p.links if not (DOCS/v).is_file()]
assert not missing,missing
for source in (ROOT/'core').glob('*.mjs'):assert source.read_bytes()==(DOCS/'core'/source.name).read_bytes(),source.name
for source in (ROOT/'site').iterdir():
    if source.is_file():assert source.read_bytes()==(DOCS/source.name).read_bytes(),source.name
quiz=json.loads((DOCS/'data/quiz.json').read_text());assert len(quiz['items'])==12
chapters=json.loads((DOCS/'chapters.json').read_text());script=json.loads((ROOT/'film/script.json').read_text());assert len(chapters)==len(script['scenes'])
assert [c['id'] for c in chapters]==[s['id'] for s in script['scenes']]
for i,c in enumerate(chapters):assert c['end']>c['start'] and (i==0 or c['start']>=chapters[i-1]['end']-.001)
assert (DOCS/'assets/lesson8-full.mp4').stat().st_size>1000000
assert (DOCS/'assets/lesson8-offline.zip').stat().st_size>1000000
assert (DOCS/'spectral-lesson.mjs').is_file()
print(json.dumps({'passed':True,'localLinks':len(p.links),'quizItems':len(quiz['items']),'chapters':len(chapters),'sourceSync':True}))
