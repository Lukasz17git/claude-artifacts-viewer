# Sincronización con Claude

Este repo no lee los artefactos por su cuenta (no hay una API pública para ello). Quien sincroniza es
Claude, que sí puede leer tus propios artefactos y hacer commit aquí. GitHub Pages vuelve a publicar
el sitio con cada push a `main`.

## Añadir un artefacto nuevo

Pega esto en un chat de Claude con este repo abierto:

> Añade este artefacto al repo claude-artifacts-viewer con el slug `mi-slug`:
> https://claude.ai/code/artifact/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

## Instrucciones para Claude

Para cada entrada de `artifacts.json` que tenga `source` (una URL `claude.ai/code/artifact/...` o
`claude.ai/artifact/...`; quita el `#...` del final, que solo marca una pestaña):

1. Averigua el tipo. Si es un documento de Claude Docs, `type: "doc"`; si es una página, `type: "html"`.
2. **`html`**: lee el artefacto con la herramienta **Artifact**, acción `read`, `url` = `source`, y escribe el
   HTML tal cual en `sites/<slug>/index.html` (sin la línea de cabecera `[Artifact ... raw HTML follows]`).
   Si tiene archivos adicionales (`action: "list"`, `scope: "files"`), descárgalos con `action: "read"` y
   `paths` y guárdalos en `sites/<slug>/` respetando su ruta publicada.
3. **`doc`**: lee el documento con las herramientas de Claude Docs (carga antes su skill o su `guide`).
   Escribe `sites/<slug>/tabs.json` con las pestañas en orden (`[{ "id", "name" }]`) y el HTML de cada
   pestaña en `sites/<slug>/tabs/<id>.html`. Borra los `tabs/<id>.html` de pestañas que ya no existan.
4. Solo si el contenido ha cambiado: pon `updatedAt` a la fecha actual (ISO 8601) en esa entrada. Si la
   entrada no tiene `title`, usa el `<title>` del HTML o el título del documento.
5. Comprueba que compila (`npm run build`). Si hay cambios, haz un único commit
   `sync: <slugs actualizados>` y `git push` a `main`. Si no hay cambios, no hagas nada.

Reglas:
- No toques entradas sin `source` (son altas manuales).
- Si un artefacto no se puede leer (borrado, sin acceso), no borres su copia: déjala como está y avisa.
- Para añadir uno nuevo: crea la entrada `{ slug, type, title, description, source, listed: true, updatedAt }`
  y aplica los pasos 1–5 solo a ella.
- Un artefacto que use funciones de Claude en tiempo de ejecución (`window.claude`, datos conectados,
  base de datos compartida) no funcionará fuera de Claude: avisa en lugar de publicarlo.
- Todo lo publicado es público. Avisa antes si un artefacto parece tener datos personales o internos.
