import { BarChart3, Download, LogOut, QrCode, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage({ user, onLogout }) {
  return (
    <main className="min-h-screen">
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

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-10 pt-6 md:grid-cols-[1fr_0.8fr] md:items-center md:px-8 md:pt-12">
        <div className="grid gap-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-pine text-white">
            <Sparkles />
          </div>
          <div>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-6xl">Google review QR codes with a live owner dashboard</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Create one QR code for your business, let real customers generate review drafts, and track scans, generated sessions, and recent selected reviews from one dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-md bg-pine px-5 font-semibold text-white" href={user ? (user.business_id ? "/dashboard" : "/setup") : "/auth"}>
              <QrCode size={18} /> {user ? "Open workspace" : "Create your QR"}
            </a>
            <a className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-md border border-slate-300 bg-white px-5 font-semibold" href="/auth">
              <ShieldCheck size={18} /> Owner sign in
            </a>
          </div>
        </div>

        <div className="rounded-md bg-white p-5 shadow-soft">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="mx-auto grid h-52 w-52 place-items-center rounded-md border-8 border-white bg-[linear-gradient(45deg,#172126_25%,transparent_25%),linear-gradient(-45deg,#172126_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#172126_75%),linear-gradient(-45deg,transparent_75%,#172126_75%)] bg-[length:26px_26px] bg-[position:0_0,0_13px,13px_-13px,-13px_0] shadow-sm">
              <QrCode className="rounded-md bg-white p-3 text-pine" size={86} />
            </div>
            <div className="mt-5 grid gap-3">
              <Feature icon={<Download size={18} />} title="Download QR anytime" />
              <Feature icon={<BarChart3 size={18} />} title="Track scans and generated sessions" />
              <Feature icon={<ShieldCheck size={18} />} title="One QR workspace per account" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-white px-3 py-3 text-sm font-semibold text-ink">
      <span className="text-pine">{icon}</span>
      <span>{title}</span>
    </div>
  );
}
