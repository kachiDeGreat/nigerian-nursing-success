// src/firebase/firestoreService.ts
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  // increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { User } from "firebase/auth";

export interface TestScore {
  date: Timestamp;
  score: number;
  testId: string;
  testName: string;
  totalQuestions: number;
  correctAnswers: number;
  duration: number; // in minutes
}

export interface StudySession {
  date: Timestamp;
  duration: number; // in minutes
  topic: string;
  materialsStudied: string[];
}

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  isActive: boolean;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: Timestamp;
  lastLogin: Timestamp;
  loginCount: number;
  paystackReference?: string;

  // New properties for analytics and charts
  testsTaken: number;
  totalStudyTime: number; // in minutes
  averageScore: number;
  testScores: TestScore[];
  studySessions: StudySession[];
  lastTestDate?: Timestamp;
  bestScore?: number;
  weakAreas: string[];
  strongAreas: string[];
}

export interface PaymentData {
  id?: string;
  userId: string;
  email: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed";
  paystackReference: string;
  createdAt: Timestamp;
  paidAt?: Timestamp;
}

// Quiz-related interfaces
export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
  createdAt: Timestamp;
  createdBy: string;
}

export interface QuizSession {
  id?: string;
  userId: string;
  questions: string[]; // Question IDs
  answers: { [questionId: string]: string }; // questionId -> selectedAnswer
  score: number;
  totalQuestions: number;
  completed: boolean;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  duration: number; // in seconds
}

export interface UserPerformance {
  userId: string;
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  weakCategories: string[];
  strongCategories: string[];
  lastQuizDate?: Timestamp;
}

// Initialize user data in Firestore
export const initializeUserData = async (user: User): Promise<void> => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData: UserData = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || "",
      emailVerified: user.emailVerified,
      isActive: false,
      paymentStatus: "pending",
      createdAt: serverTimestamp() as Timestamp,
      lastLogin: serverTimestamp() as Timestamp,
      loginCount: 1,

      // Initialize new properties
      testsTaken: 0,
      totalStudyTime: 0,
      averageScore: 0,
      testScores: [],
      studySessions: [],
      weakAreas: [],
      strongAreas: [],
    };

    await setDoc(userRef, userData);
  } else {
    const existingData = userSnap.data();
    // Update last login and increment login count
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      loginCount: (existingData.loginCount || 0) + 1,
      emailVerified: user.emailVerified,
    });
  }
};

// Get user data from Firestore
export const getUserData = async (userId: string): Promise<UserData | null> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserData;
  }
  return null;
};

// Update user stats after quiz completion
export const updateUserStats = async (
  userId: string,
  score: number,
  correctAnswers: number,
  totalQuestions: number,
  duration: number // in minutes
): Promise<void> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found");
  }

  const userData = userSnap.data() as UserData;

  // Calculate new stats
  const totalTests = userData.testsTaken + 1;
  const totalStudyTime = userData.totalStudyTime + duration;

  // Calculate new average score
  const totalScore = userData.averageScore * userData.testsTaken + score;
  const newAverageScore = Math.round(totalScore / totalTests);

  // Update best score if applicable
  const currentBestScore = userData.bestScore || 0;
  const newBestScore = Math.max(currentBestScore, score);

  // Create new test score record
  const newTestScore: TestScore = {
    date: Timestamp.now(),
    score: score,
    testId: `quiz-${Date.now()}`,
    testName: "Practice Quiz",
    totalQuestions: totalQuestions,
    correctAnswers: correctAnswers,
    duration: duration,
  };

  const updatedTestScores = [...userData.testScores, newTestScore];

  await updateDoc(userRef, {
    testsTaken: totalTests,
    totalStudyTime: totalStudyTime,
    averageScore: newAverageScore,
    bestScore: newBestScore,
    lastTestDate: Timestamp.now(),
    testScores: updatedTestScores,
  });

  console.log("User stats updated successfully:", {
    testsTaken: totalTests,
    totalStudyTime: totalStudyTime,
    averageScore: newAverageScore,
    bestScore: newBestScore,
  });
};

// Update payment status
export const updatePaymentStatus = async (
  userId: string,
  status: "pending" | "paid" | "failed",
  paystackReference?: string
): Promise<void> => {
  const userRef = doc(db, "users", userId);

  const updateData: {
    paymentStatus: "pending" | "paid" | "failed";
    isActive: boolean;
    paystackReference?: string;
  } = {
    paymentStatus: status,
    isActive: status === "paid",
  };

  if (paystackReference) {
    updateData.paystackReference = paystackReference;
  }

  await updateDoc(userRef, updateData);
};

