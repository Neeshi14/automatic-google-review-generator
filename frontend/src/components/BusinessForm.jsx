import { Sparkles } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner.jsx";

const tones = ["friendly", "professional", "short", "detailed", "emotional"];

export default function BusinessForm({ onSubmit, loading }) {
  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      business_name: form.get("business_name"),
      google_review_url: form.get("google_review_url"),
      business_category: form.get("business_category"),
      tone_preference: form.get("tone_preference"),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold">
        Business name
        <input className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-3 font-normal" name="business_name" placeholder="ABC Salon" required minLength={2} />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Google Review URL
        <input className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-3 font-normal" name="google_review_url" placeholder="https://g.page/r/xxxxx/review" required />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Business category
          <input className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-3 font-normal" name="business_category" placeholder="salon" required />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Tone
          <select className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-3 font-normal" name="tone_preference" defaultValue="friendly">
            {tones.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-pine px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70" disabled={loading}>
        {loading ? <LoadingSpinner label="Generating" /> : <><Sparkles size={18} /> Generate QR code</>}
      </button>
    </form>
  );
}
