import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Boat {
  private boat: THREE.Group | undefined;
  private bone: THREE.Bone | undefined;
  private boatDirection: THREE.Vector3 = new THREE.Vector3();
  private boatRotationSpeed: number = 0.05;
  private isMovingForward: boolean = false;
  private isMovingBackward: boolean = false;
  private isRotatingLeft: boolean = false;
  private isRotatingRight: boolean = false;
  private isRotatingBomeRight: boolean = false;
  private isRotatingBomeLeft: boolean = false;

  constructor(private scene: THREE.Scene) { }

  load(filePath: string): void {
    const loader = new GLTFLoader();
    loader.load(
      filePath,
      (gltf) => {
        this.boat = gltf.scene;
        this.scene.add(this.boat);
        this.bone = this.boat.getObjectByName("BomeBone") as THREE.Bone;
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
        this.isMovingForward = value;
        break;
      case "s":
        this.isMovingBackward = value;
        break;
      case "a":
        this.isRotatingLeft = value;
        break;
      case "d":
        this.isRotatingRight = value;
        break;
      case "j":
        this.isRotatingBomeRight = value;
        break;
      case "k":
        this.isRotatingBomeLeft = value;
        break;
    }
  }

  animate(): void {
    if (this.boat) {
      if (this.isMovingForward) {
        this.boatDirection.set(0, 0, -1).applyQuaternion(this.boat.quaternion);
        this.boat.position.add(this.boatDirection);
      }
      if (this.isMovingBackward) {
        this.boatDirection.set(0, 0, 1).applyQuaternion(this.boat.quaternion);
        this.boat.position.add(this.boatDirection);
      }
      if (this.isRotatingLeft) {
        this.boat.rotation.y += this.boatRotationSpeed;
      }
      if (this.isRotatingRight) {
        this.boat.rotation.y -= this.boatRotationSpeed;
      }
      if (this.isRotatingBomeRight && this.bone) {
        this.bone.rotation.z += Math.PI / 360;
      }
      if (this.isRotatingBomeLeft && this.bone) {
        this.bone.rotation.z -= Math.PI / 360;
      }
    }
  }
}
