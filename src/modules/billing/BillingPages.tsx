import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createCheckout, getBillingErrorMessage, getBillingOrder, getMyBilling, getMyUsage } from './billingApi'
import { createCheckoutIdempotencyKey, shouldRetainCheckoutKey } from './checkoutPolicy'
import { formatDate, formatVnd, isSafeCheckoutUrl, isValidOrderId } from './billingModel'
import { BILLING_POLL_MAX_ATTEMPTS, isTerminalBillingStatus, nextBillingPollDelay } from './billingPolling'
import type { BillingOrder, BillingOverview } from './billingTypes'

function Notice({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return <p className={`rounded-[var(--radius-lg)] px-4 py-3 text-sm ${error ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]' : 'bg-[var(--color-success-bg)] text-[var(--color-success)]'}`} role={error ? 'alert' : 'status'}>{children}</p>
}

function useBillingOverview() {
  const [billing, setBilling] = useState<BillingOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setBilling(await getMyBilling()) } catch (reason) { setError(getBillingErrorMessage(reason)) } finally { setLoading(false) }
  }, [])
  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [load])
  return { billing, loading, error, reload: load }
}

function PlanCards({ billing, onCheckout, submitting }: { billing: BillingOverview; onCheckout?: () => void; submitting?: boolean }) {
  return <div className="grid gap-5 lg:grid-cols-2">
    {(['FREE', 'PRO_30D'] as const).map((code) => {
      const plan = billing.plans[code]
      const pro = code === 'PRO_30D'
      return <Card key={code} className={pro ? 'border-[var(--color-teal)] shadow-[var(--shadow-md)]' : undefined}><CardHeader><CardTitle>{pro ? 'PRO — 30 days' : 'FREE'}</CardTitle><p className="mt-1 text-2xl font-bold">{formatVnd(plan.priceVnd)}</p></CardHeader><CardContent><p className="font-semibold">{plan.creditsGranted} AI credits</p><p className="mt-1 text-sm text-[var(--color-text-secondary)]">{plan.durationDays ? `${plan.durationDays}-day access. Not automatically renewing.` : 'Monthly FREE allowance.'}</p>{pro ? <Button className="mt-5 w-full" disabled={!billing.enabled || submitting} loading={submitting} onClick={onCheckout} type="button">{billing.enabled ? 'Continue to secure checkout' : 'Payments are not available yet'}</Button> : null}</CardContent></Card>
    })}
  </div>
}

function FeatureCosts({ billing }: { billing: BillingOverview }) {
  return <Card className="mt-6"><CardHeader><CardTitle>AI credit costs</CardTitle></CardHeader><CardContent><ul className="grid gap-2 text-sm sm:grid-cols-2">{Object.entries(billing.featureCosts).map(([feature, cost]) => <li className="flex justify-between rounded-[var(--radius-md)] bg-[var(--color-bg-main)] px-3 py-2" key={feature}><span>{feature.replaceAll('_', ' ')}</span><strong>{cost} credits</strong></li>)}</ul></CardContent></Card>
}

export function PricingPage() {
  const { billing, loading, error, reload } = useBillingOverview()
  const [submitting, setSubmitting] = useState(false)
  const keyRef = useRef<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const checkout = async () => {
    if (!billing || !billing.enabled || submitting) return
    setSubmitting(true); setMessage(null)
    keyRef.current ??= createCheckoutIdempotencyKey()
    try {
      const order = await createCheckout('PRO_30D', keyRef.current)
      if (!isSafeCheckoutUrl(order.checkoutUrl)) throw new Error('The checkout link was invalid. Please try again later.')
      window.location.assign(order.checkoutUrl!)
    } catch (reason) { setMessage(getBillingErrorMessage(reason)); if (!shouldRetainCheckoutKey(reason)) keyRef.current = null; setSubmitting(false) }
  }
  return <Page title="Plans and credits">{loading ? <Loading /> : error || !billing ? <Failure text={error ?? 'Billing details are unavailable.'} retry={reload} /> : <><PlanCards billing={billing} onCheckout={() => void checkout()} submitting={submitting} />{!billing.enabled ? <Notice>Payment checkout is currently unavailable. Prices and credit costs are informational only.</Notice> : null}{message ? <Notice error>{message}</Notice> : null}<FeatureCosts billing={billing} /></>}</Page>
}

