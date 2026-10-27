# 整片文字稿与分镜

实际时长 540.00 秒。生活例子为虚构教学情境，算法数据取自课程图。

## 0.00–18.41 秒：这次，要分成三组
画面类型：life。

0.55–5.46：上一课，五位同学分成两组。这一次，项目需要三个小组。
Last lesson, five students formed two teams. This project needs three teams.

6.50–10.50：经常合作的人仍然希望坐在一起，少一点跨组协调。
Frequent collaborators still want to stay together and reduce cross-team coordination.

11.55–16.85：两组变三组，我们还能照搬原来的分法吗？先从生活问题看起。
Can we reuse the old grouping when two teams become three? Start with the everyday problem.

## 18.41–34.74 秒：每组最多两人
画面类型：capacity。

18.71–23.57：这一次有三张工作桌，每桌最多两人，三个小组都要有人。
There are three worktables, each holding at most two students. Every team must be nonempty.

23.99–28.73：五个人分完，人数只能是二、二、一，顺序可以交换。
With five students assigned, the sizes must be 2, 2 and 1, in any order.

29.15–34.44：分组既要满足容量，也要尽量减少跨组沟通，两件事一起检查。
A grouping must satisfy capacity and should reduce cross-team coordination. Check both.

## 34.74–54.00 秒：把合作关系变成图
画面类型：model。

35.29–40.07：把同学换成节点 A 到 E，合作关系画成边，数字表示边权。
Replace the students with vertices A through E. Edges represent collaboration, with numerical weights.

41.05–45.58：A 和 B、D 和 E 的边权都是五，是两对联系紧密的伙伴。
A–B and D–E each have weight 5: two closely connected pairs.

46.56–52.59：其余四条边是 A C 为一，B C 为四，C D 为二，C E 为一。
The other four edges are A–C: 1, B–C: 4, C–D: 2 and C–E: 1.

## 54.00–73.82 秒：跨区边，每条只算一次
画面类型：objective。

54.55–60.02：给每个节点指定一个分区。边的两端属于不同分区，才计入割代价。
Assign a partition to each vertex. An edge contributes to the cut only when its endpoints are in different partitions.

61.27–65.94：把所有跨区边的权重相加，就得到加权割代价，也叫 cutsize。
Add the weights of all crossing edges to obtain the weighted cut cost, or cutsize.

67.18–71.86：我们用的是无向图，每条边只算一次。组内边不计入这个和。
This is an undirected graph. Count each edge once; internal edges do not enter this sum.

## 73.82–92.02 秒：先试最直观的轮询
画面类型：roundrobin。

74.12–79.19：先按字母顺序轮流发座位：A 去第一组，B 去第二组，C 去第三组。
Assign seats in alphabetical round-robin order: A to team 1, B to team 2 and C to team 3.

79.61–86.19：接着 D 回到第一组，E 去第二组。得到 A D、B E，以及单独的 C。
Then D returns to team 1 and E goes to team 2. The groups are A D, B E and C.

86.61–91.72：人数是二、二、一，符合容量。可合作关系保留得怎么样？
The sizes are 2, 2 and 1, so capacity is satisfied. But what happens to the connections?

## 92.02–111.75 秒：人数合理，代价却是十八
画面类型：roundcut。

92.57–98.28：现在逐条看，两条权重为五的边都跨区，其余四条边也都跨区。
Inspect each edge. Both edges of weight 5 cross, and so do the other four edges.

99.00–104.50：五加一加四加二加五加一，割代价是十八。没有任何边留在组内。
The cut is 5 + 1 + 4 + 2 + 5 + 1 = 18. No edge stays inside a group.

105.21–110.86：轮询分得快，但只看顺序。人数平衡，并不代表连接代价就小。
Round robin is quick but only follows the ordering. Balanced counts do not imply a small connection cost.

## 111.75–132.87 秒：递归是流程，谱二分选择每一刀
画面类型：recurseidea。

112.13–119.19：递归二分把多组问题拆成反复分两组。每切一次，组数增加一，达到三组就停止。
Recursive bisection repeatedly splits one part into two. Each cut adds one part; stop at three.