// Create payment record
export const createPaymentRecord = async (
  paymentData: Omit<PaymentData, "id" | "createdAt">
): Promise<string> => {
  const paymentsRef = collection(db, "payments");
  const docRef = await addDoc(paymentsRef, {
    ...paymentData,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Verify payment by reference
export const verifyPaymentByReference = async (
  reference: string
): Promise<PaymentData | null> => {
  const paymentsRef = collection(db, "payments");
  const q = query(
    paymentsRef,
    where("paystackReference", "==", reference),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const paymentDoc = querySnapshot.docs[0];
    const data = paymentDoc.data();

    return {
      id: paymentDoc.id,
      userId: data.userId,
      email: data.email,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      paystackReference: data.paystackReference,
      createdAt: data.createdAt,
      paidAt: data.paidAt,
    } as PaymentData;
  }

  return null;
};

// Add a new test score
export const addTestScore = async (
  userId: string,
  testScore: Omit<TestScore, "date">
): Promise<void> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found");
  }

  const userData = userSnap.data() as UserData;
  const newTestScore: TestScore = {
    ...testScore,
    date: serverTimestamp() as Timestamp,
  };

  const updatedTestScores = [...userData.testScores, newTestScore];
  const totalTests = userData.testsTaken + 1;

  // Calculate new average score
  const totalScore = updatedTestScores.reduce(
    (sum, score) => sum + score.score,
    0
  );
  const newAverageScore = Math.round(totalScore / updatedTestScores.length);

  // Update best score if applicable
  const currentBestScore = userData.bestScore || 0;
  const newBestScore = Math.max(currentBestScore, testScore.score);

  await updateDoc(userRef, {
    testsTaken: totalTests,
    averageScore: newAverageScore,
    bestScore: newBestScore,
    lastTestDate: serverTimestamp(),
    testScores: updatedTestScores,
  });
};

// Add a study session
export const addStudySession = async (
  userId: string,
  studySession: Omit<StudySession, "date">
): Promise<void> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found");
  }

  const userData = userSnap.data() as UserData;
  const newStudySession: StudySession = {
    ...studySession,
    date: serverTimestamp() as Timestamp,
  };

  const updatedStudySessions = [...userData.studySessions, newStudySession];
  const newTotalStudyTime = userData.totalStudyTime + studySession.duration;

  await updateDoc(userRef, {
    totalStudyTime: newTotalStudyTime,
    studySessions: updatedStudySessions,
  });
};

// Update user's weak and strong areas
export const updateUserAreas = async (
  userId: string,
  weakAreas: string[],
  strongAreas: string[]
): Promise<void> => {
  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    weakAreas,
    strongAreas,
  });
};

// Get recent test scores (for charts)
export const getRecentTestScores = async (
  userId: string,
  limitCount: number = 10
): Promise<TestScore[]> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return [];
  }

  const userData = userSnap.data() as UserData;
  return userData.testScores
    .sort((a, b) => b.date.toMillis() - a.date.toMillis())
    .slice(0, limitCount);
};

// Get study sessions by time period (for charts)
export const getStudySessionsByPeriod = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<StudySession[]> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return [];
  }

  const userData = userSnap.data() as UserData;
  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  return userData.studySessions.filter((session) => {
    const sessionDate = session.date;
    return sessionDate >= startTimestamp && sessionDate <= endTimestamp;
  });
};

// Get user statistics for dashboard
export const getUserStatistics = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const userData = userSnap.data() as UserData;

  // Calculate weekly study time
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyStudySessions = userData.studySessions.filter(
    (session) => session.date.toDate() >= oneWeekAgo
  );
  const weeklyStudyTime = weeklyStudySessions.reduce(
    (total, session) => total + session.duration,
    0
  );

  // Calculate monthly progress
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const monthlyTestScores = userData.testScores.filter(
    (score) => score.date.toDate() >= oneMonthAgo
  );

  return {
    totalTests: userData.testsTaken,
    totalStudyTime: userData.totalStudyTime,
    averageScore: userData.averageScore,
    bestScore: userData.bestScore || 0,
    weeklyStudyTime,
    monthlyTests: monthlyTestScores.length,
    weakAreas: userData.weakAreas,
    strongAreas: userData.strongAreas,
    lastTestDate: userData.lastTestDate,
  };
};

