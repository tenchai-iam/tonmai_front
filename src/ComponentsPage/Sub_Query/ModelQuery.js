import { useQuery } from "@tanstack/react-query";

import { getFeatures, getAUC, getROC, getOptimizationMetrics } from "../../services/api_Model";

export const useFeatures = () => {
  return useQuery({
    queryKey: ["features"],
    queryFn: () => getFeatures(),
  });
};

export const useAUC = () => {
  return useQuery({
    queryKey: ["aucScore"],
    queryFn: () => getAUC(),
  });
};

export const useROC = () => {
  return useQuery({
    queryKey: ["rocCurve"],
    queryFn: () => getROC(),
  });
};

export const useOptimizationMetrics = () => {
  return useQuery({
    queryKey: ["optimizationMetrics"],
    queryFn: () => getOptimizationMetrics(),
  });
};
