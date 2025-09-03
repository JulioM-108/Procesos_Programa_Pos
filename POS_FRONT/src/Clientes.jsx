import React, { useEffect, useState } from "react";
import { getClientes, postCliente } from "./api";
import "./styles/cliente.css";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nuevoCliente, setNuevoCliente] = useState({
    cedula: "",
    nombre: "",
    telefono: ""
  });

  // Cargar clientes al inicio
  useEffect(() => {
    cargarClientes();
  }, []);

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

  if (loading) {
    return <div style={{ padding: 20 }}>Cargando clientes...</div>;
  }

  return (
       <div className="cliente-container">
          <h1 className="cliente-title"> Gestión de Clientes</h1>
          <div className="cliente-card">

          {error && (
            <div style={{ 
              color: 'red', 
              padding: 10, 
              marginBottom: 20, 
              border: '1px solid red',
              backgroundColor: '#ffebee'
            }}>
              Error: {error}
              <button onClick={cargarClientes} style={{ marginLeft: 10 }}>
                Reintentar
              </button>
            </div>
          )}

          <h2 >Crear Nuevo Cliente</h2>
          <div style={{ marginBottom: 20 }}>
            <input
              placeholder="Cédula"
              value={nuevoCliente.cedula}
              onChange={e => setNuevoCliente({ ...nuevoCliente, cedula: e.target.value })}
              className="cliente-input"  
            />
            <input
              placeholder="Nombre"
              value={nuevoCliente.nombre}
              onChange={e => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
              className="cliente-input"  
            />
            <input
              placeholder="Teléfono"
              value={nuevoCliente.telefono}
              onChange={e => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
              className="cliente-input" 
            />
            <button onClick={handleCrearCliente} > Crear Cliente</button>
          </div>
          </div>

          <h2 className="cliente-title" > Clientes Existentes ({clientes.length})</h2>
          {clientes.length === 0 ? (
            <p>No hay clientes registrados.</p>
          ) : (
            <table className="clientes-table" border={1} cellPadding={5} style={{ marginTop: 10, width: '100%' }}>
              <thead>
                <tr>
                  <th >Cédula</th>
                  <th >Nombre</th>
                  <th >Teléfono</th>
                  <th >Puntos</th>
                  <th >Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(cli => (
                  <tr key={cli.cedula}>
                    <td>{cli.cedula}</td>
                    <td>{cli.nombre}</td>
                    <td>{cli.telefono || 'N/A'}</td>
                    <td>{cli.puntos || 0}</td>
                    <td>{cli.fecha_registro ? new Date(cli.fecha_registro).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
  );
}