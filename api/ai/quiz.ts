import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL_ID = 'llama-3.1-8b-instant';

const COMPULSORY_SUBJECTS = [
  "English Essay",
  "English (Precis and Composition)",
  "General Science & Ability",
  "Current Affairs",
  "Pak Affairs",
  "Islamiat",
  "Comparative Study of Major Religions"
];
const OPTIONAL_SUBJECTS = ["International Relations", "Political Science", "Foreign Affairs", "Gender Studies"];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subject, difficulty, count = 10 } = req.body;

  if (!subject || !difficulty) {
    return res.status(400).json({ error: 'Subject and difficulty are required' });
  }

  try {
    const questions = await generateQuiz(subject, difficulty, count);
    return res.status(200).json(questions);
  } catch (error) {
    console.error("Groq API Error:", error);
    return res.status(500).json({ error: 'Failed to generate quiz' });
  }
}

const generateQuiz = async (subject, difficulty, count) => {
  const promptSubject = subject === "All Compulsory Subjects" ? "Compulsory Subjects (English Essay, English Precis & Composition, General Science & Ability, Current Affairs, Pakistan Affairs, Islamiat OR Comparative Religions)" :
                        subject === "All Optional Subjects" ? "Optional Subjects (IR, Pol Science, Gender Studies)" :
                        subject;

  const prompt = `
    Create a Mock Exam (Quiz) of ${count} Multiple Choice Questions (MCQs) for the CSS subject: "${promptSubject}".
    Difficulty Level: ${difficulty}.
    
    Questions should be RANDOM and diverse.
    ${subject.includes("All") ? "Ensure a mix of questions from the different included subjects." : ""}
    
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
    let generatedQuestions = data.questions || [];
    
    // Post-process: Add metadata if missing
    generatedQuestions = generatedQuestions.map((q) => ({
      ...q,
      subject: q.subject || subject, 
      difficulty: difficulty
    }));
    
    return generatedQuestions;
    
  } catch (error) {
    console.error("Groq API Error (generateQuiz):", error);
    throw error;
  }
};
