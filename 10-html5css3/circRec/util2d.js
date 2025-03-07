/**
 *  @file
 *
 *  <p>Representação de pontos, vetores, polígonos, segmentos de retas e retas.</p>
 *
 *  <p>Usamos um array com dois valores numéricos para representar,
 *  tanto um ponto em 2d quanto um vetor em 2d.</p>
 *
 *  Assim, [1, 2] pode representar tanto um ponto como um vetor:
 * <ul>
 *  <li>segmentos de reta são representados por pares de pontos,</li>
 *  <li>retas são representadas por um ponto e um vetor,</li>
 *  <li>polígonos são representados por um array de pontos.</li>
 * </ul>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm7 (or npm8)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d docUtil util2d.js node_modules/gl-matrix/esm
 *
 *  Requirements:
 *  - npm init
 *  - npm install gl-matrix
 *  </pre>
 *
 *  @author {@link https://krotalias.github.io Paulo Roma}
 *  @author {@link https://cesperanca.org/ Claudio Esperança}
 *  @since 08/08/2022
 *  @see <a href="/cwdc/10-html5css3/circRec/circRec.html">link</a>
 *  @see <a href="/cwdc/10-html5css3/circRec/util2d.js">source</a>
 *  @see <a href="/cwdc/downloads/gc/Primitivas Geometricas.pdf">Primitivas Geométricas</a>
 *  @see {@link https://observablehq.com/@esperanc/funcoes-2d-uteis Funções 2D úteis}
 *  @see {@link https://drive.google.com/file/d/13G0A6oq7iyiXrVm1_oOYFp3gwaEErzQZ/view Funcoes 2d Uteis.webm}
 */

"use strict";

import { vec2, mat3 } from "https://unpkg.com/gl-matrix@3.4.3/esm/index.js";

/**
 * Distância entre dois pontos.
 * @param {Number[]} param0 primeiro ponto.
 * @param {Number[]} param1 segundo ponto.
 * @returns {Number} distância.
 */
export function dist([x0, y0], [x1, y1]) {
  return Math.hypot(x1 - x0, y1 - y0);
}

/**
 * <p>Retorna -1, 1 ou 0 conforme a circulação entre os pontos a, b e c seja:
 * anti-horária, horária ou nula (pontos colineares).</p>
 *
 * Observe que usamos um sistema de coordenadas onde o eixo y aponta para baixo,
 * o que faz com que o sinal do operador seja invertido.
 * @param {Number[]} a primeiro ponto.
 * @param {Number[]} b segundo ponto.
 * @param {Number[]} c terceiro ponto.
 * @returns {Number} circulação.
 */
export function orient(a, b, c) {
  return Math.sign(
    mat3.determinant([1, a[0], a[1], 1, b[0], b[1], 1, c[0], c[1]]),
  );
}

/**
 * Retorna true se e somente se dois segmentos de reta a-b e c-d se intersectam.
 * @param {Number[]} a vértice inicial.
 * @param {Number[]} b vértice final.
 * @param {Number[]} c vértice inicial.
 * @param {Number[]} d vértice final.
 * @returns {Boolean} true se e somente se dois segmentos de reta se intersectam.
 */
export function segmentsIntersect(a, b, c, d) {
  return (
    Math.abs(orient(a, b, c) - orient(a, b, d)) >= 1 &&
    Math.abs(orient(c, d, a) - orient(c, d, b)) >= 1
  );
}

/**
 * O predicado segmentsIntersectProper (a,b,c,d) retorna true somente se
 * a interseção, entre o os dois segmentos é própria,<br>
 * isto é, o ponto de interseção é diferente de a, b, c ou d.
 * @param {Number[]} a vértice inicial.
 * @param {Number[]} b vértice final.
 * @param {Number[]} c vértice inicial.
 * @param {Number[]} d vértice final.
 * @returns {Boolean} true somente se a interseção
 * entre o os dois segmentos é própria.
 */
export function segmentsIntersectProper(a, b, c, d) {
  return (
    Math.abs(orient(a, b, c) - orient(a, b, d)) == 2 &&
    Math.abs(orient(c, d, a) - orient(c, d, b)) == 2
  );
}

