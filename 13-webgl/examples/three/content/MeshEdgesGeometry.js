/** @module */

/**
 * @file
 *
 * Summary.
 *
 * <p>MeshEdgesGeometry is a simple class to extract edges from a Three.js {@link external:THREE.Object3D object}
 * - a mesh or a group with children.</p>
 *
 * The hierarchy and substructures of the input object are flattened out.
 * Their positions, scales and rotations are baked into world coordinates.
 *
 * MeshEdgesGeometry is like {@link https://threejs.org/docs/#api/en/geometries/EdgesGeometry THREE.EdgesGeometry},
 * except that it does not work on {@link external:THREE.BufferGeometry},
 * but on {@link external:THREE.Object3D}.
 *
 * @author {@link https://github.com/boytchev Pavel Boytchev}
 * @see <a href="/cwdc/13-webgl/examples/three/content/MeshEdgesGeometry.js">source</a>
 * @see {@link https://github.com/boytchev/MeshEdgesGeometry github}
 */

import { BufferGeometry, EdgesGeometry } from "three";
import { mergeAttributes } from "three/addons/utils/BufferGeometryUtils.js";

/**
 * This is the base class for most objects in three.js and provides
 * a set of properties and methods for manipulating objects in 3D space.
 * @memberof external:THREE
 * @class Object3D
 * @see {@link https://threejs.org/docs/#api/en/core/Object3D Object3D}
 */

/**
 * This class stores data for an attribute (such as vertex positions,
 * face indices, normals, colors, UVs, and any custom attributes )
 * associated with a BufferGeometry, which allows for more efficient passing of data to the GPU.
 * See that page for details and a usage example.
 * When working with vector-like data, the .fromBufferAttribute( attribute, index )
 * helper methods on Vector2, Vector3, Vector4, and Color classes may be helpful.
 * @memberof external:THREE
 * @class BufferAttribute
 * @see {@link https://threejs.org/docs/#api/en/core/BufferAttribute BufferAttribute}
 */

/**
 * Class for extracting edges from gltf files.
 * @class
 * @extends external:THREE.BufferGeometry
 */
class MeshEdgesGeometry extends BufferGeometry {
  /**
   * @constructor
   * @param {external:THREE.Scene} object Any geometry object.
   * @param {Number} thresholdAngle An edge is only rendered if the angle (in degrees) between<br>
   * the face normals of the adjoining faces exceeds this value. <br> default = 1 degree.
   */
  constructor(object, thresholdAngle = 1) {
    super();
    object.updateWorldMatrix(true, true);
    const position = this.extractEdges(object, thresholdAngle);
    this.setAttribute("position", position);
  }

  /**
   * Extract edges - each edge is an individual segment.
   * @param {external:THREE.Scene} object Any geometry object.
   * @param {Number} thresholdAngle An edge is only rendered if the angle (in degrees) between<br>
   * the face normals of the adjoining faces exceeds this value. <br> default = 1 degree.
   * @return {external:THREE.BufferAttribute} position buffer.
   * @see {@link https://threejs.org/docs/#examples/en/utils/BufferGeometryUtils.mergeBufferGeometries mergeBufferGeometries}
   */
  extractEdges(object, thresholdAngle) {
    const attributes = [];
    object.traverse((child) => {
      if (child.geometry) {
        const geo = new EdgesGeometry(child.geometry, thresholdAngle);
        const pos = geo.getAttribute("position");
        attributes.push(pos.applyMatrix4(child.matrixWorld));
      }
    });
    if (attributes.length == 0) {
      throw "MeshEdgesGeometry: No edges found";
    }
    return mergeAttributes(attributes);
  }
}

export { MeshEdgesGeometry };
