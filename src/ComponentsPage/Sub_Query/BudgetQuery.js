import { useQuery } from "@tanstack/react-query";

import { getRegionBudgetGraph, getAojBudgetTable } from "../../services/api_Budget.js";

export const useRegionBudgetGraph = (scenario_name, region) => {
  return useQuery({
    queryKey: ["regionBudgetGraph", scenario_name, region],
    queryFn: () => getRegionBudgetGraph(scenario_name, region),
    enabled: Boolean(scenario_name)
  });
};

export const useAojBudgetTable = (scenario_name, region) => {
  return useQuery({
    queryKey: ["aojBudgetTable", scenario_name, region],
    queryFn: () => getAojBudgetTable(scenario_name, region),
    enabled: Boolean(scenario_name)
  });
};