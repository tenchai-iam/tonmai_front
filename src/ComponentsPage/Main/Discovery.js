import React, { useState, useEffect, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";

import useSessionStorage from "../Sub/UseSessionStorage.js";
import GeoMapDiscovery from "../Sub/GeoMapDiscovery.js";
import PlanDiscoveryTable from "../Sub/TablePlanDiscovery.js";
import MapEmptyNotice from "../Sub/MapEmptyNotice.js";
import CorridorSummaryCards from "../Sub/CorridorSummaryCards.js";
import { downloadTable } from "../Sub/DownloadXLSX.js";
import {
  mapNewCorridorColumns,
  newCorridorExportHeaders,
  specialCorridorOptions,
  filterGeoJsonSpecial,
  filterSpecialCorridors,
  isVipCorridor,
  isSelfCorridor,
} from "../Sub_config/GeoCorridor.js";

import {
  useScenarioOption,
  useDiscoveryEditableScenarioOption,
  useDraftScenarioOption,
  useDraftEditableScenarioOption,
  useDistrictOption,
  useAuthorizedDistrictOption,
  useAojOption,
  useAuthorizedAojOption,
  useFeederOption,
  useCorridorOption,
  useFrequencyOption
} from "../Sub_Query/OptionQuery.js";

import { 
    useRegionBudgetGraph,
    useAojBudgetTable
 } from "../Sub_Query/BudgetQuery.js";

import {
  useCorridorSummary,
  useGeoAoj,
  useGeoCorridors,
  useGeoCorridorsDiscovery,
  useGeoDevices,
  useGeoSub,
} from "../Sub_Query/GeoQuery.js";

import {
  useCorridorPlan,
  usePlanSummaryQuery,
  useRegionBudgetTable
} from "../Sub_Query/ManageQuery.js";

import { batchUpdateCorridorUpgrade, insertUpgradeCorridorList, updateUpgradeScenarioAojBudget, updateBudgetUpgradeRegionalTable } from "../../services/api_Upgrade.js";
import { batchUpdateCorridorSelf, insertSelfCorridorList } from "../../services/api_Self.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Upgrade.css";
import "../../ComponentsStyles/Map.css";

const Discovery = () => {
  const queryClient = useQueryClient();
  
  const [lineData, setLineData] = useState([]);

  const sessionPEACode = sessionStorage.getItem("pea_code");

  // Both pickers on this page follow the เปิด/ปิด switch for แผน Discovery on
  // จัดการแผน (F8_discovery_scenario.editable): a plan closed there drops out
  // of the map's list, not just the editable table's.
  const { data: scenarioDiscoveryOption } = useDiscoveryEditableScenarioOption();

  const [selectedDiscoveryScenario, setSelectedDiscoveryScenario] = useState("");
  const handleDiscoveryScenarioSelect = (e) => setSelectedDiscoveryScenario(e.target.value);

  const { data: scenarioDiscoveryEditableOption } = useDiscoveryEditableScenarioOption(); 

  const [selectedDiscoveryEditableScenario, setSelectedDiscoveryEditableScenario] = useState("");
  const handleDiscoveryEditableScenarioSelect = (e) => setSelectedDiscoveryEditableScenario(e.target.value);

  const convertDistrictCode = (districtCode) => {
    const districtMapping = {
      'A': 'N1', 'B': 'N2', 'C': 'N3',
      'D': 'NE1', 'E': 'NE2', 'F': 'NE3',
      'G': 'C1', 'H': 'C2', 'I': 'C3',
      'J': 'S1', 'K': 'S2', 'L': 'S3'
    };
    return districtMapping[districtCode] || districtCode;
  };

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDistrictE, setSelectedDistrictE] = useState("");

  const handleChangeDistrict = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const handleChangeDistrictE = (event) => {
    setSelectedDistrictE(event.target.value);
  };

  const [selectedAoj, setSelectedAoj] = useState("");
  const [selectedAojE, setSelectedAojE] = useState("");

  const [selectedFrequency, setSelectedFrequency] = useState("");
  // "" | "vip" | "self" | "special" - filters the corridor layer client-side
  const [selectedSpecial, setSelectedSpecial] = useState("");

  const handleChangeFrequency = (event) => {
    setSelectedFrequency(event.target.value);
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

  const [selectedCorridor, setSelectedCorridor] = useState("");
  const [selectedSpecialE, setSelectedSpecialE] = useState("");

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

  const { data: authorizedDistrictOption } = useAuthorizedDistrictOption(sessionPEACode, selectedDiscoveryScenario);

  const { data: authorizedDistrictOptionE } = useAuthorizedDistrictOption(sessionPEACode, selectedDiscoveryEditableScenario);

  const { data: authorizedAojOption, isLoadingAuthorizedAojOption } =
    useAuthorizedAojOption(sessionPEACode, selectedDiscoveryScenario, selectedDistrict);

  const authorizedAojOptionFormatted = authorizedAojOption?.map((option) => ({
    value: option.aoj_code,
    label: option.aoj_name,
  }));

  // Office list for the corridor table, driven by the table's own scenario and
  // region pickers rather than the map's.
  const { data: authorizedAojOptionE } =
    useAuthorizedAojOption(sessionPEACode, selectedDiscoveryEditableScenario, selectedDistrictE);

  const authorizedAojOptionFormattedE = authorizedAojOptionE?.map((option) => ({
    value: option.aoj_code,
    label: option.aoj_name,
  }));

  const { data: feederOption, isLoadingFeederOption } =
    useFeederOption(selectedDiscoveryScenario, convertDistrictCode(selectedDistrict), selectedAoj);

  const feederOptionFormatted = feederOption?.feeder_list?.map((option) => ({
    value: option["feeder_id"],
    label: option["feeder_id"],
  }));

  const { data: frequencyOption } = useFrequencyOption(selectedDiscoveryScenario, selectedDistrict, selectedAoj, selectedFeeder);

  const { data: corridorOption } = useCorridorOption(selectedDiscoveryEditableScenario, convertDistrictCode(selectedDistrictE), selectedAojE);

  const corridorOptionFormatted = corridorOption?.map((option) => ({
    value: option["nearest_upstream_device"],
    label: option["nearest_upstream_device"],
  }));

  const { data: geoAoj } = useGeoAoj(convertDistrictCode(selectedDistrict), selectedAoj);
  // const { data: geoFeeders } = useGeoFeeders(selectedFeeder);
  const { data: geoCorridorsDiscovery } = useGeoCorridorsDiscovery(
    selectedDiscoveryScenario,
    convertDistrictCode(selectedDistrict),
    selectedFeeder,
    selectedAoj
  );
  const geoCorridorsDiscoveryFiltered = filterGeoJsonSpecial(geoCorridorsDiscovery, selectedSpecial);
  const { data: corridorSummary, isLoading: isLoadingSummary } = useCorridorSummary(
    selectedDiscoveryScenario,
    convertDistrictCode(selectedDistrict),
    selectedAoj,
    selectedFeeder
  );
  const { data: geoDevices } = useGeoDevices(convertDistrictCode(selectedDistrict), selectedFeeder, selectedAoj, selectedFrequency);
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
    ? combineGeoJson(geoCorridorsDiscoveryFiltered, geoDevices)
    : null;

  // The corridor endpoint returns no features when the filters match
  // nothing; say so rather than leaving the map blank without reason.
  const hasNoCorridors =
    selectedFeeder.length > 0 && geoCorridorsDiscoveryFiltered?.features?.length === 0;

  const [colorMode, setColorMode] = useSessionStorage("colorMode", "frequency");

    const { data: corridorPlan } = useCorridorPlan(
      selectedDiscoveryEditableScenario,
      selectedAojE,
      selectedFeederE,
      selectedCorridor
    );

  // State for editable table data
    const [editableTableData, setEditableTableData] = useState([]);
    const [modifiedRows, setModifiedRows] = useState(new Map());
    const [isSaving, setIsSaving] = useState(false);
    // Rows shown in the table / exported, after the special-corridor filter
    const visibleTableData = filterSpecialCorridors(editableTableData, selectedSpecialE);

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
          vip: item.vip,
          self: item.self,
          length: item.corridor_length_km,
          device: item.raw_device_type,
          outage: item.probability_of_outage_bins,
          customer: item.customers_affected_adjusted_bins,
          frequency: item.frequency_number,
          ...mapNewCorridorColumns(item),
          upgrade: item.upgrade,
          reason: item.reason,
          selfMaintained: item.self_maintained
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

        // SELF (ดำเนินการตัดเอง): update per-row flag (zeroes budget_upgrade_adjust
        // immediately) and sync the durable F8_self_corridor_list for the pipeline
        const selfUpdates = Array.from(modifiedRows.values()).map((row) => ({
          scenario_name: row.scenarioName,
          feeder_id: row.feeder,
          nearest_upstream_device: row.corridor,
          self_maintained: row.selfMaintained === true
        }));

        console.log("Sending batch self update:", { updates: selfUpdates });
        const selfResponse = await batchUpdateCorridorSelf({ updates: selfUpdates });
        console.log("Batch Self Update Response:", selfResponse);

        const selfInserts = Array.from(modifiedRows.values()).map((row) => ({
          nearest_upstream_device: row.corridor,
          feeder_id_traced: row.feeder,
          region: row.district,
          aoj_code: row.code,
          aoj_name: row.name,
          self: row.selfMaintained === true,
          employee_id: employeeId
        }));

        console.log("Sending insert self corridor list:", { inserts: selfInserts });
        const selfInsertResponse = await insertSelfCorridorList({ inserts: selfInserts });
        console.log("Insert Self Corridor List Response:", selfInsertResponse);

        // Update budget for the scenario
        const scenarioName = selectedDiscoveryEditableScenario || selectedDiscoveryScenario;
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
        queryClient.invalidateQueries(["corridorPlan", selectedDiscoveryEditableScenario, selectedAoj]);

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

  // ยกเลิก VIP / SELF จาก popup บนแผนที่
  //
  // Same contract as the corridor-management page: clicking a corridor pins its
  // popup and the popup carries the buttons that take the corridor off
  // whichever list it is on. Here the buttons run against the map's own
  // scenario picker (แผนที่), not the editable table's.
  //
  // A corridor reads as VIP or SELF from the properties the popup already
  // shows - the pipeline snapshot (vip / self) or the live edit made on this
  // scenario since (upgrade / self_maintained) - so a button appears on exactly
  // the corridors this map draws as special.
  const employeeId = sessionStorage.getItem("user") || "700001";

  // Removing a corridor changes budget_upgrade_adjust, so the AOJ and regional
  // budget tables are recomputed the same way the table's batch save does
  // before anything on the page is refetched.
  const refreshAfterCorridorChange = async () => {
    if (selectedDiscoveryScenario) {
      await updateUpgradeScenarioAojBudget({
        scenario_name: selectedDiscoveryScenario,
      });
      await updateBudgetUpgradeRegionalTable({
        scenario_name: selectedDiscoveryScenario,
      });
    }
    queryClient.invalidateQueries(["geoCorridorsDiscovery"]);
    queryClient.invalidateQueries(["corridorSummary"]);
    queryClient.invalidateQueries(["corridorPlan"]);
    queryClient.invalidateQueries(["regionBudgetGraph"]);
    queryClient.invalidateQueries(["aojBudgetTable"]);
  };

  // Remove VIP: clear the flag on this scenario and delete the row from
  // F8_upgrade_corridor_list, which is what the pipeline reads.
  const removeVip = async (properties, closePopup) => {
    const device = properties.nearest_upstream_device;
    const feeder = properties.feeder_id;
    if (!window.confirm(`ยกเลิก VIP ของ corridor ${device} ?`)) return;

    setIsSaving(true);
    try {
      await batchUpdateCorridorUpgrade({
        updates: [
          {
            scenario_name: properties.scenario_name || selectedDiscoveryScenario,
            feeder_id: feeder,
            nearest_upstream_device: device,
            upgrade: 0,
            reason: "",
          },
        ],
      });
      await insertUpgradeCorridorList({
        inserts: [
          {
            nearest_upstream_device: device,
            feeder_id_traced: feeder,
            upgrade: false,
            employee_id: employeeId,
          },
        ],
      });
      await refreshAfterCorridorChange();
      closePopup();
      alert(`ยกเลิก VIP ของ ${device} เรียบร้อย`);
    } catch (error) {
      console.error("Remove VIP failed:", error);
      alert("เกิดข้อผิดพลาดระหว่างยกเลิก VIP");
    } finally {
      setIsSaving(false);
    }
  };

  // Remove SELF: same shape against F8_self_corridor_list.
  const removeSelf = async (properties, closePopup) => {
    const device = properties.nearest_upstream_device;
    const feeder = properties.feeder_id;
    if (!window.confirm(`ยกเลิกการตัดเอง (SELF) ของ corridor ${device} ?`)) return;

    setIsSaving(true);
    try {
      await batchUpdateCorridorSelf({
        updates: [
          {
            scenario_name: properties.scenario_name || selectedDiscoveryScenario,
            feeder_id: feeder,
            nearest_upstream_device: device,
            self_maintained: false,
          },
        ],
      });
      await insertSelfCorridorList({
        inserts: [
          {
            nearest_upstream_device: device,
            feeder_id_traced: feeder,
            self: false,
            employee_id: employeeId,
          },
        ],
      });
      await refreshAfterCorridorChange();
      closePopup();
      alert(`ยกเลิกการตัดเอง (SELF) ของ ${device} เรียบร้อย`);
    } catch (error) {
      console.error("Remove SELF failed:", error);
      alert("เกิดข้อผิดพลาดระหว่างยกเลิก SELF");
    } finally {
      setIsSaving(false);
    }
  };

  const renderCorridorActions = (properties, closePopup) => {
    const vip = isVipCorridor(properties);
    const self = isSelfCorridor(properties);
    return (
      <div className="corridor-popup-buttons">
        {vip && (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => removeVip(properties, closePopup)}
          >
            {isSaving ? "กำลังบันทึก..." : "ยกเลิก VIP"}
          </button>
        )}
        {self && (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => removeSelf(properties, closePopup)}
          >
            {isSaving ? "กำลังบันทึก..." : "ยกเลิกการตัดเอง (SELF)"}
          </button>
        )}
        {!vip && !self && <span>ไม่ได้อยู่ในรายการ VIP หรือ SELF</span>}
      </div>
    );
  };

    const handleDataCorridorPlan = () => {
      const headers = [
        { label: "ปีงบประมาณ", key: "year" },
        { label: "ชื่อแผน", key: "scenarioName" },
        { label: "เขต", key: "district" },
        { label: "รหัส", key: "code" },
        { label: "กฟฟ.", key: "name" },
        { label: "feeder", key: "feeder" },
        { label: "รหัส Corridor", key: "corridor" },
        { label: "ระยะทาง (km)", key: "length" },
        { label: "อุปกรณ์", key: "device" },
        { label: "ความเสี่ยงไฟดับจากต้นไม้", key: "outage" },
        { label: "จำนวนลูกค้าที่ได้รับผลกระทบ", key: "customer" },
        { label: "จำนวนครั้งในการตัด (รายครั้ง)", key: "frequency" },
        ...newCorridorExportHeaders,
        { label: "ประสงค์ขอเพิ่มความถี่", key: "upgrade" },
        { label: "เหตุผล", key: "reason" },
        { label: "ดำเนินการตัดเอง", key: "selfMaintained" },
      ];

      const fileName = selectedDiscoveryEditableScenario
        ? `Corridor_Plan_${selectedDiscoveryEditableScenario}`
        : "Corridor_Plan";

      const title = selectedDiscoveryEditableScenario && selectedAojE
        ? `สรุปข้อมูลแผนการตัดต้นไม้ ${selectedDiscoveryEditableScenario} สำหรับ ${selectedAojE}`
        : selectedDiscoveryEditableScenario
        ? `สรุปข้อมูลแผนการตัดต้นไม้ ${selectedDiscoveryEditableScenario}`
        : "สรุปข้อมูลแผนการตัดต้นไม้";

      downloadTable({
        data: visibleTableData,
        headers: headers,
        fileName: fileName,
        title: title,
        extraInfoRows: [],
      });
    };

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">สำรวจ VIP corridor</div>
      <div className="main-container">
        <div className="dropdown-dropdown-container">
          <div className="dropdowngroup-container">
            <div className="filter-field">
            <label className="filter-label">แผนสำหรับแผนที่ (ทุกแผน)</label>
            <select
              value={selectedDiscoveryScenario}
              onChange={handleDiscoveryScenarioSelect}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
              {scenarioDiscoveryOption?.map((option) => (
                <option key={option.scenario_name} value={option.scenario_name}>
                  {option.scenario_name}
                </option>
              ))}
            </select>
            </div>
            <select
              value={selectedDistrict}
              onChange={handleChangeDistrict}
              className="border rounded-lg px-4 py-2"
            >
              <option value="" disabled>เลือกการไฟฟ้าเขต</option>
              {authorizedDistrictOption?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Select
              options={authorizedAojOptionFormatted}
              value={
                authorizedAojOptionFormatted?.find(
                  (opt) => opt.value === selectedAoj
                ) || null
              }
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
            hasRegion={Boolean(convertDistrictCode(selectedDistrict))}
            isLoading={isLoadingSummary}
          />
          <div className="map-general-container">
            {" "}
            <MapEmptyNotice show={hasNoCorridors} />
            <GeoMapDiscovery
              pinOnClick={true}
              renderCorridorActions={renderCorridorActions}
              geoJsonPoints={geoDevices}
              geoSubPoints={geoSub}
              geoJsonData={corridorGeoJson}
              aojGeoJson={showAojOverlay ? geoAoj : null}
              colorMode={colorMode}
              showLegend={true}
            />
          </div>
        <div className="summary-container">
          <div className="dropdown-dropdown-container">
            <div className="dropdowngroup-container">
                  <div className="filter-field">
                  <label className="filter-label">แผนสำหรับตารางแก้ไข (เฉพาะแผนที่เปิดให้แก้ไข)</label>
                  <select
                    value={selectedDiscoveryEditableScenario}
                    onChange={handleDiscoveryEditableScenarioSelect}
                    className="border rounded-lg px-4 py-2"
                  >
                    <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
                    {scenarioDiscoveryEditableOption?.map((option) => (
                      <option key={option.scenario_name} value={option.scenario_name}>
                        {option.scenario_name}
                      </option>
                    ))}
                  </select>
                  </div>
                  <select
                    value={selectedDistrictE}
                    onChange={handleChangeDistrictE}
                    className="border rounded-lg px-4 py-2"
                  >
                    <option value="" disabled>เลือกการไฟฟ้าเขต</option>
                    {authorizedDistrictOptionE?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Select
                    options={authorizedAojOptionFormattedE}
                    value={
                      authorizedAojOptionFormattedE?.find(
                        (opt) => opt.value === selectedAojE
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      setSelectedAojE(selectedOption?.value || "")
                    }
                    isClearable
                    placeholder="ค้นหา/เลือกการไฟฟ้าสาขา"
                    noOptionsMessage={() => "ไม่พบข้อมูล"}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                  {/* <Select
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
                  /> */}
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
              <select
                value={selectedSpecialE}
                onChange={(event) => setSelectedSpecialE(event.target.value)}
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
            <PlanDiscoveryTable
              data={visibleTableData}
              onUpdate={handleUpdateRow}
            />
        </div>
      </div>
    </div>
  );
};

export default Discovery;