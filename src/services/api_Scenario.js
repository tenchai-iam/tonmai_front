import axios from "axios";

// Configuration
const API_BACK_URL =
  process.env.REACT_APP_API_BACK_URL || "http://localhost:5000/api";

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

    // Include optional fields if provided
    if (payload.description) {
      requestPayload.description = payload.description;
    }
    if (payload.use_regional_optimization !== undefined) {
      requestPayload.use_regional_optimization = payload.use_regional_optimization;
    }
    if (payload.use_regional_budget_table !== undefined) {
      requestPayload.use_regional_budget_table = payload.use_regional_budget_table;
    }
    if (payload.region_col) {
      requestPayload.region_col = payload.region_col;
    }

    const response = await axios.post(
      `${API_BACK_URL}/create-and-run`,
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

    // Include description if provided
    if (payload.description) {
      requestPayload.description = payload.description;
    }

    const response = await axios.post(
      `${API_BACK_URL}/create-and-run`,
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



