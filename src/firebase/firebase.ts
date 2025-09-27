import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDONZzA56ECLswBmLXeKhjOraC2WnyW-NU",
  authDomain: "nigerian-nursing-success.firebaseapp.com",
  projectId: "nigerian-nursing-success",
  storageBucket: "nigerian-nursing-success.firebasestorage.app",
  messagingSenderId: "710748670639",
  appId: "1:710748670639:web:80c9874b745e4564e4a25a",
  measurementId: "G-KZERHSSQK6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// All actions now point to ONE URL
const actionCodeSettings = {
  url: `${window.location.origin}/action`,
  handleCodeInApp: true,
};

export { actionCodeSettings };
