import { API_KEYS } from '../config/ApiConfig';

export const GeminiService = {
  askAI: async (prompt: string): Promise<string> => {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${API_KEYS.googleAI.model}:generateContent?key=${API_KEYS.googleAI.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `You are a helpful, spiritual, and scholarly Bible study assistant. Answer the following question with kindness and scripture references: ${prompt}` }]
          }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }
      return "I'm sorry, I couldn't find an answer at this moment.";
    } catch (error) {
      console.error('Gemini Error:', error);
      return "An error occurred while connecting to the AI guide.";
    }
  }
};
