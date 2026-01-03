
import { GoogleGenAI, Type } from "@google/genai";
import { HabitTask, SuperiorSelf, HistoryData, DayProgress, UserProfile, Language, CoachTone } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const calculateWeightedScore = (tasks: HabitTask[]) => {
  if (!tasks || tasks.length === 0) return 0;
  const totalPossible = tasks.reduce((sum, t) => sum + (t.weight * 4), 0);
  const current = tasks.reduce((sum, t) => sum + (t.weight * t.score), 0);
  return (current / (totalPossible || 1)) * 100;
};

export const getDailyStrategicBriefing = async (
  currentTasks: HabitTask[], 
  history: HistoryData,
  profile: UserProfile
) => {
  const lang = profile.language || 'fa';
  const tone = profile.coachTone || 'scientific';
  const todayScore = calculateWeightedScore(currentTasks);
  
  // Choose the best name to address the user
  const userName = profile.preferredName || profile.name || profile.telegramId || (lang === 'fa' ? 'قهرمان' : 'Hero');

  const summary = currentTasks.map(t => {
    let status = "";
    if (lang === 'fa') {
      status = t.score === 4 ? "عالی و کامل" : 
               t.score === 3 ? "خیلی خوب" : 
               t.score === 2 ? "متوسط" : 
               t.score === 1 ? "حداقلی" : "انجام نشده";
    } else {
      status = t.score === 4 ? "Excellent and complete" : 
               t.score === 3 ? "Very good" : 
               t.score === 2 ? "Average" : 
               t.score === 1 ? "Minimal" : "Not done";
    }
    return `- ${t.label}: ${status}`;
  }).join("\n");

  const weightContext = (profile.weightHistory && profile.weightHistory.length > 0)
    ? `User Weight History (recent first): ${profile.weightHistory.slice(-5).reverse().map(e => `${e.date}: ${e.weight}kg`).join(', ')}`
    : "";

  const toneInstructions = {
    strict: "Be very disciplined, direct, and results-oriented. Focus on accountability. If they missed something, point it out firmly.",
    compassionate: "Be very kind, empathetic, and focus on self-love. Celebrate small victories and encourage them gently even if they failed.",
    scientific: "Be analytical, use biohacking terminology, and focus on data-driven insights. Explain the physiological benefit of their actions.",
    enthusiastic: "Be high energy, use lots of exclamation marks and emojis. Be their ultimate hype person. Maximize motivation."
  };

  const specialConditions = profile.lifeContext 
    ? `IMPORTANT CONTEXT: The user has specified these current life conditions: "${profile.lifeContext}". Take this into account when analyzing their results.`
    : "";

  const prompt = `
    Your Role: You are an intelligent personal evolution coach named "Mane No".
    User Identification: Please address the user as "${userName}".
    Tone Preference: ${toneInstructions[tone]}
    Language: Please generate the response in ${lang === 'fa' ? 'Persian (Farsi)' : 'English'}.
    
    User Info:
    - Vision: ${profile.superiorSelf.vision}
    - Today's Performance: ${Math.round(todayScore)}%
    ${weightContext}
    ${specialConditions}
    
    Details:
    ${summary}

    Structure your report as follows:
    1. Intro: Greeting in your specific tone, addressing them as ${userName}.
    2. Bright Spots: Praise habits with a perfect score (4).
    3. Realistic Analysis: Find patterns and drops, considering context and weight changes if relevant.
    4. Strategy for Tomorrow: 1 or 2 practical steps.
    5. Conclusion: A powerful sentence that matches your tone.
    
    Use relevant emojis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return lang === 'fa' 
      ? "متاسفانه ارتباطم با مرکز پردازش قطع شده، اما یادت باشه که من همیشه کنارت هستم."
      : "Unfortunately, my connection to the processing center is lost, but remember I'm always by your side.";
  }
};

export const getPeriodicAIAnalysis = async (
  type: 'monthly' | 'all',
  history: HistoryData,
  profile: UserProfile
) => {
  const lang = profile.language || 'fa';
  const tone = profile.coachTone || 'scientific';
  const userName = profile.preferredName || profile.name || profile.telegramId || (lang === 'fa' ? 'قهرمان' : 'Hero');
  
  const historyEntries = Object.entries(history)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, type === 'monthly' ? 30 : 90);

  const historySummary = historyEntries.map(([date, data]) => {
    const dailyScore = data.tasks.reduce((sum, t) => sum + (t.weight * t.score), 0);
    const totalPossible = data.tasks.reduce((sum, t) => sum + (t.weight * 4), 0);
    const percentage = Math.round((dailyScore / (totalPossible || 1)) * 100);
    return `${date}: ${percentage}%`;
  }).join("\n");

  const weightSummary = profile.weightHistory ? `Weight Trend: ${profile.weightHistory.slice(-10).map(e => `${e.date}:${e.weight}`).join(' -> ')}` : "";

  const prompt = `
    Your Role: You are "Mane No", an advanced personal evolution coach.
    Address the user as: ${userName}.
    Tone Preference: Match this persona: ${tone}.
    Task: Provide a ${type === 'monthly' ? 'monthly' : 'comprehensive'} analysis of progress.
    Language: ${lang === 'fa' ? 'Persian (Farsi)' : 'English'}.
    
    User Profile:
    - Vision: ${profile.superiorSelf.vision}
    ${profile.lifeContext ? `User's overall life context: ${profile.lifeContext}` : ""}
    ${weightSummary}
    
    Historical Data (last ${type === 'monthly' ? '30' : '90'} days):
    ${historySummary}

    Analyze patterns and alignment with their vision, including weight evolution. Keep the tone empowerment-focused. Address them by their preferred name.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return lang === 'fa' 
      ? "در حال حاضر امکان تحلیل عمیق وجود ندارد."
      : "Deep analysis is currently unavailable.";
  }
};

export const getAIHabitSuggestions = async (superiorSelf: SuperiorSelf, lang: Language = 'fa') => {
  const prompt = `
    Role: You are the "Mane No" coach. Suggest 4 habits based on: "${superiorSelf.vision}".
    Language: Response must be in ${lang === 'fa' ? 'Persian' : 'English'}.
    Output ONLY JSON: [{"label": "...", "category": "HEALTH|MINDSET|ROUTINE|DIET", "weight": 2}]
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              category: { type: Type.STRING },
              weight: { type: Type.NUMBER }
            },
            required: ["label", "category", "weight"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch { return []; }
};

export const getAIEducationalQuiz = async (tasks: HabitTask[], lang: Language = 'fa') => {
  const habitsList = tasks.map(t => t.label).join(", ");
  const prompt = `
    Role: You are an educational coach for biohacking. 
    Based on these habits: [${habitsList}], generate 3 multiple-choice questions about the "WHY" (science/purpose).
    Language: ${lang === 'fa' ? 'Persian' : 'English'}.

    Output format JSON:
    [
      {
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "correctIndex": 0,
        "explanation": "..."
      }
    ]
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctIndex", "explanation"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) { return []; }
};
