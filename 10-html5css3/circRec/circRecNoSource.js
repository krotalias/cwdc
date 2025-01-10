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
 *  - jsdoc -d  docCircRecNoSource circRecNoSource.js node_modules/gl-matrix/esm
 *
 *  Requirements:
 *  - npm init
 *  - npm install gl-matrix
 *  </pre>
 *
 *  @author Paulo Roma & Claudio Esperança
 *  @since 08/08/2022
 *  @see <a href="/cwdc/10-html5css3/circRec.html">link</a>
 *  @see <a href="../circRecNoSource.js">source</a>
 *  @see {@link https://observablehq.com/@esperanc/configurando-um-triangulo-isosceles Configurando um triângulo isósceles}
 *  @see {@link https://drive.google.com/file/d/1MjlBWjBP-5ijNTaPDL7-7OOnd8906z6Y/view Trabalho intersecao circulos e poligonos}
 *  @see {@link https://glmatrix.net glMatrix}
 *  @see {@link https://egghead.io/lessons/webgl-using-a-matrix-library-for-webgl Using a Matrix Library for WebGL}
 *  @see {@link https://stackoverflow.com/questions/56716154/how-to-properly-import-from-gl-matrix-js How to properly import from gl-matrix.js?}
 *  @see <img src="../circRec/rect-circle.png" width="768">
 */

"use strict";

import { vec2, mat3 } from "https://unpkg.com/gl-matrix@3.4.3/esm/index.js";

import * as util2d from "./util2d.js";

/**
 * Two dimensional vector.
 * @type {glvec2}
 */
let vec2d = (function () {
  /**
   * @member {Object} glvec2 an extended vec2 from gl-matrix.
   */
  let glvec2 = Object.assign({}, vec2);
  let glmat3 = mat3;

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
function closestPolyPoint(p, poly) {}

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
function convexPolysIntersect(poly, poly2) {}

/**
 * Returns true iff convex polygon poly {@link closestPolyPoint intersects}
 * a circle with the given center and radius.
 * @param {Array<Array<Number,Number>>} poly polygon.
 * @param {Array<Number,Number>} center circle center.
 * @param {Number} radius circle radius.
 * @returns {Boolean} intersect or not.
 */
function convexPolyCircleIntersect(poly, center, radius) {}

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
function circleCircleIntersect(center1, radius1, center2, radius2) {}

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
function makeRectangle(center, u, size) {}

/**
 * Returns an array with the mid-points of the edges of polygon poly.
 * @param {Array<Array<Number,Number>>} poly polygon.
 * @returns {Array<Array<Number,Number>>} mid-points.
 */
function midPoints(poly) {}

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
  const ctx = demo.getContext("2d");
  let [w, h] = [demo.clientWidth, demo.clientHeight];
  const iso = [
    { basePoint: [270, 350], oppositeVertex: [300, 200], color: "black" },
    { basePoint: [100, 50], oppositeVertex: [50, 20], color: "black" },
    { basePoint: [250, 150], oppositeVertex: [150, 100], color: "black" },
  ];

  function makePts() {
    for (let t of iso) {
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
    for (let t1 of iso) {
      t1.color = "black";
      for (let t2 of iso) {
        if (t1 == t2) continue;
        let intersect = convexPolysIntersect(t1.poly, t2.poly);
        if (intersect) {
          t1.color = "red";
          t2.color = "red";
        }
      }
    }

    for (let t of iso) {
      ctx.fillStyle = ctx.strokeStyle = t.color;
      for (let p of t.anchors) {
        ctx.beginPath();
        ctx.arc(...p, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      for (let p of t.poly) {
        ctx.lineTo(...p);
      }
      ctx.closePath();
      ctx.stroke();
    }
  };
  update();

  demo.onmousemove = (e) => {
    if (sel) {
      let mouse = [e.offsetX, e.offsetY];
      let [tri, ianchor] = sel;
      let delta = vec2d.sub([], mouse, prevMouse);
      prevMouse = mouse;
      if (ianchor == 0) {
        let v = vec2d.sub([], tri.oppositeVertex, tri.basePoint);
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
    for (let tri of iso) {
      for (let [ianchor, p] of tri.anchors.entries()) {
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
