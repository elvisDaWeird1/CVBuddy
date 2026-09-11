export default function Home() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-12 text-center sm:px-6" aria-labelledby="admin-workspace-title">
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-md)] sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Admin workspace</p>
        <h1 className="mt-3 text-3xl font-bold text-[var(--color-navy)]" id="admin-workspace-title">Secure admin session confirmed</h1>
        <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">
          The read-only user metrics dashboard will be added in the next admin implementation tasks.
        </p>
      </div>
    </section>
  )
}
