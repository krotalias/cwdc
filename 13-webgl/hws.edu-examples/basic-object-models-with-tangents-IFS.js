/**
 * @file
 *
 * Summary.
 * <p>The functions in this file create models in an
 * {@link https://math.hws.edu/eck/cs424/downloads/graphicsbook-linked.pdf#page=200 IFS}
 * (Indexed Face Set) format that can be drawn using
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements gl.drawElements}
 * with primitive type {@link https://webglfundamentals.org/webgl/lessons/webgl-points-lines-triangles.html gl.TRIANGLES}.</p>
 *
 * Objects have for each vertex:
 *  <ul>
 *    <li>vertex coordinates, </li>
 *    <li>normal vectors, </li>
 *    <li>texture coordinates, </li>
 *    <li>vertex tangents, </li>
 *    <li>plus a list of indices for the element array buffer.</li>
 *  </ul>
 *
 * The return value of each function is an object, {@link modelData model},
 * with properties:
 * <pre>
 *    model.vertexPositions -- the vertex coordinates;
 *    model.vertexNormals -- the normal vectors;
 *    model.vertexTextureCoords -- the texture coordinates;
 *    model.vertexTangents -- the tangent vectors;
 *    model.indices -- the face indices.
 * </pre>
 * The first four properties are of type Float32Array, while
 * model.indices is of type Uint16Array.
 *
 * <ul>
 *  <li>{@link uvCone cone}</li>
 *  <li>{@link cube cube}</li>
 *  <li>{@link uvCylinder cylinder}</li>
 *  <li>{@link uvSphere sphere}</li>
 *  <li>{@link uvTorus torus}</li>
 * </ul>
 *
 * @author {@link https://math.hws.edu/eck/ David J. Eck}
 * @author modified by Paulo Roma
 * @authora modified by Paulo Roma
 * @since 19/11/2022
 * @see <a href="/cwdc/13-webgl/hws.edu-examples/basic-object-models-with-tangents-IFS.js">source</a>
 *
 */

"use strict";

/**
 * An object containing raw data for vertex
 * positions, normal vectors, texture coordinates, tangent vectors and indices.
 * @typedef {Object} modelData
 * @property {Float32Array} vertexPositions vertex coordinates.
 * @property {Float32Array} vertexNormals vertex normals.
 * @property {Float32Array} vertexTextureCoords texture coordinates.
 * @property {Float32Array} vertexTangents vertex tangents.
 * @property {Uint16Array|Uint32Array} indices index array.
 */

/**
 * Sets the North to be the y-axis,
 * so the z-axis points outside the screen.
 * @type {Boolean}
 */
let yNorth = true;

/**
 * <p>Rotate the given model so the y-axis points North.</p>
 * The variable {@link yNorth} must be true, otherwise this function has no effect.
 * @param {Float32Array} vertices vertex array.
 * @param {Float32Array} normals normal array.
 */
function setNorth(vertices, normals) {
  if (yNorth) {
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i] = -vertices[i]; // x
      [vertices[i + 1], vertices[i + 2]] = [vertices[i + 2], vertices[i + 1]];
      normals[i] = -normals[i]; // x
      [normals[i + 1], normals[i + 2]] = [normals[i + 2], normals[i + 1]];
    }
  }
}

/**
 * <p>Create a model of a cube, centered at the origin.</p>
 * This is not a particularly good format for a cube,
 * since an IFS representation has a lot of redundancy.
 * @param {Number} side the length of a side of the cube.<br>
 *       If not given, the value will be 1.
 * @return {modelData}
 */
function cube(side) {
  let s = (side || 1) / 2;
  let coords = [];
  let normals = [];
  let tangents = [];
  let texCoords = [];
  let indices = [];
  function face(xyz, nrm, tang) {
    let start = coords.length / 3;
    let i;
    for (i = 0; i < 12; i++) {
      coords.push(xyz[i]);
    }
    for (i = 0; i < 4; i++) {
      normals.push(nrm[0], nrm[1], nrm[2]);
    }
    for (i = 0; i < 4; i++) {
      tangents.push(tang[0], tang[1], tang[2]);
    }
    texCoords.push(0, 0, 1, 0, 1, 1, 0, 1);
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  }
  face([-s, -s, s, s, -s, s, s, s, s, -s, s, s], [0, 0, 1], [1, 0, 0]);
  face([-s, -s, -s, -s, s, -s, s, s, -s, s, -s, -s], [0, 0, -1], [0, 1, 0]);
  face([-s, s, -s, -s, s, s, s, s, s, s, s, -s], [0, 1, 0], [0, 0, 1]);
  face([-s, -s, -s, s, -s, -s, s, -s, s, -s, -s, s], [0, -1, 0], [1, 0, 0]);
  face([s, -s, -s, s, s, -s, s, s, s, s, -s, s], [1, 0, 0], [0, 1, 0]);
  face([-s, -s, -s, -s, -s, s, -s, s, s, -s, s, -s], [-1, 0, 0], [0, 0, 1]);
  return {
    vertexPositions: new Float32Array(coords),
    vertexNormals: new Float32Array(normals),
    vertexTextureCoords: new Float32Array(texCoords),
    vertexTangents: new Float32Array(tangents),
    indices: new Uint16Array(indices),
  };
}

