import { useQuery } from "@tanstack/react-query";

import { getFeatures, getAUC, getROC} from "../../services/api_Model";

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
