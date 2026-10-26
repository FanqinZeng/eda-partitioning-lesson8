"""Build the six-page Lesson 8 guide and its Markdown source using ReportLab."""
from pathlib import Path
import json
from xml.sax.saxutils import escape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Flowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'materials'; OUT.mkdir(exist_ok=True)
pdfmetrics.registerFont(TTFont('CJK','/System/Library/Fonts/Supplemental/Arial Unicode.ttf'))
INK=colors.HexColor('#153641'); TEAL=colors.HexColor('#158c87'); BLUE=colors.HexColor('#365f95'); PURPLE=colors.HexColor('#82639d'); ORANGE=colors.HexColor('#c46d31'); MUTED=colors.HexColor('#637a80'); PAPER=colors.HexColor('#f3f4ed')
styles={k:ParagraphStyle(k,fontName='CJK',fontSize=size,leading=leading,textColor=col,spaceAfter=after,wordWrap='CJK') for k,size,leading,col,after in [('title',24,33,INK,18),('h',14,22,TEAL,9),('body',10.5,16.5,INK,8),('small',8.3,12.5,MUTED,6),('q',10.8,17,INK,9)]}
flow=[]; md=['# Lesson 8 多路划分自学讲义','\n分成三组，怎样少一点跨组沟通？\n\nFanQin Zeng · EDA Learning\n']
graph=json.loads((ROOT/'data/tiny_graph.json').read_text())
edges=[(e['u'],e['v'],e['w']) for e in graph['edges']]
if edges!=[('A','B',5),('A','C',1),('B','C',4),('C','D',2),('D','E',5),('C','E',1)]:
    raise ValueError('Teaching graph changed; update the authored explanation before building.')
def p(t,style='body'):
    flow.append(Paragraph(t,styles[style])); md.append(t.replace('<br/>','\n').replace('<b>','').replace('</b>','').replace('&lt;','<').replace('&gt;','>').replace('&amp;','&')+'\n')
