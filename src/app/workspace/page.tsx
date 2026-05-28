import Link from "next/link";

import { requireWorkspaceUser } from "../../lib/auth";
import { getArticles, getGachaGames, getProjects } from "../../lib/content-data";

export default async function WorkspacePage() {
  await requireWorkspaceUser("/workspace");
  const [projects, articles, games] = await Promise.all([
    getProjects(),
    getArticles(),
    getGachaGames(),
  ]);

  return (
    <>
      <div className="page-header">
        <p className="breadcrumb">{"// DIRECTORY: /home/igcomplex/workspace"}</p>
        <h1 className="headline">
          Content <span className="accent-teal">Workspace</span>
        </h1>
        <p className="text-secondary page-header__copy">
          This is a small internal tool for managing portfolio content and private tracker data without adding a
          full CMS layer.
        </p>
      </div>

      <div className="grid grid-auto">
        <section className="card card-stack">
          <p className="label label-teal">PROJECTS</p>
          <h2 className="headline">{projects.length} items</h2>
          <p className="text-secondary">
            Edit project copy, screenshots, and links from a focused form flow rather than a framework-specific
            admin surface.
          </p>
          <Link href="/workspace/projects">Manage projects</Link>
        </section>

        <section className="card card-stack">
          <p className="label label-teal">BLOG</p>
          <h2 className="headline">{articles.length} items</h2>
          <p className="text-secondary">
            Keep notes and image sets current through a simple editor that matches the public blog shape.
          </p>
          <Link href="/workspace/blog">Manage blog</Link>
        </section>

        <section className="card card-stack">
          <p className="label label-teal">TRACKER</p>
          <h2 className="headline">{games.length} items</h2>
          <p className="text-secondary">
            Maintain tracker entries and banner assets without leaving the signed-in tool surface.
          </p>
          <Link href="/workspace/tracker">Manage tracker</Link>
        </section>

        <section className="card card-stack">
          <p className="label label-teal">ASSETS</p>
          <h2 className="headline">Shared uploads</h2>
          <p className="text-secondary">
            Shared storage assets such as the CV file are managed separately from content rows so they can be
            replaced without code or env edits.
          </p>
          <Link href="/workspace/assets">Manage assets</Link>
        </section>
      </div>
    </>
  );
}