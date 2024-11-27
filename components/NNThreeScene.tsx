'use client';

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { isMobile } from "react-device-detect";
import { ThreeSceneProp } from "@/types/interfaces";

const NNThreeScene: React.FC<ThreeSceneProp> = ({ velocity }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const velocityRef = useRef(velocity); // useRef per mantenere il valore della velocity
  const [opacity, setOpacity] = useState(0);


  useEffect(() => {
    velocityRef.current = velocity * 10 ; // update il valore di velocityRef ogni volta che la prop cambia
  }, [velocity]);

  useEffect(() => {
    const currentMount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);

    const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,1,5000);
    camera.position.z = 600;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Append renderer to the DOM
    if (currentMount) {
      currentMount.appendChild(renderer.domElement);
  }

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Common Parameters
    const maxParticleCount = isMobile ? 250 : 700;
    const layers = 3;
    const layerSpacing = 400;
    const r = isMobile ? 400 : 1500;
    const connectionDistance = isMobile ? 200 : 300;
    const maxConnections = isMobile ? 5 : 10;
    const modelScaleFactor = isMobile ? 1.5 : 4;

    const loader = new GLTFLoader(); // Inizializza il loader GLTF
    const particleGroupArray: THREE.Group[] = [];
    const particlesData: { velocity: THREE.Vector3 }[] = [];
    const connectionsPerParticle = Array(maxParticleCount).fill(0);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x4444ff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });

    const connectionGeometry = new THREE.BufferGeometry();
    const line = new THREE.LineSegments(connectionGeometry, lineMaterial);
    scene.add(line);

    loader.load(
      "/models/neuron.gltf", // Percorso del modello GLTF
      (gltf: GLTF) => {
        const neuronModel = gltf.scene;
        neuronModel.scale.set(modelScaleFactor, modelScaleFactor, modelScaleFactor);

        for (let i = 0; i < maxParticleCount; i++) {
          const particle = neuronModel.clone(); // Clona il modello per ogni particella
          const x = Math.random() * r - r / 2;
          const y = Math.random() * r - r / 2;
          const z = Math.random() * layers * layerSpacing - (layers * layerSpacing) / 2;
          particle.position.set(x, y, z);

          // Inizializza la velocità delle particelle
          particlesData.push({
            velocity: new THREE.Vector3(0, 0, velocityRef.current * 0.5), // Usa il valore della velocity prop
          });

          particleGroupArray.push(particle);
          scene.add(particle);
        }
      },
      undefined, // optional
      (error) => {
        console.error("Errore durante il caricamento del modello GLTF:", error);
      }
    );

    const animate = () => {
      const newPositions: number[] = [];
      connectionsPerParticle.fill(0);

      for (let i = 0; i < particleGroupArray.length; i++) {
        const particlePos = particleGroupArray[i].position;
        particlePos.z += velocityRef.current; // Use ref value

        if (particlePos.z > (layers * layerSpacing) / 2) {
          particlePos.z = -(layers * layerSpacing) / 2;
        }
      }

      for (let i = 0; i < particleGroupArray.length; i++) {
        for (let j = i + 1; j < particleGroupArray.length; j++) {
          if (
            connectionsPerParticle[i] >= maxConnections ||
            connectionsPerParticle[j] >= maxConnections
          ) {
            continue;
          }

          const particlePosA = particleGroupArray[i].position;
          const particlePosB = particleGroupArray[j].position;

          const dx = particlePosA.x - particlePosB.x;
          const dy = particlePosA.y - particlePosB.y;
          const dz = particlePosA.z - particlePosB.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDistance) {
            newPositions.push(
              particlePosA.x,
              particlePosA.y,
              particlePosA.z,
              particlePosB.x,
              particlePosB.y,
              particlePosB.z
            );

            connectionsPerParticle[i]++;
            connectionsPerParticle[j]++;
          }
        }
      }

      connectionGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(newPositions), 3)
      );

      controls.update();
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

export default NNThreeScene;
