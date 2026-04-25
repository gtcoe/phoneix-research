'use client';
import { useState, useEffect } from 'react';
import { THEMES, DEFAULT_THEME } from '@/lib/theme';
import { phoenixData } from '@/lib/data';
import { Sidebar } from './Sidebar';
import TopBar from './TopBar';
import Dashboard from './Dashboard';
import Portfolio from './Portfolio';
import Analysis from './Analysis';
import Compare from './Compare';
import Reports from './Reports';
import Watchlist from './Watchlist';
import Journal from './Journal';
import Tools from './Tools';
import QuarterlyReview from './Review';

type Page = 'dashboard' | 'portfolio' | 'analysis' | 'compare' | 'watchlist' | 'reports' | 'journal' | 'tools' | 'review';

export default function PhoenixApp() {
  const [page, setPage] = useState<Page>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    return (localStorage.getItem('px-page') as Page) || 'dashboard';
  });
  const [themeName, setThemeName] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME;
    return localStorage.getItem('px-theme') || DEFAULT_THEME;
  });
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('px-collapsed') === 'true';
  });

  // Persist state
  useEffect(() => { localStorage.setItem('px-page', page); }, [page]);
  useEffect(() => { localStorage.setItem('px-theme', themeName); }, [themeName]);
  useEffect(() => { localStorage.setItem('px-collapsed', String(collapsed)); }, [collapsed]);

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const theme = (THEMES as any)[themeName] || THEMES[DEFAULT_THEME];
    Object.entries(theme).forEach(([k, v]) => root.style.setProperty(k, v as string));
    root.style.setProperty('color-scheme', themeName !== 'Pro Light' ? 'dark' : 'light');
  }, [themeName]);

  const data = phoenixData;
  const themeNames = Object.keys(THEMES);

  const navTo = (p: string) => setPage(p as Page);

  const renderPage = () => {
    switch (page) {
      case 'dashboard':  return <Dashboard data={data} />;
      case 'portfolio':  return <Portfolio data={data} />;
      case 'analysis':   return <Analysis data={data} />;
      case 'compare':    return <Compare data={data} />;
      case 'watchlist':  return <Watchlist data={data} />;
      case 'reports':    return <Reports data={data} />;
      case 'journal':    return <Journal data={data} />;
      case 'tools':      return <Tools data={data} />;
      case 'review':     return <QuarterlyReview data={data} />;
      default:           return <Dashboard data={data} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
      <Sidebar page={page} onNav={navTo} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar data={data} page={page} themeName={themeName} onThemeChange={setThemeName} themes={themeNames} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
