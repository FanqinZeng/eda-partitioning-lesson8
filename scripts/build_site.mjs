import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'docs'),draft=process.argv.includes('--draft');
fs.mkdirSync(out,{recursive:true});fs.cpSync(path.join(root,'site'),out,{recursive:true});
for(const dir of ['core','data'])fs.cpSync(path.join(root,dir),path.join(out,dir),{recursive:true});
const assets=path.join(out,'assets');fs.mkdirSync(assets,{recursive:true});
const files={'film/lesson8-full.mp4':'lesson8-full.mp4','film/lesson8-english.mp4':'lesson8-english.mp4','film/lesson8-english.srt':'lesson8-english.srt','film/lesson8-english.vtt':'lesson8-english.vtt','film/lesson8-bilingual.srt':'lesson8-bilingual.srt','film/lesson8-bilingual.vtt':'lesson8-bilingual.vtt','film/STORYBOARD.md':'Lesson8-transcript.md','film/poster.jpg':'poster.jpg','materials/Lesson8-lecture.pptx':'Lesson8-lecture.pptx','materials/Lesson8-slides.pdf':'Lesson8-slides.pdf','materials/Lesson8-guide.pdf':'Lesson8-guide.pdf'};
for(const [src,dst] of Object.entries(files)){if(fs.existsSync(path.join(root,src)))fs.copyFileSync(path.join(root,src),path.join(assets,dst));else if(!draft&&!fs.existsSync(path.join(assets,dst)))throw Error('Missing deliverable '+src);}
if(fs.existsSync(path.join(root,'film/chapters.json')))fs.copyFileSync(path.join(root,'film/chapters.json'),path.join(out,'chapters.json'));
else if(draft){let start=0;const script=JSON.parse(fs.readFileSync(path.join(root,'film/script.json')));fs.writeFileSync(path.join(out,'chapters.json'),JSON.stringify(script.scenes.map(s=>{const c={id:s.id,title:s.title,start,end:start+s.target_seconds};start=c.end;return c;})));}
for(const name of ['chapters-en.json','voice-timing.json'])fs.copyFileSync(path.join(root,'film',name),path.join(out,name));
fs.writeFileSync(path.join(out,'.nojekyll'),'');console.log('Built docs/ '+(draft?'(draft assets allowed)':'with all deliverables'));
