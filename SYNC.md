# Sincronización con Claude

Este repo no lee los artefactos por su cuenta (Claude no ofrece una API pública
para ello). Quien sincroniza es Claude, que sí puede leer el HTML de tus propios
artefactos y hacer commit aquí. Tu servidor (Render, Railway…) redepliega solo
con cada push.

## Añadir un artefacto nuevo

Pega esto en un chat de Claude con este repo conectado:

> Añade este artefacto al repo claude-artifacts-viewer con el slug `mi-slug`:
> https://claude.ai/code/artifact/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

## Instrucciones para Claude (las sigue la tarea programada)

Para cada entrada de `artifacts.json` que tenga `source` (una URL
`claude.ai/code/artifact/...` o `claude.ai/artifact/...`):

1. Lee el artefacto con la herramienta **Artifact**, acción `read`, `url` = `source`.
   Usa el HTML tal cual lo devuelve (sin la línea de cabecera `[Artifact ... raw HTML follows]`).
2. Si el artefacto tiene archivos adicionales (lístalos con `action: "list"`,
   `scope: "files"`, `url` = `source`), descárgalos con `action: "read"` y `paths`
   y guárdalos en `sites/<slug>/` respetando su ruta publicada.
3. Escribe el HTML en `sites/<slug>/index.html`.
4. Solo si el contenido ha cambiado: pon `updatedAt` a la fecha actual (ISO 8601)
   en esa entrada de `artifacts.json`. Si la entrada no tiene `title`, usa el
   `<title>` del HTML.
5. Al terminar, si hay cambios, haz un único commit
   `sync: <slugs actualizados>` y `git push` a `main`. Si no hay cambios, no hagas nada.

Reglas:
- No toques entradas sin `source` (son altas manuales).
- Si un artefacto no se puede leer (borrado, sin acceso), no borres su copia:
  déjala como está y menciónalo en el resumen.
- Para añadir uno nuevo: crea la entrada `{ slug, title, description, source, listed: true, updatedAt }`
  y aplica los pasos 1–5 solo a ella.
- Un artefacto que use funciones de Claude en tiempo de ejecución (`window.claude`,
  datos conectados, base de datos compartida) no funcionará fuera de Claude: avisa
  en lugar de publicarlo.
