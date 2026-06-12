// Standard-answer route picking.
// Review checks whether a terminal reaches the correct row; this file only chooses
// a clear, construction-like C-ring location for displaying the standard answer.
const LV_ROW_NAMES={
  row1:"被接地線",
  row2:"A相低壓線",
  row3:"B相低壓線",
  row4:"C相低壓線"
};

function rowDisplayName(row){
  return LV_ROW_NAMES[row]||row;
}

function crossesPole(a,b){
  if(!window.LAYOUT||!LAYOUT.pole) return false;
  const px=LAYOUT.pole.x;
  return (a.x<px&&b.x>px)||(a.x>px&&b.x<px);
}

function nearbyParallelPenalty(src,tap,existingConns){
  let penalty=0;
  (existingConns||[]).forEach(c=>{
    if(!c||!c.n1||!c.n2) return;
    const lv=c.n1.type==="lv_grid"?c.n1:c.n2.type==="lv_grid"?c.n2:null;
    const tr=c.n1.type==="tr_lv"?c.n1:c.n2.type==="tr_lv"?c.n2:null;
    if(!lv||!tr) return;
    if(lv.row===tap.row&&Math.abs(lv.x-tap.x)<60) penalty+=55;
    if(Math.abs(tr.x-src.x)<40&&Math.abs(lv.x-tap.x)<90) penalty+=35;
  });
  return penalty;
}

function pickBestLvTap({from,row,nodes,usedLv,existingConns=[]}){
  if(!from) return null;
  const taps=nodes.filter(n=>n.row===row&&!usedLv.has(n.id));
  if(!taps.length) return null;
  const scored=taps.map(tap=>{
    const dx=Math.abs(tap.x-from.x);
    const sameColumn=dx<=48 ? -80 : 0;
    const crossPenalty=crossesPole(from,tap) ? 220 : 0;
    const longRunPenalty=Math.max(0,dx-160)*1.8;
    const parallelPenalty=nearbyParallelPenalty(from,tap,existingConns);
    const clear=typeof pathClearance==="function" ? pathClearance(from,tap,3.5) : 0;
    const clearancePenalty=clear<0 ? Math.abs(clear)*8 : 0;
    return {
      tap,
      score:dx + crossPenalty + longRunPenalty + parallelPenalty + clearancePenalty + sameColumn
    };
  }).sort((a,b)=>a.score-b.score||Math.abs(a.tap.x-from.x)-Math.abs(b.tap.x-from.x));
  return scored[0].tap;
}
