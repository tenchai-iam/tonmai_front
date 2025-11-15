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
 * @param {boolean} payload.async - Run asynchronously (default: true)
 * @returns {Promise<Object>} Scenario creation and execution results
 */
export const createBudgetScenario = async (payload) => {
  try {
    const requestPayload = {
      year: payload.year,
      budget_reduction_percentage: payload.budget_reduction_percentage,
      risk_reduction_target: null,
      async: payload.async !== undefined ? payload.async : true, // Default to async
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
        timeout: requestPayload.async ? 30000 : 300000, // Shorter timeout for async
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
 * @param {boolean} payload.async - Run asynchronously (default: true)
 * @returns {Promise<Object>} Scenario creation and execution results
 */
export const createRiskScenario = async (payload) => {
  try {
    const requestPayload = {
      year: payload.year,
      budget_reduction_percentage: null,
      risk_reduction_target: payload.risk_reduction_target,
      async: payload.async !== undefined ? payload.async : true, // Default to async
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
        timeout: requestPayload.async ? 30000 : 300000, // Shorter timeout for async
      }
    );
    return response.data;
  } catch (error) {
    console.error("Risk Scenario API Error:", error);
    throw error;
  }
};

/**
 * Check scenario execution status
 * @param {string} scenarioName - Scenario name to check status
 * @returns {Promise<Object>} Scenario status information
 */
export const checkScenarioStatus = async (scenarioName) => {
  try {
    const response = await axios.post(
      `${API_BACK_URL}/status`,
      { scenario_name: scenarioName },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds
      }
    );
    return response.data;
  } catch (error) {
    console.error("Scenario Status Check Error:", error);
    throw error;
  }
};

/**
 * Get scenario notifications from webhook system
 * @param {boolean} unreadOnly - Fetch only unread notifications (default: true)
 * @param {number} limit - Number of notifications to fetch (default: 50)
 * @returns {Promise<Object>} Notifications data
 */
export const getScenarioNotifications = async (unreadOnly = true, limit = 50) => {
  try {
    const response = await axios.get(
      `${API_BACK_URL}/webhook/notifications`,
      {
        params: {
          unread_only: unreadOnly,
          limit: limit,
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {number} notificationId - Notification ID to mark as read
 * @returns {Promise<Object>} Response data
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.post(
      `${API_BACK_URL}/webhook/notifications/${notificationId}/mark-read`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    throw error;
  }
};

export const selectScenarioPlan = async (payload) => {
  const response = await axios.post(`${API_URL}/select-scenario-plan`, payload);
  return response.data;
};
