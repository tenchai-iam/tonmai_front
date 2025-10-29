import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import BarGraphBudget from "../Sub/BarGraphBudget.js";
import AojBudgetTable from "../Sub/TableAojBudget.js";

import useSessionStorage from "../Sub/UseSessionStorage.js";
import GeoMap from "../Sub/GeoMap.js";
import PlanUpgradeTable from "../Sub/TablePlanUpgrade.js";
import { downloadTable } from "../Sub/DownloadXLSX.js";

import {
  useScenarioOption,
  useSelectedScenarioOption,
  useDistrictOption,
  useAojOption,
  useAuthorizedAojOption,
  useFeederOption,
} from "../Sub_Query/OptionQuery.js";

import { 
    useRegionBudgetGraph,
    useAojBudgetTable
 } from "../Sub_Query/BudgetQuery.js";

import {
  useGeoAoj,
  useGeoCorridors,
  useGeoDevices,
} from "../Sub_Query/GeoQuery.js";

import {
  useCorridorPlan,
  usePlanSummaryQuery,
  useRegionBudgetTable
} from "../Sub_Query/ManageQuery.js";

import {
  formatValue,
  formatUnit,
  formatQuantity,
} from "../Sub_config/Format.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Upgrade.css";
import "../../ComponentsStyles/Map.css";

