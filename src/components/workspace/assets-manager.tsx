"use client";

import Link from "next/link";
import { useActionState, useOptimistic, useRef } from "react";

import { initialWorkspaceActionState } from "../../app/workspace/action-types";
import { uploadCvAction } from "../../app/workspace/actions";
import {
  AssetField,
  FieldError,
  InlineActionMessage,
  SubmitButton,
  useWorkspaceActionFeedback,
} from "./shared";

export function WorkspaceAssetsManager({ cvUrl }: { cvUrl?: string }) {
  const [state, formAction, isPending] = useActionState(uploadCvAction, initialWorkspaceActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const [currentCvUrl, applyCvUrl] = useOptimistic(cvUrl, (_current, nextUrl: string | undefined) => nextUrl);

  useWorkspaceActionFeedback(state, {
    onSuccess: (nextState) => {
      if (nextState.mutation?.entity === "cv") {
        applyCvUrl(nextState.mutation.cvUrl ?? undefined);
      }

      formRef.current?.reset();
    },
  });

  return (
    <section className={`card card-stack workspace-section${isPending ? " workspace-section--pending" : ""}`}>
      <p className="label label-teal">CV UPLOAD</p>
      {isPending ? <p className="workspace-row-status">Updating CV asset...</p> : null}
      <p className="text-secondary">
        Uploading here overwrites the public file path used by the CV page. You can also remove the current CV
        without leaving the page.
      </p>
      {currentCvUrl ? (
        <Link href={currentCvUrl} rel="noreferrer" target="_blank">
          Current CV URL
        </Link>
      ) : (
        <p className="mono label">No CV URL resolved yet.</p>
      )}
      <InlineActionMessage state={state} />
      <form action={formAction} className="workspace-form workspace-form--wide" ref={formRef}>
        <AssetField
          accept="application/pdf"
          currentLabel="Current CV"
          currentUrl={currentCvUrl}
          inputName="cvFile"
          label="CV file"
          previewAlt="Current CV"
          removeName="removeCurrentCv"
          type="file"
        />
        <FieldError error={state.fieldErrors.cvFile} />
        <SubmitButton pendingLabel="Updating CV...">Update CV</SubmitButton>
      </form>
    </section>
  );
}
