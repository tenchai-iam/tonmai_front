import React, { useState, useEffect } from "react";

import NavbarComponent from "../Sub/NavbarComponent.js";

import "../../ComponentsStyles/Dashboard.css";

const Run = () => {
  return (
    <div>
      <NavbarComponent />
      <div className="header-container">ปรับปรุงแผน</div>
    </div>
  );
};

export default Run;
