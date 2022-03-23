class UI_Element {
  constructor (x,y,w,h,m,o,c) {
    this.x = x;
    this.y = y;
    this.w = (w==undefined)?1:w;
    this.h = (h==undefined)?1:h;
    this.orientation = (o==undefined)?"v":o;
    this.colors = {low: 2, medium: 8, high: 13};
    this.color_scheme = (c==undefined)?"Amber":c;
    this.max = (m==undefined)?1:m;
    this.active = 0;
    this.value = 0;
    this.fade = undefined;
  }
  set_fading () {
    this.fade = {active: false, d: 0, speed: 0.3, target: 0};
  }
  on_element (x,y,z) {
    x -= this.x;
    y -= this.y;
    if (x>=0 && x<this.w && y>=0 && y<this.h) return x + y*this.w;
    else return -1;
  }
  do () {}
  handle (x,y,z) {
    let v = this.on_element(x,y);
    if (v>=0) {
      if (z==1) {
        this.value = v;
        if (this.do) this.do(v);
      }
      this.active = z;
    }
  }
  draw (b) {
    for (var x=0; x<this.w; x++) {
      for (var y=0; y<this.h; y++) {
        let i = x+y*this.w;
        let l = 2;
        if (Array.isArray(this.value)) l = (this.value[i]==0)?this.colors.low:this.colors.medium;
        else l = (i==this.value)?this.colors.medium:this.colors.low;
        b.set(this.x+x,this.y+y,map_color(l+this.active,this.color_scheme));
      }
    }
  }
}
