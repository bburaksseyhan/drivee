import * as THREE from 'three';
import { GaugeManager } from './GaugeManager.js';

export class LandscapeManager {
    constructor(scene, roadWidth) {
        if (!scene) {
            console.warn('LandscapeManager: Scene is required but was not provided');
        }
        this.scene = scene;
        this.roadWidth = roadWidth;
        this.currentSeason = 'spring'; // Default season
        this.seasonNotification = null;
        this.seasonDisplay = null;
        this.gaugeManager = new GaugeManager();
        this.createSeasonNotification();
        this.createSeasonDisplay();
    }

    createSeasonNotification() {
        this.seasonNotification = document.createElement('div');
        this.seasonNotification.style.position = 'absolute';
        this.seasonNotification.style.top = '80px';
        this.seasonNotification.style.right = '20px';
        this.seasonNotification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.seasonNotification.style.color = 'white';
        this.seasonNotification.style.padding = '10px';
        this.seasonNotification.style.borderRadius = '5px';
        this.seasonNotification.style.fontFamily = 'Arial, sans-serif';
        this.seasonNotification.style.fontSize = '16px';
        this.seasonNotification.style.display = 'none';
        this.seasonNotification.style.zIndex = '1000';
        document.body.appendChild(this.seasonNotification);
    }

    createSeasonDisplay() {
        this.seasonDisplay = document.createElement('div');
        this.seasonDisplay.style.position = 'absolute';
        this.seasonDisplay.style.top = '140px';
        this.seasonDisplay.style.right = '20px';
        this.seasonDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.seasonDisplay.style.color = 'white';
        this.seasonDisplay.style.padding = '10px';
        this.seasonDisplay.style.borderRadius = '5px';
        this.seasonDisplay.style.fontFamily = 'Arial, sans-serif';
        this.seasonDisplay.style.fontSize = '16px';
        this.seasonDisplay.style.zIndex = '1000';
        this.updateSeasonDisplay();
        document.body.appendChild(this.seasonDisplay);
    }

    updateSeasonDisplay() {
        const seasonEmoji = {
            'spring': '🌸',
            'summer': '☀️',
            'autumn': '🍂',
            'winter': '❄️'
        };
        const seasonColors = {
            'spring': '#98FB98',
            'summer': '#32CD32',
            'autumn': '#FF8C00',
            'winter': '#FFFFFF'
        };
        this.seasonDisplay.innerHTML = `Current Season: ${seasonEmoji[this.currentSeason]} ${this.currentSeason.charAt(0).toUpperCase() + this.currentSeason.slice(1)}`;
        this.seasonDisplay.style.borderLeft = `4px solid ${seasonColors[this.currentSeason]}`;
    }

    showSeasonNotification(season, time, distance) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const distanceKm = (distance / 1000).toFixed(1);
        
