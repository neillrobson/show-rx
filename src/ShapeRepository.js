import Shape from "./Shape";

export default class ShapeRepository {
  static register(e, t) {
    ShapeRepository.flyweights || (ShapeRepository.flyweights = new Map()),
      !ShapeRepository.flyweights.has(e) &&
        t instanceof Shape &&
        ShapeRepository.flyweights.set(e, t);
  }
  static get(e) {
    return ShapeRepository.flyweights.has(e)
      ? this.flyweights.get(e)
      : (console.error(`No shape '${e}' registered in ShapeFactory!`), null);
  }
  static getRegisteredShapeNames() {
    return [...ShapeRepository.flyweights.keys()];
  }
}

ShapeRepository.register(
  "circle",
  new (class extends Shape {
    drawImpl(e, t, o) {
      const n = Shape.w / 2;
      e.arc(t + n, o - n, n, 0, 2 * Math.PI, !1);
    }
  })()
);
ShapeRepository.register(
  "square",
  new (class extends Shape {
    drawImpl(e, t, o) {
      e.moveTo(t, o),
        e.lineTo(t, o - Shape.w),
        e.lineTo(t + Shape.w, o - Shape.w),
        e.lineTo(t + Shape.w, o),
        e.lineTo(t, o);
    }
  })()
);
ShapeRepository.register(
  "triangle",
  new (class extends Shape {
    drawImpl(e, t, o) {
      e.moveTo(t, o),
        e.lineTo(t + Shape.w / 2, o - Shape.w),
        e.lineTo(t + Shape.w, o),
        e.lineTo(t, o);
    }
  })()
);
ShapeRepository.register(
  "diamond",
  new (class extends Shape {
    drawImpl(e, t, o) {
      e.moveTo(t, o - Shape.w / 2),
        e.lineTo(t + Shape.w / 2, o - Shape.w),
        e.lineTo(t + Shape.w, o - Shape.w / 2),
        e.lineTo(t + Shape.w / 2, o),
        e.lineTo(t, o - Shape.w / 2);
    }
  })()
);
ShapeRepository.register(
  "cross",
  new (class extends Shape {
    drawImpl(e, t, o) {
      const n = Shape.w / 3;
      e.moveTo(t, o - n),
        e.lineTo(t, o - 2 * n),
        e.lineTo(t + n, o - 2 * n),
        e.lineTo(t + n, o - Shape.w),
        e.lineTo(t + 2 * n, o - Shape.w),
        e.lineTo(t + 2 * n, o - 2 * n),
        e.lineTo(t + Shape.w, o - 2 * n),
        e.lineTo(t + Shape.w, o - n),
        e.lineTo(t + 2 * n, o - n),
        e.lineTo(t + 2 * n, o),
        e.lineTo(t + n, o),
        e.lineTo(t + n, o - n),
        e.lineTo(t, o - n);
    }
  })()
);
ShapeRepository.register(
  "rhombus",
  new (class extends Shape {
    drawImpl(e, t, o) {
      e.moveTo(t, o),
        e.lineTo(t + Shape.w / 2, o - Shape.w),
        e.lineTo(t + Shape.w + Shape.w / 2, o - Shape.w),
        e.lineTo(t + Shape.w, o),
        e.lineTo(t, o);
    }
  })()
);
ShapeRepository.register(
  "octagon",
  new (class extends Shape {
    drawImpl(e, t, o) {
      const n = Shape.w / (1 + Math.sqrt(2)),
        i = Shape.w / 2;
      e.moveTo(t + i - n / 2, o),
        e.lineTo(t, o - i + n / 2),
        e.lineTo(t, o - i - n / 2),
        e.lineTo(t + i - n / 2, o - Shape.w),
        e.lineTo(t + i + n / 2, o - Shape.w),
        e.lineTo(t + Shape.w, o - i - n / 2),
        e.lineTo(t + Shape.w, o - i + n / 2),
        e.lineTo(t + i + n / 2, o),
        e.lineTo(t + i - n / 2, o);
    }
  })()
);
ShapeRepository.register(
  "kite",
  new (class extends Shape {
    drawImpl(e, t, o) {
      e.moveTo(t + Shape.w / 2, o),
        e.lineTo(t, o - 0.75 * Shape.w),
        e.lineTo(t + Shape.w / 2, o - Shape.w),
        e.lineTo(t + Shape.w, o - 0.75 * Shape.w),
        e.lineTo(t + Shape.w / 2, o);
    }
  })()
);
ShapeRepository.register(
  "x",
  new (class extends Shape {
    drawImpl(e, t, o) {
      const n = Shape.w / 5;
      e.moveTo(t, o - n),
        e.lineTo(t + Shape.w / 2 - n, o - Shape.w / 2),
        e.lineTo(t, o - Shape.w + n),
        e.lineTo(t + n, o - Shape.w),
        e.lineTo(t + Shape.w / 2, o - Shape.w / 2 - n),
        e.lineTo(t + Shape.w - n, o - Shape.w),
        e.lineTo(t + Shape.w, o - Shape.w + n),
        e.lineTo(t + Shape.w / 2 + n, o - Shape.w / 2),
        e.lineTo(t + Shape.w, o - n),
        e.lineTo(t + Shape.w - n, o),
        e.lineTo(t + Shape.w / 2, o - Shape.w / 2 + n),
        e.lineTo(t + n, o),
        e.lineTo(t, o - n);
    }
  })()
);
ShapeRepository.register(
  "mushroom",
  new (class extends Shape {
    drawImpl(e, t, o) {
      const n = Shape.w / 3,
        i = Shape.w / 2;
      e.moveTo(t + n, o),
        e.lineTo(t + n, o - Shape.w / 2),
        e.lineTo(t + 2 * n, o - Shape.w / 2),
        e.lineTo(t + 2 * n, o),
        e.lineTo(t + n, o),
        e.moveTo(t + n, o - Shape.w / 2),
        e.arc(t + i, o - i, i, 0, Math.PI, !0);
    }
  })()
);
ShapeRepository.register(
  "star",
  new (class extends Shape {
    drawImpl(e, t, o) {
      const n = Shape.w / 6,
        i = Shape.w / 2;
      e.moveTo(t + i, o),
        e.lineTo(t + i - n, o - i + n),
        e.lineTo(t, o - i),
        e.lineTo(t + i - n, o - i - n),
        e.lineTo(t + i, o - Shape.w),
        e.lineTo(t + i + n, o - i - n),
        e.lineTo(t + Shape.w, o - i),
        e.lineTo(t + i + n, o - i + n),
        e.lineTo(t + i, o);
    }
  })()
);
