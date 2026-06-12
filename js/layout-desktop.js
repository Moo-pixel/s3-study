// Desktop layout constants and equipment grouping.
window.LAYOUT={
  pole:{x:490,y1:110,y2:790,crossY:155,crossX1:80,crossX2:900},
  hv:{x1:50,x2:920,labelX:928,ys:[45,62,79],colors:["#cc3333","#7788aa","#445566"],labels:["A","B","C"]},
  device:{laY1:112,laY2:178,coY1:124,coY2:196,laNodeY:[124,166],coNodeY:[136,188]},
  ground:[[490,202],[490,455],[490,520]],
  lv:{x1:70,x2:880,tapX:[85,180,275,370,465,560,655,750,845],ys:[565,602,639,676],
      colors:["#1a3a28","#2a2510","#2a2510","#22182a"],labelColors:["#3dc97a","#e67e22","#e67e22","#a569bd"]},
  tr:{
    top:245,width:230,height:190,hY:278,xY:350,gY:415,corner:22,
    centers3:[180,430,700],
    centers2:[180,700],
    hOffsets:[-50,50],
    xOffsets:[-60,-20,35,75]
  }
};

function deviceGroups(isSG){
  const base=[
    {ph:"A", lax:145, cox:215, hvx:180, hvy:45, hvId:1, laHvId:10, laGId:13, coTopId:104, coBotId:107, color:"#cc3333"},
    {ph:"B", lax:310, cox:368, hvx:337, hvy:62, hvId:2, laHvId:11, laGId:14, coTopId:105, coBotId:108, color:"#7788aa"},
    {ph:"C", lax:615, cox:673, hvx:644, hvy:79, hvId:3, laHvId:12, laGId:15, coTopId:106, coBotId:109, color:"#445566"}
  ];
  return isSG ? [base[0],base[2]] : base;
}

function transformerBoxes(sp){
  const centers=sp.tr===3 ? LAYOUT.tr.centers3 : LAYOUT.tr.centers2;
  return centers.map((cx,i)=>({cx,idx:i+1,single:sp.sg}));
}
