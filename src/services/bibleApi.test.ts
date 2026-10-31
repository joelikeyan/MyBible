import { describe, expect, it } from 'vitest';
import { mergeBibleVerses, parseGetBibleChapter, parseOriginalChapter } from './bibleApi';

describe('Bible data normalization', () => {
  it('normalizes and merges verses by verse number', () => {
    const english = parseGetBibleChapter({
      verses: [
        { verse: 1, text: ' In the beginning ' },
        { verse: 2, text: ' The earth was without form. ' },
      ],
    });
    const original = parseOriginalChapter([
      { verse: 2, text: 'וְהָאָרֶץ' },
      { verse: 1, text: 'בְּרֵאשִׁית', strongs: 'H7225' },
    ]);

    expect(mergeBibleVerses(english, original, 'hebrew')).toEqual([
      {
        number: 1,
        englishText: 'In the beginning',
        originalText: 'בְּרֵאשִׁית',
        transliteration: undefined,
        strongsNumbers: ['H7225'],
        language: 'hebrew',
      },
      {
        number: 2,
        englishText: 'The earth was without form.',
        originalText: 'וְהָאָרֶץ',
        transliteration: undefined,
        strongsNumbers: undefined,
        language: 'hebrew',
      },
    ]);
  });

  it('rejects incomplete original-language chapters', () => {
    expect(() => mergeBibleVerses(
      [{ number: 1, text: 'Verse one' }, { number: 2, text: 'Verse two' }],
      [{ number: 1, text: 'Original one' }],
      'greek'
    )).toThrow('missing verse 2');
  });

  it('extracts Strong numbers from Bolls HTML', () => {
    expect(parseOriginalChapter([
      { verse: 1, text: 'Ἐν<S>1722</S> ἀρχῇ<S>746</S>' },
    ], 'G')).toEqual([
      {
        number: 1,
        text: 'Ἐν ἀρχῇ',
        transliteration: undefined,
        strongsNumbers: ['G1722', 'G746'],
      },
    ]);
  });
});
