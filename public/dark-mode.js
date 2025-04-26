// Apply dark mode immediately if it's enabled (no waiting for DOM)
(function () {
  // Create and insert page loader
  const loader = document.createElement("div");
  loader.id = "page-loader";
  loader.innerHTML = `
    <div class="loader-spinner"></div>
  `;

  // Add loader styles
  const style = document.createElement("style");
  style.textContent = `
    #page-loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #2d2d2d;
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: opacity 0.3s ease-out;
    }
    .loader-spinner {
      width: 50px;
      height: 50px;
      border: 5px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    body.content-loaded #page-loader {
      opacity: 0;
      pointer-events: none;
    }
    html, body {
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    /* Enhanced fix for text visibility in hero section */
    html.dark-mode .hero-content h1,
    html.dark-mode .hero-content h2,
    html.dark-mode .hero-content h3,
    html.dark-mode .hero-content p,
    html.dark-mode .hero-content .btn,
    body.dark-mode .hero-content h1,
    body.dark-mode .hero-content h2,
    body.dark-mode .hero-content h3,
    body.dark-mode .hero-content p,
    body.dark-mode .hero-content .btn,
    .dark-mode .hero-section * {
      color: #ffffff !important;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8) !important;
    }
    
    /* Stronger MCQ styling for dark mode */
    html.dark-mode .mcq-container,
    html.dark-mode .question-container,
    html.dark-mode .answers-container,
    html.dark-mode .mcq-section,
    html.dark-mode .question-box,
    html.dark-mode .answer-box,
    body.dark-mode .mcq-container,
    body.dark-mode .question-container,
    body.dark-mode .answers-container,
    body.dark-mode .mcq-section,
    body.dark-mode .question-box,
    body.dark-mode .answer-box {
      background-color: #333333 !important;
      color: #f0f0f0 !important;
      border-color: #555555 !important;
    }
    
    html.dark-mode .mcq-option,
    html.dark-mode .option,
    html.dark-mode .answer-option,
    body.dark-mode .mcq-option,
    body.dark-mode .option,
    body.dark-mode .answer-option {
      background-color: #444444 !important;
      color: #ffffff !important;
      border-color: #555555 !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
    }
    
    html.dark-mode .mcq-option:hover,
    html.dark-mode .option:hover,
    html.dark-mode .answer-option:hover,
    body.dark-mode .mcq-option:hover,
    body.dark-mode .option:hover,
    body.dark-mode .answer-option:hover {
      background-color: #555555 !important;
    }
    
    /* Additional dark mode styles for any other elements that might need it */
    html.dark-mode input, 
    html.dark-mode select, 
    html.dark-mode textarea,
    body.dark-mode input, 
    body.dark-mode select, 
    body.dark-mode textarea {
      background-color: #444444 !important;
      color: #ffffff !important;
      border-color: #555555 !important;
    }
  `;

  // Apply dark mode before showing content if needed
  if (localStorage.getItem("darkMode") === "enabled") {
    document.documentElement.classList.add("dark-mode");
    // If body is already available, add class to it too
    if (document.body) {
      document.body.classList.add("dark-mode");
    }
  }

  // Inject loader and styles as early as possible
  document.head.appendChild(style);

  // Add loader to body when it becomes available
  if (document.body) {
    document.body.appendChild(loader);
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      document.body.appendChild(loader);
    });
  }
})();

// Dark Mode functionality
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark-mode");
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");

  // Update icon if it exists
  const icon = document.querySelector("#darkModeToggle i");
  if (icon) {
    icon.className = isDarkMode ? "fas fa-sun" : "fas fa-moon";
  }
}

// Initialize dark mode based on localStorage
function initializeDarkMode() {
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") {
    document.documentElement.classList.add("dark-mode");
    document.body.classList.add("dark-mode");

    // Update icon if it exists
    const icon = document.querySelector("#darkModeToggle i");
    if (icon) {
      icon.className = "fas fa-sun";
    }
  }

  // Hide loader after everything is loaded and styled
  setTimeout(function () {
    document.body.classList.add("content-loaded");

    // Apply dark mode to any MCQs containers that might be present
    applyDarkModeToMCQs();

    // Remove loader completely after fade out animation
    setTimeout(function () {
      const loader = document.getElementById("page-loader");
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 300); // Match this with the CSS transition time
  }, 500); // Adjust timing as needed for your site
}

// Apply dark mode on page load
document.addEventListener("DOMContentLoaded", initializeDarkMode);

