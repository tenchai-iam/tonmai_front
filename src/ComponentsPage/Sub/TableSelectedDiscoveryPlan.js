import React, { useState } from "react";

import "../../ComponentsStyles/table.css";

const SelectedDiscoveryPlanTable = ({ data }) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderEditableStatus = (editable) => {
    const isEditable = editable === true || editable === 1 || editable === "true";
    return (
      <span style={{
        fontSize: "20px",
        fontWeight: "bold",
        color: isEditable ? "#28a745" : "#dc3545"
      }}>
        {isEditable ? "✓" : "✗"}
      </span>
    );
  };

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("selectionId")}>
                ID {renderSortArrow("selectionId")}
              </th>
              <th onClick={() => handleSort("scenarioName")}>
                ชื่อแผน {renderSortArrow("scenarioName")}
              </th>
              <th onClick={() => handleSort("selectedYear")}>
                ปี {renderSortArrow("selectedYear")}
              </th>
              <th onClick={() => handleSort("selectedAt")}>
                วันที่เลือก {renderSortArrow("selectedAt")}
              </th>
              <th onClick={() => handleSort("employeeId")}>
                รหัสพนักงาน {renderSortArrow("employeeId")}
              </th>
              <th onClick={() => handleSort("editable")}>
                ระบบปรับปรุง {renderSortArrow("editable")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index}>
                <td>{row.selectionId}</td>
                <td>{row.scenarioName}</td>
                <td>{row.selectedYear}</td>
                <td>{formatDate(row.selectedAt)}</td>
                <td>{row.employeeId}</td>
                <td>{renderEditableStatus(row.editable)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SelectedDiscoveryPlanTable;