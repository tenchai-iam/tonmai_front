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

export const getRegionBudgetSummary = async (budget_year) => {
  const body = budget_year ? { budget_year } : {};
  const response = await axios.post(
    `${API_URL}/region_budget_summary`,
    body,
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getRegionBudgetSummaryTable = async (budget_year) => {
  const body = budget_year ? { budget_year } : {};
  const response = await axios.post(
    `${API_URL}/region_budget_summary_table`,
    body,
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getRegionBudgetTableDownload = async (budget_year) => {
  const params = budget_year ? { budget_year } : {};
  const response = await axios.get(`${API_URL}/region_budget_download`, {
    params,
    responseType: "blob",
    timeout: 10000
  });
  return response.data;
};

export const uploadRegionBudget = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(
    `${API_URL}/region_budget_upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000
    }
  );
  return response.data;
};

/**
 * Select a scenario plan for use (saves to F8_draft_scenario table)
 * @param {Object} payload - Scenario selection data
 * @param {string} payload.employee_id - Employee ID (e.g., "700001")
 * @param {string} payload.scenario_name - Name of the selected scenario
 * @param {number} payload.year - Year for the scenario
 * @returns {Promise<Object>} Selection confirmation
 */
export const selectScenarioD = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/select_scenario_draft`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Select Scenario Draft API Error:", error);
    throw error;
  }
};

/**
 * Get all selected draft scenario from F8_draft_scenario table
 * @returns {Promise<Array>} List of selected scenarios
 */
export const getSelectedScenarioD = async () => {
  try {
    const response = await axios.get(`${API_URL}/get_selected_scenario_draft`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error("Get Selected Draft Scenario API Error:", error);
    throw error;
  }
};

/**
 * Select a scenario plan for use (saves to F8_scenario_selections)
 * @param {Object} payload - Scenario selection data
 * @param {string} payload.employee_id - Employee ID (e.g., "700001")
 * @param {string} payload.scenario_name - Name of the selected scenario
 * @param {number} payload.year - Year for the scenario
 * @returns {Promise<Object>} Selection confirmation
 */
export const selectScenarioF = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/select_scenario_final`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Select Scenario Final API Error:", error);
    throw error;
  }
};

/**
 * Get all selected scenarios from F8_scenario_selections table
 * @returns {Promise<Array>} List of selected scenarios
 */
export const getSelectedScenarioF = async () => {
  try {
    const response = await axios.get(`${API_URL}/get_selected_scenario_final`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.error("Get Selected Final Scenario API Error:", error);
    throw error;
  }
};

export const postEditableTrue = async (year) => {
  const body = year ? { year } : {};
  const response = await axios.post(
    `${API_URL}/enable_scenario_edit`,
    body,
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const postEditableFalse = async (year) => {
  const body = year ? { year } : {};
  const response = await axios.post(
    `${API_URL}/disable_scenario_edit`,
    body,
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const deleteScenario = async (scenario_name) => {
  const body = scenario_name ? { scenario_name } : {};
  const response = await axios.post(
    `${API_URL}/api/delete_scenario_data`,
    body,
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};