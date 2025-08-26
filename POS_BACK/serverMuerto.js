import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

// ==========================
// Conexiones
// ==========================

// Service role → para consultar tablas (full access)
const supabaseUrl = 'https://xunxhvkgyirimhcwzzhj.supabase.co';
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnhodmtneWlyaW1oY3d6emhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjA3MDk3NSwiZXhwIjoyMDcxNjQ2OTc1fQ.je5NFsJNzN8dBuVI1EB23XSkpAS2rjxElLVUdhJCTkE';
const supabase = createClient(supabaseUrl, supabaseServiceRole);

// Anon → solo para validar tokens de usuario
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnhodmtneWlyaW1oY3d6emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzA5NzUsImV4cCI6MjA3MTY0Njk3NX0.ewDrdnuaB4Uz34mldXLhdqnTF1wNHSWQp3wZHA3O5tQ'; // usa anon, no service_roleí
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

// ==========================
// Helper para cliente usuario
// ==========================
function getUserClient(token) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

// ==========================
// Middleware de autenticación
// ==========================
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Token requerido" });

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Token inválido" });

  req.user = data.user;
  req.userToken = token;
  next();
}

// ==========================
// Endpoints protegidos
// ==========================
app.get("/productos", authMiddleware, async (req, res) => {
  const userSupabase = getUserClient(req.userToken);

  const { data, error } = await userSupabase
    .from("productos")
    .select("*")
    .order("nombre");

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.delete("/clientes/:cedula", authMiddleware, async (req, res) => {
  const userSupabase = getUserClient(req.userToken);
  const { cedula } = req.params;

  const { error } = await userSupabase.from("clientes").delete().eq("cedula", cedula);

  if (error) return res.status(403).json({ error: error.message });
  res.json({ message: `Cliente ${cedula} eliminado ✅` });
});

const port = 4000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


// ==========================
// Endpoint de prueba
// ==========================
app.get("/", (req, res) => {
  res.send("API POS funcionando 🚀");
});

// ==========================
// ENDPOINTS POS (CAJERO + ADMIN)
// ==========================

// ---------- PRODUCTOS ----------
app.get("/productos", async (req, res) => {
  // Rol: cajero y admin
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("nombre");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get("/productos/:id", async (req, res) => {
  // Rol: cajero y admin
  const { id } = req.params;
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id_producto", id)
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ---------- CLIENTES ----------
app.post("/clientes", async (req, res) => {
  // Rol: cajero y admin
  const { cedula, nombre, telefono } = req.body;
  const { data, error } = await supabase
    .from("clientes")
    .insert([{ cedula, nombre, telefono }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get("/clientes/:cedula", async (req, res) => {
  // Rol: cajero y admin
  const { cedula } = req.params;
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("cedula", cedula)
    .single();
  if (error) return res.status(404).json({ error: "Cliente no encontrado" });
  res.json(data);
});

// ---------- VENTAS ----------
app.post("/ventas", async (req, res) => {
  // Rol: cajero y admin
  const { cedula_cliente, user_id } = req.body;

  const { data: empleado, error: errorEmpleado } = await supabase
    .from("empleados")
    .select("id_empleado")
    .eq("user_id", user_id)
    .single();

  if (errorEmpleado)
    return res.status(400).json({ error: errorEmpleado.message });

  const { data, error } = await supabase
    .from("ventas")
    .insert([{ cedula_cliente, id_empleado: empleado.id_empleado }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post("/ventas/:id/detalle", async (req, res) => {
  // Rol: cajero y admin
  const { id } = req.params;
  const { id_producto, cantidad } = req.body;

  const { data: producto, error: errorProducto } = await supabase
    .from("productos")
    .select("*")
    .eq("id_producto", id_producto)
    .single();

  if (errorProducto)
    return res.status(400).json({ error: errorProducto.message });

  const subtotal = producto.precio * cantidad;

  const { data, error } = await supabase
    .from("detalle_ventas")
    .insert([
      {
        id_venta: id,
        id_producto,
        nombre_producto: producto.nombre,
        cantidad,
        precio_unitario: producto.precio,
        subtotal,
      },
    ])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get("/ventas/cajero/:user_id", async (req, res) => {
  // Rol: cajero → solo sus ventas
  const { user_id } = req.params;

  const { data: empleado, error: errorEmpleado } = await supabase
    .from("empleados")
    .select("id_empleado")
    .eq("user_id", user_id)
    .single();

  if (errorEmpleado)
    return res.status(400).json({ error: errorEmpleado.message });

  const { data, error } = await supabase
    .from("ventas")
    .select("*, detalle_ventas(*)")
    .eq("id_empleado", empleado.id_empleado)
    .order("fecha_venta", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ==========================
// ENDPOINTS ADMIN
// ==========================

// ---------- PRODUCTOS CRUD ----------
app.post("/productos", async (req, res) => {
  // Rol: solo admin
  const { nombre, descripcion, peso, cantidad, precio, categoria } = req.body;
  const { data, error } = await supabase
    .from("productos")
    .insert([{ nombre, descripcion, peso, cantidad, precio, categoria }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.put("/productos/:id", async (req, res) => {
  // Rol: solo admin
  const { id } = req.params;
  const { nombre, descripcion, peso, cantidad, precio, categoria, estado } =
    req.body;

  const { data, error } = await supabase
    .from("productos")
    .update({ nombre, descripcion, peso, cantidad, precio, categoria, estado })
    .eq("id_producto", id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.delete("/productos/:id", async (req, res) => {
  // Rol: solo admin
  const { id } = req.params;
  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id_producto", id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Producto eliminado correctamente" });
});

// ---------- CLIENTES ADMIN ----------
app.get("/clientes", async (req, res) => {
  // Rol: solo admin
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("fecha_registro", { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.put("/clientes/:cedula", async (req, res) => {
  // Rol: solo admin
  const { cedula } = req.params;
  const { nombre, telefono, puntos } = req.body;
  const { data, error } = await supabase
    .from("clientes")
    .update({ nombre, telefono, puntos })
    .eq("cedula", cedula)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.delete("/clientes/:cedula", async (req, res) => {
  // Rol: solo admin
  const { cedula } = req.params;
  const { error } = await supabase.from("clientes").delete().eq("cedula", cedula);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: `Cliente con cédula ${cedula} eliminado correctamente` });
});

// ---------- EMPLEADOS ----------
app.get("/empleados", async (req, res) => {
  // Rol: solo admin
  const { data, error } = await supabase.from("empleados").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post("/empleados", async (req, res) => {
  // Rol: solo admin
  const { user_id, cedula, nombre, rol, telefono, email } = req.body;
  const { data, error } = await supabase
    .from("empleados")
    .insert([{ user_id, cedula, nombre, rol, telefono, email }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ---------- VENTAS ADMIN ----------
app.get("/ventas", async (req, res) => {
  // Rol: solo admin
  const { data, error } = await supabase
    .from("ventas")
    .select(
      "*, detalle_ventas(*), clientes(nombre, cedula), empleados(nombre, rol)"
    )
    .order("fecha_venta", { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ---------- HISTORIAL DE PUNTOS ----------
app.get("/historial/:cedula", async (req, res) => {
  // Rol: admin y cajero
  const { cedula } = req.params;
  const { data, error } = await supabase
    .from("historial_puntos")
    .select("*")
    .eq("cedula_cliente", cedula)
    .order("fecha", { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post("/historial", async (req, res) => {
  // Rol: solo admin
  const { cedula_cliente, tipo_movimiento, puntos } = req.body;
  const { data, error } = await supabase
    .from("historial_puntos")
    .insert([{ cedula_cliente, tipo_movimiento, puntos }])
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ==========================
// Iniciar servidor
// ==========================
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor POS corriendo en http://localhost:${PORT}`);
});


/// ========================== Excpecion
