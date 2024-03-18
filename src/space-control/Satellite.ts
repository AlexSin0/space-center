import { Vector3 } from "three";
import { EARTH_G } from "./3d-utils";

export class Satellite {
  constructor(public pos: Vector3, public velocity: Vector3) {}

  public orbit?: Vector3[];
  public apoapsis?: Vector3;
  public periapsis?: Vector3;

  public sim(deltaTime: number) {
    this.velocity.addScaledVector(this.pos, -EARTH_G * deltaTime);
    this.pos.addScaledVector(this.velocity, deltaTime);
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

  public calcOrbit(iterations = 80, step = 35) {
    const _pos = this.pos.clone();
    const _velocity = this.velocity.clone();

    const orbitPath: Vector3[] = [];
    orbitPath.push(_pos.clone());

    let max = 0;
    let min = Infinity;

    for (let i = 0; i < iterations; i++) {
      _velocity.addScaledVector(_pos, -EARTH_G * step);
      _pos.addScaledVector(_velocity, step);
      orbitPath.push(_pos.clone());

      const dist = _pos.length();
      if (dist > max) {
        max = dist;
        this.apoapsis = _pos.clone();
      } else if (dist < min) {
        min = dist;
        this.periapsis = _pos.clone();
      }
    }

    this.orbit = orbitPath;
  }
}
