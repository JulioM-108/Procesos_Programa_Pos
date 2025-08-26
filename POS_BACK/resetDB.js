import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xunxhvkgyirimhcwzzhj.supabase.co";
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnhodmtneWlyaW1oY3d6emhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjA3MDk3NSwiZXhwIjoyMDcxNjQ2OTc1fQ.je5NFsJNzN8dBuVI1EB23XSkpAS2rjxElLVUdhJCTkE';
const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function resetDB() {
  try {
    console.log("🧹 Limpiando base de datos...");

    const { error } = await supabase.rpc("reset_all_data");

    if (error) {
      console.error("❌ Error al limpiar:", error.message);
    } else {
      console.log("✅ Base de datos limpiada con éxito.");
    }
  } catch (err) {
    console.error("❌ Error inesperado:", err.message);
  }
}

resetDB();
