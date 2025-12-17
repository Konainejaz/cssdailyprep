import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL_ID = 'llama-3.1-8b-instant';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query, images } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    if (images && images.length > 0) {
      const result = await researchWithImages(query, images);
      return res.status(200).json(result);
    } else {
      const result = await researchTopic(query);
      return res.status(200).json(result);
    }
  } catch (error) {
    console.error("Groq API Error:", error);
    return res.status(500).json({ error: 'Failed to perform research' });
  }
}

const researchTopic = async (query) => {
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
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL_ID,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(responseText);
    
    return {
      query,
      content: data.content || "No content generated.",
      sources: data.sources || []
    };
  } catch (error) {
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
      throw fallbackError;
    }
  }
};

const researchWithImages = async (query, images) => {
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
  `;

  try {
    const messages: any = [
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
      messages,
      model: 'meta-llama/llama-3.2-90b-vision-preview', // Updated vision model
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 4000,
    });
    
    const responseText = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(responseText);
      
    return {
      query,
      content: data.content || "No content generated.",
      sources: data.sources || [],
      mindMap: data.mindMap
    };

  } catch (error) {
    console.error("Groq Vision API Error:", error);
    return {
       query,
       content: "Error processing vision request.",
       sources: [],
       mindMap: null
    };
  }
};
