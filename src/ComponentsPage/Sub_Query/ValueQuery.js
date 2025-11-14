import { useQuery } from "@tanstack/react-query";

import {
  getBaselineTotal,
  getBaselineDistrict,
  getValueTable,
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

export const useValueTable = (year, district, aoj_code) => {
  return useQuery({
    queryKey: ["valueTable", year, district, aoj_code],
    queryFn: () => getValueTable(year, district, aoj_code),
  });
};
