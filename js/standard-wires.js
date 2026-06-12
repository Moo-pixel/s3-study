// Standard answer wiring data.
// Use exact node IDs for fixed equipment terminals, and row targets for low-voltage taps.
function commonPrimaryWires(q, sp){
  const wires=[
    {from:1,to:104},
    {from:104,to:10,g:14}
  ];
  if(!sp.sg){
    wires.push(
      {from:2,to:105},
      {from:105,to:11,g:14},
      {from:13,to:14,g:14},
      {from:3,to:106},
      {from:106,to:12,g:14},
      {from:14,to:15,g:14},
      {from:15,to:99,g:14}
    );
  }else{
    wires.push(
      {from:3,to:106},
      {from:106,to:12,g:14},
      {from:13,to:15,g:14},
      {from:15,to:99,g:14}
    );
  }
  if(q===1||q===2){
    wires.push(
      {from:107,to:201},
      {from:108,to:202},
      {from:202,to:204},
      {from:109,to:205}
    );
  }else if(q===3||q===6){
    wires.push(
      {from:107,to:201},
      {from:108,to:204},
      {from:109,to:207},
      {from:202,to:204},
      {from:205,to:207},
      {from:208,to:201}
    );
  }else if(q===4||q===5){
    wires.push({from:107,to:201},{from:109,to:204},{from:203,to:206});
  }
  if(sp.tr===3){
    wires.push({from:203,to:206},{from:206,to:209},{from:209,to:45});
  }else if(q===4||q===5){
    wires.push({from:206,to:45});
  }else{
    wires.push({from:203,to:206},{from:206,to:45});
  }
  return wires;
}

function lowVoltageWires(q){
  if(q===1){
    return [
      {from:304,to:305},
      {from:304,toRow:"row1"},
      {from:301,toRow:"row2"},
      {from:308,toRow:"row3"},
      {from:48,toRow:"row1"}
    ];
  }
  if(q===2){
    return [
      {from:304,to:305},
      {from:303,toRow:"row1"},
      {from:301,toRow:"row2"},
      {from:305,toRow:"row3"},
      {from:308,toRow:"row4"},
      {from:48,toRow:"row1"}
    ];
  }
  if(q===3){
    return [
      {from:304,to:305},
      {from:308,to:309},
      {from:312,to:301},
      {from:301,toRow:"row1"},
      {from:305,toRow:"row2"},
      {from:309,toRow:"row3"},
      {from:48,toRow:"row1"}
    ];
  }
  if(q===4){
    return [
      {from:304,to:305},
      {from:303,toRow:"row1"},
      {from:301,toRow:"row2"},
      {from:305,toRow:"row3"},
      {from:308,toRow:"row4"},
      {from:48,toRow:"row1"}
    ];
  }
  if(q===5){
    return [
      {from:304,to:305},
      {from:304,toRow:"row1"},
      {from:301,toRow:"row2"},
      {from:308,toRow:"row3"},
      {from:48,toRow:"row1"}
    ];
  }
  return [
    {from:304,to:308},
    {from:308,to:312},
    {from:312,toRow:"row1"},
    {from:301,toRow:"row2"},
    {from:305,toRow:"row3"},
    {from:309,toRow:"row4"},
    {from:48,toRow:"row1"}
  ];
}

function getStandardWires(q){
  const sp=SP[q];
  return [...commonPrimaryWires(q,sp), ...lowVoltageWires(q)];
}
