/** @module polyhedron */

/**
 *  @file
 *
 *  Summary.
 *
 * <p>Creates the model of a sphere by continuously subdividing an initial
 * {@link https://en.wikipedia.org/wiki/Regular_polyhedron convex regular polyhedron}.</p>
 *
 * The algorithm starts with just four, six, twenty, or twelve points, corresponding
 * to a {@link https://www.brainsofsteel.co.uk/post/how-to-make-a-tetrahedron tetrahedron},
 *      {@link https://www.youtube.com/watch?v=47yZf6GHqzg octahedron},
 *      {@link https://www.polyhedra.net/en/model.php?name-en=dodecahedron dodecahedron}, or
 *      {@link https://www.mathhappens.org/take-and-make-icosahedron-from-golden-rectangles/ icosahedron},
 * inscribed in the unit sphere,
 * and recursively subdivides each triangle by inserting a new vertex
 * at the midpoint of its three edges,
 * which is then projected onto the surface of the sphere.
 *
 *  @author Paulo Roma Cavalcanti
 *  @since 21/11/2016
 *  @see <a href="/cwdc/13-webgl/lib/polyhedron.js">source</a>
 *  @see {@link https://www.cs.unm.edu/~angel/BOOK/INTERACTIVE_COMPUTER_GRAPHICS/SIXTH_EDITION/CODE/WebGL/7E/06 Angel's code}
 *  @see <a href="https://www.britannica.com/science/Platonic-solid">Platonic solid</a>
 *  @see <a href="https://www.mathsisfun.com/geometry/platonic-solids-why-five.html">Platonic Solids - Why Five?</a>
 *  @see <a href="https://users.monash.edu.au/~normd/documents/MATH-348-lecture-32.pdf">Platonic Solids and Beyond</a>
 *  @see <img src="/cwdc/13-webgl/lib/tets/tet1.png" width="256"> <img src="/cwdc/13-webgl/lib/tets/tet2.png" width="256">
 *  @see <img src="/cwdc/13-webgl/lib/tets/tet3.png" width="256"> <img src="/cwdc/13-webgl/lib/tets/tet4.png" width="256">
 *  @see <img src="/cwdc/13-webgl/lib/tets/octa1.png" width="256"> <img src="/cwdc/13-webgl/lib/tets/octa2.png" width="256">
 *  @see <img src="/cwdc/13-webgl/lib/tets/octa3.png" width="256"> <img src="/cwdc/13-webgl/lib/tets/octa4.png" width="256">
 */

"use strict";

// import * as THREE from "three";
import * as THREE from "/cwdc/13-webgl/lib/three.module.js";
import { vec3 } from "/cwdc/13-webgl/lib/gl-matrix/dist/esm/index.js";

/**
 * An object containing raw data for
 * vertices, normal vectors, texture coordinates, mercator coordinates and indices.
 * <p>{@link https://threejs.org/docs/#api/en/geometries/PolyhedronGeometry Polyhedra} have no index.</p>
 * @typedef {Object} polyData
 * @property {Float32Array} vertexPositions vertex coordinates.
 * @property {Float32Array} vertexNormals vertex normals.
 * @property {Float32Array} vertexTextureCoords texture coordinates.
 * @property {Float32Array} vertexMercatorCoords mercator texture coordinates.
 * @property {Uint16Array} indices index array.
 * @property {String} name polyhedron name.
 * @property {Number} nfaces initial number of triangles.
 * @property {Number} maxNumSubdivisions maximum number of subdivisions.
 * @property {Function} ntri return the number of triangles given the level of detail.
 * @property {Function} level return the level of detail given the number of triangles.
 */

/**
 * gl-matrix {@link https://glmatrix.net/docs/module-vec3.html 3 Dimensional Vector}.
 * @name vec3
 * @type {glMatrix.vec3}
 */

/**
 * <p>Four points of a {@link https://www.brainsofsteel.co.uk/post/how-to-make-a-tetrahedron tetrahedron}
 * inscribed in the unit sphere, in three different vertex arrangements.</p>
 *
 * Radius of circunsphere:
 * <ul>
 *  <li>R = √6 a/4 = 1</li>
 * </ul>
 *
 * Radius of circuncircle:
 * <ul>
 *  <li>r = a/√3 = 2/3 √6 / √3 = 2/3 √2 = √(8/9) = 0.9428090415820634</li>
 * </ul>
 *
 * Edge length:
 * <ul>
 *  <li>a = 4R / √6 = 2/3 √6 = 1.6329931618554523</li>
 * </ul>
 *
 * Vertex coordinates:
 * <ul>
 *  <li>x = r sin(π/6) = √(2/9) = 0.4714045207910317</li>
 *  <li>y = r cos(π/6) = √(2/3) = 0.816496580927726</li>
 *  <li>z = 1/3 = 0.3333333333333333 (24/9 = 8/9 + (z+1)²)</li>
 * </ul>
 *
 * Four vertices, lower face parallel to the xy plane:
 * <ul>
 *  <li>(r, 0, -z)</li>
 *  <li>(-x, y, -z)</li>
 *  <li>(-x, -y, -z)</li>
 *  <li>(0, 0, 1)</li>
 * </ul>
 * Alternatively, higher face parallel to the xy plane:
 * <ul>
 *  <li>(0, r, z)</li>
 *  <li>(y, -x, z)</li>
 *  <li>(-y, -x, z)</li>
 *  <li>(0, 0, -1)</li>
 * </ul>
 * Embedded inside a cube:
 * <ul>
 *  <li>(1/√3, 1/√3, 1/√3)</li>
 *  <li>(-1/√3, -1/√3, 1/√3)</li>
 *  <li>(-1/√3, 1/√3, -1/√3)</li>
 *  <li>(1/√3, -1/√3, -1/√3)</li>
 * </ul>
 * @type {Array<vec3>}
 * @see {@link https://en.wikipedia.org/wiki/Tetrahedron Tetrahedron}
 * @see {@link https://en.wikipedia.org/wiki/Equilateral_triangle Equilateral triangle}
 * @see <figure>
 *      <img src="../images/Tetrahedron.svg" width="128">
 *      <img src="../images/tet.png" width="164">
 *      <figcaption>
 *        Lower face parallel to the xy plane.
 *      </figcaption>
 *      <img src="../images/Tetraeder_animation_with_cube.gif" width="128">
 *      <figcaption>
 *        Embedded in a cube.
 *      </figcaption>
 *      </figure>
 */
const initialTet = (() => {
  const r = Math.sqrt(8 / 9);
  const x = r * 0.5; // r * sin(Math.PI/6)
  const y = Math.sqrt(2 / 3); // r * cos(Math.PI/6)
  const z = 1 / 3;
  const d = 1 / Math.sqrt(3);
  return {
    normal: [
      vec3.fromValues(0, r, z),
      vec3.fromValues(y, -x, z),
      vec3.fromValues(-y, -x, z),
      vec3.fromValues(0, 0, -1),
    ],
    alternative: [
      vec3.fromValues(r, 0, -z),
      vec3.fromValues(-x, y, -z),
      vec3.fromValues(-x, -y, -z),
      vec3.fromValues(0, 0, 1),
    ],
    cube: [
      vec3.fromValues(d, d, d),
      vec3.fromValues(-d, -d, d),
      vec3.fromValues(-d, d, -d),
      vec3.fromValues(d, -d, -d),
    ],
  };
})();

