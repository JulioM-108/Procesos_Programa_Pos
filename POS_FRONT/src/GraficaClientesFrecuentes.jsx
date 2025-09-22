import React, { useState, useEffect } from "react";
import { getClientesFrecuentesDirecto } from "./api";
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

export default function GraficaClientesFrecuentes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limite, setLimite] = useState(10);

  // 🎨 Paleta de colores
  const colors = [
    "#e74c3c", "#3498db", "#2ecc71", "#f39c12",
    "#9b59b6", "#1abc9c", "#e67e22", "#34495e",
    "#ff6b6b", "#4dabf7"
  ];

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getClientesFrecuentesDirecto(null, null, limite);
      const raw = res?.resultados ?? [];
      if (!Array.isArray(raw)) {
        setError("Respuesta inesperada del servidor.");
        setClientes([]);
        return;
      }

      // Preparar datos para la gráfica
      const chartData = raw.map((c) => ({
        nombre: c.nombre,
        total_compras: Number(c.total_compras),
      }));

      setClientes(chartData);
    } catch (e) {
      console.error("Error cargando clientes frecuentes:", e);
      setError(e.message || "Error desconocido");
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [limite]);

  return (
    <div style={{ width: "100%", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Clientes más Frecuentes</h2>

      {/* Filtro de límite */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "15px" }}>
        <div>
          <label>Límite: </label>
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
      {error && <div style={{ color: "red", textAlign: "center" }}>Error: {error}</div>}
      {!loading && !error && clientes.length === 0 && (
        <div style={{ textAlign: "center" }}>No hay datos para mostrar.</div>
      )}

      {/* Gráfica */}
      {!loading && clientes.length > 0 && (
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={clientes}
              margin={{ top: 10, right: 35, left: 35, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="nombre"
                angle={-20}
                textAnchor="end"
                interval={0}
                stroke="#2c3e50"
              />
              <YAxis stroke="#2c3e50" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  color: "#2c3e50",
                }}
              />
              <Bar dataKey="total_compras" animationDuration={1200}>
                <LabelList dataKey="total_compras" position="top" fill="#2c3e50" />
                {clientes.map((entry, index) => (
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