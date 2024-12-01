"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Terrain as ThreeTerrain } from '../lib/three-terrain/build/THREE.Terrain.Module.mjs';
import { isMobile } from 'react-device-detect';
import { ThreeSceneProp } from '@/types/interfaces';

const Terrain: React.FC<ThreeSceneProp> = ({ velocity }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const velocityRef = useRef(velocity); 
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    velocityRef.current = velocity; 
  }, [velocity]);

  useEffect(() => {
    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const fow = isMobile ? 100 : 50;
    const maxDistance = isMobile ? 500 : 750;
    const camera = new THREE.PerspectiveCamera(fow, window.innerWidth / window.innerHeight, 0.1, maxDistance);
    
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Append renderer to the DOM
    if (currentMount) {
      currentMount.appendChild(renderer.domElement);
    }
    
    // Common parameters
    const size = isMobile ? 500 : 1000;
    const xS = size/10, yS = size/10;
    camera.position.z = size / 2;    
    camera.rotation.x = -0.1; // incline the camera slightly

    // configuration for the terrain
    const terrain = new ThreeTerrain({
      easing: ThreeTerrain.Linear,
      frequency: 4,
      heightmap: ThreeTerrain.Fault,
      material: new THREE.MeshLambertMaterial({ color: "#9A9A9A" }),
      maxHeight: -10,
      minHeight: -200,
      steps: 1,
      xSegments: xS,
      xSize: size,
      ySegments: yS,
      ySize: size,
    });

    const terrainMesh = terrain.getScene().children[0] as THREE.Mesh;

    let color = 0x6e57d2;
    
    // wireframe material
    terrainMesh.material = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true,
    });

    terrainMesh.rotation.set(-Math.PI / 2, 0, 0); // X-axis rotation
    terrainMesh.position.set(0, 0, size); // correct positioning along Z
    scene.add(terrainMesh);

    // Creazione del terreno speculare
    const mirroredTerrainMesh = terrainMesh.clone();
    mirroredTerrainMesh.scale.y = -1;
    mirroredTerrainMesh.position.y = size;
    mirroredTerrainMesh.position.set(0, 0, 0); // "size" behind the first terrain
    scene.add(mirroredTerrainMesh);

    // Creazione del terreno speculare
    const verticalTerrainMesh = terrainMesh.clone();
    verticalTerrainMesh.scale.z = -1;
    verticalTerrainMesh.position.y = size;
    verticalTerrainMesh.position.set(0, 0, 0); // "size" behind the first terrain
    scene.add(verticalTerrainMesh);

    // Creazione del terreno speculare
    const verticalMirroredTerrainMesh = verticalTerrainMesh.clone();
    verticalMirroredTerrainMesh.scale.y = -1;
    verticalMirroredTerrainMesh.position.y = size;
    verticalMirroredTerrainMesh.position.set(0, 0, size); // "size" behind the first terrain
    scene.add(verticalMirroredTerrainMesh);

    const light = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10).normalize();
    scene.add(directionalLight);

    const animate = () => {
      terrainMesh.position.z += velocityRef.current * 4;
      mirroredTerrainMesh.position.z += velocityRef.current * 4;
      verticalTerrainMesh.position.z += velocityRef.current * 4;
      verticalMirroredTerrainMesh.position.z += velocityRef.current * 4;
    
      if (terrainMesh.position.z > size) {
        terrainMesh.position.z = -size;
        color -= 0x100000;
        if (color < 0x0F0000) {
          color = 0x8264c0;
        }
        terrainMesh.material = new THREE.MeshBasicMaterial({
          color: color,
          wireframe: true,
        });
      }
      if (mirroredTerrainMesh.position.z > size) {
        mirroredTerrainMesh.position.z = -size;
        color -= 0x100000;
        if (color < 0x0F0000) {
          color = 0x8264c0;
        }
        mirroredTerrainMesh.material = new THREE.MeshBasicMaterial({
          color: color,
          wireframe: true,
        });
      }

      if (verticalTerrainMesh.position.z > size) {
        verticalTerrainMesh.position.z = -size;
        color -= 0x100000;
        if (color < 0x0F0000) {
          color = 0x8264c0;
        }
        verticalTerrainMesh.material = new THREE.MeshBasicMaterial({
          color: color,
          wireframe: true,
        });
      }

      if (verticalMirroredTerrainMesh.position.z > size) {
        verticalMirroredTerrainMesh.position.z = -size;
        color -= 0x100000;
        if (color < 0x0F0000) {
          color = 0x8264c0;
        }
        verticalMirroredTerrainMesh.material = new THREE.MeshBasicMaterial({
          color: color,
          wireframe: true,
        });
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Fade-in effect: gradually increase the opacity over 1 second
    const fadeInEffect = setInterval(() => {
      setOpacity((prev) => {
        if (prev < 1) {
          return prev + 0.2; // Increment opacity
        }
        clearInterval(fadeInEffect); // Stop the interval when opacity reaches 1
        return 1;
      });
    }, 10);

    // Cleanup on unmount
    return () => {
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100vh',
        opacity,
        transition: 'opacity 1s ease-in-out', // Smooth transition for fade-in effect
      }}
    />
  );
};

export default Terrain;