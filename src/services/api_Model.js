import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getFeatures = async () => {
  const response = await axios.get(`${API_URL}/feature_importance`);
  return response.data; // Return the data received from the API
};
