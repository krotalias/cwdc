/**
 *  @file
 *
 *  Summary.
 *
 * <p>Creates the model of a sphere by continuously subdividing
 * an initial tetrahedron, octahedron, dodecahedron or icosahedron.</p>
 *
 * The algorithm starts with just four/six/twenty/twelve points, corresponding
 * to a tetrahedron/octahedron/dodecahedron/icosahedron inscribed in the unit sphere, <br>
 * and recursively subdivides each triangle by inserting a new vertex
 * at the midpoint of its three edges, <br>
 * which is then projected onto the surface of the sphere.
 *
 *  @author Paulo Roma Cavalcanti on 17/01/2016.
 *  @since 21/11/2016
 *  @see {@link https://www.cs.unm.edu/~angel/BOOK/INTERACTIVE_COMPUTER_GRAPHICS/SIXTH_EDITION/CODE/WebGL/7E/06 Angel's code}
 *  @see {@link http://glmatrix.net glMatrix}
 *  @see <a href="/cwdc/13-webgl/lib/tetrahedron.js">source</a>
 *  @see <img src="/cwdc/13-webgl/lib/tets/tet1.png" width="256"> <img src="/cwdc/13-webgl/lib/tets/tet2.png" width="256">
 *  @see <img src="/cwdc/13-webgl/lib/tets/tet3.png" width="256"> <img src="/cwdc/13-webgl/lib/tets/tet4.png" width="256">
 *  @see <img src="/cwdc/13-webgl/lib/tets/octa1.png" width="256"> <img src="/cwdc/13-webgl/lib/tets/octa2.png" width="256">
 *  @see <img src="/cwdc/13-webgl/lib/tets/octa3.png" width="256"> <img src="/cwdc/13-webgl/lib/tets/octa4.png" width="256">
 */

"use strict";

/**
 * gl-matrix {@link https://glmatrix.net/docs/module-vec3.html 3 Dimensional Vector}.
 * @type {glMatrix.vec3}
 */
const vec3 = glMatrix.vec3;

/**
 * Four points of a tetrahedron inscribed in the unit sphere.
 * @type {Array<vec3>}
 * @see https://en.wikipedia.org/wiki/Tetrahedron
 */
const initialTet = [
  vec3.fromValues(0.0, Math.sqrt(8 / 9), 1 / 3),
  vec3.fromValues(-Math.sqrt(2 / 3), -Math.sqrt(2 / 9), 1 / 3),
  vec3.fromValues(Math.sqrt(2 / 3), -Math.sqrt(2 / 9), 1 / 3),
  vec3.fromValues(0.0, 0.0, -1.0),
];

/**
 * Six points of an octahedron inscribed in the unit sphere.
 * @type {Array<vec3>}
 * @see https://en.wikipedia.org/wiki/Octahedron
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
 * Maximum subdivision level without overflowing any buffer (16 bits - 65536).
 * @type {Object<{tet:Number, oct:Number, dod:Number}>}
 */
const limit = {
  tet: Math.floor(Math.log(65536 / (4 * 3)) / Math.log(4)),
  oct: Math.floor(Math.log(65536 / (8 * 3)) / Math.log(4)),
  dod: 12, // Math.floor(Math.log(65536 / (12 * 3)) / Math.log(4)),
  ico: 16,
};

/**
 * Constrain a value to lie between two further values.
 * @param {Number} x value.
 * @param {Number} min minimum value.
 * @param {Number} max maximum value.
 * @function
 */
const clamp = (x, min, max) => Math.min(Math.max(min, x), max);

/**
 * Convert degrees to radians.
 * @param {Number} deg angle in degrees.
 * @returns {Number} angle in radians.
 * @return {Number} min ≤ x ≤ max.
 * @function
 */
const radians = (deg) => (deg * Math.PI) / 180;

/**
 * Default number of segments (points-1) for drawing a meridian or parallel.
 * @type {Number}
 */
