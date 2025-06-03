import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getBaselineTotal = async () => {
  const response = await axios.get(`${API_URL}/baseline_total`);
  return response.data; // Return the data received from the API
};

export const getBaselineDistrict = async () => {
  const response = await axios.get(`${API_URL}/baseline_district`);
  return response.data; // Return the data received from the API
};