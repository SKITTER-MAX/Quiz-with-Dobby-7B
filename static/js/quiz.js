class QuizTaker {
    constructor() {
        this.quizData = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.showingExplanation = false;
        
        this.init();
    }

    init() {
        // For demo purposes, we'll use sample quiz data
        // In a real implementation, this would load from the quiz ID in the URL
        this.loadSampleQuiz();
        this.setupEventListeners();
    }

    loadSampleQuiz() {
        // Sample quiz data matching the DOBBY schema
        this.quizData = {
            "meta": {
                "quizId": "sample-quiz-001",
                "topic": "Zero-Knowledge Proofs and Privacy",
                "difficultyMix": { "beginner": 0.4, "intermediate": 0.4, "advanced": 0.2 },
                "seed": "abc123",
                "warnings": []
            },
            "questions": [
                {
                    "id": "q1",
                    "difficulty": "beginner",
                    "stem": "What is the primary purpose of zero-knowledge proofs in blockchain systems?",
                    "options": [
                        "To increase transaction speed",
                        "To prove knowledge of information without revealing the information itself",
                        "To reduce gas fees",
                        "To enable smart contract execution"
                    ],
                    "correctIndex": 1,
                    "explanation": "Zero-knowledge proofs allow one party to prove to another that they know a value without revealing the value itself. This is crucial for privacy-preserving blockchain applications where you want to verify claims without exposing sensitive data.",
                    "tags": ["blockchain", "privacy"]
                },
                {
                    "id": "q2",
                    "difficulty": "intermediate",
                    "stem": "In the context of zk-SNARKs, what does the 'S' stand for?",
                    "options": [
                        "Secure",
                        "Succinct",
                        "Scalable",
                        "Sequential"
                    ],
                    "correctIndex": 1,
                    "explanation": "zk-SNARK stands for Zero-Knowledge Succinct Non-Interactive Argument of Knowledge. 'Succinct' means the proofs are short and quick to verify, which is essential for blockchain scalability.",
                    "tags": ["blockchain", "cryptography"]
                },
                {
                    "id": "q3",
                    "difficulty": "intermediate",
                    "stem": "Which blockchain platform was among the first to implement zk-SNARKs for privacy?",
                    "options": [
                        "Ethereum",
                        "Bitcoin",
                        "Zcash",
                        "Monero"
                    ],
                    "correctIndex": 2,
                    "explanation": "Zcash was one of the first cryptocurrencies to implement zk-SNARKs, allowing for fully private transactions where the sender, receiver, and amount can all be kept confidential while still maintaining network integrity.",
                    "tags": ["blockchain", "privacy"]
                },
                {
                    "id": "q4",
                    "difficulty": "advanced",
                    "stem": "What is a major challenge with the trusted setup ceremony in zk-SNARKs?",
                    "options": [
                        "It requires too much computational power",
                        "The toxic waste must be securely destroyed to maintain security",
                        "It can only be performed once per blockchain",
                        "It makes the proofs too large"
                    ],
                    "correctIndex": 1,
                    "explanation": "The trusted setup ceremony generates parameters needed for zk-SNARKs, but it also creates 'toxic waste' - secret values that, if not destroyed, could be used to create fake proofs. This is why newer systems like zk-STARKs avoid trusted setups entirely.",
                    "tags": ["blockchain", "cryptography"]
                },
                {
                    "id": "q5",
                    "difficulty": "beginner",
                    "stem": "What advantage do zk-STARKs have over zk-SNARKs?",
                    "options": [
                        "Smaller proof size",
                        "Faster verification",
                        "No trusted setup required",
                        "Lower computational requirements"
                    ],
                    "correctIndex": 2,
                    "explanation": "zk-STARKs (Scalable Transparent Arguments of Knowledge) don't require a trusted setup ceremony, making them more transparent and secure. However, they typically have larger proof sizes compared to zk-SNARKs.",
                    "tags": ["blockchain", "cryptography"]
                }
            ],
            "scoring": {
                "maxScore": 5,
                "passThreshold": 0.6,
                "rules": "Each correct answer earns 1 point. You need 60% or higher to pass."
            },
            "share": {
                "tweet": {
                    "template": "I just scored {{score}}/{{max}} on the {{title}} quiz! 🧠⛓️",
                    "hashtags": ["Quiz", "AI", "Blockchain", "ZeroKnowledge"],
                    "via": "DOBBY_Tutor"
                },
                "openGraph": {
                    "title": "Zero-Knowledge Proofs Quiz",
                    "subtitle": "Test your privacy tech knowledge",
                    "summary": "Challenge yourself with questions about zk-proofs, privacy, and blockchain technology",
                    "mainCharacter": {
                        "name": "ZK Wizard",
                        "role": "Zero-Knowledge Proof Specialist",
                        "emoji": "🔮",
                        "oneLiner": "Making privacy-preserving proofs accessible to everyone!"
                    },
                    "theme": {
                        "bg": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        "accent": "#4f46e5",
                        "icon": "🔮"
                    }
                }
            }
        };

        this.userAnswers = new Array(this.quizData.questions.length).fill(null);
        this.displayQuestion();
        this.updateQuizHeader();
    }

    setupEventListeners() {
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevQuestion());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareResults());
        document.getElementById('retakeBtn').addEventListener('click', () => this.retakeQuiz());
    }

    displayQuestion() {
        const question = this.quizData.questions[this.currentQuestionIndex];
        const isAnswered = this.userAnswers[this.currentQuestionIndex] !== null;
        
        // Update question content
        document.getElementById('questionStem').textContent = question.stem;
        
        // Update difficulty badge
        const badge = document.getElementById('difficultyBadge');
        badge.textContent = question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);
        badge.className = `inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${this.getDifficultyClass(question.difficulty)}`;
        
        // Update options
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            const isSelected = this.userAnswers[this.currentQuestionIndex] === index;
            const isCorrect = index === question.correctIndex;
            
            let optionClass = 'option-button w-full text-left p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ';
            
            if (isAnswered) {
                if (isSelected && isCorrect) {
                    optionClass += 'border-green-500 bg-green-500/20 text-white';
                } else if (isSelected && !isCorrect) {
                    optionClass += 'border-red-500 bg-red-500/20 text-white';
                } else if (isCorrect) {
                    optionClass += 'border-green-500 bg-green-500/10 text-white';
                } else {
                    optionClass += 'border-white/30 bg-white/5 text-gray-300';
                }
            } else {
                if (isSelected) {
                    optionClass += 'border-blue-400 bg-blue-500/20 text-white';
                } else {
                    optionClass += 'border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20';
                }
            }
            
            optionDiv.className = optionClass;
            optionDiv.innerHTML = `
                <div class="flex items-center">
                    <div class="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-4 text-sm font-semibold">
                        ${String.fromCharCode(65 + index)}
                    </div>
                    <span class="flex-1">${option}</span>
                    ${isAnswered && isCorrect ? '<i class="fas fa-check text-green-400"></i>' : ''}
                    ${isAnswered && isSelected && !isCorrect ? '<i class="fas fa-times text-red-400"></i>' : ''}
                </div>
            `;
            
            if (!isAnswered) {
                optionDiv.addEventListener('click', () => this.selectOption(index));
            }
            
            container.appendChild(optionDiv);
        });
        
        // Update navigation buttons
        document.getElementById('prevBtn').disabled = this.currentQuestionIndex === 0;
        
        const nextBtn = document.getElementById('nextBtn');
        if (this.currentQuestionIndex === this.quizData.questions.length - 1) {
            nextBtn.textContent = 'Finish Quiz';
            nextBtn.innerHTML = 'Finish Quiz<i class="fas fa-flag-checkered ml-2"></i>';
        } else {
            nextBtn.innerHTML = 'Next<i class="fas fa-chevron-right ml-2"></i>';
        }
        
        // Show/hide explanation
        if (isAnswered) {
            this.showExplanation(question);
        } else {
            this.hideExplanation();
        }
        
        this.updateProgress();
    }

    selectOption(optionIndex) {
        this.userAnswers[this.currentQuestionIndex] = optionIndex;
        
        // Check if answer is correct
        const question = this.quizData.questions[this.currentQuestionIndex];
        if (optionIndex === question.correctIndex) {
            this.score++;
        }
        
        this.displayQuestion();
        this.updateQuizHeader();
    }

    showExplanation(question) {
        const card = document.getElementById('explanationCard');
        const icon = document.getElementById('answerIcon');
        const status = document.getElementById('answerStatus');
        const text = document.getElementById('explanationText');
        
        const userAnswer = this.userAnswers[this.currentQuestionIndex];
        const isCorrect = userAnswer === question.correctIndex;
        
        if (isCorrect) {
            icon.innerHTML = '<i class="fas fa-check text-white"></i>';
            icon.className = 'w-8 h-8 rounded-full flex items-center justify-center bg-green-500';
            status.textContent = 'Correct!';
            status.className = 'font-semibold text-lg mb-2 text-green-300';
        } else {
            icon.innerHTML = '<i class="fas fa-times text-white"></i>';
            icon.className = 'w-8 h-8 rounded-full flex items-center justify-center bg-red-500';
            status.textContent = 'Incorrect';
            status.className = 'font-semibold text-lg mb-2 text-red-300';
        }
        
        text.textContent = question.explanation;
        card.classList.remove('hidden');
    }

    hideExplanation() {
        document.getElementById('explanationCard').classList.add('hidden');
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.quizData.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    }

    updateQuizHeader() {
        const character = this.quizData.share.openGraph.mainCharacter;
        document.getElementById('quizTitle').textContent = `${character.emoji} ${this.quizData.share.openGraph.title}`;
        document.getElementById('quizSubtitle').textContent = this.quizData.share.openGraph.subtitle;
        document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
        document.getElementById('totalQuestions').textContent = this.quizData.questions.length;
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('maxScore').textContent = this.quizData.scoring.maxScore;
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.quizData.questions.length) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
    }

    showResults() {
        // Hide question card
        document.getElementById('questionCard').classList.add('hidden');
        document.getElementById('explanationCard').classList.add('hidden');
        
        // Show results
        const resultsCard = document.getElementById('resultsCard');
        const percentage = (this.score / this.quizData.scoring.maxScore) * 100;
        const passed = percentage >= (this.quizData.scoring.passThreshold * 100);
        
        // Update results content
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalMaxScore').textContent = this.quizData.scoring.maxScore;
        document.getElementById('finalPercentage').textContent = `(${percentage.toFixed(0)}%)`;
        
        document.getElementById('correctCount').textContent = this.score;
        document.getElementById('incorrectCount').textContent = this.quizData.questions.length - this.score;
        document.getElementById('accuracyPercent').textContent = `${percentage.toFixed(0)}%`;
        
        // Set emoji and title based on performance
        const emoji = document.getElementById('resultsEmoji');
        const title = document.getElementById('resultsTitle');
        
        if (percentage >= 90) {
            emoji.textContent = '🏆';
            title.textContent = 'Outstanding!';
            title.className = 'text-3xl font-bold text-yellow-400 mb-4';
        } else if (percentage >= 70) {
            emoji.textContent = '🎉';
            title.textContent = 'Great Job!';
            title.className = 'text-3xl font-bold text-green-400 mb-4';
        } else if (passed) {
            emoji.textContent = '👍';
            title.textContent = 'Well Done!';
            title.className = 'text-3xl font-bold text-blue-400 mb-4';
        } else {
            emoji.textContent = '📚';
            title.textContent = 'Keep Learning!';
            title.className = 'text-3xl font-bold text-orange-400 mb-4';
        }
        
        resultsCard.classList.remove('hidden');
        resultsCard.scrollIntoView({ behavior: 'smooth' });
    }

    shareResults() {
        const percentage = (this.score / this.quizData.scoring.maxScore) * 100;
        const template = this.quizData.share.tweet.template;
        const hashtags = this.quizData.share.tweet.hashtags.map(tag => `#${tag}`).join(' ');
        
        const tweetText = template
            .replace('{{score}}', this.score)
            .replace('{{max}}', this.quizData.scoring.maxScore)
            .replace('{{title}}', this.quizData.share.openGraph.title);
        
        const fullTweet = `${tweetText} ${hashtags}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullTweet)}`;
        
        window.open(twitterUrl, '_blank');
    }

    retakeQuiz() {
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.quizData.questions.length).fill(null);
        this.score = 0;
        
        document.getElementById('questionCard').classList.remove('hidden');
        document.getElementById('resultsCard').classList.add('hidden');
        
        this.displayQuestion();
        this.updateQuizHeader();
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
}

// Initialize the quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizTaker();
});