/**
 * <p>Create a model of a torus (surface of a doughnut).</p>
 * The z-axis goes through the doughnut hole,
 * and the center of the torus is at (0,0,0).
 * @param {Number} outerRadius the distance from the center to the outside of the tube, 0.5 if not specified.
 * @param {Number} innerRadius the distance from the center to the inside of the tube, outerRadius/3 if not
 *    specified.  <br>
 *    This is the radius of the doughnut hole.
 * @param {Number} slices the number of lines of longitude, default 32. <br>
 *    These are slices parallel to the
 *    z-axis and go around the tube the short way (through the hole).
 * @param {Number} stacks the number of lines of latitude plus 1, default 16. <br>
 *    These lines are perpendicular
 *    to the z-axis and go around the tube the long way (around the hole).
 * @return {modelData}
 * @see <a href="/cwdc/downloads/cg/doc/html/torus_8cpp.html#acf04d1331c5f0cedfaacc30d1d3f46f4">torus</a>
 * @see <img src="../torusparams.gif">
 */
function uvTorus(outerRadius, innerRadius, slices, stacks) {
  outerRadius = outerRadius || 0.5;
  innerRadius = innerRadius || outerRadius / 3;
  slices = slices || 32;
  stacks = stacks || 16;
  let vertexCount = (slices + 1) * (stacks + 1);
  let vertices = new Float32Array(3 * vertexCount);
  let normals = new Float32Array(3 * vertexCount);
  let tangents = new Float32Array(3 * vertexCount);
  let texCoords = new Float32Array(2 * vertexCount);
  let indices = new Uint16Array(2 * slices * stacks * 3);
  let du = (2 * Math.PI) / slices;
  let dv = (2 * Math.PI) / stacks;
  let centerRadius = (innerRadius + outerRadius) / 2;
  let tubeRadius = outerRadius - centerRadius;
  let i, j, u, v, cx, cy, sin, cos, x, y, z;
  let indexV = 0;
  let indexT = 0;
  for (j = 0; j <= stacks; j++) {
    v = -Math.PI + j * dv;
    cos = Math.cos(v);
    sin = Math.sin(v);
    for (i = 0; i <= slices; i++) {
      u = i * du;
      cx = Math.cos(u);
      cy = Math.sin(u);
      x = cx * (centerRadius + tubeRadius * cos);
      y = cy * (centerRadius + tubeRadius * cos);
      z = sin * tubeRadius;
      vertices[indexV] = x;
      tangents[indexV] = -cy;
      normals[indexV++] = cx * cos;
      vertices[indexV] = y;
      tangents[indexV] = cx;
      normals[indexV++] = cy * cos;
      vertices[indexV] = z;
      tangents[indexV] = 0;
      normals[indexV++] = sin;
      texCoords[indexT++] = i / slices;
      texCoords[indexT++] = j / stacks;
    }
  }
  let k = 0;
  for (j = 0; j < stacks; j++) {
    let row1 = j * (slices + 1);
    let row2 = (j + 1) * (slices + 1);
    for (i = 0; i < slices; i++) {
      indices[k++] = row1 + i;
      indices[k++] = row2 + i + 1;
      indices[k++] = row2 + i;
      indices[k++] = row1 + i;
      indices[k++] = row1 + i + 1;
      indices[k++] = row2 + i + 1;
    }
  }
  return {
    vertexPositions: vertices,
    vertexNormals: normals,
    vertexTextureCoords: texCoords,
    vertexTangents: tangents,
    indices: indices,
  };
}

