import Link from "next/link";

import { WorkspaceProjectsManager } from "../../../components/workspace/projects-manager";
import { requireWorkspaceUser } from "../../../lib/auth";
import { getProjects } from "../../../lib/content-data";

export default async function WorkspaceProjectsPage() {
  await requireWorkspaceUser("/workspace/projects");
  const projects = await getProjects();

  return (
    <>
      <div className="page-header">
        <p className="breadcrumb">{"// DIRECTORY: /home/igcomplex/workspace/projects"}</p>
        <h1 className="headline">
          Project <span className="accent-teal">Workspace</span>
        </h1>
        <p className="text-secondary page-header__copy">
          Create, update, and delete public project entries. Screenshot uploads go straight to the Supabase
          portfolio bucket.
        </p>
        <div className="workspace-nav-links">
          <Link href="/workspace">Back to workspace</Link>
          <Link href="/projects">Public archive</Link>
        </div>
      </div>

      <WorkspaceProjectsManager projects={projects} />
    </>
  );
}