// src/pages/AuthPage.tsx
import { useState, useEffect } from "react";
import SignUp from "./SignUp";
import Login from "./Login";
import styles from "../styles/Form.module.css";
import "react-toastify/dist/ReactToastify.css";

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation on component mount
    setIsVisible(true);
  }, []);

  const handleToggle = (isLogin: boolean) => {
    setIsVisible(false);
    setTimeout(() => {
      setIsLoginView(isLogin);
      setIsVisible(true);
    }, 300);
  };

  return (
    <div className={styles.authPage}>
     

      <div
        className={`${styles.authBackground} ${
          isVisible ? styles.visible : ""
        }`}
      >
        <div className={styles.floatingShapes}>
          <div className={styles.shape}></div>
          <div className={styles.shape}></div>
          <div className={styles.shape}></div>
        </div>

        <div
          className={`${styles.authContainer} ${
            isVisible ? styles.visible : ""
          }`}
        >
          <div className={styles.logoContainer}>
            <h1 className={styles.appTitle}>Nigerian Nursing Success</h1>
            <p className={styles.appTagline}>
              Your journey to nursing excellence starts here
            </p>
          </div>

          <div className={styles.toggleContainer}>
            <button
              className={`${styles.toggleButton} ${
                isLoginView ? styles.active : ""
              }`}
              onClick={() => handleToggle(true)}
            >
              Login
            </button>
            <button
              className={`${styles.toggleButton} ${
                !isLoginView ? styles.active : ""
              }`}
              onClick={() => handleToggle(false)}
            >
              Sign Up
            </button>
          </div>

          <div className={styles.formWrapper}>
            {isLoginView ? <Login /> : <SignUp />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
