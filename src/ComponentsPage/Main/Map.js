import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import useSessionStorage from "../Sub/UseSessionStorage.js";
import GeoMap from "../Sub/GeoMap.js";
import PlanTable from "../Sub/TablePlan.js";
import PlanUpgradeTable from "../Sub/TablePlanUpgrade.js";
import { downloadTable } from "../Sub/DownloadXLSX.js";

import {
  useScenarioOption,
  useDistrictOption,
  useAojOption,
  useFeederOption,
  useCorridorOption,
  useFrequencyOption
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

  const [selectedScenario2, setSelected2Scenario] = useState("");
  const handleScenario2Select = (e) => setSelected2Scenario(e.target.value);

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

  const [selectedFrequency, setSelectedFrequency] = useState("");

  const handleChangeFrequency = (event) => {
    setSelectedFrequency(event.target.value);
  };

  const [selectedAoj2, setSelectedAoj2] = useState("");

  const [selectedFeeder, setSelectedFeeder] = useState([]);

  const handleChangeFeeder = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedFeeder(selectedValues);
  };

  const [selectedFeeder2, setSelectedFeeder2] = useState([]);

  const [selectedCorridor, setSelectedCorridor] = useState("");


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

  const { data: districtOption } = useDistrictOption(selectedScenario1);

  const { data: aojOption, isLoadingAojOption } =
    useAojOption(selectedScenario1, selectedDistrict);

  const aojOptionFormatted = aojOption?.map((option) => ({
    value: option.aoj_code,
    label: option.aoj_name,
  }));

  const { data: feederOption, isLoadingFeederOption } =
    useFeederOption(selectedScenario1, selectedAoj);

  const feederOptionFormatted = feederOption?.feeder_list?.map((option) => ({
    value: option["feeder_id"],
    label: option["feeder_id"],
  }));

  const { data: frequencyOption } = useFrequencyOption(selectedScenario1, selectedAoj, selectedFeeder);

  const { data: corridorOption } = useCorridorOption(selectedScenario1, selectedAoj2);

  const corridorOptionFormatted = corridorOption?.map((option) => ({
    value: option["nearest_upstream_device"],
    label: option["nearest_upstream_device"],
  }));

  const { data: aojOption2, isLoadingAojOption2 } =
    useAojOption(selectedScenario1, selectedDistrict2);

  const aojOptionFormatted2 = aojOption2?.map((option) => ({
    value: option.aoj_code,
    label: option.aoj_name,
  }));

  const { data: geoAoj } = useGeoAoj(selectedAoj);
  // const { data: geoFeeders } = useGeoFeeders(selectedFeeder);
  const { data: geoCorridors } = useGeoCorridors(
    selectedScenario1,
    selectedFeeder,
    selectedAoj,
    selectedFrequency
  );
  const { data: geoDevices } = useGeoDevices(selectedFeeder, selectedAoj, selectedFrequency);

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

  const { data: corridorPlan } = useCorridorPlan(
    selectedScenario1,
    selectedAoj2,
    selectedFeeder2,
    selectedCorridor
  );

  const dataCorridorPlan = useMemo(
    () =>
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
        reason: item.reason,
      })) || [],
    [corridorPlan]
  );

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
      { label: "ปีงบประมาณ", key: "year" },
      { label: "ชื่อแผน", key: "scenarioName" },
      { label: "เขต.", key: "district" },
      { label: "รหัส", key: "code" },
      { label: "กฟฟ.", key: "name" },
      { label: "feeder", key: "feeder" },
      { label: "รหัส Corridor", key: "corridor" },
      { label: "ระยะทาง (km)", key: "length" },
      { label: "อุปกรณ์", key: "device" },
      { label: "ความเสี่ยงไฟดับจากต้นไม้", key: "outage" },
      { label: "จำนวนลูกค้าที่ได้ผลกระทบ", key: "customer" },
      { label: "ประสงค์ขอเพิ่มความถี่", key: "upgrade" },
      { label: "เหตุผล", key: "reason" },
    ];

    downloadTable({
      data: dataCorridorPlan,
      headers: headers,
      fileName: "Corridor_Data",
      title: `สรุปข้อมูลแผนการตัดต้นไม้ ${selectedScenario1} สำหรับ ${selectedAoj}`,
      extraInfoRows: [],
    });
  };

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
            <select
              value={selectedFrequency}
              onChange={handleChangeFrequency}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">เลือกความถี่ในการตัด</option>
              {frequencyOption?.map((option) => (
                <option key={option.frequency_number} value={option.frequency_number}>
                  {option.frequency_number}
                </option>
              ))}
            </select>
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
          <div className="map-container">
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
            <div className="dropdowngroup-container">
              {/* <select
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
              </select> */}
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
              <Select
                options={corridorOptionFormatted}
                value={corridorOptionFormatted?.find(
                  (opt) => opt.value === selectedCorridor
                )}
                onChange={(selectedOption) =>
                  setSelectedCorridor(selectedOption?.value || "")
                }
                isClearable
                placeholder="ค้นหา/เลือก Corridor"
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
          <PlanUpgradeTable               
            data={editableTableData}
            onUpdate={handleUpdateRow}/>
        </div>
      </div>
    </div>
  );
};

export default Map;
