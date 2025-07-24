import React, { useState, useEffect } from "react";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import useSessionStorage from "../Sub/UseSessionStorage.js";
import GeoMap from "../Sub/GeoMap.js";
import PlanTable from "../Sub/TablePlan.js";
import { downloadTable } from "../Sub/DownloadXLSX.js";

import {
  useScenarioOption,
  useDistrictOption,
  useAojOption,
  useFeederOption,
} from "../Sub_Query/OptionQuery.js";

import {
  useGeoAoj,
  useGeoCorridors,
  useGeoDevices,
} from "../Sub_Query/GeoQuery.js";

import {
  useCorridorPlan,
  usePlanSummaryQuery,
} from "../Sub_Query/ManageQuery.js";

import {
  formatValue,
  formatUnit,
  formatQuantity,
} from "../Sub_config/Format.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Map.css";

const Map = () => {
  const [lineData, setLineData] = useState([]);

  const [selectedScenario1, setSelected1Scenario] = useState("");
  const handleScenario1Select = (e) => setSelected1Scenario(e.target.value);

  const { data: scenarioOption } = useScenarioOption();

  const [selectedDistrict, setSelectedDistrict] = useState("");

  const handleChangeDistrict = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const [selectedDistrict2, setSelectedDistrict2] = useState("");

  const handleChangeDistrict2 = (event) => {
    setSelectedDistrict2(event.target.value);
  };

  const [selectedAoj, setSelectedAoj] = useState("");

  const handleChangeAoj = (event) => {
    setSelectedAoj(event.target.value);
  };

  const [selectedAoj2, setSelectedAoj2] = useState("");

  const [selectedFeeder, setSelectedFeeder] = useState("");

  const handleChangeFeeder = (event) => {
    setSelectedFeeder(event.target.value);
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

  const { data: geoAoj } = useGeoAoj(selectedAoj);
  // const { data: geoFeeders } = useGeoFeeders(selectedFeeder);
  const { data: geoCorridors } = useGeoCorridors(
    selectedScenario1,
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
      required: selectedFeeder,
    },
  };

  const activeMapView = Object.values(mapViewConfig).find(
    (v) => v.isActive && v.required
  );
  const geoJsonToShow = activeMapView?.geoJson;

  const [colorMode, setColorMode] = useSessionStorage("colorMode", "frequency");

  const [selectedScenario2, setSelected2Scenario] = useState("");
  const handleScenario2Select = (e) => setSelected2Scenario(e.target.value);

  const { data: corridorPlan } = useCorridorPlan(
    selectedScenario2,
    selectedAoj2
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
      density: item.density_distribution_model,
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

  const { data: planSummary } = usePlanSummaryQuery(
    selectedScenario1
    // selectedDistrict,
    // selectedAoj,
    // selectedFeeder
  );

  const dataPlanSummary = [
    {
      aojCount: Number(planSummary?.aoj_count || 0), // raw count
      cost: Number(planSummary?.total_cost || 0) / 1_000_000, // in millions
      risk: Number(planSummary?.total_risk || 0), // in millions
    },
  ];

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">แผนการตัดต้นไม้</div>
      <div className="main-container">
        <div className="remark">
          <p>หมายเหตุ</p>
          <p>
            SAIFI = Number of Customer Interruptions
            (จำนวนลูกค้าที่คาดว่าจะกระทบกับไฟฟ้าดับ) / Total Number of Customers
            (จำนวนลูกค้าทั้งหมด)
          </p>
        </div>
        <div className="dropdown-dropdown-container">
          <div className="dropdowngroup-container">
            <select
              value={selectedScenario1}
              onChange={handleScenario1Select}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
              {scenarioOption?.map((option) => (
                <option key={option.scenario_name} value={option.scenario_name}>
                  {option.scenario_name}
                </option>
              ))}
            </select>
            <select
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
            <Select
              options={feederOptionFormatted}
              value={feederOptionFormatted?.find(
                (opt) => opt.value === selectedFeeder
              )}
              onChange={(selectedOption) =>
                setSelectedFeeder(selectedOption?.value || "")
              }
              isClearable
              placeholder="ค้นหา/เลือก Feeder"
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
        <div className="metric-map-container">
          <div className="metric-mapbox-container">
            {/* <div className="text-box-subcontainer">
              <label className="text">จำนวนพื้นที่ AOJ</label>
              <div className="value">
                {formatQuantity(dataPlanSummary[0]?.aojCount)}
              </div>
            </div> */}
            <div className="text-box-subcontainer">
              <label className="text">SAIFI</label>
              <div className="value">
                {formatUnit(dataPlanSummary[0]?.risk)}
              </div>
            </div>
            <div className="text-box-subcontainer">
              <label className="text">งบประมาณ (ล้านบาท)</label>
              <div className="value">
                {formatValue(dataPlanSummary[0]?.cost)}
              </div>
            </div>
          </div>
          <div className="map-container">
            {" "}
            <GeoMap
              geoJsonPoints={geoDevices}
              geoJsonData={geoJsonToShow}
              colorMode={colorMode}
              showLegend={currentMapView === "corridor"}
            />
          </div>
        </div>

        <div className="summary-container">
          <div className="dropdown-download-container">
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
              <select
                value={selectedDistrict2}
                onChange={handleChangeDistrict2}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">เลือกการไฟฟ้าเขต</option>
                {districtOption?.map((option) => (
                  <option key={option.aoj_region} value={option.aoj_region}>
                    {option.aoj_region}
                  </option>
                ))}
              </select>
              <Select
                options={aojOptionFormatted2}
                value={aojOptionFormatted2?.find(
                  (opt) => opt.value === selectedAoj2
                )}
                onChange={(selectedOption) =>
                  setSelectedAoj2(selectedOption?.value || "")
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
          <div className="remark">
            <p>
              customers_affected_adjusted (จำนวนลูกค้าที่ได้รับผลกระทบ) Low:
              น้อยกว่า 1000 ราย, Medium: 1,000-10,000 ราย, High: มากกว่า 10,000
              ราย
            </p>
            <p>
              probability_of_outage_bins (ความเสี่ยงไฟดับจากต้นไม้): Low:
              ช่วงความความน่าจะเป็นการเกิดไฟฟ้าดับ 0.00 ถึง 0.04, Medium:
              ช่วงความความน่าจะเป็นการเกิดไฟฟ้าดับ: 0.05 ถึง 0.16, High:
              ช่วงความความน่าจะเป็นการเกิดไฟฟ้าดับ มากกว่า 0.16
            </p>
            <p>
              risk_customer_interruptions_bins (ความเสี่ยงในการกระทบกับลูกค้า):
              Low: ช่วงความความน่าจะเป็นการเกิดไฟฟ้าดับ 0.00 ถึง 0.04, Medium:
              ช่วงความความน่าจะเป็นการเกิดไฟฟ้าดับ: 0.05 ถึง 0.16, High:
              ช่วงความความน่าจะเป็นการเกิดไฟฟ้าดับ มากกว่า 0.16
            </p>
          </div>
          <PlanTable data={dataCorridorPlan} />
        </div>
      </div>
    </div>
  );
};

export default Map;
