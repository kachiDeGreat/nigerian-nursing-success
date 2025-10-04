import { Routes, Route } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import Welcome from "../pages/Welcome";
import VerifyEmail from "../pages/VerifyEmail";
import VerifySuccess from "../pages/VerifySuccess";
import ResetPassword from "../pages/ResetPassword";
import ActionHandler from "../pages/ActionHandler";
import ScrollToTop from "../components/ScrollToTop";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/Dashboard";

function Index() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/account" element={<AuthPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-success" element={<VerifySuccess />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/action" element={<ActionHandler />} />

        {/* Protected Routes - Only accessible when logged in */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div>Profile Page - Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/study"
          element={
            <ProtectedRoute>
              <div>Study Page - Protected Content</div>
            </ProtectedRoute>
          }
        /> */}
        {/* Add more protected routes as needed */}
      </Routes>
    </>
  );
}

export default Index;
