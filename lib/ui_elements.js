const colorMap = new Map();
// [def,200,50]
colorMap.set("Amber",[180,'#FFE082','#FFF8E1']);
colorMap.set("LightBlue",[180,'#81D4FA','#E1F5FE']);
colorMap.set("Red",[180,'#EF9A9A','#FFEBEE']);

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

function map_color (lev,tone) {
  let colors = colorMap.get(tone);
  let f = map(lev,0,15,0,colors.length-1);
  let a = Math.floor(f);
  let b = Math.ceil(f);
  let c = lerpColor(color(colors[a]),color(colors[b]),f-a); 
  return c;
}

let col_range = ['#FFCA28','#FFD54F','#FFE082','#FFECB3','#FFF8E1'];
// l: 0-15
function get_color (lev,tone) {
  if (tone === undefined) tone = "amber";
  let a = color(col_range[Math.floor(map(lev,0,15,0,col_range.length-1))]);
  let b = color(grid.d);
  lev = lev/15;
  return lerpColor(b,a,lev*2);
}

function is_on_element(el,x,y) {
  x -= el.x;
  y -= el.y;
  if (x>=0 && x<el.w && y>=0 && y<el.h) return x + y*el.w;
  else return -1;
}

function handle(el,x,y,z) {
  let v = is_on_element(el,x,y);
  if (v>=0) {
    if (z==1) {
      el.v = v;
      if (el.do) el.do(v);
    }
    el.active = z;
  }
}

class Fader {
  constructor(x,y,l,o) {
    this.x = x;
    this.y = y;
    this.o = (o=="h")?"h":"v";
    this.w = (o=="h")?l:1;
    this.h = (o=="h")?1:l;
    this.fading = false;
    this.fade_speed = 0.3;
    this.fade = {active: false, d: 0, target: 0};
    this.v = 0;
    this.active = 0;
  }
  animate () {
    if (this.fade.active) {
      this.v += this.fade.d;
      if ((this.v>=this.fade.target && this.fade.d>0) || (this.v<=this.fade.target && this.fade.d<0)) {
        this.v = this.fade.target;
        this.fade = {active: false, d: 0, target: 0};
      }
    }
  }
  handle (x,y,z) {
    let v = is_on_element(this,x,y);
    if (v>=0) {
      v = (this.o=='h')?v:(this.h-v-1);
      if (z==1) {
        if (this.fading) this.fade = {active: true, d: Math.sign(v-this.v)*this.fade_speed, target: v};
        else this.v = v;
        if (this.do) this.do(v);
      }
      this.active = z;
    }
  }
  draw(b){
    for (let x=0; x<this.w; x++) {
      for (let y=this.h-1; y>=0; y--) {
        let v = x+(this.h-y-1);
        let l = (v <= this.v)?8:2;
        if (v == floor(this.v)) l = map(this.v-floor(this.v),0,1,13,8);
        else if (v == floor(this.v+1)) l = map(this.v-floor(this.v),0,1,2,13);
        b.set(this.x+x,this.y+y,map_color(l+this.active*2,"Amber"));  
      }
    }
  }
}

class BipolarFader {
  constructor(x,y,l,o) {
    this.x = x;
    this.y = y;
    this.o = (o=="h")?"h":"v";
    this.w = (o=="h")?l:1;
    this.h = (o=="h")?1:l;
    this.fading = false;
    this.fade_speed = 0.3
    this.fade = {active: false, d: 0, target: 0};
    this.v = 0;
    this.active = 0;
  }
  animate () {
    if (this.fade.active) {
      this.v += this.fade.d;
      if ((this.v>=this.fade.target && this.fade.d>0) || (this.v<=this.fade.target && this.fade.d<0)) {
        this.v = this.fade.target;
        this.fade = {active: false, d: 0, target: 0};
      }
    }
  }
  handle (x,y,z) {
    let v = is_on_element(this,x,y);
    if (v>=0) {
      v = (this.o=='h')?v:(this.h-v-1);
      v -= ((this.h>this.w)?this.h:this.w)/2;
      if (z==1) {
        if (this.fading) this.fade = {active: true, d: Math.sign(v-this.v)*this.fade_speed, target: v};
        else this.v = v;
        if (this.do) this.do(v);
      }
      this.active = z;
    }
  }
  draw(b){
    let m = (this.h>this.w)?this.h:this.w;
    for (let x=0; x<this.w; x++) {
      for (let y=this.h-1; y>=0; y--) {
        let v = x+(this.h-y-1)-(m/2);
        let l = ((v <= this.v && v>=0) || (v >= this.v && v<0))?8:2;
        if (v == round_0(this.v)) l = lin(get_dif(this.v,round_0(this.v)),13,8);
        else if (v == round_0(this.v)+Math.sign(this.v)) l = lin(get_dif(this.v,round_0(this.v)),2,13);
        b.set(this.x+x,this.y+y,map_color(l+this.active*2,"Amber"));  
      }
    }
  }
}

