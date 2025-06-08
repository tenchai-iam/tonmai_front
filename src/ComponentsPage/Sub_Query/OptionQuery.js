import { useQuery } from "@tanstack/react-query";

import {
  getDistricts,
  getScenarios,
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

export const useAojOption = (district) => {
  return useQuery({
    queryKey: ["districtOption", district],
    queryFn: () => getAojs(district),
    enabled: Boolean(district),
  });
};

export const useFeederOption = (aoj_code) => {
  return useQuery({
    queryKey: ["feederOption"],
    queryFn: () => getFeeders(aoj_code),
    enabled: Boolean(aoj_code),
  });
};
