import React, { useEffect, useState } from "react";
import { getEmpleados, postEmpleado, putEmpleado } from "./api";
import "./styles/Empleados.css";

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  // Formulario empleado
  const [form, setForm] = useState({
    cedula: "",
    nombre: "",
    rol: "cajero",
    telefono: "",
    email: "",
    password: "",
    estado: 1
  });
    const [editId, setEditId] = useState(null);
    const [formError, setFormError] = useState("");

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

      // Manejar cambios en el formulario
      const handleFormChange = e => {
        const { name, value, type } = e.target;
        setForm(f => ({
          ...f,
          [name]: type === "checkbox" ? (e.target.checked ? 1 : 0) : value
        }));
      };

      // Crear empleado
      const handleCrear = async e => {
        e.preventDefault();
        setFormError("");
        if (!form.email || !form.password || !form.cedula || !form.nombre) {
          setFormError("Completa todos los campos obligatorios");
          return;
        }
        const res = await postEmpleado(form);
        if (res.error) {
          setFormError(res.error);
        } else {
          setForm({ cedula: "", nombre: "", rol: "cajero", telefono: "", email: "", password: "", estado: 1 });
          cargarEmpleados();
        }
      };

      // Editar empleado
      const handleEditar = async e => {
        e.preventDefault();
        setFormError("");
        if (!form.cedula || !form.nombre || !form.email) {
          setFormError("Completa todos los campos obligatorios");
          return;
        }
        const res = await putEmpleado(editId, { ...form, password: undefined });
        if (res.error) {
          setFormError(res.error);
        } else {
          setEditId(null);
          setForm({ cedula: "", nombre: "", rol: "cajero", telefono: "", email: "", password: "", estado: 1 });
          cargarEmpleados();
        }
      };

      // Cargar datos en el form para editar
      const handleSetEdit = empleado => {
        setEditId(empleado.id_empleado);
        setForm({
          cedula: empleado.cedula,
          nombre: empleado.nombre,
          rol: empleado.rol,
          telefono: empleado.telefono || "",
          email: empleado.email,
          password: "",
          estado: empleado.estado
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      };

      // Cancelar edición
      const handleCancelEdit = () => {
        setEditId(null);
        setForm({ cedula: "", nombre: "", rol: "cajero", telefono: "", email: "", password: "", estado: 1 });
        setFormError("");
      };

      // Cambiar estado empleado
      const handleToggleEstado = async empleado => {
        const nuevoEstado = empleado.estado ? 0 : 1;
        await putEmpleado(empleado.id_empleado, { ...empleado, estado: nuevoEstado });
        cargarEmpleados();
      };

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

      {/* Formulario crear/editar empleado */}
      <form className="empleado-form" onSubmit={editId ? handleEditar : handleCrear}>
        <h2>{editId ? "Editar Empleado" : "Crear Empleado"}</h2>
        <div className="form-row">
          <input name="cedula" type="text" placeholder="Cédula*" value={form.cedula} onChange={handleFormChange} required />
          <input name="nombre" type="text" placeholder="Nombre*" value={form.nombre} onChange={handleFormChange} required />
          <select name="rol" value={form.rol} onChange={handleFormChange} required>
            <option value="administrador">Administrador</option>
            <option value="cajero">Cajero</option>
          </select>
          <input name="telefono" type="text" placeholder="Teléfono" value={form.telefono} onChange={handleFormChange} />
          <input name="email" type="email" placeholder="Email*" value={form.email} onChange={handleFormChange} required />
          {!editId && (
            <input name="password" type="password" placeholder="Password*" value={form.password} onChange={handleFormChange} required />
          )}
        </div>
        {formError && <div className="form-error">{formError}</div>}
        <div className="form-actions">
          <button type="submit" className="form-btn">{editId ? "Guardar Cambios" : "Crear Empleado"}</button>
          {editId && <button type="button" className="form-btn cancel" onClick={handleCancelEdit}>Cancelar</button>}
        </div>
      </form>

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
            <th>Acciones</th>
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
              <td>
                <button className="action-btn edit-btn" onClick={() => handleSetEdit(empleado)}>Editar</button>
                <button
                  className="action-btn toggle-btn"
                  onClick={() => handleToggleEstado(empleado)}
                >
                  {empleado.estado ? 'Desactivar' : 'Activar'}
                </button>
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

