import * as THREE from "three";
import { Vector3 } from "three";

export const SCALE = 10 ** 6;

export const EARTH_RADIUS = 6_371_000 / SCALE;
export const EARTH_G = 9.81 / SCALE;

export function mapToVec3(lat: number, lon: number, radius: number) {
  var phi = (lat * Math.PI) / 180;
  var theta = ((lon - 180) * Math.PI) / 180;

  var x = -radius * Math.cos(phi) * Math.cos(theta);
  var y = radius * Math.sin(phi);
  var z = radius * Math.cos(phi) * Math.sin(theta);

  return new Vector3(x, y, z);
}

export function meshFromPath(
  path: Vector3[],
  color: THREE.ColorRepresentation = "#FFF"
) {
  const mat = new THREE.LineBasicMaterial({ color: color });
  const geom = new THREE.BufferGeometry().setFromPoints(path);
  const mesh = new THREE.Line(geom, mat);
  return mesh;
}

export class Timer {
  constructor(public every: number, public cb: () => void) {}

  public counter = 0;

  public add(count: number) {
    this.counter += count;
    if (this.counter >= this.every) {
      this.counter -= this.every;
      this.cb.call(this);
    }
  }
}
