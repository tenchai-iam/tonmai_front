import React, { useState, useEffect } from "react";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import useSessionStorage from "../Sub/UseSessionStorage.js";
import GeoMap from "../Sub/GeoMap.js";

import {
  useScenarioOption,
  useDistrictOption,
  useAojOption,
  useFeederOption,
} from "../Sub_Query/OptionQuery.js";

import {
  useGeoAoj,
  useGeoFeeders,
  useGeoCorridors,
  useGeoDevices,
} from "../Sub_Query/GeoQuery.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Map.css";

const MapGeneral = () => {
  const [lineData, setLineData] = useState([]);

  const [selectedScenario1, setSelected1Scenario] = useState("");
  const handleScenario1Select = (e) => setSelected1Scenario(e.target.value);

  const { data: scenarioOption } = useScenarioOption();

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

  const [selectedFeeder, setSelectedFeeder] = useSessionStorage(
    "selectedFeeder",
    ""
  );

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
    value: option.CODE,
    label: option.NAME,
  }));

  const { data: feederOption, isLoadingFeederOption } =
    useFeederOption(selectedAoj);

  const feederOptionFormatted = feederOption?.feeder_list?.map((option) => ({
    value: option["feeder_id"],
    label: option["feeder_id"],
  }));

  const { data: geoAoj } = useGeoAoj(selectedAoj);
  // const { data: geoFeeders } = useGeoFeeders(selectedFeeder);
  const { data: geoCorridors } = useGeoCorridors(selectedFeeder, selectedAoj);
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

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">แผนการตัดต้นไม้</div>
      <div className="main-container">
        <div className="dropdown-dropdown-container">
          <div className="dropdowngroup-container">
            <select
              value={selectedScenario1}
              onChange={handleScenario1Select}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
              {scenarioOption?.map((option) => (
                <option key={option.scenario_id} value={option.scenario_id}>
                  {option.scenario_id}
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
        <div className="dropdowngroup-container">
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

        <GeoMap
          geoJsonPoints={geoDevices}
          geoJsonData={geoJsonToShow}
          colorMode={colorMode}
          showLegend={currentMapView === "corridor"}
        />

        <div className="summary-container">
          <div className="dropdown-dropdown-container">
            <div className="dropdowngroup-container">
              <select
                value={selectedScenario1}
                onChange={handleScenario1Select}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
                {scenarioOption?.map((option) => (
                  <option key={option.scenario_id} value={option.scenario_id}>
                    {option.scenario_id}
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
        </div>
      </div>
    </div>
  );
};

export default MapGeneral;