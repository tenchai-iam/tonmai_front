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

export const useGeoCorridors = (scenario_name, feeder_id, aoj_code, frequency) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  return useQuery({
    queryKey: ["geoCorridors", scenario_name, feeder_ids, aoj_code, frequency],
    queryFn: () => getGeoCorridors(scenario_name, feeder_id, aoj_code, frequency),
    enabled: Boolean(aoj_code) && Boolean(feeder_id) && Boolean(scenario_name) && 
             (Array.isArray(feeder_id) ? feeder_id.length > 0 : true),
    // staleTime: 5 * 60 * 1000,
    // keepPreviousData: true,
  });
};

export const useGeoDevices = (feeder_id, aoj_code, frequency) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  return useQuery({
    queryKey: ["geoDevices", feeder_ids, aoj_code, frequency],
    queryFn: () => getGeoDevices(feeder_id, aoj_code, frequency),
    enabled: Boolean(aoj_code) && Boolean(feeder_id) && 
             (Array.isArray(feeder_id) ? feeder_id.length > 0 : true),
  });
};
