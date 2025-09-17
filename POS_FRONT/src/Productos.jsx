import React, { useState, useEffect } from "react";
import {
  getProductos,
  postProducto,
  updateProducto,
  toggleEstadoProducto,
} from "./api";
import "./styles/Producto.css";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [productoEdit, setProductoEdit] = useState(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 10;

  // ==============================
  // Cargar productos
  // ==============================
  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    const data = await getProductos();
    if (!data.error) {
      setProductos(data);

      // generar lista de categorías únicas
      const cats = [...new Set(data.map((p) => p.categoria).filter(Boolean))];
      setCategorias(cats);
    }
  }

  // ==============================
  // Crear producto
  // ==============================
  async function handleCrear(e) {
    e.preventDefault();
    const form = e.target;
    const nuevo = {
      nombre: form.nombre.value,
      descripcion: form.descripcion.value,
      peso: form.peso.value,
      cantidad: parseInt(form.cantidad.value),
      precio: parseFloat(form.precio.value.replace(",", ".")),
      categoria: form.categoria.value,
    };

    const res = await postProducto(nuevo);
    if (!res.error) {
      form.reset();
      await cargarProductos();
    } else {
      alert("Error al crear producto");
    }
  }

  // ==============================
  // Editar producto
  // ==============================
  async function handleEditar(e) {
    e.preventDefault();
    if (!productoEdit) return;

    const actualizado = {
      ...productoEdit,
      precio: parseFloat(productoEdit.precio),
      cantidad: parseInt(productoEdit.cantidad),
    };

    const res = await updateProducto(actualizado);
    if (!res.error) {
      setProductoEdit(null);
      await cargarProductos();
    } else {
      alert("Error al actualizar producto");
    }
  }

  // ==============================
  // Cambiar estado
  // ==============================
  async function handleToggleEstado(p) {
    await toggleEstadoProducto(p.id_producto, p.estado);
    await cargarProductos();
  }

  // ==============================
  // Filtrado
  // ==============================
  const productosFiltrados = productos.filter((p) => {
    const coincideNombre = p.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro
      ? p.categoria === categoriaFiltro
      : true;
    return coincideNombre && coincideCategoria;
  });

  // ==============================
  // Paginación
  // ==============================
  const indexUltimo = paginaActual * productosPorPagina;
  const indexPrimero = indexUltimo - productosPorPagina;
  const paginaProductos = productosFiltrados.slice(
    indexPrimero,
    indexUltimo
  );
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  return (
    <div className="productos-container">
      <h1 className="producto-title">Gestión de Productos</h1>

      {/* Formulario crear y editar */}
      <div className="producto-forms">
        {/* Crear */}
        <form className="producto-form" onSubmit={handleCrear}>
          <h2>Crear Producto</h2>
          <input name="nombre" placeholder="Nombre" required />
          <input name="descripcion" placeholder="Descripción" />
          <input name="peso" placeholder="Peso (ej: 500ml, 1kg)" />
          <input name="cantidad" type="number" placeholder="Cantidad" required />
          <input name="precio" type="text" placeholder="Precio" required />
          <input name="categoria" placeholder="Categoría" />
          <button type="submit">Crear</button>
        </form>

        {/* Editar */}
        {productoEdit && (
          <form className="producto-form" onSubmit={handleEditar}>
            <h2>Editar Producto</h2>
            <input
              value={productoEdit.nombre}
              onChange={(e) =>
                setProductoEdit({ ...productoEdit, nombre: e.target.value })
              }
              required
            />
            <input
              value={productoEdit.descripcion || ""}
              onChange={(e) =>
                setProductoEdit({ ...productoEdit, descripcion: e.target.value })
              }
            />
            <input
              value={productoEdit.peso || ""}
              onChange={(e) =>
                setProductoEdit({ ...productoEdit, peso: e.target.value })
              }
            />
            <input
              type="number"
              value={productoEdit.cantidad}
              onChange={(e) =>
                setProductoEdit({ ...productoEdit, cantidad: e.target.value })
              }
            />
            <input
              type="text"
              value={productoEdit.precio}
              onChange={(e) =>
                setProductoEdit({ ...productoEdit, precio: e.target.value })
              }
            />
            <select
              value={productoEdit.categoria || ""}
              onChange={(e) =>
                setProductoEdit({ ...productoEdit, categoria: e.target.value })
              }
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button type="submit">Guardar cambios</button>
          </form>
        )}
      </div>

      {/* Lista de productos */}
      <h2 className="producto-subtitle">
        Lista de Productos ({productosFiltrados.length})
      </h2>

      {/* Barra de búsqueda */}
      <div className="producto-busqueda">
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <table className="producto-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Peso</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginaProductos.map((p) => (
            <tr key={p.id_producto}>
              <td>{p.nombre}</td>
              <td>{p.descripcion}</td>
              <td>{p.peso}</td>
              <td>{p.cantidad}</td>
              <td>{p.precio}</td>
              <td>{p.categoria}</td>
              <td>
                <span className={`estado-badge ${p.estado ? 'activo' : 'inactivo'}`}>
                  {p.estado ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <button onClick={() => setProductoEdit(p)}>Editar</button>
                <button onClick={() => handleToggleEstado(p)}>
                  {p.estado ? "Desactivar" : "Activar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      {productosFiltrados.length > 0 && (
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
