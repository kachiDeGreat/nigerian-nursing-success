// src/components/QuestionManager.tsx
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/QuestionManager.module.css";
import { useNavigate } from "react-router-dom";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
  createdAt: Timestamp | null;
  createdBy: string;
}

const QuestionManager: React.FC = () => {
  const [password, setPassword] = useState("");
  const [showManager, setShowManager] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuizQuestion[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(
    null
  );
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  const ADMIN_PASSWORD = "123456789012345";

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setShowManager(true);
      toast.success("Admin access granted");
      fetchQuestions();
    } else {
      toast.error("Incorrect password");
    }
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const questionsRef = collection(db, "quizQuestions");
      const q = query(questionsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const questionsList: QuizQuestion[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        questionsList.push({
          id: doc.id,
          question: data.question,
          options: data.options,
          correctAnswer: data.correctAnswer,
          category: data.category,
          difficulty: data.difficulty,
          explanation: data.explanation,
          createdAt: data.createdAt || null,
          createdBy: data.createdBy,
        });
      });

      setQuestions(questionsList);
      setFilteredQuestions(questionsList);
      toast.success(`Loaded ${questionsList.length} questions`);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuestion = async (
    questionId: string,
    updates: Partial<QuizQuestion>
  ) => {
    try {
      const questionRef = doc(db, "quizQuestions", questionId);
      await updateDoc(questionRef, updates);
      toast.success("Question updated successfully");
      fetchQuestions(); // Refresh the list
      setShowEditModal(false);
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "quizQuestions", questionId));
      toast.success("Question deleted successfully");
      fetchQuestions(); // Refresh the list
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  // Filter questions based on search and filters
  useEffect(() => {
    let filtered = questions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.options.some((opt) =>
            opt.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((q) => q.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, selectedCategory, selectedDifficulty]);

  const categories = Array.from(
    new Set(questions.map((q) => q.category))
  ).sort();

  const startEdit = (question: QuizQuestion) => {
    setEditingQuestion({ ...question });
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    if (editingQuestion) {
      updateQuestion(editingQuestion.id, {
        question: editingQuestion.question,
        options: editingQuestion.options,
        correctAnswer: editingQuestion.correctAnswer,
        category: editingQuestion.category,
        difficulty: editingQuestion.difficulty,
        explanation: editingQuestion.explanation,
      });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    if (editingQuestion) {
      const newOptions = [...editingQuestion.options];
      newOptions[index] = value;
      setEditingQuestion({ ...editingQuestion, options: newOptions });
    }
  };

  const addOption = () => {
    if (editingQuestion && editingQuestion.options.length < 6) {
      setEditingQuestion({
        ...editingQuestion,
        options: [...editingQuestion.options, ""],
      });
    }
  };

  const removeOption = (index: number) => {
    if (editingQuestion && editingQuestion.options.length > 2) {
      const newOptions = editingQuestion.options.filter((_, i) => i !== index);
      setEditingQuestion({
        ...editingQuestion,
        options: newOptions,
        // If we removed the correct answer, reset it to the first option
        correctAnswer:
          editingQuestion.correctAnswer === editingQuestion.options[index]
            ? newOptions[0]
            : editingQuestion.correctAnswer,
      });
    }
  };

  const formatDate = (timestamp: Timestamp | null): string => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  if (!showManager) {
    return (
      <div className={styles.authContainer}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/dashboard")}
          aria-label="Back to dashboard"
        >
          ← Back to Dashboard
        </button>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.logo}>📋</div>
            <h1>Question Manager</h1>
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
              <span>Access Manager</span>
              <span className={styles.buttonIcon}>→</span>
            </button>
          </form>
        </div>
        <ToastContainer position="top-right" theme="colored" />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <ToastContainer position="top-right" theme="colored" />

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1>Question Manager</h1>
            <p>View, edit, and manage all quiz questions</p>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={fetchQuestions}
              disabled={isLoading}
              className={styles.refreshButton}
            >
              {isLoading ? "🔄" : "🔄"} Refresh
            </button>
            <button
              onClick={() => {
                setShowManager(false);
                setPassword("");
                toast.info("Logged out from admin portal");
              }}
              className={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📚</div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{questions.length}</span>
              <span className={styles.statLabel}>Total Questions</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📁</div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>{categories.length}</span>
              <span className={styles.statLabel}>Categories</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👁️</div>
            <div className={styles.statInfo}>
              <span className={styles.statNumber}>
                {filteredQuestions.length}
              </span>
              <span className={styles.statLabel}>Filtered</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersCard}>
          <div className={styles.filterGroup}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions, categories, or options..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                }}
                className={styles.clearFiltersButton}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <div className={styles.tableCard}>
          {isLoading ? (
            <div className={styles.loading}>Loading questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <h3>No Questions Found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.questionsTable}>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Options</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((question) => (
                    <tr key={question.id} className={styles.questionRow}>
                      <td className={styles.questionCell}>
                        <div className={styles.questionText}>
                          {question.question}
                        </div>
                        <div className={styles.correctAnswer}>
                          Correct: {question.correctAnswer}
                        </div>
                      </td>
                      <td>
                        <span className={styles.categoryBadge}>
                          {question.category}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.difficultyBadge} ${
                            styles[question.difficulty]
                          }`}
                        >
                          {question.difficulty}
                        </span>
                      </td>
                      <td className={styles.optionsCell}>
                        <div className={styles.optionsList}>
                          {question.options.map((option, idx) => (
                            <div
                              key={idx}
                              className={`${styles.optionItem} ${
                                option === question.correctAnswer
                                  ? styles.correctOption
                                  : ""
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}. {option}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className={styles.dateCell}>
                        {formatDate(question.createdAt)}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => startEdit(question)}
                            className={styles.editButton}
                            title="Edit question"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteQuestion(question.id)}
                            className={styles.deleteButton}
                            title="Delete question"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && editingQuestion && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Edit Question</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Question</label>
                <textarea
                  value={editingQuestion.question}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      question: e.target.value,
                    })
                  }
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Category</label>
                  <input
                    type="text"
                    value={editingQuestion.category}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        category: e.target.value,
                      })
                    }
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Difficulty</label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        difficulty: e.target.value as
                          | "easy"
                          | "medium"
                          | "hard",
                      })
                    }
                    className={styles.select}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Options</label>
                <div className={styles.optionsContainer}>
                  {editingQuestion.options.map((option, index) => (
                    <div key={index} className={styles.optionInputGroup}>
                      <span className={styles.optionLabel}>
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        className={styles.optionInput}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        disabled={editingQuestion.options.length <= 2}
                        className={styles.removeOptionButton}
                      >
                        −
                      </button>
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={option === editingQuestion.correctAnswer}
                        onChange={() =>
                          setEditingQuestion({
                            ...editingQuestion,
                            correctAnswer: option,
                          })
                        }
                        className={styles.correctRadio}
                      />
                      <label>Correct</label>
                    </div>
                  ))}
                </div>
                {editingQuestion.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className={styles.addOptionButton}
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Explanation (Optional)
                </label>
                <textarea
                  value={editingQuestion.explanation || ""}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      explanation: e.target.value,
                    })
                  }
                  className={styles.textarea}
                  rows={2}
                  placeholder="Add explanation for the correct answer..."
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={() => setShowEditModal(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button onClick={handleEditSave} className={styles.saveButton}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;
