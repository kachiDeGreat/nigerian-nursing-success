// import React, { useState } from "react";
import "../styles/Maintenance.css";

export default function Maintenance() {
  //   const [email, setEmail] = useState("");
  //   const [notified, setNotified] = useState(false);

  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();
  //     // Simulate API call
  //     setTimeout(() => setNotified(true), 500);
  //   };

  return (
    <div className="maintenance-page">
      <div className="maintenance-container">
        {/* Main Content Card */}
        <div className="maintenance-card">
          {/* Animated Icon */}
          <div className="icon-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="gear-icon"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>

          <h1 className="m-title">
            We are currently{" "}
            <span className="highlight-red">Under Maintenance</span>
          </h1>

          <p className="m-subtitle">
            We're making some updates to improve your experience. We apologize
            for the inconvenience and appreciate your patience. Check back soon!
          </p>

          {/* Stats Boxes */}
          <div className="m-stats-grid">
            <div className="m-stat-item">
              <div className="m-stat-number">100%</div>
              <div className="m-stat-label">Secure Data</div>
            </div>
            <div className="m-stat-item">
              <div className="m-stat-number">24h</div>
              <div className="m-stat-label">Estimated Time</div>
            </div>
          </div>

          {/* Notify Form */}
          {/* <div className="m-newsletter">
            {!notified ? (
              <>
                <span className="m-form-label">
                  Get notified when we're back
                </span>
                <form className="m-form-group" onSubmit={handleSubmit}>
                  <input
                    type="email"
                    className="m-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="m-btn">
                    Notify Me
                  </button>
                </form>
              </>
            ) : (
              <div className="m-success-box">
                Success! We'll let you know when we are live.
              </div>
            )}
          </div> */}

          {/* Social Links */}
          {/* <div>
            <p className="m-social-label">Follow us for updates</p>
            <div className="m-social-links">
              <a href="#" className="m-social-icon" aria-label="Twitter">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="#" className="m-social-icon" aria-label="Facebook">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="m-social-icon" aria-label="LinkedIn">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div> */}
        </div>

        {/* Footer */}
        <div className="m-footer-copy">
          &copy; {new Date().getFullYear()} Nigerian Nursing Success. All rights
          reserved.
        </div>
      </div>
    </div>
  );
}