// Enhanced apply dark mode to MCQs function with better targeting for additional pages
function applyDarkModeToMCQs() {
  if (localStorage.getItem("darkMode") !== "enabled") return;

  // Force dark mode styles with inline styling as a fallback
  const forceDarkMode = (elements, styles) => {
    elements.forEach((el) => {
      Object.entries(styles).forEach(([prop, value]) => {
        el.style.setProperty(prop, value, "important");
      });
    });
  };

  // Target additional pages content and containers
  const additionalContainers = document.querySelectorAll(
    // MCQ specific containers
    ".mcq-container, .question-container, .answers-container, .mcq-section, .question-box, .answer-box, " +
      // Additional pages
      "#additionalContent, .additional-content, .additional-mcqs, .mcq-page, " +
      // General content containers that might be used
      ".content-section, .content-container, .main-content, main, article, section"
  );

  forceDarkMode(additionalContainers, {
    "background-color": "#333333",
    color: "#f0f0f0",
    "border-color": "#555555",
  });

  // Target all text and interactive elements within MCQ/additional pages
  const allTextElements = document.querySelectorAll(
    // Inside containers that might have MCQs
    ".mcq-container *, .question-container *, .answers-container *, .mcq-section *, " +
      "#additionalContent *, .additional-content *, .content-section *, .main-content *, " +
      // General text elements
      "p, h1, h2, h3, h4, h5, h6, span, label, a"
  );

  forceDarkMode(allTextElements, {
    color: "#f0f0f0",
  });
}

// Improved page transition handler
function handlePageTransition() {
  // Show loader again
  document.body.classList.remove("content-loaded");
  const loader = document.getElementById("page-loader");
  if (!loader) {
    const newLoader = document.createElement("div");
    newLoader.id = "page-loader";
    newLoader.innerHTML = '<div class="loader-spinner"></div>';
    document.body.appendChild(newLoader);
  }

  // Fix the dark mode application on the new page
  const isDarkMode = localStorage.getItem("darkMode") === "enabled";
  if (isDarkMode) {
    document.documentElement.classList.add("dark-mode");
    document.body.classList.add("dark-mode");
  }

  // Hide loader after transition completes and apply dark mode to new content
  setTimeout(function () {
    document.body.classList.add("content-loaded");
    if (isDarkMode) {
      applyDarkModeToMCQs();
    }
  }, 500);
}

// Add a function to specifically handle additional page loading
function handleAdditionalPageLoad() {
  if (localStorage.getItem("darkMode") === "enabled") {
    // Make sure dark mode classes are applied
    document.documentElement.classList.add("dark-mode");
    document.body.classList.add("dark-mode");

    // Apply the dark mode styles forcefully
    applyDarkModeToMCQs();

    // Set a repeated check for dynamically loaded content
    const checkInterval = setInterval(() => {
      applyDarkModeToMCQs();
    }, 500);

    // Clear interval after 5 seconds (10 checks)
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 5000);
  }
}

// Call the handler when the page fully loads
window.addEventListener("load", handleAdditionalPageLoad);

// Add event listeners for common navigation methods
document.addEventListener("click", function (e) {
  // Check if the click was on a navigation element like a button or link
  if (
    e.target.tagName === "A" ||
    e.target.tagName === "BUTTON" ||
    e.target.closest("a") ||
    e.target.closest("button")
  ) {
    // Wait for potential page change and apply dark mode
    setTimeout(handleAdditionalPageLoad, 500);
  }
});

// Listen for history changes (for SPAs with client-side routing)
window.addEventListener("popstate", handleAdditionalPageLoad);
window.addEventListener("hashchange", handleAdditionalPageLoad);

// Make the observer more comprehensive
const observer = new MutationObserver(function (mutations) {
  if (localStorage.getItem("darkMode") !== "enabled") return;

  let shouldApply = false;
  mutations.forEach(function (mutation) {
    if (
      mutation.addedNodes.length ||
      mutation.attributeName === "class" ||
      mutation.attributeName === "style"
    ) {
      shouldApply = true;
    }
  });

  if (shouldApply) {
    // Small delay to ensure DOM is settled
    setTimeout(applyDarkModeToMCQs, 50);
  }
});

// Initialize the observer with a more aggressive approach
const aggressiveObserver = new MutationObserver(function () {
  if (localStorage.getItem("darkMode") === "enabled") {
    // Apply immediately for quick changes
    applyDarkModeToMCQs();

    // And again after a short delay for any async rendering
    setTimeout(applyDarkModeToMCQs, 100);
    setTimeout(applyDarkModeToMCQs, 500);
  }
});

// Observe everything
aggressiveObserver.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class", "style"],
});
