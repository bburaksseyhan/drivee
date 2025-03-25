import * as THREE from 'three';
import { Car } from './Car.js';
import { SceneManager } from './SceneManager.js';
import { BadgeManager } from './managers/BadgeManager.js';

export class GameManager {
    constructor(canvas) {
        this.sceneManager = new SceneManager(canvas);
        this.car = new Car();
        this.isGameRunning = false;
        this.badgeManager = new BadgeManager();
        
        // Load saved badge progress
        this.badgeManager.loadBadgeProgress();
        
        // Setup badge unlock notification
        this.badgeManager.onBadgeUnlock(badge => {
            this.showBadgeNotification(badge);
        });
        
        // Add ground
        this.addGround();
        
        // Add car to scene
        this.sceneManager.addToScene(this.car.getMesh());
        
        // Start animation loop
        this.animate();
    }

    showBadgeNotification(badge) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        notification.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-info">
                <h3>${badge.name}</h3>
                <p>${badge.description}</p>
            </div>
        `;

        // Add to document
        document.body.appendChild(notification);

        // Remove after animation
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 1000);
        }, 3000);
    }

    addGround() {
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a472a,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.sceneManager.addToScene(ground);
    }

    startGame() {
        this.isGameRunning = true;
        // Add game start logic here
    }

    pauseGame() {
        this.isGameRunning = false;
        // Add pause logic here
    }

    updateGameState(deltaTime) {
        if (!this.isGameRunning) return;

        // Update car state
        const carState = this.car.getState();

        // Update badges based on car state
        this.badgeManager.updateSpeedBadge(carState.speed);
        
        if (carState.isDrifting) {
            this.badgeManager.updateDriftBadge(carState.perfectDrifts);
        }

        if (carState.lapCompleted && !carState.hasTakenDamage) {
            this.badgeManager.updatePerfectLapBadge(true);
        }

        if (this.isNightMode) {
            this.badgeManager.updateNightRiderBadge(deltaTime);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isGameRunning) {
            const deltaTime = 1/60; // Or use actual delta time
            this.car.update();
            this.updateGameState(deltaTime);
        }

        this.sceneManager.render();
    }
}
