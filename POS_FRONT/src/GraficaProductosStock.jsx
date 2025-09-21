// src/components/GraficaBajoStock.jsx
import React, { useEffect, useState } from "react";
import { getProductosBajoStock } from "./api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import "./styles/Graficas.css";

export default function GraficaBajoStock() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [umbral, setUmbral] = useState(5);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const res = await getProductosBajoStock(umbral);
      console.log("Respuesta getProductosBajoStock:", res);

      const raw = res?.resultados ?? [];
      const chartData = raw.map((item) => ({
        name: item.nombre,
        value: Number(item.cantidad),
      }));

      setData(chartData);
    } catch (e) {
      setError(e.message || "Error desconocido");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const colors = [
    "#e74c3c", "#f39c12", "#d35400", "#c0392b",
    "#ff7675", "#fab1a0", "#ffeaa7", "#fd79a8"
  ];

  return (
    <div style={{ width: "100%", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Productos con Bajo Stock</h2>

      {/* Filtro Umbral */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "15px" }}>
        <div>
          <label>Umbral: </label>
          <input
            type="number"
            min="1"
            value={umbral}
            onChange={(e) => setUmbral(Number(e.target.value))}
            style={{ width: "60px" }}
          />
        </div>
        <button onClick={cargar}>Aplicar</button>
      </div>

      {loading && <div style={{ textAlign: "center" }}>Cargando...</div>}
      {error && <div style={{ color: "red", textAlign: "center" }}>Error: {error}</div>}
      {!loading && !error && data.length === 0 && <div style={{ textAlign: "center" }}>No hay datos para mostrar.</div>}

      {!loading && data.length > 0 && (
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 35, left: 35, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} stroke="#2c3e50" />
              <YAxis stroke="#2c3e50" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #ccc" }} />
              <Bar dataKey="value" animationDuration={1200}>
                <LabelList dataKey="value" position="top" fill="#2c3e50" />
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
