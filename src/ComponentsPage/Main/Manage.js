import React, { useState, useEffect } from "react";

import NavbarComponent from "../Sub/NavbarComponent.js";

import { planDummyOptions, yearDummyOptions } from "../Sub_config/Options.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Manage.css";

const Manage = () => {
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

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">จัดการแผน</div>
      <div className="main-container">
        <div className="summary-container">
          <div className="container-title">เปรียบเทียบแผน</div>
        </div>
        <div className="create-select-plan-container">
          <div className="input-container">
            สร้างแผนโดย Parameter ความเสี่ยง SALFI
            <div className="inputgroup-container">
              <div className="input-field">
                <label>กรอกชื่อแผน</label>
                <input
                  className="input-value"
                  type="text"
                  // value={remark}
                  // onChange={handleRemarkChange}
                />
              </div>
              <div className="input-field">
                <label>กรอกค่าความเสี่ยง SALFI</label>
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
              <div className="input-field">
                <label>กรอกชื่อแผน</label>
                <input
                  className="input-value"
                  type="text"
                  // value={remark}
                  // onChange={handleRemarkChange}
                />
              </div>
              <div className="input-field">
                <label>กรอกงบประมาณ Budget</label>
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
            <div className="dropdowngroup-container">
              <div className="select-container">
                <label>เลือกแผนที่จะใช้</label>
                <select
                  value={selectedPlan}
                  onChange={handlePlanSelect}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="" disabled></option>
                  {planDummyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="year-select-container">
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
            </div>
            <div className="confirm-container">
              <button onClick={handlePlanSubmit}>ยืนยัน</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manage;
