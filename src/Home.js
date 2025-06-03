import React from "react";

import NavbarComponent from "./ComponentsPage/Sub/NavbarComponent.js";

import "./ComponentsStyles/Home.css";

const Home = () => {
  return (
    <div>
      <NavbarComponent />
      <div className="header-container">หน้าหลัก</div>
      <div className="main-container">
        <div className="summary-container"></div>
        <div className="summary-container"></div>
      </div>
    </div>
  );
};

export default Home;
