import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker"; // 📦 npm install @faker-js/faker

const supabaseUrl = "https://xunxhvkgyirimhcwzzhj.supabase.co";
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bnhodmtneWlyaW1oY3d6emhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjA3MDk3NSwiZXhwIjoyMDcxNjQ2OTc1fQ.je5NFsJNzN8dBuVI1EB23XSkpAS2rjxElLVUdhJCTkE';
const supabase = createClient(supabaseUrl, supabaseServiceRole);
const datos = 75; // Modifiquenlo a gusto si desean insertar más o menos datos
async function seedDB() {
  try {
    // =========================
    // CLIENTES
    // =========================
    console.log("👥 Insertando clientes...");
    const clientes = Array.from({ length: datos }, () => ({
      cedula: faker.string.numeric(10), // cédula de 10 dígitos
      nombre: faker.person.fullName(),
      telefono: faker.string.numeric(10), // teléfono con máximo 10 dígitos
      puntos: 0,
    }));

    const { error: errorClientes } = await supabase
      .from("clientes")
      .insert(clientes);

    if (errorClientes) {
      console.error("❌ Error al insertar clientes:", errorClientes.message);
    } else {
      console.log("✅ ", datos, " clientes insertados");
    }

    // =========================
    // PRODUCTOS
    // =========================
    console.log("📦 Insertando productos...");
    const productos = Array.from({ length: datos }, () => ({
      nombre: faker.commerce.productName(),
      descripcion: faker.commerce.productDescription(),
      peso: faker.helpers.arrayElement(["500ml", "1L", "2kg", "250g"]),
      cantidad: faker.number.int({ min: 1, max: 200 }),
      precio: faker.commerce.price({ min: 1, max: 200, dec: 2 }),
      categoria: faker.commerce.department(),
    }));

    const { error: errorProductos } = await supabase
      .from("productos")
      .insert(productos);

    if (errorProductos) {
      console.error("❌ Error al insertar productos:", errorProductos.message);
    } else {
      console.log("✅ ", datos, " productos insertados");
    }
  } catch (err) {
    console.error("❌ Error inesperado:", err.message);
  }
}

seedDB();
