import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabaseUrl = "https://xunxhvkgyirimhcwzzhj.supabase.co";
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnhodmtneWlyaW1oY3d6emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzA5NzUsImV4cCI6MjA3MTY0Njk3NX0.ewDrdnuaB4Uz34mldXLhdqnTF1wNHSWQp3wZHA3O5tQ'; // ⚠️ NO usar service_role aquí

// ==========================
// Helper para crear cliente Supabase con JWT del usuario
// ==========================
function getSupabaseClient(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });
}

// ==========================
// EMPLEADOS
// ==========================
router.get("/empleados", async (req, res) => {
  const supabase = getSupabaseClient(req);
  const { data, error } = await supabase.from("empleados").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ==========================
// CLIENTES
// ==========================
router.get("/clientes", async (req, res) => {
  const supabase = getSupabaseClient(req);
  const { data, error } = await supabase.from("clientes").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post("/clientes", async (req, res) => {
  const supabase = getSupabaseClient(req);
  const { data, error } = await supabase.from("clientes").insert([req.body]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.put("/clientes/:cedula", async (req, res) => {
  const supabase = getSupabaseClient(req);
  const { data, error } = await supabase
    .from("clientes")
    .update(req.body)
    .eq("cedula", req.params.cedula)
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ==========================
// PRODUCTOS
// ==========================
router.get("/productos", async (req, res) => {
  const supabase = getSupabaseClient(req);
  const { data, error } = await supabase.from("productos").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post("/productos", async (req, res) => {
  const supabase = getSupabaseClient(req);
  const { data, error } = await supabase.from("productos").insert([req.body]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ==========================
// VENTAS
// ==========================
router.get("/ventas", async (req, res) => {
  const supabase = getSupabaseClient(req);
  const { data, error } = await supabase.from("ventas").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post("/ventas", async (req, res) => {
  const supabase = getSupabaseClient(req);
  const { data, error } = await supabase.from("ventas").insert([req.body]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ==========================
// DETALLE VENTAS
// ==========================
router.get("/ventas/:id/detalle", async (req, res) => {
  const supabase = getSupabaseClient(req);
  const { data, error } = await supabase
    .from("detalle_ventas")
    .select("*")
    .eq("id_venta", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post("/ventas/:id/detalle", async (req, res) => {
  const supabase = getSupabaseClient(req);
  const newDetalle = { ...req.body, id_venta: req.params.id };
  const { data, error } = await supabase.from("detalle_ventas").insert([newDetalle]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// ==========================
// HISTORIAL PUNTOS
// ==========================
router.get("/historial_puntos", async (req, res) => {
  const supabase = getSupabaseClient(req);
  const { data, error } = await supabase.from("historial_puntos").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
