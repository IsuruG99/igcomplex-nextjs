"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { type LoginFormState, loginAction } from "../app/login/actions";

type LoginFormProps = {
  authConfigured: boolean;
  initialMessage?: string;
  nextPath: string;
};

const initialState: LoginFormState = {};

function SubmitButton({ authConfigured }: Pick<LoginFormProps, "authConfigured">) {
  const { pending } = useFormStatus();

  return (
    <button className="btn btn-teal btn-full" disabled={!authConfigured || pending} type="submit">
      {pending ? "Authenticating..." : "Authenticate ->"}
    </button>
  );
}

export function LoginForm({ authConfigured, initialMessage, nextPath }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState);
  const message = state.error ?? initialMessage;

  return (
    <form action={formAction} className="card-stack" noValidate>
      <input name="next" type="hidden" value={nextPath} />
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          autoComplete="username"
          defaultValue="tet"
          disabled={!authConfigured}
          id="username"
          name="username"
          placeholder="tet"
          type="text"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          autoComplete="current-password"
          defaultValue=""
          disabled={!authConfigured}
          id="password"
          name="password"
          placeholder="Your owner password"
          type="password"
        />
      </div>
      {message ? <p className="login-card__error">{message}</p> : null}
      <SubmitButton authConfigured={authConfigured} />
    </form>
  );
}