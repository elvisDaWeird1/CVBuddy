export default function CompanyWorkspaceUnavailablePage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-12 text-center sm:px-6" aria-labelledby="company-workspace-title">
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-md)] sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-teal)]">Company account</p>
        <h1 className="mt-3 text-3xl font-bold text-[var(--color-navy)]" id="company-workspace-title">Company workspace is not available in this beta</h1>
        <p className="mt-4 leading-relaxed text-[var(--color-text-secondary)]">
          Your account is signed in safely, but company features are intentionally deferred until after the initial deployment.
        </p>
      </div>
    </section>
  )
}
