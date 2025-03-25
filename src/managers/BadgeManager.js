import * as THREE from 'three';

export class BadgeManager {
    constructor() {
        this.badges = {
            distance: [
                { id: 'rookie_driver', name: 'Rookie Driver', requirement: 10, icon: '🚗', description: 'Drive 10km', earnedText: 'You\'ve taken your first steps on the road!' },
                { id: 'road_warrior', name: 'Road Warrior', requirement: 50, icon: '🛣️', description: 'Drive 50km', earnedText: 'The road is your second home now!' },
                { id: 'globe_trotter', name: 'Globe Trotter', requirement: 100, icon: '🌍', description: 'Drive 100km', earnedText: 'You\'ve mastered long-distance driving!' },
                { id: 'distance_legend', name: 'Distance Legend', requirement: 200, icon: '🌟', description: 'Drive 200km', earnedText: 'You\'ve become a living legend of the road!' }
            ],
            speed: [
                { id: 'speed_rookie', name: 'Speed Rookie', requirement: 100, icon: '🏃', description: 'Reach 100 km/h', earnedText: 'Your first taste of speed!' },
                { id: 'speed_demon', name: 'Speed Demon', requirement: 200, icon: '⚡', description: 'Reach 200 km/h', earnedText: 'Now you\'re really moving!' },
                { id: 'lightning_fast', name: 'Lightning Fast', requirement: 300, icon: '🌩️', description: 'Reach 300 km/h', earnedText: 'Breaking the sound barrier!' },
                { id: 'sonic_boom', name: 'Sonic Boom', requirement: 400, icon: '💨', description: 'Reach 400 km/h', earnedText: 'You\'ve achieved supersonic speed!' }
            ],
            collection: [
                { id: 'car_collector', name: 'Car Collector', requirement: 3, icon: '🏎️', description: 'Unlock 3 cars', earnedText: 'Your garage is growing!' },
                { id: 'car_enthusiast', name: 'Car Enthusiast', requirement: 5, icon: '🏁', description: 'Unlock 5 cars', earnedText: 'A true car aficionado!' },
                { id: 'fleet_master', name: 'Fleet Master', requirement: 8, icon: '🎖️', description: 'Unlock 8 cars', earnedText: 'Your car collection is impressive!' },
                { id: 'automotive_king', name: 'Automotive King', requirement: 10, icon: '👑', description: 'Unlock all cars', earnedText: 'You own the entire fleet!' }
            ],
            score: [
                { id: 'score_starter', name: 'Score Starter', requirement: 1000, icon: '🎯', description: 'Score 1000 points', earnedText: 'You\'re getting the hang of it!' },
                { id: 'point_master', name: 'Point Master', requirement: 5000, icon: '💯', description: 'Score 5000 points', earnedText: 'Your score is rising fast!' },
                { id: 'high_scorer', name: 'High Scorer', requirement: 10000, icon: '🏆', description: 'Score 10000 points', earnedText: 'You\'ve reached the big leagues!' },
                { id: 'score_legend', name: 'Score Legend', requirement: 20000, icon: '🎮', description: 'Score 20000 points', earnedText: 'You\'ve mastered the art of scoring!' }
            ],
            combat: [
                { id: 'first_strike', name: 'First Strike', requirement: 1, icon: '🎯', description: 'Destroy your first obstacle', earnedText: 'Your first target destroyed!' },
                { id: 'sharpshooter', name: 'Sharpshooter', requirement: 10, icon: '🎪', description: 'Destroy 10 obstacles in one run', earnedText: 'Your aim is getting better!' },
                { id: 'demolition_expert', name: 'Demolition Expert', requirement: 25, icon: '💥', description: 'Destroy 25 obstacles in one run', earnedText: 'Nothing stands in your way!' },
                { id: 'tank_hunter', name: 'Tank Hunter', requirement: 5, icon: '🎖️', description: 'Destroy 5 tanks', earnedText: 'Tank destroyer extraordinaire!' }
            ],
            seasonal: [
                { id: 'spring_master', name: 'Spring Master', requirement: 1, icon: '🌸', description: 'Excel in spring conditions', earnedText: 'You\'ve mastered spring driving!' },
                { id: 'summer_ace', name: 'Summer Ace', requirement: 1, icon: '☀️', description: 'Master summer driving', earnedText: 'Summer heat can\'t stop you!' },
                { id: 'autumn_expert', name: 'Autumn Expert', requirement: 1, icon: '🍂', description: 'Conquer autumn conditions', earnedText: 'Fallen leaves are no match!' },
                { id: 'winter_champion', name: 'Winter Champion', requirement: 1, icon: '❄️', description: 'Dominate winter conditions', earnedText: 'Ice and snow bow to your skill!' },
                { id: 'season_master', name: 'Season Master', requirement: 4, icon: '🌍', description: 'Master all seasons', earnedText: 'You\'ve conquered every season!' }
            ],
            special: [
                { id: 'perfect_run', name: 'Perfect Run', requirement: 1, icon: '✨', description: 'Complete a run without collisions', earnedText: 'Flawless driving!' },
                { id: 'coin_master', name: 'Coin Master', requirement: 100, icon: '🪙', description: 'Collect 100 coins in one run', earnedText: 'You\'re rich in coins!' },
                { id: 'speed_survivor', name: 'Speed Survivor', requirement: 1, icon: '🛡️', description: 'Survive 5 minutes at max speed', earnedText: 'Living life in the fast lane!' },
                { id: 'night_rider', name: 'Night Rider', requirement: 1, icon: '🌙', description: 'Drive 10km during night time', earnedText: 'Master of the night!' }
            ],
            challenges: [
                { id: 'drift_king', name: 'Drift King', requirement: 50, icon: '🔄', description: 'Perform 50 successful drifts', earnedText: 'Sliding in style!' },
                { id: 'close_call', name: 'Close Call', requirement: 10, icon: '😅', description: 'Near miss with 10 obstacles', earnedText: 'Living on the edge!' },
                { id: 'marathon_runner', name: 'Marathon Runner', requirement: 1, icon: '🏃', description: 'Drive for 30 minutes in one run', earnedText: 'Your endurance is impressive!' },
                { id: 'rush_hour', name: 'Rush Hour Hero', requirement: 1, icon: '🌆', description: 'Score 1000 points during night time', earnedText: 'Ruling the night streets!' }
            ]
        };

        this.unlockedBadges = new Set();
        this.badgePanel = null;
        this.badgeButton = null;
        this.notificationQueue = [];
        this.isProcessingQueue = false;
        this.seasonProgress = new Set();
        this.combatStats = {
            obstaclesDestroyed: 0,
            tanksDestroyed: 0
        };

        // Load previously unlocked badges
        this.loadUnlockedBadges();
        this.createBadgePanel();
    }

