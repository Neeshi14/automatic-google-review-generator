import { ArrowRight, PlayCircle, QrCode, Sparkles } from "lucide-react";
import BusinessSceneCarousel from "./BusinessSceneCarousel.jsx";

export default function AnimatedHero({ user }) {
  const primaryHref = user ? (user.business_id ? "/dashboard" : "/setup") : "/auth";
  const primaryLabel = user ? "Open workspace" : "Get Started";

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-12 pt-6 md:grid-cols-[0.92fr_1.08fr] md:items-center md:px-8 md:pb-16 md:pt-12">
      <div className="grid gap-6">
        <div className="hero-fade-up inline-flex w-fit items-center gap-2 rounded-md border border-emerald-100 bg-white/75 px-3 py-2 text-sm font-bold text-pine shadow-sm">
          <Sparkles size={16} /> Review growth on autopilot
        </div>
        <div>
          <h1 className="hero-fade-up hero-delay-1 max-w-2xl text-4xl font-bold leading-tight text-ink md:text-6xl">
            Turn Every Customer Into a Google Review
          </h1>
          <p className="hero-fade-up hero-delay-2 mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            Let customers scan your QR code, share their experience, and generate professional Google reviews in seconds.
          </p>
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
