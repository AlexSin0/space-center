import * as THREE from "three";
import { Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mapToVec3 } from "./3d-utils";
import coastline from "@/map/coastline50.json";

const scene = new THREE.Scene();

const EARTH_RADIUS = 6_371_000 / 10 ** 6; // *10^6 m
const EARTH_G = 9.81 / 10 ** 6;

export function initRender(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.setZ(30);

  // dev
  const controls = new OrbitControls(camera, renderer.domElement);

  const gridHelper = new THREE.GridHelper(50, 10);
  const axesHelper = new THREE.AxesHelper(16);
  //scene.add(gridHelper, axesHelper);

  // setup

  blueMarble();

  const orbitPath = simOrbit(
    new Vector3(10, 0, 0),
    new Vector3(0.01, 0.0, 0.04)
  );
  const orbitMat = new THREE.LineBasicMaterial({ color: "#F00" });
  const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPath);
  const orbitMesh = new THREE.Line(orbitGeom, orbitMat);
  scene.add(orbitMesh);

  const orbitPath2 = simOrbit(
    new Vector3(1, 8, 0),
    new Vector3(0.0, 0.01, 0.03)
  );
  const orbitMat2 = new THREE.LineBasicMaterial({ color: "#FF0" });
  const orbitGeom2 = new THREE.BufferGeometry().setFromPoints(orbitPath2);
  const orbitMesh2 = new THREE.Line(orbitGeom2, orbitMat2);
  scene.add(orbitMesh2);

  // update
  function animate(time: number) {
    requestAnimationFrame(animate);

    //console.log(time);

    renderer.render(scene, camera);
  }

  animate(0);
}

function simOrbit(pos: Vector3, velocity: Vector3, iterations = 80, step = 35) {
  const orbitPath: Vector3[] = [];
  orbitPath.push(structuredClone(pos));

  for (let i = 0; i < iterations; i++) {
    velocity.addScaledVector(pos, -EARTH_G * step);
    pos.addScaledVector(velocity, step);
    orbitPath.push(structuredClone(pos));
  }

  return orbitPath;
}

function blueMarble() {
  const basicMat = new THREE.MeshBasicMaterial({ color: "#000" });
  const lineMat = new THREE.LineBasicMaterial({ color: "#0F0" });
  const wireMat = new THREE.MeshBasicMaterial({
    color: "#035",
    wireframe: true,
  });

  const sphereGeom = new THREE.SphereGeometry(EARTH_RADIUS - 0.05);
  const sphereMesh = new THREE.Mesh(sphereGeom, wireMat);
  scene.add(sphereMesh);

  const baseMat = new THREE.MeshBasicMaterial({
    color: "#000",
    transparent: true,
    opacity: 0.6,
  });
  const baseGeom = new THREE.SphereGeometry(EARTH_RADIUS - 0.1);
  const baseMesh = new THREE.Mesh(baseGeom, baseMat);
  scene.add(baseMesh);

  const lines = coastline.features.map((feature) => {
    const cords = feature.geometry.coordinates;
    const path = cords.map((point) =>
      mapToVec3(point[1], point[0], EARTH_RADIUS)
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(path);
    const line = new THREE.Line(geometry, lineMat);
    return line;
  });
  scene.add(...lines);
}
