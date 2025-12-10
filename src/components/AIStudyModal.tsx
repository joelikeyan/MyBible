import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SpeakerIcon } from './SpeakerIcon';
import { aiService, StudyGuide, AIResponse } from '../services/aiService';

interface AIStudyModalProps {
  onClose: () => void;
  book: string;
  chapter: number;
}

export function AIStudyModal({ onClose, book, chapter }: AIStudyModalProps) {
  const [activeTab, setActiveTab] = useState<'guide' | 'chat'>('guide');
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [loading, setLoading] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (activeTab === 'guide' && !studyGuide) {
      loadStudyGuide();
    }
  }, [activeTab]);

  const loadStudyGuide = async () => {
    setLoading(true);
    try {
      const guide = await aiService.generateStudyGuide(book, chapter);
      setStudyGuide(guide);
    } catch (error) {
      console.error('Failed to generate study guide', error);
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await aiService.askQuestion(userMsg, `${book} ${chapter}`);
      setChatMessages(prev => [...prev, { role: 'ai', text: response.text }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I'm having trouble connecting right now." }]);
    }
    setIsTyping(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="sparkles" size={24} color="#6B4EFF" />
          <Text style={styles.title}>AI Study Assistant</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#2D1810" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'guide' && styles.activeTab]}
          onPress={() => setActiveTab('guide')}
        >
          <Text style={[styles.tabText, activeTab === 'guide' && styles.activeTabText]}>Study Guide</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>Ask Questions</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'guide' ? (
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6B4EFF" />
              <Text style={styles.loadingText}>Generating study guide for {book} {chapter}...</Text>
            </View>
          ) : studyGuide ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.guideContainer}>
                <Text style={styles.guideTitle}>{studyGuide.title}</Text>
                <SpeakerIcon text={`${studyGuide.title}. ${studyGuide.introduction}`} />

                <Text style={styles.guideIntro}>{studyGuide.introduction}</Text>

                {studyGuide.sections.map((section, idx) => (
                  <View key={idx} style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionHeading}>{section.heading}</Text>
                      <SpeakerIcon text={`${section.heading}. ${section.content}`} size={16} />
                    </View>
                    <Text style={styles.sectionContent}>{section.content}</Text>
                    <View style={styles.refsContainer}>
                      {section.verseRefs.map((ref, i) => (
                        <View key={i} style={styles.refBadge}>
                          <Text style={styles.refText}>{ref}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}

                <View style={styles.reflectionBox}>
                  <Text style={styles.reflectionTitle}>Reflection Questions</Text>
                  {studyGuide.reflectionQuestions.map((q, i) => (
                    <View key={i} style={styles.questionRow}>
                      <Text style={styles.questionNum}>{i + 1}</Text>
                      <Text style={styles.questionText}>{q}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.conclusion}>{studyGuide.conclusion}</Text>
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.errorText}>Failed to load study guide.</Text>
          )
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.chatContainer}
          >
            <ScrollView
              style={styles.chatList}
              contentContainerStyle={styles.chatContent}
            >
              {chatMessages.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={48} color="#D4C4B0" />
                  <Text style={styles.emptyText}>Ask anything about {book} {chapter}</Text>
                  <Text style={styles.emptySubtext}>Try "What is the main theme?" or "Explain verse 5"</Text>
                </View>
              )}

              {chatMessages.map((msg, i) => (
                <View key={i} style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.aiBubble
                ]}>
                  <Text style={[
                    styles.messageText,
                    msg.role === 'user' ? styles.userText : styles.aiText
                  ]}>{msg.text}</Text>
                  {msg.role === 'ai' && <SpeakerIcon text={msg.text} size={16} color="#6B4EFF" />}
                </View>
              ))}

              {isTyping && (
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color="#6B4EFF" />
                  <Text style={styles.typingText}>AI is thinking...</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask a question..."
                value={inputMessage}
                onChangeText={setInputMessage}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity
                style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!inputMessage.trim()}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DDD4',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2D1810',
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#5C4A3D',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#E57373',
  },
  guideContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  guideTitle: {
    fontSize: 24,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#2D1810',
    marginBottom: 16,
  },
  guideIntro: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5C4A3D',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#6B4EFF',
    marginRight: 8,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2D1810',
    marginBottom: 12,
  },
  refsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  refBadge: {
    backgroundColor: '#F0E6D8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  refText: {
    fontSize: 12,
    color: '#8B7355',
    fontWeight: '600',
  },
  reflectionBox: {
    backgroundColor: '#E8E0FF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B4EFF',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  questionNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B4EFF',
    marginRight: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    color: '#2D1810',
    lineHeight: 24,
  },
  conclusion: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#5C4A3D',
    textAlign: 'center',
    marginTop: 16,
  },
  // Chat Styles
  chatContainer: {
    flex: 1,
  },
  chatList: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B7355',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B0A090',
    marginTop: 8,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6B4EFF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#2D1810',
    flex: 1,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 16,
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#8B7355',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8DDD4',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F0EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2D1810',
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B4EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B8A0FF',
  },
});
