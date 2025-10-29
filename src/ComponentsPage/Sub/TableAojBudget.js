import React, { useState } from "react";

import { formatUnit, formatPercent, formatValue } from "../Sub_config/Format.js";

import "../../ComponentsStyles/table.css";

const RegionAojTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const sortedData = [...data].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === "string") {
        return sortConfig.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortConfig.direction === "ascending"
          ? aValue - bValue
          : bValue - aValue;
      }
    }
    return 0;
  });

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const renderSortArrow = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === "ascending" ? "▲" : "▼";
    }
    return "";
  };

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("district")}>
                เขต {renderSortArrow("district")}
              </th>
              <th onClick={() => handleSort("code")}>
                รหัส กฟฟ. {renderSortArrow("code")}
              </th>
              <th onClick={() => handleSort("name")}>
                กฟฟ. {renderSortArrow("name")}
              </th>
              <th onClick={() => handleSort("baselineAdjust")}>
                งบประมาณฐาน (บาท) {renderSortArrow("baselineAdjust")}
              </th>
              <th onClick={() => handleSort("normalizeAdjust")}>
                งบประมาณ Normalize (บาท) {renderSortArrow("normalizeAdjust")}
              </th>
              <th onClick={() => handleSort("budgetAdjust")}>
                งบประมาณ (บาท) {renderSortArrow("budgetAdjust")}
              </th>
              <th onClick={() => handleSort("budgetUpgradeAdjust")}>
                งบประมาณปรับปรุง (บาท) {renderSortArrow("budgetUpgradeAdjust")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index}>
                <td>{row.region}</td>
                <td>{row.code}</td>
                <td>{row.name}</td>
                <td className="number">{formatValue(row.baselineAdjust)}</td>
                <td className="number">{formatValue(row.normalizeAdjust)}</td>
                <td className="number">{formatValue(row.budgetAdjust)}</td>
                <td className="number">{formatValue(row.budgetUpgradeAdjust)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegionAojTable;