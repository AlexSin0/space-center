import * as THREE from "three";
import { Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import coastline from "./maps/coastline.json";
import { mapToVec3, meshFromPath } from "./3d-utils";
import { Satellite } from "./Satellite";
import { EARTH_RADIUS } from "./3d-utils";

const scene = new THREE.Scene();

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

  const probe = new Satellite(
    new Vector3(12, 1, 1),
    new Vector3(0.01, 0.01, 0.04)
  );

  const probeMat = new THREE.MeshBasicMaterial({
    color: "#F00",
    wireframe: true,
  });
  const probeGeom = new THREE.CylinderGeometry(0.5, 0.5, 1, 6);
  const probeMesh = new THREE.Mesh(probeGeom, probeMat);

  probeMesh.position.copy(probe.pos);

  scene.add(probeMesh);

  function orbitTest(
    iterations = 80,
    step = 35,
    color: THREE.ColorRepresentation = "#F00"
  ) {
    probe.calcOrbit(iterations, step);
    const orbitPath = probe.orbit!;
    const orbitMesh = meshFromPath(orbitPath, color);

    const apoapsisMesh = meshFromPath([probe.apoapsis!, new Vector3()], "#F80");
    const periapsisMesh = meshFromPath(
      [probe.periapsis!, new Vector3()],
      "#80F"
    );

    scene.add(orbitMesh, apoapsisMesh, periapsisMesh);
  }

  orbitTest(300, 10, "#F00");

  // update
  let lastTime = 0;
  let deltaTime = 0;

  function animate(time: number) {
    requestAnimationFrame(animate);

    deltaTime = time - lastTime;
    lastTime = time;

    // console.log(deltaTime);

    probe.sim(2);
    probeMesh.position.copy(probe.pos);

    renderer.render(scene, camera);
  }

  animate(0);
}

function blueMarble() {
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
