/**
 * @file
 *
 * Summary.
 *
 * <p>Create a scene with several models and export them to a file in GLTF format.</p>
 *
 * @since 10/03/2025
 * @author {@link https://github.com/mrdoob/three.js/blob/master/examples/misc_exporter_gltf.html unknown}
 * @see <a href="/cwdc/13-webgl/threejs-examples/misc_exporter_gltf.html">link</a>
 * @see <a href="/cwdc/13-webgl/threejs-examples/misc_exporter_gltf.js">source</a>
 * @see <a href="/cwdc/13-webgl/threejs-examples/ExportToGLTF.1.js">ExportToGLTF source</a>
 * @see <a href="https://threejs.org/examples/#misc_exporter_gltf">threejs example</a>
 * @see {@link https://discoverthreejs.com/book/first-steps/animation-system/ The three.js Animation System}
 */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { ExportToGLTF } from "./ExportToGLTF.1.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js?module";

const exporter = new ExportToGLTF();

let container;

let camera, object, object2, material, geometry, scene1, scene2, renderer;
let gridHelper, sphere, model, coffeemat;

const params = {
  trs: false,
  onlyVisible: true,
  binary: false,
  maxTextureSize: 4096,
  autoRotate: true,
  exportScene1: exportScene1,
  exportScenes: exportScenes,
  exportSphere: exportSphere,
  exportModel: exportModel,
  exportObjects: exportObjects,
  exportSceneObject: exportSceneObject,
  exportCompressedObject: exportCompressedObject,
};

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  // Make linear gradient texture

  const data = new Uint8ClampedArray(100 * 100 * 4);

  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < 100; x++) {
      const stride = 4 * (100 * y + x);

      data[stride] = Math.round((255 * y) / 99);
      data[stride + 1] = Math.round(255 - (255 * y) / 99);
      data[stride + 2] = 0;
      data[stride + 3] = 255;
    }
  }

  const gradientTexture = new THREE.DataTexture(
    data,
    100,
    100,
    THREE.RGBAFormat,
  );
  gradientTexture.minFilter = THREE.LinearFilter;
  gradientTexture.magFilter = THREE.LinearFilter;
  gradientTexture.needsUpdate = true;

  scene1 = new THREE.Scene();
  scene1.name = "Scene1";

  // ---------------------------------------------------------------------
  // Perspective Camera
  // ---------------------------------------------------------------------
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    2000,
  );
  camera.position.set(600, 400, 0);

  camera.name = "PerspectiveCamera";
  scene1.add(camera);

  // ---------------------------------------------------------------------
  // Ambient light
  // ---------------------------------------------------------------------
  const ambientLight = new THREE.AmbientLight(0xcccccc);
  ambientLight.name = "AmbientLight";
  scene1.add(ambientLight);

  // ---------------------------------------------------------------------
  // DirectLight
  // ---------------------------------------------------------------------
  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.target.position.set(0, 0, -1);
  dirLight.add(dirLight.target);
  dirLight.lookAt(-1, -1, 0);
  dirLight.name = "DirectionalLight";
  scene1.add(dirLight);

  // ---------------------------------------------------------------------
  // Grid
  // ---------------------------------------------------------------------
  gridHelper = new THREE.GridHelper(2000, 20, 0xc1c1c1, 0x8d8d8d);
  gridHelper.position.y = -50;
  gridHelper.name = "Grid";
  scene1.add(gridHelper);

  // ---------------------------------------------------------------------
  // Axes
  // ---------------------------------------------------------------------
  const axes = new THREE.AxesHelper(500);
  axes.name = "AxesHelper";
  scene1.add(axes);

  // ---------------------------------------------------------------------
  // Simple geometry with basic material
  // ---------------------------------------------------------------------
  // Icosahedron
  const mapGrid = new THREE.TextureLoader().load("textures/uv_grid_opengl.jpg");
  mapGrid.wrapS = mapGrid.wrapT = THREE.RepeatWrapping;
  mapGrid.colorSpace = THREE.SRGBColorSpace;
  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: mapGrid,
  });

  object = new THREE.Mesh(new THREE.IcosahedronGeometry(75, 0), material);
  object.position.set(-200, 0, 200);
  object.name = "Icosahedron";
  scene1.add(object);

  // Octahedron
  material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    wireframe: true,
  });
  object = new THREE.Mesh(new THREE.OctahedronGeometry(75, 1), material);
  object.position.set(0, 0, 200);
  object.name = "Octahedron";
  scene1.add(object);

  // Tetrahedron
  material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.5,
  });

  object = new THREE.Mesh(new THREE.TetrahedronGeometry(75, 0), material);
  object.position.set(200, 0, 200);
  object.name = "Tetrahedron";
  scene1.add(object);

  // ---------------------------------------------------------------------
  // Buffered geometry primitives
  // ---------------------------------------------------------------------
  // Sphere
  material = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    metalness: 0.5,
    roughness: 1.0,
    flatShading: true,
  });
  material.map = gradientTexture;
  material.bumpMap = mapGrid;
  sphere = new THREE.Mesh(new THREE.SphereGeometry(70, 10, 10), material);
  sphere.position.set(0, 0, 0);
  sphere.name = "Sphere";
  scene1.add(sphere);

  // Cylinder
  material = new THREE.MeshStandardMaterial({
    color: 0xff00ff,
    flatShading: true,
  });
  object = new THREE.Mesh(new THREE.CylinderGeometry(10, 80, 100), material);
  object.position.set(200, 0, 0);
  object.name = "Cylinder";
  scene1.add(object);

  // TorusKnot
  material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    roughness: 1,
  });
  object = new THREE.Mesh(
    new THREE.TorusKnotGeometry(50, 15, 40, 10),
    material,
  );
  object.position.set(-200, 0, 0);
  object.name = "Cylinder";
  scene1.add(object);

  // ---------------------------------------------------------------------
  // Hierarchy
  // ---------------------------------------------------------------------
  const mapWood = new THREE.TextureLoader().load(
    "textures/hardwood2_diffuse.jpg",
  );
  material = new THREE.MeshStandardMaterial({
    map: mapWood,
    side: THREE.DoubleSide,
  });

  object = new THREE.Mesh(new THREE.BoxGeometry(40, 100, 100), material);
  object.position.set(-200, 0, 400);
  object.name = "Cube";
  scene1.add(object);

  object2 = new THREE.Mesh(
    new THREE.BoxGeometry(40, 40, 40, 2, 2, 2),
    material,
  );
  object2.position.set(0, 0, 50);
  object2.rotation.set(0, 45, 0);
  object2.name = "SubCube";
  object.add(object2);

  // ---------------------------------------------------------------------
  // Groups
  // ---------------------------------------------------------------------
  const group1 = new THREE.Group();
  group1.name = "Group";
  scene1.add(group1);

  const group2 = new THREE.Group();
  group2.name = "subGroup";
  group2.position.set(0, 50, 0);
  group1.add(group2);

  object2 = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), material);
  object2.name = "Cube in group";
  object2.position.set(0, 0, 400);
  group2.add(object2);

  // ---------------------------------------------------------------------
  // THREE.Line Strip
  // ---------------------------------------------------------------------
  geometry = new THREE.BufferGeometry();
  let numPoints = 100;
  let positions = new Float32Array(numPoints * 3);

  for (let i = 0; i < numPoints; i++) {
    positions[i * 3] = i;
    positions[i * 3 + 1] = Math.sin(i / 2) * 20;
    positions[i * 3 + 2] = 0;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  object = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color: 0xffff00 }),
  );
  object.position.set(-50, 0, -200);
  scene1.add(object);

  // ---------------------------------------------------------------------
  // THREE.Line Loop
  // ---------------------------------------------------------------------
  geometry = new THREE.BufferGeometry();
  numPoints = 5;
  const radius = 70;
  positions = new Float32Array(numPoints * 3);

  for (let i = 0; i < numPoints; i++) {
    const s = (i * Math.PI * 2) / numPoints;
    positions[i * 3] = radius * Math.sin(s);
    positions[i * 3 + 1] = radius * Math.cos(s);
    positions[i * 3 + 2] = 0;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  object = new THREE.LineLoop(
    geometry,
    new THREE.LineBasicMaterial({ color: 0xffff00 }),
  );
  object.position.set(0, 0, -200);

  scene1.add(object);

  // ---------------------------------------------------------------------
  // THREE.Points
  // ---------------------------------------------------------------------
  numPoints = 100;
  const pointsArray = new Float32Array(numPoints * 3);
  for (let i = 0; i < numPoints; i++) {
    pointsArray[3 * i] = -50 + Math.random() * 100;
    pointsArray[3 * i + 1] = Math.random() * 100;
    pointsArray[3 * i + 2] = -50 + Math.random() * 100;
  }

  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute("position", new THREE.BufferAttribute(pointsArray, 3));

  const pointsMaterial = new THREE.PointsMaterial({
    color: 0xffff00,
    size: 5,
  });
  const pointCloud = new THREE.Points(pointsGeo, pointsMaterial);
  pointCloud.name = "Points";
  pointCloud.position.set(-200, 0, -200);
  scene1.add(pointCloud);

  // ---------------------------------------------------------------------
  // Ortho camera
  // ---------------------------------------------------------------------

  const height = 1000; // frustum height
  const aspect = window.innerWidth / window.innerHeight;

  const cameraOrtho = new THREE.OrthographicCamera(
    -height * aspect,
    height * aspect,
    height,
    -height,
    0,
    2000,
  );
  cameraOrtho.position.set(600, 400, 0);
  cameraOrtho.lookAt(0, 0, 0);
  scene1.add(cameraOrtho);
  cameraOrtho.name = "OrthographicCamera";

  material = new THREE.MeshLambertMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
  });

  object = new THREE.Mesh(
    new THREE.CircleGeometry(50, 20, 0, Math.PI * 2),
    material,
  );
  object.position.set(200, 0, -400);
  scene1.add(object);

  object = new THREE.Mesh(
    new THREE.RingGeometry(10, 50, 20, 5, 0, Math.PI * 2),
    material,
  );
  object.position.set(0, 0, -400);
  scene1.add(object);

  object = new THREE.Mesh(
    new THREE.CylinderGeometry(25, 75, 100, 40, 5),
    material,
  );
  object.position.set(-200, 0, -400);
  scene1.add(object);

  //
  const points = [];

  for (let i = 0; i < 50; i++) {
    points.push(
      new THREE.Vector2(
        Math.sin(i * 0.2) * Math.sin(i * 0.1) * 15 + 50,
        (i - 5) * 2,
      ),
    );
  }

  object = new THREE.Mesh(new THREE.LatheGeometry(points, 20), material);
  object.position.set(200, 0, 400);
  scene1.add(object);

  // ---------------------------------------------------------------------
  // Big red box hidden just for testing `onlyVisible` option
  // ---------------------------------------------------------------------
  material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
  });
  object = new THREE.Mesh(new THREE.BoxGeometry(200, 200, 200), material);
  object.position.set(0, 0, 0);
  object.name = "CubeHidden";
  object.visible = false;
  scene1.add(object);

  // ---------------------------------------------------------------------
  // Model requiring KHR_mesh_quantization
  // ---------------------------------------------------------------------
  const loader = new GLTFLoader();
  loader.load("models/gltf/ShaderBall.glb", function (gltf) {
    model = gltf.scene;
    model.scale.setScalar(50);
    model.position.set(200, -40, -200);
    scene1.add(model);
  });

  // ---------------------------------------------------------------------
  // Model requiring KHR_mesh_quantization
  // ---------------------------------------------------------------------

  material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });
  object = new THREE.InstancedMesh(
    new THREE.BoxGeometry(10, 10, 10, 2, 2, 2),
    material,
    50,
  );
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  for (let i = 0; i < 50; i++) {
    matrix.setPosition(
      Math.random() * 100 - 50,
      Math.random() * 100 - 50,
      Math.random() * 100 - 50,
    );
    object.setMatrixAt(i, matrix);
    object.setColorAt(i, color.setHSL(i / 50, 1, 0.5));
  }

  object.position.set(400, 0, 200);
  scene1.add(object);

  // ---------------------------------------------------------------------
  // 2nd THREE.Scene
  // ---------------------------------------------------------------------
  scene2 = new THREE.Scene();
  object = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), material);
  object.position.set(0, 0, 0);
  object.name = "Cube2ndScene";
  scene2.name = "Scene2";
  scene2.add(object);

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  container.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = params.autoRotate;
  controls.cursorZoom = true;

  controls.addEventListener("change", () => {
    renderer.render(scene1, camera);
  });

  //

  window.addEventListener("resize", onWindowResize);

  // ---------------------------------------------------------------------
  // Exporting compressed textures and meshes (KTX2 / Draco / Meshopt)
  // ---------------------------------------------------------------------
  const drpath = "https://unpkg.com/three@latest/examples/jsm/libs/draco/gltf/";
  const ktpath = "https://unpkg.com/three@latest/examples/jsm/libs/basis/";
  const ktx2Loader = new KTX2Loader()
    .setTranscoderPath(ktpath)
    .detectSupport(renderer);
  const dracoLoader = new DRACOLoader().setDecoderPath(drpath);

  const gltfLoader = new GLTFLoader().setPath("models/gltf/");
  gltfLoader.setKTX2Loader(ktx2Loader);
  gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load("coffeemat.glb", function (gltf) {
    gltf.scene.position.x = 400;
    gltf.scene.position.z = -200;

    scene1.add(gltf.scene);

    coffeemat = gltf.scene;
  });

  const amixer = [];

  gltfLoader
    .loadAsync("plane.gltf")
    .then((gltf) => {
      gltf.scene.position.set(50, 150, -100);
      gltf.scene.scale.set(120, 120, 120);

      scene1.add(gltf.scene);

      const plane = gltf.scene;

      let hairsTop, propeller;

      plane.traverse(function (child) {
        switch (child.name) {
          case "hairsTop":
            hairsTop = child;
            break;
          case "propeller":
            propeller = child;
            break;
          default:
            if (child.name.includes("octagon")) child.visible = false;
            break;
        }
      });

      // set up rotation about x axis
      const xAxis = new THREE.Vector3(1, 0, 0);

      const qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0);
      const qMiddle = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI);
      const qFinal = new THREE.Quaternion().setFromAxisAngle(
        xAxis,
        2 * Math.PI,
      );

      const quaternionKF = new THREE.QuaternionKeyframeTrack(
        ".quaternion",
        [0, 1, 2],
        [...qInitial, ...qMiddle, ...qFinal],
      );

      const scaleKF = new THREE.VectorKeyframeTrack(
        ".scale",
        [0, 1, 2],
        [1, 1, 1, 1, 0.75, 1, 1, 1, 1],
      );

      // setup the THREE.AnimationMixer
      let mixer = new THREE.AnimationMixer(plane);
      amixer.push(mixer);

      const clip = new THREE.AnimationClip("propeller", -1, [quaternionKF]);
      const clip2 = new THREE.AnimationClip("hairsTop", -1, [scaleKF]);

      // either use the AnimationClip embedded in the gltf file (true)
      // or the ones defined above (false)
      const useAnimations = false;

      // create a clipAction for the propeller and set it to play
      let clipAction = useAnimations
        ? mixer.clipAction(gltf.animations[0])
        : mixer.clipAction(clip, propeller);

      clipAction.play().setDuration(0.5);
      const duration = 0.5;
      // create a clipAction for each hair and set them to play
      for (const [i, h] of hairsTop.children.entries()) {
        mixer = new THREE.AnimationMixer(plane);
        amixer.push(mixer);
        clipAction = useAnimations
          ? mixer.clipAction(gltf.animations[i + 1])
          : mixer.clipAction(clip2, h);

        clipAction
          .startAt((duration / hairsTop.children.length) * i)
          .setDuration(duration)
          .play();
      }
    })
    .catch((error) => {
      console.error(
        `${error.name}: init (loadAsync "plane.gltf")\n${error.message}`,
      );
    });

  const gui = new GUI();

  let h = gui.addFolder("Settings");
  h.add(params, "trs").name("Use TRS");
  h.add(params, "onlyVisible").name("Only Visible Objects");
  h.add(params, "autoRotate")
    .name("Auto Rotate")
    .onChange((value) => {
      controls.autoRotate = value;
    });
  h.add(params, "binary").name("Binary (GLB)");
  h.add(params, "maxTextureSize", 2, 8192).name("Max Texture Size").step(1);

  h = gui.addFolder("Export");
  h.add(params, "exportScene1").name("Export Scene 1");
  h.add(params, "exportScenes").name("Export Scene 1 and 2");
  h.add(params, "exportSphere").name("Export Sphere");
  h.add(params, "exportModel").name("Export Model");
  h.add(params, "exportObjects").name("Export Sphere With Grid");
  h.add(params, "exportSceneObject").name("Export Scene 1 and Object");
  h.add(params, "exportCompressedObject").name(
    "Export Coffeemat (from compressed data)",
  );

  gui.open();

  renderer.render(scene1, camera);

  const clock = new THREE.Clock();

  function animate() {
    const delta = clock.getDelta();
    const timer = clock.elapsedTime * 0.1;

    if (amixer.length > 0) {
      for (const m of amixer) {
        m.update(delta);
      }
      renderer.render(scene1, camera);
    }

    if (false) {
      camera.position.x = Math.cos(timer) * 800;
      camera.position.z = Math.sin(timer) * 800;
      camera.lookAt(scene1.position);
      renderer.render(scene1, camera);
    } else {
      if (controls.autoRotate) controls.update();
    }
  }
}

function exportScene1() {
  exporter.exportGLTF(scene1, params);
}

function exportScenes() {
  exporter.exportGLTF([scene1, scene2], params);
}

function exportSphere() {
  exporter.exportGLTF(sphere, params);
}

function exportModel() {
  exporter.exportGLTF(model, params);
}

function exportObjects() {
  exporter.exportGLTF([sphere, gridHelper], params);
}

function exportSceneObject() {
  exporter.exportGLTF([scene1, gridHelper], params);
}

function exportCompressedObject() {
  exporter.exportGLTF([coffeemat], params);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("load", init);
