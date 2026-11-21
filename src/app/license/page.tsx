import Link from '@/components/site/NavigationLink';
import { PageIntro } from '@/components/site/PageIntro';
import { pageMetadata } from '@/lib/site';
import { LicenseRequestForm } from '@/components/site/LicenseRequestForm';

export const metadata = pageMetadata('/license/', 'Organization licenses', 'Request a Lymora LAN Messenger organization license code. Personal use remains free.');

export default function LicensePage() {
  return <main id="main" tabIndex={-1} className="container editorial-page license-page">
    <PageIntro eyebrow="Lymora / Organizations" title={<>A local tool.<br/><em>For your team.</em></>} description="Request an organization code for the PCs your team uses. Personal use of Lymora remains free."/>
    <section className="license-request-panel glass-panel" aria-labelledby="license-request-title">
      <div className="license-request-copy"><p className="eyebrow">Organization access</p><h2 id="license-request-title">Start with a request.</h2><p>Share your organization name and a work email. Lymora will review the request and send you a code if approved. Enter that code in the desktop app to activate it on your PCs.</p><p>Activation needs an internet connection once. The app verifies and stores a signed, device-bound license locally, then can check it offline.</p><p className="license-request-footnote">This request does not create an account or start a payment. There is no payment gateway connected yet.</p></div>
      <LicenseRequestForm/>
    </section>
    <div className="editorial-note"><h3>Already have a code?</h3><p>Open Lymora Desktop, choose <strong>Settings → License</strong> or enter it during setup. Need help? Visit the <Link href="/products/lan-messenger/docs/#troubleshooting">connection guide</Link>.</p></div>
  </main>;
}
