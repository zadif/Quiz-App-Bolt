/**
 * Responsive utilities for QuizMaster
 */

// Adjust UI elements based on screen size
function adjustForScreenSize() {
  // Get the current viewport width
  const vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );

  // Adjust font sizes for very small screens
  if (vw < 360) {
    document.documentElement.style.fontSize = "14px";
  } else {
    document.documentElement.style.fontSize = "";
  }

  // Handle navbar buttons on small screens
  const navbarButtons = document.querySelectorAll(".navbar .btn");
  if (vw < 992 && navbarButtons.length > 0) {
    navbarButtons.forEach((btn) => {
      btn.classList.add("btn-sm");
    });
  } else {
    navbarButtons.forEach((btn) => {
      btn.classList.remove("btn-sm");
    });
  }

  // Make the footer sticky only on desktop
  const footer = document.querySelector("footer");
  if (footer) {
    if (vw >= 768) {
      if (document.body.offsetHeight < window.innerHeight) {
        footer.style.position = "fixed";
        footer.style.bottom = "0";
        footer.style.width = "100%";
      } else {
        footer.style.position = "";
        footer.style.bottom = "";
        footer.style.width = "";
      }
    } else {
      footer.style.position = "";
      footer.style.bottom = "";
      footer.style.width = "";
    }
  }

  // Additional adjustments for dark mode
  if (localStorage.getItem("darkMode") === "enabled") {
    // Check if we're on the additional quizzes page
    if (
      window.location.pathname.includes("additional-quizzes") ||
      window.location.pathname.includes("custom")
    ) {
      // Apply special contrast enhancement for dark mode
      enhanceDarkModeContrast();
    }
  }
}

// New function to enhance contrast in dark mode
function enhanceDarkModeContrast() {
  // Target cards which might be invisible in dark mode
  document.querySelectorAll(".card, .list-group-item").forEach((el) => {
    el.style.backgroundColor = "#333333";
    el.style.color = "#ffffff";
  });

  // Make sure text is visible
  document
    .querySelectorAll(".card-title, h3, h4, h5, p, .card-text")
    .forEach((el) => {
      el.style.color = "#ffffff";
      el.style.textShadow = "1px 1px 2px rgba(0, 0, 0, 0.5)";
    });
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  adjustForScreenSize();

  // Check for dark mode changes
  window.addEventListener("storage", function (e) {
    if (e.key === "darkMode") {
      adjustForScreenSize();
    }
  });

  // Reapply on resize
  window.addEventListener("resize", function () {
    adjustForScreenSize();
  });

  // Reapply when content might have changed the page height
  window.addEventListener("load", function () {
    adjustForScreenSize();

    // Additional check after full load for dark mode
    setTimeout(adjustForScreenSize, 1000);
  });

  // Listen for navigation events (for SPA)
  if (window.history && window.history.pushState) {
    window.addEventListener("popstate", adjustForScreenSize);
  }
});
