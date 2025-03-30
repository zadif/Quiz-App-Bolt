// Local Storage Keys
const PROGRESS_KEY = "quizProgress";
const CURRENT_SCORE_KEY = "currentScore";

let currentQuestionIndex = 0;
let score = 0;
const carousel = new bootstrap.Carousel(
  document.getElementById("quiz-carousel"),
  {
    interval: false,
    wrap: false,
  }
);

// Initialize progress from local storage
function initializeProgress() {
  const savedProgress = localStorage.getItem(PROGRESS_KEY);
  const savedScore = localStorage.getItem(CURRENT_SCORE_KEY);

  if (savedProgress) {
    showProgressModal(parseInt(savedProgress), parseInt(savedScore));
  }
}

function showProgressModal(savedProgress, savedScore) {
  const modal = document.createElement("div");
  modal.className = "progress-modal";
  modal.innerHTML = `
        <h3>Previous Progress Found</h3>
        <div class="progress-options">
            <button class="btn btn-primary" onclick="continueProgress(${savedProgress}, ${savedScore})">
                Continue
            </button>
            <button class="btn btn-outline-primary" onclick="startNew()">
                Start New
            </button>
        </div>
    `;
  document.body.appendChild(modal);
  document.body.classList.add("modal-open"); // Add blur effect
  document.querySelector(".chat-sidebar").classList.remove("open"); // Ensure chat box appears closed
  document.querySelector(".chat-sidebar").style.display = "none"; // Hide chat box
}

function continueProgress(savedProgress, savedScore) {
  currentQuestionIndex = savedProgress;
  score = savedScore;
  carousel.to(currentQuestionIndex);
  updateProgress();
  closeProgressModal();
}

function startNew() {
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(CURRENT_SCORE_KEY);
  closeProgressModal();
}

function closeProgressModal() {
  const modal = document.querySelector(".progress-modal");
  if (modal) {
    modal.remove();
    document.body.classList.remove("modal-open"); // Remove blur effect
    document.querySelector(".chat-sidebar").style.display = ""; // Reset chat box display
  }
}

function updateProgress() {
  const totalQuestions = document.querySelectorAll(".carousel-item").length - 1;
  document.getElementById("currentQuestion").textContent =
    currentQuestionIndex + 1;
  const progressBar = document.querySelector(".progress-bar");
  progressBar.style.width = `${
    ((currentQuestionIndex + 1) / totalQuestions) * 100
  }%`;

  // Save progress
  localStorage.setItem(PROGRESS_KEY, currentQuestionIndex);
  localStorage.setItem(CURRENT_SCORE_KEY, score);
}

function showExplanation(explanation) {
  const modal = document.createElement("div");
  modal.className = "explanation-modal";
  modal.innerHTML = `
        <div class="explanation-content">${explanation}</div>
        <button class="btn btn-primary w-100" onclick="closeExplanation()">Close</button>
    `;
  document.body.appendChild(modal);

  // Auto-close after 5 seconds
  setTimeout(closeExplanation, 5000);
}

function closeExplanation() {
  const modal = document.querySelector(".explanation-modal");
  if (modal) {
    modal.remove();
  }
}

function checkAnswer(button, isCorrect) {
  const options = button.parentElement.querySelectorAll(".option-btn");
  options.forEach((opt) => opt.classList.add("disabled"));

  // Add selected class to track user's choice
  button.classList.add("selected");

  if (isCorrect) {
    button.classList.add("correct");
    score++;
  } else {
    button.classList.add("incorrect");
    options.forEach((opt) => {
      if (opt.dataset.correct === "true") {
        opt.classList.add("correct");
      }
    });
  }

  // Show explanation
  const explanation = button.dataset.explanation;
  if (explanation) {
    showExplanation(explanation);
  }

  document.getElementById("nextBtn").disabled = false;
}

