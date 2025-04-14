/**
 * @file
 *
 * Summary.
 *
 * <p>TSL Tutorial Part 1</p>
 *
 * This is a simple WebGPU application
 * that uses Three.js and the Three.js Shading Language
 * ({@link https://sbcode.net/tsl/getting-started/ TSL}) to create a
 * textured cube that rotates in 3D space. The application uses the
 * {@link https://sbcode.net/threejs/webgpu-renderer/ WebGPURenderer}
 * to render the scene and the {@link https://threejs.org/docs/#examples/en/controls/OrbitControls OrbitControls}
 * to allow the user to interact with the camera. The application also includes
 * a GUI to set its parameters.
 *
 * @author {@link https://medium.com/@christianhelgeson Christian Helgeson}
 * @author {@link https://krotalias.github.io Paulo Roma}
 * @since 06/04/2025
 * @license MIT
 * @see <a href="/cwdc/15-webgpu/TSL_Tutorial_Part_1/index.html">link</a>
 * @see <a href="/cwdc/15-webgpu/TSL_Tutorial_Part_1/script.js">source</a>
 * @see <a href="/cwdc/15-webgpu/TSL_Tutorial_Part_1/vite.config.js">vite</a>
 * @see {@link https://medium.com/@christianhelgeson/three-js-webgpurenderer-part-1-fragment-vertex-shaders-1070063447f0 Three.JS WebGPURenderer Part 1: Fragment/Vertex Shaders}
 * @see {@link https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language Three.js Shading Language}
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Fn, uv, texture, time, negate, vec2 } from "three/tsl";

import GUI from "three/addons/libs/lil-gui.module.min.js";

let camera, scene, renderer;
let mesh;

/**
 * Initialize the application and create a
 * {@link https://threejs.org/docs/#api/en/cameras/PerspectiveCamera PerspectiveCamera}
 * with a FOV of 70°.
 */
function init() {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  // Set the camera back, so it's position does not intersect
  // with the center of the cube mesh.
  camera.position.z = 2;

  scene = new THREE.Scene();

  // Access texture via the relative path to the texture's file.
  const crateTexture = new THREE.TextureLoader().load("textures/crate.gif");
  // Bring the texture into the correct color space.
  // Removing this line will make the texture seem desaturated or washed out.
  texture.colorSpace = THREE.SRGBColorSpace;
  // Our texture will repeat even as we move uvs out of bounds
  crateTexture.wrapS = THREE.RepeatWrapping;
  crateTexture.wrapT = THREE.RepeatWrapping;

  // Add the key directional light to our scene
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 3, -7.5);
  scene.add(directionalLight);

  // Add a fill light of lower intensity (0.3) pointing in the opposite direction
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-5, 3, 3.5);
  scene.add(fillLight);

  // soft white light
  const light = new THREE.AmbientLight(0x404040, 2.0);
  scene.add(light);

  /**
   * <p>Apply a texture map to the material.</p>
   *
   * Converting our material from MeshBasicNodeMaterial to
   * {@link https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language#meshstandardnodematerial THREE.MeshStandardNodeMaterial}:
   * <pre>
   *    const material = new THREE.MeshBasicNodeMaterial({ map: crateTexture });
   * </pre>
   * will integrate lighting information into the
   * material's output, so we can manipulate the fragment values
   * the mesh material outputs, by modifying the NodeMaterial’s
   * {@link NodeMaterial.material.fragmentNode fragmentNode} property.
   * <pre>
   *    const material = new THREE.MeshStandardNodeMaterial();
   * </pre>
   * @class NodeMaterial
   * @global
   * @see {@link https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language#nodematerial NodeMaterial}
   */
  const material = new THREE.MeshStandardNodeMaterial();

  const useUv = false;
  if (useUv) {
    /**
     * Once we’ve applied uv() function to fragmentNode,
     * our mesh’s surfaces will display uvs in the range of 0 to 1,
     * overriding our material’s existing texture property.
     * By assigning this function to fragmentNode,
     * we apply our function as the new fragment shader of the material.
     * <pre>
     *    material.fragmentNode = uv();
     * </pre>
     * @memberof NodeMaterial
     */
    material.fragmentNode = uv();
  } else {
    /**
     * <p>Read texture values hold in fragment shader:</p>
     * <pre>
     *    material.fragmentNode = texture(crateTexture);
     * </pre>
     * <p>Or directly specify the coordinates we use to sample from a texture
     * by providing a uv node as a second argument:</p>
     *
     * In any instance where you apply a shader to the
     * {@link NodeMaterial.material.fragmentNode fragmentNode} of your material,
     * that shader will completely override the output fragment value of your mesh.
     * It will not matter whether your scene has a complex lighting setup.
     * It will not matter whether you have chosen a material that
     * can properly receive light and shadow.
     *
     * <p>Regardless of whatever elements you’ve added to your scene,
     * the code of a material’s fragmentNode will completely override
     * that material’s default fragment output:</p>
     * <pre>
     *    material.fragmentNode = texture(
     *      crateTexture,
     *      uv().add(vec2(time, negate(time))),
     *    );
     * </pre>
     * However, the colorNode acts like it sounds, only modifying the base color value
     * that a surface outputs without affecting how that base color is
     * affected by the larger lighting hierarchy of your scene:
     * <pre>
     *    material.colorNode = texture(
     *      crateTexture,
     *      uv().add(vec2(time, negate(time))),
     *    );
     * </pre>
     * @memberof NodeMaterial
     */
    material.colorNode = texture(
      crateTexture,
      uv().add(vec2(time, negate(time))),
    );
  }

  // Define the geometry of our mesh.
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  // Create a mesh with the specified geometry and material
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  // Rotate the mesh slightly
  mesh.rotation.y += Math.PI / 4;

  // Create a renderer and set it's animation loop.
  renderer = new THREE.WebGPURenderer({ antialias: false });
  // Set the renderer's pixel ratio.
  renderer.setPixelRatio(window.devicePixelRatio);
  // Set size of the renderer to cover the full size of the window.
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Tell renderer to run the 'animate' function per frame.
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  // Distance is defined as distance away from origin in the z-direction.
  controls.minDistance = 1;
  controls.maxDistance = 20;

  // Define the application's behavior upon window resize.
  window.addEventListener("resize", onWindowResize);
}

/**
 * Update the camera's aspect ratio and the renderer's size to reflect
 * the new screen dimensions upon a browser window resize.
 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Render one frame of the scene.
 */
function animate() {
  renderer.render(scene, camera);
}

/**
 * Application entry point.
 */
window.addEventListener("load", init);