119.65–125.65：本课每次选择节点最多的组继续拆。二分表示分成两组，两边人数可以不同。
This baseline always splits a part with the most nodes. A bisection here need not have equal counts.

126.11–132.49：这是外层流程。里面每一刀怎样选？接下来用谱二分，把依据算出来。
That is the outer process. How is each cut chosen? Next, spectral bisection makes that decision explicit.

## 132.87–150.33 秒：字母顺序，只是输入的编号
画面类型：inputorder。

133.42–139.46：最开始，A 到 E 只是节点名称。按字母列出，是为了固定输入顺序。
A through E are node names. Alphabetical order only fixes the input indexing.

141.45–146.89：轮询直接使用这个顺序。谱二分会根据连线，重新计算每个节点的位置。
Round robin uses that order directly. Spectral bisection computes a new position from the connections.

## 150.33–178.69 秒：把节点放上数轴，强联系尽量靠近
画面类型：spectralidea。

150.88–155.32：想象连线是弹簧，权重越大，越不希望两个端点相隔很远。
Imagine each edge as a spring. A heavier edge penalizes a larger distance between its endpoints.

157.81–164.49：给节点设置坐标，把每条边的权重，乘上两端坐标差的平方，再加起来，希望总量尽量小。
Assign coordinates and minimize the sum of each edge weight times its squared coordinate difference.

166.98–174.25：还要让坐标之和为零，平方和为一。这样固定中心和尺度，防止所有节点挤成一个点。
Require zero coordinate sum and unit squared norm, fixing center and scale and preventing collapse.

## 178.69–210.34 秒：从边权构造拉普拉斯矩阵
画面类型：laplacian。

179.24–186.37：先把边权写成拉普拉斯矩阵。对角线填连接权重之和，其余位置填两点之间边权的负数。
Build the Laplacian: weighted degree on the diagonal and negative edge weight off the diagonal.

189.00–195.96：A 连接 B 的五，和 C 的一，所以 A 这一行是：六、负五、负一、零、零。
A connects to B with weight five and C with weight one. Its row is six, minus five, minus one, zero, zero.

198.60–205.61：没有边的位置填零。行和列按字母编号，方便对应节点，下一步才计算新顺序。
Missing edges give zero. Alphabetical row and column indices identify nodes; the new order comes next.

## 210.34–241.02 秒：怎样由矩阵求出坐标？
画面类型：fiedler。

210.89–217.72：对于这张连通图，刚才的坐标问题，可以通过矩阵的第二小特征值对应的特征向量来求解。
For this connected graph, the coordinate problem is solved by an eigenvector for the second-smallest Laplacian eigenvalue.

219.88–226.99：这组数叫菲德勒向量。最小特征值对应所有坐标相同，所以要排除这种没有区分的情况。
This is the Fiedler vector. The smallest eigenvalue has constant coordinates, which give no useful distinction.

229.16–237.24：本课程序用八十轮数值迭代近似计算。每轮近似求解方程，再减去均值并归一化，得到新的坐标。
The course code approximates it in eighty iterations: approximately solve a linear system, remove the mean, then normalize.

## 241.02–263.06 秒：按算出的坐标重新排序
画面类型：spectralorder。

241.35–246.44：计算后，D 和 E 的坐标相近，A 和 B 的坐标相近，C 在它们之间。
The computed coordinates place D near E and A near B, with C between those pairs.

246.88–254.75：按坐标从小到大，得到 E、D、C、B、A。字母顺序在这里被连接关系重新排列。
Sorting coordinates from smallest to largest gives E, D, C, B, A.

255.18–262.74：这些小数用来生成候选顺序。排序以后，还要比较实际切边代价，才能决定在哪里分组。
The coordinates generate an ordering. We must still compare actual cut costs to choose a partition.

## 263.06–296.70 秒：第一刀：把四个候选全部算出来
画面类型：sweep。

263.61–270.63：沿着这个顺序，有四个相邻切口。只把 E 放左边，会切开 D E 和 C E，代价是六。
There are four adjacent cut positions. Isolating E cuts D–E and C–E, for cost six.

