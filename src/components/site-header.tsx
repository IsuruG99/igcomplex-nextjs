import Link from "next/link";

import { getCurrentUser } from "../lib/auth";

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/cv", label: "CV" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="site-nav">
      <div className="container site-nav__inner">
        <Link className="headline site-nav__brand" href="/">
          IGComplex
        </Link>
        <nav aria-label="Primary">
          <ul className="site-nav__links">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            {user ? (
              <>
                <li>
                  <Link href="/workspace">Workspace</Link>
                </li>
                <li>
                  <Link href="/tracker">Tracker</Link>
                </li>
                <li>
                  <form action="/logout" className="site-nav__form" method="post">
                    <button className="btn btn-red" type="submit">
                      Logout
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <li>
                <Link className="btn btn-outline-teal" href="/login">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
