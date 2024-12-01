import * as THREE from "three";
import { Sky } from "three/addons/objects/Sky.js";

import { Sea } from "./sea";

export class Environment {
  private _sky: Sky;
  private _pmremGenerator: THREE.PMREMGenerator;
  private _sceneEnv: THREE.Scene;
  private _renderTarget: THREE.WebGLRenderTarget | undefined;
  private _sea: Sea;

  constructor(private scene: THREE.Scene, private renderer: THREE.WebGLRenderer, private world: World) {
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

    world.gravity.set(0, -9.82, 0);

    this._sea = new Sea(scene, world);
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

    if (this._renderTarget !== undefined) {
      this._renderTarget.dispose();
    }

    this._sceneEnv.add(this._sky);
    this._renderTarget = this._pmremGenerator.fromScene(this._sceneEnv);
    this.scene.add(this._sky);

    this.scene.environment = this._renderTarget.texture;

    this._sea.animate(time, sun);
  }
}
