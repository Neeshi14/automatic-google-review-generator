import { BarChart3, Download, LogOut, QrCode, ShieldCheck, Sparkles, Star, Wand2 } from "lucide-react";
import AnimatedHero from "./landing/AnimatedHero.jsx";
import ScrollReveal from "./landing/ScrollReveal.jsx";

export default function HomePage({ user, onLogout }) {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 md:px-8">
        <a className="inline-flex items-center gap-2 text-base font-bold text-ink" href="/">
          <QrCode className="text-pine" size={22} /> ReviewQR Studio
        </a>
        {user ? (
          <div className="flex items-center gap-2">
            <a className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md bg-pine px-3 text-sm font-semibold text-white" href={user.business_id ? "/dashboard" : "/setup"}>
              <BarChart3 size={16} /> Dashboard
            </a>
            <button className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white" onClick={onLogout} title="Sign out" aria-label="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        ) : (
          <a className="focus-ring inline-flex min-h-10 items-center rounded-md bg-pine px-4 text-sm font-semibold text-white" href="/auth">
            Sign in
          </a>
        )}
      </nav>

      <AnimatedHero user={user} />

      <ScrollReveal as="section" className="mx-auto w-full max-w-6xl px-4 pb-14 md:px-8">
        <div className="grid gap-3 rounded-md border border-emerald-100 bg-white/80 p-4 shadow-soft sm:grid-cols-3">
          <Metric value="3 steps" label="Scan, write, post" />
          <Metric value="5 scenes" label="Built for local businesses" />
          <Metric value="1 QR" label="A simple review workflow" />
        </div>
      </ScrollReveal>

      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-pine">How it works</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">A clearer path from happy visit to posted review</h2>
          <p className="mt-4 text-slate-700">The landing animation mirrors the real product flow without changing your existing QR, dashboard, or review-generation logic.</p>
        </ScrollReveal>
        <div className="how-line mt-10 grid gap-4 md:grid-cols-4">
          <Step delay={80} icon={<QrCode size={20} />} title="Customer scans" text="A QR code opens the business review page." />
          <Step delay={180} icon={<Wand2 size={20} />} title="Review draft appears" text="The customer picks a genuine experience and creates a draft." />
          <Step delay={280} icon={<Star size={20} />} title="Five-star moment" text="Positive feedback is represented clearly and calmly." />
          <Step delay={380} icon={<BarChart3 size={20} />} title="Owner tracks growth" text="The dashboard keeps scans and selected reviews organized." />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Feature delay={80} icon={<Download size={18} />} title="Download QR anytime" text="Keep your review QR available for counters, tables, cards, and packaging." />
          <Feature delay={180} icon={<BarChart3 size={18} />} title="Track review activity" text="Monitor scans, generated sessions, and recent selected reviews from one workspace." />
          <Feature delay={280} icon={<ShieldCheck size={18} />} title="Owner-controlled setup" text="Your existing sign-in, dashboard, and QR setup flow stay intact." />
        </div>
      </section>
    </main>
  );
}

function Metric({ value, label }) {
  return (
    <div className="rounded-md bg-mist/70 p-4 text-center">
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-600">{label}</p>
    </div>
  );
}

function Step({ icon, title, text, delay }) {
  return (
    <ScrollReveal delay={delay} className="how-card rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <span className="feature-icon inline-flex h-10 w-10 items-center justify-center rounded-md bg-pine text-white">{icon}</span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </ScrollReveal>
  );
}

function Feature({ icon, title, text, delay }) {
  return (
    <ScrollReveal delay={delay} className="feature-card rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <span className="text-pine">{icon}</span>
      <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </ScrollReveal>
  );
}
