// src/components/QuizApp.tsx
import React, { useState, useEffect } from "react";
import {
  getRandomQuizQuestions,
  createQuizSession,
  updateQuizSession,
  getUserData,
  updateUserStats,
  getQuestionCount,
} from "../firebase/firestoreService";
import type { QuizQuestion } from "../firebase/firestoreService";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import styles from "../styles/QuizApp.module.css";

const QuizApp: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes in seconds
  const [isPaidUser, setIsPaidUser] = useState<boolean | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(
    new Set()
  );
  const [totalQuestionCount, setTotalQuestionCount] = useState<number>(0);

  const navigate = useNavigate();
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    checkUserStatus();
    loadQuestionCount();
    // Load previously used question IDs from localStorage
    const savedUsedQuestions = localStorage.getItem("usedQuestionIds");
    if (savedUsedQuestions) {
      try {
        const parsedIds = JSON.parse(savedUsedQuestions);
        setUsedQuestionIds(new Set(parsedIds));
      } catch (error) {
        console.error("Error loading used questions:", error);
      }
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleSubmitQuiz();
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, timeRemaining]);

  const loadQuestionCount = async () => {
    try {
      const count = await getQuestionCount();
      setTotalQuestionCount(count);
    } catch (error) {
      console.error("Error loading question count:", error);
    }
  };

  const checkUserStatus = async () => {
    if (!auth.currentUser) {
      navigate("/account");
      return;
    }

    try {
      const userData = await getUserData(auth.currentUser.uid);
      if (userData?.isActive) {
        setIsPaidUser(true);
      } else {
        setIsPaidUser(false);
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      setIsPaidUser(false);
    }
  };

  const getRandomQuestions = async (count: number = 50) => {
    try {
      // Adaptive pool size based on total questions available
      const poolSize = Math.min(200, Math.max(100, totalQuestionCount || 100));
      const allQuestions = await getRandomQuizQuestions(poolSize);

      // Filter out previously used questions
      const availableQuestions = allQuestions.filter(
        (q) => q.id && !usedQuestionIds.has(q.id)
      );

      console.log(
        `Available new questions: ${availableQuestions.length}, Total pool: ${allQuestions.length}`
      );

      // Smart selection strategy with multiple tiers
      let selectedQuestions: QuizQuestion[];
      const newQuestionRatio = availableQuestions.length / count;

      if (newQuestionRatio >= 1) {
        // Plenty of new questions available - use only new ones
        selectedQuestions = availableQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, count);
      } else if (newQuestionRatio >= 0.8) {
        // Good amount of new questions - use mostly new ones
        selectedQuestions = availableQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, count);
      } else if (newQuestionRatio >= 0.5) {
        // Moderate new questions - mix with minimal repeated
        const repeatedNeeded = count - availableQuestions.length;
        const repeatedQuestions = allQuestions
          .filter((q) => q.id && usedQuestionIds.has(q.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, repeatedNeeded);

        selectedQuestions = [...availableQuestions, ...repeatedQuestions]
          .sort(() => Math.random() - 0.5)
          .slice(0, count);
      } else if (newQuestionRatio >= 0.2) {
        // Limited new questions - balanced mix
        const repeatedNeeded = count - availableQuestions.length;
        const repeatedQuestions = allQuestions
          .filter((q) => q.id && usedQuestionIds.has(q.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, repeatedNeeded);

        selectedQuestions = [...availableQuestions, ...repeatedQuestions]
          .sort(() => Math.random() - 0.5)
          .slice(0, count);
      } else {
        // Few new questions - use what's available plus repeated
        const repeatedNeeded = count - availableQuestions.length;
        const repeatedQuestions = allQuestions
          .filter((q) => q.id && usedQuestionIds.has(q.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, repeatedNeeded);

        selectedQuestions = [...availableQuestions, ...repeatedQuestions]
          .sort(() => Math.random() - 0.5)
          .slice(0, count);
      }

      // Update used questions with smart size management
      const newUsedQuestionIds = new Set(usedQuestionIds);
      selectedQuestions.forEach((q) => {
        if (q.id) {
          newUsedQuestionIds.add(q.id);
        }
      });

      // Smart size management - keep most recent questions
      if (newUsedQuestionIds.size > 600) {
        const arrayFromSet = Array.from(newUsedQuestionIds);
        const trimmedArray = arrayFromSet.slice(-500); // Keep most recent 500
        setUsedQuestionIds(new Set(trimmedArray));
        localStorage.setItem("usedQuestionIds", JSON.stringify(trimmedArray));
      } else {
        setUsedQuestionIds(newUsedQuestionIds);
        localStorage.setItem(
          "usedQuestionIds",
          JSON.stringify([...newUsedQuestionIds])
        );
      }

      console.log(
        `Selected ${selectedQuestions.length} questions (${
          availableQuestions.length
        } new, ${
          selectedQuestions.length - availableQuestions.length
        } repeated)`
      );
      return selectedQuestions;
    } catch (error) {
      console.error("Error in getRandomQuestions:", error);
      // Fallback to basic random selection
      return await getRandomQuizQuestions(count);
    }
  };

  const startQuiz = async () => {
    if (!isPaidUser) {
      alert("Please activate your account to access quizzes.");
      return;
    }

    setLoading(true);
    try {
      const randomQuestions = await getRandomQuestions(50);
      setQuestions(randomQuestions);

      if (auth.currentUser) {
        const sessionId = await createQuizSession({
          userId: auth.currentUser.uid,
          questions: randomQuestions.map((q) => q.id!).filter(Boolean),
          answers: {},
          score: 0,
          totalQuestions: randomQuestions.length,
          completed: false,
          duration: 0,
        });
        setQuizSessionId(sessionId);
      }

      setQuizStarted(true);
    } catch (error: unknown) {
      console.error("Error starting quiz:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "permission-denied"
      ) {
        alert(
          "Quiz access requires an active subscription. Please activate your account."
        );
      } else {
        alert("Error starting quiz. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (!currentQuestion?.id) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id!]: answer,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const generatePersonalizedSuggestions = (
    score: number,
    correctAnswers: number,
    totalQuestions: number
  ) => {
    const suggestions = [];

    if (score >= 90) {
      suggestions.push(
        "🎉 Outstanding performance! You demonstrate excellent understanding of nursing concepts.",
        "Consider challenging yourself with advanced scenarios to further enhance your clinical judgment.",
        "Share your study techniques with peers to help others improve."
      );
    } else if (score >= 80) {
      suggestions.push(
        "👍 Strong performance! You have a solid grasp of core nursing concepts.",
        "Focus on refining your test-taking strategies to reach the 90+ score range.",
        "Review the questions you missed to identify any recurring patterns."
      );
    } else if (score >= 70) {
      suggestions.push(
        "📚 Good foundation! You're on the right track with your nursing knowledge.",
        "Dedicate more time to practicing scenario-based questions.",
        "Create flashcards for concepts you find challenging."
      );
    } else if (score >= 60) {
      suggestions.push(
        "💪 Building momentum! Focus on strengthening your fundamental knowledge.",
        "Set aside regular study sessions for core nursing topics.",
        "Practice with timed quizzes to improve your pace and accuracy."
      );
    } else {
      suggestions.push(
        "🔄 Time for focused review! Start with fundamental nursing concepts.",
        "Break down complex topics into smaller, manageable study sessions.",
        "Consider joining study groups for collaborative learning."
      );
    }

    if (timeRemaining < 600) {
      suggestions.push(
        "⏰ Practice with timed quizzes to improve your pacing.",
        "Learn to quickly identify question patterns to save time."
      );
    }

    const accuracy = (correctAnswers / totalQuestions) * 100;
    if (accuracy < 70) {
      suggestions.push(
        "🎯 Focus on reading questions carefully to avoid misinterpretation.",
        "Practice eliminating obviously wrong answers first.",
        "Review basic nursing principles and protocols."
      );
    }

    suggestions.push(
      "📖 Regular review of nursing fundamentals is key to consistent improvement.",
      "🧪 Practice with diverse question types to build comprehensive knowledge.",
      "📊 Track your progress weekly to identify improvement areas."
    );

    return suggestions.slice(0, 5);
  };

  const handleSubmitQuiz = async () => {
    if (!auth.currentUser) return;

    setSubmitting(true);
    try {
      let correctAnswers = 0;
      questions.forEach((question) => {
        if (selectedAnswers[question.id!] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      setScore(finalScore);

      // Update quiz session
      if (quizSessionId) {
        try {
          await updateQuizSession(quizSessionId, {
            answers: selectedAnswers,
            score: finalScore,
            completed: true,
            completedAt: (await import("firebase/firestore")).Timestamp.now(),
            duration: 3600 - timeRemaining,
          });
        } catch {
          console.log(
            "Session update failed, but continuing with local results"
          );
        }
      }

      // Update user stats in Firestore
      try {
        await updateUserStats(
          auth.currentUser.uid,
          finalScore,
          correctAnswers,
          questions.length,
          Math.round((3600 - timeRemaining) / 60)
        );
        console.log("User stats updated successfully");
      } catch (error) {
        console.error("Failed to update user stats:", error);
      }

      setQuizCompleted(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Error calculating results. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const restartQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizStarted(false);
    setQuizCompleted(false);
    setScore(0);
    setQuizSessionId(null);
    setTimeRemaining(3600);
    setShowReview(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isQuestionIncorrect = (questionId: string) => {
    return (
      selectedAnswers[questionId] !==
      questions.find((q) => q.id === questionId)?.correctAnswer
    );
  };

  // Show loading while checking user status
  if (isPaidUser === null) {
    return (
      <div className={styles.container}>
        <div className={styles.centerContent}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <h2>Checking your account status...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Show upgrade message for non-paid users
  if (!isPaidUser && !quizStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.centerContent}>
          <div className={styles.upgradeCard}>
            <div className={styles.upgradeHeader}>
              <div className={styles.lockIcon}>🔒</div>
              <h1>Premium Feature</h1>
            </div>
            <div className={styles.upgradeContent}>
              <h2>Quiz Access Requires Activation</h2>
              <p>
                To unlock unlimited quiz access and track your progress, please
                activate your account.
              </p>

              <div className={styles.benefitsGrid}>
                <div className={styles.benefitItem}>
                  <span className={styles.benefitIcon}>✓</span>
                  <span>Unlimited practice quizzes</span>
                </div>
                <div className={styles.benefitItem}>
                  <span className={styles.benefitIcon}>✓</span>
                  <span>Detailed performance analytics</span>
                </div>
                <div className={styles.benefitItem}>
                  <span className={styles.benefitIcon}>✓</span>
                  <span>Personalized study recommendations</span>
                </div>
                <div className={styles.benefitItem}>
                  <span className={styles.benefitIcon}>✓</span>
                  <span>Progress tracking over time</span>
                </div>
                <div className={styles.benefitItem}>
                  <span className={styles.benefitIcon}>✓</span>
                  <span>Access to all questions</span>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button
                  onClick={() => navigate("/dashboard")}
                  className={styles.primaryBtn}
                >
                  Activate Account - ₦4,000
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className={styles.secondaryBtn}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !quizStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.centerContent}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <h2>Loading questions...</h2>
            <p>Selecting the best questions for your practice session</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className={styles.container}>
        <div className={styles.centerContent}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <h2>Calculating Results...</h2>
            <p>Please wait while we calculate your score</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.centerContent}>
          <div className={styles.startCard}>
            <div className={styles.startHeader}>
              <h1>Nursing Quiz</h1>
              <p>Test your knowledge and improve your skills</p>
            </div>

            <div className={styles.quizFeatures}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📝</span>
                <span>50 carefully selected questions</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>⏱️</span>
                <span>60 minutes time limit</span>
              </div>
              {/* <div className={styles.feature}>
                <span className={styles.featureIcon}>🔀</span>
                <span>Smart randomization - minimizes repetition</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🔄</span>
                <span>Dynamic question pool - always fresh content</span>
              </div> */}
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📊</span>
                <span>Instant results and analysis</span>
              </div>
            </div>

            <button onClick={startQuiz} className={styles.startBtn}>
              Start Quiz
            </button>

            {/* <div className={styles.quizInfo}>
              <p>
                <strong>Smart Quiz System:</strong> Our algorithm ensures you
                get mostly new questions each time, drawing from our constantly
                updated question database.
                {totalQuestionCount > 0 &&
                  ` Currently ${totalQuestionCount}+ questions available.`}
              </p>
            </div> */}
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted && showReview) {
    const correctAnswers = questions.filter(
      (q) => selectedAnswers[q.id!] === q.correctAnswer
    ).length;

    return (
      <div className={styles.container}>
        <div className={styles.centerContent}>
          <div className={styles.quizCard}>
            <div className={styles.quizHeader}>
              <div className={styles.progressSection}>
                <div className={styles.progressText}>
                  Review Mode - Question {currentQuestionIndex + 1} of{" "}
                  {questions.length}
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) / questions.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className={styles.quizStats}>
                <div className={styles.stat}>
                  <span className={styles.statIcon}>📊</span>
                  <span className={styles.statValue}>Score: {score}%</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statIcon}>✅</span>
                  <span className={styles.statValue}>
                    {correctAnswers}/{questions.length}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.questionSection}>
              <h3 className={styles.questionText}>
                {currentQuestion?.question}
              </h3>

              <div className={styles.optionsGrid}>
                {currentQuestion?.options.map((option, index) => {
                  const isCorrectAnswer =
                    option === currentQuestion.correctAnswer;
                  const isUserAnswer =
                    selectedAnswers[currentQuestion.id!] === option;
                  const isIncorrect = isUserAnswer && !isCorrectAnswer;

                  let optionStyle = styles.optionBtn;
                  if (isCorrectAnswer) {
                    optionStyle = `${styles.optionBtn} ${styles.correctAnswer}`;
                  } else if (isIncorrect) {
                    optionStyle = `${styles.optionBtn} ${styles.incorrectAnswer}`;
                  } else if (isUserAnswer) {
                    optionStyle = `${styles.optionBtn} ${styles.userAnswer}`;
                  }

                  return (
                    <button key={index} className={optionStyle} disabled>
                      <span className={styles.optionLetter}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className={styles.optionText}>{option}</span>
                      {isCorrectAnswer && (
                        <span className={styles.correctBadge}>✓ Correct</span>
                      )}
                      {isIncorrect && (
                        <span className={styles.incorrectBadge}>
                          ✗ Your Answer
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {currentQuestion?.explanation && (
                <div className={styles.explanationSection}>
                  <h4>Explanation:</h4>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}
            </div>

            <div className={styles.navigationSection}>
              <button
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className={styles.navBtn}
              >
                Previous
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={() => setShowReview(false)}
                  className={styles.submitBtn}
                >
                  Back to Results
                </button>
              ) : (
                <button onClick={nextQuestion} className={styles.navBtn}>
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const correctAnswers = questions.filter(
      (q) => selectedAnswers[q.id!] === q.correctAnswer
    ).length;

    const suggestions = generatePersonalizedSuggestions(
      score,
      correctAnswers,
      questions.length
    );

    const incorrectQuestions = questions.filter((q) =>
      isQuestionIncorrect(q.id!)
    );

    return (
      <div className={styles.container}>
        <div className={styles.centerContent}>
          <div className={styles.resultsCard}>
            <div className={styles.resultsHeader}>
              <h1>Quiz Completed!</h1>
              <p>Great job completing the quiz</p>
            </div>

            <div className={styles.scoreSection}>
              <div className={styles.scoreCircle}>
                <div className={styles.scoreValue}>{score}%</div>
                <div className={styles.scoreLabel}>Score</div>
              </div>
              <div className={styles.scoreDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Correct Answers:</span>
                  <span className={styles.detailValue}>
                    {correctAnswers}/{questions.length}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Time Taken:</span>
                  <span className={styles.detailValue}>
                    {formatTime(3600 - timeRemaining)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Accuracy:</span>
                  <span className={styles.detailValue}>
                    {Math.round((correctAnswers / questions.length) * 100)}%
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>
                    Questions to Review:
                  </span>
                  <span className={styles.detailValue}>
                    {incorrectQuestions.length}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.analysisSection}>
              <div className={styles.suggestionsBox}>
                <h4>Personalized Suggestions</h4>
                <div className={styles.suggestionsList}>
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className={styles.suggestionItem}>
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>

              {incorrectQuestions.length > 0 && (
                <div className={styles.reviewSection}>
                  <h4>Review Incorrect Answers</h4>
                  <p>
                    You missed {incorrectQuestions.length} question(s). Review
                    them to improve your understanding.
                  </p>
                  <button
                    onClick={() => {
                      setShowReview(true);
                      const firstIncorrectIndex = questions.findIndex((q) =>
                        isQuestionIncorrect(q.id!)
                      );
                      setCurrentQuestionIndex(firstIncorrectIndex);
                    }}
                    className={styles.reviewBtn}
                  >
                    Review Incorrect Answers
                  </button>
                </div>
              )}
            </div>

            <div className={styles.resultActions}>
              <button onClick={restartQuiz} className={styles.restartBtn}>
                Take Another Quiz
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className={styles.dashboardBtn}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.centerContent}>
        <div className={styles.quizCard}>
          <div className={styles.quizHeader}>
            <div className={styles.progressSection}>
              <div className={styles.progressText}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className={styles.quizStats}>
              <div className={styles.stat}>
                <span className={styles.statIcon}>⏱️</span>
                <span className={styles.statValue}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statIcon}>📝</span>
                <span className={styles.statValue}>
                  {Object.keys(selectedAnswers).length}/{questions.length}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.questionSection}>
            <h3 className={styles.questionText}>{currentQuestion?.question}</h3>

            <div className={styles.optionsGrid}>
              {currentQuestion?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`${styles.optionBtn} ${
                    selectedAnswers[currentQuestion.id!] === option
                      ? styles.optionSelected
                      : ""
                  }`}
                >
                  <span className={styles.optionLetter}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className={styles.optionText}>{option}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navigationSection}>
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className={styles.navBtn}
            >
              Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                className={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            ) : (
              <button onClick={nextQuestion} className={styles.navBtn}>
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizApp;
