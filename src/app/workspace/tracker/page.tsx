import Link from "next/link";

import { WorkspaceTrackerManager } from "../../../components/workspace/tracker-manager";
import { requireWorkspaceUser } from "../../../lib/auth";
import { getGachaGames } from "../../../lib/content-data";

export default async function WorkspaceTrackerPage() {
  await requireWorkspaceUser("/workspace/tracker");
  const games = await getGachaGames();

  return (
    <>
      <div className="page-header">
        <p className="breadcrumb">{"// DIRECTORY: /home/igcomplex/workspace/tracker"}</p>
        <h1 className="headline">
          Tracker <span className="accent-teal">Workspace</span>
        </h1>
        <p className="text-secondary page-header__copy">
          Maintain the gacha tracker records and banner uploads behind the authenticated workspace.
        </p>
        <div className="workspace-nav-links">
          <Link href="/workspace">Back to workspace</Link>
          <Link href="/tracker">Protected tracker view</Link>
        </div>
      </div>

      <WorkspaceTrackerManager games={games} />
    </>
  );
}