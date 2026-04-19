'use client';

export default function LandingPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', fontFamily: 'var(--font-mono)'
    }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: '52px', fontWeight: 300,
            fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.1, marginBottom: '4px'
          }}>
            <span style={{ color: 'var(--accent)' }}>O</span>tto
          </h1>
          <p style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
            Personal AI Productivity Agent
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
          {[
            ['01', 'Send emails with natural language'],
            ['02', 'Create calendar events instantly'],
            ['03', 'Summarize and manage your schedule'],
          ].map(([num, text]) => (
            <div key={num} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', color: 'var(--accent)', letterSpacing: '0.1em', marginTop: '2px', minWidth: '20px' }}>{num}</span>
              <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>{text}</span>
            </div>
          ))}
        </div>

        <button onClick={onLogin} style={{
          width: '100%', background: 'var(--ink)', color: 'var(--bg)',
          border: 'none', borderRadius: '3px', padding: '14px 24px',
          fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em',
          cursor: 'pointer', textTransform: 'uppercase'
        }}>
          Connect Google Account →
        </button>

        <p style={{ fontSize: '10px', color: 'var(--ink-faint)', marginTop: '16px', textAlign: 'center', lineHeight: 1.6 }}>
          Requires Gmail + Calendar access.<br />
          Your data never leaves your account.
        </p>
      </div>
    </div>
  );
}