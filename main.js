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
document.body.appendChild(renderer.domElement);

// Create a cube and add it to the scene
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Create a light and add it to the scene
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(-10, 10, 10);
scene.add(light);

// Create an animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the cube for some basic animation
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // Render the scene from the perspective of the camera
  renderer.render(scene, camera);
}

// Start the animation loop
animate();
