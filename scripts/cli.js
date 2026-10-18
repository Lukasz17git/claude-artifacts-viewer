#!/usr/bin/env node
// Alta/baja manual de artefactos (por si no usas la sincronización con Claude).
//
//   npm run add -- <slug> <archivo.html> [--title "Título"] [--description "..."] [--source <url>] [--unlisted]
//   npm run remove -- <slug>
//   npm run list
import { readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'artifacts.json');
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

const die = (msg) => {
  console.error(msg);
  process.exit(1);
};

async function load() {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'));
  } catch {
    return [];
  }
}
const save = (list) => writeFile(MANIFEST, JSON.stringify(list, null, 2) + '\n');

function parseFlags(args) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--unlisted') flags.unlisted = true;
    else if (a.startsWith('--')) flags[a.slice(2)] = args[++i];
    else rest.push(a);
  }
  return { flags, rest };
}

const [cmd, ...args] = process.argv.slice(2);
const { flags, rest } = parseFlags(args);
const list = await load();

if (cmd === 'add') {
  const [slug, file] = rest;
  if (!slug || !file) die('Uso: npm run add -- <slug> <archivo.html> [--title "..."] [--source <url>] [--unlisted]');
  if (!SLUG.test(slug)) die('El slug solo puede tener minúsculas, números y guiones (máx. 64).');
  const dir = path.join(ROOT, 'sites', slug);
  await mkdir(dir, { recursive: true });
  await copyFile(path.resolve(file), path.join(dir, 'index.html'));

  const prev = list.find((a) => a.slug === slug) || {};
  const entry = {
    ...prev,
    slug,
    title: flags.title ?? prev.title ?? slug,
    description: flags.description ?? prev.description ?? '',
    source: flags.source ?? prev.source ?? '',
    listed: flags.unlisted ? false : (prev.listed ?? true),
    updatedAt: new Date().toISOString(),
  };
  await save([...list.filter((a) => a.slug !== slug), entry]);
  console.log(`✔ ${prev.slug ? 'Actualizado' : 'Añadido'}: /a/${slug}/`);
} else if (cmd === 'remove') {
  const [slug] = rest;
  if (!slug || !list.some((a) => a.slug === slug)) die(`No existe el slug "${slug}".`);
  await rm(path.join(ROOT, 'sites', slug), { recursive: true, force: true });
  await save(list.filter((a) => a.slug !== slug));
  console.log(`✔ Eliminado: ${slug}`);
} else if (cmd === 'list') {
  if (!list.length) console.log('(vacío)');
  for (const a of list) {
    console.log(`${a.listed === false ? '·' : '•'} /a/${a.slug}/  ${a.title}  ${a.source || ''}`);
  }
} else {
  die('Comandos: add | remove | list');
}
