export const C={paper:'#f3f4ed',ink:'#153641',muted:'#637a80',teal:'#158c87',blue:'#365f95',orange:'#d77635',light:'#e1e9e4',gold:'#dba444'};
export const font='"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
export const clamp=x=>Math.max(0,Math.min(1,x));
export const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
export const mix=(a,b,t)=>a+(b-a)*t;
export function kit(ctx){
 const rect=(x,y,w,h,r,fill,stroke)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}};
 const text=(s,x,y,size=30,color=C.ink,weight=500,align='left')=>{ctx.font=`${weight} ${size}px ${font}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(String(s),x,y);};
 const circle=(x,y,r,fill,stroke,width=2)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.lineWidth=width;ctx.strokeStyle=stroke;ctx.stroke();}};
 const line=(x1,y1,x2,y2,col,width=2,dash=[])=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=col;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);};
 const fit=(s,x,y,max,size=30,col=C.ink,weight=500,align='center')=>{ctx.font=`${weight} ${size}px ${font}`;while(ctx.measureText(s).width>max&&size>17){size--;ctx.font=`${weight} ${size}px ${font}`;}text(s,x,y,size,col,weight,align);};
 const pill=(s,x,y,w,col=C.teal)=>{rect(x,y,w,44,18,col+'15');text(s,x+w/2,y+30,22,col,600,'center');};
 const lock=(x,y)=>{ctx.beginPath();ctx.arc(x,y-8,9,Math.PI,0);ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.stroke();rect(x-12,y-8,24,22,5,C.gold);circle(x,y+2,2,C.ink);};
 const arrow=(x1,y1,x2,y2,col=C.muted,width=3)=>{line(x1,y1,x2,y2,col,width);const a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-12*Math.cos(a-.45),y2-12*Math.sin(a-.45));ctx.lineTo(x2-12*Math.cos(a+.45),y2-12*Math.sin(a+.45));ctx.closePath();ctx.fillStyle=col;ctx.fill();};
 return{ctx,rect,text,circle,line,fit,pill,lock,arrow};
}
export const seedPos={A:[.13,.22],E:[.13,.83],B:[.78,.1],C:[.9,.49],D:[.78,.87]};
export const rawPos={A:[.12,.25],B:[.37,.08],C:[.6,.53],D:[.79,.88],E:[.99,.44]};
export function interpolatePos(a,b,p){return Object.fromEntries(Object.keys(a).map(n=>[n,[mix(a[n][0],b[n][0],p),mix(a[n][1],b[n][1],p)]]));}
export function swappedPos(a,u,v,p){const out=structuredClone(a);out[u]=[mix(a[u][0],a[v][0],p),mix(a[u][1],a[v][1],p)-.2*Math.sin(p*Math.PI)];out[v]=[mix(a[v][0],a[u][0],p),mix(a[v][1],a[u][1],p)+.2*Math.sin(p*Math.PI)];return out;}
export function drawGraph(k,graph,assignment,o={}){
 const {ctx,rect,text,circle,line,fit,lock}=k;
 const area=o.area||{x:300,y:355,w:1390,h:375};
 const pos=o.positions||seedPos;const pp=Object.fromEntries(graph.nodes.map(n=>[n,[area.x+pos[n][0]*area.w,area.y+pos[n][1]*area.h]]));
 const group=!!o.groups,focus=o.focus,person=o.people;
 if(group){rect(area.x-30,area.y-45,area.w*.34,area.h+90,24,'#e9f4ed');rect(area.x+area.w*.64,area.y-45,area.w*.4,area.h+90,24,'#edf1f8');
  text(o.people?'二人组':'分区 0',area.x,area.y-10,22,C.teal,600);text(o.people?'三人组':'分区 1',area.x+area.w*.68,area.y-10,22,C.blue,600);}
 const show=o.edgeReveal??1,r=o.nodeRadius||37;
 for(const [idx,[a,b,w]] of graph.edges.entries()){
  const pa=pp[a],pb=pp[b],isCut=String(assignment[a])!==String(assignment[b]),related=!focus||[a,b].includes(focus);
  let col=group?(isCut?C.orange:'#9cb4b7'):'#9cb4b7';if(focus&&related)col=isCut?C.orange:C.blue;
  if(o.highlight?.some(([u,v])=>(u===a&&v===b)||(u===b&&v===a)))col=C.gold;
  ctx.save();ctx.globalAlpha=show*(related?1:.17);ctx.lineCap='round';
  if(group&&isCut)line(...pa,...pb,'#fff0de',w*1.1+8);
  line(...pa,...pb,col,2+w*.9);
  let mx=(pa[0]+pb[0])/2,my=(pa[1]+pb[1])/2;
  if(Math.abs(pa[0]-pb[0])<100)mx+=28;else my+=(idx%2?-16:17);
  rect(mx-25,my-24,50,40,11,'#ffffff',col+'55');text(w,mx,my+5,25,col,700,'center');ctx.restore();
 }
 const names={A:'小安',B:'小白',C:'小陈',D:'小杜',E:'小易'};
 for(const n of graph.nodes){const [x,y]=pp[n],col=group?(assignment[n]===0?C.teal:C.blue):C.ink;
  if(o.selected?.includes(n))circle(x,y,r+11,null,C.gold,3);
  if(person){circle(x,y-8,r*.68,'#edc9ad');ctx.beginPath();ctx.arc(x,y-12,r*.7,Math.PI,Math.PI*2);ctx.fillStyle='#59463b';ctx.fill();rect(x-r*.68,y+r*.35,r*1.36,r*.62,14,col);text(names[n],x,y+r+27,22,C.ink,600,'center');}
  else{ctx.save();ctx.shadowColor='#123d4822';ctx.shadowBlur=12;ctx.shadowOffsetY=5;circle(x,y,r,col);ctx.restore();text(n,x,y+13,r, '#fff',600,'center');}
  if(o.locked?.includes(n))lock(x+r*.82,y-r*.85);
 }
 return pp;
}
export function table(k,columns,rows,{x=340,y=320,w=1390,rowH=77,highlights=[],fontSize=30}={}){
 const {rect,text,line,fit}=k,cw=w/columns.length;
 rect(x,y,w,rowH,17,'#e6eee9');columns.forEach((h,i)=>text(h,x+cw*(i+.5),y+rowH*.65,25,C.muted,600,'center'));
 rows.forEach((row,j)=>{const yy=y+(j+1)*rowH;if(highlights.includes(j))rect(x,yy,w,rowH-2,10,'#dff0e8');row.forEach((v,i)=>fit(String(v),x+cw*(i+.5),yy+rowH*.65,cw-24,fontSize,Number(v)<0?C.orange:C.ink,i===0?600:500));line(x,yy+rowH-1,x+w,yy+rowH-1,'#e6ece7',1);});
}
export function cumulative(k,values,{x=430,y=320,w=1210,h=360,labels=[],best=0}={}){
 const {ctx,line,circle,text,rect}=k,min=Math.min(-2,...values)-1,max=Math.max(2,...values)+2;
 const px=i=>x+i*w/(values.length-1),py=v=>y+h-(v-min)/(max-min)*h;
 line(x,py(0),x+w,py(0),'#b4c4bf',2,[6,7]);text('0',x-25,py(0)+7,22,C.muted,500,'right');
 for(let i=0;i<values.length;i++){
  if(i)line(px(i-1),py(values[i-1]),px(i),py(values[i]),i<=best?C.teal:C.orange,6);
  circle(px(i),py(values[i]),11,i===best?C.teal:C.orange);
  text(values[i],px(i),py(values[i])-22,35,i===best?C.teal:C.orange,700,'center');
  text(labels[i]||`前 ${i} 步`,px(i),y+h+45,25,C.muted,500,'center');
 }
 text('累计收益',x,y-30,26,C.ink,600);return{px,py};
}
