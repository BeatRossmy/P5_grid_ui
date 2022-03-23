const colorMap = new Map();
// [def,200,50]
colorMap.set("Amber",[180,'#FFE082','#FFF8E1']);
colorMap.set("LightBlue",[180,'#81D4FA','#E1F5FE']);
colorMap.set("Red",[180,'#EF9A9A','#FFEBEE']);

function map_color (lev,tone) {
  let colors = colorMap.get(tone);
  let f = map(lev,0,15,0,colors.length-1);
  let a = Math.floor(f);
  let b = Math.ceil(f);
  let c = lerpColor(color(colors[a]),color(colors[b]),f-a); 
  return c;
}

function lin (v,a,b) {
  // v: [-1,1] -> b <> a <> b
  v = constrain(v,-1,1);
  if (v>=0) return map(v,0,1,a,b);
  return map(v,-1,0,b,a);
}

function get_dif (a,b) {
  let v = abs(a-b);
  if (a<0 && b<0) return -v;
  return v;
}

function round_0 (v) {
  if (v>=0) return floor(v);
  return ceil(v);
}
