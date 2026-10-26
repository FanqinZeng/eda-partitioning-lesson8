import {validateAssignment} from './graph.mjs';
export function cutEdges(g,a){return g.edges.filter(e=>String(a[e.u])!==String(a[e.v]));}
export function cutsize(g,a){return cutEdges(g,a).reduce((s,e)=>s+e.w,0);}
export function groups(g,a,k){return Array.from({length:k},(_,p)=>g.nodes.filter(n=>Number(a[n])===p));}
export function partsString(g,a,k){return groups(g,a,k).filter(x=>x.length).map(x=>x.join(g.nodes.every(n=>n.length===1)?'':',')).sort().join('|');}
export function metrics(g,a,k,capacity=null){
 validateAssignment(g,a,k);const parts=groups(g,a,k),counts=parts.map(p=>p.length),sizes=parts.map(p=>p.reduce((s,n)=>s+g.sizes[n],0));
 const total=sizes.reduce((a,b)=>a+b,0),cap=capacity??Math.ceil(total/k),nonempty=counts.every(x=>x>0);
 if(!Number.isFinite(cap)||cap<=0)throw Error('容量须为正数。');
 return {parts,counts,sizes,cut:cutsize(g,a),capacity:cap,nonempty,feasible:nonempty&&sizes.every(s=>s<=cap+1e-9),imbalance:Math.max(...sizes)/(total/k)-1};
}
