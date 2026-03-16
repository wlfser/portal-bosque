# 🏫 Portal Académico – Universidad El Bosque

Sistema web de gestión de guías académicas con dos portales: **Estudiante** y **Docente (Admin)**.

---

## 📁 Estructura del Proyecto

```
universidad-bosque/
├── index.html                  ← Página de inicio / Login
├── css/
│   └── style.css               ← Estilos globales
├── js/
│   ├── auth.js                 ← Manejo de autenticación y sesión
│   ├── data.js                 ← Base de datos mock (estudiantes, guías, entregas)
│   ├── admin.js                ← Lógica del panel docente
│   └── student.js              ← Lógica del portal estudiantil
└── pages/
    ├── admin-dashboard.html    ← Panel del Profesor
    └── student-dashboard.html  ← Portal del Estudiante
```

---

## 🚀 Cómo usar

1. Clona el repositorio:
   ```bash
   git clone https://github.com/TU-USUARIO/portal-bosque.git
   cd portal-bosque
   ```

2. Abre `index.html` en tu navegador (no requiere servidor).

---

## 🔐 Credenciales de prueba

### 👨‍🏫 Docentes (Admin)
| Usuario | Contraseña |
|---|---|
| `prof.garcia` | `bosque2025` |
| `prof.rodriguez` | `bosque2025` |

### 🎓 Estudiantes
| Código | Contraseña |
|---|---|
| `20231001` | `estudiante123` |
| `20231002` | `estudiante123` |
| `20231003` | `estudiante123` |

---

## ✅ Funcionalidades

### Panel Docente
- 📊 Resumen general: estadísticas, top estudiantes, avance por guía
- 📋 Gestión de guías: crear, ver detalle, monitorear entregas
- 🎓 Lista de estudiantes: búsqueda, detalle individual, progreso
- 📈 Progreso y calificaciones: filtrar por guía, calificar, agregar comentarios
- 📄 Reportes: vista previa en tabla, exportar CSV

### Portal Estudiantil
- 🏠 Inicio: estadísticas personales, guías pendientes, progreso visual
- 📋 Mis guías: filtrar por estado, ver detalle, marcar como entregada
- 📊 Mis notas: resumen de calificaciones y retroalimentación
- 📅 Calendario: fechas límite con días restantes

---

## 🛠️ Tecnologías

- HTML5, CSS3 (variables CSS, Grid, Flexbox)
- JavaScript Vanilla (sin frameworks)
- Google Fonts: Playfair Display + DM Sans

---

## 📌 Notas para Producción

> Este proyecto usa datos en memoria (mock). Para producción se recomienda:
> - Integrar un backend (Node.js / Django / Laravel)
> - Usar una base de datos real (PostgreSQL / MySQL)
> - Implementar autenticación JWT
> - Agregar subida de archivos para respuestas de guías

---

## 👤 Autor

Desarrollado para la Universidad El Bosque · Bogotá, Colombia
