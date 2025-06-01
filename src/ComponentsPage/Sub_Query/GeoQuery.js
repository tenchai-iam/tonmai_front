import { useQuery } from "@tanstack/react-query";

import { getGeoAoj, getGeoFeeders, getGeoCorridors } from "../../services/api_Geo";

export const useGeoAoj = (code) => {
  return useQuery({
    queryKey: ["geoAoj", code],
    queryFn: () => getGeoAoj(code),
    enabled: Boolean(code),
  });
};

export const useGeoFeeders = (feeder_id) => {
  return useQuery({
    queryKey: ["geoFeeders", feeder_id],
    queryFn: () => getGeoFeeders(feeder_id),
    enabled: Boolean(feeder_id),
  });
};

export const useGeoCorridors = (feeder_id) => {
  return useQuery({
    queryKey: ["geoCorridors", feeder_id],
    queryFn: () => getGeoCorridors(feeder_id),
    enabled: Boolean(feeder_id),
  });
};
