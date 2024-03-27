import { Vector3, Mesh } from "three";
import { EARTH_G } from "./3d-utils";
import { Orbit } from "./Orbit";

export class Satellite {
  constructor(
    public pos: Vector3,
    public velocity: Vector3,
    public mesh: Mesh
  ) {
    mesh.position.copy(pos);
    this.orbit = new Orbit(this);
  }

  public orbit: Orbit;

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
}
