import React, { useEffect, useState } from "react";
import { getUsuarioActual } from "./api";

export default function UserInfo() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Cargando...</p>;

  if (!usuario) return <p>No se pudo obtener el usuario actual</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Información del Usuario</h2>
      <p><strong>Nombre:</strong> {usuario.nombre}</p>
      <p><strong>Email:</strong> {usuario.email}</p>
      <p>
        <strong>Rol:</strong>{" "}
        {usuario.rol === "administrador" ? "Administrador" : "Cajero"}
      </p>
    </div>
  );
}
