import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getBaselineTotal = async (year) => {
  const response = await axios.post(
    `${API_URL}/baseline_total`,
    {
      year: year,
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getBaselineDistrict = async (year) => {
  const response = await axios.post(
    `${API_URL}/baseline_district`,
    {
      year: year,
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getValueTable = async (year, district, aoj_code) => {
  const response = await axios.post(
    `${API_URL}/value_table`,
    {
      year: year,
      district: district,
      aoj_code: aoj_code, // Pass the data format value in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};
