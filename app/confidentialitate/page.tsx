import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.privacy.metaTitle,
};

export default function PrivacyPage() {
  return (
    <div className="page">
      <div className="wrap prose">
        <h1>{copy.privacy.title}</h1>
        <p>{copy.privacy.intro}</p>
        <h2>{copy.privacy.storedTitle}</h2>
        <p>{copy.privacy.stored}</p>
        <h2>{copy.privacy.whyTitle}</h2>
        <p>{copy.consent.body}</p>
        <h2>{copy.privacy.basisTitle}</h2>
        <p>{copy.privacy.basis}</p>
        <h2>{copy.privacy.retentionTitle}</h2>
        <p>{copy.privacy.retention}</p>
        <h2>{copy.privacy.accessTitle}</h2>
        <p>{copy.privacy.access}</p>
        <p>
          {copy.privacy.unsubscribeBefore}{" "}
          <Link href="/unsubscribe">{copy.privacy.unsubscribeLink}</Link>.
        </p>
        <p>
          {copy.privacy.contactBefore}{" "}
          <a
            href={copy.privacy.contactHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.privacy.contactLink}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
