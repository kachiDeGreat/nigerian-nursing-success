import { useState, useEffect, useRef } from "react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { toast } from "react-toastify";
import styles from "../styles/Form.module.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidCode, setIsValidCode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const verificationAttempted = useRef(false);

  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (!oobCode) {
      toast.error("Invalid password reset link.");
      navigate("/account");
      return;
    }

    if (!verificationAttempted.current) {
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

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    required
                    minLength={6}
                  />
                  <span className={styles.inputIcon}>🔑</span>
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={toggleNewPasswordVisibility}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      // Eye Off SVG
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C7 19 2.73 15.11 1 12c.58-1.03 1.32-2.01 2.2-2.9M9.88 9.88A3 3 0 0 1 14.12 14.12M6.1 6.1l11.8 11.8" />
                      </svg>
                    ) : (
                      // Eye SVG
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className={styles.inputGroup}>
                  <input
                    className={styles.input}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    required
                    minLength={6}
                  />
                  <span className={styles.inputIcon}>🔑</span>
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      // Eye Off SVG
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C7 19 2.73 15.11 1 12c.58-1.03 1.32-2.01 2.2-2.9M9.88 9.88A3 3 0 0 1 14.12 14.12M6.1 6.1l11.8 11.8" />
                      </svg>
                    ) : (
                      // Eye SVG
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
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
