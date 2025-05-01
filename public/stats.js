function updateStats() {
  const stats = JSON.parse(
    localStorage.getItem("quizStats") || '{"quizzes":[], "totalQuizzes":0}'
  );

  if (stats.quizzes.length > 0) {
    document.getElementById("totalQuizzes").textContent = stats.totalQuizzes;

    const scores = stats.quizzes.map((quiz) => quiz.score);
    const average = scores.reduce((a, b) => a + b) / scores.length;
    const best = Math.max(...scores);

    document.getElementById("averageScore").textContent = `${Math.round(
      average
    )}%`;
    document.getElementById("bestScore").textContent = `${Math.round(best)}%`;

    // Update progress history with more details
    const historyHTML = stats.quizzes
      .slice(-5)
      .reverse()
      .map(
        (quiz) => `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1 stats-heading">
                                <i class="fas fa-book me-2"></i>${quiz.category}
                            </h6>
                            <small class="text-muted">
                                <i class="far fa-calendar me-1"></i>${new Date(
                                  quiz.date
                                ).toLocaleDateString()}
                                <span class="ms-2">
                                    <i class="fas fa-check me-1"></i>${
                                      quiz.correctAnswers
                                    }/${quiz.totalQuestions} correct
                                </span>
                            </small>
                        </div>
                        <span class="badge ${getScoreBadgeClass(
                          quiz.score
                        )} rounded-pill">
                            ${quiz.score}%
                        </span>
                    </div>
                </div>
            `
      )
      .join("");

    document.getElementById("progressHistory").innerHTML = historyHTML;
  }
}

function getScoreBadgeClass(score) {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-primary";
  if (score >= 40) return "bg-warning";
  return "bg-danger";
}

function confirmResetStats() {
  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Reset Statistics</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to reset all your statistics? This action cannot be undone.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" onclick="resetStats()">Reset Stats</button>
                </div>
            </div>
        </div>
    `;
  document.body.appendChild(modal);

  // Initialize Bootstrap modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  // Remove modal from DOM after it's hidden
  modal.addEventListener("hidden.bs.modal", function () {
    modal.remove();
  });
}

function resetStats() {
  // Reset stats in localStorage
  localStorage.setItem(
    "quizStats",
    JSON.stringify({ quizzes: [], totalQuizzes: 0 })
  );

  // Hide modal
  const modal = document.querySelector(".modal");
  const bsModal = bootstrap.Modal.getInstance(modal);
  bsModal.hide();

  // Show success toast
  const toast = document.createElement("div");
  toast.className = "alert alert-success position-fixed bottom-0 end-0 m-3";
  toast.style.zIndex = "1050";
  toast.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        Statistics have been reset successfully
    `;
  document.body.appendChild(toast);

  // Reload the page after a short delay
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Initialize dark mode and stats on page load
document.addEventListener("DOMContentLoaded", () => {
  updateStats();

  // Fix broken HTML in stats history
  fixStatsHistoryMarkup();

  // Initialize dark mode with a slight delay to ensure DOM is ready
  setTimeout(() => {
    applyStatsDarkMode();

    // Ensure dark mode toggle works on stats page
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
      // Remove existing listeners and create a fresh one
      const newToggle = darkModeToggle.cloneNode(true);
      darkModeToggle.parentNode.replaceChild(newToggle, darkModeToggle);

      newToggle.addEventListener("click", function () {
        // Show loader during transition
        showDarkModeLoader();

        // Toggle dark mode after a small delay
        setTimeout(() => {
          // Toggle dark mode
          document.body.classList.toggle("dark-mode");
          document.documentElement.classList.toggle("dark-mode");

          const isDarkMode = document.body.classList.contains("dark-mode");
          localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");

          // Update icon
          const icon = this.querySelector("i");
          if (icon) {
            icon.className = isDarkMode ? "fas fa-sun" : "fas fa-moon";
          }

          applyStatsDarkMode();

          // Hide loader after transition
          setTimeout(hideDarkModeLoader, 300);
        }, 50);
      });
    }
  }, 100);
});

// Fix broken markup in stats history
function fixStatsHistoryMarkup() {
  // Find and fix missing quote in stats heading class
  const headings = document.querySelectorAll('h6[class="mb-1 stats-heading]');
  headings.forEach((heading) => {
    heading.className = "mb-1 stats-heading";
  });
}

// Function to specifically apply dark mode to stats page
function applyStatsDarkMode() {
  const isDarkMode = localStorage.getItem("darkMode") === "enabled";

  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    document.documentElement.classList.add("dark-mode");

    // Apply custom styles for stats page elements
    document
      .querySelectorAll(".list-group-item, .card, .modal-content")
      .forEach((el) => {
        el.style.backgroundColor = "#333";
        el.style.color = "#f0f0f0";
        el.style.borderColor = "#444";
      });

    document
      .querySelectorAll(".card-title, .modal-title, h1, h2, h3, h4, h5, h6, p")
      .forEach((el) => {
        el.style.color = "#f0f0f0";
      });

    document
      .querySelectorAll(".text-muted, .stats-heading small")
      .forEach((el) => {
        el.style.color = "#aaa !important";
      });

    // Style badge elements specifically
    document.querySelectorAll(".badge").forEach((el) => {
      if (
        !el.classList.contains("bg-success") &&
        !el.classList.contains("bg-primary") &&
        !el.classList.contains("bg-warning") &&
        !el.classList.contains("bg-danger")
      ) {
        el.style.backgroundColor = "#555";
        el.style.color = "#fff";
      }
    });
  } else {
    // Remove custom styles in light mode
    document
      .querySelectorAll(
        ".list-group-item, .card, .text-muted, .stats-heading, .card-title, .modal-title, .modal-content, h1, h2, h3, h4, h5, h6, p, .badge"
      )
      .forEach((el) => {
        el.style.backgroundColor = "";
        el.style.color = "";
        el.style.borderColor = "";
      });
  }
}

// Show loader during dark mode transition
function showDarkModeLoader() {
  // Check if loader already exists
  let loader = document.getElementById("dark-mode-loader");

  if (!loader) {
    loader = document.createElement("div");
    loader.id = "dark-mode-loader";
    loader.innerHTML = `<div class="loader-spinner"></div>`;
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: opacity 0.3s ease;
    `;

    const spinner = loader.querySelector(".loader-spinner");
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 5px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    `;

    // Add keyframes for the spinner
    if (!document.getElementById("loader-keyframes")) {
      const style = document.createElement("style");
      style.id = "loader-keyframes";
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(loader);
  } else {
    loader.style.display = "flex";
    loader.style.opacity = "1";
  }
}

// Hide loader after transition is complete
function hideDarkModeLoader() {
  const loader = document.getElementById("dark-mode-loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
    }, 300);
  }
}
