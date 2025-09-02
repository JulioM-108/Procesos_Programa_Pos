import routes from "./routes.js";
import express from "express";
import cors from "cors"; // Instala: npm install cors

const app = express();

// Middleware
app.use(cors()); // Permitir CORS
app.use(express.json());

// Usar las rutas con prefijo /api
app.use("/api", routes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});