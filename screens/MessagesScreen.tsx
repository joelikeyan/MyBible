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
import { useVoice } from '../context/VoiceContext';

const conversations = [
  { id: '1', name: 'Sarah Johnson', lastMessage: 'That verse really spoke to me!', avatar: 'S', unread: 2 },
  { id: '2', name: 'Romans Study Group', lastMessage: 'Michael: See you all Tuesday!', avatar: 'R', unread: 0 },
  { id: '3', name: 'Pastor David', lastMessage: 'Thank you for your question about...', avatar: 'P', unread: 1 },
  { id: '4', name: 'Hebrew Class', lastMessage: 'Dr. Ruth: Homework is posted', avatar: 'H', unread: 0 },
];

const chatMessages = [
  { id: '1', sender: 'Sarah Johnson', text: 'Hi! I loved today\'s study session.', time: '10:30 AM', isOwn: false },
  { id: '2', sender: 'You', text: 'Me too! The Greek word study was fascinating.', time: '10:32 AM', isOwn: true },
  { id: '3', sender: 'Sarah Johnson', text: 'That verse really spoke to me!', time: '10:35 AM', isOwn: false },
];

export function MessagesScreen() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const { textSize } = useVoice();

  if (selectedConversation) {
    const convo = conversations.find(c => c.id === selectedConversation);
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedConversation(null)}
          >
            <Ionicons name="arrow-back" size={24} color="#F5E6D3" />
          </TouchableOpacity>
          <View style={styles.chatHeaderContent}>
            <Text style={[styles.chatHeaderName, { fontSize: textSize }]}>{convo?.name}</Text>
            <SpeakerIcon text={convo?.name || ''} color="#F5E6D3" size={16} />
          </View>
        </View>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {chatMessages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.messageBubble, msg.isOwn && styles.ownMessage]}
            >
              {!msg.isOwn && <Text style={styles.senderName}>{msg.sender}</Text>}
              <View style={styles.messageContent}>
                <Text style={[styles.messageText, { fontSize: textSize }]}>{msg.text}</Text>
                <SpeakerIcon text={`${msg.sender} says: ${msg.text}`} size={14} />
              </View>
              <Text style={styles.messageTime}>{msg.time}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { fontSize: textSize + 6 }]}>Messages</Text>
          <SpeakerIcon text="Your messages and conversations" color="#F5E6D3" />
        </View>
      </View>

      {/* Conversations List */}
      <ScrollView style={styles.conversationsList} showsVerticalScrollIndicator={false}>
        {conversations.map((convo) => (
          <TouchableOpacity
            key={convo.id}
            style={styles.conversationItem}
            onPress={() => setSelectedConversation(convo.id)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{convo.avatar}</Text>
            </View>
            <View style={styles.conversationContent}>
              <Text style={[styles.conversationName, { fontSize: textSize }]}>{convo.name}</Text>
              <Text style={[styles.lastMessage, { fontSize: textSize - 2 }]} numberOfLines={1}>
                {convo.lastMessage}
              </Text>
            </View>
            <View style={styles.conversationMeta}>
              <SpeakerIcon
                text={`${convo.name}. ${convo.lastMessage}`}
                size={16}
              />
              {convo.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{convo.unread}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
  },
  title: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#F5E6D3',
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D8',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6B4EFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  conversationContent: {
    flex: 1,
    marginLeft: 14,
  },
  conversationName: {
    fontWeight: '600',
    color: '#2D1810',
    marginBottom: 4,
  },
  lastMessage: {
    color: '#8B7355',
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  unreadBadge: {
    backgroundColor: '#6B4EFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#2D1810',
  },
  backButton: {
    padding: 8,
  },
  chatHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  chatHeaderName: {
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#F5E6D3',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  ownMessage: {
    backgroundColor: '#E8E0FF',
    alignSelf: 'flex-end',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B4EFF',
    marginBottom: 4,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageText: {
    color: '#2D1810',
    flex: 1,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    color: '#8B7355',
    marginTop: 6,
    textAlign: 'right',
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
    height: 100,
  },
});

