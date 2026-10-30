import Image from "next/image";
import Link from "next/link";
import { copy } from "@/content/copy";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <Link href="/" className="wordmark">
            {copy.brand.wordmarkLead}
            <span>{copy.brand.wordmarkTail}</span>
          </Link>
          <a
            className="initiative"
            href={copy.brand.initiativeHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{copy.brand.initiative}</span>
            <Image
              src="/good-bureau-logo.svg"
              alt={copy.brand.initiativeLinkLabel}
              width={75}
              height={32}
            />
            <span className="sr-only">{copy.brand.newTab}</span>
          </a>
        </div>
        <nav aria-label="GoodFund">
          <ul className="nav-list">
            <li>
              <Link href="/confidentialitate">{copy.nav.privacy}</Link>
            </li>
            <li>
              <Link href="/unsubscribe">{copy.nav.unsubscribe}</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
