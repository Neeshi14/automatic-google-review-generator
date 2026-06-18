import { useState } from "react";
import { QrCode } from "lucide-react";
import { api } from "../api.js";
import BusinessForm from "./BusinessForm.jsx";
import QRResult from "./QRResult.jsx";
import Toast from "./Toast.jsx";

export default function HomePage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  async function copy(text) {
    await navigator.clipboard.writeText(text);
    setToast("Copied to clipboard.");
    setTimeout(() => setToast(""), 2200);
  }

  async function handleSubmit(payload) {
    setLoading(true);
    setError("");
    try {
      setResult(await api.createBusiness(payload));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-8 px-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:px-8">
      <section className="grid gap-5">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-pine text-white">
          <QrCode />
        </div>
        <div>
          <h1 className="max-w-xl text-4xl font-bold leading-tight md:text-5xl">Generate AI-Assisted Google Review QR Codes</h1>
          <p className="mt-4 max-w-xl text-lg text-slate-700">
            Create a local QR code that opens a compliant review-writing session for real customers. Customers choose their actual experience, edit their review, then post it manually on Google.
          </p>
        </div>
      </section>
      <section className="rounded-md bg-white p-5 shadow-soft md:p-7">
        <BusinessForm onSubmit={handleSubmit} loading={loading} />
        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
        <QRResult result={result} onCopy={copy} />
      </section>
      <Toast message={toast} />
    </main>
  );
}
