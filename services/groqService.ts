import Groq from 'groq-sdk';
import { 
  Subject, Article, ResearchResult, QuizQuestion, Difficulty
} from '../types';
import { getQuestionBank, saveQuestionsToBank, getSeenQuestions } from './storageService';
import { COMPULSORY_SUBJECTS, MOCK_ARTICLES, OPTIONAL_SUBJECTS } from '../constants';

// Helper to fix double-escaped unicode characters (e.g. \u2019 -> ’)
const cleanText = (text: string): string => {
  if (!text) return "";
  return text.replace(/\\u([\d\w]{4})/gi, (match, grp) => {
    return String.fromCharCode(parseInt(grp, 16));
  });
};

const getGroqApiKey = (): string | null => {
  const key =
    import.meta.env.VITE_GROQ_API_KEY ||
    (process.env.GROQ_API_KEY as unknown as string | undefined);

  if (!key) return null;
  const trimmed = key.trim();
  return trimmed ? trimmed : null;
};

// Initialize Groq client
const apiKey = getGroqApiKey();
const groq = new Groq({
  apiKey: apiKey || 'dummy_key', // Prevent crash on init if key missing, checks in calls
  dangerouslyAllowBrowser: true // Required for client-side use
});

const extractJsonFromText = (text: string): string => {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');

  const hasObject = firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace;
  const hasArray = firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket;

  if (hasArray && (!hasObject || firstBracket < firstBrace)) {
    return trimmed.slice(firstBracket, lastBracket + 1);
  }
  if (hasObject) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
};

const groqGenerateText = async (prompt: string, model: string = "llama-3.1-8b-instant"): Promise<string> => {
  if (!apiKey) throw new Error('Missing Groq API key');

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model,
      temperature: 0.7,
      max_tokens: 2048,
    });

    return cleanText(completion.choices[0]?.message?.content || "");
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
};

const groqGenerateJson = async <T,>(prompt: string, model: string = "llama-3.1-8b-instant"): Promise<T> => {
  if (!apiKey) throw new Error('Missing Groq API key');

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model,
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(content) as T;
  } catch (error) {
    // Fallback: try standard generation and extract JSON if json_object mode fails or is not supported for the model
    console.warn("Groq JSON mode failed or error, retrying with text extraction...", error);
    const text = await groqGenerateText(prompt + "\n\nIMPORTANT: Return ONLY valid JSON.", model);
    const jsonText = extractJsonFromText(text);
    return JSON.parse(jsonText) as T;
  }
};

export const fetchDailyArticles = async (subject: Subject, count: number = 6): Promise<Article[]> => {
  // 1. Check Cache
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `css_articles_${subject.replace(/\s/g, '_')}_${today}`;
  
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`[Cache Hit] Serving articles for ${subject}`);
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }

  try {
    const articles = await groqGenerateJson<{ articles: Article[] } | Article[]>(
      [
        `Generate ${count} current-affairs style study articles for CSS preparation.`,
        `Subject: ${subject}.`,
        `Return ONLY valid JSON (no markdown, no explanations).`,
        `Response must be an OBJECT with key "articles" containing an array of objects.`,
        `Schema: { "articles": [{ "id": string, "title": string, "summary": string, "content": string, "subject": string, "source": string, "date": string, "readTime": string, "tags": string[] }] }`,
        `- content: markdown with headings + bullet points + 2-3 key takeaways`,
        `- subject: exactly "${subject}" unless subject is "${Subject.ALL}" then mix subjects`,
        `- source: a plausible Pakistani/international source name (e.g. Dawn, The Economist)`,
        `- date: YYYY-MM-DD (today)`,
        `- readTime: e.g. "5 min"`,
        `- tags: array of 3-6 short tags`
      ].join('\n')
    );

    let rawArticles: any[] = [];
    if (Array.isArray(articles)) {
      rawArticles = articles;
    } else if (articles && typeof articles === 'object' && 'articles' in articles) {
      rawArticles = (articles as any).articles;
    }

    const normalized = rawArticles
      .filter(Boolean)
      .slice(0, count)
      .map((a: any, idx: number) => ({
        id: typeof a.id === 'string' && a.id ? a.id : `${today}-${subject}-${idx}`,
        title: typeof a.title === 'string' ? a.title : 'Untitled',
        summary: typeof a.summary === 'string' ? a.summary : '',
        content: typeof a.content === 'string' ? a.content : '',
        subject: (a.subject as Subject) || subject,
        source: typeof a.source === 'string' ? a.source : 'Study Brief',
        date: typeof a.date === 'string' && a.date ? a.date : today,
        readTime: typeof a.readTime === 'string' ? a.readTime : '5 min',
        tags: Array.isArray(a.tags) ? a.tags.filter((t: any) => typeof t === 'string') : []
      })) as Article[];

    // 2. Save to Cache
    if (normalized.length > 0) {
      localStorage.setItem(cacheKey, JSON.stringify(normalized));
    }

    return normalized;
  } catch (error) {
    console.error("Fetch Daily Articles Error:", error);
    const fallback =
      subject === Subject.ALL
        ? MOCK_ARTICLES
        : MOCK_ARTICLES.filter(a => a.subject === subject);
    return fallback.slice(0, count);
  }
};

