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

//GET /api/factura?numero_venta=123
router.get("/factura", async (req, res) => {
  try {
    const raw = req.query.numero_venta;
    const numeroVenta = Number(raw);

    if (!Number.isInteger(numeroVenta)) {
      return res.json({
        coincidencias: 0,
        resultados: null,
        message: "Debe proporcionar un 'numero_venta' válido (entero)"
      });
    }
    const supabase = getSupabaseClient(req);
    // 1) Buscar la venta
    const { data: ventas, error: eVenta } = await supabase
      .from("ventas")
      .select(
        "id_venta, numero_venta, fecha_venta, cedula_cliente, id_empleado, subtotal, descuento, total, puntos_otorgados"
      )
      .eq("numero_venta", numeroVenta)
      .limit(1);

    if (eVenta) {
      return res.status(500).json({
        coincidencias: 0,
        resultados: null,
        message: "Error al consultar la venta"
      });
    }

    const venta = ventas?.[0];
    if (!venta) {
      return res.json({
        coincidencias: 0,
        resultados: null,
        message: `No existen resultados para la venta número '${numeroVenta}'`
      });
    }

    // 2) Buscar todos los detalles de esa venta
    const { data: detalles, error: eDet } = await supabase
      .from("detalle_ventas")
      .select("id_producto, nombre_producto, cantidad, precio_unitario, subtotal")
      .eq("id_venta", venta.id_venta);

    if (eDet) {
      return res.status(500).json({
        coincidencias: 0,
        resultados: null,
        message: "Error al consultar los detalles de la venta"
      });
    }

    // 3) Armar la factura
    const resultado = {
      numero_venta: venta.numero_venta,
      fecha_venta: venta.fecha_venta,
      cedula_cliente: venta.cedula_cliente,
      id_empleado: venta.id_empleado,
      subtotal: venta.subtotal,
      descuento: venta.descuento,
      total: venta.total,
      puntos_otorgados: venta.puntos_otorgados,
      detalles: detalles || [] // <- aquí pueden venir 1, 2 o N productos de la venta
    };

    return res.json({
      coincidencias: 1,
      resultados: resultado,
      message: "OK"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      coincidencias: 0,
      resultados: null,
      message: "Error al consultar la factura"
    });
  }
});

// GET /api/ventas_rango?fini=2025-09-01&ffin=2025-09-10
router.get("/ventas_rango", async (req, res) => {
  try {
    const { fini, ffin } = req.query;

    if (!fini || !ffin) {
      return res.json({
        coincidencias: 0,
        resultados: [],
        message: "Debe proporcionar 'fecha_inicio' y 'fecha_fin' en formato YYYY-MM-DD"
      });
    }
    const supabase = getSupabaseClient(req);
    // 1) Consultar ventas en el rango y ordenarlas por fecha descendente
    const { data: ventas, error: eVentas } = await supabase
      .from("ventas")
      .select(
        "id_venta, numero_venta, fecha_venta, cedula_cliente, subtotal, descuento, puntos_otorgados, total"
      )
      .gte("fecha_venta", fini)
      .lte("fecha_venta", ffin)
      .order("fecha_venta", { ascending: false }); // 👈 más recientes primero

    if (eVentas) {
      console.error(eVentas);
      return res.status(500).json({
        coincidencias: 0,
        resultados: [],
        message: "Error al consultar las ventas"
      });
    }

    if (!ventas || ventas.length === 0) {
      return res.json({
        coincidencias: 0,
        resultados: [],
        message: `No existen resultados entre '${fini}' y '${ffin}'`
      });
    }

    // 2) Buscar nombres de clientes
    const cedulas = Array.from(new Set(ventas.map((v) => v.cedula_cliente))).filter(Boolean);
    let nombresPorCedula = {};
    if (cedulas.length > 0) {
      const { data: clientes, error: eCli } = await supabase
        .from("clientes")
        .select("cedula, nombre")
        .in("cedula", cedulas);

      if (eCli) console.warn("Warn clientes:", eCli.message);
      (clientes || []).forEach((c) => {
        nombresPorCedula[c.cedula] = c.nombre;
      });
    }

    // 3) Preparar resultados
    const resultados = ventas.map((v) => ({
      id_venta: v.id_venta,
      numero_venta: v.numero_venta,
      fecha_venta: v.fecha_venta,
      cedula_cliente: v.cedula_cliente,
      nombre_cliente: nombresPorCedula[v.cedula_cliente] ?? null,
      subtotal: v.subtotal,
      descuento: v.descuento,
      puntos_otorgados: v.puntos_otorgados,
      total: v.total
    }));

    return res.json({
      coincidencias: resultados.length,
      resultados,
      message: "OK"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      coincidencias: 0,
      resultados: [],
      message: "Error al consultar las ventas"
    });
  }
});


