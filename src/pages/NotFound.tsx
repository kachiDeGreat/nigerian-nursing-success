// src/components/NotFound.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/NotFound.module.css";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Animated 404 Graphic */}
        <div className={styles.graphicSection}>
          <div className={styles.numberGroup}>
            <div className={styles.number}>4</div>
            <div className={styles.planet}>
              <div className={styles.planetCore}></div>
              <div className={styles.planetRing}></div>
            </div>
            <div className={styles.number}>4</div>
          </div>
          <div className={styles.astronaut}>
            <div className={styles.astronautBody}>
              <div className={styles.astronautHead}></div>
              <div className={styles.astronautAntenna}></div>
            </div>
          </div>
        </div>

        {/* Message Section */}
        <div className={styles.messageSection}>
          <h1 className={styles.title}>Page Not Found</h1>
          <p className={styles.subtitle}>
            Oops! It looks like you've ventured into unknown space.
          </p>
          <p className={styles.description}>
            The page you're looking for doesn't exist or may have been moved.
            Don't worry, even astronauts get lost sometimes!
          </p>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button onClick={handleGoHome} className={styles.primaryButton}>
              <span className={styles.buttonIcon}>🚀</span>
              Back to Home
            </button>
            <button onClick={handleGoBack} className={styles.secondaryButton}>
              <span className={styles.buttonIcon}>↩</span>
              Go Back
            </button>
          </div>

          {/* Quick Links */}
          <div className={styles.quickLinks}>
            <h3 className={styles.quickLinksTitle}>Quick Navigation</h3>
            <div className={styles.linksGrid}>
              <button
                onClick={() => navigate("/dashboard")}
                className={styles.linkCard}
              >
                <span className={styles.linkIcon}>📊</span>
                <span className={styles.linkText}>Dashboard</span>
              </button>
              <button
                onClick={() => navigate("/quiz")}
                className={styles.linkCard}
              >
                <span className={styles.linkIcon}>🧪</span>
                <span className={styles.linkText}>Practice Quiz</span>
              </button>
              <button
                onClick={() => navigate("/account")}
                className={styles.linkCard}
              >
                <span className={styles.linkIcon}>👤</span>
                <span className={styles.linkText}>Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className={styles.floatingStars}>
          <div
            className={styles.star}
            style={{ top: "10%", left: "5%", animationDelay: "0s" }}
          >
            ✦
          </div>
          <div
            className={styles.star}
            style={{ top: "20%", left: "90%", animationDelay: "1s" }}
          >
            ✦
          </div>
          <div
            className={styles.star}
            style={{ top: "60%", left: "8%", animationDelay: "2s" }}
          >
            ✦
          </div>
          <div
            className={styles.star}
            style={{ top: "80%", left: "85%", animationDelay: "1.5s" }}
          >
            ✦
          </div>
          <div
            className={styles.star}
            style={{ top: "40%", left: "95%", animationDelay: "0.5s" }}
          >
            ✦
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
