import React, { useEffect, useState } from "react";
import { getClientes, postCliente, putCliente } from "./api";
import { useNavigate } from "react-router-dom";
import "./styles/cliente.css";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [tipoBusqueda, setTipoBusqueda] = useState("cedula");
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 10;
  const navigate = useNavigate();

  const [cedulaEliminar, setCedulaEliminar] = useState("");
  const [nuevoCliente, setNuevoCliente] = useState({
    cedula: "",
    nombre: "",
    telefono: "",
  });

  const [cedulaOriginal, setCedulaOriginal] = useState("");
  const [clienteEditar, setClienteEditar] = useState({
    cedula: "",
    nombre: "",
    telefono: ""
  });
  const [cargandoEdicion, setCargandoEdicion] = useState(false);

  // Cargar clientes al inicio
  useEffect(() => {
    cargarClientes();
  }, []);

  // Efecto para filtrar clientes
  useEffect(() => {
    if (!busqueda) {
      setClientesFiltrados(clientes);
      return;
    }

    const filtrados = clientes.filter(cliente => {
      const valor = cliente[tipoBusqueda].toString().toLowerCase();
      return valor.includes(busqueda.toLowerCase());
    });
    setClientesFiltrados(filtrados);
    setPaginaActual(1); // Reset a la primera página cuando se filtra
  }, [busqueda, tipoBusqueda, clientes]);

  // Lógica de paginación
  const indiceUltimoCliente = paginaActual * clientesPorPagina;
  const indicePrimerCliente = indiceUltimoCliente - clientesPorPagina;
  const clientesActuales = clientesFiltrados.slice(indicePrimerCliente, indiceUltimoCliente);
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

  const cambiarPagina = (direccion) => {
    if (direccion === 'anterior' && paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    } else if (direccion === 'siguiente' && paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const cargarClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getClientes();
      console.log('Datos recibidos:', data); // Para debug
      
      if (data.error) {
        setError(data.error);
        setClientes([]);
      } else {
        setClientes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('Error al cargar los clientes');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCliente = async () => {
    if (!nuevoCliente.cedula || !nuevoCliente.nombre) {
      return alert("Cédula y nombre son obligatorios");
    }

    try {
      const creado = await postCliente(nuevoCliente);
      
      if (creado.error) {
        alert("Error: " + creado.error);
        return;
      }

      // Limpiar inputs y recargar lista
      setNuevoCliente({ cedula: "", nombre: "", telefono: "" });
      await cargarClientes();
      alert("Cliente creado exitosamente");
    } catch (err) {
      console.error('Error al crear cliente:', err);
      alert("Error al crear el cliente");
    }
  };

// Función eliminar con input
const handleEliminarCliente = async () => {
  if (!cedulaEliminar) {
    return alert("Por favor ingresa una cédula");
  }

  try {
    const actualizado = await putCliente(cedulaEliminar, { estado: 0 });

    if (actualizado.error) {
      alert("Error: " + actualizado.error);
      return;
    }

    await cargarClientes();
    alert("Cliente eliminado (Estado = 0)");

    // Limpiar input
    setCedulaEliminar("");
  } catch (err) {
    console.error("Error al eliminar cliente:", err);
    alert("Error al eliminar cliente");
  }
};


  const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/", { replace: true });
  };


useEffect(() => {
  const fetchCliente = async () => {
    if (cedulaOriginal && cedulaOriginal.length >= 6) { // ajusta longitud mínima
      try {
        const data = await getClientes();
        if (data.error) {
          console.error("Error al cargar clientes:", data.error);
          return;
        }

        const encontrado = data.find(cli => cli.cedula === cedulaOriginal);
        if (encontrado) {
          setClienteEditar({
            nombre: encontrado.nombre,
            telefono: encontrado.telefono || "",
          });
        } else {
          setClienteEditar({ nombre: "", telefono: "" });
        }
      } catch (err) {
        console.error("Error buscando cliente:", err);
      }
    } else {
      setClienteEditar({ nombre: "", telefono: "" });
    }
  };

  fetchCliente();
}, [cedulaOriginal]);


const handleEditarCliente = async () => {
  if (!cedulaOriginal) return alert("Indica la cédula del cliente que deseas modificar");
  if (!clienteEditar.nombre) return alert("El nombre es obligatorio");

  try {
    setCargandoEdicion(true);
    const res = await putCliente(cedulaOriginal, clienteEditar);

    if (res.error) {
      alert("Error: " + res.error);
      return;
    }

    await cargarClientes();
    alert("Cliente actualizado correctamente");
    setCedulaOriginal("");
    setClienteEditar({ nombre: "", telefono: "" });
  } catch (err) {
    console.error("Error al editar cliente:", err);
    alert("Error al actualizar el cliente");
  } finally {
    setCargandoEdicion(false);
  }
};



  if (loading) {
    return <div style={{ padding: 20 }}>Cargando clientes...</div>;
  }

  return (
    <div className="cliente-container">
      <div className="cliente-header">
        <h1 className="cliente-title2">Gestión de Clientes</h1>
        <button className="cliente-logout" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      <div className="cliente-cards-container">
        
        <div className="cliente-card cliente-card-edit">
          <h2>Modificar Cliente</h2>
          <input
            placeholder="Cédula del cliente"
            value={cedulaOriginal}
            onChange={e => setCedulaOriginal(e.target.value)}
            className="cliente-input"
            style={{ marginBottom: "10px" }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              placeholder="Nombre"
              value={clienteEditar.nombre}
              onChange={e =>
                setClienteEditar({ ...clienteEditar, nombre: e.target.value })
              }
              className="cliente-input"
            />
            <input
              placeholder="Teléfono"
              value={clienteEditar.telefono}
              onChange={e =>
                setClienteEditar({ ...clienteEditar, telefono: e.target.value })
              }
              className="cliente-input"
            />
          </div>
          <div style={{ marginTop: "14px" }}>
            <button
              onClick={handleEditarCliente}
              disabled={cargandoEdicion}
            >
              {cargandoEdicion ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        <div className="cliente-card">
          {error && (
            <div>
              Error: {error}
              <button onClick={cargarClientes} style={{ marginLeft: 10 }}>
                Reintentar
              </button>
            </div>
          )}
          <h2>Crear Nuevo Cliente</h2>
          <div style={{ marginBottom: 20 }}>
            <input
              placeholder="Cédula"
              value={nuevoCliente.cedula}
              onChange={e =>
                setNuevoCliente({ ...nuevoCliente, cedula: e.target.value })
              }
              className="cliente-input"
              style={{ marginBottom: "12px" }}
            />
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
            >
              <input
                placeholder="Nombre"
                value={nuevoCliente.nombre}
                onChange={e =>
                  setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })
                }
                className="cliente-input"
              />
              <input
                placeholder="Teléfono"
                value={nuevoCliente.telefono}
                onChange={e =>
                  setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })
                }
                className="cliente-input"
              />
            </div >
            <button style={{ marginTop: "13px" }} onClick={handleCrearCliente}>Crear Cliente</button>
          </div>
        </div>
        <div className="cliente-card1">
          <h2>Eliminar Cliente</h2>
          <input
            placeholder="Cédula"
            value={cedulaEliminar}
            onChange={e => setCedulaEliminar(e.target.value)}
            className="cliente-input1"
          />
          <button  onClick={handleEliminarCliente}>Eliminar Cliente</button>
        </div>
      </div>
      <h2 className="cliente-title">
        Clientes Existentes ({clientesFiltrados.length})
      </h2>

      <div className="cliente-busqueda">
        <select 
          value={tipoBusqueda} 
          onChange={(e) => setTipoBusqueda(e.target.value)}
          className="cliente-select"
        >
          <option value="cedula">Buscar por Cédula</option>
          <option value="nombre">Buscar por Nombre</option>
        </select>
        <input
          type="text"
          placeholder={`Buscar por ${tipoBusqueda}...`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="cliente-input-busqueda"
        />
      </div>

      {clientesFiltrados.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        <table
          className="clientes-table"
          border={1}
          cellPadding={6}
          style={{ marginTop: 10, width: "100%" }}
        >
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Puntos</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
            {clientesActuales.map(cli => (
              <tr key={cli.cedula}>
                <td>{cli.cedula}</td>
                <td>{cli.nombre}</td>
                <td>{cli.telefono || "N/A"}</td>
                <td>{cli.puntos || 0}</td>
                <td>
                  <span className={`estado-badge ${cli.estado ? 'activo' : 'inactivo'}`}>
                    {cli.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  {cli.fecha_registro
                    ? new Date(cli.fecha_registro).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {clientesFiltrados.length > 0 && (
        <div className="paginacion">
          <button 
            onClick={() => cambiarPagina('anterior')} 
            disabled={paginaActual === 1}
            className="paginacion-btn"
          >
            Anterior
          </button>
          <span className="paginacion-info">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button 
            onClick={() => cambiarPagina('siguiente')} 
            disabled={paginaActual === totalPaginas}
            className="paginacion-btn"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};