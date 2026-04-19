'use client';
import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import LandingPage from '@/components/LandingPage';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Home() {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch(`${BACKEND}/auth/status`, { credentials: 'include' });
      const data = await res.json();
      if (data.authenticated) {
        setUser(data.user);
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');
      }
    } catch {
      setAuthState('unauthenticated');
    }
  }

  function handleLogin() {
    window.location.href = `${BACKEND}/auth/google`;
  }

  async function handleLogout() {
    await fetch(`${BACKEND}/auth/logout`, { method: 'POST', credentials: 'include' });
    setAuthState('unauthenticated');
    setUser(null);
  }

  if (authState === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
          INITIALIZING...
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <LandingPage onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}