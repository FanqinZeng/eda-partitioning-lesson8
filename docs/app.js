import {normalizeGraph,rawGraph} from './core/graph.mjs';
import {metrics,cutEdges,partsString} from './core/metrics.mjs';
import {recursiveBisection} from './core/recursive-bisection.mjs';
import {roundRobinRun} from './core/round-robin.mjs';
import {refineBySwaps} from './core/refine.mjs';
import {graphSvg,palette} from './draw.mjs';
import {mountSpectralLesson,runTraceMarkup} from './spectral-lesson.mjs';
const $=id=>document.getElementById(id),fmt=n=>Number.isInteger(n)?String(n):Number(n.toFixed(3)).toString();
const starter=await (await fetch('./data/tiny_graph.json')).json();let g=normalizeGraph(starter),k=3,capacity=2,rec,rr,stage,manual,timer=null;
function stats(a,constructing=false){const m=metrics(g,a,k,capacity),weighted=Object.values(g.sizes).some(x=>x!==1);return `<span>割代价<strong>${fmt(m.cut)}</strong></span><span>${weighted?'各组面积':'各组大小'}（按分区编号）<strong>${m.sizes.map(fmt).join(' / ')}</strong>${weighted?`<small>节点数 ${m.counts.join(' / ')}</small>`:''}</span><span class="${m.feasible?'valid':'invalid'}">容量 ${fmt(capacity)}<strong>${constructing?'构建中':m.feasible?'满足约束':'不满足约束'}</strong></span>`;}
function stop(){clearInterval(timer);timer=null;$('auto').textContent='自动演示';$('auto').setAttribute('aria-pressed','false');}
function refreshRuns(final=true){stop();rec=recursiveBisection(g,k);rr=roundRobinRun(g,k);stage=final?rec.history.length-1:0;manual={...rr.assignment};settings();render();}
function render(){
 const h=rec.history[stage],done=stage===rec.history.length-1;$('rec-stage').textContent=`切分 ${stage} / ${rec.history.length-1}`;
 $('rec-metrics').innerHTML=stats(h.assignment,!done);$('rr-metrics').innerHTML=stats(rr.assignment);
 $('rec-graph').innerHTML=graphSvg(g,h.assignment,k,{title:'递归二分当前状态'});$('rr-graph').innerHTML=graphSvg(g,rr.assignment,k,{title:'轮询多路分配'});
 $('rec-event').textContent=stage===0?'所有节点暂在一组，割代价为 0。当前还未完成目标分组，不能作为最终方案。':`切分 ${h.split.join('、')}，新增割代价 ${fmt(h.addedCut)}，累计 ${fmt(h.cut)}。${done?'已到达目标分区数。':'继续切分当前最大的组。'}`;
 $('rr-event').textContent=`按节点名称排序，轮流分到 ${k} 个组。最终割代价为 ${fmt(rr.cut)}，分组为 ${rr.parts.replaceAll('|',' ｜ ')}。`;
 $('rec-tree').replaceChildren(...rec.history.map((h,i)=>{const li=document.createElement('li');li.textContent=`${h.parts.replaceAll('|',' ｜ ')}　代价 ${fmt(h.cut)}`;if(i===stage)li.className='current';return li;}));
 $('rec-reason').hidden=stage===0;$('rec-trace').innerHTML=runTraceMarkup(h);
 $('rr-order').replaceChildren(...g.nodes.map(n=>{const el=document.createElement('span');el.textContent=`${n} → ${rr.assignment[n]}`;el.style.color=palette[rr.assignment[n]];return el;}));
 $('prev').disabled=stage===0;$('next').disabled=done;
 const rm=metrics(g,rec.assignment,k,capacity),bm=metrics(g,rr.assignment,k,capacity),gap=rr.cut-rec.cut;
 $('comparison').classList.toggle('warn',!rm.feasible||!bm.feasible);
 $('comparison').textContent=!done?'正在构建递归方案。完成全部切分后，再比较同一容量约束下的最终结果。':!rm.feasible||!bm.feasible?`当前容量为 ${fmt(capacity)}，${!rm.feasible?'递归方案':''}${!rm.feasible&&!bm.feasible?'和':''}${!bm.feasible?'轮询方案':''}不满足约束。先查看各组面积与非空要求，再判断方案质量。`:`两种方法均满足容量。轮询代价 ${fmt(rr.cut)}，递归代价 ${fmt(rec.cut)}，两者相差 ${fmt(Math.abs(gap))}。${gap>0?'本次递归方案代价更低。':gap<0?'本次轮询方案代价更低。':'本次代价相同。'}`;
 renderManual();
}
function renderManual(){
 $('manual-metrics').innerHTML=stats(manual);$('manual-graph').innerHTML=graphSvg(g,manual,k,{title:'你的手动分区'});
 const es=cutEdges(g,manual);$('manual-edges').textContent=es.length?`跨区边：${es.map(e=>`${e.u}–${e.v}(${fmt(e.w)})`).join(' + ')} = ${fmt(metrics(g,manual,k,capacity).cut)}`:'没有跨区边。请同时检查分区数量与容量。';
 for(const s of $('manual-controls').querySelectorAll('select'))s.value=String(manual[s.dataset.node]);
 $('refine').disabled=!metrics(g,manual,k,capacity).feasible;
}
function inputRow(label,value,key,kind){const row=document.createElement('label');row.className='weight-row';const span=document.createElement('span');span.textContent=label;const input=document.createElement('input');input.type='number';input.min=kind==='size'?'0.001':'0';input.step='0.1';input.max='1000000';input.value=value;input.dataset.key=key;input.dataset.kind=kind;input.setAttribute('aria-label',label);row.append(span,input);return row;}
function settings(){
 $('weights').replaceChildren(...g.edges.map((e,i)=>inputRow(`${e.u}–${e.v}`,e.w,i,'weight')));$('node-sizes').replaceChildren(...g.nodes.map(n=>inputRow(n,g.sizes[n],n,'size')));
 $('k').replaceChildren(...Array.from({length:Math.min(8,g.nodes.length)},(_,i)=>new Option(String(i+1),String(i+1))));$('k').value=k;$('capacity').value=capacity;$('json-input').value=JSON.stringify(rawGraph(g),null,2);
 $('manual-controls').replaceChildren(...g.nodes.map(n=>{const l=document.createElement('label');l.append(n);const s=document.createElement('select');s.dataset.node=n;s.setAttribute('aria-label',`节点 ${n} 所属分区`);for(let p=0;p<k;p++)s.add(new Option(String(p),String(p)));s.value=manual[n];s.onchange=()=>{manual[n]=Number(s.value);$('manual-message').textContent='';renderManual();};l.append(s);return l;}));
}
function guarded(fn){try{fn();$('input-error').textContent='';}catch(e){$('input-error').textContent=e.message;}}
$('prev').onclick=()=>{stop();if(stage>0)stage--;render();};$('next').onclick=()=>{stop();if(stage<rec.history.length-1)stage++;render();};$('reset').onclick=()=>{stop();stage=0;render();};
$('auto').onclick=()=>{if(timer){stop();return;}if(stage===rec.history.length-1)stage=0;render();$('auto').textContent='暂停演示';$('auto').setAttribute('aria-pressed','true');timer=setInterval(()=>{if(stage<rec.history.length-1)stage++;render();if(stage===rec.history.length-1)stop();},1800);};
$('k').onchange=()=>{k=Number($('k').value);capacity=Math.ceil(Object.values(g.sizes).reduce((a,b)=>a+b)/k);refreshRuns();};
$('apply-cap').onclick=()=>guarded(()=>{const cap=Number($('capacity').value);if(!Number.isFinite(cap)||cap<=0)throw Error('容量须为正数。');capacity=cap;render();});
$('apply').onclick=()=>guarded(()=>{const raw=rawGraph(g);raw.edges=raw.edges.map(e=>({...e}));raw.node_sizes={...g.sizes};for(const input of document.querySelectorAll('.settings input')){if(input.value.trim()==='')throw Error('请填写完整的权重与面积。');if(input.dataset.kind==='weight')raw.edges[Number(input.dataset.key)].w=Number(input.value);if(input.dataset.kind==='size')raw.node_sizes[input.dataset.key]=Number(input.value);}const next=normalizeGraph(raw);g=next;refreshRuns();});
$('challenge').onclick=()=>{const index=g.edges.findIndex(e=>[e.u,e.v].sort().join('')==='AB');if(index<0){$('input-error').textContent='当前图中没有 A–B 边。';return;}document.querySelector(`[data-kind="weight"][data-key="${index}"]`).value=1;$('apply').click();};
$('import').onclick=()=>guarded(()=>{const next=normalizeGraph(JSON.parse($('json-input').value));g=next;k=Math.min(k,g.nodes.length);capacity=Math.ceil(Object.values(g.sizes).reduce((a,b)=>a+b)/k);refreshRuns();});
$('original').onclick=()=>{g=normalizeGraph(starter);k=3;capacity=2;refreshRuns();$('input-error').textContent='';};
$('manual-rr').onclick=()=>{manual={...rr.assignment};$('manual-message').textContent='已恢复轮询分组。';renderManual();};
$('refine').onclick=()=>{const result=refineBySwaps(g,manual,k,capacity);manual=result.assignment;$('manual-message').textContent=result.history.length?result.history.map(h=>`交换 ${h.a} 与 ${h.b}，收益 ${fmt(h.gain)}`).join('；')+(result.stopped==='limit'?'。达到迭代上限。':'。已无正收益的可行成对交换。'):'当前没有正收益的可行成对交换。';renderManual();};
refreshRuns(false);mountSpectralLesson(normalizeGraph(starter));$('hero-graph').innerHTML=graphSvg(g,rec.assignment,k,{title:'A B、C、D E 三个组'});
const quiz=await(await fetch('./data/quiz.json')).json();$('quiz').replaceChildren(...(quiz.items??quiz).map((q,i)=>{const a=document.createElement('article');a.className='question';const h=document.createElement('h3');h.textContent=`${i+1}. ${q.prompt}`;const choices=document.createElement('ol');choices.type='A';choices.style.fontSize='14px';for(const choice of q.choices??[]){const li=document.createElement('li');li.textContent=choice;choices.append(li);}const d=document.createElement('details'),s=document.createElement('summary'),p=document.createElement('p');s.textContent='查看答案与解释';p.textContent=`${q.answer}\n${q.explain}`;d.append(s,p);a.append(h,choices,d);return a;}));
const chapters=await(await fetch('./chapters.json')).json();for(const c of chapters){const b=document.createElement('button');const t=Math.floor(c.start);b.textContent=`${Math.floor(t/60)}:${String(t%60).padStart(2,'0')} ${c.title}`;b.onclick=()=>{const v=$('lesson'),seek=()=>{v.currentTime=c.start;v.play().catch(()=>{});};if(v.readyState>=1)seek();else{v.addEventListener('loadedmetadata',seek,{once:true});v.load();}};$('chapters').append(b);}
window.lesson8Ready=true;
// Dynamic graphs and lesson panels change height during startup. Honor a deep
// link after they are mounted, so #spectral lands on its actual heading.
if(location.hash)requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({behavior:'instant',block:'start'}));
