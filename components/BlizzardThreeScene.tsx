'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { disposeScene, startSceneLoop } from '@/lib/sceneLifecycle';
import { fitRenderer } from '@/lib/fitRenderer';
import { ThreeSceneProp } from '@/types/interfaces';


const ThreeScene: React.FC<ThreeSceneProp> = ({ velocity }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const velocityRef = useRef(velocity);
  const [webGLUnsupported, setWebGLUnsupported] = useState(false);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const scene = new THREE.Scene();
    const release: Array<() => void> = [() => disposeScene(scene)];
    const cleanup = () => { release.reverse().forEach(dispose => dispose()); };
    try {
      // Scene setup
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 10;

      const renderer = new THREE.WebGLRenderer();
      release.push(() => { renderer.domElement.remove(); renderer.dispose(); });
      renderer.domElement.style.display = "block";
      release.push(fitRenderer(currentMount, renderer, camera));

      // Append renderer to the DOM
      if (currentMount) {
        currentMount.appendChild(renderer.domElement);
      }

      // Orbit controls
      const controls = new OrbitControls(camera, renderer.domElement);
      release.push(() => controls.dispose());

      // Common parameters
      const pointsCount = isMobile ? 4000 : 8000;
      const randomMovementVelocity = 0.05;
      const resetDistance = -100;
      const farthestDistance = 10;
      const curveUpDistance = 3;

      // Function to create a layer of particles
      function createParticleLayer(color: number, size: number, offset: number) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(pointsCount * 3);

        for (let i = 0; i < pointsCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 100;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
          positions[i * 3 + 2] = offset + (Math.random() - 0.5) * 100;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ color, size, opacity: 0.8, transparent: true });
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        return { geometry, positions, material, points };
      }

      // Create layers of particles
      const layers = [
        createParticleLayer(0x018ae6, 0.05, 5), // Closer layer to the observer
        createParticleLayer(0x67b2e3, 0.05, -20),
        createParticleLayer(0x67b2e3, 0.05, -50),
        createParticleLayer(0x67b2e3, 0.05, -100) // Further layer to the observer
      ];

      // Animation loop
      const animate = (frameScale: number) => {
        layers.forEach((layer) => {
          const positions = layer.positions;

          for (let i = 0; i < pointsCount; i++) {
            positions[i * 3 + 2] += velocityRef.current * frameScale; // Use ref value

            if (positions[i * 3 + 2] > curveUpDistance) {
              positions[i * 3 + 1] += velocityRef.current / 3 * frameScale;
            }

            // Random sin for x, cos for y movement
            const randomFactor = randomMovementVelocity * 0.5 * (velocityRef.current / 0.3) * frameScale;
            positions[i * 3] += randomFactor * (Math.random() - 0.5);
            positions[i * 3 + 1] += randomFactor * (Math.random() - 0.5);

            // Reset particles position if they are too far
            if (positions[i * 3 + 2] > farthestDistance) {
              positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
              positions[i * 3] = (Math.random() - 0.5) * 100;
              positions[i * 3 + 2] = resetDistance;
            }
          }

          layer.geometry.attributes.position.needsUpdate = true;
        });

        controls.update();
        renderer.render(scene, camera);
      };
      release.push(startSceneLoop(animate));

      return cleanup;
    } catch {
      cleanup();
      setWebGLUnsupported(true);
    }
  }, []);

  if (webGLUnsupported) return null;
  return <div ref={mountRef} className="w-full h-full" />;
};

export default ThreeScene;
