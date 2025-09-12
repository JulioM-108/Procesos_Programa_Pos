import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUsuarioActual } from "./api";
import "./styles/Layout.css";

export default function Sidebar() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsuario() {
      const data = await getUsuarioActual();
      if (!data.error) {
        setUsuario(data);
      }
    }
    fetchUsuario();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!usuario) return null;

  const isAdmin = usuario.rol === "administrador";

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Menú</h2>
      <nav>
        <ul>
          {isAdmin && (
            <li>
              <Link to="/empleados">Empleados</Link>
            </li>
          )}
          <li>
            <Link to="/clientes">Clientes</Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/productos">Productos</Link>
            </li>
          )}
          <li>
            <Link to="/ventas">Ventas</Link>
          </li>
          {isAdmin && (
            <>
              <li>
                <Link to="/detalle-ventas">Detalle Ventas</Link>
              </li>
              <li>
                <Link to="/graficas">Gráficas</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </aside>
  );
}
