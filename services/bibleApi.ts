import { BibleVerse } from '../types';

// API.Bible configuration (optional - for 2000+ translations)
// Get your free key at: https://scripture.api.bible
const API_BIBLE_KEY = ''; // Add your key here for additional translations

// Bible version IDs for API.Bible
const API_BIBLE_VERSIONS = {
  kjv: 'de4e12af7f28f599-02',
  greek: '5ae182e5ee4b56e6-01', // Nestle 1904
  hebrew: 'bba9f40116a4b06a-01', // Westminster Leningrad Codex
};

// Book abbreviation mappings for different APIs
const GETBIBLE_BOOK_MAP: Record<string, string> = {
  'Genesis': '1', 'Exodus': '2', 'Leviticus': '3', 'Numbers': '4', 'Deuteronomy': '5',
  'Joshua': '6', 'Judges': '7', 'Ruth': '8', '1 Samuel': '9', '2 Samuel': '10',
  '1 Kings': '11', '2 Kings': '12', '1 Chronicles': '13', '2 Chronicles': '14',
  'Ezra': '15', 'Nehemiah': '16', 'Esther': '17', 'Job': '18', 'Psalms': '19',
  'Proverbs': '20', 'Ecclesiastes': '21', 'Song of Solomon': '22', 'Isaiah': '23',
  'Jeremiah': '24', 'Lamentations': '25', 'Ezekiel': '26', 'Daniel': '27',
  'Hosea': '28', 'Joel': '29', 'Amos': '30', 'Obadiah': '31', 'Jonah': '32',
  'Micah': '33', 'Nahum': '34', 'Habakkuk': '35', 'Zephaniah': '36', 'Haggai': '37',
  'Zechariah': '38', 'Malachi': '39', 'Matthew': '40', 'Mark': '41', 'Luke': '42',
  'John': '43', 'Acts': '44', 'Romans': '45', '1 Corinthians': '46', '2 Corinthians': '47',
  'Galatians': '48', 'Ephesians': '49', 'Philippians': '50', 'Colossians': '51',
  '1 Thessalonians': '52', '2 Thessalonians': '53', '1 Timothy': '54', '2 Timothy': '55',
  'Titus': '56', 'Philemon': '57', 'Hebrews': '58', 'James': '59', '1 Peter': '60',
  '2 Peter': '61', '1 John': '62', '2 John': '63', '3 John': '64', 'Jude': '65',
  'Revelation': '66',
};

// Bolls.life book abbreviations
const BOLLS_BOOK_MAP: Record<string, string> = {
  'Genesis': 'Gen', 'Exodus': 'Exod', 'Leviticus': 'Lev', 'Numbers': 'Num',
  'Deuteronomy': 'Deut', 'Joshua': 'Josh', 'Judges': 'Judg', 'Ruth': 'Ruth',
  '1 Samuel': '1Sam', '2 Samuel': '2Sam', '1 Kings': '1Kgs', '2 Kings': '2Kgs',
  '1 Chronicles': '1Chr', '2 Chronicles': '2Chr', 'Ezra': 'Ezra', 'Nehemiah': 'Neh',
  'Esther': 'Esth', 'Job': 'Job', 'Psalms': 'Ps', 'Proverbs': 'Prov',
  'Ecclesiastes': 'Eccl', 'Song of Solomon': 'Song', 'Isaiah': 'Isa', 'Jeremiah': 'Jer',
  'Lamentations': 'Lam', 'Ezekiel': 'Ezek', 'Daniel': 'Dan', 'Hosea': 'Hos',
  'Joel': 'Joel', 'Amos': 'Amos', 'Obadiah': 'Obad', 'Jonah': 'Jonah', 'Micah': 'Mic',
  'Nahum': 'Nah', 'Habakkuk': 'Hab', 'Zephaniah': 'Zeph', 'Haggai': 'Hag',
  'Zechariah': 'Zech', 'Malachi': 'Mal', 'Matthew': 'Matt', 'Mark': 'Mark',
  'Luke': 'Luke', 'John': 'John', 'Acts': 'Acts', 'Romans': 'Rom',
  '1 Corinthians': '1Cor', '2 Corinthians': '2Cor', 'Galatians': 'Gal',
  'Ephesians': 'Eph', 'Philippians': 'Phil', 'Colossians': 'Col',
  '1 Thessalonians': '1Thess', '2 Thessalonians': '2Thess', '1 Timothy': '1Tim',
  '2 Timothy': '2Tim', 'Titus': 'Titus', 'Philemon': 'Phlm', 'Hebrews': 'Heb',
  'James': 'Jas', '1 Peter': '1Pet', '2 Peter': '2Pet', '1 John': '1John',
  '2 John': '2John', '3 John': '3John', 'Jude': 'Jude', 'Revelation': 'Rev',
};

// Cache for API responses
const cache: Map<string, BibleVerse[]> = new Map();

/**
 * Fetch from GetBible.net API (free, no key needed)
 * Supports: KJV, ASV, WEB, YLT, and more
 */