export const generateQuiz = async (subject: Subject, difficulty: Difficulty, count: number = 10): Promise<QuizQuestion[]> => {
  // 1. Determine target subjects for filtering
  let targetSubjects: string[] = [];
  if (subject === Subject.ALL_COMPULSORY) {
    targetSubjects = COMPULSORY_SUBJECTS;
  } else if (subject === Subject.ALL_OPTIONAL) {
    targetSubjects = OPTIONAL_SUBJECTS;
  } else {
    targetSubjects = [subject];
  }

  // 2. Try to fetch from Bank (Local optimization)
  const bank = getQuestionBank();
  const seen = new Set(getSeenQuestions());
  
  const validFromBank = bank.filter(q => 
    (q.subject && targetSubjects.includes(q.subject)) && 
    q.difficulty === difficulty && 
    !seen.has(q.question)
  );
  
  const shuffledBank = validFromBank.sort(() => 0.5 - Math.random());
  const selectedFromBank = shuffledBank.slice(0, count);
  
  if (selectedFromBank.length >= count) {
    return selectedFromBank;
  }
  
  // 3. Generate remaining needed
  const needed = count - selectedFromBank.length;

  try {
    const response = await groqGenerateJson<{ questions: QuizQuestion[] }>(
      [
        `Generate ${needed} multiple-choice quiz questions for CSS exam preparation.`,
        `Subject: ${subject}. Difficulty: ${difficulty}.`,
        `Return ONLY valid JSON.`,
        `Response must be an OBJECT with key "questions" containing an array.`,
        `Schema: { "questions": [{ "id": number, "question": string, "options": string[], "correctAnswerIndex": number, "explanation": string, "subject": string, "difficulty": string }] }`,
        `- options: array of exactly 4 strings`,
        `- correctAnswerIndex: 0-3`,
        `- explanation: 2-4 sentences`
      ].join('\n')
    );

    const generatedQuestions = response.questions || [];

    const normalized = generatedQuestions
      .filter(Boolean)
      .slice(0, needed)
      .map((q: any, idx: number) => ({
        id: typeof q.id === 'number' ? q.id : Date.now() + idx,
        question: typeof q.question === 'string' ? q.question : '',
        options: Array.isArray(q.options) ? q.options.slice(0, 4).map((o: any) => String(o)) : [],
        correctAnswerIndex:
          typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
        explanation: typeof q.explanation === 'string' ? q.explanation : '',
        subject: typeof q.subject === 'string' ? q.subject : subject,
        difficulty: typeof q.difficulty === 'string' ? q.difficulty : difficulty
      })) as QuizQuestion[];

    // Save to bank
    saveQuestionsToBank(normalized);
    
    return [...selectedFromBank, ...normalized];
  } catch (error) {
    console.error("Generate Quiz Error:", error);
    return selectedFromBank;
  }
};

