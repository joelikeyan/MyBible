import { BibleVerse } from '../types';
import { requestJson } from './httpClient';

const GETBIBLE_BOOK_MAP: Record<string, string> = {
  Genesis: '1', Exodus: '2', Leviticus: '3', Numbers: '4', Deuteronomy: '5',
  Joshua: '6', Judges: '7', Ruth: '8', '1 Samuel': '9', '2 Samuel': '10',
  '1 Kings': '11', '2 Kings': '12', '1 Chronicles': '13', '2 Chronicles': '14',
  Ezra: '15', Nehemiah: '16', Esther: '17', Job: '18', Psalms: '19',
  Proverbs: '20', Ecclesiastes: '21', 'Song of Solomon': '22', Isaiah: '23',
  Jeremiah: '24', Lamentations: '25', Ezekiel: '26', Daniel: '27',
  Hosea: '28', Joel: '29', Amos: '30', Obadiah: '31', Jonah: '32', Micah: '33',
  Nahum: '34', Habakkuk: '35', Zephaniah: '36', Haggai: '37', Zechariah: '38',
  Malachi: '39', Matthew: '40', Mark: '41', Luke: '42', John: '43', Acts: '44',
  Romans: '45', '1 Corinthians': '46', '2 Corinthians': '47', Galatians: '48',
  Ephesians: '49', Philippians: '50', Colossians: '51', '1 Thessalonians': '52',
  '2 Thessalonians': '53', '1 Timothy': '54', '2 Timothy': '55', Titus: '56',
  Philemon: '57', Hebrews: '58', James: '59', '1 Peter': '60', '2 Peter': '61',
  '1 John': '62', '2 John': '63', '3 John': '64', Jude: '65', Revelation: '66',
};

const BOLLS_BOOK_MAP: Record<string, string> = { ...GETBIBLE_BOOK_MAP };

interface EnglishVerse {
  number: number;
  text: string;
}

interface OriginalVerse {
  number: number;
  text: string;
  transliteration?: string;
  strongsNumbers?: string[];
}

const cache = new Map<string, BibleVerse[]>();

export class BibleDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BibleDataError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseVerseNumber(value: unknown): number | null {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function cleanText(text: string): string {
  return text.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(text: string): string {
  const namedEntities: Record<string, string> = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith('#')) {
      const isHex = entity[1]?.toLowerCase() === 'x';
      const codePoint = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    return namedEntities[entity.toLowerCase()] ?? match;
  });
}

export function parseGetBibleChapter(value: unknown): EnglishVerse[] {
  if (!isRecord(value) || !Array.isArray(value.verses)) {
    throw new BibleDataError('GetBible returned an invalid chapter payload.');
  }

  const verses = value.verses.map((item, index) => {
    if (!isRecord(item) || typeof item.text !== 'string') {
      throw new BibleDataError(`GetBible returned an invalid verse at position ${index + 1}.`);
    }

    const number = parseVerseNumber(item.verse);
    const text = cleanText(item.text);
    if (!number || !text) {
      throw new BibleDataError(`GetBible returned an incomplete verse at position ${index + 1}.`);
    }

    return { number, text };
  });

  if (verses.length === 0) {
    throw new BibleDataError('GetBible returned an empty chapter.');
  }

  return verses;
}

function parseStrongsNumbers(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const entries = value.filter((item): item is string => typeof item === 'string');
    return entries.length > 0 ? entries : undefined;
  }
  if (typeof value === 'string') {
    const entries = value.split(/[\s,;]+/).filter(Boolean);
    return entries.length > 0 ? entries : undefined;
  }
  return undefined;
}

export function parseOriginalChapter(value: unknown, strongsPrefix?: 'G' | 'H'): OriginalVerse[] {
  if (!Array.isArray(value)) {
    throw new BibleDataError('Original-language service returned an invalid chapter payload.');
  }

  const verses = value.map((item, index) => {
    if (!isRecord(item) || typeof item.text !== 'string') {
      throw new BibleDataError(`Original-language service returned an invalid verse at position ${index + 1}.`);
    }

    const number = parseVerseNumber(item.verse ?? item.verse_number ?? index + 1);
    const embeddedStrongs = Array.from(item.text.matchAll(/<S>(\d+)<\/S>/gi))
      .map(match => `${strongsPrefix ?? ''}${match[1]}`);
    const text = decodeHtmlEntities(
      item.text.replace(/<S>\d+<\/S>/gi, '').replace(/<[^>]+>/g, ' ')
    ).replace(/\s+/g, ' ').trim();
    if (!number || !text) {
      throw new BibleDataError(`Original-language service returned an incomplete verse at position ${index + 1}.`);
    }

    return {
      number,
      text,
      transliteration: typeof item.transliteration === 'string' ? item.transliteration.trim() : undefined,
      strongsNumbers: parseStrongsNumbers(item.strongs) ?? (embeddedStrongs.length > 0 ? embeddedStrongs : undefined),
    };
  });

  if (verses.length === 0) {
    throw new BibleDataError('Original-language service returned an empty chapter.');
  }

  return verses;
}

