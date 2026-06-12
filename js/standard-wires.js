// Standard answer display data.
// The canonical exam answer lives in answer-spec.js; this file only converts it
// to drawable wire records used by app.js.
function getStandardWires(q){
  if(typeof getAnswerWires!=="function") return [];
  return getAnswerWires(q).map(w=>{
    const wire={from:w.from,g:w.g||22,section:w.section,id:w.id,desc:w.desc};
    if(w.toRow) wire.toRow=w.toRow;
    else wire.to=w.to;
    return wire;
  });
}
