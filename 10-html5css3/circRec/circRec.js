/**
 *  @file
 *
 *  <p>Interseção entre círculos e polígonos convexos.</p>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm9 (or npm10)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d docCircRec circRec.js node_modules/gl-matrix/esm
 *
 *  Requirements:
 *  - npm init
 *  - npm install gl-matrix
 *  </pre>
 *
 *  @author {@link https://krotalias.github.io Paulo Roma}
 *  @author {@link https://cesperanca.org/ Claudio Esperança}
 *  @since 08/08/2022
 *  @see <a href="/cwdc/10-html5css3/circRec/circRec.html?w=800&h=800">link</a>
 *  @see <a href="../circRec/circRec.js">source</a>
 *  @see {@link https://observablehq.com/@esperanc/configurando-um-triangulo-isosceles Configurando um triângulo isósceles}
 *  @see {@link https://observablehq.com/d/c1f46f6e4dd809f8 Interseção entre círculos e polígonos convexos}
 *  @see {@link https://drive.google.com/file/d/1MjlBWjBP-5ijNTaPDL7-7OOnd8906z6Y/view Trabalho intersecao circulos e poligonos}
 *  @see {@link https://glmatrix.net glMatrix}
 *  @see {@link https://egghead.io/lessons/webgl-using-a-matrix-library-for-webgl Using a Matrix Library for WebGL}
 *  @see {@link https://stackoverflow.com/questions/56716154/how-to-properly-import-from-gl-matrix-js How to properly import from gl-matrix.js?}
 *  @see <img src="../circRec/rect-circle.png" width="768">
 */

"use strict";

// import { vec2, mat3 } from "./node_modules/gl-matrix/esm/index.js";

import { vec2, mat3 } from "https://unpkg.com/gl-matrix@3.4.3/esm/index.js";

import * as util2d from "./util2d.js";

/**
 * Two dimensional vector.
 * @type {glvec2}
 */
const vec2d = (function () {
  /**
   * @member {Object} glvec2 an extended vec2 from gl-matrix.
   */
  const glvec2 = Object.assign({}, vec2);
  const glmat3 = mat3;

  /**
   * Orientation between 3 points.
   * @param {Array<Number,Number>} a first point.
   * @param {Array<Number,Number>} b second point.
   * @param {Array<Number,Number>} c third point.
   * @returns {Number} orientation.
   * @see {@link https://en.wikipedia.org/wiki/Cross_product Cross product}
   * @see {@link https://dccg.upc.edu/people/vera/wp-content/uploads/2012/10/DAG-OrientationTests.pdf Basic tool: orientation tests}
   * @see <img src="../circRec/orient.png" width="320">
   * @global
   * @function
   */
  glvec2.orient = function (a, b, c) {
    return Math.sign(
      glmat3.determinant([1, a[0], a[1], 1, b[0], b[1], 1, c[0], c[1]]),
    );
  };

  /**
   * Returns true iff line segments a-b and c-d intersect.
   * @param {Array<Number,Number>} a starting vertex.
   * @param {Array<Number,Number>} b end vertex.
   * @param {Array<Number,Number>} c starting vertex.
   * @param {Array<Number,Number>} d end vertex.
   * @returns {Boolean} intersect or not.
   * @global
   * @function
   */
  glvec2.segmentsIntersect = function (a, b, c, d) {
    return (
      glvec2.orient(a, b, c) != glvec2.orient(a, b, d) &&
      glvec2.orient(c, d, a) != glvec2.orient(c, d, b)
    );
  };

  /**
   * <p>Line intersection.</p>
   *
   * Sets 'out' to the intersection point between
   * lines [x1,y1]-[x2,y2] and [x3,y3]-[x4,y4].
   * @param {Array<Number,Number>} out intersection point.
   * @param {Array<Number,Number>} param1 starting vertex.
   * @param {Array<Number,Number>} param2 end vertex.
   * @param {Array<Number,Number>} param3 starting vertex.
   * @param {Array<Number,Number>} param4 end vertex.
   * @returns {Array<Number,Number>} intersection point.
   * @see {@link https://en.wikipedia.org/wiki/Line–line_intersection Line–line intersection}
   * @global
   * @function
   */
  glvec2.lineIntersection = function (
    out,
    [x1, y1],
    [x2, y2],
    [x3, y3],
    [x4, y4],
  ) {
    const D = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    const a = x1 * y2 - y1 * x2,
      b = x3 * y4 - y3 * x4;

    out[0] = (a * (x3 - x4) - (x1 - x2) * b) / D;
    out[1] = (a * (y3 - y4) - (y1 - y2) * b) / D;
    return out;
  };
  return glvec2;
})();

