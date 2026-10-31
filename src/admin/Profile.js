import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Camera, Trash2, Lock, Eye, EyeOff, LogOut, ShieldCheck, Mail, User } from "lucide-react";
import { useProfile, saveName, savePhoto, removePhoto, changePassword, signOut } from "./account";
import { PageHead } from "./ui";

const PasswordInput = ({ label, value, onChange, autoComplete }) => {
  const [show, setShow] = useState(false);
  return (
    <label className="a-field">
      <span>{label}</span>
      <span className="a-input-icon">
        <Lock size={16} />
        <input type={show ? "text" : "password"} value={value} onChange={onChange} autoComplete={autoComplete} required />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </label>
  );
};

export const BigAvatar = ({ profile, size = 112 }) => (
  <span className="a-big-avatar" style={{ width: size, height: size }}>
    {profile?.avatar ? (
      <img src={profile.avatar} alt="" />
    ) : (
      <span>{(profile?.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span>
    )}
  </span>
);

const Profile = () => {
  const { profile, setProfile } = useProfile();
  const fileRef = useRef(null);
  const [name, setName] = useState(profile?.name || "");
  const [busy, setBusy] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  if (!profile) return <p className="a-muted">Loading…</p>;

  const act = async (key, fn, done) => {
    setBusy(key);
    try {
      const result = await fn();
      if (result) setProfile(result);
      if (done) toast.success(done);
    } catch (e) {
      toast.error(e.message || "Something went wrong.");
    }
    setBusy("");
  };

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) act("photo", () => savePhoto(file, profile), "Profile picture updated.");
  };

  const onPassword = (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) return toast.error("The new passwords don't match.");
    act("pw", async () => {
      await changePassword(profile.email, pw.current, pw.next);
      setPw({ current: "", next: "", confirm: "" });
    }, "Password changed.");
  };

  return (
    <>
      <PageHead title="Your profile" sub="How you appear in the dashboard, and how you sign in." />

      <div className="a-profile">
        <section className="a-card a-profile-id">
          <div className="a-profile-photo">
            <BigAvatar profile={profile} />
            <button className="a-photo-btn" onClick={() => fileRef.current?.click()} disabled={busy === "photo"} aria-label="Change profile picture">
              <Camera size={16} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
          </div>
          <h2>{profile.name}</h2>
          <p className="a-muted">{profile.role} · {profile.email}</p>
          <div className="a-profile-photo-actions">
            <button className="a-btn ghost small" onClick={() => fileRef.current?.click()} disabled={busy === "photo"}>
              <Camera size={15} /> {busy === "photo" ? "Uploading…" : profile.avatar ? "Change photo" : "Add a photo"}
            </button>
            {profile.avatar && (
              <button className="a-btn ghost small" onClick={() => act("photo", removePhoto, "Photo removed.")} disabled={busy === "photo"}>
                <Trash2 size={15} /> Remove
              </button>
            )}
          </div>
          <p className="a-muted small">Square photos work best. It's cropped and resized for you.</p>
        </section>

        <div className="a-stack">
          <section className="a-card">
            <h2>Details</h2>
            <form
              className="a-profile-form"
              onSubmit={(e) => {
                e.preventDefault();
                act("name", () => saveName(name), "Name saved.");
              }}
            >
              <label className="a-field">
                <span>Name</span>
                <span className="a-input-icon">
                  <User size={16} />
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                </span>
              </label>
              <label className="a-field">
                <span>Email</span>
                <span className="a-input-icon">
                  <Mail size={16} />
                  <input value={profile.email} readOnly aria-readonly="true" />
                </span>
                <small className="a-muted">Your sign-in email. To change it, ask for it to be changed in Supabase.</small>
              </label>
              <button className="a-btn" type="submit" disabled={busy === "name" || name.trim() === profile.name}>
                {busy === "name" ? "Saving…" : "Save name"}
              </button>
            </form>
          </section>

          <section className="a-card">
            <h2>Password</h2>
            {profile.preview ? (
              <p className="a-notice">
                <ShieldCheck size={16} /> In preview mode there's no password. Once the backend is connected you'll be able to change it here.
              </p>
            ) : (
              <form className="a-profile-form" onSubmit={onPassword}>
                <PasswordInput label="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
                <div className="a-row">
                  <PasswordInput label="New password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
                  <PasswordInput label="Repeat new password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
                </div>
                <p className="a-muted small">At least 8 characters. A short sentence is easier to remember than random symbols.</p>
                <button className="a-btn" type="submit" disabled={busy === "pw"}>
                  {busy === "pw" ? "Changing…" : "Change password"}
                </button>
              </form>
            )}
          </section>

          <section className="a-card a-signout-card">
            <div>
              <h2>Sign out</h2>
              <p className="a-muted small">
                {profile.preview ? "Sign-in arrives with the backend; until then there's nothing to sign out of." : "Sign out of the dashboard on this device."}
              </p>
            </div>
            <button className="a-btn danger" onClick={() => signOut()} disabled={profile.preview}>
              <LogOut size={16} /> Sign out
            </button>
          </section>
        </div>
      </div>
    </>
  );
};

export default Profile;
