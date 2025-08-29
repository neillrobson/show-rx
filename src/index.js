import { Subject, concatMap, map, delay, share, timer, range, of } from "rxjs";

import Shape from "./Shape";
import ShapeRepository from "./ShapeRepository";

/** @type {Date} */
let start;
/** @type {CanvasRenderingContext2D} */
let ctx;
/** @type {HTMLCanvasElement} */
let canvas;
/** @type {HTMLElement} */
let logDiv;
/** @type {Record<string, DrawingSymbol>} */
let drawingSymbolMap;
/** @type {string[]} */
let lineHeadings = ["A", "B"];
let lineCount = lineHeadings.length - 1;
let hasTerminated = false;
const shapes = [...ShapeRepository.getRegisteredShapeNames()];
let x = 0;
let config = {
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

function nowStr() {
  return stringify(new Date());
}
/**
 * @param {Date} date
 * @returns {string}
 */
function stringify(date) {
  const t = [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((e) => (e < 10 ? `0${e}` : `${e}`))
    .join(":");
  let ms = `${date.getMilliseconds()}`;
  return (ms = `.${"0".repeat(3 - ms.length)}${ms}`), `${t}${ms}`;
}

const logEvent = (text, format) => {
    console.log(
      `%c${nowStr()}%c ${text}`,
      "color:black;background:skyblue;font-style:italic",
      format
    );
    const extraClass = text.startsWith("Completed") ? "completed" : "";
    writeDivLog(text, extraClass);
  },
  logError = (e) => {
    const t = `${nowStr()}: ${e}`;
    console.error(t), writeDivLog(e, "error");
  };
function writeDivLog(msg, extraClass) {
  if (!logDiv) return;
  const clockEl = document.createElement("span");
  (clockEl.innerHTML = nowStr()), clockEl.classList.add("clock");
  const msgEl = document.createElement("span");
  config.maxLogLength > 0 &&
    msg.length > config.maxLogLength &&
    (msg = `${msg.substring(0, config.maxLogLength)}...`),
    (msgEl.innerHTML = msg),
    (msgEl.style.whiteSpace = "pre"),
    msgEl.classList.add("msg"),
    extraClass && msgEl.classList.add(extraClass);
  const item = document.createElement("div");
  item.appendChild(clockEl), item.appendChild(msgEl), logDiv.appendChild(item);
}

const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1)),
  D = {};
