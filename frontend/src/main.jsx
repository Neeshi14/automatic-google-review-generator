import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4">
          <section className="rounded-md bg-white p-5 shadow-soft">
            <h1 className="text-2xl font-bold">The app could not load.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Please restart the frontend dev server with <code>npm run dev</code> from the <code>frontend</code> folder, then open <code>http://localhost:5173/</code>.
            </p>
            <pre className="mt-4 overflow-auto rounded-md bg-slate-100 p-3 text-xs text-slate-700">{String(this.state.error?.message || this.state.error)}</pre>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);
