'use client';

import { useState, type FormEvent } from 'react';
import Link from '@/components/site/NavigationLink';

export function LicenseRequestForm() {
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    setFailed(false);
    try {
      const response = await fetch('/api/license/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ organization, email, consent }),
      });
      const responseBody = await response.text();
      let result: { received?: boolean; error?: string } | null = null;
      try {
        const parsed: unknown = responseBody ? JSON.parse(responseBody) : null;
        if (parsed && typeof parsed === 'object') result = parsed as { received?: boolean; error?: string };
      } catch { /* A static-only deployment or proxy error may return HTML or an empty body. */ }
      if (!result) {
        if (response.status === 404 || response.status === 405) {
          throw new Error('Organization requests are unavailable on this deployment. Please contact Lymora directly.');
        }
        throw new Error('The request service returned an invalid response. Please try again later.');
      }
      if (!response.ok || !result.received) throw new Error(result.error || 'Your request could not be submitted. Please try again.');
      setMessage('Request received. An administrator will review it manually. If approved, Lymora will contact you using the email you provided and share an organization code.');
      setOrganization('');
      setEmail('');
      setConsent(false);
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : 'Your request could not be submitted. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <form className="license-request-form" onSubmit={event => void submit(event)}>
    <label htmlFor="license-organization">Organization name<input id="license-organization" name="organization" required maxLength={120} autoComplete="organization" value={organization} onChange={event => setOrganization(event.target.value)} disabled={busy}/></label>
    <label htmlFor="license-email">Work email<input id="license-email" name="email" type="email" required maxLength={254} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} disabled={busy}/></label>
    <div className="license-request-consent"><input id="license-consent" aria-label="Agree to use of request details" type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} required disabled={busy}/><span>I agree that Lymora may use these details to review and respond to this license request. See the <Link href="/privacy/">privacy details</Link>.</span></div>
    <button className="button button-primary" type="submit" disabled={busy || !consent}>{busy ? 'Sending request…' : 'Request an organization code'}<span aria-hidden="true">↗</span></button>
    <p className="license-request-message" role={failed ? 'alert' : 'status'} aria-live="polite">{message}</p>
  </form>;
}
