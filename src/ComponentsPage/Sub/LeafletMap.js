import React, { useEffect, useRef, useState } from "react";
import Map, { Source, Layer } from "react-map-gl";
import maplibregl from "maplibre-gl";
import bbox from "@turf/bbox";
import "maplibre-gl/dist/maplibre-gl.css";

const THAILAND_GEOJSON_URL = "/json/Thailand.geojson";

const EMPTY_STYLE = {
  version: 8,
  sources: {},
  layers: [],
};

const fillLayer = {
  id: "geojson-fill",
  type: "fill",
  paint: {
    "fill-color": "#A5158C",
    "fill-opacity": 0.3,
  },
};

const outlineLayer = {
  id: "geojson-outline",
  type: "line",
  paint: {
    "line-color": "#A5158C",
    "line-width": 3,
  },
};

const thailandOutlineLayer = {
  id: "thailand-outline",
  type: "line",
  paint: {
    "line-color": "#A5158C",
    "line-width": 3,
  },
};

const MapWithLines = ({ geoJsonData, showThailand = true }) => {
  const mapRef = useRef();
  const [thailandGeoJson, setThailandGeoJson] = useState(null);
  const [hasZoomedToThailand, setHasZoomedToThailand] = useState(false);

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
  }, [geoJsonData]);

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

      {/* Dynamic GeoJSON overlay */}
      {geoJsonData && (
        <Source id="geojson-source" type="geojson" data={geoJsonData}>
          <Layer {...fillLayer} />
          <Layer {...outlineLayer} />
        </Source>
      )}
    </Map>
  );
};

export default MapWithLines;