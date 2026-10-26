import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const modules=process.env.RUNTIME_NODE_MODULES;
if(!modules)throw Error('Set RUNTIME_NODE_MODULES to the Codex bundled node_modules directory.');
const {Presentation,PresentationFile}=await import(pathToFileURL(path.join(modules,'@oai/artifact-tool/dist/artifact_tool.mjs')).href);
const SKILL=process.env.LESSON8_PRESENTATIONS_SKILL;
if(!SKILL)throw Error('Set LESSON8_PRESENTATIONS_SKILL to the installed Presentations skill directory.');
const PY=process.env.LESSON8_PYTHON||'python3';
const FONT='Arial Unicode MS',TMP=path.join(ROOT,'build/materials'),OUT=path.join(ROOT,'materials');
const C={paper:'#f3f4ed',ink:'#153641',teal:'#158c87',blue:'#365f95',purple:'#82639d',orange:'#d77635',muted:'#637a80',line:'#c9d6d2',pale:['#e0eee6','#e5ebf4','#eee7f2']};
const sources='课程依据：https://github.com/yongfu-li/eda-learning/tree/main/courses/learn_partitioning/module03-01-multiway-partition\n视觉延续：https://github.com/FanqinZeng/eda-clustering-lab7-kl\n本课源码：https://github.com/FanqinZeng/eda-partitioning-lesson8';
const graph=JSON.parse(await fs.readFile(path.join(ROOT,'data/tiny_graph.json'),'utf8'));
const edges=graph.edges.map(e=>[e.u,e.v,e.w]);
const expectedEdges=[['A','B',5],['A','C',1],['B','C',4],['C','D',2],['D','E',5],['C','E',1]];
if(JSON.stringify(edges)!==JSON.stringify(expectedEdges))throw Error('Teaching graph changed; update the authored explanation before building.');
const RR={A:0,D:0,B:1,E:1,C:2},RB={A:0,B:0,C:1,D:2,E:2};
const p=Presentation.create({slideSize:{width:1280,height:720}});
function rect(s,x,y,w,h,fill,stroke='none',r=0){return s.shapes.add({geometry:r?'roundRect':'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:stroke==='none'?0:1},...(r?{borderRadius:r}:{})});}
function txt(s,str,x,y,w,h,size=27,col=C.ink,bold=false,align='left'){let a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=String(str);a.text.style={typeface:FONT,fontSize:size,color:col,bold,alignment:align,verticalAlignment:'middle',wrap:'square',insets:0};return a;}
function line(s,x,y,u,v,col=C.line,width=2){return s.shapes.add({geometry:'line',position:{left:Math.min(x,u),top:Math.min(y,v),width:Math.abs(u-x)||.1,height:Math.abs(v-y)||.1,horizontalFlip:u<x,verticalFlip:v<y},fill:'none',line:{fill:col,width}});}
function base(title,note=''){let s=p.slides.add();s.background.fill=C.paper;txt(s,'LESSON 8   多路划分',56,26,900,28,16,C.teal,true);txt(s,String(p.slides.items.length).padStart(2,'0'),1150,26,74,28,16,C.muted,false,'right');txt(s,title,56,87,1168,84,42,C.ink,true);line(s,56,190,1224,190,C.line,1);s.speakerNotes.text=note+'\n\n'+sources;return s;}
function foot(s,a,b=''){txt(s,a,56,624,1168,46,24,C.teal,true);if(b)txt(s,b,56,676,1168,24,14,C.muted);}
function node(s,n,x,y,col=C.teal,r=28){s.shapes.add({geometry:'ellipse',position:{left:x-r,top:y-r,width:r*2,height:r*2},fill:col,line:{fill:'none',width:0}});txt(s,n,x-r,y-r,r*2,r*2,27,'#ffffff',true,'center');}
function nativeTable(s,headers,rows,x=70,y=238,w=1140,h=320,size=25){let values=[headers,...rows].map(r=>r.map(String));let t=s.tables.add({rows:values.length,columns:headers.length,left:x,top:y,width:w,height:h,values});t.borders.assign({fill:'#d0dcd6',width:1,style:'solid'});for(let r=0;r<values.length;r++)for(let c=0;c<headers.length;c++){let cell=t.getCell(r,c);cell.fill=r===0?'#dfeae2':r%2?'#ffffff':'#edf1e9';cell.text.style={typeface:FONT,fontSize:r===0?size-2:size,color:r===0?C.muted:C.ink,bold:r===0,alignment:'center',verticalAlignment:'middle'};}return t;}
function groups(s,assignment,{top=250,bottom=550,labels=['第 1 组','第 2 组','第 3 组'],drawEdges=true,weightLabels=true}={}){
 let count=Math.max(...Object.values(assignment))+1,centers=count===2?[360,920]:[245,640,1035],cols=[C.teal,C.blue,C.purple],pos={};
 for(let g=0;g<count;g++){let ns=Object.keys(assignment).filter(n=>assignment[n]===g).sort();let w=count===2?370:290;rect(s,centers[g]-w/2,top,w,bottom-top,C.pale[g],'none',18);txt(s,labels[g],centers[g]-w/2+18,top+10,w-36,34,19,cols[g],true);ns.forEach((n,i)=>pos[n]=ns.length===3?[[centers[g]-75,top+115],[centers[g]+75,top+115],[centers[g],bottom-55]][i]:[centers[g],ns.length===1?(top+bottom)/2+15:top+95+i*(bottom-top-140)/Math.max(1,ns.length-1)]);}
 if(drawEdges)for(let i=0;i<edges.length;i++){let [a,b,w]=edges[i],[x,y]=pos[a],[u,v]=pos[b],cut=assignment[a]!==assignment[b],col=cut?C.orange:'#93acac';line(s,x,y,u,v,col,1+w*.55);if(weightLabels){let mx=(x+u)/2,my=(y+v)/2;let offsets=[[0,-16],[-22,-12],[18,18],[-18,-16],[0,18],[25,18]][i];mx+=offsets[0];my+=offsets[1];if(x===u)mx+=35;rect(s,mx-15,my-14,30,28,C.paper);txt(s,w,mx-15,my-14,30,28,21,col,true,'center');}}
 Object.keys(pos).forEach(n=>node(s,n,...pos[n],cols[assignment[n]]));
}
let s=base('分成三组，怎样少一点跨组沟通？','引入：上一课讨论两组交换。本课把同一张图分成三组，比较轮询和递归二分。生活情境为虚构教学设定。');
txt(s,'从五位同学的合作分组\n认识 Multiway Partitioning',66,235,680,125,35);txt(s,'同一张图 · 相同人数约束\n两种分法，为什么代价差 10？',66,423,680,110,27,C.muted);for(let i=0;i<3;i++){rect(s,820+i*130,258,110,275,C.pale[i],'none',18);txt(s,`组 ${i+1}`,828+i*130,273,94,35,18,[C.teal,C.blue,C.purple][i],true,'center');}node(s,'A',875,370,C.teal);node(s,'B',875,470,C.teal);node(s,'C',1005,420,C.blue);node(s,'D',1135,370,C.purple);node(s,'E',1135,470,C.purple);foot(s,'Lesson 8 · 五节点图 · k = 3','FanQin Zeng / EDA Learning');
s=base('先固定规则，分法才有可比性。','三组都必须非空。本例每节点大小为1，每组容量上限为2。因此组大小只能是2、2、1的某种顺序。人数平衡不等于边权代价小。');
nativeTable(s,['生活问题','图模型','本课设定'],[['五位同学','节点 A、B、C、D、E','每个节点大小 = 1'],['合作频次','无向边的权重','数值越大，联系越紧密'],['分成三组','k = 3 个分区','各组非空，容量不超过 2'],['跨组协调','跨区边权之和','在满足容量的分法中尽量小']],70,233,1140,330,25);foot(s,'允许 2、2、1；把所有人放在一组不满足容量。');
s=base('边权，表示想留在同组的联系。','完整边表：AB5、AC1、BC4、CD2、DE5、CE1。未列出的节点对没有边，按权重0处理。本课把电路简化为加权无向图，真实网表通常还涉及超边等模型。');
const pos={A:[180,330],B:[430,295],C:[640,485],D:[890,295],E:[1120,330]};
for(let i=0;i<edges.length;i++){let[a,b,w]=edges[i],[x,y]=pos[a],[u,v]=pos[b];line(s,x,y,u,v,w===5?C.teal:'#91abad',1+w*.7);let mx=(x+u)/2,my=(y+v)/2+(i%2?-20:20);rect(s,mx-17,my-17,34,34,C.paper);txt(s,w,mx-17,my-17,34,34,25,w===5?C.teal:C.muted,true,'center');}Object.entries(pos).forEach(([n,v])=>node(s,n,...v));foot(s,'A–B 与 D–E 的权重都是 5，值得特别留意。','边表：AB 5，AC 1，BC 4，CD 2，DE 5，CE 1。');
s=base('割代价，只累加跨区边。','p(v)表示节点v所属分区。定义cut为所有端点处于不同分区的无向边的权重总和，每条边仅计算一次。优化目标须与容量约束一起表述。');
txt(s,'cut(P) = Σ w(u,v) · [p(u) ≠ p(v)]',75,250,1130,90,42,C.teal,true,'center');txt(s,'每条无向边算一次。组内边贡献 0。',80,370,1120,65,30,C.ink,false,'center');line(s,190,467,1090,467,C.line,1);txt(s,'目标：让 cut 尽量小',110,500,500,65,31,C.ink,true);txt(s,'约束：三组非空，每组大小 ≤ 2',620,500,560,65,29,C.orange,true);foot(s,'先检查容量，再比较割代价。','若节点代表不同面积的单元，应累计面积而非人数。');
s=base('轮询分配：按字母依次放进三组。','算法：按字母A、B、C、D、E依次分到组1、组2、组3、组1、组2。得到AD、BE、C。它直接生成三组，但没有利用边权，因此只是基线。');
groups(s,RR,{weightLabels:false});foot(s,'A、D 同组；B、E 同组；C 单独一组。','人数为 2、2、1。橙线均跨区，权重总和为 18。');
s=base('轮询的六条边，全部跨区。','逐条核对六条边，AB5、AC1、BC4、CD2、DE5、CE1，合计18。不要因为边连接两个分区就算两次。');
nativeTable(s,['边','A–B','A–C','B–C','C–D','D–E','C–E'],[['权重',5,1,4,2,5,1],['是否跨区','是','是','是','是','是','是']],70,248,1140,215,24);txt(s,'cut = 5 + 1 + 4 + 2 + 5 + 1 = 18',85,504,1110,85,39,C.orange,true,'center');foot(s,'人数满足要求，仍可能产生很高的割代价。');
s=base('递归二分：先把 ABC 与 DE 分开。','本例第一刀保留紧密的ABC与DE两团，形成ABC和DE。此时ABC有3个节点，这是中间状态，还不是满足最终容量的三路划分。第一刀跨区边只有CD2、CE1，所以代价3。');
groups(s,{A:0,B:0,C:0,D:1,E:1},{top:230,bottom:565,labels:['待继续细分：ABC','已完成：DE']});foot(s,'第一刀跨区边：C–D = 2，C–E = 1，合计 3。','ABC 含 3 个节点，仍需细分，当前状态尚未满足最终容量。');
s=base('再分 ABC，得到 AB、C、DE。','只在ABC子图继续二分为AB与C。新增跨区边AC1和BC4，新增代价5。第一刀的CD与CE仍跨区，不重新累加一次。因此最终3+5=8。');
groups(s,RB);foot(s,'新增 A–C = 1、B–C = 4；最终 cut = 3 + 5 = 8。','最终各组为 AB、C、DE，大小 2、1、2。每条边在最终割中只算一次。');
s=base('递归树记录“先切哪一块”。','树中的叶子对应最终三组。第一次把5节点分成ABC与DE，第二次只细分ABC。k不是2的幂时，不要求每个分支深度相同。树形演示特定教学结果，一般算法还需指定如何选块、如何二分与容量处理。');
const box=(t,x,y,w=220,col=C.teal)=>{rect(s,x-w/2,y-30,w,60,'#ffffff',C.line,12);txt(s,t,x-w/2,y-30,w,60,28,col,true,'center');};
line(s,640,275,410,382,C.muted,3);line(s,640,275,940,382,C.muted,3);line(s,410,412,240,535,C.muted,3);line(s,410,412,565,535,C.muted,3);box('ABCDE',640,253,270);box('ABC',410,395,220);box('DE',940,395,220,C.purple);box('AB',240,550,220,C.teal);box('C',565,550,180,C.blue);txt(s,'第一刀增加 3',930,300,270,45,23,C.orange);txt(s,'第二刀增加 5',80,437,290,45,23,C.orange);foot(s,'三片叶子 = 三个分区；不必把 DE 再拆开。');
s=base('人数同样平衡，割代价相差 10。','公平比较保持同一张图、同样的容量要求。两种结果的分区大小多重集合都是2、2、1。差10来自AB5与DE5两条大边在递归结果里成为组内边。其余AC、BC、CD、CE两方案均跨区，合计8。');
nativeTable(s,['方法','最终分组','分区大小','割代价'],[['轮询','AD / BE / C','2、2、1',18],['递归二分','AB / C / DE','2、1、2',8]],70,242,1140,230,27);txt(s,'18 − 8 = 10 = w(A,B) + w(D,E)',80,510,1120,75,38,C.orange,true,'center');foot(s,'减少的 10，来自保留了两条权重为 5 的组内边。');
s=base('直接改进，也可以保留紧密连接。','从AD、BE、C出发，交换D和B，得到AB、DE、C，代价从18下降到8。交换保持两组各2人。该演示只是一个显而易见的交换，不是完整k-way FM算法，也不能据此把轮询代表所有直接多路优化算法。');
nativeTable(s,['状态','第 1 组','第 2 组','第 3 组','cut'],[['交换前','A、D','B、E','C',18],['交换 D 与 B 后','A、B','D、E','C',8]],70,250,1140,240,26);txt(s,'交换 D 与 B，人数保持 2、2、1。',95,526,1090,58,31,C.teal,true,'center');foot(s,'轮询只是直接分配基线，完整直接多路优化还有更丰富的搜索。','这一步交换示例不等同于完整的 k-way FM。');
s=base('修改边权，先预测再验证。','练习仅重新评价同样两个分组，不预先声称修改后递归求解器仍会产生相同结果。把AB从5改为1，轮询代价少4变14；AB在递归方案中为组内边，原有递归方案代价仍8，差距变6。算法重新运行可能重新选择切分。');
txt(s,'把 A–B 的权重从 5 改成 1。',80,238,1120,67,36,C.ink,true);nativeTable(s,['比较固定分组','修改前','修改后'],[['轮询 AD / BE / C',18,'？'],['原递归方案 AB / C / DE',8,'？'],['两方案代价差',10,'？']],100,345,1080,230,28);foot(s,'先找出 A–B 在两个方案中分别属于哪类边。','答案在讲者备注与配套讲义中。重新运行算法时，应重新检查其分组。');
s=base('改变组数，容量也要一起检查。','对于5个单位节点，每组容量上限为2。k=2总容量4，小于5，必然不可行。若改为k=2且上限3，ABC与DE合法，割代价3。k=3且上限2得到本课问题。不同约束的问题不能直接按代价评判优劣。');
nativeTable(s,['组数 k','每组容量上限','总容量','是否可行'],[[2,2,4,'否：放不下 5 个节点'],[2,3,6,'是：例如 ABC / DE'],[3,2,6,'是：例如 AB / C / DE']],70,252,1140,280,25);foot(s,'总容量足够是必要条件；不同面积的节点还需逐组检查。','ABC / DE 的 cut = 3，但它属于另一套约束。');
s=base('本例能穷举，一般输入仍需谨慎。','按3个有标签分区枚举，在非空、单位容量上限2下有90个可行分配。穷举证明此图最小割为8，忽略标签后对应AB、C、DE。该结论只针对这张小图。一般递归二分启发式不保证全局最优，局部平衡不必然保证最终统一容量。');
[['本例的验证','90 个可行带标签分配，最小 cut = 8。'],['一般图的边界','递归二分不保证对所有输入都找到全局最优。'],['容量的边界','逐层二分的局部平衡，不能替代最终逐组容量检查。']].forEach(([a,b],i)=>{let y=237+i*113;txt(s,a,70,y,245,55,29,C.teal,true);txt(s,b,340,y,850,78,28);});foot(s,'若输出超出容量，应报告不可行结果并调整方法。','单位节点数量与单元面积不同，工程约束必须明确建模。');
s=base('实验报告，要能解释结果从哪里来。','学生先手算参考图，再在实验台逐步观察，再修改一个参数记录结果。报告至少包括输入图与容量、方法和分组、逐边割代价与大小、修改前后的差异解释。完整八题练习与解析见配套讲义。');
[['输入','保存图、k、节点大小和容量上限。'],['结果','记录分组、各组大小与逐条跨区边。'],['对照','修改一个条件，解释变化原因。'],['结论','说明结果是否可行，以及方法的局限。']].forEach(([a,b],i)=>{let y=232+i*86;txt(s,String(i+1).padStart(2,'0'),75,y,65,50,23,C.teal,true);txt(s,a,165,y,180,50,29,C.ink,true);txt(s,b,355,y,840,58,27);});foot(s,'课堂挑战：手动分组后，再与轮询、递归二分进行比较。');
s=base('同样的容量，连接关系决定分组质量。','回顾：多路划分需要同时考虑目标和约束。本课轮询18，递归示例8，同样的大小多重集合2、2、1。差10来自AB与DE两条重边留在组内。直接多路方法可进行更广泛的改进，递归方法也有局限。');
txt(s,'轮询 18       递归示例 8',80,245,1120,90,51,C.teal,true,'center');txt(s,'保留紧密连接，逐组检查容量。\n用相同输入比较，用逐条边解释。',80,372,1120,130,34,C.ink,false,'center');txt(s,'课程：yongfu-li / eda-learning · Partitioning Lesson 8\n配套：互动网站、课程视频、可编辑课件、讲义与源码',80,536,1120,66,21,C.muted,false,'center');foot(s,'FanQin Zeng · EDA Learning / Lesson 8','完整来源链接位于本页及各页讲者备注。');
await fs.mkdir(path.join(TMP,'slides'),{recursive:true});await fs.mkdir(OUT,{recursive:true});
for(let[i,slide]of p.slides.items.entries()){let b=await p.export({slide,format:'png',scale:1.5});await fs.writeFile(path.join(TMP,'slides',`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await b.arrayBuffer()));console.log('Rendered slide',i+1);}
const draft=path.join(TMP,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(draft);
const {finalizePresentation}=await import(pathToFileURL(path.join(SKILL,'container_tools/artifact_tool_utils.mjs')).href);
const tables=[2,6,10,11,12,13];
await fs.mkdir(path.join(TMP,'validated'),{recursive:true});
const stamp=Date.now(), finalPath=path.join(TMP,'validated',`Lesson8-lecture-validated-${stamp}.pptx`);
const result=await finalizePresentation({workspaceDir:ROOT,candidatePath:draft,finalPath,pythonExecutable:PY,integrityValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(SKILL,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit',...tables.flatMap(n=>['--require-native-table-slide',String(n)])],explicitTotalSlideCount:16,requiredNativeTableOwnerSlides:tables,fontPolicy:{basis:'design',families:[FONT]},verifyArtifactToolImport:true,receiptPath:path.join(TMP,`pptx-validation-${stamp}.json`)});
await fs.copyFile(finalPath,path.join(OUT,'Lesson8-lecture.pptx'));
try{const pdf=await p.export({format:'pdf'});await fs.writeFile(path.join(OUT,'Lesson8-slides.pdf'),new Uint8Array(await pdf.arrayBuffer()));}
catch(error){console.warn('Direct PDF export unavailable:',error.message);console.warn('Use authoring/export_slides_pdf.py for a faithful raster preview from these rendered slides.');}
console.log(JSON.stringify(result));
