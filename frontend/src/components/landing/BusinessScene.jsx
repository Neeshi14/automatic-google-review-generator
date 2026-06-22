import { Check, QrCode, Star } from "lucide-react";

function Character({ person, role }) {
  return (
    <div className={`scene-person scene-person-${role}`}>
      <div className="scene-hair" style={{ backgroundColor: person.hair }} />
      <div className="scene-head" style={{ backgroundColor: person.skin }}>
        <span className="scene-eye scene-eye-left" />
        <span className="scene-eye scene-eye-right" />
        <span className="scene-smile" />
      </div>
      <div className="scene-neck" style={{ backgroundColor: person.skin }} />
      <div className="scene-body" style={{ backgroundColor: person.clothes }}>
        {person.accent && <span className="scene-body-accent" style={{ backgroundColor: person.accent }} />}
      </div>
      <span className="scene-arm scene-arm-left" style={{ backgroundColor: person.skin }} />
      <span className="scene-arm scene-arm-right" style={{ backgroundColor: person.skin }} />
    </div>
  );
}

function PropShelf({ scene }) {
  return (
    <div className="scene-shelf" aria-hidden="true">
      {scene.props.map((prop) => (
        <span key={prop.label} className="scene-prop" style={{ backgroundColor: prop.color }}>
          {prop.icon}
        </span>
      ))}
    </div>
  );
}

function ReviewCard() {
  return (
    <div className="scene-review-card">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-600">Review draft</span>
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-pine text-white">
          <Check size={12} />
        </span>
      </div>
      <div className="mt-2 flex gap-1 text-amber">
        {[0, 1, 2, 3, 4].map((item) => (
          <Star key={item} className="scene-star" size={15} fill="currentColor" style={{ animationDelay: `${2.08 + item * 0.15}s` }} />
        ))}
      </div>
      <div className="mt-3 grid gap-1.5">
        <span className="scene-writing-line w-24" />
        <span className="scene-writing-line w-20" />
      </div>
    </div>
  );
}

function Notification({ scene }) {
  return (
    <div className="scene-notification">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pine text-white">
        <Check size={15} />
      </span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-pine">New review</p>
        <p className="text-xs font-bold text-ink">{scene.businessType} rating improved</p>
      </div>
    </div>
  );
}

function QRStand() {
  return (
    <div className="scene-qr-stand">
      <div className="scene-qr-card">
        <QrCode size={52} className="text-ink" />
        <span className="scene-scan-line" />
      </div>
      <div className="scene-stand-base" />
    </div>
  );
}

function Phone() {
  return (
    <div className="scene-phone" aria-hidden="true">
      <div className="scene-phone-screen">
        <QrCode size={18} />
        <span />
      </div>
    </div>
  );
}

export default function BusinessScene({ scene }) {
  return (
    <article className={`business-scene ${scene.id}`} aria-label={`${scene.businessType} customer review animation`}>
      <div className="scene-backdrop" style={{ background: scene.background }}>
        <div className="scene-shop-sign" style={{ backgroundColor: scene.signColor }}>
          {scene.businessType}
        </div>
        <PropShelf scene={scene} />
        <div className="scene-counter" style={{ backgroundColor: scene.counterColor }}>
          <span className="scene-counter-top" />
        </div>
        <Character person={scene.owner} role="owner" />
        <Character person={scene.customerOne} role="customer-one" />
        <Character person={scene.customerTwo} role="customer-two" />
        <QRStand />
        <Phone />
        <ReviewCard />
        <Notification scene={scene} />
        <span className="scene-success-spark scene-success-spark-one" />
        <span className="scene-success-spark scene-success-spark-two" />
      </div>
    </article>
  );
}
