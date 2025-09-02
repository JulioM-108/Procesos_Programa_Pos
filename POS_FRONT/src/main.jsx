import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Clientes from "./Clientes";
import UserInfo from "./userInfo";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/userInfo" element={<UserInfo />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
