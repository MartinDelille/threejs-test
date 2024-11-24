import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Water } from "three/addons/objects/Water.js";
import { Sky } from "three/addons/objects/Sky.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as Tone from "tone";

const scene = new THREE.Scene();

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

// Water

const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

const water = new Water(waterGeometry, {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: new THREE.TextureLoader().load(
    "textures/waternormals.jpg",
    function(texture: THREE.Texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    },
  ),
  sunDirection: new THREE.Vector3(),
  sunColor: 0xffffff,
  waterColor: 0x001e0f,
  distortionScale: 3.7,
  fog: scene.fog !== undefined,
});

water.rotation.x = -Math.PI / 2;

scene.add(water);

// Skybox

const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;

skyUniforms["turbidity"].value = 10;
skyUniforms["rayleigh"].value = 2;
skyUniforms["mieCoefficient"].value = 0.005;
skyUniforms["mieDirectionalG"].value = 0.8;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const sceneEnv = new THREE.Scene();

let renderTarget: THREE.WebGLRenderTarget;

function updateSun(time: number) {
  const azimuth = time % 360;
  const elevation = 2 + Math.sin(time * 0.05) * 3;
  const phi = THREE.MathUtils.degToRad(90 - elevation);
  const theta = THREE.MathUtils.degToRad(azimuth);

  const sun = new THREE.Vector3();
  sun.setFromSphericalCoords(1, phi, theta);

  sky.material.uniforms["sunPosition"].value.copy(sun);
  water.material.uniforms["sunDirection"].value.copy(sun).normalize();

  if (renderTarget !== undefined) renderTarget.dispose();

  sceneEnv.add(sky);
  renderTarget = pmremGenerator.fromScene(sceneEnv);
  scene.add(sky);

  scene.environment = renderTarget.texture;
}

let boatDirection = new THREE.Vector3();
let boatRotationSpeed = 0.05;
let isMovingForward = false;
let isMovingBackward = false;
let isRotatingLeft = false;
let isRotatingRight = false;
let isRotatingBomeRight = false;
let isRotatingBomeLeft = false;

window.addEventListener("keydown", function(event) {
  switch (event.key) {
    case "w":
      isMovingForward = true;
      break;
    case "s":
      isMovingBackward = true;
      break;
    case "a":
      isRotatingLeft = true;
      break;
    case "d":
      isRotatingRight = true;
      break;
    case "j":
      isRotatingBomeRight = true;
      break;
    case "k":
      isRotatingBomeLeft = true;
      break;
  }
});

window.addEventListener("keyup", function(event) {
  switch (event.key) {
    case "w":
      isMovingForward = false;
      break;
    case "s":
      isMovingBackward = false;
      break;
    case "a":
      isRotatingLeft = false;
      break;
    case "d":
      isRotatingRight = false;
      break;
    case "j":
      isRotatingBomeRight = false;
      break;
    case "k":
      isRotatingBomeLeft = false;
      break;
  }
});

updateSun(0);

let boat: THREE.Group;
let bone: THREE.Bone;
const loader = new GLTFLoader();
loader.load(
  "boat.glb",
  function(gltf) {
    boat = gltf.scene;
    scene.add(boat);
    bone = boat.getObjectByName('BomeBone') as THREE.Bone;
  },
  undefined,
  function(error) {
    console.error(error);
  },
);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.495;
controls.target.set(0, 10, 0);
controls.minDistance = 40.0;
controls.maxDistance = 200.0;
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
  Tone.Destination.mute = (value <= -60);
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
  if (boat) {
    if (isMovingForward) {
      boatDirection.set(0, 0, -1).applyQuaternion(boat.quaternion);
      boat.position.add(boatDirection);
    }
    if (isMovingBackward) {
      boatDirection.set(0, 0, 1).applyQuaternion(boat.quaternion);
      boat.position.add(boatDirection);
    }
    if (isRotatingLeft) {
      boat.rotation.y += boatRotationSpeed;
    }
    if (isRotatingRight) {
      boat.rotation.y -= boatRotationSpeed;
    }
    if (isRotatingBomeRight) {
      bone.rotation.z += Math.PI / 360;
    }
    if (isRotatingBomeLeft) {
      bone.rotation.z -= Math.PI / 360;
    }
  }
  render();
}

function render() {
  const time = performance.now() * 0.001;

  updateSun(time);

  water.material.uniforms["time"].value += 1.0 / 60.0;

  renderer.render(scene, camera);
}
