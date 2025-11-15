import React, { useState } from "react";

import { formatUnit, formatPercent, formatValue } from "../Sub_config/Format.js";

import "../../ComponentsStyles/table.css";

const RegionBudgetTable = ({ data, selectedYear }) => {
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
              <th onClick={() => handleSort("baseline")}>
                ค่าใช้จ่ายจริง {selectedYear - 1} (บาท) {renderSortArrow("baseline")}
              </th>
              <th onClick={() => handleSort("normalizePercent")}>
                Normalize % {renderSortArrow("normalizePercent")}
              </th>
              <th onClick={() => handleSort("normalizeBaseline")}>
                งบประมาณ {selectedYear - 1} Normalize {renderSortArrow("normalizeBaseline")}
              </th>
              <th onClick={() => handleSort("year")}>
                ปี {renderSortArrow("year")}
              </th>
              <th onClick={() => handleSort("budget")}>
                งบประมาณแผน {selectedYear} (บาท) {renderSortArrow("budget")}
              </th>
              <th onClick={() => handleSort("budgetPercentDiff")}>
                % ส่วนต่างจากงบประมาณ {selectedYear - 1} Normalize (บาท) {renderSortArrow("budgetPercentDiff")}
              </th>
              <th onClick={() => handleSort("budget")}>
                งบประมาณ {selectedYear} ปรับปรุง (บาท) {renderSortArrow("budget")}
              </th>
              <th onClick={() => handleSort("scenarioName")}>
                แผน Draft Active {renderSortArrow("scenarioName")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index}>
                <td>{row.region}</td>
                <td>{row.code}</td>
                <td>{row.name}</td>
                <td className="number">{formatValue(row.baseline)}</td>
                <td className="number">{formatPercent(row.normalizePercent)}%</td>
                <td className="number">{formatValue(row.normalizeBaseline)}</td>
                <td>{row.year}</td>
                <td className="number">{formatValue(row.budget)}</td>
                <td className="number">{formatPercent(row.budgetPercentDiff)}%</td>
                <td className="number">{formatValue(row.budgetUpgrade)}</td>
                <td>{row.scenarioName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegionBudgetTable;