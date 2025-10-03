import React from "react";
import styles from "../styles/Welcome.module.css";


const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          {/* Main Footer */}
          {/* <div className={styles.footerMain}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <span className={styles.logoIcon}>🏥</span>
                <span className={styles.footerLogoText}>
                  Nigerian Nursing{" "}
                  <span className={styles.logoHighlight}>Success</span>
                </span>
              </div>
              <p className={styles.footerDescription}>
                Empowering the next generation of Nigerian nurses with
                comprehensive exam preparation resources and community support.
              </p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink} aria-label="Facebook">
                  📘
                </a>
                <a href="#" className={styles.socialLink} aria-label="Twitter">
                  🐦
                </a>
                <a
                  href="#"
                  className={styles.socialLink}
                  aria-label="Instagram"
                >
                  📷
                </a>
                <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                  💼
                </a>
              </div>
            </div>

            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4 className={styles.footerTitle}>Platform</h4>
                <ul className={styles.footerList}>
                  <li>
                    <a href="#features" className={styles.footerLink}>
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#exams" className={styles.footerLink}>
                      Exam Prep
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className={styles.footerLink}>
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#testimonials" className={styles.footerLink}>
                      Success Stories
                    </a>
                  </li>
                </ul>
              </div>

              <div className={styles.footerColumn}>
                <h4 className={styles.footerTitle}>Resources</h4>
                <ul className={styles.footerList}>
                  <li>
                    <a href="#" className={styles.footerLink}>
                      Study Guides
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.footerLink}>
                      Practice Tests
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.footerLink}>
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.footerLink}>
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              <div className={styles.footerColumn}>
                <h4 className={styles.footerTitle}>Support</h4>
                <ul className={styles.footerList}>
                  <li>
                    <a href="#" className={styles.footerLink}>
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.footerLink}>
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.footerLink}>
                      Live Chat
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.footerLink}>
                      System Status
                    </a>
                  </li>
                </ul>
              </div>

              <div className={styles.footerColumn}>
                <h4 className={styles.footerTitle}>Legal</h4>
                <ul className={styles.footerList}>
                  <li>
                    <a href="#" className={styles.footerLink}>
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.footerLink}>
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.footerLink}>
                      Cookie Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className={styles.footerLink}>
                      Data Protection
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div> */}

          {/* Newsletter */}
          <div className={styles.newsletter}>
            <div className={styles.newsletterContent}>
              <h4 className={styles.newsletterTitle}>Stay Updated</h4>
              <p className={styles.newsletterText}>
                Get the latest nursing exam tips and platform updates
              </p>
            </div>
            <div className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Enter your email"
                className={styles.newsletterInput}
              />
              <button className={styles.newsletterButton}>Subscribe</button>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className={styles.footerBottom}>
            <div className={styles.footerCopyright}>
              <p>&copy; 2024 Nigerian Nursing Success. All rights reserved.</p>
            </div>
            <div className={styles.footerBadges}>
              <div className={styles.badge}>🇳🇬 Proudly Nigerian</div>
              <div className={styles.badge}>🔒 Secure Platform</div>
              <div className={styles.badge}>⭐ 4.9/5 Rating</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
