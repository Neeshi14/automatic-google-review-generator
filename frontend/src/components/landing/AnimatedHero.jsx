import { ArrowRight, PlayCircle, QrCode, Sparkles } from "lucide-react";
import BusinessSceneCarousel from "./BusinessSceneCarousel.jsx";

export default function AnimatedHero({ user }) {
  const primaryHref = user ? (user.business_id ? "/dashboard" : "/setup") : "/auth";
  const primaryLabel = user ? "Open workspace" : "Create your QR";

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-12 pt-6 md:grid-cols-[0.9fr_1.1fr] md:items-center md:px-8 md:pb-16 md:pt-12">
      <div className="grid gap-6">
        <div className="hero-fade-up inline-flex w-fit items-center gap-2 rounded-md border border-emerald-100 bg-white px-3 py-2 text-sm font-bold text-pine shadow-sm">
          <Sparkles size={16} /> QR review workflow for local businesses
        </div>
        <div>
          <h1 className="hero-fade-up hero-delay-1 max-w-2xl text-4xl font-bold leading-tight text-ink md:text-6xl">
            Help customers write a clear Google review before they leave
          </h1>
          <p className="hero-fade-up hero-delay-2 mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            Generate a branded QR page, guide real customers through a short review prompt, and keep every selected draft organized in your dashboard.
          </p>
        </div>
        <div className="hero-fade-up hero-delay-2 grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-3">
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2">No app install</span>
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2">Manual Google posting</span>
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2">Owner dashboard</span>
        </div>
        <div className="hero-fade-up hero-delay-3 flex flex-wrap gap-3">
          <a className="focus-ring hero-button inline-flex min-h-12 items-center gap-2 rounded-md bg-pine px-5 font-semibold text-white" href={primaryHref}>
            <QrCode size={18} /> {primaryLabel} <ArrowRight size={17} />
          </a>
          <a className="focus-ring hero-button inline-flex min-h-12 items-center gap-2 rounded-md border border-slate-300 bg-white px-5 font-semibold text-ink" href="#how-it-works">
            <PlayCircle size={18} /> See How It Works
          </a>
        </div>
      </div>
      <div className="hero-fade-up hero-delay-4">
        <BusinessSceneCarousel />
      </div>
    </section>
  );
}
