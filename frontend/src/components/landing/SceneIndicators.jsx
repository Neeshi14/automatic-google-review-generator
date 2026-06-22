export default function SceneIndicators({ scenes, activeIndex, onSelect }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2" aria-label="Business scene selector">
      {scenes.map((scene, index) => (
        <button
          key={scene.id}
          type="button"
          className={`focus-ring h-3 rounded-full transition-all duration-300 ${
            activeIndex === index ? "w-8 bg-pine" : "w-3 bg-slate-300 hover:bg-slate-400"
          }`}
          aria-label={`Show ${scene.businessType} scene`}
          aria-pressed={activeIndex === index}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}
