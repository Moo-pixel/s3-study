// Mobile layout constants. The mobile page uses a larger scrollable canvas
// rather than shrinking the desktop drawing, keeping terminals readable.
window.LAYOUT={
  nodeRadius:10,
  pole:{x:540,y1:170,y2:1160,crossY:245,crossX1:100,crossX2:1000},
  hv:{x1:80,x2:1030,labelX:1040,ys:[70,92,114],colors:["#cc3333","#7788aa","#445566"],labels:["A","B","C"]},
  device:{laY1:190,laY2:278,coY1:205,coY2:310,laNodeY:[208,260],coNodeY:[226,292]},
  ground:[[540,340],[540,690],[540,760]],
  lv:{x1:90,x2:1010,tapX:[120,225,330,435,540,645,750,855,960],ys:[850,905,960,1015],
      colors:["#1a3a28","#2a2510","#2a2510","#22182a"],labelColors:["#3dc97a","#e67e22","#e67e22","#a569bd"]},
  tr:{
    top:390,width:260,height:250,hY:445,xY:565,gY:680,corner:26,
    centers3:[210,540,870],
    centers2:[260,820],
    hOffsets:[-65,65],
    xOffsets:[-78,-28,35,88]
  }
};

function deviceGroups(isSG){
  const base=[
    {ph:"A", lax:205, cox:285, hvx:250, hvy:70, hvId:1, laHvId:10, laGId:13, coTopId:104, coBotId:107, color:"#cc3333"},
    {ph:"B", lax:455, cox:525, hvx:495, hvy:92, hvId:2, laHvId:11, laGId:14, coTopId:105, coBotId:108, color:"#7788aa"},
    {ph:"C", lax:775, cox:850, hvx:810, hvy:114, hvId:3, laHvId:12, laGId:15, coTopId:106, coBotId:109, color:"#445566"}
  ];
  return isSG ? [base[0],base[2]] : base;
}

function transformerBoxes(sp){
  const centers=sp.tr===3 ? LAYOUT.tr.centers3 : LAYOUT.tr.centers2;
  return centers.map((cx,i)=>({cx,idx:i+1,single:sp.sg}));
}
