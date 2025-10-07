import * as THREE from "three";
import { Vector3 } from "three";
import { EARTH_G } from "./3d-utils";
import { Orbit } from "./Orbit";

const selectColor: THREE.ColorRepresentation = "#F00";

const selectPathMat = new THREE.LineBasicMaterial({ color: selectColor });
const selectProbeMat = new THREE.MeshBasicMaterial({
  color: selectColor,
  wireframe: true,
});

export class Satellite {
  constructor(
    public name: string,
    public pos: Vector3,
    public velocity: Vector3,

    public mesh: THREE.Mesh,
    public color: THREE.ColorRepresentation
  ) {
    this.mat = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true,
    });
    this.mesh.material = this.mat;

    this.mesh.position.copy(pos);
    this.orbit = new Orbit(this, color);
  }

  public mat: THREE.Material;
  public orbit: Orbit;

  public isSelected = false;

  public sim(deltaTime: number) {
    this.velocity.addScaledVector(this.pos, -EARTH_G * deltaTime);
    this.pos.addScaledVector(this.velocity, deltaTime);

    this.mesh.position.copy(this.pos);
  }

  public simOrbit(iterations = 80, step = 35) {
    const _pos = this.pos.clone();
    const _velocity = this.velocity.clone();

    const orbitPath: Vector3[] = [];
    orbitPath.push(_pos.clone());

    for (let i = 0; i < iterations; i++) {
      _velocity.addScaledVector(_pos, -EARTH_G * step);
      _pos.addScaledVector(_velocity, step);
      orbitPath.push(_pos.clone());
    }

    return orbitPath;
  }

  public select() {
    if (this.isSelected) return;

    this.isSelected = true;
    this.mesh.material = selectProbeMat;

    if (this.orbit.mesh) this.orbit.mesh.material = selectPathMat;
  }

  public deselect() {
    if (!this.isSelected) return;

    this.isSelected = false;
    this.mesh.material = this.mat;

    if (this.orbit.mesh) this.orbit.mesh.material = this.orbit.mat!;
  }
}
