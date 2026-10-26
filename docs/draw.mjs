export const palette=['#158c87','#365f95','#82629e','#ad7450','#4e8a59','#a25775','#6e7b3c','#647da3'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function layout(g,a,k,w=640,h=390){
 const chunks=Array.from({length:k},(_,p)=>({label:p,members:g.nodes.filter(n=>Number(a[n])===p)}));
 chunks.sort((x,y)=>(x.members[0]??'~').localeCompare(y.members[0]??'~'));
 const cols=Math.min(k,4),rows=Math.ceil(k/cols),cw=(w-30)/cols,ch=(h-40)/rows,positions={},boxes=[];
 chunks.forEach((part,j)=>{const col=j%cols,row=Math.floor(j/cols),x=15+col*cw+5,y=35+row*ch,bw=cw-12,bh=ch-12;boxes.push({x,y,w:bw,h:bh,label:part.label,members:part.members});
  const nc=part.members.length>=3?2:1,nr=Math.ceil(part.members.length/nc),dy=Math.min(170,(bh-100)/Math.max(1,nr-1));part.members.forEach((n,i)=>{const lastSingle=nc===2&&part.members.length%2===1&&i===part.members.length-1;positions[n]=[x+bw*(.5+(nc===2&&!lastSingle?(i%2? .22:-.22):0)),y+65+(i/nc|0)*dy+(bh-95-(nr-1)*dy)/2];});});
 return {positions,boxes};
}
export function graphSvg(g,a,k,{title='当前图划分',highlight=[],w=640,h=390}={}){
 const {positions,boxes}=layout(g,a,k,w,h),radius=g.nodes.length>20?13:21;
 let s=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">`;
 for(const b of boxes)s+=`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="18" fill="${palette[b.label]}12"/><text x="${b.x+14}" y="${b.y+26}" fill="${palette[b.label]}" font-size="14" font-weight="600">分区 ${b.label}${b.members.length?'':' · 空'}</text>`;
 for(const [idx,e] of g.edges.entries()){const p=positions[e.u],q=positions[e.v];if(!p||!q)continue;const cut=Number(a[e.u])!==Number(a[e.v]),col=cut?'#d77635':'#9cb4b7',focus=highlight.includes(idx);const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;const dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy)||1,off=idx%2?12:-12,lx=mx-dy/len*off,ly=my+dx/len*off;
  s+=`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${col}" stroke-width="${focus?6:Math.min(5,1.3+e.w*.45)}" opacity="${focus?1:.72}"/>`;
  if(g.nodes.length<=12)s+=`<rect x="${lx-12}" y="${ly-11}" width="24" height="22" rx="6" fill="#fff"/><text x="${lx}" y="${ly+5}" font-size="14" text-anchor="middle" fill="${col}" font-weight="600">${esc(e.w)}</text>`;
 }
 for(const n of g.nodes){const p=positions[n];if(!p)continue;s+=`<circle cx="${p[0]}" cy="${p[1]}" r="${radius}" fill="${palette[Number(a[n])]}"/><text x="${p[0]}" y="${p[1]+5}" text-anchor="middle" font-size="${n.length>3?10:16}" font-weight="600" fill="white">${esc(n)}</text>`;}
 return s+'</svg>';
}
