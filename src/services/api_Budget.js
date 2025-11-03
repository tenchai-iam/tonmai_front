import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getRegionBudgetGraph = async (scenario_name, region) => {
  const body = { scenario_name, region };
  const response = await axios.post(
    `${API_URL}/region_budget_graph`,
    body,
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getAojBudgetTable = async (scenario_name, region) => {
  const body = { scenario_name, region };
  const response = await axios.post(
    `${API_URL}/aoj_budget_table`,
    body,
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};