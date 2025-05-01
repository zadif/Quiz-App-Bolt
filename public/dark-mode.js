// Initial page loader implementation
(() => {
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
      background-color: ${
        localStorage.getItem("darkMode") === "enabled" ? "#2d2d2d" : "#f8f9fa"
      };
      z-index: 9998;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: opacity 0.3s ease-out;
    }
    .loader-spinner {
      width: 50px;
      height: 50px;
      border: 5px solid rgba(${
        localStorage.getItem("darkMode") === "enabled"
          ? "255, 255, 255"
          : "0, 0, 0"
      }, 0.3);
      border-radius: 50%;
      border-top-color: ${
        localStorage.getItem("darkMode") === "enabled" ? "#fff" : "#0d6efd"
      };
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    body.content-loaded #page-loader {
      opacity: 0;
      pointer-events: none;
    }
    
    /* Dark mode styles */
    html.dark-mode, 
    body.dark-mode {
      background-color: #222;
      color: #f0f0f0;
    }
    
    .dark-mode .card,
    .dark-mode .list-group-item {
      background-color: #333 !important;
      color: #f0f0f0 !important;
      border-color: #444 !important;
    }
    
    .dark-mode h1, .dark-mode h2, .dark-mode h3, 
    .dark-mode h4, .dark-mode h5, .dark-mode h6,
    .dark-mode p, .dark-mode .card-title, 
    .dark-mode .card-text, .dark-mode .text-muted {
      color: #f0f0f0 !important;
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

// Toggle dark mode function
function toggleDarkMode() {
  // Show loader during transition
  showDarkModeLoader();

  setTimeout(() => {
    document.documentElement.classList.toggle("dark-mode");
    document.body.classList.toggle("dark-mode");

    const isDarkMode = document.documentElement.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");

    // Update icon
    const icon = document.querySelector("#darkModeToggle i");
    if (icon) {
      icon.className = isDarkMode ? "fas fa-sun" : "fas fa-moon";
    }

    // Apply page-specific dark mode changes
    if (window.location.pathname.includes("/stats")) {
      if (typeof applyStatsDarkMode === "function") {
        applyStatsDarkMode();
      }
    } else if (typeof applyAdditionalQuizzesDarkMode === "function") {
      applyAdditionalQuizzesDarkMode();
    } else {
      applyGeneralDarkMode(isDarkMode);
    }

    // Hide loader after transition
    setTimeout(hideDarkModeLoader, 300);
  }, 50);
}

// Show loader during dark mode transition
function showDarkModeLoader() {
  // Check if loader already exists
  let loader = document.getElementById("dark-mode-loader");

  if (!loader) {
    loader = document.createElement("div");
    loader.id = "dark-mode-loader";
    loader.innerHTML = `<div class="loader-spinner"></div>`;
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

// Apply general dark mode styles
function applyGeneralDarkMode(isDarkMode) {
  if (isDarkMode) {
    // Apply to cards and list items
    document.querySelectorAll(".card, .list-group-item").forEach((el) => {
      el.style.backgroundColor = "#333";
      el.style.color = "#f0f0f0";
      el.style.borderColor = "#444";
    });

    // Apply to text elements
    document
      .querySelectorAll("h1, h2, h3, h4, h5, h6, p, .card-title, .card-text")
      .forEach((el) => {
        el.style.color = "#f0f0f0";
      });

    // Style muted text
    document.querySelectorAll(".text-muted").forEach((el) => {
      el.style.color = "#aaa !important";
    });
  } else {
    // Remove custom styles in light mode
    document
      .querySelectorAll(
        ".card, .list-group-item, h1, h2, h3, h4, h5, h6, p, .card-title, .card-text, .text-muted"
      )
      .forEach((el) => {
        el.style.backgroundColor = "";
        el.style.color = "";
        el.style.borderColor = "";
      });
  }
}

// Initialize dark mode
function initializeDarkMode() {
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") {
    document.documentElement.classList.add("dark-mode");
    document.body.classList.add("dark-mode");

    // Update icon
    const icon = document.querySelector("#darkModeToggle i");
    if (icon) {
      icon.className = "fas fa-sun";
    }

    // Apply page-specific dark mode on load
    setTimeout(() => {
      if (
        window.location.pathname.includes("/stats") &&
        typeof applyStatsDarkMode === "function"
      ) {
        applyStatsDarkMode();
      } else {
        applyGeneralDarkMode(true);
      }
    }, 100);
  }

  // Hide loader after everything is loaded and styled
  setTimeout(function () {
    document.body.classList.add("content-loaded");

    // Remove loader completely after fade out animation
    setTimeout(function () {
      const loader = document.getElementById("page-loader");
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 300); // Match this with the CSS transition time
  }, 500); // Adjust timing as needed for your site
}

// Listen for DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeDarkMode();

  // Ensure dark mode toggle button works on all pages
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", toggleDarkMode);
  }
});

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
      if (
        window.location.pathname.includes("/stats") &&
        typeof applyStatsDarkMode === "function"
      ) {
        applyStatsDarkMode();
      } else {
        applyGeneralDarkMode(true);
      }
    }
  }, 500);
}

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
    setTimeout(handlePageTransition, 100);
  }
});

// Listen for history changes (for SPAs with client-side routing)
window.addEventListener("popstate", handlePageTransition);
window.addEventListener("hashchange", handlePageTransition);

// Apply dark mode when page changes
window.addEventListener("load", () => {
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") {
    setTimeout(() => {
      if (
        window.location.pathname.includes("/stats") &&
        typeof applyStatsDarkMode === "function"
      ) {
        applyStatsDarkMode();
      } else {
        applyGeneralDarkMode(true);
      }

      // Hide both loaders after page is fully loaded
      hideDarkModeLoader();
      document.body.classList.add("content-loaded");
    }, 300);
  } else {
    // Hide page loader in light mode too
    document.body.classList.add("content-loaded");
  }
});