    createBadgePanel() {
        // Create main panel
        this.badgePanel = document.createElement('div');
        this.badgePanel.style.position = 'fixed';
        this.badgePanel.style.top = '50%';
        this.badgePanel.style.left = '50%';
        this.badgePanel.style.transform = 'translate(-50%, -50%)';
        this.badgePanel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.badgePanel.style.padding = '30px';
        this.badgePanel.style.borderRadius = '15px';
        this.badgePanel.style.color = 'white';
        this.badgePanel.style.fontFamily = 'Arial, sans-serif';
        this.badgePanel.style.minWidth = '600px';
        this.badgePanel.style.maxHeight = '80vh';
        this.badgePanel.style.overflowY = 'auto';
        this.badgePanel.style.display = 'none';
        this.badgePanel.style.zIndex = '1000';
        this.badgePanel.style.backdropFilter = 'blur(10px)';
        this.badgePanel.style.border = '1px solid rgba(255, 255, 255, 0.1)';

        // Add title
        const title = document.createElement('h1');
        title.textContent = 'Achievements';
        title.style.textAlign = 'center';
        title.style.marginBottom = '30px';
        title.style.color = '#FFD700';

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '✕';
        closeButton.style.position = 'absolute';
        closeButton.style.right = '20px';
        closeButton.style.top = '20px';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = 'white';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => this.hideBadgePanel();

        this.badgePanel.appendChild(title);
        this.badgePanel.appendChild(closeButton);
        this.updateBadgePanel();

        // Add badge button to game UI
        this.badgeButton = document.createElement('button');
        this.badgeButton.innerHTML = '🏆';
        this.badgeButton.style.position = 'absolute';
        this.badgeButton.style.top = '20px';
        this.badgeButton.style.right = '20px';
        this.badgeButton.style.padding = '10px 20px';
        this.badgeButton.style.fontSize = '24px';
        this.badgeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.badgeButton.style.color = 'white';
        this.badgeButton.style.border = 'none';
        this.badgeButton.style.borderRadius = '5px';
        this.badgeButton.style.cursor = 'pointer';
        this.badgeButton.style.zIndex = '1000';
        this.badgeButton.style.display = 'none'; // Hide initially
        this.badgeButton.onclick = () => this.toggleBadgePanel();

        document.body.appendChild(this.badgePanel);
        document.body.appendChild(this.badgeButton);
    }

