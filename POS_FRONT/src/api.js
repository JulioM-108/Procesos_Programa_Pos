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