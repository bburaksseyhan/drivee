import * as THREE from 'three';

export class VehicleManager {
    constructor(scene) {
        this.scene = scene;
        
        // Temel özellikler
        this.speed = 0;
        this.maxSpeed = 0.5;
        this.acceleration = 0.01;
        this.deceleration = 0.005;
        this.turnSpeed = 0.03;
        
        // Pozisyon ve yön
        this.position = new THREE.Vector3(0, 0.5, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.direction = new THREE.Vector3(0, 0, 1);

        // Kontrol tuşları
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            horn: false
        };

        // Korna sesi
        this.hornSound = new Audio('/sounds/car-horn.mp3');
        this.hornSound.volume = 0.5;

        this.createVehicle();
        this.setupControls();
    }

    createVehicle() {
        // Ana araç grubu
        this.vehicle = new THREE.Group();

        // Gövde (metalik mavi)
        const bodyGeometry = new THREE.BoxGeometry(2, 0.75, 4);
        const bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x0066cc,
            metalness: 0.8,
            roughness: 0.2,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1
        });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.y = 0.5;
        this.body.castShadow = true;
        this.vehicle.add(this.body);

        // Kabin (siyah cam efekti)
        const cabinGeometry = new THREE.BoxGeometry(1.8, 0.8, 2);
        const cabinMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x111111,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.7
        });
        this.cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        this.cabin.position.set(0, 1, -0.5);
        this.cabin.castShadow = true;
        this.body.add(this.cabin);

        // Ön cam
        const windshieldGeometry = new THREE.PlaneGeometry(1.6, 0.8);
        const windshieldMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xaaaaff,
            transparent: true,
            opacity: 0.3,
            metalness: 0.0,
            roughness: 0.0,
            clearcoat: 1.0
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 0.4, 0.5);
        windshield.rotation.x = Math.PI * 0.2;
        this.cabin.add(windshield);

        // Farlar
        const createHeadlight = (x) => {
            const lightGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
            const lightMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                emissive: 0xffffaa,
                emissiveIntensity: 0.5,
                metalness: 0.9,
                roughness: 0.1
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.rotation.z = Math.PI / 2;
            light.position.set(x, 0.3, 2);
            return light;
        };

        const leftHeadlight = createHeadlight(-0.7);
        const rightHeadlight = createHeadlight(0.7);
        this.body.add(leftHeadlight);
        this.body.add(rightHeadlight);

        // Spot ışıkları
        const createSpotlight = (x) => {
            const spotlight = new THREE.SpotLight(0xffffff, 2);
            spotlight.position.set(x, 0.3, 2);
            spotlight.target.position.set(x, 0, 4);
            spotlight.angle = Math.PI / 6;
            spotlight.penumbra = 0.3;
            spotlight.decay = 1;
            spotlight.distance = 20;
            this.body.add(spotlight);
            this.body.add(spotlight.target);
            return spotlight;
        };

        this.leftSpotlight = createSpotlight(-0.7);
        this.rightSpotlight = createSpotlight(0.7);

        // Arka stop lambaları
        const createTailLight = (x) => {
            const group = new THREE.Group();

            // Stop lambası gövdesi
            const tailLightGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.1);
            const tailLightMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.2,
                metalness: 0.9,
                roughness: 0.1,
                transparent: true,
                opacity: 0.9
            });
            const tailLight = new THREE.Mesh(tailLightGeometry, tailLightMaterial);
            group.add(tailLight);

            // Stop lambası camı
            const glassGeometry = new THREE.BoxGeometry(0.32, 0.22, 0.02);
            const glassMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xff3333,
                metalness: 0.9,
                roughness: 0.1,
                transparent: true,
                opacity: 0.3,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1
            });
            const glass = new THREE.Mesh(glassGeometry, glassMaterial);
            glass.position.z = 0.05;
            group.add(glass);

            // Stop lambası ışığı
            const light = new THREE.PointLight(0xff0000, 0, 2);
            light.position.z = 0.1;
            group.add(light);

            group.position.set(x, 0.5, -1.95);
            return { group, light, material: tailLightMaterial };
        };

        // Sol ve sağ stop lambaları
        this.leftTailLight = createTailLight(-0.8);
        this.rightTailLight = createTailLight(0.8);
        this.body.add(this.leftTailLight.group);
        this.body.add(this.rightTailLight.group);

        // Tekerlekler ve Jantlar
        const createWheel = (pos) => {
            const wheelGroup = new THREE.Group();
            
            // Lastik
            const tireGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
            const tireMaterial = new THREE.MeshPhysicalMaterial({ 
                color: 0x222222,
                roughness: 0.8,
                metalness: 0.1
            });
            const tire = new THREE.Mesh(tireGeometry, tireMaterial);
            
            // Jant
            const rimGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.31, 8);
            const rimMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xcccccc,
                metalness: 0.9,
                roughness: 0.1
            });
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            
            // Jant kapağı
            const hubcapGeometry = new THREE.CircleGeometry(0.2, 8);
            const hubcapMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xdddddd,
                metalness: 1,
                roughness: 0.1
            });
            const hubcap = new THREE.Mesh(hubcapGeometry, hubcapMaterial);
            hubcap.position.y = 0.16;
            hubcap.rotation.y = Math.PI / 2;

            wheelGroup.add(tire);
            wheelGroup.add(rim);
            wheelGroup.add(hubcap);
            wheelGroup.rotation.z = Math.PI / 2;
            wheelGroup.position.set(pos.x, pos.y, pos.z);
            
            return wheelGroup;
        };

        // Tekerlek pozisyonları
        const wheelPositions = [
            { x: -1, y: 0, z: 1.5 },  // Ön sol
            { x: 1, y: 0, z: 1.5 },   // Ön sağ
            { x: -1, y: 0, z: -1.5 }, // Arka sol
            { x: 1, y: 0, z: -1.5 }   // Arka sağ
        ];

        this.wheels = wheelPositions.map(pos => {
            const wheel = createWheel(pos);
            this.body.add(wheel);
            return wheel;
        });

        // Aracı sahneye ekle
        this.scene.add(this.vehicle);
        
        // Başlangıç pozisyonu
        this.vehicle.position.copy(this.position);
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    this.keys.forward = true;
                    break;
                case 's':
                case 'arrowdown':
                    this.keys.backward = true;
                    break;
                case 'a':
                case 'arrowleft':
                    this.keys.left = true;
                    break;
                case 'd':
                case 'arrowright':
                    this.keys.right = true;
                    break;
                case 'h':
                    if (!this.keys.horn) {
                        this.keys.horn = true;
                        this.hornSound.currentTime = 0;
                        this.hornSound.play();
                    }
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.key.toLowerCase()) {
                case 'w':
                case 'arrowup':
                    this.keys.forward = false;
                    break;
                case 's':
                case 'arrowdown':
                    this.keys.backward = false;
                    break;
                case 'a':
                case 'arrowleft':
                    this.keys.left = false;
                    break;
                case 'd':
                case 'arrowright':
                    this.keys.right = false;
                    break;
                case 'h':
                    this.keys.horn = false;
                    break;
            }
        });
    }

    update() {
        // Hızlanma/Yavaşlama
        if (this.keys.forward) {
            this.speed += this.acceleration;
            if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        } else if (this.keys.backward) {
            this.speed -= this.acceleration;
            if (this.speed < -this.maxSpeed / 2) this.speed = -this.maxSpeed / 2;
        } else {
            // Sürtünme ile yavaşlama
            if (this.speed > 0) {
                this.speed -= this.deceleration;
                if (this.speed < 0) this.speed = 0;
            } else if (this.speed < 0) {
                this.speed += this.deceleration;
                if (this.speed > 0) this.speed = 0;
            }
        }

        // Dönüş
        if (Math.abs(this.speed) > 0.001) {
            if (this.keys.left) {
                this.rotation.y += this.turnSpeed * (this.speed > 0 ? 1 : -1);
            }
            if (this.keys.right) {
                this.rotation.y -= this.turnSpeed * (this.speed > 0 ? 1 : -1);
            }
        }

        // Hareket
        if (Math.abs(this.speed) > 0.001) {
            // Yön vektörünü hesapla
            this.direction.set(
                Math.sin(this.rotation.y),
                0,
                Math.cos(this.rotation.y)
            );

            // Pozisyonu güncelle
            this.position.x += this.direction.x * this.speed;
            this.position.z += this.direction.z * this.speed;

            // Aracın pozisyonunu ve rotasyonunu güncelle
            this.vehicle.position.copy(this.position);
            this.vehicle.rotation.copy(this.rotation);

            // Tekerlek animasyonları
            const wheelRotationSpeed = this.speed;
            this.wheels.forEach((wheel, index) => {
                wheel.rotation.x += wheelRotationSpeed;
                if (index < 2) { // Ön tekerlekler
                    wheel.rotation.y = (this.keys.left ? 0.5 : this.keys.right ? -0.5 : 0);
                }
            });
        }

        // Harita sınırları kontrolü
        const mapLimits = {
            minX: -150,
            maxX: 150,
            minZ: -240,
            maxZ: 240
        };

        this.position.x = Math.max(Math.min(this.position.x, mapLimits.maxX), mapLimits.minX);
        this.position.z = Math.max(Math.min(this.position.z, mapLimits.maxZ), mapLimits.minZ);

        // Stop lambalarını güncelle
        const brakingIntensity = this.keys.backward || (this.speed > 0.01 && !this.keys.forward) ? 1 : 0.2;
        
        // Stop lambası materyallerini güncelle
        this.leftTailLight.material.emissiveIntensity = brakingIntensity;
        this.rightTailLight.material.emissiveIntensity = brakingIntensity;
        
        // Stop lambası ışıklarını güncelle
        this.leftTailLight.light.intensity = brakingIntensity;
        this.rightTailLight.light.intensity = brakingIntensity;
    }

    getVehiclePosition() {
        return this.position;
    }
} 