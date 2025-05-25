import React, { useState, useRef } from "react";
import NavbarComponent from "../ComponentsPage/NavbarComponent";
import axios from "axios";
import File from "../pic/File.svg";
import UploadButton from "../pic/Upload.svg";

import "../ComponentsStyles/Dashboard.css";
import "../ComponentsStyles/upload.css";

const API_URL = process.env.REACT_APP_API_URL;

const UploadDistrict = () => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRefs = useRef({});
  const formRefs = useRef({});

  // Configuration for each upload section
  const uploadSectionsDistrict = [
    {
      title: "ข้อมูล Structural SWG กฟน.1",
      endpoint: `${API_URL}/UP_cb_new_structural_district`,
      downloadEndpoint: `${API_URL}/DW_cb_new_structural_district`, // Add a download API
      filename: "CB_new_structural_district.xlsx",
      district: "A",
    },
    {
      title: "ข้อมูล Measurement SWG กฟน.1",
      endpoint: `${API_URL}/UP_measurement_cb_district`,
      downloadEndpoint: `${API_URL}/DW_measurement_cb_district`, // Add a download API
      filename: "Measurement_cb_district.xlsx",
      district: "A",
    },
    {
      title: "ข้อมูล Structural SWG กฟน.2",
      endpoint: `${API_URL}/UP_cb_new_structural_district`,
      downloadEndpoint: `${API_URL}/DW_cb_new_structural_district`, // Add a download API
      filename: "CB_new_structural_district.xlsx",
      district: "B",
    },
    {
      title: "ข้อมูล Measurement SWG กฟน.2",
      endpoint: `${API_URL}/UP_measurement_cb_district`,
      downloadEndpoint: `${API_URL}/DW_measurement_cb_district`, // Add a download API
      filename: "Measurement_cb_district.xlsx",
      district: "B",
    },
    {
      title: "ข้อมูล Structural SWG กฟน.3",
      endpoint: `${API_URL}/UP_cb_new_structural_district`,
      downloadEndpoint: `${API_URL}/DW_cb_new_structural_district`, // Add a download API
      filename: "CB_new_structural_district.xlsx",
      district: "C",
    },
    {
      title: "ข้อมูล Measurement SWG กฟน.3",
      endpoint: `${API_URL}/UP_measurement_cb_district`,
      downloadEndpoint: `${API_URL}/DW_measurement_cb_district`, // Add a download API
      filename: "Measurement_cb_district.xlsx",
      district: "C",
    },
    {
      title: "ข้อมูล Structural SWG กฟฉ.1",
      endpoint: `${API_URL}/UP_cb_new_structural_district`,
      downloadEndpoint: `${API_URL}/DW_cb_new_structural_district`, // Add a download API
      filename: "CB_new_structural_district.xlsx",
      district: "D",
    },
    {
      title: "ข้อมูล Measurement SWG กฟฉ.1",
      endpoint: `${API_URL}/UP_measurement_cb_district`,
      downloadEndpoint: `${API_URL}/DW_measurement_cb_district`, // Add a download API
      filename: "Measurement_cb_district.xlsx",
      district: "D",
    },
    {
      title: "ข้อมูล Structural SWG กฟฉ.2",
      endpoint: `${API_URL}/UP_cb_new_structural_district`,
      downloadEndpoint: `${API_URL}/DW_cb_new_structural_district`, // Add a download API
      filename: "CB_new_structural_district.xlsx",
      district: "E",
    },
    {
      title: "ข้อมูล Measurement SWG กฟฉ.2",
      endpoint: `${API_URL}/UP_measurement_cb_district`,
      downloadEndpoint: `${API_URL}/DW_measurement_cb_district`, // Add a download API
      filename: "Measurement_cb_district.xlsx",
      district: "E",
    },
    {
      title: "ข้อมูล Structural SWG กฟฉ.3",
      endpoint: `${API_URL}/UP_cb_new_structural_district`,
      downloadEndpoint: `${API_URL}/DW_cb_new_structural_district`, // Add a download API
      filename: "CB_new_structural_district.xlsx",
      district: "F",
    },
    {
      title: "ข้อมูล Measurement SWG กฟฉ.3",
      endpoint: `${API_URL}/UP_measurement_cb_district`,
      downloadEndpoint: `${API_URL}/DW_measurement_cb_district`, // Add a download API
      filename: "Measurement_cb_district.xlsx",
      district: "F",
    },
    {
      title: "ข้อมูล Structural SWG กฟก.1",
      endpoint: `${API_URL}/UP_cb_new_structural_district`,
      downloadEndpoint: `${API_URL}/DW_cb_new_structural_district`, // Add a download API
      filename: "CB_new_structural_district.xlsx",
      district: "G",
    },
    {
      title: "ข้อมูล Measurement SWG กฟก.1",
      endpoint: `${API_URL}/UP_measurement_cb_district`,
      downloadEndpoint: `${API_URL}/DW_measurement_cb_district`, // Add a download API
      filename: "Measurement_cb_district.xlsx",
      district: "G",
    },
    {
      title: "ข้อมูล Structural SWG กฟก.2",
      endpoint: `${API_URL}/UP_cb_new_structural_district`,
      downloadEndpoint: `${API_URL}/DW_cb_new_structural_district`, // Add a download API
      filename: "CB_new_structural_district.xlsx",
      district: "H",
    },
    {
      title: "ข้อมูล Measurement SWG กฟก.2",
      endpoint: `${API_URL}/UP_measurement_cb_district`,
      downloadEndpoint: `${API_URL}/DW_measurement_cb_district`, // Add a download API
      filename: "Measurement_cb_district.xlsx",
      district: "H",
    },
    {
      title: "ข้อมูล Structural SWG กฟก.3",
      endpoint: `${API_URL}/UP_cb_new_structural_district`,
      downloadEndpoint: `${API_URL}/DW_cb_new_structural_district`, // Add a download API
      filename: "CB_new_structural_district.xlsx",
      district: "I",
    },
    {
      title: "ข้อมูล Measurement SWG กฟก.3",
      endpoint: `${API_URL}/UP_measurement_cb_district`,
      downloadEndpoint: `${API_URL}/DW_measurement_cb_district`, // Add a download API
      filename: "Measurement_cb_district.xlsx",
      district: "I",
    },
    {
      title: "ข้อมูล Structural SWG กฟต.1",
      endpoint: `${API_URL}/UP_cb_new_structural_district`,
      downloadEndpoint: `${API_URL}/DW_cb_new_structural_district`, // Add a download API
      filename: "CB_new_structural_district.xlsx",
      district: "J",
    },
    {
      title: "ข้อมูล Measurement SWG กฟต.1",
      endpoint: `${API_URL}/UP_measurement_cb_district`,
      downloadEndpoint: `${API_URL}/DW_measurement_cb_district`, // Add a download API
      filename: "Measurement_cb_district.xlsx",
      district: "J",
    },
    {
      title: "ข้อมูล Structural SWG กฟต.2",
      endpoint: `${API_URL}/UP_cb_new_structural_district`,
      downloadEndpoint: `${API_URL}/DW_cb_new_structural_district`, // Add a download API
      filename: "CB_new_structural_district.xlsx",
      district: "K",
    },
    {
      title: "ข้อมูล Measurement SWG กฟต.2",
      endpoint: `${API_URL}/UP_measurement_cb_district`,
      downloadEndpoint: `${API_URL}/DW_measurement_cb_district`, // Add a download API
      filename: "Measurement_cb_district.xlsx",
      district: "K",
    },
    {
      title: "ข้อมูล Structural SWG กฟต.3",
      endpoint: `${API_URL}/UP_cb_new_structural_district`,
      downloadEndpoint: `${API_URL}/DW_cb_new_structural_district`, // Add a download API
      filename: "CB_new_structural_district.xlsx",
      district: "L",
    },
    {
      title: "ข้อมูล Measurement SWG กฟต.3",
      endpoint: `${API_URL}/UP_measurement_cb_district`,
      downloadEndpoint: `${API_URL}/DW_measurement_cb_district`, // Add a download API
      filename: "Measurement_cb_district.xlsx",
      district: "L",
    },
  ];

  const uploadSectionsHQ = [
    {
      title: "ข้อมูล Structural SWG ส่วนกลาง",
      endpoint: `${API_URL}/UP_cb_new_structural`,
      downloadEndpoint: `${API_URL}/DW_cb_new_structural`, // Add a download API
      filename: "CB_new_structural.xlsx",
    },
    {
      title: "ข้อมูล Measurement SWG ส่วนกลาง",
      endpoint: `${API_URL}/UP_measurement_cb`,
      downloadEndpoint: `${API_URL}/DW_measurement_cb`, // Add a download API
      filename: "Measurement_cb.xlsx",
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
  
    // Find the district value for this key
    const section = uploadSectionsDistrict.find((_, index) => `district-${index}` === key);
    const district = section?.district;
  
    if (!district) {
      alert("No district provided for upload.");
      return;
    }
  
    setIsLoading(true);
    setUploadStatus("");
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("district", district); // ✅ Add district here
  
    try {
      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus(response.data.message || "Upload successful!");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(
        error.response?.data?.error || "Failed to upload the file."
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

  const handleDownloadDistrict = async (downloadEndpoint, fileName, district) => {
    try {
      const response = await fetch(downloadEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ district }), // Send { district: district }
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
        <div className="header-title">ข้อมูล SWG เขต</div>
        <div className="upload-container-L1">
          {uploadSectionsDistrict.map((section, index) => {
            const key = `district-${index}`;
            return (
              <div key={key} className="upload-module">
                <div className="title-download-container">
                  <h1 className="upload-title">{section.title}</h1>
                  {section.downloadEndpoint && section.filename && (
                    <button
                      className="download-button"
                      onClick={() =>
                        handleDownloadDistrict(
                          section.downloadEndpoint,
                          section.filename,
                          section.district
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
        <div className="header-title">ข้อมูลจากส่วนกลาง (Read Only)</div>
        <div className="upload-container-L1">
          {uploadSectionsHQ.map((section, index) => (
            <div key={index} className="upload-module">
              <div className="title-download-container">
                <h1 className="upload-title">{section.title}</h1>
                {section.downloadEndpoint && section.filename && (
                  <button
                    className="download-button"
                    onClick={() =>
                      handleDownload(section.downloadEndpoint, section.filename)
                    }
                  >
                    Download Template
                  </button>
                )}
              </div>
              {/* <form
                ref={(el) => (formRefs.current[index] = el)}
                onSubmit={(event) =>
                  handleUpload(event, index, section.endpoint)
                }
                className="form-container"
              >
                <input
                  type="file"
                  ref={(el) => (fileInputRefs.current[index] = el)}
                  onChange={(event) => handleFileChange(event, index)}
                  style={{ display: "none" }}
                />
                <img
                  src={File}
                  alt="Select File"
                  className="file-image"
                  onClick={() => fileInputRefs.current[index]?.click()}
                />
                {selectedFiles[index] && (
                  <p>Selected: {selectedFiles[index].name}</p>
                )}
                <img
                  src={UploadButton}
                  alt="Upload"
                  className="upload-button-image"
                  onClick={() => formRefs.current[index]?.requestSubmit()}
                  disabled={isLoading}
                />
              </form> */}
            </div>
          ))}
          {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
        </div>
      </div>
    </div>
  );
};

export default UploadDistrict;
