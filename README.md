# Panel de Objetivos Gerencia de Personas

Este panel quedo preparado como una app web local y tambien para publicar en GitHub Pages.

## Acceso actual

La app ahora incluye una pantalla de login local.

Usuarios iniciales:

- `nmillana@eess.cl` / `Objetivos2026!`
- `maca@gerenciapersonas.local` / `Maca2026!`
- `paula@gerenciapersonas.local` / `Paula2026!`
- `carlos@gerenciapersonas.local` / `Carlos2026!`

Importante: este login es una capa local en frontend y no reemplaza autenticacion real. Si quieres seguridad real para un sitio publicado, conviene integrar Supabase, Auth0, Firebase o una capa de acceso externa.

## Como usarlo

1. Abre `index.html` en tu navegador o entra al sitio publicado.
2. Inicia sesion.
3. Filtra por area, estado o responsable.
4. Selecciona una tarjeta del board para abrir el panel de insights.
5. Registra comentarios, acuerdos, riesgos y proximos pasos.
6. Usa `Exportar` para guardar un respaldo JSON.
7. Usa `Importar` para recuperar respaldo en otro navegador o equipo.

## Fuentes base consideradas

- `OBJETIVOS ESTRATEGICOS GCIA PERSONAS.xlsx`
- `Objetivos_DO_2026.docx`

## Archivos principales

- `index.html`: estructura del login y board tipo Jira.
- `styles.css`: estilos visuales tipo Jira.
- `data.js`: base inicial de objetivos y usuarios de acceso local.
- `app.js`: login, filtros, board, detalle, comentarios y persistencia.
