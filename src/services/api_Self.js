import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Batch update self_maintained flag on multiple corridors at once.
 * Marking SELF zeroes budget_upgrade_adjust immediately; the corridor becomes
 * frequency T0 (no PEA budget) on the next pipeline run.
 * @param {Object} payload - Batch update data
 * @param {Array} payload.updates - Array of corridor updates
 * @param {string} payload.updates[].scenario_name - Scenario name
 * @param {string} payload.updates[].feeder_id - Feeder ID
 * @param {string} payload.updates[].nearest_upstream_device - Nearest upstream device
 * @param {boolean} payload.updates[].self_maintained - SELF flag
 * @returns {Promise<Object>} Batch update confirmation
 */
export const batchUpdateCorridorSelf = async (payload) => {
  try {
    const response = await axios.post(
      `${API_URL}/batch_update_corridor_self`,
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
    console.error("Batch Update Corridor Self API Error:", error);
    throw error;
  }
};

/**
 * Insert SELF corridor list (durable record read by the optimization pipeline)
 * @param {Object} payload - Insert data
 * @param {Array} payload.inserts - Array of corridor inserts
 * @param {string} payload.inserts[].nearest_upstream_device - Nearest upstream device
 * @param {string} payload.inserts[].feeder_id_traced - Feeder ID traced
 * @param {string} payload.inserts[].region - Region
 * @param {string} payload.inserts[].aoj_code - AOJ code
 * @param {string} payload.inserts[].aoj_name - AOJ name
 * @param {boolean} payload.inserts[].self - SELF flag (true=insert, false=delete)
 * @param {string} payload.inserts[].employee_id - Employee ID
 * @returns {Promise<Object>} Insert operation result
 */
export const insertSelfCorridorList = async (payload) => {
  try {
    const response = await axios.post(
      `${API_URL}/insert_self_corridor_list`,
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
    console.error("Insert Self Corridor List API Error:", error);
    throw error;
  }
};

/**
 * Read the SELF corridor list.
 * @param {Object} payload - optional { region, aoj_code } filters
 * @returns {Promise<Array>} rows of F8_self_corridor_list
 */
export const getSelfCorridorList = async (payload = {}) => {
  const response = await axios.post(
    `${API_URL}/get_self_corridor_list`,
    payload,
    { headers: { "Content-Type": "application/json" }, timeout: 30000 }
  );
  return response.data;
};