/**
 * <p>Six points of an {@link https://www.youtube.com/watch?v=47yZf6GHqzg octahedron}
 * inscribed in the unit sphere.</p>
 *
 * Radius of circunsphere:
 * <ul>
 *  <li>R = √2/2 a = 1</li>
 * </ul>
 *
 * Edge length:
 * <ul>
 *  <li>a = 2R / √2 = 1.414213562373095</li>
 * </ul>
 *
 * Six vertices:
 * <ul>
 *  <li>(±1, 0, 0)</li>
 *  <li>(0, ±1, 0)</li>
 *  <li>(0, 0, ±1)</li>
 * </ul>
 *
 * @type {Array<vec3>}
 * @see {@link https://en.wikipedia.org/wiki/Octahedron Octahedron}
 * @see <img src="../images/Octahedron.gif" width="256">
 */
const initialOcta = [
  vec3.fromValues(0.0, 0.0, 1.0),
  vec3.fromValues(0.0, 0.0, -1.0),
  vec3.fromValues(0.0, 1.0, 0.0),
  vec3.fromValues(0.0, -1.0, 0.0),
  vec3.fromValues(1.0, 0.0, 0.0),
  vec3.fromValues(-1.0, 0.0, 0.0),
];

/**
 * <p>Twelve points of an {@link https://www.mathhappens.org/take-and-make-icosahedron-from-golden-rectangles/ icosahedron}
 * inscribed in the unit sphere.</p>
 *
 * Golden Ratio:
 * <ul>
 *  <li>Φ = (√5+1)/2 = 1.618033988749895 </li>
 * </ul>
 *
 * Radius of circunsphere:
 * <ul>
 *  <li>R = √(Φ² + 1)/2 a = 1</li>
 *  <li>r = √(Φ² + 1) = 1.902113032590307 (a=2)</li>
 * </ul>
 *
 * Edge length:
 * <ul>
 *  <li>a = 2R / √(Φ² + 1) = 0.7639320225002103</li>
 * </ul>
 *
 * Vertex Coordinates:
 * <ul>
 *  <li>Φ / √(Φ² + 1)) = 0.85065080835204</li>
 *  <li>1 / √(Φ² + 1) = 0.5257311121191336</li>
 * </ul>
 * Twelve vertices:
 * <ul>
 *  <li>(0, ±1/r, ±Φ/r) </li>
 *  <li>(±1/r, ±Φ/r, 0) </li>
 *  <li>(±Φ/r, 0, ±1/r) </li>
 * </ul>
 *
 * @type {Array<vec3>}
 * @see {@link https://en.wikipedia.org/wiki/Icosahedron Icosahedron}
 * @see {@link https://en.wikipedia.org/wiki/Regular_icosahedron Regular icosahedron}
 * @see <img src="../images/Icosahedron-golden-rectangles.svg" width="256">
 */
const initialIco = (() => {
  const a = (Math.sqrt(5) + 1) / 2;
  const r = Math.sqrt(a * a + 1);
  const b = 1 / r;
  const c = a / r;
  return [
    vec3.fromValues(0, -b, c),

    vec3.fromValues(c, 0, b),
    vec3.fromValues(c, 0, -b),
    vec3.fromValues(-c, 0, -b),
    vec3.fromValues(-c, 0, b),

    vec3.fromValues(-b, c, 0),
    vec3.fromValues(b, c, 0),
    vec3.fromValues(b, -c, 0),
    vec3.fromValues(-b, -c, 0),

    vec3.fromValues(0, -b, -c),
    vec3.fromValues(0, b, -c),
    vec3.fromValues(0, b, c),
  ];
})();

/**
 * <p>Twenty points of a {@link https://www.polyhedra.net/en/model.php?name-en=dodecahedron dodecahedron}
 * inscribed in the unit sphere.</p>
 * Golden Ratio:
 * <ul>
 *  <li>Φ = (√5+1)/2 = 1.618033988749895 </li>
 *  <ki>2/Φ = √5 - 1 = 1.2360679774997898</li>
 * </ul>
 * Radius of circunscribed sphere:
 * <ul>
 *  <li>R = √3 Φ/2 a = 1</li>
 * </ul>
 * Edge length:
 * <ul>
 *  <li>a = 4R / ((√5 + 1)√3) = 2/Φ R/√3 = R (√5 - 1) / √3 = 0.71364417954618</li>
 * </ul>
 *
 * Vertex coordinates:
 * <ul>
 *  <li>1/√3 = 0.5773502691896258</li>
 *  <li>1 / Φ√3 = (√5-1) / (2√3) = 0.35682208977309</li>
 *  <li>Φ / √3 = (√5+1) / (2√3) = 0.9341723589627158</li>
 * </ul>
 *
 * The eight vertices of a cube:
 * <ul>
 *  <li>(±1/√3, ±1/√3, ±1/√3)</li>
 * </ul>
 * The coordinates of the 12 additional vertices:
 * <ul>
 *  <li>(0, ±(Φ / √3), ±(1 / Φ√3)) </li>
 *  <li>(±(1 / Φ√3), 0, ±(Φ / √3)) </li>
 *  <li>(±(Φ / √3), ±(1 / Φ√3), 0) </li>
 * </ul>
 * @type {Array<vec3>}
 * @see {@link https://en.wikipedia.org/wiki/Dodecahedron Dodecahedron}
 * @see {@link https://en.wikipedia.org/wiki/Regular_dodecahedron Regular dodecahedron}
 * @see {@link https://www.scientificamerican.com/article/why-did-ancient-romans-make-this-baffling-metal-dodecahedron/ Why Did Ancient Romans Make this Baffling Metal Dodecahedron?}
 * @see <img src="../images/dodecahedron.png" width="256">
 * @see <iframe title="Cube in a Dodecahedron" src="/cwdc/13-webgl/examples/three/content/stl.html" style="transform: scale(0.85); width: 380px; height: 380px"></iframe>
 * @see {@link https://www.thingiverse.com/thing:3279291 Cube in a Dodecahedron}
 */
const initialDod = (() => {
  const a = 1 / Math.sqrt(3);
  const b = (Math.sqrt(5) - 1) * 0.5 * a;
  const c = (Math.sqrt(5) + 1) * 0.5 * a;
  return [
    vec3.fromValues(-b, 0, c),
    vec3.fromValues(b, 0, c),
    vec3.fromValues(a, a, a),
    vec3.fromValues(0, c, b),
    vec3.fromValues(-a, a, a),
    vec3.fromValues(-a, -a, a),
    vec3.fromValues(0, -c, b),
    vec3.fromValues(a, -a, a),
    vec3.fromValues(c, -b, 0),
    vec3.fromValues(c, b, 0),
    vec3.fromValues(0, -c, -b),
    vec3.fromValues(a, -a, -a),
    vec3.fromValues(a, a, -a),
    vec3.fromValues(0, c, -b),
    vec3.fromValues(-a, -a, -a),
    vec3.fromValues(-b, 0, -c),
    vec3.fromValues(b, 0, -c),
    vec3.fromValues(-c, -b, 0),
    vec3.fromValues(-c, b, 0),
    vec3.fromValues(-a, a, -a),
  ];
})();

/**
 * Maximum subdivision level without overflowing any buffer (16 bits - 65536).
 * @type {Object<{tet:Number, oct:Number, dod:Number, ico: Number}>}
 */
export const limit = {
  tet_hws: Math.floor(Math.log(65536 / (4 * 3)) / Math.log(4)),
  oct_hws: Math.floor(Math.log(65536 / (8 * 3)) / Math.log(4)),
  ico_hws: Math.floor(Math.log(65536 / (20 * 3)) / Math.log(4)),
  dod_hws: Math.floor(Math.log(65536 / (36 * 3)) / Math.log(4)),
  tet: 24,
  oct: 20,
  dod: 12,
  ico: 16,
};

/**
 * Constrain a value to lie between two further values.
 * @param {Number} x value.
 * @param {Number} min minimum value.
 * @param {Number} max maximum value.
 * @return {Number} min ≤ x ≤ max.
 * @function
 */
