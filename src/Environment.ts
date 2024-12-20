import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky";
import { GUI } from "lil-gui";

import { Sea } from "./sea";

export class Environment {
  private _sky: Sky;
  private _pmremGenerator: THREE.PMREMGenerator;
  private _sceneEnv: THREE.Scene;
  private _renderTarget: THREE.WebGLRenderTarget | undefined;
  private _sea: Sea;
  private _sunInitialAzimuth = 0;
  private _sunMediumElevation = 45;

  constructor(private gui: GUI,
    private scene: THREE.Scene,
    private renderer: THREE.WebGLRenderer,
    private world: World) {
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

    this._sea = new Sea(scene);

    let envGui = gui.addFolder("Environment")
    envGui.add(this, "_sunInitialAzimuth", 0, 360).name("Sun Azimuth");
    envGui.add(this, "_sunMediumElevation", 0, 90).name("Sun Elevation");
  }

  get sea(): Sea {
    return this._sea;
  }

  animate(time: number): void {
    const azimuth = (this._sunInitialAzimuth + time) % 360;
    const elevation = this._sunMediumElevation + Math.sin(time * 0.05) * 3;
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
