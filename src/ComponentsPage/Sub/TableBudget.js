import React, { useState } from "react";

import { formatUnit, formatValue } from "../Sub_config/Format.js";

import "../../ComponentsStyles/table.css";

const BudgetTable = ({ data }) => {
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
              <th onClick={() => handleSort("ba")}>
                ba {renderSortArrow("ba")}
              </th>
              <th onClick={() => handleSort("budgetBase")}>
                งบประมาณฐาน (ล้านบาท) {renderSortArrow("budgetBase")}
              </th>
              <th onClick={() => handleSort("budgetModel")}>
                งบประมาณแผน (ล้านบาท) {renderSortArrow("budgetModel")}
              </th>
              <th onClick={() => handleSort("actual")}>
                ค่าใช้จ่ายจริง (ล้านบาท) {renderSortArrow("actual")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index}>
                <td>{row.district}</td>
                <td>{row.code}</td>
                <td>{row.name}</td>
                <td>{row.ba}</td>
                <td className="number">{formatValue(row.budgetBase)}</td>
                <td className="number">{formatValue(row.budgetModel)}</td>
                <td className="number">{formatValue(row.actual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetTable;
