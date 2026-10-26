import {metrics,cutsize} from './metrics.mjs';
export function refineBySwaps(g,initial,k,capacity,maxSteps=80){
 const assignment={...initial},history=[];if(!metrics(g,assignment,k,capacity).feasible)return {assignment,history,stopped:'infeasible'};
 for(let step=0;step<maxSteps;step++){
  const before=cutsize(g,assignment),candidates=[];
  for(let i=0;i<g.nodes.length;i++)for(let j=i+1;j<g.nodes.length;j++){
   const a=g.nodes[i],b=g.nodes[j];if(assignment[a]===assignment[b])continue;
   const trial={...assignment,[a]:assignment[b],[b]:assignment[a]};if(!metrics(g,trial,k,capacity).feasible)continue;
   candidates.push({a,b,gain:before-cutsize(g,trial),assignment:trial});
  }
  candidates.sort((x,y)=>y.gain-x.gain||x.a.localeCompare(y.a)||x.b.localeCompare(y.b));const best=candidates[0];
  if(!best||best.gain<=1e-9)return {assignment,history,stopped:'local'};
  Object.assign(assignment,best.assignment);history.push({kind:'swap',a:best.a,b:best.b,gain:best.gain,assignment:{...assignment},cut:cutsize(g,assignment)});
 }
 return {assignment,history,stopped:'limit'};
}
