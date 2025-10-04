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
//   DocumentData,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { User } from "firebase/auth";

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
