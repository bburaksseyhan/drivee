import * as THREE from 'three';

export class GaugeManager {
    constructor() {
        this.speedometer = null;
        this.rpmGauge = null;
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.currentRPM = 0;
        this.targetRPM = 0;
        this.lastUpdateTime = Date.now();
        this.createSpeedometer();
        this.createRPMGauge();
        // Initially hide the gauges
        this.hideGauges();
    }

    createSpeedometer() {
        // Create the main speedometer container
        this.speedometer = document.createElement('div');
        this.speedometer.style.position = 'absolute';
        this.speedometer.style.bottom = '20px';
        this.speedometer.style.right = '20px';
        this.speedometer.style.width = '150px';
        this.speedometer.style.height = '150px';
        this.speedometer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.speedometer.style.borderRadius = '50%';
        this.speedometer.style.border = '3px solid rgba(255, 255, 255, 0.3)';
        this.speedometer.style.zIndex = '1000';

        // Create the digital speed display
        const speedDisplay = document.createElement('div');
        speedDisplay.style.position = 'absolute';
        speedDisplay.style.width = '100%';
        speedDisplay.style.top = '50%';
        speedDisplay.style.transform = 'translateY(-50%)';
        speedDisplay.style.textAlign = 'center';
        speedDisplay.style.color = 'white';
        speedDisplay.style.fontFamily = 'Arial, sans-serif';
        speedDisplay.style.fontSize = '24px';
        speedDisplay.innerHTML = '0<br><span style="font-size: 14px">KM/H</span>';
        this.speedometer.appendChild(speedDisplay);

        // Create the needle
        const needle = document.createElement('div');
        needle.style.position = 'absolute';
        needle.style.width = '4px';
        needle.style.height = '60px';
        needle.style.backgroundColor = '#32CD32'; // Start with green
        needle.style.bottom = '75px';
        needle.style.left = '73px';
        needle.style.transformOrigin = 'bottom center';
        needle.style.transform = 'rotate(-120deg)';
        needle.style.transition = 'transform 0.3s ease-out, background-color 0.3s ease-out';
        this.speedometer.appendChild(needle);

        // Create speed zones (colored arcs)
        const zones = [
            { color: '#32CD32', start: -120, end: -60 }, // Green zone (0-50)
            { color: '#FFD700', start: -60, end: 0 },    // Yellow zone (50-100)
            { color: '#FF4500', start: 0, end: 120 }     // Red zone (100+)
        ];

        zones.forEach(zone => {
            const arc = document.createElement('div');
            arc.style.position = 'absolute';
            arc.style.width = '140px';
            arc.style.height = '140px';
            arc.style.bottom = '5px';
            arc.style.left = '5px';
            arc.style.borderRadius = '50%';
            arc.style.clip = 'rect(0, 140px, 140px, 70px)';
            arc.style.transform = `rotate(${zone.start}deg)`;
            arc.style.background = `linear-gradient(${90 - zone.start}deg, transparent 50%, ${zone.color} 50%)`;
            arc.style.opacity = '0.3';
            this.speedometer.appendChild(arc);
        });

        // Create speed markings with labels
        const speeds = [0, 50, 100, 150, 200];
        speeds.forEach((speed, index) => {
            const angle = -120 + (index * 60);
            
            // Create marking line
            const marking = document.createElement('div');
            marking.style.position = 'absolute';
            marking.style.width = '2px';
            marking.style.height = '12px';
            marking.style.backgroundColor = 'white';
            marking.style.transformOrigin = 'bottom center';
            marking.style.bottom = '5px';
            marking.style.left = '74px';
            marking.style.transform = `rotate(${angle}deg) translateY(-65px)`;
            this.speedometer.appendChild(marking);

            // Create speed label
            const label = document.createElement('div');
            label.style.position = 'absolute';
            label.style.color = 'white';
            label.style.fontSize = '12px';
            label.style.fontFamily = 'Arial, sans-serif';
            label.style.transform = `rotate(${angle}deg) translateY(-85px) rotate(${-angle}deg)`;
            label.style.transformOrigin = 'bottom center';
            label.style.bottom = '5px';
            label.style.left = '74px';
            label.textContent = speed;
            this.speedometer.appendChild(label);
        });

        document.body.appendChild(this.speedometer);
    }

