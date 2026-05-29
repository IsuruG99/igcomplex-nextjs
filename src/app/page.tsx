import Image from "next/image";
import Link from "next/link";
import { siteProfile } from "../lib/site-content";

export default function HomePage() {
  return (
    <div className="home-shell">
      <section className="card home-lead">
        <div className="home-lead__copy">
          <p className="home-lead__eyebrow mono">Personal portfolio, blog, and small internal tools.</p>
          <h1 className="headline home-lead__title">
            {siteProfile.heroTitle[0]} {siteProfile.heroTitle[1]} <span className="accent-teal">{siteProfile.heroAccent}</span>
          </h1>
          <p className="text-secondary home-lead__summary">{siteProfile.summary}</p>
          <div className="home-lead__actions">
            <Link className="btn btn-teal" href="/projects">
              View Projects
            </Link>
            <Link className="btn btn-outline-teal" href="/blog">
              Blog
            </Link>
            <Link className="btn btn-outline-teal" href="/cv">
              View CV
            </Link>
          </div>
          <div className="home-lead__stats">
            <div className="home-stat">
              <span className="label">Focus</span>
              <p>{siteProfile.heroText}</p>
            </div>
            <div className="home-stat">
              <span className="label">Environment</span>
              <p>{siteProfile.heroSubtext}</p>
            </div>
            <div className="home-stat home-stat--accent">
              <span className="label">Current Status</span>
              <p>{siteProfile.status}</p>
              <span className="text-secondary">{siteProfile.statusSubtext}</span>
            </div>
          </div>
        </div>

        <div className="home-profile">
          <div className="home-profile__avatar avatar-frame">
            <Image alt="IGComplex profile" fill priority sizes="320px" src={siteProfile.avatarUrl} />
          </div>
          <div className="home-profile__meta">
            <p className="breadcrumb">{siteProfile.welcomeLabel}</p>
            <h2 className="headline accent-red home-profile__title">IGComplex</h2>
            <p className="text-secondary">
              Built around readable systems, small delivery slices, and a public-facing presentation that does not
              need a heavyweight backend to stay useful.
            </p>
          </div>
        </div>
      </section>

      <div className="home-sections">
        <section className="card home-section">
          <div className="home-section__header">
            <p className="label label-teal">What I am working on</p>
            <h2 className="headline home-section__title">CURRENT FOCUS</h2>
          </div>
          <div className="home-focus-list">
            {siteProfile.goals.map((item) => (
              <article className="home-focus-item" key={item.label}>
                <span className="mono accent-teal">{item.label}</span>
                <p className="text-secondary">{item.value}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card home-section home-section--aside">
          <div className="home-section__header">
            <p className="label label-red">MY JOURNEY</p>
            <h2 className="headline home-section__title">Navigation</h2>
          </div>
          <p className="text-secondary">Updates from Career, Projects & Other.</p>
          <div className="home-section__links">
            <Link href="/blog">Blog</Link>
            <Link href="/projects">Projects</Link>
            <Link href="/cv">CV</Link>
          </div>
        </section>
      </div>
    </div>
  );
}