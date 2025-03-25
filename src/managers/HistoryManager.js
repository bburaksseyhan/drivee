export class HistoryManager {
    constructor() {
        this.historyPanel = null;
        this.historyButton = null;
        this.statsDisplay = null;
        this.isHistoryVisible = false;
        this.gameHistory = [];
        this.maxHistoryEntries = 10;
        this.initialized = false;
        this.badgeManager = null;
    }

    setBadgeManager(badgeManager) {
        this.badgeManager = badgeManager;
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
        this.historyButton.style.top = '130px'; // Position below Level text
        this.historyButton.style.left = '20px'; // Align with left side
        this.historyButton.style.width = '45px';
        this.historyButton.style.height = '45px';
        this.historyButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.historyButton.style.color = 'white';
        this.historyButton.style.borderRadius = '8px';
        this.historyButton.style.display = 'none'; // Initially hidden
        this.historyButton.style.justifyContent = 'center';
        this.historyButton.style.alignItems = 'center';
        this.historyButton.style.fontSize = '22px';
        this.historyButton.style.cursor = 'pointer';
        this.historyButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        this.historyButton.style.zIndex = '1000';
        this.historyButton.style.transition = 'all 0.2s ease';
        this.historyButton.innerHTML = '📈';
        this.historyButton.title = 'Game History';
        
        // Add hover effect
        this.historyButton.addEventListener('mouseover', () => {
            this.historyButton.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            this.historyButton.style.transform = 'scale(1.05)';
            this.historyButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        });
        
        this.historyButton.addEventListener('mouseout', () => {
            this.historyButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            this.historyButton.style.transform = 'scale(1)';
            this.historyButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        });
        
        this.historyButton.addEventListener('click', () => this.toggleHistoryPanel());
        document.body.appendChild(this.historyButton);
    }

    showHistoryButton() {
        if (this.historyButton) {
            this.historyButton.style.display = 'flex';
        }
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
            entryDiv.style.padding = '15px';
            entryDiv.style.borderRadius = '10px';
            entryDiv.style.marginBottom = '15px';
            
            const date = new Date(entry.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            // Create main stats section
            const statsSection = document.createElement('div');
            statsSection.innerHTML = `
                <div style="font-weight: bold; color: ${entry.isHighScore ? '#FFD700' : 'white'}">
                    ${index + 1}. Score: ${entry.score} ${entry.isHighScore ? '🏆' : ''}
                </div>
                <div>Distance: ${entry.distance.toFixed(1)} km</div>
                <div>Time: ${this.formatTime(entry.time)}</div>
                <div>Level: ${entry.level}</div>
                <div style="font-size: 0.8em; color: #888;">${formattedDate}</div>
            `;
            entryDiv.appendChild(statsSection);

            // Add badges section if there are badges
            if (entry.badges && entry.badges.length > 0) {
                const badgesSection = document.createElement('div');
                badgesSection.style.marginTop = '10px';
                badgesSection.style.padding = '10px';
                badgesSection.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                badgesSection.style.borderRadius = '5px';
                
                const badgeTitle = document.createElement('div');
                badgeTitle.textContent = 'Badges Earned:';
                badgeTitle.style.marginBottom = '5px';
                badgeTitle.style.color = '#FFD700';
                badgesSection.appendChild(badgeTitle);

                const badgeGrid = document.createElement('div');
                badgeGrid.style.display = 'flex';
                badgeGrid.style.flexWrap = 'wrap';
                badgeGrid.style.gap = '5px';

                entry.badges.forEach(badgeId => {
                    const badge = this.findBadgeDetails(badgeId);
                    if (badge) {
                        const badgeElement = document.createElement('div');
                        badgeElement.title = badge.name;
                        badgeElement.style.fontSize = '20px';
                        badgeElement.style.cursor = 'pointer';
                        badgeElement.textContent = badge.icon;
                        badgeElement.addEventListener('mouseover', () => {
                            this.showBadgeTooltip(badgeElement, badge);
                        });
                        badgeElement.addEventListener('mouseout', () => {
                            this.hideBadgeTooltip();
                        });
                        badgeGrid.appendChild(badgeElement);
                    }
                });

                badgesSection.appendChild(badgeGrid);
                entryDiv.appendChild(badgesSection);
            }

            // Add share buttons
            const shareSection = document.createElement('div');
            shareSection.style.marginTop = '10px';
            shareSection.style.display = 'flex';
            shareSection.style.gap = '10px';
            shareSection.style.justifyContent = 'flex-end';

            // Twitter share button
            const twitterButton = this.createShareButton('Twitter', '#1DA1F2', () => {
                this.shareOnTwitter(entry);
            });
            shareSection.appendChild(twitterButton);

            // Facebook share button
            const facebookButton = this.createShareButton('Facebook', '#4267B2', () => {
                this.shareOnFacebook(entry);
            });
            shareSection.appendChild(facebookButton);

            // Copy link button
            const copyButton = this.createShareButton('Copy', '#666666', () => {
                this.copyShareLink(entry);
            });
            shareSection.appendChild(copyButton);

            entryDiv.appendChild(shareSection);
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

    createShareButton(platform, color, onClick) {
        const button = document.createElement('button');
        button.textContent = platform;
        button.style.padding = '5px 10px';
        button.style.backgroundColor = color;
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '12px';
        button.addEventListener('click', onClick);
        return button;
    }

    shareOnTwitter(entry) {
        const text = this.createShareText(entry);
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }

    shareOnFacebook(entry) {
        const text = this.createShareText(entry);
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }

    copyShareLink(entry) {
        const text = this.createShareText(entry);
        navigator.clipboard.writeText(text).then(() => {
            alert('Share text copied to clipboard!');
        });
    }

    createShareText(entry) {
        let text = `🎮 Just scored ${entry.score} points in Road Runner!`;
        text += `\n🛣️ Distance: ${entry.distance.toFixed(1)} km`;
        text += `\n⏱️ Time: ${this.formatTime(entry.time)}`;
        
        if (entry.badges && entry.badges.length > 0) {
            text += '\n🏆 Badges earned:';
            entry.badges.forEach(badgeId => {
                const badge = this.findBadgeDetails(badgeId);
                if (badge) {
                    text += ` ${badge.icon}`;
                }
            });
        }
        
        if (entry.isHighScore) {
            text += '\n🌟 New High Score!';
        }
        
        text += '\n\nCan you beat my score? Play now!';
        return text;
    }

    findBadgeDetails(badgeId) {
        if (!this.badgeManager) return null;
        
        for (const category in this.badgeManager.badges) {
            const badge = this.badgeManager.badges[category].find(b => b.id === badgeId);
            if (badge) return badge;
        }
        return null;
    }

    showBadgeTooltip(element, badge) {
        const tooltip = document.createElement('div');
        tooltip.className = 'badge-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '10px';
        tooltip.style.borderRadius = '5px';
        tooltip.style.fontSize = '14px';
        tooltip.style.zIndex = '1002';
        tooltip.style.maxWidth = '200px';
        tooltip.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        tooltip.innerHTML = `
            <div style="font-weight: bold; color: #FFD700">${badge.name}</div>
            <div style="margin-top: 5px">${badge.description}</div>
        `;

        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom + 5}px`;

        document.body.appendChild(tooltip);
    }

    hideBadgeTooltip() {
        const tooltip = document.querySelector('.badge-tooltip');
        if (tooltip) {
            tooltip.remove();
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
            isHighScore: score > this.getHighScore(),
            badges: this.badgeManager ? Array.from(this.badgeManager.unlockedBadges) : []
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