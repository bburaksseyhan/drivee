import * as THREE from 'three';

export class SelectableVehicleManager {
    constructor() {
        this.vehicles = [
            {
                id: 'sports-car',
                name: 'Sports Car',
                model: {
                    dimensions: { length: 4.5, width: 2, height: 1.2 },
                    color: 0xff0000,
                },
                stats: {
                    maxSpeed: 100,
                    acceleration: 0.8,
                    handling: 0.9,
                    braking: 0.85
                }
            },
            {
                id: 'suv',
                name: 'SUV',
                model: {
                    dimensions: { length: 5, width: 2.2, height: 1.8 },
                    color: 0x0066cc,
                },
                stats: {
                    maxSpeed: 70,
                    acceleration: 0.5,
                    handling: 0.6,
                    braking: 0.7
                }
            },
            {
                id: 'truck',
                name: 'Truck',
                model: {
                    dimensions: { length: 6, width: 2.5, height: 2.5 },
                    color: 0x666666,
                },
                stats: {
                    maxSpeed: 50,
                    acceleration: 0.3,
                    handling: 0.4,
                    braking: 0.6
                }
            },
            {
                id: 'classic',
                name: 'Classic Car',
                model: {
                    dimensions: { length: 4.8, width: 1.9, height: 1.4 },
                    color: 0x00ff00,
                },
                stats: {
                    maxSpeed: 80,
                    acceleration: 0.6,
                    handling: 0.7,
                    braking: 0.75
                }
            }
        ];

        this.selectedVehicle = this.vehicles[0]; // Default to sports car
    }

    getVehicles() {
        return this.vehicles;
    }

    getSelectedVehicle() {
        return this.selectedVehicle;
    }

    selectVehicle(vehicleId) {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            this.selectedVehicle = vehicle;
            return true;
        }
        return false;
    }

    createVehicleModel(scene, vehicleData) {
        const vehicle = new THREE.Group();
        const { dimensions, color } = vehicleData.model;

        // Gövde
        const bodyGeometry = new THREE.BoxGeometry(
            dimensions.width,
            dimensions.height,
            dimensions.length
        );
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: color,
            specular: 0x666666,
            shininess: 100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = dimensions.height / 2;
        body.castShadow = true;
        vehicle.add(body);

        // Kabin
        const cabinWidth = dimensions.width * 0.9;
        const cabinHeight = dimensions.height * 0.8;
        const cabinLength = dimensions.length * 0.4;
        const cabinGeometry = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
        const cabinMaterial = new THREE.MeshPhongMaterial({
            color: color,
            specular: 0x666666,
            shininess: 100
        });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(0, dimensions.height + cabinHeight / 2 - 0.2, -dimensions.length * 0.1);
        cabin.castShadow = true;
        vehicle.add(cabin);

        // Tekerlekler
        const wheelRadius = dimensions.height * 0.4;
        const wheelThickness = dimensions.width * 0.2;
        const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 32);
        const wheelMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            specular: 0x444444,
            shininess: 50
        });

        const wheelPositions = [
            { x: -dimensions.width / 2, y: wheelRadius, z: dimensions.length / 3 },
            { x: dimensions.width / 2, y: wheelRadius, z: dimensions.length / 3 },
            { x: -dimensions.width / 2, y: wheelRadius, z: -dimensions.length / 3 },
            { x: dimensions.width / 2, y: wheelRadius, z: -dimensions.length / 3 }
        ];

        wheelPositions.forEach((pos, index) => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, pos.y, pos.z);
            wheel.castShadow = true;
            vehicle.add(wheel);

            // Jant kapakları
            const hubcapGeometry = new THREE.CircleGeometry(wheelRadius * 0.6, 16);
            const hubcapMaterial = new THREE.MeshPhongMaterial({
                color: 0xcccccc,
                specular: 0xffffff,
                shininess: 100
            });
            const hubcap = new THREE.Mesh(hubcapGeometry, hubcapMaterial);
            hubcap.position.x = wheelThickness / 2 + 0.01;
            hubcap.rotation.y = Math.PI / 2;
            wheel.add(hubcap);
        });

        // Farlar
        const headlightGeometry = new THREE.CircleGeometry(dimensions.width * 0.1, 16);
        const headlightMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.5
        });

        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(
            -dimensions.width / 3,
            dimensions.height / 2,
            dimensions.length / 2
        );
        vehicle.add(leftHeadlight);

        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(
            dimensions.width / 3,
            dimensions.height / 2,
            dimensions.length / 2
        );
        vehicle.add(rightHeadlight);

        return vehicle;
    }

    getVehicleStats() {
        return this.selectedVehicle.stats;
    }
} 