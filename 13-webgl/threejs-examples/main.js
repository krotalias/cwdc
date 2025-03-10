import * as THREE from "three";
import { ArcballControls } from "three/addons/controls/ArcballControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AxesHelper(3));
camera.position.z = 4;

const controls = new ArcballControls(camera, renderer.domElement, scene);

const DEGREES_TO_RADIANS = Math.PI / 180;

const input = document.getElementById("rotation");
input.addEventListener("input", (e) => {
    const radians = e.target.value * DEGREES_TO_RADIANS;
    camera.up = new THREE.Vector3(Math.cos(radians), Math.sin(radians), 0);
    controls.update();
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
