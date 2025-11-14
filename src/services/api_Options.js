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

export const getDraftScenarios = async () => {
  const response = await axios.get(`${API_URL}/get_draft_scenarios`);
  return response.data; // Return the data received from the API
};

export const getDraftEditableScenarios = async () => {
  const response = await axios.get(`${API_URL}/get_editable_draft_scenarios`);
  return response.data; // Return the data received from the API
};

export const getAojs = async (aoj_region) => {
  const response = await axios.post(
    `${API_URL}/get_aoj`,
    {
      aoj_region: aoj_region, // Pass the data format value in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getAuthorizedAojs = async (pea_code) => {
  const response = await axios.post(
    `${API_URL}/get_authorized_aoj`,
    {
      pea_code: pea_code, // Pass the data format value in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getFeeders = async (aoj_code, scenario_name) => {
  const response = await axios.post(
    `${API_URL}/get_feeder`,
    {
      aoj_code: aoj_code, // Pass the data format value in the request body
      scenario_name: scenario_name, // Pass the scenario name in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getAvailableBudgetYears = async () => {
  const response = await axios.get(`${API_URL}/get_avail_budget_year`, {
    timeout: 5000
  });
  return response.data; // Return the data received from the API
};

export const getCorridors = async (scenario_name, aoj_code) => {
  const response = await axios.post(
    `${API_URL}/get_corridor`,
    {
      scenario_name: scenario_name, // Pass the data format value in the request body
      aoj_code: aoj_code, // Pass the data format value in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getFrequency = async (scenario_name, aoj_code, feeder_id) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  const response = await axios.post(
    `${API_URL}/get_frequency`,
    {
      scenario_name: scenario_name, // Pass the data format value in the request body
      aoj_code: aoj_code, // Pass the data format value in the request body
      feeder_id: feeder_ids,
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getAvailableValueYears = async () => {
  const response = await axios.get(`${API_URL}/get_avail_value_year`, {
    timeout: 5000
  });
  return response.data; // Return the data received from the API
};