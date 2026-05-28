import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProjectById, getProjects } from "../../../lib/content-data";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function generateStaticParams() {
  const projects = await getProjects();

  return projects.map((project) => ({
    projectId: String(project.id),
  }));
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = await params;
  const project = await getProjectById(Number(projectId));

  if (!project) {
    notFound();
  }

  return (
    <>
      <Link className="back-link" href="/projects">
        Back to Projects
      </Link>

      <div className="page-header page-header--compact">
        <div>
          <p className="breadcrumb">{`// DIRECTORY: /home/igcomplex/projects/${project.id}`}</p>
          <h1 className="headline accent-teal">{project.title}</h1>
          <p className="label mono project-detail__label">
            {`${project.year} // REF_ID: 00${project.id}`}
            {project.role ? ` // ${project.role}` : ""}
          </p>
        </div>
        {project.status ? (
          <div className="status-card">
            <p className="label label-teal">STATUS</p>
            <p className="mono accent-teal">{project.status}</p>
          </div>
        ) : null}
      </div>

      {project.screenshots[0] ? (
        <div className="media-frame media-frame--hero">
          <Image alt={project.title} fill priority sizes="100vw" src={project.screenshots[0]} />
        </div>
      ) : null}

      <div className="grid project-detail-grid">
        <div className="project-detail-grid__main">
          <section className="card card-stack">
            <p className="label label-teal">DESCRIPTION</p>
            <p className="text-secondary">{project.desc}</p>
          </section>

          <section className="card card-stack">
            <p className="label label-teal">FEATURES & CONTRIBUTIONS</p>
            <ul className="stack-list">
              {project.features.map((feature) => (
                <li className="mono" key={feature}>
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          <section className="card card-stack">
            <p className="label label-red">CHALLENGES & SOLUTIONS</p>
            <ul className="stack-list">
              {project.challenges.map((challenge) => (
                <li className="mono" key={challenge}>
                  {challenge}
                </li>
              ))}
            </ul>
          </section>

          {project.lessons ? (
            <section className="card card-stack">
              <p className="label">WHAT I LEARNED</p>
              <p className="text-secondary text-secondary--italic">{project.lessons}</p>
            </section>
          ) : null}
        </div>

        <aside className="project-detail-grid__side">
          <section className="card card-stack">
            <p className="label label-teal">TECH STACK</p>
            <ul className="stack-list">
              {project.techStack.map((item) => (
                <li className="mono" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {project.github ? (
            <section className="card source-card">
              <p className="label">SOURCE</p>
              <Link href={project.github} rel="noreferrer" target="_blank">
                github.com
              </Link>
            </section>
          ) : null}
        </aside>
      </div>

      {project.screenshots.length > 1 ? (
        <section className="project-gallery">
          <p className="breadcrumb">{"// SCREENSHOTS"}</p>
          <div className="grid project-gallery__grid">
            {project.screenshots.map((screenshot, index) => (
              <div className="media-frame media-frame--gallery" key={`${project.id}-${index}`}>
                <Image
                  alt={`${project.title} screenshot ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  src={screenshot}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}