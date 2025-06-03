import React, { useState, useEffect } from "react";

import NavbarComponent from "../Sub/NavbarComponent.js";
import BarGraphV from "../Sub/BarGraphV.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Value.css";

const Value = () => {
  const singleData = [
    {
      name: "Product A",
      base: 12000.45,
      model: 3000.75,
      actual: 4200.5,
    },
  ];

  const multipleData = [
    {
      name: "Product A",
      base: 12000.45,
      model: 3000.75,
      actual: 4200.5,
    },
    {
      name: "Product A",
      base: 12000.45,
      model: 3000.75,
      actual: 4200.5,
    },
    {
      name: "Product A",
      base: 12000.45,
      model: 3000.75,
      actual: 4200.5,
    },
    {
      name: "Product A",
      base: 12000.45,
      model: 3000.75,
      actual: 4200.5,
    },
  ];

  const barKeys = [
    { dataKey: "base", fill: "#8884d8" },
    { dataKey: "model", fill: "#82ca9d" },
    { dataKey: "actual", fill: "#3e3e3e" },
  ];

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">ติดตามมูลค่า Stage 5</div>
      <div className="main-container">
        <div className="summary-container">
          <div className="all-district-container">
            <div className="all-container">
              <BarGraphV
                data={singleData}
                xAxisKey="name"
                title="Sales & Profit"
                height={400}
                barKeys={barKeys}
              />
            </div>
            <div className="district-container">
              <BarGraphV
                data={multipleData}
                xAxisKey="name"
                title="Sales & Profit"
                height={400}
                barKeys={barKeys}
              />
            </div>
          </div>
        </div>
        <div className="summary-container">
          <div className="download-button">
            <button
              // onClick={handleDownloadDistrictSummary}
              className={`download-button-style${false ? " selected" : ""}`}
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Value;
