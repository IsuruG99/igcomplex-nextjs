import Link from "next/link";

import {
  getAcademicHistory,
  getCvUrl,
  getSiteProfile,
  getSkillGroups,
} from "../../lib/content-data";

export default function CvPage() {
  const cvDownloadUrl = getCvUrl();
  const siteProfile = getSiteProfile();
  const academicHistory = getAcademicHistory();
  const skillGroups = getSkillGroups();

  return (
    <>
      <div className="page-header divider-red">
        <p className="breadcrumb label-red">{"// DIRECTORY: /home/igcomplex/cv"}</p>
        <h1 className="headline">
          Curriculum <span className="accent-red">Vitae</span>
        </h1>
        <div className="page-header__actions cv-actions">
          {cvDownloadUrl ? (
            <Link className="btn btn-red" href={cvDownloadUrl} rel="noreferrer" target="_blank">
              Download PDF
            </Link>
          ) : (
            <span className="mono label">NEXT_PUBLIC_CV_URL not configured yet.</span>
          )}
        </div>
      </div>

      <div className="grid grid-auto">
        <section className="card card-stack col-span-2">
          <p className="label label-teal">PROFILE_SUMMARY</p>
          <p className="cv-summary">{siteProfile.summary}</p>
        </section>

        <section className="card card-stack">
          <p className="label label-red">STATUS</p>
          <h2 className="headline cv-status">{siteProfile.status}</h2>
          <p className="mono label">To Learn and Grow</p>
        </section>

        <section className="card card-stack">
          <p className="label label-red">ACADEMIC_HISTORY</p>
          {academicHistory.map((entry) => (
            <div className="history-item" key={entry.period}>
              <span className="label history-item__period">{entry.period}</span>
              <h2 className="headline history-item__title">{entry.title}</h2>
              <p className="history-item__subtitle">{entry.subtitle}</p>
            </div>
          ))}
        </section>

        <section className="card card-stack col-span-2 cv-skills-grid">
          <div className="grid grid-2">
            {skillGroups.map((group) => (
              <div key={group.title}>
                <p className="label label-teal cv-skill-heading">{group.title}</p>
                <ul className="stack-list">
                  {group.items.map((item) => (
                    <li className="mono" key={item}>
                      &gt; {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link className="btn btn-red btn-full" href="/projects">
            Access_Project_Archive.tar.gz
          </Link>
        </section>
      </div>
    </>
  );
}