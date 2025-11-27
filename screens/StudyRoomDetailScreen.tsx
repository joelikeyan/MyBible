import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SpeakerIcon } from '../components/SpeakerIcon';
import { DualColumnBible } from '../components/DualColumnBible';
import { john3Verses } from '../data/sampleBible';
import { useVoice } from '../context/VoiceContext';

const aiNotes = [
  {
    id: '1',
    text: 'The phrase "born again" (γεννηθῇ ἄνωθεν) can also mean "born from above," emphasizing the divine origin of spiritual rebirth.',
  },
  {
    id: '2',
    text: 'Nicodemus was a Pharisee and member of the Sanhedrin, representing the religious elite seeking truth.',
  },
  {
    id: '3',
    text: 'Consider: What does it mean to be "born of water and Spirit"? How does this relate to baptism and renewal?',
  },
];

const chatMessages = [
  { id: '1', sender: 'Sarah', text: 'The Greek word for "again" is so rich in meaning!', isOwn: false },
  { id: '2', sender: 'You', text: 'Yes, the dual meaning really adds depth.', isOwn: true },
  { id: '3', sender: 'Michael', text: 'Let\'s discuss verse 16 next.', isOwn: false },
];

export function StudyRoomDetailScreen({ navigation, route }: any) {
  const [message, setMessage] = useState('');
  const { textSize } = useVoice();
  const room = route?.params?.room || { name: 'Romans Deep Study', host: 'Pastor Michael', participants: 12 };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Room Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#F5E6D3" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Text style={[styles.roomTitle, { fontSize: textSize + 4 }]}>{room.name}</Text>
              <SpeakerIcon text={room.name} color="#F5E6D3" />
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.roomMeta}>
                Hosted by {room.host || 'Pastor Michael'} • {room.participants || 12} participants
              </Text>
              <SpeakerIcon
                text={`Hosted by ${room.host || 'Pastor Michael'}, ${room.participants || 12} participants`}
                color="#D4C4B0"
                size={14}
              />
            </View>
          </View>
          <TouchableOpacity style={styles.leaveButton}>
            <Text style={styles.leaveButtonText}>Leave</Text>
          </TouchableOpacity>
        </View>

        {/* Scripture Panel */}
        <View style={styles.section}>
          <DualColumnBible
            verses={john3Verses}
            reference="John 3:16-19"
            showPerVerseSpeakers={true}
          />
        </View>

        {/* AI Study Guide */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={20} color="#6B4EFF" />
            <Text style={[styles.sectionTitle, { fontSize: textSize }]}>AI Study Guide</Text>
            <SpeakerIcon text="AI Study Guide with insights and questions" />
          </View>
          <View style={styles.aiContent}>
            {aiNotes.map((note) => (
              <View key={note.id} style={styles.aiNote}>
                <Text style={[styles.aiNoteText, { fontSize: textSize - 1 }]}>{note.text}</Text>
                <SpeakerIcon text={note.text} size={16} />
              </View>
            ))}
            <TouchableOpacity style={styles.askAiButton}>
              <Ionicons name="chatbubble-ellipses" size={18} color="#6B4EFF" />
              <Text style={styles.askAiText}>Ask AI</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Group Chat */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles" size={20} color="#6B4EFF" />
            <Text style={[styles.sectionTitle, { fontSize: textSize }]}>Group Chat</Text>
            <SpeakerIcon text="Group chat messages" />
          </View>
          <View style={styles.chatContent}>
            {chatMessages.map((msg) => (
              <View
                key={msg.id}
                style={[styles.chatBubble, msg.isOwn && styles.ownBubble]}
              >
                {!msg.isOwn && <Text style={styles.senderName}>{msg.sender}</Text>}
                <View style={styles.messageRow}>
                  <Text style={[styles.messageText, { fontSize: textSize - 1 }]}>{msg.text}</Text>
                  <SpeakerIcon text={`${msg.sender} says: ${msg.text}`} size={14} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Chat Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#8B7355"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.micButton}>
          <Ionicons name="mic" size={22} color="#6B4EFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#2D1810',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#F5E6D3',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roomMeta: {
    color: '#D4C4B0',
    fontSize: 13,
  },
  leaveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D4C4B0',
    borderRadius: 6,
  },
  leaveButtonText: {
    color: '#D4C4B0',
    fontSize: 13,
  },
  section: {
    margin: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#2D1810',
    marginLeft: 8,
    flex: 1,
  },
  aiContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  aiNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D8',
  },
  aiNoteText: {
    color: '#2D1810',
    flex: 1,
    lineHeight: 22,
  },
  askAiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#6B4EFF',
    borderRadius: 8,
  },
  askAiText: {
    color: '#6B4EFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  chatContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  chatBubble: {
    backgroundColor: '#F0E6D8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    maxWidth: '85%',
  },
  ownBubble: {
    backgroundColor: '#E8E0FF',
    alignSelf: 'flex-end',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B4EFF',
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageText: {
    color: '#2D1810',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8DDD4',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F0EA',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2D1810',
  },
  micButton: {
    padding: 10,
    marginLeft: 8,
  },
  sendButton: {
    backgroundColor: '#6B4EFF',
    padding: 12,
    borderRadius: 24,
    marginLeft: 4,
  },
  bottomPadding: {
    height: 20,
  },
});

