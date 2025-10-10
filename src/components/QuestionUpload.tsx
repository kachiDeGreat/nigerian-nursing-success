// src/components/QuestionUpload.tsx
import React, { useState } from "react";
import { addBulkQuizQuestions } from "../firebase/firestoreService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/QuestionUpload.module.css";

const QuestionUpload: React.FC = () => {
  const [password, setPassword] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [questionsText, setQuestionsText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  const ADMIN_PASSWORD = "123456789012345";

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setShowUpload(true);
      toast.success("Admin access granted");
    } else {
      toast.error("Incorrect password");
    }
  };

  interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    category: string;
    difficulty: "medium";
    createdBy: string;
  }

  const parseQuestions = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const questions: QuizQuestion[] = [];
    let currentQuestion: QuizQuestion | null = null;
    let currentQuestionText = "";

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if line starts with a number (new question) OR is a question line without number
      if (
        /^\d+\./.test(trimmedLine) ||
        (trimmedLine.length > 10 &&
          /^[A-Za-z]/.test(trimmedLine) &&
          !/^[A-D]\./.test(trimmedLine) &&
          currentQuestion === null)
      ) {
        if (currentQuestion) {
          // Save the previous question if it exists
          currentQuestion.question = currentQuestionText.trim();
          questions.push(currentQuestion);
        }

        // Start a new question
        currentQuestionText = trimmedLine.replace(/^\d+\.\s*/, "");
        currentQuestion = {
          question: "",
          options: [],
          correctAnswer: "",
          category: "General Nursing",
          difficulty: "medium" as const,
          createdBy: "admin",
        };
      }
      // Check if line is an option (starts with A., B., C., D.)
      else if (/^[A-D]\./.test(trimmedLine)) {
        if (currentQuestion) {
          const optionText = trimmedLine.replace(/^[A-D]\.\s*/, "");

          // More flexible check for correct answer markers
          const correctAnswerPatterns = [
            /\(correct answer\)/i,
            /\(correct\)/i,
            /\[correct\]/i,
            /\*correct\*/i,
          ];

          let isCorrect = false;
          let cleanOption = optionText;

          for (const pattern of correctAnswerPatterns) {
            if (pattern.test(optionText)) {
              cleanOption = optionText.replace(pattern, "").trim();
              isCorrect = true;
              break;
            }
          }

          currentQuestion.options.push(cleanOption);

          if (isCorrect) {
            currentQuestion.correctAnswer = cleanOption;
          }
        }
      }
      // If line is empty, it might separate questions
      else if (trimmedLine === "" && currentQuestion && currentQuestionText) {
        // Finish current question
        currentQuestion.question = currentQuestionText.trim();
        questions.push(currentQuestion);
        currentQuestion = null;
        currentQuestionText = "";
      }
      // If line doesn't match patterns and we have a current question, add to question text
      else if (
        currentQuestion &&
        trimmedLine &&
        !/^[A-D]\./.test(trimmedLine)
      ) {
        currentQuestionText += " " + trimmedLine;
      }
    }

    // Add the last question if it exists
    if (currentQuestion && currentQuestionText) {
      currentQuestion.question = currentQuestionText.trim();
      questions.push(currentQuestion);
    }

    // Filter only valid questions and debug any issues
    const validQuestions = questions.filter((q) => {
      const isValid =
        q.question &&
        q.question.length > 0 &&
        q.options.length >= 2 &&
        q.correctAnswer &&
        q.correctAnswer.length > 0 &&
        q.options.includes(q.correctAnswer);

      if (!isValid) {
        console.log("Invalid question:", q);
        console.log("Has question:", !!q.question);
        console.log("Question length:", q.question.length);
        console.log("Options count:", q.options.length);
        console.log("Has correct answer:", !!q.correctAnswer);
        console.log("Correct answer length:", q.correctAnswer.length);
        console.log(
          "Correct answer in options:",
          q.options.includes(q.correctAnswer)
        );
      }

      return isValid;
    });

    console.log(
      `Parsed ${validQuestions.length} valid questions out of ${questions.length} total`
    );
    console.log("All parsed questions:", questions);
    return validQuestions;
  };

  const handleUpload = async () => {
    if (!questionsText.trim()) {
      toast.error("Please paste some questions");
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const parsedQuestions = parseQuestions(questionsText);

      // Debug: Show what was parsed
      console.log("Raw parsed questions:", parsedQuestions);

      if (parsedQuestions.length === 0) {
        // Show more detailed error message
        const debugText = `No valid questions found. 
First few lines of input: ${questionsText.split("\n").slice(0, 10).join(" | ")}
Total lines: ${questionsText.split("\n").length}`;

        toast.error("No valid questions found. Check console for details.");
        console.error("Parsing debug:", debugText);
        console.error("Full input text:", questionsText);
        setIsUploading(false);
        return;
      }

      console.log("Final parsed questions:", parsedQuestions);

      const questionIds = await addBulkQuizQuestions(parsedQuestions);

      setUploadResult({
        success: questionIds.length,
        failed: parsedQuestions.length - questionIds.length,
      });

      if (questionIds.length > 0) {
        toast.success(`Successfully uploaded ${questionIds.length} questions!`);
      }

      if (parsedQuestions.length - questionIds.length > 0) {
        toast.warning(
          `${
            parsedQuestions.length - questionIds.length
          } questions failed to upload`
        );
      }

      setQuestionsText("");
    } catch (error: unknown) {
      console.error("Upload error:", error);

      // Handle specific Firebase errors
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
      ) {
        const code = (error as { code: string }).code;
        if (code === "permission-denied") {
          toast.error(
            "Permission denied: You don't have access to upload questions"
          );
        } else if (code === "unauthenticated") {
          toast.error("Authentication required: Please log in again");
        } else {
          toast.error(
            `Upload failed: ${
              (error as { message?: string }).message || "Unknown error"
            }`
          );
        }
      } else {
        toast.error(
          `Upload failed: ${
            (error as { message?: string }).message || "Unknown error"
          }`
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!showUpload) {
    return (
      <div className={styles.container}>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <div className={styles.passwordSection}>
          <h2>Question Upload - Admin Access</h2>
          <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className={styles.passwordInput}
              required
            />
            <button type="submit" className={styles.submitButton}>
              Access Upload
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className={styles.uploadSection}>
        <h2>Upload Questions</h2>
        <div className={styles.instructions}>
          <h3>Format Instructions:</h3>
          <p>Paste questions in this format (with or without numbers):</p>
          <div className={styles.example}>
            <pre>{`What is a priority nursing intervention for clients with pulmonary embolism? 
A. Encourage ambulation 
B. Administer oxygen and anticoagulants as prescribed (correct answer) 
C. Promote fluid overload 
D. Ignore respiratory status

OR

1. A patient presents with high fever and neck stiffness. What is the most likely diagnosis?
A. Malaria
B. Meningitis (correct answer)
C. Typhoid
D. Pneumonia`}</pre>
          </div>
          <p>
            <strong>Note:</strong> The correct answer should be marked with
            "(correct answer)" after the option text.
          </p>
        </div>

        <textarea
          value={questionsText}
          onChange={(e) => setQuestionsText(e.target.value)}
          placeholder="Paste your questions here..."
          className={styles.textarea}
          rows={20}
        />

        <div className={styles.actions}>
          <button
            onClick={handleUpload}
            disabled={isUploading || !questionsText.trim()}
            className={styles.uploadButton}
          >
            {isUploading ? "Uploading..." : "Upload Questions"}
          </button>

          <button
            onClick={() => {
              setShowUpload(false);
              setPassword("");
              toast.info("Returned to login");
            }}
            className={styles.backButton}
          >
            Back to Login
          </button>
        </div>

        {uploadResult && (
          <div className={styles.result}>
            <p>Upload Complete:</p>
            <p>✅ Success: {uploadResult.success}</p>
            <p>❌ Failed: {uploadResult.failed}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionUpload;
