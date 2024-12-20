import * as THREE from "three";

class WaveGeometry extends THREE.BufferGeometry {

  constructor(width = 1, widthSegments = 1) {

    super();



    const width_half = width / 2;

    const grid = Math.floor(widthSegments);
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

        vertices.push(x, 0, - z);
        normals.push(0, 1, 0);
        uvs.push(ix / grid);
        uvs.push(1 - (iz / grid));
      }
    }

    for (let iz = 0; iz < grid; iz++) {
      for (let ix = 0; ix < grid; ix++) {
        const a = ix + grid1 * iz;
        const b = ix + grid1 * (iz + 1);
        const c = (ix + 1) + grid1 * (iz + 1);
        const d = (ix + 1) + grid1 * iz;

        indices.push(a, d, b);
        indices.push(b, d, c);
      }
    }

    this.setIndex(indices);
    this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

  }

  copy(source) {

    super.copy(source);

    this.parameters = Object.assign({}, source.parameters);

    return this;

  }
}

export { WaveGeometry };
