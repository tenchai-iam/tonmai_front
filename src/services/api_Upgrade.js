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
