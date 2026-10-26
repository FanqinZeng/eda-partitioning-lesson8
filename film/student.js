// ImageGen character asset, composited directly from a transparent sprite sheet.
// Frames are aligned by their body centre. No reference art is altered by code.
export async function createIllustratedStudent(){
  const image=new Image();image.src='./assets/student-sprites-v3.png';
  await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;});
  const canvas=document.createElement('canvas');canvas.width=534;canvas.height=887;
  const ctx=canvas.getContext('2d');const centres=[351.5,907.5,1505.5];
  function draw(t,amp=0){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const blink=(t%4.1)>3.65&&(t%4.1)<3.80;
    const speaking=amp>.16&&Math.sin(t*15.3)>-.25;
    const frame=blink?2:speaking?1:0;
    ctx.save();
    ctx.translate(267,800);ctx.rotate(.004*Math.sin(t*.9));ctx.translate(-267,-800);
    ctx.drawImage(image,centres[frame]-267,0,534,887,0,0,534,887);
    ctx.restore();return canvas;
  }
  return{draw};
}
