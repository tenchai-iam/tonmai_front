import { useQuery } from "@tanstack/react-query";

import {
  getBaselineTotal,
  getBaselineDistrict,
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
