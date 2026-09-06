import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const EMPTY_FEATURE_COLLECTION = { type: "FeatureCollection", features: [] };

// The map layer endpoints answer "nothing matched the given criteria" with a 404
// and an error body rather than an empty FeatureCollection (api_map_data.py:214,
// :321, :441 and :626), so an over-narrow filter would otherwise surface as a
// query error and burn React Query's three retries. Treat that one case as an
// empty result and let the page show its own notice; every other status still
// throws, so real failures stay visible.
const emptyOn404 = (error) => {
  if (error?.response?.status === 404) return EMPTY_FEATURE_COLLECTION;
  throw error;
};

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

export const getGeoCorridors = async (scenario_name, aoj_region, feeder_id, aoj_code, frequency, calibration_status) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  try {
    const response = await axios.post(
      `${API_URL}/get_geo_corridors`,
      {
        scenario_name: scenario_name,
        aoj_region: aoj_region,
        feeder_id: feeder_ids,
        aoj_code: aoj_code,
        frequency: frequency,
        calibration_status: calibration_status
      },
      { timeout: 15000 }
    );
    return response.data; // Return the data received from the API
  } catch (error) {
    return emptyOn404(error);
  }
};

export const getGeoCorridorsDiscovery = async (scenario_name, aoj_region, feeder_id, aoj_code) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  try {
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
  } catch (error) {
    return emptyOn404(error);
  }
};

export const getGeoDevices = async (aoj_region, feeder_id, aoj_code, frequency) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  try {
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
  } catch (error) {
    return emptyOn404(error);
  }
};

export const getGeoSub = async (feeder_id, aoj_code, frequency) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  try {
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
  } catch (error) {
    return emptyOn404(error);
  }
};

/**
 * Totals for the summary cards on the map pages.
 * @param {string} scenario_name
 * @param {string} aoj_region - required; the cards stay blank without it
 * @param {string} aoj_code - optional narrowing
 * @param {Array|string} feeder_id - optional narrowing
 */
export const getCorridorSummary = async (
  scenario_name,
  aoj_region,
  aoj_code,
  feeder_id
) => {
  const response = await axios.post(
    `${API_URL}/get_corridor_summary`,
    { scenario_name, aoj_region, aoj_code, feeder_id },
    { timeout: 30000 }
  );
  return response.data;
};
