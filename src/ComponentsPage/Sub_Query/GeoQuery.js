import { useQuery } from "@tanstack/react-query";

import {
  getGeoAoj,
  getGeoFeeders,
  getGeoCorridors,
  getGeoCorridorsDiscovery,
  getGeoDevices,
  getGeoSub
} from "../../services/api_Geo.js";

export const useGeoAoj = (aoj_region, aoj_code) => {
  return useQuery({
    queryKey: ["geoAoj", aoj_region, aoj_code],
    queryFn: () => getGeoAoj(aoj_region, aoj_code),
    enabled: Boolean(aoj_region),
  });
};

export const useGeoFeeders = (feeder_id) => {
  return useQuery({
    queryKey: ["geoFeeders", feeder_id],
    queryFn: () => getGeoFeeders(feeder_id),
    enabled: Boolean(feeder_id),
  });
};

export const useGeoCorridors = (scenario_name, aoj_region, feeder_id, aoj_code, frequency) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  return useQuery({
    queryKey: ["geoCorridors", scenario_name, aoj_region, feeder_ids, aoj_code, frequency],
    queryFn: () => getGeoCorridors(scenario_name, aoj_region, feeder_id, aoj_code, frequency),
    enabled: Boolean(aoj_region) && Boolean(aoj_code) && Boolean(scenario_name),
    // staleTime: 5 * 60 * 1000,
    // keepPreviousData: true,
  });
};

export const useGeoCorridorsDiscovery = (scenario_name, aoj_region, feeder_id, aoj_code) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  return useQuery({
    queryKey: ["geoCorridorsDiscovery", scenario_name, aoj_region, feeder_ids, aoj_code],
    queryFn: () => getGeoCorridorsDiscovery(scenario_name, aoj_region, feeder_id, aoj_code),
    enabled: Boolean(aoj_region) && Boolean(aoj_code) && Boolean(scenario_name),
    // staleTime: 5 * 60 * 1000,
    // keepPreviousData: true,
  });
};

export const useGeoDevices = (aoj_region, feeder_id, aoj_code, frequency) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  return useQuery({
    queryKey: ["geoDevices", aoj_region, feeder_ids, aoj_code, frequency],
    queryFn: () => getGeoDevices(aoj_region, feeder_id, aoj_code, frequency),
    enabled: Boolean(aoj_region) && Boolean(feeder_id) &&
             (Array.isArray(feeder_id) ? feeder_id.length > 0 : true),
  });
};

export const useGeoSub = (feeder_id, aoj_code, frequency) => {
  const feeder_ids = Array.isArray(feeder_id) ? feeder_id : [feeder_id];
  return useQuery({
    queryKey: ["geoSub", feeder_ids, aoj_code, frequency],
    queryFn: () => getGeoSub(feeder_id, aoj_code, frequency),
    enabled: Boolean(feeder_id) && 
             (Array.isArray(feeder_id) ? feeder_id.length > 0 : true),
  });
};
