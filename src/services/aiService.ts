import { BibleVerse } from '../types';
import { config } from '../config';

export interface AIResponse {
  text: string;
  references?: string[];
  suggestedQuestions?: string[];
}

export interface StudyGuide {
  title: string;
  introduction: string;
  sections: {
    heading: string;
    content: string;
    verseRefs: string[];
  }[];
  conclusion: string;
  reflectionQuestions: string[];
}

// AI Service capable of switching between Mock and Real API
class AIService {
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Ask a question to the AI about the Bible
   */
  async askQuestion(question: string, context?: string): Promise<AIResponse> {
    if (config.openai.apiKey) {
      return this.askRealAI(question, context);
    }
    return this.askMockAI(question);
  }

  /**
   * Generate a study guide for a specific Bible passage
   */
  async generateStudyGuide(book: string, chapter: number): Promise<StudyGuide> {
    if (config.openai.apiKey) {
      return this.generateRealStudyGuide(book, chapter);
    }
    return this.generateMockStudyGuide(book, chapter);
  }

  // --- Real API Implementations ---

  private async askRealAI(question: string, context?: string): Promise<AIResponse> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openai.apiKey}`,
        },
        body: JSON.stringify({
          model: config.openai.model,
          messages: [
            {
              role: 'system',
              content: `You are a helpful, spiritual Bible study assistant.
                        Context: ${context || 'General Bible Study'}.
                        Provide answers that are scripture-centered, warm, and kind.
                        Include relevant Bible references.
                        Format the response as JSON with keys: text, references (array of strings), suggestedQuestions (array of strings).`
            },
            { role: 'user', content: question }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) throw new Error('OpenAI API Error');

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);

      return {
        text: content.text,
        references: content.references || [],
        suggestedQuestions: content.suggestedQuestions || [],
      };
    } catch (error) {
      console.error('AI API Error:', error);
      return this.askMockAI(question); // Fallback to mock on error
    }
  }

  private async generateRealStudyGuide(book: string, chapter: number): Promise<StudyGuide> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openai.apiKey}`,
        },
        body: JSON.stringify({
          model: config.openai.model,
          messages: [
            {
              role: 'system',
              content: `You are a helpful Bible study assistant. Generate a study guide for ${book} Chapter ${chapter}.
                        The tone should be spiritual, insightful, and easy to understand.
                        Format the response as JSON with the following structure:
                        {
                          "title": "Study Guide: Book Chapter",
                          "introduction": "Brief intro...",
                          "sections": [
                            { "heading": "Section Title", "content": "Analysis...", "verseRefs": ["Verse 1-3"] }
                          ],
                          "conclusion": "Closing thought...",
                          "reflectionQuestions": ["Question 1", "Question 2"]
                        }`
            }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) throw new Error('OpenAI API Error');

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);

      return content as StudyGuide;
    } catch (error) {
      console.error('AI API Error:', error);
      return this.generateMockStudyGuide(book, chapter); // Fallback
    }
  }

  // --- Mock Implementations (Fallback) ---

  private async askMockAI(question: string): Promise<AIResponse> {
    await this.delay(1000);
    const q = question.toLowerCase();

    if (q.includes('love') || q.includes('charity')) {
      return {
        text: "Love is central to the Christian faith. The Bible describes love (agape) not merely as an emotion, but as an act of will and sacrifice. In 1 Corinthians 13, Paul describes love as patient and kind.",
        references: ['1 Corinthians 13:4-8', 'Matthew 22:37-39', 'John 3:16'],
        suggestedQuestions: ['What is the difference between agape and phileo?', 'How can I love my enemies?'],
      };
    }
    // ... (other mock responses can remain or be simplified)

    return {
      text: "That is a profound question. The Bible offers wisdom on many aspects of life. As we seek understanding, we can look to Scripture for guidance.",
      references: ['Psalm 119:105', 'James 1:5'],
      suggestedQuestions: ['What does the Bible say about wisdom?', 'How do I study the Bible effectively?'],
    };
  }

  private async generateMockStudyGuide(book: string, chapter: number): Promise<StudyGuide> {
    await this.delay(1500);
    return {
      title: `Study Guide: ${book} Chapter ${chapter}`,
      introduction: `Welcome to this study of ${book} ${chapter}. This chapter contains powerful truths for our lives today.`,
      sections: [
        {
          heading: "Context & Background",
          content: `This passage takes place in a significant historical context. ${book} was written to address specific needs of the early community.`,
          verseRefs: [`${book} ${chapter}:1-5`],
        },
        {
          heading: "Key Themes",
          content: "Several major themes emerge in this chapter: redemption, obedience, and God's faithfulness.",
          verseRefs: [`${book} ${chapter}:6-12`],
        }
      ],
      conclusion: "As we conclude this study, remember that knowledge of Scripture is meant to lead to transformation.",
      reflectionQuestions: [
        "What stood out to you most in this chapter?",
        "How does this passage challenge your current understanding?"
      ]
    };
  }
}

export const aiService = new AIService();
