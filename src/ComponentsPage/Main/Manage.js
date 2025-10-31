import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import PlanTable from "../Sub/TablePlan.js";
import SelectedPlanTable from "../Sub/TableSelectedPlan.js";
import { downloadTable } from "../Sub/DownloadXLSX.js";

import {
  useDistrictOption,
  useScenarioOption,
  useAojOption,
  useBudgetYearOption,
} from "../Sub_Query/OptionQuery.js";

import {
  useCorridorPlan,
  usePlanSummaryQuery,
  useSelectedScenarioF,
} from "../Sub_Query/ManageQuery.js";

import {
  selectScenarioF,
} from "../../services/api_Scenario.js";

import {
  formatValue,
  formatUnit,
  formatQuantity,
} from "../Sub_config/Format.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Manage.css";

const Manage = () => {
  const queryClient = useQueryClient();

  const [selectedScenarioD, setSelectedScenarioD] = useState("");
  const handleScenarioDSelect = (e) => setSelectedScenarioD(e.target.value);

  const [selectedScenarioF, setSelectedScenarioF] = useState("");
  const handleScenarioFSelect = (e) => setSelectedScenarioF(e.target.value);

  const { data: budgetYearOption } = useBudgetYearOption();
  const { data: scenarioOption } = useScenarioOption();

  // Plan selection state
  const [selectedYearF, setSelectedYearF] = useState("");
  const handleYearFSelect = (e) => setSelectedYearF(e.target.value);

  const [SelectingScenarioF, setIsSelectingScenarioF] = useState(false);

  // Updated: Plan selection submit handler
  const handleScenarioFSubmit = async () => {
    if (!selectedYearF || !selectedScenarioF) {
      alert("กรุณาเลือกปีและ Scenario");
      return;
    }
    setIsSelectingScenarioF(true);

    // Convert Buddhist year to Gregorian year
    const buddhistYear = parseInt(selectedYearF);
    const gregorianYear = buddhistYear - 543;

    const payload = {
      employee_id: "700001", // Fixed value for now
      scenario_name: selectedScenarioF,
      year: gregorianYear, // Now sends 2027 instead of 2570
    };

    try {
      const response = await selectScenarioF(payload);
      alert(`เลือกแผนสำเร็จ! Scenario: ${selectedScenarioF}`);
      console.log("Scenario Selection Response:", response);

      // Refresh the selected scenarios table
      queryClient.invalidateQueries(["showSelectedScenarioF"]);

      // Optionally reset form or update UI
      // setSelectedPlan("");
      // setSelectedScenario1("");
    } catch (err) {
      console.error("Scenarion selection failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างเลือกแผน");
    } finally {
      setIsSelectingScenarioF(false);
    }
  };

  const { data: showSelectedScenarioF } = useSelectedScenarioF();

  const dataSelectedScenarioF =
    showSelectedScenarioF?.map((item) => ({
      selectionId: item.selection_id,
      scenarioName: item.scenario_name,
      selectedYear: item.selected_for_year,
      selectedAt: item.selected_at,
      employeeId: item.employee_id,
    })) || [];

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">จัดการแผน</div>
      <div className="main-container">
        <div className="summary-container"></div>
        <div className="create-select-plan-container">
          {/* EXISTING SELECTED PLAN SECTION */}
          <div className="selected-plan-container">
            <div className="container-title">แผน Final ที่ส่งให้ MJM</div>
            <SelectedPlanTable data={dataSelectedScenarioF} />
          </div>
          {/* EXISTING SCENARIO SELECTION SECTION */}
          <div className="plan-selection-container">
            เลือกแผน Final ที่จะส่งเข้า MJM
            <div className="inputgroup-container">
              <div className="input-year">
                <label>เลือกปีที่จะใช้</label>
                <select
                  value={selectedYearF}
                  onChange={handleYearFSelect}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value=""></option>
                  {budgetYearOption?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-field">
                <label>เลือกแผนที่จะใช้</label>
                <select
                  value={selectedScenarioF}
                  onChange={handleScenarioFSelect}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value=""></option>
                  {scenarioOption?.map((option) => (
                    <option
                      key={option.scenario_name}
                      value={option.scenario_name}
                    >
                      {option.scenario_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="confirm-container">
              <button onClick={handleScenarioFSubmit}>ยืนยัน</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manage;
