import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Callback component mounted");

    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    console.log("Token from URL:", token); // Check if token is being parsed
    console.log("User from URL:", user); // Check if user is being parsed

    if (token && user) {
      // Store token and user info
      sessionStorage.setItem("access_token", token);
      sessionStorage.setItem("user", user);
      console.log("Token and user saved to sessionStorage");

      // Navigate to the home page
      navigate("/");
    } else {
      console.error("Missing token or user in the URL");
      navigate("/api/login"); // Redirect to login if no token
    }
  }, [navigate]);

  return <div>Processing login...</div>;
};

export default Callback;
