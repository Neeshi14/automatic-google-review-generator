import { Copy, ExternalLink, Wand2 } from "lucide-react";
import { useState } from "react";
import { api } from "../api.js";
import LoadingSpinner from "./LoadingSpinner.jsx";
import ReviewCard from "./ReviewCard.jsx";

const experiences = ["Excellent", "Good", "Average"];
const keywords = ["Fast service", "Friendly staff", "Clean place", "Good quality", "Affordable price", "Professional team", "Helpful support"];

export default function ReviewGenerator({ business, sessionToken, onToast }) {
  const [experience, setExperience] = useState("Excellent");
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(null);

  function toggleKeyword(keyword) {
    setSelectedKeywords((current) => current.includes(keyword) ? current.filter((item) => item !== keyword) : [...current, keyword]);
  }

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const data = await api.generateReviews(sessionToken, { experience, keywords: selectedKeywords });
      setReviews(data.reviews);
      setRemaining(data.remaining_generations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function useReview(review) {
    setSelectedReview(review);
    await navigator.clipboard.writeText(review);
    onToast("Review copied. You can edit it before posting.");
  }

  async function copyReview() {
    await navigator.clipboard.writeText(selectedReview);
    onToast("Review copied to clipboard.");
  }

  async function postOnGoogle() {
    setSaving(true);
    setError("");
    try {
      await api.saveSelectedReview(sessionToken, selectedReview);
      await navigator.clipboard.writeText(selectedReview);
      onToast("Your review has been copied. Paste it on Google and submit it.");
      window.open(business.google_review_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">
        Please only submit a review if you are a real customer and this reflects your genuine experience.
      </div>

      <div className="grid gap-3">
        <h2 className="text-lg font-bold">How was your experience?</h2>
        <div className="grid grid-cols-3 gap-2">
          {experiences.map((item) => (
            <button key={item} className={`focus-ring min-h-11 rounded-md border px-3 text-sm font-semibold ${experience === item ? "border-pine bg-pine text-white" : "border-slate-300 bg-white"}`} onClick={() => setExperience(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <h2 className="text-lg font-bold">What stood out?</h2>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <button key={keyword} className={`focus-ring min-h-10 rounded-md border px-3 text-sm font-semibold ${selectedKeywords.includes(keyword) ? "border-coral bg-coral text-white" : "border-slate-300 bg-white"}`} onClick={() => toggleKeyword(keyword)}>
              {keyword}
            </button>
          ))}
        </div>
      </div>

      <button className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white disabled:opacity-70" onClick={generate} disabled={loading}>
        {loading ? <LoadingSpinner label="Generating reviews" /> : <><Wand2 size={18} /> Generate 10 reviews</>}
      </button>
      {remaining !== null && <p className="text-sm text-slate-600">Remaining generations for this session: {remaining}</p>}
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

      <div className="grid gap-3">
        {reviews.map((review) => (
          <ReviewCard key={review} review={review} selected={selectedReview === review} onUse={useReview} />
        ))}
      </div>

      {selectedReview && (
        <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-4">
          <label className="grid gap-2 text-sm font-semibold">
            Edit your review
            <textarea className="focus-ring min-h-36 rounded-md border border-slate-300 p-3 font-normal leading-6" value={selectedReview} onChange={(event) => setSelectedReview(event.target.value)} />
          </label>
          <div className="flex flex-wrap gap-3">
            <button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold" onClick={copyReview}>
              <Copy size={17} /> Copy review
            </button>
            <button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white disabled:opacity-70" onClick={postOnGoogle} disabled={saving || selectedReview.trim().length < 5}>
              {saving ? <LoadingSpinner label="Saving" /> : <><ExternalLink size={17} /> Post on Google</>}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