272.01–276.95：把 E、D 放左边，只切开 C D 和 C E，代价是三。
Putting E and D on the left cuts only C–D and C–E, for cost three.

278.32–284.39：把 E、D、C 放左边，代价是五。只把 A 留右边，代价是六。
Putting E, D and C on the left costs five. Leaving only A on the right costs six.

285.76–294.49：四种候选都通过局部面积过滤，选其中代价最小的三。这只比较排序上的切口，不保证任意图上全局最优。
All four pass the local area filter. Choose the smallest cost, three. This sweep does not guarantee a global optimum on every graph.

## 296.70–314.79 秒：第一刀：ABC 与 DE
画面类型：firstsplit。

297.06–302.42：比较四个候选后，第一刀选 A、B、C 一边，D、E 另一边。
After comparing all four candidates, choose A, B, C on one side and D, E on the other.

302.87–308.49：两边之间只有 C D 和 C E 跨区，权重二加一，当前代价是三。
Only C–D and C–E cross between the sides. Their weights sum to 2 + 1 = 3.

308.94–314.43：A B 和 D E 两条粗边都留下了。不过现在只有两组，工作还没完成。
Both heavy edges A–B and D–E stay internal. But we still have only two groups.

## 314.79–340.38 秒：第二刀要对子图重新计算
画面类型：subgraph。

315.09–322.35：现在有 A B C 和 D E 两组。A B C 有三个人，比另一组多，因此继续拆它。
We now have A B C and D E. The three-node part is larger, so it is split next.

322.77–330.63：只保留 A B、A C、B C 三条内部边。第一刀已切开的边，这次不参与子图的坐标计算。
Keep only the internal edges A–B, A–C and B–C. Previously cut edges do not enter this coordinate calculation.

331.05–340.08：对子图重新构造矩阵、计算谱坐标，得到新的顺序 A、B、C。每一刀都重新计算，而非照搬第一次排序。
Rebuild the subgraph Laplacian and coordinates, giving the new order A, B, C. Each split is computed afresh.

## 340.38–360.90 秒：第二刀：比较六与五
画面类型：secondsweep。

340.93–349.23：沿着 A、B、C，只有两个候选。A 单独一组，切开 A B 和 A C，代价五加一，等于六。
Along A, B, C there are two candidates. Isolating A cuts A–B and A–C, for five plus one, or six.

350.61–358.68：A B 留在一起，C 单独一组，切开 A C 和 B C，代价一加四，等于五。因此选这一刀。
Keeping A B together and isolating C cuts A–C and B–C, for one plus four, or five. Choose this cut.

## 360.90–380.16 秒：第二刀：把 ABC 分成 AB 与 C
画面类型：secondsplit。

361.20–366.54：根据刚才的比较，把 A B C 分成 A B 和 C。现在总共得到三个组。
Following that comparison, split A B C into A B and C. We now have three parts.

366.96–371.95：这次新增的跨区边是 A C 和 B C，权重一加四，等于五。
This split adds crossing edges A–C and B–C, with weights 1 + 4 = 5.

372.37–379.86：最终三组是 A B、C、D E，人数二、一、二，每组都没有超过两人。
The final groups are A B, C and D E. Their sizes are 2, 1 and 2, all within capacity.

## 380.16–399.76 秒：最终是三加五，等于八
画面类型：cumulative。

380.71–384.95：第二刀的五只是新增代价，第一刀切开的三仍然存在。
The second cut of 5 is an additional cost. The first cut of 3 still exists.

386.09–390.86：因此最终割代价是三加五，等于八，不能只报告最后一步的五。
The final cut cost is therefore 3 + 5 = 8. Reporting only the last split's 5 would be wrong.

392.00–398.02：从最终图重算，一加四加二加一也是八。四条跨区边，各算一次。
Recounting the final graph gives 1 + 4 + 2 + 1 = 8: four crossing edges, each counted once.

## 399.76–418.01 秒：同样人数，为什么差十分？
画面类型：compare。

400.23–405.28：把两种结果并排看，人数都由两个二和一个一组成，容量一样满足。
Compare the results side by side. Both have two groups of 2 and one group of 1, satisfying the same capacity.

