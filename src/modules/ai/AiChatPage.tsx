import { Link } from 'react-router-dom'
import { ArrowRightIcon, FileTextIcon } from '@/components/ui/icons'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function AiChatPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 space-y-5">
        <nav className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)]" aria-label="Breadcrumb">
          <Link className="hover:text-[var(--color-teal)]" to="/profile">
            Profile
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--color-text-primary)]">AI Chatting</span>
        </nav>

        <section className="overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-navy)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-cyan)]">AI Assistant</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-normal text-[var(--color-text-on-navy)]">
              AI CV Assistant
            </h1>
            <p className="mt-3 text-base leading-relaxed text-white/75">
              Score your CV, review focused feedback, and prepare an English version from the documents you uploaded to CVBuddy.
            </p>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <Card className="overflow-hidden shadow-[var(--shadow-lg)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileTextIcon className="h-5 w-5 text-[var(--color-teal)]" />
              Your guided AI workspace
            </CardTitle>
            <CardDescription>
              Select a saved CV, choose the relevant industry, then request a focused AI task.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-hover)] bg-[var(--color-bg-main)] p-5">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">AI actions will appear here</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                The next implementation phase will connect your uploaded CV to score, feedback, translation and saved-result views.
              </p>
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              This is a task-based assistant, not an open-ended chatbot. AI suggestions do not change your original CV automatically.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--color-text-secondary)]">Start by keeping an up-to-date CV in your workspace.</p>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-teal)] px-4 text-sm font-medium text-[var(--color-text-on-teal)] transition-all duration-200 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-2"
              to="/cv"
            >
              Open CV workspace
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="h-fit overflow-hidden shadow-[var(--shadow-sm)]">
          <CardHeader>
            <CardTitle>What this assistant supports</CardTitle>
            <CardDescription>Available AI tasks will stay tied to a specific CV.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <li className="rounded-[var(--radius-md)] bg-[var(--color-bg-soft)] px-3 py-2">CV score and focused feedback</li>
              <li className="rounded-[var(--radius-md)] bg-[var(--color-bg-soft)] px-3 py-2">English translation for review</li>
              <li className="rounded-[var(--radius-md)] bg-[var(--color-bg-soft)] px-3 py-2">Saved AI results for later reference</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}