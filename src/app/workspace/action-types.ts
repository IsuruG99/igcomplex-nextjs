import type { Article, GachaGame, Project } from "../../lib/site-content";

export type WorkspaceFieldErrors = Record<string, string>;

export type WorkspaceMutation =
  | {
      entity: "project";
      item: Project;
      operation: "create" | "update";
    }
  | {
      entity: "project";
      itemId: number;
      operation: "delete";
    }
  | {
      entity: "article";
      item: Article;
      operation: "create" | "update";
    }
  | {
      entity: "article";
      itemId: number;
      operation: "delete";
    }
  | {
      entity: "gacha";
      item: GachaGame;
      operation: "create" | "update";
    }
  | {
      entity: "gacha";
      itemId: number;
      operation: "delete";
    }
  | {
      cvUrl: string | null;
      entity: "cv";
      operation: "update";
    };

export type WorkspaceActionState = {
  status: "idle" | "success" | "error" | "validation";
  message: string | null;
  fieldErrors: WorkspaceFieldErrors;
  mutation: WorkspaceMutation | null;
  refreshToken: string | null;
};

export const initialWorkspaceActionState: WorkspaceActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  mutation: null,
  refreshToken: null,
};
