# 整片文字稿与分镜

实际时长 360.00 秒。生活例子为虚构教学情境，算法数据取自课程图。

## 0.00–16.50 秒：这次，要分成三组
画面类型：life。

0.36–5.50：上一课，五位同学分成两组。这一次，项目需要三个小组。
Last lesson, five students formed two teams. This project needs three teams.

5.95–10.14：经常合作的人仍然希望坐在一起，少一点跨组协调。
Frequent collaborators still want to stay together and reduce cross-team coordination.

10.59–16.14：两组变三组，我们还能照搬原来的分法吗？先从生活问题看起。
Can we reuse the old grouping when two teams become three? Start with the everyday problem.

## 16.50–33.53 秒：每组最多两人
画面类型：capacity。

16.80–21.90：这一次有三张工作桌，每桌最多两人，三个小组都要有人。
There are three worktables, each holding at most two students. Every team must be nonempty.

22.32–27.28：五个人分完，人数只能是二、二、一，顺序可以交换。
With five students assigned, the sizes must be 2, 2 and 1, in any order.

27.70–33.23：分组既要满足容量，也要尽量减少跨组沟通，两件事一起检查。
A grouping must satisfy capacity and should reduce cross-team coordination. Check both.

## 33.53–51.16 秒：把合作关系变成图
画面类型：model。

33.87–38.88：把同学换成节点 A 到 E，合作关系画成边，数字表示边权。
Replace the students with vertices A through E. Edges represent collaboration, with numerical weights.

39.32–44.07：A 和 B、D 和 E 的边权都是五，是两对联系紧密的伙伴。
A–B and D–E each have weight 5: two closely connected pairs.

44.51–50.82：其余四条边是 A C 为一，B C 为四，C D 为二，C E 为一。
The other four edges are A–C: 1, B–C: 4, C–D: 2 and C–E: 1.

## 51.16–68.39 秒：跨区边，每条只算一次
画面类型：objective。

51.56–57.29：给每个节点指定一个分区。边的两端属于不同分区，才计入割代价。
Assign a partition to each vertex. An edge contributes to the cut only when its endpoints are in different partitions.

57.76–62.64：把所有跨区边的权重相加，就得到加权割代价，也叫 cutsize。
Add the weights of all crossing edges to obtain the weighted cut cost, or cutsize.

63.11–68.00：我们用的是无向图，每条边只算一次。组内边不计入这个和。
This is an undirected graph. Count each edge once; internal edges do not enter this sum.

## 68.39–87.39 秒：先试最直观的轮询
画面类型：roundrobin。

68.69–74.00：先按字母顺序轮流发座位：A 去第一组，B 去第二组，C 去第三组。
Assign seats in alphabetical round-robin order: A to team 1, B to team 2 and C to team 3.

74.42–81.31：接着 D 回到第一组，E 去第二组。得到 A D、B E，以及单独的 C。
Then D returns to team 1 and E goes to team 2. The groups are A D, B E and C.

81.73–87.09：人数是二、二、一，符合容量。可合作关系保留得怎么样？
The sizes are 2, 2 and 1, so capacity is satisfied. But what happens to the connections?

## 87.39–106.48 秒：人数合理，代价却是十八
画面类型：roundcut。

87.69–93.68：现在逐条看，两条权重为五的边都跨区，其余四条边也都跨区。
Inspect each edge. Both edges of weight 5 cross, and so do the other four edges.

94.10–99.85：五加一加四加二加五加一，割代价是十八。没有任何边留在组内。
The cut is 5 + 1 + 4 + 2 + 5 + 1 = 18. No edge stays inside a group.

100.27–106.18：轮询分得快，但只看顺序。人数平衡，并不代表连接代价就小。
Round robin is quick but only follows the ordering. Balanced counts do not imply a small connection cost.

## 106.48–125.22 秒：多分几次，每次只分两边
画面类型：recurseidea。

106.81–111.49：另一条思路是递归二分：先分成两块，再选择一块继续分。
Another approach is recursive bisection: split into two parts, then split one part again.

111.92–118.20：用一棵树记录过程。树的叶子代表最终分区，达到三片叶子就停止。
Record the process as a tree. Its leaves are the final partitions. Stop at three leaves.

