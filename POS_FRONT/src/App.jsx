import React, { useState } from "react";
import { loginUsuario, getEmpleados, postEmpleado, deleteEmpleado } from "./api"; // suponiendo que extiendas api.js

export default function App() {
  const [page, setPage] = useState("login"); // login | menu | usuarios
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [empleados, setEmpleados] = useState([]);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({ nombre: "", cedula: "", rol: "cajero" });
  const [mensaje, setMensaje] = useState("");

  // -------------------
  // LOGIN
  // -------------------
  const handleLogin = async () => {
    try {
      const { session, error } = await loginUsuario(email, password);
      if (error) throw error;
      localStorage.setItem("token", session.access_token);
      setPage("menu");
    } catch (err) {
      setMensaje(err.message);
    }
  };

  // -------------------
  // CREAR EMPLEADO
  // -------------------
  const cargarEmpleados = async () => {
    const data = await getEmpleados();
    setEmpleados(data || []);
  };

  const crearEmpleado = async () => {
    const res = await postEmpleado(nuevoEmpleado);
    setMensaje(res.error ? res.error : "Empleado creado");
    cargarEmpleados();
  };

  const eliminarEmpleado = async (id) => {
    const res = await deleteEmpleado(id);
    setMensaje(res.error ? res.error : "Empleado eliminado");
    cargarEmpleados();
  };

  // -------------------
  // RENDER
  // -------------------
  if (page === "login") {
    return (
      <div>
        <h2>Login</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Ingresar</button>
        <p>{mensaje}</p>
      </div>
    );
  }

  if (page === "menu") {
    return (
      <div>
        <h2>Menú Principal</h2>
        <button onClick={() => { cargarEmpleados(); setPage("usuarios"); }}>Gestión de Usuarios</button>
        <button onClick={() => setPage("login")}>Cerrar sesión</button>
        <p>{mensaje}</p>
      </div>
    );
  }

  if (page === "usuarios") {
    return (
      <div>
        <h2>Usuarios</h2>

        <h3>Crear Empleado</h3>
        <input placeholder="Nombre" value={nuevoEmpleado.nombre} onChange={e => setNuevoEmpleado({...nuevoEmpleado, nombre: e.target.value})} />
        <input placeholder="Cédula" value={nuevoEmpleado.cedula} onChange={e => setNuevoEmpleado({...nuevoEmpleado, cedula: e.target.value})} />
        <select value={nuevoEmpleado.rol} onChange={e => setNuevoEmpleado({...nuevoEmpleado, rol: e.target.value})}>
          <option value="cajero">Cajero</option>
          <option value="administrador">Administrador</option>
        </select>
        <button onClick={crearEmpleado}>Crear</button>

        <h3>Lista de Empleados</h3>
        <button onClick={cargarEmpleados}>Actualizar lista</button>
        <ul>
          {empleados.map(e => (
            <li key={e.id_empleado}>
              {e.nombre} ({e.rol})
              <button onClick={() => eliminarEmpleado(e.id_empleado)}>Eliminar</button>
            </li>
          ))}
        </ul>

        <button onClick={() => setPage("menu")}>Volver al menú</button>
        <p>{mensaje}</p>
      </div>
    );
  }

  return null;
}
