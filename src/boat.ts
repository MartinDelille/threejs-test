import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Boat {
  private _model: THREE.Group | undefined;
  private _bone: THREE.Bone | undefined;
  private boatDirection: THREE.Vector3 = new THREE.Vector3();
  private boatRotationSpeed: number = 0.05;
  private speed: number = 0;
  private rotationSpeed: number = 0;
  private bomeRotationSpeed: number = 0;

  private keyActionMap: { [key: string]: (value: boolean) => void } = {
    "w": (value) => this.speed = value ? 1 : 0,
    "s": (value) => this.speed = value ? -1 : 0,
    "a": (value) => this.rotationSpeed = value ? 0.02 : 0,
    "d": (value) => this.rotationSpeed = value ? -0.02 : 0,
    "j": (value) => this.bomeRotationSpeed = value ? Math.PI / 360 : 0,
    "k": (value) => this.bomeRotationSpeed = value ? -Math.PI / 360 : 0,
  };

  constructor(private scene: THREE.Scene) {
    this.initKeyboardListeners();
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
      (gltf) => {
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
    const action = this.keyActionMap[key];
    if (action) {
      action(value);
    }
  }

  animate(): void {
    if (this._model) {
      this.boatDirection.set(0, 0, this.speed).applyQuaternion(this._model.quaternion);
      this._model.position.add(this.boatDirection);
      this._model.rotation.y += this.rotationSpeed;
    }
    if (this._bone) {
      this._bone.rotation.z += this.bomeRotationSpeed;
    }
  }
}
