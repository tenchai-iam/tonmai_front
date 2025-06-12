import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../services/AuthContext";

const login_url = process.env.REACT_APP_LOGIN_URL;

const ProtectedRoute = ({
  element: Component,
  externalUrl,
  allowedLevels = [],
}) => {
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (user && externalUrl) {
      window.open(externalUrl, "_blank", "noopener,noreferrer");
    }
  }, [user, externalUrl]);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    window.location.href = login_url;
    return null;
  }

  if (allowedLevels.length > 0 && !allowedLevels.includes(user.user_level)) {
    return <Navigate to="/" replace />;
  }

  // If externalUrl was provided, navigate back to home immediately
  if (externalUrl) {
    return <Navigate to="/" replace />;
  }

  return <Component />;
};

export default ProtectedRoute;