export function BillingPage() {
  const { billing, loading, error, reload } = useBillingOverview()
  return <Page title="Billing and usage">{loading ? <Loading /> : error || !billing ? <Failure text={error ?? 'Billing details are unavailable.'} retry={reload} /> : <><Card><CardHeader><CardTitle>Current access</CardTitle></CardHeader><CardContent><dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Fact label="Plan" value={billing.entitlement.planCode} /><Fact label="Credits remaining" value={String(billing.entitlement.creditsRemaining)} /><Fact label="Credits used" value={`${billing.entitlement.creditsConsumed} of ${billing.entitlement.creditsGranted}`} /><Fact label="Access ends" value={formatDate(billing.entitlement.endsAt)} /></dl></CardContent></Card><FeatureCosts billing={billing} /><section className="mt-6"><h2 className="mb-3 text-xl font-semibold">Recent orders</h2>{billing.orders.length ? <div className="space-y-3">{billing.orders.map((order) => <OrderCard key={order.id} order={order} />)}</div> : <Card><CardContent className="py-8 text-center text-sm text-[var(--color-text-secondary)]">You do not have any payment orders yet.</CardContent></Card>}</section>{!billing.enabled ? <Notice>Checkout is disabled right now. Your displayed plan and credits remain server-controlled.</Notice> : <Link className="mt-5 inline-block text-sm font-semibold text-[var(--color-teal)] hover:underline" to="/pricing">View plans</Link>}</>}</Page>
}

function OrderCard({ order }: { order: BillingOrder }) { return <Card><CardContent className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{order.planCode}</p><p className="text-sm text-[var(--color-text-secondary)]">Created {formatDate(order.createdAt)} · {formatVnd(order.amountVnd)}</p></div><span className="rounded-full bg-[var(--color-bg-soft)] px-3 py-1 text-sm font-semibold text-[var(--color-teal)]">{order.status}</span></CardContent></Card> }
function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="text-sm text-[var(--color-text-secondary)]">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div> }
function Loading() { return <div className="space-y-3" role="status"><span className="sr-only">Loading billing details</span><div className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-gray-100)]" /></div> }
function Failure({ text, retry }: { text: string; retry: () => void }) { return <Card><CardContent className="space-y-4 py-8"><Notice error>{text}</Notice><Button onClick={() => void retry()} type="button" variant="secondary">Try again</Button></CardContent></Card> }
function Page({ title, children }: { title: string; children: React.ReactNode }) { return <main className="mx-auto w-full max-w-[1000px] px-4 py-8 sm:px-6 lg:px-8"><header className="mb-6"><h1 className="text-3xl font-bold sm:text-4xl">{title}</h1><p className="mt-2 text-[var(--color-text-secondary)]">Plans, credits, and payment status are confirmed by CVBuddy&apos;s backend.</p></header><div className="space-y-4">{children}</div></main> }

export function PaymentStatusPage({ cancelled }: { cancelled: boolean }) {
  const [params] = useSearchParams(); const orderId = params.get('orderId')
  const [order, setOrder] = useState<BillingOrder | null>(null); const [error, setError] = useState<string | null>(null); const [polling, setPolling] = useState(false)
  const load = useCallback(async () => { if (!isValidOrderId(orderId)) { setError('This payment link is missing a valid order reference.'); return } try { const next = await getBillingOrder(orderId!); setOrder(next); setError(null); return next } catch (reason) { setError(getBillingErrorMessage(reason)); return null } }, [orderId])
  useEffect(() => { let active = true; let timer: number | undefined; let attempt = 0; const poll = async () => { const next = await load(); if (!active || !next || isTerminalBillingStatus(next.status) || attempt >= BILLING_POLL_MAX_ATTEMPTS) { if (next?.status === 'PAID') void Promise.all([getMyBilling(), getMyUsage()]); setPolling(false); return } setPolling(true); timer = window.setTimeout(() => { attempt += 1; void poll() }, nextBillingPollDelay(attempt)) }; void poll(); return () => { active = false; if (timer) window.clearTimeout(timer) } }, [load])
  const title = cancelled ? 'Payment status' : 'Checking payment status'
  return <Page title={title}>{error ? <Failure text={error} retry={() => void load()} /> : !order ? <Loading /> : <Card><CardContent className="space-y-4 py-8"><h2 className="text-xl font-semibold">{order.status === 'PAID' ? 'Payment confirmed' : order.status === 'PENDING' ? 'Payment is still pending' : `Payment ${order.status.toLowerCase()}`}</h2><p className="text-sm text-[var(--color-text-secondary)]">{order.status === 'PAID' ? 'Your access will be updated from the backend.' : cancelled ? 'The return page is not payment proof; this is the current backend status.' : 'We are waiting for the verified backend status.'}</p><OrderCard order={order} />{polling ? <p className="text-sm" role="status">Checking for an update…</p> : null}<Link className="font-semibold text-[var(--color-teal)] hover:underline" to="/billing">View billing</Link></CardContent></Card>}</Page>
}
