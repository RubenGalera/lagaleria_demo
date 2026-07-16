# TFM — La Galería Neotaberna
## Aplicación de gestión para hostelería
*Documento vivo — se actualiza progresivamente conforme avanza el proyecto*

---

## ¿Qué es este proyecto?
La Galería Neotaberna es una aplicación web de gestión interna para un bar-restaurante en Almería. Resuelve problemas reales del día a día: gestión de turnos del personal, control de stock y pedidos a proveedores, gestión de reservas y eventos, y administración del equipo.

No es un proyecto académico simulado — está en uso real por el equipo del bar.

---

## Stack tecnológico y por qué

**Vanilla HTML/CSS/JS + Supabase + Vercel**

- **Sin frameworks en el frontend (por ahora):** Se eligió vanilla JS para aprender los fundamentos sin abstracciones. La migración a React está planificada para cuando el proyecto madure — hacerla ahora añadiría complejidad sin valor inmediato.
- **Supabase como backend:** Base de datos PostgreSQL + API REST automática + autenticación. Evita construir un servidor propio, reduciendo complejidad y tiempo de desarrollo.
- **Vercel para el despliegue:** Integración directa con GitHub, despliegue automático en cada commit, CDN global. Coste cero en fase inicial.

---

## Arquitectura — por qué iframes

La app usa un shell (index.html) que carga cada módulo en un iframe independiente (Turnos, Reservas, Stock, Admin). 

**Por qué:** cada módulo es autónomo — tiene su propio CSS, JS y estado. Esto evita conflictos entre módulos y permite desarrollar cada uno de forma independiente. La contrapartida es que la comunicación entre módulos requiere postMessage o funciones en el objeto padre (window.parent).

**Qué cambiará en React:** los iframes se eliminarán en favor de React Router + Zustand para estado global compartido. Cada
