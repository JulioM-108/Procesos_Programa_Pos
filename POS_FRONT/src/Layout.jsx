import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { getUsuarioActual } from "./api";
import "./styles/Layout.css";

export default function Layout() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsuario() {
      const data = await getUsuarioActual();
      if (!data.error) {
        setUsuario(data);
      } else {
        console.error("Error:", data.error);
      }
      setLoading(false);
    }
    fetchUsuario();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) return <p>Cargando...</p>;
  if (!usuario) return <p>Error al cargar usuario</p>;

  const isAdmin = usuario.rol === "administrador";

  return (
    <div className="layout-container">
      {/* Sidebar siempre visible */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Menú</h2>
        <nav>
          <ul>
            {isAdmin && <li><Link to="/empleados">Empleados</Link></li>}
            <li><Link to="/clientes">Clientes</Link></li>
            {isAdmin && <li><Link to="/productos">Productos</Link></li>}
            <li><Link to="/ventas">Ventas</Link></li>
            {isAdmin && <>
              <li><Link to="/detalle-ventas">Detalle Ventas</Link></li>
              <li><Link to="/graficas">Gráficas</Link></li>
            </>}
            <li><Link to="/userInfo">Información de Usuario</Link></li>
          </ul>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>
      </aside>

      {/* Contenido principal */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
