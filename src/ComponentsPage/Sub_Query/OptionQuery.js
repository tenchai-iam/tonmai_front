import { useQuery } from "@tanstack/react-query";

import {
  getDistricts,
  getAuthorizedDistricts,
  getValueDistricts,
  getAvailableValueYears,
  getScenarios,
  getDiscoveryScenarios,
  getDiscoveryEditableScenarios,
  getDraftScenarios,
  getDraftEditableScenarios,
  getAojs,
  getValueAojs,
  getAuthorizedAojs,
  getFeeders,
  getAvailableBudgetYears,
  getCorridors,
  getFrequency,
  getDensitySource
} from "../../services/api_Options";

export const useDistrictOption = (scenario_name) => {
  return useQuery({
    queryKey: ["districtOption", scenario_name],
    queryFn: () => getDistricts(scenario_name),
    enabled: Boolean(scenario_name),
  });
};

export const useAuthorizedDistrictOption = (pea_code,scenario_name) => {
  return useQuery({
    queryKey: ["authorizedDistrictOption", pea_code,scenario_name],
    queryFn: () => getAuthorizedDistricts(pea_code,scenario_name),
    enabled: Boolean(scenario_name),
  });
};

export const useValueDistrictOption = () => {
  return useQuery({
    queryKey: ["valueDistrictOption"],
    queryFn: () => getValueDistricts(),
  });
};

export const useAojOption = (scenario_name, aoj_region) => {
  return useQuery({
    queryKey: ["districtOption", scenario_name, aoj_region],
    queryFn: () => getAojs(scenario_name, aoj_region),
    enabled: Boolean(aoj_region),
  });
};

export const useAuthorizedAojOption = (pea_code,scenario_name,child_district) => {
  return useQuery({
    queryKey: ["authorizedAojOption", pea_code,scenario_name, child_district],
    queryFn: () => getAuthorizedAojs(pea_code,scenario_name, child_district),
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

export const useFeederOption = (scenario_name, aoj_region, aoj_code) => {
  return useQuery({
    queryKey: ["feederOption", scenario_name, aoj_region, aoj_code],
    queryFn: () => getFeeders(scenario_name, aoj_region, aoj_code),
    enabled: Boolean(aoj_region),
  });
};

export const useScenarioOption = () => {
  return useQuery({
    queryKey: ["scenarioOption"],
    queryFn: () => getScenarios(),
  });
};

export const useDiscoveryScenarioOption = () => {
  return useQuery({
    queryKey: ["discoveryScenarioOption"],
    queryFn: () => getDiscoveryScenarios(),
  });
};

export const useDiscoveryEditableScenarioOption = () => {
  return useQuery({
    queryKey: ["discoveryEditableScenarioOption"],
    queryFn: () => getDiscoveryEditableScenarios(),
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

export const useCorridorOption = (scenario_name, aoj_region, aoj_code) => {
  return useQuery({
    queryKey: ["corridorOption", scenario_name, aoj_region, aoj_code],
    queryFn: () => getCorridors(scenario_name, aoj_region, aoj_code),
    enabled: Boolean(scenario_name) && Boolean(aoj_region) && Boolean(aoj_code),
  });
};

export const useFrequencyOption = (scenario_name, aoj_region, aoj_code, feeder_id) => {
  return useQuery({
    queryKey: ["frequencyOption", scenario_name, aoj_region, aoj_code, feeder_id],
    queryFn: () => getFrequency(scenario_name, aoj_region, aoj_code, feeder_id),
    enabled: Boolean(scenario_name) && Boolean(aoj_region) && Boolean(aoj_code) && (Array.isArray(feeder_id) ? feeder_id.length > 0 : Boolean(feeder_id)),
  });
};

export const useDensitySourceOption = (scenario_name, aoj_region, aoj_code, feeder_id) => {
  return useQuery({
    queryKey: ["densitySourceOption", scenario_name, aoj_region, aoj_code, feeder_id],
    queryFn: () => getDensitySource(scenario_name, aoj_region, aoj_code, feeder_id),
    enabled: Boolean(scenario_name) && Boolean(aoj_region) && Boolean(aoj_code) && (Array.isArray(feeder_id) ? feeder_id.length > 0 : Boolean(feeder_id)),
  });
};