export const clamp = (x, min, max) => Math.min(Math.max(min, x), max);

/**
 * Convert degrees to radians.
 * @param {Number} deg angle in degrees.
 * @returns {Number} angle in radians.
 * @function
 */
export const radians = (deg) => (deg * Math.PI) / 180;

/**
 * Default number of segments (points - 1) for drawing a meridian or parallel.
 * @type {Number}
 */
export const nsegments = 36;

/**
 * <p>Return a pair of spherical coordinates, in the range [0,1],
 * corresponding to a point p onto the unit sphere.</p>
 *
 * The forward projection transforms spherical coordinates into planar coordinates:
 * <ul>
 * <li>if point p is plotted on a plane, we have the
 * {@link https://docs.qgis.org/3.4/en/docs/gentle_gis_introduction/coordinate_reference_systems.html <i>plate carrée</i> projection},
 * a special case of the equirectangular projection.</li>
 * <li>this projection maps x to be the value of the longitude and
 * y to be the value of the latitude.</li>
 * </ul>
 *
 * <p>The singularity of the mapping (parameterization) is at φ = 0 (y = -r) and φ = π (y = r):</p>
 * <ul>
 *   <li>In this case, an entire line at the top (or bottom) boundary of the texture is mapped onto a single point.</li>
 *   <li> In {@link https://en.wikipedia.org/wiki/Geographic_coordinate_system geographic coordinate system},
 *   φ is measured from the positive y axis (North), not the z axis, as it is usual in math books.
 *   <li>Therefore, we will use North-Counterclockwise Convention.</li>
 *   <li>The 'clockwise from north' convention is used in navigation and mapping.</li>
 *   <li>________________________________________________</li>
 *   <li> atan2(y, x) (East-Counterclockwise Convention)</li>
 *   <li> atan2(x, y) (North-Clockwise Convention)</li>
 *   <li> atan2(-x,-y) (South-Clockwise Convention)</li>
 *   <li>________________________________________________</li>
 *   <li> cos(φ-90) = sin(φ)</li>
 *   <li> sin(φ-90) = -cos(φ)</li>
 *   <li> x = r cos(θ) sin(φ) </li>
 *   <li> y = −r cos (φ) </li>
 *   <li> z = -r sin(θ) sin(φ) </li>
 *   <li> z/x = −(r sin(θ) sin(φ)) / (r cos(θ) sin(φ)) = -sin(θ) / cos(θ) = −tanθ </li>
 *   <li> θ = atan(−z/x) </li>
 *   <li> φ = acos(−y/r) </li>
 * </ul>
 * Note that this definition provides a logical extension of the usual polar coordinates notation,<br>
 * with θ remaining the angle in the zx-plane and φ becoming the angle out of that plane.
 *
 *  @param {vec3} p a point on the sphere.
 *  @return {Object<s:Number, t:Number>} point p in spherical coordinates:
 *  <ul>
 *     <li>const [x, y, z] = p</li>
 *     <li>r = 1 = √(x² + y² + z²)</li>
 *     <li>s = θ = atan2(-z, x) / 2π + 0.5</li>
 *     <li>t = φ = acos(-y/r) / π</li>
 *     <li>tg(-θ) = -tg(θ) = tan (z/x)
 *     <li>arctan(-θ) = -arctan(θ) = atan2(z, x)
 *  </ul>
 *
 * Since the positive angular direction is CCW,
 * we can not use North-Clockwise Convention,
 * because the image would be rendered mirrored.
 * <ul>
 *  <li>border ≡ antimeridian
 *  <li>atan2(-z, x) (border at -x axis of the image - wrap left to right) (correct form) or </li>
 *  <li>atan2(z, -x) (border at x axis of the image - wrap right to left). </li>
 *  <li>atan2(z, x) (border at x axis of the image - mirrored). </li>
 * </ul>
 *
 * @see {@link https://people.computing.clemson.edu/~dhouse/courses/405/notes/texture-maps.pdf#page=3 Texture Mapping}
 * @see {@link https://en.wikipedia.org/wiki/Spherical_coordinate_system Spherical coordinate system}
 * @see {@link https://en.wikipedia.org/wiki/Parametrization_(geometry) Parametrization (geometry)}
 * @see {@link https://math.libretexts.org/Courses/Monroe_Community_College/MTH_212_Calculus_III/Chapter_11%3A_Vectors_and_the_Geometry_of_Space/11.7%3A_Cylindrical_and_Spherical_Coordinates Cylindrical and Spherical Coordinates}
 * @see {@link https://pro.arcgis.com/en/pro-app/latest/help/mapping/properties/coordinate-systems-and-projections.htm Coordinate systems}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2 Math.atan2()}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/acos Math.acos()}
 * @see {@link https://en.wikipedia.org/wiki/Atan2 atan2}
 * @see <img src="../images/spherical-projection.png" width = "256">
 * @see <img src="../images/Spherical2.png" width="356">
 *      <img src="../images/Declination.jpg" width="175">
 */
export function cartesian2Spherical(p) {
  const [x, y, z] = p;

  // acos ∈ [0,pi] ⇒ phi ∈ [0,1]
  // acos (-y) = π - acos (y)
  const phi = Math.acos(-y) / Math.PI;

  // atan2 ∈ [-pi,pi] ⇒ theta ∈ [-0.5, 0.5]
  let theta = Math.atan2(-z, x) / (2 * Math.PI);

  // theta ∈ [0, 1]
  theta += 0.5;

  return {
    s: clamp(theta, 0.0, 1.0),
    t: clamp(phi, 0.0, 1.0),
  };
}

/**
 * <p>Return a point on the unit sphere given their
 * {@link https://people.computing.clemson.edu/~dhouse/courses/405/notes/texture-maps.pdf#page=3 spherical coordinates}: (θ, φ, r=1).</p>
 * It is assumed that:
 * <ul>
 *  <li>the two systems have the same origin,</li>
 *  <li>the spherical reference plane is the Cartesian xz plane, </li>
 *  <li>φ is inclination from the y direction, and</li>
 *  <li>the azimuth is measured from the Cartesian x axis, so that the x axis has θ = 0° (prime meridian).</li>
 *  <li>x = p[0] = r cos(θ) * sin(φ)</li>
 *  <li>z = p[2] = -r sin(θ) * sin(φ)</li>
 *  <li>y = p[1] = -r cos(φ)</li>
 * </ul>
 *
 * @param {Number} s azimuth angle θ, 0 ≤ θ ≤ 2π.
 * @param {Number} t zenith angle φ, 0 ≤ φ ≤ π.
 * @param {Number} r radius distance, r ≥ 0.
 * @returns {vec3} cartesian point onto the unit sphere.
 * @see {@link https://mathworld.wolfram.com/SphericalCoordinates.html spherical coordinates}
 * @see <img src="../images/spherical-projection.png" width="256">
 */
export function spherical2Cartesian(s, t, r = 1) {
  const x = r * Math.cos(s) * Math.sin(t);
  const z = -r * Math.sin(s) * Math.sin(t);
  const y = -r * Math.cos(t);
  return vec3.fromValues(x, y, z);
}

/**
 * <p>Return a point on the cylinder given their
 * {@link https://en.wikipedia.org/wiki/Cylindrical_coordinate_system cylindrical coordinates}: (r, θ, y=1).</p>
 * It is assumed that:
 * <ul>
 *  <li>the two systems have the same origin,</li>
 *  <li>the cylindrical reference plane is the Cartesian xz plane, </li>
 *  <li>the azimuth is measured from the Cartesian x axis, so that the x axis has θ = 0° (prime meridian).</li>
 *  <li>x = p[0] = r cos(θ)</li>
 *  <li>z = p[2] = -r sin(θ)</li>
 *  <li>y = p[1] = y</li>
 * </ul>
 *
 * @param {Number} r radius distance, r ≥ 0.
 * @param {Number} s azimuth angle θ, 0 ≤ θ ≤ 2π.
 * @param {Number} y height.
 * @returns {vec3} cartesian point onto the cylinder.
 * @see {@link https://mathworld.wolfram.com/CylindricalCoordinates.html cylindrical coordinates}
 * @see <img src="../images/cylindrical-projection.png" width="256">
 */
