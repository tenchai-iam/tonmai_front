import React, { useState } from "react";
import "../ComponentsStyles/table.css";

const TableUser = ({ title, data }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const formatQuantity = (value) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercentage = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

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
      <h2 className="table-title">{title}</h2>
      <div className="tableUser-wrapper">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("employeeId")}>
                รหัสพนักงาน {renderSortArrow("employeeId")}
              </th>
              <th onClick={() => handleSort("name")}>
                ชื่อ-นามสกุล {renderSortArrow("name")}
              </th>
              <th onClick={() => handleSort("department")}>
                สังกัด {renderSortArrow("department")}
              </th>
              <th onClick={() => handleSort("costCenter")}>
                รหัส Cost Center {renderSortArrow("costCenter")}
              </th>
              <th onClick={() => handleSort("level")}>
                User Level {renderSortArrow("level")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index}>
                <td>{row.employeeId}</td>
                <td>{row.name}</td>
                <td>{row.department}</td>
                <td>{row.costCenter}</td>
                <td>{row.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableUser;
