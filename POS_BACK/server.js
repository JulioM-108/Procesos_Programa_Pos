import { createClient } from "@supabase/supabase-js";
import routes from "./routes.js";
import productosQuery  from "./busquedaProducto.js";
import ventasQuery from "./consultarFacturas.js";
import reportes from "./reportes.js"
import express from "express";
import cors from "cors"; 

const app = express();

// Middleware
app.use(cors()); // Permitir CORS
app.use(express.json());

// Usar las rutas con prefijo /api
app.use("/api", routes);
app.use("/api/productos", productosQuery);
app.use("/api", ventasQuery);
app.use("/api/reportes",reportes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//const facturaRoutes = require('./routes/factura');
//app.use('/factura', facturaRoutes);