export function cylindrical2Cartesian(r, s, y = 1) {
  const x = r * Math.cos(s);
  const z = -r * Math.sin(s);
  return vec3.fromValues(x, y, z);
}

/**
 * <p>Return a pair of cylindrical coordinates, in the range [0,1],
 * corresponding to a point p onto the unit cylinder.</p>
 * The forward projection transforms cylindrical coordinates into planar coordinates:
 * <ul>
 * <li>if point p is plotted on a plane, we have the
 * {@link https://docs.qgis.org/3.4/en/docs/gentle_gis_introduction/coordinate_reference_systems.html <i>plate carrée</i> projection},
 * a special case of the equirectangular projection.</li>
 * <li>this projection maps x to be the value of the longitude and
 * y to be the value of the latitude.</li>
 * </ul>
 *  @param {vec3} p a point on the cylinder.
 *  @param {Number} h height of the cylinder.
 *  @return {Object<r:Number, s:Number, t:Number>} point p in cylindrical coordinates:
 *  <ul>
 *     <li>const [x, y, z] = p</li>
 *     <li>r = √(x² + z²)</li>
 *     <li>s = θ = atan2(-z, x) / 2π + 0.5</li>
 *     <li>t = y/h + 0.5</li>
 *     <li>tg(-θ) = -tg(θ) = tan (z/x)
 *     <li>arctan(-θ) = -arctan(θ) = atan2(z, x)
 *  </ul>
 */
export function cartesian2Cylindrical(p, h) {
  const [x, y, z] = p;

  // atan2 ∈ [-pi,pi] ⇒ theta ∈ [-0.5, 0.5]
  let theta = Math.atan2(-z, x) / (2 * Math.PI);

  // theta ∈ [0, 1]
  theta += 0.5;

  return {
    r: Math.sqrt(x * x + z * z),
    s: clamp(theta, 0.0, 1.0),
    t: y / h + 0.5,
  };
}

/**
 * <p>Return a point on the cone given their
 * {@link https://en.wikipedia.org/wiki/Cylindrical_coordinate_system conical coordinates}: (r, h, θ, y=1).</p>
 * It is assumed that:
 * <ul>
 *  <li>the two systems have the same origin,</li>
 *  <li>the conical reference plane is the Cartesian xz plane, </li>
 *  <li>the azimuth is measured from the Cartesian x axis, so that the x axis has θ = 0° (prime meridian).</li>
 *  <li>x = p[0] = (h - y - h / 2) / h * r cos(θ)</li>
 *  <li>z = p[2] = -(h - y - h / 2) / h * r sin(θ)</li>
 *  <li>y = p[1] = y</li>
 * </ul>
 *
 * @param {Number} r cone radius, r ≥ 0.
 * @param {Number} h cone height, h ≥ 0.
 * @param {Number} s azimuth angle θ, 0 ≤ θ ≤ 2π.
 * @param {Number} y height, -h/2 ≤ y ≤ h/2.
 * @returns {vec3} cartesian point onto the cone.
 * @see {@link https://mathworld.wolfram.com/Cone.html Cone}
 * @see {@link https://en.wikipedia.org/wiki/Conical_surface Conical surface}
 * @see <img src="../images/conical-projection.png" width="256">
 */
export function conical2Cartesian(r, h, s, y = 1) {
  const x = ((h - y - h / 2) / h) * r * Math.cos(s);
  const z = -((h - y - h / 2) / h) * r * Math.sin(s);
  return vec3.fromValues(x, y, z);
}

/**
 * <p>Return a pair of conical coordinates, in the range [0,1],
 * corresponding to a point p onto the unit cone.</p>
 * The forward projection transforms conical coordinates into planar coordinates:
 * <ul>
 * <li>if point p is plotted on a plane, we have the
 * {@link https://docs.qgis.org/3.4/en/docs/gentle_gis_introduction/coordinate_reference_systems.html <i>plate carrée</i> projection},
 * a special case of the equirectangular projection.</li>
 * <li>this projection maps x to be the value of the longitude and
 * y to be the value of the latitude.</li>
 * </ul>
 *  @param {vec3} p a point on the cone.
 *  @param {Number} h height of the cone.
 *  @return {Object<r:Number, s:Number, t:Number>} point p in conical coordinates:
 *  <ul>
 *     <li>const [x, y, z] = p</li>
 *     <li>r = √(x² + z²)</li>
 *     <li>s = θ = atan2(-z, x) / 2π + 0.5</li>
 *     <li>t = y/h + 0.5</li>
 *     <li>tg(-θ) = -tg(θ) = tan (z/x)
 *     <li>arctan(-θ) = -arctan(θ) = atan2(z, x)
 *  </ul>
 */
export function cartesian2Conical(p, h) {
  const [x, y, z] = p;

  // atan2 ∈ [-pi,pi] ⇒ theta ∈ [-0.5, 0.5]
  let theta = Math.atan2(-z, x) / (2 * Math.PI);

  // theta ∈ [0, 1]
  theta += 0.5;

  return {
    r: Math.sqrt(x * x + z * z),
    s: clamp(theta, 0.0, 1.0),
    t: y / h + 0.5,
  };
}

/**
 * <p>Convert a 2D point in spherical coordinates to a 2D point in
 * {@link https://en.wikipedia.org/wiki/Mercator_projection Mercator coordinates}.</p>
 * <p>The Mercator projection is a map projection that was widely used for navigation,
 * since {@link https://www.atractor.pt/mat/loxodromica/mercator_loxodromica-_en.html loxodromes}
 * are straight lines (although great circles are curved).</p>
 * The following {@link https://mathworld.wolfram.com/MercatorProjection.html equations}
 * place the x-axis of the projection on the equator,
 * and the y-axis at longitude θ<sub>0</sub>, where θ is the longitude and φ is the latitude:
 * <ul>
 *    <li>x =	θ - θ<sub>0</sub>, 0 ≤ θ - θ<sub>0</sub> ≤ 2π</li>
 *    <li><span style="display: flex;">y = ∫ <span style="display: flex; align-items: center; flex-direction: column; font-size: 0.75rem;"><sup>φ</sup> <sub>0</sub></span>sec(φ) dφ = ln [tan (π/4 + φ/2)], -π/2 ≤ φ ≤ π/2 → -π ≤ y ≤ π </span></li>
 * </ul>
 * The poles extent to infinity. Therefore, to create a square image,
 * the maximum latitude occurs at y = π, namely:
 * <ul>
 *    <li>φ<sub>max</sub> = 2 atan (e<sup>π</sup>) - π /2 = 85.051129°</li>
 * </ul>
 * As a consequence, we clamp the latitude to &#91;-85°,85°&#93; to avoid any artifact.
 * @param {Number} s longitude (horizontal angle) θ, 0 ≤ θ ≤ 1.
 * @param {Number} t latitude (vertical angle) φ, 0 ≤ φ ≤ 1.
 * @return {Object<x:Number, y:Number>} mercator coordinates in [0,1].
 * @see {@link https://stackoverflow.com/questions/59907996/shader-that-transforms-a-mercator-projection-to-equirectangular mercator projection to equirectangular}
 * @see {@link https://paulbourke.net/panorama/webmerc2sphere/ Converting Web Mercator projection to equirectangular}
 * @see <a href="https://ccv.eng.wayne.edu/reference/mercator-15dec2015.pdf#page=35">The normal Mercator projection</a>
 * @see {@link http://math2.org/math/integrals/more/sec.htm Integral sec(x)}
 * @see <img src="../images/cylProj.png" width="556">
 * @see <img src="../images/merc.png" width="128">
 */
