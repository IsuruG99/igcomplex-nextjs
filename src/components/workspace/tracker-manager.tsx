"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useOptimistic, useRef } from "react";

import { initialWorkspaceActionState } from "../../app/workspace/action-types";
import {
  createGachaAction,
  deleteGachaAction,
  updateGachaAction,
} from "../../app/workspace/actions";
import type { GachaGame } from "../../lib/site-content";
import {
  AssetField,
  ConfirmDeleteButton,
  FieldError,
  InlineActionMessage,
  SubmitButton,
  useWorkspaceActionFeedback,
} from "./shared";

type TrackerManagerProps = {
  games: GachaGame[];
};

function getGameRenderKey(game: GachaGame) {
  return `${game.id}:${JSON.stringify(game)}`;
}

function TrackerFields({ errors, values }: { errors: Record<string, string>; values?: Partial<Record<string, string | number | boolean>> }) {
  return (
    <>
      <div className="workspace-form-grid workspace-form-grid--four">
        <label>
          <span className="label">Title</span>
          <input aria-invalid={Boolean(errors.title)} defaultValue={String(values?.title ?? "")} name="title" required type="text" />
          <FieldError error={errors.title} />
        </label>
        <label>
          <span className="label">Year</span>
          <input aria-invalid={Boolean(errors.year)} defaultValue={String(values?.year ?? "")} name="year" required type="number" />
          <FieldError error={errors.year} />
        </label>
        <label>
          <span className="label">Std Soft</span>
          <input aria-invalid={Boolean(errors.pityNumStd)} defaultValue={String(values?.pityNumStd ?? "")} name="pityNumStd" required type="number" />
          <FieldError error={errors.pityNumStd} />
        </label>
        <label>
          <span className="label">Std Hard</span>
          <input defaultValue={String(values?.pityMaxStd ?? "")} name="pityMaxStd" required type="number" />
        </label>
        <label>
          <span className="label">Lim Soft</span>
          <input aria-invalid={Boolean(errors.pityNumLim)} defaultValue={String(values?.pityNumLim ?? "")} name="pityNumLim" required type="number" />
          <FieldError error={errors.pityNumLim} />
        </label>
        <label>
          <span className="label">Lim Hard</span>
          <input defaultValue={String(values?.pityMaxLim ?? "")} name="pityMaxLim" required type="number" />
        </label>
        <label>
          <span className="label">Wep Soft</span>
          <input aria-invalid={Boolean(errors.pityNumWep)} defaultValue={String(values?.pityNumWep ?? "")} name="pityNumWep" required type="number" />
          <FieldError error={errors.pityNumWep} />
        </label>
        <label>
          <span className="label">Wep Hard</span>
          <input defaultValue={String(values?.pityMaxWep ?? "")} name="pityMaxWep" required type="number" />
        </label>
      </div>
      <div className="workspace-form-grid">
        <label className="workspace-checkbox">
          <input defaultChecked={Boolean(values?.guaranteedLimited)} name="guaranteedLimited" type="checkbox" />
          <span>Limited guaranteed</span>
        </label>
        <label className="workspace-checkbox">
          <input defaultChecked={Boolean(values?.guaranteedWeapon)} name="guaranteedWeapon" type="checkbox" />
          <span>Weapon guaranteed</span>
        </label>
      </div>
    </>
  );
}

