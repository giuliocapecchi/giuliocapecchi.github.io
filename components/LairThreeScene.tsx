"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Terrain as ThreeTerrain } from '../lib/three-terrain/build/THREE.Terrain.Module.mjs';
import { disposeScene, startSceneLoop } from '@/lib/sceneLifecycle';
import { fitRenderer } from '@/lib/fitRenderer';
import { ThreeSceneProp } from '@/types/interfaces';

const Lair: React.FC<ThreeSceneProp> = ({ velocity }) => {
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
      const fow = isMobile ? 100 : 50;
      const maxDistance = isMobile ? 500 : 750;
      const camera = new THREE.PerspectiveCamera(fow, window.innerWidth / window.innerHeight, 0.1, maxDistance);

      const renderer = new THREE.WebGLRenderer();
      release.push(() => { renderer.domElement.remove(); renderer.dispose(); });
      renderer.domElement.style.display = "block";
      release.push(fitRenderer(currentMount, renderer, camera));

      // Append renderer to the DOM
      if (currentMount) {
        currentMount.appendChild(renderer.domElement);
      }

      // Common parameters
      const size = isMobile ? 500 : 1000;
      const xS = size / 10, yS = size / 10;
      camera.position.z = size / 2;
      camera.rotation.x = -0.1; // incline the camera slightly

      // configuration for the terrain
      const terrain = new ThreeTerrain({
        easing: ThreeTerrain.Linear,
        frequency: 4,
        heightmap: ThreeTerrain.Fault,
        material: new THREE.MeshBasicMaterial({ color: 0x6e57d2, wireframe: true }),
        maxHeight: -10,
        minHeight: -200,
        steps: 1,
        xSegments: xS,
        xSize: size,
        ySegments: yS,
        ySize: size,
      });

      const terrainMesh = terrain.getScene().children[0] as THREE.Mesh;

      //  color palette to cycle through
      const colorsArray = [0x6e57d2, 0x5a4bb8, 0x463f9e, 0x323384, 0x1e276a, 0x0a1b50, 0x4e2d95,];
      let colorIndex = 0;

      terrainMesh.rotation.set(-Math.PI / 2, 0, 0); // X-axis rotation
      terrainMesh.position.set(0, 0, size); // correct positioning along Z
      scene.add(terrainMesh);

      // Creating the mirrored terrain
      const mirroredTerrainMesh = terrainMesh.clone();
      mirroredTerrainMesh.material = (terrainMesh.material as THREE.MeshBasicMaterial).clone();
      mirroredTerrainMesh.scale.y = -1;
      mirroredTerrainMesh.position.y = size;
      mirroredTerrainMesh.position.set(0, 0, 0); // "size" behind the first terrain
      scene.add(mirroredTerrainMesh);

      // Creating the vertical terrain
      const verticalTerrainMesh = terrainMesh.clone();
      verticalTerrainMesh.material = (terrainMesh.material as THREE.MeshBasicMaterial).clone();
      verticalTerrainMesh.scale.z = -1;
      verticalTerrainMesh.position.y = size;
      verticalTerrainMesh.position.set(0, 0, 0);
      scene.add(verticalTerrainMesh);

      // Creating the vertical mirrored terrain
      const verticalMirroredTerrainMesh = verticalTerrainMesh.clone();
      verticalMirroredTerrainMesh.material = (terrainMesh.material as THREE.MeshBasicMaterial).clone();
      verticalMirroredTerrainMesh.scale.y = -1;
      verticalMirroredTerrainMesh.position.y = size;
      verticalMirroredTerrainMesh.position.set(0, 0, size); // "size" behind the first terrain
      scene.add(verticalMirroredTerrainMesh);

      const animate = (frameScale: number) => {
        terrainMesh.position.z += velocityRef.current * 4 * frameScale;
        mirroredTerrainMesh.position.z += velocityRef.current * 4 * frameScale;
        verticalTerrainMesh.position.z += velocityRef.current * 4 * frameScale;
        verticalMirroredTerrainMesh.position.z += velocityRef.current * 4 * frameScale;

        if (terrainMesh.position.z > size) {
          terrainMesh.position.z = -size;
          colorIndex = (colorIndex + 1) % colorsArray.length;
          (terrainMesh.material as THREE.MeshBasicMaterial).color.setHex(colorsArray[colorIndex]);
        }
        if (mirroredTerrainMesh.position.z > size) {
          mirroredTerrainMesh.position.z = -size;
          colorIndex = (colorIndex + 1) % colorsArray.length;
          (mirroredTerrainMesh.material as THREE.MeshBasicMaterial).color.setHex(colorsArray[colorIndex]);
        }

        if (verticalTerrainMesh.position.z > size) {
          verticalTerrainMesh.position.z = -size;
          colorIndex = (colorIndex + 1) % colorsArray.length;
          (verticalTerrainMesh.material as THREE.MeshBasicMaterial).color.setHex(colorsArray[colorIndex]);
        }

        if (verticalMirroredTerrainMesh.position.z > size) {
          verticalMirroredTerrainMesh.position.z = -size;
          colorIndex = (colorIndex + 1) % colorsArray.length;
          (verticalMirroredTerrainMesh.material as THREE.MeshBasicMaterial).color.setHex(colorsArray[colorIndex]);
        }

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

export default Lair;
