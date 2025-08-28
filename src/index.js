import * as o from "rxjs";
import {
  Subject as n,
  concatMap as i,
  map as r,
  delay as s,
  share as a,
} from "rxjs";

import Shape from "./Shape";
import ShapeRepository from "./ShapeRepository";

/** @type {Date} */
let now;
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
let T = !1;
const shapes = [...ShapeRepository.getRegisteredShapeNames()];
let x = 0;
let config = {
  headerWidth: 50,
  marginHorizontal: 5,
  marginVertical: 40,
  blockHeight: 50,
  shapeSize: 20,
  centerShapes: !1,
  autoExpandCanvasWidth: !1,
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
  maxPeriod: 1e4,
  tickPeriod: 1e3,
  symbolMap: {},
  guidelineColor: "gray",
  tickColor: "black",
  showTimeTicks: !0,
  addNavigationButtons: !1,
  maxLogLength: -1,
  DEBUG: !1,
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

const logEvent = (e, t) => {
    console.log(
      `%c${nowStr()}%c ${e}`,
      "color:black;background:skyblue;font-style:italic",
      t
    );
    const o = e.startsWith("Completed") ? "completed" : "";
    writeDivLog(e, o);
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

const I = (e, t) => e + Math.floor(Math.random() * (t - e + 1)),
  D = {};
let W = [],
  L = [];
function P(e, t) {
  const o = config.maxPeriod;
  t || (t = new Date());
  const n = (t - now) / o,
    i = canvas.width - config.headerWidth - 2 * config.marginHorizontal;
  return [
    config.headerWidth + config.marginHorizontal + n * i,
    config.marginVertical + e * config.blockHeight,
  ];
}
const j = { atEnd: !1, shouldIgnoreSymbols: !1 };
function B(e) {
  (e = { ...j, ...e }),
    config.DEBUG && logEvent(`drawObject ${JSON.stringify(e.obj)}`);
  const t = e.obj && "Array" === e.obj.__proto__.constructor.name,
    o = "boolean" == typeof e.obj,
    n = isFinite(e.obj) && !o;
  if (
    (config.DEBUG && logEvent(`  isArray=${t}, isNumber=${n}, isBoolean=${o}`),
    t)
  )
    return (
      e.obj.forEach((t) => {
        (e.obj = `${t}`), B(e), D[e.lineNr]++;
      }),
      void (D[e.lineNr] = 0)
    );
  o
    ? (e.text = e.obj ? "true" : "false")
    : n
    ? ((e.text = `${e.obj}`),
      x > 0 && !e.shouldIgnoreSymbols && (e.text = "" + (+e.text % x)))
    : (e.text = `${e.obj}`),
    N(e);
}
function N(e) {
  (e = { ...j, ...e }).time || (e.time = new Date());
  let [t, o] = P(e.lineNr, e.time);
  W.push(e),
    t <= config.headerWidth ||
      (D[e.lineNr] > 0 && (t += D[e.lineNr] * Shape.w),
      (e.x = t),
      (e.y = o),
      config.DEBUG &&
        logEvent(`drawText ${e.text} at lineNr ${e.lineNr} --\x3e [${t}/${o}]`),
      C(e),
      e.text.startsWith("Error") && z(t, o, "red"),
      e.text.startsWith("Complete") && z(t, o, "orange"),
      e.text.startsWith("Complete") ||
        e.text.startsWith("Error") ||
        0 !== D[e.lineNr] ||
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
      e.lineNr < lineCount &&
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
function C(e) {
  let t = e.shouldIgnoreSymbols
    ? new DrawingSymbol({ text: e.text })
    : drawingSymbolMap[e.text];
  if ((t || (t = new DrawingSymbol({ text: e.text })), t.useImage)) {
    const o = new Image(),
      n = config.centerShapes ? e.x - config.shapeSize / 2 : e.x;
    (o.onload = (t) =>
      ctx.drawImage(
        o,
        n,
        e.y - config.shapeSize - 1,
        config.shapeSize,
        config.shapeSize
      )),
      (o.src = t.imageUrl);
  } else if (t.useText) {
    const o = ctx.fillStyle;
    (ctx.fillStyle = t.color),
      ctx.fillText(t.text, e.x + 1, e.atEnd ? e.y + 15 : e.y - 2),
      (ctx.fillStyle = o);
  } else {
    const o = ShapeRepository.get(t.shape),
      n = config.centerShapes ? e.x - config.shapeSize / 2 : e.x;
    o && o.draw(ctx, n, e.y, t.color, t.strokeOnly);
  }
}
function z(e, t, o) {
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
function H(e) {
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
    config.addNavigationButtons && A(),
    e &&
      (function () {
        const e = 50,
          t = o.timer(0, e).subscribe((e) => {
            const o = V(),
              [n, i] = U(new Date()),
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
              let e = new Date().getSeconds();
              e < O && (e += 60),
                e >= O + config.tickPeriod / 1e3 &&
                  ((O = e % 60), R(new Date()));
            }
            T && t.unsubscribe(), i >= 0.995 && G && M(1e3);
          });
      })();
}
let O = -1;
function U(e) {
  const t = (e - now) / config.maxPeriod,
    o = canvas.width - config.headerWidth - 2 * config.marginHorizontal;
  return [config.headerWidth + config.marginHorizontal + t * o, t];
}
function V() {
  return (
    config.marginVertical +
    lineCount * config.blockHeight +
    0.4 * config.marginVertical
  );
}
function R(e) {
  const [t] = U(e);
  if ((L.push(e), t <= config.headerWidth)) return;
  ctx.font = "italic 9px sans-serif";
  const o = stringify(e).substr(3, 5);
  ctx.fillText(o, t - 12, V() + 9);
  const n = V(),
    i = ctx.lineWidth;
  ctx.beginPath(),
    ctx.moveTo(t, n),
    (ctx.strokeStyle = "orange"),
    (ctx.lineWidth = 2),
    ctx.lineTo(t, n - 3),
    ctx.stroke(),
    ctx.closePath(),
    (ctx.lineWidth = i),
    (ctx.font = config.font);
}
function M(e) {
  (now = new Date(now.getTime() + e)), H(!1);
  const t = [...W];
  (W = []), t.forEach((e) => N(e));
  const o = [...L];
  (L = []), o.forEach((e) => R(e));
}
let G = !0;
function A() {
  const e = 17;
  ctx.clearRect(0, canvas.height - e, 52, canvas.height);
  const t = ctx.strokeStyle,
    o = ctx.lineWidth,
    n = ctx.fillStyle,
    i = ctx.font;
  (ctx.fillStyle = "gray"),
    (ctx.strokeStyle = "black"),
    (ctx.font = "italic 24px sans-serif"),
    F("<", 1, e),
    F(G ? "x" : "o", 18, e, 2, 3),
    F(">", 35, e),
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
          ? (config.DEBUG && console.log("   back"), M(-1e3))
          : o < 34
          ? ((G = !G),
            config.DEBUG && console.log(`   toggleScrolling to ${G}`),
            A())
          : (config.DEBUG && console.log("   forth"), M(1e3)));
    });
}
function F(e, t, o, n = 0, i = 0) {
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
function _(e, t, o = !1, n) {
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
          B({ obj: i, lineNr: e, atEnd: !1, shouldIgnoreSymbols: o });
      },
      error: (o) => {
        logError(`Error ${t}`),
          N({ text: "Error;red", lineNr: e, atEnd: !0 }),
          e === lineCount && (T = !0);
      },
      complete: () => {
        logEvent(`Completed ${t}`),
          N({ text: "Complete;orange", lineNr: e, atEnd: !0 }),
          e === lineCount && (T = !0);
      },
    }
  );
}
const J = {};
function q(e, t = null, o = !1, n) {
  return (
    null === t && lineHeadings[e] && (t = lineHeadings[e]),
    null === t && (t = ""),
    (i) => (i.subscribe(_(e, t, o, n)), i)
  );
}
J.draw = q;
class DrawingSymbol {
  constructor(e) {
    (this.options = {
      text: "",
      color: "black",
      shape: "",
      imageUrl: "",
      strokeOnly: !1,
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
      (this.useShape = !1),
      (this.useText = !1),
      (this.useImage = this.imageUrl.length > 0),
      this.useImage ||
        (this.shape.length > 0 ? (this.useShape = !0) : (this.useText = !0));
  }
}
export default {
  init: function (e) {
    try {
      void 0 !== typeof document &&
        (canvas = document.getElementById(e.canvasId)),
        canvas ||
          (logError(
            "-------------------------------------------------------------"
          ),
          logError(
            `--- Cannot visualize - canvas with id '${e.canvasId}' not found ---`
          ),
          logError(
            "-------------------------------------------------------------"
          )),
        void 0 !== typeof document &&
          (logDiv = document.getElementById(e.logDivId)),
        logDiv ||
          (logError(
            "-------------------------------------------------------------"
          ),
          logError(
            `--- Cannot show logs - div with id '${e.logDivId}' not found ---`
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
      Object.keys(e)
        .filter((t) => e.hasOwnProperty(t))
        .filter((e) => !config.hasOwnProperty(e))
        .forEach((e) =>
          logError(`*** RxVis ***: Unknown option '${e}' will be ignored!`)
        ),
      (config = { ...config, ...e }),
      config.DEBUG &&
        Object.keys(config)
          .filter((e) => config.hasOwnProperty(e))
          .forEach((e) => logEvent(`RxVis '${e}' --\x3e ${config[e]}`)),
      (Shape.width = config.shapeSize),
      logEvent(
        `init with canvasId '${e.canvasId}' and logDivId '${e.logDivId}'`,
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
        (H(!1),
        (function () {
          logEvent("drawRegisteredShapes"), (now = new Date());
          const [e, t] = P(0),
            [, o] = P(1);
          let n = e;
          shapes.forEach((e, i) => {
            const r = config.colors[i % config.colors.length];
            ShapeRepository.get(e).draw(ctx, n, t, r),
              C({ text: e, x: n, y: t, atEnd: !0, shouldIgnoreSymbols: !0 }),
              ShapeRepository.get(e).draw(ctx, n, o, r, !0),
              (n += 3 * config.shapeSize);
          });
        })());
  },
  createStreamFromArrayRandom: function (e, t = 0, n = 500, l = 2e3) {
    return (
      t || (t = e.length),
      o.range(0, t).pipe(
        r((t) => I(0, e.length - 1)),
        r((t) => e[t]),
        i((e) => o.of(e).pipe(s(I(n, l)))),
        a()
      )
    );
  },
  createStreamFromArraySequence: function (e, t = 500, n = 2e3) {
    return o.range(0, e.length).pipe(
      r((t) => e[t]),
      i((e) => o.of(e).pipe(s(I(t, n)))),
      a()
    );
  },
  createStreamFromArrayOnClick: function (e, t, o, i) {
    const r = new n();
    return (
      document
        .getElementById(t)
        .addEventListener("click", (t) => r.next(e[I(0, e.length - 1)])),
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
  observerForLine: _,
  startVisualize: function () {
    logDiv && (logDiv.innerHTML = ""),
      (now = new Date()),
      (O = new Date().getSeconds()),
      (T = !1),
      H(!0),
      (W = []);
  },
  rnd: I,
  prepareCanvas: function (e) {
    (lineHeadings = e), (lineCount = lineHeadings.length - 1), H(!1);
  },
  writeToLine: function (e, t) {
    logEvent(t), N({ text: t, lineNr: e, atEnd: !0 });
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
  operators: J,
  DrawingSymbol: DrawingSymbol,
  draw: q,
};
