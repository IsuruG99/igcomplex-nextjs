import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <span className="headline site-footer__mark">Copyright 2026 IGComplex - Next.js + Supabase</span>
        <div className="site-footer__links">
          <Link href="https://github.com/IsuruG99" rel="noreferrer" target="_blank">
            Github
          </Link>
          <Link href="https://www.linkedin.com/in/isurug-dev/" rel="noreferrer" target="_blank">
            LinkedIn
          </Link>
        </div>
      </div>
    </footer>
  );
}
