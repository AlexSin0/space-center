import * as THREE from "three";

export function mapToVec3(lat: number, lon: number, radius: number) {
  var phi = (lat * Math.PI) / 180;
  var theta = ((lon - 180) * Math.PI) / 180;

  var x = -radius * Math.cos(phi) * Math.cos(theta);
  var y = radius * Math.sin(phi);
  var z = radius * Math.cos(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}
