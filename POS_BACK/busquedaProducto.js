import express from "express";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const router = express.Router();
const supabaseUrl = "https://xunxhvkgyirimhcwzzhj.supabase.co";
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnhodmtneWlyaW1oY3d6emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzA5NzUsImV4cCI6MjA3MTY0Njk3NX0.ewDrdnuaB4Uz34mldXLhdqnTF1wNHSWQp3wZHA3O5tQ'; // ⚠️ NO usar service_role aquí

const supabase = createClient(
  "https://xunxhvkgyirimhcwzzhj.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
//   /query_name?query=camis
router.get("/query_name", async (req, res) => {
  try {
    // 1) tokens: minúsculas, separar por espacios, usar máximo 3 palabras clave para la busqueda
    const raw = String(req.query.query || "");
    const tokens = raw.toLowerCase().trim().split(/\s+/).filter(Boolean).slice(0, 3);

    // función para limpiar caracteres peligrosos en el token
    const safe = (s) => s.replace(/[%_,()'";]/g, "");

    if (tokens.length === 0) {
      return res.json({
        coincidencias: 0,
        resultados: [],
        message: `No existen resultados para '${raw}'`
      });
    }

    // 2) Condición OR para la busqueda de coincidencias con las 3 palabras
    const orCond = tokens.map((w) => `nombre.ilike.%${safe(w)}%`).join(",");
    const { data, error } = await supabase
      .from("productos")
      .select("id_producto, nombre, descripcion, precio, cantidad,categoria,estado")
      .or(orCond)
      .limit(1000);

    if (error) return res.status(500).json({ error: error.message });

    // 3) Rankear por coincidencias (3 → 2 → 1)
    const ranked = (data || [])
      .map((row) => {
        const nombreL = String(row.nombre || "").toLowerCase();
        const score = tokens.reduce((acc, w) => acc + (nombreL.includes(w) ? 1 : 0), 0);
        return { ...row, _score: score };
      })
      .filter((r) => r._score >= 1)
      .sort((a, b) => b._score - a._score || a.nombre.localeCompare(b.nombre))
      .slice(0, 250)
      .map(({ id_producto, nombre, descripcion, precio, cantidad, categoria,estado }) => ({
        codigo: id_producto,
        nombre,
        descripcion,
        precio,
        cantidad,
        categoria,
        estado
      }));

    const coincidencias = ranked.length;

    return res.json({
      coincidencias,
      resultados: ranked,
      message: coincidencias > 0 ? "OK" : `No existen resultados para '${raw}'`
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      coincidencias: 0,
      resultados: [],
      message: "Error al buscar productos"
    });
  }
});
//   /query_codproduct ?query=df7ecf3a
router.get("/query_codproduct", async (req, res) => {
  try {
    const raw = String(req.query.query || "").trim();

    // normaliza: hex y guiones, minúsculas
    const safe = raw.toLowerCase().replace(/[^0-9a-f-]/g, "");
    if (safe.length < 4) {
      return res.json({
        coincidencias: 0,
        resultados: [],
        message: `No existen resultados para '${raw}'`
      });
    }

    // --- 1) INTENTO en BD con CAST a texto ---
    let data = null;
    let error = null;

    try {
      // usando .or(...) para permitir el cast en el lado PostgREST
      const rsp = await supabase
        .from("productos")
        .select("id_producto, nombre, descripcion, precio, cantidad, categoria, estado")
        .or(`id_producto::text.ilike.%${safe}%`)
        .limit(250);

      data = rsp.data;
      error = rsp.error;
    } catch (e) {
      // por si el servidor no permite el cast en el filtro
      error = e;
    }

    // Si hubo error o no hay resultados, hacemos fallback en memoria
    if (error || !data || data.length === 0) {
      // --- 2) FALLBACK: traer lote y filtrar en Node ---
      const { data: all, error: e2 } = await supabase
        .from("productos")
        .select("id_producto, nombre, descripcion, precio, cantidad, categoria, estado")
        .limit(5000); // ajusta según tamaño de tu tabla

      if (e2) {
        console.error(e2);
        return res.status(500).json({
          coincidencias: 0,
          resultados: [],
          message: "Error al buscar productos"
        });
      }

      const frag = safe;
      const fragNoDash = safe.replace(/-/g, "");

      const filtered = (all || []).filter((row) => {
        const id = String(row.id_producto || "").toLowerCase();
        const idNoDash = id.replace(/-/g, "");
        return id.includes(frag) || idNoDash.includes(fragNoDash);
      });

      const resultados = filtered.slice(0, 250).map(
        ({ id_producto, nombre, descripcion, precio, cantidad, categoria, estado }) => ({
          codigo: id_producto,
          nombre,
          descripcion,
          precio,
          cantidad,
          categoria,
          estado,
        })
      );

      const coincidencias = resultados.length;
      return res.json({
        coincidencias,
        resultados,
        message: coincidencias > 0 ? "OK" : `No existen resultados para '${raw}'`
      });
    }

    // --- 3) Éxito con filtro en BD ---
    const resultados = (data || []).map(
      ({ id_producto, nombre, descripcion, precio, cantidad, categoria, estado }) => ({
        codigo: id_producto,
        nombre,
        descripcion,
        precio,
        cantidad,
        categoria,
        estado,
      })
    );

    const coincidencias = resultados.length;
    return res.json({
      coincidencias,
      resultados,
      message: coincidencias > 0 ? "OK" : `No existen resultados para '${raw}'`
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      coincidencias: 0,
      resultados: [],
      message: "Error al buscar productos"
    });
  }
});
//   /query_categoria?query=Games
router.get("/query_categoria", async (req, res) => {
  
  try {
    const categoria = String(req.query.query || "").trim();

    // aseguramos que venga un valor (aunque según tu requisito siempre será válido)
    if (!categoria) {
      return res.json({
        coincidencias: 0,
        resultados: [],
        message: "No se proporcionó una categoría válida"
      });
    }
    const { data, error } = await supabase
      .from("productos")
      .select("id_producto, nombre, descripcion, precio, cantidad, estado, categoria")
      .eq("categoria", categoria) // filtro exacto por categoría
      .limit(1000);

    if (error) {
      console.error(error);
      return res.status(500).json({
        coincidencias: 0,
        resultados: [],
        message: "Error al buscar productos"
      });
    }

    const resultados = (data || []).map(
      ({ id_producto, nombre, descripcion, precio, cantidad, estado, categoria }) => ({
        codigo: id_producto,
        nombre,
        descripcion,
        precio,
        cantidad,
        estado,
        categoria
      })
    );

    const coincidencias = resultados.length;

    return res.json({
      coincidencias,
      resultados,
      message: coincidencias > 0 ? "OK" : `No existen resultados para la categoría '${categoria}'`
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      coincidencias: 0,
      resultados: [],
      message: "Error al buscar productos"
    });
  }
});


export default router;
