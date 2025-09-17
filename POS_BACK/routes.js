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
// USUARIO AUTENTICADO (ROL)
// ==========================
router.get("/me", async (req, res) => {
  const supabase = getSupabaseClient(req);

  // Obtener el usuario autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) return res.status(401).json({ error: userError.message });

  // Buscar el empleado por user_id
  const { data, error } = await supabase
    .from("empleados")
    .select("id_empleado, nombre, rol, email")
    .eq("user_id", user.id)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// ==========================
// EMPLEADOS
// ==========================
router.get("/empleados", async (req, res) => {
  const supabase = getSupabaseClient(req);
  const { data, error } = await supabase.from("empleados").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});
// PUT /api/empleados
router.put("/empleados", async (req, res) => {
  try {
    const supabase = getSupabaseClient(req);
    const { id_empleado, ...fields } = req.body;

    if (!id_empleado) {
      return res.status(400).json({
        message: "El campo 'id_empleado' es obligatorio en el JSON"
      });
    }

    // Seguridad: aseguramos que no se intente cambiar el id
    delete fields.id_empleado;

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({
        message: "No se enviaron campos para actualizar"
      });
    }

    const { data, error } = await supabase
      .from("empleados")
      .update(fields)
      .eq("id_empleado", id_empleado)
      .select();

    if (error) {
      console.error("Error al actualizar empleado:", error);
      return res.status(500).json({
        message: "Error al actualizar empleado",
        error: error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: `No se encontró empleado con id ${id_empleado}`
      });
    }

    return res.json({
      message: "Empleado actualizado correctamente",
      empleado: data[0]
    });
  } catch (e) {
    console.error("Excepción en PUT /empleados:", e);
    return res.status(500).json({
      message: "Error inesperado al actualizar empleado"
    });
  }
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
router.put("/clientes", async (req, res) => {
    try {
    const supabase = getSupabaseClient(req);
    const { cedula, ...fields } = req.body;

    if (!cedula) {
      return res.status(400).json({
        message: "El campo 'id_empleado' es obligatorio en el JSON"
      });
    }

    // Seguridad: aseguramos que no se intente cambiar el id
    delete fields.cedula;

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({
        message: "No se enviaron campos para actualizar"
      });
    }

    const { data, error } = await supabase
      .from("clientes")
      .update(fields)
      .eq("cedula", cedula)
      .select();

    if (error) {
      console.error("Error al actualizar cliente:", error);
      return res.status(500).json({
        message: "Error al actualizar cliente",
        error: error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: `No se encontró cedula del cliente ${id_empleado}`
      });
    }

    return res.json({
      message: "cliente actualizado correctamente",
      empleado: data[0]
    });
  } catch (e) {
    console.error("Excepción en PUT /cliente:", e);
    return res.status(500).json({
      message: "Error inesperado al actualizar empleado"
    });
  }
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
//          /api/producto
router.put("/productos", async (req, res) => {
  try {
    const { id_producto, ...fields } = req.body;

    if (!id_producto) {
      return res.status(400).json({
        message: "El campo 'id_producto' es obligatorio en el JSON"
      });
    }
    delete fields.id_producto;

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({
        message: "No se enviaron campos para actualizar"
      });
    }
    const supabase = getSupabaseClient(req);
    const { data, error } = await supabase
      .from("productos")
      .update(fields) // actualiza todo lo demás
      .eq("id_producto", id_producto)
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({
        message: "Error al actualizar el producto",
        error: error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: `No se encontró producto con id ${id_producto}`
      });
    }

    return res.json({
      message: "Producto actualizado correctamente",
      producto: data[0]
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Error al actualizar el producto"
    });
  }
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
  const supabase = getSupabaseClient(req); // o tu cliente global con SERVICE_ROLE
  try {
    const { venta, detalles } = req.body || {};

    if (!venta || !venta.cedula_cliente || !venta.id_empleado) {
      return res.status(400).json({ message: "Faltan datos de cabecera de la venta" });
    }
    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ message: "Debe enviar al menos un producto en detalles" });
    }

    // 1) Verificar stock de productos
    const ids = detalles.map(d => d.id_producto);
    const { data: prods, error: eProds } = await supabase
      .from("productos")
      .select("id_producto, nombre, cantidad, estado")
      .in("id_producto", ids);

    if (eProds) return res.status(500).json({ message: "Error al verificar stock", error: eProds.message });

    const stock = new Map((prods || []).map(p => [p.id_producto, p]));
    const faltantes = [];
    for (const d of detalles) {
      const p = stock.get(d.id_producto);
      if (!p) faltantes.push({ id: d.id_producto, motivo: "no existe" });
      else if (!p.estado) faltantes.push({ id: d.id_producto, nombre: p.nombre, motivo: "inactivo" });
      else if (p.cantidad < d.cantidad) faltantes.push({ id: d.id_producto, nombre: p.nombre, motivo: "stock insuficiente", disponible: p.cantidad, requerido: d.cantidad });
    }
    if (faltantes.length > 0) {
      return res.status(400).json({ message: "Stock insuficiente", faltantes });
    }

    // 2) Insertar venta (cabecera, triggers actualizarán totales)
    const { data: ventaIns, error: eVenta } = await supabase
      .from("ventas")
      .insert([{
        cedula_cliente: venta.cedula_cliente,
        id_empleado: venta.id_empleado,
        descuento: venta.descuento ?? 0
      }])
      .select("id_venta, numero_venta, fecha_venta, cedula_cliente, id_empleado")
      .single();

    if (eVenta) return res.status(500).json({ message: "Error al crear venta", error: eVenta.message });

    // 3) Insertar detalles (esto dispara trigger de totales)
    const detallesToInsert = detalles.map(d => ({
      id_venta: ventaIns.id_venta,
      id_producto: d.id_producto,
      nombre_producto: d.nombre_producto ?? null,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      subtotal: d.cantidad * d.precio_unitario
    }));

    const { data: detIns, error: eDet } = await supabase
      .from("detalle_ventas")
      .insert(detallesToInsert)
      .select("id_detalle, id_producto, nombre_producto, cantidad, precio_unitario, subtotal");

    if (eDet) {
      // rollback: borra venta y detalles
      await supabase.from("detalle_ventas").delete().eq("id_venta", ventaIns.id_venta);
      await supabase.from("ventas").delete().eq("id_venta", ventaIns.id_venta);
      return res.status(500).json({ message: "Error al insertar detalles", error: eDet.message });
    }

    // 4) Restar stock
    for (const d of detalles) {
      const p = stock.get(d.id_producto);
      const nueva = p.cantidad - d.cantidad;
      const { error: eUpd } = await supabase
        .from("productos")
        .update({ cantidad: nueva })
        .eq("id_producto", d.id_producto);
      if (eUpd) console.error("Error restando stock:", eUpd.message);
    }

    // 5) Responder
    return res.status(201).json({
      message: "Venta creada correctamente",
      venta: ventaIns,
      detalles: detIns
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Error al crear venta" });
  }
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
