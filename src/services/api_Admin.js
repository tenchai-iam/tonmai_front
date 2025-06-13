import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Fetch user data from the API
export const getUsers = async () => {
  const response = await axios.get(`${API_URL}/get_user_level_data`);
  return response.data; // Return the data received from the API
};
