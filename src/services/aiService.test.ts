import { describe, expect, it } from 'vitest';
import { parseAIResponse, parseStudyGuide } from './aiService';

describe('AI response parsing', () => {
  it('accepts complete question responses', () => {
    expect(parseAIResponse({
      text: 'Answer',
      references: ['John 1:1'],
      suggestedQuestions: ['What does Word mean?'],
    })).toEqual({
      text: 'Answer',
      references: ['John 1:1'],
      suggestedQuestions: ['What does Word mean?'],
    });
  });

  it('rejects malformed study guides', () => {
    expect(() => parseStudyGuide({ title: 'Incomplete', sections: [] })).toThrow(
      'reflection questions'
    );
  });
});