    updateBadgePanel() {
        // Clear existing badges
        while (this.badgePanel.children.length > 2) { // Keep title and close button
            this.badgePanel.removeChild(this.badgePanel.lastChild);
        }

        // Add badge categories
        Object.entries(this.badges).forEach(([category, badges]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.style.marginBottom = '30px';

            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryTitle.style.color = '#FFD700';
            categoryTitle.style.marginBottom = '15px';
            categoryDiv.appendChild(categoryTitle);

            const badgeGrid = document.createElement('div');
            badgeGrid.style.display = 'grid';
            badgeGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
            badgeGrid.style.gap = '15px';

            badges.forEach(badge => {
                const badgeCard = this.createBadgeCard(badge);
                badgeGrid.appendChild(badgeCard);
            });

            categoryDiv.appendChild(badgeGrid);
            this.badgePanel.appendChild(categoryDiv);
        });
    }

    createBadgeCard(badge) {
        const card = document.createElement('div');
        card.style.backgroundColor = this.unlockedBadges.has(badge.id) ? 
            'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
        card.style.padding = '15px';
        card.style.borderRadius = '10px';
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.gap = '15px';

        const icon = document.createElement('div');
        icon.textContent = badge.icon;
        icon.style.fontSize = '32px';
        icon.style.opacity = this.unlockedBadges.has(badge.id) ? '1' : '0.5';

        const info = document.createElement('div');
        
        const name = document.createElement('div');
        name.textContent = badge.name;
        name.style.fontWeight = 'bold';
        name.style.marginBottom = '5px';

        const description = document.createElement('div');
        description.textContent = badge.description;
        description.style.fontSize = '14px';
        description.style.color = '#aaa';

        info.appendChild(name);
        info.appendChild(description);

        card.appendChild(icon);
        card.appendChild(info);

        return card;
    }

    showBadgePanel() {
        this.badgePanel.style.display = 'block';
    }

    hideBadgePanel() {
        this.badgePanel.style.display = 'none';
    }

    showBadgeButton() {
        if (this.badgeButton) {
            this.badgeButton.style.display = 'block';
        }
    }

    toggleBadgePanel() {
        if (this.badgePanel.style.display === 'none') {
            this.showBadgePanel();
        } else {
            this.hideBadgePanel();
        }
    }

    checkAndAwardBadges(stats) {
        const { distance, speed, score, collisions, coins, season, unlockedCars } = stats;
        let newBadges = [];

        // Check distance badges
        this.badges.distance.forEach(badge => {
            if (!this.unlockedBadges.has(badge.id) && distance >= badge.requirement) {
                this.unlockBadge(badge);
                newBadges.push(badge);
            }
        });

        // Check speed badges
        this.badges.speed.forEach(badge => {
            if (!this.unlockedBadges.has(badge.id) && speed >= badge.requirement) {
                this.unlockBadge(badge);
                newBadges.push(badge);
            }
        });

        // Check collection badges
        this.badges.collection.forEach(badge => {
            if (!this.unlockedBadges.has(badge.id) && unlockedCars >= badge.requirement) {
                this.unlockBadge(badge);
                newBadges.push(badge);
            }
        });

        // Check score badges
        this.badges.score.forEach(badge => {
            if (!this.unlockedBadges.has(badge.id) && score >= badge.requirement) {
                this.unlockBadge(badge);
                newBadges.push(badge);
            }
        });

        // Check combat badges
        if (this.combatStats.obstaclesDestroyed >= 1 && !this.unlockedBadges.has('first_strike')) {
            const badge = this.badges.combat.find(b => b.id === 'first_strike');
            this.unlockBadge(badge);
            newBadges.push(badge);
        }

        if (this.combatStats.obstaclesDestroyed >= 10 && !this.unlockedBadges.has('sharpshooter')) {
            const badge = this.badges.combat.find(b => b.id === 'sharpshooter');
            this.unlockBadge(badge);
            newBadges.push(badge);
        }

        if (this.combatStats.tanksDestroyed >= 5 && !this.unlockedBadges.has('tank_hunter')) {
            const badge = this.badges.combat.find(b => b.id === 'tank_hunter');
            this.unlockBadge(badge);
            newBadges.push(badge);
        }

        // Check special badges
        if (!this.unlockedBadges.has('perfect_run') && collisions === 0 && distance > 5) {
            const badge = this.badges.special.find(b => b.id === 'perfect_run');
            this.unlockBadge(badge);
            newBadges.push(badge);
        }

        if (!this.unlockedBadges.has('coin_master') && coins >= 100) {
            const badge = this.badges.special.find(b => b.id === 'coin_master');
            this.unlockBadge(badge);
            newBadges.push(badge);
        }

        // Check seasonal badges
        const seasonBadgeId = `${season.toLowerCase()}_master`;
        if (!this.unlockedBadges.has(seasonBadgeId)) {
            const seasonBadge = this.badges.seasonal.find(b => b.id === seasonBadgeId);
            if (seasonBadge) {
                this.unlockBadge(seasonBadge);
                newBadges.push(seasonBadge);
                this.seasonProgress.add(season.toLowerCase());

                // Check for Season Master badge
                if (this.seasonProgress.size >= 4 && !this.unlockedBadges.has('season_master')) {
                    const masterBadge = this.badges.seasonal.find(b => b.id === 'season_master');
                    this.unlockBadge(masterBadge);
                    newBadges.push(masterBadge);
                }
            }
        }

        // Show notifications for new badges
        newBadges.forEach(badge => this.showBadgeNotification(badge));
    }

