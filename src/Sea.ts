import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";

export class Sea {
  private _water: Water;
  private _cosAngle: number;
  private _sinAngle: number;
  private _period = 80;
  private _waveHeight = 12;

  constructor(private scene: THREE.Scene, private world: World) {
    const waveAngle: number = Math.PI / 9;
    this._cosAngle = Math.cos(waveAngle);
    this._sinAngle = Math.sin(waveAngle);
    const waterGeometry = new THREE.PlaneGeometry(1000, 1000, 1000, 1000);

    this._water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        "textures/waternormals.jpg",
        (texture: THREE.Texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        },
      ),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined,
    });

    this._water.rotation.x = -Math.PI / 2;

    scene.add(this._water);
  }

  getWaterHeightAt(x: number, z: number, time: number): number {
    const rotatedX = x * this._cosAngle - z * this._sinAngle;
    return Math.sin(rotatedX / this._period + time) * this._waveHeight;
  }

  animate(time: number, sun: THREE.Vector3): void {
    this._water.material.uniforms.sunDirection.value.copy(sun).normalize();

    const vertices = this._water.geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      vertices[i + 2] = this.getWaterHeightAt(x, y, time);
    }

    this._water.geometry.attributes.position.needsUpdate = true;
    this._water.material.uniforms.time.value += 1.0 / 60.0;
  }
}
