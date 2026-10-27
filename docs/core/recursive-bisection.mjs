import {validateK} from './graph.mjs';
import {cutsize,partsString} from './metrics.mjs';
import {spectralBisection} from './spectral.mjs';
// Teaching baseline: split the largest part by node count, as in the course.
// The local spectral 20–80% filter does not enforce final k-way capacities.
export function recursiveBisection(g,k){
 validateK(g,k);const assignment=Object.fromEntries(g.nodes.map(n=>[n,0]));
 const history=[{kind:'start',assignment:{...assignment},cut:0,parts:partsString(g,assignment,k)}];let label=1;
 while(label<k){
  const ps=Array.from({length:label},(_,p)=>({label:p,members:g.nodes.filter(n=>assignment[n]===p)}));
  ps.sort((a,b)=>b.members.length-a.members.length||a.label-b.label);const chosen=ps[0],members=[...chosen.members].sort(),set=new Set(members);
  if(members.length<2)break;
  const edges=g.edges.filter(e=>set.has(e.u)&&set.has(e.v));const r=spectralBisection(members,edges,g.sizes),before=cutsize(g,assignment);
  for(const n of members)if(r.assignment[n]==='1')assignment[n]=label;
  const after=cutsize(g,assignment);history.push({kind:'split',split:members,source:chosen.label,newLabel:label,assignment:{...assignment},cut:after,addedCut:after-before,parts:partsString(g,assignment,k),order:r.order,spectral:r.trace});label++;
 }
 return {assignment,history,cut:cutsize(g,assignment),parts:partsString(g,assignment,k)};
}
