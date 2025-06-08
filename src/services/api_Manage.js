import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getCorridorPlan = async (scenario_id, aoj_code) => {
  const response = await axios.post(
    `${API_URL}/corridor_table`,
    {
      scenario_id: scenario_id,
      aoj_code: aoj_code, // Pass the data format value in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};
