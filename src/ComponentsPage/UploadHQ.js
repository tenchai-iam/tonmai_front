import React, { useState, useRef } from "react";
import NavbarComponent from "../ComponentsPage/NavbarComponent";
import axios from "axios";
import File from "../pic/File.svg";
import UploadButton from "../pic/Upload.svg";

import "../ComponentsStyles/Dashboard.css";
import "../ComponentsStyles/upload.css";

const API_URL = process.env.REACT_APP_API_URL;

const UploadHQ = () => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadStatusHQ, setUploadStatusHQ] = useState("");
  const [uploadStatusDistrict, setUploadStatusDistrict] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRefs = useRef({});
  const formRefs = useRef({});

  // Configuration for each upload section
  const uploadSectionsGeneral = [
    {
      title: "ข้อมูล Zone Mapping",
      endpoint: `${API_URL}/UP_zone_mapping`,
      downloadEndpoint: `${API_URL}/DW_zone_mapping`, // Add a download API
      filename: "zone_mapping.xlsx",
    },
  ];

  const uploadSectionsTransformer = [
    {
      title: "ข้อมูล Structural_Data_Health_and_Importance_Central_region",
      endpoint: `${API_URL}/UP_Structural_Data_Health_and_Importance_Central_region`,
      downloadEndpoint: `${API_URL}/DW_Structural_Data_Health_and_Importance_Central_region`, // Add a download API
      filename: "Structural_Data_Health_and_Importance_Central_region.xlsx",
    },
    {
      title: "ข้อมูล Structural_Data_Health_and_Importance_N_NE_S_region",
      endpoint: `${API_URL}/UP_Structural_Data_Health_and_Importance_N_NE_S_region`,
      downloadEndpoint: `${API_URL}/DW_Structural_Data_Health_and_Importance_N_NE_S_region`, // Add a download API
      filename: "Structural_Data_Health_and_Importance_N_NE_S_region.xlsx",
    },
    {
      title: "ข้อมูล Structural_Data_Health_and_Importance",
      endpoint: `${API_URL}/UP_Structural_Data_Health_and_Importance`,
      downloadEndpoint: `${API_URL}/DW_Structural_Data_Health_and_Importance`, // Add a download API
      filename: "Structural_Data_Health_and_Importance.xlsx",
    },
    {
      title: "ข้อมูล Health_and_Importance_29",
      endpoint: `${API_URL}/UP_Health_and_Importance_29`,
      downloadEndpoint: `${API_URL}/DW_Health_and_Importance_29`, // Add a download API
      filename: "Health_and_Importance_29.xlsx",
    },
    {
      title: "ข้อมูล Health_and_Importance_Major_Defects",
      endpoint: `${API_URL}/UP_Health_and_Importance_Major_Defects`,
      downloadEndpoint: `${API_URL}/DW_Health_and_Importance_Major_Defects`, // Add a download API
      filename: "Health_and_Importance_Major_Defects.xlsx",
    },
    {
      title: "ข้อมูล Measurement_data",
      endpoint: `${API_URL}/UP_Measurement_data`,
      downloadEndpoint: `${API_URL}/DW_Measurement_data`, // Add a download API
      filename: "Measurement_data.xlsx",
    },
    {
      title: "ข้อมูล Feeder_TP_Mapping",
      endpoint: `${API_URL}/UP_Feeder_TP_Mapping`,
      downloadEndpoint: `${API_URL}/DW_Feeder_TP_Mapping`, // Add a download API
      filename: "Feeder_TP_Mapping.xlsx",
    },
    {
      title: "ข้อมูล Redundancy Transformer",
      endpoint: `${API_URL}/UP_redundancy_tr`,
      downloadEndpoint: `${API_URL}/DW_redundancy_tr`, // Add a download API
      filename: "Redundancy_tr.xlsx",
    },
    {
      title: "ข้อมูล Unplanned_outage",
      endpoint: `${API_URL}/UP_unplanned_outage`,
      downloadEndpoint: `${API_URL}/DW_unplanned_outage`, // Add a download API
      filename: "Unplanned_outage.xlsx",
    },
    {
      title: "ข้อมูล Transformer replace list",
      endpoint: `${API_URL}/UP_Transformer_replace_list_PEA_rev_1`,
      downloadEndpoint: `${API_URL}/DW_Transformer_replace_list_PEA_rev_1`, // Add a download API
      filename: "Transformer_replace_list.xlsx",
    },
    {
      title: "ข้อมูล PTMS GUI",
      endpoint: `${API_URL}/UP_PTMS_GUI`,
      downloadEndpoint: `${API_URL}/DW_PTMS_GUI`, // Add a download API
      filename: "PTMS_GUI.xlsx",
    },
  ];

  const uploadSectionsSwitchGear = [
    {
      title: "ข้อมูล Structural SWG",
      endpoint: `${API_URL}/cb_new_structural`,
      downloadEndpoint: `${API_URL}/cb_new_structural`, // Add a download API
      filename: "CB_new_structural.xlsx",
    },
    {
      title: "ข้อมูล Measurement SWG",
      endpoint: `${API_URL}/measurement_cb`,
      downloadEndpoint: `${API_URL}/measurement_cb`, // Add a download API
      filename: "Measurement_cb.xlsx",
    },
    {
      title: "ข้อมูล Structural SWG เขต",
      endpoint: `${API_URL}/cb_new_structural_district`,
      downloadEndpoint: `${API_URL}/cb_new_structural_district`, // Add a download API
      filename: "CB_new_structural_district.xlsx",
    },
    {
      title: "ข้อมูล Measurement SWG เขต",
      endpoint: `${API_URL}/measurement_cb_district`,
      downloadEndpoint: `${API_URL}/measurement_cb_district`, // Add a download API
      filename: "Measurement_cb_district.xlsx",
    },
    {
      title: "ข้อมูล Renovation by brand",
      endpoint: `${API_URL}/renovation_by_brand`,
      downloadEndpoint: `${API_URL}/renovation_by_brand`, // Add a download API
      filename: "Renovation_by_brand.xlsx",
    },
    {
      title: "ข้อมูล Replacement_swg_22_2026",
      endpoint: `${API_URL}/replacement_swg_22_2026`,
      downloadEndpoint: `${API_URL}/replacement_swg_22_2026`, // Add a download API
      filename: "Replacement_swg_22_2026.xlsx",
    },
  ];

  const handleFileChange = (event, key) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [key]: event.target.files[0],
    }));
  };

  const handleUpload = async (event, key, endpoint) => {
    event.preventDefault();

    const file = selectedFiles[key];
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    setUploadStatus(""); // Reset status before new upload

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus(response.data.message || "Upload successful!");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(
        error.response?.data?.message || "Failed to upload the file."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (downloadEndpoint, fileName) => {
    try {
      const response = await fetch(downloadEndpoint, {
        method: "GET", // Change to POST
        // headers: {
        //   "Content-Type": "application/json",
        // },
        // body: JSON.stringify({ excel: 1 }), // Send { value: 1 }
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div>
      <NavbarComponent />
      <div className="text-dropdown-container">
        <div className="header-title">จัดการข้อมูลส่วนกลาง</div>
      </div>
      <div className="upload-container">
        <div className="header-title">ข้อมูลทั่วไป</div>
        <div className="upload-container-L1">
          {uploadSectionsGeneral.map((section, index) => {
            const key = `general-${index}`;
            return (
              <div key={key} className="upload-module">
                <div className="title-download-container">
                  <h1 className="upload-title">{section.title}</h1>
                  {section.downloadEndpoint && section.filename && (
                    <button
                      className="download-button"
                      onClick={() =>
                        handleDownload(
                          section.downloadEndpoint,
                          section.filename
                        )
                      }
                    >
                      Download Template
                    </button>
                  )}
                </div>
                <form
                  ref={(el) => (formRefs.current[key] = el)}
                  onSubmit={(event) =>
                    handleUpload(event, key, section.endpoint)
                  }
                  className="form-container"
                >
                  <input
                    type="file"
                    ref={(el) => (fileInputRefs.current[key] = el)}
                    onChange={(event) => handleFileChange(event, key)}
                    style={{ display: "none" }}
                  />
                  <img
                    src={File}
                    alt="Select File"
                    className="file-image"
                    onClick={() => fileInputRefs.current[key]?.click()}
                  />
                  {selectedFiles[key] && (
                    <p>Selected: {selectedFiles[key].name}</p>
                  )}
                  <img
                    src={UploadButton}
                    alt="Upload"
                    className="upload-button-image"
                    onClick={() => formRefs.current[key]?.requestSubmit()}
                    disabled={isLoading}
                  />
                </form>
              </div>
            );
          })}
          {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
        </div>
        <div className="header-title">ข้อมูลเฉพาะของ Transformer</div>
        <div className="upload-container-L1">
          {uploadSectionsTransformer.map((section, index) => {
            const key = `transformer-${index}`;
            return (
              <div key={key} className="upload-module">
                <div className="title-download-container">
                  <h1 className="upload-title">{section.title}</h1>
                  {section.downloadEndpoint && section.filename && (
                    <button
                      className="download-button"
                      onClick={() =>
                        handleDownload(
                          section.downloadEndpoint,
                          section.filename
                        )
                      }
                    >
                      Download Template
                    </button>
                  )}
                </div>
                <form
                  ref={(el) => (formRefs.current[key] = el)}
                  onSubmit={(event) =>
                    handleUpload(event, key, section.endpoint)
                  }
                  className="form-container"
                >
                  <input
                    type="file"
                    ref={(el) => (fileInputRefs.current[key] = el)}
                    onChange={(event) => handleFileChange(event, key)}
                    style={{ display: "none" }}
                  />
                  <img
                    src={File}
                    alt="Select File"
                    className="file-image"
                    onClick={() => fileInputRefs.current[key]?.click()}
                  />
                  {selectedFiles[key] && (
                    <p>Selected: {selectedFiles[key].name}</p>
                  )}
                  <img
                    src={UploadButton}
                    alt="Upload"
                    className="upload-button-image"
                    onClick={() => formRefs.current[key]?.requestSubmit()}
                    disabled={isLoading}
                  />
                </form>
              </div>
            );
          })}
          {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
        </div>
        <div className="header-title">ข้อมูลเฉพาะของ Switchgear</div>
        <div className="upload-container-L1">
          {uploadSectionsSwitchGear.map((section, index) => {
            const key = `switchgear-${index}`;
            return (
              <div key={key} className="upload-module">
                <div className="title-download-container">
                  <h1 className="upload-title">{section.title}</h1>
                  {section.downloadEndpoint && section.filename && (
                    <button
                      className="download-button"
                      onClick={() =>
                        handleDownload(
                          section.downloadEndpoint,
                          section.filename
                        )
                      }
                    >
                      Download Template
                    </button>
                  )}
                </div>
                <form
                  ref={(el) => (formRefs.current[key] = el)}
                  onSubmit={(event) =>
                    handleUpload(event, key, section.endpoint)
                  }
                  className="form-container"
                >
                  <input
                    type="file"
                    ref={(el) => (fileInputRefs.current[key] = el)}
                    onChange={(event) => handleFileChange(event, key)}
                    style={{ display: "none" }}
                  />
                  <img
                    src={File}
                    alt="Select File"
                    className="file-image"
                    onClick={() => fileInputRefs.current[key]?.click()}
                  />
                  {selectedFiles[key] && (
                    <p>Selected: {selectedFiles[key].name}</p>
                  )}
                  <img
                    src={UploadButton}
                    alt="Upload"
                    className="upload-button-image"
                    onClick={() => formRefs.current[key]?.requestSubmit()}
                    disabled={isLoading}
                  />
                </form>
              </div>
            );
          })}
          {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
        </div>
      </div>
    </div>
  );
};

export default UploadHQ;
