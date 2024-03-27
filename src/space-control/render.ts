import * as THREE from "three";
import { Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import coastline from "./maps/coastline50.json";
import { mapToVec3 } from "./3d-utils";
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
  controls.update();
  controls.minDistance = EARTH_RADIUS + 0.1;

  const gridHelper = new THREE.GridHelper(50, 10);
  const axesHelper = new THREE.AxesHelper(16);
  //scene.add(gridHelper, axesHelper);

  // setup
  blueMarble();

  const probeMat = new THREE.MeshBasicMaterial({
    color: "#F00",
    wireframe: true,
  });
  const probeGeom = new THREE.CylinderGeometry(0.5, 0.5, 1, 6);

  const probe = new Satellite(
    new Vector3(12, 1, 1),
    new Vector3(0.01, 0.01, 0.04),
    new THREE.Mesh(probeGeom, probeMat)
  );

  scene.add(probe.mesh);

  probe.orbit.init(scene, "#F00");

  // update
  let lastTime = 0;
  let deltaTime = 0;

  class Timer {
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

  let wMult = 1;
  const orbitWiggler = new Timer(4000, () => {
    probe.velocity.y += 0.01 * wMult;
    wMult *= -1;

    probe.orbit.init(scene, "#F00");
  });

  function animate(time: number) {
    requestAnimationFrame(animate);

    deltaTime = time - lastTime;
    lastTime = time;

    orbitWiggler.add(deltaTime);
    probe.sim(2);

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
    transparent: false,
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
