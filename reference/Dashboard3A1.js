import React, { useState, useEffect, useMemo } from "react";

import {
    useLevelOneTwoStatusGraph,
    useLevelOneTwoUnitGraph,
    useLevelOneTwoAmountGraph,
    useOfficeStatusTable,
    useOfficeUnitTable,
    useOfficeAmountTable
} from "../Sub_Query/SummaryQuery.js";

import { useYearOption, useDistrictOption } from "../Sub_Query/OptionQuery.js";

import NavbarComponent from "./NavbarComponent.js";
import BarGraphDistrict from "../Sub/BarGraphDistrict.js";
import StatusTable from "../Sub/StatusTable.js";
import UnitTable from "../Sub/UnitTable.js";
import AmountTable from "../Sub/AmountTable.js";

import { downloadTable } from "../Sub/DownloadXLSX.js";

import { formatQuantity, formatUnit, formatAmount } from "../Sub_config/Format.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Dashboard3A.css";

const Dashboard3A1 = () => {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

    const { data: yearData } = useYearOption();
  
    const yearOptions = useMemo(() =>
      yearData?.map((item) => ({
        value: item.year,
        label: item.year.toString(),
      })),
      [yearData]
    );
  
    // Set default to the latest year when data loads
    useEffect(() => {
      if (yearOptions && yearOptions.length > 0 && !selectedYear) {
        const latestYear = Math.max(...yearOptions.map(option => option.value));
        setSelectedYear(latestYear.toString());
      }
    }, [yearOptions]);
  
    const handleChangeYear = (event) => {
      setSelectedYear(event.target.value);
    };
  
    const { data: districtOption } = useDistrictOption();
  
    const handleChangeDistrict = (event) => {
      setSelectedDistrict(event.target.value);
    };
  
    const { data: levelOneTwoStatusGraph } = useLevelOneTwoStatusGraph(selectedYear,selectedDistrict);

    const dataLevelOneTwoStatusGraph =
        levelOneTwoStatusGraph?.map((item) => ({
        name: item.parentAojName,
        statusPendingReal: item.statusPendingReal,
        statusPendingProcess: item.statusPendingProcess,
        statusProcess: item.statusProcess
        })) || [];

    const { data: levelOneTwoUnitGraph } = useLevelOneTwoUnitGraph(selectedYear,selectedDistrict);

    const dataLevelOneTwoUnitGraph =
        levelOneTwoUnitGraph?.map((item) => ({
        name: item.parentAojName,
        aiSum: item.ai_pred_sum,
        unitAdjustSum: item.unit_adjust_sum
        })) || [];

    const { data: levelOneTwoAmountGraph } = useLevelOneTwoAmountGraph(selectedYear,selectedDistrict);

    const dataLevelOneTwoAmountGraph =
        levelOneTwoAmountGraph?.map((item) => ({
        name: item.parentAojName,
        moneyBill: item.money_bill_sum,
        moneyCollect: item.money_collect_sum
        })) || [];

    const { data: officeStatusTable } = useOfficeStatusTable(selectedYear, selectedDistrict);

    const dataOfficeStatusTable =
        officeStatusTable?.map((item) => ({
        name: item.officeName,
        statusPendingReal: item.statusPendingReal,
        statusPendingProcess: item.statusPendingProcess,
        statusProcess: item.statusProcess
        })) || [];

    const downloadDataOfficeStatus = dataOfficeStatusTable.map((row) => ({
      name: row.name,
      statusPendingReal: row.statusPendingReal,
      statusPendingProcess: row.statusPendingProcess,
      statusProcess: row.statusProcess
    }));

    const handleDownloadOfficeStatus = () => {
      const headers = [
        { label: "การไฟฟ้า", key: "name", align: "center" },
        { label: "งานคงค้าง", key: "statusPendingReal", align: "right" },
        { label: "งานระหว่างตั้งหนี้", key: "statusPendingProcess", align: "right" },
        { label: "งานดำเนินการแล้ว", key: "statusProcess", align: "right" },
      ];

      downloadTable({
        data: downloadDataOfficeStatus,
        headers: headers,
        fileName: "Office_Status",
        title: `การจำแนกมิเตอร์และสถาะนะการดำเนินงานในการปรับปรุงหน่วยค่าไฟฟ้า`,
        extraInfoRows: [],
      });
    };

    const { data: officeUnitTable } = useOfficeUnitTable(selectedYear, selectedDistrict);

    const dataOfficeUnitTable =
        officeUnitTable?.map((item) => ({
        name: item.officeName,
        aiSum: item.ai_pred_sum,
        unitAdjustSum: item.unit_adjust_sum
        })) || [];

    const downloadDataOfficeUnit = dataOfficeUnitTable.map((row) => ({
      name: row.name,
      aiSum: formatUnit(row.aiSum),
      unitAdjustSum: formatUnit(row.unitAdjustSum)
    }));

    const handleDownloadOfficeUnit = () => {
      const headers = [
        { label: "การไฟฟ้า", key: "name", align: "center" },
        { label: "หน่วยปรับปรุง AI คาดการณ์", key: "aiSum", align: "right" },
        { label: "หน่วยปรับปรุงจริง", key: "unitAdjustSum", align: "right" },
      ];

      downloadTable({
        data: downloadDataOfficeUnit,
        headers: headers,
        fileName: "Office_Unit",
        title: `การดำเนินการปรับปรุงค่าไฟฟ้า (หน่วย)`,
        extraInfoRows: [],
      });
    };

    const { data: officeAmountTable } = useOfficeAmountTable(selectedYear, selectedDistrict);

    const dataOfficeAmountTable =
        officeAmountTable?.map((item) => ({
        name: item.officeName,
        moneyBill: item.money_bill_sum,
        moneyCollect: item.money_collect_sum
        })) || [];

    const downloadDataOfficeAmount = dataOfficeAmountTable.map((row) => ({
      name: row.name,
      moneyBill: formatAmount(row.moneyBill),
      moneyCollect: formatAmount(row.moneyCollect)
    }));

    const handleDownloadOfficeAmount = () => {
      const headers = [
        { label: "การไฟฟ้า", key: "name", align: "center" },
        { label: "ยอดเงินปรับปรุงจริง", key: "moneyBill", align: "right" },
        { label: "ยอดเงินรับชำระ", key: "moneyCollect", align: "right" },
      ];

      downloadTable({
        data: downloadDataOfficeAmount,
        headers: headers,
        fileName: "Office_Amount",
        title: `การดำเนินการเรียกเก็บค่าไฟที่ปรับปรุง (บาท)`,
        extraInfoRows: [],
      });
    };

return (
    <div>
        <NavbarComponent />
        <div className="header-container">
            การดำเนินการปรับปรุงค่าไฟฟ้าสำหรับหน่วยงานบริหารเขต
        </div>
        <div className="main3A1-container">
          <div className="dropdowngroup-container">
            <div className="label-select-container">
              <label>เลือกปี</label>
              <select
                value={selectedYear}
                onChange={handleChangeYear}
                className="border rounded-lg px-4 py-2"
              >
                {yearOptions?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
              <div className="label-select-container">
                <label>เลือกการไฟฟ้าเขต</label>
                <select
                  value={selectedDistrict}
                  onChange={handleChangeDistrict}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="" disabled>เลือกการไฟฟ้าเขต</option>
                  {districtOption?.map((option) => (
                    <option key={option.child_district} value={option.child_district}>
                      {option.child_district_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="triplegraph-container">
              <div className="vgraph1-container">
                การจำแนกมิเตอร์และสถาะนะการดำเนินงานในการปรับปรุงหน่วยค่าไฟฟ้า
                <div className="bar-chart-legend">
                    <span style={{ color: "#D69ADE" }}>⬤ งานคงค้าง</span>
                    <span style={{ color: "#4F1C51" }}>⬤ งานระหว่างตั้งหนี้</span>
                    <span style={{ color: "#A1D6B2" }}>⬤ งานดำเนินการแล้ว</span>
                </div>
              <BarGraphDistrict
                data={dataLevelOneTwoStatusGraph}
                xAxisKey="name"
                height={600}
                showPercentage={false}
                hideLabels={false}
                yAxisWidth={125}
                valueLabelPosition="center"
                maxBarSize={50} 
                barKeys={[
                  {
                    dataKey: "statusPendingReal",
                    fill: "#D69ADE",
                    tooltipLabel: "งานคงค้าง"
                  },
                  {
                    dataKey: "statusPendingProcess",
                    fill: "#4F1C51",
                    tooltipLabel: "งานระหว่างตั้งหนี้",
                    stackId: "stack"
                  },
                  {
                    dataKey: "statusProcess",
                    fill: "#A1D6B2",
                    tooltipLabel: "งานดำเนินการแล้ว",
                    stackId: "stack"
                  },
                ]}
              />
              </div>
              <div className="vgraph2-container">
                การดำเนินการปรับปรุงค่าไฟฟ้า (หน่วย)
                <div className="bar-chart-legend">
                    <span style={{ color: "#C69530" }}>⬤ หน่วยปรับปรุง AI คาดการณ์</span>
                    <span style={{ color: "#A1D6B2" }}>⬤ หน่วยปรับปรุงจริง</span>
                </div>
              <BarGraphDistrict
                data={dataLevelOneTwoUnitGraph}
                xAxisKey="name"
                height={600}
                showPercentage={false}
                hideLabels={true}
                yAxisWidth={0}
                valueLabelPosition="center"
                rightMargin={100} 
                maxBarSize={50} 
                barKeys={[
                  {
                    dataKey: "aiSum",
                    fill: "#C69530",
                    tooltipLabel: "หน่วยปรับปรุง AI คาดการณ์"
                  },
                  {
                    dataKey: "unitAdjustSum",
                    fill: "#A1D6B2",
                    tooltipLabel: "หน่วยปรับปรุงจริง",
                  }
                ]}
              />
              </div>
              <div className="vgraph3-container">
                การดำเนินการเรียกเก็บค่าไฟที่ปรับปรุง (บาท)
                <div className="bar-chart-legend">
                    <span style={{ color: "#A1D6B2" }}>⬤ ยอดเงินปรับปรุงจริง</span>
                    <span style={{ color: "#4ED7F1" }}>⬤ ยอดเงินรับชำระ</span>
                </div>
              <BarGraphDistrict
                data={dataLevelOneTwoAmountGraph}
                xAxisKey="name"
                height={600}
                showPercentage={false}
                hideLabels={true}
                yAxisWidth={0}
                valueLabelPosition="center"
                rightMargin={225} 
                maxBarSize={50} 
                barKeys={[
                  {
                    dataKey: "moneyBill",
                    fill: "#A1D6B2",
                    tooltipLabel: "ยอดเงินปรับปรุงจริง"
                  },
                  {
                    dataKey: "moneyCollect",
                    fill: "#4ED7F1",
                    tooltipLabel: "ยอดเงินรับชำระ",
                  }
                ]}
              />
              </div>
          </div>
          <div className="tripletable-container">
            <div className="table1-container">
                <div className="download-button">
                  <button
                    onClick={handleDownloadOfficeStatus}
                    className={`download-button-style${false ? " selected" : ""}`}
                  >
                    Download
                  </button>
                </div>
              <StatusTable data={dataOfficeStatusTable} />
            </div>
            <div className="table2-container">
                <div className="download-button">
                  <button
                    onClick={handleDownloadOfficeUnit}
                    className={`download-button-style${false ? " selected" : ""}`}
                  >
                    Download
                  </button>
                </div>
              <UnitTable data={dataOfficeUnitTable} />
            </div>
            <div className="table3-container">
                <div className="download-button">
                  <button
                    onClick={handleDownloadOfficeAmount}
                    className={`download-button-style${false ? " selected" : ""}`}
                  >
                    Download
                  </button>
                </div>
              <AmountTable data={dataOfficeAmountTable} />
            </div>
          </div>
        </div>
    </div>
);
};

export default Dashboard3A1;