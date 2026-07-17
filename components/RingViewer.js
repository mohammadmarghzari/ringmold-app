import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildRingParts, loadFont } from "../lib/ringMold";

export default function RingViewer({ design, height = 300 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;

    const width = mount.clientWidth;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x11141c);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 20, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const group = new THREE.Group();
    group.rotation.x = -Math.PI / 2;
    scene.add(group);

    (design.engraveText ? loadFont() : Promise.resolve(null)).then((font) => {
      if (cancelled) return;
      const parts = buildRingParts(design, font);
      parts.forEach(({ geometry, color }) => {
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.4 }));
        group.add(mesh);
      });
    });

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [design, height]);

  return <div ref={mountRef} style={{ width: "100%", height, borderRadius: 8, overflow: "hidden" }} />;
}
