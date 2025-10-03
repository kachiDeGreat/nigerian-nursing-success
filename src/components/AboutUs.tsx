import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/AboutUs.module.css";

const AboutUs: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState({
    students: 0,
    successRate: 0,
    support: 0,
    rating: 0,
  });
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsVisible(true);
            setHasAnimated(true);
            animateCounters();
            // Unobserve after first trigger
            if (statsRef.current) {
              observer.unobserve(statsRef.current);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);

  const animateCounters = () => {
    const duration = 2000; // 2 seconds
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);

    let frame = 0;
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOutQuad = 1 - Math.pow(1 - progress, 3);

      setCounts({
        students: Math.round(easeOutQuad * 50000),
        successRate: Math.round(easeOutQuad * 98),
        support: progress > 0.5 ? 24 : 0,
        rating: Math.min(easeOutQuad * 4.9, 4.9),
      });

      if (frame === totalFrames) {
        clearInterval(counter);
        setCounts({
          students: 50000,
          successRate: 98,
          support: 24,
          rating: 4.9,
        });
      }
    }, frameRate);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "K";
    }
    return num.toString();
  };

  return (
    <section id="about" className={styles.about}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.headerBadge}>
            <span className={styles.badgeIcon}>🎓</span>
            <span>About Us</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Empowering Nigeria's Next Generation of Nurses
          </h2>
          <p className={styles.sectionSubtitle}>
            We're transforming nursing education with cutting-edge technology
            and proven exam preparation strategies designed specifically for
            Nigerian nursing students.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Image Column */}
          <div className={styles.imageColumn}>
            <div className={styles.imageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Nursing Education in Nigeria"
                className={styles.mainImage}
              />
              <div className={styles.imageBadge}>
                <div className={styles.badgeContent}>
                  <span className={styles.badgeNumber}>15+</span>
                  <span className={styles.badgeLabel}>Years Experience</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={styles.quickStats}>
              <div className={styles.statBox}>
                <div className={styles.statIcon}>📚</div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>10,000+</div>
                  <div className={styles.statLabel}>Questions</div>
                </div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>98%</div>
                  <div className={styles.statLabel}>Pass Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div className={styles.contentColumn}>
            {/* Mission Statement */}
            <div className={styles.missionBox}>
              <h3 className={styles.missionTitle}>Our Mission</h3>
              <p className={styles.missionText}>
                To revolutionize nursing education in Nigeria by providing
                accessible, comprehensive, and affordable exam preparation
                resources that empower every aspiring nurse to achieve their
                dreams.
              </p>
            </div>

            {/* Feature Cards */}
            <div className={styles.featureCards}>
              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <span className={styles.featureIcon}>🎯</span>
                </div>
                <div className={styles.featureContent}>
                  <h4 className={styles.featureTitle}>Purpose-Driven</h4>
                  <p className={styles.featureText}>
                    Every feature is designed with one goal: your success in
                    nursing exams and professional excellence.
                  </p>
                </div>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper}>
                  <span className={styles.featureIcon}>🤝</span>
                </div>
                <div className={styles.featureContent}>
                  <h4 className={styles.featureTitle}>Community First</h4>
                  <p className={styles.featureText}>
                    Built by nurses who understand your journey and are
                    committed to supporting you every step of the way.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className={styles.ctaWrapper}>
              <button className={styles.ctaButton}>
                <span>Start Your Journey - ₦4,000</span>
                <span className={styles.ctaArrow}>→</span>
              </button>
              <p className={styles.ctaSubtext}>
                Join 50,000+ students who trust us with their exam prep
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar with Countdown Animation */}
        <div
          ref={statsRef}
          className={`${styles.statsBar} ${isVisible ? styles.visible : ""}`}
        >
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              {formatNumber(counts.students)}+
            </div>
            <div className={styles.statLabel}>Students Helped</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{counts.successRate}%</div>
            <div className={styles.statLabel}>Success Rate</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              {counts.support > 0 ? "24/7" : "0"}
            </div>
            <div className={styles.statLabel}>Support</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{counts.rating.toFixed(1)}★</div>
            <div className={styles.statLabel}>Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