118.64–124.89：这里根据连接关系做一次二分，再拆人数较多的一块。最终还要检查容量。
Here we use connectivity to bisect a part, then split the larger part. Final capacities still need checking.

## 125.22–143.20 秒：第一刀：ABC 与 DE
画面类型：firstsplit。

125.52–130.42：第一步，把 A、B、C 放在一边，D、E 放在另一边。
First, put A, B and C on one side, and D and E on the other.

130.84–136.72：两边之间只有 C D 和 C E 跨区，权重二加一，当前代价是三。
Only C–D and C–E cross between the sides. Their weights sum to 2 + 1 = 3.

137.14–142.90：A B 和 D E 两条粗边都留下了。不过现在只有两组，工作还没完成。
Both heavy edges A–B and D–E stay internal. But we still have only two groups.

## 143.20–162.33 秒：第二刀：把 ABC 分成 AB 与 C
画面类型：secondsplit。

143.50–148.12：接下来拆三个人的 A B C，让 A B 留在一起，C 自成一组。
Next split the three-vertex part A B C. Keep A B together and give C its own group.

148.54–153.76：这次新增的跨区边是 A C 和 B C，权重一加四，等于五。
This split adds crossing edges A–C and B–C, with weights 1 + 4 = 5.

154.18–162.03：最终三组是 A B、C、D E，人数二、一、二，每组都没有超过两人。
The final groups are A B, C and D E. Their sizes are 2, 1 and 2, all within capacity.

## 162.33–179.72 秒：最终是三加五，等于八
画面类型：cumulative。

162.70–167.14：第二刀的五只是新增代价，第一刀切开的三仍然存在。
The second cut of 5 is an additional cost. The first cut of 3 still exists.

167.60–172.60：因此最终割代价是三加五，等于八，不能只报告最后一步的五。
The final cut cost is therefore 3 + 5 = 8. Reporting only the last split's 5 would be wrong.

173.06–179.35：从最终图重算，一加四加二加一也是八。四条跨区边，各算一次。
Recounting the final graph gives 1 + 4 + 2 + 1 = 8: four crossing edges, each counted once.

## 179.72–198.25 秒：同样人数，为什么差十分？
画面类型：compare。

180.02–185.31：把两种结果并排看，人数都由两个二和一个一组成，容量一样满足。
Compare the results side by side. Both have two groups of 2 and one group of 1, satisfying the same capacity.

185.73–192.05：差别在两条权重为五的边。递归结果保住 A B 和 D E，少了十分。
The difference is the two edges of weight 5. Keeping A–B and D–E internal saves 10.

192.47–197.95：十八减八等于十。我们优化的是连接结构，不能只盯着人数条形图。
Eighteen minus eight is ten. We optimize connection structure, so the size bars alone are not enough.

## 198.25–216.22 秒：直接多路划分，比轮询更广
画面类型：direct。

198.55–203.95：直接多路划分，是直接维护多个分区，而不是必须沿二叉树拆开。
Direct multiway partitioning maintains several partitions directly, without requiring a binary split tree.

204.38–210.23：轮询只是本课的简单起点。它不看边权，不能代表所有直接多路算法。
Round robin is only our simple starting point. It ignores edge weights and does not represent all direct multiway algorithms.

210.65–215.92：直接方法也能比较移动或交换的收益，在容量允许时继续改进。
Direct methods can compare gains from moves or swaps and refine the grouping within capacity limits.

## 216.22–235.11 秒：交换 D 和 B，也能改进
画面类型：refinement。

216.52–221.08：回到轮询结果，试着交换第一组的 D 和第二组的 B。
Return to the round-robin result. Try swapping D from team 1 with B from team 2.

221.50–228.23：得到 A B、D E、C，人数不变，代价也从十八降到八，收益是十。
We get A B, D E and C. Sizes stay unchanged, and the cost drops from 18 to 8, a gain of 10.

228.65–234.81：这是一个贪心成对交换示意。它帮助理解改进动作，不是完整的多路 F M。
This illustrates a greedy pair swap. It explains refinement moves, but is not a complete multiway FM algorithm.

