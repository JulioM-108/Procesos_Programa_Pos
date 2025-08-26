import { useState, useEffect } from "react";
import { getClientes, postCliente, deleteCliente, getSession } from "../api";

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
    <div>
      <h2>Gestión de Clientes</h2>
      {user && <p>Logueado como: {user.email}</p>}

      <h3>Crear Cliente</h3>
      <form onSubmit={handleCreate}>
        <input type="text" placeholder="Cédula" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <input type="text" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        <button type="submit">Crear</button>
      </form>

      <h3>Lista de Clientes</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {clientes.map((c) => (
          <li key={c.cedula}>
            {c.nombre} ({c.cedula}) - {c.telefono}{" "}
            <button onClick={() => handleDelete(c.cedula)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