function nextQuestion() {
  if (window.incorrectQuestions) {
    // Review mode navigation
    window.currentReviewIndex++;
    if (window.currentReviewIndex < window.incorrectQuestions.length) {
      carousel.to(window.incorrectQuestions[window.currentReviewIndex]);
      currentQuestionIndex =
        window.incorrectQuestions[window.currentReviewIndex];
      updateReviewNavigation();
    }
  } else {
    // Normal quiz navigation
    const totalQuestions =
      document.querySelectorAll(".carousel-item").length - 1;
    currentQuestionIndex++;

    if (currentQuestionIndex < totalQuestions) {
      carousel.next();
      document.getElementById("nextBtn").disabled = true;
      document.getElementById("prevBtn").style.display = "block";
      updateProgress();
    } else {
      // Show results and save stats
      const finalScore = Math.round((score / totalQuestions) * 100);
      document.getElementById("finalScore").textContent = score;

      // Save statistics
      const stats = JSON.parse(
        localStorage.getItem("quizStats") || '{"quizzes":[], "totalQuizzes":0}'
      );
      stats.quizzes.push({
        date: new Date(),
        category: document.querySelector(".category-header h2").textContent,
        score: finalScore,
        totalQuestions: totalQuestions,
        correctAnswers: score,
      });
      stats.totalQuizzes++;
      localStorage.setItem("quizStats", JSON.stringify(stats));

      carousel.next();
      document.getElementById("nextBtn").style.display = "none";
      document.getElementById("prevBtn").style.display = "none";
      // Clear progress on completion
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem(CURRENT_SCORE_KEY);
    }
  }
}

function previousQuestion() {
  if (window.incorrectQuestions) {
    // Review mode navigation
    window.currentReviewIndex--;
    if (window.currentReviewIndex >= 0) {
      carousel.to(window.incorrectQuestions[window.currentReviewIndex]);
      currentQuestionIndex =
        window.incorrectQuestions[window.currentReviewIndex];
      updateReviewNavigation();
    }
  } else {
    // Normal quiz navigation
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      carousel.prev();
      document.getElementById("nextBtn").disabled = false;
      if (currentQuestionIndex === 0) {
        document.getElementById("prevBtn").style.display = "none";
      }
      updateProgress();
    }
  }
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;

  // Reset all buttons
  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.classList.remove("correct", "incorrect", "disabled");
  });

  // Reset carousel to first slide
  carousel.to(0);

  // Reset navigation buttons
  document.getElementById("nextBtn").style.display = "block";
  document.getElementById("nextBtn").disabled = true;
  document.getElementById("prevBtn").style.display = "none";

  // Clear progress
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(CURRENT_SCORE_KEY);

  window.incorrectQuestions = null;
  window.currentReviewIndex = null;

  updateProgress();
}

function reviewAnswers() {
  const questions = document.querySelectorAll(".carousel-item");
  let incorrectQuestions = [];
  let userAnswers = [];

  // First pass: identify incorrect questions and store user selections
  questions.forEach((question, index) => {
    if (index < questions.length - 1) {
      // Skip the results slide
      const options = question.querySelectorAll(".option-btn");
      let hasIncorrectAnswer = false;
      let userSelection = null;

      options.forEach((option) => {
        // Clear previous review styling
        option.classList.remove("correct", "incorrect", "disabled");
        option.innerHTML = option.innerHTML.replace(
          ' <i class="fas fa-check"></i>',
          ""
        );

        if (option.classList.contains("selected")) {
          userSelection = option;
          if (option.dataset.correct === "false") {
            hasIncorrectAnswer = true;
          }
        }
      });

      if (hasIncorrectAnswer) {
        incorrectQuestions.push(index);
        userAnswers[index] = userSelection;
      }
    }
  });

  // If no incorrect answers, show a message
  if (incorrectQuestions.length === 0) {
    alert("Congratulations! All your answers were correct!");
    return;
  }

  // Show navigation buttons for review mode
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  prevBtn.style.display = "block";
  nextBtn.style.display = "block";
  nextBtn.disabled = false;

  // Second pass: style incorrect questions
  questions.forEach((question, index) => {
    if (incorrectQuestions.includes(index)) {
      const options = question.querySelectorAll(".option-btn");
      options.forEach((option) => {
        option.classList.add("disabled");

        // Show user's incorrect answer
        if (option === userAnswers[index]) {
          option.classList.add("incorrect");
        }

        // Show correct answer
        if (option.dataset.correct === "true") {
          option.classList.add("correct");
          option.innerHTML += ' <i class="fas fa-check"></i>';
        }
      });
    }
  });

  // Go to the first incorrect question
  carousel.to(incorrectQuestions[0]);
  currentQuestionIndex = incorrectQuestions[0];

  // Store incorrect questions for navigation
  window.incorrectQuestions = incorrectQuestions;
  window.currentReviewIndex = 0;

  // Update navigation for review mode
  updateReviewNavigation();
}

