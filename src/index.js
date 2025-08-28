import * as o from "rxjs";
import {
  Subject as n,
  concatMap as i,
  map as r,
  delay as s,
  share as a,
} from "rxjs";

class c {
  static register(e, t) {
    c.flyweights || (c.flyweights = new Map()),
      !c.flyweights.has(e) && t instanceof d && c.flyweights.set(e, t);
  }
  static get(e) {
    return c.flyweights.has(e)
      ? this.flyweights.get(e)
      : (console.error(`No shape '${e}' registered in ShapeFactory!`), null);
  }
  static getRegisteredShapeNames() {
    return [...c.flyweights.keys()];
  }
}
class d {
  drawImpl(e, t, o) {
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
    d.w = e;
  }
}
d.w = 20;
c.register(
  "circle",
  new (class extends d {
    drawImpl(e, t, o) {
      const n = d.w / 2;
      e.arc(t + n, o - n, n, 0, 2 * Math.PI, !1);
    }
  })()
);
c.register(
  "square",
  new (class extends d {
    drawImpl(e, t, o) {
      e.moveTo(t, o),
        e.lineTo(t, o - d.w),
        e.lineTo(t + d.w, o - d.w),
        e.lineTo(t + d.w, o),
        e.lineTo(t, o);
    }
  })()
);
c.register(
  "triangle",
  new (class extends d {
    drawImpl(e, t, o) {
      e.moveTo(t, o),
        e.lineTo(t + d.w / 2, o - d.w),
        e.lineTo(t + d.w, o),
        e.lineTo(t, o);
    }
  })()
);
c.register(
  "diamond",
  new (class extends d {
    drawImpl(e, t, o) {
      e.moveTo(t, o - d.w / 2),
        e.lineTo(t + d.w / 2, o - d.w),
        e.lineTo(t + d.w, o - d.w / 2),
        e.lineTo(t + d.w / 2, o),
        e.lineTo(t, o - d.w / 2);
    }
  })()
);
c.register(
  "cross",
  new (class extends d {
    drawImpl(e, t, o) {
      const n = d.w / 3;
      e.moveTo(t, o - n),
        e.lineTo(t, o - 2 * n),
        e.lineTo(t + n, o - 2 * n),
        e.lineTo(t + n, o - d.w),
        e.lineTo(t + 2 * n, o - d.w),
        e.lineTo(t + 2 * n, o - 2 * n),
        e.lineTo(t + d.w, o - 2 * n),
        e.lineTo(t + d.w, o - n),
        e.lineTo(t + 2 * n, o - n),
        e.lineTo(t + 2 * n, o),
        e.lineTo(t + n, o),
        e.lineTo(t + n, o - n),
        e.lineTo(t, o - n);
    }
  })()
);
c.register(
  "rhombus",
  new (class extends d {
    drawImpl(e, t, o) {
      e.moveTo(t, o),
        e.lineTo(t + d.w / 2, o - d.w),
        e.lineTo(t + d.w + d.w / 2, o - d.w),
        e.lineTo(t + d.w, o),
        e.lineTo(t, o);
    }
  })()
);
c.register(
  "octagon",
  new (class extends d {
    drawImpl(e, t, o) {
      const n = d.w / (1 + Math.sqrt(2)),
        i = d.w / 2;
      e.moveTo(t + i - n / 2, o),
        e.lineTo(t, o - i + n / 2),
        e.lineTo(t, o - i - n / 2),
        e.lineTo(t + i - n / 2, o - d.w),
        e.lineTo(t + i + n / 2, o - d.w),
        e.lineTo(t + d.w, o - i - n / 2),
        e.lineTo(t + d.w, o - i + n / 2),
        e.lineTo(t + i + n / 2, o),
        e.lineTo(t + i - n / 2, o);
    }
  })()
);
c.register(
  "kite",
  new (class extends d {
    drawImpl(e, t, o) {
      e.moveTo(t + d.w / 2, o),
        e.lineTo(t, o - 0.75 * d.w),
        e.lineTo(t + d.w / 2, o - d.w),
        e.lineTo(t + d.w, o - 0.75 * d.w),
        e.lineTo(t + d.w / 2, o);
    }
  })()
);
c.register(
  "x",
  new (class extends d {
    drawImpl(e, t, o) {
      const n = d.w / 5;
      e.moveTo(t, o - n),
        e.lineTo(t + d.w / 2 - n, o - d.w / 2),
        e.lineTo(t, o - d.w + n),
        e.lineTo(t + n, o - d.w),
        e.lineTo(t + d.w / 2, o - d.w / 2 - n),
        e.lineTo(t + d.w - n, o - d.w),
        e.lineTo(t + d.w, o - d.w + n),
        e.lineTo(t + d.w / 2 + n, o - d.w / 2),
        e.lineTo(t + d.w, o - n),
        e.lineTo(t + d.w - n, o),
        e.lineTo(t + d.w / 2, o - d.w / 2 + n),
        e.lineTo(t + n, o),
        e.lineTo(t, o - n);
    }
  })()
);
c.register(
  "mushroom",
  new (class extends d {
    drawImpl(e, t, o) {
      const n = d.w / 3,
        i = d.w / 2;
      e.moveTo(t + n, o),
        e.lineTo(t + n, o - d.w / 2),
        e.lineTo(t + 2 * n, o - d.w / 2),
        e.lineTo(t + 2 * n, o),
        e.lineTo(t + n, o),
        e.moveTo(t + n, o - d.w / 2),
        e.arc(t + i, o - i, i, 0, Math.PI, !0);
    }
  })()
);
let h, g;
c.register(
  "star",
  new (class extends d {
    drawImpl(e, t, o) {
      const n = d.w / 6,
        i = d.w / 2;
      e.moveTo(t + i, o),
        e.lineTo(t + i - n, o - i + n),
        e.lineTo(t, o - i),
        e.lineTo(t + i - n, o - i - n),
        e.lineTo(t + i, o - d.w),
        e.lineTo(t + i + n, o - i - n),
        e.lineTo(t + d.w, o - i),
        e.lineTo(t + i + n, o - i + n),
        e.lineTo(t + i, o);
    }
  })()
);
let w,
  m,
  u,
  p = ["A", "B"],
  f = p.length - 1,
  T = !1;
