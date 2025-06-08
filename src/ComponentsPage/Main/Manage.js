import React, { useState, useEffect } from "react";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import useSessionStorage from "../Sub/UseSessionStorage.js";
import PlanTable from "../Sub/TablePlan.js";

import {
  useDistrictOption,
  useScenarioOption,
  useAojOption,
} from "../Sub_Query/OptionQuery.js";

import { useCorridorPlan } from "../Sub_Query/ManageQuery.js";

import { planDummyOptions, yearDummyOptions } from "../Sub_config/Options.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Manage.css";

const Manage = () => {
  const [selectedScenario1, setSelectedScenario1] = useState("");
  const handleScenario1Select = (e) => setSelectedScenario1(e.target.value);

  const [selectedScenario2, setSelectedScenario2] = useState("");
  const handleScenario2Select = (e) => setSelectedScenario2(e.target.value);

  const { data: scenarioOption } = useScenarioOption();

  const [selectedPlan, setSelectedPlan] = useState("");
  const handlePlanSelect = (e) => setSelectedPlan(e.target.value);

  const handlePlanSubmit = async () => {
    setIsSavingPlan(true);

    const payload = {
      anlage: selectedAnlage, // key must be "anlage" to match backend
      employee_id: "700001", // Optionally get from user context/session
      data: [
        {
          method: selectedMethod,
          remark: remark,
          doc_number: doc_number,
          // process_date will be auto-filled in backend
        },
      ],
    };

    try {
      const response = await uploadProcess(payload); // use your axios upload function
      alert("ส่งข้อมูลสำเร็จ!");
      // reloadProcessDetail();
      console.log("Response:", response);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("เกิดข้อผิดพลาดระหว่างส่งข้อมูล");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const [selectedDistrict, setSelectedDistrict] = useSessionStorage(
    "selectedDistrict",
    ""
  );

  const handleChangeDistrict = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const [selectedAoj, setSelectedAoj] = useSessionStorage("selectedAoj", "");

  const handleChangeAoj = (event) => {
    setSelectedAoj(event.target.value);
  };

  const { data: districtOption } = useDistrictOption();

  const { data: aojOption, isLoadingAojOption } =
    useAojOption(selectedDistrict);

  const aojOptionFormatted = aojOption?.map((option) => ({
    value: option.CODE,
    label: option.NAME,
  }));

  const { data: corridorPlan } = useCorridorPlan(selectedAoj);

  const dataCorridorPlan =
    corridorPlan?.map((item) => ({
      code: item.aoj_code,
      name: item.aoj_name,
      frequency: item.chosen_scenario_frequency,
      length: item.corridor_length_km,
      cost: item.cost_to_trim_bht,
      customer: item.customers_affected_adjusted,
      feeder: item.feeder_id,
      outage: item.probability_of_outage_pct,
      customerRisk: item.risk_customer_interruptions,
      device: item.upstream_device,
      density: Number(item.vegetation_density_pct) * 100,
    })) || [];

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">จัดการแผน</div>
      <div className="main-container">
        <div className="create-select-plan-container">
          <div className="input-container">
            สร้างแผนโดย Parameter ความเสี่ยง SALFI
            <div className="inputgroup-container">
              <div className="input-year">
                <label>เลือกปีที่จะใช้</label>
                <select
                  value={selectedPlan}
                  onChange={handlePlanSelect}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="" disabled></option>
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
                  type="text"
                  // value={remark}
                  // onChange={handleRemarkChange}
                />
              </div>
            </div>
            <div className="confirm-container">
              <button onClick={handlePlanSubmit}>ยืนยัน</button>
            </div>
          </div>
          <div className="input-container">
            สร้างแผนโดย Parameter งบประมาณ
            <div className="inputgroup-container">
              <div className="input-year">
                <label>เลือกปีที่จะใช้</label>
                <select
                  value={selectedPlan}
                  onChange={handlePlanSelect}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="" disabled></option>
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
                  type="text"
                  // value={remark}
                  // onChange={handleRemarkChange}
                />
              </div>
            </div>
            <div className="confirm-container">
              <button onClick={handlePlanSubmit}>ยืนยัน</button>
            </div>
          </div>
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
                  <option value="" disabled></option>
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
                  value={selectedScenario1}
                  onChange={handleScenario1Select}
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
                <div className="text-box-subcontainer">
                  <label className="text">จำนวนพื้นที่ AOJ</label>
                </div>
                <div className="text-box-subcontainer">
                  <label className="text">SAIFI</label>
                </div>
                <div className="text-box-subcontainer">
                  <label className="text">งบประมาณ (ล้านบาท)</label>
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
                <div className="text-box-subcontainer">
                  <label className="text">จำนวนพื้นที่ AOJ</label>
                </div>
                <div className="text-box-subcontainer">
                  <label className="text">SAIFI</label>
                </div>
                <div className="text-box-subcontainer">
                  <label className="text">งบประมาณ (ล้านบาท)</label>
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
              <select
                value={selectedDistrict}
                onChange={handleChangeDistrict}
                className="border rounded-lg px-4 py-2"
              >
                <option value="" disabled>
                  เลือกการไฟฟ้าเขต
                </option>
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
                // onClick={handleDownloadCorridorPlan}
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

export default Manage;
