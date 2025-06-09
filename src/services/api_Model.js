import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getFeatures = async () => {
  const response = await axios.get(`${API_URL}/feature_importance`);
  return response.data; // Return the data received from the API
};

export const getAUC = async () => {
  const response = await axios.get(`${API_URL}/auc_score`);
  return response.data; // Return the data received from the API
};

export const getROC = async () => {
  const response = await axios.get(`${API_URL}/roc_curve`);
  return response.data; // Return the data received from the API
};

export const getPlanCorridor = async (aoj_code) => {
  const response = await axios.post(
    `${API_URL}/get_feeder`,
    {
      aoj_code: aoj_code, // Pass the data format value in the request body
    },
    { timeout: 5000 }
  );
  return response.data; // Return the data received from the API
};

export const getUserManual = async () => {
  const response = await axios.get(`${API_URL}/download_user_manual_pdf`);
  return response.data; // Return the data received from the API
};

export const getPlaybook = async () => {
  const response = await axios.get(
    `${API_URL}/download_bussiness_playbook_pdf`
  );
  return response.data; // Return the data received from the API
};
