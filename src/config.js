export default {
  /** Horizontal space for timeline labels */
  headerWidth: 50,
  /** X-axis spacing per side */
  marginHorizontal: 5,
  /** Y-axis spacing per side */
  marginVertical: 40,
  blockHeight: 50,
  shapeSize: 20,
  centerShapes: false,
  autoExpandCanvasWidth: false,
  font: "italic 12px sans-serif",
  colors: [
    "white",
    "black",
    "red",
    "blue",
    "green",
    "cyan",
    "violet",
    "yellow",
    "darkgray",
  ],
  canvasId: "canvas",
  logDivId: "logs",
  /** Maximum period of the timeline (ms) */
  maxPeriod: 1e4,
  /** Period of tickmarks (ms) */
  tickPeriod: 1e3,
  symbolMap: {},
  guidelineColor: "gray",
  tickColor: "black",
  showTimeTicks: true,
  addNavigationButtons: false,
  maxLogLength: -1,
  DEBUG: false,
};
