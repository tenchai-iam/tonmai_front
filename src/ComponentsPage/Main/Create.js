import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import BarGraphV from "../Sub/BarGraphV.js";
import RegionBudgetTable from "../Sub/TableRegionBudget.js";
import useSessionStorage from "../Sub/UseSessionStorage.js";
import { downloadTable } from "../Sub/DownloadXLSX.js";

import { useOptimizationMetrics } from "../Sub_Query/ModelQuery.js";

import {
  useDistrictOption,
  useScenarioOption,
  useAojOption,
  useBudgetYearOption,
} from "../Sub_Query/OptionQuery.js";

import { useRegionBudgetGraph } from "../Sub_Query/BudgetQuery.js";

import {
  createBudgetScenario,
  createRiskScenario,
  selectScenarioPlan,
} from "../../services/api_Scenario.js";

import {
  formatValue,
  formatUnit,
  formatQuantity,
} from "../Sub_config/Format.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Create.css";
import "../../ComponentsStyles/Manage.css";
import "../../ComponentsStyles/upload.css";

const Create = () => {
  const queryClient = useQueryClient();

  const [selectedScenario1, setSelectedScenario1] = useState("");
  const handleScenario1Select = (e) => setSelectedScenario1(e.target.value);

  const [selectedScenario2, setSelectedScenario2] = useState("");
  const handleScenario2Select = (e) => setSelectedScenario2(e.target.value);

  const [selectedScenario3, setSelectedScenario3] = useState("");
  const handleScenario3Select = (e) => setSelectedScenario3(e.target.value);

  const [selectedScenarioF, setSelectedScenarioF] = useState("");
  const handleScenarioFSelect = (e) => setSelectedScenarioF(e.target.value);

  const { data: scenarioOption } = useScenarioOption();
  const { data: budgetYearOption } = useBudgetYearOption();

  // State for scenario creation
  const [selectedYearRisk, setSelectedYearRisk] = useState("");
  const [riskReductionPercent, setRiskReductionPercent] = useState("");
  const [riskDescription, setRiskDescription] = useState("");
  const [isCreatingRiskScenario, setIsCreatingRiskScenario] = useState(false);

  const [selectedYearBudget, setSelectedYearBudget] = useState("");
  const [budgetReductionPercent, setBudgetReductionPercent] = useState("");
  const [budgetDescription, setBudgetDescription] = useState("");
  const [isCreatingBudgetScenario, setIsCreatingBudgetScenario] =
    useState(false);

  // NEW: Budget scenario submit handler
  const handleBudgetSubmit = async () => {
    if (!selectedYearBudget || !budgetReductionPercent) {
      alert("กรุณาเลือกปีและกรอกเปอร์เซ็นต์งบประมาณ");
      return;
    }

    setIsCreatingBudgetScenario(true);

    const payload = {
      year: parseInt(selectedYearBudget),
      budget_reduction_percentage: parseFloat(budgetReductionPercent),
    };

    // Add description if provided
    if (budgetDescription.trim()) {
      payload.description = budgetDescription.trim();
    }

    try {
      const response = await createBudgetScenario(payload);
      alert(`สร้าง Budget Scenario สำเร็จ! ID: ${response.scenario_id}`);
      console.log("Budget Scenario Response:", response);

      // Reset form
      setSelectedYearBudget("");
      setBudgetReductionPercent("");
      setBudgetDescription("");

      // Optionally refresh scenario options
      // refetchScenarioOption();
    } catch (err) {
      console.error("Budget scenario creation failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างสร้าง Budget Scenario");
    } finally {
      setIsCreatingBudgetScenario(false);
    }
  };

  // NEW: Risk scenario submit handler
  const handleRiskSubmit = async () => {
    if (!selectedYearRisk || !riskReductionPercent) {
      alert("กรุณาเลือกปีและกรอกเปอร์เซ็นต์ SAIFI");
      return;
    }

    setIsCreatingRiskScenario(true);

    const payload = {
      year: parseInt(selectedYearRisk),
      risk_reduction_target: parseFloat(riskReductionPercent),
    };

    // Add description if provided
    if (riskDescription.trim()) {
      payload.description = riskDescription.trim();
    }

    try {
      const response = await createRiskScenario(payload);
      alert(`สร้าง Risk Scenario สำเร็จ! ID: ${response.scenario_id}`);
      console.log("Risk Scenario Response:", response);

      // Reset form
      setSelectedYearRisk("");
      setRiskReductionPercent("");
      setRiskDescription("");

      // Optionally refresh scenario options
      // refetchScenarioOption();
    } catch (err) {
      console.error("Risk scenario creation failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างสร้าง Risk Scenario");
    } finally {
      setIsCreatingRiskScenario(false);
    }
  };

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

  // Fetch optimization metrics from API
  const { data: optimizationMetrics } = useOptimizationMetrics();

  const riskMetricsData = optimizationMetrics?.filter(item => item.baseline_risk !== undefined).map(item => ({
    metric: "Risk",
    baseline: item.baseline_risk,
    scenario1: item.scenario1_risk,
    scenario2: item.scenario2_risk
  })) || [{ metric: "Risk", baseline: 0, scenario1: 0, scenario2: 0 }];

  const costMetricsData = optimizationMetrics?.filter(item => item.baseline_cost !== undefined).map(item => ({
    metric: "Cost",
    baseline: item.baseline_cost,
    scenario1: item.scenario1_cost,
    scenario2: item.scenario2_cost
  })) || [{ metric: "Cost", baseline: 0, scenario1: 0, scenario2: 0 }];

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">สร้างแผน</div>
      <div className="main-container">
        <div className="container-title">Model Optimization Metrics</div>
        <div className="metrics-graph-container">
          <div className="district-budget-graph">
            Risk Metrics
            <div className="bar-chart-legend">
              <span style={{ color: "#8B4513" }}>⬤ Baseline</span>
              <span style={{ color: "#C69530" }}>⬤ Maximize reliability (same cost)</span>
              <span style={{ color: "#4F1C51" }}>⬤ Minimize Cost (similar risk)</span>
            </div>
            <BarGraphV
              data={riskMetricsData}
              xAxisKey="metric"
              yLabel="Risk Value"
              height={300}
              showPercentageDiff={true}
              baselineKey="baseline"
              barKeys={[
                { dataKey: "baseline", fill: "#8B4513", tooltipLabel: "Baseline" },
                { dataKey: "scenario1", fill: "#C69530", tooltipLabel: "Maximize reliability (same cost)" },
                { dataKey: "scenario2", fill: "#4F1C51", tooltipLabel: "Minimize Cost (similar risk)" }
              ]}
            />
          </div>
          <div className="district-budget-graph">
            Cost Metrics
            <div className="bar-chart-legend">
              <span style={{ color: "#8B4513" }}>⬤ Baseline</span>
              <span style={{ color: "#C69530" }}>⬤ Maximize reliability (same cost)</span>
              <span style={{ color: "#4F1C51" }}>⬤ Minimize Cost (similar risk)</span>
            </div>
            <BarGraphV
              data={costMetricsData}
              xAxisKey="metric"
              yLabel="Cost Value (THB)"
              height={300}
              showPercentageDiff={true}
              baselineKey="baseline"
              barKeys={[
                { dataKey: "baseline", fill: "#8B4513", tooltipLabel: "Baseline" },
                { dataKey: "scenario1", fill: "#C69530", tooltipLabel: "Maximize reliability (same cost)" },
                { dataKey: "scenario2", fill: "#4F1C51", tooltipLabel: "Minimize Cost (similar risk)" }
              ]}
            />
          </div>
        </div>
        <div className="container-title">สร้างแผนโดยกระจายงบประมาณแบบ Global</div>
        <div className="create-select-plan-container">
          {/* RISK SCENARIO SECTION */}
          <div className="global-scenario-container">
            สร้างแผนโดย Parameter ความเสี่ยง SAIFI
            <div className="inputgroup-container">
              <div className="input-year">
                <label>เลือกปีที่จะใช้</label>
                <select
                  value={selectedYearRisk}
                  onChange={(e) => setSelectedYearRisk(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="" disabled>
                    เลือกปี
                  </option>
                  {budgetYearOption?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-field">
                <label>% SAIFI ที่ต้องการลดจาก Base</label>
                <input
                  className="input-value"
                  type="number"
                  min="10"
                  max="80"
                  step="1"
                  placeholder="เช่น 25"
                  value={riskReductionPercent}
                  onChange={(e) => setRiskReductionPercent(e.target.value)}
                />
              </div>
              <div className="input-field">
                <label>หมายเหตุ</label>
                <input
                  className="input-value"
                  type="text"
                  placeholder="เพิ่มรายละเอียดหลังชื่อแผน (ไม่เกิน 10 ตัวอักษร)"
                  value={riskDescription}
                  onChange={(e) => setRiskDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="confirm-container">
              <button
                onClick={handleRiskSubmit}
                disabled={isCreatingRiskScenario || isCreatingBudgetScenario}
              >
                {isCreatingRiskScenario ? "กำลังสร้าง..." : "ยืนยัน"}
              </button>
            </div>
          </div>

          {/* BUDGET SCENARIO SECTION */}
          <div className="global-scenario-container">
            สร้างแผนโดย Parameter งบประมาณ
            <div className="inputgroup-container">
              <div className="input-year">
                <label>เลือกปีที่จะใช้</label>
                <select
                  value={selectedYearBudget}
                  onChange={(e) => setSelectedYearBudget(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="" disabled>
                    เลือกปี
                  </option>
                  {budgetYearOption?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-field">
                <label>% Budget ที่ต้องการลดจาก Base</label>
                <input
                  className="input-value"
                  type="number"
                  min="5"
                  max="50"
                  step="1"
                  placeholder="เช่น 12"
                  value={budgetReductionPercent}
                  onChange={(e) => setBudgetReductionPercent(e.target.value)}
                />
              </div>
              <div className="input-field">
                <label>หมายเหตุ</label>
                <input
                  className="input-value"
                  type="text"
                  placeholder="เพิ่มรายละเอียดหลังชื่อแผน (ไม่เกิน 10 ตัวอักษร)"
                  value={budgetDescription}
                  onChange={(e) => setBudgetDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="confirm-container">
              <button
                onClick={handleBudgetSubmit}
                disabled={isCreatingBudgetScenario || isCreatingRiskScenario}
              >
                {isCreatingBudgetScenario ? "กำลังสร้าง..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;