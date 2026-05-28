"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useOptimistic, useRef } from "react";

import { initialWorkspaceActionState } from "../../app/workspace/action-types";
import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "../../app/workspace/actions";
import type { Project } from "../../lib/site-content";
import {
  AssetField,
  ConfirmDeleteButton,
  FieldError,
  InlineActionMessage,
  SubmitButton,
  useWorkspaceActionFeedback,
} from "./shared";

type ProjectsManagerProps = {
  projects: Project[];
};

function getProjectRenderKey(project: Project) {
  return `${project.id}:${JSON.stringify(project)}`;
}

function CreateProjectForm({ onCreated }: { onCreated: (project: Project) => void }) {
  const [state, formAction, isPending] = useActionState(createProjectAction, initialWorkspaceActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useWorkspaceActionFeedback(state, {
    onSuccess: (nextState) => {
      if (nextState.mutation?.entity === "project" && nextState.mutation.operation === "create") {
        onCreated(nextState.mutation.item);
      }

      formRef.current?.reset();
    },
  });

  return (
    <section className={`card card-stack workspace-section${isPending ? " workspace-section--pending" : ""}`}>
      <p className="label label-teal">CREATE PROJECT</p>
      {isPending ? <p className="workspace-row-status">Creating project...</p> : null}
      <InlineActionMessage state={state} />
      <form action={formAction} className="workspace-form workspace-form--wide" ref={formRef}>
        <div className="workspace-form-grid">
          <label>
            <span className="label">Title</span>
            <input aria-invalid={Boolean(state.fieldErrors.title)} name="title" required type="text" />
            <FieldError error={state.fieldErrors.title} />
          </label>
          <label>
            <span className="label">Year</span>
            <input aria-invalid={Boolean(state.fieldErrors.year)} min="2000" name="year" required type="number" />
            <FieldError error={state.fieldErrors.year} />
          </label>
          <label>
            <span className="label">Role</span>
            <input name="role" type="text" />
          </label>
          <label>
            <span className="label">Status</span>
            <input name="status" type="text" />
          </label>
        </div>
        <label>
          <span className="label">Brief</span>
          <textarea aria-invalid={Boolean(state.fieldErrors.brief)} name="brief" required rows={2} />
          <FieldError error={state.fieldErrors.brief} />
        </label>
        <label>
          <span className="label">Description</span>
          <textarea name="desc" rows={5} />
        </label>
        <div className="workspace-form-grid">
          <label>
            <span className="label">Tech Stack (comma separated)</span>
            <textarea aria-invalid={Boolean(state.fieldErrors.techStack)} name="techStack" required rows={3} />
            <FieldError error={state.fieldErrors.techStack} />
          </label>
          <label>
            <span className="label">Github URL</span>
            <input aria-invalid={Boolean(state.fieldErrors.github)} name="github" type="url" />
            <FieldError error={state.fieldErrors.github} />
          </label>
        </div>
        <div className="workspace-form-grid">
          <label>
            <span className="label">Features (one per line)</span>
            <textarea name="features" rows={4} />
          </label>
          <label>
            <span className="label">Challenges (one per line)</span>
            <textarea name="challenges" rows={4} />
          </label>
        </div>
        <label>
          <span className="label">Lessons</span>
          <textarea name="lessons" rows={4} />
        </label>
        <div className="workspace-form-grid workspace-form-grid--three">
          <AssetField
            accept="image/*"
            currentLabel="Screenshot 1"
            inputName="screenshot1"
            label="Screenshot 1"
            previewAlt="Screenshot 1 preview"
          />
          <AssetField
            accept="image/*"
            currentLabel="Screenshot 2"
            inputName="screenshot2"
            label="Screenshot 2"
            previewAlt="Screenshot 2 preview"
          />
          <AssetField
            accept="image/*"
            currentLabel="Screenshot 3"
            inputName="screenshot3"
            label="Screenshot 3"
            previewAlt="Screenshot 3 preview"
          />
        </div>
        <SubmitButton pendingLabel="Creating project...">Create project</SubmitButton>
      </form>
    </section>
  );
}

function ProjectEditorCard({
  onDeleted,
  onUpdated,
  project,
}: {
  onDeleted: (projectId: number) => void;
  onUpdated: (project: Project) => void;
  project: Project;
}) {
  const [updateState, updateAction, isUpdating] = useActionState(updateProjectAction, initialWorkspaceActionState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteProjectAction, initialWorkspaceActionState);
  const isPending = isUpdating || isDeleting;

  useWorkspaceActionFeedback(updateState, {
    onSuccess: (nextState) => {
      if (nextState.mutation?.entity === "project" && nextState.mutation.operation === "update") {
        onUpdated(nextState.mutation.item);
      }
    },
  });
  useWorkspaceActionFeedback(deleteState, {
    onSuccess: (nextState) => {
      if (nextState.mutation?.entity === "project" && nextState.mutation.operation === "delete") {
        onDeleted(nextState.mutation.itemId);
      }
    },
  });

  return (
    <article aria-busy={isPending} className={`card card-stack workspace-item${isPending ? " workspace-item--pending" : ""}`}>
      <div className="workspace-item__header">
        <div>
          <p className="label">PROJECT #{project.id}</p>
          <h2 className="headline project-card__title">{project.title}</h2>
        </div>
        <Link href={`/projects/${project.id}`}>Open public page</Link>
      </div>

      {isPending ? <p className="workspace-row-status">{isDeleting ? "Deleting project..." : "Saving project..."}</p> : null}

      {project.screenshots[0] ? (
        <div className="media-frame workspace-item__media">
          <Image alt={project.title} fill sizes="(max-width: 768px) 100vw, 50vw" src={project.screenshots[0]} />
        </div>
      ) : null}

      <InlineActionMessage state={updateState} />
      <form action={updateAction} className="workspace-form workspace-form--wide">
        <input name="id" type="hidden" value={project.id} />
        <input name="currentScreenshot1" type="hidden" value={project.screenshots[0] ?? ""} />
        <input name="currentScreenshot2" type="hidden" value={project.screenshots[1] ?? ""} />
        <input name="currentScreenshot3" type="hidden" value={project.screenshots[2] ?? ""} />
        <div className="workspace-form-grid">
          <label>
            <span className="label">Title</span>
            <input aria-invalid={Boolean(updateState.fieldErrors.title)} defaultValue={project.title} name="title" required type="text" />
            <FieldError error={updateState.fieldErrors.title} />
          </label>
          <label>
            <span className="label">Year</span>
            <input aria-invalid={Boolean(updateState.fieldErrors.year)} defaultValue={project.year} name="year" required type="number" />
            <FieldError error={updateState.fieldErrors.year} />
          </label>
          <label>
            <span className="label">Role</span>
            <input defaultValue={project.role ?? ""} name="role" type="text" />
          </label>
          <label>
            <span className="label">Status</span>
            <input defaultValue={project.status ?? ""} name="status" type="text" />
          </label>
        </div>
        <label>
          <span className="label">Brief</span>
          <textarea aria-invalid={Boolean(updateState.fieldErrors.brief)} defaultValue={project.brief} name="brief" required rows={2} />
          <FieldError error={updateState.fieldErrors.brief} />
        </label>
        <label>
          <span className="label">Description</span>
          <textarea defaultValue={project.desc} name="desc" rows={5} />
        </label>
        <div className="workspace-form-grid">
          <label>
            <span className="label">Tech Stack (comma separated)</span>
            <textarea aria-invalid={Boolean(updateState.fieldErrors.techStack)} defaultValue={project.techStack.join(", ")} name="techStack" required rows={3} />
            <FieldError error={updateState.fieldErrors.techStack} />
          </label>
          <label>
            <span className="label">Github URL</span>
            <input aria-invalid={Boolean(updateState.fieldErrors.github)} defaultValue={project.github ?? ""} name="github" type="url" />
            <FieldError error={updateState.fieldErrors.github} />
          </label>
        </div>
        <div className="workspace-form-grid">
          <label>
            <span className="label">Features (one per line)</span>
            <textarea defaultValue={project.features.join("\n")} name="features" rows={4} />
          </label>
          <label>
            <span className="label">Challenges (one per line)</span>
            <textarea defaultValue={project.challenges.join("\n")} name="challenges" rows={4} />
          </label>
        </div>
        <label>
          <span className="label">Lessons</span>
          <textarea defaultValue={project.lessons ?? ""} name="lessons" rows={4} />
        </label>
        <div className="workspace-form-grid workspace-form-grid--three">
          <AssetField
            accept="image/*"
            currentLabel="Current screenshot 1"
            currentUrl={project.screenshots[0]}
            inputName="screenshot1"
            label="Replace Screenshot 1"
            previewAlt={`${project.title} screenshot 1`}
            removeName="removeScreenshot1"
          />
          <AssetField
            accept="image/*"
            currentLabel="Current screenshot 2"
            currentUrl={project.screenshots[1]}
            inputName="screenshot2"
            label="Replace Screenshot 2"
            previewAlt={`${project.title} screenshot 2`}
            removeName="removeScreenshot2"
          />
          <AssetField
            accept="image/*"
            currentLabel="Current screenshot 3"
            currentUrl={project.screenshots[2]}
            inputName="screenshot3"
            label="Replace Screenshot 3"
            previewAlt={`${project.title} screenshot 3`}
            removeName="removeScreenshot3"
          />
        </div>
        <div className="workspace-form-actions">
          <SubmitButton pendingLabel="Saving project...">Save changes</SubmitButton>
        </div>
      </form>

      <InlineActionMessage state={deleteState} />
      <form action={deleteAction} className="workspace-inline-form">
        <input name="id" type="hidden" value={project.id} />
        <input name="currentScreenshot1" type="hidden" value={project.screenshots[0] ?? ""} />
        <input name="currentScreenshot2" type="hidden" value={project.screenshots[1] ?? ""} />
        <input name="currentScreenshot3" type="hidden" value={project.screenshots[2] ?? ""} />
        <ConfirmDeleteButton message={`Delete ${project.title}? This cannot be undone.`} />
      </form>
    </article>
  );
}

export function WorkspaceProjectsManager({ projects }: ProjectsManagerProps) {
  const [items, applyProjectMutation] = useOptimistic(
    projects,
    (current, mutation: { operation: "create" | "delete" | "update"; project?: Project; projectId?: number }) => {
      if (mutation.operation === "create" && mutation.project) {
        return [mutation.project, ...current.filter((item) => item.id !== mutation.project?.id)];
      }

      if (mutation.operation === "update" && mutation.project) {
        return current.map((item) => (item.id === mutation.project?.id ? mutation.project : item));
      }

      if (mutation.operation === "delete" && mutation.projectId) {
        return current.filter((item) => item.id !== mutation.projectId);
      }

      return current;
    },
  );

  return (
    <>
      <CreateProjectForm
        onCreated={(project) => {
          applyProjectMutation({ operation: "create", project });
        }}
      />
      <div className="workspace-list">
        {items.map((project) => (
          <ProjectEditorCard
            key={getProjectRenderKey(project)}
            onDeleted={(projectId) => {
              applyProjectMutation({ operation: "delete", projectId });
            }}
            onUpdated={(nextProject) => {
              applyProjectMutation({ operation: "update", project: nextProject });
            }}
            project={project}
          />
        ))}
      </div>
    </>
  );
}
