import React, { useState } from "react";

import {
  formatUnit,
  formatPercent,
  formatValue,
} from "../Sub_config/Format.js";

import "../../ComponentsStyles/table.css";

const PlanUpgradeTable = ({ data, onUpdate }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedData, setEditedData] = useState({});

  console.log("PlanUpgradeTable received data:", data.length, "rows");

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

  const handleEdit = (row) => {
    // Use unique identifier instead of index
    const rowId = `${row.feeder}-${row.corridor}`;
    setEditingIndex(rowId);
    setEditedData({
      upgrade: row.upgrade,
      reason: row.reason,
    });
  };

  const handleSave = (row) => {
    if (onUpdate) {
      // Pass the row itself instead of index
      onUpdate(row, editedData);
    }
    setEditingIndex(null);
    setEditedData({});
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedData({});
  };

  const handleUpgradeChange = (e) => {
    setEditedData({
      ...editedData,
      upgrade: e.target.checked,
    });
  };

  const handleReasonChange = (e) => {
    setEditedData({
      ...editedData,
      reason: e.target.value,
    });
  };

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("year")}>
                ปีงบประมาณ {renderSortArrow("year")}
              </th>
              <th onClick={() => handleSort("scenarioName")}>
                ชื่อแผน {renderSortArrow("scenarioName")}
              </th>
              <th onClick={() => handleSort("district")}>
                เขต {renderSortArrow("district")}
              </th>
              <th onClick={() => handleSort("code")}>
                รหัส {renderSortArrow("code")}
              </th>
              <th onClick={() => handleSort("name")}>
                กฟฟ. {renderSortArrow("name")}
              </th>
              <th onClick={() => handleSort("feeder")}>
                feeder {renderSortArrow("feeder")}
              </th>
              <th onClick={() => handleSort("corridor")}>
                รหัส Corridor {renderSortArrow("corridor")}
              </th>
              <th onClick={() => handleSort("length")}>
                ระยะทาง (km) {renderSortArrow("length")}
              </th>
              <th onClick={() => handleSort("device")}>
                อุปกรณ์ {renderSortArrow("device")}
              </th>
              <th onClick={() => handleSort("outage")}>
                ความเสี่ยงไฟดับจากต้นไม้ {renderSortArrow("outage")}
              </th>
              <th onClick={() => handleSort("customer")}>
                จำนวนลูกค้าที่ได้รับผลกระทบ {renderSortArrow("customer")}
              </th>
              <th onClick={() => handleSort("frequency")}>
               จำนวนครั้งในการตัด (รายครั้ง) {renderSortArrow("frequency")}
              </th>
              <th onClick={() => handleSort("upgrade")}>
                ระบุ VIP {renderSortArrow("upgrade")}
              </th>
              <th onClick={() => handleSort("reason")}>
                เหตุผล {renderSortArrow("reason")}
              </th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const rowId = `${row.feeder}-${row.corridor}`;
              const isEditing = editingIndex === rowId;
              return (
                <tr key={rowId}>
                  <td>{row.year}</td>
                  <td>{row.scenarioName}</td>
                  <td>{row.district}</td>
                  <td>{row.code}</td>
                  <td>{row.name}</td>
                  <td>{row.feeder}</td>
                  <td>{row.corridor}</td>
                  <td className="number">{formatValue(row.length)}</td>
                  <td>{row.device}</td>
                  <td>{row.outage}</td>
                  <td>{row.customer}</td>
                  <td>{row.frequency}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editedData.upgrade || false}
                        onChange={handleUpgradeChange}
                      />
                    ) : (
                      <span title={`upgrade value: ${row.upgrade}`}>{row.upgrade ? "✓" : "✗"}</span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.reason || ""}
                        onChange={handleReasonChange}
                        style={{ width: "100%" }}
                      />
                    ) : (
                      row.reason
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(row)}
                          style={{ marginRight: "5px" }}
                        >
                          บันทึก
                        </button>
                        <button onClick={handleCancel}>ยกเลิก</button>
                      </>
                    ) : (
                      <button onClick={() => handleEdit(row)}>
                        แก้ไข
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanUpgradeTable;