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
      this.counter = 0;
      this.cb.call(this);
    }
  }
}

export function starPath(size: number) {
  const starCoefficient = 0.4;
  const starPath: Vector3[] = [
    new Vector3(0, size * 2),
    new Vector3(size * starCoefficient, size * starCoefficient),
    new Vector3(size * 2, 0),
    new Vector3(size * starCoefficient, -size * starCoefficient),
    new Vector3(0, -size * 2),
    new Vector3(-size * starCoefficient, -size * starCoefficient),
    new Vector3(-size * 2, 0),
    new Vector3(-size * starCoefficient, size * starCoefficient),
    new Vector3(0, size * 2),
  ];

  const mesh = meshFromPath(starPath, "#F00");
  return mesh as THREE.Object3D;
}

export function locationMarker(
  lat: number,
  lon: number,
  size: number,
  mesh: THREE.Object3D = starPath(size)
) {
  mesh.position.copy(mapToVec3(lat, lon, EARTH_RADIUS));
  mesh.lookAt(new Vector3(0, 0, 0));
  return mesh;
}
