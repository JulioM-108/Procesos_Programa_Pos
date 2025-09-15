import React, { useEffect, useState } from "react";
import { getVentas, getDetalleVenta, getEmpleados, getClientes } from "./api";
import "./styles/DetalleVentas.css";

export default function DetalleVentas() {
  const [detallesCompletos, setDetallesCompletos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipoBusqueda, setTipoBusqueda] = useState("empleado");
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Cargar todos los datos necesarios
      const [ventasData, empleadosData, clientesData] = await Promise.all([
        getVentas(),
        getEmpleados(),
        getClientes()
      ]);

      if (ventasData.error || empleadosData.error || clientesData.error) {
        setError("Error al cargar los datos");
        return;
      }

      setEmpleados(empleadosData);
      setClientes(clientesData);

      // Para cada venta, obtener sus detalles
      const todosLosDetalles = await Promise.all(
        ventasData.map(async (venta) => {
          const detallesVenta = await getDetalleVenta(venta.id_venta);
          if (detallesVenta.error) return [];
          
          // Encontrar el empleado y cliente correspondiente
          const empleado = empleadosData.find(e => e.id_empleado === venta.id_empleado);
          const cliente = clientesData.find(c => c.cedula === venta.cedula_cliente);

          // Combinar los detalles con la información de venta, empleado y cliente
          return detallesVenta.map(detalle => ({
            ...detalle,
            numero_venta: venta.numero_venta,
            empleado: empleado,
            cliente: cliente
          }));
        })
      );

      // Aplanar el array de arrays y filtrar posibles valores nulos
      setDetallesCompletos(todosLosDetalles.flat().filter(Boolean));
    } catch (err) {
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de detalles
    const detallesFiltrados = detallesCompletos.filter(detalle => {
      // Filtrar por fecha si se selecciona
      let fechaValida = true;
      if (fechaInicio) {
        fechaValida = new Date(detalle.created_at) >= new Date(fechaInicio);
      }
      if (fechaFin) {
        fechaValida = fechaValida && new Date(detalle.created_at) <= new Date(fechaFin);
      }

      // Filtrar por texto
      if (!terminoBusqueda) return fechaValida;
      const busqueda = terminoBusqueda.toLowerCase();
      let textoValido = false;
      if (tipoBusqueda === 'empleado') {
        textoValido = detalle.empleado?.nombre?.toLowerCase().includes(busqueda) ||
                     detalle.empleado?.cedula?.toLowerCase().includes(busqueda);
      } else {
        textoValido = detalle.cliente?.nombre?.toLowerCase().includes(busqueda) ||
                     detalle.cliente?.cedula?.toLowerCase().includes(busqueda);
      }
      return textoValido && fechaValida;
    });

  // Paginación
  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const detallesActuales = detallesFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(detallesFiltrados.length / itemsPorPagina);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="detalle-ventas-container">
      <h1 className="detalle-title">Detalle de Ventas</h1>

      {/* Filtros */}
      <div className="detalle-filtros">
        <select
          value={tipoBusqueda}
          onChange={(e) => setTipoBusqueda(e.target.value)}
          className="detalle-select"
        >
          <option value="empleado">Buscar por Empleado</option>
          <option value="cliente">Buscar por Cliente</option>
        </select>
      </div>

      {/* Tabla de detalles */}
      <h2 className="detalle-subtitle">
        Detalles de Ventas ({detallesFiltrados.length})
      </h2>

      {/* Barra de búsqueda */}
      <div className="search-container-flex">
        <input
          type="text"
          placeholder={`Buscar por ${tipoBusqueda === 'empleado' ? 'nombre/cédula del empleado' : 'nombre/cédula del cliente'}`}
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          className="search-input"
        />
        <div className="fecha-busqueda">
          <label>
            Desde:
            <input
              type="date"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
              className="fecha-input"
            />
          </label>
          <label>
            Hasta:
            <input
              type="date"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
              className="fecha-input"
            />
          </label>
        </div>
      </div>

      <table className="detalle-table">
        <thead>
          <tr>
            <th>N° Venta</th>
            <th>ID Venta</th>
            <th>ID Producto</th>
            <th>Producto</th>
            <th>Empleado</th>
            <th>Cliente</th>
            <th>Cantidad</th>
            <th>Precio Unit.</th>
            <th>Subtotal</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {detallesActuales.map((detalle) => (
            <tr key={detalle.id_detalle}>
              <td>{detalle.numero_venta}</td>
              <td>{detalle.id_venta}</td>
              <td>{detalle.id_producto}</td>
              <td>{detalle.nombre_producto}</td>
              <td>{detalle.empleado?.nombre || 'N/A'}</td>
              <td>{detalle.cliente?.nombre || 'N/A'}</td>
              <td>{detalle.cantidad}</td>
              <td>${detalle.precio_unitario.toFixed(2)}</td>
              <td>${detalle.subtotal.toFixed(2)}</td>
              <td>{new Date(detalle.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      {detallesFiltrados.length > 0 && (
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