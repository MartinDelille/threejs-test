import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water";

export class Sea {
  private _water: THREE.Mesh;
  private _cosAngle: number;
  private _sinAngle: number;
  private _period = 80;
  private _waveHeight = 28;

  constructor(private scene: THREE.Scene) {
    const waveAngle: number = Math.PI / 9;
    this._cosAngle = Math.cos(waveAngle);
    this._sinAngle = Math.sin(waveAngle);

    this._water = new THREE.Mesh(this.createGeometry(1000, 100),
      new THREE.MeshStandardMaterial({
        color: 0xf01eff,
        emissive: 0x001e0f,
        flatShading: true,
      }));

    const waterGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    // waterGeometry.rotateX(-Math.PI / 2);
    this._water = new Water(
      waterGeometry, {
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

  createGeometry(width: number, segments: number): THREE.BufferGeometry {
    const width_half = width / 2;

    const grid = Math.floor(segments);
    const grid1 = grid + 1;
    const segment_width = width / grid;

    const indices: number[] = [];
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    for (let iz = 0; iz < grid1; iz++) {
      const z = iz * segment_width - width_half;

      for (let ix = 0; ix < grid1; ix++) {
        const x = ix * segment_width - width_half;

        vertices.push(x, this.getWaterHeightAt(x, z, 0), z);
        normals.push(0, 1, 0);
        uvs.push(ix / grid);
        uvs.push(iz / grid);
      }
    }

    for (let iz = 0; iz < grid; iz++) {
      for (let ix = 0; ix < grid; ix++) {
        const a = ix + grid1 * iz;
        const b = ix + grid1 * (iz + 1);
        const c = (ix + 1) + grid1 * (iz + 1);
        const d = (ix + 1) + grid1 * iz;

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    return geometry;
  }

  updateGeometry(time: number): void {
    const vertices = this._water.geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 1];
      vertices[i + 2] = this.getWaterHeightAt(x, z, time);
    }

    this._water.geometry.attributes.position.needsUpdate = true;
    this._water.geometry.computeVertexNormals();
  }

  animate(time: number, sun: THREE.Vector3): void {
    //    this._water.material.uniforms.sunDirection.value.copy(sun).normalize();
    //console.log(sun);
    sun.set(0, -1, 1);
    let v = new THREE.Vector3(1, 1, 1).normalize();
    if (this._water.material.uniforms) {
      this._water.material.uniforms.sunDirection.value.copy(v).normalize();
      this._water.material.uniforms.time.value += 1.0 / 60.0;
    }

    // this.updateGeometry(time);
    this.updateGeometry(0);

  }
}