const nsegments = 36;

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
 * <p>The singularity of the mapping (parametrization) is at φ = 0 (y = -r) and φ = π (y = r):</p>
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
function cartesian2Spherical(p) {
  const [x, y, z] = p;

  // acos ∈ [0,pi] ⇒ phi ∈ [0,1]
  // acos (-y) = π - acos (y)
  let phi = Math.acos(-y) / Math.PI;

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
 * @param {Number} s azimuth angle θ, 0 ≤ θ < 2π.
 * @param {Number} t zenith angle φ, 0 ≤ φ ≤ π.
 * @param {Number} r radius.
 * @returns {vec3} cartesian point onto the unit sphere.
 * @see {@link https://mathworld.wolfram.com/SphericalCoordinates.html spherical coordinates}
 * @see <img src="../images/spherical-projection.png" width="256">
 */
function spherical2Cartesian(s, t, r = 1) {
  let x = r * Math.cos(s) * Math.sin(t);
  let z = -r * Math.sin(s) * Math.sin(t);
  let y = -r * Math.cos(t);
  return vec3.fromValues(x, y, z);
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
 *    <li>y =	ln [tan (π/4 + φ/2)], -π/2 ≤ φ ≤ π/2 → -π ≤ y ≤ π </li>
 * </ul>
 * The poles extent to infinity. Therefore, to create a square image,
 * the maximum latitude occurs at y = π, namely:
 * <ul>
 *    <li>φ<sub>max</sub> = 2 atan (e<sup>π</sup>) - π /2 = 85.051129°</li>
 * </ul>
 * As a consequence, we clamp the latitude to &#91;-85°,85°&#93; to avoid any artifact.
 * @param {Number} s longitude (horizontal angle) θ, 0 ≤ θ < 1.
 * @param {Number} t latitude (vertical angle) φ, 0 ≤ φ ≤ 1.
 * @return {Object<x:Number, y:Number>} mercator coordinates in [0,1].
 * @see {@link https://stackoverflow.com/questions/59907996/shader-that-transforms-a-mercator-projection-to-equirectangular mercator projection to equirectangular}
 * @see {@link https://paulbourke.net/panorama/webmerc2sphere/ Converting Web Mercator projection to equirectangular}
 * @see <img src="../images/Cylindrical_Projection_basics2.svg">
 */
function spherical2Mercator(s, t) {
  // st (uv) to equirectangular
  let lon = s * 2.0 * Math.PI; // [0, 2pi]
  let lat = (t - 0.5) * Math.PI; // [-pi/2, pi/2]
  lat = clamp(lat, radians(-85.0), radians(85.0));

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
function mercator2Spherical(x, y) {
  let lat = y * 2 * Math.PI - Math.PI; // [-pi, pi]
  let t = 2 * Math.atan(Math.exp(lat)) - Math.PI / 2; // [-pi/2, pi/2]
  t = t / Math.PI + 0.5; // [0, 1]
  return {
    s: x,
    t: t,
  };
}

/**
 * Set Mercator vertex coordinates.
 * @param {modelData} obj model data.
 */
function setMercatorCoordinates(obj) {
  obj.vertexMercatorCoords = new Float32Array(obj.vertexTextureCoords.length);
  for (let i = 0; i < obj.vertexTextureCoords.length; i += 2) {
    let s = obj.vertexTextureCoords[i];
    let t = obj.vertexTextureCoords[i + 1];
    let { x, y } = spherical2Mercator(s, t);
    obj.vertexMercatorCoords[i] = x;
    obj.vertexMercatorCoords[i + 1] = y;
  }
}

/**
 * Rotate u texture coordinate by a given angle.
 * @param {modelData} obj model data.
 * @param {Number} degrees rotation angle.
 */
function rotateUTexture(obj, degrees) {
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
 * @param {Number} latitude distance north or south of the Equator: [-90°,90°].
 * @param {Number} [n={@link nsegments}] number of points.
 * @return {Float32Array} points on the parallel.
 */
function pointsOnParallel(latitude = 0, n = nsegments) {
  let ds = (Math.PI * 2) / (n - 1);
  const arr = new Float32Array(3 * n);
  let phi = clamp(latitude, -90, 90) + 90;
  phi = radians(phi);
  for (let i = 0, j = 0; i < n; ++i, j += 3) {
    let p = spherical2Cartesian(i * ds, phi, 1.01);
    arr[j] = p[0];
    arr[j + 1] = p[1];
    arr[j + 2] = p[2];
  }
  return arr;
}

/**
 * Return an array with n points on the equator.
 * @param {Number} [n={@link nsegments}] number of points.
 * @return {Float32Array} points on the equator.
 */
function pointsOnEquator(n = nsegments) {
  return pointsOnParallel(0, n);
}

/**
 * Return an array with n points on the prime meridian.
 * @param {Number} [n={@link nsegments}] number of points.
 * @return {Float32Array} points on the prime meridian.
 */
function pointsOnPrimeMeridian(n = nsegments) {
  return pointsOnMeridian(0, n, false);
}

/**
 * Return an array with n points on the anti meridian.
 * @param {Number} [n={@link nsegments}] number of points.
 * @return {Float32Array} points on the anti meridian.
 */
function pointsOnAntiMeridian(n = nsegments) {
  return pointsOnMeridian(180, n, false);
}

/**
 * Return an array with n points on a meridian given its
 * {@link https://en.wikipedia.org/wiki/Longitude longitude}.
 * @param {Number} longitude distance east or west of the prime meridian: [-180°,180°]
 * @param {Number} [n={@link nsegments}] number of points.
 * @param {Boolean} anti whether to draw the antimeridian also.
 * @return {Float32Array} points on the meridian.
 */
function pointsOnMeridian(longitude = 0, n = nsegments, anti = false) {
  let j = 0;
  let ds = Math.PI / (n - 1);
  if (anti) ds *= 2;
  const arr = new Float32Array(3 * n);
  let theta = clamp(longitude, -180, 180);
  theta = radians(theta);
  for (let i = 0; i < n; ++i, j += 3) {
    let p = spherical2Cartesian(theta, i * ds, 1.01);
    arr[j] = p[0];
    arr[j + 1] = p[1];
    arr[j + 2] = p[2];
  }
  return arr;
}

/**
 * <p>Class for creating the model of a sphere by continuously subdividing a
 * {@link https://en.wikipedia.org/wiki/Regular_polyhedron convex regular polyhedron}.</p>
 *
 * {@link https://www.esri.com/arcgis-blog/products/arcgis-pro/mapping/mercator-its-not-hip-to-be-square Mercator coordinates}
 * are created and returned as a new {@link modelData}'s property, vertexMercatorCoords, and
 * {@link https://threejs.org/docs/#api/en/geometries/PolyhedronGeometry Three.js polyhedra}
 * texture coordinates are rotated by 180°, because their original coordinates
 * reversed the places of the prime and anti meridians.
 * @see <img src="../images/simple-cylindrical-projection-earth-map-globe-mercator.jpg" width="512">
 */
class polyhedron {
  /**
   * @constructs polyhedron
   * @param {Boolean} fix whether to fix uv coordinates.
   */
  constructor(fix = false) {
    /**
     * <p>Whether texture coordinates should be fixed.</p>
     * Deprecated in face of {@link https://bgolus.medium.com/distinctive-derivative-differences-cce38d36797b Tarini's}
     * method executed in the fragment shader.
     * @type {Boolean}
     */
    this.fix = fix;
    /**
     * Name (type) of the subdivided polyhedron.
     * @type {String}
     */
    this.name = "";
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
    this.pointsArray.push(...a);
    this.pointsArray.push(...b);
    this.pointsArray.push(...c);

    this.pointsIndices.push(this.index, this.index + 1, this.index + 2);

    var sc = [
      cartesian2Spherical(a),
      cartesian2Spherical(b),
      cartesian2Spherical(c),
    ];

    if (this.fix) this.fixUVCoordinates(sc);

    for (let uv of sc) {
      const { s, t } = uv;
      this.texCoords.push(s, t);

      const { x, y } = spherical2Mercator(s, t);
      this.mercCoords.push(x, y);
    }

    // normals are vectors
    this.normalsArray.push(...a);
    this.normalsArray.push(...b);
    this.normalsArray.push(...c);

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
      var ab = vec3.create();
      var ac = vec3.create();
      var bc = vec3.create();
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
   * <p>Subdivides an initial tetrahedron.</p>
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
   * @property {Array<vec3>} poly.vtx=initialTet vertices of initial tetrahedron.
   * @property {Number} poly.n=limit.tet number of subdivisions.
   * @returns {modelData}
   */
  tetrahedron({ vtx = initialTet, n = limit.tet }) {
    const [a, b, c, d] = vtx;
    this.resetBuffers();
    this.name = "tetrahedron";

    n = Math.min(limit.tet, n);

    this.divideTriangle(a, b, c, n);
    this.divideTriangle(d, c, b, n);
    this.divideTriangle(a, d, b, n);
    this.divideTriangle(a, c, d, n);

    return {
      vertexPositions: new Float32Array(this.pointsArray),
      vertexNormals: new Float32Array(this.normalsArray),
      vertexTextureCoords: new Float32Array(this.texCoords),
      vertexMercatorCoords: new Float32Array(this.mercCoords),
      indices: new Uint16Array(this.pointsIndices),
    };
  }

  /**
   * <p>Subdivides an initial octahedron.</p>
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
   * @property {Number} poly.n=limit.oct number of subdivisions.
   * @returns {modelData}
   */
  octahedron({ vtx = initialOcta, n = limit.oct }) {
    const [a, b, c, d, e, f] = vtx;
    this.resetBuffers();
    this.name = "octahedron";

    n = Math.min(limit.oct, n);

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
    };
  }

  /**
   * <p>Subdivides an initial
   * {@link https://threejs.org/docs/#api/en/geometries/DodecahedronGeometry dodecahedron}.</p>
   * <p>WebGL's vertex index buffers are limited to 16-bit (0-65535) right now:
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array Uint16Array}</p>
   * Generates:
   * <ul>
   *  <li> 36 * 4<sup>n</sup> triangles</li>
   *  <li> 36 * 3 * 4<sup>n</sup> vertices</li>
   *  <li> maximum level = 4 (36864 triangles)</li>
   *  <li> 36 * 3 * 4**5 = 110592 vertices → buffer overflow</li>
   * </ul>
   * Note: three.js level of detail generates much less vertices than the values above:
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
   * @returns {modelData}
   */
  dodecahedron({ radius = 1, n = limit.dod }) {
    this.name = "dodecahedron";
    const obj = getModelData(new THREE.DodecahedronGeometry(radius, n));

    // rotate texture by 180°
    rotateUTexture(obj, 180);

    setMercatorCoordinates(obj);

    return obj;
  }

  /**
   * <p>Subdivides an initial
   * {@link https://threejs.org/docs/#api/en/geometries/IcosahedronGeometry icosahedron}.</p>
   * <p>WebGL's vertex index buffers are limited to 16-bit (0-65535) right now:
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array Uint16Array}</p>
   * Generates:
   * <ul>
   *  <li> 20 * 4<sup>n</sup> triangles</li>
   *  <li> 20 * 3 * 4<sup>n</sup> vertices</li>
   *  <li> maximum level = 5 (20480 triangles)</li>
   *  <li> 20 * 3 * 4**6 = 245760 vertices → buffer overflow</li>
   * </ul>
   * Note: three.js level of detail generates much less vertices than the values above:
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
   * @returns {modelData}
   */
  icosahedron({ radius = 1, n = limit.ico }) {
    this.name = "icosahedron";
    const obj = getModelData(new THREE.IcosahedronGeometry(radius, n));

    // rotate texture by 180°
    rotateUTexture(obj, 180);

    setMercatorCoordinates(obj);

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
   * @param {Array<Object<{s:Number, t:Number}>>} sc triangle given by its spherical coordinates.
   * @see {@link https://gamedev.stackexchange.com/questions/148167/correcting-projection-of-360-content-onto-a-sphere-distortion-at-the-poles/148178#148178 Per-Fragment Equirectangular}
   */
  fixUVCoordinates(sc) {
    var zero = 0.2;
    var onem = 1 - zero;
    var onep = 1 + zero;
    var twom = 2 - zero;
    var twop = 2 + zero;

    var s = sc[0].s + sc[1].s + sc[2].s;
    var t = sc[0].t + sc[1].t + sc[2].t;
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
