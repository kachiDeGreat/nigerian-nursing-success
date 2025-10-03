import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/ExamFeatures.module.css";
import { useNavigate } from "react-router-dom";

const ExamFeatures: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/account");
  };
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsVisible(true);
            setHasAnimated(true);
            animateQuestionCount();
            // Unobserve after first trigger
            if (featuresRef.current) {
              observer.unobserve(featuresRef.current);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, [hasAnimated]);

  const animateQuestionCount = () => {
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOutQuad = 1 - Math.pow(1 - progress, 3);

      setQuestionCount(Math.round(easeOutQuad * 10000));

      if (frame === totalFrames) {
        clearInterval(counter);
        setQuestionCount(10000);
      }
    }, frameRate);
  };

  const features = [
    {
      icon: "📚",
      title: "10,000+ Real Exam Questions",
      description:
        "Access our constantly growing database of authentic Nigerian Nursing Council exam questions, carefully curated from past papers and verified by nursing professionals.",
      highlight: "Real Past Questions",
    },
    {
      icon: "⏱️",
      title: "Timed Practice Tests",
      description:
        "Experience real exam conditions with our timed tests. Build confidence and master time management skills crucial for success.",
      highlight: "Exam Simulation",
    },
    {
      icon: "🔄",
      title: "Unique Question Sets",
      description:
        "Each practice session contains 250 randomly selected questions. With 10,000+ questions in our bank, the odds of seeing repeat questions are incredibly slim.",
      highlight: "Always Fresh",
    },
    {
      icon: "📱",
      title: "Study Anywhere, Anytime",
      description:
        "Our fully responsive platform works seamlessly on all devices. Study on your phone during commute, tablet at home, or laptop at the library.",
      highlight: "Mobile Friendly",
    },
  ];

  return (
    <section id="features" className={styles.features}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.headerBadge}>
            <span className={styles.badgeIcon}>⚡</span>
            <span>Platform Features</span>
          </div>
          <h2 className={styles.title}>
            Everything You Need to Ace Your Nursing Exams
          </h2>
          <p className={styles.subtitle}>
            Comprehensive tools and resources designed specifically for Nigerian
            nursing students preparing for their council exams.
          </p>
        </div>

        {/* Question Counter Highlight */}
        <div
          ref={featuresRef}
          className={`${styles.counterBox} ${isVisible ? styles.visible : ""}`}
        >
          <div className={styles.counterContent}>
            <div className={styles.counterIcon}>🎯</div>
            <div className={styles.counterInfo}>
              <div className={styles.counterNumber}>
                {questionCount.toLocaleString()}+
              </div>
              <div className={styles.counterLabel}>
                Real Exam Questions & Counting
              </div>
              <p className={styles.counterText}>
                Updated regularly with verified questions from actual Nigerian
                Nursing Council exams. Every question is reviewed by licensed
                nurses to ensure accuracy and relevance.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureHeader}>
                <div className={styles.featureIconWrapper}>
                  <span className={styles.featureIcon}>{feature.icon}</span>
                </div>
                <span className={styles.featureBadge}>{feature.highlight}</span>
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className={styles.howItWorks}>
          <h3 className={styles.howItWorksTitle}>
            How Our Question System Works
          </h3>
          <div className={styles.processGrid}>
            <div className={styles.processCard}>
              <div className={styles.processNumber}>01</div>
              <h4 className={styles.processTitle}>Start a Test</h4>
              <p className={styles.processText}>
                Choose your practice mode and begin a new test session with 250
                randomly selected questions.
              </p>
            </div>
            <div className={styles.processCard}>
              <div className={styles.processNumber}>02</div>
              <h4 className={styles.processTitle}>Unique Every Time</h4>
              <p className={styles.processText}>
                Our algorithm pulls from 10,000+ questions, ensuring you rarely
                see the same question twice.
              </p>
            </div>
            <div className={styles.processCard}>
              <div className={styles.processNumber}>03</div>
              <h4 className={styles.processTitle}>Track Progress</h4>
              <p className={styles.processText}>
                Complete your test, review answers, and see detailed
                explanations for every question.
              </p>
            </div>
          </div>
        </div>

        {/* Sample Question Preview */}
        <div className={styles.sampleSection}>
          <div className={styles.sampleContent}>
            <h3 className={styles.sampleTitle}>See a Sample Question</h3>
            <p className={styles.sampleText}>
              Experience the quality and format of our exam questions. Every
              question includes detailed explanations to help you learn.
            </p>
            <button className={styles.sampleButton} onClick={handleGetStarted}>
              <span>Try Sample Questions</span>
              <span className={styles.buttonArrow}>→</span>
            </button>
          </div>
          <div className={styles.samplePreview}>
            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <span className={styles.previewBadge}>Question 1 of 250</span>
                <span className={styles.previewTimer}>02:30</span>
              </div>
              <p className={styles.previewQuestion}>
                A 45-year-old patient with diabetes presents with a non-healing
                foot ulcer. What is the priority nursing intervention?
              </p>
              <div className={styles.previewOptions}>
                <div className={styles.previewOption}>
                  A. Apply antibiotic cream
                </div>
                <div className={styles.previewOption}>
                  B. Assess blood glucose levels
                </div>
                <div className={styles.previewOption}>
                  C. Elevate the affected limb
                </div>
                <div className={styles.previewOption}>
                  D. Schedule surgical consult
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h3 className={styles.ctaTitle}>Ready to Start Practicing?</h3>
            <p className={styles.ctaText}>
              Join thousands of successful nurses who passed their exams using
              our comprehensive question bank.
            </p>
            <div className={styles.ctaActions}>
              <button className={styles.ctaPrimary} onClick={handleGetStarted}>
                <span>Get Started - ₦4,000</span>
                <span className={styles.buttonArrow}>→</span>
              </button>
              <button
                className={styles.ctaSecondary}
                onClick={handleGetStarted}
              >
                View Sample Questions
              </button>
            </div>
            <div className={styles.ctaStats}>
              <div className={styles.ctaStat}>
                <strong>250</strong> Questions Per Test
              </div>
              <div className={styles.ctaStat}>
                <strong>10,000+</strong> Total Questions
              </div>
              <div className={styles.ctaStat}>
                <strong>0.025%</strong> Repeat Chance
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExamFeatures;
