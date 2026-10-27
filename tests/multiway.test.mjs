import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeGraph,validateK,validateAssignment} from '../core/graph.mjs';
import {metrics,partsString} from '../core/metrics.mjs';
import {roundRobinRun} from '../core/round-robin.mjs';
import {recursiveBisection} from '../core/recursive-bisection.mjs';
import {refineBySwaps} from '../core/refine.mjs';
import {exactTiny} from '../core/exact.mjs';
import {spectralBisection,laplacian} from '../core/spectral.mjs';
const g=normalizeGraph(JSON.parse(fs.readFileSync(new URL('../data/tiny_graph.json',import.meta.url))));
const direct=(g,a)=>g.edges.reduce((sum,e)=>sum+(a[e.u]!==a[e.v]?e.w:0),0);
const r=recursiveBisection(g,3),rr=roundRobinRun(g,3);
assert.equal(r.parts,'AB|C|DE');assert.equal(r.cut,8);assert.equal(rr.parts,'AD|BE|C');assert.equal(rr.cut,18);
assert.deepEqual(r.history.map(x=>x.cut),[0,3,8]);assert.deepEqual(r.history.slice(1).map(x=>x.addedCut),[3,5]);
// Explanations must expose actual solver data, not hand-authored candidate tables.
assert.deepEqual(r.history[1].order.map(v=>v[0]),['E','D','C','B','A']);
assert.deepEqual(r.history[1].spectral.candidates.map(c=>c.cut),[6,3,5,6]);
assert.deepEqual(r.history[2].order.map(v=>v[0]),['A','B','C']);
assert.deepEqual(r.history[2].spectral.candidates.map(c=>c.cut),[6,5]);
assert.deepEqual(laplacian(g.nodes,g.edges)[0],[6,-5,-1,0,0]);
const fallback=spectralBisection(['A','B'],[{u:'A',v:'B',w:2}],{A:99,B:1});
assert.ok(fallback.trace.fallback);assert.ok(fallback.trace.candidates.every(c=>!c.eligible));
assert.deepEqual(metrics(g,r.assignment,3,2).counts.slice().sort(),[1,2,2]);assert.ok(metrics(g,r.assignment,3,2).feasible);
let optimum=Infinity,feasible=0;
for(let mask=0;mask<3**5;mask++){let m=mask;const a={};for(const n of g.nodes){a[n]=m%3;m=Math.floor(m/3);}const counts=[0,0,0];Object.values(a).forEach(p=>counts[p]++);if(counts.every(c=>c>0&&c<=2)){feasible++;optimum=Math.min(optimum,direct(g,a));}}
const exact=exactTiny(g,3,2);assert.equal(feasible,90);assert.equal(exact.checked,feasible);assert.equal(exact.cut,optimum);assert.equal(optimum,8);
const ref=refineBySwaps(g,rr.assignment,3,2);assert.equal(direct(g,ref.assignment),8);
assert.equal(metrics(g,r.assignment,3,1).feasible,false);
for(const k of [0,1.5,6,NaN])assert.throws(()=>validateK(g,k));assert.throws(()=>validateAssignment(g,{A:0},3));
for(const bad of [
 {...g,nodes:['A','A']},{...g,edges:[{u:'A',v:'A',w:2}]},{...g,edges:[{u:'A',v:'X',w:1}]},
 {...g,edges:[{u:'A',v:'B',w:-1}]},{...g,edges:[{u:'A',v:'B',w:1},{u:'B',v:'A',w:2}]},{...g,sizes:{A:0}}
])assert.throws(()=>normalizeGraph(bad));
let seed=27102026;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);let checked=0;
for(let t=0;t<180;t++){
 const n=2+t%9,nodes=Array.from({length:n},(_,i)=>String.fromCharCode(65+i)),edges=[];
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(rnd()<.55)edges.push({u:nodes[i],v:nodes[j],w:Math.floor(rnd()*11)});
 const x=normalizeGraph({nodes,edges,node_sizes:Object.fromEntries(nodes.map(a=>[a,t%4===0?1+Math.floor(rnd()*4):1]))});
 const k=1+t%Math.min(n,5),cap=Math.ceil(Object.values(x.sizes).reduce((a,b)=>a+b)/k);
 for(const result of [recursiveBisection(x,k),roundRobinRun(x,k)]){
  assert.equal(new Set(Object.values(result.assignment)).size,k);assert.equal(Object.keys(result.assignment).length,n);
  assert.equal(result.cut,direct(x,result.assignment));const stat=metrics(x,result.assignment,k,cap);
  assert.equal(stat.sizes.reduce((a,b)=>a+b),Object.values(x.sizes).reduce((a,b)=>a+b));
  const relabel=Object.fromEntries(nodes.map(a=>[a,k-1-result.assignment[a]]));assert.equal(direct(x,relabel),result.cut);
  assert.equal(partsString(x,relabel,k),result.parts);
  for(const h of result.history.filter(x=>x.kind==='split')){
   assert.equal(h.cut,direct(x,h.assignment));const tr=h.spectral;
   for(let i=0;i<tr.nodes.length;i++){
    const name=tr.nodes[i],degree=tr.edges.filter(e=>e.u===name||e.v===name).reduce((s,e)=>s+e.w,0);
    assert.equal(tr.matrix[i][i],degree);assert.equal(tr.matrix[i].reduce((a,b)=>a+b),0);
    for(let j=0;j<tr.nodes.length;j++)assert.equal(tr.matrix[i][j],tr.matrix[j][i]);
   }
   for(const snap of tr.snapshots){
    assert.ok(Math.abs(snap.values.reduce((a,b)=>a+b))<1e-8);
    assert.ok(Math.abs(snap.values.reduce((a,b)=>a+b*b,0)-1)<1e-8);
    const v=Object.fromEntries(tr.nodes.map((name,i)=>[name,snap.values[i]]));
    const energy=tr.edges.reduce((s,e)=>s+e.w*(v[e.u]-v[e.v])**2,0);
    assert.ok(Math.abs(energy-snap.energy)<1e-8);
   }
   for(const c of tr.candidates){
    const left=new Set(c.left),expected=tr.edges.filter(e=>left.has(e.u)!==left.has(e.v));
    assert.equal(c.cut,expected.reduce((s,e)=>s+e.w,0));assert.deepEqual(c.edges,expected);
    assert.equal(c.eligible,c.fraction>=.2&&c.fraction<=.8);
   }
   const selected=tr.candidates.find(c=>c.chosen);assert.equal(selected.cut,h.addedCut);
   if(!tr.fallback)assert.equal(selected.cut,Math.min(...tr.candidates.filter(c=>c.eligible).map(c=>c.cut)));
  }
  if(stat.feasible){const f=refineBySwaps(x,result.assignment,k,cap);let prev=result.cut;for(const h of f.history){assert.ok(h.cut<prev-1e-9);assert.ok(metrics(x,h.assignment,k,cap).feasible);assert.ok(Math.abs(prev-h.cut-h.gain)<1e-7);prev=h.cut;}}
  checked++;
 }
}
// Weighted capacities and missing parts are explicit feasibility constraints.
assert.equal(metrics(g,{A:0,B:0,C:0,D:0,E:0},3,5).feasible,false);
assert.equal(exactTiny(g,3,.5).feasible,false);
const report={passed:true,randomMethodRuns:checked,feasibleTinyLabelings:feasible,optimum,recursiveCut:r.cut,roundRobinCut:rr.cut};
if(process.env.WRITE_REPORT)fs.writeFileSync(new URL('../data/verification.json',import.meta.url),JSON.stringify(report,null,2));console.log(report);
