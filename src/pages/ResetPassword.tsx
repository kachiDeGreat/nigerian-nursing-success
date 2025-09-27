import { useState, useEffect, useRef } from "react"; // 💡 1. Import useRef
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { toast } from "react-toastify";
import styles from "../styles/Form.module.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidCode, setIsValidCode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 💡 2. Use useRef for the lock instead of useState
  const verificationAttempted = useRef(false);

  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (!oobCode) {
      toast.error("Invalid password reset link.");
      navigate("/account");
      return;
    }

    // 💡 3. Check the .current property of the ref
    if (!verificationAttempted.current) {
      // 💡 4. Set the .current property to engage the lock. This does NOT cause a re-render.
      verificationAttempted.current = true;

      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setIsValidCode(true);
          setEmail(email);
          toast.info("Please enter your new password.");
        })
        .catch((error) => {
          console.error("Invalid reset code:", error);
          toast.error("This password reset link is invalid or has expired.");
          navigate("/account");
        });
    }
    // 💡 5. The ref object itself is stable, so we don't need it in the dependency array.
  }, [oobCode, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password should be at least 6 characters.");
      return;
    }

    if (!oobCode) {
      toast.error("Invalid reset code.");
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast.success(
        "Password reset successfully! You can now login with your new password."
      );

      setTimeout(() => {
        navigate("/account");
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error resetting password:", error.message);
        toast.error("Failed to reset password: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidCode) {
    return (
      <div className={styles.authPage}>
        <div className={`${styles.authBackground} ${styles.visible}`}>
          <div className={`${styles.authContainer} ${styles.visible}`}>
            <div className={styles.verificationContent}>
              <div className={styles.verificationIcon}>⏳</div>
              <h2 className={styles.title}>Verifying Reset Link...</h2>
              <p className={styles.subtitle}>
                Please wait while we validate your reset link.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={`${styles.authBackground} ${styles.visible}`}>
        <div className={`${styles.authContainer} ${styles.visible}`}>
          <div className={styles.logoContainer}>
            <h1 className={styles.appTitle}>Reset Your Password</h1>
            <p className={styles.appTagline}>
              Create a new password for your account
            </p>
          </div>
          <div className={styles.formContainer}>
            <div className={styles.verificationContent}>
              <div className={styles.verificationIcon}>🔒</div>
              <p className={styles.subtitle}>
                Reset password for: <strong>{email}</strong>
              </p>
              <form onSubmit={handleResetPassword} className={styles.form}>
                <div className={styles.inputGroup}>
                  <input
                    className={styles.input}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    required
                    minLength={6}
                  />
                  <span className={styles.inputIcon}>🔑</span>
                </div>
                <div className={styles.inputGroup}>
                  <input
                    className={styles.input}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    required
                    minLength={6}
                  />
                  <span className={styles.inputIcon}>🔑</span>
                </div>
                <button
                  type="submit"
                  className={`${styles.button} ${styles.primary} ${
                    isLoading ? styles.loading : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
