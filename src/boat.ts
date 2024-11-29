import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Boat {
  private _model: THREE.Group | undefined;
  private _bone: THREE.Bone | undefined;
  private _speed: number = 0;
  private _rotationSpeed: number = 0;
  private _bomeRotationSpeed: number = 0;
  private _boatBody: CANNON.Body;

  constructor(private scene: THREE.Scene, private world: World) {
    this.initKeyboardListeners();
    const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const material = new CANNON.Material("boatMaterial");
    material.friction = 0.01
    this._boatBody = new CANNON.Body({
      mass: 1, // kg
      position: new CANNON.Vec3(0, 5, 0),
      shape: cubeShape,
      material: material,
    });
    world.addBody(this._boatBody);
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
        this.scene.add(this._model);
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

  animate(): void {
    if (this._model) {
      // Calculate the forward direction
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(this._model.quaternion);
      forward.normalize();

      const factor = 20;
      // Apply the velocity in the forward direction
      this._boatBody.velocity.set(forward.x * this._speed * factor, this._boatBody.velocity.y, forward.z * this._speed * factor);
      this._boatBody.angularVelocity.set(0, this._rotationSpeed * 1, 0);

      this._model.position.copy(this._boatBody.position);
      this._model.quaternion.copy(this._boatBody.quaternion);
    }
    if (this._bone) {
      this._bone.rotation.z += this._bomeRotationSpeed;
    }
  }
}
