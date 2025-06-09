import { useQuery } from "@tanstack/react-query";

import {
  getBaselineTotal,
  getBaselineDistrict,
  getBaselineTable
} from "../../services/api_Value.js";

export const useBaselineTotal = () => {
  return useQuery({
    queryKey: ["baselineTotal"],
    queryFn: () => getBaselineTotal(),
  });
};

export const useBaselineDistrict = () => {
  return useQuery({
    queryKey: ["baselineDistrict"],
    queryFn: () => getBaselineDistrict(),
  });
};

export const useBaselineTable = (aoj_code) => {
  return useQuery({
    queryKey: ["baselineTable", aoj_code],
    queryFn: () => getBaselineTable(aoj_code),
  });
};