export function spherical2Mercator(s, t) {
  // st (uv) to equirectangular
  const lon = s * 2.0 * Math.PI; // [0, 2pi]
  let lat = (t - 0.5) * Math.PI; // [-pi/2, pi/2]
  lat = clamp(lat, radians(-85.051129), radians(85.051129));

  // equirectangular to mercator
  let x = lon;
  let y = Math.log(Math.tan(Math.PI / 4.0 + lat / 2.0)); // [-pi, pi]

  // bring x,y into [0,1] range
  x = s;
  y = (y + Math.PI) / (2.0 * Math.PI);

  return {
    x: x,
    y: y,
  };
}

/**
 * Convert a 2D point (x=long, y=lat) in {@link https://en.wikipedia.org/wiki/Mercator_projection mercator coordinates}
 * to a 2D point (θ, φ) in {@link https://paulbourke.net/geometry/transformationprojection/ spherical coordinates}.
 * <ul>
 *    <li>θ =	x + θ<sub>0</sub>, 0 ≤ x + θ<sub>0</sub> ≤ 2π</li>
 *    <li>φ =	2 atan (exp (y)) - π/2, -π ≤ y ≤ π → -85.051129° ≤ φ ≤ 85.051129° </li>
 * </ul>
 * @param {Number} x longitude in [0,1].
 * @param {Number} y latitude in [0,1].
 * @returns {Object<x:Number, y:Number>} spherical coordinates in [0,1].
 * @see <img src="../images/Cylindrical_Projection_basics2.svg">
 */
export function mercator2Spherical(x, y) {
  const lat = y * 2 * Math.PI - Math.PI; // [-pi, pi]
  let t = 2 * Math.atan(Math.exp(lat)) - Math.PI / 2; // [-pi/2, pi/2]
  t = t / Math.PI + 0.5; // [0, 1]
  return {
    s: x,
    t: t,
  };
}

/**
 * Set Mercator vertex coordinates.
 * @param {module:polyhedron~polyData} obj model data.
 */
export function setMercatorCoordinates(obj) {
  obj.vertexMercatorCoords = new Float32Array(obj.vertexTextureCoords.length);
  for (let i = 0; i < obj.vertexTextureCoords.length; i += 2) {
    const s = obj.vertexTextureCoords[i];
    const t = obj.vertexTextureCoords[i + 1];
    const { x, y } = spherical2Mercator(s, t);
    obj.vertexMercatorCoords[i] = x;
    obj.vertexMercatorCoords[i + 1] = y;
  }
}

/**
 * Rotate u texture coordinate by a given angle.
 * @param {module:polyhedron~polyData} obj model data.
 * @param {Number} degrees rotation angle.
 */
export function rotateUTexture(obj, degrees) {
  const du = degrees / 360 + 1;
  const uv = obj.vertexTextureCoords;
  for (let i = 0; i < uv.length; i += 2) {
    uv[i] += du;
    if (uv[i] > 1) uv[i] -= 1;
  }
}

/**
 * Return an array with n points on a parallel given its
 * {@link https://www.britannica.com/science/latitude latitude}.
 * @param {Number} [latitude=0] distance north or south of the Equator: [-90°,90°].
 * @param {Number} [n={@link nsegments}] number of points.
 * @return {Float32Array} points on the parallel.
 */
export function pointsOnParallel(latitude = 0, n = nsegments) {
  const ds = (Math.PI * 2) / (n - 1);
  const arr = new Float32Array(3 * n);
  let phi = clamp(latitude, -90, 90) + 90;
  phi = radians(phi);
  for (let i = 0, j = 0; i < n; ++i, j += 3) {
    const p = spherical2Cartesian(i * ds, phi, 1.01);
    arr.set(p, j);
  }
  return arr;
}

/**
 * Return an array with n points on the equator.
 * @param {Number} [n={@link nsegments}] number of points.
 * @return {Float32Array} points on the equator.
 */
export function pointsOnEquator(n = nsegments) {
  return pointsOnParallel(0, n);
}

/**
 * Return an array with n points on the prime meridian.
 * @param {Number} [n={@link nsegments}] number of points.
 * @return {Float32Array} points on the prime meridian.
 */
export function pointsOnPrimeMeridian(n = nsegments) {
  return pointsOnMeridian(0, n, false);
}

/**
 * Return an array with n points on the anti meridian.
 * @param {Number} [n={@link nsegments}] number of points.
 * @return {Float32Array} points on the anti meridian.
 */
export function pointsOnAntiMeridian(n = nsegments) {
  return pointsOnMeridian(180, n, false);
}

/**
 * Return an array with n points on a meridian given its
 * {@link https://en.wikipedia.org/wiki/Longitude longitude}.
 * @param {Number} [longitude=0] distance east or west of the prime meridian: [-180°,180°]
 * @param {Number} [n={@link nsegments}] number of points.
 * @param {Boolean} [anti=false] whether to draw the antimeridian also.
 * @return {Float32Array} points on the meridian.
 */
export function pointsOnMeridian(longitude = 0, n = nsegments, anti = false) {
  let j = 0;
  let ds = Math.PI / (n - 1);
  if (anti) ds *= 2;
  const arr = new Float32Array(3 * n);
  let theta = clamp(longitude, -180, 180);
  theta = radians(theta);
  for (let i = 0; i < n; ++i, j += 3) {
    const p = spherical2Cartesian(theta, i * ds, 1.01);
    arr.set(p, j);
  }
  return arr;
}

/**
 * <p>Class for creating the model of a sphere by continuously subdividing a
 * {@link https://en.wikipedia.org/wiki/Regular_polyhedron convex regular polyhedron}.</p>
 *
 * {@link https://www.esri.com/arcgis-blog/products/arcgis-pro/mapping/mercator-its-not-hip-to-be-square Mercator coordinates}
 * are created and returned as a {@link module:polyhedron~polyData polyData}'s property, vertexMercatorCoords, and
 * {@link https://threejs.org/docs/#api/en/geometries/PolyhedronGeometry Three.js polyhedra}
 * texture coordinates are rotated by 180°, because their original coordinates
 * reversed the places of the prime and anti meridians.
 * @see <img src="../images/simple-cylindrical-projection-earth-map-globe-mercator.jpg" width="512">
 */
export class Polyhedron {
  /**
   * @constructs Polyhedron
   * @param {Boolean} fix whether to fix uv coordinates.
   */
  constructor(fix = false) {
    /**
     * <p>Whether texture coordinates should be fixed.</p>
     *
     * @deprecated in face of {@link https://bgolus.medium.com/distinctive-derivative-differences-cce38d36797b Tarini's}
     * method executed in the fragment shader.</p>
     * @type {Boolean}
     */
    this.fix = fix;
    /**
     * Name (type) of the subdivided polyhedron.
     * @type {String}
     */
    this.name = "";

    /**
     * Return the number of triangles at a given subdivision level.
     * @param {Number} n level of detail.
     * @returns {Number} number of triangles: nfaces * 4<sup>n</sup>.
     */
    this.ntriHWS = (n) => this.nfaces * 4 ** Math.min(n, this.maxSubdivisions);

    /**
     * Return the subdivision level given a number of triangles.
     * @param {Number} t number of triangles.
     * @returns {Number} level of detail: log₄(t / nfaces).
     */
    this.levelHWS = (t) => Math.log(t / this.nfaces) / Math.log(4);

    /**
     * Return the number of triangles at a given subdivision level.
     * @param {Number} n level of detail.
     * @returns {Number} number of triangles: nfaces * (n² + 2n + 1).
     */
    this.ntri = (n) => {
      n = Math.min(n, this.maxSubdivisions);
      return this.nfaces * (n * n + 2 * n + 1);
    };

    /**
     * Return the subdivision level given a number of triangles.
     * @param {Number} t number of triangles.
     * @returns {Number} level of detail n: n² + 2n + 1 - t = 0.
     */
    this.level = (t) => {
      const a = 1;
      const b = 2;
      const c = 1 - t / this.nfaces;
      const delta = b * b - 4 * a * c;
      const root = Math.sqrt(delta) / (2 * a);
      return Math.ceil(root) - 1;
    };
  }

