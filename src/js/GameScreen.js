import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VehicleManager } from './managers/vehicle/VehicleManager.js';

export class GameScreen {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'game-screen';
        document.body.appendChild(this.container);

        // Mobil kontrol elementi
        this.mobileControls = document.createElement('div');
        this.mobileControls.id = 'mobile-controls';
        this.mobileControls.innerHTML = `
            <div class="control-container">
                <div class="direction-controls">
                    <button id="up-btn">▲</button>
                    <div class="horizontal-controls">
                        <button id="left-btn">◀</button>
                        <button id="right-btn">▶</button>
                    </div>
                    <button id="down-btn">▼</button>
                </div>
                <div class="action-controls">
                    <button id="horn-btn">H</button>
                    <button id="night-btn">N</button>
                    <button id="info-btn">i</button>
                </div>
            </div>
        `;

        // Mobil kontrol stilleri
        const mobileStyle = document.createElement('style');
        mobileStyle.textContent = `
            #mobile-controls {
                position: fixed;
                bottom: 20px;
                left: 0;
                right: 0;
                z-index: 1000;
                display: none;
            }
            
            .control-container {
                display: flex;
                justify-content: space-between;
                padding: 0 20px;
            }

            .direction-controls {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }

            .horizontal-controls {
                display: flex;
                gap: 40px;
            }

            .action-controls {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-right: 20px;
            }

            #mobile-controls button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: none;
                background: rgba(255, 255, 255, 0.3);
                color: white;
                font-size: 24px;
                backdrop-filter: blur(5px);
                touch-action: manipulation;
            }

            #mobile-controls button:active {
                background: rgba(255, 255, 255, 0.5);
            }

            .action-controls button {
                font-size: 18px !important;
                width: 50px !important;
                height: 50px !important;
            }
        `;
        document.head.appendChild(mobileStyle);
        document.body.appendChild(this.mobileControls);

        // Pop-up elementi oluştur
        this.popup = document.createElement('div');
        this.popup.id = 'car-info-popup';
        this.popup.className = 'popup hidden';
        this.popup.innerHTML = `
            <div class="popup-content">
                <h2>Araç Özellikleri</h2>
                <h3>Stop Lambaları</h3>
                <h4>Fiziksel Tasarım:</h4>
                <ul>
                    <li>Kırmızı gövde (metalik görünüm)</li>
                    <li>Şeffaf cam kapak (gerçekçi lens efekti)</li>
                    <li>Daha büyük ve görünür boyut (0.3 x 0.2)</li>
                    <li>Arabanın arkasında daha dışa yerleştirilmiş (-0.8 ve 0.8 x konumları)</li>
                </ul>
                <h4>Işık Efektleri:</h4>
                <ul>
                    <li>Sürekli yanan düşük yoğunluklu arka lambalar</li>
                    <li>Frenleme sırasında parlayan stop lambaları</li>
                    <li>Gerçek ışık kaynağı (PointLight)</li>
                    <li>Işık yansıması ve parlaklık efektleri</li>
                </ul>
                <h4>Dinamik Özellikler:</h4>
                <ul>
                    <li>Normal sürüşte düşük parlaklık (0.2)</li>
                    <li>Frenleme sırasında tam parlaklık (1.0)</li>
                    <li>Yumuşak geçişli parlaklık değişimi</li>
                    <li>Hem materyal hem ışık kaynağı güncelleme</li>
                </ul>
                <h4>Stop Lambaları Yanma Durumları:</h4>
                <ul>
                    <li>Geri vitese geçildiğinde (S tuşu veya Aşağı Ok)</li>
                    <li>İleri giderken frene basıldığında (W tuşu veya Yukarı Ok bırakıldığında)</li>
                </ul>
                <button onclick="this.parentElement.parentElement.classList.add('hidden')">Kapat</button>
            </div>
        `;
        document.body.appendChild(this.popup);

