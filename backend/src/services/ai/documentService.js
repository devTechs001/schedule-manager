import { getChatCompletion } from './openAIService.js';

/**
 * Analysis of user-supplied document text.
 *
 * Statistics (word count, reading time) are computed here because they are
 * deterministic facts about the input. Everything interpretive (summary,
 * topics, entities, sentiment, action items) comes from the model — if the
 * model is unreachable or returns junk, those fields come back empty instead
 * of being filled with placeholder prose.
 */
export const analyzeDocument = async (text, { fileName } = {}) => {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const base = {
    summary: '',
    keyTopics: [],
    entities: { dates: [], people: [], organizations: [] },
    sentiment: null,
    actionItems: [],
    wordCount,
    readingTime,
    fileName: fileName || null,
    model: null,
  };

  // Very short inputs cannot be meaningfully summarised; return facts only.
  if (wordCount < 25) {
    return base;
  }

  // Cap what we send so a 5 MB paste does not blow the token budget.
  const excerpt = words.slice(0, 4000).join(' ');

  const prompt = `Analyse the document below and return a single JSON object with exactly these keys:
{
  "summary": "2-3 sentence summary in neutral tone",
  "keyTopics": ["up to 6 short topic labels"],
  "entities": { "dates": [], "people": [], "organizations": [] },
  "sentiment": "positive" | "neutral" | "negative",
  "actionItems": ["concrete tasks stated or implied, up to 6"]
}
Only include entities that literally appear in the text. Do not invent names, dates or organisations.

DOCUMENT:
"""${excerpt}"""`;

  let parsed = null;
  try {
    const response = await getChatCompletion(prompt, [], { temperature: 0.2, json: true });
    parsed = JSON.parse(response.content);
    base.model = response.model;
  } catch (error) {
    // JSON.parse failure or provider error — keep the deterministic facts.
    console.warn('Document analysis unavailable:', error?.message || error);
    return base;
  }

  const asStrings = (value) =>
    Array.isArray(value) ? value.filter((v) => typeof v === 'string' && v.trim()).slice(0, 8) : [];

  return {
    ...base,
    summary: typeof parsed?.summary === 'string' ? parsed.summary : '',
    keyTopics: asStrings(parsed?.keyTopics).slice(0, 6),
    entities: {
      dates: asStrings(parsed?.entities?.dates),
      people: asStrings(parsed?.entities?.people),
      organizations: asStrings(parsed?.entities?.organizations),
    },
    sentiment: ['positive', 'neutral', 'negative'].includes(parsed?.sentiment) ? parsed.sentiment : null,
    actionItems: asStrings(parsed?.actionItems).slice(0, 6),
  };
};

const TONES = ['professional', 'friendly', 'brief', 'detailed'];

/**
 * Draft replies to an incoming message. Returns [] when the provider is not
 * available or the model produced nothing usable — never canned copy.
 */
export const draftReplies = async (message, { tone = 'professional', count = 3 } = {}) => {
  const body = String(message || '').trim();
  if (!body) return [];

  const safeTone = TONES.includes(tone) ? tone : 'professional';
  const safeCount = Math.max(1, Math.min(5, Number(count) || 3));

  const prompt = `Draft ${safeCount} alternative replies to the message below.
Tone: ${safeTone}.
Return a JSON object: { "replies": ["...", "..."] } with exactly ${safeCount} entries.
Each reply must be ready to send as-is, reference the actual content of the message, and invent no facts, dates, names or commitments that are not implied by it.

MESSAGE:
"""${body.slice(0, 4000)}"""`;

  const response = await getChatCompletion(prompt, [], { temperature: 0.7, json: true });
  const parsed = JSON.parse(response.content);

  const replies = Array.isArray(parsed?.replies) ? parsed.replies : [];
  return replies
    .filter((r) => typeof r === 'string' && r.trim())
    .slice(0, safeCount)
    .map((text, index) => ({ id: index + 1, text: text.trim(), tone: safeTone }));
};

export { TONES };

/**
 * Turn a meeting transcript into action items and a summary.
 *
 * Both come from the model in one call. The transcript is whatever the user
 * pasted or recorded; we never invent attendees or deadlines. Action items are
 * returned with an `assignee` only when the model can attribute them from the
 * text — otherwise the field is null and the UI shows it as unassigned.
 */
export const summariseMeeting = async (transcript) => {
  const text = String(transcript || '').trim();
  if (!text) return { summary: '', actionItems: [] };

  const prompt = `Read the meeting transcript below and return a JSON object:
{
  "summary": "3-4 sentence neutral summary of what was discussed and decided",
  "actionItems": [
    { "text": "concrete next step", "assignee": "name if stated in the transcript, else null" }
  ]
}
Rules: at most 8 action items. Only include assignees who are named in the text. Invent nothing.

TRANSCRIPT:
"""${text.slice(0, 12000)}"""`;

  const response = await getChatCompletion(prompt, [], { temperature: 0.2, json: true });
  const parsed = JSON.parse(response.content);

  const actionItems = Array.isArray(parsed?.actionItems)
    ? parsed.actionItems
        .filter((item) => item && typeof item.text === 'string' && item.text.trim())
        .slice(0, 8)
        .map((item, index) => ({
          id: index + 1,
          text: item.text.trim(),
          assignee: typeof item.assignee === 'string' && item.assignee.trim() ? item.assignee.trim() : null,
        }))
    : [];

  return {
    summary: typeof parsed?.summary === 'string' ? parsed.summary : '',
    actionItems,
  };
};
