"use strict";

import * as THREE from "https://unpkg.com/three@latest/build/three.module.js?module";
import { ArcballControls } from "https://unpkg.com/three@latest/examples/jsm/controls/ArcballControls.js?module";
import { OBJLoader } from "https://unpkg.com/three@latest/examples/jsm/loaders/OBJLoader.js?module";
import { RGBELoader } from "https://unpkg.com/three@latest/examples/jsm/loaders/RGBELoader.js?module";
import { GUI } from "https://unpkg.com/three@latest/examples/jsm/libs/lil-gui.module.min.js?module";

const cameras = ["Orthographic", "Perspective"];
const cameraType = { type: "Perspective" };

const perspectiveDistance = 5;
const orthographicDistance = 120;
let camera, controls, scene, renderer, gui;
let folderOptions, folderAnimations;

const arcballGui = {
  gizmoVisible: true,
  useGUI: false,

  setArcballControls: function () {
    controls = new ArcballControls(camera, renderer.domElement, scene);
    controls.addEventListener("change", render);
    this.gizmoVisible = true;
    if (arcballGui.useGUI) this.populateGui();
  },

  populateGui: function () {
    folderOptions.add(controls, "enabled").name("Enable controls");
    folderOptions.add(controls, "enableGrid").name("Enable Grid");
    folderOptions.add(controls, "enableRotate").name("Enable rotate");
    folderOptions.add(controls, "enablePan").name("Enable pan");
    folderOptions.add(controls, "enableZoom").name("Enable zoom");
    folderOptions.add(controls, "cursorZoom").name("Cursor zoom");
    folderOptions.add(controls, "adjustNearFar").name("adjust near/far");
    folderOptions
      .add(controls, "scaleFactor", 1.1, 10, 0.1)
      .name("Scale factor");
    folderOptions.add(controls, "minDistance", 0, 50, 0.5).name("Min distance");
    folderOptions.add(controls, "maxDistance", 0, 50, 0.5).name("Max distance");
    folderOptions.add(controls, "minZoom", 0, 50, 0.5).name("Min zoom");
    folderOptions.add(controls, "maxZoom", 0, 50, 0.5).name("Max zoom");
    folderOptions
      .add(arcballGui, "gizmoVisible")
      .name("Show gizmos")
      .onChange(function () {
        controls.setGizmosVisible(arcballGui.gizmoVisible);
      });
    folderOptions.add(controls, "copyState").name("Copy state(ctrl+c)");
    folderOptions.add(controls, "pasteState").name("Paste state(ctrl+v)");
    folderOptions.add(controls, "reset").name("Reset");
    folderAnimations.add(controls, "enableAnimations").name("Enable anim.");
    folderAnimations.add(controls, "dampingFactor", 0, 100, 1).name("Damping");
    folderAnimations.add(controls, "wMax", 0, 100, 1).name("Angular spd");
  },
};

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 3;
  renderer.domElement.style.background =
    "linear-gradient( 180deg, rgba( 0,0,0,1 ) 0%, rgba( 128,128,255,1 ) 100% )";
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = makePerspectiveCamera();
  ////// camera.position.set(0, 0, perspectiveDistance);  <---------------------

  const material = new THREE.MeshStandardMaterial();

  const rgbeLoader = new RGBELoader().setPath("textures/equirectangular/");
  (async () => {
    const hdrEquirect = await rgbeLoader.loadAsync("venice_sunset_1k.hdr");
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdrEquirect;
  })();

  const objLoader = new OBJLoader().setPath("models/obj/cerberus/");
  objLoader.loadAsync("Cerberus.obj").then((group) => {
    const textureLoader = new THREE.TextureLoader().setPath(
      "models/obj/cerberus/",
    );

    material.roughness = 1;
    material.metalness = 1;

    const diffuseMap = textureLoader.load("Cerberus_A.jpg", render);
    diffuseMap.colorSpace = THREE.SRGBColorSpace;
    material.map = diffuseMap;

    material.metalnessMap = material.roughnessMap = textureLoader.load(
      "Cerberus_RM.jpg",
      render,
    );
    material.normalMap = textureLoader.load("Cerberus_N.jpg", render);

    material.map.wrapS = THREE.RepeatWrapping;
    material.roughnessMap.wrapS = THREE.RepeatWrapping;
    material.metalnessMap.wrapS = THREE.RepeatWrapping;
    material.normalMap.wrapS = THREE.RepeatWrapping;

    group.traverse(function (child) {
      if (child.isMesh) {
        child.material = material;
      }
    });

    group.rotation.y = Math.PI / 2;
    group.position.x += 0.25;
    scene.add(group);

    if (arcballGui.useGUI) {
      gui = new GUI();

      gui
        .add(cameraType, "type", cameras)
        .name("Choose Camera")
        .onChange(function () {
          setCamera(cameraType.type);
        });

      folderOptions = gui.addFolder("Arcball parameters");
      folderAnimations = folderOptions.addFolder("Animations");
    }

    arcballGui.setArcballControls();
    camera.position.set(0, 0, perspectiveDistance); //// <------
    controls.update(); //// <----------

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onWindowResize);
  });
}

function makeOrthographicCamera() {
  const halfFovV = THREE.MathUtils.DEG2RAD * 45 * 0.5;
  const aspect = window.innerWidth / window.innerHeight;
  const halfFovH = Math.atan(aspect * Math.tan(halfFovV));

  const halfW = perspectiveDistance * Math.tan(halfFovH);
  const halfH = perspectiveDistance * Math.tan(halfFovV);
  const near = 0.01;
  const far = 2000;
  const newCamera = new THREE.OrthographicCamera(
    -halfW,
    halfW,
    halfH,
    -halfH,
    near,
    far,
  );
  return newCamera;
}

function makePerspectiveCamera() {
  const fov = 45;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.01;
  const far = 2000;
  const newCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  return newCamera;
}

function onWindowResize() {
  const h = window.innerHeight;
  const w = window.innerWidth;
  const aspect = w / h;
  if (camera.type == "OrthographicCamera") {
    const halfFovV = THREE.MathUtils.DEG2RAD * 45 * 0.5;
    const halfFovH = Math.atan(aspect * Math.tan(halfFovV));

    const halfW = perspectiveDistance * Math.tan(halfFovH);
    const halfH = perspectiveDistance * Math.tan(halfFovV);
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH;
    camera.bottom = -halfH;
  } else if (camera.type == "PerspectiveCamera") {
    camera.aspect = aspect;
  }

  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  render();
}

function render() {
  renderer.render(scene, camera);
}

function onKeyDown(event) {
  if (event.key === "c") {
    if (event.ctrlKey || event.metaKey) {
      controls.copyState();
    }
  } else if (event.key === "v") {
    if (event.ctrlKey || event.metaKey) {
      controls.pasteState();
    }
  }
}

function setCamera(type) {
  if (type == "Orthographic") {
    camera = makeOrthographicCamera();
    camera.position.set(0, 0, orthographicDistance);
  } else if (type == "Perspective") {
    camera = makePerspectiveCamera();
    camera.position.set(0, 0, perspectiveDistance);
  }
  controls.setCamera(camera);
  render();
}

document.querySelector(".buttonToLink").addEventListener("click", () => {
  controls.reset();
});
window.addEventListener("load", () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  arcballGui.useGUI = urlParams.get("gui");
  init();
});
