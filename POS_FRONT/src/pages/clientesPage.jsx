import { useState, useEffect } from "react";
import { getClientes, postCliente, deleteCliente, getSession } from "../api";
import "./styles/Admin.css";

export default function ClientesPage() {
  const [user, setUser] = useState(null);
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const session = await getSession();
      setUser(session?.user || null);
    }
    fetchUser();
    fetchClientesData();
  }, []);

  const fetchClientesData = async () => {
    const data = await getClientes();
    if (data.error) setError(data.error);
    else setClientes(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const data = await postCliente({ cedula, nombre, telefono });
    if (data.error) setError(data.error);
    else {
      setError(null);
      setCedula("");
      setNombre("");
      setTelefono("");
      fetchClientesData();
    }
  };

  const handleDelete = async (cedulaCliente) => {
    const data = await deleteCliente(cedulaCliente);
    if (data.error) setError(data.error);
    else {
      setError(null);
      fetchClientesData();
    }
  };

  return (
    <div className="admin-container">
      <h1 className="main-title">Panel Administrativo</h1>

      <div className="admin-section-card">
        <h2 className="section-title">Crear Nuevo Empleado</h2>
        <div className="form-group">
          <input
            className="input-field"
            placeholder="Cédula"
            value={nuevoEmpleado.cedula}
            onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, cedula: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Nombre"
            value={nuevoEmpleado.nombre}
            onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })}
          />
        </div>
        <div className="form-group">
          <select
            className="select-field"
            value={nuevoEmpleado.rol}
            onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, rol: e.target.value })}
          >
            <option value="cajero">Cajero</option>
            <option value="administrador">Administrador</option>
          </select>
          <button className="main-button" onClick={handleCrearEmpleado}>Crear</button>
        </div>
      </div>

      <div className="admin-section-card">
        <h2 className="section-title">Empleados</h2>
        <ul className="list-group">
          {empleados.map(emp => (
            <li className="list-item" key={emp.id_empleado}>
              {emp.nombre} - {emp.rol}
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-section-card">
        <h2 className="section-title">Clientes</h2>
        <ul className="list-group">
          {clientes.map(cli => (
            <li className="list-item" key={cli.cedula}>
              {cli.nombre} - {cli.cedula}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
