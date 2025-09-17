import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Clientes from "./Clientes";
import Productos from "./Productos";
import UserInfo from "./userInfo";
import LayoutBase from "./LayoutBase";
import DetalleVentas from "./DetalleVentas";
import Empleados from "./Empleados";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<LayoutBase />}>
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ventas" element={<h1>Ventas</h1>} />
          <Route path="/detalle-ventas" element={<DetalleVentas />} />
          <Route path="/graficas" element={<h1>Gráficas</h1>} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/userInfo" element={<UserInfo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
