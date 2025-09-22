// src/reportes.js
import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabaseUrl = "https://xunxhvkgyirimhcwzzhj.supabase.co";
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnhodmtneWlyaW1oY3d6emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzA5NzUsImV4cCI6MjA3MTY0Njk3NX0.ewDrdnuaB4Uz34mldXLhdqnTF1wNHSWQp3wZHA3O5tQ';

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
// RUTAS REPORTES
// ==========================

// 📊 Top productos vendidos
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

// 📈 Listado de ventas por meses
// GET /api/reportes/listado_ventas?meses=3
router.get("/listado_ventas", async (req, res) => {
  try {
    const supabase = getSupabaseClient(req);
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

// // 👥 Clientes más frecuentes
// // GET /api/reportes/clientes-frecuentes2?desde=2025-09-01&hasta=2025-09-10&limite=10
// router.get("/clientes-frecuentes2", async (req, res) => {
//   const { desde, hasta, limite } = req.query;
//   try {
//     const { data, error } = await createClient(supabaseUrl, supabaseAnonKey).rpc("rpt_clientes_frecuentes2", {
//       p_desde: desde || null,
//       p_hasta: hasta || null,
//       p_limite: limite ? parseInt(limite) : 10,
//     });

//     if (error) {
//       console.error("Error rpt_clientes_frecuentes2:", error);
//       return res.status(400).json({ error: error.message });
//     }

//     return res.json({ resultados: data });
//   } catch (e) {
//     console.error("Excepción en /reportes/clientes-frecuentes2:", e);
//     return res.status(500).json({ error: "Error inesperado" });
//   }
// });
// 👥 Clientes más frecuentes (directo, sin RPC)
router.get("/clientes-frecuentes", async (req, res) => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite, 10) : 10;
    const desde = req.query.desde ? req.query.desde : null;
    const hasta = req.query.hasta ? req.query.hasta : null;

    const supabase = getSupabaseClient(req);

    // Construimos la query usando supabase.from().select()
    let query = supabase
      .from("ventas")
      .select(`
        clientes!inner(cedula, nombre),
        id_venta
      `);

    if (desde) query = query.gte("fecha_venta", desde);
    if (hasta) query = query.lte("fecha_venta", hasta);

    const { data, error } = await query;

    if (error) {
      console.error("Error en clientes-frecuentes:", error);
      return res.status(500).json({ error: error.message });
    }

    // Agrupamos y contamos manualmente
    const counts = {};
    data.forEach((venta) => {
      const { cedula, nombre } = venta.clientes;
      const key = cedula;
      if (!counts[key]) counts[key] = { cedula, nombre, total_compras: 0 };
      counts[key].total_compras += 1;
    });

    // Convertimos a array y ordenamos
    const resultados = Object.values(counts)
      .sort((a, b) => b.total_compras - a.total_compras)
      .slice(0, limite);

    return res.json({ total: resultados.length, resultados });
  } catch (e) {
    console.error("Excepción en /clientes-frecuentes:", e);
    return res.status(500).json({ error: "Error inesperado" });
  }
});

// // 📦 Productos con bajo stock
// // GET /api/reportes/productos-bajo-stock2?umbral=5
// router.get("/productos-bajo-stock2", async (req, res) => {
//   const { umbral } = req.query;
//   try {
//     const { data, error } = await createClient(supabaseUrl, supabaseAnonKey).rpc("rpt_productos_bajo_stock2", {
//       p_umbral: umbral ? parseInt(umbral) : 5,
//     });

//     if (error) {
//       console.error("Error rpt_productos_bajo_stock2:", error);
//       return res.status(400).json({ error: error.message });
//     }

//     return res.json({ resultados: data });
//   } catch (e) {
//     console.error("Excepción en /reportes/productos-bajo-stock2:", e);
//     return res.status(500).json({ error: "Error inesperado" });
//   }
// });

// Productos con bajo stock (directo, sin RPC)
router.get("/productos_bajo_stock", async (req, res) => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite, 10) : 10;

    const supabase = getSupabaseClient(req);
    const { data, error } = await supabase
      .from("productos")
      .select("id_producto, nombre, cantidad")
      .order("cantidad", { ascending: true })
      .limit(limite); // 👈 aquí

    if (error) {
      console.error("Error en productos_bajo_stock:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ total: data.length, resultados: data });
  } catch (e) {
    console.error("Excepción en productos_bajo_stock:", e);
    return res.status(500).json({ error: "Error inesperado" });
  }
});

export default router;
