# claude-artifacts-viewer

Espejo público de tus artefactos de Claude, en GitHub Pages o en tu propio dominio.
Cualquiera puede verlos sin cuenta, y siguen sincronizados con la versión que editas en Claude.

```
lukasz17git.github.io/claude-artifacts-viewer/              → índice de artefactos (React + Tailwind)
lukasz17git.github.io/claude-artifacts-viewer/a/<slug>/     → el artefacto
lukasz17git.github.io/claude-artifacts-viewer/a/<slug>/#<id> → una pestaña concreta (documentos)
```

## Cómo funciona

```
Claude (tus artefactos) ──lee──▶ commit a este repo ──push──▶ GitHub Actions compila ──▶ GitHub Pages
```

- `artifacts.json` es la lista: slug, tipo, título, descripción, URL de origen en Claude y si sale en el índice.
- Hay dos tipos de artefacto:
  - `html`: una página. Se guarda tal cual en `sites/<slug>/index.html` (más sus archivos, si tiene).
  - `doc`: un documento de Claude Docs. Se guarda una pestaña por archivo en `sites/<slug>/tabs/<id>.html`
    y su orden en `sites/<slug>/tabs.json`; al compilar se genera una página con pestañas.
- `npm run build` crea un sitio estático en `dist/`: el índice, `artifacts.json` (sin la URL de origen ni
  los ocultos) y cada artefacto en `a/<slug>/`.
- La sincronización la hace Claude, porque no hay una API pública para leer artefactos desde fuera.
  Detalles en [SYNC.md](SYNC.md).

## Uso local

```bash
npm install
npm run dev                       # http://localhost:5173 (con recarga)
npm run build && npm run preview  # el sitio tal como quedará publicado
```

## Añadir artefactos

**Con Claude (recomendado):** en un chat con este repo abierto, pide
"añade este artefacto con el slug `mi-slug`: <URL del artefacto>".

**A mano (solo tipo `html`):** descarga el HTML del artefacto y:

```bash
npm run add -- mi-slug ./mi-artefacto.html --title "Mi artefacto" --description "Qué es"
npm run add -- borrador ./b.html --unlisted   # accesible por enlace, pero fuera del índice
npm run remove -- mi-slug
npm run list
```

Luego `git commit` y `git push`: cada push a `main` vuelve a publicar el sitio.

## Despliegue (GitHub Pages, gratis)

1. El repo tiene que ser público (o tener GitHub Pro para Pages en repos privados).
2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Haz push a `main` (o lanza el workflow a mano en **Actions → Deploy to GitHub Pages → Run workflow**).
   El sitio queda en `https://lukasz17git.github.io/claude-artifacts-viewer/`.

**Dominio propio (opcional):** en **Settings → Pages → Custom domain** pon tu dominio y crea el registro DNS
que indica GitHub (un `CNAME` a `lukasz17git.github.io` para un subdominio). Las rutas son relativas, así que
no hay que cambiar nada en el código.

## Limitaciones

- Los artefactos que usan funciones de Claude en tiempo de ejecución (datos conectados, base de datos
  compartida, preguntar a Claude) no funcionan fuera de Claude.
- En los documentos, los diagramas no se exportan: se ve un hueco con su título.
- La copia solo se actualiza cuando Claude sincroniza (a mano o con una tarea programada).
- Todo lo que pongas en `sites/` es público, también en el historial de git. `listed: false` solo lo oculta del índice.
