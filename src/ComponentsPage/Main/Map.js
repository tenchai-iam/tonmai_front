import React, { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import useSessionStorage from "../Sub/UseSessionStorage.js";
import GeoMap from "../Sub/GeoMap.js";
import PlanTable from "../Sub/TablePlan.js";
import PlanUpgradeTable from "../Sub/TablePlanUpgrade.js";
import MapEmptyNotice from "../Sub/MapEmptyNotice.js";
import CorridorSummaryCards from "../Sub/CorridorSummaryCards.js";
import { downloadTable } from "../Sub/DownloadXLSX.js";
import {
  mapNewCorridorColumns,
  newCorridorExportHeaders,
  specialCorridorOptions,
  filterGeoJsonSpecial,
} from "../Sub_config/GeoCorridor.js";

import {
  useScenarioOption,
  useDistrictOption,
  useAojOption,
  useFeederOption,
  useCorridorOption,
  useFrequencyOption,
  useDensitySourceOption
} from "../Sub_Query/OptionQuery.js";

import {
  useCorridorSummary,
  useGeoAoj,
  useGeoCorridors,
  useGeoDevices,
  useGeoSub,
} from "../Sub_Query/GeoQuery.js";

import {
  useCorridorPlan,
  usePlanSummaryQuery,
} from "../Sub_Query/ManageQuery.js";

import { batchUpdateCorridorUpgrade, insertUpgradeCorridorList, updateUpgradeScenarioAojBudget, updateBudgetUpgradeRegionalTable } from "../../services/api_Upgrade.js";

import {
  formatValue,
  formatUnit,
  formatQuantity,
} from "../Sub_config/Format.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Map.css";

const MapPage = () => {
  const queryClient = useQueryClient();

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
  // "" | "vip" | "self" | "special" - filters the corridor layer client-side
  const [selectedSpecial, setSelectedSpecial] = useState("");

  const handleChangeFrequency = (event) => {
    setSelectedFrequency(event.target.value);
  };

  const [selectedDensitySource, setSelectedDensitySource] = useState("");

  const handleChangeDensitySource = (event) => {
    setSelectedDensitySource(event.target.value);
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
    useFeederOption(selectedScenario1, selectedDistrict, selectedAoj);

  const feederOptionFormatted = feederOption?.feeder_list?.map((option) => ({
    value: option["feeder_id"],
    label: option["feeder_id"],
  }));

  const { data: frequencyOption } = useFrequencyOption(selectedScenario1, selectedDistrict, selectedAoj, selectedFeeder);
  const { data: densitySourceOption } = useDensitySourceOption(selectedScenario1, selectedDistrict, selectedAoj, selectedFeeder);

  const { data: corridorOption } = useCorridorOption(selectedScenario1, selectedDistrict2, selectedAoj2);

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

  const { data: geoAoj } = useGeoAoj(selectedDistrict, selectedAoj);
  // const { data: geoFeeders } = useGeoFeeders(selectedFeeder);
  const { data: geoCorridors } = useGeoCorridors(
    selectedScenario1,
    selectedDistrict,
    selectedFeeder,
    selectedAoj,
    selectedFrequency,
    selectedDensitySource
  );
  const geoCorridorsFiltered = filterGeoJsonSpecial(geoCorridors, selectedSpecial);
  const { data: corridorSummary, isLoading: isLoadingSummary } = useCorridorSummary(
    selectedScenario1,
    selectedDistrict,
    selectedAoj,
    selectedFeeder
  );
  const { data: geoDevices } = useGeoDevices(selectedDistrict, selectedFeeder, selectedAoj, selectedFrequency);
  const { data: geoSub } = useGeoSub(selectedFeeder, selectedAoj, selectedFrequency);

  const [showAojOverlay, setShowAojOverlay] = useState(false);

  const combineGeoJson = (geo1, geo2) => {
    if (!geo1 && !geo2) return null;

    const features1 = geo1?.features || [];
    const features2 = geo2?.features || [];

    // Nothing to draw: keep returning null, as this did before the corridor
    // endpoints' 404-on-empty became an empty FeatureCollection, so the map
    // still falls back to the Thailand overview.
    if (features1.length === 0 && features2.length === 0) return null;

    return {
      type: "FeatureCollection",
      features: [...features1, ...features2],
    };
  };

  const corridorGeoJson = selectedFeeder.length > 0
    ? combineGeoJson(geoCorridorsFiltered, geoDevices)
    : null;

  // The corridor endpoint returns no features when the filters match
  // nothing; say so rather than leaving the map blank without reason.
  const hasNoCorridors =
    selectedFeeder.length > 0 && geoCorridorsFiltered?.features?.length === 0;

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
        device: item.raw_device_type,
        outage: item.probability_of_outage_bins,
        customer: item.customers_affected_adjusted_bins,
        frequency: item.frequency_number,
        ...mapNewCorridorColumns(item),
        upgrade: item.upgrade,
        reason: item.reason,
      })) || [],
    [corridorPlan]
  );

  // State for editable table data
    const [editableTableData, setEditableTableData] = useState([]);
    const [modifiedRows, setModifiedRows] = useState(new Map());
    const [isSaving, setIsSaving] = useState(false);

    // Initialize editable data when dataCorridorPlan changes
    useEffect(() => {
      if (dataCorridorPlan && dataCorridorPlan.length > 0) {
        setEditableTableData(dataCorridorPlan);
        setModifiedRows(new Map()); // Reset modified rows when data changes
      } else {
        setEditableTableData([]);
        setModifiedRows(new Map());
      }
    }, [dataCorridorPlan]);

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
        const scenarioName = selectedScenario1;
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
        queryClient.invalidateQueries(["corridorPlan", selectedScenario1, selectedAoj2]);

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
      ...newCorridorExportHeaders,
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
            <select
              value={selectedDensitySource}
              onChange={handleChangeDensitySource}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">เลือกแหล่งข้อมูลความหนาแน่น</option>
              {densitySourceOption?.map((option) => (
                <option key={option.calibration_status} value={option.calibration_status}>
                  {option.calibration_status}
                </option>
              ))}
            </select>
            <select
              value={selectedSpecial}
              onChange={(event) => setSelectedSpecial(event.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">เลือก Corridor พิเศษ (VIP/SELF)</option>
              {specialCorridorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="map-button-container">
          <div className="mapview-toggle-container">
            <button
              className={`mapview-btn ${showAojOverlay ? "active" : ""}`}
              onClick={() => setShowAojOverlay((v) => !v)}
            >
              แผนที่แบบ AOJ
            </button>
          </div>
          {/* Color mode toggle */}
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
        </div>
          <CorridorSummaryCards
            summary={corridorSummary}
            hasRegion={Boolean(selectedDistrict)}
            isLoading={isLoadingSummary}
          />
          <div className="map-container">
            {" "}
            <MapEmptyNotice show={hasNoCorridors} />
            <GeoMap
              pinOnClick={true}
              geoJsonPoints={geoDevices}
              geoSubPoints={geoSub}
              geoJsonData={corridorGeoJson}
              aojGeoJson={showAojOverlay ? geoAoj : null}
              colorMode={colorMode}
              showLegend={true}
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
            <div className="download-end-group-button">
              <button
                onClick={handleBatchSave}
                disabled={isSaving || modifiedRows.size === 0}
                className={`download-button-style${modifiedRows.size > 0 ? " selected" : ""}`}
              >
                {isSaving ? "กำลังบันทึก..." : `บันทึกการเปลี่ยนแปลง${modifiedRows.size > 0 ? ` (${modifiedRows.size})` : ""}`}
              </button>
              <button
                onClick={handleDataCorridorPlan}
                className={`download-button-style${editableTableData.length > 0 ? " selected" : ""}`}
              >
                Download
              </button>
            </div>
          </div>
          <div className="remark">
            <p>
              ระดับ Low / Medium / High ทั้งสามค่าเป็นการจัดอันดับเทียบกับ corridor
              ทั้งหมดในแผนเดียวกันทั่วประเทศ ไม่ใช่เกณฑ์ตัวเลขคงที่: Low = 40%
              ล่างสุด, Medium = 30% ถัดมา, High = 30% บนสุด
              (ค่าตัดจะเปลี่ยนทุกครั้งที่ประมวลผลแผนใหม่)
            </p>
            <p>
              ความเสี่ยงไฟดับจากต้นไม้ (probability_of_outage_bins):
              โอกาสที่ corridor นี้จะเกิดไฟฟ้าดับจากต้นไม้ในหนึ่งปี ตามแบบจำลอง
            </p>
            <p>
              จำนวนลูกค้ากระทบ (customers_affected_adjusted):
              จำนวนผู้ใช้ไฟที่จะดับเมื่อ corridor นี้เกิดเหตุ
              นับรวมสายแยกที่รับไฟต่อจาก corridor นี้ทั้งหมด
            </p>
            <p>
              ระดับผลกระทบจากไฟดับ (risk_customer_interruptions_bins):
              จำนวนครั้งที่คาดว่าจะเกิดไฟดับ x จำนวนลูกค้ากระทบ
              = จำนวนราย-ครั้งที่ผู้ใช้ไฟจะได้รับผลกระทบต่อปี แล้วจัดอันดับตามข้างต้น
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

export default MapPage;
