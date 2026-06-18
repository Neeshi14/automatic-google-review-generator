import { LogOut, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api.js";
import BusinessForm from "./BusinessForm.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

export default function SetupPage({ user, onUserChange, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getMyBusiness()
      .then(() => {
        window.location.href = "/dashboard";
      })
      .catch(() => setChecking(false));
  }, []);

  async function handleSubmit(payload) {
    setLoading(true);
    setError("");
    try {
      const result = await api.createBusiness(payload);
      onUserChange({ ...user, business_id: result.business_id });
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4">
        <LoadingSpinner label="Checking your QR setup" />
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-8 px-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:px-8">
      <section className="grid gap-5">
        <div className="flex items-center justify-between gap-4">
          <a className="text-sm font-semibold text-pine" href="/">ReviewQR Studio</a>
          <button className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold" onClick={onLogout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-pine text-white">
          <Sparkles />
        </div>
        <div>
          <h1 className="max-w-xl text-4xl font-bold leading-tight md:text-5xl">Create your one business QR code</h1>
          <p className="mt-4 max-w-xl text-lg text-slate-700">
            Hi {user.name}. Add your business details once. After the QR is created, you will go directly to the dashboard to download it and track review activity.
          </p>
        </div>
      </section>
      <section className="rounded-md bg-white p-5 shadow-soft md:p-7">
        <BusinessForm onSubmit={handleSubmit} loading={loading} />
        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
      </section>
    </main>
  );
}
