"use client";
import { useMemo } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useNav } from "@/hooks/useNav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ToastProvider } from "@/hooks/useToast";
import { STORAGE_KEYS } from "@/constants/storage";
import { PAGE_NAMES } from "@/constants/nav";
import { getPhoenixData } from "@/services/dataService";
import { ErrorBoundary } from "@/components/common/components/ErrorBoundary";
import { ToastContainer } from "@/components/common/components/ToastContainer";
import { Sidebar } from "./Sidebar";
import TopBar from "./TopBar";
import Dashboard from "@/components/pages/dashboard";
import Portfolio from "@/components/pages/portfolio";
import Analysis from "@/components/pages/analysis";
import Compare from "@/components/pages/compare";
import Reports from "@/components/pages/reports";
import Watchlist from "@/components/pages/watchlist";
import Journal from "@/components/pages/journal";
import Tools from "@/components/pages/tools";
import QuarterlyReview from "@/components/pages/review";

export default function PhoenixApp() {
  const { themeName, setThemeName, themeNames } = useTheme();
  const { page, navTo } = useNav();
  const [collapsed, setCollapsed] = useLocalStorage<boolean>(
    STORAGE_KEYS.SIDEBAR_COLLAPSED,
    false,
  );

  // useMemo ensures getPhoenixData() only runs once (mock) or when deps change (backend).
  // Without this, every sidebar toggle / theme change / toast would re-invoke it.
  const data = useMemo(() => getPhoenixData(), []);

  const renderPage = () => {
    // key=page resets the ErrorBoundary when the user navigates to a new tab
    const key = page;
    switch (page) {
      case "dashboard":  return <ErrorBoundary key={key} pageName={PAGE_NAMES[page]}><Dashboard data={data} /></ErrorBoundary>;
      case "portfolio":  return <ErrorBoundary key={key} pageName={PAGE_NAMES[page]}><Portfolio data={data} /></ErrorBoundary>;
      case "analysis":   return <ErrorBoundary key={key} pageName={PAGE_NAMES[page]}><Analysis data={data} /></ErrorBoundary>;
      case "compare":    return <ErrorBoundary key={key} pageName={PAGE_NAMES[page]}><Compare data={data} /></ErrorBoundary>;
      case "watchlist":  return <ErrorBoundary key={key} pageName={PAGE_NAMES[page]}><Watchlist data={data} /></ErrorBoundary>;
      case "reports":    return <ErrorBoundary key={key} pageName={PAGE_NAMES[page]}><Reports data={data} /></ErrorBoundary>;
      case "journal":    return <ErrorBoundary key={key} pageName={PAGE_NAMES[page]}><Journal data={data} /></ErrorBoundary>;
      case "tools":      return <ErrorBoundary key={key} pageName={PAGE_NAMES[page]}><Tools data={data} /></ErrorBoundary>;
      case "review":     return <ErrorBoundary key={key} pageName={PAGE_NAMES[page]}><QuarterlyReview data={data} /></ErrorBoundary>;
      default:           return <ErrorBoundary key={key} pageName="Dashboard"><Dashboard data={data} /></ErrorBoundary>;
    }
  };

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] font-[var(--font-sans)]">
        <Sidebar
          page={page}
          onNav={navTo}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar
            data={data}
            page={page}
            themeName={themeName}
            onThemeChange={setThemeName}
            onNav={navTo}
            themes={themeNames}
          />
          <main className="flex-1 overflow-y-auto">{renderPage()}</main>
        </div>
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}

