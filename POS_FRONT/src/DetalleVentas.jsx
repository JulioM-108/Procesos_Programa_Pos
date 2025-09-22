import React, { useEffect, useState } from "react";
// Loader global reutilizable
function Loader() {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      width: '100%'
    }}>
      <div style={{
        border: '6px solid #e9ecef',
        borderTop: '6px solid #27ae60',
        borderRadius: '50%',
        width: 48,
        height: 48,
        animation: 'spin 1s linear infinite',
        marginBottom: 16
      }} />
      <span style={{ color: '#27ae60', fontWeight: 600, fontSize: '1.1rem' }}>Cargando...</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
import { getVentas, getDetalleVenta, getEmpleados, getClientes } from "./api";
import "./styles/DetalleVentas.css";

export default function DetalleVentas() {
  // Estado para mostrar/ocultar la tabla de ventas del día
  const [mostrarVentasDia, setMostrarVentasDia] = useState(false);
  const [ventasHoy, setVentasHoy] = useState([]);
  const [gananciaHoy, setGananciaHoy] = useState(0);

  // Calcular ventas y ganancia del día actual
  useEffect(() => {
    if (!mostrarVentasDia) return;
    const hoy = new Date();
    const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);
    getVentas().then((ventasData) => {
      if (!Array.isArray(ventasData)) return;
      const ventasDelDia = ventasData.filter(v => {
        const fecha = new Date(v.fecha_venta);
        return fecha >= inicioDia && fecha <= finDia;
      });
      setVentasHoy(ventasDelDia);
      // Sumar la columna total de todas las ventas del día
      const ganancia = ventasDelDia.reduce((acc, v) => acc + (v.total || 0), 0);
      setGananciaHoy(ganancia);
    });
  }, [mostrarVentasDia]);
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

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="detalle-ventas-container">
      {/* Botón para mostrar/ocultar ventas del día */}
      <button
        style={{ marginBottom: 16, marginTop: 24, padding: '8px 16px', fontWeight: 600, borderRadius: 6, background: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', display: 'block' }}
        onClick={() => setMostrarVentasDia((prev) => !prev)}
      >
        {mostrarVentasDia ? 'Ocultar ventas del día' : 'Mostrar ventas del día'}
      </button>

      {/* Tabla de ventas del día y ganancia */}
      {mostrarVentasDia && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ color: '#27ae60', marginBottom: 8 }}>Ventas del día ({ventasHoy.length})</h2>
          <table className="detalle-table">
            <thead>
              <tr>
                <th>ID Venta</th>
                <th>Empleado</th>
                <th>Cliente</th>
                <th>Subtotal</th>
                <th>Descuento</th>
                <th>Total</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ventasHoy.map(v => (
                <tr key={v.id_venta}>
                  <td>{v.id_venta}</td>
                  <td>{empleados.find(e => e.id_empleado === v.id_empleado)?.nombre || 'N/A'}</td>
                  <td>{clientes.find(c => c.cedula === v.cedula_cliente)?.nombre || 'N/A'}</td>
                  <td>${v.subtotal?.toFixed(2) ?? '0.00'}</td>
                  <td>${v.descuento?.toFixed(2) ?? '0.00'}</td>
                  <td>${v.total?.toFixed(2) ?? '0.00'}</td>
                  <td>{new Date(v.fecha_venta).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 style={{ color: '#2c3e50', marginTop: 12 }}>
            Ganancia total del día: <span style={{ color: '#27ae60' }}>${gananciaHoy.toFixed(2)}</span>
          </h3>
        </div>
      )}
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