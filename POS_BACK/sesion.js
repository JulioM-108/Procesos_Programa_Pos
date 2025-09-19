import { createClient } from "@supabase/supabase-js";

// Credenciales de tu proyecto
const supabaseUrl = 'https://xunxhvkgyirimhcwzzhj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnhodmtneWlyaW1oY3d6emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzA5NzUsImV4cCI6MjA3MTY0Njk3NX0.ewDrdnuaB4Uz34mldXLhdqnTF1wNHSWQp3wZHA3O5tQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function login(email, password, mfaCode = null) {
  // Paso 1: Login con email/password
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

  // Consulta empleado (tu lógica original)
  const { data: empleado } = await supabase
    .from("empleados")
    .select("id_empleado, nombre, rol")
    .eq("user_id", data.user.id)
    .single();

  console.log("Empleado en BD:", empleado);

  // Paso 2: MFA (simplificado: usa las rutas del backend para esto en prod)
  // Para pruebas: asume que si MFA está activado, pide código manualmente
  const mfaNeeded = prompt("¿Tienes MFA activado? (y/n):") === 'y';
  if (mfaNeeded && mfaCode) {
    console.log("Verificando MFA con código:", mfaCode);
    // En prod, llama a /api/auth/mfa/verify con fetch
    console.log("✅ MFA verificado (simulado para pruebas).");
  } else if (mfaNeeded) {
    console.log("❌ MFA requerido: ingresa código en el frontend.");
  }
}

// Pruebas (tu código original)
login("AdminPOS@JaveCali.com", "ContrasenaSegura123"); // Admin
login("CajeroPOS@JaveCali.com", "ContrasenaSegura0"); // cajero