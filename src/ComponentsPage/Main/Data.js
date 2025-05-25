import React, { useState, useEffect } from "react";

import NavbarComponent from "../Sub/NavbarComponent.js";

import "../../ComponentsStyles/Dashboard.css";

const Data = () => {
  return (
    <div>
      <NavbarComponent />
      <div className="header-container">จัดการข้อมูล</div>
    </div>
  );
};

export default Data;