  /**
   * Start with empty buffers.
   */
  resetBuffers() {
    /**
     * Number of vertices.
     * @type {Number}
     */
    this.index = 0;

    /**
     * Vertex coordinate array.
     * @type {Array<Number>}
     */
    this.pointsArray = [];

    /**
     * Vertex normal array.
     * @type {Array<Number>}
     */
    this.normalsArray = [];

    /**
     * Index array (triangular face indices).
     * @type {Array<Number>}
     */
    this.pointsIndices = [];

    /**
     * Vertex texture coordinate array.
     * @type {Array<Number>}
     */
    this.texCoords = [];

    /**
     * Vertex mercator texture coordinate array.
     * @type {Array<Number>}
     */
    this.mercCoords = [];
  }

  /**
   * <p>Adds a new triangle.</p>
   * Mercator texture coordinates are also set.
   * @param {vec3} a first vertex.
   * @param {vec3} b second vertex.
   * @param {vec3} c third vertex.
   */
  triangle(a, b, c) {
    this.pointsArray.push(...a, ...b, ...c);

    this.pointsIndices.push(this.index, this.index + 1, this.index + 2);

    const sc = [
      cartesian2Spherical(a),
      cartesian2Spherical(b),
      cartesian2Spherical(c),
    ];

    if (this.fix) this.fixUVCoordinates(sc);

    for (const uv of sc) {
      const { s, t } = uv;
      this.texCoords.push(s, t);

      const { x, y } = spherical2Mercator(s, t);
      this.mercCoords.push(x, y);
    }

    // normals are vectors
    this.normalsArray.push(...a, ...b, ...c);

    this.index += 3;
  }

  /**
   * Recursively subdivides a triangle.
   * @param {vec3} a first vertex.
   * @param {vec3} b second vertex.
   * @param {vec3} c third vertex.
   * @param {Number} count subdivision counter.
   */
  divideTriangle(a, b, c, count) {
    if (count > 0) {
      const ab = vec3.create();
      const ac = vec3.create();
      const bc = vec3.create();
      vec3.scale(ab, vec3.add(ab, a, b), 0.5);
      vec3.scale(ac, vec3.add(ac, a, c), 0.5);
      vec3.scale(bc, vec3.add(bc, b, c), 0.5);

      // project the new points onto the unit sphere
      vec3.normalize(ab, ab);
      vec3.normalize(ac, ac);
      vec3.normalize(bc, bc);

      this.divideTriangle(a, ab, ac, count - 1);
      this.divideTriangle(ab, b, bc, count - 1);
      this.divideTriangle(bc, c, ac, count - 1);
      this.divideTriangle(ab, bc, ac, count - 1);
    } else {
      this.triangle(a, b, c);
    }
  }

  /**
   * <p>Subdivides an initial {@link module:polyhedron~initialTet tetrahedron}.</p>
   * <p>WebGL's vertex index buffers are limited to 16-bit (0-65535) right now:
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array Uint16Array}</p>
   * Generates:
   * <ul>
   *  <li> 4 * 4<sup>n</sup> triangles</li>
   *  <li> 4 * 3 * 4<sup>n</sup> vertices</li>
   *  <li> maximum level = 6 (16384 triangles)</li>
   *  <li> 4 * 3 * 4**7 = 196608 vertices → buffer overflow</li>
   * </ul>
   * @param {Object} poly tetrahedron.
   * @property {Array<vec3>} poly.vtx=initialTet.cube vertices of initial tetrahedron.
   * @property {Number} poly.n=limit.tet_hws number of subdivisions.
   * @returns {module:polyhedron~polyData}
   */
  tetrahedronHWS({ vtx = initialTet.cube, n = limit.tet_hws }) {
    this.name = "tetrahedronHWS";
    /**
     * Initial number of triangles.
     * @type {Number}
     */
    this.nfaces = 4;
    /**
     * Maximum number of subdivisions.
     * @type {Number}
     */
    this.maxSubdivisions = limit.tet_hws;

    const [a, b, c, d] = vtx;
    this.resetBuffers();

    n = Math.min(limit.tet_hws, n);

    this.divideTriangle(c, b, a, n);
    this.divideTriangle(b, c, d, n);
    this.divideTriangle(b, d, a, n);
    this.divideTriangle(d, c, a, n);

    return {
      vertexPositions: new Float32Array(this.pointsArray),
      vertexNormals: new Float32Array(this.normalsArray),
      vertexTextureCoords: new Float32Array(this.texCoords),
      vertexMercatorCoords: new Float32Array(this.mercCoords),
      indices: new Uint16Array(this.pointsIndices),
      maxSubdivisions: this.maxSubdivisions,
      name: this.name,
      nfaces: this.nfaces,
      ntri: this.ntriHWS,
      level: this.levelHWS,
    };
  }

  /**
   * <p>Subdivides an initial {@link module:polyhedron~initialOcta octahedron}.</p>
   * <p>WebGL's vertex index buffers are limited to 16-bit (0-65535) right now:
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array Uint16Array}</p>
   * Generates:
   * <ul>
   *  <li> 8 * 4<sup>n</sup> triangles</li>
   *  <li> 8 * 3 * 4<sup>n</sup> vertices</li>
   *  <li> maximum level = 5 (8192 triangles)</li>
   *  <li> 8 * 3 * 4**6 = 98304 vertices → buffer overflow</li>
   * </ul>
   * @param {Object} poly octahedron.
   * @property {Array<vec3>} poly.vtx=initialOcta vertices of initial octahedron.
   * @property {Number} poly.n=limit.oct_hws number of subdivisions.
   * @returns {module:polyhedron~polyData}
   */
  octahedronHWS({ vtx = initialOcta, n = limit.oct_hws }) {
    this.name = "octahedronHWS";
    this.nfaces = 8;
    this.maxSubdivisions = limit.oct_hws;

    const [a, b, c, d, e, f] = vtx;
    this.resetBuffers();

    n = Math.min(limit.oct_hws, n);

    this.divideTriangle(b, c, e, n);
    this.divideTriangle(f, c, b, n);
    this.divideTriangle(b, e, d, n);
    this.divideTriangle(f, b, d, n);
    this.divideTriangle(c, a, e, n);
    this.divideTriangle(c, f, a, n);
    this.divideTriangle(a, d, e, n);
    this.divideTriangle(a, f, d, n);

    return {
      vertexPositions: new Float32Array(this.pointsArray),
      vertexNormals: new Float32Array(this.normalsArray),
      vertexTextureCoords: new Float32Array(this.texCoords),
      vertexMercatorCoords: new Float32Array(this.mercCoords),
      indices: new Uint16Array(this.pointsIndices),
      maxSubdivisions: this.maxSubdivisions,
      nfaces: this.nfaces,
      name: this.name,
      ntri: this.ntriHWS,
      level: this.levelHWS,
    };
  }

