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
// GET /api/reportes/clientes_frecuentes?desde=2025-09-01&hasta=2025-09-10&limite=5
router.get("/clientes_frecuentes", async (req, res) => {
  try {
    const supabase = getSupabaseClient(req);

    const desde = req.query.desde ? new Date(req.query.desde).toISOString() : null;
    const hasta = req.query.hasta ? new Date(req.query.hasta).toISOString() : null;
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;

    const { data, error } = await supabase.rpc("rpt_clientes_frecuentes", {
      p_desde: desde,
      p_hasta: hasta,
      p_limite: limite,
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Error en reporte de clientes", error: error.message });
    }

    return res.json({
      total_clientes: data.length,
      resultados: data,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error en reporte de clientes" });
  }
});

// GET /api/reportes/bajo_stock?umbral=10&solo_activos=true&categoria=Shoes
router.get("/bajo_stock", async (req, res) => {
  try {
    const supabase = getSupabaseClient(req);
    const umbral = req.query.umbral ? parseInt(req.query.umbral, 10) : 10;
    const soloActivos = String(req.query.solo_activos || "true").toLowerCase() === "true";
    const categoria = req.query.categoria ? String(req.query.categoria) : null;

    let q = supabase
      .from("productos")
      .select("id_producto, nombre, descripcion, cantidad, precio, categoria, estado")
      .lte("cantidad", umbral);

    if (soloActivos) q = q.eq("estado", true);
    if (categoria) q = q.eq("categoria", categoria);

    const { data, error } = await q.order("cantidad", { ascending: true }).order("nombre", { ascending: true });

    if (error) return res.status(500).json({ message: "Error en reporte", error: error.message });

    return res.json({
      umbral,
      total: data.length,
      resultados: data
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error en reporte" });
  }
});
// GET /api/reportes/top_productos?desde=2025-09-01&hasta=2025-09-10&limite=100
router.get("/top_productos", async (req, res) => {
  try {
    const supabase = getSupabaseClient(req);

    const desde = req.query.desde ? new Date(req.query.desde).toISOString() : null;
    const hasta = req.query.hasta ? new Date(req.query.hasta).toISOString() : null;
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;

    const { data, error } = await supabase.rpc("rpt_top_productos_vendidos", {
      p_desde: desde,
      p_hasta: hasta,
      p_limite: limite,
});

if (error) {
      console.error(error);
      return res.status(500).json({ message: "Error en reporte de productos", error: error.message });
    }

    return res.json({
      total: data.length,
      resultados: data,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error en reporte de productos" });
  }
});

// GET /api/reportes/listado_ventas?meses=3
router.get("/listado_ventas", async (req, res) => {
  try {
    const supabase = getSupabaseClient(req); // o tu cliente global con SERVICE_ROLE
    const meses = Number.isFinite(parseInt(req.query.meses, 10))
      ? Math.max(parseInt(req.query.meses, 10), 1)
      : 1;

    const { data, error } = await supabase.rpc("rpt_listado_ventas_por_meses", {
      p_meses: meses
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al generar listado", error: error.message });
    }

    // La RPC retorna 1 fila con {desde, hasta, total_ventas, ventas(jsonb)}
    const row = Array.isArray(data) && data.length ? data[0] : null;

    return res.json({
      rango: { desde: row?.desde, hasta: row?.hasta },
      total_ventas: row?.total_ventas ?? 0,
      ventas: row?.ventas ?? []
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error al generar listado" });
  }
});
export default router;