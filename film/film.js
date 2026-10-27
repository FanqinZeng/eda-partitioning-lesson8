import {createIllustratedStudent} from './student.js';
import {C,kit,ease,mix} from './visuals.js';
import {layout,palette} from '../site/draw.mjs';
import {cutsize,metrics} from '../core/metrics.mjs';
const englishVoice=new URLSearchParams(location.search).get('voice')==='en';
let response=await fetch(englishVoice?'./timeline-en.json':'./timeline.json');
const draft=!response.ok;
let timeline=draft?await(await fetch('./script.json')).json():await response.json();
if(draft){let at=0;timeline.duration=timeline.target_seconds;timeline.cues=[];timeline.envelope=[];for(const s of timeline.scenes){s.start=at;s.end=at+s.target_seconds;s.cues.forEach((c,i)=>{c.start=at+i*s.target_seconds/s.cues.length;c.end=at+(i+1)*s.target_seconds/s.cues.length-.2;timeline.cues.push(c);});at=s.end;}}
timeline.draft=draft;
const evidence=await(await fetch('../data/reference-runs.json')).json(),g=evidence.graph,rr=evidence.roundRobin.assignment,rec=evidence.recursive.assignment,coarse=evidence.recursive.history[1].assignment;
const swapped={...rr,B:rr.D,D:rr.B},all=Object.fromEntries(g.nodes.map(n=>[n,0]));
const first=evidence.recursive.history[1],second=evidence.recursive.history[2],firstTrace=first.spectral,secondTrace=second.spectral;
const num=v=>Number(v.toFixed(3)).toString();
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),k=kit(ctx),student=await createIllustratedStudent();
const {rect,text,circle,line,fit,pill,arrow}=k;
const names={A:'小安',B:'小白',C:'小陈',D:'小杜',E:'小易'};
function banner(s,t,index){ctx.fillStyle=C.paper;ctx.fillRect(0,0,1920,1080);ctx.save();ctx.globalAlpha=.3;for(let x=70;x<1900;x+=48)for(let y=205;y<920;y+=48)circle(x,y,1.1,'#b7c7bf');ctx.restore();
 rect(64,40,125,42,14,C.ink);text('LESSON 08',126,69,17,'white',700,'center');text('MULTIWAY PARTITIONING',210,69,20,C.muted,500);text(`多路划分  ${String(index+1).padStart(2,'0')} / ${timeline.scenes.length}`,1856,69,20,C.muted,500,'right');line(64,100,1856,100,'#d6dfd8',1.5);fit(s.title,70,174,1780,51,C.ink,700,'left');rect(64,222,1792,660,28,'white');rect(64,922,1792,124,22,'white');rect(64,922,7,124,3,C.teal);rect(70,1063,1780,3,1,'#dce3dd');rect(70,1063,1780*Math.min(1,t/timeline.duration),3,1,C.teal);}
