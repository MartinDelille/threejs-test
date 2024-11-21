import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Water } from "three/addons/objects/Water.js";
import { Sky } from "three/addons/objects/Sky.js";

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
    function (texture) {
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

const parameters = {
  elevation: 2,
  azimuth: 180,
};

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const sceneEnv = new THREE.Scene();

let renderTarget;

function updateSun(time) {
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

updateSun(0);

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

function animate() {
  render();
}

function render() {
  const time = performance.now() * 0.001;

  updateSun(time);

  water.material.uniforms["time"].value += 1.0 / 60.0;

  renderer.render(scene, camera);
}
