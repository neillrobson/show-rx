import { Subject, concatMap, map, delay, share, timer, range, of } from "rxjs";

import config from "./config";
import globals from "./globals";
import { rnd, stringify, getDrawingCoords } from "./util";

import Logger from "./Logger";
import Shape from "./Shape";
import ShapeRepository from "./ShapeRepository";

/** @type {CanvasRenderingContext2D} */
let ctx;
/** @type {Record<string, DrawingSymbol>} */
let drawingSymbolMap;
/** @type {string[]} */
let lineHeadings = ["A", "B"];
let lineCount = lineHeadings.length - 1;
let hasTerminated = false;
const shapes = [...ShapeRepository.getRegisteredShapeNames()];
let autoSymbolCount = 0;

/** @type {Logger} */
let logger = new Logger();

const objCountPerLine = {};
let renderedTextConfigs = [];
/** @type {Date[]} */
let renderedDates = [];

const DRAW_CONFIG = { atEnd: false, shouldIgnoreSymbols: false };

function drawObject(objectConfig) {
  objectConfig = { ...DRAW_CONFIG, ...objectConfig };

  config.DEBUG &&
    logger.event(`drawObject ${JSON.stringify(objectConfig.obj)}`);

  const isArray = objectConfig.obj instanceof Array;
  const isBoolean = "boolean" == typeof objectConfig.obj;
  const isNumber = isFinite(objectConfig.obj) && !isBoolean;

  config.DEBUG &&
    logger.event(
      `  isArray=${isArray}, isNumber=${isNumber}, isBoolean=${isBoolean}`
    );

  if (isArray) {
    objectConfig.obj.forEach((t) => {
      objectConfig.obj = `${t}`;
      drawObject(objectConfig);
      objCountPerLine[objectConfig.lineNr]++;
    });

    objCountPerLine[objectConfig.lineNr] = 0;
  } else {
    if (isBoolean) {
      objectConfig.text = objectConfig.obj ? "true" : "false";
    } else if (
      isNumber &&
      autoSymbolCount > 0 &&
      !objectConfig.shouldIgnoreSymbols
    ) {
      objectConfig.text = `${objectConfig.obj % autoSymbolCount}`;
    } else {
      objectConfig.text = `${objectConfig.obj}`;
    }

    drawText(objectConfig);
  }
}

function drawText(textConfig) {
  textConfig = { ...DRAW_CONFIG, ...textConfig };
  textConfig.time ||= new Date();

  let [x, y] = getDrawingCoords(textConfig.lineNr, textConfig.time);

  renderedTextConfigs.push(textConfig);

  if (x <= config.headerWidth) return;

  if (objCountPerLine[textConfig.lineNr] > 0) {
    x += objCountPerLine[textConfig.lineNr] * Shape.w;
  }

  textConfig.x = x;
  textConfig.y = y;

  config.DEBUG &&
    logger.event(
      `drawText ${textConfig.text} at lineNr ${textConfig.lineNr} --\x3e [${x}/${y}]`
    );

  drawLabel(textConfig);
  textConfig.text.startsWith("Error") && drawTickMark(x, y, "red");
  textConfig.text.startsWith("Complete") && drawTickMark(x, y, "orange");

  if (
    textConfig.text.startsWith("Complete") ||
    textConfig.text.startsWith("Error") ||
    objCountPerLine[textConfig.lineNr] > 0
  ) {
    config.DEBUG &&
      logger.event(
        `line ${x}/${y} --\x3e ${x}/${
          config.marginVertical + 2 * config.blockHeight
        }`
      );

    const tickHeight = 6;

    ctx.beginPath();
    ctx.moveTo(x, y - tickHeight);
    ctx.lineTo(x, y + tickHeight);
    ctx.strokeStyle = config.tickColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  }

  if (textConfig.lineNr < lineCount) {
    config.DEBUG &&
      logger.event(
        `line ${x}/${y} --\x3e ${x}/${
          config.marginVertical + 2 * config.blockHeight
        }`
      );

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, config.marginVertical + lineCount * config.blockHeight);
    ctx.strokeStyle = config.guidelineColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.closePath();
    ctx.setLineDash([]);
  }
}

