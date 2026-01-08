// Celebrations Component - Confetti and animations for completed activities

const CelebrationComponent = {
    soundEnabled: true,

    /**
     * Celebrate activity completion with confetti
     */
    celebrate(activityElement) {
        // Confetti burst
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            });
        }

        // Add completion animation to activity card
        if (activityElement) {
            activityElement.classList.add('completed-animation');
            setTimeout(() => {
                activityElement.classList.remove('completed-animation');
            }, 600);
        }

        // Optional sound effect (subtle chime)
        if (this.soundEnabled) {
            this.playSuccessSound();
        }
    },

    /**
     * Celebrate streak milestone
     */
    celebrateStreak(days) {
        const milestones = [3, 7, 14, 30, 60, 100];

        if (milestones.includes(days)) {
            // Big confetti burst for milestones
            if (typeof confetti !== 'undefined') {
                const duration = 2000;
                const end = Date.now() + duration;

                (function frame() {
                    confetti({
                        particleCount: 3,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#ff9ff3']
                    });
                    confetti({
                        particleCount: 3,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#ff9ff3']
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                }());
            }

            // Show milestone toast
            const emoji = days >= 30 ? '🎉' : days >= 7 ? '🔥' : '⭐';
            const message = `${emoji} ${days} day streak! You're on fire!`;
            UIController.showToast(message, 'success');

            // Play special sound
            if (this.soundEnabled) {
                this.playMilestoneSound();
            }
        }
    },

    /**
     * Play subtle success sound
     */
    playSuccessSound() {
        try {
            // Create a simple success tone using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Configure sound
            oscillator.frequency.value = 800; // Higher pitch
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1; // Quiet volume

            // Play short beep
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);

            // Clean up
            setTimeout(() => {
                audioContext.close();
            }, 200);
        } catch (error) {
            // Silently fail if audio not supported
            console.log('Audio not supported');
        }
    },

    /**
     * Play milestone celebration sound
     */
    playMilestoneSound() {
        try {
            // Create a celebratory sequence of tones
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            const notes = [523, 659, 784]; // C, E, G major chord
            notes.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                gainNode.gain.value = 0.08;

                const startTime = audioContext.currentTime + (index * 0.1);
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.2);
            });

            // Clean up
            setTimeout(() => {
                audioContext.close();
            }, 1000);
        } catch (error) {
            console.log('Audio not supported');
        }
    },

    /**
     * Add pulse animation to element
     */
    pulseElement(element) {
        if (!element) return;

        element.classList.add('pulse-animation');
        setTimeout(() => {
            element.classList.remove('pulse-animation');
        }, 600);
    },

    /**
     * Animate counter (count up animation)
     */
    animateCounter(element, start, end, duration = 500) {
        if (!element) return;

        const range = end - start;
        const startTime = Date.now();

        function update() {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(start + (range * easeOut));

            element.textContent = currentValue + (element.dataset.suffix || '');

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        update();
    }
};
