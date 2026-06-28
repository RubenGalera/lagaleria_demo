# AUDIT.md — lagaleria_demo
Listado de posibles mejoras a tener en cuanta.
Fecha: 2026-06-25.

Rango de prioridad o urgencia:
	| ⚠️ | Importante / Proceso delicado
	| 🔴 | Urgente
	| 🟠 | Alta
	| 🟡 | Media
	| 🟢 | Baja

---

## 1. Navegación

	| 🟢 | Cuando navego por tabs, x ejemplo de admin/trabajadores a reservas y vuelvo a Admin, resetear el estado, no quiero volver a admin/trabajador, deberia mandarme a Admin/principal.
	Igual que si estoy en Reservas/Eventos, cambio a Turnos, vuelvo a Reservas, me deja en Reservas/Eventos(la última donde estuve), quiero que la posicion cuando pulse en un tab sea la posicion x defecto.
	Turnos/Semana,Reservas/Reservas,Stock/Stock,Admin/Principal. asi como si hay algo desplegado, se comprima, visualización standar.
  	| 🟢 | Convertir el navegador de fechas de turnos y reservas en un componente o elemento en funcionalidad y diseño (replica del actual que hay en turnos) con la diferencia de que uno es para semanas y otro es para días. y que ambos llamen a esa herramienta.
  	| 🟢 | En Inicio y en Reservas hay un panel donde se visualizan todas las mesas disponibles/libres. hay una diferencia de diseño y de planteamiento entre ambas. en inicio se muestra cuantas estan ocupadas, y en reservas dice cuantas estan disponibles.
	Me gusta mas el diseño de inicio, sin las franjas de separacion y un horizontal por turno (medio dia arriba y noche abajo) esto seria fabuloso si fuese responsive. Ya quee stamos en movil first. display flex:
	Móvil (<768px): 2 columna, / Tablet (768px-1023px): 3 columnas / Desktop (≥1024px): 4 columnas (mediaqueris y breakpoint
	
---


### lagaleria_inicio.html

** Card Proxima Reserva**
	Justificar porque este campo o quitarlo para dejar espacio
** Card  Reservas hoy**
	| 🟢 | Conectar la card de Reservas hoy, con las base de datos y devuelva zonas + disponibilidad de las mesas que hay para hoy en cada turno en la propia card (Creo que actualmente no está conectado a la base de datos real)
	| 🟢 | El texto de la card dice Sin reservas hoy, en cuanto tengas una reserva para ese día, que cambie el texto ha Reservas programadas para hoy.
	| 🟢 | Mantener la card desplegada y que al pulsar sobre ella, en vez ed plegar, desplegar, su funcion sea llevarte a Reservas/Reservas.

** Card Eventos hoy**
	| 🟢 | En la descripcion de la card, debe poner Sin eventos programados para hoy o El nombre delos eventos programado para hoy. Cuando pulse que me lleve directamente al iframe Reservas/Eventos.
	| 🟢 | Conectar eventos Eventos con la base de datos, el cuadrado de la derecha marca -  si no hay eventos hoy. Un número si hay uno o varios eventos.
	 
** Card Stock**
	| 🟢 | Texto: Debe poner, sin productos bajo mínimos. Si tienes algun producto bajo minimos o agotado: Tienes varios productos apunto de agotarse. A la derecha eñ cuadrado de color te muestra con un numero la cantidad de productos apunto de agotarse,
	color ambar si estan bajo minimos o rojo si hay alguno agotado o casi agotado (mitad o inferior del minimo establecido (Consultar algoritmo de stock por color). Al pulsar: te lleva a Stock/Pedido

** Card Turnos planificados**
	| 🟢 |Comprueba si los turnos de la semana siguiente están planificados y si están todos los slots cubiertos. En la caja de color poner un check(como está ahora) o un warning si no está hecho. Todos los lunes se activa y renueva esta card, para la semana siguiente.
	
** Card Eventos esta semana**
	| 🟢 | Conectar con la base de datos, en el cuadrado de la derecha numero de los eventos que hay esta semana programados. Texto: Sin eventos esta semana o si hay un evento: Próximo evento: "Nombre del evento" "Mié 23:20". Pulsar: te lleva a Reservas/Eventos.
	 

### lagaleria_TURNOS.html

**Turnos**
	| ⚠️ | Importante / Proceso delicadoCuando pulso las flechas del selecctor de semana, esta no me permite avanzar mas allá de la semana 26 y menos de la 24. Está limitado?
	| ⚠️ | Importante / Proceso delicadoCuando pulso sobre el centro del selector de semanas, deberia abrirme un modal de calendario o algo parecido. para poder seleccionar a que semana del mes/año quiero ir para no tener que ir pulsando muchas veces las flechas para llegar muy alante/atras en el tiempo.
	| ⚠️ | Importante / Proceso delicadoel icono del disquete de guardadno, en vez de estar a la derecha del selector de turnos, deberia formar parte del index y estar justo a la izquierda del boton de perfil.
	
---


### lagaleria_stock.html

**Tab Stock**
	| 🟢 | Quitar boton de añadir producto. Trasladar de`Stock-Stock` → `Admin-Stock`. Solo admin y desde admin se van a poder añadir (quitar o descativar con un toggle) los productos
	| 🟢 | Quitar el modal al pulsar sobre un producto en Stock/stock, ahora ese modal vive en Admin/Stock para editar las cualidades de ese producto.
	| 🟢 |Quitar la etiqueta de Tipo de producto, dentro de la card (bebidas, alimentación,limpieza...). Tenemos una cabecera y filtro que te dicen que tipo de producto es, es redundante que viva en la card si ya sale un icono+nombre por cada grupo de objetos. Donde se ubica,cantidad minima, el icono a la izquierda con el dot, mas los botnes de +- están bien.
	| 🟢 |Productos temporales: aquí si deberiamos poder editar el producto, card pulsando en él (como cuando pulsamos sobre +aádir producto temporal. (mismo modal con campos rellenos).
	| 🟢 |Volver a plantear si Registro se mantiene aquí, o se desplaza a inicio o a Admin.
	| 🟢 |Quitar el icono de cada producto en su card. El que está bajo el dot de estado. y la etiqueta a su derecha que dice que tipo de objeto es. Es redundante, ya hay una TITULAR y un filtro que dice que tipo de objeto es
	| ⚠ |IMPORTANTE: cuando un objeto queda sin categoría (xq está se borra o por que de primeras no hay categoría o no se la asignas, los productos quedan huerfanos y debería asignarsele una categoría que se llame "sin categoría". Este chip solo aparece cuando existen objetos in categoría. Los chips sin categoria tienen en color default (gris)

---


### lagaleria_Reservas

**Eventos**
	| ⚠️ | Añadir al modal, debajo de zonas ocupadas y a la izquierad de notas, el campo mesas(y que cuando pulses sobre los chips de zonas ocupadas, ej: terraza, entrada, se vayan sumando las mesas asociadas a esa zona, pero permita editar ese numero.
	Esto lo usaremos para restar al total de mesas disponibles del local(las asociadas a esa zona, con la salvedad de poder añadir mas/menos de las usadas habitualmente en esa zona). al mismo tiempo, si tenemos un evento en un dia/turno, bloquearemos en reservas, esa zona para asignar reservas en ese sitio.
	Eventos prioriza disponibilidad sobre Reservas). Si por casualdiad existe una reserva en una zona que tiene un evento, debemos alertar con un warning, para reubicar esa reserva. Esto no tiene porque suceder si bloqueamos la zona, pero si por casualidad, alguien reservaa  mucho tiempo vista, y luego se
	crea un evento, alertar.
	
---


### lagaleria_Stock

**Stock**

---


### lagaleria_admin

**Trabajadores**
	| ⚠️ | Importante / Proceso delicadoCuando pulso sobre la card de un trabajador no abre su modal para poder editarlo.(en cambio en el grid de turnos, al pulsar sobre un trabajador si)
	| ⚠️ | Importante / Proceso delicadoCuando pulso sobre un trabajador y accedo a su modal, no debo poder editar su imagen, solo puede cambiar esto, cada usuario desde su perfil.

---


**Stock**
//Comentario: Ahora admin/stock es la sección de creación de los contenidos que se verán en Stock/Stock. Aquí crearemos las categorias (Alimentos, bebidas, limpieza...) y productos. Stock/Stock está fuertemente relacionada. ambos trabajarán con la misma base de datos, o bases de datos relacionadas. Categorias, productos..
 Se crean una vez y nos desentendemos en el tiempo. A menos que vayamos actualizando nuevos productos que vayamos añadiendo a la lista. Los productos contediso son los que mantendremos en el tiempo dentro del local, si es puntual, ya tenemos una opción para añadir una compr no recurrente.
	| ⚠️ | Importante / Proceso delicadoAñadir botones: + Añadir producto / + Añadir categoría
	| ⚠️ | Importante / Proceso delicadoAñadir categoría: Actualmende dentro de añadir producto categoría +Nueva categoría... Lo sacamos de aquí. para que, una vez pulsado el boton añadir categoria aparezca el modal de Nueva categoría ya existente.
Con sus campos: Nombre, Activa (toggle), Color CMYRGB + Golden(corporativo) + Default(gris standar para objetos no coloreados, mirad color chip RESERVAS),icono.
	| ⚠️ | Importante / Proceso delicadoBotón de añadir producto: igual que está en admin/Stock. Preguntarnos si añadir la cantidad actual aquí admin/stock, o dejarlo para modificar en Stock/Stock. Y cómo afecta que podamos editarlo desde aqui a la base de datos? actua como un actualizar registro?
	| ⚠️ | Importante / Proceso delicadoHabría que plantear los archivos archivados, para que no se mezclen y pueda indentificarlo por tipo. Se me ocurre que como los que no estan archivados, aparezca una cabecera y esten ordenados por su cabecera, o añadirlos en gris al final de los de su tipo, o aunq dije de quitar la etiqueta de tipo, volversela a poner.

---
**WeekConfig**
//Añadir un editor de hora y salida del turno: 

### Notificaciones (si están activas)

 - Notificar todos los lunes al admin que ya puede planificar el turno de la semana x (la siguiente a la que estamos). Si pulsa, te lleva a Turnos (la semana siguiente que notificamos para planificar, accede directo si tiene el check de login activo o pide pass, si se introduce, te lleva a la seccion turnos, semana)
 - Enviar al trabajador cuando el Admin haya guardado (solo la primera vez) la creación del grid de turnos y haya incluido al perfil. Revisar
 
 Turnos:
 - 
 
 Reservas:
 - Cuando se añade una nueva reserva. (no se notifica a quien añade la reserva)
 - Cuando se confirma o cancela una reserva (no se notifica a quien actualiza el estado)
 
 Eventos:
 - Se ha creado un evento
 - Se ha añadido una nueva reserva
 
 
 Stock:
 
 
 Otros:
 
## Entrada 1 — Incógnita sobre ubicación de "Registro"
## ❓ INCÓGNITA — Ubicación de "Registro" (Stock)
Estado: sin decidir, pendiente de reflexión

Duda abierta: ¿Registro (historial de movimientos de stock, hoy en lagaleria_stock.html)
se mueve a la página principal de Inicio/Resumen (debajo de "Eventos esta semana"), o
se queda donde está, dentro de Stock?

Contexto de la duda: en su momento se decidió moverlo a Inicio porque Encargado también
debía poder verlo (coherente con el resto de información operativa del Resumen). Pero
surgió duda de si tiene más sentido funcional quedarse junto al Stock que registra,
en vez de separarse de su contexto natural.

Revisar cuando se aborde Categorías editables / reestructuración de Stock-Admin, ya
que puede influir en la decisión final.

## Entrada 2 — Modo offline / resiliencia ante pérdida de conexión
## Modo offline / resiliencia ante pérdida de conexión
Prioridad: baja (tema grande, a planificar con calma en su propia sesión)

Hoy, si se pierde la conexión a internet durante el servicio, cualquier operación que
dependa de Supabase falla sin más (ver patrón ya corregido en BUG-02: toast de error,
sin guardar nada). No existe ningún mecanismo de caché local + sincronización posterior
en ningún punto del proyecto.

Preguntas a resolver cuando se aborde:
- ¿Qué operaciones son críticas de seguir funcionando sin internet? (¿solo lectura de
  stock/turnos ya cargados, o también poder anotar cambios para sincronizar después?)
- Estrategia de almacenamiento local (localStorage ya se usa puntualmente como buffer
  de crash en Stock — ¿se generaliza, o se pasa a IndexedDB/Service Worker para algo
  más serio?)
- Qué pasa con conflictos al reconectar (¿quién gana si se editó lo mismo offline y
  alguien más lo cambió en el servidor mientras tanto?)
- Indicador visual claro de "estás trabajando sin conexión" para que el equipo no
  asuma que algo se guardó cuando no fue así.