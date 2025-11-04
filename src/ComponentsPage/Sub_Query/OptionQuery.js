import { useQuery } from "@tanstack/react-query";

import {
  getDistricts,
  getScenarios,
  getDraftScenarios,
  getDraftEditableScenarios,
  getAojs,
  getAuthorizedAojs,
  getFeeders,
  getAvailableBudgetYears,
} from "../../services/api_Options";

export const useDistrictOption = () => {
  return useQuery({
    queryKey: ["districtOption"],
    queryFn: () => getDistricts(),
  });
};

export const useScenarioOption = () => {
  return useQuery({
    queryKey: ["scenarioOption"],
    queryFn: () => getScenarios(),
  });
};

export const useDraftScenarioOption = () => {
  return useQuery({
    queryKey: ["draftScenarioOption"],
    queryFn: () => getDraftScenarios(),
  });
};

export const useDraftEditableScenarioOption = () => {
  return useQuery({
    queryKey: ["draftEditableScenarioOption"],
    queryFn: () => getDraftEditableScenarios(),
  });
};

export const useAojOption = (aoj_region) => {
  return useQuery({
    queryKey: ["districtOption", aoj_region],
    queryFn: () => getAojs(aoj_region),
    enabled: Boolean(aoj_region),
  });
};

export const useAuthorizedAojOption = (pea_code) => {
  return useQuery({
    queryKey: ["authorizedAojOption", pea_code],
    queryFn: () => getAuthorizedAojs(pea_code),
    // enabled: Boolean(pea_code),
  });
};

export const useFeederOption = (aoj_code, scenario_name) => {
  return useQuery({
    queryKey: ["feederOption", aoj_code, scenario_name],
    queryFn: () => getFeeders(aoj_code, scenario_name),
    enabled: Boolean(aoj_code),
  });
};

export const useBudgetYearOption = () => {
  return useQuery({
    queryKey: ["budgetYearOption"],
    queryFn: () => getAvailableBudgetYears(),
    select: (data) => {
      return data?.map((item) => ({
        value: item.budget_year,
        label: item.budget_year,
      }));
    },
  });
};
