import { useQuery } from "@tanstack/react-query";

import { getCorridorPlan } from "../../services/api_Manage.js";

export const useCorridorPlan = (aoj_code) => {
  return useQuery({
    queryKey: ["corridorPlan"],
    queryFn: () => getCorridorPlan(aoj_code),
    enabled: Boolean(aoj_code),
  });
};
