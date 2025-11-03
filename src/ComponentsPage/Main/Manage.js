import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import PlanTable from "../Sub/TablePlan.js";
import SelectedDraftPlanTable from "../Sub/TableSelectedDraftPlan.js";
import SelectedPlanTable from "../Sub/TableSelectedPlan.js";
import { downloadTable } from "../Sub/DownloadXLSX.js";

import {
  useDistrictOption,
  useScenarioOption,
  useAojOption,
  useBudgetYearOption,
} from "../Sub_Query/OptionQuery.js";

import {
  useSelectedScenarioD,
  useSelectedScenarioF
} from "../Sub_Query/ManageQuery.js";

import {
  selectScenarioD,
  selectScenarioF,
  postEditableTrue,
  postEditableFalse,
  deleteScenario
} from "../../services/api_Manage.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Manage.css";

const Manage = () => {
  const queryClient = useQueryClient();

    const [selectedScenarioDel, setSelectedScenarioDel] = useState("");
  const handleScenarioDelSelect = (e) => setSelectedScenarioDel(e.target.value);

  const [selectedScenarioD, setSelectedScenarioD] = useState("");
  const handleScenarioDSelect = (e) => setSelectedScenarioD(e.target.value);

  const [selectedScenarioF, setSelectedScenarioF] = useState("");
  const handleScenarioFSelect = (e) => setSelectedScenarioF(e.target.value);

  const { data: budgetYearOption } = useBudgetYearOption();
  const { data: scenarioOption } = useScenarioOption();

  // Final Scenarion selection state
  const [selectedYearD, setSelectedYearD] = useState("");
  const handleYearDSelect = (e) => setSelectedYearD(e.target.value);

  const [SelectingScenarioD, setIsSelectingScenarioD] = useState(false);
  

  // Final Scenarion selection state
  const [selectedYearF, setSelectedYearF] = useState("");
  const handleYearFSelect = (e) => setSelectedYearF(e.target.value);

  const [SelectingScenarioF, setIsSelectingScenarioF] = useState(false);

  const [selectedYearE, setSelectedYearE] = useState("");
  const handleYearESelect = (e) => setSelectedYearE(e.target.value);

  // Updated: Draft Plan selection submit handler
  const handleScenarioDSubmit = async () => {
    if (!selectedYearD || !selectedScenarioD) {
      alert("กรุณาเลือกปีและ Scenario");
      return;
    }
    setIsSelectingScenarioD(true);

    // Convert Buddhist year to Gregorian year
    const buddhistYear = parseInt(selectedYearD);
    const gregorianYear = buddhistYear - 543;

    const payload = {
      employee_id: "700001", // Fixed value for now
      scenario_name: selectedScenarioD,
      year: gregorianYear, // Now sends 2027 instead of 2570
    };

    try {
      const response = await selectScenarioD(payload);
      alert(`เลือกแผน Draft สำเร็จ! Scenario: ${selectedScenarioD}`);
      console.log("Draft Scenario Selection Response:", response);

      // Refresh the selected scenarios table
      queryClient.invalidateQueries(["showSelectedScenarioD"]);

      // Optionally reset form or update UI
      // setSelectedPlan("");
      // setSelectedScenario1("");
    } catch (err) {
      console.error("Scenario selection failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างเลือกแผน Draft");
    } finally {
      setIsSelectingScenarioD(false);
    }
  };
  

  // Updated: Final Plan selection submit handler
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
      alert(`เลือก Final แผนสำเร็จ! Scenario: ${selectedScenarioF}`);
      console.log("Final Scenario Selection Response:", response);

      // Refresh the selected scenarios table
      queryClient.invalidateQueries(["showSelectedScenarioF"]);

      // Optionally reset form or update UI
      // setSelectedPlan("");
      // setSelectedScenario1("");
    } catch (err) {
      console.error("Final Scenario selection failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างเลือกแผน Final");
    } finally {
      setIsSelectingScenarioF(false);
    }
  };

  // Handler for enabling scenario edit
  const handleEnableEdit = async () => {
    if (!selectedYearE) {
      alert("กรุณาเลือกปีของแผน");
      return;
    }

    // Convert Buddhist year to Gregorian year
    const buddhistYear = parseInt(selectedYearE);
    const gregorianYear = buddhistYear - 543;

    try {
      const response = await postEditableTrue(gregorianYear);
      alert(`เปิดระบบปรับปรุงสำเร็จสำหรับปี ${selectedYearE}`);
      console.log("Enable Edit Response:", response);

      // Refresh the selected scenarios table
      queryClient.invalidateQueries(["showSelectedScenarioD"]);
    } catch (err) {
      console.error("Enable edit failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างเปิดระบบปรับปรุง");
    }
  };

  // Handler for disabling scenario edit
  const handleDisableEdit = async () => {
    if (!selectedYearE) {
      alert("กรุณาเลือกปีของแผน");
      return;
    }

    // Convert Buddhist year to Gregorian year
    const buddhistYear = parseInt(selectedYearE);
    const gregorianYear = buddhistYear - 543;

    try {
      const response = await postEditableFalse(gregorianYear);
      alert(`ปิดระบบปรับปรุงสำเร็จสำหรับปี ${selectedYearE}`);
      console.log("Disable Edit Response:", response);

      // Refresh the selected scenarios table
      queryClient.invalidateQueries(["showSelectedScenarioD"]);
    } catch (err) {
      console.error("Disable edit failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างปิดระบบปรับปรุง");
    }
  };

  // Handler for deleting scenario
  const handleDeleteScenario = async () => {
    if (!selectedScenarioDel) {
      alert("กรุณาเลือกแผนที่ต้องการลบ");
      return;
    }

    // Confirm before deleting
    const confirmDelete = window.confirm(
      `คุณต้องการลบแผน "${selectedScenarioDel}" ออกจากฐานข้อมูลหรือไม่?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await deleteScenario(selectedScenarioDel);
      alert(`ลบแผน "${selectedScenarioDel}" สำเร็จ`);
      console.log("Delete Scenario Response:", response);

      // Refresh scenario options and selected scenarios
      queryClient.invalidateQueries(["scenarioOption"]);
      queryClient.invalidateQueries(["showSelectedScenarioD"]);
      queryClient.invalidateQueries(["showSelectedScenarioF"]);

      // Reset selection
      setSelectedScenarioDel("");
    } catch (err) {
      console.error("Delete scenario failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างลบแผน");
    }
  };

  const { data: showSelectedScenarioD } = useSelectedScenarioD();

  const dataSelectedScenarioD =
    showSelectedScenarioD?.map((item) => ({
      selectionId: item.selection_id,
      scenarioName: item.scenario_name,
      selectedYear: item.selected_for_year,
      selectedAt: item.selected_at,
      employeeId: item.employee_id,
      editable: item.editable
    })) || [];


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
        <div className="scenarios-delete-container">
          <div className="delete-container">
              <div className="input-field">
                <select
                  value={selectedScenarioDel}
                  onChange={handleScenarioDelSelect}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="">เลือกแผนที่จะลบออกจากฐานข้อมูลทั่วไป</option>
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
              <div className="confirm-delete-container">
                <button onClick={handleDeleteScenario}>ลบ</button>
              </div>
          </div>
        </div>
        <div className="show-select-toggle-container">
          {/* EXISTING SELECTED DRAFT SCENARIO SECTION */}
          <div className="draft-selected-plan-container">
            <div className="container-title">แผน Draft ที่ส่งให้ กฟข.</div>
            <SelectedDraftPlanTable data={dataSelectedScenarioD} />
          </div>
          {/* DRAFT SCENARIO SELECTION SECTION */}
          <div className="draft-plan-selection-container">
            เลือกแผน Draft ให้ กฟข. พิจารณา
            <div className="inputgroup-container">
              <div className="input-year">
                <label>เลือกปีที่จะใช้</label>
                <select
                  value={selectedYearD}
                  onChange={handleYearDSelect}
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
                  value={selectedScenarioD}
                  onChange={handleScenarioDSelect}
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
            <div className="confirm-draft-container">
              <button onClick={handleScenarioDSubmit}>ยืนยัน แผน Draft</button>
            </div>
          </div>
          <div className="toggle-container">
            การปรับปรุงแก้ไขจาก กฟข.
              <div className="input-close-year">
                <label>เลือกปีของแผน</label>
                <select
                  value={selectedYearE}
                  onChange={handleYearESelect}
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
              {/* <div className="open-close-container"> */}
                <div className="open-container">
                  <button onClick={handleEnableEdit}>เปิด</button>
                </div>
                <div className="close-container">
                  <button onClick={handleDisableEdit}>ปิด</button>
                </div>
              {/* </div> */}
          </div>
        </div>
        <div className="show-select-container">
          {/* EXISTING SELECTED FINAL SCENARIO SECTION */}
          <div className="selected-plan-container">
            <div className="container-title">แผน Final ที่ส่งให้ MJM</div>
            <SelectedPlanTable data={dataSelectedScenarioF} />
          </div>
          {/* FINAL SCENARIO SELECTION SECTION */}
          <div className="plan-selection-container">
            เลือกแผน Final ส่งเข้า MJM
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
            <div className="confirm-final-container">
              <button onClick={handleScenarioFSubmit}>ยืนยันแผน Final</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manage;
