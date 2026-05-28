import Link from "next/link";

import { WorkspaceAssetsManager } from "../../../components/workspace/assets-manager";
import { requireWorkspaceUser } from "../../../lib/auth";
import { getCvUrl } from "../../../lib/content-data";

export default async function WorkspaceAssetsPage() {
  await requireWorkspaceUser("/workspace/assets");
  const cvUrl = getCvUrl();

  return (
    <>
      <div className="page-header">
        <p className="breadcrumb">{"// DIRECTORY: /home/igcomplex/workspace/assets"}</p>
        <h1 className="headline">
          Asset <span className="accent-teal">Workspace</span>
        </h1>
        <p className="text-secondary page-header__copy">
          Manage shared assets. The current slice handles CV uploads directly into the portfolio bucket at
          `others/cv.pdf`.
        </p>
        <div className="workspace-nav-links">
          <Link href="/workspace">Back to workspace</Link>
          <Link href="/cv">Public CV page</Link>
        </div>
      </div>

      <WorkspaceAssetsManager cvUrl={cvUrl} />
    </>
  );
}