import Link from "next/link";
import { copy } from "@/content/copy";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>
          GoodFund, {copy.brand.initiative}{" "}
          <a
            href={copy.brand.initiativeHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {copy.brand.initiativeLinkLabel}
          </a>
          . {copy.footer.note}
        </p>
        <div className="footer-links">
          <Link href="/confidentialitate">{copy.nav.privacy}</Link>
          <Link href="/unsubscribe">{copy.nav.unsubscribe}</Link>
        </div>
      </div>
    </footer>
  );
}
