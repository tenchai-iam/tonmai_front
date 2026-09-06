import React from "react";

import { formatValue, formatUnit } from "../Sub_config/Format.js";

import "../../ComponentsStyles/Dashboard.css";

// Four totals for the corridors currently in view on a map page.
//
// The cards are always on the page; the numbers only appear once a region is
// chosen, because that is the point at which the totals mean something. Budget
// arrives in baht and is shown in millions with three decimals.
const CorridorSummaryCards = ({ summary, hasRegion, isLoading }) => {
  const BLANK = "-";

  const value = (compute) => {
    if (!hasRegion) return BLANK;
    if (isLoading) return "...";
    if (!summary) return BLANK;
    return compute(summary);
  };

  const cards = [
    {
      key: "budget",
      title: "งบประมาณรวม",
      unit: "ล้านบาท",
      value: value((s) => formatValue((s.total_budget_baht || 0) / 1000000)),
    },
    {
      key: "length",
      title: "ระยะทาง Corridor",
      unit: "กิโลเมตร",
      value: value((s) => formatUnit(s.total_length_km || 0)),
    },
    {
      key: "vip",
      title: "VIP Corridor",
      unit: "กิโลเมตร",
      value: value((s) => formatUnit(s.vip_length_km || 0)),
    },
    {
      key: "self",
      title: "SELF Corridor",
      unit: "กิโลเมตร",
      value: value((s) => formatUnit(s.self_length_km || 0)),
    },
  ];

  return (
    <div className="corridor-summary-cards">
      {cards.map((card) => (
        <div key={card.key} className="corridor-summary-card">
          <div className="corridor-summary-title">{card.title}</div>
          <div className="corridor-summary-value">{card.value}</div>
          <div className="corridor-summary-unit">{card.unit}</div>
        </div>
      ))}
    </div>
  );
};

export default CorridorSummaryCards;
