import React, { useState, useEffect } from "react";

import NavbarComponent from "../Sub/NavbarComponent.js";

import "../../ComponentsStyles/Dashboard.css";

const Value = () => {
  return (
    <div>
      <NavbarComponent />
      <div className="header-container">ติดตามมูลค่า Stage 5</div>
    </div>
  );
};

export default Value;