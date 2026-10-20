import { useEffect, useRef, useState } from "react";
import type { MeshStandardMaterial } from "three";
import styles from "./GameCharacter.module.css";

export default function GameCharacter({
  color,
  variant = 0,
}: {
  color: string;
  variant?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<{
    paint: MeshStandardMaterial;
    render: () => void;
  } | null>(null);
  const [enabled, setEnabled] = useState(
    () => window.matchMedia("(min-width: 601px)").matches,
  );
  const [status, setStatus] = useState("Loading 3D preview…");
  const [ready, setReady] = useState(false);
  const latestColor = useRef(color);
  useEffect(() => {
    latestColor.current = color;
    engine.current?.paint.color.set(color);
    engine.current?.render();
  }, [color]);
  useEffect(() => {
    if (!enabled || !host.current) return;
    let cancelled = false;
    let cleanup = () => {};
    const element = host.current;
    setReady(false);
    setStatus("Loading 3D preview…");
    Promise.all([
      import("three"),
      import("three/addons/controls/OrbitControls.js"),
    ])
      .then(([T, { OrbitControls }]) => {
        if (cancelled) return;
        const renderer = new T.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(34, 1, 0.1, 40);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0, 0);
        renderer.outputColorSpace = T.SRGBColorSpace;
        element.appendChild(renderer.domElement);
        renderer.domElement.setAttribute(
          "aria-label",
          "Interactive 3D armor prototype. Drag to rotate.",
        );
        renderer.domElement.setAttribute("role", "img");
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.minPolarAngle = 0.65;
        controls.maxPolarAngle = 2.1;
        camera.position.set(3.5, 2.7, 7);
        controls.target.set(0, 1.65, 0);
        controls.update();
        scene.add(new T.HemisphereLight(0xdbeaff, 0x26313f, 2.5));
        const key = new T.DirectionalLight(0xffeed6, 4);
        key.position.set(3, 5, 4);
        scene.add(key);
        const rim = new T.DirectionalLight(0x83baff, 3);
        rim.position.set(-3, 3, -2);
        scene.add(rim);
        const armor = new T.MeshStandardMaterial({
          color: 0x343d4a,
          metalness: 0.65,
          roughness: 0.38,
        });
        const dark = new T.MeshStandardMaterial({
          color: 0x101720,
          metalness: 0.3,
          roughness: 0.65,
        });
        const paint = new T.MeshStandardMaterial({
          color: latestColor.current,
          metalness: 0.45,
          roughness: 0.3,
        });
        const glow = new T.MeshStandardMaterial({
          color: 0xd0f4ff,
          emissive: 0x65cfff,
          emissiveIntensity: 2,
        });
        const robot = new T.Group();
        scene.add(robot);
        function box(
          w: number,
          h: number,
          d: number,
          x: number,
          y: number,
          z: number,
          material = armor,
        ) {
          const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), material);
          mesh.position.set(x, y, z);
          robot.add(mesh);
          return mesh;
        }
        function joint(x: number, y: number, z: number, r = 0.12) {
          const mesh = new T.Mesh(new T.SphereGeometry(r, 12, 8), dark);
          mesh.position.set(x, y, z);
          robot.add(mesh);
        }
        box(0.78, 0.78, 0.4, 0, 2.15, 0);
        box(0.65, 0.16, 0.08, 0, 2.43, 0.25, paint);
        box(0.16, 0.42, 0.07, 0, 2.12, 0.25, paint);
        box(0.56, 0.25, 0.34, 0, 1.64, 0, dark);
        box(0.68, 0.3, 0.4, 0, 1.38, 0);
        box(0.3, 0.16, 0.1, 0, 1.42, 0.25, paint);
        box(0.28, 0.17, 0.28, 0, 2.64, 0, dark);
        const helmet = box(0.52, 0.5, 0.48, 0, 2.98, 0);
        helmet.rotation.z = 0.04;
        box(0.43, 0.12, 0.035, 0, 3.02, 0.26, dark);
        box(0.34, 0.045, 0.045, 0, 3.03, 0.285, glow);
        box(0.09, 0.3, 0.045, 0, 2.88, 0.26, paint);
        box(0.5, 0.6, 0.24, 0, 2.2, -0.32, dark);
        for (const sign of [-1, 1]) {
          const x = sign * 0.28;
          joint(x, 1.2, 0, 0.14);
          box(0.3, 0.56, 0.32, x, 0.95, 0);
          box(0.18, 0.36, 0.04, x, 0.97, 0.18, paint);
          joint(x, 0.62, 0);
          box(0.32, 0.16, 0.1, x, 0.63, 0.2, paint);
          box(0.29, 0.46, 0.31, x, 0.33, 0);
          box(0.34, 0.18, 0.57, x, 0.07, 0.11, dark);
          box(0.25, 0.07, 0.25, x, 0.18, 0.21, armor);
          joint(sign * 0.51, 2.42, 0, 0.16);
          const shoulder = box(0.38, 0.29, 0.43, sign * 0.57, 2.43, 0, paint);
          shoulder.rotation.z = sign * -0.17;
          box(0.24, 0.48, 0.28, sign * 0.62, 2.09, 0);
          joint(sign * 0.65, 1.8, 0);
          const arm = box(0.29, 0.46, 0.32, sign * 0.69, 1.53, 0.06);
          arm.rotation.z = sign * 0.1;
          box(0.14, 0.29, 0.05, sign * 0.69, 1.55, 0.24, paint);
          box(0.22, 0.22, 0.24, sign * 0.72, 1.17, 0.08, dark);
        }
        // Distinct blockout equipment while final character models are unavailable.
        if (variant === 0) box(0.15, 0.55, 0.12, -0.35, 3.24, -0.1, paint);
        if (variant === 1) {
          box(0.85, 0.08, 0.65, 0, 3.16, 0, paint);
          box(0.4, 0.3, 0.07, 0.78, 1.1, 0.2, paint);
        }
        if (variant === 2) box(0.6, 0.42, 0.09, -0.82, 1.65, 0.3, glow);
        if (variant === 3) {
          box(0.36, 0.85, 0.3, 0, 2.4, -0.48, paint);
          box(0.04, 0.8, 0.04, 0.2, 2.95, -0.48, glow);
        }
        if (variant === 4) {
          box(0.18, 1.5, 0.18, 0.95, 1.8, 0.15, glow);
          box(0.5, 0.12, 0.15, 0.95, 2.5, 0.15, paint);
        }
        if (variant === 5) {
          box(0.6, 0.7, 0.3, -0.8, 1.7, 0.2, paint);
          box(0.18, 0.65, 0.18, 0.85, 1.4, 0.1, paint);
        }
        const base = new T.Mesh(
          new T.CylinderGeometry(0.85, 0.95, 0.08, 40),
          dark,
        );
        base.position.y = -0.07;
        scene.add(base);
        let visible = true;
        const render = () => {
          if (visible && !document.hidden && !cancelled)
            renderer.render(scene, camera);
        };
        const resize = () => {
          const { width, height } = element.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          render();
        };
        controls.addEventListener("change", render);
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(element);
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          render();
        });
        observer.observe(element);
        const lost = (event: Event) => {
          event.preventDefault();
          setReady(false);
          setStatus("3D unavailable. Character image shown instead.");
        };
        renderer.domElement.addEventListener("webglcontextlost", lost);
        document.addEventListener("visibilitychange", render);
        engine.current = {
          paint,
          render,
        };
        cleanup = () => {
          engine.current = null;
          resizeObserver.disconnect();
          observer.disconnect();
          document.removeEventListener("visibilitychange", render);
          controls.dispose();
          scene.traverse((object) => {
            if (object instanceof T.Mesh) object.geometry.dispose();
          });
          [armor, dark, paint, glow].forEach((m) => m.dispose());
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.removeEventListener("webglcontextlost", lost);
          renderer.domElement.remove();
        };
        resize();
        setReady(true);
        setStatus("");
      })
      .catch(() => {
        if (!cancelled) {
          cleanup();
          setStatus("3D unavailable. Character image shown instead.");
          setReady(false);
        }
      });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [enabled, variant]);
  return (
    <div className={styles.viewer}>
      {!ready && (
        <img
          className={styles.poster}
          src="/images/game.png"
          alt="Temporary armor character illustration"
        />
      )}
      <div
        ref={host}
        className={styles.surface}
        style={{ visibility: ready ? "visible" : "hidden" }}
      />
      <span className={styles.badge}>3D INTERACTION PROTOTYPE</span>
      {!enabled ? (
        <button className={styles.load} onClick={() => setEnabled(true)}>
          View in 3D
        </button>
      ) : !ready ? (
        <span className={styles.status} role="status">
          {status}
        </span>
      ) : null}
    </div>
  );
}