export const researchTopic = async (query: string): Promise<ResearchResult | null> => {
  try {
    const result = await groqGenerateJson<ResearchResult>(
      [
        `You are a CSS exam research assistant.`,
        `User query: ${query}`,
        `Return ONLY valid JSON.`,
        `Schema: { "query": string, "content": string, "sources": [{"title": string, "url": string}], "mindMap"?: { "id": string, "label": string, "details"?: string, "children"?: [...] } }`,
        `- content must be markdown with headings, bullet points, and a short conclusion.`,
        `- sources must include 4-8 reputable sources with real-looking URLs.`,
        `- mindMap should include 3-6 top-level children with 1-3 sub-children each.`
      ].join('\n')
    );

    if (!result || typeof result !== 'object') return null;
    return {
      query: typeof result.query === 'string' ? result.query : query,
      content: typeof result.content === 'string' ? cleanText(result.content) : '',
      sources: Array.isArray(result.sources) ? result.sources : [],
      mindMap: (result as any).mindMap
    };
  } catch (error) {
    console.error("Research Topic Error:", error);
    return null;
  }
};

export const researchWithImages = async (query: string, images: string[]): Promise<ResearchResult | null> => {
  if (!apiKey) throw new Error('Missing Groq API key');
  try {
    // Construct messages for vision model
    const userContent: any[] = [{ type: "text", text: `You are a CSS exam research assistant. User query: ${query}. Analyze the provided images as supporting context.` }];
    
    // Add images
    images.forEach(img => {
      userContent.push({
        type: "image_url",
        image_url: {
          url: img // Assuming img is base64 data url like "data:image/jpeg;base64,..."
        }
      });
    });

    userContent.push({ type: "text", text: `Return ONLY valid JSON. Schema: { "query": string, "content": string, "sources": [{"title": string, "url": string}], "mindMap"?: { "id": string, "label": string, "details"?: string, "children"?: [...] } }` });

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: userContent }],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.5,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content) as ResearchResult;

    if (!result || typeof result !== 'object') return null;
    return {
      query: typeof result.query === 'string' ? result.query : query,
      content: typeof result.content === 'string' ? cleanText(result.content) : '',
      sources: Array.isArray(result.sources) ? result.sources : [],
      mindMap: (result as any).mindMap
    };
  } catch (error) {
    console.error("Research with Images Error:", error);
    return null;
  }
};

