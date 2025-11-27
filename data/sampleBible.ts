import { BibleVerse, BibleChapter } from '../types';

export const john3Verses: BibleVerse[] = [
  {
    number: 16,
    originalText: 'Οὕτως γὰρ ἠγάπησεν ὁ θεὸς τὸν κόσμον',
    englishText: 'For God so loved the world',
    language: 'greek',
  },
  {
    number: 17,
    originalText: 'ὥστε τὸν υἱὸν τὸν μονογενῆ ἔδωκεν',
    englishText: 'that he gave his only begotten Son',
    language: 'greek',
  },
  {
    number: 18,
    originalText: 'ἵνα πᾶς ὁ πιστεύων εἰς αὐτὸν',
    englishText: 'that whoever believes in him',
    language: 'greek',
  },
  {
    number: 19,
    originalText: 'μὴ ἀπόληται ἀλλ᾽ ἔχῃ ζωὴν αἰώνιον',
    englishText: 'should not perish but have everlasting life',
    language: 'greek',
  },
];

export const genesis1Verses: BibleVerse[] = [
  {
    number: 1,
    originalText: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים',
    englishText: 'In the beginning God created',
    language: 'hebrew',
  },
  {
    number: 2,
    originalText: 'אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ',
    englishText: 'the heavens and the earth',
    language: 'hebrew',
  },
  {
    number: 3,
    originalText: 'וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ',
    englishText: 'And the earth was without form and void',
    language: 'hebrew',
  },
  {
    number: 4,
    originalText: 'וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם',
    englishText: 'and darkness was upon the face of the deep',
    language: 'hebrew',
  },
];

export const matthew5Verses: BibleVerse[] = [
  {
    number: 1,
    originalText: 'Ἰδὼν δὲ τοὺς ὄχλους ἀνέβη εἰς τὸ ὄρος',
    englishText: 'And seeing the multitudes, he went up into a mountain',
    language: 'greek',
  },
  {
    number: 2,
    originalText: 'καὶ καθίσαντος αὐτοῦ προσῆλθαν αὐτῷ οἱ μαθηταὶ αὐτοῦ',
    englishText: 'and when he was set, his disciples came unto him',
    language: 'greek',
  },
  {
    number: 3,
    originalText: 'Μακάριοι οἱ πτωχοὶ τῷ πνεύματι',
    englishText: 'Blessed are the poor in spirit',
    language: 'greek',
  },
  {
    number: 4,
    originalText: 'ὅτι αὐτῶν ἐστιν ἡ βασιλεία τῶν οὐρανῶν',
    englishText: 'for theirs is the kingdom of heaven',
    language: 'greek',
  },
  {
    number: 5,
    originalText: 'Μακάριοι οἱ πενθοῦντες',
    englishText: 'Blessed are they that mourn',
    language: 'greek',
  },
  {
    number: 6,
    originalText: 'ὅτι αὐτοὶ παρακληθήσονται',
    englishText: 'for they shall be comforted',
    language: 'greek',
  },
];

export const sampleChapters: BibleChapter[] = [
  { book: 'Genesis', chapter: 1, verses: genesis1Verses, language: 'hebrew' },
  { book: 'John', chapter: 3, verses: john3Verses, language: 'greek' },
  { book: 'Matthew', chapter: 5, verses: matthew5Verses, language: 'greek' },
];

