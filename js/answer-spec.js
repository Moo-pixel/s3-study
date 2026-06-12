// Canonical answer specification for the six station-3 questions.
// This file describes required exam wiring. Rendering and route picking are
// derived from this data, so missing-answer regressions can be tested here.

function W(id, section, from, to, desc, g=22){
  return {id, section, from, to, desc, g};
}

function D(id, section, from, to, desc, g=22){
  return {id, section, from, to, desc, g, direct:true};
}

function R(id, section, from, toRow, desc, g=22){
  return {id, section, from, toRow, desc, g};
}

const COMMON_PRIMARY_3P=[
  D("primary-a-hot-co","primary",1,104,"A相活線夾接至A相CO電源側"),
  D("primary-a-co-la","primary",104,10,"A相CO電源側分接至A相避雷器高壓端",14),
  D("primary-b-hot-co","primary",2,105,"B相活線夾接至B相CO電源側"),
  D("primary-b-co-la","primary",105,11,"B相CO電源側分接至B相避雷器高壓端",14),
  D("la-ground-a-b","la-ground",13,14,"A相避雷器接地端串接至B相避雷器接地端",14),
  D("primary-c-hot-co","primary",3,106,"C相活線夾接至C相CO電源側"),
  D("primary-c-co-la","primary",106,12,"C相CO電源側分接至C相避雷器高壓端",14),
  D("la-ground-b-c","la-ground",14,15,"B相避雷器接地端串接至C相避雷器接地端",14),
  D("la-ground-c-99","la-ground",15,99,"C相避雷器接地端引至LA接地口99",14)
];

const COMMON_PRIMARY_SINGLE_BUSHING=[
  D("primary-a-hot-co","primary",1,104,"A相活線夾接至A相CO電源側"),
  D("primary-a-co-la","primary",104,10,"A相CO電源側分接至A相避雷器高壓端",14),
  D("primary-c-hot-co","primary",3,106,"C相活線夾接至C相CO電源側"),
  D("primary-c-co-la","primary",106,12,"C相CO電源側分接至C相避雷器高壓端",14),
  D("la-ground-a-c","la-ground",13,15,"A相避雷器接地端串接至C相避雷器接地端",14),
  D("la-ground-c-99","la-ground",15,99,"C相避雷器接地端引至LA接地口99",14)
];

const GROUND_TWO_TR=[
  W("case-ground-tr1-tr2","case-ground",203,206,"TR1外殼G串接至TR2外殼G"),
  W("case-ground-tr2-45","case-ground",206,45,"TR2外殼G引至外殼接地口45")
];

const GROUND_THREE_TR=[
  W("case-ground-tr1-tr2","case-ground",203,206,"TR1外殼G串接至TR2外殼G"),
  W("case-ground-tr2-tr3","case-ground",206,209,"TR2外殼G串接至TR3外殼G"),
  W("case-ground-tr3-45","case-ground",209,45,"TR3外殼G引至外殼接地口45")
];