/**
 * <p>Defines a model of a cylinder.</p>
 * The axis of the cylinder is the z-axis,
 * and the center is at (0,0,0).
 * @param {Number} radius the radius of the cylinder
 * @param {Number} height the height of the cylinder.  The cylinder extends from -height/2
 * to height/2 along the z-axis.
 * @param {Number} slices the number of slices, like the slices of an orange.
 * @param {Boolean} noTop if missing or false, the cylinder has a top; if set to true,
 *   the cylinder does not have a top. <br>
 *   The top is a disk at the positive end of the cylinder.
 * @param {Boolean} noBottom if missing or false, the cylinder has a bottom; if set to true,
 *   the cylinder does not have a bottom. <br>
 *   The bottom is a disk at the negative end of the cylinder.
 * @return {modelData}
 * @see <a href="/cwdc/downloads/cg/doc/html/torus_8cpp.html#a03c085eb7ef8ae60df19dc9e06c0a173">cylinder</a>
 */
function uvCylinder(radius, height, slices, noTop, noBottom) {
  radius = radius || 0.5;
  height = height || 2 * radius;
  slices = slices || 32;
  let vertexCount = 2 * (slices + 1);
  if (!noTop) vertexCount += slices + 2;
  if (!noBottom) vertexCount += slices + 2;
  let triangleCount = 2 * slices;
  if (!noTop) triangleCount += slices;
  if (!noBottom) triangleCount += slices;
  let vertices = new Float32Array(vertexCount * 3);
  let normals = new Float32Array(vertexCount * 3);
  let tangents = new Float32Array(vertexCount * 3);
  let texCoords = new Float32Array(vertexCount * 2);
  let indices = new Uint16Array(triangleCount * 3);
  let du = (2 * Math.PI) / slices;
  let kv = 0;
  let kt = 0;
  let k = 0;
  let i, u;
  for (i = 0; i <= slices; i++) {
    u = i * du;
    let c = Math.cos(u);
    let s = Math.sin(u);
    vertices[kv] = c * radius;
    tangents[kv] = -s;
    normals[kv++] = c;
    vertices[kv] = s * radius;
    tangents[kv] = c;
    normals[kv++] = s;
    vertices[kv] = -height / 2;
    tangents[kv] = 0;
    normals[kv++] = 0;
    texCoords[kt++] = i / slices;
    texCoords[kt++] = 0;
    vertices[kv] = c * radius;
    tangents[kv] = -s;
    normals[kv++] = c;
    vertices[kv] = s * radius;
    tangents[kv] = c;
    normals[kv++] = s;
    vertices[kv] = height / 2;
    tangents[kv] = 0;
    normals[kv++] = 0;
    texCoords[kt++] = i / slices;
    texCoords[kt++] = 1;
  }
  for (i = 0; i < slices; i++) {
    indices[k++] = 2 * i;
    indices[k++] = 2 * i + 3;
    indices[k++] = 2 * i + 1;
    indices[k++] = 2 * i;
    indices[k++] = 2 * i + 2;
    indices[k++] = 2 * i + 3;
  }
  let startIndex = kv / 3;
  if (!noBottom) {
    vertices[kv] = 0;
    tangents[kv] = -1;
    normals[kv++] = 0;
    vertices[kv] = 0;
    tangents[kv] = 0;
    normals[kv++] = 0;
    vertices[kv] = -height / 2;
    tangents[kv] = 0;
    normals[kv++] = -1;
    texCoords[kt++] = 0.5;
    texCoords[kt++] = 0.5;
    for (i = 0; i <= slices; i++) {
      u = 2 * Math.PI - i * du;
      let c = Math.cos(u);
      let s = Math.sin(u);
      vertices[kv] = c * radius;
      tangents[kv] = -1;
      normals[kv++] = 0;
      vertices[kv] = s * radius;
      tangents[kv] = 0;
      normals[kv++] = 0;
      vertices[kv] = -height / 2;
      tangents[kv] = 0;
      normals[kv++] = -1;
      texCoords[kt++] = 0.5 - 0.5 * c;
      texCoords[kt++] = 0.5 + 0.5 * s;
    }
    for (i = 0; i < slices; i++) {
      indices[k++] = startIndex;
      indices[k++] = startIndex + i + 1;
      indices[k++] = startIndex + i + 2;
    }
  }
  startIndex = kv / 3;
  if (!noTop) {
    vertices[kv] = 0;
    tangents[kv] = 1;
    normals[kv++] = 0;
    vertices[kv] = 0;
    tangents[kv] = 0;
    normals[kv++] = 0;
    vertices[kv] = height / 2;
    tangents[kv] = 0;
    normals[kv++] = 1;
    texCoords[kt++] = 0.5;
    texCoords[kt++] = 0.5;
    for (i = 0; i <= slices; i++) {
      u = i * du;
      let c = Math.cos(u);
      let s = Math.sin(u);
      vertices[kv] = c * radius;
      tangents[kv] = 1;
      normals[kv++] = 0;
      vertices[kv] = s * radius;
      tangents[kv] = 0;
      normals[kv++] = 0;
      vertices[kv] = height / 2;
      tangents[kv] = 0;
      normals[kv++] = 1;
      texCoords[kt++] = 0.5 + 0.5 * c;
      texCoords[kt++] = 0.5 + 0.5 * s;
    }
    for (i = 0; i < slices; i++) {
      indices[k++] = startIndex;
      indices[k++] = startIndex + i + 1;
      indices[k++] = startIndex + i + 2;
    }
  }
  setNorth(vertices, normals);

  return {
    vertexPositions: vertices,
    vertexNormals: normals,
    vertexTangents: tangents,
    vertexTextureCoords: texCoords,
    indices: indices,
  };
}

