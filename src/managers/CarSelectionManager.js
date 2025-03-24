import * as THREE from 'three';

export class CarSelectionManager {
    constructor() {
        this.cars = [
            {
                id: 'sport',
                name: 'Sport Car',
                model: 'GT-R 2024',
                price: 150000,
                specs: {
                    maxSpeed: 320,
                    acceleration: 95,
                    handling: 90,
                    braking: 85
                },
                color: '#FF0000',
                description: 'High-performance sports car with exceptional speed and handling.',
                unlockRequirement: 0 // Available from start
            },
            {
                id: 'muscle',
                name: 'Muscle Car',
                model: 'Thunder GT',
                price: 85000,
                specs: {
                    maxSpeed: 280,
                    acceleration: 80,
                    handling: 75,
                    braking: 70
                },
                color: '#0000FF',
                description: 'Classic American muscle with raw power and attitude.',
                unlockRequirement: 5000
            },
            {
                id: 'luxury',
                name: 'Luxury Sedan',
                model: 'S-Class Elite',
                price: 120000,
                specs: {
                    maxSpeed: 250,
                    acceleration: 75,
                    handling: 85,
                    braking: 90
                },
                color: '#C0C0C0',
                description: 'Premium luxury sedan with perfect balance of comfort and performance.',
                unlockRequirement: 3000
            },
            {
                id: 'electric',
                name: 'Electric Car',
                model: 'Tesla X',
                price: 180000,
                specs: {
                    maxSpeed: 260,
                    acceleration: 98,
                    handling: 88,
                    braking: 92
                },
                color: '#FFFFFF',
                description: 'High-tech electric vehicle with instant torque and zero emissions.',
                unlockRequirement: 7000
            },
            {
                id: 'offroad',
                name: 'Off-Road SUV',
                model: 'Ranger X-Treme',
                price: 95000,
                specs: {
                    maxSpeed: 200,
                    acceleration: 70,
                    handling: 95,
                    braking: 85
                },
                color: '#2F4F4F',
                description: 'Rugged off-road vehicle built for any terrain.',
                unlockRequirement: 4000
            },
            {
                id: 'supercar',
                name: 'Super Car',
                model: 'Velocity X',
                price: 250000,
                specs: {
                    maxSpeed: 350,
                    acceleration: 100,
                    handling: 95,
                    braking: 90
                },
                color: '#FFD700',
                description: 'Ultimate performance machine for the most demanding drivers.',
                unlockRequirement: 10000
            }
        ];

        this.selectedCar = null;
        this.carSelectionDiv = null;
        this.previewRenderers = [];
        this.previewScenes = [];
        this.previewCameras = [];
        this.createCarSelectionUI();
    }

    createCarPreview(car) {
        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(300, 200);
        renderer.setClearColor(0x000000, 0);
        
        // Create scene
        const scene = new THREE.Scene();
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(45, 300 / 200, 0.1, 1000);
        camera.position.set(3, 2, 5);
        camera.lookAt(0, 0, 0);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Create car model based on type
        const carModel = this.createCarModel(car);
        scene.add(carModel);

        // Store references
        this.previewRenderers.push(renderer);
        this.previewScenes.push({ scene, car: carModel });
        this.previewCameras.push(camera);

        // Start animation
        this.animatePreview(this.previewRenderers.length - 1);

        return renderer.domElement;
    }

