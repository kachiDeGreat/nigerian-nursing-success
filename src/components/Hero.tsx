import React from "react";
import styles from "../styles/Hero.module.css";
import { useNavigate } from "react-router-dom";

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/account");
  };

  return (
    <>
      <section id="home" className={styles.hero}>
        {/* Background Image with Fixed Positioning */}
        <div className={styles.backgroundContainer}>
          <img
            src="https://dropimg.onyekachi.dev/cayzzc6btyjqencwbkny"
            alt="Nursing exam preparation"
            className={styles.heroImage}
            loading="eager"
          />
          <div className={styles.imageOverlay}></div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.container}>
            <div className={styles.mainContent}>
              <div className={styles.textSection}>
                <div className={styles.badge}>
                  🎯 Trusted by 5,000+ Nigerian Nurses
                </div>

                <h1 className={styles.title}>
                  Pass Your Nursing Council Exam With Confidence
                </h1>
                <p className={styles.subtitle}>
                  10,000+ authentic Nigerian nursing questions, real exam
                  simulations. Everything you need to succeed.
                </p>

                <div className={styles.features}>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>✓</span>
                    <span>Real Past Questions</span>
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>✓</span>
                    <span>Timed Practice Tests</span>
                  </div>
                  {/* <div className={styles.feature}>
                    <span className={styles.featureIcon}>✓</span>
                    <span>Performance Analytics</span>
                  </div> */}
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.primaryButton}
                    onClick={handleGetStarted}
                  >
                    <span className={styles.buttonText}>
                      Start Learning Now - ₦4,000
                    </span>
                    <span className={styles.buttonArrow}>→</span>
                  </button>

                  <div className={styles.trustIndicators}>
                    <div className={styles.trustItem}>
                      <strong>10k+</strong> Practice Questions
                    </div>
                    <div className={styles.trustItem}>
                      <strong>98%</strong> Pass Rate
                    </div>
                    <div className={styles.trustItem}>
                      <strong>24/7</strong> Access
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.visualSection}>
                <div className={styles.examCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardBadge}>Sample Question</span>
                    <span className={styles.cardTimer}>00:45</span>
                  </div>
                  <div className={styles.cardContent}>
                    <p className={styles.question}>
                      A patient presents with high fever and neck stiffness.
                      What is the most likely diagnosis?
                    </p>
                    <div className={styles.options}>
                      <div className={styles.option}>A. Malaria</div>
                      <div className={`${styles.option} ${styles.active}`}>
                        B. Meningitis
                      </div>
                      <div className={styles.option}>C. Typhoid</div>
                      <div className={styles.option}>D. Pneumonia</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Hint */}
        <div className={styles.scrollHint}>
          <span>See how it works</span>
          <div className={styles.scrollArrow}>↓</div>
        </div>
      </section>
    </>
  );
};

export default Hero;
