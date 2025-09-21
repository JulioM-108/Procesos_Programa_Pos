import React, { useState, useEffect } from "react";
import {
  busquedaProductoNombre,
  postVenta,
  getUsuarioActual,
} from "./api";
import "./styles/Ventas.css";

export default function Ventas() {
  const [query, setQuery] = useState("");
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState({
    nombre: "ClienteDefault001",
    cedula: "000000000",
  });
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [pagina, setPagina] = useState(1);
  const [usuario, setUsuario] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState(null);
  const [ventaFinalizada, setVentaFinalizada] = useState(false);

  const porPagina = 6;

  // =========================
  // Cargar usuario actual
  // =========================
  useEffect(() => {
    const fetchUsuario = async () => {
      const u = await getUsuarioActual();
      if (u && !u.error) {
        setUsuario(u);
      }
    };
    fetchUsuario();
  }, []);

  // =========================
  // Helpers de stock derivado
  // =========================
  const getReservadoPorCodigo = (codigo) =>
    carrito.reduce(
      (acc, item) =>
        acc + (item.codigo === codigo ? Number(item.cantidad) || 0 : 0),
      0
    );

  const getDisponiblePorCodigo = (codigo) => {
    const prod = productos.find((p) => p.codigo === codigo);
    if (!prod) return 0;
    const reservado = getReservadoPorCodigo(codigo);
    const disponible = (prod.stockInicial ?? 0) - reservado;
    return disponible > 0 ? disponible : 0;
  };

  // =========================
  // Buscar productos
  // =========================
  const handleSearch = async () => {
    if (!query.trim()) return;
    const data = await busquedaProductoNombre(query);

    if (data && data.message === "OK") {
      const resultados = Array.isArray(data.resultados) ? data.resultados : [];
      const mapeados = resultados.map((p) => {
        const stockInicial = Number(p.cantidad) || 0;
        const reservado = getReservadoPorCodigo(p.codigo);
        return {
          ...p,
          stockInicial,
          disponible: Boolean(p.estado),
          qty: 1,
          stock: stockInicial - reservado >= 0 ? stockInicial - reservado : 0,
        };
      });
      setProductos(mapeados);
      setPagina(1);
    } else {
      const msg = data?.message ?? "Error desconocido en la búsqueda";
      alert(`Error en búsqueda: ${msg}`);
      setProductos([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // =========================
  // Cambiar cantidad seleccionada
  // =========================
  const handleCantidadChange = (codigo, delta) => {
    setProductos((prev) =>
      prev.map((p) => {
        if (p.codigo !== codigo) return p;
        const disponible = getDisponiblePorCodigo(p.codigo);
        const actual = p.qty ?? 1;
        const nuevo = Math.max(1, Math.min(actual + delta, disponible || 1));
        return { ...p, qty: nuevo };
      })
    );
  };

  // =========================
  // Agregar al carrito
  // =========================
  const handleAgregar = (producto) => {
    const disponible = getDisponiblePorCodigo(producto.codigo);
    const qty = Number(producto.qty) || 1;

    if (!producto.disponible) {
      alert(`Producto "${producto.nombre}" no disponible`);
      return;
    }
    if (qty > disponible) {
      alert(
        `Cantidad insuficiente de "${producto.nombre}". Disponible: ${disponible}`
      );
      return;
    }

    const fila = {
      codigo: producto.codigo,
      nombre: producto.nombre,
      cantidad: qty,
      precio: Number(producto.precio) || 0,
    };
    setCarrito((prev) => [...prev, fila]);

    setProductos((prev) =>
      prev.map((p) => (p.codigo === producto.codigo ? { ...p, qty: 1 } : p))
    );
  };

  // =========================
  // Eliminar del carrito
  // =========================
  const handleEliminar = (index) => {
    setCarrito((prev) => prev.filter((_, i) => i !== index));
    setProductos((prev) =>
      prev.map((p) => {
        const disponible = getDisponiblePorCodigo(p.codigo);
        const qty = Math.max(1, Math.min(p.qty ?? 1, Math.max(disponible, 1)));
        return { ...p, qty };
      })
    );
  };

  // =========================
  // Registrar venta
  // =========================
  const handleRegistrarVenta = async () => {
    if (!cliente.cedula || carrito.length === 0 || !usuario?.id_empleado) {
      setMensaje("Faltan datos para registrar la venta");
      setTipoMensaje("error");
      ocultarMensaje();
      return;
    }

    const venta = {
      venta: {
        cedula_cliente: cliente.cedula,
        id_empleado: usuario.id_empleado,
        fecha_venta: new Date().toISOString(),
      },
      detalles: carrito.map((item) => ({
        id_producto: item.codigo,
        nombre_producto: item.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
      })),
    };

    const resp = await postVenta(venta);

    if (resp && resp.message === "Venta creada correctamente") {
      setMensaje(resp.message);
      setTipoMensaje("exito");
      setVentaFinalizada(true);
    } else {
      setMensaje(resp?.message || "Error al registrar venta");
      setTipoMensaje("error");
    }
    ocultarMensaje();
  };

  // =========================
  // Registrar nueva venta
  // =========================
  const handleNuevaVenta = () => {
    setCarrito([]);
    setProductos([]);
    setCliente({ nombre: "ClienteDefault001", cedula: "000000000" });
    setVentaFinalizada(false);
    setMensaje(null);
    setTipoMensaje(null);
  };

  // =========================
  // Ocultar mensajes
  // =========================
  const ocultarMensaje = () => {
    setTimeout(() => {
      setMensaje(null);
      setTipoMensaje(null);
    }, 15000);
  };

  // =========================
  // Total del carrito
  // =========================
  const calcularTotal = () =>
    carrito
      .reduce(
        (sum, p) =>
          sum + (Number(p.precio) || 0) * (Number(p.cantidad) || 0),
        0
      )
      .toFixed(2);

  // =========================
  // Paginación
  // =========================
  const totalPaginas = Math.ceil(productos.length / porPagina);
  const productosPagina = productos.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  return (
    <div className="ventas-container">
      {/* ================== CARRITO ================== */}
      <div className="carrito">
        <h2> Ventas </h2>

        {usuario && (
        <ul className="empleado-info">
            <li><strong>Nombre:</strong> {usuario.nombre}</li>
            <li><strong>Rol:</strong> {usuario.rol === "administrador" ? "Administrador" : "Cajero"}</li>
          </ul>
        )}
        <label>
          Nombre cliente:
          <input
            type="text"
            value={cliente.nombre}
            onChange={(e) =>
              setCliente({ ...cliente, nombre: e.target.value })
            }
          />
        </label>

        <label>
          Cédula:
          <input
            type="text"
            value={cliente.cedula}
            onChange={(e) =>
              setCliente({ ...cliente, cedula: e.target.value })
            }
          />
        </label>

        <table className="tabla-carrito">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Unitario</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {carrito.map((item, index) => (
              <tr key={index}>
                <td>{item.codigo}</td>
                <td>{item.nombre}</td>
                <td>{item.cantidad}</td>
                <td>${Number(item.precio).toFixed(2)}</td>
                <td>
                  ${(Number(item.precio) * Number(item.cantidad)).toFixed(2)}
                </td>
                <td>
                  {!ventaFinalizada && (
                    <button onClick={() => handleEliminar(index)} className="tabla-carrito">Eliminar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Total: ${calcularTotal()}</h3>

        <label>
          Método de pago:
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            disabled={ventaFinalizada}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Pago con tarjeta</option>
          </select>
        </label>

        {!ventaFinalizada ? (
          <button className="btn-registrar" onClick={handleRegistrarVenta}>
            Registrar venta
          </button>
        ) : (
          <button className="btn-registrar" onClick={handleNuevaVenta}>
            Registrar nueva venta
          </button>
        )}

        {mensaje && (
          <div
            className={`mensaje-venta ${
              tipoMensaje === "exito" ? "mensaje-exito" : "mensaje-error"
            }`}
          >
            {mensaje}
          </div>
        )}
      </div>

      {/* ================== BÚSQUEDA ================== */}
      <div className="busqueda">
        <h2>Buscar productos</h2>

        <div className="buscador">
          <input
            type="text"
            placeholder="Ingrese nombre del producto"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch}>Buscar</button>
        </div>

        <div className="resultados">
          {productosPagina.map((p) => {
            const disponible = getDisponiblePorCodigo(p.codigo);
            const qty = p.qty ?? 1;
            const sinStock = disponible <= 0;
            const superaStock = qty > disponible;
            const deshabilitado = !p.disponible || sinStock || superaStock;

            return (
              <div
                key={p.codigo}
                className={`producto-card ${
                  deshabilitado ? "deshabilitado" : ""
                }`}
              >
                <h3>{p.nombre}</h3>
                <p className="descripcion">{p.descripcion}</p>
                <p>
                  <strong>Categoría:</strong> {p.categoria}
                </p>
                <p>
                  <strong>Precio:</strong> ${Number(p.precio).toFixed(2)} /
                  unidad
                </p>
                <p>
                  <strong>Stock:</strong> {disponible}
                </p>

                <div className="cantidad">
                  <button
                    onClick={() => handleCantidadChange(p.codigo, -1)}
                    disabled={!p.disponible || qty <= 1}
                  >
                    -
                  </button>
                  <span>{qty}</span>
                  <button
                    onClick={() => handleCantidadChange(p.codigo, 1)}
                    disabled={!p.disponible || qty >= disponible}
                  >
                    +
                  </button>
                </div>

                {(!p.disponible || sinStock || superaStock) && (
                  <div className="estado-msg">
                    {!p.disponible
                      ? "Producto no disponible"
                      : sinStock
                      ? "Sin stock"
                      : `Stock insuficiente (máx ${disponible})`}
                  </div>
                )}

                <button
                  onClick={() => handleAgregar(p)}
                  disabled={deshabilitado || ventaFinalizada}
                >
                  {deshabilitado ? "No disponible" : "Agregar"}
                </button>
              </div>
            );
          })}
        </div>

        {totalPaginas > 1 && (
          <div className="paginacion">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
            >
              ◀ Anterior
            </button>
            <span>
              Página {pagina} de {totalPaginas}
            </span>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
            >
              Siguiente ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}