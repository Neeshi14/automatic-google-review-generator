import { useMemo } from "react";
import DashboardPage from "./components/DashboardPage.jsx";
import HomePage from "./components/HomePage.jsx";
import ReviewPage from "./components/ReviewPage.jsx";

export default function App() {
  const route = useMemo(() => {
    const path = window.location.pathname;
    if (path.startsWith("/review/")) {
      return { name: "review", slug: decodeURIComponent(path.replace("/review/", "")) };
    }
    if (path.startsWith("/dashboard/")) {
      return { name: "dashboard", businessId: decodeURIComponent(path.replace("/dashboard/", "")) };
    }
    return { name: "home" };
  }, []);

  if (route.name === "review") return <ReviewPage slug={route.slug} />;
  if (route.name === "dashboard") return <DashboardPage businessId={route.businessId} />;
  return <HomePage />;
}
