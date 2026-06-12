// ═══════════════════ 全域狀態 ═══════════════════
let canvas,ctx,RES,DH;
let nodes=[],conns=[],presets=[];
let selN=null,selC=null;
let CG=22,CQ=1,showP=false;
let showMaterials=false;
let errN=new Set(),errC=new Set();
let hintConns=[];   // 審查後：應接但未接的連線提示（白色虛線）

function clearReviewState(){
  errN=new Set();
  errC=new Set();
  hintConns=[];
  if(RES) RES.style.display="none";
}

// ═══════════════════ 繪圖 ═══════════════════
function drawPoleModule(){
  const p=LAYOUT.pole;
  ctx.lineWidth=18; ctx.strokeStyle="#1e2230"; ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(p.x,p.y1); ctx.lineTo(p.x,p.y2); ctx.stroke();
  ctx.lineWidth=10; ctx.strokeStyle="#262c3a";
  ctx.beginPath(); ctx.moveTo(p.x,p.y1); ctx.lineTo(p.x,p.y2); ctx.stroke();
  ctx.lineWidth=9; ctx.strokeStyle="#2a3040";
  ctx.beginPath(); ctx.moveTo(p.crossX1,p.crossY); ctx.lineTo(p.crossX2,p.crossY); ctx.stroke();
  ctx.lineWidth=5; ctx.strokeStyle="#363d50";
  ctx.beginPath(); ctx.moveTo(p.crossX1,p.crossY); ctx.lineTo(p.crossX2,p.crossY); ctx.stroke();
}

function drawHighVoltageModule(){
  const h=LAYOUT.hv;
  for(let i=0;i<3;i++){
    ctx.beginPath(); ctx.moveTo(h.x1,h.ys[i]); ctx.lineTo(h.x2,h.ys[i]);
    ctx.strokeStyle=h.colors[i]; ctx.lineWidth=3.5; ctx.setLineDash([]); ctx.stroke();
    ctx.fillStyle=h.colors[i]; ctx.font="bold 14px 'Microsoft JhengHei',Arial";
    ctx.fillText(h.labels[i],h.labelX,h.ys[i]+5);
  }
}

function drawDeviceModule(isSG){
  deviceGroups(isSG).forEach(g=>{
    ctx.setLineDash([3,3]); ctx.strokeStyle=g.color+"66"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(g.hvx,g.hvy+7); ctx.lineTo(g.hvx,LAYOUT.device.laY1); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle=g.color+"aa"; ctx.lineWidth=1;
    ctx.strokeRect(g.lax-13,LAYOUT.device.laY1,28,LAYOUT.device.laY2-LAYOUT.device.laY1);
    ctx.fillStyle=g.color+"22"; ctx.fillRect(g.lax-13,LAYOUT.device.laY1,28,LAYOUT.device.laY2-LAYOUT.device.laY1);
    ctx.fillStyle=g.color; ctx.font="bold 9px Arial"; ctx.textAlign="left";
    ctx.fillText("LA",g.lax-11,LAYOUT.device.laY1-5);
    ctx.fillStyle="#ffffff88"; ctx.font="bold 11px Arial"; ctx.textAlign="center";
    ctx.fillText(g.ph,g.lax,LAYOUT.device.laNodeY[0]+4);

    ctx.strokeStyle=g.color+"aa"; ctx.lineWidth=1;
    ctx.strokeRect(g.cox-13,LAYOUT.device.coY1,28,LAYOUT.device.coY2-LAYOUT.device.coY1);
    ctx.fillStyle=g.color+"22"; ctx.fillRect(g.cox-13,LAYOUT.device.coY1,28,LAYOUT.device.coY2-LAYOUT.device.coY1);
    ctx.fillStyle=g.color; ctx.font="bold 9px Arial"; ctx.textAlign="left";
    ctx.fillText("CO",g.cox-11,LAYOUT.device.coY1-5);
    ctx.fillStyle="#ffffff88"; ctx.font="bold 11px Arial"; ctx.textAlign="center";
    ctx.fillText(g.ph,g.cox,LAYOUT.device.coNodeY[0]+4);
    ctx.textAlign="left"; ctx.setLineDash([]);
  });
}

function drawLowVoltageModule(sp){
  LAYOUT.lv.ys.forEach((y,i)=>{
    ctx.beginPath(); ctx.moveTo(LAYOUT.lv.x1,y); ctx.lineTo(LAYOUT.lv.x2,y);
    ctx.strokeStyle=LAYOUT.lv.colors[i]; ctx.lineWidth=7; ctx.setLineDash([]); ctx.stroke();
    if(sp.leftLabels&&sp.leftLabels[i]){
      ctx.fillStyle=LAYOUT.lv.labelColors[i]; ctx.font="bold 13px 'Microsoft JhengHei',Arial";
      ctx.textAlign="left"; ctx.fillText(sp.leftLabels[i],18,y+5);
    }
    if(sp.rows[i]){
      ctx.fillStyle=LAYOUT.lv.labelColors[i]; ctx.font="bold 11px 'Microsoft JhengHei',Arial";
      ctx.fillText(sp.rows[i],888,y+4);
    }
  });
  if(showMaterials&&sp.materials){
    ctx.font="bold 12px 'Microsoft JhengHei',Arial";
    ctx.textAlign="left";
    const x=95, y0=726;
    sp.materials.forEach((txt,i)=>{
      ctx.fillStyle=i===3?"#d7d25b":"#f0f0f0";
      ctx.fillText(txt,x,y0+i*18);
    });
  }
}

