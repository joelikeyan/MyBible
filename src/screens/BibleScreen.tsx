import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SpeakerIcon } from '../components/SpeakerIcon';
import { DualColumnBible } from '../components/DualColumnBible';
import { AIStudyModal } from '../components/AIStudyModal';
import { useVoice } from '../context/VoiceContext';
import { BIBLE_BOOKS, BibleBook } from '../data/bibleBooks';
import { BibleVerse } from '../types';
import { fetchBiblePassage, GETBIBLE_BOOK_MAP, BOLLS_BOOK_MAP } from '../services/bibleApi';
import { storageService, BibleNote, BibleHighlight } from '../services/storageService';

export function BibleScreen() {
  const [selectedBook, setSelectedBook] = useState<BibleBook>(BIBLE_BOOKS[42]); // Matthew
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OT' | 'NT'>('NT');
  const [noteText, setNoteText] = useState('');
  const [selectedVerseForNote, setSelectedVerseForNote] = useState<number | null>(null);
  const [highlights, setHighlights] = useState<Map<number, string>>(new Map());
  const { textSize } = useVoice();

  // Fetch verses when book/chapter changes
  useEffect(() => {
    loadVerses();
    loadHighlights();
  }, [selectedBook, selectedChapter]);

  const loadVerses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const isOT = selectedBook.testament === 'OT';
      const fetchedVerses = await fetchBiblePassage(
        selectedBook.name,
        selectedChapter,
        isOT
      );

      if (fetchedVerses.length > 0) {
        setVerses(fetchedVerses);
      } else {
        setError('No verses found. Please try again.');
        setVerses([]);
      }
    } catch (err) {
      console.error('Error loading verses:', err);
      setError('Failed to load verses. Check your internet connection.');
      setVerses([]);
    }

    setLoading(false);
  }, [selectedBook, selectedChapter]);

  const loadHighlights = useCallback(async () => {
    try {
      const savedHighlights = await storageService.getHighlightsForPassage(
        selectedBook.name,
        selectedChapter
      );
      const highlightMap = new Map<number, string>();
      savedHighlights.forEach(h => highlightMap.set(h.verse, h.color));
      setHighlights(highlightMap);
    } catch (err) {
      console.error('Error loading highlights:', err);
    }
  }, [selectedBook, selectedChapter]);

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;

    try {
      const note: BibleNote = {
        id: `note-${Date.now()}`,
        book: selectedBook.name,
        chapter: selectedChapter,
        verse: selectedVerseForNote || 1,
        content: noteText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await storageService.saveNote(note);
      setNoteText('');
      setShowNoteModal(false);
      setSelectedVerseForNote(null);
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const handleHighlight = async (verseNumber: number, color: string) => {
    try {
      const highlight: BibleHighlight = {
        id: `highlight-${Date.now()}`,
        book: selectedBook.name,
        chapter: selectedChapter,
        verse: verseNumber,
        color,
        createdAt: new Date().toISOString(),
      };

      await storageService.saveHighlight(highlight);
      setHighlights(prev => new Map(prev).set(verseNumber, color));
    } catch (err) {
      console.error('Error saving highlight:', err);
    }
  };

  const reference = `${selectedBook.name} ${selectedChapter}`;
  const filteredBooks = BIBLE_BOOKS.filter(b => b.testament === activeTab);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { fontSize: textSize + 6 }]}>Bible</Text>
          <SpeakerIcon text="Bible reading. Select a book and chapter to begin." color="#F5E6D3" />
        </View>
        <View style={styles.selectorRow}>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowBookPicker(true)}
          >
            <Text style={styles.selectorText}>{selectedBook.name}</Text>
            <Ionicons name="chevron-down" size={18} color="#F5E6D3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chapterSelector}
            onPress={() => setShowChapterPicker(true)}
          >
            <Text style={styles.selectorText}>Ch. {selectedChapter}</Text>
            <Ionicons name="chevron-down" size={18} color="#F5E6D3" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bible Content */}
      <View style={styles.bibleContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B4EFF" />
            <Text style={styles.loadingText}>Loading {reference}...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline" size={48} color="#E57373" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadVerses}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <DualColumnBible
            verses={verses}
            reference={reference}
            showPerVerseSpeakers={true}
            highlights={highlights}
          />
        )}
      </View>

      {/* Tools Row */}
      <View style={styles.toolsRow}>
        <TouchableOpacity style={styles.tool}>
          <Ionicons name="color-fill" size={22} color="#6B4EFF" />
          <Text style={styles.toolText}>Highlight</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tool} onPress={() => setShowNoteModal(true)}>
          <Ionicons name="create" size={22} color="#6B4EFF" />
          <Text style={styles.toolText}>Note</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tool}>
          <Ionicons name="share-social" size={22} color="#6B4EFF" />
          <Text style={styles.toolText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tool}>
          <Ionicons name="git-compare" size={22} color="#6B4EFF" />
          <Text style={styles.toolText}>Compare</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tool} onPress={() => setShowAIModal(true)}>
          <Ionicons name="sparkles" size={22} color="#6B4EFF" />
          <Text style={styles.toolText}>AI Guide</Text>
        </TouchableOpacity>
      </View>

      {/* AI Study Modal */}
      <Modal visible={showAIModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <AIStudyModal
            onClose={() => setShowAIModal(false)}
            book={selectedBook.name}
            chapter={selectedChapter}
          />
        </View>
      </Modal>

      {/* Book Picker Modal */}
      <Modal visible={showBookPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Book</Text>
              <TouchableOpacity onPress={() => setShowBookPicker(false)}>
                <Ionicons name="close" size={24} color="#2D1810" />
              </TouchableOpacity>
            </View>

            {/* Testament Tabs */}
            <View style={styles.testamentTabs}>
              <TouchableOpacity
                style={[styles.testamentTab, activeTab === 'OT' && styles.activeTab]}
                onPress={() => setActiveTab('OT')}
              >
                <Text style={[styles.tabText, activeTab === 'OT' && styles.activeTabText]}>
                  Old Testament
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.testamentTab, activeTab === 'NT' && styles.activeTab]}
                onPress={() => setActiveTab('NT')}
              >
                <Text style={[styles.tabText, activeTab === 'NT' && styles.activeTabText]}>
                  New Testament
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.bookList}>
              {filteredBooks.map((book) => (
                <TouchableOpacity
                  key={book.abbrev}
                  style={[
                    styles.bookItem,
                    selectedBook.abbrev === book.abbrev && styles.selectedBook,
                  ]}
                  onPress={() => {
                    setSelectedBook(book);
                    setSelectedChapter(1);
                    setShowBookPicker(false);
                  }}
                >
                  <View style={styles.bookInfo}>
                    <Text style={[
                      styles.bookName,
                      selectedBook.abbrev === book.abbrev && styles.selectedBookText,
                    ]}>
                      {book.name}
                    </Text>
                    <Text style={styles.bookMeta}>
                      {book.chapters} chapters • {book.originalLanguage === 'hebrew' ? 'עברית' :
                        book.originalLanguage === 'aramaic' ? 'ארמית' : 'Ἑλληνικά'}
                    </Text>
                  </View>
                  <Text style={styles.bookAbbrev}>{book.abbrev}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Chapter Picker Modal */}
      <Modal visible={showChapterPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.chapterModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Chapter</Text>
              <TouchableOpacity onPress={() => setShowChapterPicker(false)}>
                <Ionicons name="close" size={24} color="#2D1810" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.chapterGrid}>
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
                <TouchableOpacity
                  key={ch}
                  style={[
                    styles.chapterButton,
                    selectedChapter === ch && styles.selectedChapter,
                  ]}
                  onPress={() => {
                    setSelectedChapter(ch);
                    setShowChapterPicker(false);
                  }}
                >
                  <Text style={[
                    styles.chapterNumber,
                    selectedChapter === ch && styles.selectedChapterText,
                  ]}>
                    {ch}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Note Modal */}
      <Modal visible={showNoteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.noteModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.modalTitle}>Add Note</Text>
                <SpeakerIcon text="Add a personal note to this passage" />
              </View>
              <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                <Ionicons name="close" size={24} color="#2D1810" />
              </TouchableOpacity>
            </View>
            <View style={styles.noteContent}>
              <Text style={styles.noteLabel}>Your thoughts on {reference}:</Text>
              <SpeakerIcon text={`Your thoughts on ${reference}`} />
            </View>
            <TextInput
              style={styles.noteInput}
              placeholder="Write your note here..."
              placeholderTextColor="#8B7355"
              multiline
              value={noteText}
              onChangeText={setNoteText}
            />
            <View style={styles.noteActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowNoteModal(false);
                  setNoteText('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, !noteText.trim() && styles.saveButtonDisabled]}
                onPress={handleSaveNote}
                disabled={!noteText.trim()}
              >
                <Text style={styles.saveButtonText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#2D1810',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#F5E6D3',
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  chapterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectorText: {
    color: '#F5E6D3',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  bibleContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#5C4A3D',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    color: '#5C4A3D',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#6B4EFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingBottom: 100,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8DDD4',
  },
  tool: {
    alignItems: 'center',
  },
  toolText: {
    marginTop: 4,
    fontSize: 11,
    color: '#5C4A3D',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  chapterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD4',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2D1810',
  },
  testamentTabs: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  testamentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F5F0EA',
  },
  activeTab: {
    backgroundColor: '#6B4EFF',
  },
  tabText: {
    fontWeight: '600',
    color: '#5C4A3D',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  bookList: {
    padding: 16,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  selectedBook: {
    backgroundColor: '#E8E0FF',
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 2,
  },
  selectedBookText: {
    color: '#6B4EFF',
  },
  bookMeta: {
    fontSize: 13,
    color: '#8B7355',
  },
  bookAbbrev: {
    fontSize: 12,
    color: '#B8A080',
    fontWeight: '500',
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  chapterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F0EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedChapter: {
    backgroundColor: '#6B4EFF',
  },
  chapterNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D1810',
  },
  selectedChapterText: {
    color: '#FFFFFF',
  },
  noteModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  noteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  noteLabel: {
    fontSize: 15,
    color: '#5C4A3D',
  },
  noteInput: {
    backgroundColor: '#F5F0EA',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    marginTop: 12,
    fontSize: 16,
    color: '#2D1810',
    textAlignVertical: 'top',
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#5C4A3D',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6B4EFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#B8A0FF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
