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
  device_type: "อุปกรณ์",
  cost_to_trim_model: "ค่าใช้จ่ายตัดต้นไม้ต่อครั้ง",
  // Annual cost: the per-trim cost x trims per year, capped at two by design
  // (a T3 corridor is budgeted as T2).
  cost_to_trim_budget: "ค่าใช้จ่ายตัดต้นไม้ (บาท)",
  customers_affected_adjusted: "จำนวนลูกค้ากระทบ",
  // planning
  frequency: "ความถี่ในการตัด",
  frequency_number: "ความถี่ในการตัด",
  probability_of_outage_bins: "ความเสี่ยงไฟดับจากต้นไม้",
  customers_affected_adjusted_bins: "จำนวนลูกค้าที่ได้ผลกระทบ",
  upgrade: "ประสงค์ขอเพิ่มความถี่",
  reason: "เหตุผล",
  // VIP / SELF. `vip` and `self` ("Yes"/"No") start as what the pipeline saw in
  // the F8 upgrade and self lists when the scenario ran, and the update
  // endpoints move them with `upgrade` / `self_maintained`, the live edits made
  // on this scenario since.
  vip: "VIP corridor",
  vip_reason: "เหตุผล VIP",
  self: "ดำเนินการตัดเอง (SELF)",
  self_maintained: "ประสงค์ดำเนินการตัดเอง",
  // added 2026-08 alongside the density source filter
  density_distribution_model: "ความหนาแน่นต้นไม้ (calibrated)",
  density_distribution_mjm: "ความหนาแน่นต้นไม้ (mjm)",
  risk_customer_interruptions_bins: "ระดับผลกระทบจากไฟดับ",
  density_distribution_sat: "ความหนาแน่นต้นไม้ (ดาวเทียม)",
  calibration_status: "แหล่งข้อมูลความหนาแน่น",
  rate_card_thb_per_km: "ค่าตัดต่อระยะทาง (บาท/km)",
  line_global_ids: "รหัสสายไฟ (GlobalID)",
};

export const getCorridorPropertyLabel = (key) =>
  corridorPropertyLabels[key] || key;

// Never shown in the corridor popup: the scenario is already chosen in the
// filters, and the office columns repeat what the office picker says.
const corridorHiddenProperties = new Set([
  "scenario_name",
  "aoj_code",
  "aoj_name",
  // The live-edit twins of vip / self; one line each is enough.
  "upgrade",
  "self_maintained",
  "vegetation_density",
  "frequency_number",
  // Line ids stay in the tables and the Excel export, not the hover popup.
  "line_global_ids",
]);

// The fields worth reading first, in this order. Anything not listed keeps its
// original (alphabetical) position after them.
const corridorPropertyOrder = [
  "feeder_id",
  "nearest_upstream_device",
  "corridor_length_km",
  // Likelihood, then who is affected, then the product of the two.
  "probability_of_outage_bins",
  "customers_affected_adjusted",
  "risk_customer_interruptions_bins",
  "vip",
  "vip_reason",
  "self",
  // Reads as the sum it is: cost per trim x trims per year = annual cost.
  "cost_to_trim_model",
  "frequency",
  "cost_to_trim_budget",
  "calibration_status",
  "density_distribution_model",
  "density_distribution_mjm",
  "density_distribution_sat",
  "device_type",
  "rate_card_thb_per_km",
];

// [key, value] pairs for the popup: hidden fields dropped, the ordered fields
// first, the rest left as they arrive.
export const orderCorridorProperties = (properties) => {
  const entries = Object.entries(properties || {}).filter(
    ([key]) => !corridorHiddenProperties.has(key)
  );
  const rank = (key) => {
    const index = corridorPropertyOrder.indexOf(key);
    return index === -1 ? corridorPropertyOrder.length : index;
  };
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => rank(a.entry[0]) - rank(b.entry[0]) || a.index - b.index)
    .map(({ entry }) => entry);
};

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

