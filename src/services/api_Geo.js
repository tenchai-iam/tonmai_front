import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getGeoAoj = async (code) => {
  const response = await axios.post(
    `${API_URL}/get_geo_aoj`,
    {
      code: code, // Pass the data format value in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getGeoFeeders = async (feeder_id) => {
  const response = await axios.post(
    `${API_URL}/get_geo_feeders`,
    {
      feeder_id: feeder_id, // Pass the data format value in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getGeoCorridors = async (feeder_id) => {
  const response = await axios.post(
    `${API_URL}/get_geo_corridors`,
    {
      feeder_id: feeder_id, // Pass the data format value in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};
