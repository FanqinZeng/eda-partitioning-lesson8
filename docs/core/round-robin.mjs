import {validateK} from './graph.mjs';
import {cutsize,partsString} from './metrics.mjs';
export function roundRobin(g,k){validateK(g,k);const assignment={},history=[];for(const [i,n] of [...g.nodes].sort().entries()){assignment[n]=i%k;history.push({kind:'assign',node:n,part:i%k,assignment:{...assignment}});}return {assignment,history};}
export function roundRobinRun(g,k){const r=roundRobin(g,k);return {...r,cut:cutsize(g,r.assignment),parts:partsString(g,r.assignment,k)};}
