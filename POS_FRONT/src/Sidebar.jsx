import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUsuarioActual } from "./api";
import "./styles/Layout.css";
import { FaUserTie, FaUsers, FaBoxes, FaShoppingCart, FaChartLine, FaSignOutAlt } from "react-icons/fa";

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
              <Link to="/empleados">
                <FaUserTie className="sidebar-icon" />
                <span>Empleados</span>
              </Link>
            </li>
          )}
          <li>
            <Link to="/clientes">
              <FaUsers className="sidebar-icon" />
              <span>Clientes</span>
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/productos">
                <FaBoxes className="sidebar-icon" />
                <span>Productos</span>
              </Link>
            </li>
          )}
          <li>
            <Link to="/ventas">
              <FaShoppingCart className="sidebar-icon" />
              <span>Ventas</span>
            </Link>
          </li>
          {isAdmin && (
            <>
              <li>
                <Link to="/detalle-ventas">
                  <FaShoppingCart className="sidebar-icon" />
                  <span>Detalle Ventas</span>
                </Link>
              </li>
              <li>
                <Link to="/graficas">
                  <FaChartLine className="sidebar-icon" />
                  <span>Gráficas</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt className="sidebar-icon" />
        <span>Cerrar Sesión</span>
      </button>
    </aside>
  );
}
