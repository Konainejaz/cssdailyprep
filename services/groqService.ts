import Groq from 'groq-sdk';
import { Subject, Article, ResearchResult, QuizQuestion, Difficulty } from '../types';

// Initialize Groq client
// Note: In a production environment, use environment variables and a backend proxy to secure your API key.
const groq = new Groq({
  apiKey: (import.meta as any).env?.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Required for running directly in the browser
});

const MODEL_ID = 'llama-3.1-8b-instant';

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

  const subjectGuidelines = (() => {
    switch (subject) {
      case Subject.ESSAY:
        return `Formatting: Write each article's content as a mini-essay with an Introduction, Body, and Conclusion. Minimum 300 words. Use Markdown headings (## Introduction, ## Analysis, ## Conclusion). Include 2–3 references at the end.`;
      case Subject.ISLAMIAT:
        return `Formatting: Provide Qur'anic and Hadith context where relevant. Cite verses (Surah:Ayah) and Hadith books (e.g., Sahih Bukhari, Muslim) with numbers if known. Keep tone respectful and scholarly. Include 3 credible references.`;
      case Subject.CURRENT_AFFAIRS:
        return `Formatting: Include at least 3 recent data points (last 12 months) from reputable sources (e.g., SBP, PBS, World Bank). Provide a short policy analysis and 2 references.`;
      case Subject.PAK_AFFAIRS:
        return `Formatting: Blend historical context with present developments. Provide timelines or key milestones where appropriate. Include 2–3 references.`;
      case Subject.INT_RELATIONS:
        return `Formatting: Anchor analysis in IR theory (Realism, Liberalism, Constructivism) where applicable. Include scholars and dates. Add 2–3 academic references.`;
      case Subject.POLITICAL_SCIENCE:
        return `Formatting: Reference core theories and political thinkers. Provide definitions and applied examples in Pakistan's context. Include 2 references.`;
      case Subject.GENDER_STUDIES:
        return `Formatting: Use intersectional analysis and cite credible reports (UNDP, WB). Include 2–3 references.`;
      case Subject.FOREIGN_AFFAIRS:
        return `Formatting: Provide diplomatic context, treaties, and recent bilateral/multilateral developments with dates. Include 2–3 references.`;
      default:
        return `Formatting: Use clear sections with headings, provide brief references, and keep content actionable for CSS preparation.`;
    }
  })();

  const prompt = `
    Act as a highly experienced CSS (Central Superior Services) exam mentor in Pakistan.
    Create a daily digest of ${count} distinct, high-quality articles for the subject: "${subject}".
    
    The content must be strictly relevant to "${subject}" and:
    1. Current affairs affecting Pakistan (last 12 months) related to this subject.
    2. Core syllabus concepts for CSS specific to "${subject}".
    3. Critical analysis of recent events.
    
    Each article must have:
    - A professional title.
    - A concise summary (2 sentences).
    - A rich body content (Markdown formatted) that is informative. If the subject is Essay, ensure minimum 300 words; otherwise target at least 180–250 words.
    - A simulated "Source" (e.g., "DAWN", "The News", "Foreign Policy", "The Economist").
    - Estimated read time.
    - Tags (max 3).
    
    Additional formatting requirements for "${subject}": ${subjectGuidelines}
    
    Return a strict JSON object with a single key "articles" containing an array of article objects.
    Each article object should have keys: title, summary, content, source, readTime, tags.
    Ensure all strings are properly escaped for JSON.
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL_ID,
      response_format: { type: 'json_object' },
      temperature: 0.7, // Add some creativity but keep it structured
    });

    const responseText = completion.choices[0]?.message?.content || "{\"articles\": []}";
    const data = JSON.parse(responseText);
    const articlesRaw = data.articles || [];
    
    // Map to Article interface
    const articles = articlesRaw.map((item: any, index: number) => ({
      ...item,
      id: `${subject.replace(/\s/g, '')}-${Date.now()}-${index}`,
      subject: subject,
      date: new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })
    }));

    // 2. Save to Cache (if we got results)
    if (articles.length > 0) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(articles));
      } catch (e) {
        console.warn('Cache write error:', e);
      }
    }

    return articles;

  } catch (error) {
    console.error("Groq API Error (fetchDailyArticles):", error);
    return [];
  }
};
export const generateQuiz = async (subject: Subject, difficulty: Difficulty, count: number = 10): Promise<QuizQuestion[]> => {
  const prompt = `
    Create a Mock Exam (Quiz) of ${count} Multiple Choice Questions (MCQs) for the CSS subject: "${subject}".
    Difficulty Level: ${difficulty}.
    
    Questions should test:
    - Critical concepts
    - Dates and Events (if history/affairs)
    - Theoretical frameworks (if science/IR)
    
    Return a strict JSON object with a single key "questions" containing an array of question objects.
    Each question object must have:
    - id (integer)
    - question (string)
    - options (array of 4 strings)
    - correctAnswerIndex (integer 0-3)
    - explanation (string)
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL_ID,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || "{\"questions\": []}";
    const data = JSON.parse(responseText);
    return data.questions || [];
  } catch (error) {
    console.error("Groq API Error (generateQuiz):", error);
    return [];
  }
};
export const researchTopic = async (query: string): Promise<ResearchResult | null> => {
  const prompt = `
    Research the following topic for a CSS exam student in Pakistan. 
    Provide a comprehensive, fact-based answer with recent data, critical analysis, and relevance to the CSS syllabus. 
    Topic: "${query}"
    
    Since you cannot browse the live web, provide the best possible information from your training data.
    Also, list 3-5 credible sources (books, newspapers, reports) that would be relevant to this topic.
    
    Formatting rules based on topic type:
    - If the topic is an Essay or debate-style prompt: write a properly structured essay (Introduction, Body, Conclusion) with at least 300 words.
    - If the topic concerns Islamiat or Islamic studies: include Qur'anic and Hadith context with citations (Surah:Ayah; Book & Hadith number if known), remain respectful and scholarly.
    - If the topic concerns Current Affairs: include at least 3 recent (≤12 months) data points and cite sources.
    - Otherwise: target 200–300 words with clear sections and concise references.
    
    Return a strict JSON object with:
    1. "content": The comprehensive research answer in Markdown format. Use standard Markdown. Escape any double quotes inside the content string with a backslash.
    2. "sources": An array of objects, each with "title" (name of source) and "url" (URL or citation string).
    
    Example format:
    {
      "content": "# Title\\n\\nBody text with **bold**...",
      "sources": [{"title": "Source 1", "url": "..."}]
    }
  `;

  // First attempt: ask for strict JSON
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL_ID,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    let data: any = null;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }

    if (data && typeof data === 'object') {
      return {
        query,
        content: data.content || "No content generated.",
        sources: data.sources || []
      };
    }
  } catch (error) {
    console.warn('JSON response failed for researchTopic, attempting fallback...', error);
  }

  // Fallback: plain text with markers
  const plainPrompt = `
    Research Topic: "${query}"
    
    Provide a comprehensive answer in Markdown format.
    At the end, list 3-5 sources.
    
    Format your response exactly like this:
    
    [CONTENT_START]
    ... your markdown content here ...
    [CONTENT_END]
    
    [SOURCES_START]
    - Source Title 1 (URL)
    - Source Title 2 (URL)
    [SOURCES_END]
  `;

  try {
    const fallbackCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: plainPrompt }],
      model: MODEL_ID,
    });

    const text = fallbackCompletion.choices[0]?.message?.content || "";
    const contentMatch = text.match(/\[CONTENT_START\]([\s\S]*?)\[CONTENT_END\]/);
    const sourcesMatch = text.match(/\[SOURCES_START\]([\s\S]*?)\[SOURCES_END\]/);

    return {
      query,
      content: contentMatch ? contentMatch[1].trim() : text,
      sources: sourcesMatch ? [{ title: 'See text for sources', url: '#' }] : []
    };
  } catch (fallbackError) {
    console.error('Fallback generation failed:', fallbackError);
    return null;
  }
};
