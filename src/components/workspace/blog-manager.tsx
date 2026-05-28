"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useOptimistic, useRef } from "react";

import { initialWorkspaceActionState } from "../../app/workspace/action-types";
import {
  createArticleAction,
  deleteArticleAction,
  updateArticleAction,
} from "../../app/workspace/actions";
import type { Article } from "../../lib/site-content";
import {
  AssetField,
  ConfirmDeleteButton,
  FieldError,
  InlineActionMessage,
  SubmitButton,
  useWorkspaceActionFeedback,
} from "./shared";

type BlogManagerProps = {
  articles: Article[];
};

function getArticleRenderKey(article: Article) {
  return `${article.id}:${JSON.stringify(article)}`;
}

function CreateArticleForm({ onCreated }: { onCreated: (article: Article) => void }) {
  const [state, formAction, isPending] = useActionState(createArticleAction, initialWorkspaceActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useWorkspaceActionFeedback(state, {
    onSuccess: (nextState) => {
      if (nextState.mutation?.entity === "article" && nextState.mutation.operation === "create") {
        onCreated(nextState.mutation.item);
      }

      formRef.current?.reset();
    },
  });

  return (
    <section className={`card card-stack workspace-section${isPending ? " workspace-section--pending" : ""}`}>
      <p className="label label-teal">CREATE ARTICLE</p>
      {isPending ? <p className="workspace-row-status">Creating article...</p> : null}
      <InlineActionMessage state={state} />
      <form action={formAction} className="workspace-form workspace-form--wide" ref={formRef}>
        <div className="workspace-form-grid workspace-form-grid--three">
          <label>
            <span className="label">Title</span>
            <input aria-invalid={Boolean(state.fieldErrors.title)} name="title" required type="text" />
            <FieldError error={state.fieldErrors.title} />
          </label>
          <label>
            <span className="label">Start Date</span>
            <input aria-invalid={Boolean(state.fieldErrors.startDate)} name="startDate" required type="date" />
            <FieldError error={state.fieldErrors.startDate} />
          </label>
          <label>
            <span className="label">End Date</span>
            <input aria-invalid={Boolean(state.fieldErrors.endDate)} name="endDate" type="date" />
            <FieldError error={state.fieldErrors.endDate} />
          </label>
        </div>
        <label>
          <span className="label">Description</span>
          <textarea name="description" rows={6} />
        </label>
        <div className="workspace-form-grid workspace-form-grid--three">
          <AssetField accept="image/*" currentLabel="Image 1" inputName="image1" label="Image 1" previewAlt="Article image 1 preview" />
          <AssetField accept="image/*" currentLabel="Image 2" inputName="image2" label="Image 2" previewAlt="Article image 2 preview" />
          <AssetField accept="image/*" currentLabel="Image 3" inputName="image3" label="Image 3" previewAlt="Article image 3 preview" />
        </div>
        <SubmitButton pendingLabel="Creating article...">Create article</SubmitButton>
      </form>
    </section>
  );
}

function ArticleEditorCard({
  article,
  onDeleted,
  onUpdated,
}: {
  article: Article;
  onDeleted: (articleId: number) => void;
  onUpdated: (article: Article) => void;
}) {
  const [updateState, updateAction, isUpdating] = useActionState(updateArticleAction, initialWorkspaceActionState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteArticleAction, initialWorkspaceActionState);
  const isPending = isUpdating || isDeleting;

  useWorkspaceActionFeedback(updateState, {
    onSuccess: (nextState) => {
      if (nextState.mutation?.entity === "article" && nextState.mutation.operation === "update") {
        onUpdated(nextState.mutation.item);
      }
    },
  });
  useWorkspaceActionFeedback(deleteState, {
    onSuccess: (nextState) => {
      if (nextState.mutation?.entity === "article" && nextState.mutation.operation === "delete") {
        onDeleted(nextState.mutation.itemId);
      }
    },
  });

  return (
    <article aria-busy={isPending} className={`card card-stack workspace-item${isPending ? " workspace-item--pending" : ""}`}>
      <div className="workspace-item__header">
        <div>
          <p className="label">ARTICLE #{article.id}</p>
          <h2 className="headline project-card__title">{article.title}</h2>
        </div>
        <Link href="/blog">Open public feed</Link>
      </div>

      {isPending ? <p className="workspace-row-status">{isDeleting ? "Deleting article..." : "Saving article..."}</p> : null}

      {article.images[0] ? (
        <div className="media-frame workspace-item__media">
          <Image alt={article.title} fill sizes="(max-width: 768px) 100vw, 50vw" src={article.images[0]} />
        </div>
      ) : null}

      <InlineActionMessage state={updateState} />
      <form action={updateAction} className="workspace-form workspace-form--wide">
        <input name="id" type="hidden" value={article.id} />
        <input name="currentImage1" type="hidden" value={article.images[0] ?? ""} />
        <input name="currentImage2" type="hidden" value={article.images[1] ?? ""} />
        <input name="currentImage3" type="hidden" value={article.images[2] ?? ""} />
        <div className="workspace-form-grid workspace-form-grid--three">
          <label>
            <span className="label">Title</span>
            <input aria-invalid={Boolean(updateState.fieldErrors.title)} defaultValue={article.title} name="title" required type="text" />
            <FieldError error={updateState.fieldErrors.title} />
          </label>
          <label>
            <span className="label">Start Date</span>
            <input aria-invalid={Boolean(updateState.fieldErrors.startDate)} defaultValue={article.startDate} name="startDate" required type="date" />
            <FieldError error={updateState.fieldErrors.startDate} />
          </label>
          <label>
            <span className="label">End Date</span>
            <input aria-invalid={Boolean(updateState.fieldErrors.endDate)} defaultValue={article.endDate ?? ""} name="endDate" type="date" />
            <FieldError error={updateState.fieldErrors.endDate} />
          </label>
        </div>
        <label>
          <span className="label">Description</span>
          <textarea defaultValue={article.description.join("\n\n")} name="description" rows={6} />
        </label>
        <div className="workspace-form-grid workspace-form-grid--three">
          <AssetField
            accept="image/*"
            currentLabel="Current image 1"
            currentUrl={article.images[0]}
            inputName="image1"
            label="Replace Image 1"
            previewAlt={`${article.title} image 1`}
            removeName="removeImage1"
          />
          <AssetField
            accept="image/*"
            currentLabel="Current image 2"
            currentUrl={article.images[1]}
            inputName="image2"
            label="Replace Image 2"
            previewAlt={`${article.title} image 2`}
            removeName="removeImage2"
          />
          <AssetField
            accept="image/*"
            currentLabel="Current image 3"
            currentUrl={article.images[2]}
            inputName="image3"
            label="Replace Image 3"
            previewAlt={`${article.title} image 3`}
            removeName="removeImage3"
          />
        </div>
        <div className="workspace-form-actions">
          <SubmitButton pendingLabel="Saving article...">Save changes</SubmitButton>
        </div>
      </form>

      <InlineActionMessage state={deleteState} />
      <form action={deleteAction} className="workspace-inline-form">
        <input name="id" type="hidden" value={article.id} />
        <input name="currentImage1" type="hidden" value={article.images[0] ?? ""} />
        <input name="currentImage2" type="hidden" value={article.images[1] ?? ""} />
        <input name="currentImage3" type="hidden" value={article.images[2] ?? ""} />
        <ConfirmDeleteButton message={`Delete article ${article.title}? This cannot be undone.`} />
      </form>
    </article>
  );
}

export function WorkspaceBlogManager({ articles }: BlogManagerProps) {
  const [items, applyArticleMutation] = useOptimistic(
    articles,
    (current, mutation: { article?: Article; articleId?: number; operation: "create" | "delete" | "update" }) => {
      if (mutation.operation === "create" && mutation.article) {
        return [mutation.article, ...current.filter((item) => item.id !== mutation.article?.id)];
      }

      if (mutation.operation === "update" && mutation.article) {
        return current.map((item) => (item.id === mutation.article?.id ? mutation.article : item));
      }

      if (mutation.operation === "delete" && mutation.articleId) {
        return current.filter((item) => item.id !== mutation.articleId);
      }

      return current;
    },
  );

  return (
    <>
      <CreateArticleForm
        onCreated={(article) => {
          applyArticleMutation({ article, operation: "create" });
        }}
      />
      <div className="workspace-list">
        {items.map((article) => (
          <ArticleEditorCard
            article={article}
            key={getArticleRenderKey(article)}
            onDeleted={(articleId) => {
              applyArticleMutation({ articleId, operation: "delete" });
            }}
            onUpdated={(nextArticle) => {
              applyArticleMutation({ article: nextArticle, operation: "update" });
            }}
          />
        ))}
      </div>
    </>
  );
}
