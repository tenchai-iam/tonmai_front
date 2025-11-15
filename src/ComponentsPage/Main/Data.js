import React, { useState, useRef } from "react";
import NavbarComponent from "../Sub/NavbarComponent.js";
import axios from "axios";
import File from "../../pic/File.svg";
import UploadButton from "../../pic/Upload.svg";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Data.css";

const API_URL = process.env.REACT_APP_API_URL;

const Data = () => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState("");
  // const [uploadStatusHQ, setUploadStatusHQ] = useState("");
  // const [uploadStatusDistrict, setUploadStatusDistrict] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRefs = useRef({});
  const formRefs = useRef({});

  // Configuration for each upload section
  const uploadSectionsGeneral = [
    {
      title: "ข้อมูล Rate Card - ข้อมูลจะถูกแทนที่ข้อมูลเดิมในฐานข้อมูล",
      endpoint: `${API_URL}/rate_card_upload`,
      downloadEndpoint: `${API_URL}/rate_card_download`, // Add a download API
      filename: "Rate_card.xlsx",
    },
    {
      title: "ข้อมูล ENS - ข้อมูลจะถูกเพิ่มเข้าฐานข้อมูล",
      endpoint: `${API_URL}/api/ens_upload`,
      downloadEndpoint: `${API_URL}/ens_download`, // Add a download API
      filename: "ens_template.xlsx",
    },
    {
      title: "ข้อมูล Baseline - ข้อมูลจะถูกแทนที่ข้อมูลเดิมในฐานข้อมูล",
      endpoint: `${API_URL}/baseline_upload`,
      downloadEndpoint: `${API_URL}/baseline_download`, // Add a download API
      filename: "baseline.xlsx",
    },
    {
      title: "ข้อมูล Corridor ที่จะ Upgrade",
      endpoint: `${API_URL}/upgrade_corridor_list_upload`,
      downloadEndpoint: `${API_URL}/upgrade_corridor_list_download`, // Add a download API
      filename: "upgrade_corridor_list.xlsx",
    },
  ];

  const uploadSectionsTransformer = [];

  const uploadSectionsSwitchGear = [];

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

      fileInputRefs.current[key].value = null;
      setSelectedFiles((prev) => ({ ...prev, [key]: null }));
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
                      // className="download-button"
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

export default Data;