def title(n,t): p(f'{n:02} / {t}','title')
def gap(h=7): flow.append(Spacer(1,h))
def page(): flow.append(PageBreak()); md.append('\n---\n')
def table(headers,rows,widths=None):
    vals=[[Paragraph(escape(str(x)),styles['small' if i==0 else 'body']) for x in row] for i,row in enumerate([headers]+rows)]
    t=Table(vals,colWidths=widths or [510/len(headers)]*len(headers),hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e0eae2')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f0f4ed')]),('LINEBELOW',(0,0),(-1,-1),.5,colors.HexColor('#d0dcd6')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
    flow.append(t);gap(11);md.append('| '+' | '.join(map(str,headers))+' |');md.append('| '+' | '.join(['---']*len(headers))+' |');md.extend('| '+' | '.join(map(str,r))+' |' for r in rows);md.append('')
class Graph(Flowable):
    def __init__(self,assignment): super().__init__();self.a=assignment;self.width=510;self.height=164
    def draw(self):
        c=self.canv;pos={}; cols=[TEAL,BLUE,PURPLE];pales=['#e0eee6','#e5ebf4','#eee7f2']
        for g in range(3):
            c.setFillColor(colors.HexColor(pales[g]));c.roundRect(5+g*171,5,158,152,9,fill=1,stroke=0);c.setFillColor(cols[g]);c.setFont('CJK',9);c.drawString(15+g*171,139,f'第 {g+1} 组')
            ns=sorted(n for n in self.a if self.a[n]==g)
            for i,n in enumerate(ns):pos[n]=(84+171*g,85 if len(ns)==1 else 113-i*72)
        for i,(a,b,w) in enumerate(edges):
            x,y=pos[a];u,v=pos[b];co=ORANGE if self.a[a]!=self.a[b] else colors.HexColor('#98adad');c.setStrokeColor(co);c.setLineWidth(.7+w*.32);c.line(x,y,u,v)
            mx=(x+u)/2+(18 if x==u else [-4,-7,7,-8,0,10][i]);my=(y+v)/2+[8,7,-9,8,-10,-9][i]
            if i==1 and self.a['C']==2: mx,my=210,91
            c.setFillColor(PAPER);c.roundRect(mx-7,my-7,14,14,2,fill=1,stroke=0);c.setFillColor(co);c.setFont('CJK',9);c.drawCentredString(mx,my-3,str(w))
        for n,(x,y) in pos.items():c.setFillColor(cols[self.a[n]]);c.circle(x,y,13,fill=1,stroke=0);c.setFont('CJK',11);c.setFillColor(colors.white);c.drawCentredString(x,y-4,n)

title(1,'五位同学，分成三组')
p('学习目标：能手算多路划分的割代价，比较轮询与递归二分，解释容量约束，并用一次参数修改验证自己的预测。')
p('五位同学合作完成项目，频繁沟通的人若分在不同组，需要更多跨组协调。用节点表示同学，用带权无向边表示合作联系。生活情境为虚构教学设定。')
table(['对象','模型','本例规则'],[['五位同学','A、B、C、D、E','每个节点大小为 1'],['三组','k = 3 个非空分区','每组容量上限为 2'],['合作联系','非负边权','跨区边权越少越好']],[140,170,200])
p('完整输入与目标','h')
p('边表：AB=5，AC=1，BC=4，CD=2，DE=5，CE=1。未列出的节点对没有边。本课使用加权无向图作为简化模型。')
p('<b>割代价 cut(P)</b> 是所有端点处于不同分区的边的权重之和。每条无向边只算一次，组内边贡献 0。目标是：在满足三组非空、每组大小不超过 2 的方案中，让 cut 尽量小。')
p('轮询基线：AD / BE / C','h')
flow.append(Graph({'A':0,'D':0,'B':1,'E':1,'C':2}));gap(6)
p('按 A、B、C、D、E 依次放进第 1、2、3、1、2 组。人数为 2、2、1，满足容量。六条边全部跨区，所以 cut = 5+1+4+2+5+1 = <b>18</b>。')
page();title(2,'递归二分，逐步保留紧密联系')
p('第一刀：ABCDE 分成 ABC 与 DE','h')
p('先保留两团紧密联系，只切开 CD=2 与 CE=1，当前割代价为 3。ABC 含 3 个节点，它是待细分的中间块，尚未满足最终三路容量。')
p('第二刀：只把 ABC 分成 AB 与 C','h')
p('新切开 AC=1 与 BC=4，新增代价为 5。DE 不再拆分。最终叶子是 AB、C、DE，大小为 2、1、2。第一刀的边仍跨区，最终只计一次。')
flow.append(Graph({'A':0,'B':0,'C':1,'D':2,'E':2}));gap(9)
p('<b>最终 cut = CD(2) + CE(1) + AC(1) + BC(4) = 8。</b>也可按切分过程核对：第一刀 3，加第二刀新增 5，合计 8。')
table(['方法','最终分组','各组大小','cut'],[['轮询','AD / BE / C','2、2、1',18],['递归示例','AB / C / DE','2、1、2',8]],[110,180,130,90])
p('为什么相差 10？','h')
p('两种方案都使 AC、BC、CD、CE 跨区，合计 8。递归方案把 AB=5 与 DE=5 留在组内，而轮询把这两条重边也切开。因此差距是 5+5=10。人数同样接近平衡，并不能说明沟通代价一样。')
p('直接改进示例：从轮询结果交换 D 与 B，得到 AB / DE / C，人数仍为 2、2、1，cut 降到 8。它展示直接多路改进的直觉，但不等于完整的 k-way FM。轮询也不能代表所有直接多路算法。','small')
page();title(3,'算法过程、容量与验证')
p('轮询分配的教学伪代码','h')
p('1. 把节点按名字排序，设置三个空组。<br/>2. 节点和组都从 0 编号，第 i 个节点放入编号 i mod k 的组。<br/>3. 输出节点归属、割代价、每组大小与容量检查。<br/>它只看顺序，不看边权。若遇到面积不同的节点，还必须验证容量。')
p('递归二分的教学过程','h')
p('1. 从包含全部节点的一块开始。<br/>2. 选择还需细分的块，在其诱导子图内进行二分。<br/>3. 记录本次新切开的边与两个子块。<br/>4. 达到 k 个叶子后，用完整输入图重算最终 cut。<br/>5. 对每个最终分区检查容量，报告是否可行。')
p('本课展示的切分树是 ABCDE 分为 ABC、DE，再把 ABC 分为 AB、C。一般实现还必须明确“选哪一块”和“如何二分”，相同名称并不保证相同结果。')
table(['设定','判断','原因'],[['k=2，上限=2','必然不可行','总容量 4 小于节点总大小 5'],['k=2，上限=3','可行示例 ABC / DE','割代价为 3，属于另一套约束'],['k=3，上限=2','本课问题','可行大小为 2、2、1 的排列']],[160,175,175])
p('小图的穷举能证明什么？','h')
p('本例可行的带标签分配有 90 个。先选择单节点组的标签和节点：3×5；再从其余 4 个节点中选 2 个给一个指定标签组：6 种，因此 3×5×6=90。枚举最小割为 8，忽略标签后对应 AB / C / DE。')
p('这个最优性结论只针对当前五节点图。一般递归二分不保证全局最优，局部二分平衡也不自动保证最终统一容量。若单元面积不同，需累计面积；总容量足够仍只是必要条件。','small')
page();title(4,'用实验检验自己的解释')
p('一次完整的实验记录','h')
table(['步骤','建议记录'],[['读取输入','边表、k、节点大小、各组容量上限'],['运行与观察','每一步分组、跨区边、割代价、各组大小'],['公平比较','两方法使用同一张图及同样约束'],['改变条件','先写预测，再修改输入并重新运行'],['解释结果','说明变化来自哪些边，最终是否满足容量']],[115,395])
p('参数挑战：把 AB 的权重从 5 改为 1','h')
p('先比较同样的两个固定方案。轮询方案中 AB 跨区，因此代价减少 4，从 18 变为 14。原递归方案中 AB 是组内边，其代价仍为 8，差距变为 6。若重新运行算法，应重新检查输出的分组，不能预先假设它总会返回原方案。')
p('报告示例','h')
p('“我把 AB 从 5 改成 1。在固定分组 AD / BE / C 下，只有 AB 对割代价的贡献改变，所以 cut 从 18 降到 14。固定分组 AB / C / DE 的 cut 仍为 8。两方案均满足每组容量 2，差距从 10 变为 6。”')
p('工程联系与边界','h')
p('节点可近似表示电路单元，边可近似表示连接。真实 EDA 常需超图、面积、时序和拥塞模型。本例的单位大小只保持人数，不等价于工程中的面积平衡。对规模更大的图，优化方法还需处理搜索效率和可行性。')
p('课程出处与配套','h')
p('教师模块：github.com/yongfu-li/eda-learning/tree/main/courses/learn_partitioning/module03-01-multiway-partition<br/>本课仓库：github.com/FanqinZeng/eda-partitioning-lesson8<br/>前课风格与制作参考：github.com/FanqinZeng/eda-clustering-lab7-kl','small')
p('配套材料：16 页可编辑课件与 PDF、课程视频、互动实验台、算法源码。网站与课件使用同一套五节点数据。下两页是 8 道练习与完整解析。','small')
page();title(5,'练习：先手算，再打开实验台')
questions=[('列出轮询分组 AD / BE / C 的全部跨区边，计算 cut。','每条无向边只能计算一次。'),('递归第一刀 ABC / DE 切开哪些边？割代价是多少？','说明为何这时还不是最终可行的三路结果。'),('把 ABC 细分成 AB / C 后，新增代价是多少？最终代价是多少？','区分“新增边”与“已切开的边”。'),('两种方案人数都接近平衡，为什么割代价相差 10？','指出恰好发生状态改变的两条边。'),('从 AD / BE / C 交换哪两个节点，可以在保持人数时得到 cut=8？','写出交换后的完整分组。'),('把 AB 权重从 5 改为 1，两个固定方案的代价与差距分别是多少？','固定方案为 AD / BE / C 与 AB / C / DE。'),('若改成 k=2，但每组容量仍为 2，能否放下五个单位节点？','若上限改为 3，ABC / DE 的代价是多少？'),('“递归二分保证全局最优，只要局部平衡，最终容量就一定合法。”对吗？','解释本例穷举结论的适用范围，并讨论面积不同的节点。')]
for i,(q,hint) in enumerate(questions,1):p(f'<b>{i}. {q}</b>','q');p(hint,'small');gap(12)
page();title(6,'练习解析与完成自查')
answers=[('轮询割代价','AB=5、AC=1、BC=4、CD=2、DE=5、CE=1 全部跨区，合计 18。'),('第一刀','只有 CD=2 与 CE=1 跨区，cut=3。此时只有两块，且 ABC 的大小为 3，需要继续细分。'),('第二刀','新增 AC=1 与 BC=4，合计 5。最终 3+5=8。CD 与 CE 仍跨区，最终每条只算一次。'),('差距来源','AB=5 与 DE=5 在轮询中跨区，在递归结果中属于组内。其他四条边的状态不变，因此相差 10。'),('一次直接交换','交换 D 与 B，结果为 AB / DE / C，大小保持 2、2、1，cut=8。这只是直接改进示例，不是完整 k-way FM。'),('改变 AB 权重','轮询固定方案为 14，原递归固定方案仍为 8，差距为 6。重新求解时，算法可能选择不同的划分。'),('改变容量','不能。k=2、上限2时总容量为4，小于5。上限改为3后 ABC / DE 合法，其代价为 CD2+CE1=3。'),('算法边界','该说法不成立。递归二分一般不保证全局最优，最终每组仍需检查容量。本图90个可行带标签分配的穷举证明最小值8，只适用于该输入。面积不同需按面积累计。')]
for i,(h,a) in enumerate(answers,1):p(f'{i}. {h}','h');p(a)
p('完成自查：我能区分“组数、容量、目标”，能逐边核算 18 与 8，能解释差距 10，能对一次输入修改先预测再验证，并报告输出是否可行。','small')
def onpage(c,doc):
    c.setFillColor(PAPER);c.rect(0,0,595.28,841.89,fill=1,stroke=0);c.setStrokeColor(colors.HexColor('#d0dcd6'));c.line(42,800,553,800);c.setFont('CJK',8);c.setFillColor(MUTED);c.drawString(42,812,'Lesson 8 · 多路划分自学讲义');c.drawRightString(553,812,'FanQin Zeng / EDA Learning');c.line(42,40,553,40);c.drawString(42,25,'同一张图，同样的容量约束，逐边解释结果。');c.drawRightString(553,25,str(doc.page))
doc=SimpleDocTemplate(str(OUT/'Lesson8-guide.pdf'),pagesize=(595.28,841.89),leftMargin=42,rightMargin=42,topMargin=60,bottomMargin=58,title='Lesson 8 多路划分自学讲义与练习解析',author='FanQin Zeng')
doc.build(flow,onFirstPage=onpage,onLaterPages=onpage)
(OUT/'Lesson8-guide.md').write_text('\n'.join(md),encoding='utf-8')
print('Six-page guide PDF and Markdown ready')
