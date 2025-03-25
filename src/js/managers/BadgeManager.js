export class BadgeManager {
    constructor() {
        this.badges = {
            // Hız Rozetleri
            speedDemon: {
                id: 'speedDemon',
                name: 'Hız Şeytanı',
                description: 'Aracınızla 200 km/s hıza ulaşın',
                icon: '🏎️',
                requirement: { type: 'speed', value: 200 },
                unlocked: false,
                progress: 0,
                category: 'speed'
            },
            sonicBoom: {
                id: 'sonicBoom',
                name: 'Sonic Boom',
                description: 'Aracınızla 300 km/s hıza ulaşın',
                icon: '💨',
                requirement: { type: 'speed', value: 300 },
                unlocked: false,
                progress: 0,
                category: 'speed'
            },
            lightSpeed: {
                id: 'lightSpeed',
                name: 'Işık Hızı',
                description: 'Aracınızla 400 km/s hıza ulaşın',
                icon: '⚡',
                requirement: { type: 'speed', value: 400 },
                unlocked: false,
                progress: 0,
                category: 'speed'
            },

            // Drift Rozetleri
            driftKing: {
                id: 'driftKing',
                name: 'Drift Kralı',
                description: '10 mükemmel drift yapın',
                icon: '🔄',
                requirement: { type: 'drift', value: 10 },
                unlocked: false,
                progress: 0,
                category: 'drift'
            },
            driftMaster: {
                id: 'driftMaster',
                name: 'Drift Ustası',
                description: 'Tek bir yarışta 20 drift yapın',
                icon: '🌪️',
                requirement: { type: 'driftSingle', value: 20 },
                unlocked: false,
                progress: 0,
                category: 'drift'
            },
            tokyoDrifter: {
                id: 'tokyoDrifter',
                name: 'Tokyo Drifter',
                description: 'Toplam 1000 drift yapın',
                icon: '🎌',
                requirement: { type: 'driftTotal', value: 1000 },
                unlocked: false,
                progress: 0,
                category: 'drift'
            },

            // Yarış Rozetleri
            firstWin: {
                id: 'firstWin',
                name: 'İlk Zafer',
                description: 'İlk yarışınızı kazanın',
                icon: '🥇',
                requirement: { type: 'wins', value: 1 },
                unlocked: false,
                progress: 0,
                category: 'racing'
            },
            serialWinner: {
                id: 'serialWinner',
                name: 'Seri Kazanan',
                description: 'Art arda 5 yarış kazanın',
                icon: '👑',
                requirement: { type: 'winStreak', value: 5 },
                unlocked: false,
                progress: 0,
                category: 'racing'
            },
            grandChampion: {
                id: 'grandChampion',
                name: 'Büyük Şampiyon',
                description: '100 yarış kazanın',
                icon: '🏆',
                requirement: { type: 'wins', value: 100 },
                unlocked: false,
                progress: 0,
                category: 'racing'
            },

            // Koleksiyon Rozetleri
            carCollector: {
                id: 'carCollector',
                name: 'Araba Koleksiyoncusu',
                description: '10 farklı araba açın',
                icon: '🚗',
                requirement: { type: 'cars', value: 10 },
                unlocked: false,
                progress: 0,
                category: 'collection'
            },
            paintMaster: {
                id: 'paintMaster',
                name: 'Boya Ustası',
                description: '20 farklı boya düzeni açın',
                icon: '🎨',
                requirement: { type: 'paints', value: 20 },
                unlocked: false,
                progress: 0,
                category: 'collection'
            },
            wheelDealer: {
                id: 'wheelDealer',
                name: 'Jant Taciri',
                description: 'Tüm jant setlerini açın',
                icon: '⚙️',
                requirement: { type: 'wheels', value: 30 },
                unlocked: false,
                progress: 0,
                category: 'collection'
            },

            // Beceri Rozetleri
            perfectLap: {
                id: 'perfectLap',
                name: 'Mükemmel Tur',
                description: 'Hasarsız bir tur tamamlayın',
                icon: '⭐',
                requirement: { type: 'perfectLap', value: 1 },
                unlocked: false,
                progress: 0,
                category: 'skill'
            },
            airTime: {
                id: 'airTime',
                name: 'Havada Asılı',
                description: 'Toplam 1 dakika havada kalın',
                icon: '🦅',
                requirement: { type: 'airTime', value: 60 },
                unlocked: false,
                progress: 0,
                category: 'skill'
            },
            stuntMaster: {
                id: 'stuntMaster',
                name: 'Akrobasi Ustası',
                description: '50 takla atın',
                icon: '🎪',
                requirement: { type: 'flips', value: 50 },
                unlocked: false,
                progress: 0,
                category: 'skill'
            },

            // Sosyal Rozetler
            socialButterfly: {
                id: 'socialButterfly',
                name: 'Sosyal Kelebek',
                description: '5 çok oyunculu yarışı tamamlayın',
                icon: '🦋',
                requirement: { type: 'multiplayer', value: 5 },
                unlocked: false,
                progress: 0,
                category: 'social'
            },
            teamPlayer: {
                id: 'teamPlayer',
                name: 'Takım Oyuncusu',
                description: '10 takım yarışı kazanın',
                icon: '👥',
                requirement: { type: 'teamWins', value: 10 },
                unlocked: false,
                progress: 0,
                category: 'social'
            },
            globalRacer: {
                id: 'globalRacer',
                name: 'Küresel Yarışçı',
                description: '5 farklı ülkeden oyuncuyla yarışın',
                icon: '🌍',
                requirement: { type: 'countries', value: 5 },
                unlocked: false,
                progress: 0,
                category: 'social'
            },

            // Özel Rozetler
            nightRider: {
                id: 'nightRider',
                name: 'Gece Sürücüsü',
                description: 'Gece modunda toplam 1 saat oynayın',
                icon: '🌙',
                requirement: { type: 'nightTime', value: 3600 },
                unlocked: false,
                progress: 0,
                category: 'special'
            },
            weatherMaster: {
                id: 'weatherMaster',
                name: 'Hava Ustası',
                description: 'Tüm hava koşullarında yarış kazanın',
                icon: '🌈',
                requirement: { type: 'weatherWins', value: 4 },
                unlocked: false,
                progress: 0,
                category: 'special'
            },
            seasonChampion: {
                id: 'seasonChampion',
                name: 'Sezon Şampiyonu',
                description: 'Bir sezon şampiyonluğu kazanın',
                icon: '🎖️',
                requirement: { type: 'seasonWin', value: 1 },
                unlocked: false,
                progress: 0,
                category: 'special'
            }
        };

        this.activeChallenges = new Set();
        this.badgeUnlockCallbacks = new Set();
    }

    // Rozet kategorisine göre filtreleme
    getBadgesByCategory(category) {
        return Object.values(this.badges).filter(badge => badge.category === category);
    }

    // Rozet ilerleme durumunu güncelle
    updateProgress(badgeId, progress) {
        const badge = this.badges[badgeId];
        if (!badge || badge.unlocked) return;

        badge.progress = Math.min(progress, badge.requirement.value);
        
        if (badge.progress >= badge.requirement.value) {
            this.unlockBadge(badgeId);
        }
    }

    // Rozeti aç
    unlockBadge(badgeId) {
        const badge = this.badges[badgeId];
        if (!badge || badge.unlocked) return;

        badge.unlocked = true;
        badge.progress = badge.requirement.value;
        
        // Rozet açıldığında callback'leri çağır
        this.notifyBadgeUnlock(badge);
        
        // Local storage'a kaydet
        this.saveBadgeProgress();
    }

    // Rozet açıldığında çalışacak callback'leri ekle
    onBadgeUnlock(callback) {
        this.badgeUnlockCallbacks.add(callback);
    }

    // Callback'leri çağır
    notifyBadgeUnlock(badge) {
        this.badgeUnlockCallbacks.forEach(callback => {
            callback(badge);
        });
    }

    // Tüm rozetlerin durumunu kontrol et
    checkAllBadges() {
        return Object.values(this.badges).map(badge => ({
            ...badge,
            percentComplete: (badge.progress / badge.requirement.value) * 100
        }));
    }

    // Açılan rozetleri getir
    getUnlockedBadges() {
        return Object.values(this.badges).filter(badge => badge.unlocked);
    }

    // Kilitli rozetleri getir
    getLockedBadges() {
        return Object.values(this.badges).filter(badge => !badge.unlocked);
    }

    // Rozet ilerlemesini kaydet
    saveBadgeProgress() {
        const progress = Object.entries(this.badges).reduce((acc, [id, badge]) => {
            acc[id] = {
                unlocked: badge.unlocked,
                progress: badge.progress
            };
            return acc;
        }, {});

        localStorage.setItem('badgeProgress', JSON.stringify(progress));
    }

    // Kaydedilmiş rozet ilerlemesini yükle
    loadBadgeProgress() {
        const savedProgress = localStorage.getItem('badgeProgress');
        if (!savedProgress) return;

        const progress = JSON.parse(savedProgress);
        Object.entries(progress).forEach(([id, data]) => {
            if (this.badges[id]) {
                this.badges[id].unlocked = data.unlocked;
                this.badges[id].progress = data.progress;
            }
        });
    }

    // Hız rozetini güncelle
    updateSpeedBadge(currentSpeed) {
        this.updateProgress('speedDemon', currentSpeed);
    }

    // Drift rozetini güncelle
    updateDriftBadge(perfectDrifts) {
        this.updateProgress('driftKing', perfectDrifts);
    }

    // Mükemmel tur rozetini güncelle
    updatePerfectLapBadge(completed) {
        if (completed) {
            this.unlockBadge('perfectLap');
        }
    }

    // Gece sürüş rozetini güncelle
    updateNightRiderBadge(seconds) {
        this.updateProgress('nightRider', seconds);
    }

    // Araç koleksiyonu rozetini güncelle
    updateCollectorBadge(unlockedCars) {
        this.updateProgress('carCollector', unlockedCars);
    }

    // Çok oyunculu rozeti güncelle
    updateMultiplayerBadge(completedMatches) {
        this.updateProgress('socialButterfly', completedMatches);
    }

    // Modifiye rozetini güncelle
    updateCustomizerBadge(modificationPoints) {
        this.updateProgress('paintMaster', modificationPoints);
    }
} 