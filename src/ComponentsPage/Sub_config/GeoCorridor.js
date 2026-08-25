// Shared configuration for corridor GeoJSON features returned by
// /get_geo_corridors and /get_geo_corridors_discovery.

// Thai labels for corridor feature properties shown in the map popup.
// Keys not listed here fall back to the raw column name.
export const corridorPropertyLabels = {
  // identity
  aoj_region: "เขต",
  aoj_code: "รหัส กฟฟ.",
  aoj_name: "กฟฟ.",
  feeder_id: "Feeder",
  nearest_upstream_device: "รหัส Corridor",
  raw_device_type: "อุปกรณ์",
  corridor_length_km: "ระยะทาง (km)",
  // planning
  frequency: "ความถี่ในการตัด",
  frequency_number: "ความถี่ในการตัด",
  probability_of_outage_bins: "ความเสี่ยงไฟดับจากต้นไม้",
  customers_affected_adjusted_bins: "จำนวนลูกค้าที่ได้ผลกระทบ",
  upgrade: "ประสงค์ขอเพิ่มความถี่",
  reason: "เหตุผล",
  // added 2026-08 alongside the density source filter
  density_distribution_mjm: "ความหนาแน่นพืชพรรณ (MJM)",
  density_distribution_sat: "ความหนาแน่นพืชพรรณ (ดาวเทียม)",
  calibration_status: "แหล่งข้อมูลความหนาแน่น",
  rate_card_thb_per_km: "ค่าตัดต่อระยะทาง (บาท/km)",
  line_global_ids: "รหัสสายไฟ (GlobalID)",
};

export const getCorridorPropertyLabel = (key) =>
  corridorPropertyLabels[key] || key;

// Maximum list entries rendered inline in the popup before it is summarised.
const MAX_LIST_PREVIEW = 3;

// The API parses these columns into real dicts/lists (api/data_utils.py), but
// MapLibre re-serialises non-scalar feature properties to JSON text when they
// are read back off a queried feature, so a value may arrive either way.
const parseStructured = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
};

const isEmpty = (value) =>
  value === null || value === undefined || value === "";

// Flattens a dict column to "open: 0.02 km, dense: 1.4 km".
const flattenDict = (dict) => {
  const entries = Object.entries(dict).filter(([, v]) => !isEmpty(v));
  if (entries.length === 0) return "-";
  return entries.map(([k, v]) => `${k}: ${v}`).join(", ");
};

// Full flattening, no truncation. Use for table cells and Excel export, where
// json_to_sheet would otherwise write "[object Object]".
export const formatCorridorCellValue = (value) => {
  if (isEmpty(value)) return "-";

  const structured = parseStructured(value);
  if (Array.isArray(structured)) {
    return structured.length ? structured.join(", ") : "-";
  }
  if (structured) return flattenDict(structured);

  return String(value);
};

// Popup variant: same flattening, but long lists are summarised so a corridor
// with many line_global_ids cannot stretch the hover popup down the map.
export const formatCorridorPropertyValue = (value) => {
  if (isEmpty(value)) return "-";

  const structured = parseStructured(value);
  if (Array.isArray(structured)) {
    if (structured.length === 0) return "-";
    if (structured.length <= MAX_LIST_PREVIEW) return structured.join(", ");
    return `${structured.slice(0, MAX_LIST_PREVIEW).join(", ")} … (รวม ${structured.length} รายการ)`;
  }
  if (structured) return flattenDict(structured);

  return String(value);
};

// The columns added to F8_processed_corridor_features alongside the density
// source filter, shared by the corridor tables and their Excel export so the
// two never drift apart. `field` is the raw /api/corridor_table column.
export const newCorridorColumns = [
  { key: "densitySource", field: "calibration_status" },
  { key: "densityMjm", field: "density_distribution_mjm" },
  { key: "densitySat", field: "density_distribution_sat" },
  { key: "rateCard", field: "rate_card_thb_per_km" },
  { key: "lineGlobalIds", field: "line_global_ids" },
].map((column) => ({ ...column, label: getCorridorPropertyLabel(column.field) }));

// Flattens the new columns off a corridor_table row into table-ready strings.
// The dict columns must not reach a <td> as objects (React refuses to render
// them) or json_to_sheet (which would write "[object Object]").
export const mapNewCorridorColumns = (item) =>
  newCorridorColumns.reduce((acc, column) => {
    acc[column.key] = formatCorridorCellValue(item[column.field]);
    return acc;
  }, {});

// Header entries in the shape downloadTable() expects.
export const newCorridorExportHeaders = newCorridorColumns.map(
  ({ label, key }) => ({ label, key })
);
