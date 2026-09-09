export default function Rechtstext({
  titel, stand, children,
}: { titel: string; stand: string; children: React.ReactNode }) {
  return (
    <section className="pt-32 pb-24 sm:pt-40">
      <div className="schale">
        <div className="max-w-[46rem]">
          <p className="kennung">Rechtliches</p>
          <h1 className="mt-6 text-[length:var(--text-4xl)]">{titel}</h1>
          <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-3">
            Stand {stand}
          </p>
          <div className="fw-recht mt-14">{children}</div>
        </div>
      </div>
    </section>
  );
}
