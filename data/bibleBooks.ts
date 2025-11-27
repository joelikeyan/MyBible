export interface BibleBook {
  name: string;
  abbrev: string;
  chapters: number;
  testament: 'OT' | 'NT';
  originalLanguage: 'hebrew' | 'greek' | 'aramaic';
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { name: 'Genesis', abbrev: 'GEN', chapters: 50, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Exodus', abbrev: 'EXO', chapters: 40, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Leviticus', abbrev: 'LEV', chapters: 27, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Numbers', abbrev: 'NUM', chapters: 36, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Deuteronomy', abbrev: 'DEU', chapters: 34, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Joshua', abbrev: 'JOS', chapters: 24, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Judges', abbrev: 'JDG', chapters: 21, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Ruth', abbrev: 'RUT', chapters: 4, testament: 'OT', originalLanguage: 'hebrew' },
  { name: '1 Samuel', abbrev: '1SA', chapters: 31, testament: 'OT', originalLanguage: 'hebrew' },
  { name: '2 Samuel', abbrev: '2SA', chapters: 24, testament: 'OT', originalLanguage: 'hebrew' },
  { name: '1 Kings', abbrev: '1KI', chapters: 22, testament: 'OT', originalLanguage: 'hebrew' },
  { name: '2 Kings', abbrev: '2KI', chapters: 25, testament: 'OT', originalLanguage: 'hebrew' },
  { name: '1 Chronicles', abbrev: '1CH', chapters: 29, testament: 'OT', originalLanguage: 'hebrew' },
  { name: '2 Chronicles', abbrev: '2CH', chapters: 36, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Ezra', abbrev: 'EZR', chapters: 10, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Nehemiah', abbrev: 'NEH', chapters: 13, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Esther', abbrev: 'EST', chapters: 10, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Job', abbrev: 'JOB', chapters: 42, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Psalms', abbrev: 'PSA', chapters: 150, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Proverbs', abbrev: 'PRO', chapters: 31, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Ecclesiastes', abbrev: 'ECC', chapters: 12, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Song of Solomon', abbrev: 'SNG', chapters: 8, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Isaiah', abbrev: 'ISA', chapters: 66, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Jeremiah', abbrev: 'JER', chapters: 52, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Lamentations', abbrev: 'LAM', chapters: 5, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Ezekiel', abbrev: 'EZK', chapters: 48, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Daniel', abbrev: 'DAN', chapters: 12, testament: 'OT', originalLanguage: 'aramaic' }, // Parts in Aramaic
  { name: 'Hosea', abbrev: 'HOS', chapters: 14, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Joel', abbrev: 'JOL', chapters: 3, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Amos', abbrev: 'AMO', chapters: 9, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Obadiah', abbrev: 'OBA', chapters: 1, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Jonah', abbrev: 'JON', chapters: 4, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Micah', abbrev: 'MIC', chapters: 7, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Nahum', abbrev: 'NAM', chapters: 3, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Habakkuk', abbrev: 'HAB', chapters: 3, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Zephaniah', abbrev: 'ZEP', chapters: 3, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Haggai', abbrev: 'HAG', chapters: 2, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Zechariah', abbrev: 'ZEC', chapters: 14, testament: 'OT', originalLanguage: 'hebrew' },
  { name: 'Malachi', abbrev: 'MAL', chapters: 4, testament: 'OT', originalLanguage: 'hebrew' },

  // New Testament
  { name: 'Matthew', abbrev: 'MAT', chapters: 28, testament: 'NT', originalLanguage: 'greek' },
  { name: 'Mark', abbrev: 'MRK', chapters: 16, testament: 'NT', originalLanguage: 'greek' },
  { name: 'Luke', abbrev: 'LUK', chapters: 24, testament: 'NT', originalLanguage: 'greek' },
  { name: 'John', abbrev: 'JHN', chapters: 21, testament: 'NT', originalLanguage: 'greek' },
  { name: 'Acts', abbrev: 'ACT', chapters: 28, testament: 'NT', originalLanguage: 'greek' },
  { name: 'Romans', abbrev: 'ROM', chapters: 16, testament: 'NT', originalLanguage: 'greek' },
  { name: '1 Corinthians', abbrev: '1CO', chapters: 16, testament: 'NT', originalLanguage: 'greek' },
  { name: '2 Corinthians', abbrev: '2CO', chapters: 13, testament: 'NT', originalLanguage: 'greek' },
  { name: 'Galatians', abbrev: 'GAL', chapters: 6, testament: 'NT', originalLanguage: 'greek' },
  { name: 'Ephesians', abbrev: 'EPH', chapters: 6, testament: 'NT', originalLanguage: 'greek' },
  { name: 'Philippians', abbrev: 'PHP', chapters: 4, testament: 'NT', originalLanguage: 'greek' },
  { name: 'Colossians', abbrev: 'COL', chapters: 4, testament: 'NT', originalLanguage: 'greek' },
  { name: '1 Thessalonians', abbrev: '1TH', chapters: 5, testament: 'NT', originalLanguage: 'greek' },
  { name: '2 Thessalonians', abbrev: '2TH', chapters: 3, testament: 'NT', originalLanguage: 'greek' },
  { name: '1 Timothy', abbrev: '1TI', chapters: 6, testament: 'NT', originalLanguage: 'greek' },
  { name: '2 Timothy', abbrev: '2TI', chapters: 4, testament: 'NT', originalLanguage: 'greek' },
  { name: 'Titus', abbrev: 'TIT', chapters: 3, testament: 'NT', originalLanguage: 'greek' },
  { name: 'Philemon', abbrev: 'PHM', chapters: 1, testament: 'NT', originalLanguage: 'greek' },
  { name: 'Hebrews', abbrev: 'HEB', chapters: 13, testament: 'NT', originalLanguage: 'greek' },
  { name: 'James', abbrev: 'JAS', chapters: 5, testament: 'NT', originalLanguage: 'greek' },
  { name: '1 Peter', abbrev: '1PE', chapters: 5, testament: 'NT', originalLanguage: 'greek' },
  { name: '2 Peter', abbrev: '2PE', chapters: 3, testament: 'NT', originalLanguage: 'greek' },
  { name: '1 John', abbrev: '1JN', chapters: 5, testament: 'NT', originalLanguage: 'greek' },
  { name: '2 John', abbrev: '2JN', chapters: 1, testament: 'NT', originalLanguage: 'greek' },
  { name: '3 John', abbrev: '3JN', chapters: 1, testament: 'NT', originalLanguage: 'greek' },
  { name: 'Jude', abbrev: 'JUD', chapters: 1, testament: 'NT', originalLanguage: 'greek' },
  { name: 'Revelation', abbrev: 'REV', chapters: 22, testament: 'NT', originalLanguage: 'greek' },
];

export const getBookByName = (name: string): BibleBook | undefined => {
  return BIBLE_BOOKS.find(b => b.name.toLowerCase() === name.toLowerCase());
};

export const getBookByAbbrev = (abbrev: string): BibleBook | undefined => {
  return BIBLE_BOOKS.find(b => b.abbrev.toLowerCase() === abbrev.toLowerCase());
};

