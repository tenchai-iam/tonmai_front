import { useQuery } from "@tanstack/react-query";

import { getCorridorPlan } from "../../services/api_Manage.js";

export const useCorridorPlan = (scenario_id, aoj_code) => {
  return useQuery({
    queryKey: ["corridorPlan"],
    queryFn: () => getCorridorPlan(scenario_id, aoj_code),
    enabled: Boolean(scenario_id) && Boolean(aoj_code),
  });
};
