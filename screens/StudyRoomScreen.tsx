import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from '../components/ThemedText';
import { GlassCard } from '../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  user: string;
  text: string;
  time: string;
  isMe: boolean;
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', user: 'Sarah', text: 'Has anyone looked at the Greek word for "Love" in verse 16?', time: '10:02 AM', isMe: false },
  { id: '2', user: 'Pastor John', text: 'Yes! It is Agape. Unconditional love.', time: '10:04 AM', isMe: false },
  { id: '3', user: 'Me', text: 'That really changes the context of the passage for me.', time: '10:05 AM', isMe: true },
];

export const StudyRoomScreen = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      user: 'Me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setMessages([...messages, newMsg]);
    setInputText('');
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.isMe ? { alignSelf: 'flex-end', backgroundColor: theme.accent } : { alignSelf: 'flex-start', backgroundColor: theme.cardBackground }
    ]}>
      {!item.isMe && <ThemedText variant="caption" style={{ marginBottom: 4, color: theme.textSecondary }}>{item.user}</ThemedText>}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ThemedText style={{ color: item.isMe ? '#000' : theme.text }}>{item.text}</ThemedText>
          <TouchableOpacity style={{ marginLeft: 8 }}>
              <Ionicons name="volume-medium" size={14} color={item.isMe ? '#000' : theme.textSecondary as string} />
          </TouchableOpacity>
      </View>
      <ThemedText variant="caption" style={{ alignSelf: 'flex-end', fontSize: 10, marginTop: 4, opacity: 0.6, color: item.isMe ? '#000' : theme.textSecondary }}>
        {item.time}
      </ThemedText>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <GlassCard style={styles.header}>
        <View style={styles.headerTop}>
            <View>
                <ThemedText variant="h2">John 3 Study Group</ThemedText>
                <ThemedText variant="caption">12 Participants • Live</ThemedText>
            </View>
            <TouchableOpacity style={styles.leaveBtn}>
                <ThemedText variant="label" style={{ color: '#FF5252' }}>Leave</ThemedText>
            </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Chat Area */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
      />

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
        <GlassCard style={styles.inputArea}>
            <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.inputBackground }]}
                placeholder="Share your thoughts..."
                placeholderTextColor={theme.textSecondary as string}
                value={inputText}
                onChangeText={setInputText}
            />
            <TouchableOpacity onPress={sendMessage} style={[styles.sendBtn, { backgroundColor: theme.accent }]}>
                <Ionicons name="send" size={20} color="#000" />
            </TouchableOpacity>
        </GlassCard>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    borderRadius: 0,
  },
  headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  leaveBtn: {
      padding: 8,
      backgroundColor: 'rgba(255, 82, 82, 0.1)',
      borderRadius: 8,
  },
  chatList: {
      padding: 20,
  },
  messageBubble: {
      maxWidth: '80%',
      padding: 12,
      borderRadius: 16,
      marginBottom: 12,
  },
  inputArea: {
      flexDirection: 'row',
      padding: 16,
      alignItems: 'center',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderRadius: 0,
  },
  input: {
      flex: 1,
      padding: 12,
      borderRadius: 20,
      marginRight: 12,
  },
  sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
  }
});
