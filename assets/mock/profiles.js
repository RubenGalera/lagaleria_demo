/* Perfiles de usuario de desarrollo — usados exclusivamente por el bypass DEV_KEYS.
   Cargado solo en index.html, antes del script inline. Global var (no module export)
   para compatibilidad con vanilla JS. TODO: eliminar cuando haya auth real con Supabase. */

/* Roles por nombre de usuario (campo correo en dev):
   "admin"     → Admin     → ve Inicio (ambas tabs) + resumen
   "encargado" → Encargado → ve Inicio (solo Resumen) + resumen
   cualquier otro → Empleado → solo Turnos / Reservas / Stock
   TODO: sustituir por lookup en tabla profiles de Supabase */
var MOCK_PROFILES = {
  /* En dev: escribe el rol como "teléfono" para simular */
  'superadmin': { nombre:'Rubén García', initials:'RG', rol:'superadmin', localId:1 },
  'admin':      { nombre:'Ana Martínez',        initials:'AM', rol:'admin',      localId:1 },
  'encargado':  { nombre:'María López',   initials:'ML', rol:'encargado',  localId:1 },
  'trabajador': { nombre:'Carlos Ruiz',               initials:'CR', rol:'empleado',   localId:1 },
  /* Números reales de prueba */
  '666000000':  { nombre:'Rubén García', initials:'RG', rol:'superadmin', localId:1 },
};
