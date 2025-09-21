// src/components/GraficaClientesFrecuentes2.jsx
import React, { useState, useEffect } from "react";
import { getClientesFrecuentes } from "./api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function GraficaClientesFrecuentes2() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limite, setLimite] = useState(10);

  useEffect(() => {
    fetchData();
  }, [limite]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getClientesFrecuentes(null, null, limite);
      setClientes(data);
    } catch (err) {
      console.error("Error cargando clientes frecuentes:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Clientes más Frecuentes</h2>

      <div className="mb-4">
        <label className="mr-2 font-semibold">Límite:</label>
        <input
          type="number"
          value={limite}
          onChange={(e) => setLimite(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        />
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : clientes.length === 0 ? (
        <p>No hay datos para mostrar.</p>
      ) : (
        <>
          {/* Tabla */}
          <table className="w-full text-left border-collapse mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Cédula</th>
                <th className="p-2 border">Nombre</th>
                <th className="p-2 border">Total Compras</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.cedula}>
                  <td className="p-2 border">{c.cedula}</td>
                  <td className="p-2 border">{c.nombre}</td>
                  <td className="p-2 border">{c.total_compras}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Gráfica */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientes}>
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_compras" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
