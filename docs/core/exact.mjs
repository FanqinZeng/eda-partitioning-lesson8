import {validateK} from './graph.mjs';
import {cutsize} from './metrics.mjs';
export function exactTiny(g,k,capacity){
 validateK(g,k);if(k**g.nodes.length>500000) return {available:false,reason:'只枚举不超过 500000 个标签组合的小图。'};
 const assignment={},loads=Array(k).fill(0),counts=Array(k).fill(0);let checked=0,best=Infinity,winner=null;
 function visit(i){if(i===g.nodes.length){if(counts.some(x=>!x))return;checked++;const c=cutsize(g,assignment);if(c<best-1e-9){best=c;winner={...assignment};}return;}
  const n=g.nodes[i];for(let p=0;p<k;p++){if(loads[p]+g.sizes[n]>capacity+1e-9)continue;assignment[n]=p;loads[p]+=g.sizes[n];counts[p]++;visit(i+1);counts[p]--;loads[p]-=g.sizes[n];}}
 visit(0);return {available:true,feasible:!!winner,checked,cut:winner?best:null,assignment:winner};
}
