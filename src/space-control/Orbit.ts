import {
  BufferGeometry,
  ColorRepresentation,
  Line,
  LineBasicMaterial,
  Material,
  Mesh,
  MeshBasicMaterial,
  Scene,
  SphereGeometry,
  Vector3,
} from "three";
import { Satellite } from "./Satellite";
import { EARTH_G } from "./3d-utils";

export class Orbit {
  constructor(public probe: Satellite, color: ColorRepresentation) {
    this.mat = new LineBasicMaterial({ color: color });
  }

  public mat: Material;

  public path?: Vector3[];
  public apoapsis?: Vector3;
  public periapsis?: Vector3;

  public mesh?: Line;
  public apoapsisMesh?: Mesh;
  public periapsisMesh?: Mesh;

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

  public init(scene: Scene) {
    this.calc();
    this.initMesh();
    scene.add(this.mesh!, this.apoapsisMesh!, this.periapsisMesh!);
  }

  public initMesh() {
    if (!this.path || !this.apoapsis || !this.periapsis) return;

    // orbit path mesh
    const geom = new BufferGeometry().setFromPoints(this.path);

    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.geometry = geom;
    } else {
      this.mesh = new Line(geom, this.mat);
    }

    // apsis' mesh
    const apsisGeom = new SphereGeometry(0.2, 6, 6);

    if (!this.apoapsisMesh) {
      const aMat = new MeshBasicMaterial({
        color: "#F80",
      });
      this.apoapsisMesh = new Mesh(apsisGeom, aMat);
    }

    if (!this.periapsisMesh) {
      const pMat = new MeshBasicMaterial({
        color: "#80F",
      });
      this.periapsisMesh = new Mesh(apsisGeom, pMat);
    }

    this.apoapsisMesh.position.copy(this.apoapsis);
    this.periapsisMesh.position.copy(this.periapsis);
  }
}
