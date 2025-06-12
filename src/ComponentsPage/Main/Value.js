import React, { useState, useEffect } from "react";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import BarGraphV from "../Sub/BarGraphV.js";
import BudgetTable from "../Sub/TableBudget.js";
import { downloadTable } from "../Sub/DownloadXLSX.js";

import {
  useBaselineTotal,
  useBaselineDistrict,
  useBaselineTable,
} from "../Sub_Query/ValueQuery.js";

import { useDistrictOption, useAojOption } from "../Sub_Query/OptionQuery.js";

import { planDummyOptions, yearDummyOptions } from "../Sub_config/Options.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Value.css";

const Value = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const handleChangeDistrict = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const [selectedAoj, setSelectedAoj] = useState("");

  const handleChangeAoj = (event) => {
    setSelectedAoj(event.target.value);
  };

  const { data: districtOption } = useDistrictOption();

  const { data: aojOption, isLoadingAojOption } =
    useAojOption(selectedDistrict);

  const aojOptionFormatted = aojOption?.map((option) => ({
    value: option.aoj_code,
    label: option.aoj_name,
  }));

  const [selectedYear, setSelectedYear] = useState("");

  const handleYearSelect = (e) => setSelectedYear(e.target.value);

  const { data: baselineTotal } = useBaselineTotal();

  const dataBaselineTotal = [
    {
      base: (baselineTotal?.total_budget_base_thb ?? 0) / 1000000,
      model: (baselineTotal?.total_budget_model_thb ?? 0) / 1000000,
      actual: (baselineTotal?.total_actual_thb ?? 0) / 1000000,
    },
  ];

  const { data: baselineDistrict } = useBaselineDistrict();

  const dataBaselineDistrict =
    baselineDistrict?.map((item) => ({
      name: item.district,
      base: (item.total_budget_base_thb ?? 0) / 1000000,
      model: (item.total_budget_model_thb ?? 0) / 1000000,
      actual: (item.total_actual_thb ?? 0) / 1000000,
    })) || [];

  const barKeys = [
    { dataKey: "base", fill: "#8884d8" },
    { dataKey: "model", fill: "#82ca9d" },
    { dataKey: "actual", fill: "#3e3e3e" },
  ];

  const { data: baselineTable } = useBaselineTable(selectedAoj);

  const dataBaselineTable =
    baselineTable?.map((item) => ({
      district: item.district,
      code: item.aoj_code,
      name: item.aoj_name,
      ba: item.ba,
      budgetBase: Number(item.budget_base_thb ?? 0) / 1000000,
      budgetModel: Number(item.budget_model_thb ?? 0) / 1000000,
      actual: Number(item.actual_thb ?? 0) / 1000000,
    })) || [];

  const handleDataBaselineTable = () => {
    const headers = [
      { label: "เขต", key: "district" },
      { label: "รหัส กฟฟ.", key: "code" },
      { label: "กฟฟ.", key: "name" },
      { label: "ba", key: "ba" },
      { label: "งบประมาณฐาน (ล้านบาท)", key: "budgetBase" },
      { label: "งบประมาณแผน (ล้านบาท)", key: "budgetModel" },
      { label: "ค่าใช้จ่ายจริง (ล้านบาท)", key: "actual" },
    ];

    downloadTable({
      data: dataBaselineTable,
      headers: headers,
      fileName: "Stage5_Value_Data",
      title: `สรุปข้อมูลติดตามมูลค่า ${selectedAoj}`,
      extraInfoRows: [],
    });
  };

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">ติดตามมูลค่า Stage 5</div>
      <div className="main-container">
        <div className="year-select-container">
          <div className="year-container">
            <label>เลือกปีที่จะใช้</label>
            <select
              value={selectedYear}
              onChange={handleYearSelect}
              className="border rounded-lg px-4 py-2"
            >
              <option value=""></option>
              {yearDummyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="summary-container">
          <div className="bar-chart-legend">
            <span style={{ color: "#8884d8" }}>⬤ ค่าใช้จ่าย Base</span>
            <span style={{ color: "#82ca9d" }}>⬤ ค่าใช้จ่ายประเมินจาก AI</span>
            <span style={{ color: "#3e3e3e" }}>⬤ ค่าใช้จ่ายจริง</span>
          </div>
          <div className="all-district-container">
            <div className="all-container">
              <BarGraphV
                data={dataBaselineTotal}
                xAxisKey="name"
                title="ภาพรวมค่าใช้จ่ายในการตัดต้นไม้"
                yLabel="ล้านบาท"
                height={400}
                barKeys={barKeys}
              />
            </div>
            <div className="district-container">
              <BarGraphV
                data={dataBaselineDistrict}
                xAxisKey="name"
                title="ค่าใช้จ่ายในการตัดต้นไม้แยกตามเขต"
                yLabel="ล้านบาท"
                height={400}
                barKeys={barKeys}
              />
            </div>
          </div>
        </div>
        <div className="summary-container">
          <div className="dropdown-download-container">
            <div className="dropdowngroup-container">
              <select
                value={selectedDistrict}
                onChange={handleChangeDistrict}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">เลือกการไฟฟ้าเขต</option>
                {districtOption?.map((option) => (
                  <option key={option.region} value={option.region}>
                    {option.region}
                  </option>
                ))}
              </select>
              <Select
                options={aojOptionFormatted}
                value={aojOptionFormatted?.find(
                  (opt) => opt.value === selectedAoj
                )}
                onChange={(selectedOption) =>
                  setSelectedAoj(selectedOption?.value || "")
                }
                isClearable
                placeholder="ค้นหา/เลือกการไฟฟ้าสาขา"
                noOptionsMessage={() => "ไม่พบข้อมูล"}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            <div className="download-button">
              <button
                onClick={handleDataBaselineTable}
                className={`download-button-style${false ? " selected" : ""}`}
              >
                Download
              </button>
            </div>
          </div>
          <BudgetTable data={dataBaselineTable} />
        </div>
      </div>
    </div>
  );
};

export default Value;
