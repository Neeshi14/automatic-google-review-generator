import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

export default function DashboardPage({ businessId }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDashboard(businessId)
      .then(setDashboard)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [businessId]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8">
      <a className="text-sm font-semibold text-pine" href="/">Back to generator</a>
      <section className="mt-4 rounded-md bg-white p-5 shadow-soft md:p-7">
        {loading && <LoadingSpinner label="Loading dashboard" />}
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
        {dashboard && (
          <div className="grid gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold">{dashboard.business_name}</h1>
                <p className="mt-1 text-sm text-slate-600">Review page: /review/{dashboard.business_slug}</p>
              </div>
              <a className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" href={dashboard.qr_code_url} download>
                <Download size={17} /> Download QR
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Total scans" value={dashboard.total_sessions} />
              <Metric label="Generated sessions" value={dashboard.total_generated_sessions} />
              <Metric label="Top experience" value={dashboard.most_selected_experience || "No data"} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Recent selected reviews</h2>
              <div className="mt-3 grid gap-3">
                {dashboard.recent_selected_reviews.length === 0 && <p className="text-sm text-slate-600">No selected reviews yet.</p>}
                {dashboard.recent_selected_reviews.map((review, index) => (
                  <p key={`${review}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">{review}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
