import * as THREE from 'three';
import { Game } from './game.js';
import { inject } from '@vercel/analytics';

// Initialize the game
const game = new Game();
game.init();
game.animate();

// Initialize Vercel Analytics
inject();

export class RoadManager {
    constructor(scene, roadWidth, roadLength, scrollSpeed) {
        this.scene = scene;
        this.roadWidth = roadWidth;
        this.roadLength = roadLength;
        this.scrollSpeed = scrollSpeed;
        this.roadSegments = [];

        this.createRoad();
        this.createClouds(); // Add clouds to the scene

        // Initialize engine sound
        this.engineSound = new Audio('sounds/engine.mp3');
        this.engineSound.loop = true; // Loop the sound
        this.engineSound.volume = 0.5; // Set volume level
    }

    createRoad() {
        const segmentLength = 20;
        const segmentCount = Math.ceil(this.roadLength / segmentLength);

        for (let i = 0; i < segmentCount; i++) {
            const segment = this.createRoadSegment(segmentLength);
            segment.position.z = -i * segmentLength;
            this.roadSegments.push(segment);
            this.scene.add(segment);
        }
    }

    createClouds() {
        const cloudCount = 10; // Number of clouds
        const cloudHeight = 50; // Height above the road

        for (let i = 0; i < cloudCount; i++) {
            const cloud = this.createCloud();
            cloud.position.set(
                (Math.random() - 0.5) * this.roadWidth * 2, // Random x position
                cloudHeight, // Fixed y position
                (Math.random() - 0.5) * this.roadLength * 2 // Random z position
            );
            this.scene.add(cloud);
        }
    }

    createCloud() {
        const cloud = new THREE.Group();
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.8,
            metalness: 0.2
        });

        // Create a few spheres to form a cloud
        for (let i = 0; i < 5; i++) {
            const sphereGeometry = new THREE.SphereGeometry(3, 8, 8);
            const sphere = new THREE.Mesh(sphereGeometry, cloudMaterial);
            sphere.position.set(
                (Math.random() - 0.5) * 10, // Random x position within the cloud
                (Math.random() - 0.5) * 2,  // Random y position within the cloud
                (Math.random() - 0.5) * 10  // Random z position within the cloud
            );
            cloud.add(sphere);
        }

        return cloud;
    }

    // ... existing methods ...
} 