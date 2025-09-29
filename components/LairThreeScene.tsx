"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Terrain as ThreeTerrain } from '../lib/three-terrain/build/THREE.Terrain.Module.mjs';
import { isMobile } from 'react-device-detect';
import { ThreeSceneProp } from '@/types/interfaces';

const Lair: React.FC<ThreeSceneProp> = ({ velocity }) => {
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

    //  color palette to cycle through
    const colorsArray = [0x6e57d2, 0x5a4bb8, 0x463f9e, 0x323384, 0x1e276a, 0x0a1b50, 0x4e2d95,];
    let colorIndex = 0;
    
    // wireframe material
    terrainMesh.material = new THREE.MeshBasicMaterial({
      color: colorsArray[colorIndex],
      wireframe: true,
    });

    terrainMesh.rotation.set(-Math.PI / 2, 0, 0); // X-axis rotation
    terrainMesh.position.set(0, 0, size); // correct positioning along Z
    scene.add(terrainMesh);

    // Creating the mirrored terrain
    const mirroredTerrainMesh = terrainMesh.clone();
    mirroredTerrainMesh.scale.y = -1;
    mirroredTerrainMesh.position.y = size;
    mirroredTerrainMesh.position.set(0, 0, 0); // "size" behind the first terrain
    scene.add(mirroredTerrainMesh);

    // Creating the vertical terrain
    const verticalTerrainMesh = terrainMesh.clone();
    verticalTerrainMesh.scale.z = -1;
    verticalTerrainMesh.position.y = size;
    verticalTerrainMesh.position.set(0, 0, 0);
    scene.add(verticalTerrainMesh);

    // Creating the vertical mirrored terrain
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
        colorIndex = (colorIndex + 1) % colorsArray.length;
        terrainMesh.material = new THREE.MeshBasicMaterial({
          color: colorsArray[colorIndex],
          wireframe: true,
        });
      }
      if (mirroredTerrainMesh.position.z > size) {
        mirroredTerrainMesh.position.z = -size;
        colorIndex = (colorIndex + 1) % colorsArray.length;
        mirroredTerrainMesh.material = new THREE.MeshBasicMaterial({
          color: colorsArray[colorIndex],
          wireframe: true,
        });
      }

      if (verticalTerrainMesh.position.z > size) {
        verticalTerrainMesh.position.z = -size;
        colorIndex = (colorIndex + 1) % colorsArray.length;
        verticalTerrainMesh.material = new THREE.MeshBasicMaterial({
          color: colorsArray[colorIndex],
          wireframe: true,
        });
      }

      if (verticalMirroredTerrainMesh.position.z > size) {
        verticalMirroredTerrainMesh.position.z = -size;
        colorIndex = (colorIndex + 1) % colorsArray.length;
        verticalMirroredTerrainMesh.material = new THREE.MeshBasicMaterial({
          color: colorsArray[colorIndex],
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

export default Lair;