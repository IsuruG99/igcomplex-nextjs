import Image from "next/image";
import Link from "next/link";

import { getProjects } from "../../lib/content-data";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <div className="page-header">
        <p className="breadcrumb">{"// DIRECTORY: /home/igcomplex/projects"}</p>
        <h1 className="headline">
          Project <span className="accent-red">Archive</span>
        </h1>
        <p className="text-secondary page-header__copy">Live data. Supabase Postgres. Assets via Supabase Storage.</p>
      </div>

      <div className="grid grid-auto">
        {projects.map((project) => (
          <article className="card project-card" key={project.id}>
            {project.screenshots[0] ? (
              <div className="media-frame media-frame--gallery project-card__media">
                <Image
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  src={project.screenshots[0]}
                />
              </div>
            ) : null}
            <h2 className="headline project-card__title">{project.title}</h2>
            <div className="meta-row card-divider">
              <span className="mono label">{project.year}</span>
              {project.github ? (
                <Link href={project.github} rel="noreferrer" target="_blank">
                  github.com
                </Link>
              ) : (
                <span className="mono label">private</span>
              )}
            </div>
            <p className="project-card__copy text-secondary">{project.brief}</p>
            <div className="project-card__footer">
              <span className="mono label">{project.techStack.join(" / ")}</span>
              <Link href={`/projects/${project.id}`}>View project</Link>
            </div>
          </article>
        ))}

        {projects.length === 0 ? (
          <section className="card blog-empty-state">
            <p className="mono label">0 projects found in database.</p>
            <p className="text-secondary">Add project entries in the workspace when you are ready to publish.</p>
          </section>
        ) : null}
      </div>
    </>
  );
}