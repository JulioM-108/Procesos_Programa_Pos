# Mini-Sistema POS

## Integrantes
- Julio Mazo
- Sebastian Castro Obando
- Maria ¿Camila Guzma Bolaños
- Samuel Escobar
- Jhon Silva

## Descripción del Proyecto

El presente proyecto consiste en el desarrollo de un **Mini-Sistema POS** orientado a una **tienda de barrio**, cuyo objetivo principal es registrar las ventas realizadas, almacenar información de clientes y productos, y generar reportes diarios de ventas.  

Nuestro enfoque considera que **los clientes son únicamente registros en la base de datos**, mientras que los usuarios que interactúan con el sistema son:

- **Cajero:** registra ventas, consulta productos y clientes, pero tiene permisos limitados sobre la base de datos.  
- **Administrador:** controla el inventario, gestiona clientes y empleados, y tiene acceso completo a los reportes del sistema.

El sistema está pensado para un entorno donde **las transacciones son principalmente en efectivo**, buscando simplicidad y eficiencia en la captura de datos.

---

## Funcionalidades

1. **Almacenamiento de información (CRUD)**  
   - Gestión de clientes, productos y empleados.  
   - Registro de ventas y detalle de ventas.  
   - Histórico de puntos otorgados a clientes.  

2. **Autenticación y roles**  
   - Inicio de sesión para cajeros y administradores.  
   - Control de permisos según rol.  

3. **Registro y reporte de ventas**  
   - Registro de ventas diarias con detalle de productos y totales.  
   - Cálculo automático de puntos para clientes.  
   - Generación de reportes diarios de ventas.  

4. **Inventario simple**  
   - Control de existencias y precios de productos.  
   - Actualización automática al registrar ventas.  

---

## Metodología y Organización

- El proyecto se desarrolla en **dos sprints**, con entregables parciales al finalizar cada sprint.  
- Se fomentan **historias de usuario innovadoras y retadoras** para agregar valor al sistema.  
- Al finalizar cada sprint se realiza una **presentación de resultados**.  
- El proyecto culmina con una **exposición final** y un **documento recopilatorio** con todo lo trabajado.  

---

## Tecnologías Utilizadas

- **Frontend:** React, React Router, JSX  
- **Backend:** Node.js, Express  
- **Base de Datos:** Supabase (PostgreSQL + RLS)  
- **Autenticación:** JWT gestionado por Supabase  

---

## Notas

- Cada clase se documentarán las **actividades realizadas** para mantener un registro del desarrollo del miniproyecto.  
- El sistema está diseñado para ser simple, funcional y adaptado a las necesidades de una tienda de barrio.