    createCarModel(car) {
        const carGroup = new THREE.Group();

        switch(car.id) {
            case 'sport':
                // Sport car - sleek and low profile
                const sportBody = new THREE.Group();
                
                // Main body
                const mainBody = new THREE.Mesh(
                    new THREE.BoxGeometry(2, 0.5, 4),
                    new THREE.MeshStandardMaterial({ 
                        color: car.color,
                        metalness: 0.7,
                        roughness: 0.3
                    })
                );
                mainBody.position.y = 0.5;
                sportBody.add(mainBody);

                // Hood and roof (curved design)
                const hood = new THREE.Mesh(
                    new THREE.BoxGeometry(1.8, 0.2, 2),
                    new THREE.MeshStandardMaterial({ 
                        color: car.color,
                        metalness: 0.7,
                        roughness: 0.3
                    })
                );
                hood.position.set(0, 0.6, 0.5);
                hood.rotation.x = -0.1;
                sportBody.add(hood);

                // Windshield
                const windshield = new THREE.Mesh(
                    new THREE.BoxGeometry(1.6, 0.6, 0.8),
                    new THREE.MeshStandardMaterial({
                        color: 0x111111,
                        metalness: 0.9,
                        roughness: 0.1
                    })
                );
                windshield.position.set(0, 0.8, -0.2);
                windshield.rotation.x = -0.3;
                sportBody.add(windshield);

                carGroup.add(sportBody);
                break;

            case 'luxury':
                // Luxury sedan - elegant and refined
                const luxuryBody = new THREE.Group();
                
                // Main body (longer and elegant)
                const luxuryMain = new THREE.Mesh(
                    new THREE.BoxGeometry(2.1, 0.6, 4.8),
                    new THREE.MeshStandardMaterial({ 
                        color: car.color,
                        metalness: 0.9,
                        roughness: 0.1
                    })
                );
                luxuryMain.position.y = 0.5;
                luxuryBody.add(luxuryMain);

                // Sleek roof with curved design
                const luxuryRoof = new THREE.Mesh(
                    new THREE.BoxGeometry(1.9, 0.5, 3),
                    new THREE.MeshStandardMaterial({ 
                        color: car.color,
                        metalness: 0.9,
                        roughness: 0.1
                    })
                );
                luxuryRoof.position.set(0, 0.9, -0.5);
                luxuryRoof.rotation.x = -0.05;
                luxuryBody.add(luxuryRoof);

                // Premium chrome grille
                const grille = new THREE.Mesh(
                    new THREE.BoxGeometry(1.8, 0.4, 0.1),
                    new THREE.MeshStandardMaterial({ 
                        color: 0xCCCCCC,
                        metalness: 1,
                        roughness: 0.1
                    })
                );
                grille.position.set(0, 0.4, 2.35);
                luxuryBody.add(grille);

                // Chrome trim along the sides
                const leftTrim = new THREE.Mesh(
                    new THREE.BoxGeometry(0.05, 0.1, 4.8),
                    new THREE.MeshStandardMaterial({ 
                        color: 0xCCCCCC,
                        metalness: 1,
                        roughness: 0.1
                    })
                );
                leftTrim.position.set(-1.05, 0.4, 0);
                luxuryBody.add(leftTrim);

                const rightTrim = leftTrim.clone();
                rightTrim.position.x = 1.05;
                luxuryBody.add(rightTrim);

                // Rear lights
                const leftRearLight = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.1, 0.1),
                    new THREE.MeshStandardMaterial({ 
                        color: 0xff0000,
                        emissive: 0xff0000,
                        emissiveIntensity: 0.5
                    })
                );
                leftRearLight.position.set(-0.8, 0.5, -2.35);
                luxuryBody.add(leftRearLight);

                const rightRearLight = leftRearLight.clone();
                rightRearLight.position.x = 0.8;
                luxuryBody.add(rightRearLight);

                carGroup.add(luxuryBody);
                break;

            case 'electric':
                // Electric car - modern and aerodynamic
                const electricBody = new THREE.Group();
                
                // Streamlined lower body
                const electricMain = new THREE.Mesh(
                    new THREE.BoxGeometry(2.2, 0.5, 4.4),
                    new THREE.MeshStandardMaterial({ 
                        color: car.color,
                        metalness: 0.7,
                        roughness: 0.2
                    })
                );
                electricMain.position.y = 0.4;
                electricBody.add(electricMain);

