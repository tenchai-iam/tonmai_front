import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./Home";
import UploadHQ from "./ComponentsPage/UploadHQ.js";
import UploadDistrict from "./ComponentsPage/UploadDistrict.js";
import Admin from "./ComponentsPage/Admin.js";

import ProtectedRoute from "./services/ProtectedRoute.js";
import { AuthProvider } from "./services/AuthContext.js"; // Ensure correct import
import Callback from "./services/Callback.js";

import "./styles.css";

// Component to handle external redirection in a new tab
const ExternalRedirect = ({ url }) => {
  useEffect(() => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, [url]);

  return null; // Avoid unnecessary navigation
};

export default function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Home page route */}
              {/* <Route path="/" element={<Home />} /> */}
              <Route path="/" element={<ProtectedRoute element={Home} />} />

              {/* Dashboard routes */}
              <Route
                path="/transformerHQ"
                element={
                  <ProtectedRoute externalUrl="https://powerbi-report.pea.co.th/reports/powerbi/HQ/%E0%B8%A8%E0%B8%9B%E0%B8%9E./20250213_PEA_AM_vTransformerHQ?rs:embed=true" />
                }
                allowedLevels={["B", "C"]}
              />
              <Route
                path="/circuitBreakerHQ"
                element={
                  <ProtectedRoute externalUrl="https://powerbi-report.pea.co.th/reports/powerbi/HQ/%E0%B8%A8%E0%B8%9B%E0%B8%9E./20250213_PEA_AM_vCBHQ?rs:embed=true" />
                }
                allowedLevels={["B", "C"]}
              />
              <Route
                path="/transformerDistrict"
                element={
                  <ProtectedRoute externalUrl="https://powerbi-report.pea.co.th/reports/powerbi/HQ/%E0%B8%A8%E0%B8%9B%E0%B8%9E./20250223_PEA_AM_vTransformerDistrict?rs:embed=true" />
                }
              />
              <Route
                path="/circuitBreakerDistrict"
                element={
                  <ProtectedRoute externalUrl="https://powerbi-report.pea.co.th/reports/powerbi/HQ/%E0%B8%A8%E0%B8%9B%E0%B8%9E./20250220_PEA_AM_vCBDistrict?rs:embed=true" />
                }
              />

              {/* Upload routes */}
              {/* <Route path="/uploadHQ" element={<UploadHQ />} /> */}
              <Route
                path="/uploadHQ"
                element={
                  <ProtectedRoute
                    element={UploadHQ}
                    allowedLevels={["B", "C"]}
                  />
                }
              />
              {/* <Route path="/uploadDistrict" element={<UploadDistrict />} /> */}
              <Route
                path="/uploadDistrict"
                element={<ProtectedRoute element={UploadDistrict} />}
              />
              {/* <Route path="/admin" element={<Admin />} /> */}
              <Route
                path="/admin"
                element={<ProtectedRoute element={Admin} />}
              />
              <Route path="/callback" element={<Callback />} />

              {/* Redirect undefined routes to Home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
