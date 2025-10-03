import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import styles from "../styles/Form.module.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, actionCodeSettings } from "../firebase/firebase";

const SignUp = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });
      console.log(
        "Sending verification email with settings:",
        actionCodeSettings
      );
      await sendEmailVerification(userCredential.user, actionCodeSettings);

      console.log("Account created successfully!", userCredential.user);
      toast.success(
        "Account created! Please check your email for verification."
      );

      // Redirect to verification page instead of welcome page
      setTimeout(
        () =>
          navigate("/verify-email", {
            state: { email: userCredential.user.email },
          }),
        1500
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error signing up:", error.message);
        toast.error("Sign up failed: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      console.log("Signed up with Google successfully!", userCredential.user);
      toast.success("Account created with Google!");
      setTimeout(() => navigate("/welcome"), 1500);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error signing up with Google:", error.message);
        toast.error("Google sign-up failed: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.decorativeElement}></div>
      <div className={styles.decorativeElement}></div>
      <h2 className={styles.title}>Create Account</h2>
      <p className={styles.subtitle}>Get started with your account</p>
      <form onSubmit={handleSignUp} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            className={styles.input}
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            required
          />
          <span className={styles.inputIcon}>👤</span>
        </div>
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
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <span className={styles.inputIcon}>🔒</span>
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
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
          {isLoading ? <div className={styles.spinner}></div> : "Sign Up"}
        </button>
      </form>
      <div className={styles.divider}>
        <span>Or sign up with</span>
      </div>
      <div className={styles.socialButtons}>
        <button
          className={`${styles.button} ${styles.google}`}
          onClick={handleGoogleSignUp}
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
          Sign up with Google
        </button>
      </div>
    </div>
  );
};

export default SignUp;
