import Link from "next/link";

import { WorkspaceBlogManager } from "../../../components/workspace/blog-manager";
import { requireWorkspaceUser } from "../../../lib/auth";
import { getArticles } from "../../../lib/content-data";

export default async function WorkspaceBlogPage() {
  await requireWorkspaceUser("/workspace/blog");
  const articles = await getArticles();

  return (
    <>
      <div className="page-header">
        <p className="breadcrumb">{"// DIRECTORY: /home/igcomplex/workspace/blog"}</p>
        <h1 className="headline">
          Blog <span className="accent-teal">Workspace</span>
        </h1>
        <p className="text-secondary page-header__copy">
          Manage article content and image uploads. Each image field writes directly to the Supabase blog bucket.
        </p>
        <div className="workspace-nav-links">
          <Link href="/workspace">Back to workspace</Link>
          <Link href="/blog">Public feed</Link>
        </div>
      </div>

      <WorkspaceBlogManager articles={articles} />
    </>
  );
}