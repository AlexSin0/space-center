import * as THREE from "three";
import { Vector3 } from "three";
import { Satellite } from "./Satellite";
import { EARTH_G } from "./3d-utils";

export class Orbit {
  constructor(public probe: Satellite, color: THREE.ColorRepresentation) {
    this.mat = new THREE.LineBasicMaterial({ color: color });
  }

  public mat: THREE.Material;

  public path?: Vector3[];
  public apoapsis?: Vector3;
  public periapsis?: Vector3;

  public mesh?: THREE.Line;
  public apoapsisMesh?: THREE.Mesh;
  public periapsisMesh?: THREE.Mesh;

  public calc(iterations = 80, step = 35) {
    const _pos = this.probe.pos.clone();
    const _velocity = this.probe.velocity.clone();

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

    this.path = orbitPath;
  }

  public init(scene: THREE.Scene) {
    this.calc();
    this.initMesh();
    scene.add(this.mesh!, this.apoapsisMesh!, this.periapsisMesh!);
  }

  public initMesh() {
    if (!this.path || !this.apoapsis || !this.periapsis) return;

    // orbit path mesh
    const geom = new THREE.BufferGeometry().setFromPoints(this.path);

    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.geometry = geom;
    } else {
      this.mesh = new THREE.Line(geom, this.mat);
    }

    // apsis' mesh
    const apsisGeom = new THREE.SphereGeometry(0.2, 6, 6);

    if (!this.apoapsisMesh) {
      const aMat = new THREE.MeshBasicMaterial({
        color: "#F80",
      });
      this.apoapsisMesh = new THREE.Mesh(apsisGeom, aMat);
    }

    if (!this.periapsisMesh) {
      const pMat = new THREE.MeshBasicMaterial({
        color: "#80F",
      });
      this.periapsisMesh = new THREE.Mesh(apsisGeom, pMat);
    }

    this.apoapsisMesh.position.copy(this.apoapsis);
    this.periapsisMesh.position.copy(this.periapsis);
  }
}
