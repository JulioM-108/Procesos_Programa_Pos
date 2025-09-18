// src/components/Reportes.jsx
import React, { useState } from "react";
import GraficaTopProductos from "./GraficaTopProductos";
// import GraficaClientesFrecuentes from "./GraficaClientesFrecuentes"; 
// import GraficaBajoStock from "./GraficaBajoStock"; 

export default function Reportes() {
  const [tipoReporte, setTipoReporte] = useState("top_productos");

  const renderReporte = () => {
    switch (tipoReporte) {
      case "top_productos":
        return <GraficaTopProductos />;
      // case "clientes_frecuentes":
      //   return <GraficaClientesFrecuentes />;
      // case "bajo_stock":
      //   return <GraficaBajoStock />;
      default:
        return <p style={{ textAlign: "center", color: "#ffffff" }}>Selecciona un reporte</p>;
    }
  };

  return (
    <div style={{ 
      padding: 20, 
      width: "200%", 
      minHeight: "100vh", 
      backgroundColor: "#4f63be",
      boxSizing: "border-box", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center" 
    }}>
      {/* Título centrado y blanco */}
      <h2 style={{ 
        color: "#ffffff", 
        marginBottom: "30px" 
      }}>
        📊 Reportes
      </h2>

      {/* Selector de tipo de reporte */}
      <div style={{ textAlign: "center", color: "#ffffff", marginBottom: "30px" }}>
        <label style={{ marginRight: "10px" }}>Selecciona un reporte: </label>
        <select
          value={tipoReporte}
          onChange={(e) => setTipoReporte(e.target.value)}
          style={{
            padding: "5px 10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            backgroundColor: "#333",
            color: "#fff"
          }}
        >
          <option value="top_productos">Top Productos Vendidos</option>
          <option value="clientes_frecuentes">Clientes Más Frecuentes</option>
          <option value="bajo_stock">Productos con Bajo Stock</option>
        </select>
      </div>

      {/* Render dinámico */}
      <div style={{ width: "100%", maxWidth: "1200px" }}>
        {renderReporte()}
      </div>
    </div>
  );
}
