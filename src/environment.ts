import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import { Sky } from "three/addons/objects/Sky.js";

export class Environment {
  private _water: Water;
  private _sky: Sky;
  private _pmremGenerator: THREE.PMREMGenerator;
  private _sceneEnv: THREE.Scene;
  private _renderTarget: THREE.WebGLRenderTarget | undefined;

  constructor(private scene: THREE.Scene, private renderer: THREE.WebGLRenderer) {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    this._water = new Water(waterGeometry, {
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

    this._water.rotation.x = -Math.PI / 2;

    scene.add(this._water);

    // Skybox

    this._sky = new Sky();
    this._sky.scale.setScalar(10000);
    scene.add(this._sky);

    const skyUniforms = this._sky.material.uniforms;

    skyUniforms.turbidity.value = 10;
    skyUniforms.rayleigh.value = 2;
    skyUniforms.mieCoefficient.value = 0.005;
    skyUniforms.mieDirectionalG.value = 0.8;

    this._pmremGenerator = new THREE.PMREMGenerator(renderer);
    this._sceneEnv = new THREE.Scene();
  }

  animate(): void {
    const time = performance.now() * 0.001;
    const azimuth = time % 360;
    const elevation = 2 + Math.sin(time * 0.05) * 3;
    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);

    const sun = new THREE.Vector3();
    sun.setFromSphericalCoords(1, phi, theta);

    this._sky.material.uniforms.sunPosition.value.copy(sun);
    this._water.material.uniforms.sunDirection.value.copy(sun).normalize();

    if (this._renderTarget !== undefined) {
      this._renderTarget.dispose();
    }

    this._sceneEnv.add(this._sky);
    this._renderTarget = this._pmremGenerator.fromScene(this._sceneEnv);
    this.scene.add(this._sky);

    this.scene.environment = this._renderTarget.texture;

    this._water.material.uniforms.time.value += 1.0 / 60.0;
  }
}
