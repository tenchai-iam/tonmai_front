import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Select from "react-select";

import NavbarComponent from "../Sub/NavbarComponent.js";
import GeoMap from "../Sub/GeoMap.js";
import MapEmptyNotice from "../Sub/MapEmptyNotice.js";
import CorridorSummaryCards from "../Sub/CorridorSummaryCards.js";

import {
  specialCorridorOptions,
  isFlagOn,
} from "../Sub_config/GeoCorridor.js";

import {
  useDraftScenarioOption,
  useAuthorizedDistrictOption,
  useAuthorizedAojOption,
  useFeederOption,
} from "../Sub_Query/OptionQuery.js";

import {
  useCorridorSummary,
  useGeoAoj,
  useGeoCorridors,
  useGeoDevices,
  useGeoSub,
} from "../Sub_Query/GeoQuery.js";

import {
  useUpgradeCorridorList,
  useSelfCorridorList,
} from "../Sub_Query/CorridorListQuery.js";

import {
  batchUpdateCorridorUpgrade,
  insertUpgradeCorridorList,
} from "../../services/api_Upgrade.js";
import {
  batchUpdateCorridorSelf,
  insertSelfCorridorList,
} from "../../services/api_Self.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Upgrade.css";
import "../../ComponentsStyles/Map.css";

