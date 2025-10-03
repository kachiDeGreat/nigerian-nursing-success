import React from "react";
import styles from "../styles/CTASection.module.css";
import { useNavigate } from "react-router-dom";

const CTASection: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/account");
    console.log("Get Started clicked");
  };

  const handleContactSales = () => {
    window.open("https://wa.me/2348100790074", "_blank");
  };

  return (
    <section id="cta" className={styles.cta}>
      <div className={styles.container}>
        <div className={styles.ctaContent}>
          {/* Section Header */}
          <div className={styles.sectionHeader}>
            <div className={styles.headerBadge}>
              <span className={styles.badgeIcon}>🚀</span>
              <span>Get Started Today</span>
            </div>
            <h2 className={styles.sectionTitle}>
              Ready to Ace Your Nursing Exams?
            </h2>
            <p className={styles.sectionSubtitle}>
              Join 50,000+ nursing students who have transformed their exam
              preparation with our comprehensive question bank and proven study
              system.
            </p>
          </div>

          {/* Features Grid */}
          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>📚</div>
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>10,000+ Questions</h4>
                <p className={styles.featureText}>
                  Authentic Nigerian Nursing Council exam questions
                </p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>⏱️</div>
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>Timed Tests</h4>
                <p className={styles.featureText}>
                  Real exam simulation with time management
                </p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>📱</div>
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>Study Anywhere</h4>
                <p className={styles.featureText}>
                  Mobile-friendly platform for on-the-go learning
                </p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🤝</div>
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>Community Support</h4>
                <p className={styles.featureText}>
                  Connect with fellow nursing students
                </p>
              </div>
            </div>
          </div>

          {/* CTA Actions */}
          <div className={styles.ctaActions}>
            <button className={styles.primaryButton} onClick={handleGetStarted}>
              <span className={styles.buttonText}>Start Now - ₦4,000</span>
              <span className={styles.buttonArrow}>→</span>
            </button>
            <button
              className={styles.secondaryButton}
              onClick={handleContactSales}
            >
              <span className={styles.buttonText}>Contact Sales</span>
            </button>
          </div>

          {/* Guarantee Section */}
          <div className={styles.guaranteeSection}>
            <div className={styles.guaranteeBadge}>
              <span className={styles.guaranteeIcon}>🎯</span>
              <span>98% Pass Guarantee</span>
            </div>
            <p className={styles.guaranteeText}>
              Complete our study plan and if you don't pass your nursing exam,
              we'll refund your subscription fee.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className={styles.trustIndicators}>
            <div className={styles.trustItem}>
              <strong>50K+</strong> Students Helped
            </div>
            <div className={styles.trustItem}>
              <strong>98%</strong> Success Rate
            </div>
            <div className={styles.trustItem}>
              <strong>24/7</strong> Support
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