/**
 * Fills the canvas with a solid color and border.
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @param {Number} w width.
 * @param {Number} h height.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D CanvasRenderingContext2D}
 */
function fillCanvas(ctx, w, h) {
  ctx.fillStyle = "antiquewhite";
  ctx.strokeStyle = "brown";
  ctx.lineWidth = 10;
  // clear canvas.
  ctx.fillRect(0, 0, w, h);
  // draw canvas border.
  ctx.strokeRect(0, 0, w, h);
  ctx.lineWidth = 1;
}

/**
 * Returns the closest point of the border of the polygon poly to p.
 * @param {Array<Number,Number>} p point.
 * @param {Array<Array<Number,Number>>} poly polygon.
 * @returns {Array<Number,Number>} closest point.
 * @see <img src="../circRec/closest.jpg" width="384">
 */
function closestPolyPoint(p, poly) {
  let prev = poly[poly.length - 1];
  let closest = null;
  let closestDist = Number.MAX_VALUE;
  for (const q of poly) {
    let d = util2d.dist(p, q);
    if (d < closestDist) {
      closestDist = d; // Vertex is closest
      closest = q;
    }
    const pq = vec2d.sub([], p, q);
    const u = vec2d.sub([], prev, q);
    const proj = util2d.vectorProj(pq, u);
    const perp = vec2d.sub([], pq, proj);
    d = vec2d.len(perp);
    if (
      d < closestDist &&
      vec2d.dot(proj, u) > 0 &&
      vec2d.sqrLen(proj) < vec2d.sqrLen(u)
    ) {
      closestDist = d;
      closest = vec2d.add([], q, proj);
    }
    prev = q;
  }
  return closest;
}

/**
 * <p>Returns true iff convex polygons poly and poly2 intersect.</p>
 * The algorithm is based on the separated axis theorem (SAT), which states that, <br>
 * if two polys do not intersect, then there is a separation line between them, <br>
 * in such a way that the vertices of poly are on one side of the line,<br>
 * and the vertices of poly2 are on the other side.
 * <p>It is enough to test the edges of each polygon as a separation line.<br>
 * If none of them do separate the polys, then they must intersect each other.</p>
 * Check the <a href="../docUtil/global.html#orient">orient</a> predicate for deciding
 * on which side of a line a point lies.
 * @param {Array<Array<Number,Number>>} poly first polygon.
 * @param {Array<Array<Number,Number>>} poly2 second polygon.
 * @returns {Boolean} intersect or not.
 * @see {@link http://0x80.pl/notesen/2013-09-15-convex-polygon-intersection.html Detecting intersection of convex polygons in 2D}
 * @see <img src="../circRec/sample.png" width="196">
 */
function convexPolysIntersect(poly, poly2) {
  function findSeparation(poly, poly2) {
    let prev = poly[poly.length - 1];
    const or = util2d.orient(prev, poly[0], poly[1]);
    for (const p of poly) {
      let found = true;
      for (const q of poly2) {
        const or2 = util2d.orient(prev, p, q);
        if (or2 == or) {
          found = false;
          break;
        }
      }
      if (found) return true;
      prev = p;
    }
    return false;
  }
  return !findSeparation(poly, poly2) && !findSeparation(poly2, poly);
}

/**
 * Returns true iff convex polygon poly {@link closestPolyPoint intersects}
 * a circle with the given center and radius.
 * @param {Array<Array<Number,Number>>} poly polygon.
 * @param {Array<Number,Number>} center circle center.
 * @param {Number} radius circle radius.
 * @returns {Boolean} intersect or not.
 */
function convexPolyCircleIntersect(poly, center, radius) {
  if (util2d.pointInConvexPoly(center, poly)) return true;
  const q = closestPolyPoint(center, poly);
  return util2d.dist(center, q) < radius;
}

