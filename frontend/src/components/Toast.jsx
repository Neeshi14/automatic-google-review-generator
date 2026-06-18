export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-md bg-ink px-4 py-3 text-sm font-medium text-white shadow-soft">
      {message}
    </div>
  );
}
