import React, { useState, useEffect } from "react";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import useSessionStorage from "../Sub/UseSessionStorage.js";
import PlanTable from "../Sub/TablePlan.js";
import { downloadTable } from "../Sub/DownloadXLSX.js";

import {
  useDistrictOption,
  useScenarioOption,
  useAojOption,
} from "../Sub_Query/OptionQuery.js";

import {
  useCorridorPlan,
  usePlanSummaryQuery,
} from "../Sub_Query/ManageQuery.js";

import { planDummyOptions, yearDummyOptions } from "../Sub_config/Options.js";

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
import "../../ComponentsStyles/Manage.css";

const Create = () => {
  const [selectedScenario1, setSelectedScenario1] = useState("");
  const handleScenario1Select = (e) => setSelectedScenario1(e.target.value);

  const [selectedScenario2, setSelectedScenario2] = useState("");
  const handleScenario2Select = (e) => setSelectedScenario2(e.target.value);

  const [selectedScenario3, setSelectedScenario3] = useState("");
  const handleScenario3Select = (e) => setSelectedScenario3(e.target.value);

  const [selectedScenarioF, setSelectedScenarioF] = useState("");
  const handleScenarioFSelect = (e) => setSelectedScenarioF(e.target.value);

  const { data: scenarioOption } = useScenarioOption();

  // State for scenario creation
  const [selectedYearRisk, setSelectedYearRisk] = useState("");
  const [riskReductionPercent, setRiskReductionPercent] = useState("");
  const [isCreatingRiskScenario, setIsCreatingRiskScenario] = useState(false);

  const [selectedYearBudget, setSelectedYearBudget] = useState("");
  const [budgetReductionPercent, setBudgetReductionPercent] = useState("");
  const [isCreatingBudgetScenario, setIsCreatingBudgetScenario] =
    useState(false);

  const [selectedPlan, setSelectedPlan] = useState("");
  const handlePlanSelect = (e) => setSelectedPlan(e.target.value);

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

    try {
      const response = await createBudgetScenario(payload);
      alert(`สร้าง Budget Scenario สำเร็จ! ID: ${response.scenario_id}`);
      console.log("Budget Scenario Response:", response);

      // Reset form
      setSelectedYearBudget("");
      setBudgetReductionPercent("");

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

    try {
      const response = await createRiskScenario(payload);
      alert(`สร้าง Risk Scenario สำเร็จ! ID: ${response.scenario_id}`);
      console.log("Risk Scenario Response:", response);

      // Reset form
      setSelectedYearRisk("");
      setRiskReductionPercent("");

      // Optionally refresh scenario options
      // refetchScenarioOption();
    } catch (err) {
      console.error("Risk scenario creation failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างสร้าง Risk Scenario");
    } finally {
      setIsCreatingRiskScenario(false);
    }
  };

  // NEW: Plan selection state
  const [SelectingPlan, setIsSelectingPlan] = useState(false);

  // Updated: Plan selection submit handler
  const handlePlanSubmit = async () => {
    if (!selectedPlan || !selectedScenarioF) {
      alert("กรุณาเลือกปีและ Scenario");
      return;
    }
    setIsSelectingPlan(true);

    // Convert Buddhist year to Gregorian year
    const buddhistYear = parseInt(selectedPlan);
    const gregorianYear = buddhistYear - 543;

    const payload = {
      employee_id: "700001", // Fixed value for now
      scenario_name: selectedScenarioF,
      year: gregorianYear, // Now sends 2027 instead of 2570
    };

    try {
      const response = await selectScenarioPlan(payload);
      alert(`เลือกแผนสำเร็จ! Scenario: ${selectedScenarioF}`);
      console.log("Plan Selection Response:", response);
      // Optionally reset form or update UI
      // setSelectedPlan("");
      // setSelectedScenario1("");
    } catch (err) {
      console.error("Plan selection failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างเลือกแผน");
    } finally {
      setIsSelectingPlan(false);
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

  const { data: planSummary1 } = usePlanSummaryQuery(selectedScenario1);

  const dataPlanSummary1 = [
    {
      // aojCount: Number(planSummary1?.aoj_count || 0), // raw count
      cost: Number(planSummary1?.total_cost || 0) / 1_000_000, // in millions
      risk: Number(planSummary1?.total_risk || 0), // in millions
    },
  ];

  const { data: planSummary2 } = usePlanSummaryQuery(selectedScenario2);

  const dataPlanSummary2 = [
    {
      // aojCount: Number(planSummary2?.aoj_count || 0), // raw count
      cost: Number(planSummary2?.total_cost || 0) / 1_000_000, // in millions
      risk: Number(planSummary2?.total_risk || 0), // in millions
    },
  ];

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">สร้างแผน</div>
      <div className="main-container">
        <div className="remark">
          <p>หมายเหตุ</p>
          <p>
            SAIFI = Number of Customer Interruptions
            (จำนวนลูกค้าที่คาดว่าจะกระทบกับไฟฟ้าดับ) / Total Number of Customers
            (จำนวนลูกค้าทั้งหมด)
          </p>
        </div>
        <div className="create-select-plan-container">
          {/* RISK SCENARIO SECTION */}
          <div className="input-container">
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
                  {yearDummyOptions.map((option) => (
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
            </div>
            <div className="confirm-container">
              <button
                onClick={handleRiskSubmit}
                disabled={isCreatingRiskScenario}
              >
                {isCreatingRiskScenario ? "กำลังสร้าง..." : "ยืนยัน"}
              </button>
            </div>
          </div>

          {/* BUDGET SCENARIO SECTION */}
          <div className="input-container">
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
                  {yearDummyOptions.map((option) => (
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
            </div>
            <div className="confirm-container">
              <button
                onClick={handleBudgetSubmit}
                disabled={isCreatingBudgetScenario}
              >
                {isCreatingBudgetScenario ? "กำลังสร้าง..." : "ยืนยัน"}
              </button>
            </div>
          </div>

          {/* EXISTING PLAN SELECTION SECTION */}
          <div className="input-output-container">
            เลือกแผนที่ใช้
            <div className="inputgroup-container">
              <div className="input-year">
                <label>เลือกปีที่จะใช้</label>
                <select
                  value={selectedPlan}
                  onChange={handlePlanSelect}
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
              <button onClick={handlePlanSubmit}>ยืนยัน</button>
            </div>
          </div>
        </div>
        <div className="summary-container">
          <div className="container-title">เปรียบเทียบแผน</div>
          <div className="compare-container">
            <div className="scenario-container">
              <div className="dropdowngroup-container">
                <select
                  value={selectedScenario1}
                  onChange={handleScenario1Select}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
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
              <div className="metric-box-container">
                {/* <div className="text-box-subcontainer">
                  <label className="text">จำนวนพื้นที่ AOJ</label>
                  <div className="value">
                    {formatQuantity(dataPlanSummary1[0]?.aojCount)}
                  </div>
                </div> */}
                <div className="text-box-subcontainer">
                  <label className="text">SAIFI</label>
                  <div className="value">
                    {formatUnit(dataPlanSummary1[0]?.risk)}
                  </div>
                </div>
                <div className="text-box-subcontainer">
                  <label className="text">งบประมาณ (ล้านบาท)</label>
                  <div className="value">
                    {formatValue(dataPlanSummary1[0]?.cost)}
                  </div>
                </div>
              </div>
            </div>
            <div className="scenario-container">
              <div className="dropdowngroup-container">
                <select
                  value={selectedScenario2}
                  onChange={handleScenario2Select}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
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
              <div className="metric-box-container">
                {/* <div className="text-box-subcontainer">
                  <label className="text">จำนวนพื้นที่ AOJ</label>
                  <div className="value">
                    {formatQuantity(dataPlanSummary2[0]?.aojCount)}
                  </div>
                </div> */}
                <div className="text-box-subcontainer">
                  <label className="text">SAIFI</label>
                  <div className="value">
                    {formatUnit(dataPlanSummary2[0]?.risk)}
                  </div>
                </div>
                <div className="text-box-subcontainer">
                  <label className="text">งบประมาณ (ล้านบาท)</label>
                  <div className="value">
                    {formatValue(dataPlanSummary2[0]?.cost)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="summary-container">
          <div className="container-title">ข้อมูลแผน</div>
          <div className="dropdown-download-container">
            <div className="dropdowngroup-container">
              <select
                value={selectedScenario3}
                onChange={handleScenario3Select}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
                {scenarioOption?.map((option) => (
                  <option
                    key={option.scenario_name}
                    value={option.scenario_name}
                  >
                    {option.scenario_name}
                  </option>
                ))}
              </select>
              <select
                value={selectedDistrict}
                onChange={handleChangeDistrict}
                className="border rounded-lg px-4 py-2"
              >
                <option value="" disabled>
                  เลือกการไฟฟ้าเขต
                </option>
                {districtOption?.map((option) => (
                  <option key={option.aoj_region} value={option.aoj_region}>
                    {option.aoj_region}
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
                onClick={handleDataCorridorPlan}
                className={`download-button-style${false ? " selected" : ""}`}
              >
                Download
              </button>
            </div>
          </div>
          <PlanTable data={dataCorridorPlan} />
        </div>
      </div>
    </div>
  );
};

export default Create;