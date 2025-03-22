export class HistoryManager {
    constructor() {
        this.historyPanel = null;
        this.historyButton = null;
        this.statsDisplay = null;
        this.isHistoryVisible = false;
        this.gameHistory = [];
        this.maxHistoryEntries = 10;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        this.loadGameHistory();
        this.createHistoryButton();
        this.createHistoryPanel();
        this.createStatsDisplay();
        this.initialized = true;
        
        console.log('HistoryManager initialized');
    }

    createHistoryButton() {
        this.historyButton = document.createElement('div');
        this.historyButton.style.position = 'absolute';
        this.historyButton.style.top = '20px';
        this.historyButton.style.left = '90px'; // Position next to pause button
        this.historyButton.style.width = '50px';
        this.historyButton.style.height = '50px';
        this.historyButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.historyButton.style.color = 'white';
        this.historyButton.style.borderRadius = '50%';
        this.historyButton.style.display = 'flex';
        this.historyButton.style.justifyContent = 'center';
        this.historyButton.style.alignItems = 'center';
        this.historyButton.style.fontSize = '24px';
        this.historyButton.style.cursor = 'pointer';
        this.historyButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        this.historyButton.style.zIndex = '1000';
        this.historyButton.innerHTML = '📊';
        this.historyButton.title = 'Game History';
        
        this.historyButton.addEventListener('click', () => this.toggleHistoryPanel());
        document.body.appendChild(this.historyButton);
    }

    createHistoryPanel() {
        this.historyPanel = document.createElement('div');
        this.historyPanel.style.position = 'absolute';
        this.historyPanel.style.top = '50%';
        this.historyPanel.style.left = '50%';
        this.historyPanel.style.transform = 'translate(-50%, -50%)';
        this.historyPanel.style.width = '400px';
        this.historyPanel.style.maxHeight = '80vh';
        this.historyPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.historyPanel.style.color = 'white';
        this.historyPanel.style.padding = '20px';
        this.historyPanel.style.borderRadius = '10px';
        this.historyPanel.style.display = 'none';
        this.historyPanel.style.flexDirection = 'column';
        this.historyPanel.style.gap = '10px';
        this.historyPanel.style.zIndex = '1001';
        this.historyPanel.style.overflowY = 'auto';
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.right = '10px';
        closeButton.style.top = '10px';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = 'white';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => this.toggleHistoryPanel());
        this.historyPanel.appendChild(closeButton);
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Game History';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        this.historyPanel.appendChild(title);
        
        // Add clear history button
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear History';
        clearButton.style.padding = '8px 16px';
        clearButton.style.marginTop = '10px';
        clearButton.style.backgroundColor = '#f44336';
        clearButton.style.color = 'white';
        clearButton.style.border = 'none';
        clearButton.style.borderRadius = '5px';
        clearButton.style.cursor = 'pointer';
        clearButton.addEventListener('click', () => this.clearGameHistory());
        this.historyPanel.appendChild(clearButton);
        
        document.body.appendChild(this.historyPanel);
        this.updateHistoryPanel();
    }

    createStatsDisplay() {
        this.statsDisplay = document.createElement('div');
        this.statsDisplay.style.position = 'absolute';
        this.statsDisplay.style.top = '130px';
        this.statsDisplay.style.right = '20px';
        this.statsDisplay.style.color = 'white';
        this.statsDisplay.style.fontSize = '16px';
        this.statsDisplay.style.fontFamily = 'Arial, sans-serif';
        this.statsDisplay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        this.statsDisplay.style.padding = '10px';
        this.statsDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        this.statsDisplay.style.borderRadius = '5px';
        document.body.appendChild(this.statsDisplay);
        this.updateStatsDisplay();
    }

    toggleHistoryPanel() {
        this.isHistoryVisible = !this.isHistoryVisible;
        this.historyPanel.style.display = this.isHistoryVisible ? 'flex' : 'none';
        this.updateHistoryPanel();
    }

    updateHistoryPanel() {
        if (!this.isHistoryVisible) return;

        // Remove existing history entries
        while (this.historyPanel.children.length > 3) { // Keep title, close button, and clear button
            this.historyPanel.removeChild(this.historyPanel.lastChild);
        }

        // Add history entries
        this.gameHistory.forEach((entry, index) => {
            const entryDiv = document.createElement('div');
            entryDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            entryDiv.style.padding = '10px';
            entryDiv.style.borderRadius = '5px';
            entryDiv.style.marginBottom = '5px';
            
            const date = new Date(entry.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            entryDiv.innerHTML = `
                <div style="font-weight: bold; color: ${entry.isHighScore ? '#FFD700' : 'white'}">
                    ${index + 1}. Score: ${entry.score} ${entry.isHighScore ? '🏆' : ''}
                </div>
                <div>Distance: ${entry.distance.toFixed(1)} km</div>
                <div>Time: ${this.formatTime(entry.time)}</div>
                <div>Level: ${entry.level}</div>
                <div style="font-size: 0.8em; color: #888;">${formattedDate}</div>
            `;
            
            this.historyPanel.appendChild(entryDiv);
        });

        if (this.gameHistory.length === 0) {
            const noHistoryDiv = document.createElement('div');
            noHistoryDiv.style.textAlign = 'center';
            noHistoryDiv.style.color = '#888';
            noHistoryDiv.textContent = 'No game history yet';
            this.historyPanel.appendChild(noHistoryDiv);
        }
    }

    updateStatsDisplay() {
        if (!this.statsDisplay) return;

        const highScore = this.getHighScore();
        const bestDistance = this.getBestDistance();
        const bestTime = this.getBestTime();

        this.statsDisplay.innerHTML = `
            High Score: ${highScore}<br>
            Best Distance: ${bestDistance.toFixed(1)} km<br>
            Best Time: ${this.formatTime(bestTime)}
        `;
    }

    saveGameStats(score, distance, time, level) {
        const entry = {
            score,
            distance,
            time,
            level,
            timestamp: Date.now(),
            isHighScore: score > this.getHighScore()
        };

        this.gameHistory.unshift(entry);
        if (this.gameHistory.length > this.maxHistoryEntries) {
            this.gameHistory.pop();
        }

        localStorage.setItem('gameHistory', JSON.stringify(this.gameHistory));
        this.updateHistoryPanel();
        this.updateStatsDisplay();
    }

    loadGameHistory() {
        const savedHistory = localStorage.getItem('gameHistory');
        this.gameHistory = savedHistory ? JSON.parse(savedHistory) : [];
    }

    clearGameHistory() {
        this.gameHistory = [];
        localStorage.removeItem('gameHistory');
        this.updateHistoryPanel();
        this.updateStatsDisplay();
    }

    getHighScore() {
        return this.gameHistory.length > 0 
            ? Math.max(...this.gameHistory.map(entry => entry.score))
            : 0;
    }

    getBestDistance() {
        return this.gameHistory.length > 0
            ? Math.max(...this.gameHistory.map(entry => entry.distance))
            : 0;
    }

    getBestTime() {
        return this.gameHistory.length > 0
            ? Math.max(...this.gameHistory.map(entry => entry.time))
            : 0;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    getBestStats() {
        // Load history if not already loaded
        if (this.gameHistory.length === 0) {
            this.loadGameHistory();
        }

        // Initialize best stats
        let bestStats = {
            score: 0,
            distance: 0,
            time: 0
        };

        // Find best scores from history
        this.gameHistory.forEach(entry => {
            bestStats.score = Math.max(bestStats.score, entry.score || 0);
            bestStats.distance = Math.max(bestStats.distance, entry.distance || 0);
            bestStats.time = Math.max(bestStats.time, entry.time || 0);
        });

        return bestStats;
    }
} 