  /**
   * <p>Subdivides an initial {@link module:polyhedron~initialIco icosahedron}.</p>
   * <p>WebGL's vertex index buffers are limited to 16-bit (0-65535) right now:
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array Uint16Array}</p>
   * Generates:
   * <ul>
   *  <li> 20 * 4<sup>n</sup> triangles</li>
   *  <li> 20 * 3 * 4<sup>n</sup> vertices</li>
   *  <li> maximum level = 5 (20480 triangles)</li>
   *  <li> 20 * 3 * 4**6 = 245760 vertices → buffer overflow</li>
   * </ul>
   * @param {Object} poly icosahedron.
   * @property {Array<vec3>} poly.vtx=initialIco vertices of initial octahedron.
   * @property {Number} poly.n=limit.ico_hws number of subdivisions.
   * @returns {module:polyhedron~polyData}
   */
  icosahedronHWS({ vtx = initialIco, n = limit.ico_hws }) {
    this.name = "icosahedronHWS";
    this.nfaces = 20;
    this.maxSubdivisions = limit.ico_hws;

    // prettier-ignore
    const [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11] = vtx;

    this.resetBuffers();

    n = Math.min(limit.ico_hws, n);
    this.divideTriangle(v1, v2, v6, n);
    this.divideTriangle(v1, v7, v2, n);
    this.divideTriangle(v3, v4, v5, n);
    this.divideTriangle(v4, v3, v8, n);
    this.divideTriangle(v6, v5, v11, n);
    this.divideTriangle(v5, v6, v10, n);
    this.divideTriangle(v9, v10, v2, n);
    this.divideTriangle(v10, v9, v3, n);
    this.divideTriangle(v7, v8, v9, n);
    this.divideTriangle(v8, v7, v0, n);
    this.divideTriangle(v11, v0, v1, n);
    this.divideTriangle(v0, v11, v4, n);
    this.divideTriangle(v6, v2, v10, n);
    this.divideTriangle(v1, v6, v11, n);
    this.divideTriangle(v3, v5, v10, n);
    this.divideTriangle(v5, v4, v11, n);
    this.divideTriangle(v2, v7, v9, n);
    this.divideTriangle(v7, v1, v0, n);
    this.divideTriangle(v3, v9, v8, n);
    this.divideTriangle(v4, v8, v0, n);

    return {
      vertexPositions: new Float32Array(this.pointsArray),
      vertexNormals: new Float32Array(this.normalsArray),
      vertexTextureCoords: new Float32Array(this.texCoords),
      vertexMercatorCoords: new Float32Array(this.mercCoords),
      indices: new Uint16Array(this.pointsIndices),
      maxSubdivisions: this.maxSubdivisions,
      nfaces: this.nfaces,
      name: this.name,
      ntri: this.ntriHWS,
      level: this.levelHWS,
    };
  }

  /**
   * <p>Subdivides an initial {@link module:polyhedron~initialDod dodecahedron}.</p>
   * <p>WebGL's vertex index buffers are limited to 16-bit (0-65535) right now:
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array Uint16Array}</p>
   * Generates:
   * <ul>
   *  <li> 36 * 4<sup>n</sup> triangles</li>
   *  <li> 36 * 3 * 4<sup>n</sup> vertices</li>
   *  <li> maximum level = 4 (9216 triangles)</li>
   *  <li> 36 * 3 * 4**5 = 110592 vertices → buffer overflow</li>
   * </ul>
   * @param {Object} poly dodecahedron.
   * @property {Array<vec3>} poly.vtx=initialDod vertices of initial dodecahedron.
   * @property {Number} poly.n=limit.dod_hws number of subdivisions.
   * @returns {module:polyhedron~polyData}
   */
  dodecahedronHWS({ vtx = initialDod, n = limit.dod_hws }) {
    this.name = "dodecahedronHWS";
    this.nfaces = 36;
    this.maxSubdivisions = limit.dod_hws;

    // prettier-ignore
    const [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, v16, v17, v18, v19] = vtx;

    this.resetBuffers();

    n = Math.min(limit.ico_hws, n);
    this.divideTriangle(v19, v18, v4, n);
    this.divideTriangle(v19, v4, v3, n);
    this.divideTriangle(v19, v3, v13, n);

    this.divideTriangle(v19, v13, v12, n);
    this.divideTriangle(v19, v12, v16, n);
    this.divideTriangle(v19, v16, v15, n);

    this.divideTriangle(v11, v16, v12, n);
    this.divideTriangle(v11, v12, v9, n);
    this.divideTriangle(v11, v9, v8, n);

    this.divideTriangle(v5, v0, v4, n);
    this.divideTriangle(v5, v4, v18, n);
    this.divideTriangle(v5, v18, v17, n);

    this.divideTriangle(v14, v10, v6, n);
    this.divideTriangle(v14, v6, v5, n);
    this.divideTriangle(v14, v5, v17, n);

    this.divideTriangle(v14, v17, v18, n);
    this.divideTriangle(v14, v18, v19, n);
    this.divideTriangle(v14, v19, v15, n);

    this.divideTriangle(v14, v15, v16, n);
    this.divideTriangle(v14, v16, v11, n);
    this.divideTriangle(v14, v11, v10, n);

    this.divideTriangle(v12, v13, v3, n);
    this.divideTriangle(v12, v3, v2, n);
    this.divideTriangle(v12, v2, v9, n);

    this.divideTriangle(v8, v7, v6, n);
    this.divideTriangle(v8, v6, v10, n);
    this.divideTriangle(v8, v10, v11, n);

    this.divideTriangle(v1, v7, v8, n);
    this.divideTriangle(v1, v8, v9, n);
    this.divideTriangle(v1, v9, v2, n);

    this.divideTriangle(v1, v0, v5, n);
    this.divideTriangle(v1, v5, v6, n);
    this.divideTriangle(v1, v6, v7, n);

    this.divideTriangle(v0, v1, v2, n);
    this.divideTriangle(v0, v2, v3, n);
    this.divideTriangle(v0, v3, v4, n);

    return {
      vertexPositions: new Float32Array(this.pointsArray),
      vertexNormals: new Float32Array(this.normalsArray),
      vertexTextureCoords: new Float32Array(this.texCoords),
      vertexMercatorCoords: new Float32Array(this.mercCoords),
      indices: new Uint16Array(this.pointsIndices),
      maxSubdivisions: this.maxSubdivisions,
      nfaces: this.nfaces,
      name: this.name,
      ntri: this.ntriHWS,
      level: this.levelHWS,
    };
  }

  /**
   * <p>Subdivides an initial
   * {@link https://threejs.org/docs/#api/en/geometries/TetrahedronGeometry tetrahedron}.</p>
   * Generates:
   * <ul>
   *  <li> 4(n² + 2n + 1) </li>
   *  <li> n = 0: 4 triangles, 4 vertices</li>
   *  <li> n = 1: 16 triangles, 10 vertices</li>
   *  <li> n = 2: 36 triangles, 20 vertices</li>
   *  <li> n = 3: 64 triangles, 34 vertices</li>
   *  <li> n = 4: 100 triangles, 52 vertices</li>
   *  <li> n = 5: 144 triangles, 74 vertices</li>
   * </ul>
   * @param {Object} poly tetrahedron.
   * @property {Number} poly.radius=1 radius for three.js.
   * @property {Number} poly.n=limit.tet number of subdivisions.
   * @returns {module:polyhedron~polyData}
   * @see {@link https://github.com/mrdoob/three.js/blob/master/src/geometries/TetrahedronGeometry.js TetrahedronGeometry.js}
   */
  tetrahedron({ radius = 1, n = limit.tet }) {
    this.name = "tetrahedron";
    this.nfaces = 4;
    this.maxSubdivisions = limit.tet;

    n = Math.min(limit.tet, n);

    const obj = getModelData(new THREE.TetrahedronGeometry(radius, n));

    // rotate texture by 180°
    rotateUTexture(obj, 180);

    setMercatorCoordinates(obj);

    obj.maxSubdivisions = this.maxSubdivisions;
    obj.nfaces = this.nfaces;
    obj.name = this.name;
    obj.ntri = this.ntri;
    obj.level = this.level;

    return obj;
  }

