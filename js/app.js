// Stress Response Test - Fight, Flight, Freeze, or Fawn?
// 8 questions, 4 stress response types
// Each option position maps to one displayed response label

const QUESTIONS = [
    { id: 0, icon: '\u{1F6A8}', questionKey: 'question.0', options: ['question.0a', 'question.0b', 'question.0c', 'question.0d'] },
    { id: 1, icon: '\u{1F4A2}', questionKey: 'question.1', options: ['question.1a', 'question.1b', 'question.1c', 'question.1d'] },
    { id: 2, icon: '\u{1F465}', questionKey: 'question.2', options: ['question.2a', 'question.2b', 'question.2c', 'question.2d'] },
    { id: 3, icon: '\u{1F3E2}', questionKey: 'question.3', options: ['question.3a', 'question.3b', 'question.3c', 'question.3d'] },
    { id: 4, icon: '\u{1F494}', questionKey: 'question.4', options: ['question.4a', 'question.4b', 'question.4c', 'question.4d'] },
    { id: 5, icon: '\u{23F0}', questionKey: 'question.5', options: ['question.5a', 'question.5b', 'question.5c', 'question.5d'] },
    { id: 6, icon: '\u{1F30A}', questionKey: 'question.6', options: ['question.6a', 'question.6b', 'question.6c', 'question.6d'] },
    { id: 7, icon: '\u{1F30C}', questionKey: 'question.7', options: ['question.7a', 'question.7b', 'question.7c', 'question.7d'] }
];

const STRESS_TYPES = {
    fight: {
        id: 'fight',
        emoji: '\u{2694}\u{FE0F}',
        nameKey: 'type.fight.name',
        taglineKey: 'type.fight.tagline',
        color: '#ef4444'
    },
    flight: {
        id: 'flight',
        emoji: '\u{1F3C3}',
        nameKey: 'type.flight.name',
        taglineKey: 'type.flight.tagline',
        color: '#f59e0b'
    },
    freeze: {
        id: 'freeze',
        emoji: '\u{1F9CA}',
        nameKey: 'type.freeze.name',
        taglineKey: 'type.freeze.tagline',
        color: '#6366f1'
    },
    fawn: {
        id: 'fawn',
        emoji: '\u{1F98C}',
        nameKey: 'type.fawn.name',
        taglineKey: 'type.fawn.tagline',
        color: '#10b981'
    }
};

const TYPE_ORDER = ['fight', 'flight', 'freeze', 'fawn'];
class StressResponseApp {
    constructor() {
        this.currentQuestion = 0;
        this.answers = [];
        this.typeScores = [0, 0, 0, 0];
        this.resultType = null;
        this.trackedStages = new Set();
        this.init();
    }

    trackStage(name) {
        if (this.trackedStages.has(name)) return;
        this.trackedStages.add(name);
        if (typeof gtag === 'function') {
            gtag('event', name, { event_category: 'stress_response' });
        }
    }

    async init() {
        if (window.i18n) {
            await window.i18n.init();
        }

        this.bindEvents();
        this.initTheme();
        this.hideLoader();

        this.updateDestinations();
        this.trackStage('stress_response_view');
    }

    bindEvents() {
        const startBtn = document.getElementById('start-btn');
        if (startBtn) startBtn.addEventListener('click', () => this.startQuiz());

        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) retryBtn.addEventListener('click', () => this.restart());

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.addEventListener('click', () => this.toggleTheme());

