// Dark Mode functionality
function toggleDarkMode() {
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
    document.body.classList.add("dark-mode");
    const icon = document.querySelector("#darkModeToggle i");
    if (icon) {
      icon.className = "fas fa-sun";
    }
  }
}

// Apply dark mode on page load
document.addEventListener("DOMContentLoaded", initializeDarkMode);
