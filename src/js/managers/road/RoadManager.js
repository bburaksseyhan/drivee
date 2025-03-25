import * as THREE from 'three';

export class RoadManager {
    constructor(scene, vehicleManager) {
        this.scene = scene;
        this.vehicleManager = vehicleManager;
        this.roadSegments = [];
        this.roadWidth = 10;
        this.roadLength = 1000;
        this.segmentLength = 50;
        this.createRoad();
        this.createEnvironment();
        this.addTrees();
        this.addBuildings();
        this.addMountainsWithLakes();
    }

    createRoad() {
        // Yol geometrisi - genişletilmiş
        const roadGeometry = new THREE.PlaneGeometry(20, 2000);
        const roadMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            side: THREE.DoubleSide
        });
        this.road = new THREE.Mesh(roadGeometry, roadMaterial);
        this.road.rotation.x = -Math.PI / 2;
        this.road.receiveShadow = true;
        this.scene.add(this.road);

        // Yol çizgileri - uzatılmış
        const lineGeometry = new THREE.PlaneGeometry(0.2, 4);
        const lineMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });

        for (let i = -995; i < 995; i += 10) {
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.rotation.x = -Math.PI / 2;
            line.position.set(0, 0.01, i);
            this.scene.add(line);
        }

        // Yol kenarları - uzatılmış
        const edgeGeometry = new THREE.BoxGeometry(0.3, 0.2, 2000);
        const edgeMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });

        const leftEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        leftEdge.position.set(-10, 0.1, 0);
        this.scene.add(leftEdge);

        const rightEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        rightEdge.position.set(10, 0.1, 0);
        this.scene.add(rightEdge);
    }

    createEnvironment() {
        // Zemin - genişletilmiş
        const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
        const groundMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a472a,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Gökyüzü
        this.addSkybox();
    }

    addTrees() {
        const treePositions = [];
        const treeCount = 300; // Ağaç sayısını artırdık
        const minDistance = 5;

        // Ağaç gövdesi ve yapraklar için materyal
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 });

        for (let i = 0; i < treeCount; i++) {
            let x, z;
            let validPosition = false;

            while (!validPosition) {
                x = Math.random() < 0.5 ? 
                    THREE.MathUtils.randFloat(-150, -20) : 
                    THREE.MathUtils.randFloat(20, 150);
                z = THREE.MathUtils.randFloat(-1000, 1000);

                validPosition = true;
                for (const pos of treePositions) {
                    const distance = Math.sqrt(
                        Math.pow(x - pos.x, 2) + 
                        Math.pow(z - pos.z, 2)
                    );
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }
            }

            // Pozisyonu kaydet
            treePositions.push({ x, z });

            // Ağaç grubu
            const tree = new THREE.Group();

            // Gövde
            const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.castShadow = true;
            tree.add(trunk);

            // Yapraklar (3 katman)
            for (let j = 0; j < 3; j++) {
                const leavesGeometry = new THREE.ConeGeometry(1 - j * 0.2, 1.5, 8);
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                leaves.position.y = 1 + j * 0.7;
                leaves.castShadow = true;
                tree.add(leaves);
            }

            tree.position.set(x, 1, z);
            this.scene.add(tree);
        }
    }

    addMountainsWithLakes() {
        const mountainCount = 40; // Dağ sayısını artırdık
        const mountainPositions = [];
        const minDistance = 100; // Dağlar arası mesafeyi artırdık

        // Dağ materyali
        const mountainMaterial = new THREE.MeshPhongMaterial({
            color: 0x808080,
            flatShading: true
        });

        // Göl materyali
        const lakeMaterial = new THREE.MeshPhongMaterial({
            color: 0x0099ff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        // Modern apartman oluşturma fonksiyonu
        const createModernApartment = (x, z) => {
            const apartment = new THREE.Group();

            // Ana bina gövdesi
            const buildingGeometry = new THREE.BoxGeometry(10, 25, 10);
            const buildingMaterial = new THREE.MeshPhongMaterial({
                color: 0xcccccc,
                metalness: 0.5,
                roughness: 0.3
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            apartment.add(building);

            // Cam yüzeyler
            const glassGeometry = new THREE.PlaneGeometry(8, 20);
            const glassMaterial = new THREE.MeshPhongMaterial({
                color: 0x88ccff,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });

            // Ön cam panel
            const frontGlass = new THREE.Mesh(glassGeometry, glassMaterial);
            frontGlass.position.set(0, 0, 5.01);
            apartment.add(frontGlass);

            // Arka cam panel
            const backGlass = new THREE.Mesh(glassGeometry, glassMaterial);
            backGlass.position.set(0, 0, -5.01);
            apartment.add(backGlass);

            // Balkonlar
            for (let i = -8; i <= 8; i += 4) {
                const balconyGeometry = new THREE.BoxGeometry(2, 1, 1);
                const balconyMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
                const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
                balcony.position.set(4, i, 0);
                apartment.add(balcony);

                const balcony2 = balcony.clone();
                balcony2.position.set(-4, i, 0);
                apartment.add(balcony2);
            }

            // Çatı detayları
            const roofGeometry = new THREE.BoxGeometry(12, 2, 12);
            const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = 13;
            apartment.add(roof);

            apartment.position.set(x, 12.5, z);
            apartment.castShadow = true;
            apartment.receiveShadow = true;
            return apartment;
        };

        for (let i = 0; i < mountainCount; i++) {
            let x, z;
            let validPosition = false;

            while (!validPosition) {
                x = Math.random() < 0.5 ? 
                    THREE.MathUtils.randFloat(-100, -40) : 
                    THREE.MathUtils.randFloat(40, 100);
                z = THREE.MathUtils.randFloat(-500, 500);

                validPosition = true;
                for (const pos of mountainPositions) {
                    const distance = Math.sqrt(
                        Math.pow(x - pos.x, 2) + 
                        Math.pow(z - pos.z, 2)
                    );
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }
            }

            mountainPositions.push({ x, z });

            // Dağ oluştur
            const height = THREE.MathUtils.randFloat(15, 30);
            const radius = THREE.MathUtils.randFloat(8, 15);
            const mountainGeometry = new THREE.ConeGeometry(radius, height, 8);
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);

            mountain.position.set(x, height / 2, z);
            mountain.castShadow = true;
            mountain.receiveShadow = true;
            this.scene.add(mountain);

            // Göl oluştur
            const lakeRadius = radius * 1.5;
            const lakeGeometry = new THREE.CircleGeometry(lakeRadius, 32);
            const lake = new THREE.Mesh(lakeGeometry, lakeMaterial);
            lake.rotation.x = -Math.PI / 2;
            lake.position.set(
                x + (Math.random() - 0.5) * 20,
                0.05,
                z + (Math.random() - 0.5) * 20
            );
            this.scene.add(lake);

            // Göl kenarına dalgalı efekt
            const lakeEdgeGeometry = new THREE.TorusGeometry(lakeRadius, 0.2, 16, 100);
            const lakeEdgeMaterial = new THREE.MeshPhongMaterial({ color: 0x0077cc });
            const lakeEdge = new THREE.Mesh(lakeEdgeGeometry, lakeEdgeMaterial);
            lakeEdge.rotation.x = -Math.PI / 2;
            lakeEdge.position.copy(lake.position);
            this.scene.add(lakeEdge);

            // Göl yansıması efekti
            const reflectionGeometry = new THREE.CircleGeometry(lakeRadius * 0.9, 32);
            const reflectionMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.1
            });
            const reflection = new THREE.Mesh(reflectionGeometry, reflectionMaterial);
            reflection.rotation.x = -Math.PI / 2;
            reflection.position.set(lake.position.x, 0.06, lake.position.z);
            this.scene.add(reflection);

            // Modern apartmanları göl etrafına yerleştir
            const apartmentCount = Math.floor(Math.random() * 3) + 2;
            for (let j = 0; j < apartmentCount; j++) {
                const angle = (j / apartmentCount) * Math.PI * 2;
                const apartmentX = x + Math.cos(angle) * (lakeRadius + 15);
                const apartmentZ = z + Math.sin(angle) * (lakeRadius + 15);
                const apartment = createModernApartment(apartmentX, apartmentZ);
                this.scene.add(apartment);
                this.vehicleManager.addBuildingCollider(apartment);
            }
        }
    }

    addSkybox() {
        const skyGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }

    addBuildings() {
        // Bina renkleri
        const buildingColors = [0xe8c8a9, 0xd4b995, 0xc19a6b, 0xb38b6d];
        const windowColor = 0x666666;
        const roofColor = 0x8b4513;

        // Ev oluşturma fonksiyonu
        const createHouse = (x, z, scale = 1) => {
            const house = new THREE.Group();

            // Ana bina gövdesi
            const bodyGeometry = new THREE.BoxGeometry(3 * scale, 4 * scale, 3 * scale);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: buildingColors[Math.floor(Math.random() * buildingColors.length)]
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            house.add(body);

            // Çatı
            const roofGeometry = new THREE.ConeGeometry(2.2 * scale, 2 * scale, 4);
            const roofMaterial = new THREE.MeshPhongMaterial({ color: roofColor });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = 3 * scale;
            roof.rotation.y = Math.PI / 4;
            house.add(roof);

            // Pencereler
            const windowGeometry = new THREE.PlaneGeometry(0.6 * scale, 0.8 * scale);
            const windowMaterial = new THREE.MeshPhongMaterial({
                color: windowColor,
                transparent: true,
                opacity: 0.7
            });

            // Ön pencereler
            const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
            window1.position.set(-0.7 * scale, 0.5 * scale, 1.51 * scale);
            house.add(window1);

            const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
            window2.position.set(0.7 * scale, 0.5 * scale, 1.51 * scale);
            house.add(window2);

            // Kapı
            const doorGeometry = new THREE.PlaneGeometry(1 * scale, 2 * scale);
            const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x4a3728 });
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(0, -1 * scale, 1.51 * scale);
            house.add(door);

            house.position.set(x, 2 * scale, z);
            house.castShadow = true;
            house.receiveShadow = true;
            return house;
        };

        // Market oluşturma fonksiyonu
        const createMarket = (x, z) => {
            const market = new THREE.Group();

            // Market binası
            const buildingGeometry = new THREE.BoxGeometry(6, 4, 4);
            const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0xf0f0f0 });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            market.add(building);

            // Tente
            const awningGeometry = new THREE.BoxGeometry(7, 0.2, 2);
            const awningMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
            const awning = new THREE.Mesh(awningGeometry, awningMaterial);
            awning.position.set(0, 2, 2.5);
            market.add(awning);

            // Market yazısı (basit kutu olarak)
            const signGeometry = new THREE.BoxGeometry(4, 1, 0.2);
            const signMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
            const sign = new THREE.Mesh(signGeometry, signMaterial);
            sign.position.set(0, 1.5, 2.1);
            market.add(sign);

            // Vitrin camı
            const windowGeometry = new THREE.PlaneGeometry(5, 2);
            const windowMaterial = new THREE.MeshPhongMaterial({
                color: 0x666666,
                transparent: true,
                opacity: 0.5
            });
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(0, 0, 2.01);
            market.add(window);

            market.position.set(x, 2, z);
            market.castShadow = true;
            market.receiveShadow = true;
            return market;
        };

        // Apartman oluşturma fonksiyonu
        const createApartment = (x, z) => {
            const apartment = new THREE.Group();

            // Ana bina
            const buildingGeometry = new THREE.BoxGeometry(8, 15, 8);
            const buildingMaterial = new THREE.MeshPhongMaterial({
                color: buildingColors[Math.floor(Math.random() * buildingColors.length)]
            });
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            apartment.add(building);

            // Pencereler
            const windowGeometry = new THREE.PlaneGeometry(1, 1.2);
            const windowMaterial = new THREE.MeshPhongMaterial({
                color: windowColor,
                transparent: true,
                opacity: 0.7
            });

            // Her kat için pencereler
            for (let floor = 0; floor < 5; floor++) {
                for (let i = -2; i <= 2; i += 2) {
                    const window = new THREE.Mesh(windowGeometry, windowMaterial);
                    window.position.set(i, -5 + floor * 3, 4.01);
                    apartment.add(window);
                }
            }

            // Giriş kapısı
            const doorGeometry = new THREE.PlaneGeometry(2, 3);
            const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x4a3728 });
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(0, -6, 4.01);
            apartment.add(door);

            apartment.position.set(x, 7.5, z);
            apartment.castShadow = true;
            apartment.receiveShadow = true;
            return apartment;
        };

        // Binaları yerleştir - genişletilmiş aralıklar
        for (let z = -950; z < 950; z += 100) {
            let building;
            
            // Sol taraf
            if (Math.random() < 0.3) {
                building = createMarket(-30, z);
                this.scene.add(building);
                this.vehicleManager.addBuildingCollider(building);
            } else if (Math.random() < 0.5) {
                building = createApartment(-30, z);
                this.scene.add(building);
                this.vehicleManager.addBuildingCollider(building);
            } else {
                building = createHouse(-30, z, 1.5);
                this.scene.add(building);
                this.vehicleManager.addBuildingCollider(building);
            }

            // Sağ taraf
            if (Math.random() < 0.3) {
                building = createMarket(30, z);
                this.scene.add(building);
                this.vehicleManager.addBuildingCollider(building);
            } else if (Math.random() < 0.5) {
                building = createApartment(30, z);
                this.scene.add(building);
                this.vehicleManager.addBuildingCollider(building);
            } else {
                building = createHouse(30, z, 1.5);
                this.scene.add(building);
                this.vehicleManager.addBuildingCollider(building);
            }

            // İkinci sıra binalar
            if (Math.random() < 0.7) {
                building = createHouse(-45, z + 50, 1.2);
                this.scene.add(building);
                this.vehicleManager.addBuildingCollider(building);
                
                building = createHouse(45, z + 50, 1.2);
                this.scene.add(building);
                this.vehicleManager.addBuildingCollider(building);
            }
        }
    }

    update(playerPosition) {
        // İleride yol segmentlerini dinamik olarak oluşturmak için kullanılabilir
    }
} 