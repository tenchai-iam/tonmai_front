import React, { useState } from "react";

import NavbarComponent from "./ComponentsPage/Sub/NavbarComponent.js";
import BarGraphFeatures from "./ComponentsPage/Sub/BarGraphFeatures.js";

import { getFeatures } from "./services/api_Model.js";

import { docOptions } from "./ComponentsPage/Sub_config/Options.js";

import "./ComponentsStyles/Dashboard.css";
import "./ComponentsStyles/Home.css";
import { useFeatures } from "./ComponentsPage/Sub_Query/ModelQuery.js";

const Home = () => {
  const [selectedButton, setSelectedButton] = useState(""); // Track selected button index

  const { data: features } = useFeatures();

  const featuresData = features?.map((item) => ({
    name: item.Feature,
    importance: item.Importance,
  }));

  const barKeys = ["importance"];

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">หน้าหลัก</div>
      <div className="main-container">
        <div className="summary-container">
          <div className="container-title">ประสิทธิภาพของโมเดล</div>
          <BarGraphFeatures
            data={featuresData}
            xAxisKey="name"
            title="Top 15 Features Rank by Importance"
            height={400}
            barKeys={barKeys}
          />
        </div>
        <div className="summary-container">
          <div className="container-title">Download เอกสารประกอบการใช้งาน</div>
          <div className="buttongroup-container">
            {docOptions.map((option, index) => {
              return (
                <button
                  key={option.value}
                  // onClick={() => {
                  //   handleViewChange(option.value);
                  //   handleMetricSelect(option.value, index);
                  // }}
                  className={selectedButton === index ? "active" : ""}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
