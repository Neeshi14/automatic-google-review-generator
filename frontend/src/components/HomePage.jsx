import { BarChart3, ClipboardCheck, Download, FileText, LogOut, MapPin, QrCode, ShieldCheck, Star, Store, Wand2 } from "lucide-react";
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

      <ScrollReveal as="section" className="mx-auto w-full max-w-6xl px-4 pb-12 md:px-8">
        <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-soft sm:grid-cols-3">
          <Metric value="1 QR" label="For counter, bill, table, or package" />
          <Metric value="10 drafts" label="Generated from the customer's choices" />
          <Metric value="Live dashboard" label="Track scans and selected reviews" />
        </div>
      </ScrollReveal>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-start">
          <ScrollReveal className="grid gap-4">
            <p className="text-sm font-bold uppercase tracking-wide text-pine">Built for everyday storefronts</p>
            <h2 className="text-3xl font-bold md:text-4xl">A practical review station for real customer visits</h2>
            <p className="leading-7 text-slate-700">
              Place the QR at checkout, on receipts, service desks, table tents, or packaging. Customers scan it, choose what matched their visit, and copy a review draft before opening your Google review link.
            </p>
          </ScrollReveal>
          <div className="grid gap-3 sm:grid-cols-2">
            <UseCase delay={80} icon={<Store size={18} />} title="Retail counters" text="Ask customers while the experience is still fresh." />
            <UseCase delay={160} icon={<MapPin size={18} />} title="Local services" text="Share one link across reception, invoices, and follow-ups." />
            <UseCase delay={240} icon={<ClipboardCheck size={18} />} title="Team workflows" text="Give staff one simple process to point customers toward." />
            <UseCase delay={320} icon={<FileText size={18} />} title="Review records" text="See every selected draft that was sent toward Google." />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-pine">How it works</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">From scan to Google in a simple, honest flow</h2>
          <p className="mt-4 text-slate-700">The customer stays in control: they choose their experience, edit the draft, copy it, and post manually on Google.</p>
        </ScrollReveal>
        <div className="how-line mt-10 grid gap-4 md:grid-cols-4">
          <Step delay={80} icon={<QrCode size={20} />} title="Scan the QR" text="Your customer opens a branded review page for the right business." />
          <Step delay={180} icon={<Wand2 size={20} />} title="Create drafts" text="The page generates review options based on their selected experience." />
          <Step delay={280} icon={<Star size={20} />} title="Edit and copy" text="They choose a draft, make it personal, and copy it to the clipboard." />
          <Step delay={380} icon={<BarChart3 size={20} />} title="Track activity" text="Your dashboard records scans, generated sessions, and selected reviews." />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:px-8">
        <ScrollReveal className="mb-7 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wide text-pine">What you get</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Everything needed to run the review QR flow</h2>
        </ScrollReveal>
        <div className="grid gap-4 md:grid-cols-3">
          <Feature delay={80} icon={<Download size={18} />} title="PNG QR downloads" text="Save the QR code as a clean PNG for print material and front-desk displays." />
          <Feature delay={180} icon={<BarChart3 size={18} />} title="Complete review list" text="See every selected review draft that customers opened Google with." />
          <Feature delay={280} icon={<ShieldCheck size={18} />} title="Customer-led posting" text="The app prepares the draft, but the customer reviews and submits it themselves." />
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

function UseCase({ icon, title, text, delay }) {
  return (
    <ScrollReveal delay={delay} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-mist text-pine">{icon}</span>
      <h3 className="mt-4 font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </ScrollReveal>
  );
}