export async function fetchFromGetBible(
  translation: string,
  bookNumber: string,
  chapter: number
): Promise<any> {
  const cacheKey = `getbible-${translation}-${bookNumber}-${chapter}`;
  
  try {
    const response = await fetch(
      `https://getbible.net/v2/${translation}/${bookNumber}/${chapter}.json`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );
    
    if (!response.ok) {
      console.warn(`GetBible API returned ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('GetBible API error:', error);
    return null;
  }
}

/**
 * Fetch Greek NT from Bolls.life API (Tischendorf text)
 * Free, no key needed
 */
export async function fetchGreekNT(
  bookAbbrev: string,
  chapter: number
): Promise<any[]> {
  try {
    const response = await fetch(
      `https://bolls.life/api/get-chapter/TISCH/${bookAbbrev}/${chapter}/`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );
    
    if (!response.ok) {
      console.warn(`Bolls.life Greek API returned ${response.status}`);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Bolls.life Greek API error:', error);
    return [];
  }
}

/**
 * Fetch Hebrew OT from Bolls.life API (Westminster Leningrad Codex)
 * Free, no key needed
 */
export async function fetchHebrewOT(
  bookAbbrev: string,
  chapter: number
): Promise<any[]> {
  try {
    const response = await fetch(
      `https://bolls.life/api/get-chapter/WLC/${bookAbbrev}/${chapter}/`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );
    
    if (!response.ok) {
      console.warn(`Bolls.life Hebrew API returned ${response.status}`);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Bolls.life Hebrew API error:', error);
    return [];
  }
}

/**
 * Fetch interlinear data with word-by-word breakdown
 * Uses Bolls.life interlinear endpoint
 */
export async function fetchInterlinear(
  bookAbbrev: string,
  chapter: number,
  isOT: boolean
): Promise<any[]> {
  try {
    const translation = isOT ? 'WLCI' : 'TISCH'; // Interlinear versions
    const response = await fetch(
      `https://bolls.life/api/get-chapter/${translation}/${bookAbbrev}/${chapter}/`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );
    
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * Main function to fetch Bible passage with both English and original language
 */
export async function fetchBiblePassage(
  bookName: string,
  chapter: number,
  isOT: boolean
): Promise<BibleVerse[]> {
  const cacheKey = `passage-${bookName}-${chapter}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  
  try {
    const getBibleBook = GETBIBLE_BOOK_MAP[bookName] || bookName;
    const bollsBook = BOLLS_BOOK_MAP[bookName] || bookName;
    
    // Fetch English (KJV) and original language in parallel
    const [kjvData, originalData] = await Promise.all([
      fetchFromGetBible('kjv', getBibleBook, chapter),
      isOT ? fetchHebrewOT(bollsBook, chapter) : fetchGreekNT(bollsBook, chapter),
    ]);
    
    if (!kjvData?.verses || kjvData.verses.length === 0) {
      console.warn('No verses returned from GetBible');
      return getFallbackVerses(bookName, chapter, isOT);
    }
    
    const verses: BibleVerse[] = kjvData.verses.map((v: any, index: number) => ({
      number: v.verse || index + 1,
      englishText: cleanText(v.text),
      originalText: originalData?.[index]?.text || getPlaceholderOriginal(bookName, chapter, v.verse, isOT),
      transliteration: originalData?.[index]?.transliteration || '',
      strongsNumbers: originalData?.[index]?.strongs || [],
      language: isOT ? 'hebrew' : 'greek',
    }));
    
    cache.set(cacheKey, verses);
    return verses;
  } catch (error) {
    console.error('Error fetching Bible passage:', error);
    return getFallbackVerses(bookName, chapter, isOT);
  }
}

/**
 * Fetch from API.Bible (requires API key for 2000+ translations)
 */
export async function fetchFromApiBible(
  bibleId: string,
  passageId: string
): Promise<any> {
  if (!API_BIBLE_KEY) {
    console.warn('API.Bible key not configured');
    return null;
  }
  
  try {
    const response = await fetch(
      `https://api.scripture.bible/v1/bibles/${bibleId}/passages/${passageId}?content-type=text`,
      {
        headers: {
          'api-key': API_BIBLE_KEY,
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Helper functions
function cleanText(text: string): string {
  return text
    .replace(/\[.*?\]/g, '') // Remove bracketed content
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

function getPlaceholderOriginal(book: string, chapter: number, verse: number, isOT: boolean): string {
  if (isOT) {
    return `[עברית - ${book} ${chapter}:${verse}]`;
  }
  return `[Ἑλληνικά - ${book} ${chapter}:${verse}]`;
}

function getFallbackVerses(book: string, chapter: number, isOT: boolean): BibleVerse[] {
  return Array.from({ length: 5 }, (_, i) => ({
    number: i + 1,
    englishText: `${book} ${chapter}:${i + 1} - Unable to load. Check your internet connection.`,
    originalText: getPlaceholderOriginal(book, chapter, i + 1, isOT),
    language: isOT ? 'hebrew' : 'greek',
  }));
}

// Export book mappings for use in other components
export { GETBIBLE_BOOK_MAP, BOLLS_BOOK_MAP, API_BIBLE_KEY };

// Legacy export for backward compatibility
export const bibleApi = {
  fetchPassage: fetchBiblePassage,
  fetchGreek: fetchGreekNT,
  fetchHebrew: fetchHebrewOT,
  fetchInterlinear,
};