  /**
   * <p>Subdivides an initial
   * {@link https://threejs.org/docs/#api/en/geometries/OctahedronGeometry octhedron}.</p>
   * Generates:
   * <ul>
   *  <li> 8(n² + 2n + 1) </li>
   *  <li> n = 0: 8 triangles, 6 vertices</li>
   *  <li> n = 1: 32 triangles, 18 vertices</li>
   *  <li> n = 2: 72 triangles, 38 vertices</li>
   *  <li> n = 3: 192 triangles, 66 vertices</li>
   *  <li> n = 4: 200 triangles, 102 vertices</li>
   *  <li> n = 5: 288 triangles, 146 vertices</li>
   * </ul>
   * @param {Object} poly octahedron.
   * @property {Number} poly.radius=1 radius for three.js.
   * @property {Number} poly.n=limit.oct number of subdivisions.
   * @returns {module:polyhedron~polyData}
   * @see {@link https://github.com/mrdoob/three.js/blob/master/src/geometries/OctahedronGeometry.js OctahedronGeometry.js}
   */
  octahedron({ radius = 1, n = limit.oct }) {
    this.name = "octahedron";
    this.nfaces = 8;
    this.maxSubdivisions = limit.oct;

    n = Math.min(limit.oct, n);

    const obj = getModelData(new THREE.OctahedronGeometry(radius, n));

    // rotate texture by 180°
    rotateUTexture(obj, 180);

    setMercatorCoordinates(obj);

    obj.maxSubdivisions = this.maxSubdivisions;
    obj.nfaces = this.nfaces;
    obj.name = this.name;
    obj.ntri = this.ntri;
    obj.level = this.level;

    return obj;
  }

  /**
   * <p>Subdivides an initial
   * {@link https://threejs.org/docs/#api/en/geometries/DodecahedronGeometry dodecahedron}.</p>
   * Generates:
   * <ul>
   *  <li> 36(n² + 2n + 1) </li>
   *  <li> n = 0: 36 triangles, 20 vertices</li>
   *  <li> n = 1: 144 triangles, 74 vertices</li>
   *  <li> n = 2: 324 triangles, 164 vertices</li>
   *  <li> n = 3: 576 triangles, 290 vertices</li>
   *  <li> n = 4: 900 triangles, 452 vertices</li>
   *  <li> n = 5: 1296 triangles, 650 vertices</li>
   * </ul>
   * @param {Object} poly dodecahedron.
   * @property {Number} poly.radius=1 radius of the dodecahedron.
   * @property {Number} poly.n=limit.dod number of subdivisions.
   * @returns {module:polyhedron~polyData}
   * @see {@link https://github.com/mrdoob/three.js/blob/master/src/geometries/DodecahedronGeometry.js DodecahedronGeometry.js}
   */
  dodecahedron({ radius = 1, n = limit.dod }) {
    this.name = "dodecahedron";
    this.nfaces = 36;
    this.maxSubdivisions = limit.dod;

    n = Math.min(limit.dod, n);

    const obj = getModelData(new THREE.DodecahedronGeometry(radius, n));

    // rotate texture by 180°
    rotateUTexture(obj, 180);

    setMercatorCoordinates(obj);

    obj.maxSubdivisions = this.maxSubdivisions;
    obj.nfaces = this.nfaces;
    obj.name = this.name;
    obj.ntri = this.ntri;
    obj.level = this.level;

    return obj;
  }

  /**
   * <p>Subdivides an initial
   * {@link https://threejs.org/docs/#api/en/geometries/IcosahedronGeometry icosahedron}.</p>
   * Generates:
   * <ul>
   *  <li> 20(n² + 2n + 1) </li>
   *  <li> n = 0: 20 triangles, 12 vertices</li>
   *  <li> n = 1: 80 triangles, 42 vertices</li>
   *  <li> n = 2: 180 triangles, 92 vertices</li>
   *  <li> n = 3: 320 triangles, 162 vertices</li>
   *  <li> n = 4: 500 triangles, 252 vertices</li>
   *  <li> n = 5: 720 triangles, 362 vertices</li>
   * </ul>
   * @param {Object} poly icosahedron.
   * @property {Number} poly.radius=1 radius of the icosahedron.
   * @property {Number} poly.n=limit.ico number of subdivisions.
   * @returns {module:polyhedron~polyData}
   * @see {@link https://github.com/mrdoob/three.js/blob/master/src/geometries/IcosahedronGeometry.js IcosahedronGeometry.js}
   */
  icosahedron({ radius = 1, n = limit.ico }) {
    this.name = "icosahedron";
    this.nfaces = 20;
    this.maxSubdivisions = limit.ico;

    n = Math.min(limit.ico, n);

    const obj = getModelData(new THREE.IcosahedronGeometry(radius, n));

    // rotate texture by 180°
    rotateUTexture(obj, 180);

    setMercatorCoordinates(obj);

    obj.maxSubdivisions = this.maxSubdivisions;
    obj.nfaces = this.nfaces;
    obj.name = this.name;
    obj.ntri = this.ntri;
    obj.level = this.level;

    return obj;
  }

  /**
   * <p>Equirectangular mapping (also called latitude/longitude or spherical coordinates) is non-linear.<br>
   * That means normal UV mapping can only approximate it - quite badly at the poles, in fact.</p>
   *
   * <p>To fix this, we can calculate our own texture coordinate per fragment, <br>
   * by using the direction to the fragment being drawn, resulting in a perfect match.</p>
   *
   * As a last resource, we can try to adjust uv texture coordinates,
   * when two vertices of a triangle are on one side, <br>
   * and the third on the other side of the discontinuity created,
   * when the 0 coordinate is stitched together with the 1 coordinate.
   *
   * @deprecated in face of {@link https://bgolus.medium.com/distinctive-derivative-differences-cce38d36797b Tarini's}
   * method executed in the fragment shader.</p>
   *
   * @param {Array<Object<{s:Number, t:Number}>>} sc triangle given by its spherical coordinates.
   * @see {@link https://gamedev.stackexchange.com/questions/148167/correcting-projection-of-360-content-onto-a-sphere-distortion-at-the-poles/148178#148178 Per-Fragment Equirectangular}
   */
  fixUVCoordinates(sc) {
    const zero = 0.2;
    const onem = 1 - zero;
    const onep = 1 + zero;
    const twom = 2 - zero;
    const twop = 2 + zero;

    const s = sc[0].s + sc[1].s + sc[2].s;
    const t = sc[0].t + sc[1].t + sc[2].t;
    if (s > onem && s < onep) {
      // two zeros
      if (sc[0].s > onem || sc[1].s > onem || sc[2].s > onem)
        sc[0].s = sc[1].s = sc[2].s = 0;
    } else if (s > twom && s < twop) {
      // two ones
      if (sc[0].s < zero || sc[1].s < zero || sc[2].s < zero)
        sc[0].s = sc[1].s = sc[2].s = 1;
    }
    if (t > onem && t < onep) {
      if (sc[0].t > onem || sc[1].t > onem || sc[2].t > onem)
        sc[0].t = sc[1].t = sc[2].t = 0;
    } else if (t > twom && t < twop) {
      if (sc[0].t < zero || sc[1].t < zero || sc[2].t < zero)
        sc[0].t = sc[1].t = sc[2].t = 1;
    }
  }
}