/**
 * Returns true iff a circle intersects another circle with the given center and radius.
 * @param {Array<Number,Number>} center1 first circle center.
 * @param {Number} radius1 first circle radius.
 * @param {Array<Number,Number>} center2 second circle center.
 * @param {Number} radius2 second circle radius.
 * @returns {Boolean} intersect or not.
 * @see {@link https://milania.de/blog/Intersection_area_of_two_circles_with_implementation_in_C%2B%2B Intersection area of two circles with implementation in C++}
 * @see <img src="../circRec/IntersectingCirclesArea_CircularSegmentsSmallAngle.png" width="320">
 */
function circleCircleIntersect(center1, radius1, center2, radius2) {
  return util2d.dist(center1, center2) < radius1 + radius2;
}

/**
 * Returns a rectangular polygon in the form of a vertex circulation,
 * given:
 * <ul>
 * <li>its center, </li>
 * <li>a vector (u) pointing from the center to the midpoint
 *       of one of its sides, </li>
 * <li>and the size of that side.</li>
 * </ul>
 * @param {Array<Number,Number>} center rectangle center.
 * @param {Array<Number,Number>} u orientation vector.
 * @param {Number} size side size.
 * @returns {Array<Array<Number,Number>>} a rectangle (a polygon).
 * @see <img src="../circRec/cRv2l.png" width="320">
 */
function makeRectangle(center, u, size) {
  const w = vec2d.negate([], u);
  const v = vec2d.scale([], vec2d.normalize([], [-u[1], u[0]]), size / 2);
  return [
    vec2d.add([], u, v),
    vec2d.sub([], u, v),
    vec2d.sub([], w, v),
    vec2d.add([], w, v),
  ].map((x) => vec2d.add([], center, x));
}

/**
 * Returns an array with the mid-points of the edges of polygon poly.
 * @param {Array<Array<Number,Number>>} poly polygon.
 * @returns {Array<Array<Number,Number>>} mid-points.
 */
function midPoints(poly) {
  let prev = poly[poly.length - 1];
  const r = [];
  for (const p of poly) {
    r.push(vec2d.lerp([], prev, p, 0.5));
    prev = p;
  }
  return r;
}

/**
 * <p>Demo: Teste de interseção entre triângulos.</p>
 *
 * Mova interativamente os pontos âncora para alterar a configuração dos triângulos.<br>
 * Se houver interseção, o desenho será vermelho, caso contrário, preto.
 *
 * <p>Triângulos são descritos por objetos:</p>
 * { basePoint: [270, 350], oppositeVertex: [300, 200], color: "black" }
 *
 * @name isoscelesDemo
 * @function
 */
