// Servidor mínimo:
//   GET /                 -> índice (React, compilado en dist/)
//   GET /api/artifacts    -> lista pública de artefactos (los que tienen listed !== false)
//   GET /a/<slug>/        -> el artefacto, tal cual (sites/<slug>/index.html + sus archivos)
import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITES = path.join(ROOT, 'sites');
const DIST = path.join(ROOT, 'dist');
const MANIFEST = path.join(ROOT, 'artifacts.json');
const PORT = Number(process.env.PORT) || 3000;

async function loadManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch {
    return [];
  }
}

const app = express();
app.disable('x-powered-by');

app.get('/api/artifacts', async (_req, res) => {
  const list = (await loadManifest())
    .filter((a) => a.listed !== false)
    .map(({ slug, title, description, updatedAt }) => ({
      slug,
      title,
      description: description || '',
      updatedAt,
      url: `/a/${slug}/`,
    }))
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  res.set('Cache-Control', 'no-cache').json(list);
});

// Cada artefacto vive en su carpeta; /a/<slug> redirige a /a/<slug>/ para que
// las rutas relativas (imágenes, scripts adicionales) funcionen.
app.use('/a', express.static(SITES, { dotfiles: 'ignore', maxAge: '5m' }));

// Índice (React compilado)
app.use(express.static(DIST, { maxAge: '1h', index: 'index.html' }));

app.use((_req, res) => {
  res.status(404).type('html').send(
    '<!doctype html><meta charset="utf-8"><title>No encontrado</title>' +
      '<body style="font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0">' +
      '<div style="text-align:center"><h1>404</h1><p>Este artefacto no existe.</p><a href="/">Volver al índice</a></div>',
  );
});

app.listen(PORT, () => {
  console.log(`claude-artifacts-viewer escuchando en http://localhost:${PORT}`);
});