        // Pop-up stil elementini oluştur
        const style = document.createElement('style');
        style.textContent = `
            .popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .popup.hidden {
                display: none;
            }
            .popup-content {
                background: white;
                padding: 20px;
                border-radius: 10px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
            }
            .popup-content h2 {
                color: #333;
                margin-bottom: 20px;
                text-align: center;
            }
            .popup-content h3 {
                color: #444;
                margin: 15px 0;
            }
            .popup-content h4 {
                color: #555;
                margin: 10px 0;
            }
            .popup-content ul {
                list-style-type: disc;
                margin-left: 20px;
                margin-bottom: 15px;
            }
            .popup-content li {
                margin: 5px 0;
                color: #666;
            }
            .popup-content button {
                background: #ff4444;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                display: block;
                margin: 20px auto 0;
            }
            .popup-content button:hover {
                background: #ff2222;
            }
        `;
        document.head.appendChild(style);

        // Three.js bileşenleri
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        
        // Gece/Gündüz modu
        this.isNightMode = false;
        this.ambientLight = null;
        this.directionalLight = null;
        this.streetLights = []; // Dizi başlatma
        this.trafficLights = [];
        this.trafficLightState = 'green'; // green, yellow, red
        this.trafficLightTimer = 0;

        this.setupScene();
        this.hide();

