import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./Home";
import Map from "./ComponentsPage/Main/Map.js";
import Run from "./ComponentsPage/Main/Run.js";
import Value from "./ComponentsPage/Main/Value.js";
import Data from "./ComponentsPage/Main/Data.js";
import Admin from "./ComponentsPage/Main/Admin.js";

import ProtectedRoute from "./services/ProtectedRoute.js";
import { AuthProvider } from "./services/AuthContext.js"; // Ensure correct import
import Callback from "./services/Callback.js";

import "./styles.css";

export default function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Home page route */}
              <Route path="/" element={<Home />} />
              {/* <Route path="/" element={<ProtectedRoute element={Home} />} /> */}

              {/* Dashboard routes */}
              <Route path="/map" element={<Map />} />
              {/* <Route
                path="/transformerHQ"
                element={<ProtectedRoute />}
                allowedLevels={["B", "C"]}
              /> */}
              <Route path="/run" element={<Run />} />
              {/* <Route
                path="/circuitBreakerHQ"
                element={<ProtectedRoute />}
                allowedLevels={["B", "C"]}
              /> */}

              <Route path="/value" element={<Value />} />

              <Route path="/data" element={<Data />} />
              {/* <Route path="/transformerDistrict" element={<ProtectedRoute />} />
              <Route
                path="/circuitBreakerDistrict"
                element={<ProtectedRoute />}
              /> */}

              {/* Upload routes */}

              <Route path="/admin" element={<Admin />} />
              {/* <Route
                path="/admin"
                element={<ProtectedRoute element={Admin} />}
              /> */}
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
