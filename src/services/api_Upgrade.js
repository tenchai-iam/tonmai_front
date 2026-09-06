import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Batch update multiple corridors at once
 * @param {Object} payload - Batch update data
 * @param {Array} payload.updates - Array of corridor updates
 * @param {string} payload.updates[].scenario_name - Scenario name
 * @param {string} payload.updates[].feeder_id - Feeder ID
 * @param {string} payload.updates[].nearest_upstream_device - Nearest upstream device
 * @param {number} payload.updates[].upgrade - Upgrade value (0, 1, or 2)
 * @param {string} payload.updates[].reason - Reason for upgrade
 * @returns {Promise<Object>} Batch update confirmation
 */
export const batchUpdateCorridorUpgrade = async (payload) => {
  try {
    const response = await axios.post(
      `${API_URL}/batch_update_corridor_upgrade`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds for batch operations
      }
    );
    return response.data;
  } catch (error) {
    console.error("Batch Update Corridor Upgrade API Error:", error);
    throw error;
  }
};

/**
 * Insert upgrade corridor list
 * @param {Object} payload - Insert data
 * @param {Array} payload.inserts - Array of corridor inserts
 * @param {string} payload.inserts[].nearest_upstream_device - Nearest upstream device
 * @param {string} payload.inserts[].feeder_id_traced - Feeder ID traced
 * @param {string} payload.inserts[].region - Region
 * @param {string} payload.inserts[].aoj_code - AOJ code
 * @param {string} payload.inserts[].aoj_name - AOJ name
 * @param {number} payload.inserts[].frequency_number - Frequency number
 * @param {boolean} payload.inserts[].upgrade - Upgrade flag
 * @param {string} payload.inserts[].reason - Reason for upgrade
 * @param {string} payload.inserts[].employee_id - Employee ID
 * @returns {Promise<Object>} Insert operation result with success status, message, counts, and errors
 */
export const insertUpgradeCorridorList = async (payload) => {
  try {
    const response = await axios.post(
      `${API_URL}/insert_upgrade_corridor_list`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds for batch operations
      }
    );
    return response.data;
  } catch (error) {
    console.error("Insert Upgrade Corridor List API Error:", error);
    throw error;
  }
};

/**
 * Update budget_upgrade_adjust in F8_scenario_aoj_budget by summing from F8_processed_corridor_features
 * @param {Object} payload - Update data
 * @param {string} payload.scenario_name - Scenario name (required)
 * @returns {Promise<Object>} Update operation result
 */
export const updateUpgradeScenarioAojBudget = async (payload) => {
  try {
    const response = await axios.post(
      `${API_URL}/update_upgrade_scenario_aoj_budget`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds for batch operations
      }
    );
    return response.data;
  } catch (error) {
    console.error("Update Upgrade Scenario AOJ Budget API Error:", error);
    throw error;
  }
};

/**
 * Update budget_upgrade_thb in regional_budget by summing budget_upgrade_adjust from F8_processed_corridor_features
 * @param {Object} payload - Update data
 * @param {string} payload.scenario_name - Scenario name (required)
 * @returns {Promise<Object>} Update operation result
 */
export const updateBudgetUpgradeRegionalTable = async (payload) => {
  try {
    const response = await axios.post(
      `${API_URL}/update_budget_upgrade_regional_table`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds for batch operations
      }
    );
    return response.data;
  } catch (error) {
    console.error("Update Budget Upgrade Regional Table API Error:", error);
    throw error;
  }
};

/**
 * Read the VIP (upgrade) corridor list.
 * @param {Object} payload - optional { region, aoj_code } filters
 * @returns {Promise<Array>} rows of F8_upgrade_corridor_list
 */
export const getUpgradeCorridorList = async (payload = {}) => {
  const response = await axios.post(
    `${API_URL}/get_upgrade_corridor_list`,
    payload,
    { headers: { "Content-Type": "application/json" }, timeout: 30000 }
  );
  return response.data;
};
