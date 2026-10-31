import React, { useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "./backend";

// Sign-in for the dashboard. Accounts are created in Supabase (see BACKEND.md);
// signing in only opens the dashboard for emails listed in the admins table.
const Login = ({ denied }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) setError(err.message === "Invalid login credentials" ? "That email and password don't match." : err.message);
    setBusy(false);
  };

  return (
    <div className="a-login">
      <form className="a-login-card" onSubmit={submit}>
        <p className="a-login-brand">Nula Leer</p>
        <h1>Sign in</h1>
        <p className="a-muted">The dashboard is for the Nula Leer team.</p>

        {denied && (
          <p className="a-login-error" role="alert">
            This account isn't allowed into the dashboard.{" "}
            <button type="button" className="a-link" onClick={() => supabase.auth.signOut()}>Sign out</button>
          </p>
        )}
        {error && <p className="a-login-error" role="alert">{error}</p>}

        <label className="a-field">
          <span>Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="a-field">
          <span>Password</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="a-btn" type="submit" disabled={busy}>
          <Lock size={16} /> {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default Login;
