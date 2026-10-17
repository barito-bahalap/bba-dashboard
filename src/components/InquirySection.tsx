// Style
import "./InquirySection.css";
// Components
import { InquiryForm, Section, SectionHeader, WhatsAppButton } from "@barito-bahalap/components";
// Data
import { inquirySectionCopy } from "@/data/inquiry";

interface InquirySectionProps {
  locale: "id" | "en";
  email: string;
  location: string;
  privacyHref: string;
}

// Public, browser-safe settings only. The service-role key never appears in this app.
const ENDPOINT = import.meta.env.VITE_INQUIRY_ENDPOINT as string | undefined;
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const WA_TECH = import.meta.env.VITE_WA_TECH as string | undefined;
const WA_MEDIA = import.meta.env.VITE_WA_MEDIA as string | undefined;

/** Replaces ContactSection: id="contact" is kept so existing section links keep working. */
export function InquirySection({ locale, email, location, privacyHref }: InquirySectionProps) {
  const copy = inquirySectionCopy[locale];

  return (
    <Section id="contact" tone="surface" labelledBy="contact-title">
      <SectionHeader id="contact-title" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />

      <div className="inquiry-section">
        {ENDPOINT ? (
          <InquiryForm
            endpoint={ENDPOINT}
            turnstileSiteKey={TURNSTILE_SITE_KEY || undefined}
            locale={locale}
            divisions={["bbt", "bbm", "partnership"]}
            privacyHref={privacyHref}
          />
        ) : (
          <p role="alert">Inquiry form is not configured (VITE_INQUIRY_ENDPOINT).</p>
        )}

        <aside className="inquiry-section__direct" aria-labelledby="direct-title">
          <h3 id="direct-title">{copy.directTitle}</h3>
          <dl>
            <dt>{copy.emailLabel}</dt>
            <dd><a href={`mailto:${email}`}>{email}</a></dd>
            <dt>{copy.locationLabel}</dt>
            <dd>{location}</dd>
          </dl>
          <div className="inquiry-section__wa">
            <WhatsAppButton phone={WA_TECH} division="bbt" locale={locale} />
            <WhatsAppButton phone={WA_MEDIA} division="bbm" locale={locale} />
          </div>
        </aside>
      </div>
    </Section>
  );
}