        this.seasonNotification.textContent = `Season changed to ${season}! (Time: ${formattedTime}, Distance: ${distanceKm}km)`;
        this.seasonNotification.style.display = 'block';
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            this.seasonNotification.style.display = 'none';
        }, 3000);
    }

    addGreeneryToSegment(segment, length) {
        const greenerySpacing = 10; // Distance between greenery elements
        for (let i = -length / 2; i < length / 2; i += greenerySpacing) {
            const offset = Math.random() * 2 - 1;

            const grass = this.createGrassPatch();
            grass.position.set((Math.random() < 0.5 ? -1 : 1) * (this.roadWidth / 2 + 5 + offset), 0, i + offset);
            segment.add(grass);

            const tree = this.createTree();
            tree.position.set((Math.random() < 0.5 ? -1 : 1) * (this.roadWidth / 2 + 7 + offset), 0, i + offset);
            segment.add(tree);
        }
    }

    createGrassPatch() {
        const grassGeometry = new THREE.PlaneGeometry(2, 2);
        const grassMaterial = new THREE.MeshStandardMaterial({ color: this.getSeasonalGrassColor() });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.rotation.x = -Math.PI / 2;
        grass.userData.isGrass = true;
        return grass;
    }

    createTree() {
        const tree = new THREE.Group();
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.75;
        tree.add(trunk);

        const leavesGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: this.getSeasonalColor() });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 1.5;
        leaves.userData.isLeaves = true;
        tree.add(leaves);

        tree.userData = { swayFactor: 0.05 + Math.random() * 0.05 };
        return tree;
    }

    getSeasonalColor() {
        switch (this.currentSeason) {
            case 'spring':
                return 0x98FB98; // Pale green for spring leaves
            case 'summer':
                return 0x228B22; // Forest green for summer
            case 'autumn':
                return 0xFF8C00; // Orange for autumn
            case 'winter':
                return 0xFFFFFF; // White for snow
            default:
                return 0x32CD32; // Default green
        }
    }

    getSeasonalGrassColor() {
        switch (this.currentSeason) {
            case 'spring':
                return 0x90EE90; // Light green
            case 'summer':
                return 0x32CD32; // Green
            case 'autumn':
                return 0xDAA520; // Golden
            case 'winter':
                return 0xF0FFF0; // Snow white with slight green tint
            default:
                return 0x90EE90;
        }
    }

    addDecorativeElements(segment, length) {
        const elementSpacing = 20;
        for (let i = -length / 2; i < length / 2; i += elementSpacing) {
            const bench = this.createBench();
            bench.position.set((Math.random() < 0.5 ? -1 : 1) * (this.roadWidth / 2 + 10), 0, i);
            segment.add(bench);

            const lamp = this.createStreetLamp();
            lamp.position.set((Math.random() < 0.5 ? -1 : 1) * (this.roadWidth / 2 + 12), 0, i);
            segment.add(lamp);
        }
    }

    createBench() {
        const bench = new THREE.Group();
        const seatGeometry = new THREE.BoxGeometry(1, 0.1, 0.5);
        const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.y = 0.25;
        bench.add(seat);

        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-0.4, 0.125, -0.2);
        bench.add(leg1);

        const leg2 = leg1.clone();
        leg2.position.set(0.4, 0.125, -0.2);
        bench.add(leg2);

        const leg3 = leg1.clone();
        leg3.position.set(-0.4, 0.125, 0.2);
        bench.add(leg3);

        const leg4 = leg1.clone();
        leg4.position.set(0.4, 0.125, 0.2);
        bench.add(leg4);

        return bench;
    }

    createStreetLamp() {
        const lamp = new THREE.Group();
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 1.5;
        lamp.add(pole);

        const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const lightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFE0, 
            emissive: 0xFFFFE0, 
            emissiveIntensity: 0.5 
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.y = 3;
        lamp.add(light);

        return lamp;
    }

    updateEnvironment(delta) {
        if (!this.scene) {
            console.warn('LandscapeManager: Cannot update environment - scene is null');
            return;
        }
        
        this.scene.traverse((object) => {
            if (object && object.userData && object.userData.swayFactor) {
                object.rotation.z = Math.sin(Date.now() * 0.001) * object.userData.swayFactor;
            }
        });
    }

    changeSeason(season, time, distance) {
        if (!this.scene) {
            console.warn('LandscapeManager: Cannot change season - scene is null');
            return;
        }
        
        this.currentSeason = season;
        this.scene.traverse((object) => {
            if (object && object.isMesh && object.material && object.material.color) {
                if (object.userData && object.userData.isLeaves) {
                    object.material.color.setHex(this.getSeasonalColor());
                } else if (object.userData && object.userData.isGrass) {
                    object.material.color.setHex(this.getSeasonalGrassColor());
                }
            }
        });

        // Show notification with time and distance
        this.showSeasonNotification(season, time, distance);
        // Update the season display
        this.updateSeasonDisplay();
    }

    updateSpeedometer(speed) {
        this.gaugeManager.updateSpeedometer(speed);
    }

    resetSpeedometer() {
        this.gaugeManager.resetGauges();
    }
} 