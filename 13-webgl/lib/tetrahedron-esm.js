/** @module */

/**
 *  @file
 *
 *  Summary.
 *
 * <p>Creates the model of a sphere by continuously subdividing
 * an initial tetrahedron or octahedron.</p>
 *
 * The algorithm starts with just four/six points, corresponding
 * to a tetrahedron/octahedron inscribed in the unit sphere, <br>
 * and recursively subdivides each triangle by inserting a new vertex
 * at the midpoint of its three edges, <br>
 * which is then projected onto the surface of the sphere.
 *
 *  @author Paulo Roma Cavalcanti on 17/01/2016.
 *  @since 21/11/2016
 *  @see https://www.cs.unm.edu/~angel/BOOK/INTERACTIVE_COMPUTER_GRAPHICS/SIXTH_EDITION/CODE/WebGL/7E/06
 *  @see http://glmatrix.net
 *  @see <a href="/cwdc/13-webgl/lib/tetrahedron-esm.js">source</a>
 *  @see <img src="/cwdc/13-webgl/lib/tets/tet1.png" width="256"> <img src="/cwdc/13-webgl/lib/tets/tet2.png" width="256">
 *  @see <img src="/cwdc/13-webgl/lib/tets/tet3.png" width="256"> <img src="/cwdc/13-webgl/lib/tets/tet4.png" width="256">
 *  @see <img src="/cwdc/13-webgl/lib/tets/octa1.png" width="256"> <img src="/cwdc/13-webgl/lib/tets/octa2.png" width="256">
 *  @see <img src="/cwdc/13-webgl/lib/tets/octa3.png" width="256"> <img src="/cwdc/13-webgl/lib/tets/octa4.png" width="256">
 */

"use strict";

import { vec3 } from "https://unpkg.com/gl-matrix@3.4.3/esm/index.js";

/**
 * Four points of a tetrahedron inscribed in the unit sphere.
 * @type {Array<vec3>}
 * @see https://en.wikipedia.org/wiki/Tetrahedron
 */
var initialTet = [
    vec3.fromValues(0.0, 0.0, -1.0),
    vec3.fromValues(0.0, Math.sqrt(8 / 9), 1 / 3),
    vec3.fromValues(-Math.sqrt(2 / 3), -Math.sqrt(2 / 9), 1 / 3),
    vec3.fromValues(Math.sqrt(2 / 3), -Math.sqrt(2 / 9), 1 / 3),
];

/**
 * Six points of an octahedron inscribed in the unit sphere.
 * @type {Array<vec3>}
 * @see https://en.wikipedia.org/wiki/Octahedron
 */
var initialOcta = [
    vec3.fromValues(0.0, 0.0, 1.0),
    vec3.fromValues(0.0, 0.0, -1.0),
    vec3.fromValues(0.0, 1.0, 0.0),
    vec3.fromValues(0.0, -1.0, 0.0),
    vec3.fromValues(1.0, 0.0, 0.0),
    vec3.fromValues(-1.0, 0.0, 0.0),
];

/**
 * Maximum subdivision level without overflowing any buffer (16 bits - 65536).
 * @type {Object<{tet:Number, oct:Number}>}
 */
var limit = {
    tet: Math.floor(Math.log(65536 / (4 * 3)) / Math.log(4)),
    oct: Math.floor(Math.log(65536 / (8 * 3)) / Math.log(4)),
};

/**
 * Constrain a value to lie between two further values.
 * @param {Number} x value.
 * @param {Number} min minimum value.
 * @param {Number} max maximum value.
 */
var clamp = (x, min, max) => Math.min(Math.max(min, x), max);

