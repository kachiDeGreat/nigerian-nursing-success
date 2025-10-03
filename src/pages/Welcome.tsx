import React from "react";
import styles from "../styles/Welcome.module.css";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import AboutUs from "../components/AboutUs";
import ExamFeatures from "../components/ExamFeatures";
// import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

const Welcome: React.FC = () => {
  return (
    <div className={styles.welcome}>
      <Navbar />
      <main>
        <Hero />
        <AboutUs />
        <ExamFeatures />
        {/* <HowItWorks /> */}
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Welcome;
