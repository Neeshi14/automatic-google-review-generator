export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      {label}
    </span>
  );
}