/**
 * Retorna true se e somente se o ponto p está dentro do polígono convexo
 * dado pelo array de pontos poly.<br>
 * O algoritmo consiste em testar a orientação de p com relação a todas as arestas de poly.<br>
 * Se a orientação é consistentemente positiva ou negativa, p está dentro de poly.
 * @param {Number[]} p ponto.
 * @param {Array<Number>} poly polígono.
 * @returns {Boolean} true.
 */
export function pointInConvexPoly(p, poly) {
  let prevPoint = poly[poly.length - 1];
  let prevOrient = 0;
  for (let q of poly) {
    const o = orient(prevPoint, q, p);
    if (Math.abs(o - prevOrient) > 1) return false;
    prevOrient = o;
    prevPoint = q;
  }
  return true;
}

/**
 * <p>Assumindo que duas retas dadas por (p1,v1) e (p2,v2) se intersectam,
 * retorna o ponto de interseção entre elas.</p>
 *
 * O algoritmo consiste em usar a representação paramétrica das retas,
 * isto é, p1 + tv1 = p2 + uv2, para resolver o sistema de equações
 * e achar t e u.
 *
 * <p>Observe que, como estamos em 2D, temos duas equações (para x e y)
 * e duas incógnitas, t e u.</p>
 *
 * @param {Number[]} p1 vértice inicial.
 * @param {Number[]} v1 vértice final.
 * @param {Number[]} p2 vértice inicial.
 * @param {Number[]} v2 vértice final.
 * @returns {Array<Number>} ponto de interseção.
 */
export function lineLineIntersection(p1, v1, p2, v2) {
  const D = v1[0] * v2[1] - v1[1] * v2[0];
  const t = (v2[1] * (p2[0] - p1[0]) + p1[1] * v2[0] - p2[1] * v2[0]) / D;
  return [p1[0] + v1[0] * t, p1[1] + v1[1] * t];
}

/**
 * Dados 2 vetores u e v, retorna o vetor u projetado sobre v.
 * @param {Number[]} u vetor.
 * @param {Number[]} v vetor.
 * @returns {Array<Number>} vetor u projetado sobre v.
 * @see <img src="../img/proj.png" width="512">
 */
export function vectorProj(u, v) {
  const vnorm = vec2.normalize([], v);
  return vec2.scale([], vnorm, vec2.dot(vnorm, u));
}

/**
 * Dada uma reta dada por p e v, retorna a distância desta ao ponto q.<br>
 * O algoritmo é uma aplicação da operação de decomposição ortogonal.
 * @param {Number[]} q ponto.
 * @param {Number[]} p vértice inicial.
 * @param {Number[]} v vértice final.
 * @returns {Number} distância.
 * @see <img src="../img/dist-point-line.png" width="256">
 */
export function distToLine(q, p, v) {
  const pq = vec2.sub([], q, p);
  const pqProj = vectorProj(pq, v);
  return vec2.len(vec2.sub([], pq, pqProj));
}

/**
 * <p>Dado um ponto p e um segmento de reta a-b, retorna a menor distância entre p
 * e o ponto q mais próximo contido no segmento.</p>
 *
 * <p>O algoritmo para esta função é análogo ao usado para computar a distância
 * entre um ponto e uma reta.</p>
 *
 * Se consideramos os pontos q sobre a reta de suporte do segmento,
 * o ponto mais próximo de p pode estar entre a e b, antes de a ou depois de b.<br>
 * No primeiro caso, o resultado é dado pela distância à reta de suporte.
 * Nos demais casos, o ponto mais próximo é a ou b, respectivamente.
 * @param {Number[]} p ponto.
 * @param {Number[]} a vértice inicial.
 * @param {Number[]} b vértice final.
 * @returns {Number} distância.
 * @see <img src="../img/dist-point-seg.png" width="512">
 */
export function distToSegment(p, a, b) {
  const v = vec2.sub([], b, a);
  const vlen = dist(a, b);
  const vnorm = vec2.scale([], v, 1 / vlen);
  const ap = vec2.sub([], p, a);
  const t = vec2.dot(vnorm, ap);
  if (t < 0) return dist(p, a);
  if (t > vlen) return dist(p, b);
  return vec2.len(vec2.sub([], ap, vec2.scale([], vnorm, t)));
}

