import React, { useState } from "react";

import NavbarComponent from "../Sub/NavbarComponent.js";
import BarGraphBudget from "../Sub/BarGraphBudget.js";
import RegionBudgetTable from "../Sub/TableRegionBudget.js";

import {
  useAojOption,
  useBudgetYearOption,
} from "../Sub_Query/OptionQuery.js";

import {
  useRegionBudgetSummary,
  useRegionBudgetTable
} from "../Sub_Query/ManageQuery.js";

const Budget = () => {
  const { data: budgetYearOption } = useBudgetYearOption();

  const [selectedYearRegion, setSelectedYearRegion] = useState("");

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

  // Fetch regional budget graph data from API
  const { data: regionBudgetSummary } = useRegionBudgetSummary(selectedYearRegion);

  const dataRegionalBudgetSummary =
    regionBudgetSummary?.map((item) => ({
      region: item.region,
      baseline: item.baseline_thb /1000000,
      normalizeBaseline: item.normalize_baseline_thb /1000000,
      budget: item.budget_thb /1000000,
      budgetUpgrade: item.budget_upgrade_thb /1000000
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
      <div className="header-container">ตรวจทานงบประมาณ</div>
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
                  <span style={{ color: "#8B4513" }}>⬤ ค่าใช้จ่าย {selectedYearRegion - 1}</span>
                  <span style={{ color: "#4F1C51" }}>⬤ งบประมาณ {selectedYearRegion}</span>
                  <span style={{ color: "#A1D6B2" }}>⬤ งบประมาณ {selectedYearRegion} ปรับปรุง</span>
                </div>
              <BarGraphBudget
                data={dataRegionalBudgetSummary}
                xAxisKey="region"
                height={400}
                layout="horizontal"
                showPercentage={false}
                hideLabels={false}
                yAxisWidth={25}
                valueLabelPosition="top"
                rightMargin={25}
                maxBarSize={30}
                barKeys={[
                  {
                    dataKey: "baseline",
                    fill: "#8B4513",
                    tooltipLabel: `ค่าใช้จ่าย ${selectedYearRegion - 1}`
                  },
                  {
                    dataKey: "budget",
                    fill: "#4F1C51",
                    tooltipLabel: `งบประมาณ ${selectedYearRegion}`
                  },
                  {
                    dataKey: "budgetUpgrade",
                    fill: "#A1D6B2",
                    tooltipLabel: `งบประมาณ ${selectedYearRegion} ปรับปรุง`
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
                  <RegionBudgetTable data={dataRegionalBudgetTable} selectedYear={selectedYearRegion} />
                </div>
            </div>
      </div>
    </div>
  );
};

export default Budget;