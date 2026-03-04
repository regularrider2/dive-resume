// NPC Diver Chat Engine
//
// In PLACEHOLDER mode (no API key configured), returns canned responses.
// When you're ready to go live, see SETUP-GUIDE.md for the full setup steps.
//
// To enable live AI:
//   1. Set VITE_OPENAI_API_KEY (or VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY for edge fn)
//   2. Load david-knowledge.md content into the system prompt
//   3. Flip LIVE_MODE to true (or check env var automatically)

const LIVE_MODE = !!import.meta.env.VITE_OPENAI_API_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Placeholder responses shown when no API is configured
const PLACEHOLDER_RESPONSES = [
  "I know everything about David, but my radio's on the fritz. Check back once the AI is connected!",
  "Great question. I'd tell you, but the signal down here is terrible. Ask again when I'm fully wired up.",
  "I've read his entire resume — twice. Once the API key is in place, I'll spill everything.",
  "The reef has many secrets. David's career is one of them. Come back when I'm connected to the surface.",
  "I'm still loading his CV into my wetsuit pockets. Give it a moment... or a deployment.",
];

let placeholderIdx = 0;

// Simulates a short typing delay for realism
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Call a Supabase Edge Function (recommended for production — keeps API key server-side)
async function callSupabaseEdgeFn(question, conversationHistory) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/npc-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ question, history: conversationHistory }),
  });
  if (!res.ok) throw new Error(`Edge function error: ${res.status}`);
  const data = await res.json();
  return data.answer;
}

// Call OpenAI directly from the browser (only use in dev — exposes API key)
async function callOpenAIDirect(question, conversationHistory, knowledgeBase) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const systemPrompt = `You are a wise, friendly scuba diver NPC in an underwater interactive resume game.
You know everything about David Gordon's professional background, experience, and skills.
Answer questions about David concisely and conversationally — you're underwater, keep it punchy.
If asked something unrelated to David's career, gently redirect.

David's background:
${knowledgeBase}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: question },
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 200,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// Main export — call this with the user's question
// conversationHistory: array of { role: 'user'|'assistant', content: string }
// knowledgeBase: string content of david-knowledge.md (pass in from caller)
export async function askNPCDiver(question, conversationHistory = [], knowledgeBase = '') {
  if (!LIVE_MODE) {
    // Placeholder mode — rotate through canned responses
    await delay(800 + Math.random() * 600);
    const response = PLACEHOLDER_RESPONSES[placeholderIdx % PLACEHOLDER_RESPONSES.length];
    placeholderIdx++;
    return response;
  }

  try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      return await callSupabaseEdgeFn(question, conversationHistory);
    } else {
      return await callOpenAIDirect(question, conversationHistory, knowledgeBase);
    }
  } catch (err) {
    console.error('[NPC Chat] Error:', err);
    return "My regulator's acting up — couldn't get a response. Try again?";
  }
}
