import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SpeakerIcon } from './SpeakerIcon';
import { BibleVerse, InterlinearWord } from '../types';
import { useVoice } from '../context/VoiceContext';

interface DualColumnBibleProps {
  verses: BibleVerse[];
  reference: string;
  showPerVerseSpeakers?: boolean;
  onWordPress?: (word: string, verse: BibleVerse) => void;
  highlights?: Map<number, string>; // verse number -> color
}

interface LexiconEntry {
  word: string;
  transliteration: string;
  strongsNumber: string;
  definition: string;
  partOfSpeech: string;
}

export function DualColumnBible({
  verses,
  reference,
  showPerVerseSpeakers = true,
  onWordPress,
  highlights = new Map(),
}: DualColumnBibleProps) {
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showLexicon, setShowLexicon] = useState(false);
  const [lexiconLoading, setLexiconLoading] = useState(false);
  const [lexiconEntry, setLexiconEntry] = useState<LexiconEntry | null>(null);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const { textSize } = useVoice();

  // Refs for synchronized scrolling
  const originalScrollRef = useRef<ScrollView>(null);
  const englishScrollRef = useRef<ScrollView>(null);
  const isScrollingOriginal = useRef(false);
  const isScrollingEnglish = useRef(false);

  // Calculate column width
  const screenWidth = Dimensions.get('window').width;
  const containerPadding = 24; // 12px on each side
  const dividerWidth = 17; // 1px + 8px margin each side
  const columnWidth = (screenWidth - containerPadding - dividerWidth) / 2;

  const getAllOriginalText = () => verses.map(v => v.originalText).join(' ');
  const getAllEnglishText = () => verses.map(v => v.englishText).join(' ');

  // Synchronized scrolling handlers
  const handleOriginalScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrollingEnglish.current) return;

    isScrollingOriginal.current = true;
    const offsetY = event.nativeEvent.contentOffset.y;

    englishScrollRef.current?.scrollTo({ y: offsetY, animated: false });

    // Reset flag after a short delay
    setTimeout(() => {
      isScrollingOriginal.current = false;
    }, 50);
  }, []);

  const handleEnglishScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrollingOriginal.current) return;

    isScrollingEnglish.current = true;
    const offsetY = event.nativeEvent.contentOffset.y;

    originalScrollRef.current?.scrollTo({ y: offsetY, animated: false });

    setTimeout(() => {
      isScrollingEnglish.current = false;
    }, 50);
  }, []);

  // Handle word tap for lexicon lookup
  const handleWordClick = async (interlinearWord: InterlinearWord, verse: BibleVerse) => {
    setSelectedWord(interlinearWord.text);
    setShowLexicon(true);
    setLexiconLoading(true);

    // Simulate lexicon lookup (in real app, call API)
    setTimeout(() => {
      setLexiconEntry({
        word: interlinearWord.text,
        transliteration: interlinearWord.transliteration || verse.transliteration || 'N/A',
        strongsNumber: interlinearWord.strongs || verse.strongsNumbers?.[0] || 'N/A',
        definition: `Definition for "${interlinearWord.text}" - This would come from a lexicon API like STEP Bible or Blue Letter Bible.`,
        partOfSpeech: interlinearWord.grammar || 'noun/verb/adj',
      });
      setLexiconLoading(false);
    }, 500);

    onWordPress?.(interlinearWord.text, verse);
  };

  // Render original text with word-level interaction
  const renderOriginalText = (verse: BibleVerse) => {
    // If we have structured words, use them
    if (verse.words && verse.words.length > 0) {
      return (
        <View style={[styles.originalTextContainer, { direction: verse.language === 'hebrew' ? 'rtl' : 'ltr' }]}>
          {verse.words.map((word, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleWordClick(word, verse)}
              style={styles.wordContainer}
            >
              <Text style={[styles.tappableWordText, { fontSize: textSize, fontFamily: 'serif' }]}>
                {word.text}
              </Text>
              {/* Future: Add English Gloss text here for true interlinear */}
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // Fallback to simple split
    const words = verse.originalText.split(' ');

    return (
      <Text style={[styles.originalText, { fontSize: textSize, writingDirection: verse.language === 'hebrew' ? 'rtl' : 'ltr' }]}>
        {words.map((word, idx) => (
          <Text
            key={idx}
            onPress={() => handleWordClick({ text: word }, verse)}
            style={styles.tappableWord}
          >
            {word}{idx < words.length - 1 ? ' ' : ''}
          </Text>
        ))}
      </Text>
    );
  };

  const getHighlightStyle = (verseNumber: number) => {
    const color = highlights.get(verseNumber);
    if (!color) return {};
    return { backgroundColor: color + '40' }; // Add transparency
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.reference, { fontSize: textSize }]}>{reference}</Text>
        <SpeakerIcon text={`${reference}. ${getAllEnglishText()}`} />
      </View>

      {/* Dual Columns */}
      <View style={styles.columnsContainer}>
        {/* Original Language Column */}
        <View style={[styles.column, { width: columnWidth }]}>
          <View style={styles.columnHeader}>
            <Text style={styles.columnTitle}>Original</Text>
            <SpeakerIcon text={getAllOriginalText()} size={16} />
          </View>
          <ScrollView
            ref={originalScrollRef}
            onScroll={handleOriginalScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {verses.map((verse) => (
              <TouchableOpacity
                key={verse.number}
                onPress={() => setSelectedVerse(verse.number)}
                style={[
                  styles.verseRow,
                  selectedVerse === verse.number && styles.selectedVerse,
                  getHighlightStyle(verse.number),
                ]}
              >
                <Text style={[styles.verseNumber, { fontSize: textSize - 2 }]}>
                  {verse.number}
                </Text>
                {renderOriginalText(verse)}
                {showPerVerseSpeakers && (
                  <SpeakerIcon text={verse.originalText} size={14} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* English Column */}
        <View style={[styles.column, { width: columnWidth }]}>
          <View style={styles.columnHeader}>
            <Text style={styles.columnTitle}>English</Text>
            <SpeakerIcon text={getAllEnglishText()} size={16} />
          </View>
          <ScrollView
            ref={englishScrollRef}
            onScroll={handleEnglishScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {verses.map((verse) => (
              <TouchableOpacity
                key={verse.number}
                onPress={() => setSelectedVerse(verse.number)}
                style={[
                  styles.verseRow,
                  selectedVerse === verse.number && styles.selectedVerse,
                  getHighlightStyle(verse.number),
                ]}
              >
                <Text style={[styles.verseNumber, { fontSize: textSize - 2 }]}>
                  {verse.number}
                </Text>
                <Text style={[styles.englishText, { fontSize: textSize }]}>
                  {verse.englishText}
                </Text>
                {showPerVerseSpeakers && (
                  <SpeakerIcon text={verse.englishText} size={14} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Lexicon Modal */}
      <Modal visible={showLexicon} transparent animationType="slide">
        <View style={styles.lexiconOverlay}>
          <View style={styles.lexiconContent}>
            <View style={styles.lexiconHeader}>
              <View style={styles.lexiconTitleRow}>
                <Text style={styles.lexiconTitle}>Word Study</Text>
                <SpeakerIcon
                  text={lexiconEntry ? `${lexiconEntry.word}. ${lexiconEntry.definition}` : ''}
                  size={18}
                />
              </View>
              <TouchableOpacity onPress={() => setShowLexicon(false)}>
                <Ionicons name="close" size={24} color="#2D1810" />
              </TouchableOpacity>
            </View>

            {lexiconLoading ? (
              <View style={styles.lexiconLoading}>
                <ActivityIndicator size="large" color="#6B4EFF" />
                <Text style={styles.loadingText}>Looking up "{selectedWord}"...</Text>
              </View>
            ) : lexiconEntry ? (
              <View style={styles.lexiconBody}>
                <View style={styles.lexiconWordRow}>
                  <Text style={styles.lexiconWord}>{lexiconEntry.word}</Text>
                  <Text style={styles.lexiconTranslit}>{lexiconEntry.transliteration}</Text>
                </View>

                <View style={styles.lexiconMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Strong's</Text>
                    <Text style={styles.metaValue}>{lexiconEntry.strongsNumber}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Part of Speech</Text>
                    <Text style={styles.metaValue}>{lexiconEntry.partOfSpeech}</Text>
                  </View>
                </View>

                <View style={styles.definitionBox}>
                  <Text style={styles.definitionLabel}>Definition</Text>
                  <Text style={styles.definitionText}>{lexiconEntry.definition}</Text>
                  <SpeakerIcon text={lexiconEntry.definition} size={16} />
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F3',
    borderRadius: 12,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD4',
  },
  reference: {
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2D1810',
  },
  columnsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  columnTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7355',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    backgroundColor: '#E8DDD4',
    marginHorizontal: 8,
  },
  verseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  selectedVerse: {
    backgroundColor: '#F0E6D8',
  },
  verseNumber: {
    color: '#B8A080',
    fontWeight: '600',
    marginRight: 6,
    minWidth: 20,
  },
  originalText: {
    flex: 1,
    color: '#2D1810',
    fontFamily: 'serif',
    lineHeight: 24,
  },
  originalTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  wordContainer: {
    marginHorizontal: 2,
    marginBottom: 4,
  },
  tappableWordText: {
    color: '#2D1810',
  },
  englishText: {
    flex: 1,
    color: '#2D1810',
    lineHeight: 24,
  },
  tappableWord: {
    // Words are tappable for lexicon lookup
  },
  // Lexicon Modal Styles
  lexiconOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  lexiconContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '60%',
  },
  lexiconHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  lexiconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lexiconTitle: {
    fontSize: 20,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2D1810',
    marginRight: 8,
  },
  lexiconLoading: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#5C4A3D',
    fontSize: 16,
  },
  lexiconBody: {
    gap: 16,
  },
  lexiconWordRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  lexiconWord: {
    fontSize: 32,
    fontFamily: 'serif',
    color: '#2D1810',
  },
  lexiconTranslit: {
    fontSize: 18,
    color: '#6B4EFF',
    fontStyle: 'italic',
  },
  lexiconMeta: {
    flexDirection: 'row',
    gap: 24,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#8B7355',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    color: '#2D1810',
    fontWeight: '500',
  },
  definitionBox: {
    backgroundColor: '#F5F0EA',
    borderRadius: 12,
    padding: 16,
  },
  definitionLabel: {
    fontSize: 12,
    color: '#8B7355',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  definitionText: {
    fontSize: 16,
    color: '#2D1810',
    lineHeight: 24,
    marginBottom: 8,
  },
});
