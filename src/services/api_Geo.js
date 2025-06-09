import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getGeoAoj = async (aoj_code) => {
  const response = await axios.post(
    `${API_URL}/get_geo_aoj`,
    {
      aoj_code: aoj_code, // Pass the data format value in the request body
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

export const getGeoCorridors = async (scenario_name, feeder_id, aoj_code) => {
  const response = await axios.post(
    `${API_URL}/get_geo_corridors`,
    {
      scenario_name: scenario_name,
      feeder_id: feeder_id, // Pass the data format value in the request body
      aoj_code: aoj_code,
    },
    { timeout: 15000 }
  );
  return response.data; // Return the data received from the API
};

export const getGeoDevices = async (feeder_id, aoj_code) => {
  const response = await axios.post(
    `${API_URL}/get_geo_device`,
    {
      feeder_id: feeder_id, // Pass the data format value in the request body
      aoj_code: aoj_code,
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};