// Reset user data (for testing purposes)
export const resetUserData = async (userId: string): Promise<void> => {
  const userRef = doc(db, "users", userId);

  await updateDoc(userRef, {
    testsTaken: 0,
    totalStudyTime: 0,
    averageScore: 0,
    testScores: [],
    studySessions: [],
    bestScore: 0,
    weakAreas: [],
    strongAreas: [],
  });
};

// Quiz Question Functions
export const addQuizQuestion = async (
  question: Omit<QuizQuestion, "id" | "createdAt">
): Promise<string> => {
  const questionsRef = collection(db, "quizQuestions");
  const docRef = await addDoc(questionsRef, {
    ...question,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const addBulkQuizQuestions = async (
  questions: Omit<QuizQuestion, "id" | "createdAt">[]
): Promise<string[]> => {
  const questionsRef = collection(db, "quizQuestions");
  const docIds: string[] = [];

  for (const question of questions) {
    const docRef = await addDoc(questionsRef, {
      ...question,
      createdAt: serverTimestamp(),
    });
    docIds.push(docRef.id);
  }

  return docIds;
};

export const getQuizQuestions = async (
  limitCount: number = 50
): Promise<QuizQuestion[]> => {
  const questionsRef = collection(db, "quizQuestions");
  const q = query(
    questionsRef,
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as QuizQuestion)
  );
};

export const getRandomQuizQuestions = async (
  count: number = 20
): Promise<QuizQuestion[]> => {
  const questionsRef = collection(db, "quizQuestions");
  const q = query(questionsRef, limit(100)); // Get more to randomize from
  const querySnapshot = await getDocs(q);

  const allQuestions = querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as QuizQuestion)
  );

  // Shuffle and take required count
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getQuestionsByCategory = async (
  category: string,
  limitCount: number = 20
): Promise<QuizQuestion[]> => {
  const questionsRef = collection(db, "quizQuestions");
  const q = query(
    questionsRef,
    where("category", "==", category),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as QuizQuestion)
  );
};

export const getQuestionCount = async (): Promise<number> => {
  const questionsRef = collection(db, "quizQuestions");
  const querySnapshot = await getDocs(questionsRef);
  return querySnapshot.size;
};

// Quiz Session Functions
export const createQuizSession = async (
  session: Omit<QuizSession, "id" | "startedAt">
): Promise<string> => {
  const sessionsRef = collection(db, "quizSessions");
  const docRef = await addDoc(sessionsRef, {
    ...session,
    startedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateQuizSession = async (
  sessionId: string,
  updates: Partial<QuizSession>
): Promise<void> => {
  const sessionRef = doc(db, "quizSessions", sessionId);
  await updateDoc(sessionRef, updates);
};

export const getQuizSession = async (
  sessionId: string
): Promise<QuizSession | null> => {
  const sessionRef = doc(db, "quizSessions", sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (sessionSnap.exists()) {
    return {
      id: sessionSnap.id,
      ...sessionSnap.data(),
    } as QuizSession;
  }
  return null;
};

export const getUserQuizSessions = async (
  userId: string,
  limitCount: number = 10
): Promise<QuizSession[]> => {
  const sessionsRef = collection(db, "quizSessions");
  const q = query(
    sessionsRef,
    where("userId", "==", userId),
    orderBy("startedAt", "desc"),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as QuizSession)
  );
};

export const getRecentQuizSessions = async (
  limitCount: number = 50
): Promise<QuizSession[]> => {
  const sessionsRef = collection(db, "quizSessions");
  const q = query(sessionsRef, orderBy("startedAt", "desc"), limit(limitCount));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as QuizSession)
  );
};

// User Performance Functions
export const updateUserPerformance = async (
  userId: string,
  score: number,
  category: string
): Promise<void> => {
  const performanceRef = doc(db, "userPerformance", userId);
  const performanceSnap = await getDoc(performanceRef);

  if (!performanceSnap.exists()) {
    // Create new performance record
    const newPerformance: UserPerformance = {
      userId,
      totalQuizzes: 1,
      averageScore: score,
      bestScore: score,
      weakCategories: [],
      strongCategories: [category],
      lastQuizDate: serverTimestamp() as Timestamp,
    };
    await setDoc(performanceRef, newPerformance);
  } else {
    const existingData = performanceSnap.data() as UserPerformance;
    const totalQuizzes = existingData.totalQuizzes + 1;
    const newAverageScore = Math.round(
      (existingData.averageScore * existingData.totalQuizzes + score) /
        totalQuizzes
    );
    const newBestScore = Math.max(existingData.bestScore, score);

    // Update categories (simplified logic)
    const weakCategories = [...existingData.weakCategories];
    const strongCategories = [...existingData.strongCategories];

    if (score < 60 && !weakCategories.includes(category)) {
      weakCategories.push(category);
    } else if (score >= 80 && !strongCategories.includes(category)) {
      strongCategories.push(category);
    }

    await updateDoc(performanceRef, {
      totalQuizzes,
      averageScore: newAverageScore,
      bestScore: newBestScore,
      weakCategories,
      strongCategories,
      lastQuizDate: serverTimestamp(),
    });
  }
};

export const getUserPerformance = async (
  userId: string
): Promise<UserPerformance | null> => {
  const performanceRef = doc(db, "userPerformance", userId);
  const performanceSnap = await getDoc(performanceRef);

  if (performanceSnap.exists()) {
    return performanceSnap.data() as UserPerformance;
  }
  return null;
};

export const getUserQuizStats = async (userId: string) => {
  const performance = await getUserPerformance(userId);
  const sessions = await getUserQuizSessions(userId, 100);

  if (!performance) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      weakCategories: [],
      strongCategories: [],
      recentSessions: [],
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      accuracy: 0,
    };
  }

  // Calculate additional stats from sessions
  let totalQuestionsAnswered = 0;
  let correctAnswers = 0;

  sessions.forEach((session) => {
    totalQuestionsAnswered += session.totalQuestions;
    correctAnswers += Math.round(
      (session.score / 100) * session.totalQuestions
    );
  });

  const accuracy =
    totalQuestionsAnswered > 0
      ? Math.round((correctAnswers / totalQuestionsAnswered) * 100)
      : 0;

  return {
    ...performance,
    recentSessions: sessions.slice(0, 5),
    totalQuestionsAnswered,
    correctAnswers,
    accuracy,
  };
};

