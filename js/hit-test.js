// Hit testing for rendered wires. Kept separate from app.js so selectable
// geometry follows the same curved paths as the renderer.
function distPointToSegment(px,py,a,b){
  const dx=b.x-a.x, dy=b.y-a.y;
  const len2=dx*dx+dy*dy||1;
  const t=Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/len2));
  const x=a.x+t*dx, y=a.y+t*dy;
  return Math.hypot(px-x,py-y);
}

function wireSamplePoints(a,b){
  const pts=[];
  if((a.type==="tr_lv"&&b.type==="lv_grid")||(a.type==="lv_grid"&&b.type==="tr_lv")){
    const ps=lvDropPathPoints(a,b);
    for(let i=0;i<=10;i++) pts.push(bezPtWithCtrl(ps[0],ps[1],{cx:ps[0].x,cy:ps[1].y},i/10));
    for(let i=1;i<=10;i++) pts.push({x:ps[1].x+(ps[2].x-ps[1].x)*i/10,y:ps[1].y+(ps[2].y-ps[1].y)*i/10});
    for(let i=1;i<=10;i++) pts.push(bezPtWithCtrl(ps[2],ps[3],{cx:ps[2].x,cy:ps[3].y},i/10));
    return pts;
  }
  if(a.type==="tr_lv"&&b.type==="tr_lv"){
    const ps=trLvLinkPathPoints(a,b);
    if(ps){
      for(let i=0;i<=10;i++) pts.push(bezPtWithCtrl(ps[0],ps[1],{cx:ps[0].x,cy:ps[1].y},i/10));
      for(let i=1;i<=10;i++) pts.push({x:ps[1].x+(ps[2].x-ps[1].x)*i/10,y:ps[1].y+(ps[2].y-ps[1].y)*i/10});
      for(let i=1;i<=10;i++) pts.push(bezPtWithCtrl(ps[2],ps[3],{cx:ps[2].x,cy:ps[3].y},i/10));
      return pts;
    }
  }
  const {aa,bb}=wireEndpoints(a,b);
  const ctrl=routedCtrl(aa,bb,3);
  for(let i=0;i<=30;i++) pts.push(bezPtWithCtrl(aa,bb,ctrl,i/30));
  return pts;
}

function distToWire(a,b,mx,my){
  let d=Infinity;
  const pts=wireSamplePoints(a,b);
  for(let i=1;i<pts.length;i++) d=Math.min(d,distPointToSegment(mx,my,pts[i-1],pts[i]));
  return d;
}
