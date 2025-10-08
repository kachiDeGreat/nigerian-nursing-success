import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import "./index.css";
import App from "./App.tsx";
// import FloatingButton from "./components/FloatingButton.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      {/* <FloatingButton /> */}
    </BrowserRouter>
  </StrictMode>
);
