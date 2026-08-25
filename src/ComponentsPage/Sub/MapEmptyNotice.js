import React from "react";

import "../../ComponentsStyles/Map.css";

// Shown when the corridor query returned no features, so an over-narrow filter
// reads as an explicit empty result instead of a silently blank map.
const MapEmptyNotice = ({
  show,
  message = "ไม่พบข้อมูล corridor ตามเงื่อนไขที่เลือก กรุณาปรับตัวกรอง",
}) => {
  if (!show) return null;

  return <div className="map-empty-notice">{message}</div>;
};

export default MapEmptyNotice;