function drawTransformerModule(sp){
  transformerBoxes(sp).forEach(box=>{
    const x=box.cx-LAYOUT.tr.width/2, y=LAYOUT.tr.top, w=LAYOUT.tr.width, h=LAYOUT.tr.height, c=LAYOUT.tr.corner;
    ctx.strokeStyle="#6f7f99"; ctx.lineWidth=2; ctx.setLineDash([]);
    [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(([cx,cy,sx,sy])=>{
      ctx.beginPath();
      ctx.moveTo(cx,cy+sy*c); ctx.lineTo(cx,cy); ctx.lineTo(cx+sx*c,cy);
      ctx.stroke();
    });
    ctx.fillStyle="#6f7f9922";
    ctx.fillRect(x+4,y+4,w-8,h-8);
  });
}

function draw(){
  if(!ctx) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const sp=SP[CQ];
  const isSG=sp.sg;

  drawPoleModule();
  drawHighVoltageModule();
  drawDeviceModule(isSG);
  drawTransformerModule(sp);
  drawLowVoltageModule(sp);

  // ── 桿身管口入地符號（更新 y）
  LAYOUT.ground.forEach(([x,y])=>gndSym(x,y));

  // ── 既設線
  presets.forEach(c=>{
    if(!c.n1||!c.n2) return;
    if(c.copper){
      drawCopperJumper(c.n1,c.n2);
    }
    ctx.setLineDash([]);
  });

  // ── 考生連線（加端點小圓圈，方便辨識接在哪個點）
  conns.forEach(c=>{
    if(!c.n1||!c.n2) return;
    const isSel=(c===selC);
    const isErr=errC.has(c);
    const col=isErr?"#e74c3c":wCol(c.n1,c.n2);
    const lw=(c.g===14?2:3.5)+(isErr?1.8:0);
    drawWire(c.n1,c.n2,isSel?"#cc55ff":col,lw,[]);
    // 端點小圓圈（白色，讓考生清楚看到線接在哪個節點）
    [c.n1,c.n2].forEach(nd=>{
      ctx.beginPath(); ctx.arc(nd.x,nd.y,4,0,2*Math.PI);
      ctx.fillStyle=isSel?"#cc55ff":col; ctx.fill();
      ctx.strokeStyle="#0d0d0d"; ctx.lineWidth=1; ctx.stroke();
    });
    if(isSel){
      const m=bzMid(c.n1,c.n2);
      ctx.beginPath(); ctx.arc(m.x,m.y,13,0,2*Math.PI);
      ctx.fillStyle="#7d3c98"; ctx.fill();
      ctx.strokeStyle="#fff"; ctx.lineWidth=2.5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(m.x-5,m.y-5); ctx.lineTo(m.x+5,m.y+5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(m.x+5,m.y-5); ctx.lineTo(m.x-5,m.y+5); ctx.stroke();
    }
  });

  // ── 審查提示線（白色虛線 + ? 標示，應接但未接的位置）
  hintConns.forEach(h=>{
    if(!h.n1||!h.n2) return;
    drawWire(h.n1,h.n2,"#ffffff",1.5,[8,5]);
    const m=bzMid(h.n1,h.n2);
    ctx.beginPath(); ctx.arc(m.x,m.y,9,0,2*Math.PI);
    ctx.strokeStyle="#ffffff"; ctx.lineWidth=1.5; ctx.setLineDash([]);
    ctx.fillStyle="#333"; ctx.fill(); ctx.stroke();
    ctx.fillStyle="#fff"; ctx.font="bold 11px Arial";
    ctx.textAlign="center"; ctx.fillText("?",m.x,m.y+4); ctx.textAlign="left";
  });

  // ── 缺失節點：亮黃色虛線圓框（與考生連線顏色完全不同）
  errN.forEach(id=>{
    const nd=nodes.find(n=>n.id===id); if(!nd) return;
    ctx.beginPath(); ctx.arc(nd.x,nd.y,nd.r+7,0,2*Math.PI);
    ctx.strokeStyle="#f1c40f"; ctx.lineWidth=2.5;
    ctx.setLineDash([5,3]); ctx.stroke();
    ctx.setLineDash([]);
  });

  // ── 節點
  const usedLv=new Set();
  [...conns,...presets,...hintConns].forEach(c=>{
    [c&&c.n1,c&&c.n2].forEach(n=>{if(n&&n.type==="lv_grid") usedLv.add(n.id);});
  });
  nodes.forEach(nd=>{
    if(!nd) return;
    const isSel=selN&&selN.id===nd.id;
    const isErr=errN.has(nd.id);
    ctx.fillStyle=isSel?"#e74c3c":isErr?"#c0392b":nCol(nd);
    ctx.strokeStyle="#0d0d0d"; ctx.lineWidth=1.5; ctx.setLineDash([]);
    if(nd.type==="lv_grid"&&usedLv.has(nd.id)){
      ctx.fillRect(nd.x-8,nd.y-5,16,10);
      ctx.strokeRect(nd.x-8,nd.y-5,16,10);
    } else {
      ctx.beginPath(); ctx.arc(nd.x,nd.y,nd.r,0,2*Math.PI);
      ctx.fill(); ctx.stroke();
    }
    drawLabel(nd);
  });
}

function gndSym(x,y){
  ctx.setLineDash([3,3]); ctx.strokeStyle="#2ecc7155"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+12); ctx.stroke();
  ctx.setLineDash([]);
  [[22,0],[16,5],[10,10]].forEach(([w,dy])=>{
    ctx.beginPath(); ctx.moveTo(x-w/2,y+12+dy); ctx.lineTo(x+w/2,y+12+dy);
    ctx.strokeStyle="#2ecc7166"; ctx.lineWidth=1.5; ctx.stroke();
  });
}

function drawLabel(nd){
  ctx.setLineDash([]);
  const t=nd.type;
  if(t==="lv_grid"){
    ctx.fillStyle="#888"; ctx.font="9px Arial";
    ctx.textAlign="center"; ctx.fillText(`(${nd.id})`,nd.x,nd.y-11); ctx.textAlign="left";
    return;
  }
  if(t==="tr_lv"){
    ctx.fillStyle="#ffcc88"; ctx.font="bold 10px 'Microsoft JhengHei',Arial";
    ctx.textAlign="center"; ctx.fillText(nd.lbl,nd.x,nd.y-12); ctx.textAlign="left";
    return;
  }
  ctx.font="10px 'Microsoft JhengHei',Arial";
  if(t==="gnd_pipe"||t==="gnd_box"||t==="gnd_sys"){
    ctx.fillStyle="#3dc97a"; ctx.fillText(nd.lbl,nd.x+12,nd.y+4); return;
  }
  if(t==="hv_line"){
    ctx.fillStyle="#aabbcc"; ctx.textAlign="center"; ctx.fillText(nd.lbl,nd.x,nd.y-11); ctx.textAlign="left"; return;
  }
  if(t==="la_hv"||t==="la_gnd"){
    // 只顯示「高」或「地」，避免與 CO 的標籤重疊
    ctx.fillStyle=t==="la_gnd"?"#2ecc71":"#f0c040";
    ctx.font="bold 9px Arial"; ctx.textAlign="center";
    ctx.fillText(t==="la_hv"?"高":"地", nd.x, nd.y+(t==="la_hv"?-11:13));
    ctx.textAlign="left"; return;
  }
  if(t==="co_top"||t==="co_bot"){
    // 只顯示「源」或「載」，避免與 LA 的標籤重疊
    ctx.fillStyle="#c49a20"; ctx.font="bold 9px Arial"; ctx.textAlign="center";
    ctx.fillText(t==="co_top"?"源":"載", nd.x, nd.y+(t==="co_top"?-11:13));
    ctx.textAlign="left"; return;
  }
  if(t==="tr_hv"){
    ctx.fillStyle="#e8c060"; ctx.font="bold 10px 'Microsoft JhengHei',Arial";
    ctx.textAlign="center"; ctx.fillText(nd.lbl,nd.x,nd.y-12); ctx.textAlign="left"; return;
  }
  if(t==="tr_g"){
    ctx.fillStyle="#2ecc71"; ctx.font="bold 10px 'Microsoft JhengHei',Arial";
    ctx.textAlign="center"; ctx.fillText(nd.lbl,nd.x,nd.y+18); ctx.textAlign="left"; return;
  }
  ctx.fillStyle="#c8ced8"; ctx.fillText(nd.lbl,nd.x+9,nd.y+4);
}

function bzCtrl(a,b){
  const dx=b.x-a.x, dy=b.y-a.y;
  const dist=Math.hypot(dx,dy);
  const types=[a.type,b.type];
  const has=t=>types.includes(t);
  const midX=(a.x+b.x)/2, midY=(a.y+b.y)/2;
  if(has("hv_line")&&has("co_top")){
    return{
      cx:midX + Math.sign(dx||1)*42,
      cy:midY - 28
    };
  }
  if(has("la_gnd")&&has("gnd_pipe")){
    return{
      cx:midX + Math.sign(dx||1)*34,
      cy:Math.max(a.y,b.y)+36
    };
  }
  if(types.every(t=>t==="la_gnd")){
    return{
      cx:midX + Math.sign(dx||1)*28,
      cy:Math.max(a.y,b.y)+44
    };
  }
  if(types.every(t=>t==="tr_lv")){
    return{
      cx:midX,
      cy:Math.abs(dx)>500 ? Math.min(a.y,b.y)-105 : Math.min(a.y,b.y)-120
    };
  }
  if(has("tr_lv")&&has("lv_grid")){
    return{
      cx:midX + Math.sign(dx||1)*58,
      cy:midY - 52
    };
  }
  // 固定往「上方+側邊」彎弧，不論起終點誰左誰右
  // 距離越遠弧度越大，避免長線太平
  const curve=Math.min(dist*0.25, 80);
  // 水平線（X端子到低壓幹線）：往外大弧繞，避免貼幹線
  const isVertical=(Math.abs(dy)>Math.abs(dx)*0.5);
  const offset=isVertical?curve*1.4:curve;
  return{
    cx:(a.x+b.x)/2 - offset * Math.sign(dy||1) * 0.3,
    cy:(a.y+b.y)/2 - offset
  };
}
function bezPtWithCtrl(a,b,m,t){
  return{x:(1-t)**2*a.x+2*(1-t)*t*m.cx+t**2*b.x,
         y:(1-t)**2*a.y+2*(1-t)*t*m.cy+t**2*b.y};
}
function wireClearance(a,b,m,lw){
  let min=Infinity;
  for(let t=.08;t<=.92;t+=.04){
    const p=bezPtWithCtrl(a,b,m,t);
    for(const nd of nodes){
      if(!nd||nd.id===a.id||nd.id===b.id) continue;
      const need=(nd.r||7)+lw/2+8;
      min=Math.min(min,Math.hypot(p.x-nd.x,p.y-nd.y)-need);
    }
  }
  return min;
}
function routedCtrl(a,b,lw){
  const base=bzCtrl(a,b);
  const dx=b.x-a.x, dy=b.y-a.y;
  const horizontal=Math.abs(dx)>Math.abs(dy);
  const candidates=[base];
  [30,55,80,110,145,185,230].forEach(s=>{
    if(horizontal){
      candidates.push({cx:base.cx,cy:base.cy-s},{cx:base.cx,cy:base.cy+s});
      candidates.push({cx:base.cx-s,cy:base.cy-s*.45},{cx:base.cx+s,cy:base.cy-s*.45});
      candidates.push({cx:base.cx-s,cy:base.cy+s*.45},{cx:base.cx+s,cy:base.cy+s*.45});
    }else{
      candidates.push({cx:base.cx-s,cy:base.cy},{cx:base.cx+s,cy:base.cy});
      candidates.push({cx:base.cx-s*.45,cy:base.cy-s},{cx:base.cx+s*.45,cy:base.cy-s});
      candidates.push({cx:base.cx-s*.45,cy:base.cy+s},{cx:base.cx+s*.45,cy:base.cy+s});
    }
  });
  let best=base, bestScore=-Infinity;
  for(const c of candidates){
    const score=wireClearance(a,b,c,lw);
    if(score>bestScore){best=c;bestScore=score;}
    if(score>=0) return c;
  }
  return best;
}
function pathClearance(a,b,lw=3.5){
  const {aa,bb}=wireEndpoints(a,b);
  const ctrl=routedCtrl(aa,bb,lw);
  let min=Infinity;
  for(let i=2;i<29;i++){
    const p=bezPtWithCtrl(aa,bb,ctrl,i/30);
    for(const nd of nodes){
      if(!nd||nd.id===a.id||nd.id===b.id) continue;
      const need=(nd.r||7)+lw/2+6;
      min=Math.min(min,Math.hypot(p.x-nd.x,p.y-nd.y)-need);
    }
  }
  return min;
}
function wireEndpoints(a,b){
  const dx=b.x-a.x, dy=b.y-a.y;
  const d=Math.hypot(dx,dy)||1;
  const offA=(a.r||7)+3, offB=(b.r||7)+3;
  const aa={...a, x:a.x+dx/d*offA, y:a.y+dy/d*offA};
  const bb={...b, x:b.x-dx/d*offB, y:b.y-dy/d*offB};
  return {aa,bb};
}
function bzMid(a,b){
  const{cx,cy}=routedCtrl(a,b,3);
  return{x:.25*a.x+.5*cx+.25*b.x,y:.25*a.y+.5*cy+.25*b.y};
}
function bezPt(a,b,t){
  return bezPtWithCtrl(a,b,routedCtrl(a,b,3),t);
}
function drawWire(a,b,col,lw,dash){
  if((a.type==="tr_lv"&&b.type==="lv_grid")||(a.type==="lv_grid"&&b.type==="tr_lv")){
    drawLvDropWire(a,b,col,lw,dash);
    return;
  }
  if(a.type==="tr_lv"&&b.type==="tr_lv"){
    const path=trLvLinkPathPoints(a,b);
    if(path){
      drawTrLvLinkWire(path,col,lw,dash);
      return;
    }
  }
  // 線段避開接點圓圈：不要從圓心畫到圓心，避免線蓋住端子點。
  const {aa,bb}=wireEndpoints(a,b);
  const{cx,cy}=routedCtrl(aa,bb,lw);
  ctx.beginPath(); ctx.moveTo(aa.x,aa.y);
  ctx.quadraticCurveTo(cx,cy,bb.x,bb.y);
  ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.setLineDash(dash); ctx.stroke();
  ctx.setLineDash([]);
}
function lvDropPathPoints(a,b){
  const tr=a.type==="tr_lv"?a:b;
  const lv=a.type==="lv_grid"?a:b;
  const dx=lv.x-tr.x;
  if(Math.abs(dx)<=48){
    const rowIndex=["row1","row2","row3","row4"].indexOf(lv.row);
    const x=rowIndex>0
      ? tr.x + (tr.x>720 ? -55 : tr.x<230 ? 36 : -36)
      : tr.x;
    return [
      tr,
      {x,y:tr.y+88},
      {x,y:lv.y-28},
      lv
    ];
  }
  const sideX=Math.abs(dx)<80
    ? lv.x + (lv.x<845?45:-45)
    : lv.x - Math.sign(dx)*45;
  return [
    tr,
    {x:sideX,y:tr.y+86},
    {x:sideX,y:lv.y-28},
    lv
  ];
}
function drawLvDropWire(a,b,col,lw,dash){
  const pts=lvDropPathPoints(a,b);
  ctx.beginPath();
  ctx.moveTo(pts[0].x,pts[0].y);
  ctx.quadraticCurveTo(pts[0].x,pts[1].y,pts[1].x,pts[1].y);
  ctx.lineTo(pts[2].x,pts[2].y);
  ctx.quadraticCurveTo(pts[2].x,pts[3].y,pts[3].x,pts[3].y);
  ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.setLineDash(dash); ctx.stroke();
  ctx.setLineDash([]);
}
function trLvLinkPathPoints(a,b){
  if(Math.abs(a.y-b.y)>8||Math.abs(a.x-b.x)<180) return null;
  const {aa,bb}=wireEndpoints(a,b);
  const y=Math.max(a.y,b.y)+22;
  return [aa,{x:aa.x,y},{x:bb.x,y},bb];
}
function drawTrLvLinkWire(pts,col,lw,dash){
  ctx.beginPath();
  ctx.moveTo(pts[0].x,pts[0].y);
  ctx.quadraticCurveTo(pts[0].x,pts[1].y,pts[1].x,pts[1].y);
  ctx.lineTo(pts[2].x,pts[2].y);
  ctx.quadraticCurveTo(pts[2].x,pts[3].y,pts[3].x,pts[3].y);
  ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.setLineDash(dash); ctx.stroke();
  ctx.setLineDash([]);
}
function drawCopperJumper(a,b){
  const lift=10;
  ctx.beginPath();
  ctx.moveTo(a.x,a.y);
  ctx.quadraticCurveTo((a.x+b.x)/2,Math.min(a.y,b.y)-lift,b.x,b.y);
  ctx.strokeStyle="#b87333";
  ctx.lineWidth=5;
  ctx.setLineDash([]);
  ctx.stroke();
}
function wCol(a,b){
  const gT=["gnd_pipe","gnd_box","gnd_sys","la_gnd","tr_g"];
  if(gT.includes(a.type)||gT.includes(b.type)) return "#2ecc71";
  if(a.type==="lv_grid"||b.type==="lv_grid"||a.type==="tr_lv"||b.type==="tr_lv") return "#e67e22";
  if(a.type==="la_hv"||b.type==="la_hv") return "#5dade2";
  return "#f1c40f";
}
function nCol(nd){
  const t=nd.type;
  if(t==="hv_line") return "#4a9edd";
  if(t==="co_top") return "#f0c040";
  if(t==="co_bot") return "#c49a20";
  if(t==="la_hv") return "#f0c040";
  if(t==="la_gnd") return "#2ecc71";
  if(t==="gnd_pipe"||t==="gnd_box"||t==="gnd_sys") return "#2ecc71";
  if(t==="tr_hv") return "#e8c060";
  if(t==="tr_g") return "#2ecc71";
  if(t==="tr_lv") return "#e67e22";
  if(t==="lv_grid") return "#d4af37";
  return "#aaaaaa";
}

// ═══════════════════ 滑鼠 ═══════════════════
// 邏輯：
//   單擊節點 → 建立連線
//   單擊連線 → 第一次高亮選取
//   再次單擊同一條連線 → 第二次直接刪除（連點兩次刪線）
//   單擊空白 → 取消選取
function onMD(e){
  const r=canvas.getBoundingClientRect();
  // 修正縮放比例：canvas 實際繪圖尺寸 vs CSS 顯示尺寸
  const scaleX=canvas.width/r.width;
  const scaleY=canvas.height/r.height;
  const mx=(e.clientX-r.left)*scaleX;
  const my=(e.clientY-r.top)*scaleY;

  // 已選取連線的紫色 X 圓鈕要能直接刪除；它不一定剛好落在線段命中路徑上。
  if(selC){
    const m=bzMid(selC.n1,selC.n2);
    if(Math.hypot(mx-m.x,my-m.y)<=18){
      delConn(selC); return;
    }
  }

  // 點節點優先
  for(const nd of nodes){
    if(Math.hypot(mx-nd.x,my-nd.y)<=nd.r+8){
      if(!selN){
        selN=nd; selC=null;
        DH&&DH.classList.remove("show");
      } else if(selN.id!==nd.id){
        // 只檢查學生已畫線是否重複；X2-X3 內部銅片不阻擋外部練習接線。
        const dup=conns.some(c=>
          (c.n1.id===selN.id&&c.n2.id===nd.id)||(c.n1.id===nd.id&&c.n2.id===selN.id));
        if(!dup){
          conns.push({n1:selN,n2:nd,g:CG});
          clearReviewState();
        }
        selN=null;
      } else {
        selN=null;
      }
      draw(); return;
    }
  }

  // 點連線
  for(const c of conns){
    if(distToWire(c.n1,c.n2,mx,my)<=18){
      if(selC===c){
        // 第二次點同一條線 → 直接刪除
        delConn(c); return;
      } else {
        // 第一次點 → 高亮選取
        selC=c; selN=null;
        DH&&DH.classList.add("show");
        draw(); return;
      }
    }
  }

  // 點空白 → 取消
  selN=null; selC=null;
  DH&&DH.classList.remove("show");
  draw();
}
function delConn(c){
  const i=conns.indexOf(c);
  if(i>=0){
    conns.splice(i,1);
    clearReviewState();
  }
  selC=null;
  DH&&DH.classList.remove("show");
  draw();
}
function delSel(){
  if(selC) delConn(selC);
}
function onKD(e){
  if((e.key==="Delete"||e.key==="Backspace")&&selC){e.preventDefault();delSel();}
  if(e.key==="Escape"){selN=null;selC=null;DH&&DH.classList.remove("show");draw();}
}

// ═══════════════════ 控制 ═══════════════════
function switchQuiz(q){
  CQ=q;
  for(let i=1;i<=6;i++) document.getElementById(`qb${i}`).classList.toggle("active",i===q);
  document.getElementById("qtitle").innerText=SP[q].title;
  document.getElementById("qguide").innerText=SP[q].guide;
  showP=false; showMaterials=false;
  const pb=document.getElementById("pbtn");
  if(pb){pb.classList.remove("on"); pb.innerText="固定預設：X2-X3";}
  initLayout(q); draw();
}
function togglePreset(){
  showP=!showP;
  const pb=document.getElementById("pbtn");
  if(!pb) return;
  pb.classList.toggle("on",showP);
  pb.innerText="固定預設：X2-X3";
  draw();
}
function clearWires(){
  initLayout(CQ);showP=false;showMaterials=false;
  const pb=document.getElementById("pbtn");
  if(pb){pb.classList.remove("on"); pb.innerText="固定預設：X2-X3";}
  DH&&DH.classList.remove("show"); draw();
}
function enterQuiz(){clearWires();}

// ═══════════════════ 標準答案 ═══════════════════
function showAnswer(){
  initLayout(CQ);
  showMaterials=true;
  const f=id=>nodes.find(n=>n.id===id);
  const usedLv=new Set();
  const add=(a,b,g=22)=>{
    const n1=f(a),n2=f(b);
    if(n1&&n2){
      conns.push({n1,n2,g});
      if(n1.type==="lv_grid") usedLv.add(n1.id);
      if(n2.type==="lv_grid") usedLv.add(n2.id);
    }
  };
  const pickRowNode=(from,row)=>{
    const src=f(from);
    if(!src) return null;
    if(typeof pickBestLvTap==="function"){
      return pickBestLvTap({from:src,row,nodes,usedLv,existingConns:conns});
    }
    return nodes
      .filter(n=>n.row===row&&!usedLv.has(n.id))
      .sort((a,b)=>Math.abs(a.x-src.x)-Math.abs(b.x-src.x))[0]||null;
  };
  getStandardWires(CQ).forEach(w=>{
    if(w.toRow){
      const n=pickRowNode(w.from,w.toRow);
      if(n) add(w.from,n.id,w.g||22);
    }else{
      add(w.from,w.to,w.g||22);
    }
  });
  draw();
}

// ═══════════════════ 配線審查 ═══════════════════
function checkWiring(){
  try{
    errN=new Set(); errC=new Set(); hintConns=[];
    const f=id=>nodes.find(n=>n.id===id);

    const adj={};
    nodes.forEach(n=>adj[n.id]=new Set());
    // 只有考生連線 + X2-X3銅片內短（copper:true）納入審查。
    // 除 X2-X3 外，全部關鍵線都必須由考生自行畫出並確認。
    const auditConns=[...conns, ...presets.filter(c=>c.copper)];
    auditConns.forEach(c=>{
      if(!c||!c.n1||!c.n2)return;
      adj[c.n1.id].add(c.n2.id); adj[c.n2.id].add(c.n1.id);
    });
    function cn(a,b){
      const v=new Set(),q=[a];
      while(q.length){const c=q.shift();if(c===b)return true;if(v.has(c))continue;v.add(c);(adj[c]||new Set()).forEach(n=>{if(!v.has(n))q.push(n);});}
      return false;
    }
    function cnR(id,row){return nodes.filter(n=>n.row===row).some(n=>cn(id,n.id));}
    function anyCnR(ids,row){return ids.some(id=>cnR(id,row));}
    function mark(...ids){ids.forEach(id=>errN.add(id));}
    // 提示連線：兩節點間應有連線但實際沒有
    function hint(a,b){
      const n1=f(a),n2=f(b);
      if(n1&&n2&&!cn(a,b)) hintConns.push({n1,n2});
    }

    const sp=SP[CQ];const is3=sp.tr===3;
    const err=[],wrn=[];

    if(typeof runModularRules==="function"){
      const modular=runModularRules({nodes,conns,presets,quizId:CQ,sp});
      modular.errors.forEach(msg=>{if(!err.includes(msg)) err.push(msg);});
      modular.warnings.forEach(msg=>{if(!wrn.includes(msg)) wrn.push(msg);});
      modular.marks.forEach(id=>errN.add(id));
      modular.hints.forEach(h=>hintConns.push(h));
      (modular.connMarks||[]).forEach(c=>errC.add(c));
    }

    if(typeof runModularRules!=="function"){
    // 1. 幹線→CO電源側
    if(sp.sg){
      if(!cn(1,104)||!cn(3,106)){
        err.push("❌【重大缺失六】單套管題幹線A/C相未引入CO電源側！");mark(1,3,104,106);
        hint(1,104);hint(3,106);
      }
    } else {
      if(!cn(1,104)||!cn(2,105)){
        err.push("❌【重大缺失六】幹線A/B相未引入CO電源側！");mark(1,2,104,105);
        hint(1,104);hint(2,105);
      }
      if(!cn(3,106)){
        err.push("❌【重大缺失六】幹線C相未引入CO_C電源側！");mark(3,106);hint(3,106);
      }
    }

    // 2. LA從CO電源側分接
    if(sp.sg){
      if(!cn(104,10)||!cn(106,12)){
        err.push("❌【重大缺失六】單套管題LA_A/LA_C高壓端必須由CO電源側平行分接！");mark(104,106,10,12);
        hint(104,10);hint(106,12);
      }
    } else {
      if(!cn(104,10)||!cn(105,11)){
        err.push("❌【重大缺失六】LA高壓端必須由CO電源側平行分接！");mark(104,105,10,11);
        hint(104,10);hint(105,11);
      }
      if(!cn(106,12)){
        err.push("❌【重大缺失六】LA_C未由CO_C電源側分接！");mark(106,12);hint(106,12);
      }
    }

    // 3. LA接地→管口99
    // 單套管(Q4/Q5)：A/C 的 LA 接地端 13和15串接後任一引到99即可
    // 雙套管(Q1/2/3/6)：13→14→15串接，最終任一引到99
    const laOk=sp.sg
      ? (cn(13,15) && (cn(13,99)||cn(15,99)))
      : (cn(13,14) && cn(14,15) && (cn(13,99)||cn(14,99)||cn(15,99)));
    if(!laOk){
      err.push("❌【重大缺失八】LA接地端未串接引入管口(99)！[14mm²]");mark(13,14,15,99);
      if(!sp.sg){hint(13,14);hint(14,15);hint(15,99);}else {hint(13,15);hint(15,99);}
    }

    // 4. Q1/Q2：CO負載側→TR H端子
    if(CQ===1||CQ===2){
      if(!cn(107,201)){err.push("❌【高壓缺失】CO_A負載側未引接TR1_H1(201)！");mark(107,201);hint(107,201);}
      if(!cn(108,202)){err.push("❌【高壓缺失】CO_B負載側未引接TR1_H2(202)！");mark(108,202);hint(108,202);}
      if(!cn(108,204)){err.push("❌【高壓缺失】CO_B負載側未引接TR2_H1(204)！");mark(108,204);hint(108,204);}
      if(!cn(109,205)){err.push("❌【高壓缺失】CO_C負載側未引接TR2_H2(205)！");mark(109,205);hint(109,205);}
    }

    // 4b. Q3/Q6：CO負載側→TR H1
    if((CQ===3||CQ===6)&&(!cn(107,201)||!cn(108,204)||!cn(109,207))){
      err.push("❌【高壓缺失】CO負載側未完全引接各台TR H1端子！");mark(107,108,109,201,204,207);
      hint(107,201);hint(108,204);hint(109,207);
    }

    // 4c. Q4/Q5：CO負載側→TR H1
    if(CQ===4||CQ===5){
      if(!cn(107,201)){err.push("❌【高壓缺失】CO_A負載側未引接TR1_H1(201)！");mark(107,201);hint(107,201);}
      if(!cn(109,204)){err.push("❌【高壓缺失】CO_C負載側未引接TR2_H1(204)！");mark(109,204);hint(109,204);}
    }

    // 5. Q4/Q5：開Y中性點 — 單套管，外殼G互接
    if((CQ===4||CQ===5)&&!cn(203,206)){
      err.push("❌【高壓缺失】單套管開Y：TR1外殼G(203)↔TR2外殼G(206)未互接！");
      mark(203,206);hint(203,206);
    }

    // 6. 外殼G串接後引至管口(45)
    // 規定：各台外殼G先串接，再由最後一台引一條線到(45)
    // 驗証：所有外殼G節點都連通到(45)即可（不管串接順序）
    const gOk=cn(203,45)&&cn(206,45)&&(!is3||cn(209,45));
    const gSerial=is3?(cn(203,206)&&cn(206,209)):(cn(203,206));
    if(!gOk){
      err.push("❌【重大缺失八】外殼G螺絲未串接後引入外箱保護接地口(45)！應先串接各台再引一條線到(45)");
      mark(203,206,45);
      if(!cn(203,206))hint(203,206);
      if(!cn(206,45))hint(206,45);
      if(is3){if(!cn(206,209))hint(206,209);if(!cn(209,45))hint(209,45);}
    } else if(!gSerial){
      err.push("⚠【工法缺失】外殼G各台已接到(45)，但未串接在一起！規定須先串接再引一條線到(45)");
      mark(203,206);
      hint(203,206);
    }
    if(cn(203,48)||cn(206,48)||(is3&&cn(209,48))){
      err.push("💥【判定0分】外殼接地混接至系統接地口(48)！嚴禁混用！");mark(203,206,45,48);}

    // 7. 低壓
    if(CQ===1||CQ===5){
      if(!cn(304,305)){err.push("❌【低壓缺失】TR1_X4↔TR2_X1未短接！");mark(304,305);hint(304,305);}
      if(!anyCnR([304,305],"row1")){err.push("❌【低壓缺失】共用點未引至被接地線！");mark(304,305,401);hint(304,401);}
      if(!cnR(301,"row2")){err.push("❌【低壓缺失】TR1_X1(301)未引至A相低壓線！");mark(301,411);hint(301,411);}
      if(!cnR(308,"row3")){err.push("❌【低壓缺失】TR2_X4(308)未引至B相低壓線！");mark(308,421);hint(308,421);}
    }else if(CQ===2||CQ===4){
      if(CQ===4&&!cn(304,305)){err.push("❌【低壓缺失】TR1_X4↔TR2_X1未短接！");mark(304,305);hint(304,305);}
      if(!anyCnR([302,303],"row1")){err.push("❌【低壓缺失】工作中性點未引至被接地線！");mark(302,303,401);hint(302,401);}
      if(!cnR(301,"row2")){err.push("❌【低壓缺失】TR1_X1(301)未引至A相低壓線！");mark(301,411);hint(301,411);}
      if(!cnR(305,"row3")){err.push("❌【低壓缺失】TR2_X1(305)未引至B相低壓線！");mark(305,421);hint(305,421);}
      if(!cnR(308,"row4")){err.push("❌【低壓缺失】TR2_X4(308)未引至C相低壓線！");mark(308,431);hint(308,431);}
    }else if(CQ===3){
      if(!cn(304,305)){hint(304,305);}if(!cn(308,309)){hint(308,309);}if(!cn(312,301)){hint(312,301);}
      if(!(cn(304,305)&&cn(308,309)&&cn(312,301))){err.push("❌【低壓缺失】Δ三角形未閉合！（需：TR1_X4↔TR2_X1、TR2_X4↔TR3_X1、TR3_X4↔TR1_X1）");mark(304,305,308,309,312,301);}
      // 接地頂點：TR1_X1(301)與TR3_X4(312)的短接處引出→行1
      if(!anyCnR([301,312],"row1")){err.push("❌【低壓缺失】Δ接地頂點（TR1_X1↔TR3_X4短接處）未引至被接地線！");mark(301,312,401);hint(301,401);}
      if(!anyCnR([304,305],"row2")){err.push("❌【低壓缺失】Δ出力未引至A相低壓線！");mark(304,305,411);hint(305,411);}
      if(!anyCnR([308,309],"row3")){err.push("❌【低壓缺失】Δ出力未引至B相低壓線！");mark(308,309,421);hint(309,421);}
    }else if(CQ===6){
      if(!cn(304,308)){hint(304,308);}if(!cn(308,312)){hint(308,312);}
      if(!(cn(304,308)&&cn(308,312))){err.push("❌【低壓缺失】Y中性點未串接！");mark(304,308,312);}
      if(!anyCnR([304,308,312],"row1")){err.push("❌【低壓缺失】Y中性點未引至被接地線！");mark(401);hint(312,401);}
      if(!cnR(301,"row2")){err.push("❌【低壓缺失】TR1_X1未引至A相低壓線！");mark(301,411);hint(301,411);}
      if(!cnR(305,"row3")){err.push("❌【低壓缺失】TR2_X1未引至B相低壓線！");mark(305,421);hint(305,421);}
      if(!cnR(309,"row4")){err.push("❌【低壓缺失】TR3_X1未引至C相低壓線！");mark(309,431);hint(309,431);}
    }

    // 8. 行1→系統接地口48
    if(!cnR(48,"row1")){
      err.push("❌【接地缺失】被接地線未引至系統被接地口(48)！");mark(48,401,402);
      hint(401,48);
    }

    // 9. C型環重複壓接
    const cnt={};
    conns.forEach(c=>{[c.n1,c.n2].forEach(nd=>{if(nd.type==="lv_grid")cnt[nd.id]=(cnt[nd.id]||0)+1;});});
    Object.entries(cnt).forEach(([id,n])=>{if(n>1){wrn.push(`⚠ 低壓接點(${id})重複壓接${n}條線！`);errN.add(Number(id));}});

    // 標示錯誤連線
    conns.forEach(c=>{if(errN.has(c.n1.id)||errN.has(c.n2.id))errC.add(c);});
    }
    draw();

    RES.style.display="block";
    if(err.length===0){
      RES.className="res ok"; errN=new Set();errC=new Set();hintConns=[];
      const wt=wrn.length?"\n\n⚠ 工法警告：\n"+wrn.join("\n"):"";
      RES.innerHTML=`🎉【監評配線審查：合格！】\n幹線引入✓ LA分接順序✓ 避雷器接地✓\n外殼保護接地✓ 低壓結線✓ 系統接地✓\n本題配線完全正確！${wt}`;
    }else{
      RES.className="res er";
      const gaugeErr=err.filter(msg=>msg.includes("線徑錯誤"));
      const otherErr=err.filter(msg=>!msg.includes("線徑錯誤"));
      const gaugeBlock=gaugeErr.length
        ? `🚨【線徑錯誤：請先切換正確線徑再重接】\n${gaugeErr.join("\n")}\n\n`
        : "";
      RES.innerHTML=`📋【監評配線審查：不合格】\n發現 ${err.length} 項缺失\n▪ 紅色粗線＝錯誤線路  ▪ 黃色框＝缺失節點  ▪ 白色虛線＝應接位置：\n\n${gaugeBlock}${otherErr.join("\n")}${wrn.length?"\n\n"+wrn.join("\n"):""}`;
    }
    draw();
  }catch(ex){
    RES.style.display="block";RES.className="res er";
    RES.innerHTML="⚠ 系統錯誤："+ex.message;
  }
}

// ═══════════════════ 初始化 ═══════════════════
document.addEventListener("DOMContentLoaded",()=>{
  canvas=document.getElementById("wireCanvas");
  ctx=canvas.getContext("2d");
  RES=document.getElementById("res");
  DH=document.getElementById("dh");
  if(window.PointerEvent) canvas.addEventListener("pointerdown",onMD);
  else canvas.addEventListener("mousedown",onMD);
  document.addEventListener("keydown",onKD);
  switchQuiz(1);
});



