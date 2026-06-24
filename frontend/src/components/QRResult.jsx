import { Copy, Download, ExternalLink } from "lucide-react";
import { downloadPngFromUrl } from "../api.js";

function qrFilename(name) {
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "qr-code";
  return `${safeName}-qr.png`;
}

export default function QRResult({ result, onCopy }) {
  if (!result) return null;

  async function downloadQr() {
    try {
      await downloadPngFromUrl(result.qr_code_url, qrFilename(result.business_name));
    } catch (_err) {
      window.open(result.qr_code_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <section className="mt-8 rounded-md border border-emerald-200 bg-white p-5 shadow-soft">
      <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
        <img className="mx-auto h-44 w-44 rounded-md border border-slate-200 bg-white p-2" src={result.qr_code_url} alt={`QR code for ${result.business_name}`} />
        <div className="grid gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-pine">QR code ready</p>
            <h2 className="mt-1 text-2xl font-bold">{result.business_name}</h2>
            <p className="mt-2 break-all text-sm text-slate-600">{result.review_page_url}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={downloadQr}>
              <Download size={17} /> Download PNG
            </button>
            <button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold" onClick={() => onCopy(result.review_page_url)}>
              <Copy size={17} /> Copy link
            </button>
            <a className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold" href={`/dashboard/${result.business_id}`}>
              <ExternalLink size={17} /> Dashboard
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
