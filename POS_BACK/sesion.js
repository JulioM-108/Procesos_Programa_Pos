import { createClient } from "@supabase/supabase-js";

// credenciales de tu proyecto
const supabaseUrl = 'https://xunxhvkgyirimhcwzzhj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnhodmtneWlyaW1oY3d6emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzA5NzUsImV4cCI6MjA3MTY0Njk3NX0.ewDrdnuaB4Uz34mldXLhdqnTF1wNHSWQp3wZHA3O5tQ'; // usa anon, no service_roleí
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("❌ Error al iniciar sesión:", error.message);
    return;
  }

  console.log("✅ Sesión iniciada!");
  console.log("User:", data.user);
  console.log("Access token:", data.session.access_token);

  // ejemplo: consultar en empleados el rol asociado
  const { data: empleado } = await supabase
    .from("empleados")
    .select("id_empleado, nombre, rol")
    .eq("user_id", data.user.id)
    .single();

  console.log("Empleado en BD:", empleado);
}

// ⚡ prueba con un usuario que ya tengas registrado en Supabase
login("AdminPOS@JaveCali.com", "ContrasenaSegura123"); // Admin
login("CajeroPOS@JaveCali.com", "ContrasenaSegura0"); // cajero
// o prueba con admin
// login("admin@tienda.com", "password-admin");
