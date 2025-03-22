import * as THREE from 'three';

export class CoinManager {
    constructor(scene, roadWidth, roadLength, maxCoins, scrollSpeed) {
        this.scene = scene;
        this.roadWidth = roadWidth;
        this.roadLength = roadLength;
        this.maxCoins = maxCoins;
        this.scrollSpeed = scrollSpeed;
        this.coins = [];
        this.coinPool = [];
        this.lastCoinSpawn = 0;
        this.coinSpawnDistance = 8;
        this.rotationSpeed = 0.03;
        this.initialSpawnDelay = 30;

        // Initialize coin sound
        this.coinSound = null;
        this.initializeSound();

        this.initializeCoins();
        this.spawnInitialCoins();
    }

    async initializeSound() {
        try {
            this.coinSound = new Audio();
            this.coinSound.src = 'sounds/coin.mp3';
            this.coinSound.volume = 0.5;
            
            // Create multiple audio objects for overlapping sounds
            this.coinSoundPool = Array.from({ length: 3 }, () => {
                const audio = new Audio('sounds/coin.mp3');
                audio.volume = 0.5;
                return audio;
            });
            
            // Preload the sounds
            await Promise.all([
                this.coinSound.load(),
                ...this.coinSoundPool.map(audio => audio.load())
            ]);
        } catch (error) {
            console.warn('Failed to initialize coin sound:', error);
        }
    }

    playCoinSound() {
        try {
            // Try to find a sound that's not playing
            const availableSound = this.coinSoundPool.find(sound => sound.paused);
            if (availableSound) {
                availableSound.currentTime = 0;
                availableSound.play().catch(error => {
                    console.warn('Error playing coin sound:', error);
                });
            } else {
                // If all sounds are playing, use the main coin sound
                this.coinSound.currentTime = 0;
                this.coinSound.play().catch(error => {
                    console.warn('Error playing coin sound:', error);
                });
            }
        } catch (error) {
            console.warn('Error playing coin sound:', error);
        }
    }

    initializeCoins() {
        for (let i = 0; i < this.maxCoins; i++) {
            const coin = this.createCoin();
            coin.visible = false;
            this.coinPool.push(coin);
        }
    }

    spawnInitialCoins() {
        for (let i = 0; i < 3; i++) {
            if (this.coinPool.length === 0) break;
            
            const coin = this.coinPool.pop();
            const xPosition = (Math.random() - 0.5) * (this.roadWidth - 2);
            const zPosition = -30 - (i * 15);
            const yPosition = 1;

            coin.position.set(xPosition, yPosition, zPosition);
            coin.visible = true;
            this.coins.push(coin);
        }
    }

    createCoin() {
        const coinGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
        const coinMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFD700,
            roughness: 0.3,
            metalness: 0.8,
            emissive: 0xFFD700,
            emissiveIntensity: 0.2
        });
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.rotation.x = Math.PI / 2;
        coin.castShadow = true;
        coin.receiveShadow = true;
        this.scene.add(coin);
        return coin;
    }

    spawnCoin() {
        if (this.coinPool.length === 0) return;

        const coin = this.coinPool.pop();
        const xPosition = (Math.random() - 0.5) * (this.roadWidth - 2);
        const zPosition = -this.roadLength * 0.3;
        const yPosition = 1;

        coin.position.set(xPosition, yPosition, zPosition);
        coin.visible = true;
        this.coins.push(coin);
    }

    updateCoins(delta, car, scoreCallback) {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            if (coin.visible) {
                coin.position.z += this.scrollSpeed * delta * 60;
                coin.rotation.z += this.rotationSpeed;

                if (this.checkCoinCollision(coin, car)) {
                    coin.visible = false;
                    this.coins.splice(i, 1);
                    this.coinPool.push(coin);
                    scoreCallback(10);
                    
                    // Play coin collection sound
                    this.playCoinSound();
                }

                if (coin.position.z > 10) {
                    coin.visible = false;
                    this.coins.splice(i, 1);
                    this.coinPool.push(coin);
                }
            }
        }

        if (this.lastCoinSpawn > this.coinSpawnDistance) {
            this.spawnCoin();
            this.lastCoinSpawn = 0;
        }
        this.lastCoinSpawn += this.scrollSpeed * delta * 60;
    }

    checkCoinCollision(coin, car) {
        const carBox = new THREE.Box3().setFromObject(car);
        const coinBox = new THREE.Box3().setFromObject(coin);
        return carBox.intersectsBox(coinBox);
    }

    reset() {
        // Reset all coins
        for (const coin of this.coins) {
            coin.visible = false;
            this.coinPool.push(coin);
        }
        this.coins = [];
        this.lastCoinSpawn = 0;
        this.spawnInitialCoins();
    }
} 