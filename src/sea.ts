import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";

export class Sea {
  private _water: Water;

  constructor(private scene: THREE.Scene) {
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

  animate(time: number, sun: THREE.Vector3): void {
    this._water.material.uniforms.sunDirection.value.copy(sun).normalize();

    const vertices = this._water.geometry.attributes.position.array;
    const waveAngle = Math.PI / 9;
    const cosAngle = Math.cos(waveAngle);
    const sinAngle = Math.sin(waveAngle);

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const period = 0.05;
      const rotatedX = x * cosAngle - y * sinAngle;
      vertices[i + 2] = Math.sin(rotatedX * period + time) * 4;
    }

    this._water.geometry.attributes.position.needsUpdate = true;
    this._water.material.uniforms.time.value += 1.0 / 60.0;
  }
}
