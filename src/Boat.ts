import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { Sea } from "./Sea";

export class Boat {
  private _model: THREE.Group | undefined;
  private _bone: THREE.Bone | undefined;
  private _speed: number = 0;
  private _rotationSpeed: number = 0;
  private _bomeRotationSpeed: number = 0;
  private _boatBody: CANNON.Body;
  private _cube: THREE.Mesh | undefined;
  private _size: number = 20;
  private _forceArrow: THREE.ArrowHelper | undefined;

  constructor(private scene: THREE.Scene, private world: CANNON.World) {
    this.initKeyboardListeners();
    const cubeShape = new CANNON.Box(new CANNON.Vec3(this._size, this._size, this._size));
    const material = new CANNON.Material("boatMaterial");
    material.friction = 0.01;
    this._boatBody = new CANNON.Body({
      mass: 500, // kg
      position: new CANNON.Vec3(0, this._size * 0, 0),
      shape: cubeShape,
      material: material,
    });
    this._boatBody.linearDamping = 0.3;
    this._boatBody.angularDamping = 0.3;
    world.addBody(this._boatBody);
    this._cube = new THREE.Mesh(
      new THREE.BoxGeometry(this._size, this._size, this._size),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 }),
    );
    //this.scene.add(this._cube);

    // Initialize the force arrow
    this._forceArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 10, 0xff0000);
    // this.scene.add(this._forceArrow);
  }

  private initKeyboardListeners(): void {
    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
    window.addEventListener("keyup", (event) => this.handleKeyUp(event));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    this.setMovement(event.key, true);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.setMovement(event.key, false);
  }

  load(filePath: string): void {
    const loader = new GLTFLoader();
    loader.load(
      filePath,
      (gltf: GLTF) => {
        this._model = gltf.scene;
        // this.scene.add(this._model);
        this._bone = this._model.getObjectByName("BomeBone") as THREE.Bone;
      },
      undefined,
      (error) => {
        console.error(error);
      },
    );
  }

  setMovement(key: string, value: boolean): void {
    switch (key) {
      case "w":
        this._speed = value ? 1 : 0;
        break;
      case "s":
        this._speed = value ? -1 : 0;
        break;
      case "a":
        this._rotationSpeed = value ? 1 : 0;
        break;
      case "d":
        this._rotationSpeed = value ? -1 : 0;
        break;
      case "j":
        this._bomeRotationSpeed = value ? Math.PI / 360 : 0;
        break;
      case "k":
        this._bomeRotationSpeed = value ? -Math.PI / 360 : 0;
        break;
    }
  }

  animate(sea: Sea, time: number): void {
    const corners = [
      new CANNON.Vec3(this._size, 0, this._size),
      new CANNON.Vec3(this._size, 0, -this._size),
      new CANNON.Vec3(-this._size, 0, this._size),
      new CANNON.Vec3(-this._size, 0, -this._size),
    ];
    if (this._model) {
      // Calculate the forward direction
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(this._model.quaternion);
      forward.normalize();

      const factor = 20;
      corners.forEach((corner) => {
        const worldCorner = this._boatBody.position.vadd(corner);
        const waterHeight = sea.getWaterHeightAt(worldCorner.x, worldCorner.z, time);
        if (worldCorner.y < waterHeight) {
          const buoyancyForce = 800 * (waterHeight - worldCorner.y);
          this._boatBody.applyForce(new CANNON.Vec3(0, buoyancyForce, 0), worldCorner);

          // Update the force arrow
          if (this._forceArrow) {
            const forceVector = new THREE.Vector3(0, buoyancyForce, 0);
            this._forceArrow.setDirection(forceVector);
            this._forceArrow.setLength(forceVector.length() / 50); // Adjust length for better visualization
            this._forceArrow.position.copy(worldCorner as unknown as THREE.Vector3);
          }
        }
        // console.log(worldCorner.y, waterHeight);
      });

      this._model.position.copy(this._boatBody.position);
      this._model.quaternion.copy(this._boatBody.quaternion);
      this._cube.position.copy(this._boatBody.position);
      this._cube.quaternion.copy(this._boatBody.quaternion);
    }
    if (this._bone) {
      this._bone.rotation.z += this._bomeRotationSpeed;
    }
  }
}
