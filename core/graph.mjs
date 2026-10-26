export function normalizeGraph(raw) {
  if (!raw || !Array.isArray(raw.nodes) || raw.nodes.length<2 || raw.nodes.length>40) throw Error('需要 2–40 个节点。');
  const nodes=[...raw.nodes];
  if(new Set(nodes).size!==nodes.length || nodes.some(n=>typeof n!=='string'||!/^[A-Za-z][A-Za-z0-9_-]{0,11}$/.test(n))) throw Error('节点名须唯一，以字母开头，最多 12 个字母、数字、下划线或短横线。');
  nodes.sort();
  if(!Array.isArray(raw.edges))throw Error('edges 必须是边的数组。');
  const seen=new Set(),edges=raw.edges.map(e=>{
    const {u,v,w}=e??{},key=[u,v].sort().join('\0');
    if(!nodes.includes(u)||!nodes.includes(v)||u===v||!Number.isFinite(w)||w<0||w>1e6||seen.has(key))throw Error('边连接两个不同的已有节点，权重在 0–1000000 之间，同一无向边只写一次。');
    seen.add(key);return {u,v,w};
  });
  const sizes=Object.fromEntries(nodes.map(n=>[n,(raw.node_sizes??raw.sizes)?.[n]??1]));
  if(Object.values(sizes).some(s=>!Number.isFinite(s)||s<=0||s>1e6))throw Error('节点面积须为正数且不超过 1000000。');
  return {nodes,edges,sizes};
}
export function validateK(g,k){if(!Number.isInteger(k)||k<1||k>Math.min(8,g.nodes.length))throw Error('k 须为 1 到 min(8, 节点数) 的整数。');}
export function validateAssignment(g,a,k){validateK(g,k);if(!a||g.nodes.some(n=>!Number.isInteger(Number(a[n]))||a[n]==null||Number(a[n])<0||Number(a[n])>=k))throw Error('每个节点都需要 0 到 k−1 的分区编号。');}
export function rawGraph(g){return {nodes:g.nodes,edges:g.edges,node_sizes:g.sizes};}
