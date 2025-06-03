import { useQuery } from "@tanstack/react-query";

import {
  getGeoAoj,
  getGeoFeeders,
  getGeoCorridors,
  getGeoDevices,
} from "../../services/api_Geo.js";

export const useGeoAoj = (aoj_code) => {
  return useQuery({
    queryKey: ["geoAoj", aoj_code],
    queryFn: () => getGeoAoj(aoj_code),
    enabled: Boolean(aoj_code),
  });
};

export const useGeoFeeders = (feeder_id) => {
  return useQuery({
    queryKey: ["geoFeeders", feeder_id],
    queryFn: () => getGeoFeeders(feeder_id),
    enabled: Boolean(feeder_id),
  });
};

export const useGeoCorridors = (feeder_id, aoj_code) => {
  return useQuery({
    queryKey: ["geoCorridors", feeder_id, aoj_code],
    queryFn: () => getGeoCorridors(feeder_id, aoj_code),
    // enabled: Boolean(feeder_id),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useGeoDevices = (feeder_id, aoj_code) => {
  return useQuery({
    queryKey: ["geoDevices", feeder_id, aoj_code],
    queryFn: () => getGeoDevices(feeder_id, aoj_code),
    // enabled: Boolean(feeder_id),
  });
};