(function isoscelesDemo() {
  const demo = document.querySelector("#theCanvas3");
  if (demo === null) return;
  const ctx = demo.getContext("2d");
  const [w, h] = [demo.clientWidth, demo.clientHeight];
  const iso = [
    { basePoint: [270, 350], oppositeVertex: [300, 200], color: "black" },
    { basePoint: [100, 50], oppositeVertex: [50, 20], color: "black" },
    { basePoint: [250, 150], oppositeVertex: [150, 100], color: "black" },
  ];

  function makePts() {
    for (const t of iso) {
      t.poly = isosceles(t);
      t.anchors = [t.basePoint, t.oppositeVertex];
    }
  }

  makePts();
  let sel = null;
  let prevMouse = null;

  const update = () => {
    fillCanvas(ctx, w, h);

    // tri ∩ tri
    for (const t1 of iso) {
      t1.color = "black";
      for (const t2 of iso) {
        if (t1 == t2) continue;
        const intersect = convexPolysIntersect(t1.poly, t2.poly);
        if (intersect) {
          t1.color = "red";
          t2.color = "red";
        }
      }
    }

    for (const t of iso) {
      ctx.fillStyle = ctx.strokeStyle = t.color;
      for (const p of t.anchors) {
        ctx.beginPath();
        ctx.arc(...p, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      for (const p of t.poly) {
        ctx.lineTo(...p);
      }
      ctx.closePath();
      ctx.stroke();
    }
  };
  update();

  demo.onmousemove = (e) => {
    if (sel) {
      const mouse = [e.offsetX, e.offsetY];
      const [tri, ianchor] = sel;
      const delta = vec2d.sub([], mouse, prevMouse);
      prevMouse = mouse;
      if (ianchor == 0) {
        const v = vec2d.sub([], tri.oppositeVertex, tri.basePoint);
        vec2d.add(tri.basePoint, tri.basePoint, delta);
        vec2d.add(tri.oppositeVertex, tri.basePoint, v);
      } else {
        vec2d.add(tri.oppositeVertex, tri.oppositeVertex, delta);
      }
      makePts();
      update();
    }
  };

  demo.onmousedown = (e) => {
    sel = null;
    const mouse = [e.offsetX, e.offsetY];
    prevMouse = mouse;
    for (const tri of iso) {
      for (const [ianchor, p] of tri.anchors.entries()) {
        if (vec2d.distance(mouse, p) <= 5) {
          sel = [tri, ianchor];
        }
      }
    }
  };

  demo.onmouseup = () => {
    sel = null;
  };
  update();
})();

/**
 * Returns the 3 vertices of an isosceles triangle
 * defined by the center point of its base and the
 * opposite vertex.
 * @param {Array<Number,Number>} basePoint base midpoint.
 * @param {Array<Number,Number>} oppositeVertex opposite vertex.
 * @return {Array<Array<Number,Number>, Array<Number,Number>, Array<Number,Number>>}
 * an isosceles triangle (a convex polygon).
 * @see {@link https://en.wikipedia.org/wiki/Isosceles_triangle Isosceles triangle}
 * @see <img src="../circRec/Isosceles-Triangle.png" width="256">
 */
function isosceles({ basePoint, oppositeVertex }) {
  const u = vec2d.sub([], basePoint, oppositeVertex);
  const v = [-u[1], u[0]];
  const w = [u[1], -u[0]];
  return [
    oppositeVertex,
    vec2d.add([], basePoint, v),
    vec2d.add([], basePoint, w),
  ];
}

/**
 * <p>Demo: Teste de interseção entre retângulos.</p>
 *
 * Mova interativamente os pontos âncora para alterar a configuração dos retângulos.<br>
 * Se houver interseção, o desenho será vermelho, caso contrário, preto.
 *
 * <p>Retângulos são descritos por objetos:</p>
 * { center: [100, 250], u: [50, 0], size: 40, color: "black" }
 *
 * @name rectRectIntersectDemo
 * @function
 */
(function rectRectIntersectDemo() {
  const demo = document.querySelector("#theCanvas1");
  if (demo === null) return;
  const ctx = demo.getContext("2d");
  const [w, h] = [demo.clientWidth, demo.clientHeight];
  const rects = [
    { center: [100, 250], u: [50, 0], size: 40, color: "black" },
    { center: [400, 250], u: [0, 40], size: 50, color: "black" },
    { center: [300, 150], u: [0, 40], size: 50, color: "black" },
    { center: [100, 50], u: [0, 40], size: 50, color: "black" },
    { center: [200, 350], u: [0, 40], size: 50, color: "black" },
  ];

  function makePts() {
    for (const r of rects) {
      r.poly = makeRectangle(r.center, r.u, r.size);
      r.anchors = [...midPoints(r.poly), r.center];
    }
  }

  makePts();
  let sel = null;
  let prevMouse = null;

  const update = () => {
    fillCanvas(ctx, w, h);

    // rect ∩ rect
    for (const r1 of rects) {
      r1.color = "black";
      for (const r2 of rects) {
        if (r1 == r2) continue;
        const intersect = convexPolysIntersect(r1.poly, r2.poly);
        if (intersect) {
          r1.color = "red";
          r2.color = "red";
        }
      }
    }

    for (const r of rects) {
      ctx.fillStyle = ctx.strokeStyle = r.color;
      for (const p of r.anchors) {
        ctx.beginPath();
        ctx.arc(...p, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      for (const p of r.poly) {
        ctx.lineTo(...p);
      }
      ctx.closePath();
      ctx.stroke();
    }
  };

  demo.onmouseup = () => {
    sel = null;
  };

  demo.onmousedown = (e) => {
    sel = null;
    const mouse = [e.offsetX, e.offsetY];
    for (const r of rects) {
      for (const [ianchor, p] of r.anchors.entries()) {
        if (util2d.dist(mouse, p) <= 5) {
          const size =
            ianchor == 4
              ? r.size
              : util2d.dist(r.anchors[+(ianchor % 2 == 0)], r.center) * 2;
          sel = [r, p, size];
          prevMouse = mouse;
          break;
        }
      }
    }
  };

  demo.onmousemove = (e) => {
    if (sel) {
      const [rect, p, size] = sel;
      const mouse = [e.offsetX, e.offsetY];
      vec2d.add(p, p, vec2d.sub([], mouse, prevMouse));
      if (p !== rect.center) {
        rect.u = vec2d.sub([], p, rect.center);
        rect.size = size;
      }
      makePts();
      prevMouse = mouse;
      update();
    }
  };
  update();
})();

/**
 * <p>Demo: Teste de interseção entre retângulos, círculos e triângulos.</p>
 *
 * Mova os pontos âncora para alterar a configuração dos círculos, triângulos ou dos retângulos.<br>
 * Se houver interseção, o desenho será vermelho, caso contrário, preto.
 *
 * <p>Círculos são descritos por objetos:</p>
 * { center: [300, 250], u: [40, 0], color: "black" }
 *
 * <p>Retângulos são descritos por objetos:</p>
 * { center: [100, 250], u: [50, 0], size: 40, color: "black" }
 *
 * <p>Triângulos são descritos por objetos:</p>
 * { basePoint: [270, 350], oppositeVertex: [300, 200], color: "black" }
 *
 * @name rectCircleIntersectDemo
 * @function
 */
(function rectCircleIntersectDemo() {
  const demo = document.querySelector("#theCanvas2");
  if (demo === null) return;
  const [w, h] = [demo.clientWidth, demo.clientHeight];
  const s = Math.min(w, h);
  const ctx = demo.getContext("2d");
  const rects = [
    {
      center: [0.2 * w, 0.5 * h],
      u: [0.1 * s, 0],
      size: 0.08 * s,
      color: "black",
    },
    {
      center: [0.8 * w, 0.5 * h],
      u: [0, 0.08 * s],
      size: 0.1 * s,
      color: "black",
    },
    {
      center: [0.6 * w, 0.3 * h],
      u: [0, 0.08 * s],
      size: 0.1 * s,
      color: "black",
    },
  ];
  const circles = [
    { center: [0.6 * w, 0.5 * h], u: [0.08 * s, 0], color: "black" },
    { center: [0.2 * w, 0.3 * h], u: [0.1 * s, 0], color: "black" },
    { center: [0.4 * w, 0.7 * h], u: [0.14 * s, 0], color: "black" },
  ];
  const iso = [
    {
      basePoint: [0.54 * w, 0.7 * h],
      oppositeVertex: [0.6 * w, 0.4 * h],
      color: "black",
    },
    {
      basePoint: [0.2 * w, 0.1 * h],
      oppositeVertex: [0.1 * w, 0.04 * h],
      color: "black",
    },
    {
      basePoint: [0.5 * w, 0.3 * h],
      oppositeVertex: [0.3 * w, 0.2 * h],
      color: "black",
    },
  ];

  function makePts() {
    for (const r of rects) {
      r.poly = makeRectangle(r.center, r.u, r.size);
      r.anchors = [...midPoints(r.poly), r.center];
    }
    for (const c of circles) {
      c.radius = vec2d.len(c.u);
      c.anchors = [c.center, vec2d.add([], c.center, c.u)];
    }
    for (const t of iso) {
      t.poly = isosceles(t);
      t.anchors = [t.basePoint, t.oppositeVertex];
    }
  }

  const polys = rects.concat(iso);

  makePts();
  let sel = null;
  let prevMouse = null;
  const tol = 20;

  const update = () => {
    fillCanvas(ctx, w, h);

    // poly ∩ poly
    for (const r1 of polys) {
      r1.color = "black";
      for (const r2 of polys) {
        if (r1 == r2) continue;
        const intersect = convexPolysIntersect(r1.poly, r2.poly);
        if (intersect) {
          r1.color = "red";
          r2.color = "red";
        }
      }
    }

    // circle ∩ circle
    for (const c1 of circles) {
      c1.color = "black";
      for (const c2 of circles) {
        if (c1 == c2) continue;
        const intersect = circleCircleIntersect(
          c1.center,
          c1.radius,
          c2.center,
          c2.radius,
        );
        if (intersect) {
          c1.color = "red";
          c2.color = "red";
        }
      }
    }

    // poly ∩ circle
    for (const r of polys) {
      for (const c of circles) {
        const intersect = convexPolyCircleIntersect(r.poly, c.center, c.radius);
        if (intersect) {
          r.color = "red";
          c.color = "red";
        }
      }
    }

    for (const r of polys) {
      ctx.fillStyle = ctx.strokeStyle = r.color;
      for (const p of r.anchors) {
        ctx.beginPath();
        ctx.arc(...p, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      for (const p of r.poly) {
        ctx.lineTo(...p);
      }
      ctx.closePath();
      ctx.stroke();
    }

    for (const c of circles) {
      ctx.fillStyle = ctx.strokeStyle = c.color;
      for (const p of c.anchors) {
        ctx.beginPath();
        ctx.arc(...p, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(...c.center, c.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const motchend = (e) => {
    sel = null;
  };

  const motchstart = (mouse) => {
    sel = null;

    for (const r of rects) {
      for (const [ianchor, p] of r.anchors.entries()) {
        if (util2d.dist(mouse, p) <= tol) {
          const size =
            ianchor == 4
              ? r.size
              : util2d.dist(r.anchors[+(ianchor % 2 == 0)], r.center) * 2;
          sel = [r, p, size];
          break;
        }
      }
    }

    for (const c of circles) {
      for (const p of c.anchors) {
        if (util2d.dist(mouse, p) <= tol) {
          sel = [c, p];
          break;
        }
      }
    }

    for (const tri of iso) {
      for (const [ianchor, p] of tri.anchors.entries()) {
        if (vec2d.distance(mouse, p) <= tol) {
          sel = [tri, ianchor, 0, 0];
        }
      }
    }
    prevMouse = mouse;
  };

  const motchmove = (mouse) => {
    if (sel) {
      if (sel.length == 3) {
        // Rectangle
        const [rect, p, size] = sel;
        vec2d.add(p, p, vec2d.sub([], mouse, prevMouse));
        if (p !== rect.center) {
          rect.u = vec2d.sub([], p, rect.center);
          rect.size = size;
        }
      } else if (sel.length == 4) {
        // triangle
        const [tri, ianchor] = sel;
        const delta = vec2d.sub([], mouse, prevMouse);
        if (ianchor == 0) {
          const v = vec2d.sub([], tri.oppositeVertex, tri.basePoint);
          vec2d.add(tri.basePoint, tri.basePoint, delta);
          vec2d.add(tri.oppositeVertex, tri.basePoint, v);
        } else {
          vec2d.add(tri.oppositeVertex, tri.oppositeVertex, delta);
        }
      } else {
        // circle
        const [circle, p] = sel;
        vec2d.add(p, p, vec2d.sub([], mouse, prevMouse));
        if (p != circle.center) {
          circle.u = vec2d.sub([], p, circle.center);
          circle.radius = vec2d.len(circle.u);
        }
      }
      makePts();
      prevMouse = mouse;
      update();
    }
  };

  /**
   * <p>Set event listeners.</p>
   *
   * The listeners are added to the canvas element (demo),
   * so to prevent
   * {@link https://usefulangle.com/post/278/html-disable-pull-to-refresh-with-css "the pull to refresh"}
   * on a swipe-down.
   *
   * @name setListeners
   * @event
   */
  (function setListeners() {
    demo.addEventListener(
      "mousedown",
      (e) => {
        const mouse = [e.offsetX, e.offsetY];
        motchstart(mouse);
      },
      false,
    );
    demo.addEventListener(
      "mousemove",
      (e) => {
        const mouse = [e.offsetX, e.offsetY];
        motchmove(mouse);
      },
      false,
    );
    demo.addEventListener(
      "mouseup",
      (e) => {
        motchend(e);
      },
      false,
    );
    demo.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        const r = demo.getBoundingClientRect();
        const mouse = [e.touches[0].pageX - r.left, e.touches[0].pageY - r.top];

        motchstart(mouse);
      },
      false,
    );
    demo.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        const r = demo.getBoundingClientRect();
        const mouse = [e.touches[0].pageX - r.left, e.touches[0].pageY - r.top];
        motchmove(mouse);
      },
      false,
    );
    demo.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        motchend(e.touches[0]);
      },
      false,
    );
  })();

  update();
})();
