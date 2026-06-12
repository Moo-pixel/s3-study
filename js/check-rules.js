// Rule-based audit helpers for wiring review.
// This layer is intentionally data-driven from standard-wires.js.
function buildAuditGraph(nodes,conns,presets){
  const adj={};
  nodes.forEach(n=>adj[n.id]=new Set());
  [...conns,...presets.filter(c=>c.copper)].forEach(c=>{
    if(!c||!c.n1||!c.n2) return;
    adj[c.n1.id].add(c.n2.id);
    adj[c.n2.id].add(c.n1.id);
  });
  const connected=(a,b)=>{
    const seen=new Set(), q=[a];
    while(q.length){
      const id=q.shift();
      if(id===b) return true;
      if(seen.has(id)) continue;
      seen.add(id);
      (adj[id]||new Set()).forEach(next=>{if(!seen.has(next)) q.push(next);});
    }
    return false;
  };
  return {adj,connected};
}

function directConnsBetween(conns,a,b){
  return conns.filter(c=>
    (c.n1.id===a&&c.n2.id===b)||(c.n1.id===b&&c.n2.id===a)
  );
}

function runModularRules({nodes,conns,presets,quizId,sp}){
  const graph=buildAuditGraph(nodes,conns,presets);
  const byId=id=>nodes.find(n=>n.id===id);
  const result={errors:[],warnings:[],marks:new Set(),hints:[],connMarks:[]};
  const mark=(...ids)=>ids.forEach(id=>result.marks.add(id));
  const hint=(a,b)=>{
    const n1=byId(a), n2=byId(b);
    if(n1&&n2&&!graph.connected(a,b)) result.hints.push({n1,n2});
  };
  const addError=(msg,ids=[],hints=[])=>{
    result.errors.push(msg);
    mark(...ids);
    hints.forEach(([a,b])=>hint(a,b));
  };

  getStandardWires(quizId).forEach(w=>{
    if(w.toRow){
      const rowName=typeof rowDisplayName==="function"?rowDisplayName(w.toRow):w.toRow;
      const targets=nodes.filter(n=>n.row===w.toRow);
      const ok=targets.some(n=>graph.connected(w.from,n.id));
      if(!ok){
        addError(
          `❌【標準答案缺線】${w.from} 未接到${rowName}任一合理接點！`,
          [w.from,...targets.map(n=>n.id)],
          targets[0]?[[w.from,targets[0].id]]:[]
        );
      }
      return;
    }
    if(!graph.connected(w.from,w.to)){
      addError(
        `❌【標準答案缺線】應接 ${w.from} ↔ ${w.to}，目前未連通！`,
        [w.from,w.to],
        [[w.from,w.to]]
      );
    }
  });

  // Construction rule: CO load side must not directly branch into two transformer H terminals.
  [107,108,109].forEach(coId=>{
    const trBranches=conns.filter(c=>{
      const other=c.n1.id===coId?c.n2:c.n2.id===coId?c.n1:null;
      return other&&other.type==="tr_hv";
    });
    if(trBranches.length>1){
      const endpoints=trBranches.flatMap(c=>[c.n1.id,c.n2.id]);
      addError(
        `❌【工法缺失】CO負載側(${coId})不可直接分出 ${trBranches.length} 條線到變壓器，應先到一個H端再由套管分接！`,
        [coId,...endpoints]
      );
    }
  });

  // Construction rule: one C-ring tap may only be used by one wire.
  const lvTapUse={};
  conns.forEach(c=>{
    [c.n1,c.n2].forEach(n=>{
      if(n.type==="lv_grid") lvTapUse[n.id]=(lvTapUse[n.id]||0)+1;
    });
  });
  Object.entries(lvTapUse).forEach(([id,count])=>{
    if(count>1){
      result.warnings.push(`⚠【工法警告】低壓C型環接點(${id})被 ${count} 條線共用，標準施工應一點一線。`);
      result.marks.add(Number(id));
    }
  });

  // Gauge rule for direct wires: LA leads must be 14mm², other standard direct wires default to 22mm².
  getStandardWires(quizId).forEach(w=>{
    if(w.toRow){
      const rowName=typeof rowDisplayName==="function"?rowDisplayName(w.toRow):w.toRow;
      const expected=w.g||22;
      conns.forEach(c=>{
        const aIsRow=c.n1.type==="lv_grid"&&c.n1.row===w.toRow;
        const bIsRow=c.n2.type==="lv_grid"&&c.n2.row===w.toRow;
        if(!aIsRow&&!bIsRow) return;
        const other=aIsRow?c.n2:c.n1;
        if(graph.connected(w.from,other.id)&&c.g!==expected){
          result.connMarks.push(c);
          addError(
            `❌【線徑錯誤】${w.from} → ${rowName} 應使用 ${expected}mm²，現在是 ${c.g}mm²！`,
            []
          );
        }
      });
      return;
    }
    directConnsBetween(conns,w.from,w.to).forEach(c=>{
      const expected=w.g||22;
      if(c.g!==expected){
        result.connMarks.push(c);
        addError(
          `❌【線徑錯誤】${w.from} ↔ ${w.to} 應使用 ${expected}mm²，現在是 ${c.g}mm²！`,
          []
        );
      }
    });
  });

  return result;
}
