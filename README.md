# Panel de Objetivos Gerencia de Personas

Este panel quedo preparado como una app web local y tambien para publicar en GitHub Pages.

## Acceso actual

La app ahora incluye una pantalla de login local.

Usuarios iniciales:

- `dperry@eess.cl` / `Objetivos20`
- `pmunozd@eess.cl` / `Objetivos20`
- `cpacheco@eess.cl` / `Objetivos20`
- `msainz@eess.cl` / `Objetivos20`
- `rrobles@eess.cl` / `Objetivos20`
- `nmillana@eess.cl` / `Objetivos20`
- `aoliverar@eess.cl` / `Objetivos20`

Importante: este login es una capa local en frontend y no reemplaza autenticacion real. Si quieres seguridad real para un sitio publicado, conviene integrar Supabase, Auth0, Firebase o una capa de acceso externa.

## Como usarlo

### Modo completo con IA

1. Define `OPENAI_API_KEY` en tu entorno o crea un archivo `.env` basado en `.env.example`.
2. Ejecuta `powershell -ExecutionPolicy Bypass -File .\server.ps1`.
3. Abre `http://localhost:8080`.
4. Inicia sesion.
5. Usa `Crear con IA`, completa el contexto y genera el borrador con GPT.
6. Ajusta el texto sugerido si quieres y guarda el objetivo.
7. Usa `Exportar` para guardar un respaldo JSON.
8. Usa `Importar` para recuperar respaldo en otro navegador o equipo.

### Modo tablero sin IA

Puedes seguir abriendo `index.html` directamente para revisar el board, pero la redaccion con GPT solo queda disponible cuando levantas el servidor local.

## Fuentes base consideradas

- `OBJETIVOS ESTRATEGICOS GCIA PERSONAS.xlsx`
- `Objetivos_DO_2026.docx`

## Archivos principales

- `index.html`: estructura del login, board y creador con IA.
- `styles.css`: estilos visuales tipo Jira y estados del asistente.
- `data.js`: base inicial de objetivos y usuarios de acceso local.
- `app.js`: login, filtros, board, detalle, comentarios, persistencia y creador con GPT.
- `server.ps1`: servidor local que sirve la app y conecta el creador con OpenAI Responses API.
- `.env.example`: ejemplo de configuracion local para `OPENAI_API_KEY` y modelo por defecto.

## Seguridad de la API key

- No incrustes la API key en `index.html` ni en `app.js`.
- El servidor local lee `OPENAI_API_KEY` desde el entorno o desde `.env`, y hace la llamada a OpenAI por el backend.
- Si varias personas van a usar esto, conviene trabajar con Project-based API keys en OpenAI en vez de compartir una clave personal.
