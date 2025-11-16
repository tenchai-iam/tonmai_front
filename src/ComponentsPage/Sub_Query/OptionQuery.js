import { useQuery } from "@tanstack/react-query";

import {
  getDistricts,
  getValueDistricts,
  getAvailableValueYears,
  getScenarios,
  getDraftScenarios,
  getDraftEditableScenarios,
  getAojs,
  getValueAojs,
  getAuthorizedAojs,
  getFeeders,
  getAvailableBudgetYears,
  getCorridors,
  getFrequency
} from "../../services/api_Options";

export const useDistrictOption = () => {
  return useQuery({
    queryKey: ["districtOption"],
    queryFn: () => getDistricts(),
  });
};

export const useValueDistrictOption = () => {
  return useQuery({
    queryKey: ["valueDistrictOption"],
    queryFn: () => getValueDistricts(),
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

export const useAuthorizedAojOption = (pea_code,scenario_name) => {
  return useQuery({
    queryKey: ["authorizedAojOption", pea_code,scenario_name],
    queryFn: () => getAuthorizedAojs(pea_code,scenario_name),
    enabled: Boolean(scenario_name),
  });
};

export const useValueAojOption = (district) => {
  return useQuery({
    queryKey: ["valueAojOption", district],
    queryFn: () => getValueAojs(district),
    enabled: Boolean(district),
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

export const useValueYearOption = () => {
  return useQuery({
    queryKey: ["valueYearOption"],
    queryFn: () => getAvailableValueYears(),
  });
};

export const useCorridorOption = (scenario_name, aoj_code) => {
  return useQuery({
    queryKey: ["corridorOption", scenario_name, aoj_code],
    queryFn: () => getCorridors(scenario_name, aoj_code),
    enabled: Boolean(scenario_name) && Boolean(aoj_code),
  });
};

export const useFrequencyOption = (scenario_name, aoj_code, feeder_id) => {
  return useQuery({
    queryKey: ["frequencyOption", scenario_name, aoj_code, feeder_id],
    queryFn: () => getFrequency(scenario_name, aoj_code, feeder_id),
    enabled: Boolean(scenario_name) && Boolean(aoj_code) && (Array.isArray(feeder_id) ? feeder_id.length > 0 : Boolean(feeder_id)),
  });
};
