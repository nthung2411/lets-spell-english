// Game state
let currentWord = null;
let score = 0;
let correctCount = 0;
let learnedWords = new Set();

// DOM elements
const wordDisplay = document.getElementById('wordDisplay');
const wordImage = document.getElementById('wordImage');
const wordText = document.getElementById('wordText');
const newWordBtn = document.getElementById('newWordBtn');
const hearWordBtn = document.getElementById('hearWordBtn');
const spellingInput = document.getElementById('spellingInput');
const checkBtn = document.getElementById('checkBtn');
const feedback = document.getElementById('feedback');
const hintSection = document.getElementById('hintSection');
const hintBtn = document.getElementById('hintBtn');
const hintDisplay = document.getElementById('hintDisplay');
const scoreDisplay = document.getElementById('score');
const correctDisplay = document.getElementById('correct');
const resetBtn = document.getElementById('resetBtn');
const wordList = document.getElementById('wordList');

// Initialize
loadScore();
updateWordList();

// Event listeners
newWordBtn.addEventListener('click', getNewWord);
hearWordBtn.addEventListener('click', speakWord);
checkBtn.addEventListener('click', checkSpelling);
hintBtn.addEventListener('click', showHint);
resetBtn.addEventListener('click', resetScore);

// Allow Enter key to check spelling
spellingInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkSpelling();
    }
});

// Get a new random word
function getNewWord() {
    if (wordDatabase.length === 0) {
        wordText.textContent = 'No more words!';
        return;
    }

    // Select a random word
    const randomIndex = Math.floor(Math.random() * wordDatabase.length);
    currentWord = wordDatabase[randomIndex];

    // Update display
    wordImage.textContent = currentWord.emoji;
    wordText.textContent = currentWord.word.toUpperCase();
    
    // Clear previous state
    spellingInput.value = '';
    feedback.textContent = '';
    feedback.className = 'feedback';
    hintSection.style.display = 'none';
    hintDisplay.textContent = '';
    
    // Focus on input
    spellingInput.focus();
    
    // Speak the word
    speakWord();
}

// Speak the current word using Web Speech API
function speakWord() {
    if (!currentWord) {
        getNewWord();
        return;
    }

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentWord.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // Slightly slower for children
        utterance.pitch = 1.2; // Slightly higher pitch
        speechSynthesis.speak(utterance);
    } else {
        // Fallback if speech synthesis is not available
        alert(`Say: ${currentWord.word}`);
    }
}

// Check if spelling is correct
function checkSpelling() {
    if (!currentWord) {
        feedback.textContent = 'Please get a new word first!';
        feedback.className = 'feedback';
        return;
    }

    const userInput = spellingInput.value.trim().toLowerCase();
    
    if (userInput === '') {
        feedback.textContent = 'Please type a word!';
        feedback.className = 'feedback';
        return;
    }

    if (userInput === currentWord.word.toLowerCase()) {
        // Correct!
        feedback.textContent = '🎉 Excellent! You spelled it correctly! 🎉';
        feedback.className = 'feedback correct';
        
        score += 10;
        correctCount++;
        learnedWords.add(currentWord.word);
        
        updateScore();
        updateWordList();
        saveScore();
        
        // Clear input and get ready for next word
        spellingInput.value = '';
        hintSection.style.display = 'none';
        
        // Auto-advance after 2 seconds
        setTimeout(() => {
            getNewWord();
        }, 2000);
    } else {
        // Incorrect
        feedback.textContent = `Not quite! Try again. The word is "${currentWord.word.toUpperCase()}".`;
        feedback.className = 'feedback incorrect';
        hintSection.style.display = 'block';
        spellingInput.focus();
        spellingInput.select();
    }
}

// Show hint
function showHint() {
    if (!currentWord) return;
    
    hintDisplay.textContent = currentWord.hint;
    hintBtn.style.display = 'none';
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = score;
    correctDisplay.textContent = correctCount;
}

// Update word list display
function updateWordList() {
    wordList.innerHTML = '';
    
    if (learnedWords.size === 0) {
        wordList.innerHTML = '<p style="color: white; text-align: center;">Start learning words to see them here!</p>';
        return;
    }
    
    const sortedWords = Array.from(learnedWords).sort();
    sortedWords.forEach(word => {
        const badge = document.createElement('div');
        badge.className = 'word-badge';
        badge.textContent = word.toUpperCase();
        wordList.appendChild(badge);
    });
}

// Reset score
function resetScore() {
    if (confirm('Are you sure you want to reset your score?')) {
        score = 0;
        correctCount = 0;
        learnedWords.clear();
        updateScore();
        updateWordList();
        saveScore();
        feedback.textContent = '';
        feedback.className = 'feedback';
    }
}

// Save score to localStorage
function saveScore() {
    const data = {
        score: score,
        correctCount: correctCount,
        learnedWords: Array.from(learnedWords)
    };
    localStorage.setItem('spellingGameData', JSON.stringify(data));
}

// Load score from localStorage
function loadScore() {
    const saved = localStorage.getItem('spellingGameData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            score = data.score || 0;
            correctCount = data.correctCount || 0;
            learnedWords = new Set(data.learnedWords || []);
            updateScore();
            updateWordList();
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

