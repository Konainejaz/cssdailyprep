import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL_ID = 'llama-3.1-8b-instant';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type, prompt } = req.body;

  if (!type || !prompt) {
    return res.status(400).json({ error: 'Type and prompt are required' });
  }

  try {
    const result = await fetchStudyMaterial(type, prompt);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Groq API Error:", error);
    return res.status(500).json({ error: 'Failed to fetch study material' });
  }
}

const fetchStudyMaterial = async (type, promptText) => {
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
      
      CRITICAL REQUIREMENT:
      The "arabic" field MUST contain ONLY pure Arabic text (UTF-8).
      - ABSOLUTELY NO English characters, numbers, punctuation like "rdf.", or formatting symbols in the "arabic" field.
      - If you are not 100% sure of the exact Arabic text, do not invent it.
      
      Return a strict JSON object with a key "items" containing an array of objects.
      Each object must have: 
      - "arabic" (string, ONLY ARABIC CHARACTERS. Example: "الله نور السماوات والأرض")
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
    const targetModel = (type === 'ISLAMIAT' || type === 'ISLAMIAT_DETAIL') 
      ? 'llama-3.3-70b-versatile' 
      : MODEL_ID;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: fullPrompt }],
      model: targetModel,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || "{\"items\": []}";
    const data = JSON.parse(responseText);
    
    if (type === 'TIMELINE_DETAIL') return data.details || {};
    if (type === 'ESSAY_DETAIL') return data.content || "";
    if (type === 'ISLAMIAT_DETAIL') return data.details || {};
    
    if (type === 'ISLAMIAT') {
      const items = data.items || [];
      return items.map((item) => ({
        ...item,
        arabic: item.arabic ? item.arabic.replace(/[a-zA-Z]/g, '') : item.arabic
      }));
    }

    return data.items || [];
  } catch (error) {
    console.error("Groq API Error (fetchStudyMaterial):", error);
    throw error;
  }
};