    unlockBadge(badge) {
        this.unlockedBadges.add(badge.id);
        this.saveBadges();
        this.updateBadgePanel();
    }

    showBadgeNotification(badge) {
        this.notificationQueue.push(badge);
        if (!this.isProcessingQueue) {
            this.processNotificationQueue();
        }
    }

    async processNotificationQueue() {
        if (this.notificationQueue.length === 0) {
            this.isProcessingQueue = false;
            return;
        }

        this.isProcessingQueue = true;
        const badge = this.notificationQueue.shift();

        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%) translateY(-100%)';
        notification.style.backgroundColor = 'rgba(255, 215, 0, 0.9)';
        notification.style.padding = '20px 30px';
        notification.style.borderRadius = '15px';
        notification.style.color = 'black';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.fontSize = '18px';
        notification.style.display = 'flex';
        notification.style.flexDirection = 'column';
        notification.style.alignItems = 'center';
        notification.style.gap = '10px';
        notification.style.zIndex = '1001';
        notification.style.transition = 'transform 0.5s ease-out';
        notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';

        notification.innerHTML = `
            <div style="font-size: 32px">${badge.icon}</div>
            <div style="text-align: center">
                <div style="font-weight: bold; font-size: 24px; margin-bottom: 5px">New Achievement!</div>
                <div style="font-size: 20px; color: #444">${badge.name}</div>
                <div style="font-size: 16px; color: #666; margin-top: 5px">${badge.earnedText}</div>
            </div>
        `;

        document.body.appendChild(notification);

        // Play achievement sound
        const achievementSound = new Audio('sounds/achievement.mp3');
        achievementSound.volume = 0.5;
        achievementSound.play().catch(error => console.log("Audio play failed:", error));

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);

        // Wait and animate out
        await new Promise(resolve => setTimeout(resolve, 4000));
        notification.style.transform = 'translateX(-50%) translateY(-100%)';

        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(notification);
            this.processNotificationQueue();
        }, 500);
    }

    loadUnlockedBadges() {
        const saved = localStorage.getItem('unlockedBadges');
        if (saved) {
            this.unlockedBadges = new Set(JSON.parse(saved));
        }
    }

    saveBadges() {
        localStorage.setItem('unlockedBadges', JSON.stringify([...this.unlockedBadges]));
    }

    getBadgeCount() {
        return this.unlockedBadges.size;
    }

    getTotalBadgeCount() {
        return Object.values(this.badges).reduce((total, category) => total + category.length, 0);
    }

    getAllBadges() {
        // Flatten all badges from all categories into a single array
        return Object.values(this.badges).flat().map(badge => ({
            ...badge,
            unlocked: this.unlockedBadges.has(badge.id)
        }));
    }

    // Add methods to update combat stats
    updateCombatStats(type) {
        if (type === 'tank') {
            this.combatStats.tanksDestroyed++;
        }
        this.combatStats.obstaclesDestroyed++;
    }
} 