function bottom(a,b='',col=C.teal){fit(a,340,839,1080,32,col,650,'left');if(b)fit(b,1798,838,420,23,C.muted,500,'right');}
function graph(a,{x=300,y=280,w=1470,h=490,parts=3,previous=null,p=1,people=false,highlight=[],small=false,raw=false,model=g}={}){
 const l=layout(model,a,parts,w,h),positions=l.positions;
 if(raw){const rawPos={A:[.08,.25],B:[.3,.08],C:[.54,.5],D:[.77,.86],E:[.97,.35]};for(const n of model.nodes)positions[n]=[rawPos[n][0]*w,rawPos[n][1]*h];}
 if(previous){const prev=layout(model,previous,Math.max(...Object.values(previous))+1,w,h).positions;for(const n of model.nodes)positions[n]=[mix(prev[n][0],positions[n][0],p),mix(prev[n][1],positions[n][1],p)];}
 if(!raw)for(const b of l.boxes){rect(x+b.x,y+b.y,b.w,b.h,24,palette[b.label]+'0d');text(`分区 ${b.label}`,x+b.x+20,y+b.y+38,small?20:27,palette[b.label],600);}
 const r=small?24:35;
 for(const [i,e] of model.edges.entries()){const a1=positions[e.u],b1=positions[e.v];if(!a1||!b1)continue;const active=!highlight.length||highlight.includes(i),cut=Number(a[e.u])!==Number(a[e.v]),col=raw?'#9cb4b7':cut?C.orange:'#9cb4b7';ctx.save();ctx.globalAlpha=active?1:.18;line(x+a1[0],y+a1[1],x+b1[0],y+b1[1],col,small?2+e.w*.55:2+e.w*.9);
  const dx=b1[0]-a1[0],dy=b1[1]-a1[1],len=Math.hypot(dx,dy)||1,off=(i%2?1:-1)*(small?14:22),mx=x+(a1[0]+b1[0])/2-dy/len*off,my=y+(a1[1]+b1[1])/2+dx/len*off;
  rect(mx-(small?17:23),my-(small?18:24),small?34:46,small?32:42,10,'white',col+'44');text(e.w,mx,my+(small?5:7),small?23:29,col,700,'center');ctx.restore();}
 for(const n of model.nodes){const [px,py]=positions[n],xx=x+px,yy=y+py,col=palette[Number(a[n])];if(people){circle(xx,yy-10,r*.68,'#edc9ad');ctx.beginPath();ctx.arc(xx,yy-14,r*.7,Math.PI,Math.PI*2);ctx.fillStyle='#59463b';ctx.fill();rect(xx-r*.68,yy+r*.35,r*1.36,r*.62,14,C.ink);text(names[n],xx,yy+r+30,25,C.ink,600,'center');}else{circle(xx,yy,r,col);text(n,xx,yy+12,small?27:36,'white',600,'center');}}
}
function card(title,body,x,y,w=440,h=270,col=C.teal){rect(x,y,w,h,25,col+'0d');text(title,x+28,y+60,34,col,650);for(const [i,s] of body.entries())fit(s,x+28,y+122+i*53,w-56,29,C.ink,500,'left');}
function splitTree(){
 const boxes=[['ABCDE',1050,300,0],['ABC',700,470,1],['DE',1440,470,0],['AB',490,680,1],['C',920,680,2]];
 arrow(1050,345,700,415,C.muted);arrow(1050,345,1440,415,C.muted);arrow(700,515,490,625,C.muted);arrow(700,515,920,625,C.muted);
 for(const [label,x,y,p] of boxes){rect(x-140,y-45,280,90,22,palette[p]+'12');text(label,x,y+15,42,palette[p],650,'center');}
}
function matrix(trace,x,y,cell=85,highlight=-1){
 const ns=trace.nodes;ns.forEach((n,i)=>{text(n,x+(i+1.5)*cell,y+cell*.6,28,C.muted,600,'center');text(n,x+cell*.5,y+(i+1.65)*cell,28,C.muted,600,'center');});
 trace.matrix.forEach((row,i)=>{if(i===highlight)rect(x+cell,y+(i+1)*cell,ns.length*cell,cell-4,10,'#e1f1e8');row.forEach((v,j)=>text(v,x+(j+1.5)*cell,y+(i+1.65)*cell,34,i===j?C.teal:C.ink,i===j?700:500,'center'));});
 line(x+cell-12,y+cell,x+cell-12,y+(ns.length+1)*cell,C.muted,3);line(x+(ns.length+1)*cell+12,y+cell,x+(ns.length+1)*cell+12,y+(ns.length+1)*cell,C.muted,3);
}
function sweeps(trace,active,y=300){
 const x=340,w=1440,hh=68,rh=88,columns=[['候选切口',x+250],['被切断的边',x+855],['代价',x+1310]];
 rect(x,y,w,hh,15,'#e8f0eb');columns.forEach(([l,c])=>text(l,c,y+45,27,C.muted,600,'center'));
 trace.candidates.forEach((c,i)=>{const yy=y+hh+i*rh;if(c.chosen)rect(x,yy,w,rh-4,12,'#dff1e7');if(active===i)rect(x+3,yy+3,w-6,rh-10,10,null,C.blue);const label=c.left.join('')+' │ '+c.right.join('');fit(label,columns[0][1],yy+55,460,35,C.ink,650);fit(c.edges.map(e=>`${e.u}–${e.v}(${e.w})`).join(' + '),columns[1][1],yy+55,680,31,C.ink,500);text(c.cut,columns[2][1],yy+55,42,c.chosen?C.teal:C.ink,700,'center');});
}
function draw(s,t,j){const progress=ease((t-s.cues[0].start-.5)/3);
 switch(s.mode){
 case 'life':graph(all,{x:345,y:350,w:1350,h:310,parts:1,people:true,raw:true});pill('三个小组完成项目',140,255,330);bottom('两组变三组，原来的分法也要重新考虑','从生活问题出发');break;
 case 'capacity':[['第一组',2],['第二组',1],['第三组',2]].forEach(([label,n],i)=>{const x=340+i*495;rect(x,310,450,390,26,palette[i]+'0e');text(label,x+225,380,31,palette[i],650,'center');text(n,x+225,535,115,palette[i],700,'center');text('人',x+225,595,30,C.muted,500,'center');});bottom('五个人，三个非空组，每组最多两人','人数只能是 2、2、1 的排列');break;
 case 'model':graph(all,{x:340,y:350,w:1370,h:330,parts:1,raw:true,highlight:j===1?[0,4]:[]});bottom('同学对应节点，合作对应边，沟通频次对应边权','生活例子是简化的教学情境');break;
 case 'objective':graph(rr,{highlight:j===0?[0]:[]});bottom('cutsize = 所有跨区边权之和','每条无向边只计一次');break;
 case 'roundrobin':g.nodes.forEach((n,i)=>{const x=440+i*280;rect(x-80,265,160,75,18,palette[rr[n]]+'15');text(`${n} → ${rr[n]}`,x,315,33,palette[rr[n]],650,'center');});graph(rr,{y:345,h:405,previous:all,p:progress});bottom('按字母顺序，分区编号 = 序号 mod 3','得到 AD、BE、C');break;
 case 'roundcut':graph(rr,{y:260,h:470,highlight:j===0?[0,4]:[]});bottom(`5 + 1 + 4 + 2 + 5 + 1 = ${cutsize(g,rr)}`,'六条边全部跨区',C.orange);break;
 case 'recurseidea':splitTree();bottom('每次切分当前最大的分区，直到出现三个叶子','树的叶子对应最终分区');break;
 case 'inputorder':card('轮询：直接按顺序放组',['A → 0，B → 1，C → 2','D → 0，E → 1','字母顺序参与这个基线'],340,325,680,365,C.blue);card('谱二分：计算新的排序',['A…E 固定输入索引','连线权重 → 每点一个坐标','再按坐标从小到大排列'],1090,325,680,365);bottom('字母是名称；谱排序由当前子图的连接关系计算');break;
 case 'spectralidea':if(j===0){graph(all,{x:350,y:330,w:1370,h:370,parts:1,raw:true,highlight:[0,4]});bottom('权重越大，越不希望两端坐标相隔很远','弹簧的直觉');}else{text('让 E(x) 尽量小',1060,320,41,C.teal,650,'center');text('5(xA − xB)² + (xA − xC)² + 4(xB − xC)²',1060,405,39,C.ink,500,'center');text('+ 2(xC − xD)² + 5(xD − xE)² + (xC − xE)²',1060,470,39,C.ink,500,'center');card('固定中心',['xA + xB + xC + xD + xE = 0'],350,535,680,205,C.blue);card('固定尺度',['xA² + xB² + xC² + xD² + xE² = 1'],1100,535,680,205);bottom('边权 × 坐标差的平方，再对所有边求和','这是坐标目标值');}break;
 case 'laplacian':matrix(firstTrace,350,280,76,j===1?0:-1);card('构造规则',['对角线：连接边权之和','其他格：两点间边权的负数','没有边：填 0'],970,305,790,280);text('A 连接 B(5)、C(1)',1000,650,36,C.teal,650);text('A 行：[ 6, −5, −1, 0, 0 ]',1000,715,36,C.ink,600);bottom('L = D − W；行、列都按 A、B、C、D、E 对应');break;
 case 'fiedler':card('对于这张连通图',['第二小特征值对应的向量','每个分量就是一个谱坐标','名称：Fiedler（菲德勒）向量'],340,300,680,320);text('Lx = λ₂x',680,725,61,C.teal,650,'center');card('本课代码做 80 轮近似迭代',['① 近似解 (L + 0.001I)y = x','② 对 y 减去均值','③ 归一化，得到下一轮 x'],1090,300,680,320,C.blue);text('排除所有坐标相同的情形',1430,705,31,C.muted,500,'center');bottom('把连续坐标问题交给数值算法求解','无需手算 80 轮');break;
 case 'spectralorder':{const v=Object.fromEntries(first.order),xs=[420,705,990,1275,1560];text('输入索引',350,305,27,C.muted,600);g.nodes.forEach((n,i)=>{const x=xs[i];rect(x,335,185,140,18,'#edf2f6');text(n,x+92,395,44,C.blue,650,'center');text(num(v[n]),x+92,446,28,C.muted,500,'center');});text('按坐标从小到大',350,550,27,C.teal,650);first.order.forEach(([n,val],i)=>{const x=xs[i];rect(x,580,185,140,18,'#e5f2e9');text(n,x+92,640,44,C.teal,650,'center');text(num(val),x+92,691,28,C.muted,500,'center');if(i<4)arrow(x+200,651,x+265,651,C.muted);});bottom('E → D → C → B → A','坐标只负责生成顺序');break;}
 case 'sweep':sweeps(firstTrace,j<2?j:j===2?2:1,290);pill('合格候选中最小：3',1170,745,580,C.teal);bottom('四个候选代价：6、3、5、6 → 选择 ED │ CBA','局部面积过滤 20%–80%');break;
 case 'firstsplit':graph(coarse,{parts:2,previous:all,p:progress,highlight:j===1?[3,5]:[]});bottom('第一刀：C–D(2) + C–E(1) = 3','目前只有两组，还未完成');break;
 case 'subgraph':{const sub={nodes:secondTrace.nodes,edges:secondTrace.edges,sizes:g.sizes},a=Object.fromEntries(sub.nodes.map(n=>[n,0]));graph(a,{x:350,y:350,w:700,h:335,parts:1,model:sub});matrix(secondTrace,1190,295,90);text('ABC 的内部子图',700,290,31,C.teal,650,'center');pill('DE 保留，暂不再拆',1180,715,540,C.blue);bottom('只用 AB(5)、AC(1)、BC(4)，重新算出 A → B → C','第一刀的 3 继续保留');break;}
 case 'secondsweep':text('重新计算的谱坐标与排序',350,300,29,C.muted,600);second.order.forEach(([n,v],i)=>{const x=450+i*470;rect(x,330,350,92,15,'#e6f2e9');text(`${n}  ${num(v)}`,x+175,390,36,C.teal,650,'center');});sweeps(secondTrace,j,470);bottom('两个候选：A │ BC 为 6；AB │ C 为 5 → 选择 5','这是第二刀新增的代价');break;
 case 'secondsplit':graph(rec,{previous:coarse,p:progress,highlight:j===1?[1,2]:[]});bottom('第二刀新增：A–C(1) + B–C(4) = 5','最终三组为 AB、C、DE');break;
 case 'cumulative':[['第一刀',3,C.blue],['新增',5,C.orange],['最终',8,C.teal]].forEach(([label,n,col],i)=>{const x=420+i*500;text(label,x+150,360,32,C.muted,500,'center');rect(x,400,300,n*35,20,col+'19');text(n,x+150,515,90,col,700,'center');});text('+',910,530,65,C.muted,500,'center');text('=',1410,530,65,C.muted,500,'center');bottom('最终重算：1 + 4 + 2 + 1 = 8','已切开的边继续计入最终代价');break;
 case 'compare':text('轮询分配',650,295,34,C.orange,650,'center');text('递归二分',1440,295,34,C.teal,650,'center');graph(rr,{x:295,y:310,w:690,h:400,small:true});graph(rec,{x:1080,y:310,w:690,h:400,small:true});text('18',650,775,53,C.orange,700,'center');text('8',1440,775,53,C.teal,700,'center');bottom('少切开 A–B(5)、D–E(5)，代价减少 10','两种人数分布都满足容量');break;
 case 'direct':card('直接维护 k 个分区',['轮询：按顺序初始化','改进：比较移动或交换收益','同时检查分区容量'],350,330,660,365);card('递归二分',['逐次切开现有分区','用一棵树记录切分','到达目标叶子数后停止'],1100,330,660,365,C.blue);bottom('轮询只是直接分配的一种简单起点','直接多路方法不等同于轮询');break;
 case 'refinement':graph(swapped,{previous:rr,p:progress});pill('交换 B 与 D',1350,250,370,C.orange);bottom(`收益 = ${cutsize(g,rr)} − ${cutsize(g,swapped)} = ${cutsize(g,rr)-cutsize(g,swapped)}`,'贪心成对交换示例');break;
 case 'exact':[['带编号的合法分配',evidence.exact.checked],['本例的最小割代价',evidence.exact.cut]].forEach(([label,n],i)=>{const x=390+i*760;rect(x,330,650,355,25,(i?C.teal:C.blue)+'0d');text(label,x+325,410,34,C.muted,600,'center');text(n,x+325,570,110,i?C.teal:C.blue,700,'center');});bottom('结论只针对当前五节点图和每区容量 2','不能推广为算法总能最优');break;
 case 'limits':card('早期切分会保留下来',['后续只拆现有分区','跨区节点很难重新组合'],340,335,460,350);card('局部改善有边界',['第一刀好，整体未必最好','贪心交换可能停在局部'],835,335,460,350,C.blue);card('容量仍需检查',['最大块切分是教学基线','最终负载可能超过容量'],1330,335,460,350,'#82629e');bottom('每次都报告割代价与容量，而非只看一个数字');break;
 case 'area':{const weighted={...g,sizes:{...g.sizes,A:2}},m=metrics(weighted,rr,3,2);graph(rr,{model:weighted,y:260,h:425,highlight:[]});g.nodes.forEach(n=>{const pos=layout(g,rr,3,1470,425).positions[n];pill(`面积 ${weighted.sizes[n]}`,300+pos[0]-70,260+pos[1]+(n==='B'?-95:45),140,n==='A'?C.orange:C.muted);});bottom(`人数 2 / 2 / 1；面积 ${m.sizes.join(' / ')}，第一组超容`,'节点面积与边权分别计算',C.orange);break;}
 case 'manual':card('先检查约束',['每个节点都有分区','k 个分区都非空','每组面积不超过容量'],350,330,660,365);card('再检查连接代价',['找出跨区边','每条边只计算一次','与页面结果相互核对'],1100,330,660,365,C.blue);bottom('在实验台重现 18 与 8，再尝试自己的分法');break;
 case 'exercise':{const changed={...g,edges:g.edges.map(e=>e.u==='A'&&e.v==='B'?{...e,w:1}:e)};graph(rr,{model:changed,highlight:[0]});pill('A–B：5 改成 1',1300,250,450,C.orange);bottom(j<1?'保留分组不动：两种割代价分别是多少？':j===1?'先重算固定分组，再重新运行算法':'改变 k 时，容量也要一起检查','暂停想一想');break;}
 case 'recap':{const labels=['当前子图','矩阵与坐标','排序与试切','递归下一刀','总代价与容量'];labels.forEach((l,i)=>{const x=370+i*285;rect(x,360,245,250,24,palette[i%3]+'10');circle(x+122,425,30,palette[i%3]);text(i+1,x+122,437,34,'white',600,'center');fit(l,x+122,525,220,29,C.ink,650);if(i<4)arrow(x+252,480,x+275,480,C.muted);});bottom('每一刀都解释：为什么这样排，为什么在这里切');break;}
 case 'finish':text('好的分组，需要同时解释',1080,360,45,C.ink,650,'center');card('连接代价',['哪些边跨区？','权重相加是多少？'],350,420,660,290);card('分区负载',['每组有多少节点或面积？','是否满足非空与容量？'],1100,420,660,290,C.blue);bottom('配套网站提供实验、练习解析、课件与离线包');break;
 }
}
function renderFrame(t){t=Math.max(0,Math.min(t,timeline.duration-.001));const index=Math.max(0,timeline.scenes.findLastIndex(s=>s.start<=t)),s=timeline.scenes[index],j=Math.max(0,s.cues.findLastIndex(c=>c.start<=t));banner(s,t,index);draw(s,t,j);const amp=timeline.envelope[Math.min(timeline.envelope.length-1,Math.floor(t*100))]||0;ctx.drawImage(student.draw(t,amp),34,570,205,340.5);const cue=timeline.cues.find(c=>t>=c.start&&t<c.end+.15);if(cue){fit(cue.zh,960,970,1660,36,C.ink,600);fit(cue.en,960,1015,1660,25,C.muted,400);}return canvas.toDataURL('image/jpeg',.93);}
window.renderFrame=renderFrame;window.duration=timeline.duration;window.timeline=timeline;window.algorithmEvidence={recursive:cutsize(g,rec),roundRobin:cutsize(g,rr),swap:cutsize(g,swapped),exact:evidence.exact.cut};await document.fonts.ready;renderFrame(1);window.ready=true;
const audio=new Audio(englishVoice?'./film-mix-en.wav':'./film-mix.wav');document.querySelector('#play').onclick=()=>{if(!audio.paused){audio.pause();return;}audio.play();const loop=()=>{renderFrame(audio.currentTime);if(!audio.paused)requestAnimationFrame(loop);};loop();};
