// Mobile layout constants. This is an operation-first layout: terminals and
// short tap distances matter more than matching the desktop scene.
window.LAYOUT={
  nodeRadius:15,
  pole:{x:1020,y1:150,y2:1105,crossY:220,crossX1:80,crossX2:1020},
  hv:{x1:70,x2:1000,labelX:1010,ys:[60,88,116],colors:["#cc3333","#7788aa","#445566"],labels:["A","B","C"]},
  device:{laY1:170,laY2:266,coY1:186,coY2:296,laNodeY:[192,250],coNodeY:[206,282]},
  ground:[[560,330],[560,650],[560,755]],
  lv:{x1:90,x2:990,tapX:[150,260,370,480,590,700,810,920],ys:[780,842,904,966],
      colors:["#1a3a28","#2a2510","#2a2510","#22182a"],labelColors:["#3dc97a","#e67e22","#e67e22","#a569bd"]},
  tr:{
    top:380,width:235,height:230,hY:430,xY:548,gY:642,corner:24,
    centers3:[285,540,795],
    centers2:[350,730],
    hOffsets:[-56,56],
    xOffsets:[-72,-24,30,78]
  }
};

function deviceGroups(isSG){
  const base=[
    {ph:"A", lax:210, cox:285, hvx:245, hvy:60, hvId:1, laHvId:10, laGId:13, coTopId:104, coBotId:107, color:"#cc3333"},
    {ph:"B", lax:490, cox:560, hvx:525, hvy:88, hvId:2, laHvId:11, laGId:14, coTopId:105, coBotId:108, color:"#7788aa"},
    {ph:"C", lax:770, cox:845, hvx:810, hvy:116, hvId:3, laHvId:12, laGId:15, coTopId:106, coBotId:109, color:"#445566"}
  ];
  return isSG ? [base[0],base[2]] : base;
}

function transformerBoxes(sp){
  const centers=sp.tr===3 ? LAYOUT.tr.centers3 : LAYOUT.tr.centers2;
  return centers.map((cx,i)=>({cx,idx:i+1,single:sp.sg}));
}
