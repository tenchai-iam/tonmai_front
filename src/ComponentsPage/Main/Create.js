import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import BarGraphBudget from "../Sub/BarGraphBudget.js";
import BarGraphV from "../Sub/BarGraphV.js";
import RegionBudgetTable from "../Sub/TableRegionBudget.js";
import useSessionStorage from "../Sub/UseSessionStorage.js";
import { downloadTable } from "../Sub/DownloadXLSX.js";

import File from "../../pic/File.svg";
import UploadButton from "../../pic/Upload.svg";

import { useOptimizationMetrics } from "../Sub_Query/ModelQuery.js";

import {
  useDistrictOption,
  useScenarioOption,
  useAojOption,
  useBudgetYearOption,
} from "../Sub_Query/OptionQuery.js";

import { useRegionBudgetGraph } from "../Sub_Query/BudgetQuery.js";

import {
  useCorridorPlan,
  usePlanSummaryQuery,
  useRegionBudgetSummary,
  useRegionBudgetTable
} from "../Sub_Query/ManageQuery.js";

import {
  createBudgetScenario,
  createRiskScenario,
  selectScenarioPlan,
} from "../../services/api_Scenario.js";

import { getRegionBudgetTableDownload, uploadRegionBudget } from "../../services/api_Manage.js";

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

  const [selectedYearRegion, setSelectedYearRegion] = useState("");
  const [regionalDescription, setRegionalDescription] = useState("");
  const [isCreatingRegionalScenario, setIsCreatingRegionalScenario] = useState(false);

  // State for file upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const { data: corridorPlan } = useCorridorPlan(
    selectedScenario3,
    selectedAoj
  );

  const dataCorridorPlan =
    corridorPlan?.map((item) => ({
      code: item.aoj_code,
      name: item.aoj_name,
      frequency: item.frequency,
      length: item.corridor_length_km,
      cost: item.cost_to_trim_model,
      customer: item.customers_affected_adjusted,
      feeder: item.feeder_id,
      outage: item.probability_of_outage_bins,
      customerRisk: item.risk_customer_interruptions_bins,
      device: item.nearest_upstream_device,
      density: Number(item.vegetation_density) * 100,
    })) || [];

  const handleDataCorridorPlan = () => {
    const headers = [
      { label: "รหัส", key: "code" },
      { label: "กฟฟ.", key: "name" },
      { label: "feeder", key: "feeder" },
      { label: "ระยะทาง (km)", key: "length" },
      { label: "ความหนาแน่นของต้นไม้", key: "density" },
      { label: "ความถี่ในการตัด", key: "frequency" },
      { label: "อุปกรณ์", key: "device" },
      { label: "ค่าใช้จ่าย (บาท)", key: "cost" },
      { label: "ระดับผลกระทบกับลูกค้า", key: "customer" },
      { label: "ความเสี่ยงไฟดับจากต้นไม้", key: "outage" },
      { label: "ความเสี่ยงกับลูกค้า", key: "customerRisk" },
    ];

    downloadTable({
      data: dataCorridorPlan,
      headers: headers,
      fileName: "Corridor_Data",
      title: `สรุปข้อมูลแผนการตัดต้นไม้ ${selectedScenario1} สำหรับ ${selectedAoj}`,
      extraInfoRows: [],
    });
  };

  const handleDownloadRegionBudget = async () => {
    try {
      const blob = await getRegionBudgetTableDownload(selectedYearRegion);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = selectedYearRegion
        ? `Regional_Budget_${selectedYearRegion}.xlsx`
        : "Regional_Budget.xlsx";
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์");
    }
  };

  // Upload handlers
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadStatus(""); // Clear previous status
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("กรุณาเลือกไฟล์ที่ต้องการอัพโหลด");
      return;
    }

    setIsUploading(true);
    setUploadStatus("");

    try {
      const response = await uploadRegionBudget(selectedFile);
      setUploadStatus(response.message || "อัพโหลดสำเร็จ!");
      setSelectedFile(null); // Clear selected file after successful upload

      // Refetch the table data and graph data
      queryClient.invalidateQueries(["regionBudgetTable"]);
      queryClient.invalidateQueries(["regionBudgetGraph"]);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(
        error.response?.data?.message || "เกิดข้อผิดพลาดในการอัพโหลดไฟล์"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // NEW: Regional optimization submit handler
  const handleRegionSubmit = async () => {
    if (!selectedYearRegion) {
      alert("กรุณาเลือกปีที่จะใช้");
      return;
    }

    setIsCreatingRegionalScenario(true);

    const payload = {
      year: parseInt(selectedYearRegion),
      use_regional_optimization: true,
      use_regional_budget_table: true,
      region_col: "region",
    };

    // Add description if provided
    if (regionalDescription.trim()) {
      payload.description = regionalDescription.trim();
    }

    try {
      const response = await createBudgetScenario(payload); // Using the same API endpoint
      alert(`สร้าง Regional Scenario สำเร็จ! ID: ${response.scenario_id}`);
      console.log("Regional Scenario Response:", response);

      // Reset form
      setSelectedYearRegion("");
      setRegionalDescription("");

      // Optionally refresh scenario options
      // refetchScenarioOption();
    } catch (err) {
      console.error("Regional scenario creation failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างสร้าง Regional Scenario");
    } finally {
      setIsCreatingRegionalScenario(false);
    }
  };

  // const { data: planSummary1 } = usePlanSummaryQuery(selectedScenario1);

  // const dataPlanSummary1 = [
  //   {
  //     // aojCount: Number(planSummary1?.aoj_count || 0), // raw count
  //     cost: Number(planSummary1?.total_cost || 0) / 1_000_000, // in millions
  //     risk: Number(planSummary1?.total_risk || 0), // in millions
  //   },
  // ];

  // const { data: planSummary2 } = usePlanSummaryQuery(selectedScenario2);

  // const dataPlanSummary2 = [
  //   {
  //     // aojCount: Number(planSummary2?.aoj_count || 0), // raw count
  //     cost: Number(planSummary2?.total_cost || 0) / 1_000_000, // in millions
  //     risk: Number(planSummary2?.total_risk || 0), // in millions
  //   },
  // ];

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
  const { data: regionBudgetSummary } = useRegionBudgetSummary(selectedYearRegion);

  const dataRegionalBudgetSummary =
    regionBudgetSummary?.map((item) => ({
      region: item.region,
      baseline: item.baseline_thb,
      normalizeBaseline: item.normalize_baseline_thb,
      budget: item.budget_thb,
      budgetUpgrade: item.budget_upgrade_thb
    })) || [];

  const { data: regionBudgetTable } = useRegionBudgetTable(selectedYearRegion);

  const dataRegionalBudgetTable=
    regionBudgetTable?.map((item) => ({
      region: item.region,
      code: item.aoj_code,
      name: item.aoj_name,
      baseline: item.baseline_thb,
      normalizePercent: item.normalize_percent,
      normalizeBaseline: item.normalize_baseline_thb,
      year: item.budget_year,
      budget: item.budget_thb,
      budgetPercentDiff: item.budget_percent_diff,
      budgetUpgrade: item.budget_upgrade_thb || 0,
    })) || [];

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
                disabled={isCreatingRiskScenario || isCreatingBudgetScenario || isCreatingRegionalScenario}
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
                disabled={isCreatingBudgetScenario || isCreatingRiskScenario || isCreatingRegionalScenario}
              >
                {isCreatingBudgetScenario ? "กำลังสร้าง..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
        <div className="container-title">สร้างแผนโดยกระจายงบประมาณแบบ Regional</div>
        <div className="summary-container">
            <div className="inputgroup-container">
              <div className="input-year">
                <label>เลือกปีงบประมาณ</label>
                <select
                  value={selectedYearRegion}
                  onChange={(e) => setSelectedYearRegion(e.target.value)}
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
            </div>
            <div className="district-budget-graph">
                งบประมาณแยกตามเขต (บาท)
                <div className="bar-chart-legend">
                  <span style={{ color: "#8B4513" }}>⬤ งบประมาณ Baseline</span>
                  <span style={{ color: "#C69530" }}>⬤ งบประมาณ Normalized </span>
                  <span style={{ color: "#4F1C51" }}>⬤ งบประมาณ</span>
                  <span style={{ color: "#A1D6B2" }}>⬤ งบประมาณปรับปรุง</span>
                </div>
              <BarGraphBudget
                data={dataRegionalBudgetSummary}
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
                    dataKey: "baseline",
                    fill: "#8B4513",
                    tooltipLabel: "งบประมาณ Baseline"
                  },
                  {
                    dataKey: "normalizeBaseline",
                    fill: "#C69530",
                    tooltipLabel: "งบประมาณ Normalized"
                  },
                  {
                    dataKey: "budget",
                    fill: "#4F1C51",
                    tooltipLabel: "งบประมาณ"
                  },
                  {
                    dataKey: "budgetUpgrade",
                    fill: "#A1D6B2",
                    tooltipLabel: "งบประมาณปรับปรุง"
                  }
                ]}
              />
            </div>
        </div>
            <div className="budget-manage-platform">
                <div className="budget-table">
                  <div className="download-end-button">
                    <button
                      onClick={handleDownloadRegionBudget}
                      className={`download-button-style${false ? " selected" : ""}`}
                    >
                      Download
                    </button>
                  </div>
                  <RegionBudgetTable data={dataRegionalBudgetTable} />
                </div>
                <div className="upload-create-menu">
                  <div className="upload-menu">
                    <h3 className="text-title">Upload Region Budget</h3>
                    <div className="form-container">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx,.xls"
                        style={{ display: "none" }}
                      />

                      {/* Image for file selection */}
                      <img
                        src={File}
                        alt="Select File"
                        className="file-image"
                        onClick={handleImageClick}
                        style={{ cursor: "pointer" }}
                      />

                      {selectedFile && (
                        <p className="selected-file-name">
                          เลือกไฟล์: {selectedFile.name}
                        </p>
                      )}

                      {/* Image acting as the upload button */}
                      <img
                        src={UploadButton}
                        alt="Upload"
                        className="upload-button-image"
                        onClick={handleUpload}
                        style={{
                          cursor: isUploading ? "not-allowed" : "pointer",
                          opacity: isUploading ? 0.6 : 1,
                        }}
                      />

                      {isUploading && <p className="upload-status">กำลังอัพโหลด...</p>}
                    </div>

                    {uploadStatus && (
                      <p className={`upload-status ${uploadStatus.includes("สำเร็จ") ? "success" : "error"}`}>
                        {uploadStatus}
                      </p>
                    )}
                  </div>
                  <div className="create-menu">
                    สร้างแผนโดยจำกัดงบประมาณตามเขต
                    <div className="inputgroup-container">
                      <div className="input-year">
                        <label>เลือกปีที่จะใช้</label>
                        <select
                          value={selectedYearRegion}
                          onChange={(e) => setSelectedYearRegion(e.target.value)}
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
                        <label>หมายเหตุ</label>
                        <input
                          className="input-value"
                          type="text"
                          placeholder="เพิ่มรายละเอียดหลังชื่อแผน (ไม่เกิน 10 ตัวอักษร)"
                          value={regionalDescription}
                          onChange={(e) => setRegionalDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="confirm-container">
                      <button
                        onClick={handleRegionSubmit}
                        disabled={isCreatingRegionalScenario || isCreatingRiskScenario || isCreatingBudgetScenario}
                      >
                        {isCreatingRegionalScenario ? "กำลังสร้าง..." : "ยืนยัน"}
                      </button>
                    </div>
                  </div>
                </div>
            </div>
      </div>
    </div>
  );
};

export default Create;