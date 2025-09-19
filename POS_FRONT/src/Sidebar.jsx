import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUsuarioActual } from "./api";
import "./styles/Layout.css";
import { 
  FaUserTie, FaUsers, FaBoxes, FaShoppingCart, 
  FaChartLine, FaSignOutAlt, FaUser, FaBars, FaTimes 
} from "react-icons/fa";

export default function Sidebar() {
  const [usuario, setUsuario] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
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
  const isCajero = usuario.rol === "cajero";

  return (
    <>
      {/* Botón de hamburguesa */}
      <button 
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "active" : ""}`}>
        <h2 className="sidebar-title">Menú</h2>
        <nav>
          <ul>
            {isAdmin && (
              <li>
                <Link to="/empleados" onClick={() => setIsOpen(false)}>
                  <FaUserTie className="sidebar-icon" />
                  <span>Empleados</span>
                </Link>
              </li>
            )}
            <li>
              <Link to="/clientes" onClick={() => setIsOpen(false)}>
                <FaUsers className="sidebar-icon" />
                <span>Clientes</span>
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/productos" onClick={() => setIsOpen(false)}>
                  <FaBoxes className="sidebar-icon" />
                  <span>Productos</span>
                </Link>
              </li>
            )}
            <li>
              <Link to="/ventas" onClick={() => setIsOpen(false)}>
                <FaShoppingCart className="sidebar-icon" />
                <span>Ventas</span>
              </Link>
            </li>
            <li>
              <Link to="/detalle-ventas" onClick={() => setIsOpen(false)}>
                <FaShoppingCart className="sidebar-icon" />
                <span>Historial Ventas</span>
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/graficas" onClick={() => setIsOpen(false)}>
                  <FaChartLine className="sidebar-icon" />
                  <span>Gráficas</span>
                </Link>
              </li>
            )}
            <li>
              <Link to="/userInfo" onClick={() => setIsOpen(false)}>
                <FaUser className="sidebar-icon" />
                <span>Información de Usuario</span>
              </Link>
            </li>
          </ul>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="sidebar-icon" />
          <span>Cerrar Sesión</span>
        </button>
      </aside>
    </>
  );
}
