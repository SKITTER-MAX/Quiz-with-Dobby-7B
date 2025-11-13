class QuizGenerator {
    constructor() {
        this.characters = {};
        this.selectedCharacter = 'crypto_sage';
        this.currentQuiz = null;
        
        this.init();
    }

    async init() {
        await this.loadCharacters();
        this.setupEventListeners();
        this.setupSliders();
    }

    async loadCharacters() {
        try {
            const response = await fetch('/api/characters');
            this.characters = await response.json();
            this.renderCharacters();
        } catch (error) {
            console.error('Failed to load characters:', error);
        }
    }

    renderCharacters() {
        const grid = document.getElementById('characterGrid');
        grid.innerHTML = '';

        Object.entries(this.characters).forEach(([key, character]) => {
            const card = document.createElement('div');
            card.className = `character-card cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${
                key === this.selectedCharacter 
                ? 'border-blue-400 bg-blue-500/20' 
                : 'border-white/30 bg-white/10 hover:border-white/50'
            }`;
            card.dataset.character = key;

            card.innerHTML = `
                <div class="text-center">
                    <div class="text-3xl mb-2">${character.emoji}</div>
                    <h3 class="text-white font-semibold text-sm">${character.name}</h3>
                    <p class="text-gray-300 text-xs mt-1">${character.role}</p>
                    <p class="text-blue-200 text-xs mt-2 italic">"${character.oneLiner}"</p>
                </div>
            `;

            card.addEventListener('click', () => {
                this.selectCharacter(key);
            });

            grid.appendChild(card);
        });
    }

    selectCharacter(characterKey) {
        this.selectedCharacter = characterKey;
        this.renderCharacters();
    }

    setupSliders() {
        const beginnerSlider = document.getElementById('beginnerSlider');
        const intermediateSlider = document.getElementById('intermediateSlider');
        const advancedSlider = document.getElementById('advancedSlider');

        const updatePercentages = () => {
            const beginner = parseInt(beginnerSlider.value);
            const intermediate = parseInt(intermediateSlider.value);
            const advanced = parseInt(advancedSlider.value);
            const total = beginner + intermediate + advanced;

            document.getElementById('beginnerPercent').textContent = `${beginner}%`;
            document.getElementById('intermediatePercent').textContent = `${intermediate}%`;
            document.getElementById('advancedPercent').textContent = `${advanced}%`;
            document.getElementById('totalPercent').textContent = `${total}%`;

            // Color code the total based on whether it equals 100
            const totalElement = document.getElementById('totalPercent');
            if (total === 100) {
                totalElement.className = 'text-green-300 font-semibold';
            } else {
                totalElement.className = 'text-red-300 font-semibold';
            }
        };

        beginnerSlider.addEventListener('input', updatePercentages);
        intermediateSlider.addEventListener('input', updatePercentages);
        advancedSlider.addEventListener('input', updatePercentages);
    }

    setupEventListeners() {
        const form = document.getElementById('quizForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateQuiz();
        });

        const saveBtn = document.getElementById('saveQuizBtn');
        saveBtn.addEventListener('click', () => {
            this.saveQuiz();
        });
    }

    async generateQuiz() {
        const topic = document.getElementById('topic').value;
        const numQuestions = parseInt(document.getElementById('numQuestions').value);
        const beginner = parseInt(document.getElementById('beginnerSlider').value) / 100;
        const intermediate = parseInt(document.getElementById('intermediateSlider').value) / 100;
        const advanced = parseInt(document.getElementById('advancedSlider').value) / 100;

        // Validate percentages
        const total = beginner + intermediate + advanced;
        if (Math.abs(total - 1.0) > 0.01) {
            this.showError('Difficulty percentages must sum to 100%');
            return;
        }

        const requestData = {
            topic,
            numQuestions,
            character: this.selectedCharacter,
            difficulty: {
                beginner,
                intermediate,
                advanced
            }
        };

        this.showLoading(true);
        this.hideError();

        try {
            const response = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate quiz');
            }

            this.currentQuiz = await response.json();
            this.displayQuiz();

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async saveQuiz() {
        if (!this.currentQuiz) return;

        try {
            const response = await fetch('/api/save-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.currentQuiz)
            });

            const result = await response.json();
            if (response.ok) {
                alert(`Quiz saved as ${result.filename}`);
            } else {
                alert(`Error saving quiz: ${result.error}`);
            }
        } catch (error) {
            alert(`Error saving quiz: ${error.message}`);
        }
    }

    displayQuiz() {
        const container = document.getElementById('quizContainer');
        const content = document.getElementById('quizContent');
        
        if (!this.currentQuiz) return;

        const quiz = this.currentQuiz;
        const character = quiz.share.openGraph.mainCharacter;

        content.innerHTML = `
            <div class="mb-6 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-400/30">
                <div class="flex items-center mb-4">
                    <div class="text-4xl mr-4">${character.emoji}</div>
                    <div>
                        <h3 class="text-xl font-bold text-white">${character.name}</h3>
                        <p class="text-blue-200">${character.role}</p>
                        <p class="text-gray-300 italic text-sm mt-1">"${character.oneLiner}"</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div class="bg-white/10 rounded-lg p-3">
                        <div class="text-white font-semibold">Topic</div>
                        <div class="text-blue-200 text-sm">${quiz.meta.topic}</div>
                    </div>
                    <div class="bg-white/10 rounded-lg p-3">
                        <div class="text-white font-semibold">Questions</div>
                        <div class="text-blue-200 text-sm">${quiz.questions.length}</div>
                    </div>
                    <div class="bg-white/10 rounded-lg p-3">
                        <div class="text-white font-semibold">Max Score</div>
                        <div class="text-blue-200 text-sm">${quiz.scoring.maxScore}</div>
                    </div>
                </div>
            </div>

            <div class="space-y-6">
                ${quiz.questions.map((question, index) => `
                    <div class="bg-white/5 rounded-lg p-6 border border-white/20">
                        <div class="flex items-center justify-between mb-4">
                            <h4 class="text-lg font-semibold text-white">Question ${index + 1}</h4>
                            <span class="px-3 py-1 rounded-full text-sm font-semibold ${this.getDifficultyClass(question.difficulty)}">
                                ${question.difficulty}
                            </span>
                        </div>
                        <p class="text-white mb-4 leading-relaxed">${question.stem}</p>
                        <div class="space-y-2 mb-4">
                            ${question.options.map((option, optIndex) => `
                                <div class="flex items-center p-3 rounded-lg ${optIndex === question.correctIndex ? 'bg-green-500/20 border border-green-500/50' : 'bg-white/5'}">
                                    <span class="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold mr-3 ${optIndex === question.correctIndex ? 'bg-green-500 text-white' : 'bg-white/20 text-gray-300'}">
                                        ${String.fromCharCode(65 + optIndex)}
                                    </span>
                                    <span class="text-white">${option}</span>
                                    ${optIndex === question.correctIndex ? '<i class="fas fa-check text-green-400 ml-auto"></i>' : ''}
                                </div>
                            `).join('')}
                        </div>
                        <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <h5 class="text-blue-300 font-semibold mb-2">Explanation</h5>
                            <p class="text-gray-200 text-sm leading-relaxed">${question.explanation}</p>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-400/30">
                <h4 class="text-lg font-semibold text-white mb-2">Scoring Information</h4>
                <p class="text-gray-200 text-sm">${quiz.scoring.rules}</p>
                <p class="text-green-300 text-sm mt-2">Pass Threshold: ${(quiz.scoring.passThreshold * 100).toFixed(0)}%</p>
            </div>
        `;

        container.classList.remove('hidden');
        container.scrollIntoView({ behavior: 'smooth' });
    }

    getDifficultyClass(difficulty) {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-500/20 text-green-300 border border-green-500/50';
            case 'intermediate':
                return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50';
            case 'advanced':
                return 'bg-red-500/20 text-red-300 border border-red-500/50';
            default:
                return 'bg-gray-500/20 text-gray-300 border border-gray-500/50';
        }
    }

    showLoading(show) {
        const form = document.getElementById('quizForm');
        const loading = document.getElementById('loadingState');
        
        if (show) {
            form.classList.add('hidden');
            loading.classList.remove('hidden');
        } else {
            form.classList.remove('hidden');
            loading.classList.add('hidden');
        }
    }

    showError(message) {
        const errorState = document.getElementById('errorState');
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.textContent = message;
        errorState.classList.remove('hidden');
    }

    hideError() {
        const errorState = document.getElementById('errorState');
        errorState.classList.add('hidden');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizGenerator();
});

// Add custom CSS for sliders
const style = document.createElement('style');
style.textContent = `
    .slider-green::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #10b981;
        cursor: pointer;
    }
    
    .slider-yellow::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #f59e0b;
        cursor: pointer;
    }
    
    .slider-red::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #ef4444;
        cursor: pointer;
    }
`;
document.head.appendChild(style);