    createRPMGauge() {
        // Create the main RPM gauge container
        this.rpmGauge = document.createElement('div');
        this.rpmGauge.style.position = 'absolute';
        this.rpmGauge.style.bottom = '20px';
        this.rpmGauge.style.right = '190px'; // Position to the left of speedometer
        this.rpmGauge.style.width = '150px';
        this.rpmGauge.style.height = '150px';
        this.rpmGauge.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.rpmGauge.style.borderRadius = '50%';
        this.rpmGauge.style.border = '3px solid rgba(255, 255, 255, 0.3)';
        this.rpmGauge.style.zIndex = '1000';

        // Create the digital RPM display
        const rpmDisplay = document.createElement('div');
        rpmDisplay.style.position = 'absolute';
        rpmDisplay.style.width = '100%';
        rpmDisplay.style.top = '50%';
        rpmDisplay.style.transform = 'translateY(-50%)';
        rpmDisplay.style.textAlign = 'center';
        rpmDisplay.style.color = 'white';
        rpmDisplay.style.fontFamily = 'Arial, sans-serif';
        rpmDisplay.style.fontSize = '24px';
        rpmDisplay.innerHTML = '0<br><span style="font-size: 14px">RPM</span>';
        this.rpmGauge.appendChild(rpmDisplay);

        // Create the needle
        const needle = document.createElement('div');
        needle.style.position = 'absolute';
        needle.style.width = '4px';
        needle.style.height = '60px';
        needle.style.backgroundColor = '#32CD32';
        needle.style.bottom = '75px';
        needle.style.left = '73px';
        needle.style.transformOrigin = 'bottom center';
        needle.style.transform = 'rotate(-120deg)';
        needle.style.transition = 'transform 0.3s ease-out, background-color 0.3s ease-out';
        this.rpmGauge.appendChild(needle);

        // Create RPM zones (colored arcs)
        const zones = [
            { color: '#32CD32', start: -120, end: -40 },  // Green zone (0-6000)
            { color: '#FFD700', start: -40, end: 40 },    // Yellow zone (6000-7000)
            { color: '#FF4500', start: 40, end: 120 }     // Red zone (7000-8000)
        ];

        zones.forEach(zone => {
            const arc = document.createElement('div');
            arc.style.position = 'absolute';
            arc.style.width = '140px';
            arc.style.height = '140px';
            arc.style.bottom = '5px';
            arc.style.left = '5px';
            arc.style.borderRadius = '50%';
            arc.style.clip = 'rect(0, 140px, 140px, 70px)';
            arc.style.transform = `rotate(${zone.start}deg)`;
            arc.style.background = `linear-gradient(${90 - zone.start}deg, transparent 50%, ${zone.color} 50%)`;
            arc.style.opacity = '0.3';
            this.rpmGauge.appendChild(arc);
        });

        // Create RPM markings with labels
        const rpms = [0, 2000, 4000, 6000, 7000, 8000];
        rpms.forEach((rpm, index) => {
            const angle = -120 + (index * 48); // Distribute evenly across 240 degrees
            
            // Create marking line
            const marking = document.createElement('div');
            marking.style.position = 'absolute';
            marking.style.width = '2px';
            marking.style.height = '12px';
            marking.style.backgroundColor = 'white';
            marking.style.transformOrigin = 'bottom center';
            marking.style.bottom = '5px';
            marking.style.left = '74px';
            marking.style.transform = `rotate(${angle}deg) translateY(-65px)`;
            this.rpmGauge.appendChild(marking);

            // Create RPM label
            const label = document.createElement('div');
            label.style.position = 'absolute';
            label.style.color = 'white';
            label.style.fontSize = '12px';
            label.style.fontFamily = 'Arial, sans-serif';
            label.style.transform = `rotate(${angle}deg) translateY(-85px) rotate(${-angle}deg)`;
            label.style.transformOrigin = 'bottom center';
            label.style.bottom = '5px';
            label.style.left = '74px';
            label.textContent = (rpm / 1000).toFixed(0);
            this.rpmGauge.appendChild(label);
        });

        document.body.appendChild(this.rpmGauge);
    }