/**
 * <p>Create a model of a sphere.</p>
 * The z-axis is the axis of the sphere,
 * with the north pole on the positive z-axis and the center at (0,0,0).
 * @param {Number} radius the radius of the sphere, default 0.5 if not specified.
 * @param {Number} slices the number of lines of longitude, default 32
 * @param {Number} stacks the number of lines of latitude plus 1, default 16.<br>
 *    This is the number of vertical slices, bounded by lines of latitude,
 *    the north pole and the south pole.
 * @return {modelData}
 * @see <a href="/cwdc/downloads/cg/doc/html/torus_8cpp.html#a6c5b17163125dd32bd7c04a99738d316">sphere</a>
 */
function uvSphere(radius, slices, stacks) {
  radius = radius || 0.5;
  slices = slices || 32;
  stacks = stacks || 16;
  var vertexCount = (slices + 1) * (stacks + 1);
  var vertices = new Float32Array(3 * vertexCount);
  var normals = new Float32Array(3 * vertexCount);
  let tangents = new Float32Array(3 * vertexCount);
  var texCoords = new Float32Array(2 * vertexCount);
  var indices = new Uint16Array(2 * slices * stacks * 3);
  var du = (2 * Math.PI) / slices;
  var dv = Math.PI / stacks;
  var i, j, u, v, x, y, z;
  var indexV = 0;
  var indexT = 0;
  for (i = 0; i <= stacks; i++) {
    v = -Math.PI / 2 + i * dv;
    for (j = 0; j <= slices; j++) {
      u = j * du;
      if (yNorth) {
        x = -Math.cos(u) * Math.cos(v);
        y = Math.sin(v);
        z = Math.sin(u) * Math.cos(v);
      } else {
        x = Math.cos(u) * Math.cos(v);
        y = Math.sin(u) * Math.cos(v);
        z = Math.sin(v);
      }
      vertices[indexV] = radius * x;
      tangents[indexV] = -y;
      normals[indexV++] = x;
      vertices[indexV] = radius * y;
      tangents[indexV] = x;
      normals[indexV++] = y;
      vertices[indexV] = radius * z;
      tangents[indexV] = 0;
      normals[indexV++] = z;
      texCoords[indexT++] = j / slices;
      texCoords[indexT++] = i / stacks;
    }
  }
  var k = 0;
  for (j = 0; j < stacks; j++) {
    var row1 = j * (slices + 1);
    var row2 = (j + 1) * (slices + 1);
    for (i = 0; i < slices; i++) {
      indices[k++] = row1 + i;
      indices[k++] = row2 + i + 1;
      indices[k++] = row2 + i;
      indices[k++] = row1 + i;
      indices[k++] = row1 + i + 1;
      indices[k++] = row2 + i + 1;
    }
  }
  return {
    vertexPositions: vertices,
    vertexNormals: normals,
    vertexTangents: tangents,
    vertexTextureCoords: texCoords,
    indices: indices,
  };
}

/**
 * <p>Defines a model of a cone.</p>
 * The axis of the cone is the z-axis,
 * and the center is at (0,0,0).
 * @param {Number} radius the radius of the cone.
 * @param {Number} height the height of the cone. <br>
 *      The cone extends from -height/2 to height/2 along the z-axis, <br>
 *      with the tip at (0,0,height/2).
 * @param {Number} slices the number of slices, like the slices of an orange.
 * @param {Boolean} noBottom if missing or false, the cone has a bottom;
 *    if set to true, the cone does not have a bottom. <br>
 *    The bottom is a disk at the wide end of the cone.
 * @return {modelData}
 * @see <a href="/cwdc/downloads/cg/doc/html/torus_8cpp.html#a2106dc9326540a0309d6e8d815e10a0e">cone</a>
 */
