import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import ejsLayouts from "express-ejs-layouts";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Quiz categories and data
const quizCategories = [
  {
    id: "general",
    title: "General Knowledge",
    description: "Test your knowledge across various general topics",
    icon: "fa-brain",
    color: "primary",
  },
  {
    id: "science",
    title: "Science & Technology",
    description: "Explore the wonders of science and modern technology",
    icon: "fa-flask",
    color: "primary",
  },
  {
    id: "history",
    title: "History",
    description: "Journey through time with historical facts and events",
    icon: "fa-landmark",
    color: "primary",
  },
  {
    id: "sports",
    title: "Sports",
    description: "Challenge yourself with sports trivia and facts",
    icon: "fa-football",
    color: "primary",
  },
  {
    id: "biology",
    title: "Biology",
    description: "Test your knowledge of biological concepts and organisms",
    icon: "fa-dna",
    color: "success",
  },
];

// Load Biology questions from the JSON file
async function loadBiologyQuestions() {
  try {
    // Use correct file path - Check if directory exists
    const dataPath = join(__dirname, "data", "450singlebest.json");

    // Check if file exists before trying to read it
    try {
      await fs.access(dataPath);
    } catch (error) {
      // Fall back to sample file if main file doesn't exist
      const samplePath = join(__dirname, "data", "sample-biology.json");

      try {
        await fs.access(samplePath);
        const sampleData = await fs.readFile(samplePath, "utf8");
        const sampleQuestions = JSON.parse(sampleData);
        return sampleQuestions.map((q) => ({
          question: q.question,
          options: [q.A, q.B, q.C, q.D],
          correctAnswer: ["A", "B", "C", "D"].indexOf(q.answer),
          explanation: q.explanation || `The correct answer is ${q.answer}.`,
        }));
      } catch (sampleError) {
        console.error(
          "Sample file not found either. Using fallback questions."
        );
      }

      // Return fallback questions if no files are found
      return [
        {
          question: "Which of the following is the powerhouse of the cell?",
          options: [
            "Nucleus",
            "Mitochondria",
            "Golgi Apparatus",
            "Endoplasmic Reticulum",
          ],
          correctAnswer: 1,
          explanation:
            "Mitochondria are often referred to as the powerhouse of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP).",
        },
        // ...other fallback questions...
      ];
    }

    // Read and parse the file
    const data = await fs.readFile(dataPath, "utf8");
    const questions = JSON.parse(data);

    // Process all questions - assuming all are biology questions
    const biologyQuestions = [];

    for (const q of questions) {
      // Check if it uses the new format with "options" array instead of A,B,C,D properties
      const isNewFormat = Array.isArray(q.options);

      // Process questions based on the format
      if (
        isNewFormat &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        q.answer
      ) {
        // Handle new format with options array
        // Extract the letter index (A=0, B=1, etc.) from the answer
        const correctAnswerIndex = q.answer.charCodeAt(0) - "A".charCodeAt(0);

        biologyQuestions.push({
          question: q.question,
          options: q.options.map((opt) => {
            // Remove the letter prefix if present (e.g., "A. Option" -> "Option")
            const match = opt.match(/^[A-E]\.\s*(.*)/);
            return match ? match[1] : opt;
          }),
          correctAnswer: correctAnswerIndex,
          explanation: q.explanation || `The correct answer is ${q.answer}.`,
        });
      } else if (q.A && q.B && q.C && q.D && q.answer) {
        // Handle old format with A, B, C, D properties
        biologyQuestions.push({
          question: q.question,
          options: [q.A, q.B, q.C, q.D],
          correctAnswer: ["A", "B", "C", "D"].indexOf(q.answer),
          explanation: q.explanation || `The correct answer is ${q.answer}.`,
        });
      }
    }

    // Return all biology questions
    return biologyQuestions;

    // If we still couldn't identify any biology questions, try with the sample file
    try {
      const samplePath = join(__dirname, "data", "sample-biology.json");
      const sampleData = await fs.readFile(samplePath, "utf8");
      const sampleQuestions = JSON.parse(sampleData);
      return sampleQuestions.map((q) => ({
        question: q.question,
        options: [q.A, q.B, q.C, q.D],
        correctAnswer: ["A", "B", "C", "D"].indexOf(q.answer),
        explanation: q.explanation || `The correct answer is ${q.answer}.`,
      }));
    } catch (error) {
      console.error("Error loading sample biology questions:", error);
      // Return some fallback questions as last resort
      return [
        {
          question: "Which of the following is the powerhouse of the cell?",
          options: [
            "Nucleus",
            "Mitochondria",
            "Golgi Apparatus",
            "Endoplasmic Reticulum",
          ],
          correctAnswer: 1,
          explanation:
            "Mitochondria are often referred to as the powerhouse of the cell.",
        },
      ];
    }
  } catch (error) {
    console.error("Error in loadBiologyQuestions:", error);
    // Return some fallback questions
    return [
      // ...fallback questions...
    ];
  }
}

