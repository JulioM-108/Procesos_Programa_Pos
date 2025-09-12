import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"; // componente independiente
import "./styles/Layout.css";

export default function LayoutBase() {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
