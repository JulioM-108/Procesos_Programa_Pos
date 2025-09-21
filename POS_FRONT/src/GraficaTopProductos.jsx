// src/components/GraficaTopProductos.jsx
import React, { useEffect, useState } from "react";
import { getTopProductos } from "./api";
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

export default function GraficaTopProductos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [limite, setLimite] = useState(10);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const res = await getTopProductos(desde || null, hasta || null, limite);
      console.log("Respuesta getTopProductos:", res);

      const raw = res?.resultados ?? [];
      if (!Array.isArray(raw)) {
        setError("Respuesta inesperada del servidor.");
        setData([]);
        return;
      }

      const chartData = raw.map((item) => ({
        name: item.nombre,
        value: Number(item.total_vendido),
      }));

      setData(chartData);
    } catch (e) {
      console.error("Error en cargar top productos:", e);
      setError(e.message || "Error desconocido");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  // carga inicial
  useEffect(() => {
    cargar();
  }, []);

  // 🎨 Paleta de colores para las barras
  const colors = [
    "#e74c3c", "#3498db", "#2ecc71", "#f39c12",
    "#9b59b6", "#1abc9c", "#e67e22", "#34495e",
    "#ff6b6b", "#4dabf7"
  ];

  return (
    <div style={{ width: "100%", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Top Productos Vendidos</h2>

      {/* Filtros */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "15px" }}>
        <div>
          <label>Desde: </label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label>Hasta: </label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div>
          <label>Limite: </label>
          <input
            type="number"
            min="1"
            value={limite}
            onChange={(e) => setLimite(Number(e.target.value))}
            style={{ width: "60px" }}
          />
        </div>
        <button onClick={cargar}>Aplicar</button>
      </div>

      {/* Estados */}
      {loading && <div style={{ textAlign: "center" }}>Cargando...</div>}
      {error && (
        <div style={{ color: "red", textAlign: "center" }}>Error: {error}</div>
      )}
      {!loading && !error && data.length === 0 && (
        <div style={{ textAlign: "center" }}>
          No hay datos para mostrar.
        </div>
      )}

      {/* Gráfica Mejorada */}
      {!loading && data.length > 0 && (
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 10, right: 35, left: 35, bottom: 60 }}
            >
              {/* Fondo de cuadrícula más sutil */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

              {/* Eje X con nombres rotados y color oscuro */}
              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                interval={0}
                stroke="#2c3e50"
              />

              {/* Eje Y con números en gris oscuro */}
              <YAxis stroke="#2c3e50" />

              {/* Tooltip personalizado */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  color: "#2c3e50"
                }}
              />

              {/* Barras con colores dinámicos */}
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
