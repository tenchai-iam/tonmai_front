import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import NavbarComponent from "../Sub/NavbarComponent.js";
// import TableUser from "../TableUser.js";

// import { getUsers } from "../../services/api_Database.js";

import File from "../../pic/File.svg";
import UploadButton from "../../pic/Upload.svg";

import "../../ComponentsStyles/Dashboard.css";
import "../../ComponentsStyles/Data.css";
import "../../ComponentsStyles/Admin.css";

const API_URL = process.env.REACT_APP_API_URL;

const Admin = () => {
  return (
    <div>
      <NavbarComponent />
      <div className="header-container">จัดการระบบ</div>
    </div>
  );
};

export default Admin;
