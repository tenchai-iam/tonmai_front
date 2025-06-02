import { useQuery } from "@tanstack/react-query";

import {
  getGeoAoj,
  getGeoFeeders,
  getGeoCorridors,
  getGeoDevices,
} from "../../services/api_Geo";

export const useGeoAoj = (name) => {
  return useQuery({
    queryKey: ["geoAoj", name],
    queryFn: () => getGeoAoj(name),
    enabled: Boolean(name),
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
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });
};

export const useGeoDevices = (feeder_id) => {
  return useQuery({
    queryKey: ["geoDevices", feeder_id],
    queryFn: () => getGeoDevices(feeder_id),
    enabled: Boolean(feeder_id),
  });
};