let renderedTextConfigs = [];
/** @type {Date[]} */
let renderedDates = [];
function getDrawingCoords(lineNum, now) {
  const o = config.maxPeriod;
  now || (now = new Date());
  const percentDone = (now - start) / o,
    bodyWidth = canvas.width - config.headerWidth - 2 * config.marginHorizontal;
  return [
    config.headerWidth + config.marginHorizontal + percentDone * bodyWidth,
    config.marginVertical + lineNum * config.blockHeight,
  ];
}
const DRAW_CONFIG = { atEnd: false, shouldIgnoreSymbols: false };
function drawObject(objectConfig) {
  (objectConfig = { ...DRAW_CONFIG, ...objectConfig }),
    config.DEBUG && logEvent(`drawObject ${JSON.stringify(objectConfig.obj)}`);
  const t =
      objectConfig.obj &&
      "Array" === objectConfig.obj.__proto__.constructor.name,
    o = "boolean" == typeof objectConfig.obj,
    n = isFinite(objectConfig.obj) && !o;
  if (
    (config.DEBUG && logEvent(`  isArray=${t}, isNumber=${n}, isBoolean=${o}`),
    t)
  )
    return (
      objectConfig.obj.forEach((t) => {
        (objectConfig.obj = `${t}`),
          drawObject(objectConfig),
          D[objectConfig.lineNr]++;
      }),
      void (D[objectConfig.lineNr] = 0)
    );
  o
    ? (objectConfig.text = objectConfig.obj ? "true" : "false")
    : n
    ? ((objectConfig.text = `${objectConfig.obj}`),
      x > 0 &&
        !objectConfig.shouldIgnoreSymbols &&
        (objectConfig.text = "" + (+objectConfig.text % x)))
    : (objectConfig.text = `${objectConfig.obj}`),
    drawText(objectConfig);
}
function drawText(textConfig) {
  (textConfig = { ...DRAW_CONFIG, ...textConfig }).time ||
    (textConfig.time = new Date());
  let [t, o] = getDrawingCoords(textConfig.lineNr, textConfig.time);
  renderedTextConfigs.push(textConfig),
    t <= config.headerWidth ||
      (D[textConfig.lineNr] > 0 && (t += D[textConfig.lineNr] * Shape.w),
      (textConfig.x = t),
      (textConfig.y = o),
      config.DEBUG &&
        logEvent(
          `drawText ${textConfig.text} at lineNr ${textConfig.lineNr} --\x3e [${t}/${o}]`
        ),
      drawLabel(textConfig),
      textConfig.text.startsWith("Error") && drawTickMark(t, o, "red"),
      textConfig.text.startsWith("Complete") && drawTickMark(t, o, "orange"),
      textConfig.text.startsWith("Complete") ||
        textConfig.text.startsWith("Error") ||
        0 !== D[textConfig.lineNr] ||
        (function (e, t) {
          config.DEBUG &&
            logEvent(
              `line ${e}/${t} --\x3e ${e}/${
                config.marginVertical + 2 * config.blockHeight
              }`
            );
          const o = 6;
          ctx.beginPath(),
            ctx.moveTo(e, t - o),
            ctx.lineTo(e, t + o),
            (ctx.strokeStyle = config.tickColor),
            (ctx.lineWidth = 1),
            ctx.stroke(),
            ctx.closePath();
        })(t, o),
      textConfig.lineNr < lineCount &&
        (function (e, t) {
          config.DEBUG &&
            logEvent(
              `line ${e}/${t} --\x3e ${e}/${
                config.marginVertical + 2 * config.blockHeight
              }`
            );
          ctx.beginPath(),
            ctx.moveTo(e, t),
            ctx.lineTo(
              e,
              config.marginVertical + lineCount * config.blockHeight
            ),
            (ctx.strokeStyle = config.guidelineColor),
            (ctx.lineWidth = 1),
            ctx.setLineDash([3, 3]),
            ctx.stroke(),
            ctx.closePath(),
            ctx.setLineDash([]);
        })(t, o));
}
function drawLabel(labelConfig) {
  let symbol = labelConfig.shouldIgnoreSymbols
    ? new DrawingSymbol({ text: labelConfig.text })
    : drawingSymbolMap[labelConfig.text];
  if (
    (symbol || (symbol = new DrawingSymbol({ text: labelConfig.text })),
    symbol.useImage)
  ) {
    const img = new Image(),
      x = config.centerShapes
        ? labelConfig.x - config.shapeSize / 2
        : labelConfig.x;
    (img.onload = (t) =>
      ctx.drawImage(
        img,
        x,
        labelConfig.y - config.shapeSize - 1,
        config.shapeSize,
        config.shapeSize
      )),
      (img.src = symbol.imageUrl);
  } else if (symbol.useText) {
    const o = ctx.fillStyle;
    (ctx.fillStyle = symbol.color),
      ctx.fillText(
        symbol.text,
        labelConfig.x + 1,
        labelConfig.atEnd ? labelConfig.y + 15 : labelConfig.y - 2
      ),
      (ctx.fillStyle = o);
  } else {
    const o = ShapeRepository.get(symbol.shape),
      n = config.centerShapes
        ? labelConfig.x - config.shapeSize / 2
        : labelConfig.x;
    o && o.draw(ctx, n, labelConfig.y, symbol.color, symbol.strokeOnly);
  }
}
function drawTickMark(e, t, o) {
  config.DEBUG &&
    logEvent(
      `line ${e}/${t} --\x3e ${e}/${
        config.marginVertical + 2 * config.blockHeight
      }`
    ),
    ctx.beginPath(),
    ctx.moveTo(e, t),
    ctx.lineTo(e, t + 17),
    (ctx.strokeStyle = o),
    (ctx.lineWidth = 1),
    ctx.stroke(),
    ctx.closePath();
}
function paint(drawTimeline) {
  if (!canvas) return;
  config.autoExpandCanvasWidth &&
    (canvas.width = window.innerWidth - 3 * config.marginHorizontal),
    (canvas.height =
      (lineHeadings.length - 1) * config.blockHeight +
      2 * config.marginVertical),
    (ctx = canvas.getContext("2d")),
    (canvas.width = canvas.width),
    (ctx.font = config.font);
  const t = lineCount + 1;
  ctx.beginPath();
  for (let e = 0; e < t; e++) {
    const t = config.marginVertical + e * config.blockHeight;
    ctx.moveTo(config.headerWidth, t),
      ctx.lineTo(canvas.width - config.marginHorizontal, t),
      ctx.stroke(),
      ctx.fillText(lineHeadings[e] || "", config.marginHorizontal, t);
  }
  ctx.closePath(),
    ctx.fillText("RxJsVisualizer@1.3.6", canvas.width - 130, canvas.height - 4),
    config.addNavigationButtons && drawNavigationButtons(),
    drawTimeline &&
      (function () {
        const e = 50,
          t = timer(0, e).subscribe(() => {
            const o = getDateAbsoluteY(),
              [n, i] = getDatePosition(new Date()),
              r = ctx.lineWidth;
            if (
              (ctx.beginPath(),
              ctx.moveTo(config.headerWidth, o),
              (ctx.strokeStyle = "orange"),
              (ctx.lineWidth = 2),
              ctx.lineTo(n, o),
              ctx.stroke(),
              ctx.closePath(),
              (ctx.lineWidth = r),
              config.showTimeTicks)
            ) {
              let currentSeconds = new Date().getSeconds();
              currentSeconds < lastTickSecond && (currentSeconds += 60),
                currentSeconds >= lastTickSecond + config.tickPeriod / 1e3 &&
                  ((lastTickSecond = currentSeconds % 60),
                  drawDate(new Date()));
            }
            hasTerminated && t.unsubscribe(),
              i >= 0.995 && autoScroll && shiftViewport(1e3);
          });
      })();
}
let lastTickSecond = -1;
function getDatePosition(e) {
  const t = (e - start) / config.maxPeriod,
    o = canvas.width - config.headerWidth - 2 * config.marginHorizontal;
  return [config.headerWidth + config.marginHorizontal + t * o, t];
}
function getDateAbsoluteY() {
  return (
    config.marginVertical +
    lineCount * config.blockHeight +
    0.4 * config.marginVertical
  );
}
function drawDate(date) {
  const [x] = getDatePosition(date);
  if ((renderedDates.push(date), x <= config.headerWidth)) return;
  ctx.font = "italic 9px sans-serif";
  const text = stringify(date).substr(3, 5);
  ctx.fillText(text, x - 12, getDateAbsoluteY() + 9);
  const y = getDateAbsoluteY(),
    oldLineWidth = ctx.lineWidth;
  ctx.beginPath(),
    ctx.moveTo(x, y),
    (ctx.strokeStyle = "orange"),
    (ctx.lineWidth = 2),
    ctx.lineTo(x, y - 3),
    ctx.stroke(),
    ctx.closePath(),
    (ctx.lineWidth = oldLineWidth),
    (ctx.font = config.font);
}
function shiftViewport(durationMs) {
  (start = new Date(start.getTime() + durationMs)), paint(false);
  const textConfigs = [...renderedTextConfigs];
  (renderedTextConfigs = []), textConfigs.forEach((e) => drawText(e));
  const dates = [...renderedDates];
  (renderedDates = []), dates.forEach((e) => drawDate(e));
}