/**
 * Return a pair of spherical coordinates, in the range [0,1],
 * corresponding to a point p onto the unit sphere.
 *
 * <p>The singularity of the mapping (parameterization) is at φ = 0 (z = r) and φ = π (z = -r).</p>
 * <ul>
 * <li>In this case, an entire line at the top (or bottom) boundary of the texture is mapped onto a single point.</li>
 * <li>Also, here, θ is measured from the x axis.</li>
 * </ul>
 *
 *  @param {vec3} p a point on the sphere.
 *  @return {Object<s:Number, t:Number>} point p in spherical coordinates:
 *  <ul>
 *     <li>r = 1 = √(p[0]² + p[1]² + p[2]²)</li>
 *     <li>s = θ = atan2(p[1],p[0]) / (2 π ) + 0.5</li>
 *     <li>t = φ = acos(p[2]/r) / π </li>
 *  </ul>
 *  @see https://en.wikipedia.org/wiki/Spherical_coordinate_system
 *  @see https://en.wikipedia.org/wiki/Parametrization_(geometry)
 *  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
 *  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/acos
 *  @see <img src="../Spherical.png">
 */
function cartesian2Spherical(p) {
    var phi = Math.acos(p[2]) / Math.PI; // acos  -> [0,pi]
    var theta = Math.atan2(p[1], -p[0]) / (2 * Math.PI); // atan2 -> [-pi,pi]
    theta += 0.5;

    return {
        s: clamp(theta, 0.0, 1.0),
        t: clamp(phi, 0.0, 1.0),
    };
}

/**
 * Class for creating the model of a sphere by continuously subdividing
 * a polyhedron.
 */
export class polyhedron {
    /**
     * @constructs polyhedron
     * @param {Boolean} fix whether to fix uv coordinates.
     */
    constructor(fix = true) {
        /**
         * Whether texture coordinates should be fixed.
         * @type {Boolean}
         */
        this.fix = fix;
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
    }

    /**
     * Adds a new triangle.
     * @param {vec3} a first vertex.
     * @param {vec3} b second vertex.
     * @param {vec3} c third vertex.
     */
    triangle(a, b, c) {
        this.pointsArray.push(a[0], a[1], a[2]);
        this.pointsArray.push(b[0], b[1], b[2]);
        this.pointsArray.push(c[0], c[1], c[2]);

        this.pointsIndices.push(this.index, this.index + 1, this.index + 2);

        var sc = [
            cartesian2Spherical(a),
            cartesian2Spherical(b),
            cartesian2Spherical(c),
        ];

        if (this.fix) this.fixUVCoordinates(sc);

        this.texCoords.push(sc[0].s, sc[0].t);
        this.texCoords.push(sc[1].s, sc[1].t);
        this.texCoords.push(sc[2].s, sc[2].t);

        // normals are vectors

        this.normalsArray.push(a[0], a[1], a[2]);
        this.normalsArray.push(b[0], b[1], b[2]);
        this.normalsArray.push(c[0], c[1], c[2]);

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
     * @returns {Object<{vertexPositions:Float32Array, vertexNormals:Float32Array, vertexTextureCoords:Float32Array,indices:Uint16Array}>}
     */
    tetrahedron({ vtx = initialTet, n = limit.tet }) {
        const [a, b, c, d] = vtx;
        this.resetBuffers();

        n = Math.min(limit.tet, n);

        this.divideTriangle(a, b, c, n);
        this.divideTriangle(d, c, b, n);
        this.divideTriangle(a, d, b, n);
        this.divideTriangle(a, c, d, n);

        return {
            vertexPositions: new Float32Array(this.pointsArray),
            vertexNormals: new Float32Array(this.normalsArray),
            vertexTextureCoords: new Float32Array(this.texCoords),
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
     * @returns {Object<{vertexPositions:Float32Array, vertexNormals:Float32Array, vertexTextureCoords:Float32Array,indices:Uint16Array}>}
     */
    octahedron({ vtx = initialOcta, n = limit.oct }) {
        const [a, b, c, d, e, f] = vtx;
        this.resetBuffers();

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
            indices: new Uint16Array(this.pointsIndices),
        };
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
     * @see https://gamedev.stackexchange.com/questions/148167/correcting-projection-of-360-content-onto-a-sphere-distortion-at-the-poles/148178#148178
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