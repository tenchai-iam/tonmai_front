import React, { useEffect, useRef, useState, useMemo } from "react";
import Map, { Source, Layer, Popup } from "react-map-gl";
import maplibregl from "maplibre-gl";
import bbox from "@turf/bbox";

import "maplibre-gl/dist/maplibre-gl.css";
import "../../ComponentsStyles/Map.css";
import {
  getCorridorPropertyLabel,
  formatCorridorPropertyValue,
} from "../Sub_config/GeoCorridor.js";

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

const aojFillLayer = {
  id: "aoj-fill",
  type: "fill",
  paint: {
    "fill-color": "#1a6fba",
    "fill-opacity": 0.25,
  },
};

const aojOutlineLayer = {
  id: "aoj-outline",
  type: "line",
  paint: {
    "line-color": "#1a6fba",
    "line-width": 2,
  },
};

const GeoMap = ({
  geoJsonData,
  geoJsonPoints,
  geoSubPoints,
  aojGeoJson,
  showThailand = true,
  colorMode,
  showLegend,
}) => {
  const mapRef = useRef();
  const [thailandGeoJson, setThailandGeoJson] = useState(null);
  const [hasZoomedToThailand, setHasZoomedToThailand] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [subInfo, setSubInfo] = useState(null);
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
                1,
                "#2ecc71",
                2,
                "#f1c40f",
                3,
                "#e74c3c",
                "#999",
              ]
            : [
                "match",
                ["get", "probability_of_outage_bins"],
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
      "circle-radius": 7,
      "circle-color": [
        "match",
        ["get", "device_type"],
        "Recloser", "#e74c3c",      // Red
        "Switch", "#3498db",         // Blue
        "Fuse", "#f39c12",           // Orange
        "Circuit Breaker", "#9b59b6", // Purple
        "#95a5a6"                    // Gray default
      ],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  };

  const deviceLegend = (
    <div className="legend device-legend">
      <p>ประเภทอุปกรณ์ (Device Type)</p>
      <ul>
        <li>
          <span style={{ backgroundColor: "#e74c3c" }}></span> Recloser
        </li>
        <li>
          <span style={{ backgroundColor: "#3498db" }}></span> Switch
        </li>
        <li>
          <span style={{ backgroundColor: "#f39c12" }}></span> Fuse
        </li>
        <li>
          <span style={{ backgroundColor: "#9b59b6" }}></span> Circuit Breaker
        </li>
      </ul>
    </div>
  );

  const subPointLayer = {
    id: "sub-point-layer",
    type: "symbol",
    layout: {
      "icon-image": "square-icon",
      "icon-size": 0.5,
      "icon-allow-overlap": true,
    },
  };

  const subLegend = (
    <div className="legend sub-legend">
      <p>Substation</p>
      <ul>
        <li>
          <span style={{ backgroundColor: "#27ae60", borderRadius: 0 }}></span> Substation
        </li>
      </ul>
    </div>
  );

  // Create square icon when map loads
  const handleMapLoad = (e) => {
    const map = e.target;
    if (!map.hasImage("square-icon")) {
      const size = 32;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      // Draw square with border
      ctx.fillStyle = "#27ae60";
      ctx.fillRect(2, 2, size - 4, size - 4);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, size - 4, size - 4);

      map.addImage("square-icon", { width: size, height: size, data: ctx.getImageData(0, 0, size, size).data });
    }
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
      onLoad={handleMapLoad}
      onMouseMove={(e) => {
        // Look for sub point first
        const subFeature = e.features?.find(
          (f) => f.layer.id === "sub-point-layer"
        );
        if (subFeature) {
          setSubInfo({
            lngLat: e.lngLat,
            properties: subFeature.properties,
          });
          setDeviceInfo(null);
          setCorridorInfo(null);
          return;
        }

        // Look for device point
        const deviceFeature = e.features?.find(
          (f) => f.layer.id === "device-point-layer"
        );
        if (deviceFeature) {
          setDeviceInfo({
            lngLat: e.lngLat,
            properties: deviceFeature.properties,
          });
          setSubInfo(null);
          setCorridorInfo(null);
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
          setDeviceInfo(null);
          setSubInfo(null);
          return;
        }

        // Clear all popups if none found
        setDeviceInfo(null);
        setSubInfo(null);
        setCorridorInfo(null);
      }}
      interactiveLayerIds={["sub-point-layer", "device-point-layer", "geojson-outline"]}
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
      {geoJsonPoints?.features?.length > 0 && (
        <Source id="geojson-points-source" type="geojson" data={geoJsonPoints}>
          <Layer {...devicePointLayer} />
        </Source>
      )}

      {/* ✅ Substation/Connector (square points) */}
      {geoSubPoints?.features?.length > 0 && (
        <Source id="geojson-sub-source" type="geojson" data={geoSubPoints}>
          <Layer {...subPointLayer} />
        </Source>
      )}

      {/* Dynamic GeoJSON overlay */}
      {geoJsonData && (
        <Source id="geojson-source" type="geojson" data={geoJsonData}>
          <Layer {...fillLayer} />
          <Layer {...outlineLayer} />
        </Source>
      )}

      {/* AOJ overlay */}
      {aojGeoJson && (
        <Source id="aoj-source" type="geojson" data={aojGeoJson}>
          <Layer {...aojFillLayer} />
          <Layer {...aojOutlineLayer} />
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

      {subInfo && (
        <Popup
          longitude={subInfo.lngLat.lng}
          latitude={subInfo.lngLat.lat}
          closeOnClick={false}
          onClose={() => setSubInfo(null)}
        >
          <div>
            {Object.entries(subInfo.properties).map(([key, value]) => (
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
          className="corridor-popup"
          longitude={corridorInfo.lngLat.lng}
          latitude={corridorInfo.lngLat.lat}
          closeOnClick={false}
          onClose={() => setCorridorInfo(null)}
          anchor="top"
        >
          <div>
            {Object.entries(corridorInfo.properties)
              .filter(([key]) => key !== "scenario_name") // ⛔ exclude this key
              .map(([key, value]) => (
                <div key={key}>
                  <strong>{getCorridorPropertyLabel(key)}</strong>:{" "}
                  {formatCorridorPropertyValue(value)}
                </div>
              ))}
          </div>
        </Popup>
      )}

      {/* Legend inside Map */}
      {showLegend && colorMode === "frequency" && frequencyLegend}
      {showLegend && colorMode === "risk" && riskLegend}
      {showLegend && geoJsonPoints?.features?.length > 0 && deviceLegend}
      {showLegend && geoSubPoints?.features?.length > 0 && subLegend}
    </Map>
  );
};

export default GeoMap;
