// Biology quiz functionality
document.addEventListener("DOMContentLoaded", function () {
  // Check if we're on the biology quiz page
  const isBiologyQuiz = window.location.pathname.includes("/quiz/biology");

  if (isBiologyQuiz) {
    console.log("Biology quiz loaded from 450 single best questions");

    // Add biology-specific styling
    document.querySelectorAll(".quiz-card").forEach((card) => {
      card.classList.add("biology-themed");
    });

    // Add biology icons to option buttons
    document.querySelectorAll(".option-btn").forEach((option) => {
      // Prepend option with DNA icon
      const iconSpan = document.createElement("span");
      iconSpan.className = "me-2";
      iconSpan.innerHTML = '<i class="fas fa-dna biology-icon"></i>';

      // Only add icon if it doesn't already have one
      if (!option.querySelector(".biology-icon")) {
        option.prepend(iconSpan);
      }
    });

    // Create a div for biology facts if it doesn't exist
    if (!document.getElementById("biology-facts")) {
      const factsContainer = document.createElement("div");
      factsContainer.id = "biology-facts";
      factsContainer.className = "biology-facts-container";
      document.querySelector(".quiz-container").appendChild(factsContainer);
    }

    // Enhance the checkAnswer function to show biology facts
    const originalCheckAnswer = window.checkAnswer;
    window.checkAnswer = function (button, isCorrect) {
      // Call the original function
      originalCheckAnswer(button, isCorrect);

      // Show a random biology fact
      showBiologyFact(isCorrect);
    };

    // Track quiz completion for biology specifically
    window.addEventListener("quizCompleted", function (e) {
      const stats = JSON.parse(
        localStorage.getItem("biologyStats") ||
          '{"completed": 0, "highScore": 0}'
      );
      stats.completed++;

      if (e.detail.score > stats.highScore) {
        stats.highScore = e.detail.score;
      }

      localStorage.setItem("biologyStats", JSON.stringify(stats));

      // Add a special message for biology quiz completion
      const resultsElement = document.querySelector(".quiz-complete");
      if (resultsElement) {
        const funFact = document.createElement("p");
        funFact.className = "mt-3 biology-fun-fact";
        funFact.innerHTML =
          '<i class="fas fa-microscope me-2"></i>Fun fact: Human DNA is about 99.9% identical from person to person!';
        resultsElement.appendChild(funFact);
      }
    });
  }
});

// Function to show biology facts when answering questions
function showBiologyFact(isCorrect) {
  const factsContainer = document.getElementById("biology-facts");
  if (!factsContainer) return;

  const facts = [
    "The human body has over 600 muscles.",
    "A human brain weighs about 3 pounds.",
    "DNA contains the instructions for building proteins.",
    "Humans share about 98.8% of their DNA with chimpanzees.",
    "The human body contains about 60,000 miles of blood vessels.",
  ];

  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  const factElement = document.createElement("div");
  factElement.className = `fact-card ${isCorrect ? "correct" : "incorrect"}`;
  factElement.innerHTML = `
    <i class="fas fa-lightbulb"></i>
    <p>${randomFact}</p>
  `;

  factsContainer.appendChild(factElement);

  // Remove the fact after some time
  setTimeout(() => {
    factElement.classList.add("fade-out");
    setTimeout(() => {
      factElement.remove();
    }, 500);
  }, 3000);
}
