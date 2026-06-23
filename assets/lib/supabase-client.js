/* Inicialización de Supabase compartida — cargado una sola vez por página,
   justo después del CDN de Supabase y antes de cualquier script que use _sb o LOCAL_ID.
   Expone _sb y LOCAL_ID como globales para todos los scripts de la misma página. */
var SUPABASE_URL  = 'https://nnmaedehqeeogmhzqzji.supabase.co';
var SUPABASE_ANON = 'sb_publishable_spxukgcwMf-VFre7l_E68g_tWatBs9X';
var LOCAL_ID      = '3fd1108c-1c7b-4a0e-9141-8527db4e5ccc';
var _sb           = (typeof supabase !== 'undefined')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON)
  : null;
