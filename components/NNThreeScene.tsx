'use client';

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { disposeScene, startSceneLoop } from '@/lib/sceneLifecycle';
import { fitRenderer } from "@/lib/fitRenderer";
import { ThreeSceneProp } from "@/types/interfaces";

const NNThreeScene: React.FC<ThreeSceneProp> = ({ velocity }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const velocityRef = useRef(velocity); // useRef per mantenere il valore della velocity
  const [webGLUnsupported, setWebGLUnsupported] = useState(false);

  useEffect(() => {
    velocityRef.current = velocity * (window.matchMedia("(max-width: 767px)").matches ? 5 : 8); // update il valore di velocityRef ogni volta che la prop cambia
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
      scene.background = new THREE.Color(0x000011);

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
      camera.position.z = 600;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      release.push(() => { renderer.domElement.remove(); renderer.dispose(); });
      renderer.domElement.style.display = "block";
      release.push(fitRenderer(currentMount, renderer, camera));
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      // Append renderer to the DOM
      if (currentMount) {
        currentMount.appendChild(renderer.domElement);
      }

      // Orbit controls
      const controls = new OrbitControls(camera, renderer.domElement);
      release.push(() => controls.dispose());

      // Common Parameters
      const maxParticleCount = isMobile ? 250 : 700;
      const layers = 3;
      const layerSpacing = 400;
      const r = isMobile ? 400 : 1500;
      const connectionDistance = isMobile ? 200 : 300;
      const maxConnections = isMobile ? 5 : 10;
      const modelScaleFactor = isMobile ? 1.5 : 4;

      let disposed = false;
      release.push(() => { disposed = true; });
      const loader = new GLTFLoader(); // Inizializza il loader GLTF
      const particleGroupArray: THREE.Group[] = [];
      const connectionsPerParticle = Array(maxParticleCount).fill(0);

      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x4444ff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      });

      // Each undirected connection uses two vertices; each particle has a fixed degree cap.
      const positions = new Float32Array(maxParticleCount * maxConnections * 3);
      const positionAttribute = new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage);
      const connectionGeometry = new THREE.BufferGeometry();
      connectionGeometry.setAttribute("position", positionAttribute);
      connectionGeometry.setDrawRange(0, 0);
      const line = new THREE.LineSegments(connectionGeometry, lineMaterial);
      line.frustumCulled = false;
      scene.add(line);

      loader.load(
        "/models/neuron.gltf", // Percorso del modello GLTF
        (gltf: GLTF) => {
          if (disposed) { disposeScene(gltf.scene); return; }
          const neuronModel = gltf.scene;
          neuronModel.scale.set(modelScaleFactor, modelScaleFactor, modelScaleFactor);

          for (let i = 0; i < maxParticleCount; i++) {
            const particle = neuronModel.clone(); // Clona il modello per ogni particella
            const x = Math.random() * r - r / 2;
            const y = Math.random() * r - r / 2;
            const z = Math.random() * layers * layerSpacing - (layers * layerSpacing) / 2;
            particle.position.set(x, y, z);

            particleGroupArray.push(particle);
            scene.add(particle);
          }
        },
        undefined, // optional
        (error) => {
          console.error("Errore durante il caricamento del modello GLTF:", error);
        }
      );


      const animate = (frameScale: number) => {
        let positionCount = 0;
        connectionsPerParticle.fill(0);

        for (let i = 0; i < particleGroupArray.length; i++) {
          const particlePos = particleGroupArray[i].position;
          particlePos.z += velocityRef.current * frameScale; // Use ref value

          if (particlePos.z > (layers * layerSpacing) / 2) {
            particlePos.z = -(layers * layerSpacing) / 2;
          }
        }

        for (let i = 0; i < particleGroupArray.length; i++) {
          for (let j = i + 1; j < particleGroupArray.length; j++) {
            if (connectionsPerParticle[i] >= maxConnections) break;
            if (connectionsPerParticle[j] >= maxConnections) continue;

            const particlePosA = particleGroupArray[i].position;
            const particlePosB = particleGroupArray[j].position;

            const dx = particlePosA.x - particlePosB.x;
            const dy = particlePosA.y - particlePosB.y;
            const dz = particlePosA.z - particlePosB.z;
            const distanceSquared = dx * dx + dy * dy + dz * dz;

            if (distanceSquared < connectionDistance * connectionDistance) {
              positions[positionCount++] = particlePosA.x;
              positions[positionCount++] = particlePosA.y;
              positions[positionCount++] = particlePosA.z;
              positions[positionCount++] = particlePosB.x;
              positions[positionCount++] = particlePosB.y;
              positions[positionCount++] = particlePosB.z;

              connectionsPerParticle[i]++;
              connectionsPerParticle[j]++;
            }
          }
        }

        connectionGeometry.setDrawRange(0, positionCount / 3);
        positionAttribute.needsUpdate = true;

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

export default NNThreeScene;
