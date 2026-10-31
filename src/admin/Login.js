import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, ShoppingBag, Banknote, Truck, CheckCircle2 } from "lucide-react";
import { supabase } from "./backend";

const POINTS = [
  { icon: ShoppingBag, text: "Every order in one place, from checkout to doorstep" },
  { icon: Banknote, text: "M-Pesa and card payments confirmed automatically" },
  { icon: Truck, text: "Customers told by email and SMS when their order ships" },
];

const friendly = (message = "") =>
  message === "Invalid login credentials"
    ? "That email and password don't match."
    : /rate limit/i.test(message)
      ? "Too many attempts. Wait a minute and try again."
      : message || "Something went wrong. Please try again.";

const Field = ({ icon: Icon, label, children }) => (
  <label className="a-lf">
    <span className="a-lf-label">{label}</span>
    <span className="a-lf-box">
      <Icon size={17} className="a-lf-icon" />
      {children}
    </span>
  </label>
);

// Sign-in for the dashboard. Accounts are created in Supabase (see BACKEND.md);
// signing in only opens the dashboard for emails listed in the admins table.
// mode: "signin" | "forgot" | "sent" | "recovery" (arrived from a reset-password email)
const Login = ({ denied, recovery, onRecovered }) => {
  const [mode, setMode] = useState(recovery ? "recovery" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(friendly(e.message));
    }
    setBusy(false);
  };

  const signIn = (e) => {
    e.preventDefault();
    run(async () => {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) throw err;
    });
  };

  const sendReset = (e) => {
    e.preventDefault();
    run(async () => {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin`,
      });
      if (err) throw err;
      setMode("sent");
    });
  };

  const setNewPassword = (e) => {
    e.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    run(async () => {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      onRecovered?.();
    });
  };

  const switchTo = (next) => {
    setMode(next);
    setError("");
    setPassword("");
  };

  return (
    <div className="a-auth">
      <aside className="a-auth-brand">
        <div className="a-auth-lockup">
          <span className="a-auth-mark">NL</span>
          <span className="a-auth-name">Nula Leer</span>
        </div>
        <div className="a-auth-copy">
          <h2>Your workshop, in one place.</h2>
          <ul className="a-auth-points">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <span><Icon size={16} /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="a-auth-foot">Handmade leather goods · Nairobi, Kenya</p>
      </aside>

      <main className="a-auth-main">
        <div className="a-auth-card">
          {mode === "sent" ? (
            <div className="a-auth-done">
              <span className="a-auth-done-icon"><CheckCircle2 size={26} /></span>
              <h1>Check your email</h1>
              <p className="a-auth-sub">
                If <b>{email}</b> has a dashboard account, a link to set a new password is on its way. It can take a minute.
              </p>
              <button type="button" className="a-auth-back" onClick={() => switchTo("signin")}>
                <ArrowLeft size={15} /> Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={mode === "signin" ? signIn : mode === "forgot" ? sendReset : setNewPassword} noValidate={false}>
              <h1>{mode === "signin" ? "Welcome back" : mode === "forgot" ? "Reset your password" : "Choose a new password"}</h1>
              <p className="a-auth-sub">
                {mode === "signin"
                  ? "Sign in to manage orders, products and customers."
                  : mode === "forgot"
                    ? "Enter your email and we'll send you a link to set a new password."
                    : "You're signed in from the reset link. Set a new password to continue."}
              </p>

              {denied && mode === "signin" && (
                <p className="a-auth-error" role="alert">
                  This account isn't allowed into the dashboard.{" "}
                  <button type="button" onClick={() => supabase.auth.signOut()}>Sign out</button>
                </p>
              )}
              {error && <p className="a-auth-error" role="alert">{error}</p>}

              {mode !== "recovery" && (
                <Field icon={Mail} label="Email">
                  <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                </Field>
              )}

              {mode !== "forgot" && (
                <Field icon={Lock} label={mode === "recovery" ? "New password" : "Password"}>
                  <input
                    type={show ? "text" : "password"}
                    autoComplete={mode === "recovery" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={mode === "recovery" ? 8 : undefined}
                  />
                  <button type="button" className="a-lf-eye" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </Field>
              )}

              {mode === "signin" && (
                <button type="button" className="a-auth-link" onClick={() => switchTo("forgot")}>Forgot password?</button>
              )}

              <button className="a-auth-submit" type="submit" disabled={busy}>
                {busy
                  ? "One moment…"
                  : mode === "signin"
                    ? "Sign in"
                    : mode === "forgot"
                      ? "Send reset link"
                      : "Save password and continue"}
                {!busy && <ArrowRight size={17} />}
              </button>

              {mode === "forgot" && (
                <button type="button" className="a-auth-back" onClick={() => switchTo("signin")}>
                  <ArrowLeft size={15} /> Back to sign in
                </button>
              )}
            </form>
          )}
        </div>
        <a href="/" className="a-auth-shop">Go to the shop</a>
      </main>
    </div>
  );
};

export default Login;
