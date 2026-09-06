import { useQuery } from "@tanstack/react-query";

import { getUpgradeCorridorList } from "../../services/api_Upgrade.js";
import { getSelfCorridorList } from "../../services/api_Self.js";

// The two durable lists the pipeline reads: VIP corridors it must upgrade and
// SELF corridors it must leave to their owner. Both are keyed by
// (nearest_upstream_device, feeder_id_traced).

export const useUpgradeCorridorList = (region, aoj_code) => {
  return useQuery({
    queryKey: ["upgradeCorridorList", region, aoj_code],
    queryFn: () => getUpgradeCorridorList({ region, aoj_code }),
  });
};

export const useSelfCorridorList = (region, aoj_code) => {
  return useQuery({
    queryKey: ["selfCorridorList", region, aoj_code],
    queryFn: () => getSelfCorridorList({ region, aoj_code }),
  });
};