const y = [...c.getRegisteredShapeNames()];
let x = 0,
  b = {
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
function k() {
  return $(new Date());
}
function $(e) {
  const t = [e.getHours(), e.getMinutes(), e.getSeconds()]
    .map((e) => (e < 10 ? `0${e}` : `${e}`))
    .join(":");
  let o = `${e.getMilliseconds()}`;
  return (o = `.${"0".repeat(3 - o.length)}${o}`), `${t}${o}`;
}
const S = (e, t) => {
    console.log(
      `%c${k()}%c ${e}`,
      "color:black;background:skyblue;font-style:italic",
      t
    );
    const o = e.startsWith("Completed") ? "completed" : "";
    v(e, o);
  },
  E = (e) => {
    const t = `${k()}: ${e}`;
    console.error(t), v(e, "error");
  };
function v(e, t) {
  if (!m) return;
  const o = document.createElement("span");
  (o.innerHTML = k()), o.classList.add("clock");
  const n = document.createElement("span");
  b.maxLogLength > 0 &&
    e.length > b.maxLogLength &&
    (e = `${e.substring(0, b.maxLogLength)}...`),
    (n.innerHTML = e),
    (n.style.whiteSpace = "pre"),
    n.classList.add("msg"),
    t && n.classList.add(t);
  const i = document.createElement("div");
  i.appendChild(o), i.appendChild(n), m.appendChild(i);
}
const I = (e, t) => e + Math.floor(Math.random() * (t - e + 1)),
  D = {};
let W = [],
  L = [];
function P(e, t) {
  const o = b.maxPeriod;
  t || (t = new Date());
  const n = (t - h) / o,
    i = w.width - b.headerWidth - 2 * b.marginHorizontal;
  return [
    b.headerWidth + b.marginHorizontal + n * i,
    b.marginVertical + e * b.blockHeight,
  ];
}
const j = { atEnd: !1, shouldIgnoreSymbols: !1 };
function B(e) {
  (e = { ...j, ...e }), b.DEBUG && S(`drawObject ${JSON.stringify(e.obj)}`);
  const t = e.obj && "Array" === e.obj.__proto__.constructor.name,
    o = "boolean" == typeof e.obj,
    n = isFinite(e.obj) && !o;
  if ((b.DEBUG && S(`  isArray=${t}, isNumber=${n}, isBoolean=${o}`), t))
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
    t <= b.headerWidth ||
      (D[e.lineNr] > 0 && (t += D[e.lineNr] * d.w),
      (e.x = t),
      (e.y = o),
      b.DEBUG &&
        S(`drawText ${e.text} at lineNr ${e.lineNr} --\x3e [${t}/${o}]`),
      C(e),
      e.text.startsWith("Error") && z(t, o, "red"),
      e.text.startsWith("Complete") && z(t, o, "orange"),
      e.text.startsWith("Complete") ||
        e.text.startsWith("Error") ||
        0 !== D[e.lineNr] ||
        (function (e, t) {
          b.DEBUG &&
            S(
              `line ${e}/${t} --\x3e ${e}/${
                b.marginVertical + 2 * b.blockHeight
              }`
            );
          const o = 6;
          g.beginPath(),
            g.moveTo(e, t - o),
            g.lineTo(e, t + o),
            (g.strokeStyle = b.tickColor),
            (g.lineWidth = 1),
            g.stroke(),
            g.closePath();
        })(t, o),
      e.lineNr < f &&
        (function (e, t) {
          b.DEBUG &&
            S(
              `line ${e}/${t} --\x3e ${e}/${
                b.marginVertical + 2 * b.blockHeight
              }`
            );
          g.beginPath(),
            g.moveTo(e, t),
            g.lineTo(e, b.marginVertical + f * b.blockHeight),
            (g.strokeStyle = b.guidelineColor),
            (g.lineWidth = 1),
            g.setLineDash([3, 3]),
            g.stroke(),
            g.closePath(),
            g.setLineDash([]);
        })(t, o));
}
function C(e) {
  let t = e.shouldIgnoreSymbols ? new X({ text: e.text }) : u[e.text];
  if ((t || (t = new X({ text: e.text })), t.useImage)) {
    const o = new Image(),
      n = b.centerShapes ? e.x - b.shapeSize / 2 : e.x;
    (o.onload = (t) =>
      g.drawImage(o, n, e.y - b.shapeSize - 1, b.shapeSize, b.shapeSize)),
      (o.src = t.imageUrl);
  } else if (t.useText) {
    const o = g.fillStyle;
    (g.fillStyle = t.color),
      g.fillText(t.text, e.x + 1, e.atEnd ? e.y + 15 : e.y - 2),
      (g.fillStyle = o);
  } else {
    const o = c.get(t.shape),
      n = b.centerShapes ? e.x - b.shapeSize / 2 : e.x;
    o && o.draw(g, n, e.y, t.color, t.strokeOnly);
  }
}
function z(e, t, o) {
  b.DEBUG &&
    S(`line ${e}/${t} --\x3e ${e}/${b.marginVertical + 2 * b.blockHeight}`),
    g.beginPath(),
    g.moveTo(e, t),
    g.lineTo(e, t + 17),
    (g.strokeStyle = o),
    (g.lineWidth = 1),
    g.stroke(),
    g.closePath();
}
function H(e) {
  if (!w) return;
  b.autoExpandCanvasWidth &&
    (w.width = window.innerWidth - 3 * b.marginHorizontal),
    (w.height = (p.length - 1) * b.blockHeight + 2 * b.marginVertical),
    (g = w.getContext("2d")),
    (w.width = w.width),
    (g.font = b.font);
  const t = f + 1;
  g.beginPath();
  for (let e = 0; e < t; e++) {
    const t = b.marginVertical + e * b.blockHeight;
    g.moveTo(b.headerWidth, t),
      g.lineTo(w.width - b.marginHorizontal, t),
      g.stroke(),
      g.fillText(p[e] || "", b.marginHorizontal, t);
  }
  g.closePath(),
    g.fillText("RxJsVisualizer@1.3.6", w.width - 130, w.height - 4),
    b.addNavigationButtons && A(),
    e &&
      (function () {
        const e = 50,
          t = o.timer(0, e).subscribe((e) => {
            const o = V(),
              [n, i] = U(new Date()),
              r = g.lineWidth;
            if (
              (g.beginPath(),
              g.moveTo(b.headerWidth, o),
              (g.strokeStyle = "orange"),
              (g.lineWidth = 2),
              g.lineTo(n, o),
              g.stroke(),
              g.closePath(),
              (g.lineWidth = r),
              b.showTimeTicks)
            ) {
              let e = new Date().getSeconds();
              e < O && (e += 60),
                e >= O + b.tickPeriod / 1e3 && ((O = e % 60), R(new Date()));
            }
            T && t.unsubscribe(), i >= 0.995 && G && M(1e3);
          });
      })();
}
let O = -1;
function U(e) {
  const t = (e - h) / b.maxPeriod,
    o = w.width - b.headerWidth - 2 * b.marginHorizontal;
  return [b.headerWidth + b.marginHorizontal + t * o, t];
}
function V() {
  return b.marginVertical + f * b.blockHeight + 0.4 * b.marginVertical;
}
function R(e) {
  const [t] = U(e);
  if ((L.push(e), t <= b.headerWidth)) return;
  g.font = "italic 9px sans-serif";
  const o = $(e).substr(3, 5);
  g.fillText(o, t - 12, V() + 9);
  const n = V(),
    i = g.lineWidth;
  g.beginPath(),
    g.moveTo(t, n),
    (g.strokeStyle = "orange"),
    (g.lineWidth = 2),
    g.lineTo(t, n - 3),
    g.stroke(),
    g.closePath(),
    (g.lineWidth = i),
    (g.font = b.font);
}
function M(e) {
  (h = new Date(h.getTime() + e)), H(!1);
  const t = [...W];
  (W = []), t.forEach((e) => N(e));
  const o = [...L];
  (L = []), o.forEach((e) => R(e));
}
let G = !0;
function A() {
  const e = 17;
  g.clearRect(0, w.height - e, 52, w.height);
  const t = g.strokeStyle,
    o = g.lineWidth,
    n = g.fillStyle,
    i = g.font;
  (g.fillStyle = "gray"),
    (g.strokeStyle = "black"),
    (g.font = "italic 24px sans-serif"),
    F("<", 1, e),
    F(G ? "x" : "o", 18, e, 2, 3),
    F(">", 35, e),
    (g.font = i),
    (g.fillStyle = n),
    (g.strokeStyle = t),
    (g.lineWidth = o),
    (w.onclick = (t) => {
      const [o, n] = (function (e) {
        const t = w.getBoundingClientRect(),
          o = e.clientX - t.left,
          n = e.clientY - t.top;
        return [o, n];
      })(t);
      n < w.height - 1 - e ||
        o > 52 ||
        (o < e
          ? (b.DEBUG && console.log("   back"), M(-1e3))
          : o < 34
          ? ((G = !G),
            b.DEBUG && console.log(`   toggleScrolling to ${G}`),
            A())
          : (b.DEBUG && console.log("   forth"), M(1e3)));
    });
}
function F(e, t, o, n = 0, i = 0) {
  g.beginPath();
  const r = w.height - 1;
  g.moveTo(t, r),
    g.lineTo(t, r - o),
    g.lineTo(t + o, r - o),
    g.lineTo(t + o, r),
    g.lineTo(t, r),
    g.closePath(),
    g.stroke(),
    g.fillText(e, t + n, w.height - i);
}
function _(e, t, o = !1, n) {
  if (e > f) {
    const t = `** RxVis **:lineNr ${e} not valid - only ${f} line${
      f > 1 ? "s" : ""
    } configured`;
    throw (E(t), t);
  }
  return (
    (D[e] = 0),
    (t = t || ""),
    {
      next: (i) => {
        let r = `${i}`;
        "object" == typeof i && (r = JSON.stringify(i)),
          S(`${t} ${r}`),
          "function" == typeof n && (i = n(i)),
          B({ obj: i, lineNr: e, atEnd: !1, shouldIgnoreSymbols: o });
      },
      error: (o) => {
        E(`Error ${t}`),
          N({ text: "Error;red", lineNr: e, atEnd: !0 }),
          e === f && (T = !0);
      },
      complete: () => {
        S(`Completed ${t}`),
          N({ text: "Complete;orange", lineNr: e, atEnd: !0 }),
          e === f && (T = !0);
      },
    }
  );
}
const J = {};
function q(e, t = null, o = !1, n) {
  return (
    null === t && p[e] && (t = p[e]),
    null === t && (t = ""),
    (i) => (i.subscribe(_(e, t, o, n)), i)
  );
}
J.draw = q;
class X {
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
          E(`*** DrawingSymbol ***: Unknown option '${e}' will be ignored!`)
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
      void 0 !== typeof document && (w = document.getElementById(e.canvasId)),
        w ||
          (E("-------------------------------------------------------------"),
          E(
            `--- Cannot visualize - canvas with id '${e.canvasId}' not found ---`
          ),
          E("-------------------------------------------------------------")),
        void 0 !== typeof document && (m = document.getElementById(e.logDivId)),
        m ||
          (E("-------------------------------------------------------------"),
          E(`--- Cannot show logs - div with id '${e.logDivId}' not found ---`),
          E("-------------------------------------------------------------"));
    } catch (e) {
      console.error("document is not defined");
    }
    S("**********************************************", "color:blue"),
      S("*****        RxJsVisualizer@1.3.6        *****", "color:blue"),
      S("*****   © Robert Grueneis (2022-03-16)   *****", "color:blue"),
      S("**********************************************", "color:blue"),
      Object.keys(e)
        .filter((t) => e.hasOwnProperty(t))
        .filter((e) => !b.hasOwnProperty(e))
        .forEach((e) =>
          E(`*** RxVis ***: Unknown option '${e}' will be ignored!`)
        ),
      (b = { ...b, ...e }),
      b.DEBUG &&
        Object.keys(b)
          .filter((e) => b.hasOwnProperty(e))
          .forEach((e) => S(`RxVis '${e}' --\x3e ${b[e]}`)),
      (d.width = b.shapeSize),
      S(
        `init with canvasId '${e.canvasId}' and logDivId '${e.logDivId}'`,
        "color:orange"
      ),
      S(`shapes: ${JSON.stringify(y)}`, "color:orange"),
      S(`colors: ${JSON.stringify(b.colors)}`, "color:orange"),
      b.maxLogLength > 0 &&
        S(`limit log strings to ${b.maxLogLength} characters`, "color:orange"),
      (u = { ...b.symbolMap }),
      (u["Error;red"] = new X({ text: "Error", color: "red" })),
      (u["Complete;orange"] = new X({ text: "Complete", color: "orange" })),
      w &&
        (H(!1),
        (function () {
          S("drawRegisteredShapes"), (h = new Date());
          const [e, t] = P(0),
            [, o] = P(1);
          let n = e;
          y.forEach((e, i) => {
            const r = b.colors[i % b.colors.length];
            c.get(e).draw(g, n, t, r),
              C({ text: e, x: n, y: t, atEnd: !0, shouldIgnoreSymbols: !0 }),
              c.get(e).draw(g, n, o, r, !0),
              (n += 3 * b.shapeSize);
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
    m && (m.innerHTML = ""),
      (h = new Date()),
      (O = new Date().getSeconds()),
      (T = !1),
      H(!0),
      (W = []);
  },
  rnd: I,
  prepareCanvas: function (e) {
    (p = e), (f = p.length - 1), H(!1);
  },
  writeToLine: function (e, t) {
    S(t), N({ text: t, lineNr: e, atEnd: !0 });
  },
  useRandomSymbolsForNumbers: function (e = 100) {
    x > 0 && 0 === e && [...Array(x).keys()].forEach((e) => delete u[`${e}`]),
      (x = e),
      [...Array(e).keys()].forEach((e) => {
        u[`${e}`] = new X({
          text: `${e}`,
          color: b.colors[e % b.colors.length],
          shape: y[e % y.length],
        });
      });
  },
  operators: J,
  DrawingSymbol: X,
  draw: q,
};
