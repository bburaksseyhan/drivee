import * as THREE from 'three';

export class MovingObstacleManager {
    constructor(scene, roadWidth, roadLength, scrollSpeed) {
        this.scene = scene;
        this.roadWidth = roadWidth;
        this.roadLength = roadLength;
        this.scrollSpeed = scrollSpeed;
        
        // Obstacle pools and active obstacles
        this.obstacles = [];
        this.obstaclePool = {
            tank: [],
            human: [],
            car: []
        };
        
        // Obstacle spawn settings
        this.lastSpawnTime = 0;
        this.spawnInterval = 2; // Spawn every 2 seconds
        this.maxObstacles = 10;
        
        // Obstacle type definitions
        this.obstacleTypes = {
            tank: {
                speed: 0.2,
                size: { width: 4, height: 3, depth: 6 },
                color: 0x4A5320, // Military green
                damage: 100,
                probability: 0.2,
                sound: 'tank_engine'
            },
            human: {
                speed: 0.4,
                size: { width: 1, height: 3.6, depth: 1 },
                color: 0xFFD700,
                damage: 20,
                probability: 0.4,
                sound: 'human_shout'
            },
            car: {
                speed: 0.6,
                size: { width: 3.6, height: 3, depth: 8 },
                color: 0x4169E1,
                damage: 80,
                probability: 0.3,
                sound: 'car_engine'
            }
        };

        // Initialize obstacle pools
        this.initializePools();
    }

    initializePools() {
        Object.keys(this.obstacleTypes).forEach(type => {
            for (let i = 0; i < 5; i++) {
                const obstacle = this.createObstacle(type);
                obstacle.visible = false;
                this.obstaclePool[type].push(obstacle);
            }
        });
    }

    createObstacle(type) {
        const config = this.obstacleTypes[type];
        const obstacle = new THREE.Group();
        
        switch (type) {
            case 'tank':
                // Tank body
                const bodyGeometry = new THREE.BoxGeometry(
                    config.size.width,
                    config.size.height,
                    config.size.depth
                );
                const bodyMaterial = new THREE.MeshStandardMaterial({
                    color: config.color,
                    roughness: 0.7,
                    metalness: 0.3
                });
                const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                obstacle.add(body);

                // Tank turret
                const turretGeometry = new THREE.CylinderGeometry(1.6, 1.6, 1.6, 8);
                const turret = new THREE.Mesh(turretGeometry, bodyMaterial);
                turret.position.y = config.size.height / 2;
                turret.rotation.x = Math.PI / 2;
                obstacle.add(turret);

                // Tank cannon
                const cannonGeometry = new THREE.CylinderGeometry(0.4, 0.4, 4, 8);
                const cannon = new THREE.Mesh(cannonGeometry, bodyMaterial);
                cannon.position.set(0, config.size.height / 2, -2);
                cannon.rotation.x = Math.PI / 2;
                obstacle.add(cannon);
                break;

            case 'human':
                // Body
                const torsoGeometry = new THREE.BoxGeometry(1, 2, 0.6);
                const humanMaterial = new THREE.MeshStandardMaterial({ color: config.color });
                const torso = new THREE.Mesh(torsoGeometry, humanMaterial);
                torso.position.y = 1.6;
                obstacle.add(torso);

                // Head
                const headGeometry = new THREE.SphereGeometry(0.4, 8, 8);
                const head = new THREE.Mesh(headGeometry, humanMaterial);
                head.position.y = 3;
                obstacle.add(head);

                // Legs
                const legGeometry = new THREE.BoxGeometry(0.4, 1.6, 0.4);
                const leftLeg = new THREE.Mesh(legGeometry, humanMaterial);
                leftLeg.position.set(0.3, 0.8, 0);
                obstacle.add(leftLeg);

                const rightLeg = new THREE.Mesh(legGeometry, humanMaterial);
                rightLeg.position.set(-0.3, 0.8, 0);
                obstacle.add(rightLeg);
                break;

            case 'car':
                // Car body
                const carBodyGeometry = new THREE.BoxGeometry(
                    config.size.width,
                    config.size.height * 0.6,
                    config.size.depth
                );
                const carMaterial = new THREE.MeshStandardMaterial({
                    color: config.color,
                    metalness: 0.6,
                    roughness: 0.4
                });
                const carBody = new THREE.Mesh(carBodyGeometry, carMaterial);
                carBody.position.y = config.size.height * 0.3;
                obstacle.add(carBody);

                // Car roof
                const roofGeometry = new THREE.BoxGeometry(
                    config.size.width * 0.8,
                    config.size.height * 0.4,
                    config.size.depth * 0.6
                );
                const roof = new THREE.Mesh(roofGeometry, carMaterial);
                roof.position.y = config.size.height * 0.8;
                obstacle.add(roof);

                // Wheels
                const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.6, 16);
                const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
                const wheelPositions = [
                    [-1.6, 0.8, -3],
                    [1.6, 0.8, -3],
                    [-1.6, 0.8, 3],
                    [1.6, 0.8, 3]
                ];

                wheelPositions.forEach(pos => {
                    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                    wheel.rotation.z = Math.PI / 2;
                    wheel.position.set(...pos);
                    obstacle.add(wheel);
                });
                break;
        }

