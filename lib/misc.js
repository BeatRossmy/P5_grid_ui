class RingBuffer {
  constructor (n) {
    this.values = [];
    for (let i=0; i<n; i++) this.values.push(0);
    this.write_index = 0;
  }
  write (v) {
    this.values[this.write_index] = v;
    this.write_index = (this.write_index+1)%this.values.length;
  }
  read (i) {
    let l = this.values.length;
    //i = (this.write_index+l-i)%l;
    i = (this.write_index+i)%l;
    return this.values[i];
  }
}

class PlayHead extends UI_Element {
  constructor(x,y,w,h,f,t) {
    super(x,y,w,h);
    this.fading = (f==true)?true:false;
    this.tail = (t==true)?true:false;
    this.last_values = new RingBuffer(3);
  }
  walk (v) {
    let n = (this.value + v) % this.w;
    if (floor(n) != floor(this.value)) {
      this.last_values.write(this.value);
    }
    this.value = n;
  }
  handle (x,y,z) {
    
  }
  draw (b) {
    let p = this.value - floor(this.value);
    let l = this.colors.high;
    if (this.fading) {
      //let p = this.value - floor(this.value);
      l = map(p,0,1,this.colors.high,((this.tail)?3:0));
    }
    l = map_color(l,this.color_scheme);
    let _x = floor(this.value)%this.w + this.x;
    let _y = floor(this.value/this.w) + this.y;
    b.set(_x,_y,l);
    // NEXT
    if (this.fading) {
      let n = (this.value+1)%this.w;
      //let _p = constrain(p,0.25,1);
      l = map(p,0,1,0,this.colors.high);
      l = map_color(l,this.color_scheme);
      _x = floor(n)%this.w + this.x;
      _y = floor(n/this.w) + this.y;
      b.set(_x,_y,l);
    }
    if (this.tail) {
      for (let i=0; i<3; i++) {
        let n = this.last_values.read(i);
        l = map(p,1,0,i,i+1);//this.colors.low;
        l = map_color(l,this.color_scheme);
        _x = floor(n)%this.w + this.x;
        _y = floor(n/this.w) + this.y;
        b.set(_x,_y,l);
      }
    }
  }
}