function drawLabel(labelConfig) {
  let symbol = drawingSymbolMap[labelConfig.text];

  if (!symbol || labelConfig.shouldIgnoreSymbols) {
    symbol = new DrawingSymbol({ text: labelConfig.text });
  }

  if (symbol.useImage) {
    const img = new Image();
    const x = config.centerShapes
      ? labelConfig.x - config.shapeSize / 2
      : labelConfig.x;

    img.onload = () =>
      ctx.drawImage(
        img,
        x,
        labelConfig.y - config.shapeSize - 1,
        config.shapeSize,
        config.shapeSize
      );
    img.src = symbol.imageUrl;
  } else if (symbol.useText) {
    const o = ctx.fillStyle;
    ctx.fillStyle = symbol.color;
    ctx.fillText(
      symbol.text,
      labelConfig.x + 1,
      labelConfig.atEnd ? labelConfig.y + 15 : labelConfig.y - 2
    );
    ctx.fillStyle = o;
  } else {
    const o = ShapeRepository.get(symbol.shape);
    const n = config.centerShapes
      ? labelConfig.x - config.shapeSize / 2
      : labelConfig.x;
    o?.draw(ctx, n, labelConfig.y, symbol.color, symbol.strokeOnly);
  }
}

function drawTickMark(x, y, color) {
  config.DEBUG &&
    logger.event(
      `line ${x}/${y} --\x3e ${x}/${
        config.marginVertical + 2 * config.blockHeight
      }`
    );

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 17);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.closePath();
}

function paint(drawTimeline) {
  if (!globals.canvas) return;
  config.autoExpandCanvasWidth &&
    (globals.canvas.width = window.innerWidth - 3 * config.marginHorizontal),
    (globals.canvas.height =
      (lineHeadings.length - 1) * config.blockHeight +
      2 * config.marginVertical),
    (ctx = globals.canvas.getContext("2d")),
    (globals.canvas.width = globals.canvas.width),
    (ctx.font = config.font);
  const t = lineCount + 1;
  ctx.beginPath();
  for (let e = 0; e < t; e++) {
    const t = config.marginVertical + e * config.blockHeight;
    ctx.moveTo(config.headerWidth, t),
      ctx.lineTo(globals.canvas.width - config.marginHorizontal, t),
      ctx.stroke(),
      ctx.fillText(lineHeadings[e] || "", config.marginHorizontal, t);
  }
  ctx.closePath(),
    ctx.fillText(
      "RxJsVisualizer@1.3.6",
      globals.canvas.width - 130,
      globals.canvas.height - 4
    ),
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
  const t = (e - globals.start) / config.maxPeriod,
    o = globals.canvas.width - config.headerWidth - 2 * config.marginHorizontal;
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
  (globals.start = new Date(globals.start.getTime() + durationMs)),
    paint(false);
  const textConfigs = [...renderedTextConfigs];
  (renderedTextConfigs = []), textConfigs.forEach((e) => drawText(e));
  const dates = [...renderedDates];
  (renderedDates = []), dates.forEach((e) => drawDate(e));
}