function updateReviewNavigation() {
  if (!window.incorrectQuestions) return;

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  prevBtn.style.display = window.currentReviewIndex > 0 ? "block" : "none";

  // If we're at the last incorrect question
  if (window.currentReviewIndex >= window.incorrectQuestions.length - 1) {
    nextBtn.innerHTML = 'Finish Review<i class="fas fa-check ms-2"></i>';
    nextBtn.onclick = function () {
      // Reset review mode
      window.incorrectQuestions = null;
      window.currentReviewIndex = null;

      // Go to results slide
      const totalQuestions = document.querySelectorAll(".carousel-item").length;
      carousel.to(totalQuestions - 1);

      // Hide navigation buttons
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";

      // Reset next button
      nextBtn.innerHTML = 'Next<i class="fas fa-arrow-right ms-2"></i>';
      nextBtn.onclick = nextQuestion;
    };
  } else {
    nextBtn.style.display = "block";
    nextBtn.innerHTML = 'Next<i class="fas fa-arrow-right ms-2"></i>';
    nextBtn.onclick = nextQuestion;
  }
}

// Chat functionality
function toggleChat() {
  const sidebar = document.querySelector(".chat-sidebar");
  sidebar.classList.toggle("open");
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message) return;

  // Add user message
  addMessage(message, "user");
  input.value = "";

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `An AI Assistant to solve quizzes and you are being used in a quiz website.So answer as precisely and as consicely as possible :   ${message}`,
      }),
    });

    const data = await response.json();
    addMessage(data.response, "ai");
  } catch (error) {
    addMessage("Sorry, I encountered an error. Please try again.", "ai");
  }
}

function addMessage(text, type) {
  const messages = document.getElementById("chatMessages");
  const message = document.createElement("div");
  message.className = `message ${type}-message`;
  message.textContent = text;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

// Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
}

function initializeDarkMode() {
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") {
    document.body.classList.add("dark-mode");
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initializeProgress();
  initializeDarkMode();
});

function dragStart(event) {
  event.dataTransfer.setData("text/plain", null);
  const style = window.getComputedStyle(event.target, null);
  const str =
    parseInt(style.getPropertyValue("left"), 10) -
    event.clientX +
    "," +
    (parseInt(style.getPropertyValue("top"), 10) - event.clientY);
  event.dataTransfer.setData("text/plain", str);
}

function dragEnd(event) {
  const offset = event.dataTransfer.getData("text/plain").split(",");
  const dm = document.querySelector(".chat-sidebar");
  dm.style.left = event.clientX + parseInt(offset[0], 10) + "px";
  dm.style.top = event.clientY + parseInt(offset[1], 10) + "px";
}

function copyQuestionToChat(question) {
  const chatInput = document.getElementById("chatInput");
  chatInput.value = question;

  // Open chat if it's closed
  const sidebar = document.querySelector(".chat-sidebar");
  if (!sidebar.classList.contains("open")) {
    toggleChat();
  }

  // Focus on the input
  chatInput.focus();
}
