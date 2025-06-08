import { useQuery } from "@tanstack/react-query";

import { getCorridorPlan } from "../../services/api_Manage.js";

export const useCorridorPlan = (scenario_name, aoj_code) => {
  return useQuery({
    queryKey: ["corridorPlan"],
    queryFn: () => getCorridorPlan(scenario_name, aoj_code),
    enabled: Boolean(scenario_name) && Boolean(aoj_code),
  });
};