function CreateTrackerForm({ onCreated }: { onCreated: (game: GachaGame) => void }) {
  const [state, formAction, isPending] = useActionState(createGachaAction, initialWorkspaceActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useWorkspaceActionFeedback(state, {
    onSuccess: (nextState) => {
      if (nextState.mutation?.entity === "gacha" && nextState.mutation.operation === "create") {
        onCreated(nextState.mutation.item);
      }

      formRef.current?.reset();
    },
  });

  return (
    <section className={`card card-stack workspace-section${isPending ? " workspace-section--pending" : ""}`}>
      <p className="label label-teal">CREATE TRACKER ENTRY</p>
      {isPending ? <p className="workspace-row-status">Creating tracker entry...</p> : null}
      <InlineActionMessage state={state} />
      <form action={formAction} className="workspace-form workspace-form--wide" ref={formRef}>
        <TrackerFields errors={state.fieldErrors} />
        <AssetField accept="image/*" currentLabel="Banner" inputName="banner" label="Banner" previewAlt="Tracker banner preview" />
        <SubmitButton pendingLabel="Creating tracker entry...">Create tracker entry</SubmitButton>
      </form>
    </section>
  );
}

function TrackerEditorCard({
  game,
  onDeleted,
  onUpdated,
}: {
  game: GachaGame;
  onDeleted: (gameId: number) => void;
  onUpdated: (game: GachaGame) => void;
}) {
  const [updateState, updateAction, isUpdating] = useActionState(updateGachaAction, initialWorkspaceActionState);
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteGachaAction, initialWorkspaceActionState);
  const isPending = isUpdating || isDeleting;

  useWorkspaceActionFeedback(updateState, {
    onSuccess: (nextState) => {
      if (nextState.mutation?.entity === "gacha" && nextState.mutation.operation === "update") {
        onUpdated(nextState.mutation.item);
      }
    },
  });
  useWorkspaceActionFeedback(deleteState, {
    onSuccess: (nextState) => {
      if (nextState.mutation?.entity === "gacha" && nextState.mutation.operation === "delete") {
        onDeleted(nextState.mutation.itemId);
      }
    },
  });

  return (
    <article aria-busy={isPending} className={`card card-stack workspace-item${isPending ? " workspace-item--pending" : ""}`}>
      <div className="workspace-item__header">
        <div>
          <p className="label">GAME #{game.id}</p>
          <h2 className="headline project-card__title">{game.title}</h2>
        </div>
        <Link href="/tracker">Open tracker</Link>
      </div>

      {isPending ? <p className="workspace-row-status">{isDeleting ? "Deleting tracker entry..." : "Saving tracker entry..."}</p> : null}

      {game.bannerUrl ? (
        <div className="media-frame workspace-item__media">
          <Image alt={game.title} fill sizes="(max-width: 768px) 100vw, 50vw" src={game.bannerUrl} />
        </div>
      ) : null}

      <InlineActionMessage state={updateState} />
      <form action={updateAction} className="workspace-form workspace-form--wide">
        <input name="id" type="hidden" value={game.id} />
        <input name="currentBanner" type="hidden" value={game.bannerUrl ?? ""} />
        <TrackerFields
          errors={updateState.fieldErrors}
          values={{
            guaranteedLimited: game.guaranteedLimited,
            guaranteedWeapon: game.guaranteedWeapon,
            pityMaxLim: game.pityMaxLim,
            pityMaxStd: game.pityMaxStd,
            pityMaxWep: game.pityMaxWep,
            pityNumLim: game.pityNumLim,
            pityNumStd: game.pityNumStd,
            pityNumWep: game.pityNumWep,
            title: game.title,
            year: game.year,
          }}
        />
        <AssetField
          accept="image/*"
          currentLabel="Current banner"
          currentUrl={game.bannerUrl}
          inputName="banner"
          label="Replace Banner"
          previewAlt={`${game.title} banner`}
          removeName="removeBanner"
        />
        <div className="workspace-form-actions">
          <SubmitButton pendingLabel="Saving tracker entry...">Save changes</SubmitButton>
        </div>
      </form>

      <InlineActionMessage state={deleteState} />
      <form action={deleteAction} className="workspace-inline-form">
        <input name="id" type="hidden" value={game.id} />
        <input name="currentBanner" type="hidden" value={game.bannerUrl ?? ""} />
        <ConfirmDeleteButton message={`Delete tracker entry ${game.title}? This cannot be undone.`} />
      </form>
    </article>
  );
}

export function WorkspaceTrackerManager({ games }: TrackerManagerProps) {
  const [items, applyGameMutation] = useOptimistic(
    games,
    (current, mutation: { game?: GachaGame; gameId?: number; operation: "create" | "delete" | "update" }) => {
      if (mutation.operation === "create" && mutation.game) {
        return [mutation.game, ...current.filter((item) => item.id !== mutation.game?.id)];
      }

      if (mutation.operation === "update" && mutation.game) {
        return current.map((item) => (item.id === mutation.game?.id ? mutation.game : item));
      }

      if (mutation.operation === "delete" && mutation.gameId) {
        return current.filter((item) => item.id !== mutation.gameId);
      }

      return current;
    },
  );

  return (
    <>
      <CreateTrackerForm
        onCreated={(game) => {
          applyGameMutation({ game, operation: "create" });
        }}
      />
      <div className="workspace-list">
        {items.map((game) => (
          <TrackerEditorCard
            game={game}
            key={getGameRenderKey(game)}
            onDeleted={(gameId) => {
              applyGameMutation({ gameId, operation: "delete" });
            }}
            onUpdated={(nextGame) => {
              applyGameMutation({ game: nextGame, operation: "update" });
            }}
          />
        ))}
      </div>
    </>
  );
}