let autoScroll = true;
function drawNavigationButtons() {
  const e = 17;
  ctx.clearRect(0, globals.canvas.height - e, 52, globals.canvas.height);
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
    (globals.canvas.onclick = (t) => {
      const [o, n] = (function (e) {
        const t = globals.canvas.getBoundingClientRect(),
          o = e.clientX - t.left,
          n = e.clientY - t.top;
        return [o, n];
      })(t);
      n < globals.canvas.height - 1 - e ||
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
  const r = globals.canvas.height - 1;
  ctx.moveTo(t, r),
    ctx.lineTo(t, r - o),
    ctx.lineTo(t + o, r - o),
    ctx.lineTo(t + o, r),
    ctx.lineTo(t, r),
    ctx.closePath(),
    ctx.stroke(),
    ctx.fillText(e, t + n, globals.canvas.height - i);
}

function observerForLine(
  lineNr,
  lineLabel,
  shouldIgnoreSymbols = false,
  transform
) {
  if (lineNr > lineCount) {
    const t = `** RxVis **:lineNr ${lineNr} not valid - only ${lineCount} line${
      lineCount > 1 ? "s" : ""
    } configured`;
    throw (logger.error(t), t);
  }
  return (
    (objCountPerLine[lineNr] = 0),
    (lineLabel = lineLabel || ""),
    {
      next: (i) => {
        let r = `${i}`;
        "object" == typeof i && (r = JSON.stringify(i)),
          logger.event(`${lineLabel} ${r}`),
          "function" == typeof transform && (i = transform(i)),
          drawObject({
            obj: i,
            lineNr,
            atEnd: false,
            shouldIgnoreSymbols: shouldIgnoreSymbols,
          });
      },
      error: (o) => {
        logger.error(`Error ${lineLabel}`),
          drawText({ text: "Error;red", lineNr, atEnd: true }),
          lineNr === lineCount && (hasTerminated = true);
      },
      complete: () => {
        logger.event(`Completed ${lineLabel}`),
          drawText({ text: "Complete;orange", lineNr, atEnd: true }),
          lineNr === lineCount && (hasTerminated = true);
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
          logger.error(
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
        (globals.canvas = document.getElementById(initConfig.canvasId)),
        globals.canvas ||
          (logger.error(
            "-------------------------------------------------------------"
          ),
          logger.error(
            `--- Cannot visualize - canvas with id '${initConfig.canvasId}' not found ---`
          ),
          logger.error(
            "-------------------------------------------------------------"
          )),
        void 0 !== typeof document &&
          (logger.logDiv = document.getElementById(initConfig.logDivId)),
        logger.logDiv ||
          (logger.error(
            "-------------------------------------------------------------"
          ),
          logger.error(
            `--- Cannot show logs - div with id '${initConfig.logDivId}' not found ---`
          ),
          logger.error(
            "-------------------------------------------------------------"
          ));
    } catch (e) {
      console.error("document is not defined");
    }
    logger.event(
      "**********************************************",
      "color:blue"
    ),
      logger.event(
        "*****        RxJsVisualizer@1.3.6        *****",
        "color:blue"
      ),
      logger.event(
        "*****        © 2025 Neill Robson         *****",
        "color:blue"
      ),
      logger.event(
        "**********************************************",
        "color:blue"
      ),
      Object.keys(initConfig)
        .filter((t) => initConfig.hasOwnProperty(t))
        .filter((e) => !config.hasOwnProperty(e))
        .forEach((e) =>
          logger.error(`*** RxVis ***: Unknown option '${e}' will be ignored!`)
        ),
      Object.assign(config, initConfig),
      config.DEBUG &&
        Object.keys(config)
          .filter((e) => config.hasOwnProperty(e))
          .forEach((e) => logger.event(`RxVis '${e}' --\x3e ${config[e]}`)),
      (Shape.width = config.shapeSize),
      logger.event(
        `init with canvasId '${initConfig.canvasId}' and logDivId '${initConfig.logDivId}'`,
        "color:orange"
      ),
      logger.event(`shapes: ${JSON.stringify(shapes)}`, "color:orange"),
      logger.event(`colors: ${JSON.stringify(config.colors)}`, "color:orange"),
      config.maxLogLength > 0 &&
        logger.event(
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
      globals.canvas &&
        (paint(false),
        (function () {
          logger.event("drawRegisteredShapes"), (globals.start = new Date());
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
    logger.logDiv && (logger.logDiv.innerHTML = ""),
      (globals.start = new Date()),
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
    logger.event(t), drawText({ text: t, lineNr: e, atEnd: true });
  },
  useRandomSymbolsForNumbers: function (e = 100) {
    autoSymbolCount > 0 &&
      0 === e &&
      [...Array(autoSymbolCount).keys()].forEach(
        (e) => delete drawingSymbolMap[`${e}`]
      ),
      (autoSymbolCount = e),
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
