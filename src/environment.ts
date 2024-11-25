import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import { Sky } from "three/addons/objects/Sky.js";

export class Environment {
  private water: Water;
  private sky: Sky;
  private pmremGenerator: THREE.PMREMGenerator;
  private sceneEnv: THREE.Scene;
  private renderTarget: THREE.WebGLRenderTarget | undefined;

  constructor(private scene: THREE.Scene, private renderer: THREE.WebGLRenderer) {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    this.water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        "textures/waternormals.jpg",
        (texture: THREE.Texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        },
      ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined,
    });

    this.water.rotation.x = -Math.PI / 2;

    scene.add(this.water);

    // Skybox

    this.sky = new Sky();
    this.sky.scale.setScalar(10000);
    scene.add(this.sky);

    const skyUniforms = this.sky.material.uniforms;

    skyUniforms.turbidity.value = 10;
    skyUniforms.rayleigh.value = 2;
    skyUniforms.mieCoefficient.value = 0.005;
    skyUniforms.mieDirectionalG.value = 0.8;

    this.pmremGenerator = new THREE.PMREMGenerator(renderer);
    this.sceneEnv = new THREE.Scene();
  }

  updateSun(time: number): void {
    const azimuth = time % 360;
    const elevation = 2 + Math.sin(time * 0.05) * 3;
    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);

    const sun = new THREE.Vector3();
    sun.setFromSphericalCoords(1, phi, theta);

    this.sky.material.uniforms.sunPosition.value.copy(sun);
    this.water.material.uniforms.sunDirection.value.copy(sun).normalize();

    if (this.renderTarget !== undefined) this.renderTarget.dispose();

    this.sceneEnv.add(this.sky);
    this.renderTarget = this.pmremGenerator.fromScene(this.sceneEnv);
    this.scene.add(this.sky);

    this.scene.environment = this.renderTarget.texture;
  }

  animateWater(): void {
    this.water.material.uniforms.time.value += 1.0 / 60.0;
  }

  rotateWaterTexture(time: number, rotationSpeed: number): void {
    this.water.material.uniforms.normalSampler.value.matrix.identity()
      .makeRotationZ(time * rotationSpeed);
  }
}
