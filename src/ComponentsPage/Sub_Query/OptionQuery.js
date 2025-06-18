import { useQuery } from "@tanstack/react-query";

import {
  getDistricts,
  getScenarios,
  getSelectedScenarios,
  getAojs,
  getFeeders,
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

export const useSelectedScenarioOption = () => {
  return useQuery({
    queryKey: ["selectedScenarioOption"],
    queryFn: () => getSelectedScenarios(),
  });
};

export const useAojOption = (aoj_region) => {
  return useQuery({
    queryKey: ["districtOption", aoj_region],
    queryFn: () => getAojs(aoj_region),
    enabled: Boolean(aoj_region),
  });
};

export const useFeederOption = (aoj_code) => {
  return useQuery({
    queryKey: ["feederOption"],
    queryFn: () => getFeeders(aoj_code),
    enabled: Boolean(aoj_code),
  });
};
