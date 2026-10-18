// Genera la página de un documento de Claude Docs: una <section> por pestaña, elegida con el '#'
const fmt = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' });

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function cleanTabHtml(html) {
  return (
    html
      // Quita las menciones ('@u_QzMd…', id interno de la cuenta) y el ' · ' que las separa de la fecha
      .replace(/(\s*·\s*)?<span data-atom="mention"[^>]*>[^<]*<\/span>/g, '')
      // Enlaces a otra pestaña: data-ref="file/7e883d95-84e0" -> href="#7e883d95-84e0"
      .replace(/data-ref="file\/([\w-]+)"/g, 'href="#$1"')
  );
}

export function renderDocPage({ title, updatedAt, tabs }) {
  const date = updatedAt ? fmt.format(new Date(updatedAt)) : '';
  const nav =
    tabs.length > 1
      ? `<nav>${tabs.map((t) => `<a href="#${t.id}">${escapeHtml(t.name)}</a>`).join('')}</nav>`
      : '';
  const sections = tabs
    .map((t) => `<section id="${t.id}" data-tab>\n${cleanTabHtml(t.html)}\n</section>`)
    .join('\n');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(title)}</title>
<style>
  :root { --bg: #fafaf9; --fg: #1c1917; --muted: #78716c; --line: #e7e5e4; --soft: #f5f5f4; --accent: #c2410c; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0c0a09; --fg: #f5f5f4; --muted: #a8a29e; --line: #292524; --soft: #1c1917; --accent: #fb923c; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.6 system-ui, sans-serif; }
  header, main, footer { max-width: 800px; margin: 0 auto; padding: 0 16px; }
  header { padding-top: 24px; }
  header > a { color: var(--muted); font-size: 14px; text-decoration: none; }
  nav { display: flex; gap: 4px; margin-top: 16px; border-bottom: 1px solid var(--line); overflow-x: auto; }
  nav a { padding: 8px 12px; color: var(--muted); text-decoration: none; border-bottom: 2px solid transparent; white-space: nowrap; }
  nav a[aria-current] { color: var(--fg); border-bottom-color: var(--accent); }
  main { padding-bottom: 48px; }
  h1 { font-size: 2rem; line-height: 1.2; margin: 32px 0 8px; }
  h2 { font-size: 1.4rem; margin: 40px 0 8px; }
  h3 { font-size: 1.1rem; margin: 28px 0 8px; }
  a { color: var(--accent); }
  table { display: block; overflow-x: auto; border-collapse: collapse; margin: 16px 0; font-size: 15px; }
  th, td { border: 1px solid var(--line); padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: var(--soft); }
  li > p { margin: 4px 0; }
  time { color: var(--muted); }
  /* Los diagramas no se exportan: queda un hueco con su título, si lo tiene */
  figure[data-embed] { margin: 16px 0; padding: 12px 16px; border: 1px dashed var(--line); border-radius: 8px; color: var(--muted); font-size: 14px; }
  figure[data-embed]::before { content: 'Diagrama no disponible en esta copia'; display: block; }
  figcaption { font-style: italic; }
  footer { padding-bottom: 32px; color: var(--muted); font-size: 13px; }
</style>
</head>
<body>
<header>
<a href="../../">← Artefactos</a>
${nav}
</header>
<main>
${sections}
</main>
<footer>Copia de solo lectura de un documento de Claude${date ? ` · actualizada el ${date}` : ''}.</footer>
<script>
  const sections = [...document.querySelectorAll('section[data-tab]')];
  const links = [...document.querySelectorAll('nav a')];

  // Muestra la pestaña del '#' (su id o el de un título suyo: #reglas-clave); si no hay, la primera
  function show() {
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    const active = target?.closest('section[data-tab]') || sections[0];
    sections.forEach((s) => (s.hidden = s !== active));
    links.forEach((l) => (l.hash === '#' + active.id ? l.setAttribute('aria-current', 'page') : l.removeAttribute('aria-current')));
    if (target && target !== active) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }

  addEventListener('hashchange', show);
  show();
</script>
</body>
</html>
`;
}
