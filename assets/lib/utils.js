/* utils.js — utilidades compartidas sin dependencias entre sí, importables
   desde cualquier módulo (assets/js/*.js o assets/lib/admin*.js). Ver
   docs/ARCHITECTURE.md para la convención de carpetas.

   Antes de este archivo, cada una de estas funciones vivía duplicada (con
   pequeñas variaciones) en varios módulos — ver el comentario de cada una
   para el detalle de dónde estaba antes. */

/**
 * Limpia un número de teléfono español para usarlo en enlaces `tel:` y
 * `wa.me`, o para comparar dos teléfonos guardados con formato distinto.
 *
 * Elimina espacios, guiones y paréntesis, quita el prefijo de país (+34 o
 * 0034, con o sin el "+") y devuelve solo los últimos 9 dígitos — así
 * "+34 656 187 336", "656-187-336" y "0034656187336" se normalizan al mismo
 * valor ("656187336"), independientemente del formato en que se guardó el
 * dato originalmente en Supabase.
 *
 * Quién la llama:
 * - worker-modal.js (prev_sendInvite, callWorker/waWorker): construir el
 *   enlace de invitación y los botones de llamar/WhatsApp del trabajador.
 * - adminStock.js / adminContactos.js (_callTelField, _waTelField): botones
 *   de llamar/WhatsApp en los modales de proveedor y contacto.
 * - index.js (sbVerifyLogin): comparar el teléfono introducido en el login
 *   contra el guardado en `trabajadores`, sin que el formato de guardado
 *   afecte a si el login encuentra al trabajador o no.
 *
 * @param {string} tel - Teléfono en cualquier formato ("+34 656 187 336", "656187336"...).
 * @returns {string} Los últimos 9 dígitos, sin espacios/guiones/paréntesis ni prefijo de país.
 */
function cleanTel(tel) {
  return (tel || '')
    .replace(/[\s\-()]/g, '')
    .replace(/^\+?0034/, '')
    .replace(/^\+?34/, '')
    .replace(/\D/g, '')
    .slice(-9)
}

/**
 * Hashea un PIN de 4 dígitos con SHA-256 vía Web Crypto API (nativa del
 * navegador, sin librerías externas). Se guarda el hash en Supabase
 * (`trabajadores.pin_hash`), nunca el PIN en claro.
 *
 * No es bcrypt/scrypt/Argon2 a propósito: esos algoritmos añaden un coste
 * computacional pensado para proteger contraseñas de uso prolongado frente
 * a fuerza bruta offline — aquí el PIN es de 4 dígitos, protegido además por
 * estar detrás de RLS y de un teléfono conocido, así que ese coste extra no
 * aporta seguridad real. Si el proyecto necesita ese nivel de protección más
 * adelante, la vía correcta es migrar a Supabase Auth (ver MEJORAS.md), no
 * reforzar este hash a mano.
 *
 * Quién la llama:
 * - index.js (sbVerifyLogin, cp_submit): verificar el PIN introducido en el
 *   login contra el hash guardado, y guardar el hash del PIN nuevo al
 *   cambiarlo en el primer acceso.
 * - worker-modal.js (prev_sendInvite): generar el hash del PIN temporal
 *   ("1234") al enviar la invitación desde Admin.
 *
 * Debe seguir siendo el MISMO algoritmo en ambos sitios — el hash generado
 * al invitar tiene que coincidir bit a bit con el que se compara al entrar.
 *
 * @param {string} pin - PIN en texto plano (ej. "1234").
 * @returns {Promise<string>} Hash SHA-256 en hexadecimal (64 caracteres).
 */
async function hashPin(pin) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin))
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Normaliza texto para comparaciones de búsqueda: minúsculas y sin tildes/
 * diacríticos ("Aceitunas" y "aceituna" comparan igual que "acéitunas").
 *
 * Quién la llama:
 * - stock.js (matchesSearch): buscador en tiempo real de la tab Productos,
 *   comparando cada palabra del input contra nombre/proveedor/unidad/nota/
 *   ubicación del producto sin que las tildes afecten al resultado.
 *
 * @param {string} str - Texto a normalizar.
 * @returns {string} Texto en minúsculas y sin diacríticos.
 */
function normalizeText(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}
