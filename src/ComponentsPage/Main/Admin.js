import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import NavbarComponent from "../Sub/NavbarComponent.js";
import TableUser from "../Sub/TableUser.js";

import File from "../../pic/File.svg";
import UploadButton from "../../pic/Upload.svg";

import axios from "axios";
import { getUsers } from "../../services/api_Admin.js";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/upload.css";
import "../../ComponentsStyles/Admin.css";

const API_URL = process.env.REACT_APP_API_URL;

const Admin = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const formRefs = useRef({});

  const queryClient = useQueryClient();

  // Configuration for each upload section
  const uploadSections = [
    {
      title: "Upload ข้อมูลการจัดการ User",
      endpoint: `${API_URL}/user_level_upload`,
    },
  ];

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle form submission to upload the file
  const handleUpload = async (event, endpoint) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    setUploadStatus(""); // Reset status before new upload

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const getButtonStyle = (isSelected) => ({
    backgroundColor: isSelected ? "#8e44ad" : "#f0f0f0",
    color: isSelected ? "white" : "black",
    textDecoration: "none", // Remove underline
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "10px 15px",
    cursor: "pointer",
    textAlign: "center",
    display: "inline-block", // Ensure button-like appearance
  });

  // ✅ SIMPLE FIX: Just add credentials to your existing function
  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_URL}/user_level_download`, {
        method: "GET",
        credentials: "include", // ✅ This is the key fix!
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "user_level.xlsx"; // Match your backend filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  const {
    data: userLevel,
    isLoading: isLoadingUserLevel,
    isError: isErrorUserLevel,
    error: errorUserLevel,
  } = useQuery({
    queryKey: ["userLevel"], // Unique query key for caching
    queryFn: getUsers, // API call to fetch data
  });

  // ✅ FIXED: Access the correct data structure and fix variable name
  const dataUserLevel =
    userLevel?.map((user) => ({
      costCenter: user.cost_center?.trim() || "Not Required", // Trim spaces and handle missing values
      employeeId: user.emp_id || "Not Required", // Default "Not Required" for missing values
      level: user.user_level,
    })) || [];

  // ✅ BONUS: Also get total records if needed
  const totalRecords = userLevel?.total_records || 0;

  return (
    <>
      <NavbarComponent />
      <div className="text-dropdown-container">
        <h1 className="header-title">จัดการระบบ</h1>
      </div>
      <div className="dashboard-container">
        <div className="admin-container">
          <div className="download-container">
            <div className="download-button">
              <button onClick={handleDownload} style={getButtonStyle(false)}>
                Download User Setting Template
              </button>
            </div>
          </div>
          <div className="table-remark-container">
            <div className="remark-upload-container">
              <div className="remark-container">
                <p>ⓘ หมายเหตุ:</p>
                <p>
                  1. User Level A คือ User ทั่วไป ไม่ต้องระบุในตาราง
                  จะสามารถดูแดชบอร์ดสำหรับพนักงานทั่วไป
                </p>
                <p>2. User Level B จะสามารถดูแดชบอร์ดของระดับเขต</p>
                <p>3. User Level C จะสามารถดูแดชบอร์ดของส่วนกลาง</p>
                <p>
                  4. User Level B และ C จะควบคุมโดยรหัส Cost Center
                  โดยไม่จำเป็นต้องมีรหัสพนักงาน
                </p>
                <p>
                  5. User Level D (User Admin) จะสามารถดูแดชบอร์ดได้ทั้งหมด
                  รวมถึงจัดการระบบ
                </p>
                <p>6. User Level D จะควบคุมโดยรหัสพนักงาน</p>
                <p>
                  7. ให้ Download Template User Management
                  จากปุ่มด้านขวาบนและเพิ่มข้อมูลหรือแก้ไข หลังจากนั้นให้ทำการ
                  Upload
                  ผ่านปุ่มด้านล่างโดยเลือกไฟล์จากปุ่มแรกและกดปุ่มที่สองเพื่อยืนยัน
                </p>
              </div>
              <div className="user-container">
                {uploadSections.map((section, index) => (
                  <div key={index} className="user-module">
                    <h1 className="text-title">{section.title}</h1>
                    <form
                      ref={(el) => (formRefs.current[index] = el)}
                      onSubmit={(event) =>
                        handleUpload(event, section.endpoint)
                      }
                      className="form-container"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />

                      {/* Image for file selection */}
                      <img
                        src={File}
                        alt="Select File"
                        className="file-image"
                        onClick={handleImageClick}
                      />

                      {selectedFile && <p>Selected: {selectedFile.name}</p>}

                      {/* Image acting as the upload button */}
                      <img
                        src={UploadButton}
                        alt="Upload"
                        className="upload-button-image"
                        onClick={() => formRefs.current[index].requestSubmit()}
                        disabled={isLoading}
                      />
                    </form>
                  </div>
                ))}
                {uploadStatus && (
                  <p className="upload-status">{uploadStatus}</p>
                )}
              </div>
            </div>
            <TableUser
              data={dataUserLevel}
              title={"ตารางข้อมูลการจัดการผู้ใช้ระบบ"}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
