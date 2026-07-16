# 📁 Carpeta de Procedimientos Técnicos (Base de Conocimiento RAG)

## ¿Qué va aquí?

Esta carpeta contiene los archivos PDF de los procedimientos técnicos que la IA utiliza como
**única fuente de verdad** para responder las consultas de los operarios.

## Archivos Requeridos

Coloca los siguientes archivos PDF en esta carpeta con EXACTAMENTE estos nombres:

| Nombre del archivo | Descripción |
|---|---|
| `FINAL_CATHETER_VISUAL_STANDARDS.pdf` | Estándar de Inspección Visual Final de Catéteres |
| `SWAV_HUB_ATTACHMENT.pdf` | Instrucción de Trabajo: Hub Bonding (SWAV) |

## ¿Por qué están aquí y no en /public?

- `/public` → Los archivos son accesibles públicamente vía URL (NO SEGURO para documentos propietarios)
- `/documents` → Solo el servidor puede leerlos. Los usuarios NUNCA pueden descargarlos directamente.

## Importante para despliegue en Vercel

Los PDFs en esta carpeta son leídos por el servidor en tiempo de ejecución.
Para que funcionen en Vercel, los PDFs deben estar subidos al repositorio de GitHub,
ya que Vercel despliega exactamente lo que está en el repositorio.

Si el repositorio es **privado** (recomendado para documentos propietarios), los PDFs
estarán protegidos por los permisos de acceso del repositorio.

## Seguridad

- ✅ Los PDFs son leídos SOLO por el Route Handler del servidor (`/api/query`)
- ✅ Se cachean en memoria tras la primera carga (no se re-leen en cada consulta)
- ✅ NUNCA se envían al cliente ni se exponen vía API
- ✅ La carpeta está excluida del acceso web estático (no está en /public)
