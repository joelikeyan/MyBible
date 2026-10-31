import { requestJson } from './httpClient';

export interface AIResponse {
  text: string;
  references: string[];
  suggestedQuestions: string[];
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function requireString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`AI response is missing ${key}.`);
  }
  return value;
}

export function parseAIResponse(value: unknown): AIResponse {
  if (!isRecord(value)) {
    throw new Error('AI response has an invalid shape.');
  }

  const references = value.references ?? [];
  const suggestedQuestions = value.suggestedQuestions ?? [];
  if (!isStringArray(references) || !isStringArray(suggestedQuestions)) {
    throw new Error('AI response contains invalid reference data.');
  }

  return {
    text: requireString(value, 'text'),
    references,
    suggestedQuestions,
  };
}

export function parseStudyGuide(value: unknown): StudyGuide {
  if (!isRecord(value) || !Array.isArray(value.sections)) {
    throw new Error('Study guide has an invalid shape.');
  }

  const sections = value.sections.map(section => {
    if (!isRecord(section) || !isStringArray(section.verseRefs)) {
      throw new Error('Study guide contains an invalid section.');
    }

    return {
      heading: requireString(section, 'heading'),
      content: requireString(section, 'content'),
      verseRefs: section.verseRefs,
    };
  });

  if (!isStringArray(value.reflectionQuestions)) {
    throw new Error('Study guide contains invalid reflection questions.');
  }

  return {
    title: requireString(value, 'title'),
    introduction: requireString(value, 'introduction'),
    sections,
    conclusion: requireString(value, 'conclusion'),
    reflectionQuestions: value.reflectionQuestions,
  };
}

class AIService {
  async askQuestion(question: string, context?: string): Promise<AIResponse> {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion) {
      throw new Error('Question cannot be empty.');
    }

    const payload = await requestJson<unknown>('/v1/ai/questions', {
      method: 'POST',
      body: JSON.stringify({
        question: normalizedQuestion,
        context: context?.trim() || undefined,
      }),
    });

    return parseAIResponse(payload);
  }

  async generateStudyGuide(book: string, chapter: number): Promise<StudyGuide> {
    const normalizedBook = book.trim();
    if (!normalizedBook || !Number.isInteger(chapter) || chapter < 1) {
      throw new Error('A valid book and chapter are required.');
    }

    const payload = await requestJson<unknown>('/v1/ai/study-guides', {
      method: 'POST',
      body: JSON.stringify({ book: normalizedBook, chapter }),
    });

    return parseStudyGuide(payload);
  }
}

export const aiService = new AIService();
