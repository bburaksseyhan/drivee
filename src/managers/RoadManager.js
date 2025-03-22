import * as THREE from 'three';

export class RoadManager {
    constructor(scene, roadWidth, roadLength, scrollSpeed) {
        this.scene = scene;
        this.roadWidth = roadWidth;
        this.roadLength = roadLength;
        this.scrollSpeed = scrollSpeed;
        this.roadSegments = [];

        this.createRoad();

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

    createRoadSegment(length) {
        const segment = new THREE.Group();

        // Road surface
        const roadGeometry = new THREE.PlaneGeometry(this.roadWidth, length);
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.receiveShadow = true;
        segment.add(road);

        // Road markings
        this.addRoadMarkings(segment, length);

        // Ground on sides
        const groundWidth = 50;
        const groundGeometry = new THREE.PlaneGeometry(groundWidth, length);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4CAF50,
            roughness: 1,
            metalness: 0
        });

        // Left ground
        const leftGround = new THREE.Mesh(groundGeometry, groundMaterial);
        leftGround.rotation.x = -Math.PI / 2;
        leftGround.position.x = -(groundWidth / 2 + this.roadWidth / 2);
        leftGround.receiveShadow = true;
        segment.add(leftGround);

        // Right ground
        const rightGround = new THREE.Mesh(groundGeometry, groundMaterial);
        rightGround.rotation.x = -Math.PI / 2;
        rightGround.position.x = (groundWidth / 2 + this.roadWidth / 2);
        rightGround.receiveShadow = true;
        segment.add(rightGround);

        return segment;
    }

    addRoadMarkings(segment, length) {
        // Center line
        const centerLineGeometry = new THREE.PlaneGeometry(0.3, length);
        const linesMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const centerLine = new THREE.Mesh(centerLineGeometry, linesMaterial);
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.y = 0.01;
        segment.add(centerLine);

        // Side lines (dashed)
        for (let i = 0; i < length; i += 4) {
            if (i % 8 < 4) { // Create dashed effect
                // Left line
                const leftDash = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.3, 2),
                    linesMaterial
                );
                leftDash.rotation.x = -Math.PI / 2;
                leftDash.position.set(-this.roadWidth / 4, 0.01, i - length / 2);
                segment.add(leftDash);

                // Right line
                const rightDash = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.3, 2),
                    linesMaterial
                );
                rightDash.rotation.x = -Math.PI / 2;
                rightDash.position.set(this.roadWidth / 4, 0.01, i - length / 2);
                segment.add(rightDash);
            }
        }
    }

    updateRoad(delta) {
        for (const segment of this.roadSegments) {
            segment.position.z += this.scrollSpeed * delta * 60;

            // If segment has moved past the camera, move it to the back
            if (segment.position.z > 20) {
                segment.position.z -= this.roadLength;
            }
        }
    }

    start() {
        // Start the engine sound when the game starts
        // Ensure this is called in response to a user interaction
        this.engineSound.play().catch(error => console.log('Error playing engine sound:', error));
    }

    stop() {
        // Stop the engine sound when the game stops
        this.engineSound.pause();
        this.engineSound.currentTime = 0; // Reset to start
    }
}