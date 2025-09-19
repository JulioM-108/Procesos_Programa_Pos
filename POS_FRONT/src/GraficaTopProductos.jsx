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
              margin={{ top: 10
                , right: 35, left: 35, bottom: 60 }}
            >
              {/* Fondo de cuadrícula más sutil */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              
              {/* Eje X con nombres rotados y color blanco */}
              <XAxis 
                dataKey="name" 
                angle={-20} 
                textAnchor="end" 
                interval={0} 
                stroke="#ffffff" // <-- color blanco
              />

              {/* Eje Y con números en blanco */}
              <YAxis stroke="#ffffff" />

              {/* Barras con etiquetas en blanco */}
              <Bar dataKey="value" fill="url(#colorUv)" animationDuration={1500}>
                <LabelList dataKey="value" position="top" fill="#ffffff" /> 
              </Bar>

              
              {/* Tooltip */}
              <Tooltip />
              
              {/* Barras con degradado y animación */}
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e88f63ff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#e4e4eaff" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <Bar dataKey="value" fill="url(#colorUv)" animationDuration={1500}>
                <LabelList dataKey="value" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