405.78–411.82：差别在两条权重为五的边。递归结果保住 A B 和 D E，少了十分。
The difference is the two edges of weight 5. Keeping A–B and D–E internal saves 10.

412.32–417.55：十八减八等于十。我们优化的是连接结构，不能只盯着人数条形图。
Eighteen minus eight is ten. We optimize connection structure, so the size bars alone are not enough.

## 418.01–436.81 秒：直接多路划分，比轮询更广
画面类型：direct。

418.56–423.73：直接多路划分，是直接维护多个分区，而不是必须沿二叉树拆开。
Direct multiway partitioning maintains several partitions directly, without requiring a binary split tree.

424.48–430.07：轮询只是本课的简单起点。它不看边权，不能代表所有直接多路算法。
Round robin is only our simple starting point. It ignores edge weights and does not represent all direct multiway algorithms.

430.82–435.86：直接方法也能比较移动或交换的收益，在容量允许时继续改进。
Direct methods can compare gains from moves or swaps and refine the grouping within capacity limits.

## 436.81–454.91 秒：交换 D 和 B，也能改进
画面类型：refinement。

437.11–441.46：回到轮询结果，试着交换第一组的 D 和第二组的 B。
Return to the round-robin result. Try swapping D from team 1 with B from team 2.

441.88–448.31：得到 A B、D E、C，人数不变，代价也从十八降到八，收益是十。
We get A B, D E and C. Sizes stay unchanged, and the cost drops from 18 to 8, a gain of 10.

448.73–454.61：这是一个贪心成对交换示意。它帮助理解改进动作，不是完整的多路 F M。
This illustrates a greedy pair swap. It explains refinement moves, but is not a complete multiway FM algorithm.

## 454.91–474.29 秒：每一刀都好，整体未必最好
画面类型：limits。

455.21–460.37：递归二分做了前面的决定，后面通常只在现有子块里继续切分。
After an early bisection decision, later splits usually operate within the existing child parts.

460.79–466.76：先前拆开的节点，可能很难重新团聚。局部好的第一刀，未必带来最好全局。
Vertices separated early may be hard to reunite. A good first split need not produce the best global result.

467.18–473.99：拆最大块也是基线策略。图更大或分区数改变时，要实际检查最终容量。
Splitting the largest part is also a baseline. For larger graphs or a different k, explicitly check final capacities.

## 474.29–493.49 秒：改一个条件，重新计算
画面类型：exercise。

474.59–480.61：第一个挑战，把 A B 的边权从五改成一。先保留原分组，重算割代价。
First challenge: change A–B from weight 5 to 1. Keep each grouping fixed and recompute its cost.

481.03–487.17：然后重新运行算法，观察选择是否变化。边权改了，旧答案不能直接照搬。
Then rerun the algorithms and check whether their choices change. Do not assume the old answers still apply.

487.59–493.19：第二个挑战，改变分区数，同时调整容量，比较可行性和连接代价。
Second challenge: change k and adjust capacity accordingly. Compare feasibility and connection cost.

## 493.49–516.64 秒：把完整过程讲给同学听
画面类型：recap。

494.04–500.48：回顾每一刀：从当前子图的边权构造矩阵，算谱坐标，排序，再比较候选切口。
For each split: build the current subgraph Laplacian, compute coordinates, sort, then compare sweep cuts.

503.57–510.99：递归流程选择继续拆哪组，谱二分决定怎么拆。到达目标组数后，报告总割代价和容量。
Recursion chooses which part to split; spectral bisection chooses how. At the target count, report total cut and capacity.

## 516.64–540.00 秒：好的分组，要同时说清两件事
画面类型：finish。

517.19–522.69：解释一个方案，既要说连接代价是多少，也要说每组负载是否符合要求。
When explaining a solution, report both its connection cost and whether every partition meets its load limit.

526.58–532.77：完成练习，记录你改过的参数和结果。能解释变化的原因，就学会了这堂课。
Complete the exercises and record your changed parameters and results. Explain why they changed to demonstrate your understanding.
