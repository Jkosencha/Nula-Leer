// The signed-in admin's profile: name, picture and password.
// With the backend: Supabase Auth (name and picture URL in user_metadata) and the
// "avatars" storage bucket (supabase/schema.sql). In preview: kept in this browser.
import { createContext, useContext } from "react";
import { BACKEND, supabase } from "./backend";

const LOCAL_KEY = "admin.profile";
const PREVIEW = { name: "Jennifer Kosencha", email: "nulaleer.ke@gmail.com", role: "Owner", avatar: null, preview: true };

const readLocal = () => {
  try {
    return { ...PREVIEW, ...JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}") };
  } catch (e) {
    return PREVIEW;
  }
};
const writeLocal = (changes) => {
  const next = { ...readLocal(), ...changes };
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ name: next.name, avatar: next.avatar }));
  } catch (e) {
    throw new Error("This browser couldn't save the change.");
  }
  return next;
};

const fromUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.user_metadata?.full_name || user.email.split("@")[0],
  avatar: user.user_metadata?.avatar_url || null,
  role: "Owner",
  preview: false,
});

export const loadProfile = async () => {
  if (!BACKEND) return readLocal();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error || new Error("Not signed in");
  return fromUser(data.user);
};

export const saveName = async (name) => {
  const clean = name.trim().slice(0, 80);
  if (!clean) throw new Error("Please enter your name.");
  if (!BACKEND) return writeLocal({ name: clean });
  const { data, error } = await supabase.auth.updateUser({ data: { full_name: clean } });
  if (error) throw error;
  return fromUser(data.user);
};

// Crops to a centred square and shrinks to 320px, so uploads stay small (~30 KB).
const squareJpeg = (file) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Please choose an image file."));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 320;
      canvas
        .getContext("2d")
        .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 320, 320);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't read that image."))), "image/jpeg", 0.86);
    };
    img.onerror = () => reject(new Error("Couldn't read that image."));
    img.src = url;
  });

const blobToDataUrl = (blob) =>
  new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(blob);
  });

export const savePhoto = async (file, profile) => {
  const blob = await squareJpeg(file);
  if (!BACKEND) return writeLocal({ avatar: await blobToDataUrl(blob) });
  const path = `${profile.id}/avatar-${Date.now()}.jpg`;
  const { error: upErr } = await supabase.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (upErr) throw upErr;
  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
  const { data, error } = await supabase.auth.updateUser({ data: { avatar_url: pub.publicUrl } });
  if (error) throw error;
  return fromUser(data.user);
};

export const removePhoto = async () => {
  if (!BACKEND) return writeLocal({ avatar: null });
  const { data, error } = await supabase.auth.updateUser({ data: { avatar_url: null } });
  if (error) throw error;
  return fromUser(data.user);
};

// Checks the current password first, so an unattended open laptop can't be used to change it.
export const changePassword = async (email, current, next) => {
  if (!BACKEND) throw new Error("Passwords come with the real sign-in, once the backend is connected.");
  if (next.length < 8) throw new Error("Use at least 8 characters for the new password.");
  const { error: checkErr } = await supabase.auth.signInWithPassword({ email, password: current });
  if (checkErr) throw new Error("Your current password isn't right.");
  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) throw error;
};

export const signOut = () => (BACKEND ? supabase.auth.signOut() : Promise.resolve());

// Shared with every screen that shows the admin's name or picture.
export const ProfileContext = createContext({ profile: null, setProfile: () => {} });
export const useProfile = () => useContext(ProfileContext);

export const firstName = (profile) => (profile?.name || "").split(" ")[0] || "there";
