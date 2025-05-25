import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token"); // Retrieve token

    if (!token) {
      setLoading(false);
      return;
    }

    `${API_URL}/get_hrplatform_data`;

    axios
      .get(`${API_URL}/get_hrplatform_data`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((response) => {
        console.log("User Data from API:", response.data); // Debugging

        if (response.data) {
          const { first_name, last_name, user_level } = response.data;

          // Store user data in sessionStorage
          sessionStorage.setItem("first_name", first_name);
          sessionStorage.setItem("last_name", last_name);
          sessionStorage.setItem("user_level", user_level);

          // Update React state
          setUser(response.data);
        } else {
          console.warn("User data is missing in API response");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
