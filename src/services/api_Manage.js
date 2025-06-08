import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getCorridorPlan = async (scenario_name, aoj_code) => {
  const response = await axios.post(
    `${API_URL}/corridor_table`,
    {
      scenario_name: scenario_name,
      aoj_code: aoj_code, // Pass the data format value in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getPlanSummary = async (
  scenario_name,
  region,
  aoj_code,
  feeder_id
) => {
  const response = await axios.post(
    `${API_URL}/scenario_summary`,
    {
      scenario_name: scenario_name, // Pass the data format value in the request body
      region: region,
      aoj_code: aoj_code,
      feeder_id: feeder_id, // Pass the data format value in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};
