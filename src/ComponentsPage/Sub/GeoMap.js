import React, { useEffect, useRef, useState, useMemo } from "react";
import Map, { Source, Layer, Popup } from "react-map-gl";
import maplibregl from "maplibre-gl";
import bbox from "@turf/bbox";

import "maplibre-gl/dist/maplibre-gl.css";
import "../../ComponentsStyles/Map.css";

const THAILAND_GEOJSON_URL = "/json/Thailand.geojson";

const EMPTY_STYLE = {
  version: 8,
  sources: {},
  layers: [],
};

const thailandOutlineLayer = {
  id: "thailand-outline",
  type: "line",
  paint: {
    "line-color": "#A5158C",
    "line-width": 3,
  },
};

const GeoMap = ({
  geoJsonData,
  geoJsonPoints,
  showThailand = true,
  colorMode,
  showLegend,
}) => {
  const mapRef = useRef();
  const [thailandGeoJson, setThailandGeoJson] = useState(null);
  const [hasZoomedToThailand, setHasZoomedToThailand] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [corridorInfo, setCorridorInfo] = useState(null);

  const frequencyLegend = (
    <div className="legend">
      <p>จำนวนครั้งในการตัดต่อปี (Trimming Frequency) </p>
      <ul>
        <li>
          <span style={{ backgroundColor: "#2ecc71" }}></span> 1 ครั้ง
        </li>
        <li>
          <span style={{ backgroundColor: "#f1c40f" }}></span> 2 ครั้ง
        </li>
        <li>
          <span style={{ backgroundColor: "#e74c3c" }}></span> 3 ครั้ง
        </li>
        {/* <li>
          <span style={{ backgroundColor: "#999" }}></span> อื่น ๆ
        </li> */}
      </ul>
    </div>
  );

  const riskLegend = (
    <div className="legend">
      <p>ความเสี่ยงในการเกิดไฟดับ (Risk)</p>
      <ul>
        <li>
          <span style={{ backgroundColor: "#2ecc71" }}></span> ต่ำ (Low)
        </li>
        <li>
          <span style={{ backgroundColor: "#f1c40f" }}></span> กลาง (Medium)
        </li>
        <li>
          <span style={{ backgroundColor: "#e74c3c" }}></span> สูง (High)
        </li>
        {/* <li>
          <span style={{ backgroundColor: "#999" }}></span> อื่น ๆ
        </li> */}
      </ul>
    </div>
  );

  const fillLayer = useMemo(
    () => ({
      id: "geojson-fill",
      type: "fill",
      paint: {
        "fill-color": "#A5158C",
        "fill-opacity": 0.3,
      },
    }),
    []
  );

  const outlineLayer = useMemo(
    () => ({
      id: "geojson-outline",
      type: "line",
      paint: {
        "line-color":
          colorMode === "frequency"
            ? [
                "match",
                ["get", "frequency"],
                "T1",
                "#2ecc71",
                "T2",
                "#f1c40f",
                "T3",
                "#e74c3c",
                "#999",
              ]
            : [
                "match",
                ["get", "probability_of_outage_pct"],
                "low",
                "#2ecc71",
                "medium",
                "#f1c40f",
                "high",
                "#e74c3c",
                "#999",
              ],
        "line-width": 3,
      },
    }),
    [colorMode]
  );

  // Load Thailand boundary GeoJSON (if enabled)
  useEffect(() => {
    if (showThailand) {
      fetch(THAILAND_GEOJSON_URL)
        .then((res) => res.json())
        .then((data) => setThailandGeoJson(data));
    }
  }, [showThailand]);

  // Zoom to Thailand boundary on initial load
  useEffect(() => {
    if (
      showThailand &&
      thailandGeoJson &&
      mapRef.current &&
      !geoJsonData &&
      !hasZoomedToThailand
    ) {
      const bounds = bbox(thailandGeoJson);
      mapRef.current.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        { padding: 50, duration: 0 }
      );
      setHasZoomedToThailand(true);
    }
  }, [thailandGeoJson, showThailand, geoJsonData, hasZoomedToThailand]);

  // Zoom to GeoJSON when it changes
  // useEffect(() => {
  //   if (geoJsonData?.features?.length && mapRef.current) {
  //     const bounds = bbox(geoJsonData);
  //     mapRef.current.fitBounds(
  //       [
  //         [bounds[0], bounds[1]],
  //         [bounds[2], bounds[3]],
  //       ],
  //       { padding: 50, duration: 1000 }
  //     );
  //   }
  // }, [geoJsonData]);

  useEffect(() => {
    if (geoJsonData?.features?.length && mapRef.current) {
      const bounds = bbox(geoJsonData);
      mapRef.current.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        { padding: 50, duration: 1000 }
      );
    }
  }, [geoJsonData]); // <-- pass this prop down from parent

  const devicePointLayer = {
    id: "device-point-layer",
    type: "circle",
    paint: {
      "circle-radius": 5,
      "circle-color": "#007cbf",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  };

  return (
    <Map
      ref={mapRef}
      mapLib={maplibregl}
      mapStyle={EMPTY_STYLE}
      initialViewState={{
        longitude: 100.9925,
        latitude: 9.1,
        zoom: 4.5,
      }}
      style={{ height: "600px", width: "100%" }}
      onMouseMove={(e) => {
        // Look for device point first
        const deviceFeature = e.features?.find(
          (f) => f.layer.id === "device-point-layer"
        );
        if (deviceFeature) {
          setDeviceInfo({
            lngLat: e.lngLat,
            properties: deviceFeature.properties,
          });
          setCorridorInfo(null); // Clear polygon popup
          return;
        }

        // Look for polygon feature ONLY on outline layer
        const polygonFeature = e.features?.find(
          (f) => f.layer.id === "geojson-outline"
        );
        if (polygonFeature) {
          setCorridorInfo({
            lngLat: e.lngLat,
            properties: polygonFeature.properties,
          });
          setDeviceInfo(null); // Clear device popup
          return;
        }

        // Clear all popups if none found
        setDeviceInfo(null);
        setCorridorInfo(null);
      }}
      interactiveLayerIds={["device-point-layer", "geojson-outline"]}
    >
      {/* Esri satellite imagery */}
      <Source
        id="esri-imagery"
        type="raster"
        tiles={[
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ]}
        tileSize={256}
      >
        <Layer id="esri-layer" type="raster" paint={{}} />
      </Source>

      {/* Thailand boundary */}
      {showThailand && thailandGeoJson && (
        <Source id="thailand-boundary" type="geojson" data={thailandGeoJson}>
          <Layer {...thailandOutlineLayer} />
        </Source>
      )}

      {/* ✅ Devices (points) */}
      {geoJsonPoints && (
        <Source id="geojson-points-source" type="geojson" data={geoJsonPoints}>
          <Layer {...devicePointLayer} />
        </Source>
      )}

      {/* Dynamic GeoJSON overlay */}
      {geoJsonData && (
        <Source id="geojson-source" type="geojson" data={geoJsonData}>
          <Layer {...fillLayer} />
          <Layer {...outlineLayer} />
        </Source>
      )}

      {deviceInfo && (
        <Popup
          longitude={deviceInfo.lngLat.lng}
          latitude={deviceInfo.lngLat.lat}
          closeOnClick={false}
          onClose={() => setDeviceInfo(null)}
        >
          <div>
            {Object.entries(deviceInfo.properties).map(([key, value]) => (
              <div key={key}>
                <strong>{key}</strong>: {value}
              </div>
            ))}
          </div>
        </Popup>
      )}

      {/* Polygon feature popup */}
      {corridorInfo && (
        <Popup
          longitude={corridorInfo.lngLat.lng}
          latitude={corridorInfo.lngLat.lat}
          closeOnClick={false}
          onClose={() => setCorridorInfo(null)}
          anchor="top"
        >
          <div>
            {Object.entries(corridorInfo.properties).map(([key, value]) => (
              <div key={key}>
                <strong>{key}</strong>: {String(value)}
              </div>
            ))}
          </div>
        </Popup>
      )}

      {/* Legend inside Map */}
      {showLegend && colorMode === "frequency" && frequencyLegend}
      {showLegend && colorMode === "risk" && riskLegend}
    </Map>
  );
};

export default GeoMap;
