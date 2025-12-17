import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL_ID = 'llama-3.1-8b-instant';

const cleanText = (text) => {
  if (!text) return "";
  return text.replace(/\\u([\d\w]{4})/gi, (match, grp) => {
    return String.fromCharCode(parseInt(grp, 16));
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subject, count = 6 } = req.body;

  const subjectGuidelines = (() => {
    if (subject === 'All Subjects') {
      return `Formatting: Provide a diverse mix of articles: 2 from Pakistan Affairs, 2 from International Relations, and 2 from Current Affairs/Economy. Ensure a balanced perspective relevant to CSS exams.`;
    }
    // ... Simplified switch or copy full logic
    return `Formatting: Use clear sections with headings, provide brief references, and keep content actionable for CSS preparation.`;
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
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || "{\"articles\": []}";
    const data = JSON.parse(responseText);
    const articlesRaw = data.articles || [];
    
    const articles = articlesRaw.map((item, index) => ({
      ...item,
      title: cleanText(item.title),
      summary: cleanText(item.summary),
      content: cleanText(item.content),
      source: cleanText(item.source),
      id: `${subject.replace(/\s/g, '')}-${Date.now()}-${index}`,
      subject: subject,
      date: new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })
    }));

    return res.status(200).json(articles);

  } catch (error) {
    console.error("Groq API Error:", error);
    return res.status(500).json({ error: 'Failed to fetch articles' });
  }
}
