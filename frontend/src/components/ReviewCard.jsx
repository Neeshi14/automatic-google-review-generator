import { CheckCircle } from "lucide-react";

export default function ReviewCard({ review, selected, onUse }) {
  return (
    <article className={`rounded-md border bg-white p-4 transition ${selected ? "border-pine ring-2 ring-pine/20" : "border-slate-200"}`}>
      <p className="text-sm leading-6 text-slate-700">{review}</p>
      <button className="focus-ring mt-4 inline-flex min-h-10 items-center gap-2 rounded-md bg-pine px-3 py-2 text-sm font-semibold text-white" onClick={() => onUse(review)}>
        <CheckCircle size={16} /> Use this review
      </button>
    </article>
  );
}
