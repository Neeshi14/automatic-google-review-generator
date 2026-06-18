import { LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { api } from "../api.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      email: form.get("email"),
      password: form.get("password"),
    };
    if (mode === "signup") payload.name = form.get("name");

    setLoading(true);
    setError("");
    try {
      const response = mode === "signup" ? await api.signup(payload) : await api.login(payload);
      onAuth(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-8 px-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:px-8">
      <section className="grid gap-5">
        <a className="text-sm font-semibold text-pine" href="/">ReviewQR Studio</a>
        <div>
          <h1 className="max-w-xl text-4xl font-bold leading-tight md:text-5xl">Sign in to manage your QR dashboard</h1>
          <p className="mt-4 max-w-xl text-lg text-slate-700">
            Create one business QR code per account, then return anytime to download the QR and monitor scans, generated sessions, and selected reviews.
          </p>
        </div>
      </section>
      <section className="rounded-md bg-white p-5 shadow-soft md:p-7">
        <div className="grid grid-cols-2 gap-2 rounded-md bg-mist p-1">
          <button className={`focus-ring min-h-11 rounded-md text-sm font-semibold ${mode === "signup" ? "bg-white text-ink shadow-sm" : "text-slate-600"}`} onClick={() => setMode("signup")}>
            Sign up
          </button>
          <button className={`focus-ring min-h-11 rounded-md text-sm font-semibold ${mode === "login" ? "bg-white text-ink shadow-sm" : "text-slate-600"}`} onClick={() => setMode("login")}>
            Sign in
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          {mode === "signup" && (
            <label className="grid gap-2 text-sm font-semibold">
              Name
              <input className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-3 font-normal" name="name" placeholder="Business owner name" required minLength={2} />
            </label>
          )}
          <label className="grid gap-2 text-sm font-semibold">
            Email
            <input className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-3 font-normal" name="email" type="email" placeholder="owner@example.com" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Password
            <input className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-3 font-normal" name="password" type="password" placeholder="Minimum 6 characters" required minLength={6} />
          </label>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
          <button className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-pine px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70" disabled={loading}>
            {loading ? <LoadingSpinner label="Please wait" /> : mode === "signup" ? <><UserPlus size={18} /> Create account</> : <><LogIn size={18} /> Sign in</>}
          </button>
        </form>
      </section>
    </main>
  );
}