// GET /api/ventas_cliente?cedula=1090123456&fini=2025-09-01&ffin=2025-09-10
router.get("/ventas_cliente", async (req, res) => {
  try {
    const cedula = String(req.query.cedula ?? "").trim();
    const finiRaw = String(req.query.fini ?? "").trim();
    const ffinRaw = String(req.query.ffin ?? "").trim();

    if (!cedula || !finiRaw || !ffinRaw) {
      return res.json({
        coincidencias: 0,
        resultados: null,
        message: "Debe proporcionar 'cedula', 'fini' y 'ffin'"
      });
    }

    // Normalizar fechas para cubrir todo el día si llegan como YYYY-MM-DD
    const start = finiRaw.length <= 10 ? `${finiRaw}T00:00:00.000Z` : finiRaw;
    const end   = ffinRaw.length <= 10 ? `${ffinRaw}T23:59:59.999Z` : ffinRaw;

    // Validar que sean fechas válidas
    if (isNaN(Date.parse(start)) || isNaN(Date.parse(end))) {
      return res.json({
        coincidencias: 0,
        resultados: null,
        message: "Fechas inválidas en 'fini' o 'ffin'"
      });
    }

    const supabase = getSupabaseClient(req);

    // 1) Obtener info del cliente
    const { data: cliente, error: eCli } = await supabase
      .from("clientes")
      .select("cedula, nombre, telefono")
      .eq("cedula", cedula)
      .single();

    if (eCli || !cliente) {
      return res.json({
        coincidencias: 0,
        resultados: null,
        message: `No existe cliente con documento '${cedula}'`
      });
    }

    // 2) Traer ventas del cliente en el rango (más recientes primero)
    const { data: ventas, error: eVentas } = await supabase
      .from("ventas")
      .select("id_venta, numero_venta, fecha_venta, id_empleado, subtotal, descuento, puntos_otorgados, total")
      .eq("cedula_cliente", cedula)
      .gte("fecha_venta", start)
      .lte("fecha_venta", end)
      .order("fecha_venta", { ascending: false });

    if (eVentas) {
      console.error(eVentas);
      return res.status(500).json({
        coincidencias: 0,
        resultados: null,
        message: "Error al consultar las ventas"
      });
    }

    if (!ventas || ventas.length === 0) {
      return res.json({
        coincidencias: 0,
        resultados: {
          nombre_cliente: cliente.nombre,
          cedula_cliente: cliente.cedula,
          telefono_cliente: cliente.telefono,
          ventas: []
        },
        message: `Ninguna venta registrada con el documento '${cedula}'.`
      });
    }

    // 3) Respuesta
    const resultados = {
      nombre_cliente: cliente.nombre,
      cedula_cliente: cliente.cedula,
      telefono_cliente: cliente.telefono,
      ventas: ventas.map(v => ({
        id_venta: v.id_venta,
        numero_venta: v.numero_venta,
        fecha_venta: v.fecha_venta,
        id_empleado: v.id_empleado,
        subtotal: v.subtotal,
        descuento: v.descuento,
        puntos_otorgados: v.puntos_otorgados,
        total: v.total
      }))
    };

    return res.json({
      coincidencias: resultados.ventas.length,
      resultados,
      message: "OK"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      coincidencias: 0,
      resultados: null,
      message: "Error al consultar las ventas"
    });
  }
});

export default router;
