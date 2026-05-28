import Link from "next/link";

import { getArticles, getGachaGames, getProjects } from "../../lib/content-data";
import { requireUser } from "../../lib/auth";

export default async function HubPage() {
  const user = await requireUser("/hub");
  const [projects, articles, games] = await Promise.all([
    getProjects(),
    getArticles(),
    getGachaGames(),
  ]);

  return (
    <>
      <div className="page-header">
        <p className="breadcrumb">{"// DIRECTORY: /home/igcomplex/hub"}</p>
        <h1 className="headline">
          Private <span className="accent-teal">Hub</span>
        </h1>
        <p className="text-secondary page-header__copy">
          Signed in as {user.username}. This hub is the protected entry point for the
          tracker and the lightweight workspace used to manage private tools and content.
        </p>
      </div>

      <div className="grid grid-auto">
        <section className="card card-stack">
          <p className="label label-teal">TRACKER</p>
          <h2 className="headline">Gacha State</h2>
          <p className="text-secondary">{games.length} tracked game entries available.</p>
          <Link className="btn btn-teal" href="/tracker">
            Open tracker
          </Link>
        </section>

        <section className="card card-stack">
          <p className="label label-teal">WORKSPACE</p>
          <h2 className="headline">Content Control</h2>
          <p className="text-secondary">
            {projects.length} projects and {articles.length} articles are visible through the current public data
            layer.
          </p>
          <Link className="btn btn-outline-teal" href="/workspace">
            Open workspace
          </Link>
        </section>
      </div>
    </>
  );
}