const ANSWER_SPECS={
  1:{
    name:"V-V 3φ3W 220V",
    wires:[
      ...COMMON_PRIMARY_3P,
      W("q1-co-a-h1","primary-load",107,201,"A相CO負載側接TR1 H1"),
      W("q1-co-b-h2","primary-load",108,202,"B相CO負載側接TR1 H2"),
      W("q1-h2-link","primary-load",202,204,"TR1 H2再分接至TR2 H1"),
      W("q1-co-c-h2","primary-load",109,205,"C相CO負載側接TR2 H2"),
      ...GROUND_TWO_TR,
      W("q1-low-common-link","low-voltage",304,305,"TR1 X4與TR2 X1短接成共用點"),
      R("q1-low-common-row","low-voltage",304,"row1","共用點引至被接地線"),
      R("q1-low-a-row","low-voltage",301,"row2","TR1 X1引至A相低壓線"),
      R("q1-low-b-row","low-voltage",308,"row3","TR2 X4引至B相低壓線"),
      R("q1-low-ground-row","low-voltage",48,"row1","被接地線引至系統接地口48")
    ]
  },
  2:{
    name:"V-V 3φ4W 110/220V",
    wires:[
      ...COMMON_PRIMARY_3P,
      W("q2-co-a-h1","primary-load",107,201,"A相CO負載側接TR1 H1"),
      W("q2-co-b-h2","primary-load",108,202,"B相CO負載側接TR1 H2"),
      W("q2-h2-link","primary-load",202,204,"TR1 H2再分接至TR2 H1"),
      W("q2-co-c-h2","primary-load",109,205,"C相CO負載側接TR2 H2"),
      ...GROUND_TWO_TR,
      W("q2-low-b-link","low-voltage",304,305,"TR1 X4與TR2 X1短接成B相輸出"),
      R("q2-low-neutral-row","low-voltage",303,"row1","工作中性點X2/X3引至被接地線"),
      R("q2-low-a-row","low-voltage",301,"row2","TR1 X1引至A相低壓線"),
      R("q2-low-b-row","low-voltage",305,"row3","TR2 X1與TR1 X4短接點引至B相低壓線"),
      R("q2-low-c-row","low-voltage",308,"row4","TR2 X4引至C相低壓線"),
      R("q2-low-ground-row","low-voltage",48,"row1","被接地線引至系統接地口48")
    ]
  },
  3:{
    name:"Delta-Delta 3φ3W 220V",
    wires:[
      ...COMMON_PRIMARY_3P,
      W("q3-co-a-h1","primary-load",107,201,"A相CO負載側接TR1 H1"),
      W("q3-co-b-h1","primary-load",108,204,"B相CO負載側接TR2 H1"),
      W("q3-co-c-h1","primary-load",109,207,"C相CO負載側接TR3 H1"),
      W("q3-delta-h-tr1-tr2","primary-load",202,204,"TR1 H2與TR2 H1高壓Delta跳線"),
      W("q3-delta-h-tr2-tr3","primary-load",205,207,"TR2 H2與TR3 H1高壓Delta跳線"),
      W("q3-delta-h-tr3-tr1","primary-load",208,201,"TR3 H2與TR1 H1高壓Delta跳線"),
      ...GROUND_THREE_TR,
      W("q3-low-delta-1","low-voltage",304,305,"TR1 X4與TR2 X1短接"),
      W("q3-low-delta-2","low-voltage",308,309,"TR2 X4與TR3 X1短接"),
      W("q3-low-delta-3","low-voltage",312,301,"TR3 X4與TR1 X1短接"),
      R("q3-low-grounded-vertex-row","low-voltage",301,"row1","Delta接地頂點引至被接地線"),
      R("q3-low-a-row","low-voltage",305,"row2","Delta A相輸出引至A相低壓線"),
      R("q3-low-b-row","low-voltage",309,"row3","Delta B相輸出引至B相低壓線"),
      R("q3-low-ground-row","low-voltage",48,"row1","被接地線引至系統接地口48")
    ]
  },
  4:{
    name:"Open-Y V 3φ4W 110/220V",
    wires:[
      ...COMMON_PRIMARY_SINGLE_BUSHING,
      W("q4-co-a-h1","primary-load",107,201,"A相CO負載側接TR1 H1"),
      W("q4-co-c-h1","primary-load",109,204,"C相CO負載側接TR2 H1"),
      W("q4-open-y-neutral-g","case-ground",203,206,"TR1外殼G與TR2外殼G互接成開Y中性點"),
      W("q4-case-ground-45","case-ground",206,45,"TR2外殼G引至外殼接地口45"),
      W("q4-low-b-link","low-voltage",304,305,"TR1 X4與TR2 X1短接成B相輸出"),
      R("q4-low-neutral-row","low-voltage",303,"row1","工作中性點X2/X3引至被接地線"),
      R("q4-low-a-row","low-voltage",301,"row2","TR1 X1引至A相低壓線"),
      R("q4-low-b-row","low-voltage",305,"row3","TR2 X1與TR1 X4短接點引至B相低壓線"),
      R("q4-low-c-row","low-voltage",308,"row4","TR2 X4引至C相低壓線"),
      R("q4-low-ground-row","low-voltage",48,"row1","被接地線引至系統接地口48")
    ]
  },
  5:{
    name:"Open-Y V 3φ3W 220V",
    wires:[
      ...COMMON_PRIMARY_SINGLE_BUSHING,
      W("q5-co-a-h1","primary-load",107,201,"A相CO負載側接TR1 H1"),
      W("q5-co-c-h1","primary-load",109,204,"C相CO負載側接TR2 H1"),
      W("q5-open-y-neutral-g","case-ground",203,206,"TR1外殼G與TR2外殼G互接成開Y中性點"),
      W("q5-case-ground-45","case-ground",206,45,"TR2外殼G引至外殼接地口45"),
      W("q5-low-common-link","low-voltage",304,305,"TR1 X4與TR2 X1短接成共用點"),
      R("q5-low-common-row","low-voltage",304,"row1","共用點引至被接地線"),
      R("q5-low-a-row","low-voltage",301,"row2","TR1 X1引至A相低壓線"),
      R("q5-low-b-row","low-voltage",308,"row3","TR2 X4引至B相低壓線"),
      R("q5-low-ground-row","low-voltage",48,"row1","被接地線引至系統接地口48")
    ]
  },
  6:{
    name:"Delta-Y 3φ4W 220/380V",
    wires:[
      ...COMMON_PRIMARY_3P,
      W("q6-co-a-h1","primary-load",107,201,"A相CO負載側接TR1 H1"),
      W("q6-co-b-h1","primary-load",108,204,"B相CO負載側接TR2 H1"),
      W("q6-co-c-h1","primary-load",109,207,"C相CO負載側接TR3 H1"),
      W("q6-delta-h-tr1-tr2","primary-load",202,204,"TR1 H2與TR2 H1高壓Delta跳線"),
      W("q6-delta-h-tr2-tr3","primary-load",205,207,"TR2 H2與TR3 H1高壓Delta跳線"),
      W("q6-delta-h-tr3-tr1","primary-load",208,201,"TR3 H2與TR1 H1高壓Delta跳線"),
      ...GROUND_THREE_TR,
      W("q6-low-y-neutral-1","low-voltage",304,308,"TR1 X4與TR2 X4串接成Y中性點"),
      W("q6-low-y-neutral-2","low-voltage",308,312,"TR2 X4與TR3 X4串接成Y中性點"),
      R("q6-low-neutral-row","low-voltage",312,"row1","Y中性點引至被接地線"),
      R("q6-low-a-row","low-voltage",301,"row2","TR1 X1引至A相低壓線"),
      R("q6-low-b-row","low-voltage",305,"row3","TR2 X1引至B相低壓線"),
      R("q6-low-c-row","low-voltage",309,"row4","TR3 X1引至C相低壓線"),
      R("q6-low-ground-row","low-voltage",48,"row1","被接地線引至系統接地口48")
    ]
  }
};

function getAnswerSpec(q){
  return ANSWER_SPECS[q];
}

function getAnswerWires(q){
  const spec=getAnswerSpec(q);
  return spec ? spec.wires.map(w=>({...w})) : [];
}

function getAnswerWireIds(q){
  return getAnswerWires(q).map(w=>w.id);
}