class Range {
  constructor(x,y,l,o) {
    this.x = x;
    this.y = y;
    this.o = (o=="h")?"h":"v";
    this.w = (o=="h")?l:1;
    this.h = (o=="h")?1:l;
    this.v = [0, l-1];
    this.active = 0;
  }
  animate () {}
  handle (x,y,z) {
    let v = is_on_element(this,x,y);
    if (v>=0) {
      v = (this.o=='h')?v:(this.h-v-1);
      
      let t = (abs(v-this.v[0])<abs(v-this.v[1]))?0:1;
      if (z==1) {
        this.v[t] = v;
        //if (this.do) this.do(v);
      }
      this.active = z;
    }
  }
  draw(b){
    for (let x=0; x<this.w; x++) {
      for (let y=this.h-1; y>=0; y--) {
        let v = x+(this.h-y-1);
        let l = (v <= this.v[1] && v>=this.v[0])?8:2;
        if (v==this.v[0] || v==this.v[1]) l = 13;
      b.set(this.x+x,this.y+y,map_color(l+this.active*2,"Amber"));  
      }
    }
  }
}

class RadioButton {
  constructor(x,y,l,o) {
    this.x = x;
    this.y = y;
    this.o = (o=="h")?"h":"v";
    this.w = (o=="h")?l:1;
    this.h = (o=="h")?1:l;
    this.v = 0;
    this.active = 0;
  }
  handle (x,y,z) {handle(this,x,y,z);}
  draw(b){
    let m = (this.o=="v")?this.h:this.w;
    for (var i=0; i<m; i++) {
      let x = (this.o=="v")?this.x:(this.x+i);
      let y = (this.o=="v")?(this.y+i):this.y;
      let l = (i == this.v)?8:2;
      b.set(x,y,map_color(l+this.active*2,"Amber"));
    }
  }
}

class Button {
  constructor(x,y,o) {
    this.x = x;
    this.y = y;
    this.o = (o=="h")?"h":"v";
    this.w = 1;
    this.h = 1;
    this.v = 0;
    this.active = 0;
  }
  handle(x,y,z) {
    let v = is_on_element(this,x,y);
    if (v>=0) {
      this.v = z;
      this.active = z;
    }
  }
  draw(b){
    let l = (this.v==1)?13:2;
    b.set(this.x,this.y,map_color(l+this.active,"Amber"));
  }
}

class CycleButton {
  constructor(x,y,m,o) {
    this.x = x;
    this.y = y;
    this.o = (o=="h")?"h":"v";
    this.w = 1;
    this.h = 1;
    this.v = 0;
    this.max = (m==undefined || m<2)?2:m;
    this.active = 0;
  }
  handle(x,y,z) {
    let v = is_on_element(this,x,y);
    if (v>=0) {
      if (z==1) this.v = (this.v+1)%this.max;
      this.active = z;
    }
  }
  draw(b){
    //let l = (this.v==1)?13:2;
    let l = floor(map(this.v,0,this.max-1,2,13));
    b.set(this.x,this.y,map_color(l+this.active,"Amber"));
  }
}

class ToggleButton {
  constructor(x,y,o) {
    this.x = x;
    this.y = y;
    this.o = (o=="h")?"h":"v";
    this.w = (o=="h")?2:1;
    this.h = (o=="h")?1:2;
    this.v = 0;
    this.active = 0;
  }
  handle(x,y,z) {
    let v = is_on_element(this,x,y);
    if (v>=0) {
      if (z==1) this.v = (this.v==0)?1:0;
      this.active = z;
    }
  }
  draw(b){
    let m = (this.o=="v")?this.h:this.w;
    for (var i=0; i<m; i++) {
      let x = (this.o=="v")?this.x:(this.x+i);
      let y = (this.o=="v")?(this.y+i):this.y;
      let l = (i == this.v)?8:2;
      b.set(x,y,map_color(l+this.active*2,"Amber"));
    }
  }
}

