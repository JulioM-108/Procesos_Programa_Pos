// src/api.js

const API_URL = "http://localhost:3000/api";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// Helper para manejar respuestas
async function handleResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Error en la respuesta:", data || response.statusText);
    return data || { error: response.statusText || "Error desconocido" };
  }

  return data;
}

// ==========================
// AUTENTICACIÓN Y MFA
// ==========================
export async function login(email, password, mfaCode = null) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, mfaCode }),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { error: error.message };
  }
}

export async function enrollMFA() {
  try {
    const res = await fetch(`${API_URL}/auth/mfa/enroll`, {
      method: "POST",
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al enrolar MFA:", error);
    return { error: error.message };
  }
}

export async function verifyMFA(factorId, code) {
  try {
    const res = await fetch(`${API_URL}/auth/mfa/verify`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify({ factorId, code }),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al verificar MFA:", error);
    return { error: error.message };
  }
}

export async function getMfaFactors() {
  try {
    const res = await fetch(`${API_URL}/auth/mfa/factors`, {
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al obtener factores MFA:", error);
    return { error: error.message };
  }
}

export async function unenrollMFA(factorId) {
  try {
    const res = await fetch(`${API_URL}/auth/mfa/unenroll`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify({ factorId }),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al desenrolar MFA:", error);
    return { error: error.message };
  }
}

export async function logout() {
  try {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return { error: error.message };
  }
}

// ==========================
// Usuario actual
// ==========================
export async function getUsuarioActual() {
  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    return { error: error.message };
  }
}

// ==========================
// CLIENTES
// ==========================
export async function getClientes() {
  try {
    const res = await fetch(`${API_URL}/clientes`, {
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return { error: error.message };
  }
}

export async function postCliente(cliente) {
  try {
    const res = await fetch(`${API_URL}/clientes`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(cliente),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return { error: error.message };
  }
}

export async function putCliente(cedula, cliente) {
  try {
    const res = await fetch(`${API_URL}/clientes/${cedula}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(cliente),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return { error: error.message };
  }
}

// ==========================
// EMPLEADOS
// ==========================
export async function getEmpleados() {
  try {
    const res = await fetch(`${API_URL}/empleados`, {
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    return { error: error.message };
  }
}

export async function postEmpleado(empleado) {
  try {
    const res = await fetch(`${API_URL}/empleados/register`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(empleado),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al crear empleado:", error);
    return { error: error.message };
  }
}

export async function putEmpleado(id_empleado, empleado) {
  try {
    const res = await fetch(`${API_URL}/empleados/${id_empleado}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(empleado),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    return { error: error.message };
  }
}

// ==========================
// PRODUCTOS
// ==========================
export async function getProductos() {
  try {
    const res = await fetch(`${API_URL}/productos`, {
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return { error: error.message };
  }
}

export async function postProducto(producto) {
  try {
    const res = await fetch(`${API_URL}/productos`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(producto),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al crear producto:", error);
    return { error: error.message };
  }
}

export async function createProducto(producto) {
  const res = await fetch(`${API_URL}/productos`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(producto),
  });
  if (!res.ok) throw new Error("Error al crear producto");
  return res.json();
}

export async function updateProducto(producto) {
  try {
    const res = await fetch(`${API_URL}/productos`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(producto),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return { error: error.message };
  }
}

export async function toggleEstadoProducto(id_producto, estadoActual) {
  try {
    const res = await fetch(`${API_URL}/productos`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify({ id_producto, estado: !estadoActual }),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    return { error: error.message };
  }
}

export async function busquedaProductoNombre(querytxt) {
  try {
    const res = await fetch(
      `${API_URL}/productos/query_name?query=${encodeURIComponent(querytxt)}`,
      {
        headers: getAuthHeader(),
      }
    );
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return { error: error.message };
  }
}

// ==========================
// CATEGORIAS
// ==========================
export async function getCategorias() {
  try {
    const res = await fetch(`${API_URL}/productos/categorias`, {
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return { error: error.message };
  }
}

// ==========================
// VENTAS
// ==========================
export async function getVentas() {
  try {
    const res = await fetch(`${API_URL}/ventas`, {
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return { error: error.message };
  }
}

export async function postVenta(venta) {
  try {
    const res = await fetch(`${API_URL}/ventas`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(venta),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al crear venta:", error);
    return { error: error.message };
  }
}

// ==========================
// DETALLE VENTAS
// ==========================
export async function getDetalleVenta(id_venta) {
  try {
    const res = await fetch(`${API_URL}/ventas/${id_venta}/detalle`, {
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al obtener detalle de venta:", error);
    return { error: error.message };
  }
}

export async function postDetalleVenta(id_venta, detalle) {
  try {
    const res = await fetch(`${API_URL}/ventas/${id_venta}/detalle`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(detalle),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al crear detalle de venta:", error);
    return { error: error.message };
  }
}

// ==========================
// HISTORIAL PUNTOS
// ==========================
export async function getHistorialPuntos() {
  try {
    const res = await fetch(`${API_URL}/historial_puntos`, {
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al obtener historial de puntos:", error);
    return { error: error.message };
  }
}

// ==========================
// REPORTES
// ==========================
export async function getTopProductos(desde, hasta, limite = 10) {
  try {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    params.append("limite", String(limite));

    const res = await fetch(`${API_URL}/reportes/top_productos?${params.toString()}`, {
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al obtener top productos:", error);
    return { error: error.message };
  }
}

// export async function getClientesFrecuentes(desde, hasta, limite = 10) {
//   try {
//     const params = new URLSearchParams();
//     if (desde) params.append("desde", desde);
//     if (hasta) params.append("hasta", hasta);
//     params.append("limite", String(limite));
//     const res = await fetch(`${API_URL}/reportes/clientes-frecuentes2?${params.toString()}`, { headers: getAuthHeader() });
//     return await handleResponse(res);
//   } catch (error) {
//     console.error("Error getClientesFrecuentes:", error);
//     return { error: error.message };
//   }
// }
// ==========================
// REPORTES
// ==========================

// Clientes más frecuentes (directo)
export async function getClientesFrecuentesDirecto(desde, hasta, limite = 10) {
  try {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    params.append("limite", String(limite));

    const res = await fetch(`${API_URL}/reportes/clientes-frecuentes?${params.toString()}`, {
      headers: getAuthHeader(),
    });

    return await handleResponse(res);
  } catch (error) {
    console.error("Error en getClientesFrecuentesDirecto:", error);
    return { error: error.message };
  }
}

// export async function getProductosBajoStock(umbral = 5) {
//   try {
//     const res = await fetch(`${API_URL}/reportes/productos-bajo-stock2?umbral=${encodeURIComponent(String(umbral))}`, { headers: getAuthHeader() });
//     return await handleResponse(res);
//   } catch (error) {
//     console.error("Error getProductosBajoStock:", error);
//     return { error: error.message };
//   }
// }
// 📦 Productos con bajo stock (directo)
export async function getProductosBajoStock(limite = 10) {
  try {
    const res = await fetch(`${API_URL}/reportes/productos_bajo_stock?limite=${limite}`, {
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (err) {
    console.error("Error en getProductosBajoStock:", err);
    return { error: err.message };
  }
}



export async function getListadoVentas(meses = 3) {
  try {
    const res = await fetch(`${API_URL}/reportes/listado_ventas?meses=${meses}`, {
      headers: getAuthHeader(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al obtener listado ventas:", error);
    return { error: error.message };
  }
}
