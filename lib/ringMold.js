import * as THREE from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const GOLD = 0xc9a24b;
const STONE_DARK = 0x1a1a2e;

let fontPromise = null;
function loadFont() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!fontPromise) {
    fontPromise = new Promise((resolve) => {
      new FontLoader().load("/fonts/helvetiker_regular.typeface.json", resolve, undefined, () => resolve(null));
    });
  }
  return fontPromise;
}

// از روی مشخصات طرح (میلی‌متر)، مدل سه‌بعدی بدنه‌ی حلقه (master model) رو می‌سازه.
// این مدل همون چیزیه که قالب‌ساز/پرینتر سه‌بعدی برای ساخت مدل مستر ریخته‌گری بهش نیاز داره.
export function buildRingParts(design, font) {
  const innerD = Number(design.innerDiameter) || 16;
  const bandWidth = Number(design.bandWidth) || 5;
  const bandThickness = Number(design.bandThickness) || 1.5;
  const topShape = design.topShape || "none";
  const topWidth = Number(design.topWidth) || 0;
  const topHeight = Number(design.topHeight) || 0;
  const hasStone = !!design.hasStone;
  const stoneShape = design.stoneShape || "round";
  const stoneSize = Number(design.stoneSize) || 0;

  const innerR = innerD / 2;
  const outerR = innerR + bandThickness;

  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const bandGeo = new THREE.ExtrudeGeometry(shape, {
    depth: bandWidth,
    bevelEnabled: true,
    bevelThickness: 0.25,
    bevelSize: 0.25,
    bevelSegments: 2,
    curveSegments: 64,
  });

  const parts = [{ geometry: bandGeo, color: GOLD }];

  let topFlatZ = null; // اگر روکار یه سطح صاف داشته باشه، اینجا برای حکاکی استفاده می‌شه

  if (topShape !== "none" && topWidth > 0) {
    const centerY = outerR + topWidth * 0.15;
    const zCenter = bandWidth / 2;

    if (topShape === "round-dome") {
      const bumpR = topWidth / 2;
      const dome = new THREE.SphereGeometry(bumpR, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2);
      dome.scale(1, 1, Math.max(topHeight, 0.5) / bumpR);
      dome.rotateX(Math.PI / 2);
      dome.translate(0, centerY, zCenter);
      parts.push({ geometry: dome, color: GOLD });
    } else if (topShape === "oval-dome") {
      const bumpR = topWidth / 2;
      const dome = new THREE.SphereGeometry(bumpR, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2);
      dome.scale(0.7, 1, Math.max(topHeight, 0.5) / bumpR);
      dome.rotateX(Math.PI / 2);
      dome.translate(0, centerY, zCenter);
      parts.push({ geometry: dome, color: GOLD });
    } else if (topShape === "square-signet") {
      const h = Math.max(topHeight, 1.5);
      const signet = new THREE.CylinderGeometry(topWidth / 2, topWidth * 0.65 / 2, h, 4, 1);
      signet.rotateY(Math.PI / 4);
      signet.rotateX(Math.PI / 2);
      signet.translate(0, centerY, zCenter + h / 2);
      parts.push({ geometry: signet, color: GOLD });
      topFlatZ = zCenter + h; // سطح صاف بالای روکار، برای حکاکی
    }

    if (hasStone && stoneSize > 0) {
      const sZ = zCenter + Math.max(topHeight, 1) + stoneSize * 0.3;
      let stoneGeo;
      if (stoneShape === "square") {
        stoneGeo = new THREE.BoxGeometry(stoneSize, stoneSize, stoneSize * 0.6);
      } else {
        stoneGeo = new THREE.OctahedronGeometry(stoneSize / 2, 0);
      }
      stoneGeo.translate(0, centerY, sZ);
      parts.push({ geometry: stoneGeo, color: STONE_DARK });
    }
  }

  if (design.engraveText && topFlatZ !== null && font) {
    const textGeo = new TextGeometry(design.engraveText.slice(0, 8), {
      font,
      size: Math.min(topWidth * 0.35, 3),
      depth: 0.4,
      curveSegments: 6,
    });
    textGeo.computeBoundingBox();
    const w = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
    textGeo.rotateX(Math.PI / 2);
    textGeo.translate(-w / 2, outerR + topWidth * 0.15, topFlatZ);
    parts.push({ geometry: textGeo, color: GOLD });
  }

  return parts;
}

export async function exportRingSTL(design) {
  const font = design.engraveText ? await loadFont() : null;
  const scene = new THREE.Scene();
  const parts = buildRingParts(design, font);
  parts.forEach(({ geometry }) => {
    scene.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial()));
  });

  const exporter = new STLExporter();
  const result = exporter.parse(scene, { binary: false });
  return new Blob([result], { type: "model/stl" });
}

export { loadFont };
