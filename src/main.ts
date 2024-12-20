import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as CANNON from "cannon-es";
import * as Tone from "tone";
import { GUI } from "lil-gui";

import { Boat } from "./Boat";
import { Environment } from "./Environment";

const gui = new GUI();

const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(50);
//scene.add(axesHelper);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  1,
  20000,
);
camera.position.set(-30, 30, -100);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
document.body.appendChild(renderer.domElement);

const world = new CANNON.World();
const environment = new Environment(gui, scene, renderer, world);

const boat = new Boat(scene, world);
boat.load("boat.glb");

let overlayVisible = true;

window.addEventListener("keydown", (event): void => {
  switch (event.key) {
    case "h":
      overlayVisible = !overlayVisible;
      document.getElementById("overlay")!.style.display = overlayVisible ? "block" : "none";
      break;
    case "m":
      Tone.Destination.mute = !Tone.Destination.mute;
      break;
  }
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.495;
controls.target.set(0, 10, 0);
controls.minDistance = 40.0;
controls.maxDistance = 1000.0;
controls.update();

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Create a wind sound using Tone.js
const wind = new Tone.Noise("pink").start();
const windFilter = new Tone.Filter(800, "lowpass").toDestination();
wind.connect(windFilter);
windFilter.frequency.rampTo(200, 20);

// Set the volume of the wind sound
const windVolume = new Tone.Volume(-20).toDestination();
wind.connect(windVolume);

// Function to update wind volume
function updateWindVolume(event: Event) {
  const input = event.target as HTMLInputElement;
  const value = parseFloat(input.value);
  windVolume.volume.value = value;
}

// Add event listener to the slider
document.getElementById("wind-volume")?.addEventListener("input", updateWindVolume);

// Start the Tone.js context on user interaction
window.addEventListener("click", () => {
  if (Tone.context.state !== "running") {
    Tone.context.resume();
  }
});

function animate() {
  const time = performance.now() * 0.001;
  world.step(1 / 60);
  environment.animate(time);
  boat.animate(environment.sea, time);
  render();
}

function render() {
  renderer.render(scene, camera);
}
