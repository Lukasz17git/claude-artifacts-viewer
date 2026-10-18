import { useEffect, useState } from 'react';
import { SITE_NAME, SITE_TAGLINE } from './config.js';

const fmt = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

function formatDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : fmt.format(d);
}

export default function App() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = SITE_NAME;
    fetch('/api/artifacts')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setItems)
      .catch(() => setError(true));
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">{SITE_NAME}</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">{SITE_TAGLINE}</p>
      </header>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          No se pudo cargar la lista de artefactos.
        </p>
      )}

      {!error && items === null && (
        <ul className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-20 animate-pulse rounded-xl bg-stone-200/70 dark:bg-stone-800/70" />
          ))}
        </ul>
      )}

      {items && items.length === 0 && (
        <p className="text-stone-500">Todavía no hay artefactos publicados.</p>
      )}

      {items && items.length > 0 && (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.slug}>
              <a
                href={a.url}
                className="group block rounded-xl border border-stone-200 bg-white p-5 transition hover:border-orange-600/60 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-medium group-hover:text-orange-700 dark:group-hover:text-orange-400">
                    {a.title || a.slug}
                  </h2>
                  <span className="shrink-0 text-stone-400 transition group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </div>
                {a.description && (
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{a.description}</p>
                )}
                <p className="mt-3 font-mono text-xs text-stone-400">
                  /a/{a.slug}/{a.updatedAt && <> · actualizado {formatDate(a.updatedAt)}</>}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
