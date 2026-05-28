import { BlogImageGallery } from "../../components/blog-image-gallery";
import { getArticles } from "../../lib/content-data";

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <>
      <div className="page-header">
        <p className="breadcrumb">{"// DIRECTORY: /home/igcomplex/blog"}</p>
        <h1 className="headline">
          Blog <span className="accent-red">Feed</span>
        </h1>
        <p className="text-secondary page-header__copy">
          Notes, build logs, and portfolio-adjacent writeups. Newer entries stay at the top and images open inline.
        </p>
      </div>

      <div className="blog-feed">
        {articles.map((article) => (
          <article className="card card-stack blog-entry" key={article.id}>
            <p className="breadcrumb">ID: [{article.id}]</p>
            <h2 className="headline heading-teal blog-article-title">{article.title}</h2>
            <div className="meta-row card-divider">
              <span className="mono label">{article.startDate}</span>
              <span className="mono label">{article.endDate ?? "ongoing"}</span>
            </div>

            <div className="blog-article-copy text-secondary">
              {article.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="blog-actions">
              <span className="mono label blog-entry__asset-count">
                {article.images.length} image{article.images.length === 1 ? "" : "s"}
              </span>
              <BlogImageGallery articleTitle={article.title} images={article.images} />
            </div>
          </article>
        ))}

        {articles.length === 0 ? (
          <section className="card blog-empty-state">
            <p className="mono label">0 articles found in database.</p>
            <p className="text-secondary">Add entries when you are ready to publish.</p>
          </section>
        ) : null}
      </div>
    </>
  );
}