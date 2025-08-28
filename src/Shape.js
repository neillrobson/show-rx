export default class Shape {
  drawImpl() {
    console.error(
      `*** RxVis ***: method drawImpl not implemented for class ${this.__proto__.constructor.name}`
    );
  }

  draw(e, t, o, n, i) {
    const r = e.fillStyle,
      l = e.strokeStyle,
      s = e.lineWidth,
      a = i ? "stroke" : "fill";
    (e[`${a}Style`] = n),
      e.beginPath(),
      this.drawImpl(e, t, o - 1, n),
      e.closePath(),
      e[a](),
      (e.fillStyle = r),
      (e.strokeStyle = l),
      (e.lineWidth = s);
  }

  static set width(e) {
    Shape.w = e;
  }
}

Shape.w = 20;
