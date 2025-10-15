// src/components/UserList.tsx
import React, { useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../styles/UserList.module.css";

interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp | null;
  isActive: boolean;
  paymentStatus: string;
}

const UserList: React.FC = () => {
  const [password, setPassword] = useState("");
  const [showList, setShowList] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const ADMIN_PASSWORD = "123456789012345";

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setShowList(true);
      toast.success("Admin access granted");
      fetchUsers();
    } else {
      toast.error("Incorrect password");
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const usersList: User[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        usersList.push({
          uid: doc.id,
          email: userData.email || "No email",
          displayName: userData.displayName || "No name",
          createdAt: userData.createdAt || null,
          isActive: userData.isActive || false,
          paymentStatus: userData.paymentStatus || "unknown",
        });
      });

      setUsers(usersList);
      toast.success(`Loaded ${usersList.length} users`);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: Timestamp | null): string => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch {
      return "Invalid date";
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Email",
      "Full Name",
      "Account Status",
      "Payment Status",
      "Joined Date",
    ];
    const csvData = filteredUsers.map((user) => [
      user.email,
      user.displayName,
      user.isActive ? "Active" : "Inactive",
      user.paymentStatus,
      formatDate(user.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("CSV exported successfully");
  };

  const copyEmailsToClipboard = () => {
    const emails = filteredUsers.map((user) => user.email).join(", ");
    navigator.clipboard
      .writeText(emails)
      .then(() => {
        toast.success("Emails copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy emails");
      });
  };

  if (!showList) {
    return (
      <div className={styles.container}>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <div className={styles.passwordSection}>
          <h2>User List - Admin Access</h2>
          <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className={styles.passwordInput}
              required
            />
            <button type="submit" className={styles.submitButton}>
              Access User List
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className={styles.userListSection}>
        <div className={styles.header}>
          <h2>User List</h2>
          <div className={styles.controls}>
            <button
              onClick={fetchUsers}
              disabled={isLoading}
              className={styles.refreshButton}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={exportToCSV}
              disabled={users.length === 0}
              className={styles.exportButton}
            >
              Export CSV
            </button>
            <button
              onClick={copyEmailsToClipboard}
              disabled={users.length === 0}
              className={styles.copyButton}
            >
              Copy Emails
            </button>
            <button
              onClick={() => {
                setShowList(false);
                setPassword("");
                toast.info("Returned to login");
              }}
              className={styles.backButton}
            >
              Back to Login
            </button>
          </div>
        </div>

        <div className={styles.searchSection}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email or name..."
            className={styles.searchInput}
          />
          <span className={styles.userCount}>
            Showing {filteredUsers.length} of {users.length} users
          </span>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading users...</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Full Name</th>
                  <th>Account Status</th>
                  <th>Payment Status</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.noData}>
                      {users.length === 0
                        ? "No users found"
                        : "No users match your search"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.uid}>
                      <td className={styles.emailCell}>{user.email}</td>
                      <td>{user.displayName}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            user.isActive ? styles.active : styles.inactive
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.paymentBadge} ${
                            styles[user.paymentStatus] || styles.unknown
                          }`}
                        >
                          {user.paymentStatus}
                        </span>
                      </td>
                      <td className={styles.dateCell}>
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Users:</span>
            <span className={styles.summaryValue}>{users.length}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Active Users:</span>
            <span className={styles.summaryValue}>
              {users.filter((u) => u.isActive).length}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Paid Users:</span>
            <span className={styles.summaryValue}>
              {users.filter((u) => u.paymentStatus === "paid").length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
