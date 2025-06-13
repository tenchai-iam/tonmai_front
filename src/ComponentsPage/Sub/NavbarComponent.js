import React from "react";
import { Navbar, Nav, NavDropdown, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "bootstrap/dist/css/bootstrap.min.css";
import tonmAI from "../../pic/Tonmai_logo.svg"; // Replace with your image path
import workd from "../../pic/w-logo.svg";

import "../../ComponentsStyles/NavbarStyles.css"; // Import your custom CSS file

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
            src={tonmAI} // Replace with your logo path
            width="89"
            height="40"
            className="d-inline-block align-top"
            alt="TonmAI"
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
            <Nav.Link as={Link} to="/map">
              แผนการตัดต้นไม้
            </Nav.Link>
            <NavDropdown title="หน่วยงาน กบร." id="admin-dropdown">
              <NavDropdown.Item as={Link} to="/map">
                แผนการตัดต้นไม้
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/manage">
                จัดการแผน
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/value">
                ติดตามมูลค่า Stage 5
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/data">
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
            {userLevel && (
              <small className="ms-2 text-muted">(Level: {userLevel})</small>
            )}
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
              alt="WorkD"
            />
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