let autoScroll = true;
function drawNavigationButtons() {
  const e = 17;
  ctx.clearRect(0, canvas.height - e, 52, canvas.height);
  const t = ctx.strokeStyle,
    o = ctx.lineWidth,
    n = ctx.fillStyle,
    i = ctx.font;
  (ctx.fillStyle = "gray"),
    (ctx.strokeStyle = "black"),
    (ctx.font = "italic 24px sans-serif"),
    drawNavigationButton("<", 1, e),
    drawNavigationButton(autoScroll ? "x" : "o", 18, e, 2, 3),
    drawNavigationButton(">", 35, e),
    (ctx.font = i),
    (ctx.fillStyle = n),
    (ctx.strokeStyle = t),
    (ctx.lineWidth = o),
    (canvas.onclick = (t) => {
      const [o, n] = (function (e) {
        const t = canvas.getBoundingClientRect(),
          o = e.clientX - t.left,
          n = e.clientY - t.top;
        return [o, n];
      })(t);
      n < canvas.height - 1 - e ||
        o > 52 ||
        (o < e
          ? (config.DEBUG && console.log("   back"), shiftViewport(-1e3))
          : o < 34
          ? ((autoScroll = !autoScroll),
            config.DEBUG && console.log(`   toggleScrolling to ${autoScroll}`),
            drawNavigationButtons())
          : (config.DEBUG && console.log("   forth"), shiftViewport(1e3)));
    });
}
function drawNavigationButton(e, t, o, n = 0, i = 0) {
  ctx.beginPath();
  const r = canvas.height - 1;
  ctx.moveTo(t, r),
    ctx.lineTo(t, r - o),
    ctx.lineTo(t + o, r - o),
    ctx.lineTo(t + o, r),
    ctx.lineTo(t, r),
    ctx.closePath(),
    ctx.stroke(),
    ctx.fillText(e, t + n, canvas.height - i);
}

