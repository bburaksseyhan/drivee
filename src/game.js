import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CoinManager } from './managers/CoinManager.js';
import { ObstacleManager } from './managers/ObstacleManager.js';
import { LevelManager } from './managers/LevelManager.js';
import { RoadManager } from './managers/RoadManager.js';
import { VehicleManager } from './managers/VehicleManager.js';
import { LandscapeManager } from './managers/LandscapeManager.js';
import { GaugeManager } from './managers/GaugeManager.js';
import { MovingObstacleManager } from './managers/MovingObstacleManager.js';
import { HistoryManager } from './managers/HistoryManager.js';
import { CarSelectionManager } from './managers/CarSelectionManager.js';
import { BadgeManager } from './managers/BadgeManager.js';

export class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.objects = [];
        this.trees = [];
        this.clock = new THREE.Clock();
        this.isGameRunning = false;
        this.score = 0;
        
        // Add UFO-related properties
        this.ufos = [];
        this.lastUfoSpawn = 0;
        this.ufoSpawnInterval = 10; // Spawn UFO every 10 seconds
        
        // Audio setup
        this.coinSound = new Audio('sounds/coin.mp3');
        this.coinSound.volume = 0.5;
        this.shootSound = new Audio('sounds/shoot.mp3');
        this.shootSound.volume = 0.3;
        
        // Game elements
        this.road = null;
        this.car = null;
        this.roadSegments = [];
        
        // Bullet management
        this.bullets = [];
        this.bulletSpeed = 2.0;
        this.lastShootTime = 0;
        this.shootCooldown = 0.2; // 200ms between shots
        
        // Game settings
        this.roadLength = 1000;
        this.roadWidth = 10;
        this.carSpeed = 0.14;
        this.scrollSpeed = 0.35;
        this.carPosition = { x: 0, y: 0.5, z: -85 };
        this.movingSpeed = 0.35;
        
        // Controls
        this.keys = {
            left: false,
            right: false,
            space: false
        };

        // Tree management
        this.treePool = [];
        this.activeTreeCount = 0;
        this.maxTrees = 60;
        this.treeSpawnDistance = 20;
        this.lastTreeSpawn = 0;

        // Game managers
        this.coinManager = null;
        this.obstacleManager = null;
        this.levelManager = null;
        this.vehicleManager = null;
        this.isGameOver = false;
        this.roadManager = null;
        this.landscapeManager = null;
        this.gaugeManager = null;
        this.historyManager = null;

        // Game tracking stats
        this.distance = 0;
        this.startTime = null;
        this.elapsedTime = 0;

        // Pause state
        this.isPaused = false;
        this.pauseButton = null;
        this.pauseOverlay = null;

        // Create score display
        this.createScoreDisplay();

        this.airplanes = [];
        this.helicopters = [];
        this.lastAircraftSpawn = 0;
        this.aircraftSpawnInterval = 5; // Spawn aircraft every 5 seconds

        // Countdown settings
        this.countdownActive = true;
        this.countdownTime = 3;
        this.countdownDiv = null;

        // Airport settings
        this.airports = [];
        this.runways = [];
        this.runwayLights = [];
        this.takingOffPlanes = [];
        this.landingPlanes = [];

        this.vehicleManager = new VehicleManager(this.scene);
        this.currentSeason = 'spring';
        this.seasonChangeInterval = 60; // Change season every 60 seconds
        this.lastSeasonChange = 0;

        this.gaugeManager = new GaugeManager();

        // Add moving obstacle manager
        this.movingObstacleManager = null;

        // Add sound effects for moving obstacles
        this.tankSound = new Audio('sounds/tank_engine.mp3');
        this.tankSound.volume = 0.3;
        this.humanSound = new Audio('sounds/human_shout.mp3');
        this.humanSound.volume = 0.4;
        this.carSound = new Audio('sounds/car_engine.mp3');
        this.carSound.volume = 0.3;
        this.animalSound = new Audio('sounds/animal_sound.mp3');
        this.animalSound.volume = 0.4;

        // Add health system
        this.health = 100;
        this.maxHealth = 100;
        this.isInvulnerable = false;
        this.invulnerabilityDuration = 1; // 1 second of invulnerability after hit
        this.lastHitTime = 0;

        // Create health display
        this.createHealthDisplay();

        // Add car selection manager
        this.carSelectionManager = new CarSelectionManager();
        this.carSelectionManager.setGaugeManager(this.gaugeManager);
        this.carSelectionManager.setGame(this);

        // Initialize badge and history managers
        this.badgeManager = new BadgeManager();
        this.historyManager = new HistoryManager();
        this.historyManager.setBadgeManager(this.badgeManager);

        // Track game statistics
        this.gameStats = {
            distance: 0,
            speed: 0,
            score: 0,
            collisions: 0,
            coins: 0,
            season: 'spring',
            unlockedCars: 0
        };

        // Add virtual controls properties
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                       (navigator.maxTouchPoints > 0 && navigator.msMaxTouchPoints > 0);
        
        // Add device type detection
        this.deviceType = this.detectDeviceType();
        
        this.virtualControls = null;
        this.touchControls = {
            left: false,
            right: false,
            shoot: false
        };
    }

    detectDeviceType() {
        const ua = navigator.userAgent;
        if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
            return 'tablet';
        } else if (/iPhone|iPod/i.test(ua)) {
            return 'mobile';
        } else if (/Android/i.test(ua)) {
            return 'android';
        }
        return 'desktop';
    }

    createScoreDisplay() {
        // Create main dashboard container
        this.dashboardDiv = document.createElement('div');
        this.dashboardDiv.style.position = 'absolute';
        this.dashboardDiv.style.top = '20px';
        this.dashboardDiv.style.right = '20px';
        this.dashboardDiv.style.display = 'flex';
        this.dashboardDiv.style.flexDirection = 'column';
        this.dashboardDiv.style.gap = '10px';
        this.dashboardDiv.style.fontFamily = 'Arial, sans-serif';
        this.dashboardDiv.style.zIndex = '1000';

        // Create centered season display
        this.seasonDiv = document.createElement('div');
        this.seasonDiv.style.position = 'absolute';
        this.seasonDiv.style.top = '20px';
        this.seasonDiv.style.left = '50%';
        this.seasonDiv.style.transform = 'translateX(-50%)';
        this.seasonDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.seasonDiv.style.padding = '10px 20px';
        this.seasonDiv.style.borderRadius = '10px';
        this.seasonDiv.style.color = 'white';
        this.seasonDiv.style.textAlign = 'center';
        this.seasonDiv.style.backdropFilter = 'blur(5px)';
        this.seasonDiv.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        this.seasonDiv.style.zIndex = '1000';
        this.seasonDiv.style.display = 'none'; // Initially hidden
        document.body.appendChild(this.seasonDiv);

        // Current Stats Panel
        this.currentStatsDiv = document.createElement('div');
        this.currentStatsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.currentStatsDiv.style.padding = '15px';
        this.currentStatsDiv.style.borderRadius = '10px';
        this.currentStatsDiv.style.color = 'white';
        this.currentStatsDiv.style.minWidth = '200px';
        this.currentStatsDiv.style.backdropFilter = 'blur(5px)';
        this.currentStatsDiv.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        this.currentStatsDiv.style.display = 'none'; // Initially hidden
        this.dashboardDiv.appendChild(this.currentStatsDiv);

        // Best Stats Panel
        this.bestStatsDiv = document.createElement('div');
        this.bestStatsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.bestStatsDiv.style.padding = '15px';
        this.bestStatsDiv.style.borderRadius = '10px';
        this.bestStatsDiv.style.color = 'white';
        this.bestStatsDiv.style.minWidth = '200px';
        this.bestStatsDiv.style.backdropFilter = 'blur(5px)';
        this.bestStatsDiv.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        this.bestStatsDiv.style.display = 'none'; // Initially hidden
        this.dashboardDiv.appendChild(this.bestStatsDiv);

        document.body.appendChild(this.dashboardDiv);
        
        // Create pause button
        this.createPauseButton();

        // Initialize the history manager's UI elements
        if (this.historyManager) {
            this.historyManager.init();
        }
    }

    showBestRecords() {
        if (this.bestStatsDiv) {
            this.bestStatsDiv.style.display = 'block';
            this.bestStatsDiv.style.width = '90%';
            this.bestStatsDiv.style.maxWidth = '600px';
            this.bestStatsDiv.style.padding = '20px';
            this.bestStatsDiv.style.fontSize = '16px';

            // Media query for mobile devices
            if (window.innerWidth <= 768) {
                this.bestStatsDiv.style.width = '85%';
                this.bestStatsDiv.style.maxWidth = '300px';
                this.bestStatsDiv.style.padding = '8px';
                this.bestStatsDiv.style.fontSize = '12px';
                this.bestStatsDiv.style.margin = '0';
                this.bestStatsDiv.style.position = 'fixed';
                this.bestStatsDiv.style.top = '50%';
                this.bestStatsDiv.style.right = '10px';
                this.bestStatsDiv.style.transform = 'translateY(-50%)';
                this.bestStatsDiv.style.zIndex = '1000';
            }
        }
    }

    updateScoreDisplay() {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = Math.floor(this.elapsedTime % 60);
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const distanceKm = (this.distance / 1000).toFixed(1);
        const healthPercentage = Math.ceil((this.health / this.maxHealth) * 100);
        
        // Update season display
        const seasonEmoji = this.currentSeason === 'spring' ? '🌸' : 
                           this.currentSeason === 'summer' ? '☀️' : 
                           this.currentSeason === 'autumn' ? '🍂' : '❄️';
        
        const seasonText = `Current Season: ${seasonEmoji} ${this.currentSeason.charAt(0).toUpperCase() + this.currentSeason.slice(1)}`;
        this.seasonDiv.innerHTML = `<div style="font-size: 18px; color: #BA68C8;">${seasonText}</div>`;

        // Get health color based on percentage
        let healthColor = '#4CAF50'; // Green
        if (healthPercentage < 30) {
            healthColor = '#f44336'; // Red
        } else if (healthPercentage < 60) {
            healthColor = '#ff9800'; // Orange
        }

        // Update current stats
        this.currentStatsDiv.innerHTML = `
            <div style="font-size: 20px; margin-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 5px;">
                Current Game
            </div>
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
                <span>🎯 Score:</span>
                <span style="text-align: right; color: #64B5F6;">${this.score}</span>
                
                <span>🛣️ Distance:</span>
                <span style="text-align: right; color: #81C784;">${distanceKm} km</span>
                
                <span>⏱️ Time:</span>
                <span style="text-align: right; color: #FFB74D;">${formattedTime}</span>
                
                <span>❤️ Health:</span>
                <span style="text-align: right; color: ${healthColor};">${healthPercentage}%</span>
            </div>`;

        // Get best stats from history manager
        const bestStats = this.historyManager ? this.historyManager.getBestStats() : { score: 0, distance: 0, time: 0 };
        const bestTime = this.formatTime(bestStats.time || 0);
        const bestDistance = ((bestStats.distance || 0) / 1000).toFixed(1);

        // Update best stats
        this.bestStatsDiv.innerHTML = `
            <div style="font-size: 20px; margin-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 5px;">
                Best Records 🏆
            </div>
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
                <span>🎯 High Score:</span>
                <span style="text-align: right; color: #64B5F6;">${bestStats.score || 0}</span>
                
                <span>🛣️ Best Distance:</span>
                <span style="text-align: right; color: #81C784;">${bestDistance} km</span>
                
                <span>⏱️ Best Time:</span>
                <span style="text-align: right; color: #FFB74D;">${bestTime}</span>
            </div>`;
    }

    createHealthDisplay() {
        // Health is now integrated into the main dashboard
        // This method is kept for compatibility but doesn't need to create a separate display
    }

    updateHealthDisplay() {
        // Health updates are now handled in updateScoreDisplay
        this.updateScoreDisplay();
    }

    createPauseButton() {
        this.pauseButton = document.createElement('button');
        this.pauseButton.innerHTML = '❚❚';
        this.pauseButton.style.position = 'fixed';
        this.pauseButton.style.top = '130px';
        this.pauseButton.style.right = '80px'; // Position next to history button
        this.pauseButton.style.width = 'clamp(35px, 8vw, 45px)';
        this.pauseButton.style.height = 'clamp(35px, 8vw, 45px)';
        this.pauseButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.pauseButton.style.color = 'white';
        this.pauseButton.style.border = 'none';
        this.pauseButton.style.borderRadius = '8px';
        this.pauseButton.style.fontSize = 'clamp(18px, 4vw, 22px)';
        this.pauseButton.style.cursor = 'pointer';
        this.pauseButton.style.zIndex = '1000';
        this.pauseButton.style.display = 'none';
        this.pauseButton.style.transition = 'all 0.2s ease';
        this.pauseButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

        // Add hover effects
        this.pauseButton.addEventListener('mouseover', () => {
            this.pauseButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            this.pauseButton.style.transform = 'scale(1.1)';
            this.pauseButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        });

        this.pauseButton.addEventListener('mouseout', () => {
            this.pauseButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            this.pauseButton.style.transform = 'scale(1)';
            this.pauseButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        });

        // Add click event
        this.pauseButton.addEventListener('click', () => this.togglePause());

        document.body.appendChild(this.pauseButton);

        // Create pause overlay
        this.pauseOverlay = document.createElement('div');
        this.pauseOverlay.style.position = 'fixed';
        this.pauseOverlay.style.top = '0';
        this.pauseOverlay.style.left = '0';
        this.pauseOverlay.style.width = '100%';
        this.pauseOverlay.style.height = '100%';
        this.pauseOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.pauseOverlay.style.display = 'none';
        this.pauseOverlay.style.zIndex = '999';
        this.pauseOverlay.style.justifyContent = 'center';
        this.pauseOverlay.style.alignItems = 'center';
        this.pauseOverlay.style.flexDirection = 'column';
        this.pauseOverlay.style.color = 'white';
        this.pauseOverlay.style.fontSize = 'clamp(24px, 6vw, 36px)';
        this.pauseOverlay.style.fontWeight = 'bold';
        this.pauseOverlay.style.textAlign = 'center';
        this.pauseOverlay.innerHTML = 'PAUSED<br><span style="font-size: clamp(16px, 4vw, 24px);">Click to resume</span>';
        document.body.appendChild(this.pauseOverlay);
    }

    showPauseButton() {
        if (this.pauseButton) {
            this.pauseButton.style.display = 'block';
        }
    }

    hidePauseButton() {
        if (this.pauseButton) {
            this.pauseButton.style.display = 'none';
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.pauseButton.innerHTML = '▶';
            this.pauseOverlay.style.display = 'flex';
        } else {
            this.pauseButton.innerHTML = '❚❚';
            this.pauseOverlay.style.display = 'none';
        }
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 200);
        
        // Create camera with responsive aspect ratio
        this.camera = new THREE.PerspectiveCamera(
            85,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, -75);
        this.camera.lookAt(0, 0, -100);
        
        // Create renderer with responsive settings
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for better performance
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        
        // Add lights
        this.setupLights();
        
        // Show car selection before initializing the game
        this.carSelectionManager.showCarSelection();

        // Listen for car selection
        document.addEventListener('carSelected', (event) => {
            const selectedCar = event.detail;
            // Initialize the game with selected car
            this.initializeGameWithCar(selectedCar);
        });

        // Add responsive event listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('orientationchange', this.onWindowResize.bind(this));
    }

    setupLights() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);
        
        this.hemisphereLight = new THREE.HemisphereLight(
            0x87CEEB,
            0x4CAF50,
            1.0
        );
        this.hemisphereLight.position.set(0, 50, 0);
        this.scene.add(this.hemisphereLight);
        
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(10, 20, 10);
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);
    }

    initializeGameWithCar(selectedCar) {
        // Initialize managers in correct order
        this.landscapeManager = new LandscapeManager(this.scene, this.roadWidth);
        this.createRoad();
        this.createCarWithSpecs(selectedCar);
        this.initializeTrees();
        
        this.coinManager = new CoinManager(
            this.scene, 
            this.roadWidth, 
            this.roadLength, 
            20, 
            this.scrollSpeed
        );
        
        this.obstacleManager = new ObstacleManager(
            this.scene, 
            this.roadWidth, 
            this.roadLength, 
            10, 
            this.scrollSpeed
        );
        
        this.levelManager = new LevelManager(this);
        this.vehicleManager = new VehicleManager(this.scene);
        
        // Initialize history manager
        this.historyManager.init();
        
        // Initialize other game elements
        this.setupEventListeners();
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Start countdown
        this.isGameRunning = false;
        this.startCountdown();

        // Initialize remaining managers
        this.roadManager = new RoadManager(this.scene, this.roadWidth, this.roadLength, this.scrollSpeed);
        this.createAirports();
        this.vehicleManager.createVehicle();
        
        this.movingObstacleManager = new MovingObstacleManager(
            this.scene,
            this.roadWidth,
            this.roadLength,
            this.scrollSpeed
        );

        // Apply car specs to game settings
        this.updateGameSettingsFromCar(selectedCar);

        // Create virtual controls for mobile
        this.createVirtualControls();
    }

    createCarWithSpecs(carSpecs) {
        this.car = new THREE.Group();
        
        // Create car body with selected color
        const bodyGeometry = new THREE.BoxGeometry(1.5, 0.5, 3);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: carSpecs.color,
            metalness: 0.7,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        this.car.add(body);
        
        // Car top
        const topGeometry = new THREE.BoxGeometry(1.2, 0.4, 1.5);
        const topMaterial = new THREE.MeshStandardMaterial({ 
            color: carSpecs.color,
            metalness: 0.7,
            roughness: 0.3
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 0.95;
        top.position.z = -0.2;
        top.castShadow = true;
        this.car.add(top);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111111,
            metalness: 0.5,
            roughness: 0.7
        });
        
        // Add wheels
        const wheelPositions = [
            [-0.8, 0.4, 1],   // Front left
            [0.8, 0.4, 1],    // Front right
            [-0.8, 0.4, -1],  // Rear left
            [0.8, 0.4, -1]    // Rear right
        ];
        
        wheelPositions.forEach(position => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...position);
            wheel.castShadow = true;
            this.car.add(wheel);
        });
        
        // Position the car
        this.car.position.set(this.carPosition.x, this.carPosition.y, this.carPosition.z);
        this.scene.add(this.car);
    }

    updateGameSettingsFromCar(carSpecs) {
        // Update game settings based on car specifications
        this.carSpeed = 0.14 * (carSpecs.specs.handling / 100);
        this.scrollSpeed = 0.35 * (carSpecs.specs.maxSpeed / 350);
        this.bulletSpeed = 2.0 * (carSpecs.specs.acceleration / 100);
        
        // Update manager speeds
        if (this.coinManager) this.coinManager.scrollSpeed = this.scrollSpeed;
        if (this.obstacleManager) this.obstacleManager.scrollSpeed = this.scrollSpeed;
        if (this.roadManager) this.roadManager.scrollSpeed = this.scrollSpeed;
        if (this.movingObstacleManager) this.movingObstacleManager.scrollSpeed = this.scrollSpeed;
    }
    
    startCountdown() {
        // Create countdown overlay
        this.countdownDiv = document.createElement('div');
        this.countdownDiv.style.position = 'absolute';
        this.countdownDiv.style.top = '50%';
        this.countdownDiv.style.left = '50%';
        this.countdownDiv.style.transform = 'translate(-50%, -50%)';
        this.countdownDiv.style.fontSize = '72px';
        this.countdownDiv.style.color = 'white';
        this.countdownDiv.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        this.countdownDiv.style.zIndex = '1000';
        document.body.appendChild(this.countdownDiv);
        
        // Start the countdown
        this.updateCountdown();
    }
    
    updateCountdown() {
        if (this.countdownTime > 0) {
            this.countdownDiv.textContent = this.countdownTime.toString();
            this.countdownTime--;
            setTimeout(() => this.updateCountdown(), 1000);
        } else {
            this.countdownDiv.textContent = "GO!";
            setTimeout(() => {
                // Remove countdown display and start the game
                document.body.removeChild(this.countdownDiv);
                this.countdownActive = false;
                this.isGameRunning = true;
                this.startTime = Date.now();
                // Show all UI elements after countdown
                this.gaugeManager.showGauges();
                this.showPauseButton();
                this.showCurrentGame();
                this.showBestRecords();
                this.showSeasonDisplay();
                this.historyManager.showHistoryButton();
                this.badgeManager.showBadgeButton();
                // Show virtual controls for mobile devices
                if (this.isMobile) {
                    this.showVirtualControls();
                }
                this.animate();
            }, 1000);
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            // Only process controls if countdown is not active
            if (!this.countdownActive) {
                switch(event.key) {
                    case 'ArrowLeft':
                        this.keys.left = true;
                        break;
                    case 'ArrowRight':
                        this.keys.right = true;
                        break;
                    case ' ': // Space bar
                        this.keys.space = true;
                        this.shoot();
                        break;
                }
            }
            
            // Add keyboard shortcut for pause (ESC key)
            if (event.key === 'Escape' && !this.countdownActive && !this.isGameOver) {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            // Only process controls if countdown is not active
            if (!this.countdownActive) {
                switch(event.key) {
                    case 'ArrowLeft':
                        this.keys.left = false;
                        break;
                    case 'ArrowRight':
                        this.keys.right = false;
                        break;
                    case ' ': // Space bar
                        this.keys.space = false;
                        break;
                }
            }
        });

        // Add touch event listeners for mobile
        if (this.isMobile) {
            document.addEventListener('touchstart', (event) => {
                event.preventDefault(); // Prevent default touch behavior
            }, { passive: false });

            document.addEventListener('touchend', (event) => {
                event.preventDefault(); // Prevent default touch behavior
            }, { passive: false });
        }
    }
    
    createRoad() {
        // Create an infinitely scrolling road using segments
        const segmentLength = 20;
        const segmentCount = Math.ceil(this.roadLength / segmentLength);
        
        for (let i = 0; i < segmentCount; i++) {
            const segment = this.createRoadSegment(segmentLength);
            segment.position.z = -i * segmentLength;
            this.roadSegments.push(segment);
            this.scene.add(segment);
        }
    }
    
    addTreesToSegment(segment, length) {
        const treeSpacing = 10; // Increase distance between trees
        for (let i = -length / 2; i < length / 2; i += treeSpacing) {
            // Random offset for tree position
            const offset = Math.random() * 2 - 1;

            // Decide what type of vegetation to add
            const isLeftPalm = Math.random() < 0.3; // 30% chance for palm on left
            const isRightPalm = Math.random() < 0.3; // 30% chance for palm on right

            // Left side vegetation
            const leftTree = isLeftPalm ? this.createPalm() : this.createTree();
            leftTree.position.set(-(this.roadWidth / 2 + 3 + offset), 0, i + offset);
            segment.add(leftTree);

            // Right side vegetation
            const rightTree = isRightPalm ? this.createPalm() : this.createTree();
            rightTree.position.set(this.roadWidth / 2 + 3 + offset, 0, i + offset);
            segment.add(rightTree);
            
            // Add more palms in clusters occasionally
            if (isLeftPalm && Math.random() < 0.5) {
                const extraPalm = this.createPalm();
                extraPalm.position.set(-(this.roadWidth / 2 + 5 + offset), 0, i + offset + 1);
                segment.add(extraPalm);
            }
            
            if (isRightPalm && Math.random() < 0.5) {
                const extraPalm = this.createPalm();
                extraPalm.position.set(this.roadWidth / 2 + 5 + offset, 0, i + offset + 1);
                segment.add(extraPalm);
            }
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

        // Add trees to the segment
        this.addTreesToSegment(segment, length);

        // Add streetlights
        this.addStreetlightsToSegment(segment, length);

        // Add houses
        this.addHousesToSegment(segment, length);

        // Add cows along the road
        this.addCowsToSegment(segment, length);

        // Add landscaping features
        this.landscapeManager.addGreeneryToSegment(segment, length);
        this.landscapeManager.addDecorativeElements(segment, length);

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
    
    addStreetlightsToSegment(segment, length) {
        const lightSpacing = 20;
        for (let i = -length / 2; i < length / 2; i += lightSpacing) {
            // Left side streetlight
            const leftLight = this.createStreetlight();
            leftLight.position.set(-(this.roadWidth / 2 + 5), 0, i);
            segment.add(leftLight);

            // Right side streetlight
            const rightLight = this.createStreetlight();
            rightLight.position.set(this.roadWidth / 2 + 5, 0, i);
            segment.add(rightLight);
        }
    }

    createStreetlight() {
        const lightPoleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
        const lightPoleMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const pole = new THREE.Mesh(lightPoleGeometry, lightPoleMaterial);
        pole.position.y = 2.5;

        const lightGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const lightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFE0, 
            emissive: 0xFFFFE0, 
            emissiveIntensity: 0.5 
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.y = 5;

        const streetlight = new THREE.Group();
        streetlight.add(pole);
        streetlight.add(light);

        return streetlight;
    }

    addHousesToSegment(segment, length) {
        const houseSpacing = 15; // Reduced spacing for more density
        for (let i = -length / 2; i < length / 2; i += houseSpacing) {
            // Random offset for house position
            const offset = Math.random() * 2 - 1;

            // Left side house
            const leftHouse = this.createHouse();
            leftHouse.position.set(-(this.roadWidth / 2 + 10 + offset), 0, i + offset);
            segment.add(leftHouse);

            // Right side house
            const rightHouse = this.createHouse();
            rightHouse.position.set(this.roadWidth / 2 + 10 + offset, 0, i + offset);
            segment.add(rightHouse);

            // Add people next to houses
            const leftPerson = this.createPerson();
            leftPerson.position.set(-(this.roadWidth / 2 + 12 + offset), 0, i + offset);
            segment.add(leftPerson);

            const rightPerson = this.createPerson();
            rightPerson.position.set(this.roadWidth / 2 + 12 + offset, 0, i + offset);
            segment.add(rightPerson);

            // Add dogs and cats near houses
            const leftDog = this.createDog();
            leftDog.position.set(-(this.roadWidth / 2 + 14 + offset), 0, i + offset);
            segment.add(leftDog);

            const rightCat = this.createCat();
            rightCat.position.set(this.roadWidth / 2 + 14 + offset, 0, i + offset);
            segment.add(rightCat);

            // Add apartments behind houses
            const leftApartment = this.createApartment();
            leftApartment.position.set(-(this.roadWidth / 2 + 15 + offset), 0, i + offset);
            segment.add(leftApartment);

            const rightApartment = this.createApartment();
            rightApartment.position.set(this.roadWidth / 2 + 15 + offset, 0, i + offset);
            segment.add(rightApartment);

            // Add skyscrapers behind apartments
            const leftSkyscraper = this.createSkyscraper();
            leftSkyscraper.position.set(-(this.roadWidth / 2 + 20 + offset), 0, i + offset);
            segment.add(leftSkyscraper);

            const rightSkyscraper = this.createSkyscraper();
            rightSkyscraper.position.set(this.roadWidth / 2 + 20 + offset, 0, i + offset);
            segment.add(rightSkyscraper);
        }
    }

    createHouse() {
        const house = new THREE.Group();

        // House base
        const baseGeometry = new THREE.BoxGeometry(2, 1, 2);
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            color: Math.random() * 0xffffff, // Random color
            roughness: 0.8
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        house.add(base);

        // House roof
        const roofGeometry = new THREE.ConeGeometry(1.5, 1, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B0000, // Dark red
            roughness: 0.8
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.5;
        house.add(roof);

        return house;
    }

    createApartment() {
        const apartment = new THREE.Group();

        // Apartment base
        const baseHeight = 3 + Math.random() * 5; // Random height
        const baseGeometry = new THREE.BoxGeometry(3, baseHeight, 2);
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            color: Math.random() * 0xffffff, // Random color
            roughness: 0.8
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = baseHeight / 2;
        apartment.add(base);

        // Windows
        const windowGeometry = new THREE.PlaneGeometry(0.5, 0.5);
        const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFE0, 
            emissive: 0xFFFFE0, 
            emissiveIntensity: 0.1, // Soft glow
            transparent: true,
            opacity: 0.8
        });

        const windowRows = Math.floor(baseHeight / 1.5);
        for (let y = 0; y < windowRows; y++) {
            for (let x = -1; x <= 1; x++) {
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(x, y * 1.5 - baseHeight / 2 + 0.75, 1.01);
                apartment.add(window);
            }
        }

        // Add 'For Sale'/'For Rent' signs
        const signGeometry = new THREE.PlaneGeometry(1, 0.5);
        const signMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF0000, 
            emissive: 0xFF0000, 
            emissiveIntensity: 0.2, // Glow effect
            transparent: true,
            opacity: 0.9
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, baseHeight / 2 + 0.5, 1.01);
        apartment.add(sign);

        return apartment;
    }

    createSkyscraper() {
        const skyscraper = new THREE.Group();

        // Skyscraper base
        const baseHeight = 10 + Math.random() * 10; // Random height
        const baseGeometry = new THREE.BoxGeometry(4, baseHeight, 3);
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            color: Math.random() * 0xffffff, // Random color
            roughness: 0.8
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = baseHeight / 2;
        skyscraper.add(base);

        // Windows
        const windowGeometry = new THREE.PlaneGeometry(0.5, 0.5);
        const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFE0, 
            emissive: 0xFFFFE0, 
            emissiveIntensity: 0.1, // Soft glow
            transparent: true,
            opacity: 0.8
        });

        const windowRows = Math.floor(baseHeight / 1.5);
        for (let y = 0; y < windowRows; y++) {
            for (let x = -2; x <= 2; x++) {
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(x, y * 1.5 - baseHeight / 2 + 0.75, 1.51);
                skyscraper.add(window);
            }
        }

        return skyscraper;
    }

    createPerson() {
        const personGeometry = new THREE.BoxGeometry(0.5, 1.5, 0.5);
        const personMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFD700, // Gold color for visibility
            roughness: 0.8
        });
        const person = new THREE.Mesh(personGeometry, personMaterial);
        person.position.y = 0.75; // Position to stand on the ground
        return person;
    }
    
    createCar() {
        // Create a simple car using a group of meshes
        this.car = new THREE.Group();
        
        // Car body
        const bodyGeometry = new THREE.BoxGeometry(1.5, 0.5, 3);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF0000, // Red car
            metalness: 0.7,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        this.car.add(body);
        
        // Car top
        const topGeometry = new THREE.BoxGeometry(1.2, 0.4, 1.5);
        const topMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF0000,
            metalness: 0.7,
            roughness: 0.3
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 0.95;
        top.position.z = -0.2;
        top.castShadow = true;
        this.car.add(top);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111111, // Dark for tires
            metalness: 0.5,
            roughness: 0.7
        });
        
        // Front left wheel
        const wheelFL = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheelFL.rotation.z = Math.PI / 2;
        wheelFL.position.set(-0.8, 0.4, 1);
        wheelFL.castShadow = true;
        this.car.add(wheelFL);
        
        // Front right wheel
        const wheelFR = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheelFR.rotation.z = Math.PI / 2;
        wheelFR.position.set(0.8, 0.4, 1);
        wheelFR.castShadow = true;
        this.car.add(wheelFR);
        
        // Rear left wheel
        const wheelRL = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheelRL.rotation.z = Math.PI / 2;
        wheelRL.position.set(-0.8, 0.4, -1);
        wheelRL.castShadow = true;
        this.car.add(wheelRL);
        
        // Rear right wheel
        const wheelRR = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheelRR.rotation.z = Math.PI / 2;
        wheelRR.position.set(0.8, 0.4, -1);
        wheelRR.castShadow = true;
        this.car.add(wheelRR);
        
        // Add headlights
        const headlightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const headlightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.5
        });
        
        // Left headlight
        const headlightL = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlightL.position.set(-0.5, 0.5, 1.5);
        this.car.add(headlightL);
        
        // Right headlight
        const headlightR = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlightR.position.set(0.5, 0.5, 1.5);
        this.car.add(headlightR);
        
        // Headlight beams
        this.headlightLBeam = new THREE.SpotLight(0xFFFFAA, 1, 50, Math.PI / 6, 0.5, 2);
        this.headlightLBeam.position.set(-0.5, 0.5, 1.5);
        this.headlightLBeam.target.position.set(-0.5, 0, 10);
        this.car.add(this.headlightLBeam);
        this.car.add(this.headlightLBeam.target);

        this.headlightRBeam = new THREE.SpotLight(0xFFFFAA, 1, 50, Math.PI / 6, 0.5, 2);
        this.headlightRBeam.position.set(0.5, 0.5, 1.5);
        this.headlightRBeam.target.position.set(0.5, 0, 10);
        this.car.add(this.headlightRBeam);
        this.car.add(this.headlightRBeam.target);
        
        // Position the car
        this.car.position.set(
            this.carPosition.x,
            this.carPosition.y,
            this.carPosition.z
        );
        
        this.scene.add(this.car);
    }
    
    initializeTrees() {
        // Create a pool of trees that we can reuse
        for (let i = 0; i < this.maxTrees; i++) {
            const tree = this.createTree(0, 0, 0);
            tree.visible = false;
            this.treePool.push(tree);
        }
    }
    
    spawnTree() {
        if (this.activeTreeCount >= this.maxTrees) return;

        const tree = this.treePool[this.activeTreeCount];
        const side = Math.random() < 0.5 ? -1 : 1;
        const offset = (this.roadWidth / 2 + 2 + Math.random() * 3) * side;
        
        tree.position.set(
            offset,
            0,
            -this.roadLength
        );
        tree.visible = true;
        this.activeTreeCount++;
    }
    
    updateTrees(delta) {
        // Move existing trees
        for (let i = 0; i < this.activeTreeCount; i++) {
            const tree = this.treePool[i];
            tree.position.z += this.scrollSpeed * delta * 60;

            // Reset tree if it's gone past the camera
            if (tree.position.z > 10) {
                tree.position.z = -this.roadLength;
                tree.position.x = (this.roadWidth / 2 + 2 + Math.random() * 3) * 
                    (Math.random() < 0.5 ? -1 : 1);
            }
        }

        // Spawn new trees
        if (this.lastTreeSpawn > this.treeSpawnDistance) {
            this.spawnTree();
            this.lastTreeSpawn = 0;
        }
        this.lastTreeSpawn += this.scrollSpeed * delta * 60;
    }
    
    updateRoad(delta) {
        // Move road segments
        for (const segment of this.roadSegments) {
            segment.position.z += this.scrollSpeed * delta * 60;

            // If segment has moved past the camera, move it to the back
            if (segment.position.z > 20) {
                segment.position.z -= this.roadLength;
                
                // Update palm tree sway animation
                segment.traverse((object) => {
                    if (object.userData && object.userData.swayFactor) {
                        // Apply more pronounced sway to palm trees
                        object.rotation.x = Math.sin(Date.now() * 0.0005) * object.userData.swayFactor;
                        object.rotation.z = Math.sin(Date.now() * 0.001) * object.userData.swayFactor;
                    }
                });
            }
        }
    }
    
    createTree() {
        const tree = new THREE.Group();     
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.75;
        tree.add(trunk);

        const leavesGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: this.landscapeManager.getSeasonalColor() });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 1.5;
        tree.add(leaves);

        tree.userData = { swayFactor: 0.05 + Math.random() * 0.05 };
        return tree;
    }
    
    createPalm() {
        const palm = new THREE.Group();
        
        // Palm trunk (taller and slightly curved)
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B5A2B, // Saddle brown
            roughness: 1.0
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        // Add slight curve to trunk
        trunk.rotation.x = Math.random() * 0.2;
        trunk.rotation.z = Math.random() * 0.2;
        trunk.castShadow = true;
        palm.add(trunk);
        
        // Palm fronds (leaves)
        const frondCount = 6 + Math.floor(Math.random() * 4); // 6-9 fronds
        const frondColor = 0x4CAF50; // Green color for fronds
        
        for (let i = 0; i < frondCount; i++) {
            // Create palm frond
            const frondGeometry = new THREE.PlaneGeometry(0.8, 2);
            const frondMaterial = new THREE.MeshStandardMaterial({ 
                color: frondColor,
                roughness: 0.8,
                side: THREE.DoubleSide // Visible from both sides
            });
            const frond = new THREE.Mesh(frondGeometry, frondMaterial);
            
            // Position around the top of trunk
            const angle = (i / frondCount) * Math.PI * 2;
            frond.position.set(
                Math.sin(angle) * 0.2,
                4, // At top of trunk
                Math.cos(angle) * 0.2
            );
            
            // Rotate to spread outwards and downwards
            frond.rotation.x = -Math.PI / 4; // Tilt down
            frond.rotation.y = angle;
            frond.rotation.z = Math.PI / 6; // Slight twist
            
            frond.castShadow = true;
            palm.add(frond);
        }
        
        // Add coconuts
        if (Math.random() < 0.7) { // 70% chance to have coconuts
            const coconutCount = 1 + Math.floor(Math.random() * 3); // 1-3 coconuts
            for (let i = 0; i < coconutCount; i++) {
                const coconutGeometry = new THREE.SphereGeometry(0.2, 8, 8);
                const coconutMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x4E3B31, // Dark brown
                    roughness: 0.9
                });
                const coconut = new THREE.Mesh(coconutGeometry, coconutMaterial);
                
                // Random position at top of trunk
                const angle = Math.random() * Math.PI * 2;
                const radius = 0.3;
                coconut.position.set(
                    Math.sin(angle) * radius,
                    3.9, // Just below the fronds
                    Math.cos(angle) * radius
                );
                
                coconut.castShadow = true;
                palm.add(coconut);
            }
        }
        
        // Add sway effect for wind
        palm.userData = { swayFactor: 0.05 + Math.random() * 0.05 };
        
        this.scene.add(palm);
        this.trees.push(palm);
        
        return palm;
    }
    
    onWindowResize() {
        // Update camera aspect ratio
        if (this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }

        // Update renderer size
        if (this.renderer) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

        // Update UI elements for mobile responsiveness
        this.updateUIForScreenSize();
    }

    updateUIForScreenSize() {
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;

        // Update score display
        if (this.scoreDisplay) {
            this.scoreDisplay.style.fontSize = isMobile ? '12px' : '16px';
            this.scoreDisplay.style.padding = isMobile ? '6px 10px' : '10px 15px';
        }

        // Update health display
        if (this.healthDisplay) {
            this.healthDisplay.style.fontSize = isMobile ? '12px' : '16px';
            this.healthDisplay.style.padding = isMobile ? '6px 10px' : '10px 15px';
        }

        // Update season display
        if (this.seasonDisplay) {
            this.seasonDisplay.style.fontSize = isMobile ? '12px' : '16px';
            this.seasonDisplay.style.padding = isMobile ? '6px 10px' : '10px 15px';
        }

        // Update countdown display
        if (this.countdownDisplay) {
            this.countdownDisplay.style.fontSize = isMobile ? '20px' : '32px';
            this.countdownDisplay.style.padding = isMobile ? '10px 20px' : '20px 30px';
        }

        // Update badge button
        if (this.badgeButton) {
            this.badgeButton.style.fontSize = isMobile ? '12px' : '16px';
            this.badgeButton.style.padding = isMobile ? '6px 10px' : '10px 15px';
            this.badgeButton.style.right = isMobile ? '5px' : '20px';
        }

        // Update history button
        if (this.historyButton) {
            this.historyButton.style.fontSize = isMobile ? '12px' : '16px';
            this.historyButton.style.padding = isMobile ? '6px 10px' : '10px 15px';
            this.historyButton.style.right = isMobile ? '5px' : '20px';
        }

        // Update pause button
        if (this.pauseButton) {
            this.pauseButton.style.fontSize = isMobile ? '12px' : '16px';
            this.pauseButton.style.padding = isMobile ? '6px 10px' : '10px 15px';
            this.pauseButton.style.right = isMobile ? '5px' : '20px';
        }

        // Update car selection UI for mobile
        if (this.carSelectionManager && this.carSelectionManager.carSelectionDiv) {
            const carGrid = this.carSelectionManager.carSelectionDiv.querySelector('div[style*="grid-template-columns"]');
            if (carGrid) {
                if (isSmallMobile) {
                    carGrid.style.gridTemplateColumns = '1fr';
                } else if (isMobile) {
                    carGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                } else {
                    carGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                }
            }
        }

        // Update game over UI for mobile
        if (this.gameOverDiv) {
            this.gameOverDiv.style.padding = isMobile ? '10px' : '20px';
            const buttons = this.gameOverDiv.querySelectorAll('button');
            buttons.forEach(button => {
                button.style.fontSize = isMobile ? '12px' : '16px';
                button.style.padding = isMobile ? '6px 12px' : '10px 20px';
            });
        }

        // Update camera position for mobile
        if (this.camera) {
            if (isMobile) {
                this.camera.position.set(0, 8, -60);
            } else {
                this.camera.position.set(0, 10, -75);
            }
        }

        // Update car position for mobile
        if (this.car) {
            if (isMobile) {
                this.car.position.set(0, 0.5, -70);
            } else {
                this.car.position.set(0, 0.5, -80);
            }
        }

        // Update scroll speed for mobile
        if (isMobile) {
            this.scrollSpeed = 0.5;
        } else {
            this.scrollSpeed = 0.7;
        }

        // Update current game and best records display for mobile
        if (this.currentStatsDiv) {
            this.currentStatsDiv.style.fontSize = isMobile ? '10px' : '16px';
            this.currentStatsDiv.style.padding = isMobile ? '6px' : '15px';
        }

        if (this.bestStatsDiv) {
            this.bestStatsDiv.style.fontSize = isMobile ? '10px' : '16px';
            this.bestStatsDiv.style.padding = isMobile ? '6px' : '15px';
        }

        // Update gauge display for mobile
        if (this.gaugeManager) {
            this.gaugeManager.updateGaugeSize(isMobile ? 'small' : 'normal');
        }
    }
    
    update() {
        if (this.isGameOver || this.isPaused) {
            this.gaugeManager.resetGauges();
            this.landscapeManager.resetSpeedometer();
            return;
        }

        // Check if health is 0 or below
        if (this.health <= 0) {
            this.health = 0; // Ensure health doesn't go below 0
            this.updateHealthDisplay();
            this.gameOver();
            return;
        }

        const delta = this.clock.getDelta();
        const currentTime = Date.now() / 1000;

        // Update time tracking
        if (this.startTime !== null) {
            this.elapsedTime = (Date.now() - this.startTime) / 1000;
        }

        // Update distance and speed tracking
        if (this.isGameRunning && !this.isPaused) {
            this.distance += this.scrollSpeed * delta * 60;
            // Update speedometer with current speed
            const currentSpeed = this.scrollSpeed * 60; // Convert to m/s
            this.landscapeManager.updateSpeedometer(currentSpeed);

            // Track time at max speed for Speed Survivor badge
            if (currentSpeed >= this.maxSpeed * 0.95) { // 95% of max speed
                if (!this.maxSpeedStartTime) {
                    this.maxSpeedStartTime = currentTime;
                } else if (currentTime - this.maxSpeedStartTime >= 300 && !this.unlockedBadges.has('speed_survivor')) {
                    const badge = this.badges.special.find(b => b.id === 'speed_survivor');
                    this.unlockBadge(badge);
                }
            } else {
                this.maxSpeedStartTime = null;
            }

            // Track night driving for Night Rider badge
            const phase = (this.clock.getElapsedTime() % 60) / 60;
            if (phase >= 0.75 || phase < 0.25) { // Night time
                if (!this.nightDrivingStartTime) {
                    this.nightDrivingStartTime = currentTime;
                    this.nightDrivingDistance = 0;
                }
                this.nightDrivingDistance += this.scrollSpeed * delta * 60;
                
                // Check for Night Rider badge
                if (this.nightDrivingDistance >= 10000 && !this.unlockedBadges.has('night_rider')) {
                    const badge = this.badges.special.find(b => b.id === 'night_rider');
                    this.unlockBadge(badge);
                }

                // Check for Rush Hour Hero badge
                if (this.score >= 1000 && !this.unlockedBadges.has('rush_hour')) {
                    const badge = this.badges.challenges.find(b => b.id === 'rush_hour');
                    this.unlockBadge(badge);
                }
            } else {
                this.nightDrivingStartTime = null;
            }

            // Check for Marathon Runner badge
            if (this.elapsedTime >= 1800 && !this.unlockedBadges.has('marathon_runner')) {
                const badge = this.badges.challenges.find(b => b.id === 'marathon_runner');
                this.unlockBadge(badge);
            }
        } else {
            // If game is paused or not running, show speed as 0
            this.landscapeManager.updateSpeedometer(0);
        }

        // Update game statistics
        this.gameStats = {
            distance: this.distance / 1000, // Convert to kilometers
            speed: this.scrollSpeed * 200, // Convert to km/h
            score: this.score,
            collisions: this.collisionCount,
            coins: this.coinCount,
            season: this.currentSeason,
            unlockedCars: this.carSelectionManager.getUnlockedCarsCount()
        };

        // Check for badges
        this.badgeManager.checkAndAwardBadges(this.gameStats);

        // Continue with regular updates
        this.updateBullets(delta);
        this.updateScoreDisplay();
        this.updateDayNightCycle();
        this.updateRoad(delta);
        this.updateTrees(delta);
        this.coinManager.updateCoins(delta, this.car, (points) => {
            this.score += points;
            this.updateScoreDisplay();
            // Play coin collection sound
            this.coinSound.currentTime = 0;
            this.coinSound.play().catch(error => console.log("Audio play failed:", error));
            this.levelManager.checkLevelProgression(this.score);
        });
        this.obstacleManager.updateObstacles(delta, this.car, () => this.gameOver());
        this.vehicleManager.updateVehicles(delta);
        this.updateUfos(delta);
        this.updateAircraft(delta);

        // Update car and camera
        this.updateCarPosition(delta);
        this.updateCamera();

        this.roadManager.updateRoad(delta);

        // Update airport flights
        this.updateAirportFlights(delta);

        // Update environment
        this.landscapeManager.updateEnvironment(delta);

        // Change season based on time
        this.lastSeasonChange += delta;
        if (this.lastSeasonChange > this.seasonChangeInterval) {
            this.changeSeason();
            this.lastSeasonChange = 0;
        }

        // Update speedometer and RPM gauge
        this.gaugeManager.updateSpeedometer(this.scrollSpeed);

        // Update moving obstacles
        if (this.isGameRunning && !this.isPaused) {
            this.movingObstacleManager.update(delta, this.car.position);
            this.checkMovingObstacleCollisions();
        }

        // Update invulnerability
        if (this.isInvulnerable) {
            const now = Date.now() / 1000;
            if (now - this.lastHitTime > this.invulnerabilityDuration) {
                this.isInvulnerable = false;
                this.car.visible = true;
            } else {
                // Flash the car during invulnerability
                this.car.visible = Math.floor(now * 10) % 2 === 0;
            }
        }

        // Update game statistics
        this.gameStats.distance = this.distance / 1000; // Convert to kilometers
        this.gameStats.speed = this.scrollSpeed * 200; // Convert to km/h
        this.gameStats.score = this.score;
        this.gameStats.season = this.currentSeason;

        // Check for badges
        this.badgeManager.checkAndAwardBadges(this.gameStats);
    }
    
    updateCarPosition(delta) {
        // Handle left/right movement (both keyboard and touch controls)
        if ((this.keys.left || this.touchControls.left) && this.car.position.x > -this.roadWidth / 2 + 1) {
            this.car.position.x -= this.carSpeed * delta * 60;
        }
        
        if ((this.keys.right || this.touchControls.right) && this.car.position.x < this.roadWidth / 2 - 1) {
            this.car.position.x += this.carSpeed * delta * 60;
        }
        
        // Add a slight tilt when turning
        const targetRotation = new THREE.Euler();
        if (this.keys.left || this.touchControls.left) {
            targetRotation.z = 0.1;
        } else if (this.keys.right || this.touchControls.right) {
            targetRotation.z = -0.1;
        } else {
            targetRotation.z = 0;
        }
        
        // Smoothly interpolate current rotation to target rotation
        this.car.rotation.z += (targetRotation.z - this.car.rotation.z) * 0.1;
    }
    
    updateCamera() {
        // Position camera to follow the car
        this.camera.position.x = this.car.position.x * 0.5;
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    animate() {
        if (!this.isGameRunning) return;
        
        requestAnimationFrame(this.animate.bind(this));
        
        this.update();
        this.render();
    }

    gameOver() {
        this.isGameOver = true;
        this.isPaused = false;
        
        // Save game stats with current badges
        this.historyManager.saveGameStats(
            this.score,
            this.distance / 1000, // Convert to kilometers
            this.elapsedTime,
            this.currentLevel
        );

        // Show game over screen
        this.showGameOverScreen();
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updateDayNightCycle() {
        const time = this.clock.getElapsedTime();
        const dayDuration = 60; // 60 seconds for a full day-night cycle
        const phase = (time % dayDuration) / dayDuration;
        const isNight = phase >= 0.75 || phase < 0.25;

        if (phase < 0.25) {
            // Morning
            this.scene.background.set(0x87CEEB); // Bright blue
            this.ambientLight.intensity = 0.6;
        } else if (phase < 0.5) {
            // Midday
            this.scene.background.set(0xADD8E6); // Light blue
            this.ambientLight.intensity = 0.8;
        } else if (phase < 0.75) {
            // Evening
            this.scene.background.set(0xFFD700); // Golden
            this.ambientLight.intensity = 0.4;
        } else {
            // Night
            this.scene.background.set(0x191970); // Midnight blue
            this.ambientLight.intensity = 0.2;
        }

        // Update advertisement lighting based on time of day
        this.scene.traverse((object) => {
            if (object.userData && object.userData.isNightLight) {
                if (isNight) {
                    // Increase emissive intensity at night for glow effect
                    object.material.emissiveIntensity = 0.8;
                } else {
                    // Reset to original intensity during day
                    object.material.emissiveIntensity = object.userData.originalEmissiveIntensity;
                }
                object.material.needsUpdate = true;
            }
        });
    }

    createUfo() {
        const ufoGeometry = new THREE.CylinderGeometry(1, 1.5, 0.5, 8);
        const ufoMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x888888, 
            metalness: 0.8, 
            roughness: 0.3
        });
        const ufo = new THREE.Mesh(ufoGeometry, ufoMaterial);
        ufo.rotation.x = Math.PI / 2;
        ufo.position.set((Math.random() - 0.5) * this.roadWidth, 5, -this.roadLength / 2);
        this.scene.add(ufo);
        this.ufos.push(ufo);
    }

    updateUfos(delta) {
        for (let i = this.ufos.length - 1; i >= 0; i--) {
            const ufo = this.ufos[i];
            ufo.position.z += this.scrollSpeed * delta * 30; // Move across the screen

            if (Math.random() < 0.01) { // Random chance to drop an obstacle
                this.dropObstacle(ufo.position.x, ufo.position.z);
            }

            if (ufo.position.z > this.roadLength / 2) { // Remove UFO if it goes off screen
                this.scene.remove(ufo);
                this.ufos.splice(i, 1);
            }
        }

        if (this.lastUfoSpawn > this.ufoSpawnInterval) {
            this.createUfo();
            this.lastUfoSpawn = 0;
        }
        this.lastUfoSpawn += delta;
    }

    dropObstacle(x, z) {
        const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
        const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
        const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
        obstacle.position.set(x, 0.5, z);
        this.scene.add(obstacle);
        this.obstacleManager.addObstacle(obstacle);
    }

    addCowsToSegment(segment, length) {
        const cowSpacing = 30; // Spacing between cows
        for (let i = -length / 2; i < length / 2; i += cowSpacing) {
            // Random offset for cow position
            const offset = Math.random() * 2 - 1;

            // Left side cow
            const leftCow = this.createCow();
            leftCow.position.set(-(this.roadWidth / 2 + 5 + offset), 0, i + offset);
            segment.add(leftCow);

            // Right side cow
            const rightCow = this.createCow();
            rightCow.position.set(this.roadWidth / 2 + 5 + offset, 0, i + offset);
            segment.add(rightCow);
        }
    }

    createCow() {
        const cowGeometry = new THREE.BoxGeometry(1, 0.5, 2);
        const cowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF, // White cow
            roughness: 0.8
        });
        const cow = new THREE.Mesh(cowGeometry, cowMaterial);
        cow.position.y = 0.25; // Position to stand on the ground
        return cow;
    }

    createDog() {
        const dogGeometry = new THREE.BoxGeometry(0.5, 0.5, 1);
        const dogMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, // Brown color for dogs
            roughness: 0.8
        });
        const dog = new THREE.Mesh(dogGeometry, dogMaterial);
        dog.position.y = 0.25; // Position to stand on the ground
        return dog;
    }

    createCat() {
        const catGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.8);
        const catMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080, // Gray color for cats
            roughness: 0.8
        });
        const cat = new THREE.Mesh(catGeometry, catMaterial);
        cat.position.y = 0.2; // Position to stand on the ground
        return cat;
    }

    createAircraft() {
        const isAirplane = Math.random() < 0.5;
        const aircraft = new THREE.Group();
        
        if (isAirplane) {
            // Create airplane body
            const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 6, 8);
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                metalness: 0.7,
                roughness: 0.3
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.rotation.z = Math.PI / 2;
            aircraft.add(body);
            
            // Wings
            const wingGeometry = new THREE.BoxGeometry(8, 0.2, 2);
            const wingMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                metalness: 0.7,
                roughness: 0.3
            });
            const wings = new THREE.Mesh(wingGeometry, wingMaterial);
            wings.position.y = 0.5;
            aircraft.add(wings);
            
            // Tail
            const tailGeometry = new THREE.BoxGeometry(2, 1.5, 0.2);
            const tail = new THREE.Mesh(tailGeometry, wingMaterial);
            tail.position.set(0, 1, -2.5);
            aircraft.add(tail);
            
            // Navigation lights
            const navLightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const redLight = new THREE.MeshStandardMaterial({
                color: 0xFF0000,
                emissive: 0xFF0000,
                emissiveIntensity: 1
            });
            const greenLight = new THREE.MeshStandardMaterial({
                color: 0x00FF00,
                emissive: 0x00FF00,
                emissiveIntensity: 1
            });
            
            const leftLight = new THREE.Mesh(navLightGeometry, redLight);
            leftLight.position.set(-4, 0.5, 0);
            aircraft.add(leftLight);
            
            const rightLight = new THREE.Mesh(navLightGeometry, greenLight);
            rightLight.position.set(4, 0.5, 0);
            aircraft.add(rightLight);
            
            this.airplanes.push(aircraft);
        } else {
            // Create helicopter body
            const bodyGeometry = new THREE.SphereGeometry(1, 8, 8);
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: 0xFF0000,
                metalness: 0.5,
                roughness: 0.5
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            aircraft.add(body);
            
            // Main rotor
            const rotorGeometry = new THREE.BoxGeometry(8, 0.1, 0.4);
            const rotorMaterial = new THREE.MeshStandardMaterial({
                color: 0x333333,
                metalness: 0.8,
                roughness: 0.2
            });
            const mainRotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
            mainRotor.position.y = 1;
            aircraft.add(mainRotor);
            
            // Tail boom
            const boomGeometry = new THREE.BoxGeometry(0.3, 0.3, 4);
            const boom = new THREE.Mesh(boomGeometry, bodyMaterial);
            boom.position.z = -2;
            aircraft.add(boom);
            
            // Tail rotor
            const tailRotorGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.2);
            const tailRotor = new THREE.Mesh(tailRotorGeometry, rotorMaterial);
            tailRotor.position.set(0, 0, -4);
            tailRotor.rotation.y = Math.PI / 2;
            aircraft.add(tailRotor);
            
            // Add spotlight for search effect
            const spotlight = new THREE.SpotLight(0xFFFFFF, 2);
            spotlight.angle = Math.PI / 6;
            spotlight.penumbra = 0.3;
            spotlight.decay = 1;
            spotlight.distance = 30;
            spotlight.target.position.set(0, -10, 0);
            aircraft.add(spotlight);
            aircraft.add(spotlight.target);
            
            // Store rotor references for animation
            aircraft.userData.mainRotor = mainRotor;
            aircraft.userData.tailRotor = tailRotor;
            
            this.helicopters.push(aircraft);
        }
        
        // Position the aircraft
        aircraft.position.set(
            (Math.random() - 0.5) * this.roadWidth * 2,
            isAirplane ? 25 + Math.random() * 5 : 20 + Math.random() * 2,
            -this.roadLength / 2
        );
        
        this.scene.add(aircraft);
    }

    updateAircraft(delta) {
        const speedMultiplier = 40;
        const rotorSpeed = 10;

        // Update airplanes
        for (let i = this.airplanes.length - 1; i >= 0; i--) {
            const airplane = this.airplanes[i];
            airplane.position.x += this.scrollSpeed * delta * speedMultiplier;
            airplane.position.y += Math.sin(Date.now() * 0.001) * 0.02; // Gentle altitude variation

            if (airplane.position.x > this.roadWidth) {
                this.scene.remove(airplane);
                this.airplanes.splice(i, 1);
            }
        }

        // Update helicopters
        for (let i = this.helicopters.length - 1; i >= 0; i--) {
            const helicopter = this.helicopters[i];
            helicopter.position.x += this.scrollSpeed * delta * (speedMultiplier / 2);
            helicopter.position.y += Math.sin(Date.now() * 0.001) * 0.05;

            // Rotate the rotors
            if (helicopter.userData.mainRotor) {
                helicopter.userData.mainRotor.rotation.y += rotorSpeed * delta;
            }
            if (helicopter.userData.tailRotor) {
                helicopter.userData.tailRotor.rotation.x += rotorSpeed * delta;
            }

            if (helicopter.position.x > this.roadWidth) {
                this.scene.remove(helicopter);
                this.helicopters.splice(i, 1);
            }
        }

        if (this.lastAircraftSpawn > this.aircraftSpawnInterval) {
            this.createAircraft();
            this.lastAircraftSpawn = 0;
        }
        this.lastAircraftSpawn += delta;
    }

    createAirports() {
        // Create two airports on opposite sides of the road
        this.createAirport(-30, -200);  // Left side airport
        this.createAirport(30, -500);   // Right side airport
    }
    
    createAirport(x, z) {
        const airport = new THREE.Group();
        
        // Main terminal building
        const terminalGeometry = new THREE.BoxGeometry(10, 5, 15);
        const terminalMaterial = new THREE.MeshStandardMaterial({
            color: 0xA9A9A9,
            roughness: 0.5,
            metalness: 0.3
        });
        const terminal = new THREE.Mesh(terminalGeometry, terminalMaterial);
        terminal.position.y = 2.5;
        terminal.castShadow = true;
        terminal.receiveShadow = true;
        airport.add(terminal);
        
        // Windows for terminal
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x87CEFA,
            emissive: 0x87CEFA,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.7
        });
        
        // Add windows to the terminal
        for (let i = -4; i <= 4; i += 2) {
            for (let j = 0; j < 2; j++) {
                const windowGeometry = new THREE.PlaneGeometry(1, 0.8);
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(i, j + 2, 7.51);
                terminal.add(window);
                
                const windowBack = new THREE.Mesh(windowGeometry, windowMaterial);
                windowBack.position.set(i, j + 2, -7.51);
                terminal.add(windowBack);
            }
        }
        
        // Control tower
        const towerBaseGeometry = new THREE.CylinderGeometry(1.2, 1.5, 8, 8);
        const towerBaseMaterial = new THREE.MeshStandardMaterial({
            color: 0xC0C0C0,
            roughness: 0.5,
            metalness: 0.5
        });
        const towerBase = new THREE.Mesh(towerBaseGeometry, towerBaseMaterial);
        towerBase.position.set(4, 4, 0);
        airport.add(towerBase);
        
        // Tower cabin
        const cabinGeometry = new THREE.CylinderGeometry(2, 2, 2, 8);
        const cabinMaterial = new THREE.MeshStandardMaterial({
            color: 0x87CEFA,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.8
        });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(4, 9, 0);
        airport.add(cabin);
        
        // Runway
        const runwayGeometry = new THREE.PlaneGeometry(6, 30);
        const runwayMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.9,
            metalness: 0.1
        });
        const runway = new THREE.Mesh(runwayGeometry, runwayMaterial);
        runway.rotation.x = -Math.PI / 2;
        runway.position.set(0, 0.01, 15);
        airport.add(runway);
        this.runways.push({ position: new THREE.Vector3(x, 0.01, z + 15), direction: x < 0 ? 1 : -1 });
        
        // Runway markings
        const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        
        // Center line
        const centerLineGeometry = new THREE.PlaneGeometry(0.3, 30);
        const centerLine = new THREE.Mesh(centerLineGeometry, markingMaterial);
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.y = 0.02;
        runway.add(centerLine);
        
        // Runway lights
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.5
        });
        
        for (let i = -13; i <= 13; i += 2) {
            // Left side light
            const leftLight = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 8, 8),
                lightMaterial
            );
            leftLight.position.set(-2.5, 0.2, i);
            runway.add(leftLight);
            
            // Right side light
            const rightLight = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 8, 8),
                lightMaterial
            );
            rightLight.position.set(2.5, 0.2, i);
            runway.add(rightLight);
            
            // Add runway lights to array for flashing effect
            this.runwayLights.push(leftLight, rightLight);
        }
        
        // Position the airport
        airport.position.set(x, 0, z);
        this.scene.add(airport);
        this.airports.push(airport);
        
        // Schedule initial takeoffs and landings
        this.scheduleRandomFlight(x, z, Math.random() < 0.5);
    }
    
    scheduleRandomFlight(airportX, airportZ, isTakeoff) {
        const delay = 5 + Math.random() * 15; // Random delay between 5-20 seconds
        setTimeout(() => {
            if (isTakeoff) {
                this.createTakeoffPlane(airportX, airportZ);
            } else {
                this.createLandingPlane(airportX, airportZ);
            }
            // Schedule next flight (alternate between takeoff and landing)
            this.scheduleRandomFlight(airportX, airportZ, !isTakeoff);
        }, delay * 1000);
    }
    
    createTakeoffPlane(airportX, airportZ) {
        const direction = airportX < 0 ? 1 : -1; // Direction based on airport position
        
        // Create airplane model
        const airplane = new THREE.Group();
        
        // Airplane body
        const bodyGeometry = new THREE.BoxGeometry(1, 0.8, 4);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF, // White airplane
            roughness: 0.4,
            metalness: 0.6
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        airplane.add(body);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(6, 0.2, 1.5);
        const wingMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.4,
            metalness: 0.6
        });
        const wing = new THREE.Mesh(wingGeometry, wingMaterial);
        wing.position.y = 0.2;
        airplane.add(wing);
        
        // Tail
        const tailGeometry = new THREE.BoxGeometry(1, 1, 0.5);
        const tailMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.4,
            metalness: 0.6
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.4, -1.8);
        airplane.add(tail);
        
        // Position at start of runway
        airplane.position.set(airportX, 0.5, airportZ + 5);
        airplane.rotation.y = (direction > 0) ? Math.PI : 0;
        
        // Add to scene and takeoff array
        this.scene.add(airplane);
        this.takingOffPlanes.push({
            model: airplane,
            phase: 'ground',  // Phases: ground -> climb -> cruise
            speed: 0.1,
            direction: direction,
            originX: airportX,
            originZ: airportZ
        });
    }
    
    createLandingPlane(airportX, airportZ) {
        const direction = airportX < 0 ? 1 : -1; // Direction based on airport position
        
        // Create airplane model (same as takeoff plane)
        const airplane = new THREE.Group();
        
        // Airplane body
        const bodyGeometry = new THREE.BoxGeometry(1, 0.8, 4);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF, // White airplane
            roughness: 0.4,
            metalness: 0.6
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        airplane.add(body);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(6, 0.2, 1.5);
        const wingMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.4,
            metalness: 0.6
        });
        const wing = new THREE.Mesh(wingGeometry, wingMaterial);
        wing.position.y = 0.2;
        airplane.add(wing);
        
        // Tail
        const tailGeometry = new THREE.BoxGeometry(1, 1, 0.5);
        const tailMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.4,
            metalness: 0.6
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.4, -1.8);
        airplane.add(tail);
        
        // Position in the air
        const startDistance = 60; // Start distance from runway
        airplane.position.set(
            airportX + (direction * -10), // Offset from airport centerline
            15, // Start altitude
            airportZ + (direction * startDistance)
        );
        airplane.rotation.y = (direction < 0) ? Math.PI : 0;
        
        // Add to scene and landing array
        this.scene.add(airplane);
        this.landingPlanes.push({
            model: airplane,
            phase: 'approach',  // Phases: approach -> touchdown -> rollout
            speed: 0.5,
            direction: direction,
            targetX: airportX,
            targetZ: airportZ
        });
    }
    
    updateAirportFlights(delta) {
        // Update takeoff planes
        for (let i = this.takingOffPlanes.length - 1; i >= 0; i--) {
            const plane = this.takingOffPlanes[i];
            const model = plane.model;
            
            switch (plane.phase) {
                case 'ground':
                    // Accelerate down the runway
                    plane.speed += delta * 0.05;
                    model.position.z += plane.direction * plane.speed;
                    
                    // If reached takeoff speed
                    if (plane.speed > 0.5) {
                        plane.phase = 'climb';
                    }
                    break;
                    
                case 'climb':
                    // Continue forward movement
                    model.position.z += plane.direction * plane.speed;
                    
                    // Climb
                    model.position.y += delta * 2;
                    model.rotation.x = -Math.PI * 0.05; // Nose up
                    
                    // If reached cruising altitude
                    if (model.position.y > 20) {
                        plane.phase = 'cruise';
                        model.rotation.x = 0; // Level off
                    }
                    break;
                    
                case 'cruise':
                    // Fly straight at cruising altitude
                    model.position.z += plane.direction * plane.speed;
                    
                    // If plane has gone far enough, remove it
                    if (Math.abs(model.position.z - plane.originZ) > 100) {
                        this.scene.remove(model);
                        this.takingOffPlanes.splice(i, 1);
                    }
                    break;
            }
        }
        
        // Update landing planes
        for (let i = this.landingPlanes.length - 1; i >= 0; i--) {
            const plane = this.landingPlanes[i];
            const model = plane.model;
            
            switch (plane.phase) {
                case 'approach':
                    // Move towards runway
                    model.position.z -= plane.direction * plane.speed;
                    
                    // Descent calculations
                    const distanceToRunway = Math.abs(model.position.z - plane.targetZ);
                    const targetAltitude = Math.max(1, distanceToRunway * 0.25);
                    const altitudeDiff = model.position.y - targetAltitude;
                    
                    // Smooth descent
                    model.position.y -= altitudeDiff * delta;
                    
                    // Align with runway
                    const xDiff = model.position.x - plane.targetX;
                    model.position.x -= xDiff * delta;
                    
                    // If close to touchdown
                    if (distanceToRunway < 5 && model.position.y < 1.5) {
                        plane.phase = 'touchdown';
                    }
                    break;
                    
                case 'touchdown':
                    // Land on runway
                    model.position.y = 0.5;
                    model.rotation.x = 0;
                    model.position.z -= plane.direction * plane.speed;
                    
                    // Slow down
                    plane.speed = Math.max(0.1, plane.speed - delta * 0.2);
                    
                    // Move to rollout phase once slowed
                    if (plane.speed <= 0.3) {
                        plane.phase = 'rollout';
                    }
                    break;
                    
                case 'rollout':
                    // Continue slowing down
                    plane.speed = Math.max(0.05, plane.speed - delta * 0.05);
                    model.position.z -= plane.direction * plane.speed;
                    
                    // If reached end of runway or stopped
                    if (Math.abs(model.position.z - plane.targetZ) < 2 || plane.speed <= 0.05) {
                        this.scene.remove(model);
                        this.landingPlanes.splice(i, 1);
                    }
                    break;
            }
        }
        
        // Flash runway lights
        if (Math.random() < 0.05) {
            for (const light of this.runwayLights) {
                light.material.emissiveIntensity = Math.random() < 0.5 ? 0.1 : 0.5;
            }
        }
    }

    changeSeason() {
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        const currentIndex = seasons.indexOf(this.currentSeason);
        const nextIndex = (currentIndex + 1) % seasons.length;
        this.currentSeason = seasons[nextIndex];
        this.landscapeManager.changeSeason(this.currentSeason, this.elapsedTime, this.distance);
    }

    shoot() {
        if (this.isPaused || this.isGameOver || this.countdownActive) return;
        
        const now = Date.now() / 1000; // Convert to seconds
        if (now - this.lastShootTime < this.shootCooldown) return;
        this.lastShootTime = now;

        // Create bullet with enhanced visual effects
        const bulletGroup = new THREE.Group();

        // Main bullet (red core)
        const bulletGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const bulletMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF0000, // Red color
            emissive: 0xFF0000,
            emissiveIntensity: 1.0,
            metalness: 0.5,
            roughness: 0.2
        });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        bulletGroup.add(bullet);

        // Outer glow effect (larger, semi-transparent sphere)
        const glowGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const glowMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF3333,
            emissive: 0xFF0000,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.6,
            metalness: 0,
            roughness: 1.0
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        bulletGroup.add(glow);

        // Trail effect (elongated cylinder)
        const trailGeometry = new THREE.CylinderGeometry(0.1, 0.2, 0.8, 16);
        const trailMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF6666,
            emissive: 0xFF3333,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.4,
            metalness: 0,
            roughness: 1.0
        });
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        trail.rotation.x = Math.PI / 2;
        trail.position.z = 0.4;
        bulletGroup.add(trail);
        
        // Position bullet group at car's front
        bulletGroup.position.copy(this.car.position);
        bulletGroup.position.z -= 2; // Slightly in front of the car
        bulletGroup.position.y += 0.5; // Adjust height
        
        this.scene.add(bulletGroup);
        this.bullets.push({
            mesh: bulletGroup,
            velocity: new THREE.Vector3(0, 0, -this.bulletSpeed),
            created: Date.now()
        });
        
        // Play shoot sound
        if (this.shootSound) {
            this.shootSound.currentTime = 0;
            this.shootSound.play().catch(error => console.log("Audio play failed:", error));
        }
    }

    updateBullets(delta) {
        const now = Date.now();
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Update bullet position
            bullet.mesh.position.add(bullet.velocity.clone().multiplyScalar(delta * 60));
            
            // Rotate glow and trail effects
            bullet.mesh.rotation.z += delta * 10;
            
            // Pulse the glow effect
            const age = (now - bullet.created) / 1000;
            const pulseIntensity = 0.8 + Math.sin(age * 10) * 0.2; 
            bullet.mesh.children[1].material.emissiveIntensity = pulseIntensity;
            
            // Update trail opacity based on velocity
            const trail = bullet.mesh.children[2];
            trail.material.opacity = 0.4 * (1 + Math.sin(age * 15));
            
            // Check if bullet is too far
            if (bullet.mesh.position.z < -this.roadLength) {
                this.scene.remove(bullet.mesh);
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Create bullet collision box
            const bulletBox = new THREE.Box3().setFromObject(bullet.mesh.children[0]); // Use core bullet for collision
            let hasCollided = false;

            // Check for collisions with static obstacles
            for (const obstacle of this.obstacleManager.obstacles) {
                if (!obstacle.visible || hasCollided) continue;
                
                const obstacleBox = new THREE.Box3().setFromObject(obstacle);
                if (bulletBox.intersectsBox(obstacleBox)) {
                    // Create impact effect
                    this.createImpactEffect(bullet.mesh.position);
                    
                    // Remove bullet
                    this.scene.remove(bullet.mesh);
                    this.bullets.splice(i, 1);
                    
                    // Remove obstacle
                    obstacle.visible = false;
                    this.obstacleManager.obstacles = this.obstacleManager.obstacles.filter(o => o !== obstacle);
                    this.obstacleManager.obstaclePool.push(obstacle);
                    
                    // Add score and update combat stats
                    this.score += 20;
                    this.updateScoreDisplay();
                    this.badgeManager.updateCombatStats();
                    hasCollided = true;
                    break;
                }
            }

            // Check for collisions with moving obstacles
            if (!hasCollided && this.movingObstacleManager) {
                for (const obstacle of this.movingObstacleManager.obstacles) {
                    if (!obstacle.visible || hasCollided) continue;

                    if (obstacle.userData.type === 'tank') {
                        // For tanks, check collision with body, turret, and cannon
                        const tankBody = obstacle.children[0];
                        const tankTurret = obstacle.children[1];
                        const tankCannon = obstacle.children[2];

                        const bodyBox = new THREE.Box3().setFromObject(tankBody);
                        const turretBox = new THREE.Box3().setFromObject(tankTurret);
                        const cannonBox = new THREE.Box3().setFromObject(tankCannon);

                        if (bulletBox.intersectsBox(bodyBox) || 
                            bulletBox.intersectsBox(turretBox) || 
                            bulletBox.intersectsBox(cannonBox)) {
                            // Create impact effect
                            this.createImpactEffect(bullet.mesh.position);
                            
                            // Remove bullet
                            this.scene.remove(bullet.mesh);
                            this.bullets.splice(i, 1);
                            
                            // Remove obstacle
                            obstacle.visible = false;
                            this.movingObstacleManager.obstacles = this.movingObstacleManager.obstacles.filter(o => o !== obstacle);
                            this.movingObstacleManager.obstaclePool[obstacle.userData.type].push(obstacle);
                            
                            // Add score and update combat stats
                            this.score += 50;
                            this.updateScoreDisplay();
                            this.badgeManager.updateCombatStats('tank');
                            hasCollided = true;
                            break;
                        }
                    } else {
                        // For other obstacles, check collision with entire object
                        const obstacleBox = new THREE.Box3().setFromObject(obstacle);
                        if (bulletBox.intersectsBox(obstacleBox)) {
                            // Create impact effect
                            this.createImpactEffect(bullet.mesh.position);
                            
                            // Remove bullet
                            this.scene.remove(bullet.mesh);
                            this.bullets.splice(i, 1);
                            
                            // Remove obstacle
                            obstacle.visible = false;
                            this.movingObstacleManager.obstacles = this.movingObstacleManager.obstacles.filter(o => o !== obstacle);
                            this.movingObstacleManager.obstaclePool[obstacle.userData.type].push(obstacle);
                            
                            // Add score and update combat stats
                            this.score += 30;
                            this.updateScoreDisplay();
                            this.badgeManager.updateCombatStats();
                            hasCollided = true;
                            break;
                        }
                    }
                }
            }
        }
    }

    createImpactEffect(position) {
        // Create impact flash
        const impactGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const impactMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF0000,
            emissive: 0xFF5555,
            emissiveIntensity: 1.0,
            transparent: true,
            opacity: 0.8
        });
        const impact = new THREE.Mesh(impactGeometry, impactMaterial);
        impact.position.copy(position);
        this.scene.add(impact);

        // Animate and remove the impact effect
        const startTime = Date.now();
        const duration = 300; // milliseconds
        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const scale = 1 + (elapsed / duration);
                impact.scale.set(scale, scale, scale);
                impact.material.opacity = 0.8 * (1 - elapsed / duration);
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(impact);
            }
        };
        animate();
    }

    checkMovingObstacleCollisions() {
        if (this.isInvulnerable) return;

        const playerBox = new THREE.Box3().setFromObject(this.car);
        const collision = this.movingObstacleManager.checkCollision(playerBox);

        if (collision.collided) {
            this.handleCollision(collision);
        }
    }

    handleCollision(collision) {
        if (this.isInvulnerable) return;
        
        // Update collision count
        this.gameStats.collisions++;
        
        // Apply damage
        this.health = Math.max(0, this.health - collision.damage);
        this.updateHealthDisplay();
        
        // Make invulnerable temporarily
        this.isInvulnerable = true;
        this.lastHitTime = Date.now() / 1000;
        
        // Check for game over
        if (this.health <= 0) {
            this.gameOver();
        }
    }

    showCurrentGame() {
        if (this.currentStatsDiv) {
            this.currentStatsDiv.style.display = 'block';
        }
    }

    showSeasonDisplay() {
        if (this.seasonDiv) {
            this.seasonDiv.style.display = 'block';
        }
    }

    createVirtualControls() {
        // Check if the device is a mobile device (iOS, Android, or iPad)
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                             (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // Only create virtual controls for mobile devices
        if (!isMobileDevice) return;

        // Create virtual controls container
        this.virtualControls = document.createElement('div');
        this.virtualControls.style.position = 'fixed';
        this.virtualControls.style.bottom = '20px';
        this.virtualControls.style.left = '20px';
        this.virtualControls.style.zIndex = '1000';
        this.virtualControls.style.display = 'none'; // Initially hidden
        document.body.appendChild(this.virtualControls);

        // Create left button
        const leftButton = document.createElement('button');
        leftButton.innerHTML = '←';
        leftButton.style.width = '60px';
        leftButton.style.height = '60px';
        leftButton.style.borderRadius = '50%';
        leftButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        leftButton.style.color = 'white';
        leftButton.style.border = 'none';
        leftButton.style.fontSize = '24px';
        leftButton.style.marginRight = '20px';
        leftButton.style.touchAction = 'none';
        leftButton.addEventListener('touchstart', () => {
            this.touchControls.left = true;
            leftButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        });
        leftButton.addEventListener('touchend', () => {
            this.touchControls.left = false;
            leftButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        });
        this.virtualControls.appendChild(leftButton);

        // Create right button
        const rightButton = document.createElement('button');
        rightButton.innerHTML = '→';
        rightButton.style.width = '60px';
        rightButton.style.height = '60px';
        rightButton.style.borderRadius = '50%';
        rightButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        rightButton.style.color = 'white';
        rightButton.style.border = 'none';
        rightButton.style.fontSize = '24px';
        rightButton.style.touchAction = 'none';
        rightButton.addEventListener('touchstart', () => {
            this.touchControls.right = true;
            rightButton.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        });
        rightButton.addEventListener('touchend', () => {
            this.touchControls.right = false;
            rightButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        });
        this.virtualControls.appendChild(rightButton);

        // Create shoot button
        const shootButton = document.createElement('button');
        shootButton.setAttribute('data-control', 'shoot');
        shootButton.innerHTML = '🎯';
        shootButton.style.width = '60px';
        shootButton.style.height = '60px';
        shootButton.style.borderRadius = '50%';
        shootButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        shootButton.style.color = 'white';
        shootButton.style.border = 'none';
        shootButton.style.fontSize = '24px';
        shootButton.style.position = 'fixed';
        shootButton.style.bottom = '20px';
        shootButton.style.right = '20px';
        shootButton.style.zIndex = '1000';
        shootButton.style.display = 'none'; // Initially hidden
        shootButton.style.touchAction = 'none';
        shootButton.addEventListener('touchstart', () => {
            this.touchControls.shoot = true;
            shootButton.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
            this.shoot();
        });
        shootButton.addEventListener('touchend', () => {
            this.touchControls.shoot = false;
            shootButton.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        });
        document.body.appendChild(shootButton);
    }

    showVirtualControls() {
        if (this.virtualControls) {
            this.virtualControls.style.display = 'block';
            // Also show the shoot button
            const shootButton = document.querySelector('button[data-control="shoot"]');
            if (shootButton) {
                shootButton.style.display = 'block';
            }
        }
    }

    hideVirtualControls() {
        if (this.virtualControls) {
            this.virtualControls.style.display = 'none';
        }
    }
} 