                // Aerodynamic upper body
                const electricUpper = new THREE.Mesh(
                    new THREE.BoxGeometry(2, 0.4, 3.2),
                    new THREE.MeshStandardMaterial({ 
                        color: car.color,
                        metalness: 0.7,
                        roughness: 0.2
                    })
                );
                electricUpper.position.set(0, 0.8, -0.4);
                electricUpper.rotation.x = -0.1;
                electricBody.add(electricUpper);

                // Full glass roof
                const glassRoof = new THREE.Mesh(
                    new THREE.BoxGeometry(1.9, 0.05, 2.8),
                    new THREE.MeshStandardMaterial({ 
                        color: 0x222222,
                        metalness: 0.9,
                        roughness: 0.1,
                        opacity: 0.7,
                        transparent: true
                    })
                );
                glassRoof.position.set(0, 1, -0.4);
                electricBody.add(glassRoof);

                // Front LED strip
                const ledStrip = new THREE.Mesh(
                    new THREE.BoxGeometry(1.8, 0.05, 0.05),
                    new THREE.MeshStandardMaterial({ 
                        color: 0x00ffff,
                        emissive: 0x00ffff,
                        emissiveIntensity: 0.5
                    })
                );
                ledStrip.position.set(0, 0.5, 2.15);
                electricBody.add(ledStrip);

                // Charging port
                const chargingPort = new THREE.Mesh(
                    new THREE.CircleGeometry(0.1, 16),
                    new THREE.MeshStandardMaterial({ 
                        color: 0x333333,
                        metalness: 0.8,
                        roughness: 0.2
                    })
                );
                chargingPort.rotation.y = Math.PI / 2;
                chargingPort.position.set(-1.1, 0.6, -1);
                electricBody.add(chargingPort);

                carGroup.add(electricBody);
                break;

            case 'offroad':
                // Off-road SUV - tall and rugged
                const offroadBody = new THREE.Group();
                
                // Tall main body with angular design
                const offroadMain = new THREE.Mesh(
                    new THREE.BoxGeometry(2.2, 1.4, 4.2),
                    new THREE.MeshStandardMaterial({ 
                        color: car.color,
                        metalness: 0.4,
                        roughness: 0.7
                    })
                );
                offroadMain.position.y = 0.9;
                offroadBody.add(offroadMain);

                // Robust roof rack with cross bars
                const roofRack = new THREE.Group();
                
                // Main rails
                const rackBase = new THREE.Mesh(
                    new THREE.BoxGeometry(1.8, 0.1, 3),
                    new THREE.MeshStandardMaterial({ 
                        color: 0x111111,
                        metalness: 0.5,
                        roughness: 0.5
                    })
                );
                rackBase.position.set(0, 1.7, 0);
                roofRack.add(rackBase);

                // Cross bars
                for (let i = -1; i <= 1; i++) {
                    const crossBar = new THREE.Mesh(
                        new THREE.BoxGeometry(2.2, 0.1, 0.1),
                        new THREE.MeshStandardMaterial({ 
                            color: 0x111111,
                            metalness: 0.5,
                            roughness: 0.5
                        })
                    );
                    crossBar.position.set(0, 1.7, i);
                    roofRack.add(crossBar);
                }
                offroadBody.add(roofRack);

                // Enhanced bull bar with integrated lights
                const bullBarGroup = new THREE.Group();
                
                // Main bull bar
                const bullBar = new THREE.Mesh(
                    new THREE.BoxGeometry(2.1, 0.6, 0.2),
                    new THREE.MeshStandardMaterial({ 
                        color: 0x111111,
                        metalness: 0.5,
                        roughness: 0.5
                    })
                );
                bullBar.position.set(0, 0.6, 2.2);
                bullBarGroup.add(bullBar);

