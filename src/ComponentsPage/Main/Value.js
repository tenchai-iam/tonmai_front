import React, { useState, useEffect } from "react";

import NavbarComponent from "../Sub/NavbarComponent.js";
import BarGraphV from "../Sub/BarGraphV.js";

import {
  useBaselineTotal,
  useBaselineDistrict,
} from "../Sub_Query/ValueQuery.js";

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
  const { data: baselineTotal } = useBaselineTotal();

  const dataBaselineTotal = [
    {
      base: (baselineTotal?.total_budget_base_thb ?? 0) / 1000000,
      model: (baselineTotal?.total_budget_model_thb ?? 0) / 1000000,
      actual: (baselineTotal?.total_actual_thb ?? 0) / 1000000,
    },
  ];

  const { data: baselineDistrict } = useBaselineDistrict();

  const dataBaselineDistrict =
    baselineDistrict?.map((item) => ({
      name: item.district,
      base: (item.total_budget_base_thb ?? 0) / 1000000,
      model: (item.total_budget_model_thb ?? 0) / 1000000,
      actual: (item.total_actual_thb ?? 0) / 1000000,
    })) || [];

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
                data={dataBaselineTotal}
                xAxisKey="name"
                title="Sales & Profit"
                height={400}
                barKeys={barKeys}
              />
            </div>
            <div className="district-container">
              <BarGraphV
                data={dataBaselineDistrict}
                xAxisKey="name"
                title="Sales & Profit"
                height={400}
                barKeys={barKeys}
              />
            </div>
          </div>
        </div>
        <div className="summary-container"></div>
      </div>
    </div>
  );
};

export default Value;
