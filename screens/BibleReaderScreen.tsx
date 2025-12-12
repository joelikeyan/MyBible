import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from '../components/ThemedText';
import { BibleApiService, BibleVerse } from '../services/BibleApiService';
import { ElevenLabsService } from '../services/ElevenLabsService';
import { GeminiService } from '../services/GeminiService';
import { GlassCard } from '../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PremiumButton } from '../components/PremiumButton';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export const BibleReaderScreen = () => {
  const { theme } = useTheme();
  // State
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  // Audio Refs
  const soundRef = useRef<Audio.Sound | null>(null);

  // Load Initial Data (Genesis 1 Demo)
  useEffect(() => {
    loadChapter();
    return () => {
        if (soundRef.current) {
            soundRef.current.unloadAsync();
        }
    };
  }, []);

  const loadChapter = async () => {
    setLoading(true);
    // Fetch English
    const engVerses = await BibleApiService.getChapterVerses(BibleApiService.ENGLISH_BIBLE_ID, 'GEN.1');
    // Mock Hebrew
    const hebVerses = BibleApiService.getOriginalVersesMock('GEN.1');

    // Merge (In real app, we align by verseId/reference)
    // For demo, we just use the length of English and try to match Hebrew
    const merged = engVerses.map((v, i) => ({
        ...v,
        originalContent: hebVerses[i] ? hebVerses[i].content : 'Original text unavailable',
    }));

    setVerses(merged);
    setLoading(false);
  };

  const playVerseAudio = async (index: number) => {
    // Stop current
    if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
    }

    if (index >= verses.length) {
        setPlaying(false);
        setCurrentVerseIndex(null);
        return;
    }

    setCurrentVerseIndex(index);
    setPlaying(true);

    // Get Voice ID
    const voiceId = await AsyncStorage.getItem('active_voice_id');
    if (!voiceId) {
        alert('Please select a voice in Settings first.');
        setPlaying(false);
        return;
    }

    // Generate Audio
    // In real karaoke, we want strict timing. Here we generate per verse.
    const textToRead = verses[index].content;
    const audioUri = await ElevenLabsService.textToSpeech(textToRead, voiceId);

    if (audioUri) {
        const { sound } = await Audio.Sound.createAsync(
            { uri: audioUri },
            { shouldPlay: true }
        );
        soundRef.current = sound;

        sound.setOnPlaybackStatusUpdate(async (status) => {
            if (status.isLoaded && status.didJustFinish) {
                // Play next verse automatically
                playVerseAudio(index + 1);
            }
        });
    } else {
        // Skip if error
        playVerseAudio(index + 1);
    }
  };

  const handleStop = async () => {
      if (soundRef.current) {
          await soundRef.current.stopAsync();
      }
      setPlaying(false);
      setCurrentVerseIndex(null);
  };

  const askAI = async () => {
      if (verses.length === 0) return;
      setAiLoading(true);
      const context = verses.slice(0, 3).map(v => v.content).join(' ');
      const response = await GeminiService.askAI(`Explain Genesis 1 briefly based on this text: ${context}`);
      setAiResponse(response);
      setAiLoading(false);
  };

  // Render Verse Item
  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isActive = currentVerseIndex === index;

    return (
      <View style={[styles.verseRow, isActive && { backgroundColor: theme.inputBackground }]}>
         {/* Left: Original */}
         <View style={styles.columnOriginal}>
            <ThemedText variant="verse" style={[styles.hebrewText, { color: theme.textSecondary }]}>
                {item.originalContent}
            </ThemedText>
         </View>

         {/* Right: English */}
         <View style={styles.columnEnglish}>
            <View style={styles.verseHeader}>
                <ThemedText variant="label" color={theme.accent as string}>{item.verseNumber}</ThemedText>
                <TouchableOpacity onPress={() => playVerseAudio(index)}>
                    <Ionicons name="volume-medium" size={16} color={theme.textSecondary as string} />
                </TouchableOpacity>
            </View>
            <ThemedText variant="verse" serif style={{ color: theme.text }}>
                {item.content}
            </ThemedText>
         </View>
      </View>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={theme.accent} size="large" /></View>;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
       {/* Header */}
       <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.navigationBar }]}>
           <ThemedText variant="h3">Genesis 1</ThemedText>
           <View style={styles.controls}>
               <TouchableOpacity onPress={() => setShowAI(!showAI)} style={{ marginRight: 16 }}>
                   <Ionicons name="sparkles" size={24} color={theme.accent as string} />
               </TouchableOpacity>
               {playing ? (
                   <TouchableOpacity onPress={handleStop}>
                       <Ionicons name="stop-circle" size={32} color={theme.accent as string} />
                   </TouchableOpacity>
               ) : (
                   <TouchableOpacity onPress={() => playVerseAudio(0)}>
                       <Ionicons name="play-circle" size={32} color={theme.accent as string} />
                   </TouchableOpacity>
               )}
           </View>
       </View>

       {/* AI Panel */}
       {showAI && (
           <GlassCard style={styles.aiPanel}>
               <View style={styles.aiHeader}>
                   <ThemedText variant="h3">AI Study Guide</ThemedText>
                   <TouchableOpacity onPress={() => setShowAI(false)}>
                       <Ionicons name="close" size={20} color={theme.text as string} />
                   </TouchableOpacity>
               </View>
               {aiLoading ? (
                   <ActivityIndicator color={theme.accent} />
               ) : aiResponse ? (
                   <ScrollView style={{ maxHeight: 150 }}>
                       <ThemedText variant="body">{aiResponse}</ThemedText>
                   </ScrollView>
               ) : (
                   <PremiumButton title="Generate Insight" onPress={askAI} style={{ marginTop: 10 }} />
               )}
           </GlassCard>
       )}

       {/* Bible Content */}
       <FlatList
         data={verses}
         renderItem={renderItem}
         keyExtractor={(item, index) => index.toString()}
         contentContainerStyle={styles.listContent}
       />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    zIndex: 10,
  },
  controls: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  verseRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  columnOriginal: {
    flex: 0.4,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'flex-start',
  },
  columnEnglish: {
    flex: 0.6,
    paddingLeft: 10,
  },
  hebrewText: {
    textAlign: 'right',
    fontSize: 18,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  aiPanel: {
    margin: 10,
    padding: 16,
    maxHeight: 250,
  },
  aiHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
  },
  listContent: {
      paddingBottom: 80,
  }
});
