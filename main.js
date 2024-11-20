import * as THREE from "three";

// Create the scene
const scene = new THREE.Scene();

// Create a camera, which determines what we'll see when we render the scene
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 5;

// Create a renderer and attach it to our document
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadow maps
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Create a cube and add it to the scene
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true; // Allow the cube to cast shadows
cube.receiveShadow = true; // Allow the cube to receive shadows
scene.add(cube);

// Create a plane to receive the shadow
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true; // Allow the plane to receive shadows
scene.add(plane);

// Create a light and add it to the scene
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(0, 1, 1).normalize();
light.castShadow = true; // Allow the light to cast shadows
scene.add(light);

// Create an animation loop
function animate() {
  // Rotate the cube for some basic animation
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // Render the scene from the perspective of the camera
  renderer.render(scene, camera);
}
