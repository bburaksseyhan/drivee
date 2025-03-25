import { SplashScreen } from './SplashScreen.js';
import { MenuScreen } from './MenuScreen.js';

class Game {
    constructor() {
        this.splashScreen = null;
        this.menuScreen = null;
        this.init();
    }

    async init() {
        // DOM yüklendiğinde ekranları oluştur
        this.splashScreen = new SplashScreen();
        this.menuScreen = new MenuScreen();
        
        // Splash screen'i göster
        this.splashScreen.show();
    }
}

// DOM yüklendiğinde oyunu başlat
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
