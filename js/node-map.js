function NN(id,lbl,x,y,type,row=""){return{id,lbl,x,y,type,row,r:LAYOUT.nodeRadius||7};}

function addTransformerNodes(box){
  const hvIds=[[201,202],[204,205],[207,208]][box.idx-1];
  const gIds=[203,206,209];
  const lvIds=[[301,302,303,304],[305,306,307,308],[309,310,311,312]][box.idx-1];
  const hXs=LAYOUT.tr.hOffsets.map(dx=>box.cx+dx);
  nodes.push(NN(hvIds[0],"H1",hXs[0],LAYOUT.tr.hY,"tr_hv"));
  if(!box.single) nodes.push(NN(hvIds[1],"H2",hXs[1],LAYOUT.tr.hY,"tr_hv"));
  LAYOUT.tr.xOffsets.forEach((dx,i)=>nodes.push(NN(lvIds[i],`X${i+1}`,box.cx+dx,LAYOUT.tr.xY,"tr_lv")));
  nodes.push(NN(gIds[box.idx-1],"G",box.cx,LAYOUT.tr.gY,"tr_g"));
}

function initLayout(q){
  nodes=[]; conns=[]; presets=[];
  selN=null; selC=null;
  errN=new Set(); errC=new Set(); hintConns=[];
  if(RES) RES.style.display="none";
  if(DH) DH.classList.remove("show");

  const sp=SP[q];
  const is3=(sp.tr===3);
  const isSG=sp.sg;
  const groups = deviceGroups(isSG);

  groups.forEach((g)=>{
    nodes.push(NN(g.hvId,  `${g.ph}幹活線夾`, g.hvx, g.hvy, "hv_line"));
    nodes.push(NN(g.laHvId, `LA_${g.ph}↑`, g.lax, LAYOUT.device.laNodeY[0], "la_hv"));
    nodes.push(NN(g.laGId,  `LA_${g.ph}↓`, g.lax, LAYOUT.device.laNodeY[1], "la_gnd"));
    nodes.push(NN(g.coTopId,`CO_${g.ph}↑`, g.cox, LAYOUT.device.coNodeY[0], "co_top"));
    nodes.push(NN(g.coBotId,`CO_${g.ph}↓`, g.cox, LAYOUT.device.coNodeY[1], "co_bot"));
  });

  nodes.push(NN(99,"(99)LA接地口",LAYOUT.ground[0][0],LAYOUT.ground[0][1]-2,"gnd_pipe"));
  nodes.push(NN(45,"(45)外殼接地口",LAYOUT.ground[1][0],LAYOUT.ground[1][1]-2,"gnd_box"));
  nodes.push(NN(48,"(48)系統接地口",LAYOUT.ground[2][0],LAYOUT.ground[2][1]-2,"gnd_sys"));

  transformerBoxes(sp).forEach(addTransformerNodes);

  const lx=LAYOUT.lv.tapX, ly=LAYOUT.lv.ys;
  const rn=["row1","row2","row3","row4"];
  const bi=[401,411,421,431];
  for(let r=0;r<4;r++)
    for(let c=0;c<lx.length;c++)
      nodes.push(NN(bi[r]+c,`${["N","A","B","C"][r]}_${c+1}`,lx[c],ly[r],"lv_grid",rn[r]));

  const f=id=>nodes.find(n=>n.id===id);
  presets.push({n1:f(302),n2:f(303),g:99,copper:true});
  presets.push({n1:f(306),n2:f(307),g:99,copper:true});
  if(is3) presets.push({n1:f(310),n2:f(311),g:99,copper:true});
}