// Analytics Functions
export const getQuizAnalytics = async (): Promise<{
  totalQuestions: number;
  totalSessions: number;
  averageScore: number;
  popularCategories: string[];
}> => {
  const questionsCount = await getQuestionCount();
  const sessions = await getRecentQuizSessions(1000); // Get more sessions for analytics

  if (sessions.length === 0) {
    return {
      totalQuestions: questionsCount,
      totalSessions: 0,
      averageScore: 0,
      popularCategories: [],
    };
  }

  const totalSessions = sessions.length;
  const totalScore = sessions.reduce((sum, session) => sum + session.score, 0);
  const averageScore = Math.round(totalScore / totalSessions);

  // Get popular categories from questions
  const questions = await getQuizQuestions(1000);
  const categoryCount: { [key: string]: number } = {};

  questions.forEach((question) => {
    categoryCount[question.category] =
      (categoryCount[question.category] || 0) + 1;
  });

  const popularCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category]) => category);

  return {
    totalQuestions: questionsCount,
    totalSessions,
    averageScore,
    popularCategories,
  };
};

// Category Management
export const getQuestionCategories = async (): Promise<string[]> => {
  const questions = await getQuizQuestions(1000);
  const categories = new Set<string>();

  questions.forEach((question) => {
    categories.add(question.category);
  });

  return Array.from(categories).sort();
};

// Difficulty Distribution
export const getDifficultyDistribution = async (): Promise<{
  [key: string]: number;
}> => {
  const questions = await getQuizQuestions(1000);
  const distribution: { [key: string]: number } = {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  questions.forEach((question) => {
    distribution[question.difficulty] =
      (distribution[question.difficulty] || 0) + 1;
  });

  return distribution;
};

// Delete question (admin only)
export const deleteQuizQuestion = async (questionId: string): Promise<void> => {
  const questionRef = doc(db, "quizQuestions", questionId);
  await updateDoc(questionRef, {
    deleted: true,
    deletedAt: serverTimestamp(),
  });
};

// Update question (admin only)
export const updateQuizQuestion = async (
  questionId: string,
  updates: Partial<QuizQuestion>
): Promise<void> => {
  const questionRef = doc(db, "quizQuestions", questionId);
  await updateDoc(questionRef, updates);
};

// Search questions
export const searchQuizQuestions = async (
  searchTerm: string,
  limitCount: number = 20
): Promise<QuizQuestion[]> => {
  const allQuestions = await getQuizQuestions(1000); // Get all questions for client-side search

  const filteredQuestions = allQuestions.filter(
    (question) =>
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.options.some((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return filteredQuestions.slice(0, limitCount);
};
 