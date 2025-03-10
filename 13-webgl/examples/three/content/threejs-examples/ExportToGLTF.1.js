/**
 * @file
 *
 * Summary.
 *
 * <p>Class for exporting a scene or a model to a file in GLTF format.</p>
 *
 * @since 10/03/2025
 * @author {@link https://krotalias.github.io Paulo Roma}
 * @copyright © 2025 Paulo R Cavalcanti
 * @license {@link https://opensource.org/license/mit MIT License}
 * @see <a href="/cwdc/13-webgl/threejs-examples/ExportToGLTF.1.js">source</a>
 * @see <a href="https://threejs.org/examples/#misc_exporter_gltf">threejs example</a>
 */

import * as TextureUtils from "three/addons/utils/WebGLTextureUtils.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

/**
 * Class for exporting to a file (scene.gltf or scene.glb) in gltf format.
 */
export class ExportToGLTF {
  /**
   * Create a GLTFExporter object and an anchor HTMLElement.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement Document: createElement() method}
   * @see {@link https://threejs.org/docs/#examples/en/exporters/GLTFExporter GLTFExporter}
   */
  constructor() {
    this.gltfExporter = new GLTFExporter().setTextureUtils(TextureUtils);

    this.link = document.createElement("a");
    this.link.style.display = "none";
    document.body.appendChild(this.link); // Firefox workaround, see #6594
  }

  /**
   * Export the scene to GLTF format.
   * @param {THREE.Object3D} input the scene to export.
   * @param {Object} params {@link https://threejs.org/docs/#examples/en/exporters/GLTFExporter.parse GLTFExporter.parse} options.
   * @property {boolean} [params.trs=false] export position, rotation and scale instead of matrix per node.
   * @property {boolean} [params.onlyVisible=true] export only visible objects.
   * @property {boolean} [params.binary=false] export in binary (.glb) format, returning an ArrayBuffer.
   * @property {number} [params.maxTextureSize=infinity] restricts the image maximum size (both width and height) to the given value.
   * @property {Array<AnimationClip>} [params.animations=null] a List of animations to be included in the export.
   * @property {boolean} [params.includeCustomExtensions=false] export custom glTF extensions defined on an object's userData.gltfExtensions property.
   *
   * @see {@link https://threejs.org/docs/#examples/en/exporters/GLTFExporter GLTFExporter}
   */
  exportGLTF(input, params) {
    let trs, onlyVisible, binary, maxTextureSize;
    const options = params
      ? ({ trs, onlyVisible, binary, maxTextureSize } = params)
      : undefined;

    this.gltfExporter
      .parseAsync(input, options)
      .then((result) => {
        if (result instanceof ArrayBuffer) {
          this.saveArrayBuffer(result, "scene.glb");
        } else {
          const output = JSON.stringify(result, null, 2);
          console.log(output);
          this.saveString(output, "scene.gltf");
        }
      })
      .catch((error) => {
        console.log("An error happened during parsing", error);
      });
  }

  /**
   * Save a blob to a file, which is a file-like object of immutable, raw data;
   * they can be read as text or binary data, or converted into a ReadableStream
   * so its methods can be used for processing the data.
   * @param {Blob} blob a file-like object of immutable, raw data.
   * @param {string} filename file name.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob}
   */
  save(blob, filename) {
    this.link.href = URL.createObjectURL(blob);
    this.link.download = filename;
    this.link.click();

    // URL.revokeObjectURL( url ); breaks Firefox...
  }

  /**
   * Save a string to a file.
   * @param {string} text Blob as JSON string.
   * @param {string} filename file name.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify JSON.stringify()}
   */
  saveString(text, filename) {
    this.save(new Blob([text], { type: "text/plain" }), filename);
  }

  /**
   * Save an array buffer to a file.
   * @param {ArrayBuffer} buffer Blob as binary data.
   * @param {string} filename file name.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob}
   */
  saveArrayBuffer(buffer, filename) {
    this.save(
      new Blob([buffer], { type: "application/octet-stream" }),
      filename,
    );
  }
}
