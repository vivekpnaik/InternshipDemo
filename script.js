// Theme toggle functionality
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    
    const icon = document.querySelector('#theme-toggle i');
    icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Interview start functionality
function startInterview() {
    const level = document.getElementById('difficulty-level').value;
    const profession = document.getElementById('selected-profession').textContent;
    const technology = document.getElementById('selected-technology').textContent;
    
    // Request camera and microphone permissions before redirecting
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(() => {
            // Redirect to the interview page with parameters
            window.location.href = `interview.html?profession=${encodeURIComponent(profession)}&technology=${encodeURIComponent(technology)}&level=${encodeURIComponent(level)}`;
        })
        .catch(err => {
            alert('Please allow camera and microphone access to continue with the interview.');
            console.error('Error accessing media devices:', err);
        });
}

// Resume upload functionality
function showResumeUpload() {
    document.getElementById('resume-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('resume-modal').style.display = 'none';
}

function continueUpload() {
    const fileInput = document.getElementById('resume-upload');
    if (fileInput.files.length > 0) {
        alert('Resume uploaded successfully! Analyzing your resume...');
        closeModal();
    } else {
        alert('Please select a file first');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('resume-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Language selection functionality
function selectLanguage(profession, technology) {
    window.location.href = `interview-setup.html?profession=${encodeURIComponent(profession)}&technology=${encodeURIComponent(technology)}`;
}