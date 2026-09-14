import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(220, 220);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Wireframe Cube
    const geo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const edges = new THREE.EdgesGeometry(geo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x39ff14,
      transparent: true,
      opacity: 0.6,
    });
    const cube = new THREE.LineSegments(edges, wireMat);
    scene.add(cube);

    // Inner glow cube
    const innerGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const innerEdges = new THREE.EdgesGeometry(innerGeo);
    const innerMat = new THREE.LineBasicMaterial({
      color: 0x39ff14,
      transparent: true,
      opacity: 0.2,
    });
    const innerCube = new THREE.LineSegments(innerEdges, innerMat);
    scene.add(innerCube);

    // Outer aura
    const auraGeo = new THREE.BoxGeometry(2.0, 2.0, 2.0);
    const auraEdges = new THREE.EdgesGeometry(auraGeo);
    const auraMat = new THREE.LineBasicMaterial({
      color: 0x39ff14,
      transparent: true,
      opacity: 0.1,
    });
    const auraCube = new THREE.LineSegments(auraEdges, auraMat);
    scene.add(auraCube);

    // Particles
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const r = 1.2 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x39ff14,
      size: 0.03,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    let mouseX = 0,
      mouseY = 0,
      targetX = 0,
      targetY = 0;

    const handleMouse = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / (rect.width / 2) - 1;
      mouseY = (e.clientY - rect.top) / (rect.height / 2) - 1;
    };
    document.addEventListener('mousemove', handleMouse);

    let time = 0;
    let animId: number;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      cube.rotation.x = time * 0.6 + targetY * 0.3;
      cube.rotation.y = time * 0.8 + targetX * 0.3;
      innerCube.rotation.x = -time * 0.4 + targetY * 0.2;
      innerCube.rotation.y = -time * 0.5 + targetX * 0.2;
      auraCube.rotation.x = time * 0.3 + targetY * 0.4;
      auraCube.rotation.y = time * 0.4 + targetX * 0.4;
      particles.rotation.x = time * 0.1;
      particles.rotation.y = time * 0.15;

      const breathe = 0.5 + 0.5 * Math.sin(time * 2);
      wireMat.opacity = 0.4 + breathe * 0.3;
      auraMat.opacity = 0.05 + breathe * 0.1;

      renderer.render(scene, camera);
    }
    animate();

    const ro = new ResizeObserver(() => {
      const sz = container.offsetWidth;
      renderer.setSize(sz, sz);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('mousemove', handleMouse);
      ro.disconnect();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: 220,
        height: 220,
        position: 'relative',
        margin: '0 auto 2.5rem',
        perspective: 800,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
