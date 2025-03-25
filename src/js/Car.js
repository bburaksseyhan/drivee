import * as THREE from 'three';

export class Car {
    constructor() {
        this.mesh = this.createCarMesh();
    }

    createCarMesh() {
        // Create a simple car mesh (this can be replaced with a loaded 3D model later)
        const carGroup = new THREE.Group();

        // Car body
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        carGroup.add(body);

        // Car roof
        const roofGeometry = new THREE.BoxGeometry(1.5, 0.8, 2);
        const roofMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.4;
        roof.position.z = -0.3;
        roof.castShadow = true;
        carGroup.add(roof);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        
        const wheelPositions = [
            { x: -1, y: 0.4, z: -1.2 },
            { x: 1, y: 0.4, z: -1.2 },
            { x: -1, y: 0.4, z: 1.2 },
            { x: 1, y: 0.4, z: 1.2 }
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, pos.y, pos.z);
            wheel.castShadow = true;
            carGroup.add(wheel);
        });

        return carGroup;
    }

    getMesh() {
        return this.mesh;
    }

    update() {
        // Add car animation or movement logic here
    }
}