        // Mobil cihaz kontrolü ve kontrollerin ayarlanması
        this.setupMobileControls();
    }

    createTree(x, z) {
        const tree = new THREE.Group();

        // Gövde - Daha sıcak kahverengi
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Daha sıcak kahverengi
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        tree.add(trunk);

        // Yapraklar - Daha canlı yeşil
        const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8);
        const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x2E7D32 }); // Daha canlı yeşil
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 3;
        leaves.castShadow = true;
        tree.add(leaves);

        tree.position.set(x, 0, z);
        return tree;
    }

    createBuilding(x, z, height, color) {
        // Binaları daha canlı renklerle güncelle
        const buildingColors = [
            0x64B5F6, // Mavi
            0x81C784, // Yeşil
            0xFFB74D, // Turuncu
            0xBA68C8  // Mor
        ];
        
        const building = new THREE.Group();
        const buildingGeometry = new THREE.BoxGeometry(5, height, 5);
        const buildingMaterial = new THREE.MeshPhongMaterial({ 
            color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
            shininess: 30
        });
        const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
        buildingMesh.position.y = height / 2;
        buildingMesh.castShadow = true;
        building.add(buildingMesh);

        // Pencereler - Daha parlak
        const windowGeometry = new THREE.PlaneGeometry(0.6, 0.8);
        const windowMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFEB3B,
            emissive: 0xFFF176,
            emissiveIntensity: 0.5,
            shininess: 90
        });

        for (let y = 2; y < height; y += 2) {
            for (let x = -1.5; x <= 1.5; x += 1.5) {
                for (let z = -2; z <= 2; z += 2) {
                    if (z === 0) continue; // Orta kısımda pencere yok
                    const window = new THREE.Mesh(windowGeometry, windowMaterial);
                    window.position.set(x, y, z + 2.5);
                    building.add(window);
                    const window2 = window.clone();
                    window2.position.set(x, y, z - 2.5);
                    window2.rotation.y = Math.PI;
                    building.add(window2);
                }
            }
        }

        building.position.set(x, 0, z);
        return building;
    }

    createMarket(x, z) {
        const market = new THREE.Group();

        // Ana bina
        const buildingGeometry = new THREE.BoxGeometry(10, 4, 8);
        const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 2;
        building.castShadow = true;
        market.add(building);

        // Çatı
        const roofGeometry = new THREE.ConeGeometry(7, 2, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x994422 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        market.add(roof);

        // Market yazısı
        const textGeometry = new THREE.BoxGeometry(8, 1, 0.2);
        const textMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        const text = new THREE.Mesh(textGeometry, textMaterial);
        text.position.set(0, 3.5, 4.1);
        market.add(text);

        market.position.set(x, 0, z);
        return market;
    }

    createMountain(x, z, height, radius) {
        const mountain = new THREE.Group();

        const mountainGeometry = new THREE.ConeGeometry(radius, height, 8);
        const mountainMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x666666,
            flatShading: true
        });
        const mountainMesh = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountainMesh.position.y = height / 2;
        mountainMesh.castShadow = true;
        mountain.add(mountainMesh);

        // Kar
        const snowGeometry = new THREE.ConeGeometry(radius * 0.4, height * 0.2, 8);
        const snowMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const snow = new THREE.Mesh(snowGeometry, snowMaterial);
        snow.position.y = height;
        mountain.add(snow);

        mountain.position.set(x, 0, z);
        return mountain;
    }

    createLake(x, z, width, length) {
        const lake = new THREE.Group();

        // Su yüzeyi
        const waterGeometry = new THREE.PlaneGeometry(width, length);
        const waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x0077be,
            transparent: true,
            opacity: 0.8,
            shininess: 100
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0.05;
        lake.add(water);

        lake.position.set(x, 0, z);
        return lake;
    }

    createRepairCenter(x, z) {
        const center = new THREE.Group();

        // Ana bina (gri)
        const buildingGeometry = new THREE.BoxGeometry(15, 8, 12);
        const buildingMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x808080,
            shininess: 30
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 4;
        building.castShadow = true;
        center.add(building);

        // Garaj kapıları
        const doorGeometry = new THREE.BoxGeometry(4, 4, 0.2);
        const doorMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4a4a4a,
            shininess: 50
        });

        // 3 garaj kapısı
        for(let i = -4; i <= 4; i += 4) {
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(i, 2, 6.1);
            center.add(door);
        }

        // "TAMİR MERKEZİ" tabelası
        const signGeometry = new THREE.BoxGeometry(12, 1.5, 0.3);
        const signMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 8.5, 6);
        center.add(sign);

        center.position.set(x, 0, z);
        return center;
    }

    createShoppingMall(x, z) {
        const mall = new THREE.Group();

        // Ana bina (mavi cam)
        const buildingGeometry = new THREE.BoxGeometry(40, 30, 20);
        const buildingMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2196F3,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.8,
            envMapIntensity: 1.0
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 15;
        building.castShadow = true;
        mall.add(building);

        // Cam cephe detayları
        const windowRowCount = 6;
        const windowColCount = 8;
        const windowGeometry = new THREE.PlaneGeometry(4, 4);
        const windowMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 1.0,
            roughness: 0.1,
            transparent: true,
            opacity: 0.9
        });

        // Ön cephe camları
        for(let y = 0; y < windowRowCount; y++) {
            for(let x = 0; x < windowColCount; x++) {
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(-16 + x * 5, 5 + y * 5, 10.1);
                mall.add(window);
            }
        }

        // Giriş kapısı
        const doorGeometry = new THREE.BoxGeometry(8, 8, 0.5);
        const doorMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.8
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 4, 10.1);
        mall.add(door);

        // "AVM" tabelası
        const signGeometry = new THREE.BoxGeometry(15, 3, 0.5);
        const signMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xffff00,
            emissiveIntensity: 0.8
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 32, 10.2);
        mall.add(sign);

        mall.position.set(x, 0, z);
        return mall;
    }

    createBasketballCourt(x, z) {
        const court = new THREE.Group();

        // Yeşil zemin
        const groundGeometry = new THREE.PlaneGeometry(15, 28);
        const groundMaterial = new THREE.MeshPhongMaterial({
            color: 0x2E7D32,
            shininess: 10
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0.01;
        court.add(ground);

        // Saha çizgileri
        const lineGeometry = new THREE.PlaneGeometry(0.1, 28);
        const lineMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        
        // Kenar çizgileri
        const lines = [
            { pos: [-7.5, 0, 0], rot: [0, 0, 0] },
            { pos: [7.5, 0, 0], rot: [0, 0, 0] },
            { pos: [0, 0, 14], rot: [0, Math.PI/2, 0] },
            { pos: [0, 0, -14], rot: [0, Math.PI/2, 0] }
        ];

        lines.forEach(line => {
            const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
            lineMesh.position.set(...line.pos);
            lineMesh.rotation.set(...line.rot);
            lineMesh.position.y = 0.02;
            court.add(lineMesh);
        });

        // Potalar
        const createHoop = (posZ) => {
            const hoop = new THREE.Group();

            // Direk
            const poleGeometry = new THREE.BoxGeometry(0.3, 3.05, 0.3);
            const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x424242 });
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.y = 1.5;
            hoop.add(pole);

            // Pano
            const boardGeometry = new THREE.BoxGeometry(1.8, 1.05, 0.1);
            const boardMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const board = new THREE.Mesh(boardGeometry, boardMaterial);
            board.position.set(0, 3, 0.2);
            hoop.add(board);

            // Çember
            const ringGeometry = new THREE.TorusGeometry(0.2, 0.04, 8, 24);
            const ringMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444 });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(0, 2.7, 0.4);
            ring.rotation.x = Math.PI / 2;
            hoop.add(ring);

            hoop.position.z = posZ;
            hoop.position.x = 7;
            return hoop;
        };

        // İki pota ekle
        court.add(createHoop(13));
        court.add(createHoop(-13));

        court.position.set(x, 0, z);
        return court;
    }

    createSmallHouse(x, z) {
        const house = new THREE.Group();

        // Ana yapı
        const buildingGeometry = new THREE.BoxGeometry(4, 3, 4);
        const buildingMaterial = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 0.5, 0.7),
            shininess: 30
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 1.5;
        building.castShadow = true;
        house.add(building);

        // Çatı
        const roofGeometry = new THREE.ConeGeometry(3, 2, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B4513,
            shininess: 20
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 4;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        house.add(roof);

        // Pencereler
        const windowGeometry = new THREE.PlaneGeometry(0.5, 0.7);
        const windowMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFEB3B,
            emissive: 0xFFF176,
            emissiveIntensity: 0.3
        });

        [-1, 1].forEach(xPos => {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(xPos, 1.5, 2.01);
            house.add(window);
        });

        // Kapı
        const doorGeometry = new THREE.PlaneGeometry(0.8, 1.5);
        const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x4A312C });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 0.75, 2.01);
        house.add(door);

        house.position.set(x, 0, z);
        return house;
    }

    createPineTree(x, z) {
        const tree = new THREE.Group();

        // Gövde
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x4A312C });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        tree.add(trunk);

        // Yapraklar (3 katman)
        const leafColors = [0x1B5E20, 0x2E7D32, 0x388E3C];
        [2.5, 3.5, 4.5].forEach((y, i) => {
            const leafGeometry = new THREE.ConeGeometry(1.2 - i * 0.2, 1.5, 8);
            const leafMaterial = new THREE.MeshPhongMaterial({ color: leafColors[i] });
            const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
            leaves.position.y = y;
            leaves.castShadow = true;
            tree.add(leaves);
        });

        tree.position.set(x, 0, z);
        return tree;
    }

    createBirchTree(x, z) {
        const tree = new THREE.Group();

        // Beyaz gövde
        const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.25, 4, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0xE0E0E0 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        tree.add(trunk);

        // Yapraklar (oval şekilde)
        const leavesGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x81C784 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 4.5;
        leaves.scale.y = 1.5;
        leaves.castShadow = true;
        tree.add(leaves);

        tree.position.set(x, 0, z);
        return tree;
    }

    createAirport(x, z) {
        const airport = new THREE.Group();

        // Ana terminal binası
        const terminalGeometry = new THREE.BoxGeometry(60, 15, 20);
        const terminalMaterial = new THREE.MeshPhongMaterial({
            color: 0x90CAF9,
            shininess: 50
        });
        const terminal = new THREE.Mesh(terminalGeometry, terminalMaterial);
        terminal.position.y = 7.5;
        terminal.castShadow = true;
        airport.add(terminal);

        // Pist
        const runwayGeometry = new THREE.PlaneGeometry(30, 100);
        const runwayMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            shininess: 30
        });
        const runway = new THREE.Mesh(runwayGeometry, runwayMaterial);
        runway.rotation.x = -Math.PI / 2;
        runway.position.set(40, 0.1, 0);
        airport.add(runway);

        // Pist çizgileri
        const stripeGeometry = new THREE.PlaneGeometry(1, 5);
        const stripeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
        for(let i = -45; i <= 45; i += 10) {
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(40, 0.2, i);
            airport.add(stripe);
        }

        // Kontrol kulesi
        const towerBaseGeometry = new THREE.CylinderGeometry(3, 3, 20, 8);
        const towerTopGeometry = new THREE.CylinderGeometry(5, 5, 5, 8);
        const towerMaterial = new THREE.MeshPhongMaterial({ color: 0xBDBDBD });
        
        const towerBase = new THREE.Mesh(towerBaseGeometry, towerMaterial);
        towerBase.position.set(-20, 10, 0);
        airport.add(towerBase);
        
        const towerTop = new THREE.Mesh(towerTopGeometry, towerMaterial);
        towerTop.position.set(-20, 22.5, 0);
        airport.add(towerTop);

        // "HAVALİMANI" yazısı
        const signGeometry = new THREE.BoxGeometry(30, 3, 1);
        const signMaterial = new THREE.MeshPhongMaterial({
            color: 0x2196F3,
            emissive: 0x2196F3,
            emissiveIntensity: 0.5
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 15, 10.1);
        airport.add(sign);

        airport.position.set(x, 0, z);
        return airport;
    }

    createTrainStation(x, z) {
        const station = new THREE.Group();

        // Ana bina
        const buildingGeometry = new THREE.BoxGeometry(40, 10, 15);
        const buildingMaterial = new THREE.MeshPhongMaterial({
            color: 0xE57373,
            shininess: 30
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 5;
        building.castShadow = true;
        station.add(building);

        // Çatı
        const roofGeometry = new THREE.BoxGeometry(44, 2, 19);
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x4A4A4A });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 11;
        roof.castShadow = true;
        station.add(roof);

        // Platform
        const platformGeometry = new THREE.BoxGeometry(60, 1, 6);
        const platformMaterial = new THREE.MeshPhongMaterial({ color: 0x9E9E9E });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(0, 0.5, 12);
        station.add(platform);

        // Raylar
        const createTrack = (offsetZ) => {
            const railGeometry = new THREE.BoxGeometry(60, 0.2, 0.4);
            const railMaterial = new THREE.MeshPhongMaterial({ color: 0x424242 });
            const rail = new THREE.Mesh(railGeometry, railMaterial);
            rail.position.set(0, 0.3, offsetZ);
            station.add(rail);

            // Traversler
            for(let i = -29; i <= 29; i += 2) {
                const sleeperGeometry = new THREE.BoxGeometry(1, 0.2, 2);
                const sleeperMaterial = new THREE.MeshPhongMaterial({ color: 0x3E2723 });
                const sleeper = new THREE.Mesh(sleeperGeometry, sleeperMaterial);
                sleeper.position.set(i, 0.2, offsetZ);
                station.add(sleeper);
            }
        };

        createTrack(15);
        createTrack(18);

        // "TREN İSTASYONU" yazısı
        const signGeometry = new THREE.BoxGeometry(25, 2, 1);
        const signMaterial = new THREE.MeshPhongMaterial({
            color: 0xE57373,
            emissive: 0xE57373,
            emissiveIntensity: 0.5
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 12, 7.6);
        station.add(sign);

        station.position.set(x, 0, z);
        return station;
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Daha parlak gökyüzü mavisi

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, -15);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Lights - Işıkları artır
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Ambient ışığı artırdık
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Directional ışığı artırdık
        this.directionalLight.position.set(100, 100, 0);
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);

        // Ground (çimen) - Daha canlı yeşil
        const groundGeometry = new THREE.PlaneGeometry(500, 500);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4CAF50, // Daha canlı yeşil
            roughness: 0.6,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Yol - Daha açık gri
        const roadGeometry = new THREE.PlaneGeometry(10, 500);
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555, // Daha açık gri
            roughness: 0.7,
            metalness: 0.1
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.y = 0.01;
        road.receiveShadow = true;
        this.scene.add(road);

        // Yol şeritleri
        const stripeGeometry = new THREE.PlaneGeometry(0.3, 5);
        const stripeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.5,
            metalness: 0.1
        });

        for (let i = -240; i <= 240; i += 10) {
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(0, 0.02, i);
            this.scene.add(stripe);
        }

        // Ağaçlar ekle
        const treeTypes = ['normal', 'pine', 'birch'];
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * 400 - 200;
            const z = Math.random() * 800 - 400;
            
            // Yoldan ve diğer yapılardan uzak tut
            if (Math.abs(x) > 8) {
                const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
                let tree;
                
                switch(treeType) {
                    case 'pine':
                        tree = this.createPineTree(x, z);
                        break;
                    case 'birch':
                        tree = this.createBirchTree(x, z);
                        break;
                    default:
                        tree = this.createTree(x, z);
                }
                
                this.scene.add(tree);
            }
        }

        // Binalar ekle
        const buildingPositions = [
            // Sol taraf apartmanları
            { x: -45, z: -70, height: 22 },
            { x: -50, z: -40, height: 18 },
            { x: -35, z: -55, height: 25 },
            { x: -40, z: -25, height: 20 },
            { x: -30, z: -85, height: 23 },
            { x: -55, z: -60, height: 19 },
            { x: -25, z: -45, height: 21 },
            { x: -60, z: -30, height: 24 },
            { x: -45, z: -15, height: 17 },
            { x: -35, z: -95, height: 26 },

            // Sağ taraf apartmanları
            { x: 40, z: 60, height: 25 },
            { x: 45, z: 30, height: 20 },
            { x: 35, z: 45, height: 23 },
            { x: 50, z: 75, height: 21 },
            { x: 55, z: 15, height: 24 },
            { x: 30, z: 90, height: 19 },
            { x: 45, z: 105, height: 22 },
            { x: 60, z: 45, height: 18 },
            { x: 35, z: 25, height: 26 },
            { x: 50, z: 95, height: 20 }
        ];

        buildingPositions.forEach(b => {
            const building = this.createBuilding(b.x, b.z, b.height);
            this.scene.add(building);
        });

        // Minik evler ekle
        const housePositions = [
            { x: -20, z: -30 }, { x: -25, z: -25 }, { x: -15, z: -35 },
            { x: 20, z: 30 }, { x: 25, z: 25 }, { x: 15, z: 35 },
            { x: -20, z: 40 }, { x: 20, z: -40 }, { x: -30, z: 20 },
            { x: 30, z: -20 }, { x: -40, z: -40 }, { x: 40, z: 40 }
        ];

        housePositions.forEach(h => {
            const house = this.createSmallHouse(h.x, h.z);
            this.scene.add(house);
        });

        // Havaalanı ekle (haritanın bir ucuna)
        const airport = this.createAirport(-150, -200);
        this.scene.add(airport);

        // Tren istasyonu ekle (haritanın diğer ucuna)
        const trainStation = this.createTrainStation(150, 200);
        this.scene.add(trainStation);

        // Market ekle
        const market = this.createMarket(-40, 0);
        this.scene.add(market);

        // Dağlar ekle
        const mountains = [
            { x: -100, z: -200, height: 50, radius: 30 },
            { x: -80, z: -180, height: 40, radius: 25 },
            { x: 100, z: 200, height: 60, radius: 35 }
        ];

        mountains.forEach(m => {
            const mountain = this.createMountain(m.x, m.z, m.height, m.radius);
            this.scene.add(mountain);
        });

        // Göl ekle
        const lake = this.createLake(50, -100, 40, 60);
        this.scene.add(lake);

        // Vehicle
        this.vehicleManager = new VehicleManager(this.scene);

        // Yol kenarı aydınlatmaları
        this.createStreetLights();
        
        // Trafik ışıkları
        this.createTrafficLights();

        // Gece/Gündüz geçiş tuşu
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'n') {
                this.toggleDayNight();
            }
        });

        // 'İ' tuşu için event listener ekle
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'i') {
                this.toggleCarInfo();
            }
        });

        // Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Tamir merkezi ekle
        const repairCenter = this.createRepairCenter(-80, 0);
        this.scene.add(repairCenter);

        // AVM ekle
        const shoppingMall = this.createShoppingMall(60, 50);
        this.scene.add(shoppingMall);

        // Basketbol sahaları ekle
        const court1 = this.createBasketballCourt(-40, 80);
        const court2 = this.createBasketballCourt(-40, 120);
        this.scene.add(court1);
        this.scene.add(court2);

        // Start animation
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.vehicleManager) {
            this.vehicleManager.update();
            
            const vehiclePosition = this.vehicleManager.getVehiclePosition();
            if (vehiclePosition) {
                // Kamera takibi - daha yakın ve alçak
                const cameraOffset = new THREE.Vector3(0, 5, -10);
                const targetPosition = vehiclePosition.clone().add(cameraOffset);
                this.camera.position.lerp(targetPosition, 0.1);
                this.camera.lookAt(vehiclePosition);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    show() {
        this.container.classList.remove('hidden');
    }

    hide() {
        this.container.classList.add('hidden');
    }

    createStreetLights() {
        const createStreetLight = (x, z) => {
            const group = new THREE.Group();

            // Direk
            const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 8);
            const poleMaterial = new THREE.MeshStandardMaterial({
                color: 0x333333
            });
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.y = 2.5;
            group.add(pole);

            // Lamba başlığı
            const headGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.3);
            const headMaterial = new THREE.MeshStandardMaterial({
                color: 0x666666,
                emissive: 0xffffcc,
                emissiveIntensity: 0.5
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(0.3, 4.8, 0);
            group.add(head);

            // Spot ışık - Her 3 direk için 1 ışık kullanacağız
            if (Math.abs(z) % 90 === 0) {
                const light = new THREE.SpotLight(0xffffcc, 1);
                light.position.set(0.3, 4.8, 0);
                light.target.position.set(3, 0, 0);
                light.angle = Math.PI / 3;
                light.penumbra = 0.5;
                light.decay = 1.5;
                light.distance = 50;
                
                group.add(light);
                group.add(light.target);
                this.streetLights.push(light);
            }

            group.position.set(x, 0, z);
            this.scene.add(group);
        };

        // Yolun her iki tarafına daha az sıklıkta sokak lambaları ekle
        for (let z = -200; z <= 200; z += 45) {
            createStreetLight(-6, z);
            createStreetLight(6, z);
        }
    }

    createTrafficLights() {
        const createTrafficLight = (x, z) => {
            const group = new THREE.Group();

            // Direk
            const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
            const poleMaterial = new THREE.MeshStandardMaterial({
                color: 0x333333
            });
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.y = 2;
            group.add(pole);

            // Işık kutusu
            const boxGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.4);
            const boxMaterial = new THREE.MeshStandardMaterial({
                color: 0x222222
            });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(0, 3.5, 0);
            group.add(box);

            // Trafik ışıkları (kırmızı, sarı, yeşil)
            const lightGeometry = new THREE.CircleGeometry(0.1, 16);
            const createLight = (color, y) => {
                const lightMaterial = new THREE.MeshStandardMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.5
                });
                const light = new THREE.Mesh(lightGeometry, lightMaterial);
                light.position.set(0, y, 0.21);
                return light;
            };

            const redLight = createLight(0xff0000, 3.9);
            const yellowLight = createLight(0xffff00, 3.5);
            const greenLight = createLight(0x00ff00, 3.1);

            box.add(redLight);
            box.add(yellowLight);
            box.add(greenLight);

            group.position.set(x, 0, z);
            this.scene.add(group);
            this.trafficLights.push({ red: redLight, yellow: yellowLight, green: greenLight });
        };

        // Daha az trafik ışığı ekle
        createTrafficLight(-3, 0);
        createTrafficLight(3, 0);
        createTrafficLight(-3, -100);
        createTrafficLight(3, -100);
    }

    toggleDayNight() {
        this.isNightMode = !this.isNightMode;
        
        if (this.isNightMode) {
            // Gece modu - biraz daha aydınlık
            this.ambientLight.intensity = 0.3;
            this.directionalLight.intensity = 0.2;
            this.scene.background = new THREE.Color(0x1A237E); // Daha aydınlık gece mavisi
            this.streetLights.forEach(light => {
                light.intensity = 2.5; // Sokak lambalarını daha parlak yap
            });
        } else {
            // Gündüz modu - daha parlak
            this.ambientLight.intensity = 0.8;
            this.directionalLight.intensity = 1.0;
            this.scene.background = new THREE.Color(0x87ceeb);
            this.streetLights.forEach(light => {
                light.intensity = 0;
            });
        }
    }

    updateTrafficLights(deltaTime) {
        this.trafficLightTimer += deltaTime;
        
        // Her 10 saniyede bir trafik ışığı değişimi
        if (this.trafficLightTimer >= 10) {
            this.trafficLightTimer = 0;
            
            switch (this.trafficLightState) {
                case 'green':
                    this.trafficLightState = 'yellow';
                    this.trafficLights.forEach(lights => {
                        lights.green.material.emissiveIntensity = 0;
                        lights.yellow.material.emissiveIntensity = 0.5;
                        lights.red.material.emissiveIntensity = 0;
                    });
                    break;
                case 'yellow':
                    this.trafficLightState = 'red';
                    this.trafficLights.forEach(lights => {
                        lights.green.material.emissiveIntensity = 0;
                        lights.yellow.material.emissiveIntensity = 0;
                        lights.red.material.emissiveIntensity = 0.5;
                    });
                    break;
                case 'red':
                    this.trafficLightState = 'green';
                    this.trafficLights.forEach(lights => {
                        lights.green.material.emissiveIntensity = 0.5;
                        lights.yellow.material.emissiveIntensity = 0;
                        lights.red.material.emissiveIntensity = 0;
                    });
                    break;
            }
        }
    }

    update(deltaTime) {
        // ... existing update code ...
        
        // Trafik ışıklarını güncelle
        this.updateTrafficLights(deltaTime);
    }

    toggleCarInfo() {
        this.popup.classList.toggle('hidden');
    }

    setupMobileControls() {
        // Mobil cihaz kontrolü
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            this.mobileControls.style.display = 'block';
            
            // Yön tuşları
            const upBtn = document.getElementById('up-btn');
            const downBtn = document.getElementById('down-btn');
            const leftBtn = document.getElementById('left-btn');
            const rightBtn = document.getElementById('right-btn');
            
            // Aksiyon tuşları
            const hornBtn = document.getElementById('horn-btn');
            const nightBtn = document.getElementById('night-btn');
            const infoBtn = document.getElementById('info-btn');

            // Touch olayları için yardımcı fonksiyon
            const createTouchHandler = (key, type) => {
                const event = new KeyboardEvent(type, { key: key });
                document.dispatchEvent(event);
            };

            // Yön tuşları için touch olayları
            upBtn.addEventListener('touchstart', () => createTouchHandler('w', 'keydown'));
            upBtn.addEventListener('touchend', () => createTouchHandler('w', 'keyup'));

            downBtn.addEventListener('touchstart', () => createTouchHandler('s', 'keydown'));
            downBtn.addEventListener('touchend', () => createTouchHandler('s', 'keyup'));

            leftBtn.addEventListener('touchstart', () => createTouchHandler('a', 'keydown'));
            leftBtn.addEventListener('touchend', () => createTouchHandler('a', 'keyup'));

            rightBtn.addEventListener('touchstart', () => createTouchHandler('d', 'keydown'));
            rightBtn.addEventListener('touchend', () => createTouchHandler('d', 'keyup'));

            // Aksiyon tuşları için touch olayları
            hornBtn.addEventListener('touchstart', () => createTouchHandler('h', 'keydown'));
            hornBtn.addEventListener('touchend', () => createTouchHandler('h', 'keyup'));

            nightBtn.addEventListener('touchstart', () => createTouchHandler('n', 'keydown'));
            infoBtn.addEventListener('touchstart', () => createTouchHandler('i', 'keydown'));

            // Çift dokunma zoom'unu engelle
            document.addEventListener('touchmove', (e) => {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });

            // Sayfayı yenileme hareketini engelle
            document.addEventListener('touchmove', (e) => {
                e.preventDefault();
            }, { passive: false });
        }
    }
} 