const quizData = {
  general: {
    questions: [
      {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        explanation:
          "Paris is the capital and largest city of France, known for its iconic landmarks like the Eiffel Tower and the Louvre Museum.",
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        explanation:
          "Mars is called the Red Planet because of its reddish appearance, which is due to iron oxide (rust) on its surface.",
      },
      {
        question: "Who painted the Mona Lisa?",
        options: ["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"],
        correctAnswer: 1,
        explanation:
          "Leonardo da Vinci painted the Mona Lisa between 1503 and 1519. It is one of the most famous paintings in the world.",
      },
    ],
  },
  science: {
    questions: [
      {
        question: "What is the chemical symbol for Gold?",
        options: ["Ag", "Fe", "Au", "Cu"],
        correctAnswer: 2,
        explanation:
          "Au is the chemical symbol for Gold, derived from the Latin word 'aurum'.",
      },
      {
        question: "What is the speed of light?",
        options: [
          "299,792 km/s",
          "199,792 km/s",
          "399,792 km/s",
          "499,792 km/s",
        ],
        correctAnswer: 0,
        explanation:
          "The speed of light in a vacuum is approximately 299,792 kilometers per second (km/s).",
      },
    ],
  },
  history: {
    questions: [
      {
        question: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correctAnswer: 2,
        explanation:
          "World War II ended in 1945 with the surrender of Germany in May and Japan in September.",
      },
      {
        question: "Who was the first President of the United States?",
        options: [
          "John Adams",
          "Thomas Jefferson",
          "Benjamin Franklin",
          "George Washington",
        ],
        correctAnswer: 3,
        explanation:
          "George Washington served as the first President of the United States from 1789 to 1797.",
      },
    ],
  },
  sports: {
    questions: [
      {
        question: "Which country won the FIFA World Cup 2022?",
        options: ["France", "Brazil", "Argentina", "Germany"],
        correctAnswer: 2,
        explanation:
          "Argentina won the 2022 FIFA World Cup in Qatar, defeating France in the final on penalties.",
      },
      {
        question: "In which sport would you perform a slam dunk?",
        options: ["Football", "Basketball", "Tennis", "Golf"],
        correctAnswer: 1,
        explanation:
          "A slam dunk is a type of basketball shot where a player jumps high and forcefully puts the ball through the hoop.",
      },
    ],
  },
  // Biology questions will be loaded dynamically
};

// Setup middleware
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));
app.use(ejsLayouts);
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.render("landing", {
    title: "QuizMaster - Test Your Knowledge",
    categories: quizCategories,
  });
});

app.get("/stats", (req, res) => {
  res.render("stats", { title: "Statistics" });
});

app.get("/quiz/:category", async (req, res) => {
  const category = req.params.category;

  // For biology, load questions from JSON file
  if (category === "biology") {
    const biologyQuestions = await loadBiologyQuestions();

    if (biologyQuestions.length === 0) {
      return res.redirect("/");
    }

    const categoryDetails = quizCategories.find((cat) => cat.id === category);

    // Return all questions in their original order (no sorting or limiting)
    return res.render("quiz", {
      title: `Biology Quiz`,
      questions: biologyQuestions,
      category: categoryDetails,
    });
  }

  // For other categories, use the existing data
  const quiz = quizData[category];
  if (!quiz || !quiz.questions) {
    return res.redirect("/");
  }

  const categoryDetails = quizCategories.find((cat) => cat.id === category);
  if (!categoryDetails) {
    return res.redirect("/");
  }

  res.render("quiz", {
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Quiz`,
    questions: quiz.questions,
    category: categoryDetails,
  });
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const result = await model.generateContent(message);
    const response = await result.response;
    res.json({ response: response.text() });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to get response" });
  }
});

app.listen(port, () => {
  console.log(`Quiz app listening at http://localhost:${port}`);
});
