import { useQuery } from "@tanstack/react-query";

import {
  getValueTotal,
  getValueDistrict,
  getValueTable,
} from "../../services/api_Value.js";

export const useValueTotal = (year) => {
  return useQuery({
    queryKey: ["valueTotal", year],
    queryFn: () => getValueTotal(year),
    enabled: Boolean(year)
  });
};

export const useValueDistrict = (year) => {
  return useQuery({
    queryKey: ["valueDistrict", year],
    queryFn: () => getValueDistrict(year),
    enabled: Boolean(year)
  });
};

export const useValueTable = (year, district, aoj_code) => {
  return useQuery({
    queryKey: ["valueTable", year, district, aoj_code],
    queryFn: () => getValueTable(year, district, aoj_code),
    enabled: Boolean(year),
  });
};
