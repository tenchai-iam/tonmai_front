import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getGeoAoj = async (aoj_region, aoj_code) => {
  const response = await axios.post(
    `${API_URL}/get_geo_aoj`,
    {
      aoj_region: aoj_region,
      aoj_code: aoj_code,
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

export const getGeoCorridors = async (scenario_name, aoj_region, feeder_id, aoj_code, frequency) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  const response = await axios.post(
    `${API_URL}/get_geo_corridors`,
    {
      scenario_name: scenario_name,
      aoj_region: aoj_region,
      feeder_id: feeder_ids,
      aoj_code: aoj_code,
      frequency: frequency
    },
    { timeout: 15000 }
  );
  return response.data; // Return the data received from the API
};

export const getGeoCorridorsDiscovery = async (scenario_name, aoj_region, feeder_id, aoj_code) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  const response = await axios.post(
    `${API_URL}/get_geo_corridors_discovery`,
    {
      scenario_name: scenario_name,
      aoj_region: aoj_region,
      feeder_id: feeder_ids,
      aoj_code: aoj_code
    },
    { timeout: 15000 }
  );
  return response.data; // Return the data received from the API
};

export const getGeoDevices = async (aoj_region, feeder_id, aoj_code, frequency) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  const response = await axios.post(
    `${API_URL}/get_geo_device`,
    {
      aoj_region: aoj_region,
      feeder_id: feeder_ids,
      aoj_code: aoj_code,
      frequency: frequency
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getGeoSub = async (feeder_id, aoj_code, frequency) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  const response = await axios.post(
    `${API_URL}/get_geo_sub`,
    {
      feeder_id: feeder_ids,
      aoj_code: aoj_code,
      frequency: frequency
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};
