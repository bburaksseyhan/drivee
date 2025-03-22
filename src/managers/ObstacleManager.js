import * as THREE from 'three';

// Define level-based object lists outside the class
const levelObjects = {
    '1-10': ['trafficCone', 'pothole', 'roadSign', 'cows', 'sheep', 'horses', 'deer', 'turkeys', 'rabbits', 'deer'],
    '11-20': ['brokenCar', 'fallenTree', 'rock'],
    '21-30': ['constructionZone', 'roadblock', 'movingBarrier'],
    '31+': ['ufoDebris', 'waterPuddle', 'wildAnimal']
};

export class ObstacleManager {
    constructor(scene, roadWidth, roadLength, maxObstacles, scrollSpeed) {
        this.scene = scene;
        this.roadWidth = roadWidth;
        this.roadLength = roadLength;
        this.maxObstacles = maxObstacles;
        this.scrollSpeed = scrollSpeed;
        this.obstacles = [];
        this.obstaclePool = [];
        this.lastObstacleSpawn = 0;
        this.obstacleSpawnDistance = 40; // More space between obstacles than coins
        this.rotationSpeed = 0.01;

        // Initialize crash sound
        this.crashSound = new Audio('sounds/crash.mp3');
        this.crashSound.volume = 0.6;

        this.initializeObstacles();
    }

    initializeObstacles() {
        for (let i = 0; i < this.maxObstacles; i++) {
            const obstacle = this.createObstacle();
            obstacle.visible = false;
            this.obstaclePool.push(obstacle);
        }
    }

    createObstacle() {
        const type = Math.random(); // Random type of obstacle
        let obstacle;

        if (type < 0.4) {
            // Create a rock
            const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
            const rockMaterial = new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.9,
                metalness: 0.1,
            });
            obstacle = new THREE.Mesh(rockGeometry, rockMaterial);
            obstacle.scale.set(0.8, 0.8, 0.8);
        } else if (type < 0.7) {
            // Create a barrier
            const barrierGeometry = new THREE.BoxGeometry(2, 1, 0.5);
            const barrierMaterial = new THREE.MeshStandardMaterial({
                color: 0xFF4444,
                roughness: 0.5,
                metalness: 0.5,
            });
            obstacle = new THREE.Mesh(barrierGeometry, barrierMaterial);
        } else {
            // Create a broken car
            obstacle = new THREE.Group();
            const bodyGeometry = new THREE.BoxGeometry(1.8, 1, 3);
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: 0x666666,
                roughness: 0.5,
                metalness: 0.7,
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            obstacle.add(body);

            // Add some details to make it look broken
            const debris = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.2, 0.5),
                bodyMaterial
            );
            debris.position.set(1, 0, 0.5);
            debris.rotation.z = Math.PI / 6;
            obstacle.add(debris);
        }

        obstacle.castShadow = true;
        obstacle.receiveShadow = true;
        this.scene.add(obstacle);
        return obstacle;
    }

    // Function to get objects for the current level
    getObjectsForLevel(level) {
        if (level <= 10) return levelObjects['1-10'];
        if (level <= 20) return levelObjects['11-20'];
        if (level <= 30) return levelObjects['21-30'];
        return levelObjects['31+'];
    }

    // Update spawn logic to use level-based objects
    spawnObstacles(level) {
        const objects = this.getObjectsForLevel(level);
        const objectType = objects[Math.floor(Math.random() * objects.length)];
        console.log(`Spawning object type: ${objectType} for level: ${level}`);
        let obstacle;

        switch (objectType) {
            case 'trafficCone':
                obstacle = this.createTrafficCone();
                break;
            case 'pothole':
                obstacle = this.createPothole();
                break;
            case 'roadSign':
                obstacle = this.createRoadSign();
                break;
            case 'brokenCar':
                obstacle = this.createBrokenCar();
                break;
            case 'fallenTree':
                obstacle = this.createFallenTree();
                break;
            case 'rock':
                obstacle = this.createRock();
                break;
            case 'constructionZone':
                obstacle = this.createConstructionZone();
                break;
            case 'roadblock':
                obstacle = this.createRoadblock();
                break;
            case 'movingBarrier':
                obstacle = this.createMovingBarrier();
                break;
            case 'ufoDebris':
                obstacle = this.createUfoDebris();
                break;
            case 'waterPuddle':
                obstacle = this.createWaterPuddle();
                break;
            case 'wildAnimal':
                obstacle = this.createWildAnimal();
                break;
        }

        if (obstacle) {
            console.log(`Adding obstacle: ${objectType}`);
            obstacle.position.x = (Math.random() - 0.5) * this.roadWidth;
            obstacle.position.z = -this.roadLength / 2;
            this.addObstacle(obstacle);
        } else {
            console.error(`Failed to create obstacle of type: ${objectType}`);
        }
    }

    spawnObstacle() {
        if (this.obstaclePool.length === 0) return;

        const obstacle = this.obstaclePool.pop();
        const xPosition = (Math.random() - 0.5) * (this.roadWidth - 3);
        const zPosition = -this.roadLength;
        const yPosition = 0.5;

        obstacle.position.set(xPosition, yPosition, zPosition);
        obstacle.rotation.y = Math.random() * Math.PI * 2; // Random rotation
        obstacle.visible = true;
        this.obstacles.push(obstacle);
    }

    updateObstacles(delta, car, gameOverCallback) {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            if (obstacle.visible) {
                obstacle.position.z += this.scrollSpeed * delta * 60;
                obstacle.rotation.y += this.rotationSpeed; // Slowly rotate obstacles

                if (this.checkObstacleCollision(obstacle, car)) {
                    // Play crash sound
                    this.crashSound.currentTime = 0;
                    this.crashSound.play().catch(error => console.log('Error playing sound:', error));
                    
                    gameOverCallback();
                }

                if (obstacle.position.z > 10) {
                    obstacle.visible = false;
                    this.obstacles.splice(i, 1);
                    this.obstaclePool.push(obstacle);
                }
            }
        }

        if (this.lastObstacleSpawn > this.obstacleSpawnDistance) {
            this.spawnObstacle();
            this.lastObstacleSpawn = 0;
        }
        this.lastObstacleSpawn += this.scrollSpeed * delta * 60;
    }

    checkObstacleCollision(obstacle, car) {
        const carBox = new THREE.Box3().setFromObject(car);
        const obstacleBox = new THREE.Box3().setFromObject(obstacle);
        return carBox.intersectsBox(obstacleBox);
    }

    reset() {
        // Reset all obstacles
        for (const obstacle of this.obstacles) {
            obstacle.visible = false;
            this.obstaclePool.push(obstacle);
        }
        this.obstacles = [];
        this.lastObstacleSpawn = 0;
    }

    createTrafficCone() {
        // Define geometry and material for a traffic cone
        const geometry = new THREE.ConeGeometry(0.5, 1, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0xFF5733 });
        const cone = new THREE.Mesh(geometry, material);
        return cone;
    }

    // Similarly, define methods for other objects like createPothole, createRoadSign, etc.

    addObstacle(obstacle) {
        this.scene.add(obstacle);
        this.obstacles.push(obstacle);
    }
} 