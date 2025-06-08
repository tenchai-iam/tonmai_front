import { useQuery } from "@tanstack/react-query";

import { getCorridorPlan, getPlanSummary } from "../../services/api_Manage.js";

export const useCorridorPlan = (scenario_name, aoj_code) => {
  return useQuery({
    queryKey: ["corridorPlan", scenario_name, aoj_code],
    queryFn: () => getCorridorPlan(scenario_name, aoj_code),
    enabled: Boolean(scenario_name) && Boolean(aoj_code),
  });
};

export const usePlanSummaryQuery = (
  scenario_name,
  region,
  aoj_code,
  feeder_id
) => {
  return useQuery({
    queryKey: ["planSummary", scenario_name, region, aoj_code, feeder_id],
    queryFn: () => getPlanSummary(scenario_name, region, aoj_code, feeder_id),
    enabled: Boolean(scenario_name),
  });
};
