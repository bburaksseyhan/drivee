import { GameScreen } from './GameScreen.js';
import { SelectableVehicleManager } from './managers/vehicle/SelectableVehicleManager.js';

export class MenuScreen {
    constructor() {
        this.container = document.getElementById('menu-container');
        this.gameScreen = null;
        this.vehicleManager = new SelectableVehicleManager();
        this.setupButtons();
    }

    setupButtons() {
        // Start Game butonu
        const startButton = document.getElementById('start-button');
        startButton.addEventListener('click', () => {
            if (!this.gameScreen) {
                this.gameScreen = new GameScreen();
            }
            this.hide();
            this.gameScreen.show();
        });

        // Cars butonu
        const carsButton = document.getElementById('cars-button');
        const carsModal = document.getElementById('cars-modal');
        const closeCarsModal = document.getElementById('close-cars-modal');

        carsButton.addEventListener('click', () => {
            this.showCarsModal();
        });

        closeCarsModal.addEventListener('click', () => {
            carsModal.classList.add('hidden');
        });

        // Medals butonu
        const medalsButton = document.getElementById('medals-button');
        const medalsModal = document.getElementById('medals-modal');
        const closeMedalsModal = document.getElementById('close-medals-modal');

        medalsButton.addEventListener('click', () => {
            this.showMedalsModal();
        });

        closeMedalsModal.addEventListener('click', () => {
            medalsModal.classList.add('hidden');
        });

        // Modal dışına tıklandığında kapatma
        window.addEventListener('click', (e) => {
            if (e.target === carsModal) {
                carsModal.classList.add('hidden');
            }
            if (e.target === medalsModal) {
                medalsModal.classList.add('hidden');
            }
        });
    }

    showCarsModal() {
        const carsModal = document.getElementById('cars-modal');
        const carsGrid = document.getElementById('cars-grid');
        carsGrid.innerHTML = ''; // Grid'i temizle

        // Arabaları listele
        this.vehicleManager.getVehicles().forEach(vehicle => {
            const carItem = document.createElement('div');
            carItem.className = 'car-item';
            carItem.innerHTML = `
                <div class="car-preview" style="background-color: #${vehicle.model.color.toString(16)}"></div>
                <h3 class="car-name">${vehicle.name}</h3>
                <div class="car-stats">
                    <p>Max Speed: ${vehicle.stats.maxSpeed}</p>
                    <p>Acceleration: ${vehicle.stats.acceleration}</p>
                    <p>Handling: ${vehicle.stats.handling}</p>
                    <p>Braking: ${vehicle.stats.braking}</p>
                </div>
            `;

            carItem.addEventListener('click', () => {
                this.vehicleManager.selectVehicle(vehicle.id);
                // Seçili arabayı vurgula
                document.querySelectorAll('.car-item').forEach(item => {
                    item.classList.remove('selected');
                });
                carItem.classList.add('selected');
            });

            if (vehicle.id === this.vehicleManager.getSelectedVehicle().id) {
                carItem.classList.add('selected');
            }

            carsGrid.appendChild(carItem);
        });

        carsModal.classList.remove('hidden');
    }

    showMedalsModal() {
        const medalsModal = document.getElementById('medals-modal');
        const medalsGrid = document.getElementById('medals-grid');
        medalsGrid.innerHTML = ''; // Grid'i temizle

        // Örnek madalyalar
        const medals = [
            { name: 'Speed Demon', description: 'Reach max speed', achieved: false },
            { name: 'Perfect Driver', description: 'Complete a lap without collision', achieved: false },
            { name: 'Explorer', description: 'Visit all areas of the map', achieved: false },
            { name: 'Drift King', description: 'Perform 10 perfect drifts', achieved: false }
        ];

        medals.forEach(medal => {
            const medalItem = document.createElement('div');
            medalItem.className = `medal-item ${medal.achieved ? 'achieved' : 'locked'}`;
            medalItem.innerHTML = `
                <h3 class="medal-name">${medal.name}</h3>
                <p class="medal-description">${medal.description}</p>
                <div class="medal-status">${medal.achieved ? 'Achieved' : 'Locked'}</div>
            `;
            medalsGrid.appendChild(medalItem);
        });

        medalsModal.classList.remove('hidden');
    }

    show() {
        this.container.classList.remove('hidden');
    }

    hide() {
        this.container.classList.add('hidden');
    }
}
