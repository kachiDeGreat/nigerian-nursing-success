// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getUserData, initializeUserData } from "../firebase/firestoreService";
import type { UserData } from "../firebase/firestoreService";
import { initializePayment, verifyPayment } from "../services/paystackService";
import styles from "../styles/Dashboard.module.css";

// Paystack inline payment component
const PaystackInlinePayment: React.FC<{
  email: string;
  amount: number;
  publicKey: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}> = ({ email, amount, publicKey, onSuccess, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaystackPayment = () => {
    if (!window.PaystackPop) {
      toast.error("Payment service not available. Please refresh the page.");
      return;
    }

    setIsProcessing(true);

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: email,
      amount: amount * 100, // Convert to kobo
      currency: "NGN",
      ref: `ref-${Date.now()}`,
      onClose: () => {
        setIsProcessing(false);
        onClose();
        toast.info("Payment window closed");
      },
      callback: (response: { reference: string }) => {
        setIsProcessing(false);
        onSuccess(response.reference);
        toast.success("Payment successful!");
      },
    });

    handler.openIframe();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          maxWidth: "400px",
          width: "90%",
          textAlign: "center",
        }}
      >
        <h3>Complete Your Payment</h3>
        <p>You'll be redirected to a secure payment page within this window.</p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={handlePaystackPayment}
            disabled={isProcessing}
            style={{
              background: "#0066FF",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {isProcessing ? (
              <>
                <div className={styles.spinner}></div>
                Processing...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isProcessing}
            style={{
              background: "#6B7280",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaystackInline, setShowPaystackInline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Add loading state

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          // Initialize user data if needed
          await initializeUserData(currentUser);

          // Get user data from Firestore
          const data = await getUserData(currentUser.uid);
          setUserData(data);

          // Show payment modal if user hasn't paid
          if (data && !data.isActive) {
            setTimeout(() => {
              setShowPaymentModal(true);
            }, 1000);
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          toast.error("Failed to load user data");
        }
      }

      setLoading(false);
    });

    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!user) return;

    // Real-time listener for user data changes
    const userRef = doc(db, "users", user.uid);
    const unsubscribeFirestore = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserData;
          setUserData(data);
        }
      },
      (error) => {
        console.error("Error listening to user data:", error);
      }
    );

    return () => {
      unsubscribeFirestore();
    };
  }, [user]);

  const handlePaymentInit = async () => {
    if (!user?.email) {
      toast.error("User email not found");
      return;
    }

    setIsProcessingPayment(true); // Start loading

    try {
      // Initialize payment to get reference
      const paymentResponse = await initializePayment(user.email, 4000, {
        userId: user.uid,
        displayName: user.displayName || "",
      });

      if (paymentResponse.status) {
        // Show Paystack inline payment
        setShowPaystackInline(true);
        setShowPaymentModal(false);
      } else {
        toast.error("Failed to initialize payment");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Payment service temporarily unavailable");
    } finally {
      setIsProcessingPayment(false); // Stop loading
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    if (!user) return;

    try {
      // Verify the payment
      const verification = await verifyPayment(reference);

      if (verification.data.status === "success") {
        // Update user status in Firestore
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          paymentStatus: "paid",
          isActive: true,
          paystackReference: reference,
        });

        setShowPaystackInline(false);
        toast.success("Payment verified! Your account is now active.");
      } else {
        toast.error("Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Failed to verify payment");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error logging out:", error.message);
        toast.error("Logout failed: " + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null; // ProtectedRoute will handle redirect
  }

  return (
    <div className={styles.dashboard}>
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Activate Your Account</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessingPayment}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.paymentInfo}>
                <h3 className={styles.paymentAmount}>₦4,000</h3>
                <p className={styles.paymentDescription}>
                  One-time payment for full access to all nursing exam questions
                  and features
                </p>
              </div>

              <div className={styles.featuresList}>
                <h4 className={styles.featuresTitle}>What you'll get:</h4>
                <ul className={styles.features}>
                  <li className={styles.featureItem}>
                    <span className={styles.featureIcon}>✅</span>
                    Access to 10,000+ nursing exam questions
                  </li>
                  <li className={styles.featureItem}>
                    <span className={styles.featureIcon}>✅</span>
                    Timed practice tests with real exam simulation
                  </li>
                  <li className={styles.featureItem}>
                    <span className={styles.featureIcon}>✅</span>
                    Detailed performance analytics
                  </li>
                  <li className={styles.featureItem}>
                    <span className={styles.featureIcon}>✅</span>
                    Mobile-friendly platform
                  </li>
                  <li className={styles.featureItem}>
                    <span className={styles.featureIcon}>✅</span>
                    24/7 access to study materials
                  </li>
                </ul>
              </div>

              <div className={styles.securityNote}>
                <span className={styles.securityIcon}>🔒</span>
                Secure payment processed by Paystack
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.payButton}
                onClick={handlePaymentInit}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <div className={styles.spinner}></div>
                    Initializing Payment...
                  </>
                ) : (
                  "Pay ₦4,000 with Paystack"
                )}
              </button>

              <button
                className={styles.cancelButton}
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessingPayment}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paystack Inline Payment */}
      {showPaystackInline && user?.email && (
        <PaystackInlinePayment
          email={user.email}
          amount={4000}
          publicKey={import.meta.env.VITE_PAYSTACK_PUBLIC_KEY}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaystackInline(false)}
        />
      )}

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>🎯 Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome to your nursing exam preparation platform!
          </p>
        </header>

        <div className={styles.content}>
          {/* Account Status Card */}
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <h3 className={styles.statusTitle}>Account Status</h3>
              <span
                className={`${styles.statusBadge} ${
                  userData?.isActive ? styles.active : styles.inactive
                }`}
              >
                {userData?.isActive ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            <div className={styles.statusContent}>
              {userData?.isActive ? (
                <div className={styles.activeStatus}>
                  <div className={styles.successIcon}>✅</div>
                  <div>
                    <h4 className={styles.activeTitle}>Account Activated!</h4>
                    <p className={styles.activeText}>
                      You have full access to all nursing exam questions and
                      features.
                    </p>
                  </div>
                </div>
              ) : (
                <div className={styles.inactiveStatus}>
                  <div className={styles.warningIcon}>⚠️</div>
                  <div>
                    <h4 className={styles.inactiveTitle}>
                      Account Not Activated
                    </h4>
                    <p className={styles.inactiveText}>
                      Complete your payment to access all features and exam
                      questions.
                    </p>
                    <button
                      className={styles.activateButton}
                      onClick={() => setShowPaymentModal(true)}
                    >
                      Activate Account - ₦4,000
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Info Card */}
          <div className={styles.welcomeCard}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user?.displayName?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
                  "U"}
              </div>
              <div className={styles.userDetails}>
                <h2 className={styles.userName}>
                  {user?.displayName || "Nigerian Nursing Student"}
                </h2>
                <p className={styles.userEmail}>{user?.email}</p>
                <div className={styles.verificationStatus}>
                  <span
                    className={`${styles.status} ${
                      user?.emailVerified ? styles.verified : styles.unverified
                    }`}
                  >
                    {user?.emailVerified
                      ? "✅ Email Verified"
                      : "❌ Email Not Verified"}
                  </span>
                  <span className={styles.loginCount}>
                    Logins: {userData?.loginCount || 1}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          {userData?.isActive ? (
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🧪</div>
                <h4 className={styles.featureTitle}>Practice Tests</h4>
                <p className={styles.featureText}>
                  Access 10,000+ nursing exam questions with timed tests.
                </p>
                <button
                  className={styles.featureButton}
                  onClick={() =>
                    toast.info("Practice tests feature coming soon!")
                  }
                >
                  Start Practice Test
                </button>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📊</div>
                <h4 className={styles.featureTitle}>Progress Analytics</h4>
                <p className={styles.featureText}>
                  Track your performance and identify weak areas.
                </p>
                <button
                  className={styles.featureButton}
                  onClick={() => toast.info("Progress analytics coming soon!")}
                >
                  View Progress
                </button>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📖</div>
                <h4 className={styles.featureTitle}>Study Materials</h4>
                <p className={styles.featureText}>
                  Comprehensive nursing study guides and resources.
                </p>
                <button
                  className={styles.featureButton}
                  onClick={() => toast.info("Study materials coming soon!")}
                >
                  Browse Materials
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.lockedFeatures}>
              <div className={styles.lockedIcon}>🔒</div>
              <h3 className={styles.lockedTitle}>Features Locked</h3>
              <p className={styles.lockedText}>
                Activate your account to unlock all features including practice
                tests, progress analytics, and study materials.
              </p>
              <button
                className={styles.unlockButton}
                onClick={() => setShowPaymentModal(true)}
              >
                Unlock Features - ₦4,000
              </button>
            </div>
          )}

          {/* Logout Section */}
          <div className={styles.logoutSection}>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <span className={styles.logoutIcon}>🚪</span>
              Logout
            </button>
            <p className={styles.logoutNote}>
              Click here to securely log out of your account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
