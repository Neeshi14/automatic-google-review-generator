import { useCallback, useEffect, useRef, useState } from "react";
import BusinessScene from "./BusinessScene.jsx";
import SceneIndicators from "./SceneIndicators.jsx";

const businessScenes = [
  {
    id: "chocolate-shop",
    businessType: "Chocolate Shop",
    background: "linear-gradient(135deg, #fff3df 0%, #f9dcc4 48%, #fffaf2 100%)",
    signColor: "#6b3f2a",
    counterColor: "#8b5a3c",
    props: [
      { label: "box", color: "#d85f45", icon: "" },
      { label: "truffle", color: "#5a3324", icon: "" },
      { label: "gift", color: "#f2b84b", icon: "" },
    ],
    owner: { skin: "#9f6549", hair: "#2f1d18", clothes: "#0f6b57", accent: "#f2b84b" },
    customerOne: { skin: "#c88962", hair: "#172126", clothes: "#d85f45", accent: "#fff7ed" },
    customerTwo: { skin: "#7d4b38", hair: "#3b241d", clothes: "#f2b84b", accent: "#0f6b57" },
  },
  {
    id: "cafe",
    businessType: "Cafe",
    background: "linear-gradient(135deg, #eef4f2 0%, #d8eee8 50%, #fff7e6 100%)",
    signColor: "#0f6b57",
    counterColor: "#b9855b",
    props: [
      { label: "cup", color: "#ffffff", icon: "" },
      { label: "bean", color: "#7a4a31", icon: "" },
      { label: "plant", color: "#0f6b57", icon: "" },
    ],
    owner: { skin: "#b97655", hair: "#1f2937", clothes: "#ffffff", accent: "#0f6b57" },
    customerOne: { skin: "#e2a982", hair: "#5b3527", clothes: "#2563eb", accent: "#f2b84b" },
    customerTwo: { skin: "#8d5a43", hair: "#111827", clothes: "#f97316", accent: "#ffffff" },
  },
  {
    id: "beauty-salon",
    businessType: "Beauty Salon",
    background: "linear-gradient(135deg, #fff1f4 0%, #f7d8e2 48%, #f8fbfa 100%)",
    signColor: "#b83280",
    counterColor: "#d8a4bc",
    props: [
      { label: "mirror", color: "#c7d2fe", icon: "" },
      { label: "chair", color: "#b83280", icon: "" },
      { label: "bottle", color: "#0f6b57", icon: "" },
    ],
    owner: { skin: "#704232", hair: "#111827", clothes: "#b83280", accent: "#f8fafc" },
    customerOne: { skin: "#d89b73", hair: "#6b2f3b", clothes: "#0f6b57", accent: "#f2b84b" },
    customerTwo: { skin: "#b06d4f", hair: "#2f1d18", clothes: "#8b5cf6", accent: "#ffffff" },
  },
  {
    id: "restaurant",
    businessType: "Restaurant",
    background: "linear-gradient(135deg, #fff7ed 0%, #fde7c9 46%, #eef4f2 100%)",
    signColor: "#d85f45",
    counterColor: "#7f5539",
    props: [
      { label: "plate", color: "#ffffff", icon: "" },
      { label: "bowl", color: "#f2b84b", icon: "" },
      { label: "menu", color: "#0f6b57", icon: "" },
    ],
    owner: { skin: "#c88b64", hair: "#172126", clothes: "#334155", accent: "#ffffff" },
    customerOne: { skin: "#8f5b45", hair: "#111827", clothes: "#0ea5e9", accent: "#ffffff" },
    customerTwo: { skin: "#e0aa83", hair: "#7c2d12", clothes: "#d85f45", accent: "#f2b84b" },
  },
  {
    id: "clothing-store",
    businessType: "Clothing Store",
    background: "linear-gradient(135deg, #eef2ff 0%, #e1f0ff 45%, #f8fbfa 100%)",
    signColor: "#334155",
    counterColor: "#64748b",
    props: [
      { label: "rack", color: "#0f6b57", icon: "" },
      { label: "bag", color: "#d85f45", icon: "" },
      { label: "shirt", color: "#f2b84b", icon: "" },
    ],
    owner: { skin: "#a9684d", hair: "#3b241d", clothes: "#0f6b57", accent: "#ffffff" },
    customerOne: { skin: "#d79b74", hair: "#111827", clothes: "#7c3aed", accent: "#f8fafc" },
    customerTwo: { skin: "#7d4b38", hair: "#172126", clothes: "#f2b84b", accent: "#d85f45" },
  },
];

const SCENE_DURATION_MS = 5000;

export default function BusinessSceneCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % businessScenes.length);
    }, SCENE_DURATION_MS);
  }, [clearTimer, isPaused]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsPaused(document.hidden);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  function handleSelect(index) {
    setActiveIndex(index);
    startTimer();
  }

  return (
    <div className="hero-scene-wrap" aria-live="polite">
      <div className="hero-scene-shell">
        <div key={businessScenes[activeIndex].id} className="hero-scene-layer is-active">
          <BusinessScene scene={businessScenes[activeIndex]} />
        </div>
      </div>
      <SceneIndicators scenes={businessScenes} activeIndex={activeIndex} onSelect={handleSelect} />
    </div>
  );
}
