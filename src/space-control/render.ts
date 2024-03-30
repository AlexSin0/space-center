import * as THREE from "three";
import { Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import coastline from "./maps/coastline50.json";
import { mapToVec3, Timer } from "./3d-utils";
import { stats, infoPanel } from "./hud";
import { Satellite } from "./Satellite";
import { EARTH_RADIUS, SCALE } from "./3d-utils";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30);

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

let selected: Satellite | null = null;
const satellites: Satellite[] = [
  new Satellite(
    "Probe-1",
    new Vector3(12, 1, 1),
    new Vector3(0.01, 0.01, 0.04),
    new THREE.CylinderGeometry(0.7, 0.7, 1.4, 6),
    "#FA0"
  ),
  new Satellite(
    "Probe-2",
    new Vector3(8, 1, 1),
    new Vector3(0.0, 0.0, 0.03),
    new THREE.CylinderGeometry(0.6, 0.6, 1.2, 6),
    "#F0C"
  ),
];

infoPanel.element.hidden = true;

function setup(renderer: THREE.Renderer) {
  camera.position.setZ(30);
  blueMarble();

  scene.add(
    ...satellites.map((v) => {
      v.orbit.init(scene);
      return v.mesh;
    })
  );

  // dev
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();
  controls.minDistance = EARTH_RADIUS + 0.1;

  const gridHelper = new THREE.GridHelper(50, 10);
  const axesHelper = new THREE.AxesHelper(16);
  // scene.add(gridHelper, axesHelper);
}

let wiggleMult = 1;
const orbitWiggler = new Timer(3000, () => {
  satellites[0].velocity.y += 0.005 * wiggleMult;
  wiggleMult *= -1;

  satellites[0].orbit.init(scene);
});

function update(time: number, deltaTime: number) {
  orbitWiggler.add(deltaTime);
  satellites.forEach((satellite) => satellite.sim(2));

  if (selected) {
    infoPanel.update(
      selected.name,
      selected.velocity.length() * SCALE,
      (selected.pos.length() - EARTH_RADIUS) * SCALE
    );
  }
}

function onClick() {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(
    satellites.map((v) => v.mesh),
    false
  );

  if (selected) {
    selected.deselect();
    selected = null;
    infoPanel.element.hidden = true;
  }

  if (intersects.length > 0) {
    const satellite = satellites.find((v) => intersects[0].object == v.mesh)!;

    satellite.select();
    selected = satellite;
    infoPanel.element.hidden = false;
  }
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

export function initRender(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setPixelRatio(window.devicePixelRatio);

  function resizeCanvas() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", resizeCanvas, false);
  resizeCanvas();

  document.addEventListener("mousemove", (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  canvas.addEventListener("click", onClick);

  let lastTime = 0;
  let deltaTime = 0;

  function animate(time: number) {
    requestAnimationFrame(animate);
    deltaTime = time - lastTime;
    lastTime = time;

    update(time, deltaTime);

    stats.update();
    renderer.render(scene, camera);
  }

  setup(renderer);
  animate(0);
}