export function mergeBibleVerses(
  englishVerses: EnglishVerse[],
  originalVerses: OriginalVerse[],
  language: BibleVerse['language']
): BibleVerse[] {
  const originalsByNumber = new Map(originalVerses.map(verse => [verse.number, verse]));
  const missing = englishVerses
    .filter(verse => !originalsByNumber.has(verse.number))
    .map(verse => verse.number);

  if (missing.length > 0) {
    throw new BibleDataError(`Original-language data is missing verse${missing.length === 1 ? '' : 's'} ${missing.join(', ')}.`);
  }

  return englishVerses.map(verse => {
    const original = originalsByNumber.get(verse.number)!;
    return {
      number: verse.number,
      englishText: verse.text,
      originalText: original.text,
      transliteration: original.transliteration,
      strongsNumbers: original.strongsNumbers,
      language,
    };
  });
}

export async function fetchFromGetBible(
  translation: string,
  bookNumber: string,
  chapter: number
): Promise<EnglishVerse[]> {
  const payload = await requestJson<unknown>(
    `https://api.getbible.net/v2/${encodeURIComponent(translation)}/${encodeURIComponent(bookNumber)}/${chapter}.json`
  );
  return parseGetBibleChapter(payload);
}

async function fetchOriginalChapter(
  translation: string,
  bookAbbrev: string,
  chapter: number
): Promise<OriginalVerse[]> {
  const payload = await requestJson<unknown>(
    `https://bolls.life/get-text/${encodeURIComponent(translation)}/${encodeURIComponent(bookAbbrev)}/${chapter}/`
  );
  return parseOriginalChapter(payload, translation.startsWith('WLC') ? 'H' : 'G');
}

export function fetchGreekNT(bookAbbrev: string, chapter: number): Promise<OriginalVerse[]> {
  return fetchOriginalChapter('TISCH', bookAbbrev, chapter);
}

export function fetchHebrewOT(bookAbbrev: string, chapter: number): Promise<OriginalVerse[]> {
  return fetchOriginalChapter('WLC', bookAbbrev, chapter);
}

export function fetchInterlinear(
  bookAbbrev: string,
  chapter: number,
  isOT: boolean
): Promise<OriginalVerse[]> {
  return fetchOriginalChapter(isOT ? 'WLCI' : 'TISCH', bookAbbrev, chapter);
}

export async function fetchBiblePassage(
  bookName: string,
  chapter: number,
  isOT: boolean
): Promise<BibleVerse[]> {
  const getBibleBook = GETBIBLE_BOOK_MAP[bookName];
  const bollsBook = BOLLS_BOOK_MAP[bookName];
  if (!getBibleBook || !bollsBook || !Number.isInteger(chapter) || chapter < 1) {
    throw new BibleDataError('A supported book and valid chapter are required.');
  }

  const cacheKey = `${bookName}:${chapter}:${isOT ? 'OT' : 'NT'}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const [englishVerses, originalVerses] = await Promise.all([
    fetchFromGetBible('kjv', getBibleBook, chapter),
    isOT ? fetchHebrewOT(bollsBook, chapter) : fetchGreekNT(bollsBook, chapter),
  ]);
  const verses = mergeBibleVerses(englishVerses, originalVerses, isOT ? 'hebrew' : 'greek');
  cache.set(cacheKey, verses);
  return verses;
}

export function fetchFromApiBible(bibleId: string, passageId: string): Promise<unknown> {
  return requestJson<unknown>(
    `/v1/bibles/${encodeURIComponent(bibleId)}/passages/${encodeURIComponent(passageId)}?content-type=text`
  );
}

export { GETBIBLE_BOOK_MAP, BOLLS_BOOK_MAP };

export const bibleApi = {
  fetchPassage: fetchBiblePassage,
  fetchGreek: fetchGreekNT,
  fetchHebrew: fetchHebrewOT,
  fetchInterlinear,
};
