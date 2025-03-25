import * as THREE from 'three';

export class DeviceManager {
    constructor() {
        this.virtualControls = null;
    }

    isMobileDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        // Check for Android
        if (/android/i.test(userAgent)) {
            console.log('Device detected: Android');
            return true;
        }
        // Check for iOS
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            console.log('Device detected: iOS');
            return true;
        }
        console.log('Device detected: Not a mobile device');
        return false;
    }

    applyDeviceSpecificStyles() {
        if (this.isMobileDevice()) {
            console.log('Applying smaller styles for mobile devices');
            // Apply smaller styles for mobile devices
            const buttons = this.virtualControls.querySelectorAll('button');
            buttons.forEach(button => {
                button.style.width = '10px';
                button.style.height = '10px';
                button.style.fontSize = '5px';
                console.log('Applied smaller styles to button:', button);
            });
        }
    }

    createVirtualControls() {
        if (!this.isMobileDevice()) {
            return; // Do not create controls if not on a mobile device
        }
        // Create container for virtual controls
        this.virtualControls = document.createElement('div');
        this.virtualControls.style.position = 'fixed';
        this.virtualControls.style.bottom = '10px';
        this.virtualControls.style.left = '50%';
        this.virtualControls.style.transform = 'translateX(-50%)';
        this.virtualControls.style.display = 'flex';
        this.virtualControls.style.justifyContent = 'center';
        this.virtualControls.style.gap = '10px';
        this.virtualControls.style.zIndex = '1000';

        // Create left button
        const leftButton = document.createElement('button');
        leftButton.textContent = '◀';
        leftButton.style.width = '50px';
        leftButton.style.height = '50px';
        leftButton.style.borderRadius = '50%';
        leftButton.style.border = 'none';
        leftButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        leftButton.style.color = 'white';
        leftButton.style.fontSize = '24px';
        leftButton.style.cursor = 'pointer';
        leftButton.style.outline = 'none';
        this.virtualControls.appendChild(leftButton);

        // Create right button
        const rightButton = document.createElement('button');
        rightButton.textContent = '▶';
        rightButton.style.width = '50px';
        rightButton.style.height = '50px';
        rightButton.style.borderRadius = '50%';
        rightButton.style.border = 'none';
        rightButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        rightButton.style.color = 'white';
        rightButton.style.fontSize = '24px';
        rightButton.style.cursor = 'pointer';
        rightButton.style.outline = 'none';
        this.virtualControls.appendChild(rightButton);

        // Append to body
        document.body.appendChild(this.virtualControls);

        // Apply device-specific styles
        this.applyDeviceSpecificStyles();
    }

    showVirtualControls() {
        if (this.virtualControls) {
            this.virtualControls.style.display = 'flex';
        }
    }

    hideVirtualControls() {
        if (this.virtualControls) {
            this.virtualControls.style.display = 'none';
        }
    }
} 