const Upgrade = () => {
  const [lineData, setLineData] = useState([]);

  const sessionPEACode = sessionStorage.getItem("pea_code");

  const [selectedScenario, setSelected1Scenario] = useState("20251028_v22_regional_optimization_2569_TEST1");
  const handleScenarioSelect = (e) => setSelectedScenario(e.target.value);

  const { data: scenarioOption } = useSelectedScenarioOption();

  const [selectedDistrict, setSelectedDistrict] = useState("");

  const handleChangeDistrict = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const [selectedDistrict2, setSelectedDistrict2] = useState("");

  const handleChangeDistrict2 = (event) => {
    setSelectedDistrict2(event.target.value);
  };

  const [selectedAoj, setSelectedAoj] = useState("1103101");

  const handleChangeAoj = (event) => {
    setSelectedAoj(event.target.value);
  };

  const [selectedAoj2, setSelectedAoj2] = useState("");

  const [selectedFeeder, setSelectedFeeder] = useState([]);

  const handleChangeFeeder = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedFeeder(selectedValues);
  };

  useEffect(() => {
    // Later replace this with fetch or API call
    const dummyData = [
      {
        coordinates: [
          [9.12345, 99.23456],
          [9.23456, 99.34567],
        ],
        color: "red",
      },
      {
        coordinates: [
          [9.3, 99.4],
          [9.4, 99.5],
        ],
        color: "green",
      },
    ];
    setLineData(dummyData);
  }, []);

  const { data: districtOption } = useDistrictOption();

  const { data: aojOption, isLoadingAojOption } =
    useAojOption(selectedDistrict);

  const aojOptionFormatted = aojOption?.map((option) => ({
    value: option.aoj_code,
    label: option.aoj_name,
  }));

  const { data: authorizedAojOption, isLoadingAuthorizedAojOption } =
    useAuthorizedAojOption(sessionPEACode);

  const authorizedAojOptionFormatted = authorizedAojOption?.map((option) => ({
    value: option.aoj_code,
    label: option.aoj_name,
  }));

  const { data: feederOption, isLoadingFeederOption } =
    useFeederOption(selectedAoj);

  const feederOptionFormatted = feederOption?.feeder_list?.map((option) => ({
    value: option["feeder_id"],
    label: option["feeder_id"],
  }));

  const { data: aojOption2, isLoadingAojOption2 } =
    useAojOption(selectedDistrict2);

  const aojOptionFormatted2 = aojOption2?.map((option) => ({
    value: option.aoj_code,
    label: option.aoj_name,
  }));

  const { data: authorizedAojOption2, isLoadingAuthorizedAojOption2 } =
    useAuthorizedAojOption(sessionPEACode);

  const authorizedAojOptionFormatted2 = authorizedAojOption2?.map((option) => ({
    value: option.aoj_code,
    label: option.aoj_name,
  }));

  const { data: geoAoj } = useGeoAoj(selectedAoj);
  // const { data: geoFeeders } = useGeoFeeders(selectedFeeder);
  const { data: geoCorridors } = useGeoCorridors(
    selectedScenario,
    selectedFeeder,
    selectedAoj
  );
  const { data: geoDevices } = useGeoDevices(selectedFeeder, selectedAoj);

  const [currentMapView, setCurrentMapView] = useSessionStorage(
    "currentMapView",
    ""
  );

  const combineGeoJson = (geo1, geo2) => {
    if (!geo1 && !geo2) return null;

    const features1 = geo1?.features || [];
    const features2 = geo2?.features || [];

    return {
      type: "FeatureCollection",
      features: [...features1, ...features2],
    };
  };

  const mapViewConfig = {
    aoj: {
      isActive: currentMapView === "aoj",
      geoJson: geoAoj,
      required: selectedAoj,
    },
    // feeder: {
    //   isActive: currentMapView === "feeder",
    //   geoJson: geoFeeders,
    //   required: selectedFeeder,
    // },
    corridor: {
      isActive: currentMapView === "corridor",
      geoJson: combineGeoJson(geoCorridors, geoDevices),
      required: selectedFeeder.length > 0,
    },
  };

  const activeMapView = Object.values(mapViewConfig).find(
    (v) => v.isActive && v.required
  );
  const geoJsonToShow = activeMapView?.geoJson;

  const [colorMode, setColorMode] = useSessionStorage("colorMode", "frequency");

  const [selectedScenario2, setSelected2Scenario] = useState("");
  const handleScenario2Select = (e) => setSelected2Scenario(e.target.value);

  const { data: planSummary } = usePlanSummaryQuery(
    selectedScenario
    // selectedDistrict,
    // selectedAoj,
    // selectedFeeder
  );

  const dataPlanSummary = [
    {
      // aojCount: Number(planSummary?.aoj_count || 0), // raw count
      cost: Number(planSummary?.total_cost || 0) / 1_000_000, // in millions
      risk: Number(planSummary?.total_risk || 0), // in millions
    },
  ];

  // Fetch regional budget graph data from API
  const { data: regionBudgetGraph } = useRegionBudgetGraph();

  const dataRegionalBudgetGraph =
    regionBudgetGraph?.map((item) => ({
      region: item.region,
      baselineAdjust: item.baseline_adjust,
      normalizeAdjust: item.normalize_adjust,
      budgetAdjust: item.budget_adjust,
      budgetUpgradeAdjust: item.budget_upgrade_adjust,
    })) || [];  

  const { data: aojBudgetTable } = useAojBudgetTable();

  const dataAojBudgetTable=
    aojBudgetTable?.map((item) => ({
      region: item.region,
      code: item.aoj_code,
      name: item.aoj_name,
      baselineAdjust: item.baseline_adjust,
      normalizeAdjust: item.normalize_adjust,
      budgetAdjust: item.budget_adjust,
      budgetUpgradeAdjust: item.budget_upgrade_adjust,
    })) || [];

    const { data: corridorPlan } = useCorridorPlan(
      selectedScenario,
      selectedAoj
    );
  
    const dataCorridorPlan =
      corridorPlan?.map((item) => ({
        year: item.year,
        scenarioName: item.scenario_name,
        district: item.aoj_region,
        code: item.aoj_code,
        name: item.aoj_name,
        feeder: item.feeder_id,
        corridor: item.nearest_upstream_device,
        length: item.corridor_length_km,
        device: item.device_type,
        outage: item.probability_of_outage_bins,
        customer: item.customers_affected_adjusted_bins,
        frequency: item.frequency_number,
        upgrade: item.upgrade,
        reason: item.reason
      })) || [];

  // State for editable table data
    const [editableTableData, setEditableTableData] = useState([]);

    // Initialize editable data when dataCorridorPlan changes
    useEffect(() => {
      setEditableTableData(dataCorridorPlan);
    }, [dataCorridorPlan]);

    // Handler to update table row data
    const handleUpdateRow = (index, updatedFields) => {
      setEditableTableData((prevData) => {
        const newData = [...prevData];
        newData[index] = {
          ...newData[index],
          ...updatedFields,
        };
        return newData;
      });

      // Optional: Call API to save the changes
      // You can add API call here if needed
      console.log("Updated row", index, "with:", updatedFields);
    };
  
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
        title: `สรุปข้อมูลแผนการตัดต้นไม้ ${selectedScenario} สำหรับ ${selectedAoj}`,
        extraInfoRows: [],
      });
    };

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">แผนการตัดต้นไม้</div>
      <div className="main-container">
        <div className="dropdown-dropdown-container">
          <div className="dropdowngroup-container">
            <select
              value={selectedScenario}
              onChange={handleScenarioSelect}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
              {scenarioOption?.map((option) => (
                <option key={option.scenario_name} value={option.scenario_name}>
                  {option.scenario_name}
                </option>
              ))}
            </select>
            {/* <select
              value={selectedDistrict}
              onChange={handleChangeDistrict}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">เลือกการไฟฟ้าเขต</option>
              {districtOption?.map((option) => (
                <option key={option.aoj_region} value={option.aoj_region}>
                  {option.aoj_region}
                </option>
              ))}
            </select> */}
            <Select
              options={authorizedAojOptionFormatted}
              value={authorizedAojOptionFormatted?.find(
                (opt) => opt.value === sessionPEACode
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
            <Select
              options={feederOptionFormatted}
              value={feederOptionFormatted?.filter(
                (opt) => selectedFeeder.includes(opt.value)
              )}
              onChange={handleChangeFeeder}
              isMulti
              isClearable
              placeholder="ค้นหา/เลือก Feeder (หลายตัวได้)"
              noOptionsMessage={() => "ไม่พบข้อมูล"}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>
        <div className="map-button-container">
          <div className="mapview-toggle-container">
            <button
              className={`mapview-btn ${
                currentMapView === "aoj" ? "active" : ""
              }`}
              onClick={() => setCurrentMapView("aoj")}
            >
              แผนที่แบบ AOJ
            </button>
            <button
              className={`mapview-btn ${
                currentMapView === "corridor" ? "active" : ""
              }`}
              onClick={() => setCurrentMapView("corridor")}
            >
              แผนที่แบบ Corridor
            </button>
          </div>
          {/* NEW: Color mode toggle */}
          {currentMapView === "corridor" && (
            <div className="mapview-toggle-container">
              <button
                className={`mapview-btn ${
                  colorMode === "frequency" ? "active" : ""
                }`}
                onClick={() => setColorMode("frequency")}
              >
                แสดงสีตามความถี่ (Frequency)
              </button>
              <button
                className={`mapview-btn ${
                  colorMode === "risk" ? "active" : ""
                }`}
                onClick={() => setColorMode("risk")}
              >
                แสดงสีตามความเสี่ยง (Risk)
              </button>
            </div>
          )}
        </div>
          <div className="map-general-container">
            {" "}
            <GeoMap
              geoJsonPoints={geoDevices}
              geoJsonData={geoJsonToShow}
              colorMode={colorMode}
              showLegend={currentMapView === "corridor"}
            />
          </div>

        <div className="summary-container">
          <div className="dropdown-download-container">

          </div>
          <div className="graph-table-platform">
            <div className="district-budget-graph">
                งบประมาณเขต (บาท)
                <div className="bar-chart-legend">
                  <span style={{ color: "#8B4513" }}>⬤ งบประมาณ Baseline</span>
                  <span style={{ color: "#C69530" }}>⬤ งบประมาณ Normalized </span>
                  <span style={{ color: "#4F1C51" }}>⬤ งบประมาณ</span>
                  <span style={{ color: "#A1D6B2" }}>⬤ งบประมาณปรับปรุง</span>
                </div>
              <BarGraphBudget
                data={dataRegionalBudgetGraph}
                xAxisKey="region"
                height={400}
                layout="horizontal"
                showPercentage={false}
                hideLabels={false}
                yAxisWidth={60}
                valueLabelPosition="top"
                rightMargin={50}
                maxBarSize={40}
                barKeys={[
                  {
                    dataKey: "baselineAdjust",
                    fill: "#8B4513",
                    tooltipLabel: "งบประมาณ Baseline"
                  },
                  {
                    dataKey: "normalizeAdjust",
                    fill: "#C69530",
                    tooltipLabel: "งบประมาณ Normalized"
                  },
                  {
                    dataKey: "budgetAdjust",
                    fill: "#4F1C51",
                    tooltipLabel: "งบประมาณ"
                  },
                  {
                    dataKey: "budgetUpgradeAdjust",
                    fill: "#A1D6B2",
                    tooltipLabel: "งบประมาณปรับปรุง"
                  }
                ]}
              />
            </div>
                <div className="aoj-budget-table">
                  <div className="download-end-button">
                    <button
                      // onClick={handleDataCorridorPlan}
                      className={`download-button-style${false ? " selected" : ""}`}
                    >
                      Download
                    </button>
                  </div>
                  <AojBudgetTable data={dataAojBudgetTable} />
                </div>
                </div>
        </div>
        <div className="summary-container">
                <div className="download-end-button">
                    <button
                        // onClick={handleDataCorridorPlan}
                        className={`download-button-style${false ? " selected" : ""}`}
                    >
                        Download
                    </button>
                </div>
            <PlanUpgradeTable
              data={editableTableData}
              onUpdate={handleUpdateRow}
            />
        </div>
      </div>
    </div>
  );
};

export default Upgrade;