import React, { useState } from "react";

import NavbarComponent from "../Sub/NavbarComponent.js";
import BarGraphBudget from "../Sub/BarGraphBudget.js";
import RegionBudgetTable from "../Sub/TableRegionBudget.js";
import FinanceBudgetTable from "../Sub/TableFinanceBudget.js";
import { downloadTable } from "../Sub/DownloadXLSX.js";

import {
  useAojOption,
  useBudgetYearOption,
} from "../Sub_Query/OptionQuery.js";

import {
  useRegionBudgetSummary,
  useRegionBudgetTable
} from "../Sub_Query/ManageQuery.js";

import { 
    useRegionBudgetGraphAdmin,
    useAojBudgetTableAdmin
 } from "../Sub_Query/BudgetQuery.js";

import {
  useDraftScenarioOption
} from "../Sub_Query/OptionQuery.js";

const Budget = () => {
  const { data: budgetYearOption } = useBudgetYearOption();

  const [selectedYearRegion, setSelectedYearRegion] = useState("");

  const { data: scenarioDraftOption } = useDraftScenarioOption();

  const [selectedDraftScenario, setSelectedDraftScenario] = useState("");
  const handleDraftScenarioSelect = (e) => setSelectedDraftScenario(e.target.value);

  const [selectedDistrict, setSelectedDistrict] = useState("");

  const handleDownloadFinanceBudget = () => {
    const headers = [
      { label: "เขต", key: "region" },
      { label: "รหัส กฟฟ.", key: "code" },
      { label: "กฟฟ.", key: "name" },
      { label: "ค่าใช้จ่ายจริง Y-1 (บาท)", key: "baselineAdjust" },
      { label: "งบประมาณแผน (บาท)", key: "budgetAdjust" }
    ];

    const fileName = selectedDraftScenario
      ? `Budget_${selectedDraftScenario}`
      : "Budget";

    const title = selectedDraftScenario
      ? `สรุปงบประมาณ แผน ${selectedDraftScenario}`
      : "สรุปงบประมาณ";

    downloadTable({
      data: dataAojBudgetTable,
      headers: headers,
      fileName: fileName,
      title: title,
      extraInfoRows: []
    });
  };

  // Fetch regional budget graph data from API
  const { data: regionBudgetGraph } = useRegionBudgetGraphAdmin(selectedDraftScenario, selectedDistrict);
  
  const dataRegionalBudgetGraph =
      regionBudgetGraph?.map((item) => ({
        region: item.region,
        baselineAdjust: item.baseline_adjust,
        normalizeAdjust: item.normalize_adjust,
        budgetAdjust: item.budget_adjust,
        budgetUpgradeAdjust: item.budget_upgrade_adjust,
      })) || [];

  const { data: aojBudgetTable } = useAojBudgetTableAdmin(selectedDraftScenario, selectedDistrict);

  const dataAojBudgetTable=
    aojBudgetTable?.map((item) => ({
      region: item.region,
      code: item.aoj_code,
      name: item.aoj_name,
      baselineAdjust: item.baseline_adjust,
      normalizeAdjust: item.normalize_adjust,
      budgetAdjust: item.budget_adjust,
      budgetUpgradeAdjust: item.budget_upgrade_adjust,
    })) || [];

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">ตรวจทานงบประมาณ</div>
      <div className="main-container">
        <div className="summary-container">
          <div className="dropdowngroup-container">
            <select
              value={selectedDraftScenario}
              onChange={handleDraftScenarioSelect}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
              {scenarioDraftOption?.map((option) => (
                <option key={option.scenario_name} value={option.scenario_name}>
                  {option.scenario_name}
                </option>
              ))}
            </select>
          </div>
            <div className="district-budget-graph">
                งบประมาณแยกตามเขต (บาท)
                <div className="bar-chart-legend">
                  <span style={{ color: "#8B4513" }}>⬤ ค่าใช้จ่ายจริง Y-1</span>
                  <span style={{ color: "#4F1C51" }}>⬤ งบประมาณ</span>
                </div>
              <BarGraphBudget
                data={dataRegionalBudgetGraph}
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
                    dataKey: "baselineAdjust",
                    fill: "#8B4513",
                    tooltipLabel: "งบประมาณ Baseline"
                  },
                  {
                    dataKey: "budgetAdjust",
                    fill: "#4F1C51",
                    tooltipLabel: "งบประมาณ"
                  }
                ]}
              />
            </div>
        </div>
            <div className="budget-manage-platform">
                <div className="budget-table">
                  <div className="download-end-button">
                    <button
                      onClick={handleDownloadFinanceBudget}
                      className={`download-button-style${false ? " selected" : ""}`}
                    >
                      Download
                    </button>
                  </div>
                  <FinanceBudgetTable data={dataAojBudgetTable}/>
                </div>
            </div>
      </div>
    </div>
  );
};

export default Budget;