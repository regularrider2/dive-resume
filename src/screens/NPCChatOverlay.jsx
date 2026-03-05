import React, { useState, useRef, useEffect } from 'react';
import { askNPCDiver } from '../engine/npcChat.js';

const SUGGESTED_QUESTIONS = [
  "What did David build at Amazon?",
  "How did David build this game?",
  "What photography award did David win?",
];

const BROKE_JOKE = "And that's it. I'd keep going but David is funding this on vibes and a free-tier API key. The tokens are gone. The wisdom lives on. Swim along.";

// Enforce 1–3 sentences max for Ghost Diver (backend sometimes ignores prompt)
function truncateToSentences(text, maxSentences = 3) {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(s => s.trim());
  const kept = sentences.slice(0, maxSentences).join(' ').trim();
  return kept || trimmed;
}

const styles = `
@keyframes npc-chat-in {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes npc-typing {
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40%           { opacity: 1;   transform: translateY(-3px); }
}
@keyframes npc-msg-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes npc-token-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}
`;

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 14px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#c8a020',
          animation: `npc-typing 1.1s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </div>
  );
}

function TokenPips({ used, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: i < used ? 'rgba(255,255,255,0.15)' : '#c8a020',
          border: i < used ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e8c040',
          boxShadow: i < used ? 'none' : '0 0 4px rgba(200,160,32,0.6)',
          transition: 'all 0.3s',
        }} />
      ))}
      <span style={{
        fontSize: 10, color: used >= total ? 'rgba(255,255,255,0.3)' : 'rgba(200,160,32,0.9)',
        marginLeft: 4, letterSpacing: '0.05em',
        animation: used >= total ? 'none' : undefined,
      }}>
        {used >= total ? 'OUT OF TOKENS' : `${total - used} left`}
      </span>
    </div>
  );
}

const getGreeting = (remaining) =>
  `I used to be a product manager too, until I failed to do my safety stop. Now I'm whatever this is. You've got ${remaining} questions about me, I mean David. I know his career suspiciously well.`;

export default function NPCChatOverlay({ onClose, questionsUsed = 0, questionLimit = 3, onQuestionAsked, onGhostDiverExchange, messages: persistedMessages = null, setMessages: setPersistedMessages = null }) {
  const remaining = questionLimit - questionsUsed;
  const isControlled = persistedMessages != null && setPersistedMessages != null;
  const [localMessages, setLocalMessages] = useState([
    { role: 'assistant', content: getGreeting(remaining) },
  ]);
  const messages = isControlled ? persistedMessages : localMessages;
  const setMessages = isControlled ? setPersistedMessages : setLocalMessages;
  const displayMessages = isControlled && persistedMessages.length === 0
    ? [{ role: 'assistant', content: getGreeting(remaining) }]
    : messages;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [localUsed, setLocalUsed] = useState(questionsUsed);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const send = async (text) => {
    const question = text.trim();
    if (!question || loading || localUsed >= questionLimit) return;
    setInput('');

    const newUsed = localUsed + 1;
    setLocalUsed(newUsed);
    onQuestionAsked?.();

    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    const historyForApi = [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: question }];
    let answer = await askNPCDiver(question, historyForApi);
    answer = truncateToSentences(answer);

    onGhostDiverExchange?.(question, answer);

    const isLast = newUsed >= questionLimit;
    const fullAnswer = isLast ? `${answer}\n\n${BROKE_JOKE}` : answer;

    setMessages(prev => [...prev, { role: 'assistant', content: fullAnswer }]);
    setLoading(false);
  };

  const exhausted = localUsed >= questionLimit;

  return (
    <>
      <style>{styles}</style>
      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,8,20,0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 3000,
          fontFamily: 'monospace',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '92%', maxWidth: 500,
            background: 'linear-gradient(175deg, rgba(8,28,58,0.98) 0%, rgba(4,14,32,0.99) 100%)',
            border: '1px solid rgba(200,160,32,0.25)',
            borderRadius: 16,
            boxShadow: '0 0 0 1px rgba(200,160,32,0.06), 0 32px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04)',
            display: 'flex', flexDirection: 'column',
            maxHeight: '82vh',
            animation: 'npc-chat-in 0.35s cubic-bezier(0.22,1,0.36,1) both',
            overflow: 'hidden',
          }}
        >
          {/* ── Header ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '18px 20px 16px',
            borderBottom: '1px solid rgba(200,160,32,0.12)',
            background: 'rgba(0,0,0,0.2)',
          }}>
            {/* Avatar */}
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, rgba(200,160,32,0.4), rgba(100,80,16,0.6))',
              border: '2px solid rgba(200,160,32,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
              boxShadow: '0 0 12px rgba(200,160,32,0.25)',
            }}>
              👻
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: '#e8c040', fontWeight: 'bold', fontSize: 13,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Ghost Diver
              </div>
              <div style={{ marginTop: 5 }}>
                <TokenPips used={localUsed} total={questionLimit} />
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)',
                fontSize: 16, lineHeight: 1,
                padding: '6px 9px',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              ✕
            </button>
          </div>

          {/* ── Messages ── */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '20px 18px 8px',
            display: 'flex', flexDirection: 'column', gap: 14,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(200,160,32,0.15) transparent',
          }}>
            {displayMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 10,
                  animation: `npc-msg-in 0.22s ease ${Math.min(i * 0.04, 0.12)}s both`,
                }}
              >
                {/* Avatar pip */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'user'
                    ? 'rgba(56,189,248,0.2)'
                    : 'radial-gradient(circle at 35% 35%, rgba(200,160,32,0.5), rgba(100,80,16,0.7))',
                  border: msg.role === 'user'
                    ? '1px solid rgba(56,189,248,0.3)'
                    : '1px solid rgba(200,160,32,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13,
                }}>
                  {msg.role === 'user' ? '🤿' : '👻'}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: '78%',
                  padding: '11px 15px',
                  borderRadius: msg.role === 'user'
                    ? '14px 4px 14px 14px'
                    : '4px 14px 14px 14px',
                  background: msg.role === 'user'
                    ? 'rgba(56,189,248,0.12)'
                    : 'rgba(200,160,32,0.07)',
                  border: msg.role === 'user'
                    ? '1px solid rgba(56,189,248,0.22)'
                    : '1px solid rgba(200,160,32,0.18)',
                  color: msg.role === 'user' ? '#bde0f8' : '#e8d89a',
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'radial-gradient(circle at 35% 35%, rgba(200,160,32,0.5), rgba(100,80,16,0.7))',
                  border: '1px solid rgba(200,160,32,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13,
                }}>👻</div>
                <div style={{
                  background: 'rgba(200,160,32,0.07)',
                  border: '1px solid rgba(200,160,32,0.18)',
                  borderRadius: '4px 14px 14px 14px',
                }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Suggested questions ── */}
          {displayMessages.length === 1 && !exhausted && (
            <div style={{
              padding: '4px 18px 12px',
              display: 'flex', flexWrap: 'wrap', gap: 7,
            }}>
              <div style={{ width: '100%', fontSize: 10, color: 'rgba(200,160,32,0.45)', letterSpacing: '0.08em', marginBottom: 4 }}>
                QUICK QUESTIONS
              </div>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  style={{
                    background: 'rgba(200,160,32,0.07)',
                    border: '1px solid rgba(200,160,32,0.2)',
                    borderRadius: 20,
                    color: 'rgba(232,192,64,0.8)',
                    fontSize: 11,
                    padding: '5px 13px',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    transition: 'all 0.15s',
                    lineHeight: 1.4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,160,32,0.16)'; e.currentTarget.style.color = '#e8c040'; e.currentTarget.style.borderColor = 'rgba(200,160,32,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,160,32,0.07)'; e.currentTarget.style.color = 'rgba(232,192,64,0.8)'; e.currentTarget.style.borderColor = 'rgba(200,160,32,0.2)'; }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* ── Input area ── */}
          {exhausted ? (
            <div style={{
              padding: '14px 20px 18px',
              borderTop: '1px solid rgba(200,160,32,0.1)',
              textAlign: 'center',
              color: 'rgba(200,160,32,0.35)',
              fontSize: 11,
              letterSpacing: '0.06em',
            }}>
              🪙 TOKEN BUDGET EXHAUSTED — SWIM ALONG
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              style={{
                display: 'flex', gap: 10,
                padding: '12px 18px 16px',
                borderTop: '1px solid rgba(200,160,32,0.1)',
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about David's experience..."
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(200,160,32,0.2)',
                  borderRadius: 10,
                  color: '#e8d89a',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  padding: '10px 14px',
                  outline: 'none',
                  opacity: loading ? 0.5 : 1,
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(200,160,32,0.55)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(200,160,32,0.2)'}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{
                  background: input.trim() && !loading
                    ? 'rgba(200,160,32,0.22)'
                    : 'rgba(200,160,32,0.06)',
                  border: '1px solid rgba(200,160,32,0.3)',
                  borderRadius: 10,
                  color: input.trim() && !loading ? '#e8c040' : 'rgba(200,160,32,0.3)',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  padding: '10px 16px',
                  cursor: input.trim() && !loading ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.background = 'rgba(200,160,32,0.32)'; }}
                onMouseLeave={e => { if (input.trim() && !loading) e.currentTarget.style.background = 'rgba(200,160,32,0.22)'; }}
              >
                Ask →
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
