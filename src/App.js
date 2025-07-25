import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./Home";
import MapG from "./ComponentsPage/Main/MapGeneral.js";
import Map from "./ComponentsPage/Main/Map.js";
import Manage from "./ComponentsPage/Main/Manage.js";
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
              {/* <Route path="/" element={<Home />} />
              <Route path="/mapG" element={<MapG />} />
              <Route path="/map" element={<Map />} />
              <Route path="/manage" element={<Manage />} />
              <Route path="/value" element={<Value />} />
              <Route path="/data" element={<Data />} />
              <Route path="/admin" element={<Admin />} />
               */}

              <Route path="/" element={<ProtectedRoute element={Home} />} />
              <Route path="/mapG" element={<ProtectedRoute element={MapG} />} />
              <Route
                path="/Map"
                element={<ProtectedRoute element={Map} />}
                allowedLevels={["B", "C"]}
              />
              <Route
                path="/manage"
                element={<ProtectedRoute element={Manage} />}
                allowedLevels={["B", "C"]}
              />
              <Route
                path="/value"
                element={<ProtectedRoute element={Value} />}
                allowedLevels={["B", "C"]}
              />
              <Route
                path="/data"
                element={<ProtectedRoute element={Data} />}
                allowedLevels={["B", "C"]}
              />
              <Route
                path="/admin"
                element={<ProtectedRoute element={Admin} />}
                allowedLevels={["C"]}
              />

              <Route path="/callback" element={<Callback />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
