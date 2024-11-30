import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Terrain as ThreeTerrain } from '../lib/three-terrain/build/THREE.Terrain.Module.mjs';

const Terrain = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [terrainPosition, setTerrainPosition] = useState(0); // Per tenere traccia della posizione del terreno

  useEffect(() => {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 50, 150);
    camera.rotation.x = -Math.PI / 6;

    // Creazione del renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const size = 1000; // Dimensione del terreno
    const xS = 63, yS = 63; // Segmenti del terreno
    const numLayers = 3; 

    const layers: THREE.Object3D<THREE.Object3DEventMap>[] = [];
    for (let i = 0; i < numLayers; i++) {
      const terrain = new ThreeTerrain({
        easing: ThreeTerrain.Linear,
        frequency: 3,
        heightmap: ThreeTerrain.Fault,
        material: new THREE.MeshLambertMaterial({ color: "#9A9A9A" }), // Materiale base
        maxHeight: -10,
        minHeight: -200,
        steps: 1,
        xSegments: xS,
        xSize: size,
        ySegments: yS,
        ySize: size,
      });

      const terrainMesh = terrain.getScene().children[0] as THREE.Mesh;
      const terrainScene = terrain.getScene();

      // Modifica il materiale della mesh per renderlo wireframe
      terrainMesh.material = new THREE.MeshBasicMaterial({
        color: 0x8264c0, // wireframe color
        wireframe: true, 
      });

      terrainScene.position.z = -i * size;

      layers.push(terrainScene);
      scene.add(terrainScene); // Aggiungi ogni layer alla scena
    }

    const light = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10).normalize();
    scene.add(directionalLight);

    const animate = () => {
      requestAnimationFrame(animate);

      // move each layer towards the camera
      layers.forEach(layer => {
        layer.position.z += 4; // Muovi ogni layer verso la camera
      });

      // if a layer is out of view, move it back to the start
      layers.forEach((layer) => {
        if (layer.position.z > size) {
          layer.position.z = -size * (numLayers - 1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} />;
};

export default Terrain;