## 235.11–253.09 秒：这张小图，八是最优吗？
画面类型：exact。

235.41–240.28：对这张五节点小图，我们可以枚举所有满足容量的分配，逐个计算。
For this five-vertex graph, we can enumerate every capacity-feasible assignment and evaluate each one.

240.70–246.37：三个分区保留编号，共有九十种合法分配，其中最小割代价是八。
With labeled partitions, there are 90 feasible assignments. Their minimum cut cost is 8.

246.79–252.78：这验证了本例的答案，但不说明递归二分或贪心交换，对所有图都最优。
This verifies the answer for this example. It does not prove that recursive bisection or greedy swaps are always optimal.

## 253.09–273.30 秒：每一刀都好，整体未必最好
画面类型：limits。

253.39–258.79：递归二分做了前面的决定，后面通常只在现有子块里继续切分。
After an early bisection decision, later splits usually operate within the existing child parts.

259.21–265.45：先前拆开的节点，可能很难重新团聚。局部好的第一刀，未必带来最好全局。
Vertices separated early may be hard to reunite. A good first split need not produce the best global result.

265.87–273.00：拆最大块也是基线策略。图更大或分区数改变时，要实际检查最终容量。
Splitting the largest part is also a baseline. For larger graphs or a different k, explicitly check final capacities.

## 273.30–292.05 秒：人数相同，面积未必相同
画面类型：area。

273.60–278.55：本例每个节点的重量都是一，所以节点数量就等于分区负载。
Every vertex has unit weight here, so a partition's vertex count equals its load.

278.97–285.17：换成电路单元，大单元可能占更多面积。两个节点，不一定比三个更轻。
Circuit cells may have different areas. A group of two cells is not necessarily lighter than a group of three.

285.59–291.75：节点重量用于容量，边权用于割代价；它们表达不同信息，需要分别计算。
Vertex weights determine capacity load; edge weights determine cut cost. They carry different information and need separate calculations.

## 292.05–309.90 秒：在实验台里亲手分一次
画面类型：manual。

292.49–298.60：打开实验台，给每个节点选择分区，先检查三组是否都有人、是否超容。
In the lab, choose a partition for each vertex. First check that all three groups are nonempty and within capacity.

299.09–304.41：再找出跨区边，把权重相加。你的计算应当和页面结果一致。
Then find the crossing edges and add their weights. Your calculation should match the page.

304.90–309.47：试着重现十八和八，再看递归树怎样一步步长出三个叶子。
Reproduce the costs 18 and 8, then watch how the recursive tree grows three leaves.

## 309.90–329.96 秒：改一个条件，重新计算
画面类型：exercise。

310.20–316.52：第一个挑战，把 A B 的边权从五改成一。先保留原分组，重算割代价。
First challenge: change A–B from weight 5 to 1. Keep each grouping fixed and recompute its cost.

316.94–323.38：然后重新运行算法，观察选择是否变化。边权改了，旧答案不能直接照搬。
Then rerun the algorithms and check whether their choices change. Do not assume the old answers still apply.

323.80–329.66：第二个挑战，改变分区数，同时调整容量，比较可行性和连接代价。
Second challenge: change k and adjust capacity accordingly. Compare feasibility and connection cost.

## 329.96–345.36 秒：把完整过程讲给同学听
画面类型：recap。

330.51–336.92：回顾这条线：先建图，再定容量，给出分组，然后计算跨区边权之和。
Review the chain: build a graph, set capacities, assign groups, then sum crossing-edge weights.

337.75–344.26：轮询得到十八，递归先切三、再加五，最终八；一次合适交换也能得到八。
Round robin gives 18. Recursive bisection cuts 3, then adds 5, reaching 8. A suitable swap also reaches 8.

## 345.36–360.00 秒：好的分组，要同时说清两件事
画面类型：finish。

345.91–351.68：解释一个方案，既要说连接代价是多少，也要说每组负载是否符合要求。
When explaining a solution, report both its connection cost and whether every partition meets its load limit.

352.47–358.95：完成练习，记录你改过的参数和结果。能解释变化的原因，就学会了这堂课。
Complete the exercises and record your changed parameters and results. Explain why they changed to demonstrate your understanding.
