import Link from 'next/link';

interface ComingSoonProps {
  icon: string;
  title: string;
  description: string;
  /** Optional link back to the working single-page version */
  fallbackHref?: string;
  features?: string[];
}

export function ComingSoon({ icon, title, description, fallbackHref, features }: ComingSoonProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">{description}</p>

        {features && features.length > 0 && (
          <ul className="text-left mb-6 space-y-2 bg-gray-50 rounded-xl p-4 border border-gray-200">
            {features.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500 font-bold">✓</span> {f}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-3 items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            🚧 Diese Seite wird gerade gebaut
          </div>

          {fallbackHref && (
            <Link
              href={fallbackHref}
              className="text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2"
            >
              → Zur vollständigen Version (index.html)
            </Link>
          )}

          <Link
            href="/home"
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
