"use client";

import { useActionState } from "react";
import { signIn, enroll, verify, type FormState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, {} as FormState);
  return <form action={action} className="admin-form">
    <label htmlFor="email">Email address</label>
    <input id="email" name="email" type="email" autoComplete="username" required maxLength={254} />
    <label htmlFor="password">Password</label>
    <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={1024} />
    {state.error && <p role="alert">{state.error}</p>}
    <button disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}

export function VerificationForm({ factorId }: { factorId: string }) {
  const [state, action, pending] = useActionState(verify, {} as FormState);
  return <form action={action} className="admin-form">
    <input name="factorId" type="hidden" value={factorId} />
    <label htmlFor="code">Six-digit authenticator code</label>
    <input id="code" name="code" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" required maxLength={6} />
    {state.error && <p role="alert">{state.error}</p>}
    <button disabled={pending}>{pending ? "Verifying…" : "Verify and continue"}</button>
  </form>;
}

export function EnrollmentForm() {
  const [state, action, pending] = useActionState(enroll, {} as FormState);
  return <>
    <p>Use your authenticator app to protect this administrator account.</p>
    <form action={action}>
      <button disabled={pending}>{pending ? "Preparing…" : state.factorId ? "Restart setup" : "Set up authenticator"}</button>
    </form>
    {state.error && <p role="alert">{state.error}</p>}
    {state.qr && state.secret && state.factorId && <>
      <p>Scan this code with your authenticator. Keep the setup key private.</p>
      {/* An SVG image is rendered as an image, never inserted as HTML. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="auth-qr" src={state.qr.startsWith("data:image/") ? state.qr : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(state.qr)}`} alt="Authenticator setup QR code" width={220} height={220} />
      <details><summary>Enter a setup key instead</summary><code className="auth-secret">{state.secret}</code></details>
      <VerificationForm key={state.factorId} factorId={state.factorId} />
    </>}
  </>;
}
