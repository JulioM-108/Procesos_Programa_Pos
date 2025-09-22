// src/components/Reportes.jsx
import React, { useState } from "react";
import GraficaTopProductos from "./GraficaTopProductos";
import GraficaClientesFrecuentes from "./GraficaClientesFrecuentes";
import GraficaProductosBajoStock from "./GraficaProductosStock";
import "./styles/Reportes.css";

export default function Reportes() {
  const [tipoReporte, setTipoReporte] = useState("top_productos");

  const renderReporte = () => {
    switch (tipoReporte) {
      case "top_productos":
        return <GraficaTopProductos />;
      case "clientes_frecuentes":
        return <GraficaClientesFrecuentes />;
      case "bajo_stock":
        return <GraficaProductosBajoStock />;
      default:
        return <p style={{ textAlign: "center", color: "#2c3e50" }}>Selecciona un reporte</p>;
    }
  };

  return (
    <div className="reporte-container">
      {/* Header */}
      <div className="reporte-header">
        <h2 className="reporte-title">📊 Reportes</h2>
      </div>

      {/* Selector */}
      <select
        className="reporte-select"
        value={tipoReporte}
        onChange={(e) => setTipoReporte(e.target.value)}
      >
        <option value="top_productos">Top Productos Vendidos</option>
        <option value="clientes_frecuentes">Clientes Más Frecuentes</option>
        <option value="bajo_stock">Productos con Bajo Stock</option>
      </select>

      {/* Contenedor de la gráfica */}
      <div className="reporte-grafica">{renderReporte()}</div>
    </div>
  );
}
