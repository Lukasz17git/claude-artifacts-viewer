// Plugin de Vite que añade los artefactos al sitio estático:
//   artifacts.json   -> lista pública del índice (sin `source` ni las entradas con listed: false)
//   a/<slug>/        -> el artefacto: copia de sites/<slug>/ o, si es un documento, su página generada
import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';
import { renderDocPage } from './doc-page.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITES = path.join(ROOT, 'sites');
const MANIFEST = path.join(ROOT, 'artifacts.json');

async function loadManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch {
    return [];
  }
}

const publicList = (manifest) =>
  manifest
    .filter((a) => a.listed !== false)
    .map(({ slug, title, description, updatedAt }) => ({
      slug,
      title,
      description: description || '',
      updatedAt,
      url: `a/${slug}/`,
    }))
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));

// Lee sites/<slug>/tabs.json ([{ id, name }], en orden) y el HTML de cada pestaña en tabs/<id>.html
async function buildDocPage(entry) {
  const dir = path.join(SITES, entry.slug);
  const tabs = JSON.parse(await readFile(path.join(dir, 'tabs.json'), 'utf8'));
  const withHtml = await Promise.all(
    tabs.map(async (tab) => ({ ...tab, html: await readFile(path.join(dir, 'tabs', `${tab.id}.html`), 'utf8') })),
  );
  return renderDocPage({ ...entry, tabs: withHtml });
}

export default function artifacts() {
  let outDir;

  return {
    name: 'artifacts',

    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },

    configureServer(server) {
      const serveSites = sirv(SITES, { dev: true });

      server.middlewares.use('/artifacts.json', async (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(publicList(await loadManifest())));
      });

      server.middlewares.use('/a', async (req, res, next) => {
        const slug = req.url.split('/')[1];
        const entry = (await loadManifest()).find((a) => a.slug === slug && a.type === 'doc');
        if (!entry) return serveSites(req, res, next);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(await buildDocPage(entry));
      });
    },

    async writeBundle() {
      const manifest = await loadManifest();
      await writeFile(path.join(outDir, 'artifacts.json'), JSON.stringify(publicList(manifest)));

      for (const entry of manifest) {
        const dest = path.join(outDir, 'a', entry.slug);
        if (entry.type === 'doc') {
          await mkdir(dest, { recursive: true });
          await writeFile(path.join(dest, 'index.html'), await buildDocPage(entry));
        } else {
          await cp(path.join(SITES, entry.slug), dest, { recursive: true });
        }
      }
    },
  };
}
