import { useEffect, useMemo, useState } from "react";
import { clearStoredToken, getStoredToken, storeToken, api } from "./api.js";
import AuthPage from "./components/AuthPage.jsx";
import DashboardPage from "./components/DashboardPage.jsx";
import HomePage from "./components/HomePage.jsx";
import ReviewPage from "./components/ReviewPage.jsx";
import SetupPage from "./components/SetupPage.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const route = useMemo(() => {
    const path = window.location.pathname;
    if (path.startsWith("/review/")) {
      return { name: "review", slug: decodeURIComponent(path.replace("/review/", "")) };
    }
    if (path.startsWith("/dashboard/")) {
      return { name: "dashboard", businessId: decodeURIComponent(path.replace("/dashboard/", "")) };
    }
    if (path === "/dashboard") return { name: "my-dashboard" };
    if (path === "/setup") return { name: "setup" };
    if (path === "/auth") return { name: "auth" };
    return { name: "home" };
  }, []);

  useEffect(() => {
    if (!getStoredToken()) {
      setAuthChecked(true);
      return;
    }

    api.me()
      .then(setUser)
      .catch(() => {
        clearStoredToken();
        setUser(null);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  function handleAuth(authResponse) {
    storeToken(authResponse.token);
    setUser(authResponse.user);
    window.location.href = authResponse.user.business_id ? "/dashboard" : "/setup";
  }

  function logout() {
    clearStoredToken();
    setUser(null);
    window.location.href = "/";
  }

  if (route.name === "review") return <ReviewPage slug={route.slug} />;
  if (route.name === "dashboard") return <DashboardPage businessId={route.businessId} />;
  if (!authChecked) return <main className="min-h-screen" />;
  if (route.name === "auth") return <AuthPage onAuth={handleAuth} />;
  if (route.name === "setup") return user ? <SetupPage user={user} onUserChange={setUser} onLogout={logout} /> : <AuthPage onAuth={handleAuth} />;
  if (route.name === "my-dashboard") return user ? <DashboardPage user={user} onLogout={logout} /> : <AuthPage onAuth={handleAuth} />;
  return <HomePage user={user} onLogout={logout} />;
}
