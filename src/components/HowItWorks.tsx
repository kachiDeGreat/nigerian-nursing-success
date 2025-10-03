import React from "react";
import styles from "../styles/Welcome.module.css";

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description:
        "Sign up in less than 2 minutes and get immediate access to free practice questions.",
      icon: "👤",
    },
    {
      number: "02",
      title: "Take Assessment Test",
      description:
        "Complete our initial assessment to identify your current knowledge level and weak areas.",
      icon: "📝",
    },
    {
      number: "03",
      title: "Personalized Study Plan",
      description:
        "Receive a customized study plan based on your assessment results and target exam date.",
      icon: "🎯",
    },
    {
      number: "04",
      title: "Practice & Track Progress",
      description:
        "Work through practice questions, mock exams, and track your improvement with detailed analytics.",
      icon: "📊",
    },
    {
      number: "05",
      title: "Join Study Groups",
      description:
        "Collaborate with other nursing students in dedicated study groups and discussion forums.",
      icon: "👥",
    },
    {
      number: "06",
      title: "Exam Success",
      description:
        "Walk into your nursing council exam with confidence and achieve your desired results.",
      icon: "🏆",
    },
  ];

  return (
    <section id="exams" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.textCenter}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>
            Follow these simple steps to start your journey to nursing success
          </p>
        </div>

        <div className={styles.stepsContainer}>
          {steps.map((step, index) => (
            <div key={index} className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
              {index < steps.length - 1 && (
                <div className={styles.stepConnector}></div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.demoSection}>
          <div className={styles.demoContent}>
            <h3 className={styles.demoTitle}>See Our Platform in Action</h3>
            <p className={styles.demoText}>
              Watch a quick demo to see how our platform can help you prepare
              for your nursing exams
            </p>
            <button className={`${styles.btn} ${styles.btnPrimary}`}>
              🎥 Watch Demo Video
            </button>
          </div>
          <div className={styles.demoVideo}>
            <div className={styles.videoPlaceholder}>
              <div className={styles.playButton}>▶</div>
              <p>Platform Demo Video</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
