DESIGN.md — Sistema de diseño base (decisiones fijadas)
1. Colores

Acento único: dorado del chip "Todo"/"Todas" y del botón "Guardar y cerrar" (#c5a669 / rgb(197,166,105)). Único acento de marca.
Estados: verde / ámbar / rojo ya existentes (Stock) se mantienen sin cambios. Uso exclusivo para estado (éxito, aviso, peligro) — nunca como fondo de superficie.
Fondo: el oscuro actual se mantiene tal cual.
Jerarquía de superficie (modales, tarjetas) — 3 niveles:

Claro → bordes / separadores
Oscuro → fondo principal
Medio → separaciones internas


Preparación a futuro: variables declaradas de forma que un futuro sistema de "estilos de bar" (personalización por local) pueda sobreescribirlas en conjunto.

2. Chips

Variante con color por categoría (patrón Stock): icono + texto, borde/fondo con color temático propio por cada opción. Para listas donde cada opción tiene identidad visual propia (categorías de producto).
Variante neutra (patrón Reservas): borde gris claro rgb(58,74,80), fondo gris oscuro rgb(26,34,38), igual para todas las opciones salvo "Todas". Para listas donde el color por opción no aporta (zonas, filtros genéricos).
El chip "Todo"/"Todas" es un caso aparte en ambas variantes: siempre dorado sólido cuando está activo.
Responsive obligatorio: en anchos reducidos, colapsa a solo icono — nunca texto truncado con "…" (corrige bug ya detectado en Stock).
Bordes: muy redondeados en ambas variantes.

3. Botones

Primario: dorado, fondo plano.
Secundario / "+ Añadir X": borde discontinuo dorado, fondo transparente.
Peligro / Eliminar: mismo patrón que secundario en rojo, borde continuo (distingue reversible de destructivo).
Texto: capitalización estándar, nunca todo mayúsculas.

4. Modales

Canon: modal de trabajador (assets/lib/worker-modal.js), clase .overlay, rgba(0,0,0,.78), padding 16px/20px arriba.
Misma jerarquía de 3 niveles de superficie que el resto (sección 1).
Todo modal nuevo parte de este, no se crean variantes distintas.

5. Tabs / Navbar

Estructura común: cabecera superior con logo + perfil, 2 tabs con línea inferior dorada para el seleccionado, espacio flex para chips debajo si la sección los necesita.
Inspiración visual: tabs de Reservas y Stock, ligeramente menos altos — punto intermedio con el de Inicio.
Medidas en valores redondos (160 / 180 / 200 / 320...).
Cargada dinámicamente desde un módulo compartido — cada iframe la consume igual.
Navegación inferior de index.html: se mantiene, añadiendo Admin al final → Inicio / Turnos / Reservas / Stock / Admin.

6. Tipografía

Se mantiene la pareja actual (Cinzel + Inter).
Se fijan tamaños y jerarquía como tokens, para poder cambiar la fuente en el futuro sin tocar el resto del sistema.

7. Espaciados / bordes / sombras

Criterio más barato: extraer los valores que ya más se repiten en el código existente, sin inventar una escala nueva.