class Matrix {
  constructor(x,y,w,h,o) {
    this.x = x;
    this.y = y;
    this.o = (o=="h")?"h":"v";
    this.w = w;
    this.h = h;
    this.v = 0;
    this.active = 0;
  }
  handle (x,y,z) {handle(this,x,y,z);}
  draw(b){
    for (var x=0; x<this.w; x++) {
      for (var y=0; y<this.h; y++) {
        let l = (x+y*this.w==this.v)?8:2;
        let _x = this.x + x;
        let _y = this.y + y;
        b.set(_x,_y,map_color(l+this.active*2,"Amber"));
      }
    }
  }
}

class Keyboard {
  constructor(x,y) {
    this.mask = [[-1,1,3,-1,6,8,10,-1],[0,2,4,5,7,9,11,12]];
    this.x = x;
    this.y = y;
    this.v = 0;
    this.active = 0;
    this.do = undefined;
  }
  handle(x,y,z) {
    x -= this.x;
    y -= this.y;
    if (x>=0 && x<8 && y>=0 && y<2) {
      let v = this.mask[y][x];
      if (v>=0) {
        if (z==1) {
          this.v = v;
          if (this.do) this.do(v);
        }
        this.active = z;
      }
    }
  }
  draw(b){
    for (var x=0; x<8; x++) {
      for (var y=0; y<2; y++) {
        let v = this.mask[y][x];
        let l = (v%12==0)?13:8;
        if (v==this.v) l = 13;
        let _x = this.x + x;
        let _y = this.y + y;
        if (v>=0) 
          b.set(_x,_y,map_color(l+this.active*2,"Amber"));
      }
    }
  }
}

class DataArray {
  constructor (x,y,w,h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.v = new Array(w*h).fill(0);
    this.active = 0;
    this.pressed = -1;
  }
  handle (x,y,z) {
    x -= this.x;
    y -= this.y;
    if (x>=0 && x<this.w && y>=0 && y<this.h) {
      let i = x + y*this.w;
      if (z==1) {
        this.v[i] = (this.v[i]==0)?1:0;
        //if (this.do) this.do(v);
      }
      this.pressed = (z==1)?i:-1;
      this.active = z;
    }
  }
  draw (b) {
    for (let x=0; x<this.w; x++) {
      for (let y=0; y<this.h; y++) {
        let i = x+y*this.w;
        let l = (this.v[i]==0)?2:8;
        if (i==this.pressed) l = 13;
        let _x = this.x + x;
        let _y = this.y + y;
        b.set(_x,_y,map_color(l+this.active*2,"Amber"));
      }
    }
  }
}

class Container {
  constructor (x,y) {
    this.children = [];
    this.w = 0;
    this.h = 0;
    this.x = x;
    this.y = y;
    this.open = -1;
    this.v = 0;
    this.active = 0;
  }
  add (el) {
    if (el.x+el.w>this.w) this.w = el.x+el.w;
    if (el.y+el.h>this.h) this.h = el.y+el.h;
    this.children.push(el);
  }
  handle(x,y,z) {
    if (this.x==x && this.y==y && z==1) {
      this.v = (this.v==0)?1:0;
      this.open = (this.v==1)?millis():-1;
      this.active = z;
    }
    if (this.open>0 && x>=this.x+1 && x<this.x+this.w+1 && y>=this.y && y<this.y+this.h) {
      print("!");
      for (let i in this.children) this.children[i].handle(x-this.x-1,y-this.y,z);
    }
  }
  draw(b){
    let l = (this.v==1)?13:2;
    b.set(this.x,this.y,map_color(l+this.active,"Amber"));
    if (this.open>0) {
      let f = constrain(millis()-this.open,0,200);
      f = map(f,0,200,0,1);
      let _b = new GridBuffer(this.w,this.h);
      for (let i in this.children) this.children[i].draw(_b);
      _b.plotTo(b,this.x+1,this.y,this.w*f,this.h*f);
    }
  }
}

class ColorRange {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }
  handle(x,y,z) {}
  draw(b){
    for (var x=0; x<16; x++)
      b.set(this.x+x,this.y+y,map_color(x,"Amber"));
  }
}
