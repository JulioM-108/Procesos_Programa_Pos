import React, { useEffect, useState } from "react";
import { getEmpleados } from "./api";
import "./styles/Empleados.css";

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const empleadosPorPagina = 10;

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      setLoading(true);
      const data = await getEmpleados();
      if (!data.error) {
        setEmpleados(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error al cargar los empleados");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado
  const empleadosFiltrados = empleados.filter(empleado => {
    const coincideNombre = empleado.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                         empleado.cedula.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = filtroRol ? empleado.rol === filtroRol : true;
    return coincideNombre && coincideRol;
  });

  // Paginación
  const indexUltimo = paginaActual * empleadosPorPagina;
  const indexPrimero = indexUltimo - empleadosPorPagina;
  const empleadosActuales = empleadosFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(empleadosFiltrados.length / empleadosPorPagina);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="empleados-container">
      <h1 className="empleados-title">Gestión de Empleados</h1>

      {/* Filtros */}
      <div className="empleados-filtros">
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className="empleados-select"
        >
          <option value="">Todos los roles</option>
          <option value="administrador">Administrador</option>
          <option value="cajero">Cajero</option>
        </select>
      </div>

      {/* Tabla de empleados */}
      <h2 className="empleados-subtitle">
        Lista de Empleados ({empleadosFiltrados.length})
      </h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por nombre o cédula..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />
      </div>
      
      <table className="empleados-table">
        <thead>
          <tr>
            <th>Cédula</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {empleadosActuales.map((empleado) => (
            <tr key={empleado.id_empleado}>
              <td>{empleado.cedula}</td>
              <td>{empleado.nombre}</td>
              <td style={{ textTransform: 'capitalize' }}>{empleado.rol}</td>
              <td>{empleado.telefono || "N/A"}</td>
              <td>{empleado.email}</td>
              <td>
                <span className={`estado-badge ${empleado.estado ? 'activo' : 'inactivo'}`}>
                  {empleado.estado ? 'Activo' : 'Inactivo'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      {empleadosFiltrados.length > 0 && (
        <div className="paginacion">
          <button
            onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
            disabled={paginaActual === 1}
            className="paginacion-btn"
          >
            Anterior
          </button>
          <span className="paginacion-info">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
            disabled={paginaActual === totalPaginas}
            className="paginacion-btn"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}