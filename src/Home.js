import React, { useState } from "react";

import NavbarComponent from "./ComponentsPage/Sub/NavbarComponent.js";
import BarGraphFeatures from "./ComponentsPage/Sub/BarGraphFeatures.js";
import LineGraphROC from "./ComponentsPage/Sub/LineGraphROC.js";

import { docOptions } from "./ComponentsPage/Sub_config/Options.js";

import { formatUnit } from "./ComponentsPage/Sub_config/Format.js";

import {
  useAUC,
  useROC,
  useFeatures,
} from "./ComponentsPage/Sub_Query/ModelQuery.js";

import { getUserManual, getPlaybook } from "./services/api_Model.js";

import "./ComponentsStyles/Dashboard.css";
import "./ComponentsStyles/Home.css";

const Home = () => {
  const [selectedButton, setSelectedButton] = useState(""); // Track selected button index

  const { data: aucScore } = useAUC();
  const { data: rocCurve } = useROC();

  const { data: features } = useFeatures();

  const featuresData = features?.map((item) => ({
    name: item.Feature,
    importance: item.Importance,
  }));

  const barKeys = ["importance"];

  const docOptions = [
    { value: "user_manual", label: "User Manual" },
    { value: "playbook", label: "Playbook" },
  ];

  const handleDownload = async (docType) => {
    try {
      let blob;
      let filename;

      if (docType === "user_manual") {
        blob = await getUserManual();
        filename = "User_Manual.pdf";
      } else if (docType === "playbook") {
        blob = await getPlaybook();
        filename = "Business_Playbook.pdf";
      }

      if (blob) {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error(`Error downloading ${docType}:`, error);
    }
  };

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">หน้าหลัก</div>
      <div className="main-container">
        <div className="summary-container">
          <div className="container-title">ประสิทธิภาพของโมเดล</div>
          <div className="roc-decile-container">
            <div className="roc-container">
              <div className="title-metric-container">
                <div>ROC Curve</div>
                <div>AUC Score = {formatUnit(aucScore?.auc_score)}</div>
              </div>
              <LineGraphROC
                data={rocCurve}
                xAxisKey="fpr"
                lineKeys={["tpr"]}
                // title="ROC Curve"
                height={400} // Adjust height as needed
                xLabel="False Positive Rate"
                yLabel="True Positive Rate"
              />
            </div>
          </div>

          <BarGraphFeatures
            data={featuresData}
            xAxisKey="name"
            title="Top 15 ปัจจัยเรียงลำดับตามผลต่อการพยากรณ์ความเสี่ยง"
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
                  onClick={() => {
                    handleDownload(option.value);
                  }}
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