function observerForLine(e, t, o = false, n) {
  if (e > lineCount) {
    const t = `** RxVis **:lineNr ${e} not valid - only ${lineCount} line${
      lineCount > 1 ? "s" : ""
    } configured`;
    throw (logError(t), t);
  }
  return (
    (D[e] = 0),
    (t = t || ""),
    {
      next: (i) => {
        let r = `${i}`;
        "object" == typeof i && (r = JSON.stringify(i)),
          logEvent(`${t} ${r}`),
          "function" == typeof n && (i = n(i)),
          drawObject({
            obj: i,
            lineNr: e,
            atEnd: false,
            shouldIgnoreSymbols: o,
          });
      },
      error: (o) => {
        logError(`Error ${t}`),
          drawText({ text: "Error;red", lineNr: e, atEnd: true }),
          e === lineCount && (hasTerminated = true);
      },
      complete: () => {
        logEvent(`Completed ${t}`),
          drawText({ text: "Complete;orange", lineNr: e, atEnd: true }),
          e === lineCount && (hasTerminated = true);
      },
    }
  );
}
const operators = {};
function draw(e, t = null, o = false, n) {
  return (
    null === t && lineHeadings[e] && (t = lineHeadings[e]),
    null === t && (t = ""),
    (i) => (i.subscribe(observerForLine(e, t, o, n)), i)
  );
}
operators.draw = draw;
class DrawingSymbol {
  constructor(e) {
    (this.options = {
      text: "",
      color: "black",
      shape: "",
      imageUrl: "",
      strokeOnly: false,
    }),
      Object.keys(e)
        .filter((t) => e.hasOwnProperty(t))
        .filter((e) => !this.options.hasOwnProperty(e))
        .forEach((e) =>
          logError(
            `*** DrawingSymbol ***: Unknown option '${e}' will be ignored!`
          )
        ),
      (this.options = { ...this.options, ...e }),
      (this.text = `${this.options.text}`.trim()),
      (this.color = this.options.color.trim()),
      (this.shape = this.options.shape.trim()),
      (this.imageUrl = this.options.imageUrl.trim()),
      (this.strokeOnly = this.options.strokeOnly),
      (this.useShape = false),
      (this.useText = false),
      (this.useImage = this.imageUrl.length > 0),
      this.useImage ||
        (this.shape.length > 0
          ? (this.useShape = true)
          : (this.useText = true));
  }
}
export default {
  init: function (initConfig) {
    try {
      void 0 !== typeof document &&
        (canvas = document.getElementById(initConfig.canvasId)),
        canvas ||
          (logError(
            "-------------------------------------------------------------"
          ),
          logError(
            `--- Cannot visualize - canvas with id '${initConfig.canvasId}' not found ---`
          ),
          logError(
            "-------------------------------------------------------------"
          )),
        void 0 !== typeof document &&
          (logDiv = document.getElementById(initConfig.logDivId)),
        logDiv ||
          (logError(
            "-------------------------------------------------------------"
          ),
          logError(
            `--- Cannot show logs - div with id '${initConfig.logDivId}' not found ---`
          ),
          logError(
            "-------------------------------------------------------------"
          ));
    } catch (e) {
      console.error("document is not defined");
    }
    logEvent("**********************************************", "color:blue"),
      logEvent("*****        RxJsVisualizer@1.3.6        *****", "color:blue"),
      logEvent("*****   © Robert Grueneis (2022-03-16)   *****", "color:blue"),
      logEvent("**********************************************", "color:blue"),
      Object.keys(initConfig)
        .filter((t) => initConfig.hasOwnProperty(t))
        .filter((e) => !config.hasOwnProperty(e))
        .forEach((e) =>
          logError(`*** RxVis ***: Unknown option '${e}' will be ignored!`)
        ),
      (config = { ...config, ...initConfig }),
      config.DEBUG &&
        Object.keys(config)
          .filter((e) => config.hasOwnProperty(e))
          .forEach((e) => logEvent(`RxVis '${e}' --\x3e ${config[e]}`)),
      (Shape.width = config.shapeSize),
      logEvent(
        `init with canvasId '${initConfig.canvasId}' and logDivId '${initConfig.logDivId}'`,
        "color:orange"
      ),
      logEvent(`shapes: ${JSON.stringify(shapes)}`, "color:orange"),
      logEvent(`colors: ${JSON.stringify(config.colors)}`, "color:orange"),
      config.maxLogLength > 0 &&
        logEvent(
          `limit log strings to ${config.maxLogLength} characters`,
          "color:orange"
        ),
      (drawingSymbolMap = { ...config.symbolMap }),
      (drawingSymbolMap["Error;red"] = new DrawingSymbol({
        text: "Error",
        color: "red",
      })),
      (drawingSymbolMap["Complete;orange"] = new DrawingSymbol({
        text: "Complete",
        color: "orange",
      })),
      canvas &&
        (paint(false),
        (function () {
          logEvent("drawRegisteredShapes"), (start = new Date());
          const [x0, y0] = getDrawingCoords(0),
            [, y1] = getDrawingCoords(1);
          let x = x0;
          shapes.forEach((name, i) => {
            const color = config.colors[i % config.colors.length];
            ShapeRepository.get(name).draw(ctx, x, y0, color),
              drawLabel({
                text: name,
                x: x,
                y: y0,
                atEnd: true,
                shouldIgnoreSymbols: true,
              }),
              ShapeRepository.get(name).draw(ctx, x, y1, color, true),
              (x += 3 * config.shapeSize);
          });
        })());
  },
  createStreamFromArrayRandom: function (e, t = 0, n = 500, l = 2e3) {
    return (
      t || (t = e.length),
      range(0, t).pipe(
        map((t) => rnd(0, e.length - 1)),
        map((t) => e[t]),
        concatMap((e) => of(e).pipe(delay(rnd(n, l)))),
        share()
      )
    );
  },
  createStreamFromArraySequence: function (e, t = 500, n = 2e3) {
    return range(0, e.length).pipe(
      map((t) => e[t]),
      concatMap((e) => of(e).pipe(delay(rnd(t, n)))),
      share()
    );
  },
  createStreamFromArrayOnClick: function (e, t, o, i) {
    const r = new Subject();
    return (
      document
        .getElementById(t)
        .addEventListener("click", (t) => r.next(e[rnd(0, e.length - 1)])),
      document.getElementById(o).addEventListener("click", (e) => r.complete()),
      document.getElementById(i) &&
        document
          .getElementById(i)
          .addEventListener("click", (e) => r.error("Error")),
      r.asObservable()
    );
  },
  createStreamFromSubjectOnClick: function (e, t, o, n) {
    let i = 0;
    return (
      document.getElementById(t).addEventListener("click", (t) => e.next(i++)),
      document.getElementById(o).addEventListener("click", (t) => e.complete()),
      document
        .getElementById(n)
        .addEventListener("click", (t) => e.error("Error")),
      e.asObservable()
    );
  },
  observerForLine,
  startVisualize: function () {
    logDiv && (logDiv.innerHTML = ""),
      (start = new Date()),
      (lastTickSecond = new Date().getSeconds()),
      (hasTerminated = false),
      paint(true),
      (renderedTextConfigs = []);
  },
  rnd,
  prepareCanvas: function (e) {
    (lineHeadings = e), (lineCount = lineHeadings.length - 1), paint(false);
  },
  writeToLine: function (e, t) {
    logEvent(t), drawText({ text: t, lineNr: e, atEnd: true });
  },
  useRandomSymbolsForNumbers: function (e = 100) {
    x > 0 &&
      0 === e &&
      [...Array(x).keys()].forEach((e) => delete drawingSymbolMap[`${e}`]),
      (x = e),
      [...Array(e).keys()].forEach((e) => {
        drawingSymbolMap[`${e}`] = new DrawingSymbol({
          text: `${e}`,
          color: config.colors[e % config.colors.length],
          shape: shapes[e % shapes.length],
        });
      });
  },
  operators,
  DrawingSymbol,
  draw,
};