// จัดการ Corridor
//
// Shows only the corridors that sit on one of the two durable lists the
// pipeline reads: VIP (F8_upgrade_corridor_list) and SELF
// (F8_self_corridor_list). Membership in those lists - not the scenario's own
// vip/self snapshot columns - decides what is drawn, so a corridor removed here
// leaves the map straight away instead of waiting for the next pipeline run.
//
// Clicking a corridor pins its popup; the popup carries the buttons that take
// the corridor off whichever list it is on.
const CorridorManage = () => {
  const queryClient = useQueryClient();
  const sessionPEACode = sessionStorage.getItem("pea_code");
  const employeeId = sessionStorage.getItem("user") || "700001";

  // The authorized-district options come back as single letters; the corridor
  // data is keyed by region code.
  const convertDistrictCode = (districtCode) => {
    const districtMapping = {
      A: "N1", B: "N2", C: "N3",
      D: "NE1", E: "NE2", F: "NE3",
      G: "C1", H: "C2", I: "C3",
      J: "S1", K: "S2", L: "S3",
    };
    return districtMapping[districtCode] || districtCode;
  };

  const [selectedScenario, setSelectedScenario] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedAoj, setSelectedAoj] = useState("");
  const [selectedFeeder, setSelectedFeeder] = useState([]);
  // "" shows both lists; "vip" / "self" narrow it to one of them.
  const [selectedSpecial, setSelectedSpecial] = useState("");
  const [showAojOverlay, setShowAojOverlay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const region = convertDistrictCode(selectedDistrict);

  // Same scenarios as the upgrade page.
  const { data: scenarioOption } = useDraftScenarioOption();
  const { data: authorizedDistrictOption } = useAuthorizedDistrictOption(
    sessionPEACode,
    selectedScenario
  );
  const { data: authorizedAojOption } = useAuthorizedAojOption(
    sessionPEACode,
    selectedScenario,
    selectedDistrict
  );
  const authorizedAojOptionFormatted = authorizedAojOption?.map((option) => ({
    value: option.aoj_code,
    label: option.aoj_name,
  }));

  const { data: feederOption } = useFeederOption(
    selectedScenario,
    region,
    selectedAoj
  );
  const feederOptionFormatted = feederOption?.feeder_list?.map((option) => ({
    value: option["feeder_id"],
    label: option["feeder_id"],
  }));

  const handleChangeFeeder = (selectedOptions) => {
    setSelectedFeeder(
      selectedOptions ? selectedOptions.map((option) => option.value) : []
    );
  };

  const { data: geoAoj } = useGeoAoj(region, selectedAoj);
  const { data: geoCorridors } = useGeoCorridors(
    selectedScenario,
    region,
    selectedFeeder,
    selectedAoj,
    "",
    ""
  );
  const { data: corridorSummary, isLoading: isLoadingSummary } = useCorridorSummary(
    selectedScenario,
    region,
    selectedAoj,
    selectedFeeder
  );
  const { data: geoDevices } = useGeoDevices(region, selectedFeeder, selectedAoj, "");
  const { data: geoSub } = useGeoSub(selectedFeeder, selectedAoj, "");

  const { data: upgradeList } = useUpgradeCorridorList(region, selectedAoj);
  const { data: selfList } = useSelfCorridorList(region, selectedAoj);

  // Membership keyed the way both list tables are keyed.
  const listKey = (device, feeder) => `${device}||${feeder}`;
  const vipKeys = new Set(
    (Array.isArray(upgradeList) ? upgradeList : []).map((row) =>
      listKey(row.nearest_upstream_device, row.feeder_id_traced)
    )
  );
  const selfKeys = new Set(
    (Array.isArray(selfList) ? selfList : []).map((row) =>
      listKey(row.nearest_upstream_device, row.feeder_id_traced)
    )
  );

  // Membership comes from the two lists plus the live per-scenario edits
  // (upgrade / self_maintained). The pipeline's own vip/self columns are
  // deliberately ignored here: they are a snapshot of the lists taken when the
  // scenario ran, so a corridor removed today would otherwise stay on this map
  // until the next pipeline run.
  const corridorStatus = (properties) => {
    const key = listKey(
      properties.nearest_upstream_device,
      properties.feeder_id
    );
    return {
      vip: vipKeys.has(key) || isFlagOn(properties.upgrade),
      self: selfKeys.has(key) || isFlagOn(properties.self_maintained),
    };
  };

  const specialGeoJson = (() => {
    if (!geoCorridors?.features) return geoCorridors;
    const features = geoCorridors.features.filter((feature) => {
      const { vip, self } = corridorStatus(feature.properties || {});
      if (selectedSpecial === "vip") return vip;
      if (selectedSpecial === "self") return self;
      return vip || self;
    });
    return { ...geoCorridors, features };
  })();

  const combineGeoJson = (geo1, geo2) => {
    if (!geo1 && !geo2) return null;
    const features1 = geo1?.features || [];
    const features2 = geo2?.features || [];
    if (features1.length === 0 && features2.length === 0) return null;
    return { type: "FeatureCollection", features: [...features1, ...features2] };
  };

  const corridorGeoJson =
    selectedFeeder.length > 0 ? combineGeoJson(specialGeoJson, geoDevices) : null;

  const hasNoCorridors =
    selectedFeeder.length > 0 && specialGeoJson?.features?.length === 0;

  const matchedCount = specialGeoJson?.features?.length || 0;

  const refreshAfterChange = () => {
    queryClient.invalidateQueries(["upgradeCorridorList"]);
    queryClient.invalidateQueries(["selfCorridorList"]);
    queryClient.invalidateQueries(["geoCorridors"]);
    queryClient.invalidateQueries(["corridorPlan"]);
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
            scenario_name: properties.scenario_name || selectedScenario,
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
      refreshAfterChange();
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
            scenario_name: properties.scenario_name || selectedScenario,
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
      refreshAfterChange();
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
    const { vip, self } = corridorStatus(properties);
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

  return (
    <div>
      <NavbarComponent />
      <div className="header-container">จัดการ Corridor</div>
      <div className="main-container">
        <div className="dropdown-dropdown-container">
          <div className="dropdowngroup-container">
            <div className="filter-field">
              <label className="filter-label">แผนตัดต้นไม้ (แผนตรวจทาน)</label>
              <select
                value={selectedScenario}
                onChange={(event) => setSelectedScenario(event.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">เลือก Scenario แผนตัดต้นไม้/Reset</option>
                {scenarioOption?.map((option) => (
                  <option key={option.scenario_name} value={option.scenario_name}>
                    {option.scenario_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label">การไฟฟ้าเขต</label>
              <select
                value={selectedDistrict}
                onChange={(event) => setSelectedDistrict(event.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">เลือกการไฟฟ้าเขต</option>
                {authorizedDistrictOption?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label className="filter-label">การไฟฟ้าสาขา</label>
              <Select
                options={authorizedAojOptionFormatted}
                value={authorizedAojOptionFormatted?.find(
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
            </div>
            <div className="filter-field">
              <label className="filter-label">Feeder</label>
              <Select
                options={feederOptionFormatted}
                value={feederOptionFormatted?.filter((opt) =>
                  selectedFeeder.includes(opt.value)
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
            <div className="filter-field">
              <label className="filter-label">ประเภท Corridor พิเศษ</label>
              <select
                value={selectedSpecial}
                onChange={(event) => setSelectedSpecial(event.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">VIP และ SELF ทั้งหมด</option>
                {specialCorridorOptions
                  .filter((option) => option.value !== "special")
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </div>
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
        </div>

        <div className="remark">
          <p>
            แผนที่นี้แสดงเฉพาะ corridor ที่อยู่ในรายการ VIP หรือ SELF
            (พบ {matchedCount} corridor) คลิกที่ corridor เพื่อตรึงข้อมูลไว้
            แล้วกดปุ่มในกล่องข้อมูลเพื่อนำออกจากรายการ
          </p>
        </div>

        <CorridorSummaryCards
          summary={corridorSummary}
          hasRegion={Boolean(region)}
          isLoading={isLoadingSummary}
        />

        <div className="map-container">
          <MapEmptyNotice show={hasNoCorridors} />
          <GeoMap
            geoJsonPoints={geoDevices}
            geoSubPoints={geoSub}
            geoJsonData={corridorGeoJson}
            aojGeoJson={showAojOverlay ? geoAoj : null}
            colorMode="frequency"
            showLegend={true}
            pinOnClick={true}
            renderCorridorActions={renderCorridorActions}
          />
        </div>
      </div>
    </div>
  );
};

export default CorridorManage;
