"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import type { WorkspaceActionState } from "../../app/workspace/action-types";

type AssetFieldProps = {
  accept: string;
  currentLabel: string;
  currentUrl?: string;
  inputName: string;
  label: string;
  previewAlt: string;
  removeName?: string;
  type?: "image" | "file";
};

type ActionFeedbackOptions = {
  onSuccess?: (state: WorkspaceActionState) => void;
};

export function useWorkspaceActionFeedback(state: WorkspaceActionState, options?: ActionFeedbackOptions) {
  const lastRefreshToken = useRef<string | null>(null);
  const onSuccessRef = useRef<ActionFeedbackOptions["onSuccess"]>(options?.onSuccess);

  useEffect(() => {
    onSuccessRef.current = options?.onSuccess;
  }, [options?.onSuccess]);

  useEffect(() => {
    if (state.status !== "success" || !state.refreshToken || state.refreshToken === lastRefreshToken.current) {
      return;
    }

    lastRefreshToken.current = state.refreshToken;
    onSuccessRef.current?.(state);
  }, [state]);
}

export function InlineActionMessage({ state }: { state: WorkspaceActionState }) {
  if (!state.message) {
    return null;
  }

  const className =
    state.status === "success"
      ? "workspace-message workspace-message--success"
      : "workspace-message workspace-message--error";

  return <p className={className}>{state.message}</p>;
}

export function FieldError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }

  return <span className="workspace-field-error">{error}</span>;
}

export function SubmitButton({
  children,
  pendingLabel,
  tone = "teal",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  tone?: "teal" | "red";
}) {
  const { pending } = useFormStatus();

  return (
    <button className={`btn ${tone === "red" ? "btn-red" : "btn-teal"}`} disabled={pending} type="submit">
      {pending ? pendingLabel : children}
    </button>
  );
}

export function ConfirmDeleteButton({ message }: { message: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="btn btn-red"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}

export function AssetField({
  accept,
  currentLabel,
  currentUrl,
  inputName,
  label,
  previewAlt,
  removeName,
  type = "image",
}: AssetFieldProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const previewUrl = useMemo(() => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      return null;
    }

    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="workspace-asset-field">
      <label>
        <span className="label">{label}</span>
        <input
          accept={accept}
          name={inputName}
          onChange={(event) => setSelectedFile(event.currentTarget.files?.[0] ?? null)}
          type="file"
        />
      </label>
      {selectedFile ? <p className="workspace-asset-note">Selected: {selectedFile.name}</p> : null}
      {previewUrl ? (
        <div className="media-frame workspace-asset-preview">
          <Image alt={previewAlt} fill sizes="(max-width: 768px) 100vw, 33vw" src={previewUrl} unoptimized />
        </div>
      ) : currentUrl ? (
        type === "image" ? (
          <div className="media-frame workspace-asset-preview">
            <Image alt={previewAlt} fill sizes="(max-width: 768px) 100vw, 33vw" src={currentUrl} />
          </div>
        ) : (
          <a className="workspace-asset-link" href={currentUrl} rel="noreferrer" target="_blank">
            {currentLabel}
          </a>
        )
      ) : (
        <p className="mono label">No current asset</p>
      )}
      {removeName && currentUrl ? (
        <label className="workspace-checkbox workspace-checkbox--compact">
          <input name={removeName} type="checkbox" />
          <span>Remove current asset</span>
        </label>
      ) : null}
    </div>
  );
}
