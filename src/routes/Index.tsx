import { Routes, Route } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import Welcome from "../pages/Welcome";
import VerifyEmail from "../pages/VerifyEmail";
import VerifySuccess from "../pages/VerifySuccess";
import ResetPassword from "../pages/ResetPassword";
import ActionHandler from "../pages/ActionHandler";
import ScrollToTop from "../components/ScrollToTop";
function Index() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/account" element={<AuthPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-success" element={<VerifySuccess />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/action" element={<ActionHandler />} />
      </Routes>
    </>
  );
}

export default Index;
