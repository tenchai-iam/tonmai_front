import React, { useState, useEffect, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  useDraftScenarioOption,
  useDraftEditableScenarioOption,
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

import { batchUpdateCorridorUpgrade, insertUpgradeCorridorList, updateUpgradeScenarioAojBudget, updateBudgetUpgradeRegionalTable } from "../../services/api_Upgrade.js";

import {
  formatValue,
  formatUnit,
  formatQuantity,
} from "../Sub_config/Format.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Upgrade.css";
import "../../ComponentsStyles/Map.css";

const Upgrade = () => {
  const queryClient = useQueryClient();
  
  const [lineData, setLineData] = useState([]);

  const sessionPEACode = sessionStorage.getItem("pea_code");

  const { data: scenarioDraftOption } = useDraftScenarioOption();

  const [selectedDraftScenario, setSelectedDraftScenario] = useState("");
  const handleDraftScenarioSelect = (e) => setSelectedDraftScenario(e.target.value);

  const { data: scenarioDraftEditableOption } = useDraftEditableScenarioOption();

  const [selectedDraftEditableScenario, setSelectedDraftEditableScenario] = useState("");
  const handleDraftEditableScenarioSelect = (e) => setSelectedDraftEditableScenario(e.target.value);

  const [selectedDistrict, setSelectedDistrict] = useState("S2");
  const [selectedDistrictE, setSelectedDistrictE] = useState("S2");

  const handleChangeDistrict = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const [selectedAoj, setSelectedAoj] = useState("1103101");
  const [selectedAojE, setSelectedAojE] = useState("1103101");

  const handleChangeAoj = (event) => {
    setSelectedAoj(event.target.value);
  };

  const [selectedFeeder, setSelectedFeeder] = useState([]);
  const [selectedFeederE, setSelectedFeederE] = useState([]);

  const handleChangeFeeder = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedFeeder(selectedValues);
  };

  const handleChangeFeederE = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedFeederE(selectedValues);
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

  const { data: authorizedAojOption, isLoadingAuthorizedAojOption } =
    useAuthorizedAojOption(sessionPEACode);

  const authorizedAojOptionFormatted = authorizedAojOption?.map((option) => ({
    value: option.aoj_code,
    label: option.aoj_name,
  }));

  const { data: feederOption, isLoadingFeederOption } =
    useFeederOption(selectedAoj, selectedDraftScenario);

  const feederOptionFormatted = feederOption?.feeder_list?.map((option) => ({
    value: option["feeder_id"],
    label: option["feeder_id"],
  }));

  const { data: geoAoj } = useGeoAoj(selectedAoj);
  // const { data: geoFeeders } = useGeoFeeders(selectedFeeder);
  const { data: geoCorridors } = useGeoCorridors(
    selectedDraftScenario,
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

  // Fetch regional budget graph data from API
  const { data: regionBudgetGraph } = useRegionBudgetGraph(selectedDraftScenario, selectedDistrict);

  const dataRegionalBudgetGraph =
    regionBudgetGraph?.map((item) => ({
      region: item.region,
      baselineAdjust: item.baseline_adjust,
      normalizeAdjust: item.normalize_adjust,
      budgetAdjust: item.budget_adjust,
      budgetUpgradeAdjust: item.budget_upgrade_adjust,
    })) || [];  

  const { data: aojBudgetTable } = useAojBudgetTable(selectedDraftScenario, selectedDistrict);

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
      selectedDraftEditableScenario,
      selectedAojE,
      selectedFeederE
    );

  // State for editable table data
    const [editableTableData, setEditableTableData] = useState([]);
    const [modifiedRows, setModifiedRows] = useState(new Map());
    const [isSaving, setIsSaving] = useState(false);

    // Initialize editable data when corridorPlan changes (use the raw data, not the mapped version)
    useEffect(() => {
      if (corridorPlan && corridorPlan.length > 0) {
        const mappedData = corridorPlan.map((item) => ({
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
        }));
        setEditableTableData(mappedData);
        setModifiedRows(new Map()); // Reset modified rows when data changes
      } else {
        // Clear table if no data
        setEditableTableData([]);
        setModifiedRows(new Map());
      }
    }, [corridorPlan]);

    // Handler to update table row data
    const handleUpdateRow = (row, updatedFields) => {
      const rowId = `${row.feeder}-${row.corridor}`;

      // Update the data state
      setEditableTableData((prevData) => {
        const newData = prevData.map((item) => {
          if (item.feeder === row.feeder && item.corridor === row.corridor) {
            const updatedItem = {
              ...item,
              ...updatedFields,
            };
            console.log("Updating row:", item.feeder, item.corridor, "with:", updatedFields, "result:", updatedItem);
            return updatedItem;
          }
          return item;
        });
        console.log("New data array:", newData);
        return newData;
      });

      // Track which rows have been modified using Map
      setModifiedRows((prev) => {
        const newMap = new Map(prev);
        newMap.set(rowId, { ...row, ...updatedFields });
        return newMap;
      });

      console.log("Updated row", rowId, "with:", updatedFields);

      // Return a promise to allow waiting for completion
      return Promise.resolve();
    };

    // Handler to batch save all modified rows
    const handleBatchSave = async () => {
      if (modifiedRows.size === 0) {
        alert("ไม่มีการเปลี่ยนแปลงข้อมูล");
        return;
      }

      // Confirm before saving
      const confirmSave = window.confirm(
        `คุณต้องการบันทึกการเปลี่ยนแปลง ${modifiedRows.size} รายการหรือไม่?`
      );

      if (!confirmSave) {
        return;
      }

      setIsSaving(true);

      try {
        // Prepare batch update payload from modified rows
        const updates = Array.from(modifiedRows.values()).map((row) => {
          // Convert boolean upgrade to number if needed
          let upgradeValue = row.upgrade;
          if (typeof row.upgrade === 'boolean') {
            upgradeValue = row.upgrade ? 1 : 0;
          }

          return {
            scenario_name: row.scenarioName,
            feeder_id: row.feeder,
            nearest_upstream_device: row.corridor,
            upgrade: upgradeValue,
            reason: row.reason || ""
          };
        });

        const payload = { updates };

        console.log("Sending batch update:", payload);
        const response = await batchUpdateCorridorUpgrade(payload);

        console.log("Batch Update Response:", response);

        // Prepare insert upgrade corridor list payload
        const employeeId = sessionStorage.getItem("user") || "700001";

        const inserts = Array.from(modifiedRows.values()).map((row) => ({
          nearest_upstream_device: row.corridor,
          feeder_id_traced: row.feeder,
          region: row.district,
          aoj_code: row.code,
          aoj_name: row.name,
          frequency_number: row.frequency,
          upgrade: row.upgrade,
          reason: row.reason || "",
          employee_id: employeeId
        }));

        const insertPayload = { inserts };

        console.log("Sending insert upgrade corridor list:", insertPayload);
        const insertResponse = await insertUpgradeCorridorList(insertPayload);

        console.log("Insert Upgrade Corridor List Response:", insertResponse);

        // Update budget for the scenario
        const scenarioName = selectedDraftEditableScenario || selectedDraftScenario;
        if (scenarioName) {
          console.log("Updating AOJ budget for scenario:", scenarioName);
          const budgetUpdateResponse = await updateUpgradeScenarioAojBudget({
            scenario_name: scenarioName
          });
          console.log("AOJ Budget Update Response:", budgetUpdateResponse);

          console.log("Updating regional budget for scenario:", scenarioName);
          const regionalBudgetUpdateResponse = await updateBudgetUpgradeRegionalTable({
            scenario_name: scenarioName
          });
          console.log("Regional Budget Update Response:", regionalBudgetUpdateResponse);
        }

        alert(`บันทึกข้อมูลสำเร็จ ${modifiedRows.size} รายการ`);

        // Refresh the corridor plan data
        queryClient.invalidateQueries(["corridorPlan", selectedDraftEditableScenario, selectedAoj]);

        // Refresh budget data (graph and table)
        queryClient.invalidateQueries(["regionBudgetGraph"]);
        queryClient.invalidateQueries(["aojBudgetTable"]);

        // Clear modified rows tracking
        setModifiedRows(new Map());

      } catch (err) {
        console.error("Batch save failed:", err);
        alert("เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล");
      } finally {
        setIsSaving(false);
      }
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
        data: editableTableData,
        headers: headers,
        fileName: "Corridor_Data",
        title: `สรุปข้อมูลแผนการตัดต้นไม้ ${selectedDraftEditableScenario} สำหรับ ${selectedAoj}`,
        extraInfoRows: [],
      });
    };

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">ตรวจทานแผนการตัดต้นไม้</div>
      <div className="main-container">
        <div className="dropdown-dropdown-container">
          <div className="dropdowngroup-container">
            <select
              value={selectedDraftScenario}
              onChange={handleDraftScenarioSelect}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
              {scenarioDraftOption?.map((option) => (
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
          <div className="dropdown-dropdown-container">
            <div className="dropdowngroup-container">
                  <select
                    value={selectedDraftEditableScenario}
                    onChange={handleDraftEditableScenarioSelect}
                    className="border rounded-lg px-4 py-2"
                  >
                    <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
                    {scenarioDraftEditableOption?.map((option) => (
                      <option key={option.scenario_name} value={option.scenario_name}>
                        {option.scenario_name}
                      </option>
                    ))}
                  </select>
                  <Select
                    options={authorizedAojOptionFormatted}
                    value={authorizedAojOptionFormatted?.find(
                      (opt) => opt.value === sessionPEACode
                    )}
                    onChange={(selectedOption) =>
                      setSelectedAojE(selectedOption?.value || "")
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
                      (opt) => selectedFeederE.includes(opt.value)
                    )}
                    onChange={handleChangeFeederE}
                    isMulti
                    isClearable
                    placeholder="ค้นหา/เลือก Feeder (หลายตัวได้)"
                    noOptionsMessage={() => "ไม่พบข้อมูล"}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
            </div>
            <div className="download-end-group-button">
                  <button
                    onClick={handleBatchSave}
                    disabled={isSaving || modifiedRows.size === 0}
                    className={`download-button-style${modifiedRows.size > 0 ? " selected" : ""}`}
                  >
                    {isSaving ? "กำลังบันทึก..." : `บันทึกการเปลี่ยนแปลง${modifiedRows.size > 0 ? ` (${modifiedRows.size})` : ""}`}
                  </button>
                  <button
                    // onClick={handleDataCorridorPlan}
                    className={`download-button-style${false ? " selected" : ""}`}
                  >
                    Download
                  </button>
            </div>
          </div>
            <div className="remark">
              <p>ไม่สามารถปรับปรุงการตัดมากกว่า 2 ครั้งได้ในระบบ TonmAI โดยจะต้องไปทำการเปลี่ยนเป็นรายปีและเลือกเป็น 3 ครั้งในระบบ MJM </p>
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