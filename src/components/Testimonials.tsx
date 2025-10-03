import React, { useState } from "react";
import styles from "../styles/Testimonials.module.css";

const Testimonials: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Chioma Adebayo",
      role: "Registered Nurse, Lagos",
      image: "/images/testimonial-1.jpg",
      content:
        "This platform transformed my exam preparation. The practice questions were so similar to the actual nursing council exam that I felt completely prepared. Passed on my first attempt!",
      rating: 5,
      exam: "Nursing Council Final Exam",
    },
    {
      name: "Emeka Nwankwo",
      role: "Nursing Student, Abuja",
      image: "/images/testimonial-2.jpg",
      content:
        "The detailed analytics helped me identify my weak areas in maternal health. I improved my score by 40% in just 3 weeks. Highly recommended for any nursing student!",
      rating: 5,
      exam: "Midwifery Certification",
    },
    {
      name: "Aisha Mohammed",
      role: "Senior Nurse, Kano",
      image: "/images/testimonial-3.jpg",
      content:
        "As a working nurse, I needed flexible study options. The mobile app allowed me to study during breaks and commute. The community support was incredible too!",
      rating: 5,
      exam: "Nursing Specialization Exam",
    },
    {
      name: "David Okafor",
      role: "Nursing Tutor, Enugu",
      image: "/images/testimonial-4.jpg",
      content:
        "I recommend this platform to all my students. The question bank is comprehensive and the explanations are thorough. It has significantly improved my students pass rates.",
      rating: 5,
      exam: "Multiple Exam Preps",
    },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  return (
    <section id="testimonials" className={styles.testimonials}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.headerBadge}>
            <span className={styles.badgeIcon}>🌟</span>
            <span>Success Stories</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Trusted by Nigerian Nursing Students
          </h2>
          <p className={styles.sectionSubtitle}>
            Hear from nurses who transformed their careers and passed their
            exams with confidence using our platform
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className={styles.testimonialsContainer}>
          <div className={styles.testimonialCarousel}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`${styles.testimonialSlide} ${
                  index === currentTestimonial ? styles.active : ""
                }`}
              >
                <div className={styles.testimonialCard}>
                  <div className={styles.quoteIcon}>❝</div>
                  <p className={styles.testimonialContent}>
                    {testimonial.content}
                  </p>

                  <div className={styles.rating}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className={styles.star}>
                        ⭐
                      </span>
                    ))}
                  </div>

                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorImage}>
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.nextElementSibling?.classList.remove(
                            styles.hidden
                          );
                        }}
                      />
                      <div
                        className={`${styles.avatarFallback} ${styles.hidden}`}
                      >
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    </div>
                    <div className={styles.authorInfo}>
                      <h4 className={styles.authorName}>{testimonial.name}</h4>
                      <p className={styles.authorRole}>{testimonial.role}</p>
                      <p className={styles.authorExam}>{testimonial.exam}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <br />
          <br />
          {/* Carousel Controls */}
          <div className={styles.testimonialControls}>
            <button
              className={styles.controlBtn}
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              ‹
            </button>
            <div className={styles.testimonialIndicators}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${
                    index === currentTestimonial ? styles.active : ""
                  }`}
                  onClick={() => goToTestimonial(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button
              className={styles.controlBtn}
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              ›
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {/* <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>98%</div>
            <div className={styles.statLabel}>Pass Rate</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>4.9/5</div>
            <div className={styles.statLabel}>Student Rating</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>50K+</div>
            <div className={styles.statLabel}>Questions Answered</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>24/7</div>
            <div className={styles.statLabel}>Support Available</div>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default Testimonials;
