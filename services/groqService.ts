import Groq from 'groq-sdk';
import { 
  Subject, Article, ResearchResult, QuizQuestion, Difficulty,
  StudyTimelineItem, StudyVocabItem, StudyEssayItem, StudyIslamiatItem
} from '../types';
import { getQuestionBank, saveQuestionsToBank, getSeenQuestions } from './storageService';
import { COMPULSORY_SUBJECTS, OPTIONAL_SUBJECTS } from '../constants';

// Initialize Groq client
// Note: In a production environment, use environment variables and a backend proxy to secure your API key.
const groq = new Groq({
  apiKey: (import.meta as any).env?.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Required for running directly in the browser
});

const MODEL_ID = 'llama-3.1-8b-instant';

// Helper to fix double-escaped unicode characters (e.g. \\u2019 -> ’)
const cleanText = (text: string): string => {
  if (!text) return "";
  return text.replace(/\\u([\d\w]{4})/gi, (match, grp) => {
    return String.fromCharCode(parseInt(grp, 16));
  });
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

  const subjectGuidelines = (() => {
    if (subject === Subject.ALL) {
      return `Formatting: Provide a diverse mix of articles: 2 from Pakistan Affairs, 2 from International Relations, and 2 from Current Affairs/Economy. Ensure a balanced perspective relevant to CSS exams.`;
    }
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
    
    The content must be strictly relevant to "${subject}" (or General CSS Topics if 'All Subjects') and:
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
      title: cleanText(item.title),
      summary: cleanText(item.summary),
      content: cleanText(item.content),
      source: cleanText(item.source),
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
  // 1. Determine target subjects for filtering/generation
  let targetSubjects: string[] = [];
  if (subject === Subject.ALL_COMPULSORY) {
    targetSubjects = COMPULSORY_SUBJECTS;
  } else if (subject === Subject.ALL_OPTIONAL) {
    targetSubjects = OPTIONAL_SUBJECTS;
  } else {
    targetSubjects = [subject];
  }

  // 2. Try to fetch from Bank
  const bank = getQuestionBank();
  const seen = new Set(getSeenQuestions());
  
  // Find valid questions from bank: match subject, match difficulty, not seen
  // Note: We check if q.subject is in targetSubjects. If q.subject is undefined, we skip it for safety unless we're in a lenient mode.
  const validFromBank = bank.filter(q => 
    (q.subject && targetSubjects.includes(q.subject)) && 
    q.difficulty === difficulty && 
    !seen.has(q.question)
  );
  
  // Shuffle and pick
  const shuffledBank = validFromBank.sort(() => 0.5 - Math.random());
  const selectedFromBank = shuffledBank.slice(0, count);
  
  if (selectedFromBank.length >= count) {
    return selectedFromBank;
  }
  
  // 3. Generate remaining needed
  const needed = count - selectedFromBank.length;
  
  const promptSubject = subject === Subject.ALL_COMPULSORY ? "Compulsory Subjects (Essay, Pak Affairs, Current Affairs, Islamiat)" :
                        subject === Subject.ALL_OPTIONAL ? "Optional Subjects (IR, Pol Science, Gender Studies)" :
                        subject;

  const prompt = `
    Create a Mock Exam (Quiz) of ${needed} Multiple Choice Questions (MCQs) for the CSS subject: "${promptSubject}".
    Difficulty Level: ${difficulty}.
    
    Questions should be RANDOM and diverse.
    ${subject === Subject.ALL_COMPULSORY || subject === Subject.ALL_OPTIONAL ? "Ensure a mix of questions from the different included subjects." : ""}
    
    Return a strict JSON object with a single key "questions" containing an array of question objects.
    Each question object must have:
    - id (integer)
    - question (string)
    - options (array of 4 strings)
    - correctAnswerIndex (integer 0-3)
    - explanation (string)
    - subject (string, the specific subject this question belongs to. e.g. "Pak Affairs")
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL_ID,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || "{\"questions\": []}";
    const data = JSON.parse(responseText);
    let generatedQuestions: QuizQuestion[] = data.questions || [];
    
    // Post-process: Add metadata if missing
    generatedQuestions = generatedQuestions.map((q, idx) => ({
      ...q,
      subject: q.subject || (targetSubjects.length === 1 ? targetSubjects[0] : subject), // Fallback
      difficulty: difficulty
    }));
    
    // Filter out any that might be in seen list (unlikely but possible)
    generatedQuestions = generatedQuestions.filter(q => !seen.has(q.question));
    
    // Save to bank
    saveQuestionsToBank(generatedQuestions);
    
    return [...selectedFromBank, ...generatedQuestions];
    
  } catch (error) {
    console.error("Groq API Error (generateQuiz):", error);
    return selectedFromBank; // Return what we have
  }
};
export const researchTopic = async (query: string): Promise<ResearchResult | null> => {
  const prompt = `
    Research the following topic for a Central Superior Services (CSS) exam student in Pakistan. 
    
    CRITICAL CONTEXT INSTRUCTIONS:
    1. STRICTLY EXCLUDE any information related to "Cascading Style Sheets" (web development), HTML, CSS coding, or programming.
    2. Focus ONLY on the Civil Service/Competitive Exam system in Pakistan conducted by FPSC.
    3. Ensure all content is relevant to Pakistan's administrative services, government structure, or current affairs as per the CSS syllabus.

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

export const researchWithImages = async (query: string, images: string[]): Promise<ResearchResult | null> => {
  const prompt = `
    Analyze the provided images and the user's query: "${query}"
    
    Context: You are a Central Superior Services (CSS) exam mentor in Pakistan.
    
    1. Analyze the images in detail (look for charts, text, maps, or relevant visual data).
    2. Integrate the visual findings with the user's query.
    3. Provide a structured research output relevant to CSS subjects (Current Affairs, Pak Affairs, IR, etc.).
    
    Return a strict JSON object with:
    1. "content": A comprehensive Markdown analysis merging image insights and query context.
    2. "sources": Array of likely sources or references.
    3. "mindMap": A hierarchical structure representing the key concepts.
       - Root node: Main topic
       - Children: Subtopics/Findings
       - Each node has: "id" (unique string), "label" (short title), "details" (brief explanation), "children" (array of nodes).
    
    Example Mind Map Structure:
    {
      "id": "root",
      "label": "Climate Change in Pakistan",
      "children": [
        { "id": "1", "label": "Causes", "details": "...", "children": [...] },
        { "id": "2", "label": "Impacts", "details": "...", "children": [...] }
      ]
    }
  `;

  try {
    const messages: any[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...images.map(img => ({
            type: 'image_url',
            image_url: { 
              url: img,
              detail: 'auto'
            }
          }))
        ]
      }
    ];

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 4000,
    });
    
    const responseText = completion.choices[0]?.message?.content || "{}";
    
    try {
      const data = JSON.parse(responseText);
      return {
        query,
        content: data.content || "No content generated.",
        sources: data.sources || [],
        mindMap: data.mindMap
      };
    } catch (parseError) {
      console.error("JSON Parse Error in Vision:", parseError);
      console.log("Raw Response:", responseText);
      // Fallback: Return raw text as content if JSON fails
      return {
        query,
        content: responseText,
        sources: [],
        mindMap: null
      };
    }

  } catch (error: any) {
    console.error("Groq Vision API Error:", error);
    // Log more details if available
    if (error?.error) {
        console.error("API Error Details:", error.error);
    }
    return null;
  }
};