        const langToggle = document.getElementById('lang-toggle');
        const langMenu = document.getElementById('lang-menu');
        if (langToggle && langMenu) {
            langToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                langMenu.classList.toggle('hidden');
            });
            document.querySelectorAll('.lang-option').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const lang = btn.getAttribute('data-lang');
                    if (window.i18n) await window.i18n.setLanguage(lang);
                    this.updateDestinations();
                    langMenu.classList.add('hidden');
                });
            });
            document.addEventListener('click', () => langMenu.classList.add('hidden'));
        }

        document.getElementById('share-page')?.addEventListener('click', () => this.sharePage());
        document.getElementById('next-action')?.addEventListener('click', () => this.trackStage('stress_response_next_click'));
        document.querySelector('.related-grid')?.addEventListener('click', (event) => {
            if (event.target.closest('.related-card')) this.trackStage('stress_response_related_click');
        });
    }

    updateDestinations() {
        const lang = window.i18n?.getCurrentLanguage() || 'ko';
        const next = document.getElementById('next-action');
        if (next) next.href = '/stress-check/?lang=' + encodeURIComponent(lang) + '&source=stress_response_result';
    }

    hideLoader() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
                setTimeout(() => loader.style.display = 'none', 400);
            }, 600);
        }
    }

    initTheme() {
        const saved = localStorage.getItem('theme');
        if (saved === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            const toggle = document.getElementById('theme-toggle');
            if (toggle) toggle.textContent = '\u{2600}';
        }
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const toggle = document.getElementById('theme-toggle');
        if (current === 'light') {
            document.documentElement.removeAttribute('data-theme');
            if (toggle) toggle.textContent = '\u{1F319}';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            if (toggle) toggle.textContent = '\u{2600}';
            localStorage.setItem('theme', 'light');
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('active');
    }

    startQuiz() {
        this.currentQuestion = 0;
        this.answers = [];
        this.typeScores = [0, 0, 0, 0];
        this.showScreen('question-screen');
        this.renderQuestion();

        this.trackStage('stress_response_start');
    }

    renderQuestion() {
        const q = QUESTIONS[this.currentQuestion];
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (k) => k;

        const fill = document.getElementById('progress-fill');
        if (fill) fill.style.width = ((this.currentQuestion / 8) * 100) + '%';

        const counter = document.getElementById('q-current');
        if (counter) counter.textContent = this.currentQuestion + 1;

        const icon = document.getElementById('question-icon');
        if (icon) icon.textContent = q.icon;

        const text = document.getElementById('question-text');
        if (text) text.textContent = t(q.questionKey);

        const container = document.getElementById('options-container');
        if (!container) return;
        container.innerHTML = '';

        const labels = ['A', 'B', 'C', 'D'];
        q.options.forEach((optKey, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = '<span class="option-label">' + labels[idx] + '</span><span class="option-text">' + t(optKey) + '</span>';
                btn.addEventListener('click', () => this.selectOption(q.id, idx, btn), { once: true });
            container.appendChild(btn);
        });
    }

    selectOption(questionId, optionIdx, btn) {
        if (btn.disabled) return;
        document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        document.querySelectorAll('.option-btn').forEach(b => { b.disabled = true; });
        btn.classList.add('selected');

        this.typeScores[optionIdx] += 1;

        this.answers.push({ question: questionId, option: optionIdx });
        if (this.answers.length === 4) this.trackStage('stress_response_progress');

        setTimeout(() => {
            this.currentQuestion++;
            if (this.currentQuestion < 8) {
                this.renderQuestion();
            } else {
                this.showAnalyzing();
            }
        }, 400);
    }

    showAnalyzing() {
        this.showScreen('analyzing-screen');

        const fill = document.getElementById('analyzing-fill');
        const percent = document.getElementById('analyzing-percent');
        const detail = document.getElementById('analyzing-detail');
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (k) => k;

        if (fill) fill.style.width = '100%';
        if (percent) percent.textContent = '100%';
        if (detail) detail.textContent = t('analyzing.scanning');
        setTimeout(() => this.showResult(), 350);
    }

    calculateResult() {
        let maxScore = -1;
        let maxIdx = 0;
        for (let i = 0; i < 4; i++) {
            if (this.typeScores[i] > maxScore) {
                maxScore = this.typeScores[i];
                maxIdx = i;
            }
        }
        return STRESS_TYPES[TYPE_ORDER[maxIdx]];
    }

    showResult() {
        this.resultType = this.calculateResult();
        const type = this.resultType;
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (k) => k;

        this.showScreen('result-screen');

        const emoji = document.getElementById('result-emoji');
        if (emoji) emoji.textContent = type.emoji;

        const title = document.getElementById('result-title');
        if (title) title.textContent = t(type.nameKey);

        const tagline = document.getElementById('result-tagline');
        if (tagline) tagline.textContent = '"' + t(type.taglineKey) + '"';

        this.spawnConfetti();
        this.trackStage('stress_response_complete');
    }

    spawnConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;
        container.innerHTML = '';
        const colors = ['#6366f1', '#818cf8', '#fda4af', '#4f46e5', '#8b5cf6', '#e0e7ff', '#312e81'];
        for (let i = 0; i < 40; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = (Math.random() * 2) + 's';
            piece.style.animationDuration = (2 + Math.random() * 2) + 's';
            container.appendChild(piece);
        }
    }

    restart() {
        this.showScreen('intro-screen');
        window.scrollTo(0, 0);
    }

    async sharePage() {
        const t = window.i18n ? window.i18n.t.bind(window.i18n) : (key) => key;
        const shareData = {
            title: t('meta.og_title'),
            text: t('share.text'),
            url: 'https://dopabrain.com/stress-response/'
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
            }
            this.trackStage('stress_response_share');
            const button = document.getElementById('share-page');
            if (button) {
                const original = button.textContent;
                button.textContent = t('share.success');
                setTimeout(() => { button.textContent = original; }, 2000);
            }
        } catch (e) {
            if (e?.name !== 'AbortError') console.error('Share failed');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.stressResponseApp = new StressResponseApp();
});
