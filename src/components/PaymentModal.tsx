import React, { useState, useEffect } from "react";
import {
  initializePayment,
  //   testPaystackConnection,
} from "../services/paystackService";
import {
  createPaymentRecord,
  updatePaymentStatus,
} from "../firebase/firestoreService";
import type { User } from "firebase/auth";
import { toast } from "react-toastify";
import styles from "../styles/PaymentModal.module.css";

interface PaymentModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  user,
  isOpen,
  onClose,
  //   onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "initial" | "processing" | "redirect" | "success"
  >("initial");

  const handleRealPayment = async () => {
    if (!user || !user.email) {
      toast.error("User email not found");
      return;
    }

    setIsProcessing(true);
    setPaymentStep("processing");

    try {
      // Step 1: Initialize payment with Paystack (using test key)
      toast.info("🔄 Connecting to payment gateway...");

      const paymentResponse = await initializePayment(user.email!, 4000, {
        userId: user.uid,
        displayName: user.displayName || "",
      });

      if (paymentResponse.status) {
        // Step 2: Create payment record
        await createPaymentRecord({
          userId: user.uid,
          email: user.email!,
          amount: 4000,
          currency: "NGN",
          status: "pending",
          paystackReference: paymentResponse.data.reference,
        });

        // Step 3: Update user payment status
        await updatePaymentStatus(
          user.uid,
          "pending",
          paymentResponse.data.reference
        );

        // Step 4: Show redirect message
        setPaymentStep("redirect");
        toast.info("✅ Payment initialized! Redirecting to Paystack...");

        // Step 5: Redirect to Paystack payment page after short delay
        setTimeout(() => {
          window.location.href = paymentResponse.data.authorization_url;
        }, 2000);
      } else {
        toast.error("Failed to initialize payment: " + paymentResponse.message);
        setPaymentStep("initial");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Payment service temporarily unavailable. Please try again.");
      setPaymentStep("initial");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    await handleRealPayment(); // Always use real payment flow with test key
  };

  // Reset steps when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPaymentStep("initial");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {paymentStep === "redirect"
              ? "🎯 Redirecting..."
              : "Activate Your Account"}
          </h2>
          {paymentStep !== "redirect" && (
            <button
              className={styles.closeButton}
              onClick={onClose}
              disabled={isProcessing}
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.modalBody}>
          {/* Payment Status Indicator */}
          {/* <div className={styles.paymentStatus}>
            <div
              className={`${styles.statusStep} ${
                paymentStep === "initial" ? styles.active : ""
              }`}
            >
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepText}>Initiate</div>
            </div>
            <div className={styles.statusConnector}></div>
            <div
              className={`${styles.statusStep} ${
                paymentStep === "processing" ? styles.active : ""
              }`}
            >
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepText}>Process</div>
            </div>
            <div className={styles.statusConnector}></div>
            <div
              className={`${styles.statusStep} ${
                paymentStep === "redirect" ? styles.active : ""
              }`}
            >
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepText}>Complete</div>
            </div>
          </div> */}

          {paymentStep === "redirect" ? (
            <div className={styles.redirectSection}>
              <div className={styles.redirectIcon}>🔄</div>
              <h3 className={styles.redirectTitle}>Redirecting to Paystack</h3>
              <p className={styles.redirectText}>
                You're being redirected to Paystack's secure payment page to
                complete your transaction.
              </p>
              <div className={styles.loadingBar}>
                <div className={styles.loadingProgress}></div>
              </div>
              <p className={styles.redirectNote}>
                If you are not redirected automatically,{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.reload();
                  }}
                >
                  click here
                </a>
              </p>
            </div>
          ) : (
            <>
              <div className={styles.paymentInfo}>
                <div className={styles.paymentIcon}>💰</div>
                <h3 className={styles.paymentAmount}>₦4,000</h3>
                <p className={styles.paymentDescription}>
                  One-time payment for full access to all nursing exam questions
                  and features
                </p>
              </div>

              <div className={styles.securityNote}>
                <span className={styles.securityIcon}>🔒</span>
                Secure payment processed by Paystack
              </div>
            </>
          )}
        </div>

        {paymentStep !== "redirect" && (
          <div className={styles.modalFooter}>
            <button
              className={styles.payButton}
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className={styles.spinner}></div>
                  Initializing Payment...
                </>
              ) : (
                "🚀 Pay ₦4,000 with Paystack"
              )}
            </button>

            <button
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isProcessing}
            >
              Maybe Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