    updateSpeedometer(speed) {
        if (!this.speedometer) return;
        
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = now;
        
        // Set target speed in KM/H
        this.targetSpeed = Math.round(speed * 3.6);
        
        // Smoothly interpolate current speed towards target speed
        const acceleration = 50; // Units per second
        const difference = this.targetSpeed - this.currentSpeed;
        
        if (Math.abs(difference) > 0.1) {
            // Accelerating
            if (difference > 0) {
                this.currentSpeed = Math.min(
                    this.targetSpeed,
                    this.currentSpeed + acceleration * deltaTime
                );
            }
            // Decelerating
            else {
                this.currentSpeed = Math.max(
                    this.targetSpeed,
                    this.currentSpeed - acceleration * deltaTime * 2 // Faster deceleration
                );
            }
        } else {
            this.currentSpeed = this.targetSpeed;
        }
        
        // Update digital display with smoothed speed
        const speedDisplay = this.speedometer.children[0];
        const displaySpeed = Math.round(this.currentSpeed);
        
        // Add speed indicator emoji based on speed range
        let speedIndicator = '';
        if (displaySpeed === 0) {
            speedIndicator = '⏹️'; // Stopped
        } else if (displaySpeed <= 50) {
            speedIndicator = '✅'; // Normal speed
        } else if (displaySpeed <= 100) {
            speedIndicator = '⚠️'; // Moderate speed
        } else {
            speedIndicator = '🛑'; // High speed
        }
        speedDisplay.innerHTML = `${displaySpeed} ${speedIndicator}<br><span style="font-size: 14px">KM/H</span>`;
        
        // Update needle color based on smoothed speed
        const needle = this.speedometer.children[1];
        if (displaySpeed <= 50) {
            needle.style.backgroundColor = '#32CD32'; // Green
            speedDisplay.style.color = '#32CD32';
        } else if (displaySpeed <= 100) {
            needle.style.backgroundColor = '#FFD700'; // Yellow
            speedDisplay.style.color = '#FFD700';
        } else {
            needle.style.backgroundColor = '#FF4500'; // Red
            speedDisplay.style.color = '#FF4500';
        }

        // Calculate and set needle rotation with smooth animation
        const maxSpeed = 200;
        const maxRotation = 240;
        const rotation = -120 + (Math.min(displaySpeed, maxSpeed) / maxSpeed * maxRotation);
        needle.style.transform = `rotate(${rotation}deg)`;

        // Update RPM gauge
        this.updateRPMGauge(speed);
    }

    updateRPMGauge(speed) {
        if (!this.rpmGauge) return;
        
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;
        
        // Calculate target RPM based on speed
        // Assuming a simple relationship between speed and RPM
        // In a real car, this would depend on the gear ratio and other factors
        this.targetRPM = Math.min(8000, Math.round(speed * 3.6 * 40));
        
        // Smoothly interpolate current RPM towards target RPM
        const acceleration = 500; // RPM per second
        const difference = this.targetRPM - this.currentRPM;
        
        if (Math.abs(difference) > 10) {
            // Accelerating
            if (difference > 0) {
                this.currentRPM = Math.min(
                    this.targetRPM,
                    this.currentRPM + acceleration * deltaTime
                );
            }
            // Decelerating
            else {
                this.currentRPM = Math.max(
                    this.targetRPM,
                    this.currentRPM - acceleration * deltaTime * 2
                );
            }
        } else {
            this.currentRPM = this.targetRPM;
        }
        
        // Update digital display
        const rpmDisplay = this.rpmGauge.children[0];
        const displayRPM = Math.round(this.currentRPM);
        
        // Add RPM indicator based on range
        let rpmIndicator = '';
        if (displayRPM === 0) {
            rpmIndicator = '⏹️'; // Idle
        } else if (displayRPM <= 6000) {
            rpmIndicator = '✅'; // Normal
        } else if (displayRPM <= 7000) {
            rpmIndicator = '⚠️'; // High
        } else {
            rpmIndicator = '🔥'; // Redline
        }
        rpmDisplay.innerHTML = `${displayRPM} ${rpmIndicator}<br><span style="font-size: 14px">RPM</span>`;
        
        // Update needle color based on RPM
        const needle = this.rpmGauge.children[1];
        if (displayRPM <= 6000) {
            needle.style.backgroundColor = '#32CD32'; // Green
            rpmDisplay.style.color = '#32CD32';
        } else if (displayRPM <= 7000) {
            needle.style.backgroundColor = '#FFD700'; // Yellow
            rpmDisplay.style.color = '#FFD700';
        } else {
            needle.style.backgroundColor = '#FF4500'; // Red
            rpmDisplay.style.color = '#FF4500';
        }

        // Calculate and set needle rotation
        const maxRPM = 8000;
        const maxRotation = 240;
        const rotation = -120 + (Math.min(displayRPM, maxRPM) / maxRPM * maxRotation);
        needle.style.transform = `rotate(${rotation}deg)`;
    }

    resetGauges() {
        this.targetSpeed = 0;
        this.currentSpeed = 0;
        this.targetRPM = 0;
        this.currentRPM = 0;
        this.updateSpeedometer(0);
        this.updateRPMGauge(0);
    }

    hideGauges() {
        if (this.speedometer) {
            this.speedometer.style.display = 'none';
        }
        if (this.rpmGauge) {
            this.rpmGauge.style.display = 'none';
        }
    }

    showGauges() {
        if (this.speedometer) {
            this.speedometer.style.display = 'block';
        }
        if (this.rpmGauge) {
            this.rpmGauge.style.display = 'block';
        }
    }
} 