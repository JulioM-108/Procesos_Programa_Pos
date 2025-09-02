import React, { useEffect, useState } from "react";
import { getEmpleados, postCliente, getClientes, putCliente } from "./api";


export default function AdminPanel() {
  const [empleados, setEmpleados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({ cedula: "", nombre: "", rol: "cajero" });

  useEffect(() => {
    cargarEmpleados();
    cargarClientes();
  }, []);

  const cargarEmpleados = async () => {
    const data = await getEmpleados();
    setEmpleados(data);
  };

  const cargarClientes = async () => {
    const data = await getClientes();
    setClientes(data);
  };

  const handleCrearEmpleado = async () => {
    const created = await postCliente(nuevoEmpleado); // Aquí puedes crear un endpoint para empleados si quieres
    console.log(created);
    cargarEmpleados();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Panel Administrativo</h1>

      <h2>Crear Nuevo Empleado</h2>
      <input
        placeholder="Cédula"
        value={nuevoEmpleado.cedula}
        onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, cedula: e.target.value })}
      />
      <input
        placeholder="Nombre"
        value={nuevoEmpleado.nombre}
        onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })}
      />
      <select
        value={nuevoEmpleado.rol}
        onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, rol: e.target.value })}
      >
        <option value="cajero">Cajero</option>
        <option value="administrador">Administrador</option>
      </select>
      <button onClick={handleCrearEmpleado}>Crear</button>

      <h2>Empleados</h2>
      <ul>
        {empleados.map(emp => (
          <li key={emp.id_empleado}>
            {emp.nombre} - {emp.rol}
            {/* Aquí puedes agregar botón de eliminar */}
          </li>
        ))}
      </ul>

      <h2>Clientes</h2>
      <ul>
        {clientes.map(cli => (
          <li key={cli.cedula}>
            {cli.nombre} - {cli.cedula}
            {/* Aquí puedes agregar botón de eliminar o editar */}
          </li>
        ))}
      </ul>
    </div>
  );
}
