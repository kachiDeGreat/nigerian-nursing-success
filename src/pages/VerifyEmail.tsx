import { useState, useEffect, useRef } from "react"; // 💡 1. Import useRef
import {
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  applyActionCode,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { auth, actionCodeSettings } from "../firebase/firebase";
import { toast } from "react-toastify";
import styles from "../styles/Form.module.css";

const VerifyEmail = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 💡 2. Use useRef for the lock instead of useState
  const verificationAttempted = useRef(false);

  const email = location.state?.email || (user ? user.email : "");

  // This effect is ONLY for handling the incoming link from an email
  useEffect(() => {
    const oobCode = searchParams.get("oobCode");

    const handleEmailVerification = async (code: string) => {
      // 💡 4. Set the .current property to engage the lock
      verificationAttempted.current = true;
      setIsLoading(true);
      try {
        await applyActionCode(auth, code);
        toast.success("Email verified successfully!");
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }
        navigate("/verify-success");
      } catch (error) {
        console.error("Error verifying email:", error);
        // You can now re-enable this toast. It will only show for real errors.
        toast.error(
          "Failed to verify email. The link may be invalid or has expired."
        );
        navigate("/account");
      } finally {
        setIsLoading(false);
      }
    };

    // 💡 3. Check the .current property of the ref
    if (oobCode && !verificationAttempted.current) {
      handleEmailVerification(oobCode);
    }
    // 💡 5. The ref object itself is stable, so it's not needed in the dependency array
  }, [searchParams, navigate]);

  // This separate effect handles the auth state for users waiting on the page
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.emailVerified) {
        navigate("/welcome");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleResendVerification = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await sendEmailVerification(user, actionCodeSettings);
      toast.success(
        "Verification email sent! Check your inbox and spam folder."
      );
      setCooldown(300);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error sending verification email:", error.message);
        toast.error("Failed to send verification email: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.info("Signed out successfully.");
      navigate("/account");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles.authPage}>
      <div className={`${styles.authBackground} ${styles.visible}`}>
        <div className={`${styles.authContainer} ${styles.visible}`}>
          <div className={styles.logoContainer}>
            <h1 className={styles.appTitle}>Verify Your Email</h1>
            <p className={styles.appTagline}>
              Almost there! Please verify your email address
            </p>
          </div>
          <div className={styles.formContainer}>
            <div className={styles.verificationContent}>
              <div className={styles.verificationIcon}>📧</div>
              <h2 className={styles.title}>Check Your Email</h2>
              <p className={styles.subtitle}>
                We've sent a verification link to:
              </p>
              <p className={styles.emailDisplay}>{email}</p>{" "}
              <p className={styles.subtitle}>
                Having trouble? Check your spam folder!!!
              </p>
              <div className={styles.verificationActions}>
                <button
                  onClick={handleResendVerification}
                  className={`${styles.button} ${styles.primary} ${
                    isLoading ? styles.loading : ""
                  }`}
                  disabled={isLoading || cooldown > 0}
                >
                  {isLoading ? (
                    <div className={styles.spinner}></div>
                  ) : cooldown > 0 ? (
                    `Resend in ${formatTime(cooldown)}`
                  ) : (
                    "Resend Verification Email"
                  )}
                </button>
                <button
                  onClick={handleSignOut}
                  className={`${styles.button} ${styles.guest}`}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
