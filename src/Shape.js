export default class Shape {
  drawImpl() {
    console.error(
      `*** RxVis ***: method drawImpl not implemented for class ${this.__proto__.constructor.name}`
    );
  }

  draw(ctx, x, y, color, useStroke) {
    const oldFill = ctx.fillStyle,
      oldStroke = ctx.strokeStyle,
      oldLineWidth = ctx.lineWidth,
      drawType = useStroke ? "stroke" : "fill";
    (ctx[`${drawType}Style`] = color),
      ctx.beginPath(),
      this.drawImpl(ctx, x, y - 1, color),
      ctx.closePath(),
      ctx[drawType](),
      (ctx.fillStyle = oldFill),
      (ctx.strokeStyle = oldStroke),
      (ctx.lineWidth = oldLineWidth);
  }

  /**
   * @param {number} width
   */
  static set width(width) {
    Shape.w = width;
  }
}

Shape.w = 20;