        // Add common properties
        obstacle.userData = {
            type: type,
            speed: config.speed,
            damage: config.damage,
            animationPhase: 0
        };

        return obstacle;
    }

    spawnObstacle() {
        if (this.obstacles.length >= this.maxObstacles) return;

        // Choose obstacle type based on probability
        const rand = Math.random();
        let cumulativeProbability = 0;
        let chosenType = null;

        for (const [type, config] of Object.entries(this.obstacleTypes)) {
            cumulativeProbability += config.probability;
            if (rand <= cumulativeProbability) {
                chosenType = type;
                break;
            }
        }

        if (!chosenType || this.obstaclePool[chosenType].length === 0) return;

        // Get obstacle from pool
        const obstacle = this.obstaclePool[chosenType].pop();
        obstacle.visible = true;

        // Position at random point along the road width
        const lanePosition = (Math.random() - 0.5) * (this.roadWidth * 0.8);
        obstacle.position.set(
            lanePosition,
            0,
            -this.roadLength // Start from far end
        );

        // Add to active obstacles
        this.obstacles.push(obstacle);
        this.scene.add(obstacle);
    }

    update(delta, playerPosition) {
        // Spawn new obstacles
        const now = Date.now() / 1000;
        if (now - this.lastSpawnTime > this.spawnInterval) {
            this.spawnObstacle();
            this.lastSpawnTime = now;
        }

        // Update active obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            // Move obstacle
            obstacle.position.z += (this.scrollSpeed + obstacle.userData.speed) * delta * 60;

            // Animate based on type
            switch (obstacle.userData.type) {
                case 'human':
                    // Walking animation
                    obstacle.userData.animationPhase += delta * 5;
                    const legAngle = Math.sin(obstacle.userData.animationPhase) * 0.3;
                    obstacle.children[2].rotation.x = legAngle; // Left leg
                    obstacle.children[3].rotation.x = -legAngle; // Right leg
                    break;

                case 'animal':
                    // Head bobbing animation
                    obstacle.userData.animationPhase += delta * 3;
                    obstacle.children[1].position.y = // Head
                        obstacle.userData.size * 0.5 +
                        Math.sin(obstacle.userData.animationPhase) * 0.1;
                    break;

                case 'tank':
                    // Turret rotation
                    obstacle.userData.animationPhase += delta;
                    obstacle.children[1].rotation.y = // Turret
                        Math.sin(obstacle.userData.animationPhase * 0.5) * 0.2;
                    break;
            }

            // Check if obstacle is past the player
            if (obstacle.position.z > playerPosition.z + 10) {
                this.scene.remove(obstacle);
                obstacle.visible = false;
                this.obstaclePool[obstacle.userData.type].push(obstacle);
                this.obstacles.splice(i, 1);
                continue;
            }

            // Check for collision with player (handled by game class)
        }
    }

    checkCollision(playerBox) {
        for (const obstacle of this.obstacles) {
            if (!obstacle.visible) continue;

            if (obstacle.userData.type === 'tank') {
                // For tanks, only use the main body and turret for collision
                const tankBody = obstacle.children[0]; // Main body
                const tankTurret = obstacle.children[1]; // Turret
                const tankCannon = obstacle.children[2]; // Cannon

                const bodyBox = new THREE.Box3().setFromObject(tankBody);
                const turretBox = new THREE.Box3().setFromObject(tankTurret);
                const cannonBox = new THREE.Box3().setFromObject(tankCannon);

                if (playerBox.intersectsBox(bodyBox) || 
                    playerBox.intersectsBox(turretBox) || 
                    playerBox.intersectsBox(cannonBox)) {
                    return {
                        collided: true,
                        damage: obstacle.userData.damage,
                        type: obstacle.userData.type
                    };
                }
            } else {
                // For other obstacles, use the entire object for collision
                const obstacleBox = new THREE.Box3().setFromObject(obstacle);
                if (playerBox.intersectsBox(obstacleBox)) {
                    return {
                        collided: true,
                        damage: obstacle.userData.damage,
                        type: obstacle.userData.type
                    };
                }
            }
        }
        return { collided: false };
    }

    reset() {
        // Return all obstacles to their respective pools
        this.obstacles.forEach(obstacle => {
            this.scene.remove(obstacle);
            obstacle.visible = false;
            this.obstaclePool[obstacle.userData.type].push(obstacle);
        });
        this.obstacles = [];
        this.lastSpawnTime = 0;
    }
} 