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
  const [activeTab, setActiveTab] = useState<"upload" | "preview">("upload");

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

      if (
        /^\d+\./.test(trimmedLine) ||
        (trimmedLine.length > 10 &&
          /^[A-Za-z]/.test(trimmedLine) &&
          !/^[A-D]\./.test(trimmedLine) &&
          currentQuestion === null)
      ) {
        if (currentQuestion) {
          currentQuestion.question = currentQuestionText.trim();
          questions.push(currentQuestion);
        }

        currentQuestionText = trimmedLine.replace(/^\d+\.\s*/, "");
        currentQuestion = {
          question: "",
          options: [],
          correctAnswer: "",
          category: "General Nursing",
          difficulty: "medium" as const,
          createdBy: "admin",
        };
      } else if (/^[A-D]\./.test(trimmedLine)) {
        if (currentQuestion) {
          const optionText = trimmedLine.replace(/^[A-D]\.\s*/, "");
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
      } else if (trimmedLine === "" && currentQuestion && currentQuestionText) {
        currentQuestion.question = currentQuestionText.trim();
        questions.push(currentQuestion);
        currentQuestion = null;
        currentQuestionText = "";
      } else if (
        currentQuestion &&
        trimmedLine &&
        !/^[A-D]\./.test(trimmedLine)
      ) {
        currentQuestionText += " " + trimmedLine;
      }
    }

    if (currentQuestion && currentQuestionText) {
      currentQuestion.question = currentQuestionText.trim();
      questions.push(currentQuestion);
    }

    return questions.filter(
      (q) =>
        q.question &&
        q.question.length > 0 &&
        q.options.length >= 2 &&
        q.correctAnswer &&
        q.correctAnswer.length > 0 &&
        q.options.includes(q.correctAnswer)
    );
  };

  const parsedQuestions = questionsText ? parseQuestions(questionsText) : [];

  const handleUpload = async () => {
    if (!questionsText.trim()) {
      toast.error("Please paste some questions");
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      if (parsedQuestions.length === 0) {
        toast.error("No valid questions found. Please check the format.");
        return;
      }

      const questionIds = await addBulkQuizQuestions(parsedQuestions);

      setUploadResult({
        success: questionIds.length,
        failed: parsedQuestions.length - questionIds.length,
      });

      if (questionIds.length > 0) {
        toast.success(`Successfully uploaded ${questionIds.length} questions!`);
        setQuestionsText("");
      }

      if (parsedQuestions.length - questionIds.length > 0) {
        toast.warning(
          `${
            parsedQuestions.length - questionIds.length
          } questions failed to upload`
        );
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    setQuestionsText("");
    setUploadResult(null);
    toast.info("Text area cleared");
  };

  if (!showUpload) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.logo}>
              <span>📚</span>
            </div>
            <h1>Question Upload</h1>
            <p className={styles.subtitle}>Admin Portal</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className={styles.authForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Admin Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your admin password"
                className={styles.input}
                required
              />
            </div>

            <button type="submit" className={styles.authButton}>
              <span>Access Portal</span>
              <span className={styles.buttonIcon}>→</span>
            </button>
          </form>

          <div className={styles.authFooter}>
            <p>Secure admin access only</p>
          </div>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1>Question Management</h1>
            <p>Upload and manage quiz questions</p>
          </div>
          <button
            onClick={() => {
              setShowUpload(false);
              setPassword("");
              toast.info("Logged out from admin portal");
            }}
            className={styles.logoutButton}
          >
            <span>Logout</span>
            <span className={styles.logoutIcon}>↩</span>
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📝</div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>
                {parsedQuestions.length}
              </span>
              <span className={styles.statLabel}>Questions Ready</span>
            </div>
          </div>

          {uploadResult && (
            <>
              <div className={`${styles.statCard} ${styles.success}`}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statInfo}>
                  <span className={styles.statNumber}>
                    {uploadResult.success}
                  </span>
                  <span className={styles.statLabel}>Uploaded</span>
                </div>
              </div>

              {uploadResult.failed > 0 && (
                <div className={`${styles.statCard} ${styles.error}`}>
                  <div className={styles.statIcon}>❌</div>
                  <div className={styles.statInfo}>
                    <span className={styles.statNumber}>
                      {uploadResult.failed}
                    </span>
                    <span className={styles.statLabel}>Failed</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.contentCard}>
          <div className={styles.tabNavigation}>
            <button
              className={`${styles.tab} ${
                activeTab === "upload" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("upload")}
            >
              <span className={styles.tabIcon}>📤</span>
              Upload Questions
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "preview" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("preview")}
            >
              <span className={styles.tabIcon}>👁️</span>
              Preview ({parsedQuestions.length})
            </button>
          </div>

          {activeTab === "upload" && (
            <div className={styles.uploadSection}>
              <div className={styles.uploadArea}>
                <div className={styles.uploadHeader}>
                  <h3>Paste Your Questions</h3>
                  <div className={styles.uploadActions}>
                    <button
                      onClick={clearAll}
                      disabled={!questionsText}
                      className={styles.clearButton}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <textarea
                  value={questionsText}
                  onChange={(e) => setQuestionsText(e.target.value)}
                  placeholder={`Paste your questions here...

Example:
What is a priority nursing intervention for clients with pulmonary embolism? 
A. Encourage ambulation 
B. Administer oxygen and anticoagulants as prescribed (correct answer) 
C. Promote fluid overload 
D. Ignore respiratory status`}
                  className={styles.textarea}
                  rows={15}
                />

                <div className={styles.textareaFooter}>
                  <span className={styles.charCount}>
                    {questionsText.length} characters
                  </span>
                  <span className={styles.questionCount}>
                    {parsedQuestions.length} questions detected
                  </span>
                </div>
              </div>

              <div className={styles.actionBar}>
                <button
                  onClick={handleUpload}
                  disabled={
                    isUploading ||
                    !questionsText.trim() ||
                    parsedQuestions.length === 0
                  }
                  className={styles.uploadButton}
                >
                  {isUploading ? (
                    <>
                      <span className={styles.spinner}></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span className={styles.uploadIcon}>🚀</span>
                      Upload {parsedQuestions.length} Questions
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className={styles.previewSection}>
              {parsedQuestions.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📝</div>
                  <h3>No Questions to Preview</h3>
                  <p>Paste some questions in the upload tab to see them here</p>
                </div>
              ) : (
                <div className={styles.previewList}>
                  {parsedQuestions.map((question, index) => (
                    <div key={index} className={styles.questionCard}>
                      <div className={styles.questionHeader}>
                        <span className={styles.questionNumber}>
                          Q{index + 1}
                        </span>
                        <span className={styles.questionCategory}>
                          {question.category}
                        </span>
                      </div>
                      <p className={styles.questionText}>{question.question}</p>
                      <div className={styles.optionsGrid}>
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`${styles.option} ${
                              option === question.correctAnswer
                                ? styles.correct
                                : ""
                            }`}
                          >
                            <span className={styles.optionLabel}>
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span className={styles.optionText}>{option}</span>
                            {option === question.correctAnswer && (
                              <span className={styles.correctBadge}>
                                Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuestionUpload;
