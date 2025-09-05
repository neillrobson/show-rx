export default {
  /** @type {Date} */
  start: null,
  /** @type {CanvasRenderingContext2D} */
  ctx: null,
  /** @type {HTMLCanvasElement} */
  canvas: null,
  /** @type {Record<string, DrawingSymbol>} */
  drawingSymbolMap: {},
  /** @type {string[]} */
  lineHeadings: ["A", "B"],
  hasTerminated: false,
};
