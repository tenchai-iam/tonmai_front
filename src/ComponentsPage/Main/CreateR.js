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

import {
  useDistrictOption,
  useScenarioOption,
  useAojOption,
  useBudgetYearOption,
} from "../Sub_Query/OptionQuery.js";

import { useRegionBudgetGraph } from "../Sub_Query/BudgetQuery.js";

import {
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

const CreateR = () => {
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

  const [selectedYearRegion, setSelectedYearRegion] = useState("");
  const [regionalDescription, setRegionalDescription] = useState("");
  const [isCreatingRegionalScenario, setIsCreatingRegionalScenario] = useState(false);

  // State for file upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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
      scenarioName: item.scenario_name
    })) || [];

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">สร้างแผน Region</div>
      <div className="main-container">
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
                  <div className="remark">
                    <p>
                      หมายเหตุ: งบประมาณ Normalize คือการปรับฐานจากค่าใช้จ่ายจริงจากปัจจัยต่างๆเช่น เงินเฟ้อ ระยะทางที่เพิ่มจากเดิม
                    </p>
                  </div>
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
                        disabled={isCreatingRegionalScenario}
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

export default CreateR;