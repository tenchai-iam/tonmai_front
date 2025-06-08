import axios from "axios";

// Configuration
const API_URL =
  process.env.REACT_APP_API_BACK_URL || "http://localhost:5000/api";

/**
 * Create and run budget-focused scenario
 * @param {Object} payload - Budget scenario configuration
 * @param {number} payload.year - Analysis year (e.g., 2025)
 * @param {number} payload.budget_reduction_percentage - Budget reduction as percentage (e.g., 12 for 12%)
 * @returns {Promise<Object>} Scenario creation and execution results
 */
export const createBudgetScenario = async (payload) => {
  try {
    const requestPayload = {
      year: payload.year,
      budget_reduction_percentage: payload.budget_reduction_percentage, // Convert to decimal
      risk_reduction_target: null,
    };

    const response = await axios.post(
      `${API_URL}/scenarios/create-and-run`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 300000, // 5 minutes
      }
    );
    return response.data;
  } catch (error) {
    console.error("Budget Scenario API Error:", error);
    throw error;
  }
};

/**
 * Create and run risk-focused scenario
 * @param {Object} payload - Risk scenario configuration
 * @param {number} payload.year - Analysis year (e.g., 2025)
 * @param {number} payload.risk_reduction_target - Risk reduction as percentage (e.g., 25 for 25%)
 * @returns {Promise<Object>} Scenario creation and execution results
 */
export const createRiskScenario = async (payload) => {
  try {
    const requestPayload = {
      year: payload.year,
      budget_reduction_percentage: null,
      risk_reduction_target: payload.risk_reduction_target, // Convert to decimal
    };

    const response = await axios.post(
      `${API_URL}/scenarios/create-and-run`,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 300000, // 5 minutes
      }
    );
    return response.data;
  } catch (error) {
    console.error("Risk Scenario API Error:", error);
    throw error;
  }
};

/**
 * Get list of available scenarios
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} List of scenarios
 */
export const getScenarios = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_URL}/scenarios?${params}`);
    return response.data;
  } catch (error) {
    console.error("Get Scenarios API Error:", error);
    throw error;
  }
};

/**
 * Get scenario details and results
 * @param {string} scenarioId - The scenario ID
 * @returns {Promise<Object>} Scenario details and results
 */
export const getScenarioDetails = async (scenarioId) => {
  try {
    const response = await axios.get(`${API_URL}/scenarios/${scenarioId}`);
    return response.data;
  } catch (error) {
    console.error("Get Scenario Details API Error:", error);
    throw error;
  }
};

/**
 * Check API health status
 * @returns {Promise<Object>} Health status
 */
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${API_URL}/scenarios/health`);
    return response.data;
  } catch (error) {
    console.error("Health Check API Error:", error);
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
export const selectScenarioPlan = async (payload) => {
  try {
    const response = await axios.post(
      `${API_URL}/scenarios/select-plan`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Select Scenario Plan API Error:", error);
    throw error;
  }
};
