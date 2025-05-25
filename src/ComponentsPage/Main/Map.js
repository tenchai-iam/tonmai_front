import React, { useState, useEffect } from "react";

import NavbarComponent from "../Sub/NavbarComponent.js";

import "../../ComponentsStyles/Dashboard.css";

const Map = () => {
  return (
    <div>
      <NavbarComponent />
      <div className="header-container">แผนการตัดต้นไม้</div>
    </div>
  );
};

export default Map;
