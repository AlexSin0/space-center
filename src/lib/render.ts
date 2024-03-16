import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import coastline from "@/map/coastline.json";

export function initRender(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
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

  const basicMat = new THREE.MeshBasicMaterial({ color: "#000" });
  const lineMat = new THREE.LineBasicMaterial({ color: "#0F0" });
  const wireMat = new THREE.MeshBasicMaterial({
    color: "#247",
    wireframe: true,
  });

  const radius = 10;

  const sphereGeom = new THREE.SphereGeometry(radius - 0.05);
  const sphereMesh = new THREE.Mesh(sphereGeom, wireMat);
  scene.add(sphereMesh);

  const baseMat = new THREE.MeshBasicMaterial({ color: "#000" });
  const baseGeom = new THREE.SphereGeometry(radius - 0.1);
  const baseMesh = new THREE.Mesh(baseGeom, baseMat);
  scene.add(baseMesh);

  function mapToVec3(lat: number, lon: number, radius: number) {
    var phi = (lat * Math.PI) / 180;
    var theta = ((lon - 180) * Math.PI) / 180;

    var x = -radius * Math.cos(phi) * Math.cos(theta);
    var y = radius * Math.sin(phi);
    var z = radius * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
  }

  const lines = coastline.features.map((feature) => {
    const cords = feature.geometry.coordinates;
    const path = cords.map((point) => mapToVec3(point[1], point[0], radius));
    const geometry = new THREE.BufferGeometry().setFromPoints(path);
    const line = new THREE.Line(geometry, lineMat);
    return line;
  });

  scene.add(...lines);

  // update
  function animate(time: number) {
    requestAnimationFrame(animate);

    console.log(time);

    renderer.render(scene, camera);
  }

  animate(0);
}
