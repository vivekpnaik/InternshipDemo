// Timer functionality
let seconds = 0;
const timerElement = document.getElementById('timer');
let timerInterval;
let mediaRecorder;
let recordedChunks = [];
let currentQuestionIndex = 0;
let interviewQuestions = [];

function updateTimer() {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

timerInterval = setInterval(updateTimer, 1000);

// Question sets for different technologies
const questionSets = {
    'HTML': [
        "Can you explain the difference between HTML elements <section>, <article>, and <div>?",
        "What are the new semantic elements introduced in HTML5 and their purposes?",
        "Explain the importance of the DOCTYPE declaration and what happens if it's not included.",
        "What is the difference between localStorage and sessionStorage?",
        "How do you optimize website assets using HTML features?"
    ],
    'CSS': [
        "Explain the box model and its components.",
        "What's the difference between Flexbox and Grid?",
        "How does CSS specificity work?",
        "Explain the difference between position: relative, absolute, fixed, and sticky.",
        "What are CSS preprocessors and what are their benefits?"
    ],
    'JavaScript': [
        "Explain the concept of closures in JavaScript.",
        "What's the difference between let, const, and var?",
        "How does event delegation work?",
        "Explain promises and async/await.",
        "What is the event loop in JavaScript?"
    ],
    'Python': [
        "What are decorators in Python and how do they work?",
        "Explain the difference between lists and tuples.",
        "How does memory management work in Python?",
        "What are generators and how do they differ from regular functions?",
        "Explain the GIL (Global Interpreter Lock) and its impact."
    ],
    'Java': [
        "What is the difference between overloading and overriding?",
        "Explain the concept of Java garbage collection.",
        "What are the differences between ArrayList and LinkedList?",
        "How does multi-threading work in Java?",
        "Explain the principles of SOLID in Java context."
    ]
    // Add more technologies as needed
};

// Default questions if technology not found
const defaultQuestions = [
    "Tell me about your experience with this technology.",
    "What are the main challenges you've faced while working with this stack?",
    "How do you keep yourself updated with the latest developments?",
    "Describe a complex problem you solved using this technology.",
    "What best practices do you follow when working with this stack?"
];

function getQuestionsForTechnology(technology) {
    return questionSets[technology] || defaultQuestions;
}

// Audio and video stream variables
let mediaStream = null;
let audioContext = null;
let analyser = null;

// Create audio lines
function createAudioLines() {
    const audioLines = document.getElementById('audioLines');
    for (let i = 0; i < 20; i++) {
        const line = document.createElement('div');
        line.className = 'audio-line';
        audioLines.appendChild(line);
    }
}

createAudioLines();

// Camera access and recording setup
async function initializeCamera() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: true 
        });
        const videoElement = document.getElementById('userVideo');
        videoElement.srcObject = mediaStream;
        videoElement.muted = false;

        // Initialize MediaRecorder
        mediaRecorder = new MediaRecorder(mediaStream, {
            mimeType: 'video/webm;codecs=vp9,opus'
        });

        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = saveRecording;

        // Start recording
        mediaRecorder.start();

        initializeAudioVisualization(mediaStream);
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Please allow camera and microphone access to continue with the interview.');
    }
}

// Handle recorded data
function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    }
}

// Save recording
function saveRecording() {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm'
    });

    // Create a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `interview-recording-${timestamp}.webm`;

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    recordedChunks = [];
}

// Audio visualization
function initializeAudioVisualization(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    microphone.connect(analyser);
    analyser.fftSize = 64;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const audioLines = document.querySelectorAll('.audio-line');
    
    function updateVisualization() {
        if (!analyser) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        audioLines.forEach((line, index) => {
            const value = dataArray[index];
            const height = (value / 255) * 100;
            line.style.height = `${Math.max(height, 3)}%`;
            line.style.opacity = Math.max(0.3, height / 100);
        });
        
        requestAnimationFrame(updateVisualization);
    }
    
    updateVisualization();
}

// Mute/Unmute functionality
const muteButton = document.getElementById('muteButton');
let isMuted = false;

muteButton.addEventListener('click', () => {
    if (mediaStream) {
        const audioTracks = mediaStream.getAudioTracks();
        isMuted = !isMuted;
        
        audioTracks.forEach(track => {
            track.enabled = !isMuted;
        });
        
        muteButton.innerHTML = isMuted ? 
            '<i class="fas fa-microphone-slash"></i>' : 
            '<i class="fas fa-microphone"></i>';
        muteButton.classList.toggle('muted', isMuted);
    }
});

// End call functionality
const endCallButton = document.getElementById('endCallButton');
const interviewEnded = document.getElementById('interviewEnded');

endCallButton.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop(); // This will trigger the saveRecording function
    }

    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    
    if (audioContext) {
        audioContext.close();
        audioContext = null;
        analyser = null;
    }
    
    clearInterval(timerInterval);
    interviewEnded.classList.add('visible');
});

// Get URL parameters and update profession
function updateProfessionFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const profession = urlParams.get('profession');
    const technology = urlParams.get('technology');
    
    const professionElement = document.getElementById('profession');
    professionElement.textContent = `${technology || profession || 'Developer'}`;

    // Set up questions based on selected technology
    interviewQuestions = getQuestionsForTechnology(technology);
    updateQuestion();
}

// Update response box with current question
function updateQuestion() {
    const responseBox = document.getElementById('responseBox');
    const questionNumber = currentQuestionIndex + 1;
    const totalQuestions = interviewQuestions.length;
    
    responseBox.innerHTML = `
        <div class="question-header">Question ${questionNumber} of ${totalQuestions}</div>
        <div class="question-content">${interviewQuestions[currentQuestionIndex]}</div>
        ${currentQuestionIndex < totalQuestions - 1 ? 
            '<button class="next-question" onclick="nextQuestion()">Next Question</button>' : 
            '<button class="end-interview" onclick="endInterview()">End Interview</button>'}
    `;
}

// Navigate to next question
function nextQuestion() {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
        currentQuestionIndex++;
        updateQuestion();
    }
}

// End interview
function endInterview() {
    endCallButton.click();
}

// Initialize everything when the page loads
window.addEventListener('load', () => {
    initializeCamera();
    updateProfessionFromURL();
});