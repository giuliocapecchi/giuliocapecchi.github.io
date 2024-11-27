'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { isMobile } from 'react-device-detect';
import { ThreeSceneProp } from '@/types/interfaces';


const ThreeScene: React.FC<ThreeSceneProp> = ({ velocity }) => {
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
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 10;

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Append renderer to the DOM
        if (currentMount) {
            currentMount.appendChild(renderer.domElement);
        }

        // Orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);

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
        const animate = () => {
            layers.forEach((layer) => {
                const positions = layer.positions;

                for (let i = 0; i < pointsCount; i++) {
                    positions[i * 3 + 2] += velocityRef.current; // Use ref value

                    if (positions[i * 3 + 2] > curveUpDistance) {
                        positions[i * 3 + 1] += 0.1;
                    }

                    // Random sin for x, cos for y movement
                    if (Math.random() > 0.5) {
                        positions[i * 3] += randomMovementVelocity * Math.sin(positions[i * 3 + 2] * 0.1);
                        positions[i * 3 + 1] += randomMovementVelocity * Math.cos(positions[i * 3 + 2] * 0.1);
                    }

                    // Reset particles position if they are too far
                    if (positions[i * 3 + 2] > farthestDistance) {
                        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
                        positions[i * 3 + 2] = resetDistance;
                    }
                }

                layer.geometry.attributes.position.needsUpdate = true;
            });

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
            layers.forEach((layer) => {
                scene.remove(layer.points);
                layer.geometry.dispose();
                layer.material.dispose();
            });
            renderer.dispose();
            controls.dispose();
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

export default ThreeScene;