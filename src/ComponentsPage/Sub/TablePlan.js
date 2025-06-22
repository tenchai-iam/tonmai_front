import React, { useState } from "react";

import {
  formatUnit,
  formatPercent,
  formatValue,
} from "../Sub_config/Format.js";

import "../../ComponentsStyles/table.css";

const PlanTable = ({ data }) => {
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
              <th onClick={() => handleSort("code")}>
                รหัส {renderSortArrow("code")}
              </th>
              <th onClick={() => handleSort("name")}>
                กฟฟ. {renderSortArrow("name")}
              </th>
              <th onClick={() => handleSort("feeder")}>
                feeder {renderSortArrow("feeder")}
              </th>
              <th onClick={() => handleSort("length")}>
                ระยะทาง (km) {renderSortArrow("length")}
              </th>
              <th onClick={() => handleSort("density")}>
                ความหนาแน่นของต้นไม้ {renderSortArrow("density")}
              </th>
              <th onClick={() => handleSort("frequency")}>
                ความถี่ในการตัด {renderSortArrow("frequency")}
              </th>
              <th onClick={() => handleSort("device")}>
                อุปกรณ์ {renderSortArrow("device")}
              </th>
              <th onClick={() => handleSort("cost")}>
                ค่าใข้จ่าย (บาท) {renderSortArrow("cost")}
              </th>
              <th onClick={() => handleSort("customer")}>
                จำนวนลูกค้าที่ได้รับผลกระทบ {renderSortArrow("customer")}
              </th>

              <th onClick={() => handleSort("outage")}>
                ความเสี่ยงไฟดับจากต้นไม้ {renderSortArrow("outage")}
              </th>
              <th onClick={() => handleSort("customerRisk")}>
                ความเสี่ยงกับลูกค้า {renderSortArrow("customerRisk")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index}>
                <td>{row.code}</td>
                <td>{row.name}</td>
                <td>{row.feeder}</td>
                <td className="number">{formatUnit(row.length)}</td>
                <td>{row.density}</td>
                <td>{row.frequency}</td>
                <td>{row.device}</td>
                <td className="number">{formatValue(row.cost)}</td>
                <td>{row.customer}</td>
                <td>{row.outage}</td>
                <td>{row.customerRisk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanTable;
