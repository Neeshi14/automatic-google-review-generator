import { useEffect, useState } from "react";
import { api } from "../api.js";
import LoadingSpinner from "./LoadingSpinner.jsx";
import ReviewGenerator from "./ReviewGenerator.jsx";
import Toast from "./Toast.jsx";

function createClientSessionId(slug) {
  const key = `review_qr_client_session_${slug}`;
  const randomId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    sessionStorage.setItem(key, randomId);
  } catch (_err) {
    return randomId;
  }

  return randomId;
}

export default function ReviewPage({ slug }) {
  const [business, setBusiness] = useState(null);
  const [sessionToken, setSessionToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  }

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setLoading(true);
      setError("");
      try {
        const foundBusiness = await api.getBusiness(slug);
        if (cancelled) return;
        const session = await api.createSession(foundBusiness.business_id, createClientSessionId(slug));
        if (cancelled) return;
        setBusiness(foundBusiness);
        setSessionToken(session.session_token);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-6">
      <section className="mb-6 rounded-md bg-white p-5 shadow-soft">
        {loading && <LoadingSpinner label="Starting review session" />}
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
        {business && (
          <>
            <p className="text-sm font-semibold uppercase tracking-wide text-pine">{business.business_category}</p>
            <h1 className="mt-1 text-3xl font-bold">{business.business_name}</h1>
            <p className="mt-3 text-slate-700">Choose what honestly matches your visit, then pick or edit a review before posting it yourself on Google.</p>
          </>
        )}
      </section>
      {business && sessionToken && <ReviewGenerator business={business} sessionToken={sessionToken} onToast={showToast} />}
      <Toast message={toast} />
    </main>
  );
}
