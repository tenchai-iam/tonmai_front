import React, { useState } from "react";

import {
  formatUnit,
  formatPercent,
  formatValue,
} from "../Sub_config/Format.js";

import { newCorridorColumns } from "../Sub_config/GeoCorridor.js";

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
      selfMaintained: row.selfMaintained,
    });
  };

  const handleSave = (row) => {
    // Validate: if upgrade is checked, reason must be filled in
    if (editedData.upgrade && !editedData.reason?.trim()) {
      alert("กรุณาระบุเหตุผล เมื่อเลือกระบุ VIP");
      return;
    }
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
    const isChecked = e.target.checked;
    setEditedData({
      ...editedData,
      upgrade: isChecked,
      // Clear reason when upgrade is unchecked
      reason: isChecked ? editedData.reason : "",
      // VIP and SELF are mutually exclusive (SELF corridors are not trimmed by PEA)
      selfMaintained: isChecked ? false : editedData.selfMaintained,
    });
  };

  const handleSelfChange = (e) => {
    const isChecked = e.target.checked;
    setEditedData({
      ...editedData,
      selfMaintained: isChecked,
      // VIP and SELF are mutually exclusive: checking SELF clears VIP + its reason
      upgrade: isChecked ? false : editedData.upgrade,
      reason: isChecked ? "" : editedData.reason,
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
              <th onClick={() => handleSort("vip")}>
                Vip {renderSortArrow("vip")}
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
              {newCorridorColumns.map((column) => (
                <th key={column.key} onClick={() => handleSort(column.key)}>
                  {column.label} {renderSortArrow(column.key)}
                </th>
              ))}
              <th onClick={() => handleSort("upgrade")}>
                ระบุ VIP {renderSortArrow("upgrade")}
              </th>
              <th onClick={() => handleSort("reason")}>
                เหตุผล {renderSortArrow("reason")}
              </th>
              <th onClick={() => handleSort("selfMaintained")}>
                ดำเนินการตัดเอง {renderSortArrow("selfMaintained")}
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
                  <td>{row.vip}</td>
                  <td className="number">{formatValue(row.length)}</td>
                  <td>{row.device}</td>
                  <td>{row.outage}</td>
                  <td>{row.customer}</td>
                  <td>{row.frequency}</td>
                  {newCorridorColumns.map((column) => (
                    <td key={column.key}>{row[column.key]}</td>
                  ))}
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
                        disabled={!editedData.upgrade}
                        style={{
                          width: "100%",
                          backgroundColor: editedData.upgrade ? "white" : "#e9ecef",
                          cursor: editedData.upgrade ? "text" : "not-allowed"
                        }}
                        placeholder={editedData.upgrade ? "กรุณาระบุเหตุผล" : ""}
                      />
                    ) : (
                      row.reason
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editedData.selfMaintained || false}
                        onChange={handleSelfChange}
                      />
                    ) : (
                      <span title={`self value: ${row.selfMaintained}`}>{row.selfMaintained ? "✓" : "✗"}</span>
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