                // Spotlights
                const leftSpot = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16),
                    new THREE.MeshStandardMaterial({ 
                        color: 0xffff00,
                        emissive: 0xffff00,
                        emissiveIntensity: 0.5
                    })
                );
                leftSpot.rotation.z = Math.PI / 2;
                leftSpot.position.set(-0.8, 0.8, 2.2);
                bullBarGroup.add(leftSpot);

                const rightSpot = leftSpot.clone();
                rightSpot.position.x = 0.8;
                bullBarGroup.add(rightSpot);

                offroadBody.add(bullBarGroup);

                // Side steps
                const leftStep = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.1, 2.5),
                    new THREE.MeshStandardMaterial({ 
                        color: 0x111111,
                        metalness: 0.5,
                        roughness: 0.5
                    })
                );
                leftStep.position.set(-1.1, 0.3, 0);
                offroadBody.add(leftStep);

                const rightStep = leftStep.clone();
                rightStep.position.x = 1.1;
                offroadBody.add(rightStep);

                carGroup.add(offroadBody);
                break;

            case 'muscle':
                // Muscle car - bulky and aggressive
                const muscleBody = new THREE.Group();
                
                // Main body (wider)
                const muscleMain = new THREE.Mesh(
                    new THREE.BoxGeometry(2.2, 0.8, 4.2),
                    new THREE.MeshStandardMaterial({ 
                        color: car.color,
                        metalness: 0.6,
                        roughness: 0.4
                    })
                );
                muscleMain.position.y = 0.6;
                muscleBody.add(muscleMain);

                // Hood scoop
                const scoop = new THREE.Mesh(
                    new THREE.BoxGeometry(0.8, 0.2, 1),
                    new THREE.MeshStandardMaterial({ 
                        color: 0x111111,
                        metalness: 0.8,
                        roughness: 0.2
                    })
                );
                scoop.position.set(0, 1.1, 0.8);
                muscleBody.add(scoop);

                // Rear spoiler
                const spoiler = new THREE.Mesh(
                    new THREE.BoxGeometry(2, 0.1, 0.5),
                    new THREE.MeshStandardMaterial({ 
                        color: 0x111111,
                        metalness: 0.8,
                        roughness: 0.2
                    })
                );
                spoiler.position.set(0, 1.2, -1.8);
                muscleBody.add(spoiler);

                carGroup.add(muscleBody);
                break;

            case 'supercar':
                // Supercar - exotic and angular
                const superBody = new THREE.Group();
                
                // Main body (wedge shape)
                const superMain = new THREE.Mesh(
                    new THREE.BoxGeometry(2, 0.4, 4.5),
                    new THREE.MeshStandardMaterial({ 
                        color: car.color,
                        metalness: 0.8,
                        roughness: 0.2
                    })
                );
                superMain.position.y = 0.4;
                superBody.add(superMain);

                // Angular roof
                const roof = new THREE.Mesh(
                    new THREE.BoxGeometry(1.6, 0.3, 2),
                    new THREE.MeshStandardMaterial({ 
                        color: car.color,
                        metalness: 0.8,
                        roughness: 0.2
                    })
                );
                roof.position.set(0, 0.7, -0.5);
                roof.rotation.x = -0.2;
                superBody.add(roof);

                // Side intakes
                const leftIntake = new THREE.Mesh(
                    new THREE.BoxGeometry(0.2, 0.4, 0.8),
                    new THREE.MeshStandardMaterial({ 
                        color: 0x111111,
                        metalness: 0.9,
                        roughness: 0.1
                    })
                );
                leftIntake.position.set(-1, 0.5, -0.5);
                superBody.add(leftIntake);

                const rightIntake = leftIntake.clone();
                rightIntake.position.x = 1;
                superBody.add(rightIntake);

                carGroup.add(superBody);
                break;
        }

        // Add wheels to all cars
        const wheelPositions = [
            [-0.9, 0.4, 1.2],   // Front left
            [0.9, 0.4, 1.2],    // Front right
            [-0.9, 0.4, -1.2],  // Rear left
            [0.9, 0.4, -1.2]    // Rear right
        ];

        // Create detailed wheel with rim
        wheelPositions.forEach(position => {
            const wheelGroup = new THREE.Group();
            
            // Tire
            const tire = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.4, 0.2, 24),
                new THREE.MeshStandardMaterial({ 
                    color: 0x111111,
                    metalness: 0.1,
                    roughness: 0.9
                })
            );

            // Rim
            const rim = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 0.22, 8),
                new THREE.MeshStandardMaterial({ 
                    color: 0xCCCCCC,
                    metalness: 0.9,
                    roughness: 0.1
                })
            );

            // Spokes
            for (let i = 0; i < 5; i++) {
                const spoke = new THREE.Mesh(
                    new THREE.BoxGeometry(0.25, 0.02, 0.02),
                    new THREE.MeshStandardMaterial({ 
                        color: 0xCCCCCC,
                        metalness: 0.9,
                        roughness: 0.1
                    })
                );
                spoke.rotation.z = (i * Math.PI * 2) / 5;
                rim.add(spoke);
            }

            wheelGroup.add(tire);
            wheelGroup.add(rim);
            wheelGroup.rotation.z = Math.PI / 2;
            wheelGroup.position.set(...position);
            carGroup.add(wheelGroup);
        });

        // Add headlights and taillights based on car type
        switch(car.id) {
            case 'sport':
                // Add sleek LED headlights
                const headlights = new THREE.Group();
                [-0.7, 0.7].forEach(x => {
                    const headlight = new THREE.Mesh(
                        new THREE.BoxGeometry(0.3, 0.1, 0.1),
                        new THREE.MeshStandardMaterial({
                            color: 0xFFFFFF,
                            emissive: 0xFFFFFF,
                            emissiveIntensity: 0.5
                        })
                    );
                    headlight.position.set(x, 0.5, 1.95);
                    headlights.add(headlight);
                });
                carGroup.add(headlights);

                // Add LED taillights
                const taillights = new THREE.Group();
                [-0.7, 0.7].forEach(x => {
                    const taillight = new THREE.Mesh(
                        new THREE.BoxGeometry(0.3, 0.1, 0.05),
                        new THREE.MeshStandardMaterial({
                            color: 0xFF0000,
                            emissive: 0xFF0000,
                            emissiveIntensity: 0.5
                        })
                    );
                    taillight.position.set(x, 0.5, -1.95);
                    taillights.add(taillight);
                });
                carGroup.add(taillights);
                break;

            case 'luxury':
                // Add premium LED matrix headlights
                const luxuryHeadlights = new THREE.Group();
                [-0.7, 0.7].forEach(x => {
                    const headlight = new THREE.Mesh(
                        new THREE.BoxGeometry(0.4, 0.15, 0.1),
                        new THREE.MeshStandardMaterial({
                            color: 0xFFFFFF,
                            emissive: 0xFFFFFF,
                            emissiveIntensity: 0.5
                        })
                    );
                    headlight.position.set(x, 0.5, 2.35);
                    luxuryHeadlights.add(headlight);

                    // DRL strip
                    const drl = new THREE.Mesh(
                        new THREE.BoxGeometry(0.3, 0.05, 0.05),
                        new THREE.MeshStandardMaterial({
                            color: 0xFFFFFF,
                            emissive: 0xFFFFFF,
                            emissiveIntensity: 0.3
                        })
                    );
                    drl.position.set(x, 0.7, 2.35);
                    luxuryHeadlights.add(drl);
                });
                carGroup.add(luxuryHeadlights);
                break;

            case 'electric':
                // Add full-width LED light bar
                const lightBar = new THREE.Mesh(
                    new THREE.BoxGeometry(1.8, 0.05, 0.05),
                    new THREE.MeshStandardMaterial({
                        color: 0x00FFFF,
                        emissive: 0x00FFFF,
                        emissiveIntensity: 0.5
                    })
                );
                lightBar.position.set(0, 0.6, 2.15);
                carGroup.add(lightBar);

                // Add rear light strip
                const rearBar = new THREE.Mesh(
                    new THREE.BoxGeometry(1.8, 0.05, 0.05),
                    new THREE.MeshStandardMaterial({
                        color: 0xFF0000,
                        emissive: 0xFF0000,
                        emissiveIntensity: 0.5
                    })
                );
                rearBar.position.set(0, 0.6, -2.15);
                carGroup.add(rearBar);
                break;

            case 'offroad':
                // Add round headlights
                const offroadLights = new THREE.Group();
                [-0.6, 0.6].forEach(x => {
                    const headlight = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
                        new THREE.MeshStandardMaterial({
                            color: 0xFFFFFF,
                            emissive: 0xFFFFFF,
                            emissiveIntensity: 0.5
                        })
                    );
                    headlight.rotation.z = Math.PI / 2;
                    headlight.position.set(x, 1.1, 2.1);
                    offroadLights.add(headlight);
                });
                carGroup.add(offroadLights);

                // Add rectangular taillights
                const offroadTaillights = new THREE.Group();
                [-0.6, 0.6].forEach(x => {
                    const taillight = new THREE.Mesh(
                        new THREE.BoxGeometry(0.2, 0.3, 0.05),
                        new THREE.MeshStandardMaterial({
                            color: 0xFF0000,
                            emissive: 0xFF0000,
                            emissiveIntensity: 0.5
                        })
                    );
                    taillight.position.set(x, 1.1, -2.1);
                    offroadTaillights.add(taillight);
                });
                carGroup.add(offroadTaillights);
                break;

            case 'muscle':
                // Add classic round headlights
                const muscleLights = new THREE.Group();
                [-0.7, 0.7].forEach(x => {
                    const headlight = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16),
                        new THREE.MeshStandardMaterial({
                            color: 0xFFFFFF,
                            emissive: 0xFFFFFF,
                            emissiveIntensity: 0.5
                        })
                    );
                    headlight.rotation.z = Math.PI / 2;
                    headlight.position.set(x, 0.6, 2.1);
                    muscleLights.add(headlight);
                });
                carGroup.add(muscleLights);

                // Add rectangular taillights
                const muscleTaillights = new THREE.Group();
                [-0.7, 0.7].forEach(x => {
                    const taillight = new THREE.Mesh(
                        new THREE.BoxGeometry(0.3, 0.15, 0.05),
                        new THREE.MeshStandardMaterial({
                            color: 0xFF0000,
                            emissive: 0xFF0000,
                            emissiveIntensity: 0.5
                        })
                    );
                    taillight.position.set(x, 0.6, -2.1);
                    muscleTaillights.add(taillight);
                });
                carGroup.add(muscleTaillights);
                break;

            case 'supercar':
                // Add sleek LED strips
                const supercarLights = new THREE.Group();
                [-0.8, 0.8].forEach(x => {
                    const headlight = new THREE.Mesh(
                        new THREE.BoxGeometry(0.4, 0.05, 0.1),
                        new THREE.MeshStandardMaterial({
                            color: 0xFFFFFF,
                            emissive: 0xFFFFFF,
                            emissiveIntensity: 0.5
                        })
                    );
                    headlight.position.set(x, 0.4, 2.2);
                    supercarLights.add(headlight);
                });
                carGroup.add(supercarLights);

                // Add Y-shaped taillights
                const supercarTaillights = new THREE.Group();
                [-0.6, 0.6].forEach(x => {
                    const taillight = new THREE.Mesh(
                        new THREE.BoxGeometry(0.1, 0.4, 0.05),
                        new THREE.MeshStandardMaterial({
                            color: 0xFF0000,
                            emissive: 0xFF0000,
                            emissiveIntensity: 0.5
                        })
                    );
                    taillight.position.set(x, 0.5, -2.2);
                    supercarTaillights.add(taillight);
                });
                carGroup.add(supercarTaillights);
                break;
        }

        return carGroup;
    }

    animatePreview(index) {
        const animate = () => {
            if (!this.previewScenes[index]) return;
            
            const { scene, car } = this.previewScenes[index];
            car.rotation.y += 0.01;
            
            this.previewRenderers[index].render(scene, this.previewCameras[index]);
            requestAnimationFrame(animate);
        };
        animate();
    }

    createCarSelectionUI() {
        // Create main container
        this.carSelectionDiv = document.createElement('div');
        this.carSelectionDiv.style.position = 'fixed';
        this.carSelectionDiv.style.top = '50%';
        this.carSelectionDiv.style.left = '50%';
        this.carSelectionDiv.style.transform = 'translate(-50%, -50%)';
        this.carSelectionDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.carSelectionDiv.style.padding = '30px';
        this.carSelectionDiv.style.borderRadius = '15px';
        this.carSelectionDiv.style.color = 'white';
        this.carSelectionDiv.style.fontFamily = 'Arial, sans-serif';
        this.carSelectionDiv.style.minWidth = '800px';
        this.carSelectionDiv.style.backdropFilter = 'blur(10px)';
        this.carSelectionDiv.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        this.carSelectionDiv.style.display = 'none';
        this.carSelectionDiv.style.zIndex = '1000';

        // Add title
        const title = document.createElement('h1');
        title.textContent = 'Select Your Car';
        title.style.textAlign = 'center';
        title.style.marginBottom = '30px';
        title.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
        title.style.WebkitBackgroundClip = 'text';
        title.style.WebkitTextFillColor = 'transparent';
        title.style.backgroundClip = 'text';
        title.style.textShadow = '0 2px 4px rgba(255, 215, 0, 0.2)';
        title.style.fontSize = '36px';
        title.style.fontWeight = '600';
        title.style.letterSpacing = '1px';
        title.style.textTransform = 'uppercase';
        title.style.fontFamily = "'Segoe UI', Arial, sans-serif";
        this.carSelectionDiv.appendChild(title);

        // Create car grid
        const carGrid = document.createElement('div');
        carGrid.style.display = 'grid';
        carGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        carGrid.style.gap = '20px';
        carGrid.style.marginBottom = '30px';

        this.cars.forEach(car => {
            const carCard = this.createCarCard(car);
            carGrid.appendChild(carCard);
        });

        this.carSelectionDiv.appendChild(carGrid);

        // Add start button
        const startButton = document.createElement('button');
        startButton.textContent = 'Start Game';
        startButton.style.display = 'block';
        startButton.style.margin = '20px auto';
        startButton.style.padding = '15px 40px';
        startButton.style.fontSize = '18px';
        startButton.style.backgroundColor = '#4CAF50';
        startButton.style.color = 'white';
        startButton.style.border = 'none';
        startButton.style.borderRadius = '25px';
        startButton.style.cursor = 'pointer';
        startButton.style.transition = 'background-color 0.3s';
        startButton.onclick = () => this.startGame();
        startButton.onmouseover = () => startButton.style.backgroundColor = '#45a049';
        startButton.onmouseout = () => startButton.style.backgroundColor = '#4CAF50';
        this.carSelectionDiv.appendChild(startButton);

        document.body.appendChild(this.carSelectionDiv);
    }

    createCarCard(car) {
        const card = document.createElement('div');
        card.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        card.style.borderRadius = '10px';
        card.style.padding = '20px';
        card.style.cursor = 'pointer';
        card.style.transition = 'transform 0.3s, background-color 0.3s';
        card.style.border = '2px solid transparent';

        // Create and add 3D car preview
        const previewContainer = document.createElement('div');
        previewContainer.style.width = '300px';
        previewContainer.style.height = '200px';
        previewContainer.style.marginBottom = '15px';
        previewContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        previewContainer.style.borderRadius = '5px';
        previewContainer.style.overflow = 'hidden';
        
        const preview = this.createCarPreview(car);
        previewContainer.appendChild(preview);
        card.appendChild(previewContainer);

        // Car info
        const name = document.createElement('h2');
        name.textContent = car.name;
        name.style.marginBottom = '10px';
        card.appendChild(name);

        const model = document.createElement('p');
        model.textContent = car.model;
        model.style.color = '#aaa';
        model.style.marginBottom = '15px';
        card.appendChild(model);

        // Specs bars
        Object.entries(car.specs).forEach(([spec, value]) => {
            const specContainer = document.createElement('div');
            specContainer.style.marginBottom = '10px';

            const specName = document.createElement('div');
            specName.textContent = spec.charAt(0).toUpperCase() + spec.slice(1);
            specName.style.marginBottom = '5px';
            specContainer.appendChild(specName);

            const specBar = document.createElement('div');
            specBar.style.height = '4px';
            specBar.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            specBar.style.borderRadius = '2px';
            
            const specValue = document.createElement('div');
            // Normalize MaxSpeed to percentage
            const normalizedValue = spec === 'maxSpeed' ? (value / 350 * 100) : value;
            specValue.style.width = `${Math.min(100, normalizedValue)}%`;
            specValue.style.height = '100%';
            specValue.style.backgroundColor = '#FFD700';
            specValue.style.borderRadius = '2px';
            specBar.appendChild(specValue);
            
            // Add value label
            const valueLabel = document.createElement('div');
            valueLabel.textContent = spec === 'maxSpeed' ? `${value} km/h` : `${value}%`;
            valueLabel.style.fontSize = '12px';
            valueLabel.style.color = '#aaa';
            valueLabel.style.marginTop = '2px';
            specContainer.appendChild(specName);
            specContainer.appendChild(specBar);
            specContainer.appendChild(valueLabel);
            
            card.appendChild(specContainer);
        });

        // Price
        const price = document.createElement('div');
        price.textContent = `$${car.price.toLocaleString()}`;
        price.style.color = '#4CAF50';
        price.style.fontSize = '20px';
        price.style.marginTop = '15px';
        card.appendChild(price);

        // Lock status
        if (car.unlockRequirement > 0) {
            const lock = document.createElement('div');
            lock.textContent = `🔒 Unlock at ${car.unlockRequirement.toLocaleString()} points`;
            lock.style.color = '#ff4444';
            lock.style.marginTop = '10px';
            card.appendChild(lock);
        }

        // Selection handling
        card.onclick = () => {
            if (car.unlockRequirement > 0) {
                // Show unlock requirement message
                alert(`This car requires ${car.unlockRequirement} points to unlock!`);
                return;
            }
            this.selectCar(car);
            document.querySelectorAll('.car-card').forEach(c => c.style.border = '2px solid transparent');
            card.style.border = '2px solid #FFD700';
        };

        card.onmouseover = () => {
            if (car.unlockRequirement === 0) {
                card.style.transform = 'scale(1.02)';
                card.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }
        };
        card.onmouseout = () => {
            card.style.transform = 'scale(1)';
            card.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        };

        return card;
    }

    selectCar(car) {
        this.selectedCar = car;
        console.log(`Selected car: ${car.name}`);
    }

    showCarSelection() {
        this.carSelectionDiv.style.display = 'block';
    }

    hideCarSelection() {
        this.carSelectionDiv.style.display = 'none';
    }

    startGame() {
        if (!this.selectedCar) {
            alert('Please select a car first!');
            return;
        }
        this.hideCarSelection();
        // Emit an event that the game can listen to
        const event = new CustomEvent('carSelected', { detail: this.selectedCar });
        document.dispatchEvent(event);
    }

    getSelectedCar() {
        return this.selectedCar;
    }
} 