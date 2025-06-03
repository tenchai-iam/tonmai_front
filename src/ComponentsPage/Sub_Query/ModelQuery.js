import { useQuery } from "@tanstack/react-query";

import { getFeatures } from "../../services/api_Model";

export const useFeatures = () => {
  return useQuery({
    queryKey: ["features"],
    queryFn: () => getFeatures(),
  });
};