// Missing values reach the popup as null, as an absent key, or - once a
// feature has been through MapLibre - as the strings "null"/"None"/"NaN".
// All of them read as a dash.
const EMPTY_STRINGS = new Set(["", "null", "none", "nan", "undefined"]);
const isEmpty = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === "number" && Number.isNaN(value)) ||
  (typeof value === "string" && EMPTY_STRINGS.has(value.trim().toLowerCase()));

// Flag columns arrive as booleans (upgrade, self_maintained), "Yes"/"No"
// (vip, self) or, off a MapLibre feature, as the strings "true"/"false".
const TRUE_FLAGS = new Set([true, 1, "1", "true", "True", "Yes", "yes"]);
const FALSE_FLAGS = new Set([false, 0, "0", "false", "False", "No", "no"]);
const isTrueFlag = (value) => TRUE_FLAGS.has(value);

// Only these render as a tick/cross in the popup. Numbers are deliberately
// excluded: a frequency of 1 or a count of 0 must stay a number, even though
// the filter predicates above accept 1/0 for the upgrade flag.
const DISPLAY_TRUE = new Set([true, "true", "True", "Yes", "yes"]);
const DISPLAY_FALSE = new Set([false, "false", "False", "No", "no"]);
const isFlag = (value) => DISPLAY_TRUE.has(value) || DISPLAY_FALSE.has(value);
const formatFlag = (value) => (DISPLAY_TRUE.has(value) ? "✓" : "✗");

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
  if (isFlag(value)) return formatFlag(value);

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
  // The id list has no spaces, so without a cap it forces the whole table
  // wider than the page. cell-ids fixes the width and shows the full list on
  // hover; the Excel export still gets every id.
  { key: "lineGlobalIds", field: "line_global_ids", className: "cell-ids" },
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

// ---------------------------------------------------------------------------
// Special corridors (VIP / SELF)
//
// A corridor counts as VIP when the pipeline flagged it (`vip` = "Yes") or a
// user has requested the upgrade on this scenario since (`upgrade`), and as
// SELF when the pipeline flagged it (`self` = "Yes") or a user has marked it
// self-maintained since (`self_maintained`, `selfMaintained` on table rows).
// The same predicates serve GeoJSON feature properties and corridor_table rows.
// True for a flag column in any of the shapes the API and MapLibre produce.
export const isFlagOn = (value) => isTrueFlag(value);

export const isVipCorridor = (item) =>
  Boolean(item) && (isTrueFlag(item.vip) || isTrueFlag(item.upgrade));

export const isSelfCorridor = (item) =>
  Boolean(item) &&
  (isTrueFlag(item.self) ||
    isTrueFlag(item.self_maintained) ||
    isTrueFlag(item.selfMaintained));

// Options for the "special corridor" filter. "" (no filter) is the page's own
// placeholder option.
export const specialCorridorOptions = [
  { value: "vip", label: "VIP" },
  { value: "self", label: "ดำเนินการตัดเอง (SELF)" },
  { value: "special", label: "VIP หรือ SELF" },
];

export const matchesSpecialCorridor = (item, mode) => {
  if (!mode) return true;
  if (mode === "vip") return isVipCorridor(item);
  if (mode === "self") return isSelfCorridor(item);
  return isVipCorridor(item) || isSelfCorridor(item);
};

export const filterSpecialCorridors = (rows, mode) =>
  !mode || !Array.isArray(rows)
    ? rows
    : rows.filter((row) => matchesSpecialCorridor(row, mode));

// Keeps only matching corridor features; devices are combined in afterwards
// by the pages, so they are never filtered here.
export const filterGeoJsonSpecial = (geojson, mode) => {
  if (!mode || !geojson?.features) return geojson;
  return {
    ...geojson,
    features: geojson.features.filter((feature) =>
      matchesSpecialCorridor(feature.properties || {}, mode)
    ),
  };
};
