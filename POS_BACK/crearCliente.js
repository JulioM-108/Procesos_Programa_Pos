import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xunxhvkgyirimhcwzzhj.supabase.co";
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnhodmtneWlyaW1oY3d6emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzA5NzUsImV4cCI6MjA3MTY0Njk3NX0.ewDrdnuaB4Uz34mldXLhdqnTF1wNHSWQp3wZHA3O5tQ'; // ⚠️ NO usar service_role aquí
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // ====== LOGIN ======
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: "cajeropos@javecali.com", // 👈 cambia al usuario cajero
      password: "ContrasenaSegura0",       // 👈 su contraseña
    });

  if (authError) {
    console.error("Error al loguear:", authError.message);
    return;
  }

  const token = authData.session.access_token;
  console.log("Token obtenido:", token);

  // ====== Crear cliente ======
  const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabaseWithAuth.from("clientes").insert([
    {
      cedula: "12345678",
      nombre: "Cliente de Prueba",
      telefono: "555-1234",
    },
  ]).select();

  if (error) {
    console.error("Error al crear cliente:", error.message);
  } else {
    console.log("Cliente creado:", data);
  }
}

main();
