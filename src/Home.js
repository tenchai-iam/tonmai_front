import React from "react";
import MenuCard from "./ComponentsPage/MenuCard";
import "./ComponentsStyles/Home.css";
import NavbarComponent from "./ComponentsPage/NavbarComponent";
import transformer from "./pic/Transformer.png";
import circuitBreaker from "./pic/Circuit_Breaker.png";
import upload from "./pic/Upload.png";

const Home = () => {
  const userLevel = sessionStorage.getItem("user_level"); // Fetch user level

  return (
    <div>
      <NavbarComponent />
      <div className="nav-container">
        {/* General Section */}
        {(userLevel === "B" || userLevel === "C") && (
          <div className="nav-section">
            <h1 className="nav-title">สำหรับส่วนกลาง</h1>
            <div className="menu-grid">
              <MenuCard
                image={transformer}
                buttonName="Dashboard Power Transformer"
                link="/transformerHQ"
              />
              <MenuCard
                image={circuitBreaker}
                buttonName="Dashboard Circuit Breaker"
                link="/circuitBreakerHQ"
              />
              <MenuCard
                image={upload}
                buttonName="อัพโหลดข้อมูล"
                link="/uploadHQ"
              />
            </div>
          </div>
        )}
        {/* Procurement Planning Section */}
        <div className="nav-section">
          <h1 className="nav-title">สำหรับการไฟฟ้าเขต</h1>
          <div className="menu-grid">
            <MenuCard
              image={transformer}
              buttonName="Dashboard Power Transformer"
              link="/transformerDistrict"
            />
            <MenuCard
              image={circuitBreaker}
              buttonName="Dashboard Circuit Breaker"
              link="/circuitBreakerDistrict"
            />
            <MenuCard
              image={upload}
              buttonName="อัพโหลดข้อมูล"
              link="/uploaddistrict"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
