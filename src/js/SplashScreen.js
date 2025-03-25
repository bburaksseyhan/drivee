import { gsap } from 'gsap';

export class SplashScreen {
    constructor() {
        this.container = document.getElementById('splash-screen');
        this.loadingCar = document.getElementById('loading-car');
        this.loadingText = document.querySelector('.loading-text');
        this.animationFrame = null;
        this.startTime = null;
    }

    show() {
        this.container.classList.remove('hidden');
        this.startLoadingAnimation();
    }

    hide() {
        this.container.classList.add('hidden');
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    updateLoadingProgress(progress) {
        if (this.loadingText) {
            this.loadingText.textContent = `Loading... ${Math.round(progress)}%`;
        }
    }

    startLoadingAnimation() {
        this.startTime = performance.now();
        const duration = 2000; // 2 saniye

        const animate = (currentTime) => {
            const elapsed = currentTime - this.startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);

            this.updateLoadingProgress(progress);

            if (progress < 100) {
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                this.hide();
                document.getElementById('menu-container').classList.remove('hidden');
            }
        };

        this.animationFrame = requestAnimationFrame(animate);
    }
}
