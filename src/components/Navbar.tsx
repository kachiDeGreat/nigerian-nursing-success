import React, { useState } from "react";
import styles from "../styles/Navbar.module.css";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleGetStarted = () => {
    navigate("/account");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🏥</span>
          <span className={styles.logoText}>
            Nigerian Nursing{" "}
            <span className={styles.logoHighlight}>Success</span>
          </span>
        </div>

        {/* Desktop Navigation - 3 Links */}
        <ul className={styles.navLinks}>
          <li>
            <a href="#features" className={styles.navLink}>
              Features
            </a>
          </li>
          <li>
            <a href="#testimonials" className={styles.navLink}>
              Testimonials
            </a>
          </li>
          <li>
            <a href="#about" className={styles.navLink}>
              About
            </a>
          </li>
        </ul>

        {/* Single Get Started Button - Desktop */}
        <div className={styles.authButtons}>
          <button onClick={handleGetStarted} className={styles.getStartedBtn}>
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.menuToggle}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${styles.mobileMenu} ${
          isMenuOpen ? styles.mobileMenuOpen : ""
        }`}
      >
        <ul className={styles.mobileNavLinks}>
          <li>
            <a
              href="#features"
              className={styles.mobileNavLink}
              onClick={toggleMenu}
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#testimonials"
              className={styles.mobileNavLink}
              onClick={toggleMenu}
            >
              Testimonials
            </a>
          </li>
          <li>
            <a
              href="#about"
              className={styles.mobileNavLink}
              onClick={toggleMenu}
            >
              About
            </a>
          </li>
        </ul>
        <div className={styles.mobileAuthButtons}>
          <button
            onClick={handleGetStarted}
            className={styles.mobileGetStartedBtn}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
