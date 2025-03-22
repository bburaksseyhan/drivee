import * as THREE from 'three';

export class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevel = 1;
        this.maxLevel = 100;
        this.scoreToNextLevel = 50; // Lower initial score needed
        this.baseScoreIncrement = 50; // Smaller score increments
        
        // Level-based difficulty modifiers
        this.speedMultiplier = 0.7; // Start slower
        this.obstacleFrequencyMultiplier = 0.7; // Start with fewer obstacles
        this.coinFrequencyMultiplier = 1.2; // Start with more coins
        
        // Acceleration settings
        this.targetSpeedMultiplier = 0.7;
        this.speedAcceleration = 0.1; // How quickly speed changes

        // Create level display
        this.createLevelDisplay();
    }

    createLevelDisplay() {
        this.levelDiv = document.createElement('div');
        this.levelDiv.style.position = 'absolute';
        this.levelDiv.style.top = '20px';
        this.levelDiv.style.left = '20px';
        this.levelDiv.style.color = 'white';
        this.levelDiv.style.fontSize = '24px';
        this.levelDiv.style.fontFamily = 'Arial, sans-serif';
        this.levelDiv.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        document.body.appendChild(this.levelDiv);
        this.updateLevelDisplay();
    }

    updateLevelDisplay() {
        this.levelDiv.textContent = `Level: ${this.currentLevel}`;
    }

    checkLevelProgression(score) {
        if (score >= this.scoreToNextLevel && this.currentLevel < this.maxLevel) {
            this.levelUp();
            return true;
        }
        return false;
    }

    levelUp() {
        this.currentLevel++;
        this.updateLevelDisplay();
        this.updateDifficulty();
        this.scoreToNextLevel += this.baseScoreIncrement * this.currentLevel;
        
        // Update game elements
        this.updateGameElements();
        
        // Show level up message
        this.showLevelUpMessage();
    }

    updateDifficulty() {
        // Calculate target speed (max 1.8x original speed)
        this.targetSpeedMultiplier = Math.min(0.7 + (this.currentLevel * 0.011), 1.8);
        
        // Increase obstacle frequency more gradually (max 2.5x original frequency)
        this.obstacleFrequencyMultiplier = Math.min(0.7 + (this.currentLevel * 0.018), 2.5);
        
        // Keep coin frequency high for first 10 levels, then gradually decrease
        if (this.currentLevel <= 10) {
            this.coinFrequencyMultiplier = 1.5; // High frequency in early levels
        } else {
            // Start decreasing from level 11 onwards
            this.coinFrequencyMultiplier = Math.max(1.5 - ((this.currentLevel - 10) * 0.006), 0.6);
        }
    }

    updateGameElements() {
        // Smoothly accelerate to target speed
        const speedDiff = this.targetSpeedMultiplier - this.speedMultiplier;
        if (Math.abs(speedDiff) > 0.01) {
            this.speedMultiplier += speedDiff * this.speedAcceleration;
        }

        // Update game speed
        this.game.scrollSpeed = 0.5 * this.speedMultiplier;
        this.game.carSpeed = 0.2 * this.speedMultiplier;

        // Update spawn distances
        if (this.game.obstacleManager) {
            this.game.obstacleManager.obstacleSpawnDistance = 
                40 / this.obstacleFrequencyMultiplier;
            this.game.obstacleManager.scrollSpeed = this.game.scrollSpeed;
        }

        if (this.game.coinManager) {
            this.game.coinManager.coinSpawnDistance = 
                15 / this.coinFrequencyMultiplier;
            this.game.coinManager.scrollSpeed = this.game.scrollSpeed;
        }

        // Update environment
        this.updateEnvironment();
    }

    updateEnvironment() {
        // Change environment every 20 levels
        const environmentType = Math.floor((this.currentLevel - 1) / 20);
        
        switch(environmentType) {
            case 0: // Levels 1-20: Default sky blue
                this.game.scene.background = new THREE.Color(0x87CEEB);
                this.game.scene.fog.color = new THREE.Color(0x87CEEB);
                break;
            case 1: // Levels 21-40: Sunset orange
                this.game.scene.background = new THREE.Color(0xFF7F50);
                this.game.scene.fog.color = new THREE.Color(0xFF7F50);
                break;
            case 2: // Levels 41-60: Night blue
                this.game.scene.background = new THREE.Color(0x191970);
                this.game.scene.fog.color = new THREE.Color(0x191970);
                break;
            case 3: // Levels 61-80: Desert yellow
                this.game.scene.background = new THREE.Color(0xFFD700);
                this.game.scene.fog.color = new THREE.Color(0xFFD700);
                break;
            case 4: // Levels 81-100: Space purple
                this.game.scene.background = new THREE.Color(0x4B0082);
                this.game.scene.fog.color = new THREE.Color(0x4B0082);
                break;
        }
    }

    showLevelUpMessage() {
        const levelUpDiv = document.createElement('div');
        levelUpDiv.style.position = 'absolute';
        levelUpDiv.style.top = '50%';
        levelUpDiv.style.left = '50%';
        levelUpDiv.style.transform = 'translate(-50%, -50%)';
        levelUpDiv.style.color = 'white';
        levelUpDiv.style.fontSize = '48px';
        levelUpDiv.style.fontFamily = 'Arial, sans-serif';
        levelUpDiv.style.textAlign = 'center';
        levelUpDiv.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        levelUpDiv.style.animation = 'fadeInOut 2s ease-in-out forwards';
        levelUpDiv.textContent = `Level ${this.currentLevel}!`;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(levelUpDiv);

        // Remove the message after animation
        setTimeout(() => {
            document.body.removeChild(levelUpDiv);
        }, 2000);
    }

    reset() {
        this.currentLevel = 1;
        this.scoreToNextLevel = 50;
        this.speedMultiplier = 0.7;
        this.obstacleFrequencyMultiplier = 0.7;
        this.coinFrequencyMultiplier = 1.2;
        this.updateLevelDisplay();
        this.updateGameElements();
    }
} 