/**
 * Se um polígono poly é dado por uma circulação de vértices,
 * a função abaixo retorna sua área com sinal,<br>
 * isto é, se a circulação é dada na ordem trigonométrica
 * (sentido contrário dos ponteiros do relógio),
 * então a área é positiva, caso contrário, é negativa.
 *
 * <p>O algoritmo consiste em somar as áreas dos trapézios formados
 * entre as arestas do polígono e o eixo x.</p>
 * @param {Array<Number>} poly polígono.
 * @returns {Number} área com sinal.
 */
export function polygonArea(poly) {
  let [px, py] = poly[poly.length - 1];
  let area = 0;
  for (let [x, y] of poly) {
    area += (px - x) * (y + py);
    [px, py] = [x, y];
  }
  return area / 2;
}

/**
 * Dado um ponto p e um triângulo a, b, c,
 * retorna um array com as coordenadas baricêntricas de p.
 * @param {Number[]} p ponto.
 * @param {Number[]} a primeiro vértice.
 * @param {Number[]} b segundo vértice.
 * @param {Number[]} c terceiro vértice.
 * @returns {Array<Number>} coordenadas baricêntricas.
 */
export function barycentric(p, a, b, c) {
  const A = polygonArea([a, b, c]);
  return [
    polygonArea([a, b, p]) / A,
    polygonArea([b, c, p]) / A,
    polygonArea([c, a, p]) / A,
  ];
}

/**
 * <p>Predicado ponto em polígono simples.</p>
 *
 * <p>Retorna true se e somente se o ponto p está dentro do polígono simples
 * dado pelo array de pontos poly.<br>
 * Um polígono simples é formado por apenas uma circulação de vértices,
 * onde as arestas não se intersectam.</p>
 *
 * <p>Nesta implementação usamos o teorema de Jordan,
 * que diz que uma semi-reta que começa em um ponto p
 * no interior do polígono,<br>
 * e vai até o infinito em qualquer direção,
 * deve atravessar a fronteira do polígono um número ímpar de vezes.</p>
 *
 * É preciso um cuidado especial para tratar os vértices do polígono.
 * Cada vértice precisa ser considerado apenas uma vez, <br>
 * e portanto cada aresta da polígono é considerada "aberta" numa extremidade
 * e "fechada" em outra extremidade.<br>
 * Se a semi-reta passa por um vértice, precisamos distinguir os casos
 * onde ela atravessa a borda do polígono (a),<br>
 * daqueles onde ele apenas toca a borda (b).
 * @param {Number[]} p ponto.
 * @param {Array<Number>} poly polígono.
 * @returns {Boolean} true se e somente se o ponto p está dentro do polígono simples.
 * @see <img src="../img/point-in-poly.png" width="512">
 */
export function pointInPoly(p, poly) {
  // The y coordinate of p
  const py = p[1];
  // 1d orientation of a point's y with respect to py
  const yOrient = (p) => Math.sign(p[1] - py);
  // Number of vertices
  const n = poly.length;
  // Previous point (the last of poly) and its y orientation
  let prev = poly[n - 1];
  let prevYOr = yOrient(prev);
  // Intersection counter
  let count = 0;
  // Test all vertices
  for (let i = 0; i < n; i++) {
    const q = poly[i];
    const yOr = yOrient(q);
    if (Math.abs(yOr - prevYOr) >= 1) {
      // Point within y range of segment prev-q
      const pOr = orient(prev, q, p);
      const far = [Math.max(prev[0], q[0]) * 2, py]; // Point to the right of segment prev-q
      const farOr = orient(prev, q, far);
      if (Math.abs(pOr - farOr) == 2) {
        // segment p-far crosses segment prev-q
        if (yOr == 0) {
          // Intersection at q ?
          // Test if next endPoint on opposite y orientations
          const next = poly[(i + 1) % n];
          const nextYOr = yOrient(next);
          if (Math.abs(nextYOr - prevYOr) == 2) count++;
        } else {
          if (prevYOr != 0) count++; // Ignore intersections passing through prev
        }
      }
    }
    prevYOr = yOr;
    prev = q;
  }
  return count % 2 == 1;
}
