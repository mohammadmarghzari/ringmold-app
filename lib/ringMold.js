import * as THREE from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";

// از روی اندازه‌های ثبت‌شده (میلی‌متر)، مدل سه‌بعدی بدنه‌ی حلقه (master model) رو می‌سازه.
// این مدل همون چیزیه که قالب‌ساز/پرینتر سه‌بعدی برای ساخت مدل مستر ریخته‌گری بهش نیاز داره.
export function buildRingGeometry(measurements, ringType) {
  const outerD = Number(measurements.outerDiameter) || 20;
  const innerD = Number(measurements.innerDiameter) || 16;
  const bandWidth = Number(measurements.bandWidth) || 5;
  const stoneHeight = Number(measurements.stoneHeight) || 0;

  const outerR = outerD / 2;
  const innerR = Math.min(innerD / 2, outerR - 0.5);

  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const extrudeSettings = {
    depth: bandWidth,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.3,
    bevelSegments: 2,
    curveSegments: 64,
  };

  const geometries = [new THREE.ExtrudeGeometry(shape, extrudeSettings)];

  if (ringType === "stoned" && stoneHeight > 0) {
    const bumpR = Math.max(1.5, (outerR - innerR) * 0.8);
    const bump = new THREE.SphereGeometry(bumpR, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    bump.translate(0, outerR - (outerR - innerR) / 2, bandWidth / 2);
    bump.scale(1, 1, stoneHeight / bumpR || 1);
    geometries.push(bump);
  }

  return geometries;
}

export function exportRingSTL(measurements, ringType) {
  const scene = new THREE.Scene();
  const geometries = buildRingGeometry(measurements, ringType);
  geometries.forEach((geo) => {
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial());
    scene.add(mesh);
  });

  const exporter = new STLExporter();
  const result = exporter.parse(scene, { binary: false });
  return new Blob([result], { type: "model/stl" });
}
