import React from "react";
import { Navbar, Nav, NavDropdown, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "bootstrap/dist/css/bootstrap.min.css";
import assetintelligence from "../pic/Asset_Intelligence_Logo.png"; // Replace with your image path
import workd from "../pic/w-logo.svg";

import "../ComponentsStyles/NavbarStyles.css"; // Import your custom CSS file

const workd_url = process.env.REACT_APP_WORKD_URL;

function NavbarComponent() {
  // Retrieve user details from sessionStorage
  const firstName = sessionStorage.getItem("first_name");
  const lastName = sessionStorage.getItem("last_name");
  const userLevel = sessionStorage.getItem("user_level"); // "B" can access Dashboard3 & Dashboard4

  return (
    <Navbar
      expand="lg"
      className="gradient-navbar custom-navbar fixed-top"
      variant="dark"
      sticky="top"
    >
      <Container fluid className="d-flex align-items-center">
        {/* Logo */}
        <Navbar.Brand
          as={Link}
          to="/home"
          className="d-flex align-items-center custom-brand"
        >
          <img
            src={assetintelligence} // Replace with your logo path
            width="45"
            height="34"
            className="d-inline-block align-top"
            alt="Asset Intelligence"
          />
        </Navbar.Brand>

        {/* Responsive Toggle */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="me-2" />

        {/* Collapsible Links */}
        <Navbar.Collapse id="basic-navbar-nav" className="d-flex flex-grow-1">
          <Nav className="me-auto">
            {" "}
            {/* Right-align menu items */}
            {/* Main Links */}
            <Nav.Link as={Link} to="/home">
              หน้าหลัก
            </Nav.Link>
            {/* Dropdown for General Employees */}
            {(userLevel === "B" || userLevel === "C") && (
              <NavDropdown title="สำหรับส่วนกลาง" id="admin-dropdown">
                <NavDropdown.Item as={Link} to="/transformerHQ">
                  Dashboard Power Transformer
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/circuitBreakerHQ">
                  Dashboard Circuit Breaker
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/UploadHQ">
                  จัดการข้อมูล
                </NavDropdown.Item>
              </NavDropdown>
            )}
            {/* Dropdown for Procurement Planners */}
            <NavDropdown title="สำหรับการไฟฟ้าเขต" id="planning-dropdown">
              <NavDropdown.Item as={Link} to="/transformerDistrict">
                Dashboard Power Transformer
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/circuitBreakerDistrict">
                Dashboard Circuit Breaker
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/UploadDistrict">
                จัดการข้อมูล
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/admin">
              จัดการระบบ
            </Nav.Link>
          </Nav>
          {/* Show First Name & Last Name */}
          <div className="user-info ms-auto me-3">
            <span>{firstName ? `${firstName} ${lastName}` : "ผู้ใช้งาน"}</span>
          </div>
          {/* WorkD Button */}
          <Button
            className="logout-button"
            onClick={() => {
              window.location.href = workd_url;
            }}
          >
            &larr; ไปที่ระบบ
            <img
              src={workd}
              height="15"
              className="d-inline-block align-center"
              alt="Spend Insight"
            />
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