export const fetchStudyMaterial = async (
  type: 'TIMELINE' | 'VOCAB' | 'ESSAY' | 'ISLAMIAT' | 'TIMELINE_DETAIL' | 'ESSAY_DETAIL' | 'ISLAMIAT_DETAIL',
  prompt: string
): Promise<any> => {
  try {
    if (type === 'ESSAY_DETAIL') {
      const res = await groqGenerateJson<{ content: string } | string>(
        [
          `Write a full CSS-style essay (1200-1800 words) based on this outline.`,
          `Return ONLY JSON.`,
          `If returning an object, use { "content": string }.`,
          `Outline:\n${prompt}`
        ].join('\n')
      );
      if (typeof res === 'string') return cleanText(res);
      return cleanText((res as any)?.content || '');
    }

    if (type === 'TIMELINE_DETAIL') {
      return await groqGenerateJson<any>(
        [
          `Expand this timeline event into a detailed analysis (350-550 words) for CSS preparation.`,
          `Return ONLY JSON.`,
          `Schema: { "content": string, "source"?: string, "tags"?: string[], "imagePrompt"?: string, "imageKeyword"?: string }`,
          `Content must be markdown with headings + bullet points.`,
          `Context:\n${prompt}`
        ].join('\n')
      );
    }

    if (type === 'ISLAMIAT_DETAIL') {
      return await groqGenerateJson<any>(
        [
          `Expand the Islamiat reference into CSS exam-ready notes.`,
          `Return ONLY JSON.`,
          `Schema: { "analysis": string, "cssRelevance": string, "relatedTopics": string[], "keyTakeaways": string[] }`,
          `Use short markdown in analysis and cssRelevance.`,
          `Context:\n${prompt}`
        ].join('\n')
      );
    }

    if (type === 'VOCAB') {
      const res = await groqGenerateJson<{ items: any[] }>(
        [
          `Generate 20 high-utility vocabulary entries for CSS exam writing.`,
          `Return ONLY JSON.`,
          `Schema: { "items": [{ "word": string, "meaning": string, "sentence": string, "type"?: string }] }`,
          `Prompt:\n${prompt}`
        ].join('\n')
      );
      return res.items || [];
    }

    if (type === 'ESSAY') {
      const res = await groqGenerateJson<{ topics: any[] }>(
        [
          `Generate 10 predicted CSS essay topics with outlines.`,
          `Return ONLY JSON.`,
          `Schema: { "topics": [{ "id"?: string, "title": string, "outline": string[] }] }`,
          `Prompt:\n${prompt}`
        ].join('\n')
      );
      return res.topics || [];
    }

    if (type === 'ISLAMIAT') {
      const res = await groqGenerateJson<{ references: any[] }>(
        [
          `Generate a list of 15 Islamiat Quranic verses or Hadith references useful for CSS exam.`,
          `Return ONLY JSON.`,
          `Schema: { "references": [{ "id"?: string, "arabic": string, "translation": string, "reference": string, "context": string }] }`,
          `Prompt:\n${prompt}`
        ].join('\n')
      );
      return res.references || [];
    }

    const res = await groqGenerateJson<{ timeline: any[] }>(
      [
        `Generate a 12-month current affairs timeline for CSS preparation.`,
        `Return ONLY JSON.`,
        `Schema: { "timeline": [{ "id"?: string, "date": string, "title": string, "description": string, "category"?: string }] }`,
        `Prompt:\n${prompt}`
      ].join('\n')
    );
    return res.timeline || [];

  } catch (error) {
    console.error("Fetch Study Material Error:", error);
    if (type === 'ESSAY_DETAIL') return '';
    if (type === 'TIMELINE_DETAIL') return { content: '' };
    if (type === 'ISLAMIAT_DETAIL') return { analysis: '', cssRelevance: '', relatedTopics: [], keyTakeaways: [] };
    return [];
  }
};

export const fetchSummarization = async (text: string): Promise<string> => {
  try {
    const res = await groqGenerateJson<{ summary: string }>(
      [
        `Summarize the following text for a student preparing for CSS(Central Superior Services) exams.`,
        `Return ONLY JSON.`,
        `Schema: { "summary": string }`,
        `Summary should be concise, capturing main points, and formatted in markdown.`,
        `Text:\n${text.substring(0, 15000)}` // Truncate to avoid token limits
      ].join('\n')
    );
    return cleanText(res.summary || '');
  } catch (error) {
    console.error("Summarization Error:", error);
    return "Failed to generate summary.";
  }
};

export const fetchFlashcards = async (topic: string): Promise<Array<{ front: string, back: string }>> => {
  try {
    const res = await groqGenerateJson<{ flashcards: Array<{ front: string, back: string }> }>(
      [
        `Generate 10 flashcards for the topic: "${topic}" for CSS(Central Superior Services) preparation.`,
        `Return ONLY JSON.`,
        `Schema: { "flashcards": [{ "front": string, "back": string }] }`,
        `Front should be a question or term. Back should be the answer or definition (short and precise).`
      ].join('\n')
    );
    return res.flashcards || [];
  } catch (error) {
    console.error("Flashcard Generation Error:", error);
    return [];
  }
};
