'use client';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

type Message = { role: 'user' | 'assistant'; content: string; toolsUsed?: any[] };
type CalendarEvent = { id: string; title: string; start: string; end: string };
type Email = { id: string; subject: string; from: string; date: string; snippet: string };

export default function Dashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Good " + getGreeting() + ", " + (user?.name?.split(' ')[0] || 'there') + ". I can send emails, create calendar events, and summarize your schedule. What would you like to do?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents();
    fetchEmails();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchEvents() {
    try {
      const res = await fetch(`${BACKEND}/calendar/today`, { credentials: 'include' });
      const data = await res.json();
      setEvents(data.slice(0, 5));
    } catch {}
  }

  async function fetchEmails() {
    try {
      const res = await fetch(`${BACKEND}/email/inbox`, { credentials: 'include' });
      const data = await res.json();
      setEmails(data.slice(0, 5));
    } catch {}
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND}/agent/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        toolsUsed: data.toolsUsed
      }]);
      setHistory(data.updatedHistory);

      // Refresh data if tools were used
      if (data.toolsUsed?.length > 0) {
        setTimeout(() => { fetchEvents(); fetchEmails(); }, 1000);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '20px', fontFamily: 'var(--font-mono)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontStyle: 'italic' }}>
            <span style={{ color: 'var(--accent)' }}>O</span>tto —
          </span>
          <span style={{ fontSize: '14px', color: 'var(--ink-muted)', letterSpacing: '0.12em', marginLeft: '10px', textTransform: 'uppercase' }}>
            AI Agent
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>{user?.email}</span>
          <button onClick={onLogout} style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: '2px',
            padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--ink-muted)', cursor: 'pointer', letterSpacing: '0.05em'
          }}>logout</button>
        </div>
      </div>

      {/* Bento Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: 'auto auto', gap: '12px' }}>

        {/* Chat — spans 2 rows */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '3px',
          padding: '20px', gridRow: 'span 2', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: '16px' }}>
            Agent Interface
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '320px', maxHeight: '480px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: '2px', fontSize: '12px', lineHeight: 1.6,
                  background: msg.role === 'user' ? 'var(--bg-dark)' : 'white',
                  color: msg.role === 'user' ? '#F5F2EC' : 'var(--ink)',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none'
                }}>
                  {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      {msg.toolsUsed.map((t, j) => (
                        <span key={j} style={{
                          background: 'var(--accent)', color: 'white', fontSize: '9px',
                          padding: '2px 6px', borderRadius: '2px', letterSpacing: '0.05em'
                        }}>✓ {t.tool.replace(/_/g, ' ').toUpperCase()}</span>
                      ))}
                    </div>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '4px', padding: '8px 14px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ink-faint)',
                    animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Send email, create event, check schedule..."
              style={{
                flex: 1, background: 'white', border: '1px solid var(--border)', borderRadius: '2px',
                padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink)', outline: 'none'
              }}
            />
            <button onClick={sendMessage} disabled={loading} style={{
              background: loading ? 'var(--ink-faint)' : 'var(--ink)', color: 'var(--bg)',
              border: 'none', borderRadius: '2px', padding: '10px 18px',
              fontFamily: 'var(--font-mono)', fontSize: '11px', cursor: loading ? 'not-allowed' : 'pointer'
            }}>→</button>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
            {['Send email to...', "What's on my schedule?", 'Create event for...', 'Summarize my inbox'].map(q => (
              <button key={q} onClick={() => setInput(q)} style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '2px',
                padding: '3px 8px', fontFamily: 'var(--font-mono)', fontSize: '10px',
                color: 'var(--ink-muted)', cursor: 'pointer'
              }}>{q}</button>
            ))}
          </div>
        </div>

        {/* Stats + Date */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '3px', padding: '20px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: '12px' }}>Today</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 300, fontStyle: 'italic', lineHeight: 1 }}>
            {format(today, 'MMM d')}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '6px', marginBottom: '14px' }}>
            {format(today, 'EEEE, yyyy')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { num: events.length, label: 'Events today' },
              { num: emails.length, label: 'Recent emails' },
            ].map(({ num, label }) => (
              <div key={label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '2px', padding: '10px' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 300, lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: '9px', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginTop: '4px', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule + Inbox stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Schedule */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '3px', padding: '20px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: '12px' }}>Schedule</div>
            {events.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--ink-faint)', fontStyle: 'italic' }}>No events today</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.map(evt => (
                  <div key={evt.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cool)', marginTop: '5px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--ink)', lineHeight: 1.3 }}>{evt.title}</div>
                      <div style={{ fontSize: '10px', color: 'var(--ink-muted)', marginTop: '2px' }}>
                        {evt.start ? format(new Date(evt.start), 'h:mm a') : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inbox */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '3px', padding: '20px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '0.15em', color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: '12px' }}>Inbox</div>
            {emails.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--ink-faint)', fontStyle: 'italic' }}>No recent emails</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {emails.slice(0, 4).map((email, i) => (
                  <div key={email.id} style={{ paddingBottom: '8px', marginBottom: '8px', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {email.from?.split('<')[0].trim()}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                      {email.subject}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}