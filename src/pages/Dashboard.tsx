// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { doc, onSnapshot } from "firebase/firestore";
import { getUserData, initializeUserData } from "../firebase/firestoreService";
import type { UserData } from "../firebase/firestoreService";
import styles from "../styles/Dashboard.module.css";
import { 
  Settings, Users, ClipboardList, Upload, LogOut, 
  BarChart, FlaskConical, Clock, TrendingUp, BookOpen, CheckCircle 
} from "lucide-react";

// WhatsApp Support Component
const WhatsAppSupport: React.FC = () => {
  const phoneNumber = "2347061110286"; // Replace with your actual WhatsApp number
  const message = "Hello! I need help with Nigerian Nursing Success.";

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(url, "_blank");
  };

  return (
    <button className={styles.whatsappSupport} onClick={handleWhatsAppClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.18-1.24-6.169-3.495-8.428" />
      </svg>
      <span className={styles.whatsappText}>Support</span>
    </button>
  );
};

// Admin Dropdown Component
const AdminDropdown: React.FC<{
  showDropdown: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
}> = ({ showDropdown, onToggle, onNavigate }) => {
  return (
    <div className={styles.adminDropdown}>
      <button className={styles.adminToggle} onClick={onToggle}>
        <span className={styles.adminIcon}><Settings size={16} /></span>
        <span className={styles.adminText}>Admin</span>
        <span className={styles.dropdownArrow}>{showDropdown ? "▲" : "▼"}</span>
      </button>

      {showDropdown && (
        <div className={styles.dropdownMenu}>
          <button
            className={styles.dropdownItem}
            onClick={() => onNavigate("/userlist")}
          >
            <span className={styles.dropdownIcon}><Users size={16} /></span>
            User List
          </button>
          <button
            className={styles.dropdownItem}
            onClick={() => onNavigate("/admin/manage-questions")}
          >
            <span className={styles.dropdownIcon}><ClipboardList size={16} /></span>
            Manage Questions
          </button>
          <button
            className={styles.dropdownItem}
            onClick={() => onNavigate("/admin/upload-questions")}
          >
            <span className={styles.dropdownIcon}><Upload size={16} /></span>
            Upload Questions
          </button>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  // Check if user is admin
  const isAdminUser =
    user?.email === "mail.ricx@gmail.com" ||
    user?.email === "ndukacn@outlook.com";

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          await initializeUserData(currentUser);
          const data = await getUserData(currentUser.uid);
          setUserData(data);
        } catch (error) {
          console.error("Error loading user data:", error);
          toast.error("Failed to load user data");
        }
      }

      setLoading(false);
    });

    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribeFirestore = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as UserData;
          setUserData(data);
        }
      },
      (error) => {
        console.error("Error listening to user data:", error);
      },
    );

    return () => {
      unsubscribeFirestore();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error logging out:", error.message);
        toast.error("Logout failed: " + error.message);
      }
    }
  };

  const getUserInitials = (): string => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const handleAdminNavigate = (path: string) => {
    setShowAdminDropdown(false);
    navigate(path);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  function handlePracticeTests(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    event.preventDefault();
    navigate("/quiz");
  }

  return (
    <div className={styles.dashboard}>
      {/* WhatsApp Support */}
      <WhatsAppSupport />

      {/* Navigation Bar */}
      <nav className={styles.navbar}>
        <div className={styles.navBrand}>
          <h1 className={styles.brandTitle}>Nigerian Nursing Success</h1>
        </div>

        <div className={styles.navUser}>
          {isAdminUser && (
            <AdminDropdown
              showDropdown={showAdminDropdown}
              onToggle={() => setShowAdminDropdown(!showAdminDropdown)}
              onNavigate={handleAdminNavigate}
            />
          )}

          <div className={styles.userProfile}>
            <div className={styles.avatar}>{getUserInitials()}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {user?.displayName || "Nursing Student"}
              </span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </div>

          <button className={styles.logoutButton} onClick={handleLogout}>
            <span className={styles.logoutIcon}><LogOut size={16} /></span>
            <span className={styles.logoutText}>Logout</span>
          </button>
        </div>
      </nav>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, {user?.displayName?.split(" ")[0] || "Student"}! Ready
            to continue your preparation?
          </p>
        </header>

        <div className={styles.content}>
          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><BarChart size={32} /></div>
              <div className={styles.statInfo}>
                <div className={styles.statNumber}>
                  {userData?.loginCount || 1}
                </div>
                <div className={styles.statLabel}>Total Logins</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}><FlaskConical size={32} /></div>
              <div className={styles.statInfo}>
                <div className={styles.statNumber}>
                  {userData?.testsTaken || 0}
                </div>
                <div className={styles.statLabel}>Tests Completed</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}><Clock size={32} /></div>
              <div className={styles.statInfo}>
                <div className={styles.statNumber}>
                  {userData?.totalStudyTime
                    ? `${Math.round(userData.totalStudyTime / 60)}h`
                    : "0h"}
                </div>
                <div className={styles.statLabel}>Study Time</div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}><TrendingUp size={32} /></div>
              <div className={styles.statInfo}>
                <div className={styles.statNumber}>
                  {userData?.averageScore ? `${userData.averageScore}%` : "--%"}
                </div>
                <div className={styles.statLabel}>Average Score</div>
              </div>
            </div>
          </div>

          {/* Account Status Card */}
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <h3 className={styles.statusTitle}>Account Status</h3>
              <span className={`${styles.statusBadge} ${styles.active}`}>
                ACTIVE
              </span>
            </div>

            <div className={styles.statusContent}>
              <div className={styles.activeStatus}>
                <div className={styles.successIcon}><CheckCircle size={24} /></div>
                <div>
                  <h4 className={styles.activeTitle}>Account Activated</h4>
                  <p className={styles.activeText}>
                    Full access to all nursing exam questions and premium
                    features.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><FlaskConical size={32} /></div>
              <h4 className={styles.featureTitle}>Practice Tests</h4>
              <p className={styles.featureText}>
                Access 10,000+ nursing exam questions with timed tests and real
                exam simulation.
              </p>
              <button
                className={styles.featureButton}
                onClick={handlePracticeTests}
              >
                Start Practice Test
              </button>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><BarChart size={32} /></div>
              <h4 className={styles.featureTitle}>Progress Analytics</h4>
              <p className={styles.featureText}>
                Track your performance, identify weak areas, and monitor your
                improvement.
              </p>
              <button
                disabled
                className={`${styles.featureButton} ${styles.disabledButton}`}
              >
                View Progress
                <span className={styles.comingSoonBadge}>Coming Soon</span>
              </button>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}><BookOpen size={32} /></div>
              <h4 className={styles.featureTitle}>Study Materials</h4>
              <p className={styles.featureText}>
                Comprehensive nursing study guides, resources, and reference
                materials.
              </p>
              <button
                disabled
                className={`${styles.featureButton} ${styles.disabledButton}`}
              >
                Browse Materials
                <span className={styles.comingSoonBadge}>Coming Soon</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
