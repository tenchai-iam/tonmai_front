import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import BarGraphV from "../Sub/BarGraphV.js";
import BarGraphScenario from "../Sub/BarGraphScenario.js";
import TableScenarioAojSummary from "../Sub/TableScenarioAojSummary.js";
import ScenarioNotifications from "../Sub/ScenarioNotifications.js";
import { downloadTable } from "../Sub/DownloadXLSX.js";

import { useOptimizationMetrics } from "../Sub_Query/ModelQuery.js";

import {
  useDistrictOption,
  useScenarioOption,
  useAojOption,
  useBudgetYearOption,
} from "../Sub_Query/OptionQuery.js";

import { useScenarioRegionSummary, useScenarioAojSummary } from "../Sub_Query/BudgetQuery.js";

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

  // Track last scenario creation time for time-based polling
  const [lastScenarioCreationTime, setLastScenarioCreationTime] = useState(null);

  // Callback when polling completes (either by time or dismissal)
  const handlePollingComplete = () => {
    console.log('Polling complete - clearing scenario creation time');
    setLastScenarioCreationTime(null);
  };

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
      async: true, // Enable async execution
    };

    // Add description if provided
    if (budgetDescription.trim()) {
      payload.description = budgetDescription.trim();
    }

    try {
      const response = await createBudgetScenario(payload);
      console.log("Budget Scenario Created:", response);

      // Update last creation time to trigger 15-minute polling
      setLastScenarioCreationTime(Date.now());

      // Show success message
      alert(`เริ่มสร้าง Budget Scenario แล้ว!\nScenario ID: ${response.scenario_id}\n\nจะได้รับการแจ้งเตือนเมื่อเสร็จสมบูรณ์ (ภายใน 15 นาที)`);

      // Reset form
      setSelectedYearBudget("");
      setBudgetReductionPercent("");
      setBudgetDescription("");

      // Refresh scenario options
      queryClient.invalidateQueries(["scenarioOption"]);

    } catch (err) {
      console.error("Budget scenario creation failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างสร้าง Budget Scenario: " + (err.response?.data?.message || err.message));
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
      async: true, // Enable async execution
    };

    // Add description if provided
    if (riskDescription.trim()) {
      payload.description = riskDescription.trim();
    }

    try {
      const response = await createRiskScenario(payload);
      console.log("Risk Scenario Created:", response);

      // Update last creation time to trigger 15-minute polling
      setLastScenarioCreationTime(Date.now());

      // Show success message
      alert(`เริ่มสร้าง Risk Scenario แล้ว!\nScenario ID: ${response.scenario_id}\n\nจะได้รับการแจ้งเตือนเมื่อเสร็จสมบูรณ์ (ภายใน 15 นาที)`);

      // Reset form
      setSelectedYearRisk("");
      setRiskReductionPercent("");
      setRiskDescription("");

      // Refresh scenario options
      queryClient.invalidateQueries(["scenarioOption"]);

    } catch (err) {
      console.error("Risk scenario creation failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างสร้าง Risk Scenario: " + (err.response?.data?.message || err.message));
    } finally {
      setIsCreatingRiskScenario(false);
    }
  };

  const { data: districtOption } = useDistrictOption();

  const [selectedDistrict, setSelectedDistrict] = useState("");

  const handleChangeDistrict = (event) => {
    setSelectedDistrict(event.target.value);
  };

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

  // Fetch regional budget graph data from API
  const { data: scenarioRegionSummary } = useScenarioRegionSummary(selectedScenario1);
  
  const dataScenarioRegionBudgetSummary =
      scenarioRegionSummary?.map((item) => ({
        region: item.aoj_region,
        budgetAdjust: item.budget_adjust
      })) || [];

  const dataScenarioRegionRiskSummary =
      scenarioRegionSummary?.map((item) => ({
        region: item.aoj_region,
        systemRisk: item.system_risk
      })) || [];

  const { data: scenarioAojSummary } = useScenarioAojSummary(selectedScenario1, selectedDistrict);

  const dataScenarioAojSummary =
      scenarioAojSummary?.map((item) => ({
        region: item.aoj_region,
        code: item.aoj_code,
        name: item.aoj_name,
        budgetAdjust: item.budget_adjust,
        systemRisk: item.system_risk
      })) || [];

  const handleDataScenarioAojSummary = () => {
    const headers = [
      { label: "เขต", key: "region" },
      { label: "รหัส กฟส.", key: "code" },
      { label: "กฟส.", key: "name" },
      { label: "งบประมาณ (บาท)", key: "budgetAdjust" },
      { label: "ความเสี่ยงในระบบ", key: "systemRisk" },
    ];

    downloadTable({
      data: dataScenarioAojSummary,
      headers: headers,
      fileName: "Scenario_Aoj_Summary",
      title: `สรุปข้อมูลแผนการตัดต้นไม้ ${selectedScenario1} แยกตามกฟส. ${selectedDistrict}`,
      extraInfoRows: [],
    });
  };

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
            <div className="remark">
              <p>
                Risk = จำนวนลูกค้าคาดการณ์ที่ได้รับผลกระทบจากไฟดับ (ผลรวมของ โอกาสในการเกิดไฟดับ x จำนวนลูกค้า ของแต่ละ Corridor)
              </p>
            </div>
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
            <div className="remark">
              <p>
                Cost = ค่าใช้จ่ายในการตัดต้นไม้ (ผลรวมของ จำนวนครั้ง x ค่าใช้จ่ายต่อครั้งตาม Rate Card x กิโลเมตร ของแต่ละ Corridor)
              </p>
            </div>
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
        <div className="notifications-container">
          {/* Scenario Completion Notifications */}
          <ScenarioNotifications
            pollInterval={5000}
            lastScenarioCreationTime={lastScenarioCreationTime}
            onPollingComplete={handlePollingComplete}
          />
        </div>
        <div className="summary-container">
          <div className="container-title">ข้อมูลสรุปของแผนแยกตามเขต</div>
            <div className="dropdown-dropdown-container">
              <div className="dropdowngroup-container">
                <select
                  value={selectedScenario1}
                  onChange={handleScenario1Select}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
                  {scenarioOption?.map((option) => (
                    <option key={option.scenario_name} value={option.scenario_name}>
                      {option.scenario_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="district-budget-graph">
                งบประมาณแยกตามเขต (บาท)
              <BarGraphScenario
                data={dataScenarioRegionBudgetSummary}
                xAxisKey="region"
                height={400}
                layout="horizontal"
                showPercentage={false}
                hideLabels={false}
                yAxisWidth={60}
                valueLabelPosition="top"
                rightMargin={50}
                maxBarSize={40}
                barKeys={[
                  {
                    dataKey: "budgetAdjust",
                    fill: "#8B4513",
                    tooltipLabel: "งบประมาณ"
                  }
                ]}
              />
            </div>
            <div className="district-budget-graph">
                ความเสี่ยงในระบบแยกตามเขต
              <BarGraphScenario
                data={dataScenarioRegionRiskSummary}
                xAxisKey="region"
                height={400}
                layout="horizontal"
                showPercentage={false}
                hideLabels={false}
                yAxisWidth={60}
                valueLabelPosition="top"
                rightMargin={50}
                maxBarSize={40}
                barKeys={[
                  {
                    dataKey: "systemRisk",
                    fill: "#4F1C51",
                    tooltipLabel: "ความเสี่ยงในระบบ"
                  }
                ]}
              />
            </div>
        </div>
        <div className="summary-container">
          <div className="container-title">งบประมาณและความเสี่ยงในระบบแยกตามกฟส.</div>
          <div className="dropdown-dropdown-container">
            <div className="dropdowngroup-container">
              <select
                value={selectedDistrict}
                onChange={handleChangeDistrict}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">เลือกการไฟฟ้าเขต</option>
                {districtOption?.map((option) => (
                  <option key={option.aoj_region} value={option.aoj_region}>
                    {option.aoj_region}
                  </option>
                ))}
              </select>
            </div>
            <div className="download-end-button">
              <button
                onClick={handleDataScenarioAojSummary}
                className={`download-button-style${false ? " selected" : ""}`}
              >
                Download
              </button>
            </div>
          </div>
                <TableScenarioAojSummary data={dataScenarioAojSummary} />
        </div>
      </div>
    </div>
  );
};

export default Create;