function uvCone(radius, height, slices, noBottom) {
  radius = radius || 0.5;
  height = height || 2 * radius;
  slices = slices || 32;
  var fractions = [0, 0.5, 0.75, 0.875, 0.9375];
  var vertexCount = fractions.length * (slices + 1) + slices;
  if (!noBottom) vertexCount += slices + 2;
  var triangleCount = (fractions.length - 1) * slices * 2 + slices;
  if (!noBottom) triangleCount += slices;
  var vertices = new Float32Array(vertexCount * 3);
  var normals = new Float32Array(vertexCount * 3);
  var tangents = new Float32Array(vertexCount * 3);
  var texCoords = new Float32Array(vertexCount * 2);
  var indices = new Uint16Array(triangleCount * 3);
  var normallength = Math.sqrt(height * height + radius * radius);
  var n1 = height / normallength;
  var n2 = radius / normallength;
  var du = (2 * Math.PI) / slices;
  var kv = 0;
  var kt = 0;
  var k = 0;
  var i, j, u;
  for (j = 0; j < fractions.length; j++) {
    var uoffset = j % 2 == 0 ? 0 : 0.5;
    for (i = 0; i <= slices; i++) {
      var h1 = -height / 2 + fractions[j] * height;
      u = (i + uoffset) * du;
      var c = Math.cos(u);
      var s = Math.sin(u);
      vertices[kv] = c * radius * (1 - fractions[j]);
      tangents[kv] = -s * n1;
      normals[kv++] = c * n1;
      vertices[kv] = s * radius * (1 - fractions[j]);
      tangents[kv] = c * n1;
      normals[kv++] = s * n1;
      vertices[kv] = h1;
      tangents[kv] = 0;
      normals[kv++] = n2;
      texCoords[kt++] = (i + uoffset) / slices;
      texCoords[kt++] = fractions[j];
    }
  }
  var k = 0;
  for (j = 0; j < fractions.length - 1; j++) {
    var row1 = j * (slices + 1);
    var row2 = (j + 1) * (slices + 1);
    for (i = 0; i < slices; i++) {
      indices[k++] = row1 + i;
      indices[k++] = row2 + i + 1;
      indices[k++] = row2 + i;
      indices[k++] = row1 + i;
      indices[k++] = row1 + i + 1;
      indices[k++] = row2 + i + 1;
    }
  }
  var start = kv / 3 - (slices + 1);
  for (i = 0; i < slices; i++) {
    // slices points at top, with different normals, texcoords
    u = (i + 0.5) * du;
    var c = Math.cos(u);
    var s = Math.sin(u);
    vertices[kv] = 0;
    tangents[kv] = -s * n1;
    normals[kv++] = c * n1;
    vertices[kv] = 0;
    tangents[kv] = c * n1;
    normals[kv++] = s * n1;
    vertices[kv] = height / 2;
    tangents[kv] = 0;
    normals[kv++] = n2;
    texCoords[kt++] = (i + 0.5) / slices;
    texCoords[kt++] = 1;
  }
  for (i = 0; i < slices; i++) {
    indices[k++] = start + i;
    indices[k++] = start + i + 1;
    indices[k++] = start + (slices + 1) + i;
  }
  if (!noBottom) {
    var startIndex = kv / 3;
    vertices[kv] = 0;
    tangents[kv] = -1;
    normals[kv++] = 0;
    vertices[kv] = 0;
    tangents[kv] = 0;
    normals[kv++] = 0;
    vertices[kv] = -height / 2;
    tangents[kv] = 0;
    normals[kv++] = -1;
    texCoords[kt++] = 0.5;
    texCoords[kt++] = 0.5;
    for (i = 0; i <= slices; i++) {
      u = 2 * Math.PI - i * du;
      var c = Math.cos(u);
      var s = Math.sin(u);
      vertices[kv] = c * radius;
      tangents[kv] = -1;
      normals[kv++] = 0;
      vertices[kv] = s * radius;
      tangents[kv] = 0;
      normals[kv++] = 0;
      vertices[kv] = -height / 2;
      tangents[kv] = 0;
      normals[kv++] = -1;
      texCoords[kt++] = 0.5 - 0.5 * c;
      texCoords[kt++] = 0.5 + 0.5 * s;
    }
    for (i = 0; i < slices; i++) {
      indices[k++] = startIndex;
      indices[k++] = startIndex + i + 1;
      indices[k++] = startIndex + i + 2;
    }
  }
  setNorth(vertices, normals);

  return {
    vertexPositions: vertices,
    vertexNormals: normals,
    vertexTangents: tangents,
    vertexTextureCoords: texCoords,
    indices: indices,
  };
}
