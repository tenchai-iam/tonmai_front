import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getDistricts = async () => {
  const response = await axios.get(`${API_URL}/get_district`);
  return response.data; // Return the data received from the API
};

export const getScenarios = async () => {
  const response = await axios.get(`${API_URL}/get_scenario`);
  return response.data; // Return the data received from the API
};

export const getAojs = async (district) => {
  const response = await axios.post(
    `${API_URL}/get_aoj`,
    {
      district: district, // Pass the data format value in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getFeeders = async (aoj_code) => {
  const response = await axios.post(
    `${API_URL}/get_feeder`,
    {
      aoj_code: aoj_code, // Pass the data format value in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};
