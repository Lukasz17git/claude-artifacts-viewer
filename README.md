# claude-artifacts-viewer

Espejo público de tus artefactos de Claude en tu propio dominio. Cualquiera puede
verlos sin cuenta, y siguen sincronizados con la versión que editas en Claude.

```
tudominio.com/              → índice de artefactos (React + Tailwind)
tudominio.com/a/<slug>/     → el artefacto, idéntico al de Claude
```

## Cómo funciona

```
Claude (tus artefactos) ──lee HTML──▶ commit a este repo ──push──▶ Render redepliega ──▶ tu dominio
```

- `artifacts.json` es la lista: slug, título, descripción, URL de origen en Claude y si sale en el índice.
- `sites/<slug>/index.html` es la copia del artefacto.
- `server/index.js` (Express) sirve el índice, la API y cada artefacto.
- La sincronización la hace Claude (tarea programada), porque Claude no tiene una
  API pública para leer artefactos desde fuera. Detalles en [SYNC.md](SYNC.md).

## Uso local

```bash
npm install
npm run dev      # índice en http://localhost:5173 (con recarga)
# o en modo producción:
npm run build && npm start   # http://localhost:3000
```

## Añadir artefactos

**Con Claude (recomendado):** en un chat con el repo conectado, pide
"añade este artefacto con el slug `mi-slug`: <URL del artefacto>". La tarea
programada lo mantendrá al día.

**A mano:** descarga el HTML del artefacto y:

```bash
npm run add -- mi-slug ./mi-artefacto.html --title "Mi artefacto" --description "Qué es"
npm run add -- borrador ./b.html --unlisted   # accesible por enlace, pero fuera del índice
npm run remove -- mi-slug
npm run list
```

Luego `git commit` y `git push`.

## Despliegue (Render, gratis)

1. En render.com: **New → Blueprint** y elige este repo (usa `render.yaml`).
2. En el servicio: **Settings → Custom Domains** y añade tu dominio; crea el
   registro DNS que te indique.
3. Cada push a `main` redepliega solo.

El plan gratuito de Render "duerme" el servicio tras un rato sin visitas, así que
la primera carga puede tardar unos segundos. Funciona igual en Railway, Fly.io o
cualquier VPS con Node 20+ (`npm install && npm run build && npm start`, puerto en `PORT`).

## Limitaciones

- Los artefactos que usan funciones de Claude en tiempo de ejecución (datos
  conectados, base de datos compartida, preguntar a Claude) no funcionan fuera de Claude.
- La sincronización tiene el retraso de la tarea programada (p. ej. cada hora).
- Todo lo que pongas en `sites/` es público. `listed: false` solo lo oculta del índice.
