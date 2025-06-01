import React, { useState, useEffect } from "react";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import LeafletMap from "../Sub/LeafletMap.js";

import {
  useDistrictOption,
  useAojOption,
  useFeederOption,
} from "../Sub_Query/OptionQuery.js";

import {
  useGeoAoj,
  useGeoFeeders,
  useGeoCorridors,
} from "../Sub_Query/GeoQuery.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Map.css";

const Map = () => {
  const [lineData, setLineData] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState("");

  const handleChangeDistrict = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const [selectedAoj, setSelectedAoj] = useState("");

  const handleChangeAoj = (event) => {
    setSelectedAoj(event.target.value);
  };

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
    value: option.NAME,
    label: option.NAME,
  }));

  const { data: feederOption, isLoadingFeederOption } =
    useFeederOption(selectedAoj);

  const feederOptionFormatted = feederOption?.feeder_list?.map((option) => ({
    value: option["feeder_id"],
    label: option["feeder_id"],
  }));

  const { data: geoAoj } = useGeoAoj(selectedAoj);
  const { data: geoFeeders } = useGeoFeeders(selectedFeeder);
  const { data: geoCorridors } = useGeoCorridors(selectedFeeder);

  const [currentMapView, setCurrentMapView] = useState("corridor");

  const mapViewConfig = {
    aoj: {
      isActive: currentMapView === "aoj",
      geoJson: geoAoj,
      required: selectedAoj,
    },
    feeder: {
      isActive: currentMapView === "feeder",
      geoJson: geoFeeders,
      required: selectedFeeder,
    },
    corridor: {
      isActive: currentMapView === "corridor",
      geoJson: geoCorridors,
      required: selectedFeeder,
    },
  };

  const activeMapView = Object.values(mapViewConfig).find(
    (v) => v.isActive && v.required
  );
  const geoJsonToShow = activeMapView?.geoJson;

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">แผนการตัดต้นไม้</div>
      <div className="main-container">
        <div className="dropdown-dropdown-container">
          <div className="dropdowngroup-container">
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
            <Select
              placeholder="ค้นหา/เลือกอุปกรณ์"
              noOptionsMessage={() => "ไม่พบข้อมูล"}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        </div>
        <div className="mapview-toggle-container">
          <button
            className={`mapview-btn ${
              currentMapView === "aoj" ? "active" : ""
            }`}
            onClick={() => setCurrentMapView("aoj")}
          >
            AOJ
          </button>
          <button
            className={`mapview-btn ${
              currentMapView === "feeder" ? "active" : ""
            }`}
            onClick={() => setCurrentMapView("feeder")}
          >
            Feeder
          </button>
          <button
            className={`mapview-btn ${
              currentMapView === "corridor" ? "active" : ""
            }`}
            onClick={() => setCurrentMapView("corridor")}
          >
            Corridor
          </button>
        </div>
        <LeafletMap geoJsonData={geoJsonToShow} />
      </div>
    </div>
  );
};

export default Map;
