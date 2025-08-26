import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xunxhvkgyirimhcwzzhj.supabase.co";
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnhodmtneWlyaW1oY3d6emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzA5NzUsImV4cCI6MjA3MTY0Njk3NX0.ewDrdnuaB4Uz34mldXLhdqnTF1wNHSWQp3wZHA3O5tQ'; // ⚠️ NO usar service_role aquí
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // ====== LOGIN ======
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: "adminpos@javecali.com", // 👈 cambia al usuario cajero
      password: "ContrasenaSegura123",       // 👈 su contraseña
    });

  if (authError) {
    console.error("Error al loguear:", authError.message);
    return;
  }

  const token = authData.session.access_token;
  console.log("Token obtenido:", token);

  // ====== Eliminar cliente ======
  const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabaseWithAuth
    .from("clientes")
    .delete()
    .eq("cedula", "12345678") // 👈 mismo cliente creado antes
    .select();

  if (error) {
    console.error("Error al eliminar cliente:", error.message);
  } else {
    console.log("Cliente eliminado:", data);
  }
}

main();
