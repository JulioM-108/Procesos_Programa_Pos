const API_URL = "http://localhost:3000/api";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return { 
    "Authorization": `Bearer ${token}`, 
    "Content-Type": "application/json" 
  };
}

// Helper para manejar respuestas
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error en la respuesta:', errorData);
    return { error: errorData.error || 'Error desconocido' };
  }
  return await response.json();
}

// ==========================
// Usuario actual
// ==========================
export async function getUsuarioActual() {
  try {
    const res = await fetch(`${API_URL}/me`, { 
      headers: getAuthHeader() 
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
      headers: getAuthHeader() 
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return { error: error.message };
  }
}

export async function postCliente(cliente) {
  try {
    const res = await fetch(`${API_URL}/clientes`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(cliente)
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return { error: error.message };
  }
}

export async function putCliente(cedula, cliente) {
  try {
    const res = await fetch(`${API_URL}/clientes/${cedula}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(cliente)
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return { error: error.message };
  }
}

// ==========================
// EMPLEADOS
// ==========================
// Obtener todos los empleados
export async function getEmpleados() {
  try {
    const res = await fetch(`${API_URL}/empleados`, { 
      headers: getAuthHeader() 
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return { error: error.message };
  }
}
// Crear nuevo empleado (incluye crear usuario en auth)
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
// Editar empleado existente (solo tabla empleados, no auth)
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
      headers: getAuthHeader() 
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return { error: error.message };
  }
}

export async function postProducto(producto) {
  try {
    const res = await fetch(`${API_URL}/productos`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(producto)
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error al crear producto:', error);
    return { error: error.message };
  }
}

// Crear producto
export async function createProducto(producto) {
  const res = await fetch(`${API_URL}/productos`, {
    method: "POST",
//    headers: { "Content-Type": "application/json" },
    headers: getAuthHeader(), // ✅ incluye Authorization
    body: JSON.stringify(producto),
  });
  if (!res.ok) throw new Error("Error al crear producto");
  return res.json();
}

// Editar producto
export async function updateProducto(producto) {
  try {
    const res = await fetch(`${API_URL}/producto`, {
      method: "PUT",
      headers: getAuthHeader(), // ✅ incluye Authorization
      body: JSON.stringify(producto),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return { error: error.message };
  }
}


// Cambiar estado (activar/desactivar)
export async function toggleEstadoProducto(id_producto, estadoActual) {
  try {
    const res = await fetch(`${API_URL}/producto`, {
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
// ==========================
// CATEGORIAS (únicas desde productos)
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
      headers: getAuthHeader() 
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return { error: error.message };
  }
}

export async function postVenta(venta) {
  try {
    const res = await fetch(`${API_URL}/ventas`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(venta)
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error al crear venta:', error);
    return { error: error.message };
  }
}

// ==========================
// DETALLE VENTAS
// ==========================
export async function getDetalleVenta(id_venta) {
  try {
    const res = await fetch(`${API_URL}/ventas/${id_venta}/detalle`, { 
      headers: getAuthHeader() 
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error al obtener detalle de venta:', error);
    return { error: error.message };
  }
}

export async function postDetalleVenta(id_venta, detalle) {
  try {
    const res = await fetch(`${API_URL}/ventas/${id_venta}/detalle`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(detalle)
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error al crear detalle de venta:', error);
    return { error: error.message };
  }
}

// ==========================
// HISTORIAL PUNTOS
// ==========================
export async function getHistorialPuntos() {
  try {
    const res = await fetch(`${API_URL}/historial_puntos`, { 
      headers: getAuthHeader() 
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('Error al obtener historial de puntos:', error);
    return { error: error.message };
  }
}