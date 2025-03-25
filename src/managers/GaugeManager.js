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
        this.speedometer = document.createElement('div');
        this.speedometer.className = 'speedometer';
        this.speedometer.style.position = 'fixed';
        this.speedometer.style.bottom = '20px';
        this.speedometer.style.right = '20px';
        this.speedometer.style.width = '150px';
        this.speedometer.style.height = '150px';
        this.speedometer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.speedometer.style.borderRadius = '50%';
        this.speedometer.style.display = 'none';
        this.speedometer.style.zIndex = '1000';
        this.speedometer.style.padding = '10px';
        this.speedometer.style.boxSizing = 'border-box';

        // Create speed value display
        const speedValue = document.createElement('div');
        speedValue.className = 'speed-value';
        speedValue.style.position = 'absolute';
        speedValue.style.top = '50%';
        speedValue.style.left = '50%';
        speedValue.style.transform = 'translate(-50%, -50%)';
        speedValue.style.fontSize = '24px';
        speedValue.style.fontWeight = 'bold';
        speedValue.style.color = '#00C851';
        speedValue.style.textAlign = 'center';
        speedValue.innerHTML = '0<br><span style="font-size: 14px">KM/H</span>';

        // Create speed needle
        const needle = document.createElement('div');
        needle.className = 'needle';
        needle.style.position = 'absolute';
        needle.style.top = '50%';
        needle.style.left = '50%';
        needle.style.width = '4px';
        needle.style.height = '60px';
        needle.style.backgroundColor = '#00C851';
        needle.style.transformOrigin = 'bottom center';
        needle.style.transform = 'rotate(-90deg)';

        // Create speed text
        const speedText = document.createElement('div');
        speedText.className = 'speed-text';
        speedText.style.position = 'absolute';
        speedText.style.bottom = '10px';
        speedText.style.left = '50%';
        speedText.style.transform = 'translateX(-50%)';
        speedText.style.fontSize = '16px';
        speedText.style.color = '#ffffff';
        speedText.textContent = '0 km/h';

        // Add all elements to speedometer
        this.speedometer.appendChild(speedValue);
        this.speedometer.appendChild(needle);
        this.speedometer.appendChild(speedText);

        document.body.appendChild(this.speedometer);
    }

    createRPMGauge() {
        // Create the main RPM gauge container
        this.rpmGauge = document.createElement('div');
        this.rpmGauge.style.position = 'fixed';
        this.rpmGauge.style.bottom = '20px';
        this.rpmGauge.style.right = '20px';
        this.rpmGauge.style.width = '150px';
        this.rpmGauge.style.height = '150px';
        this.rpmGauge.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.rpmGauge.style.borderRadius = '50%';
        this.rpmGauge.style.border = '3px solid rgba(255, 255, 255, 0.3)';
        this.rpmGauge.style.zIndex = '1000';
        this.rpmGauge.style.display = 'none';

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

        // Update speed text
        const speedText = this.speedometer.querySelector('.speed-text');
        if (speedText) {
            speedText.textContent = `${Math.round(speed)} km/h`;
        }

        // Update speed needle rotation
        const needle = this.speedometer.querySelector('.needle');
        if (needle) {
            // Calculate rotation based on speed (0-200 km/h maps to -90 to 90 degrees)
            const rotation = (speed / 200) * 180 - 90;
            needle.style.transform = `rotate(${rotation}deg)`;
        }

        // Update speed color based on value
        const speedValue = this.speedometer.querySelector('.speed-value');
        if (speedValue) {
            if (speed >= 150) {
                speedValue.style.color = '#ff4444'; // Red for high speed
            } else if (speed >= 100) {
                speedValue.style.color = '#ffbb33'; // Yellow for medium speed
            } else {
                speedValue.style.color = '#00C851'; // Green for normal speed
            }
        }

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
            this.speedometer.style.display = 'none';
        }
        if (this.rpmGauge) {
            this.rpmGauge.style.display = 'block';
        }
    }

    updateGaugeSize(size) {
        const dimensions = size === 'small' ? '100px' : '150px';
        const fontSize = size === 'small' ? '18px' : '24px';
        const needleHeight = size === 'small' ? '40px' : '60px';

        // Update speedometer size
        if (this.speedometer) {
            this.speedometer.style.width = dimensions;
            this.speedometer.style.height = dimensions;
            const speedDisplay = this.speedometer.querySelector('div');
            if (speedDisplay) {
                speedDisplay.style.fontSize = fontSize;
            }
            const needle = this.speedometer.querySelector('div:nth-child(3)');
            if (needle) {
                needle.style.height = needleHeight;
            }
        }

        // Update RPM gauge size
        if (this.rpmGauge) {
            this.rpmGauge.style.width = dimensions;
            this.rpmGauge.style.height = dimensions;
            const rpmDisplay = this.rpmGauge.querySelector('div');
            if (rpmDisplay) {
                rpmDisplay.style.fontSize = fontSize;
            }
            const needle = this.rpmGauge.querySelector('div:nth-child(3)');
            if (needle) {
                needle.style.height = needleHeight;
            }
        }
    }
} 