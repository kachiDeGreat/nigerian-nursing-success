import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const ActionHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get("mode");
    // 💡 1. Get ALL parameters from the URL, not just oobCode.
    const allParams = new URLSearchParams(searchParams).toString();

    if (!searchParams.get("oobCode")) {
      toast.error("Invalid or missing action link.");
      navigate("/account"); // Redirect to your main auth page
      return;
    }

    // 💡 2. Forward ALL parameters to the correct final page.
    switch (mode) {
      case "verifyEmail":
        navigate(`/verify-email?${allParams}`);
        break;
      case "resetPassword":
        navigate(`/reset-password?${allParams}`);
        break;
      default:
        toast.error("Unknown or unsupported action.");
        navigate("/account");
        break;
    }
  }, [navigate, searchParams]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "1.5rem",
        fontFamily: "sans-serif",
        color: "#333",
      }}
    >
      <div
        style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #3498db",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite",
        }}
      ></div>
      <p style={{ marginTop: "20px" }}>Processing your request...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ActionHandler;
