import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import styles from "../styles/Form.module.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// 1. IMPORT the new setting
import { auth, actionCodeSettings } from "../firebase/firebase";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!userCredential.user.emailVerified) {
        toast.warning("Please verify your email before logging in.");
        navigate("/verify-email", {
          state: { email: userCredential.user.email },
        });
        return;
      }

      console.log("Logged in successfully!", userCredential.user);
      toast.success("Login successful! Redirecting...");
      setTimeout(() => navigate("/welcome"), 1500);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error logging in:", error.message);
        toast.error("Login failed: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      console.log("Logged in with Google successfully!", userCredential.user);
      toast.success("Login with Google successful!");
      setTimeout(() => navigate("/welcome"), 1500);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error signing in with Google:", error.message);
        toast.error("Google sign-in failed: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      // 2. USE the unified actionCodeSettings
      await sendPasswordResetEmail(
        auth,
        forgotPasswordEmail,
        actionCodeSettings
      );
      toast.success(
        "Password reset email sent! Check your inbox and spam folder."
      );
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error sending password reset email:", error.message);
        toast.error("Failed to send reset email: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.decorativeElement}></div>
      <div className={styles.decorativeElement}></div>

      {!showForgotPassword ? (
        <>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to continue to your account</p>
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
              <span className={styles.inputIcon}>✉️</span>
            </div>
            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <span className={styles.inputIcon}>🔒</span>
            </div>
            <div className={styles.forgotPasswordContainer}>
              <button
                type="button"
                className={styles.forgotPasswordLink}
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot your password?
              </button>
            </div>
            <button
              type="submit"
              className={`${styles.button} ${styles.primary} ${
                isLoading ? styles.loading : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? <div className={styles.spinner}></div> : "Login"}
            </button>
          </form>
          <div className={styles.divider}>
            <span>Or continue with</span>
          </div>
          <div className={styles.socialButtons}>
            <button
              className={`${styles.button} ${styles.google}`}
              onClick={handleGoogleSignIn}
              type="button"
              disabled={isLoading}
            >
              <svg
                className={styles.googleIcon}
                viewBox="0 0 24 24"
                width="20"
                height="20"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className={styles.title}>Reset Password</h2>
          <p className={styles.subtitle}>
            Enter your email to receive a reset link
          </p>
          <form onSubmit={handleForgotPassword} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              <span className={styles.inputIcon}>✉️</span>
            </div>
            <div className={styles.forgotPasswordActions}>
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
                  "Send Reset Link"
                )}
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.guest}`}
                onClick={() => setShowForgotPassword(false)}
                disabled={isLoading}
              >
                Back to Login
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Login;
