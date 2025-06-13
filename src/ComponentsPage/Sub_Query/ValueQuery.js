import { useQuery } from "@tanstack/react-query";

import {
  getBaselineTotal,
  getBaselineDistrict,
  getBaselineTable,
} from "../../services/api_Value.js";

export const useBaselineTotal = (year) => {
  return useQuery({
    queryKey: ["baselineTotal", year],
    queryFn: () => getBaselineTotal(year),
  });
};

export const useBaselineDistrict = (year) => {
  return useQuery({
    queryKey: ["baselineDistrict", year],
    queryFn: () => getBaselineDistrict(year),
  });
};

export const useBaselineTable = (year, aoj_code) => {
  return useQuery({
    queryKey: ["baselineTable", year, aoj_code],
    queryFn: () => getBaselineTable(year, aoj_code),
  });
};