export const fetchStudyMaterial = async (
  type: 'TIMELINE' | 'VOCAB' | 'ESSAY' | 'ISLAMIAT' | 'TIMELINE_DETAIL' | 'ESSAY_DETAIL' | 'ISLAMIAT_DETAIL',
  promptText: string
): Promise<any> => {
  let systemPrompt = '';
  
  switch (type) {
    case 'TIMELINE':
      systemPrompt = `You are a historian and Central Superior Services (CSS) exam expert. Create a comprehensive timeline of events based on the request.
      Return a strict JSON object with a key "items" containing an array of at least 15 objects.
      Each object must have: 
      - "id" (string, unique)
      - "date" (string)
      - "title" (string)
      - "description" (string, max 30 words)
      - "category" (string)
      - "content" (string, detailed summary approx 100 words)
      - "source" (string)
      - "tags" (array of strings)`;
      break;
    case 'TIMELINE_DETAIL':
      systemPrompt = `You are a Central Superior Services (CSS) Current Affairs expert. Provide a comprehensive detailed analysis for the given event.
      Return a strict JSON object with a key "details" object.
      The object must have:
      - "content" (string, markdown formatted, MINIMUM 1000 WORDS. Must cover: Introduction, Historical Background, Key Events, Implications for Pakistan & Global Politics, Critical Analysis, Conclusion. Do NOT use nested objects, just one long markdown string.)
      - "imagePrompt" (string, description for an image representing the event)
      - "imageKeyword" (string, a single precise English keyword to generate an image, e.g. "Diplomacy", "War", "Economy")
      - "source" (string)
      - "tags" (array of strings)`;
      break;
    case 'VOCAB':
      systemPrompt = `You are an English language expert for Central Superior Services (CSS) exams. Provide advanced vocabulary words.
      Return a strict JSON object with a key "items" containing an array of objects.
      Each object must have: "word" (string), "meaning" (string), "sentence" (string), "type" (string, e.g., Noun, Verb).`;
      break;
    case 'ESSAY':
      systemPrompt = `You are a Central Superior Services (CSS) Essay expert. Provide essay topics and outlines.
      Return a strict JSON object with a key "items" containing an array of objects.
      Each object must have: 
      - "id" (string, unique)
      - "title" (string)
      - "outline" (array of strings representing main points).`;
      break;
    case 'ESSAY_DETAIL':
      systemPrompt = `You are a Central Superior Services (CSS) Essay expert. Write a MONUMENTAL, ACADEMIC MASTERPIECE based on the title and outline provided.
      
      Requirements:
      1. **EXTREME LENGTH**: The essay MUST be at least 2500-3000 words. Do not hold back. Expand every point exhaustively.
      2. **Structure**: 
         - **Introduction**: 2-3 paragraphs ending with a strong thesis.
         - **Body**: 15-20 paragraphs. Each must have a clear topic sentence, evidence, critical analysis, and transition.
         - **Conclusion**: 2-3 paragraphs synthesizing arguments.
      3. **Tone**: Highly formal, academic, and sophisticated vocabulary. No conversational fillers.
      4. **Formatting**: 
         - Use Markdown headers (##) for main sections. 
         - Use **bold** for key terms.
         - Ensure paragraphs are long and detailed.
      5. **Content**:
         - DO NOT simply reprint the outline.
         - DO NOT write "Here is the essay...".
         - START DIRECTLY with the Introduction.
         - Ensure the content is the FULL ESSAY text, not a summary.
      
      Return a strict JSON object with a key "content". 
      IMPORTANT: The value of "content" must be a SINGLE string containing the entire markdown text. Do NOT return an object or array for "content".`;
      break;
    case 'ISLAMIAT':
      systemPrompt = `You are an Islamic Scholar and Central Superior Services (CSS) expert. Provide a curated list of KEY Quranic verses and Hadiths essential for major CSS Islamiat topics (e.g., Governance, Human Rights, Women's Rights, Social Justice, Tauheed, Risalat).
      Return a strict JSON object with a key "items" containing an array of objects.
      Each object must have: 
      - "arabic" (string, MUST BE PROPER UTF-8 ARABIC TEXT like "الله", NOT unicode escape sequences like "\\u0627")
      - "translation" (string, clear and eloquent English)
      - "reference" (string, e.g., "Surah Al-Baqarah 2:256" or "Sahih Bukhari, Book of Knowledge")
      - "context" (string, specifically explaining which CSS topics this verse/hadith can be quoted in and why).`;
      break;
    case 'ISLAMIAT_DETAIL':
      systemPrompt = `You are an Islamic Scholar and Central Superior Services (CSS) expert. Provide a detailed analysis of the given verse/Hadith specifically for CSS exams.
      Return a strict JSON object with a key "details" object.
      The object must have:
      - "analysis" (string, detailed explanation of the verse/hadith. If quoting Arabic, use UTF-8 characters, NOT unicode escapes)
      - "cssRelevance" (string, how to quote this in essays, ISLAMIAT, or current affairs papers)
      - "relatedTopics" (array of strings, e.g. "Human Rights", "Women's Rights", "Governance")
      - "keyTakeaways" (array of strings, bullet points for memorization)`;
      break;
  }

  const fullPrompt = `
    ${systemPrompt}
    
    User Request: "${promptText}"
    
    Ensure the response is valid JSON.
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: fullPrompt }],
      model: MODEL_ID,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || "{\"items\": []}";
    const data = JSON.parse(responseText);
    
    if (type === 'TIMELINE_DETAIL') return data.details || {};
    if (type === 'ESSAY_DETAIL') return data.content || "";
    if (type === 'ISLAMIAT_DETAIL') return data.details || {};
    
    return data.items || [];
  } catch (error) {
    console.error("Groq API Error (fetchStudyMaterial):", error);
    return [];
  }
};
