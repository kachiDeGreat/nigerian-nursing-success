import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
import styles from "../styles/Form.module.css";

const VerifySuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // 💡 This simplified effect is more stable and prevents the re-render error.
  useEffect(() => {
    // If for some reason the countdown starts at 0 or less, navigate immediately.
    if (countdown <= 0) {
      navigate("/welcome");
      return;
    }

    // Create an interval that ticks down every second.
    const timerId = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    // 💡 This is the crucial cleanup function.
    // It runs when the component is about to unmount (e.g., when the user navigates away).
    // It stops the timer and prevents the "update component" error and memory leaks.
    return () => clearInterval(timerId);
  }, [countdown, navigate]); // Dependencies ensure the effect is managed correctly.

  return (
    <div className={styles.authPage}>
      <div className={`${styles.authBackground} ${styles.visible}`}>
        <div className={`${styles.authContainer} ${styles.visible}`}>
          <div className={styles.logoContainer}>
            <h1 className={styles.appTitle}>Email Verified! ✅</h1>
            <p className={styles.appTagline}>
              Your email has been successfully verified
            </p>
          </div>
          <div className={styles.formContainer}>
            <div className={styles.verificationContent}>
              <div className={styles.successIcon}>🎉</div>
              <h2 className={styles.title}>Verification Successful!</h2>
              <p className={styles.subtitle}>
                Thank you for verifying your email address. You'll be redirected
                to the welcome page in {countdown} seconds.
              </p>
              <div className={styles.successAnimation}>
                <div className={styles.checkmark}>✓</div>
              </div>
              <button
                onClick={() => navigate("/welcome")}
                className={`${styles.button} ${styles.primary}`}
              >
                Go to Welcome Page Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifySuccess;
